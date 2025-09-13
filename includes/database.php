<?php
// BrewCraft Database Connection and Management

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $username = DB_USER;
    private $password = DB_PASS;
    private $conn = null;
    private static $instance = null;

    // Singleton pattern to ensure single database connection
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->connect();
    }

    private function connect() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
            logActivity("Database connected successfully");
        } catch(PDOException $e) {
            logActivity("Database connection failed: " . $e->getMessage(), 'ERROR');
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public function getConnection() {
        if ($this->conn === null) {
            $this->connect();
        }
        return $this->conn;
    }

    // Execute a query and return results
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch(PDOException $e) {
            logActivity("Query failed: " . $e->getMessage(), 'ERROR');
            throw new Exception("Query execution failed: " . $e->getMessage());
        }
    }

    // Fetch all results
    public function fetchAll($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }

    // Fetch single result
    public function fetch($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        return $stmt->fetch();
    }

    // Insert data and return last insert ID
    public function insert($table, $data) {
        $columns = implode(',', array_keys($data));
        $placeholders = ':' . implode(', :', array_keys($data));
        
        $sql = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        $this->query($sql, $data);
        
        return $this->conn->lastInsertId();
    }

    // Update data
    public function update($table, $data, $where, $whereParams = []) {
        $setClause = [];
        foreach ($data as $key => $value) {
            $setClause[] = "{$key} = :{$key}";
        }
        $setClause = implode(', ', $setClause);
        
        $sql = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        $params = array_merge($data, $whereParams);
        
        return $this->query($sql, $params);
    }

    // Delete data
    public function delete($table, $where, $whereParams = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        return $this->query($sql, $whereParams);
    }

    // Get table structure
    public function getTableStructure($table) {
        $sql = "DESCRIBE {$table}";
        return $this->fetchAll($sql);
    }

    // Check if table exists
    public function tableExists($table) {
        $sql = "SHOW TABLES LIKE :table";
        $result = $this->fetch($sql, ['table' => $table]);
        return !empty($result);
    }

    // Begin transaction
    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    // Commit transaction
    public function commit() {
        return $this->conn->commit();
    }

    // Rollback transaction
    public function rollback() {
        return $this->conn->rollback();
    }

    // Initialize database tables
    public function initializeDatabase() {
        try {
            $this->createTables();
            $this->insertDefaultData();
            logActivity("Database initialized successfully");
            return true;
        } catch (Exception $e) {
            logActivity("Database initialization failed: " . $e->getMessage(), 'ERROR');
            return false;
        }
    }

    private function createTables() {
        $tables = [
            // Users table
            "CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                phone VARCHAR(15),
                role ENUM('customer', 'staff', 'manager', 'admin') DEFAULT 'customer',
                is_active BOOLEAN DEFAULT TRUE,
                email_verified BOOLEAN DEFAULT FALSE,
                phone_verified BOOLEAN DEFAULT FALSE,
                loyalty_points INT DEFAULT 0,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_phone (phone),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Categories table
            "CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                slug VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                image VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_slug (slug),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Menu items table
            "CREATE TABLE IF NOT EXISTS menu_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                sale_price DECIMAL(10,2) NULL,
                image VARCHAR(255),
                calories INT,
                ingredients TEXT,
                allergens TEXT,
                is_vegetarian BOOLEAN DEFAULT FALSE,
                is_vegan BOOLEAN DEFAULT FALSE,
                is_spicy BOOLEAN DEFAULT FALSE,
                is_popular BOOLEAN DEFAULT FALSE,
                available BOOLEAN DEFAULT TRUE,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
                INDEX idx_category (category_id),
                INDEX idx_available (available),
                INDEX idx_popular (is_popular),
                INDEX idx_slug (slug)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Orders table
            "CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                customer_name VARCHAR(100),
                customer_email VARCHAR(100),
                customer_phone VARCHAR(15),
                order_type ENUM('dine_in', 'takeaway', 'delivery') NOT NULL,
                status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
                subtotal DECIMAL(10,2) NOT NULL,
                tax_amount DECIMAL(10,2) NOT NULL,
                delivery_fee DECIMAL(10,2) DEFAULT 0,
                discount_amount DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(10,2) NOT NULL,
                payment_method ENUM('cash', 'card', 'upi', 'wallet') NOT NULL,
                payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
                special_instructions TEXT,
                delivery_address TEXT,
                delivery_time TIMESTAMP NULL,
                table_number INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_user (user_id),
                INDEX idx_status (status),
                INDEX idx_type (order_type),
                INDEX idx_payment_status (payment_status),
                INDEX idx_created_date (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Order items table
            "CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                menu_item_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                customizations JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
                INDEX idx_order (order_id),
                INDEX idx_menu_item (menu_item_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Customer addresses table
            "CREATE TABLE IF NOT EXISTS customer_addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type ENUM('home', 'work', 'other') DEFAULT 'home',
                address_line_1 VARCHAR(255) NOT NULL,
                address_line_2 VARCHAR(255),
                city VARCHAR(50) NOT NULL,
                state VARCHAR(50) NOT NULL,
                postal_code VARCHAR(10) NOT NULL,
                country VARCHAR(50) DEFAULT 'India',
                is_default BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Coupons table
            "CREATE TABLE IF NOT EXISTS coupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                type ENUM('percentage', 'fixed_amount', 'free_delivery') NOT NULL,
                value DECIMAL(10,2) NOT NULL,
                minimum_order_amount DECIMAL(10,2) DEFAULT 0,
                maximum_discount_amount DECIMAL(10,2) NULL,
                usage_limit INT NULL,
                used_count INT DEFAULT 0,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_code (code),
                INDEX idx_active (is_active),
                INDEX idx_dates (start_date, end_date)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Reviews table
            "CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                menu_item_id INT NOT NULL,
                order_id INT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                title VARCHAR(200),
                comment TEXT,
                is_approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
                INDEX idx_menu_item (menu_item_id),
                INDEX idx_rating (rating),
                INDEX idx_approved (is_approved),
                UNIQUE KEY unique_review (user_id, menu_item_id, order_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // Newsletter subscriptions
            "CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                unsubscribed_at TIMESTAMP NULL,
                INDEX idx_email (email),
                INDEX idx_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

            // System settings table
            "CREATE TABLE IF NOT EXISTS system_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(50) UNIQUE NOT NULL,
                setting_value TEXT,
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_key (setting_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        ];

        foreach ($tables as $sql) {
            $this->query($sql);
        }
    }

    private function insertDefaultData() {
        // Insert default categories
        $categories = [
            ['name' => 'Coffee', 'slug' => 'coffee', 'description' => 'Premium coffee beverages', 'image' => 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'],
            ['name' => 'Tea', 'slug' => 'tea', 'description' => 'Traditional and herbal teas', 'image' => 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg'],
            ['name' => 'Cold Beverages', 'slug' => 'cold-beverages', 'description' => 'Refreshing cold drinks', 'image' => 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg'],
            ['name' => 'Pastries', 'slug' => 'pastries', 'description' => 'Fresh baked pastries', 'image' => 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg'],
            ['name' => 'Sandwiches', 'slug' => 'sandwiches', 'description' => 'Delicious sandwiches', 'image' => 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg']
        ];

        foreach ($categories as $category) {
            $existing = $this->fetch("SELECT id FROM categories WHERE slug = ?", [$category['slug']]);
            if (!$existing) {
                $this->insert('categories', $category);
            }
        }

        // Insert sample menu items
        $menuItems = [
            ['category_id' => 1, 'name' => 'Espresso', 'slug' => 'espresso', 'description' => 'Strong and bold espresso shot', 'price' => 120.00, 'image' => 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'is_popular' => true],
            ['category_id' => 1, 'name' => 'Cappuccino', 'slug' => 'cappuccino', 'description' => 'Classic cappuccino with steamed milk', 'price' => 180.00, 'image' => 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'is_popular' => true],
            ['category_id' => 1, 'name' => 'Latte', 'slug' => 'latte', 'description' => 'Smooth latte with perfect milk foam', 'price' => 200.00, 'image' => 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', 'is_popular' => true],
            ['category_id' => 1, 'name' => 'Americano', 'slug' => 'americano', 'description' => 'Espresso with hot water', 'price' => 150.00, 'image' => 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'],
            ['category_id' => 2, 'name' => 'English Breakfast Tea', 'slug' => 'english-breakfast-tea', 'description' => 'Traditional black tea blend', 'price' => 100.00, 'image' => 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg'],
            ['category_id' => 3, 'name' => 'Iced Coffee', 'slug' => 'iced-coffee', 'description' => 'Refreshing iced coffee', 'price' => 160.00, 'image' => 'https://images.pexels.com/photos/1549200/pexels-photo-1549200.jpeg'],
            ['category_id' => 4, 'name' => 'Croissant', 'slug' => 'croissant', 'description' => 'Buttery, flaky croissant', 'price' => 80.00, 'image' => 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg'],
            ['category_id' => 5, 'name' => 'Club Sandwich', 'slug' => 'club-sandwich', 'description' => 'Triple-layered club sandwich', 'price' => 250.00, 'image' => 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg']
        ];

        foreach ($menuItems as $item) {
            $existing = $this->fetch("SELECT id FROM menu_items WHERE slug = ?", [$item['slug']]);
            if (!$existing) {
                $this->insert('menu_items', $item);
            }
        }

        // Insert default admin user (password: admin123)
        $adminExists = $this->fetch("SELECT id FROM users WHERE role = 'admin'");
        if (!$adminExists) {
            $adminUser = [
                'username' => 'admin',
                'email' => 'admin@brewcraft.com',
                'password_hash' => password_hash('admin123', PASSWORD_DEFAULT),
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'role' => 'admin',
                'email_verified' => true
            ];
            $this->insert('users', $adminUser);
        }

        // Insert system settings
        $settings = [
            ['setting_key' => 'app_name', 'setting_value' => 'BrewCraft', 'description' => 'Application name'],
            ['setting_key' => 'tax_rate', 'setting_value' => '0.18', 'description' => 'Tax rate (GST)'],
            ['setting_key' => 'delivery_fee', 'setting_value' => '50', 'description' => 'Delivery fee'],
            ['setting_key' => 'free_delivery_threshold', 'setting_value' => '500', 'description' => 'Free delivery threshold'],
            ['setting_key' => 'loyalty_points_rate', 'setting_value' => '0.01', 'description' => 'Loyalty points earning rate']
        ];

        foreach ($settings as $setting) {
            $existing = $this->fetch("SELECT id FROM system_settings WHERE setting_key = ?", [$setting['setting_key']]);
            if (!$existing) {
                $this->insert('system_settings', $setting);
            }
        }
    }

    // Get system setting
    public function getSetting($key, $default = null) {
        $setting = $this->fetch("SELECT setting_value FROM system_settings WHERE setting_key = ?", [$key]);
        return $setting ? $setting['setting_value'] : $default;
    }

    // Update system setting
    public function updateSetting($key, $value) {
        $existing = $this->fetch("SELECT id FROM system_settings WHERE setting_key = ?", [$key]);
        
        if ($existing) {
            return $this->update('system_settings', ['setting_value' => $value], 'setting_key = ?', [$key]);
        } else {
            return $this->insert('system_settings', [
                'setting_key' => $key,
                'setting_value' => $value
            ]);
        }
    }

    // Clean up old sessions and expired data
    public function cleanup() {
        try {
            // Clean up expired sessions (if using database sessions)
            // Clean up old logs
            if (is_dir(LOG_PATH)) {
                $files = glob(LOG_PATH . '*.log');
                foreach ($files as $file) {
                    if (filemtime($file) < strtotime('-30 days')) {
                        unlink($file);
                    }
                }
            }
            
            logActivity("Database cleanup completed");
            return true;
        } catch (Exception $e) {
            logActivity("Database cleanup failed: " . $e->getMessage(), 'ERROR');
            return false;
        }
    }

    // Close connection
    public function closeConnection() {
        $this->conn = null;
    }

    // Prevent cloning
    private function __clone() {}
    
    // Prevent serialization
    public function __sleep() {
        throw new Exception("Cannot serialize singleton");
    }
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
?>