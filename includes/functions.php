<?php
// BrewCraft Utility Functions

// Image and File Functions
function uploadImage($file, $targetDir = 'assets/uploads/', $allowedTypes = null) {
    if ($allowedTypes === null) {
        $allowedTypes = ALLOWED_IMAGE_TYPES;
    }
    
    if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
        return ['success' => false, 'message' => 'No file uploaded'];
    }
    
    // Check file size
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['success' => false, 'message' => 'File too large'];
    }
    
    // Check file type
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($fileExtension, $allowedTypes)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }
    
    // Generate unique filename
    $filename = uniqid() . '.' . $fileExtension;
    $targetPath = $targetDir . $filename;
    
    // Create directory if it doesn't exist
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return [
            'success' => true,
            'filename' => $filename,
            'path' => $targetPath,
            'url' => '/' . $targetPath
        ];
    }
    
    return ['success' => false, 'message' => 'Upload failed'];
}

function resizeImage($sourcePath, $targetPath, $maxWidth, $maxHeight) {
    $imageInfo = getimagesize($sourcePath);
    if (!$imageInfo) {
        return false;
    }
    
    $sourceWidth = $imageInfo[0];
    $sourceHeight = $imageInfo[1];
    $mimeType = $imageInfo['mime'];
    
    // Calculate new dimensions
    $ratio = min($maxWidth / $sourceWidth, $maxHeight / $sourceHeight);
    $newWidth = intval($sourceWidth * $ratio);
    $newHeight = intval($sourceHeight * $ratio);
    
    // Create source image
    switch ($mimeType) {
        case 'image/jpeg':
            $sourceImage = imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($sourcePath);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($sourcePath);
            break;
        default:
            return false;
    }
    
    // Create target image
    $targetImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Handle transparency for PNG and GIF
    if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
        imagealphablending($targetImage, false);
        imagesavealpha($targetImage, true);
        $transparent = imagecolorallocatealpha($targetImage, 255, 255, 255, 127);
        imagefilledrectangle($targetImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // Resize image
    imagecopyresampled($targetImage, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $sourceWidth, $sourceHeight);
    
    // Save image
    $success = false;
    switch ($mimeType) {
        case 'image/jpeg':
            $success = imagejpeg($targetImage, $targetPath, 90);
            break;
        case 'image/png':
            $success = imagepng($targetImage, $targetPath, 9);
            break;
        case 'image/gif':
            $success = imagegif($targetImage, $targetPath);
            break;
    }
    
    // Clean up
    imagedestroy($sourceImage);
    imagedestroy($targetImage);
    
    return $success;
}

// Menu and Product Functions
function getMenuItems($category = null, $available = true, $popular = false, $limit = null) {
    $db = Database::getInstance();
    
    $sql = "SELECT mi.*, c.name as category_name, c.slug as category_slug,
                   COALESCE(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM menu_items mi
            LEFT JOIN categories c ON mi.category_id = c.id
            LEFT JOIN reviews r ON mi.id = r.menu_item_id AND r.is_approved = 1
            WHERE 1=1";
    
    $params = [];
    
    if ($category) {
        $sql .= " AND (c.slug = ? OR c.name = ?)";
        $params[] = $category;
        $params[] = $category;
    }
    
    if ($available) {
        $sql .= " AND mi.available = 1";
    }
    
    if ($popular) {
        $sql .= " AND mi.is_popular = 1";
    }
    
    $sql .= " GROUP BY mi.id ORDER BY mi.sort_order ASC, mi.name ASC";
    
    if ($limit) {
        $sql .= " LIMIT " . intval($limit);
    }
    
    return $db->fetchAll($sql, $params);
}

function getMenuCategories($activeOnly = true) {
    $db = Database::getInstance();
    
    $sql = "SELECT * FROM categories";
    $params = [];
    
    if ($activeOnly) {
        $sql .= " WHERE is_active = 1";
    }
    
    $sql .= " ORDER BY sort_order ASC, name ASC";
    
    return $db->fetchAll($sql, $params);
}

function getMenuItemById($id) {
    $db = Database::getInstance();
    
    $sql = "SELECT mi.*, c.name as category_name, c.slug as category_slug,
                   COALESCE(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM menu_items mi
            LEFT JOIN categories c ON mi.category_id = c.id
            LEFT JOIN reviews r ON mi.id = r.menu_item_id AND r.is_approved = 1
            WHERE mi.id = ?
            GROUP BY mi.id";
    
    return $db->fetch($sql, [$id]);
}

// Order Functions
function createOrder($orderData) {
    $db = Database::getInstance();
    
    try {
        $db->beginTransaction();
        
        // Calculate totals
        $subtotal = 0;
        foreach ($orderData['items'] as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }
        
        $taxAmount = $subtotal * TAX_RATE;
        $deliveryFee = ($orderData['order_type'] === 'delivery') ? DELIVERY_FEE : 0;
        $discountAmount = isset($orderData['discount_amount']) ? $orderData['discount_amount'] : 0;
        $totalAmount = $subtotal + $taxAmount + $deliveryFee - $discountAmount;
        
        // Insert order
        $orderInsertData = [
            'user_id' => $orderData['user_id'] ?? null,
            'customer_name' => $orderData['customer_name'],
            'customer_email' => $orderData['customer_email'],
            'customer_phone' => $orderData['customer_phone'],
            'order_type' => $orderData['order_type'],
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'delivery_fee' => $deliveryFee,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
            'payment_method' => $orderData['payment_method'],
            'special_instructions' => $orderData['special_instructions'] ?? null,
            'delivery_address' => $orderData['delivery_address'] ?? null,
            'table_number' => $orderData['table_number'] ?? null
        ];
        
        $orderId = $db->insert('orders', $orderInsertData);
        
        // Insert order items
        foreach ($orderData['items'] as $item) {
            $itemData = [
                'order_id' => $orderId,
                'menu_item_id' => $item['id'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['price'],
                'customizations' => isset($item['customizations']) ? json_encode($item['customizations']) : null
            ];
            
            $db->insert('order_items', $itemData);
        }
        
        $db->commit();
        
        // Send notifications
        sendOrderNotifications($orderId);
        
        logActivity("Order created: #$orderId", 'INFO');
        
        return ['success' => true, 'order_id' => $orderId, 'total' => $totalAmount];
        
    } catch (Exception $e) {
        $db->rollback();
        logActivity("Order creation failed: " . $e->getMessage(), 'ERROR');
        return ['success' => false, 'message' => 'Order creation failed'];
    }
}

function getOrderById($orderId) {
    $db = Database::getInstance();
    
    $sql = "SELECT o.*, u.first_name, u.last_name, u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?";
    
    $order = $db->fetch($sql, [$orderId]);
    
    if ($order) {
        // Get order items
        $itemsSql = "SELECT oi.*, mi.name, mi.image, mi.description
                     FROM order_items oi
                     JOIN menu_items mi ON oi.menu_item_id = mi.id
                     WHERE oi.order_id = ?";
        
        $order['items'] = $db->fetchAll($itemsSql, [$orderId]);
        
        // Decode customizations
        foreach ($order['items'] as &$item) {
            $item['customizations'] = $item['customizations'] ? json_decode($item['customizations'], true) : [];
        }
    }
    
    return $order;
}

function updateOrderStatus($orderId, $status) {
    $db = Database::getInstance();
    
    $validStatuses = array_keys(ORDER_STATUSES);
    if (!in_array($status, $validStatuses)) {
        return ['success' => false, 'message' => 'Invalid status'];
    }
    
    $result = $db->update('orders', ['status' => $status], 'id = ?', [$orderId]);
    
    if ($result) {
        // Send status update notifications
        sendStatusUpdateNotification($orderId, $status);
        
        logActivity("Order #$orderId status updated to: $status", 'INFO');
        return ['success' => true, 'message' => 'Status updated successfully'];
    }
    
    return ['success' => false, 'message' => 'Status update failed'];
}

// Notification Functions
function sendOrderNotifications($orderId) {
    $order = getOrderById($orderId);
    if (!$order) return;
    
    // Send customer notification
    if (NOTIFICATIONS['email_enabled'] && $order['customer_email']) {
        sendOrderConfirmationEmail($order);
    }
    
    if (NOTIFICATIONS['sms_enabled'] && $order['customer_phone']) {
        sendOrderConfirmationSMS($order);
    }
    
    // Send admin notification
    sendNewOrderNotificationToAdmin($order);
}

function sendOrderConfirmationEmail($order) {
    // Implement email sending logic
    // This would use PHPMailer or similar library
    logActivity("Order confirmation email sent to: " . $order['customer_email'], 'INFO');
}

function sendOrderConfirmationSMS($order) {
    // Implement SMS sending logic
    logActivity("Order confirmation SMS sent to: " . $order['customer_phone'], 'INFO');
}

function sendNewOrderNotificationToAdmin($order) {
    // Implement admin notification logic
    logActivity("New order notification sent to admin", 'INFO');
}

function sendStatusUpdateNotification($orderId, $status) {
    $order = getOrderById($orderId);
    if (!$order) return;
    
    $statusMessage = ORDER_STATUSES[$status];
    
    if (NOTIFICATIONS['email_enabled'] && $order['customer_email']) {
        // Send email notification
        logActivity("Status update email sent to: " . $order['customer_email'], 'INFO');
    }
    
    if (NOTIFICATIONS['sms_enabled'] && $order['customer_phone']) {
        // Send SMS notification
        logActivity("Status update SMS sent to: " . $order['customer_phone'], 'INFO');
    }
}

// Analytics Functions
function getDashboardStats($dateRange = '30_days') {
    $db = Database::getInstance();
    
    $dateCondition = getDateRangeCondition($dateRange);
    
    // Total orders
    $totalOrders = $db->fetch("SELECT COUNT(*) as count FROM orders WHERE $dateCondition")['count'];
    
    // Total revenue
    $totalRevenue = $db->fetch("SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled' AND $dateCondition")['total'] ?? 0;
    
    // Total customers
    $totalCustomers = $db->fetch("SELECT COUNT(DISTINCT customer_email) as count FROM orders WHERE $dateCondition")['count'];
    
    // Pending orders
    $pendingOrders = $db->fetch("SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'confirmed', 'preparing') AND $dateCondition")['count'];
    
    // Calculate trends (comparison with previous period)
    $previousDateCondition = getPreviousDateRangeCondition($dateRange);
    
    $previousOrders = $db->fetch("SELECT COUNT(*) as count FROM orders WHERE $previousDateCondition")['count'];
    $previousRevenue = $db->fetch("SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled' AND $previousDateCondition")['total'] ?? 0;
    $previousCustomers = $db->fetch("SELECT COUNT(DISTINCT customer_email) as count FROM orders WHERE $previousDateCondition")['count'];
    
    $ordersTrend = $previousOrders > 0 ? (($totalOrders - $previousOrders) / $previousOrders) * 100 : 0;
    $revenueTrend = $previousRevenue > 0 ? (($totalRevenue - $previousRevenue) / $previousRevenue) * 100 : 0;
    $customersTrend = $previousCustomers > 0 ? (($totalCustomers - $previousCustomers) / $previousCustomers) * 100 : 0;
    
    return [
        'total_orders' => $totalOrders,
        'total_revenue' => $totalRevenue,
        'total_customers' => $totalCustomers,
        'pending_orders' => $pendingOrders,
        'orders_trend' => round($ordersTrend, 1),
        'revenue_trend' => round($revenueTrend, 1),
        'customers_trend' => round($customersTrend, 1)
    ];
}

function getSalesData($dateRange = '7_days') {
    $db = Database::getInstance();
    
    $days = [];
    $sales = [];
    
    $period = intval(explode('_', $dateRange)[0]);
    
    for ($i = $period - 1; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $days[] = date('M j', strtotime($date));
        
        $daySales = $db->fetch(
            "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders 
             WHERE DATE(created_at) = ? AND status != 'cancelled'",
            [$date]
        )['total'];
        
        $sales[] = floatval($daySales);
    }
    
    return [
        'labels' => $days,
        'sales' => $sales
    ];
}

function getPopularItemsData($limit = 5) {
    $db = Database::getInstance();
    
    $sql = "SELECT mi.name, SUM(oi.quantity) as total_sold
            FROM order_items oi
            JOIN menu_items mi ON oi.menu_item_id = mi.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY oi.menu_item_id, mi.name
            ORDER BY total_sold DESC
            LIMIT ?";
    
    $items = $db->fetchAll($sql, [$limit]);
    
    return [
        'labels' => array_column($items, 'name'),
        'values' => array_column($items, 'total_sold')
    ];
}

// Utility Functions
function getDateRangeCondition($dateRange) {
    switch ($dateRange) {
        case '7_days':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        case '30_days':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
        case '3_months':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
        case '1_year':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
        default:
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }
}

function getPreviousDateRangeCondition($dateRange) {
    switch ($dateRange) {
        case '7_days':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        case '30_days':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
        case '3_months':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND created_at < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)";
        case '1_year':
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR) AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
        default:
            return "created_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }
}

function formatOrderStatus($status) {
    return ORDER_STATUSES[$status] ?? ucfirst($status);
}

function formatUserRole($role) {
    return USER_ROLES[$role] ?? ucfirst($role);
}

function generateOrderNumber() {
    return 'BC' . date('Ymd') . sprintf('%04d', rand(1, 9999));
}

function validateCoupon($code, $orderTotal) {
    $db = Database::getInstance();
    
    $coupon = $db->fetch(
        "SELECT * FROM coupons WHERE code = ? AND is_active = 1 
         AND start_date <= CURDATE() AND end_date >= CURDATE()",
        [$code]
    );
    
    if (!$coupon) {
        return ['success' => false, 'message' => 'Invalid coupon code'];
    }
    
    if ($coupon['usage_limit'] && $coupon['used_count'] >= $coupon['usage_limit']) {
        return ['success' => false, 'message' => 'Coupon usage limit reached'];
    }
    
    if ($orderTotal < $coupon['minimum_order_amount']) {
        return ['success' => false, 'message' => 'Minimum order amount not met'];
    }
    
    // Calculate discount
    $discountAmount = 0;
    switch ($coupon['type']) {
        case 'percentage':
            $discountAmount = ($orderTotal * $coupon['value']) / 100;
            if ($coupon['maximum_discount_amount']) {
                $discountAmount = min($discountAmount, $coupon['maximum_discount_amount']);
            }
            break;
        case 'fixed_amount':
            $discountAmount = $coupon['value'];
            break;
        case 'free_delivery':
            $discountAmount = DELIVERY_FEE;
            break;
    }
    
    return [
        'success' => true,
        'coupon' => $coupon,
        'discount_amount' => $discountAmount
    ];
}

function incrementCouponUsage($couponId) {
    $db = Database::getInstance();
    $db->query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [$couponId]);
}

// Cache Functions
function getCacheKey($key) {
    return 'brewcraft_' . md5($key);
}

function getFromCache($key) {
    if (!CACHE_ENABLED) return null;
    
    $cacheFile = sys_get_temp_dir() . '/' . getCacheKey($key);
    
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_DURATION) {
        return unserialize(file_get_contents($cacheFile));
    }
    
    return null;
}

function setCache($key, $data) {
    if (!CACHE_ENABLED) return false;
    
    $cacheFile = sys_get_temp_dir() . '/' . getCacheKey($key);
    return file_put_contents($cacheFile, serialize($data)) !== false;
}

function clearCache($pattern = '*') {
    if (!CACHE_ENABLED) return;
    
    $files = glob(sys_get_temp_dir() . '/brewcraft_' . $pattern);
    foreach ($files as $file) {
        unlink($file);
    }
}

// SEO and Meta Functions
function getPageMeta($page = 'home') {
    $meta = [
        'home' => [
            'title' => 'BrewCraft - Premium Coffee Shop Experience',
            'description' => 'Discover the finest coffee experience at BrewCraft. Order online for delivery, pickup, or dine-in. Fresh pastries, sandwiches, and premium beverages.',
            'keywords' => 'coffee shop, premium coffee, online ordering, delivery, pastries, sandwiches'
        ],
        'menu' => [
            'title' => 'Menu - BrewCraft Coffee Shop',
            'description' => 'Explore our delicious menu featuring premium coffee, tea, pastries, sandwiches, and more. Order online for quick pickup or delivery.',
            'keywords' => 'coffee menu, espresso, latte, cappuccino, pastries, sandwiches'
        ]
    ];
    
    return $meta[$page] ?? $meta['home'];
}

function renderMetaTags($page = 'home') {
    $meta = getPageMeta($page);
    
    echo '<meta name="description" content="' . htmlspecialchars($meta['description']) . '">' . "\n";
    echo '<meta name="keywords" content="' . htmlspecialchars($meta['keywords']) . '">' . "\n";
    echo '<meta property="og:title" content="' . htmlspecialchars($meta['title']) . '">' . "\n";
    echo '<meta property="og:description" content="' . htmlspecialchars($meta['description']) . '">' . "\n";
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:url" content="' . getCurrentURL() . '">' . "\n";
}

function getCurrentURL() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
    return $protocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
}
?>