<footer class="footer mt-5">
    <div class="container">
        <div class="row">
            <div class="col-lg-4 col-md-6 mb-4">
                <h5>BrewCraft</h5>
                <p class="text-muted">
                    Crafting the perfect coffee experience since 2024. From premium beans to personalized service, 
                    we're passionate about bringing you the finest coffee culture.
                </p>
                <div class="social-links">
                    <a href="#" class="me-3"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="me-3"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="me-3"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="me-3"><i class="fab fa-youtube"></i></a>
                </div>
            </div>
            
            <div class="col-lg-2 col-md-6 mb-4">
                <h6>Quick Links</h6>
                <ul class="list-unstyled">
                    <li><a href="/pages/menu.php">Menu</a></li>
                    <li><a href="/pages/about.php">About Us</a></li>
                    <li><a href="/pages/contact.php">Contact</a></li>
                    <li><a href="/pages/locations.php">Locations</a></li>
                    <li><a href="/pages/careers.php">Careers</a></li>
                </ul>
            </div>
            
            <div class="col-lg-2 col-md-6 mb-4">
                <h6>Customer Service</h6>
                <ul class="list-unstyled">
                    <li><a href="/pages/faq.php">FAQ</a></li>
                    <li><a href="/pages/shipping.php">Delivery Info</a></li>
                    <li><a href="/pages/returns.php">Returns</a></li>
                    <li><a href="/pages/privacy.php">Privacy Policy</a></li>
                    <li><a href="/pages/terms.php">Terms of Service</a></li>
                </ul>
            </div>
            
            <div class="col-lg-4 col-md-6 mb-4">
                <h6>Contact Info</h6>
                <ul class="list-unstyled">
                    <li class="mb-2">
                        <i class="fas fa-map-marker-alt me-2"></i>
                        123 Coffee Street, Downtown<br>
                        Mumbai, Maharashtra 400001
                    </li>
                    <li class="mb-2">
                        <i class="fas fa-phone me-2"></i>
                        <a href="tel:+919876543210">+91 98765 43210</a>
                    </li>
                    <li class="mb-2">
                        <i class="fas fa-envelope me-2"></i>
                        <a href="mailto:hello@brewcraft.com">hello@brewcraft.com</a>
                    </li>
                    <li>
                        <i class="fas fa-clock me-2"></i>
                        Mon-Sun: 6:00 AM - 11:00 PM
                    </li>
                </ul>
            </div>
        </div>
        
        <div class="row mt-4">
            <div class="col-12">
                <div class="newsletter-section bg-primary text-white rounded p-4 mb-4">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-2">Stay Updated with BrewCraft</h6>
                            <p class="mb-0">Get exclusive offers, new menu items, and brewing tips delivered to your inbox.</p>
                        </div>
                        <div class="col-md-4">
                            <form class="d-flex" id="newsletter-form">
                                <input type="email" class="form-control me-2" placeholder="Enter your email" required>
                                <button class="btn btn-accent" type="submit">Subscribe</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-12">
                <hr class="my-4">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div class="text-muted">
                        &copy; 2024 BrewCraft. All rights reserved.
                    </div>
                    <div class="payment-methods mt-3 mt-md-0">
                        <span class="text-muted me-3">We Accept:</span>
                        <i class="fab fa-cc-visa fa-2x me-2 text-muted"></i>
                        <i class="fab fa-cc-mastercard fa-2x me-2 text-muted"></i>
                        <i class="fab fa-cc-paypal fa-2x me-2 text-muted"></i>
                        <i class="fab fa-google-pay fa-2x me-2 text-muted"></i>
                        <span class="badge bg-success">UPI</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>

<!-- Back to Top Button -->
<button class="btn btn-accent position-fixed bottom-0 end-0 m-3 rounded-circle" 
        id="back-to-top" style="width: 50px; height: 50px; display: none; z-index: 999;">
    <i class="fas fa-arrow-up"></i>
</button>

<script>
// Newsletter subscription
document.getElementById('newsletter-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    
    fetch('/api/newsletter.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (window.brewCraftApp) {
                window.brewCraftApp.showNotification('Successfully subscribed to newsletter!', 'success');
            } else {
                alert('Successfully subscribed to newsletter!');
            }
            this.reset();
        } else {
            if (window.brewCraftApp) {
                window.brewCraftApp.showNotification(data.message || 'Subscription failed', 'error');
            } else {
                alert(data.message || 'Subscription failed');
            }
        }
    })
    .catch(error => {
        console.error('Newsletter subscription failed:', error);
        if (window.brewCraftApp) {
            window.brewCraftApp.showNotification('Subscription failed. Please try again.', 'error');
        } else {
            alert('Subscription failed. Please try again.');
        }
    });
});

// Back to top functionality
window.addEventListener('scroll', function() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

document.getElementById('back-to-top')?.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
</script>