<?php
// BrewCraft Coffee Shop Configuration File

// Error reporting for development (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('Asia/Kolkata');

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'brewcraft_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Application Configuration
define('APP_NAME', 'BrewCraft');
define('APP_URL', 'http://localhost');
define('APP_VERSION', '1.0.0');

// Security Configuration
define('SECRET_KEY', 'your-secret-key-change-this-in-production');
define('CSRF_TOKEN_EXPIRE', 3600); // 1 hour
define('SESSION_EXPIRE', 7200); // 2 hours
define('REMEMBER_ME_EXPIRE', 2592000); // 30 days

// File Upload Configuration
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('UPLOAD_PATH', __DIR__ . '/../assets/uploads/');

// Email Configuration (for notifications)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
define('SMTP_FROM_EMAIL', 'noreply@brewcraft.com');
define('SMTP_FROM_NAME', 'BrewCraft Coffee Shop');

// Payment Gateway Configuration
define('RAZORPAY_KEY_ID', 'your-razorpay-key-id');
define('RAZORPAY_KEY_SECRET', 'your-razorpay-key-secret');

// WhatsApp API Configuration (for notifications)
define('WHATSAPP_API_URL', 'https://api.whatsapp.com/send');
define('WHATSAPP_BUSINESS_NUMBER', '919876543210');

// SMS Configuration
define('SMS_API_KEY', 'your-sms-api-key');
define('SMS_API_URL', 'https://api.textlocal.in/send/');

// Application Settings
define('DEFAULT_CURRENCY', 'INR');
define('CURRENCY_SYMBOL', '₹');
define('TAX_RATE', 0.18); // 18% GST
define('DELIVERY_FEE', 50);
define('FREE_DELIVERY_THRESHOLD', 500);

// Business Hours
define('BUSINESS_HOURS', [
    'monday' => ['06:00', '23:00'],
    'tuesday' => ['06:00', '23:00'],
    'wednesday' => ['06:00', '23:00'],
    'thursday' => ['06:00', '23:00'],
    'friday' => ['06:00', '23:00'],
    'saturday' => ['06:00', '23:00'],
    'sunday' => ['07:00', '22:00']
]);

// Order Status Configuration
define('ORDER_STATUSES', [
    'pending' => 'Pending',
    'confirmed' => 'Confirmed',
    'preparing' => 'Preparing',
    'ready' => 'Ready for Pickup/Delivery',
    'completed' => 'Completed',
    'cancelled' => 'Cancelled'
]);

// User Roles
define('USER_ROLES', [
    'customer' => 'Customer',
    'staff' => 'Staff',
    'manager' => 'Manager',
    'admin' => 'Administrator'
]);

// Menu Categories
define('MENU_CATEGORIES', [
    'coffee' => 'Coffee',
    'tea' => 'Tea',
    'cold_beverages' => 'Cold Beverages',
    'pastries' => 'Pastries',
    'sandwiches' => 'Sandwiches',
    'salads' => 'Salads',
    'desserts' => 'Desserts'
]);

// Pagination Settings
define('ITEMS_PER_PAGE', 12);
define('ADMIN_ITEMS_PER_PAGE', 20);

// Cache Settings
define('CACHE_ENABLED', true);
define('CACHE_DURATION', 300); // 5 minutes

// Logging Configuration
define('LOG_ERRORS', true);
define('LOG_PATH', __DIR__ . '/../logs/');
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR

// API Rate Limiting
define('API_RATE_LIMIT', 100); // requests per minute
define('API_RATE_WINDOW', 60); // seconds

// Social Media Links
define('SOCIAL_MEDIA', [
    'facebook' => 'https://facebook.com/brewcraft',
    'instagram' => 'https://instagram.com/brewcraft',
    'twitter' => 'https://twitter.com/brewcraft',
    'youtube' => 'https://youtube.com/brewcraft'
]);

// Contact Information
define('CONTACT_INFO', [
    'phone' => '+91 98765 43210',
    'email' => 'hello@brewcraft.com',
    'address' => '123 Coffee Street, Downtown, Mumbai, Maharashtra 400001',
    'support_email' => 'support@brewcraft.com'
]);

