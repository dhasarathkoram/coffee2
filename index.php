<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrewCraft - Digital Coffee Shop</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
    <link href="assets/css/bootstrap-custom.css" rel="stylesheet">
</head>
<body>
    <?php 
    require_once 'includes/config.php';
    require_once 'includes/header.php'; 
    ?>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="row align-items-center min-vh-100">
                <div class="col-lg-6">
                    <div class="hero-content">
                        <h1 class="display-3 fw-bold text-white mb-4">
                            Craft Your Perfect
                            <span class="text-accent">Coffee</span> Experience
                        </h1>
                        <p class="lead text-light mb-4">
                            From artisan roasts to personalized blends, discover a world of premium coffee delivered right to your hands.
                        </p>
                        <div class="hero-buttons">
                            <a href="pages/menu.php" class="btn btn-accent btn-lg me-3">
                                <i class="fas fa-coffee me-2"></i>Order Now
                            </a>
                            <a href="pages/auth/register.php" class="btn btn-outline-light btn-lg">
                                <i class="fas fa-user-plus me-2"></i>Join Rewards
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="hero-image">
                        <img src="https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg" alt="Premium Coffee" class="img-fluid rounded-4 shadow-lg">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5">
        <div class="container">
            <div class="row text-center mb-5">
                <div class="col-12">
                    <h2 class="section-title">Why Choose BrewCraft?</h2>
                    <p class="section-subtitle">Experience the future of coffee ordering</p>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <h4>Easy Ordering</h4>
                        <p>Order your favorite drinks with just a few taps. Customize, schedule, and pay seamlessly.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <h4>Real-Time Tracking</h4>
                        <p>Track your order from brewing to pickup. Get notified when your coffee is ready.</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <h4>Loyalty Rewards</h4>
                        <p>Earn points with every purchase. Unlock exclusive perks and free drinks.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Popular Items Section -->
    <section class="popular-section py-5 bg-light">
        <div class="container">
            <div class="row text-center mb-5">
                <div class="col-12">
                    <h2 class="section-title">Popular Items</h2>
                    <p class="section-subtitle">Customer favorites you can't miss</p>
                </div>
            </div>
            <div class="row g-4" id="popular-items">
                <!-- Popular items will be loaded via JavaScript -->
            </div>
        </div>
    </section>

    <?php require_once 'includes/footer.php'; ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/main.js"></script>
    <script>
        // Load popular items on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadPopularItems();
        });
    </script>
</body>
</html>