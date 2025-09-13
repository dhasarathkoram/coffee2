<?php
// BrewCraft Authentication System

class Auth {
    private $db;
    private static $instance = null;

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Auth();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->db = Database::getInstance();
    }

    // User registration
    public function register($data) {
        try {
            // Sanitize input
            $data = sanitizeInput($data);
            
            // Validation
            $validation = $this->validateRegistrationData($data);
            if (!$validation['success']) {
                return $validation;
            }

            // Check if user already exists
            $existingUser = $this->getUserByEmail($data['email']);
            if ($existingUser) {
                return ['success' => false, 'message' => 'Email already exists'];
            }

            $existingUsername = $this->getUserByUsername($data['username']);
            if ($existingUsername) {
                return ['success' => false, 'message' => 'Username already exists'];
            }

            // Hash password
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);

            // Prepare user data
            $userData = [
                'username' => $data['username'],
                'email' => $data['email'],
                'password_hash' => $passwordHash,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'phone' => isset($data['phone']) ? $data['phone'] : null,
                'role' => 'customer'
            ];

            // Insert user
            $userId = $this->db->insert('users', $userData);

            if ($userId) {
                logActivity("New user registered: {$data['email']}", 'INFO');
                
                // Send welcome email (if email service is configured)
                // $this->sendWelcomeEmail($data['email'], $data['first_name']);
                
                return [
                    'success' => true,
                    'message' => 'Registration successful',
                    'user_id' => $userId
                ];
            } else {
                return ['success' => false, 'message' => 'Registration failed'];
            }

        } catch (Exception $e) {
            logActivity("Registration error: " . $e->getMessage(), 'ERROR');
            return ['success' => false, 'message' => 'Registration failed. Please try again.'];
        }
    }

    // User login
    public function login($email, $password, $remember_me = false) {
        try {
            $email = sanitizeInput($email);
            
            // Validation
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return ['success' => false, 'message' => 'Invalid email format'];
            }

            if (empty($password)) {
                return ['success' => false, 'message' => 'Password is required'];
            }

            // Get user by email
            $user = $this->getUserByEmail($email);
            
            if (!$user) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }

            // Check if user is active
            if (!$user['is_active']) {
                return ['success' => false, 'message' => 'Account is deactivated'];
            }

            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                return ['success' => false, 'message' => 'Invalid credentials'];
            }

            // Create session
            $this->createSession($user);

            // Update last login
            $this->updateLastLogin($user['id']);

            // Handle remember me
            if ($remember_me) {
                $this->setRememberMeCookie($user['id']);
            }

            logActivity("User logged in: {$user['email']}", 'INFO');

            return [
                'success' => true,
                'message' => 'Login successful',
                'user' => $this->sanitizeUserData($user)
            ];

        } catch (Exception $e) {
            logActivity("Login error: " . $e->getMessage(), 'ERROR');
            return ['success' => false, 'message' => 'Login failed. Please try again.'];
        }
    }

    // User logout
    public function logout() {
        try {
            $email = isset($_SESSION['user_email']) ? $_SESSION['user_email'] : 'unknown';
            
            // Destroy session
            session_destroy();
            
            // Clear remember me cookie
            if (isset($_COOKIE['remember_me'])) {
                setcookie('remember_me', '', time() - 3600, '/');
            }

            logActivity("User logged out: $email", 'INFO');

            return ['success' => true, 'message' => 'Logout successful'];

        } catch (Exception $e) {
            logActivity("Logout error: " . $e->getMessage(), 'ERROR');
            return ['success' => false, 'message' => 'Logout failed'];
        }
    }

    // Check if user is logged in
    public function isLoggedIn() {
        if (isset($_SESSION['user_id']) && isset($_SESSION['user_email'])) {
            return true;
        }

        // Check remember me cookie
        if (isset($_COOKIE['remember_me'])) {
            return $this->validateRememberMeCookie();
        }

        return false;
    }

    // Get current user
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }

        return $this->getUserById($_SESSION['user_id']);
    }

    // Check if user has specific role
    public function hasRole($role) {
        if (!$this->isLoggedIn()) {
            return false;
        }

        return $_SESSION['user_role'] === $role;
    }

    // Check if user has admin privileges
    public function isAdmin() {
        return $this->hasRole('admin') || $this->hasRole('manager');
    }

    // Password reset request
    public function requestPasswordReset($email) {
        try {
            $email = sanitizeInput($email);
            
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return ['success' => false, 'message' => 'Invalid email format'];
            }

            $user = $this->getUserByEmail($email);
            if (!$user) {
                // Return success even if user doesn't exist for security
                return ['success' => true, 'message' => 'If the email exists, a reset link has been sent'];
            }

            // Generate reset token
            $resetToken = bin2hex(random_bytes(32));
            $resetExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

            // Update user with reset token
            $this->db->update('users', [
                'reset_token' => $resetToken,
                'reset_token_expiry' => $resetExpiry
            ], 'id = ?', [$user['id']]);

            // Send reset email (implement email service)
            // $this->sendPasswordResetEmail($email, $resetToken);

            logActivity("Password reset requested for: $email", 'INFO');

            return ['success' => true, 'message' => 'If the email exists, a reset link has been sent'];

        } catch (Exception $e) {
            logActivity("Password reset request error: " . $e->getMessage(), 'ERROR');
            return ['success' => false, 'message' => 'Password reset request failed'];
        }
    }

    // Reset password with token
    public function resetPassword($token, $newPassword) {
        try {
            $token = sanitizeInput($token);
            
            if (strlen($newPassword) < 6) {
                return ['success' => false, 'message' => 'Password must be at least 6 characters'];
            }

            // Find user by reset token
            $user = $this->db->fetch(
                "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
                [$token]
            );

            if (!$user) {
                return ['success' => false, 'message' => 'Invalid or expired reset token'];
            }

            // Update password
            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $this->db->update('users', [
                'password_hash' => $passwordHash,
                'reset_token' => null,
                'reset_token_expiry' => null
            ], 'id = ?', [$user['id']]);

            logActivity("Password reset completed for: {$user['email']}", 'INFO');

            return ['success' => true, 'message' => 'Password reset successful'];

        } catch (Exception $e) {
            logActivity("Password reset error: " . $e->getMessage(), 'ERROR');
            return ['success' => false, 'message' => 'Password reset failed'];
        }
    }

    // Change password (for logged-in users)
    public function changePassword($currentPassword, $newPassword) {
        try {
            if (!$this->isLoggedIn()) {
                return ['success' => false, 'message' => 'Not authenticated'];
            }

            $user = $this->getCurrentUser();
            
            // Verify current password
            if (!password_verify($currentPassword, $user['password_hash'])) {
                return ['success' => false, 'message' => 'Current password is incorrect'];
            }

            if (strlen($newPassword) < 6) {
                return ['success' => false, 'message' => 'New password must be at least 6 characters'];
            }

            // Update password
            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $this->db->update('users', [
                'password_hash' => $passwordHash
            ], 'id = ?', [$user['id']]);

            logActivity("Password changed for: {$user['email']}", 'INFO');

            return ['success' => true, 'message' => 'Password changed successfully'];

        } catch (Exception $e) {
            logActivity("Password change error: " . $e->getMessage(), 'ERROR');
            return ['success' => false, 'message' => 'Password change failed'];
        }
    }

    // Update user profile
    public function updateProfile($data) {
        try {
            if (!$this->isLoggedIn()) {
                return ['success' => false, 'message' => 'Not authenticated'];
            }

            $data = sanitizeInput($data);
            $userId = $_SESSION['user_id'];

            // Validate data
            $allowedFields = ['first_name', 'last_name', 'phone'];
            $updateData = [];

            foreach ($allowedFields as $field) {
                if (isset($data[$field]) && !empty($data[$field])) {
                    $updateData[$field] = $data[$field];
                }
            }

            if (empty($updateData)) {
                return ['success' => false, 'message' => 'No valid data to update'];
            }

            // Update user
            $this->db->update('users', $updateData, 'id = ?', [$userId]);

            // Update session data
            foreach ($updateData as $key => $value) {
                $_SESSION['user_' . $key] = $value;
            }

            logActivity("Profile updated for user ID: $userId", 'INFO');

            return ['success' => true, 'message' => 'Profile updated successfully'];

        } catch (Exception $e) {
            logActivity("Profile update error: " . $e->getMessage(), 'ERROR');
            return ['success' => false, 'message' => 'Profile update failed'];
        }
    }

    // Private helper methods
    private function validateRegistrationData($data) {
        $errors = [];

        // Required fields
        $requiredFields = ['username', 'email', 'password', 'first_name', 'last_name'];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
            }
        }

        // Email validation
        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Invalid email format';
        }

        // Username validation
        if (!empty($data['username'])) {
            if (strlen($data['username']) < 3) {
                $errors[] = 'Username must be at least 3 characters';
            }
            if (!preg_match('/^[a-zA-Z0-9_]+$/', $data['username'])) {
                $errors[] = 'Username can only contain letters, numbers, and underscores';
            }
        }

        // Password validation
        if (!empty($data['password'])) {
            if (strlen($data['password']) < 6) {
                $errors[] = 'Password must be at least 6 characters';
            }
        }

        // Phone validation
        if (!empty($data['phone']) && !preg_match('/^[6-9]\d{9}$/', $data['phone'])) {
            $errors[] = 'Invalid phone number format';
        }

        return empty($errors) ? ['success' => true] : ['success' => false, 'message' => implode(', ', $errors)];
    }

    private function getUserByEmail($email) {
        return $this->db->fetch("SELECT * FROM users WHERE email = ?", [$email]);
    }

    private function getUserByUsername($username) {
        return $this->db->fetch("SELECT * FROM users WHERE username = ?", [$username]);
    }

    private function getUserById($id) {
        return $this->db->fetch("SELECT * FROM users WHERE id = ?", [$id]);
    }

    private function createSession($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = $user['first_name'] . ' ' . $user['last_name'];
        $_SESSION['user_role'] = $user['role'];
        $_SESSION['user_first_name'] = $user['first_name'];
        $_SESSION['user_last_name'] = $user['last_name'];
        
        // Regenerate session ID for security
        session_regenerate_id(true);
    }

    private function updateLastLogin($userId) {
        $this->db->update('users', ['last_login' => date('Y-m-d H:i:s')], 'id = ?', [$userId]);
    }

    private function setRememberMeCookie($userId) {
        $token = bin2hex(random_bytes(32));
        $expiry = time() + REMEMBER_ME_EXPIRE;
        
        // Store token in database (you might want to create a separate table for this)
        $this->db->update('users', ['remember_token' => $token], 'id = ?', [$userId]);
        
        // Set cookie
        setcookie('remember_me', $token, $expiry, '/', '', isset($_SERVER['HTTPS']), true);
    }

    private function validateRememberMeCookie() {
        if (!isset($_COOKIE['remember_me'])) {
            return false;
        }

        $token = $_COOKIE['remember_me'];
        $user = $this->db->fetch("SELECT * FROM users WHERE remember_token = ?", [$token]);

        if ($user && $user['is_active']) {
            $this->createSession($user);
            return true;
        }

        return false;
    }

    private function sanitizeUserData($user) {
        unset($user['password_hash'], $user['reset_token'], $user['remember_token']);
        return $user;
    }

    // Check rate limiting for login attempts
    private function checkRateLimit($identifier) {
        // Implement rate limiting logic
        // This could use database or cache to track attempts
        return true; // Placeholder
    }
}

// Global helper functions
function requireAuth() {
    $auth = Auth::getInstance();
    if (!$auth->isLoggedIn()) {
        header('Location: /pages/auth/login.php');
        exit;
    }
}

function requireAdmin() {
    $auth = Auth::getInstance();
    if (!$auth->isAdmin()) {
        header('HTTP/1.1 403 Forbidden');
        exit('Access denied');
    }
}

function getCurrentUser() {
    $auth = Auth::getInstance();
    return $auth->getCurrentUser();
}

function isLoggedIn() {
    $auth = Auth::getInstance();
    return $auth->isLoggedIn();
}

function hasRole($role) {
    $auth = Auth::getInstance();
    return $auth->hasRole($role);
}
?>