// Notification Settings
define('NOTIFICATIONS', [
    'email_enabled' => true,
    'sms_enabled' => true,
    'whatsapp_enabled' => true,
    'push_enabled' => true
]);

// Feature Flags
define('FEATURES', [
    'loyalty_program' => true,
    'subscription_service' => true,
    'ai_recommendations' => false,
    'iot_integration' => false,
    'social_login' => true,
    'guest_checkout' => true
]);

// Environment Detection
if (!defined('ENVIRONMENT')) {
    define('ENVIRONMENT', 'development'); // development, staging, production
}

// Environment-specific configurations
if (ENVIRONMENT === 'production') {
    // Production settings
    ini_set('display_errors', 0);
    error_reporting(0);
    define('DEBUG_MODE', false);
    define('CACHE_DURATION', 3600); // 1 hour in production
} else {
    // Development/Staging settings
    define('DEBUG_MODE', true);
}

// Security Headers
function setSecurityHeaders() {
    if (!headers_sent()) {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }
    }
}

// Call security headers function
setSecurityHeaders();

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Session configuration
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.gc_maxlifetime', SESSION_EXPIRE);
    
    session_start();
}

// Autoload function for classes
spl_autoload_register(function ($class_name) {
    $class_file = __DIR__ . '/classes/' . $class_name . '.php';
    if (file_exists($class_file)) {
        require_once $class_file;
    }
});

// Error handler
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    if (LOG_ERRORS) {
        $log_message = date('Y-m-d H:i:s') . " ERROR: [$errno] $errstr in $errfile on line $errline" . PHP_EOL;
        
        if (!is_dir(LOG_PATH)) {
            mkdir(LOG_PATH, 0755, true);
        }
        
        file_put_contents(LOG_PATH . 'error.log', $log_message, FILE_APPEND | LOCK_EX);
    }
    
    if (DEBUG_MODE) {
        echo "<b>Error:</b> [$errno] $errstr in <b>$errfile</b> on line <b>$errline</b><br>";
    }
}

set_error_handler('customErrorHandler');

// Exception handler
function customExceptionHandler($exception) {
    if (LOG_ERRORS) {
        $log_message = date('Y-m-d H:i:s') . " EXCEPTION: " . $exception->getMessage() . 
                      " in " . $exception->getFile() . " on line " . $exception->getLine() . PHP_EOL;
        
        if (!is_dir(LOG_PATH)) {
            mkdir(LOG_PATH, 0755, true);
        }
        
        file_put_contents(LOG_PATH . 'error.log', $log_message, FILE_APPEND | LOCK_EX);
    }
    
    if (DEBUG_MODE) {
        echo "<b>Uncaught Exception:</b> " . $exception->getMessage() . 
             " in <b>" . $exception->getFile() . "</b> on line <b>" . $exception->getLine() . "</b><br>";
        echo "<pre>" . $exception->getTraceAsString() . "</pre>";
    } else {
        echo "An error occurred. Please try again later.";
    }
}

set_exception_handler('customExceptionHandler');

// Utility Functions
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    if (!isset($_SESSION['csrf_token']) || !isset($_SESSION['csrf_token_time'])) {
        return false;
    }
    
    if (time() - $_SESSION['csrf_token_time'] > CSRF_TOKEN_EXPIRE) {
        unset($_SESSION['csrf_token'], $_SESSION['csrf_token_time']);
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

function formatCurrency($amount, $currency = DEFAULT_CURRENCY) {
    return CURRENCY_SYMBOL . number_format($amount, 2);
}

function isBusinessOpen() {
    $current_day = strtolower(date('l'));
    $current_time = date('H:i');
    
    if (!isset(BUSINESS_HOURS[$current_day])) {
        return false;
    }
    
    $hours = BUSINESS_HOURS[$current_day];
    return $current_time >= $hours[0] && $current_time <= $hours[1];
}

function logActivity($message, $level = 'INFO') {
    if (!LOG_ERRORS) return;
    
    $log_message = date('Y-m-d H:i:s') . " [$level] $message" . PHP_EOL;
    
    if (!is_dir(LOG_PATH)) {
        mkdir(LOG_PATH, 0755, true);
    }
    
    file_put_contents(LOG_PATH . 'activity.log', $log_message, FILE_APPEND | LOCK_EX);
}
?>