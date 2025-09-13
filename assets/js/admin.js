// BrewCraft Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.charts = {};
        this.stats = {};
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadDashboardStats();
        this.initCharts();
        this.setupRealTimeUpdates();
    }

    initEventListeners() {
        // Date range picker for analytics
        const dateRangePicker = document.getElementById('date-range');
        if (dateRangePicker) {
            dateRangePicker.addEventListener('change', (e) => {
                this.loadAnalytics(e.target.value);
            });
        }

        // Menu management
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-menu-item')) {
                this.editMenuItem(e.target.dataset.id);
            }
            if (e.target.classList.contains('delete-menu-item')) {
                this.deleteMenuItem(e.target.dataset.id);
            }
            if (e.target.classList.contains('toggle-availability')) {
                this.toggleAvailability(e.target.dataset.id);
            }
        });

        // Order management
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('update-order-status')) {
                this.updateOrderStatus(e.target.dataset.orderId, e.target.dataset.status);
            }
            if (e.target.classList.contains('view-order-details')) {
                this.viewOrderDetails(e.target.dataset.orderId);
            }
        });

        // Bulk actions
        const bulkActionBtn = document.getElementById('bulk-action-btn');
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', () => {
                this.handleBulkAction();
            });
        }

        // Search and filters
        const searchInput = document.getElementById('admin-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce(this.handleSearch.bind(this), 300)(e.target.value);
            });
        }

        // Export data
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/admin/dashboard-stats.php');
            const data = await response.json();

            if (data.success) {
                this.stats = data.data;
                this.renderDashboardStats();
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    renderDashboardStats() {
        const statsContainer = document.getElementById('dashboard-stats');
        if (!statsContainer) return;

        const statsHTML = `
            <div class="row">
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card bg-primary">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-number">${this.stats.total_orders || 0}</div>
                            <div class="stat-label">Total Orders</div>
                            <div class="stat-trend ${this.stats.orders_trend > 0 ? 'positive' : 'negative'}">
                                <i class="fas fa-arrow-${this.stats.orders_trend > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(this.stats.orders_trend || 0)}%
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card bg-success">
                        <div class="stat-icon">
                            <i class="fas fa-rupee-sign"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-number">₹${this.formatNumber(this.stats.total_revenue || 0)}</div>
                            <div class="stat-label">Total Revenue</div>
                            <div class="stat-trend ${this.stats.revenue_trend > 0 ? 'positive' : 'negative'}">
                                <i class="fas fa-arrow-${this.stats.revenue_trend > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(this.stats.revenue_trend || 0)}%
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card bg-info">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-number">${this.stats.total_customers || 0}</div>
                            <div class="stat-label">Total Customers</div>
                            <div class="stat-trend ${this.stats.customers_trend > 0 ? 'positive' : 'negative'}">
                                <i class="fas fa-arrow-${this.stats.customers_trend > 0 ? 'up' : 'down'}"></i>
                                ${Math.abs(this.stats.customers_trend || 0)}%
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <div class="stat-card bg-warning">
                        <div class="stat-icon">
                            <i class="fas fa-coffee"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-number">${this.stats.pending_orders || 0}</div>
                            <div class="stat-label">Pending Orders</div>
                            <div class="stat-sublabel">Needs attention</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        statsContainer.innerHTML = statsHTML;
    }

    initCharts() {
        this.initSalesChart();
        this.initPopularItemsChart();
        this.initOrderStatusChart();
    }

    async initSalesChart() {
        const ctx = document.getElementById('salesChart');
        if (!ctx) return;

        try {
            const response = await fetch('/api/admin/sales-data.php');
            const data = await response.json();

            if (data.success) {
                this.charts.sales = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.data.labels,
                        datasets: [{
                            label: 'Sales (₹)',
                            data: data.data.sales,
                            borderColor: '#8B4513',
                            backgroundColor: 'rgba(139, 69, 19, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '₹' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load sales chart:', error);
        }
    }

    async initPopularItemsChart() {
        const ctx = document.getElementById('popularItemsChart');
        if (!ctx) return;

        try {
            const response = await fetch('/api/admin/popular-items-data.php');
            const data = await response.json();

            if (data.success) {
                this.charts.popularItems = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: data.data.labels,
                        datasets: [{
                            data: data.data.values,
                            backgroundColor: [
                                '#8B4513',
                                '#D2691E',
                                '#FF8C00',
                                '#228B22',
                                '#DC143C'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load popular items chart:', error);
        }
    }

    async initOrderStatusChart() {
        const ctx = document.getElementById('orderStatusChart');
        if (!ctx) return;

        try {
            const response = await fetch('/api/admin/order-status-data.php');
            const data = await response.json();

            if (data.success) {
                this.charts.orderStatus = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.data.labels,
                        datasets: [{
                            label: 'Orders',
                            data: data.data.values,
                            backgroundColor: [
                                '#ffc107',
                                '#17a2b8',
                                '#28a745',
                                '#dc3545'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load order status chart:', error);
        }
    }

    async editMenuItem(itemId) {
        try {
            const response = await fetch(`/api/admin/menu-item.php?id=${itemId}`);
            const data = await response.json();

            if (data.success) {
                this.showEditMenuItemModal(data.data);
            }
        } catch (error) {
            this.showNotification('Failed to load menu item', 'error');
        }
    }

    showEditMenuItemModal(item) {
        const modalHTML = `
            <div class="modal fade" id="editMenuItemModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Menu Item</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form id="edit-menu-item-form">
                            <div class="modal-body">
                                <input type="hidden" name="item_id" value="${item.id}">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Item Name</label>
                                            <input type="text" class="form-control" name="name" value="${item.name}" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Category</label>
                                            <select class="form-select" name="category" required>
                                                <option value="coffee" ${item.category === 'coffee' ? 'selected' : ''}>Coffee</option>
                                                <option value="tea" ${item.category === 'tea' ? 'selected' : ''}>Tea</option>
                                                <option value="pastries" ${item.category === 'pastries' ? 'selected' : ''}>Pastries</option>
                                                <option value="sandwiches" ${item.category === 'sandwiches' ? 'selected' : ''}>Sandwiches</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Price (₹)</label>
                                            <input type="number" class="form-control" name="price" value="${item.price}" min="0" step="0.01" required>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Sale Price (₹)</label>
                                            <input type="number" class="form-control" name="sale_price" value="${item.sale_price || ''}" min="0" step="0.01">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Description</label>
                                            <textarea class="form-control" name="description" rows="4" required>${item.description}</textarea>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Image URL</label>
                                            <input type="url" class="form-control" name="image" value="${item.image}" required>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-check">
                                                <input type="checkbox" class="form-check-input" name="available" ${item.available ? 'checked' : ''}>
                                                <label class="form-check-label">Available</label>
                                            </div>
                                            <div class="form-check">
                                                <input type="checkbox" class="form-check-input" name="is_popular" ${item.is_popular ? 'checked' : ''}>
                                                <label class="form-check-label">Popular Item</label>
                                            </div>
                                            <div class="form-check">
                                                <input type="checkbox" class="form-check-input" name="is_vegetarian" ${item.is_vegetarian ? 'checked' : ''}>
                                                <label class="form-check-label">Vegetarian</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('editMenuItemModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editMenuItemModal'));
        modal.show();

        // Handle form submission
        document.getElementById('edit-menu-item-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMenuItem(e.target);
        });
    }

    async saveMenuItem(form) {
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/admin/menu-item.php', {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Menu item updated successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editMenuItemModal')).hide();
                this.reloadCurrentPage();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to update menu item', 'error');
        }
    }

    async deleteMenuItem(itemId) {
        if (!confirm('Are you sure you want to delete this menu item?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/menu-item.php?id=${itemId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Menu item deleted successfully', 'success');
                this.reloadCurrentPage();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to delete menu item', 'error');
        }
    }

    async toggleAvailability(itemId) {
        try {
            const response = await fetch(`/api/admin/toggle-availability.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ item_id: itemId })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Availability updated', 'success');
                this.reloadCurrentPage();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to update availability', 'error');
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch('/api/admin/update-order-status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    order_id: orderId, 
                    status: status 
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Order status updated', 'success');
                this.reloadCurrentPage();
            } else {
                this.showNotification(data.message, 'error');
            }
        } catch (error) {
            this.showNotification('Failed to update order status', 'error');
        }
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/admin/order-details.php?id=${orderId}`);
            const data = await response.json();

            if (data.success) {
                this.showOrderDetailsModal(data.data);
            }
        } catch (error) {
            this.showNotification('Failed to load order details', 'error');
        }
    }

    showOrderDetailsModal(order) {
        const modalHTML = `
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Order #${order.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Customer Information</h6>
                                    <p><strong>Name:</strong> ${order.customer_name || 'N/A'}</p>
                                    <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
                                    <p><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
                                    <p><strong>Order Type:</strong> ${order.order_type}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6>Order Details</h6>
                                    <p><strong>Status:</strong> <span class="badge bg-${this.getStatusColor(order.status)}">${order.status}</span></p>
                                    <p><strong>Total:</strong> ₹${order.total}</p>
                                    <p><strong>Payment:</strong> ${order.payment_method}</p>
                                    <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                            <hr>
                            <h6>Order Items</h6>
                            <div class="order-items">
                                ${order.items.map(item => `
                                    <div class="d-flex justify-content-between align-items-center py-2">
                                        <div>
                                            <strong>${item.name}</strong>
                                            <span class="text-muted">(Qty: ${item.quantity})</span>
                                        </div>
                                        <div>₹${item.price * item.quantity}</div>
                                    </div>
                                `).join('')}
                            </div>
                            ${order.special_instructions ? `
                                <hr>
                                <h6>Special Instructions</h6>
                                <p>${order.special_instructions}</p>
                            ` : ''}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="window.print()">Print Order</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('orderDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    }

    setupRealTimeUpdates() {
        // Poll for new orders every 30 seconds
        setInterval(() => {
            this.checkForNewOrders();
        }, 30000);
    }

    async checkForNewOrders() {
        try {
            const response = await fetch('/api/admin/new-orders-count.php');
            const data = await response.json();

            if (data.success && data.count > 0) {
                this.showNewOrderNotification(data.count);
                this.updateOrdersBadge(data.count);
            }
        } catch (error) {
            console.error('Failed to check for new orders:', error);
        }
    }

    showNewOrderNotification(count) {
        this.showNotification(`${count} new order(s) received!`, 'success');
    }

    updateOrdersBadge(count) {
        const badge = document.getElementById('new-orders-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'confirmed': 'info',
            'preparing': 'primary',
            'ready': 'success',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    }

    handleSearch(query) {
        // Implement search functionality based on current page
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('orders')) {
            this.searchOrders(query);
        } else if (currentPage.includes('menu-management')) {
            this.searchMenuItems(query);
        }
    }

    async exportData() {
        const dataType = document.getElementById('export-type')?.value || 'orders';
        const dateRange = document.getElementById('export-date-range')?.value || 'this-month';

        try {
            const response = await fetch(`/api/admin/export.php?type=${dataType}&range=${dateRange}`);
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `brewcraft-${dataType}-${dateRange}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.showNotification('Data exported successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to export data', 'error');
        }
    }

    reloadCurrentPage() {
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }

    formatNumber(num) {
        if (num >= 10000000) {
            return (num / 10000000).toFixed(1) + 'Cr';
        } else if (num >= 100000) {
            return (num / 100000).toFixed(1) + 'L';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
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

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});