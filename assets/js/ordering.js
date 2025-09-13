// BrewCraft Ordering System JavaScript

class OrderingSystem {
    constructor() {
        this.currentOrder = {
            items: [],
            delivery_type: 'dine_in',
            special_instructions: '',
            customer_info: {},
            payment_method: '',
            total: 0
        };
        this.deliveryFee = 50;
        this.taxRate = 0.18; // 18% GST
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadOrderFromCart();
        this.updateOrderSummary();
    }

    initEventListeners() {
        // Delivery type selection
        document.querySelectorAll('input[name="delivery_type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleDeliveryTypeChange(e.target.value);
            });
        });

        // Quantity changes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-decrease')) {
                this.decreaseQuantity(e.target.dataset.itemId);
            }
            if (e.target.classList.contains('quantity-increase')) {
                this.increaseQuantity(e.target.dataset.itemId);
            }
        });

        // Remove item
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                this.removeItem(e.target.dataset.itemId);
            }
        });

        // Customization options
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('customization-option')) {
                this.updateCustomization(
                    e.target.dataset.itemId, 
                    e.target.name, 
                    e.target.value
                );
            }
        });

        // Special instructions
        const instructionsTextarea = document.getElementById('special-instructions');
        if (instructionsTextarea) {
            instructionsTextarea.addEventListener('input', (e) => {
                this.currentOrder.special_instructions = e.target.value;
            });
        }

        // Payment method selection
        document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentOrder.payment_method = e.target.value;
                this.updatePaymentUI();
            });
        });

        // Place order
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.placeOrder();
            });
        }

        // Apply coupon
        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => {
                const couponCode = document.getElementById('coupon-code').value;
                this.applyCoupon(couponCode);
            });
        }

        // Delivery time selection
        const deliveryTimeSelect = document.getElementById('delivery-time');
        if (deliveryTimeSelect) {
            deliveryTimeSelect.addEventListener('change', (e) => {
                this.currentOrder.delivery_time = e.target.value;
            });
        }
    }

    loadOrderFromCart() {
        const cart = JSON.parse(localStorage.getItem('brewcraft_cart') || '[]');
        this.currentOrder.items = cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            customizations: item.customizations || {}
        }));
        this.renderOrderItems();
    }

    renderOrderItems() {
        const container = document.getElementById('order-items');
        if (!container) return;

        if (this.currentOrder.items.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>Your order is empty</h5>
                    <p class="text-muted">Add some items from our menu to get started!</p>
                    <a href="menu.php" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            return;
        }

        const itemsHTML = this.currentOrder.items.map(item => `
            <div class="order-item card mb-3" data-item-id="${item.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                        </div>
                        <div class="col-md-4">
                            <h6 class="item-name">${item.name}</h6>
                            <p class="text-muted mb-1">₹${item.price} each</p>
                            ${this.renderCustomizations(item.customizations)}
                        </div>
                        <div class="col-md-3">
                            <div class="quantity-controls d-flex align-items-center">
                                <button class="btn btn-sm btn-outline-secondary quantity-decrease" 
                                        data-item-id="${item.id}">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="mx-3 fw-bold">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary quantity-increase" 
                                        data-item-id="${item.id}">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="item-total fw-bold">₹${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                        <div class="col-md-1">
                            <button class="btn btn-sm btn-outline-danger remove-item" 
                                    data-item-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${this.renderCustomizationOptions(item)}
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;
    }

    renderCustomizations(customizations) {
        if (!customizations || Object.keys(customizations).length === 0) {
            return '';
        }

        const customizationsHTML = Object.entries(customizations)
            .map(([key, value]) => `<small class="text-info">${key}: ${value}</small>`)
            .join('<br>');

        return `<div class="customizations mt-1">${customizationsHTML}</div>`;
    }

    renderCustomizationOptions(item) {
        return `
            <div class="customization-section mt-3">
                <h6>Customize your order:</h6>
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label">Size</label>
                        <select class="form-select form-select-sm customization-option" 
                                name="size" data-item-id="${item.id}">
                            <option value="regular" ${item.customizations?.size === 'regular' ? 'selected' : ''}>Regular</option>
                            <option value="large" ${item.customizations?.size === 'large' ? 'selected' : ''}>Large (+₹20)</option>
                            <option value="extra-large" ${item.customizations?.size === 'extra-large' ? 'selected' : ''}>Extra Large (+₹40)</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Sweetness</label>
                        <select class="form-select form-select-sm customization-option" 
                                name="sweetness" data-item-id="${item.id}">
                            <option value="normal" ${item.customizations?.sweetness === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="less-sweet" ${item.customizations?.sweetness === 'less-sweet' ? 'selected' : ''}>Less Sweet</option>
                            <option value="extra-sweet" ${item.customizations?.sweetness === 'extra-sweet' ? 'selected' : ''}>Extra Sweet</option>
                            <option value="no-sugar" ${item.customizations?.sweetness === 'no-sugar' ? 'selected' : ''}>No Sugar</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Milk Type</label>
                        <select class="form-select form-select-sm customization-option" 
                                name="milk" data-item-id="${item.id}">
                            <option value="regular" ${item.customizations?.milk === 'regular' ? 'selected' : ''}>Regular Milk</option>
                            <option value="almond" ${item.customizations?.milk === 'almond' ? 'selected' : ''}>Almond Milk (+₹15)</option>
                            <option value="soy" ${item.customizations?.milk === 'soy' ? 'selected' : ''}>Soy Milk (+₹10)</option>
                            <option value="oat" ${item.customizations?.milk === 'oat' ? 'selected' : ''}>Oat Milk (+₹20)</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    handleDeliveryTypeChange(deliveryType) {
        this.currentOrder.delivery_type = deliveryType;
        this.updateDeliveryUI();
        this.updateOrderSummary();
    }

    updateDeliveryUI() {
        const deliveryInfo = document.getElementById('delivery-info');
        if (!deliveryInfo) return;

        if (this.currentOrder.delivery_type === 'delivery') {
            deliveryInfo.innerHTML = `
                <div class="delivery-address-section">
                    <h6>Delivery Address</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Full Address</label>
                            <textarea class="form-control" id="delivery-address" 
                                      rows="3" placeholder="Enter your complete address" required></textarea>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Contact Number</label>
                            <input type="tel" class="form-control" id="contact-number" 
                                   placeholder="Your phone number" required>
                            <label class="form-label mt-2">Delivery Instructions</label>
                            <input type="text" class="form-control" id="delivery-instructions" 
                                   placeholder="Any special instructions for delivery">
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentOrder.delivery_type === 'pickup') {
            deliveryInfo.innerHTML = `
                <div class="pickup-info-section">
                    <h6>Pickup Information</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Pickup Time</label>
                            <select class="form-select" id="pickup-time" required>
                                <option value="">Select pickup time</option>
                                <option value="asap">As soon as possible</option>
                                <option value="15min">In 15 minutes</option>
                                <option value="30min">In 30 minutes</option>
                                <option value="45min">In 45 minutes</option>
                                <option value="1hour">In 1 hour</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Contact Number</label>
                            <input type="tel" class="form-control" id="contact-number" 
                                   placeholder="Your phone number" required>
                        </div>
                    </div>
                    <div class="pickup-location mt-3">
                        <h6>Pickup Location</h6>
                        <p class="text-muted">
                            <i class="fas fa-map-marker-alt me-2"></i>
                            BrewCraft Coffee Shop<br>
                            123 Coffee Street, Downtown<br>
                            Phone: +91 98765 43210
                        </p>
                    </div>
                </div>
            `;
        } else {
            deliveryInfo.innerHTML = `
                <div class="dine-in-info">
                    <h6>Dine-In Information</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label">Table Number (Optional)</label>
                            <input type="number" class="form-control" id="table-number" 
                                   placeholder="Enter table number if available">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Number of People</label>
                            <select class="form-select" id="party-size">
                                <option value="1">1 Person</option>
                                <option value="2" selected>2 People</option>
                                <option value="3">3 People</option>
                                <option value="4">4 People</option>
                                <option value="5+">5+ People</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    increaseQuantity(itemId) {
        const item = this.currentOrder.items.find(item => item.id === itemId);
        if (item) {
            item.quantity++;
            this.updateCartStorage();
            this.renderOrderItems();
            this.updateOrderSummary();
        }
    }

    decreaseQuantity(itemId) {
        const item = this.currentOrder.items.find(item => item.id === itemId);
        if (item && item.quantity > 1) {
            item.quantity--;
            this.updateCartStorage();
            this.renderOrderItems();
            this.updateOrderSummary();
        }
    }

    removeItem(itemId) {
        this.currentOrder.items = this.currentOrder.items.filter(item => item.id !== itemId);
        this.updateCartStorage();
        this.renderOrderItems();
        this.updateOrderSummary();
    }

    updateCustomization(itemId, option, value) {
        const item = this.currentOrder.items.find(item => item.id === itemId);
        if (item) {
            if (!item.customizations) {
                item.customizations = {};
            }
            item.customizations[option] = value;
            this.updateCartStorage();
            this.updateOrderSummary();
        }
    }

    updateOrderSummary() {
        const subtotal = this.calculateSubtotal();
        const tax = subtotal * this.taxRate;
        const deliveryFee = this.currentOrder.delivery_type === 'delivery' ? this.deliveryFee : 0;
        const discount = this.currentOrder.discount || 0;
        const total = subtotal + tax + deliveryFee - discount;

        this.currentOrder.total = total;

        // Update summary display
        const summaryElement = document.getElementById('order-summary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                <div class="summary-row d-flex justify-content-between">
                    <span>Subtotal</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row d-flex justify-content-between">
                    <span>Tax (GST 18%)</span>
                    <span>₹${tax.toFixed(2)}</span>
                </div>
                ${deliveryFee > 0 ? `
                    <div class="summary-row d-flex justify-content-between">
                        <span>Delivery Fee</span>
                        <span>₹${deliveryFee.toFixed(2)}</span>
                    </div>
                ` : ''}
                ${discount > 0 ? `
                    <div class="summary-row d-flex justify-content-between text-success">
                        <span>Discount</span>
                        <span>-₹${discount.toFixed(2)}</span>
                    </div>
                ` : ''}
                <hr>
                <div class="summary-total d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span>₹${total.toFixed(2)}</span>
                </div>
            `;
        }

        // Update place order button
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = this.currentOrder.items.length === 0;
            placeOrderBtn.innerHTML = `
                <i class="fas fa-shopping-cart me-2"></i>
                Place Order - ₹${total.toFixed(2)}
            `;
        }
    }

    calculateSubtotal() {
        return this.currentOrder.items.reduce((total, item) => {
            let itemPrice = item.price;
            
            // Add customization costs
            if (item.customizations) {
                if (item.customizations.size === 'large') itemPrice += 20;
                if (item.customizations.size === 'extra-large') itemPrice += 40;
                if (item.customizations.milk === 'almond') itemPrice += 15;
                if (item.customizations.milk === 'soy') itemPrice += 10;
                if (item.customizations.milk === 'oat') itemPrice += 20;
            }
            
            return total + (itemPrice * item.quantity);
        }, 0);
    }

    async applyCoupon(couponCode) {
        if (!couponCode) {
            this.showNotification('Please enter a coupon code', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/coupons.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coupon_code: couponCode,
                    order_total: this.calculateSubtotal()
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentOrder.discount = data.discount_amount;
                this.currentOrder.coupon_code = couponCode;
                this.updateOrderSummary();
                this.showNotification(`Coupon applied! You saved ₹${data.discount_amount}`, 'success');
                
                // Disable coupon input
                document.getElementById('coupon-code').disabled = true;
                document.getElementById('apply-coupon-btn').disabled = true;
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to apply coupon. Please try again.', 'error');
        }
    }

    async placeOrder() {
        // Validate order
        if (!this.validateOrder()) {
            return;
        }

        // Prepare order data
        const orderData = {
            ...this.currentOrder,
            customer_info: this.collectCustomerInfo(),
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (data.success) {
                // Clear cart
                localStorage.removeItem('brewcraft_cart');
                
                // Redirect to payment or confirmation
                if (this.currentOrder.payment_method === 'online') {
                    this.initiateOnlinePayment(data.order_id);
                } else {
                    window.location.href = `order-confirmation.php?order_id=${data.order_id}`;
                }
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to place order. Please try again.', 'error');
        }
    }

    validateOrder() {
        if (this.currentOrder.items.length === 0) {
            this.showNotification('Your cart is empty', 'warning');
            return false;
        }

        if (!this.currentOrder.payment_method) {
            this.showNotification('Please select a payment method', 'warning');
            return false;
        }

        // Validate delivery type specific requirements
        if (this.currentOrder.delivery_type === 'delivery') {
            const address = document.getElementById('delivery-address')?.value;
            const contact = document.getElementById('contact-number')?.value;
            
            if (!address || !contact) {
                this.showNotification('Please fill in all delivery information', 'warning');
                return false;
            }
        }

        return true;
    }

    collectCustomerInfo() {
        const info = {};
        
        if (this.currentOrder.delivery_type === 'delivery') {
            info.address = document.getElementById('delivery-address')?.value;
            info.contact = document.getElementById('contact-number')?.value;
            info.delivery_instructions = document.getElementById('delivery-instructions')?.value;
        } else if (this.currentOrder.delivery_type === 'pickup') {
            info.contact = document.getElementById('contact-number')?.value;
            info.pickup_time = document.getElementById('pickup-time')?.value;
        } else {
            info.table_number = document.getElementById('table-number')?.value;
            info.party_size = document.getElementById('party-size')?.value;
        }

        return info;
    }

    updatePaymentUI() {
        const paymentDetails = document.getElementById('payment-details');
        if (!paymentDetails) return;

        if (this.currentOrder.payment_method === 'online') {
            paymentDetails.innerHTML = `
                <div class="online-payment-options">
                    <h6>Select Payment Method</h6>
                    <div class="payment-methods">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="online_method" value="upi" id="upi">
                            <label class="form-check-label" for="upi">
                                <i class="fas fa-mobile-alt me-2"></i>UPI (PhonePe, Google Pay, Paytm)
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="online_method" value="card" id="card">
                            <label class="form-check-label" for="card">
                                <i class="fas fa-credit-card me-2"></i>Credit/Debit Card
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="online_method" value="netbanking" id="netbanking">
                            <label class="form-check-label" for="netbanking">
                                <i class="fas fa-university me-2"></i>Net Banking
                            </label>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.currentOrder.payment_method === 'cash') {
            paymentDetails.innerHTML = `
                <div class="cash-payment-info">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        You have selected Cash on ${this.currentOrder.delivery_type === 'delivery' ? 'Delivery' : 
                                                   this.currentOrder.delivery_type === 'pickup' ? 'Pickup' : 'Order'}.
                        Please keep exact change ready.
                    </div>
                </div>
            `;
        }
    }

    async initiateOnlinePayment(orderId) {
        // This would integrate with payment gateway (Razorpay, Stripe, etc.)
        const paymentData = {
            order_id: orderId,
            amount: this.currentOrder.total,
            currency: 'INR'
        };

        try {
            const response = await fetch('/api/payment.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();

            if (data.success) {
                // Redirect to payment gateway
                window.location.href = data.payment_url;
            } else {
                this.showNotification('Failed to initiate payment. Please try again.', 'error');
            }
        } catch (error) {
            this.showNotification('Payment initialization failed. Please try again.', 'error');
        }
    }

    updateCartStorage() {
        // Update localStorage with current order items
        const cartItems = this.currentOrder.items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            customizations: item.customizations
        }));
        localStorage.setItem('brewcraft_cart', JSON.stringify(cartItems));
    }

    showNotification(message, type = 'info') {
        if (window.brewCraftApp) {
            window.brewCraftApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize ordering system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orderingSystem = new OrderingSystem();
});