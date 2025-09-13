// BrewCraft Coffee Shop - Main JavaScript File
class BrewCraftApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.cart = this.loadCart();
        this.user = this.loadUser();
        this.init();
    }

    init() {
        this.initEventListeners();
        this.updateCartUI();
        this.initScrollEffects();
        this.initTooltips();
        this.initAnimations();
    }

    // Event Listeners
    initEventListeners() {
        // Cart functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.addToCart(e.target.dataset);
            }
            if (e.target.classList.contains('remove-from-cart')) {
                this.removeFromCart(e.target.dataset.id);
            }
            if (e.target.classList.contains('update-quantity')) {
                this.updateQuantity(e.target.dataset.id, e.target.value);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce(this.searchItems.bind(this), 300)(e.target.value);
            });
        }

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('ajax-form')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });
    }

    // Cart Management
    addToCart(itemData) {
        const item = {
            id: itemData.id,
            name: itemData.name,
            price: parseFloat(itemData.price),
            image: itemData.image,
            quantity: 1,
            customizations: {}
        };

        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(item);
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification('Item added to cart!', 'success');
        this.animateCartIcon();
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Item removed from cart', 'info');
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.cart.find(cartItem => cartItem.id === itemId);
        if (item) {
            item.quantity = Math.max(0, parseInt(newQuantity));
            if (item.quantity === 0) {
                this.removeFromCart(itemId);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }

    updateCartUI() {
        // Update cart count
        const cartCountElements = document.querySelectorAll('.cart-count');
        const count = this.getCartCount();
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'inline' : 'none';
        });

        // Update cart total
        const cartTotalElements = document.querySelectorAll('.cart-total');
        const total = this.getCartTotal();
        
        cartTotalElements.forEach(element => {
            element.textContent = this.formatCurrency(total);
        });

        // Update cart items display
        this.renderCartItems();
    }

    renderCartItems() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;

        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>Your cart is empty</h5>
                    <p class="text-muted">Add some delicious items to get started!</p>
                    <a href="pages/menu.php" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            return;
        }

        const cartHTML = this.cart.map(item => `
            <div class="cart-item d-flex align-items-center p-3 border-bottom" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3">
                <div class="cart-item-details flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-muted mb-0">${this.formatCurrency(item.price)}</p>
                </div>
                <div class="cart-item-controls d-flex align-items-center">
                    <input type="number" class="form-control form-control-sm me-2 update-quantity" 
                           value="${item.quantity}" min="1" style="width: 70px;" data-id="${item.id}">
                    <button class="btn btn-sm btn-outline-danger remove-from-cart" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        cartContainer.innerHTML = cartHTML;
    }

    // API Methods
    async makeApiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}/${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            this.showLoading();
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'An error occurred');
            }

            return result;
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        } finally {
            this.hideLoading();
        }
    }

    // Popular Items
    async loadPopularItems() {
        try {
            const response = await this.makeApiCall('menu.php?popular=true');
            this.renderPopularItems(response.data);
        } catch (error) {
            console.error('Failed to load popular items:', error);
        }
    }

    renderPopularItems(items) {
        const container = document.getElementById('popular-items');
        if (!container) return;

        const itemsHTML = items.map(item => `
            <div class="col-lg-4 col-md-6">
                <div class="menu-item-card">
                    <div class="menu-item-image">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                    </div>
                    <div class="menu-item-content">
                        <h4 class="menu-item-title">${item.name}</h4>
                        <p class="menu-item-description">${item.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="menu-item-price">${this.formatCurrency(item.price)}</span>
                            <button class="btn btn-accent add-to-cart" 
                                    data-id="${item.id}" 
                                    data-name="${item.name}" 
                                    data-price="${item.price}"
                                    data-image="${item.image}">
                                <i class="fas fa-plus me-1"></i>Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;
    }

    // Search functionality
    async searchItems(query) {
        if (query.length < 2) {
            this.clearSearchResults();
            return;
        }

        try {
            const response = await this.makeApiCall(`menu.php?search=${encodeURIComponent(query)}`);
            this.renderSearchResults(response.data);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    renderSearchResults(items) {
        const container = document.getElementById('search-results');
        if (!container) return;

        container.style.display = 'block';
        
        if (items.length === 0) {
            container.innerHTML = '<div class="p-3 text-muted">No items found</div>';
            return;
        }

        const resultsHTML = items.map(item => `
            <div class="search-result-item d-flex align-items-center p-3 border-bottom">
                <img src="${item.image}" alt="${item.name}" class="search-result-image me-3">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="text-muted mb-0">${this.formatCurrency(item.price)}</p>
                </div>
                <button class="btn btn-sm btn-accent add-to-cart" 
                        data-id="${item.id}" 
                        data-name="${item.name}" 
                        data-price="${item.price}"
                        data-image="${item.image}">
                    Add
                </button>
            </div>
        `).join('');

        container.innerHTML = resultsHTML;
    }

    clearSearchResults() {
        const container = document.getElementById('search-results');
        if (container) {
            container.style.display = 'none';
        }
    }

    // UI Effects
    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    animateCartIcon() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 200);
        }
    }

    initScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    initTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => 
            new bootstrap.Tooltip(tooltipTriggerEl)
        );
    }

    initAnimations() {
        // Add entrance animations to elements
        const animatedElements = document.querySelectorAll('.feature-card, .menu-item-card');
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-on-scroll');
        });
    }

    // Form Handling
    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const action = form.getAttribute('action');
        const method = form.getAttribute('method') || 'POST';

        try {
            const response = await fetch(action, {
                method,
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification(result.message, 'success');
                if (result.redirect) {
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 1500);
                }
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('An error occurred. Please try again.', 'error');
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} notification-toast`;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${this.getNotificationIcon(type)} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" aria-label="Close"></button>
            </div>
        `;

        // Add to notification container
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Manual close
        notification.querySelector('.btn-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Loading States
    showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
        loadingOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingOverlay.style.zIndex = '9998';
        loadingOverlay.innerHTML = `
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    // Storage Methods
    saveCart() {
        localStorage.setItem('brewcraft_cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const saved = localStorage.getItem('brewcraft_cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveUser(userData) {
        localStorage.setItem('brewcraft_user', JSON.stringify(userData));
        this.user = userData;
    }

    loadUser() {
        const saved = localStorage.getItem('brewcraft_user');
        return saved ? JSON.parse(saved) : null;
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
}

// Global functions for popular items
async function loadPopularItems() {
    try {
        const response = await fetch('/api/menu.php?popular=true');
        const data = await response.json();
        
        if (data.success) {
            renderPopularItems(data.data);
        }
    } catch (error) {
        console.error('Failed to load popular items:', error);
    }
}

function renderPopularItems(items) {
    const container = document.getElementById('popular-items');
    if (!container) return;

    const itemsHTML = items.slice(0, 3).map(item => `
        <div class="col-lg-4 col-md-6">
            <div class="menu-item-card">
                <div class="menu-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="menu-item-content">
                    <h4 class="menu-item-title">${item.name}</h4>
                    <p class="menu-item-description">${item.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="menu-item-price">₹${item.price}</span>
                        <button class="btn btn-accent add-to-cart" 
                                data-id="${item.id}" 
                                data-name="${item.name}" 
                                data-price="${item.price}"
                                data-image="${item.image}">
                            <i class="fas fa-plus me-1"></i>Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = itemsHTML;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.brewCraftApp = new BrewCraftApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrewCraftApp;
}