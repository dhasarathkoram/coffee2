<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
$is_logged_in = isset($_SESSION['user_id']);
$user_name = $is_logged_in ? $_SESSION['user_name'] : '';
$is_admin = $is_logged_in && $_SESSION['user_role'] === 'admin';

// Get current page for navigation highlighting
$current_page = basename($_SERVER['PHP_SELF'], '.php');
?>

<nav class="navbar navbar-expand-lg fixed-top">
    <div class="container">
        <a class="navbar-brand" href="/index.php">
            <i class="fas fa-coffee me-2"></i>BrewCraft
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                    <a class="nav-link <?php echo $current_page === 'index' ? 'active' : ''; ?>" 
                       href="/index.php">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo $current_page === 'menu' ? 'active' : ''; ?>" 
                       href="/pages/menu.php">Menu</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo $current_page === 'about' ? 'active' : ''; ?>" 
                       href="/pages/about.php">About</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?php echo $current_page === 'contact' ? 'active' : ''; ?>" 
                       href="/pages/contact.php">Contact</a>
                </li>
                <?php if ($is_admin): ?>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-cog me-1"></i>Admin
                    </a>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="/pages/admin/dashboard.php">
                            <i class="fas fa-chart-bar me-2"></i>Dashboard</a></li>
                        <li><a class="dropdown-item" href="/pages/admin/orders.php">
                            <i class="fas fa-shopping-cart me-2"></i>Orders</a></li>
                        <li><a class="dropdown-item" href="/pages/admin/menu-management.php">
                            <i class="fas fa-utensils me-2"></i>Menu Management</a></li>
                        <li><a class="dropdown-item" href="/pages/admin/analytics.php">
                            <i class="fas fa-analytics me-2"></i>Analytics</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="/pages/admin/settings.php">
                            <i class="fas fa-cog me-2"></i>Settings</a></li>
                    </ul>
                </li>
                <?php endif; ?>
            </ul>
            
            <ul class="navbar-nav">
                <!-- Search -->
                <li class="nav-item dropdown me-3">
                    <a class="nav-link" href="#" id="searchToggle" data-bs-toggle="dropdown">
                        <i class="fas fa-search"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end p-3" style="min-width: 300px;">
                        <form class="d-flex">
                            <input class="form-control me-2" type="search" placeholder="Search menu items..." id="navbar-search">
                            <button class="btn btn-outline-primary" type="submit">
                                <i class="fas fa-search"></i>
                            </button>
                        </form>
                        <div id="search-results" class="mt-2" style="display: none;"></div>
                    </div>
                </li>

                <!-- Shopping Cart -->
                <li class="nav-item me-3">
                    <a class="nav-link position-relative" href="/pages/order.php">
                        <i class="fas fa-shopping-cart cart-icon"></i>
                        <span class="cart-count badge bg-accent position-absolute top-0 start-100 translate-middle" 
                              style="display: none;">0</span>
                    </a>
                </li>

                <?php if ($is_logged_in): ?>
                <!-- User Menu -->
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                        <i class="fas fa-user me-1"></i><?php echo htmlspecialchars($user_name); ?>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="/pages/account.php">
                            <i class="fas fa-user me-2"></i>My Account</a></li>
                        <li><a class="dropdown-item" href="/pages/order-history.php">
                            <i class="fas fa-history me-2"></i>Order History</a></li>
                        <li><a class="dropdown-item" href="/pages/favorites.php">
                            <i class="fas fa-heart me-2"></i>Favorites</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="/pages/auth/logout.php">
                            <i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </li>
                <?php else: ?>
                <!-- Login/Register -->
                <li class="nav-item me-2">
                    <a class="nav-link" href="/pages/auth/login.php">
                        <i class="fas fa-sign-in-alt me-1"></i>Login
                    </a>
                </li>
                <li class="nav-item">
                    <a class="btn btn-accent btn-sm" href="/pages/auth/register.php">
                        <i class="fas fa-user-plus me-1"></i>Sign Up
                    </a>
                </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>

<!-- Add some space after fixed navbar -->
<div style="height: 80px;"></div>

<script>
// Initialize search functionality in navbar
document.getElementById('navbar-search')?.addEventListener('input', function(e) {
    const query = e.target.value;
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    // Perform search (you can customize this)
    fetch(`/api/menu.php?search=${encodeURIComponent(query)}&limit=5`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                resultsContainer.innerHTML = data.data.map(item => `
                    <div class="search-result-item border-bottom py-2">
                        <div class="d-flex align-items-center">
                            <img src="${item.image}" alt="${item.name}" 
                                 class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;">
                            <div class="flex-grow-1">
                                <div class="fw-bold">${item.name}</div>
                                <small class="text-muted">₹${item.price}</small>
                            </div>
                            <button class="btn btn-sm btn-accent add-to-cart" 
                                    data-id="${item.id}" 
                                    data-name="${item.name}" 
                                    data-price="${item.price}"
                                    data-image="${item.image}">
                                Add
                            </button>
                        </div>
                    </div>
                `).join('');
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.innerHTML = '<div class="text-muted p-2">No items found</div>';
                resultsContainer.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Search failed:', error);
            resultsContainer.style.display = 'none';
        });
});

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown-menu')) {
        document.getElementById('search-results').style.display = 'none';
    }
});
</script>