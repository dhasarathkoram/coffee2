// BrewCraft Menu Management JavaScript

class MenuManager {
    constructor() {
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.searchQuery = '';
        this.sortBy = 'name';
        this.filters = {
            priceRange: [0, 1000],
            categories: [],
            availability: 'all'
        };
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadMenuItems();
        this.initPriceRangeSlider();
    }

    initEventListeners() {
        // Category filters
        document.querySelectorAll('.category-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });

        // Search
        const searchInput = document.getElementById('menu-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Sort
        const sortSelect = document.getElementById('menu-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // Price range
        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                this.handlePriceRange(e.target.value);
            });
        }

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page) {
                    this.goToPage(page);
                }
            }
        });

        // Add to cart
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                this.addToCart(e.target.dataset);
            }
        });

        // Quick view
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-view')) {
                this.showQuickView(e.target.dataset.id);
            }
        });
    }

    async loadMenuItems() {
        try {
            this.showLoading();
            const params = new URLSearchParams({
                category: this.currentCategory,
                page: this.currentPage,
                limit: this.itemsPerPage,
                search: this.searchQuery,
                sort: this.sortBy,
                min_price: this.filters.priceRange[0],
                max_price: this.filters.priceRange[1],
                availability: this.filters.availability
            });

            const response = await fetch(`/api/menu.php?${params}`);
            const data = await response.json();

            if (data.success) {
                this.renderMenuItems(data.data.items);
                this.renderPagination(data.data.pagination);
                this.updateResultsCount(data.data.total);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            this.showError('Failed to load menu items');
            console.error(error);
        } finally {
            this.hideLoading();
        }
    }

    renderMenuItems(items) {
        const container = document.getElementById('menu-items-container');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4>No items found</h4>
                        <p class="text-muted">Try adjusting your filters or search terms</p>
                        <button class="btn btn-primary" onclick="menuManager.clearFilters()">
                            Clear Filters
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const itemsHTML = items.map(item => `
            <div class="col-lg-4 col-md-6">
                <div class="menu-item-card" data-aos="fade-up">
                    <div class="menu-item-image position-relative">
                        <img src="${item.image}" alt="${item.name}" loading="lazy">
                        ${item.is_popular ? '<span class="badge bg-accent position-absolute top-0 end-0 m-2">Popular</span>' : ''}
                        ${!item.available ? '<div class="unavailable-overlay"><span>Currently Unavailable</span></div>' : ''}
                        <div class="menu-item-overlay">
                            <button class="btn btn-sm btn-light quick-view" data-id="${item.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="menu-item-content">
                        <div class="menu-item-header d-flex justify-content-between align-items-start mb-2">
                            <h5 class="menu-item-title mb-0">${item.name}</h5>
                            <div class="menu-item-rating">
                                ${this.renderStars(item.rating)}
                                <small class="text-muted">(${item.review_count})</small>
                            </div>
                        </div>
                        <p class="menu-item-description text-muted">${item.description}</p>
                        <div class="menu-item-details mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="menu-item-category badge bg-light text-dark">${item.category}</span>
                                <div class="menu-item-dietary">
                                    ${item.is_vegetarian ? '<i class="fas fa-leaf text-success" title="Vegetarian"></i>' : ''}
                                    ${item.is_vegan ? '<i class="fas fa-seedling text-success" title="Vegan"></i>' : ''}
                                    ${item.is_spicy ? '<i class="fas fa-pepper-hot text-danger" title="Spicy"></i>' : ''}
                                </div>
                            </div>
                        </div>
                        <div class="menu-item-footer d-flex justify-content-between align-items-center">
                            <div class="menu-item-price">
                                ${item.sale_price ? `
                                    <span class="sale-price">₹${item.sale_price}</span>
                                    <span class="original-price text-muted text-decoration-line-through">₹${item.price}</span>
                                ` : `<span class="price">₹${item.price}</span>`}
                            </div>
                            <div class="menu-item-actions">
                                ${item.available ? `
                                    <button class="btn btn-accent add-to-cart" 
                                            data-id="${item.id}" 
                                            data-name="${item.name}" 
                                            data-price="${item.sale_price || item.price}"
                                            data-image="${item.image}">
                                        <i class="fas fa-plus me-1"></i>Add
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary" disabled>
                                        <i class="fas fa-times me-1"></i>Unavailable
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;

        // Initialize AOS animation if available
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    renderStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push('<i class="fas fa-star text-warning"></i>');
        }

        if (hasHalfStar) {
            stars.push('<i class="fas fa-star-half-alt text-warning"></i>');
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push('<i class="far fa-star text-warning"></i>');
        }

        return stars.join('');
    }

    renderPagination(pagination) {
        const container = document.getElementById('menu-pagination');
        if (!container || pagination.total_pages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let paginationHTML = '<nav><ul class="pagination justify-content-center">';

        // Previous button
        if (pagination.current_page > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${pagination.current_page - 1}">
                        <i class="fas fa-chevron-left"></i>
                    </a>
                </li>
            `;
        }

        // Page numbers
        const startPage = Math.max(1, pagination.current_page - 2);
        const endPage = Math.min(pagination.total_pages, pagination.current_page + 2);

        if (startPage > 1) {
            paginationHTML += '<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>';
            if (startPage > 2) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === pagination.current_page ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        if (endPage < pagination.total_pages) {
            if (endPage < pagination.total_pages - 1) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            paginationHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.total_pages}">${pagination.total_pages}</a></li>`;
        }

        // Next button
        if (pagination.current_page < pagination.total_pages) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${pagination.current_page + 1}">
                        <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }

        paginationHTML += '</ul></nav>';
        container.innerHTML = paginationHTML;
    }

    updateResultsCount(total) {
        const counter = document.getElementById('results-count');
        if (counter) {
            const start = ((this.currentPage - 1) * this.itemsPerPage) + 1;
            const end = Math.min(this.currentPage * this.itemsPerPage, total);
            counter.textContent = `Showing ${start}-${end} of ${total} items`;
        }
    }

    handleCategoryFilter(category) {
        this.currentCategory = category;
        this.currentPage = 1;

        // Update active state
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.loadMenuItems();
    }

    handleSearch(query) {
        this.searchQuery = query;
        this.currentPage = 1;
        
        // Debounce the search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadMenuItems();
        }, 300);
    }

    handleSort(sortBy) {
        this.sortBy = sortBy;
        this.currentPage = 1;
        this.loadMenuItems();
    }

    handlePriceRange(value) {
        this.filters.priceRange[1] = parseInt(value);
        this.currentPage = 1;
        
        // Update display
        const display = document.getElementById('price-range-display');
        if (display) {
            display.textContent = `₹0 - ₹${value}`;
        }
        
        // Debounce the filter
        clearTimeout(this.priceTimeout);
        this.priceTimeout = setTimeout(() => {
            this.loadMenuItems();
        }, 500);
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadMenuItems();
        
        // Scroll to top of menu
        const menuSection = document.getElementById('menu-section');
        if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    addToCart(itemData) {
        if (window.brewCraftApp) {
            window.brewCraftApp.addToCart(itemData);
        } else {
            this.showNotification('Please wait while the app loads...', 'warning');
        }
    }

    async showQuickView(itemId) {
        try {
            const response = await fetch(`/api/menu.php?id=${itemId}`);
            const data = await response.json();

            if (data.success) {
                this.renderQuickViewModal(data.data);
            }
        } catch (error) {
            this.showError('Failed to load item details');
        }
    }

    renderQuickViewModal(item) {
        const modalHTML = `
            <div class="modal fade" id="quickViewModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${item.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                                </div>
                                <div class="col-md-6">
                                    <div class="quick-view-details">
                                        <div class="rating mb-2">
                                            ${this.renderStars(item.rating)}
                                            <span class="ms-2">(${item.review_count} reviews)</span>
                                        </div>
                                        <p class="description">${item.description}</p>
                                        <div class="nutritional-info">
                                            <h6>Nutritional Information:</h6>
                                            <ul class="list-unstyled">
                                                <li>Calories: ${item.calories || 'N/A'}</li>
                                                <li>Protein: ${item.protein || 'N/A'}g</li>
                                                <li>Carbs: ${item.carbs || 'N/A'}g</li>
                                                <li>Fat: ${item.fat || 'N/A'}g</li>
                                            </ul>
                                        </div>
                                        <div class="allergens mb-3">
                                            <h6>Allergens:</h6>
                                            <p>${item.allergens || 'None specified'}</p>
                                        </div>
                                        <div class="price-section mb-3">
                                            ${item.sale_price ? `
                                                <span class="sale-price h4">₹${item.sale_price}</span>
                                                <span class="original-price text-muted text-decoration-line-through ms-2">₹${item.price}</span>
                                            ` : `<span class="price h4">₹${item.price}</span>`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            ${item.available ? `
                                <button type="button" class="btn btn-accent add-to-cart" 
                                        data-id="${item.id}" 
                                        data-name="${item.name}" 
                                        data-price="${item.sale_price || item.price}"
                                        data-image="${item.image}">
                                    <i class="fas fa-plus me-1"></i>Add to Cart
                                </button>
                            ` : `
                                <button type="button" class="btn btn-secondary" disabled>
                                    Currently Unavailable
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('quickViewModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('quickViewModal'));
        modal.show();
    }

    initPriceRangeSlider() {
        const slider = document.getElementById('price-range');
        if (slider) {
            slider.max = 1000;
            slider.value = 1000;
            slider.addEventListener('input', (e) => {
                this.handlePriceRange(e.target.value);
            });
        }
    }

    clearFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'name';
        this.filters = {
            priceRange: [0, 1000],
            categories: [],
            availability: 'all'
        };
        this.currentPage = 1;

        // Reset UI
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });

        const searchInput = document.getElementById('menu-search');
        if (searchInput) searchInput.value = '';

        const sortSelect = document.getElementById('menu-sort');
        if (sortSelect) sortSelect.value = 'name';

        const priceRange = document.getElementById('price-range');
        if (priceRange) priceRange.value = 1000;

        this.loadMenuItems();
    }

    showLoading() {
        const container = document.getElementById('menu-items-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading delicious options...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading will be hidden when new content is rendered
    }

    showError(message) {
        const container = document.getElementById('menu-items-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        <i class="fas fa-exclamation-triangle mb-2"></i>
                        <h5>Oops! Something went wrong</h5>
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="menuManager.loadMenuItems()">
                            Try Again
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        if (window.brewCraftApp) {
            window.brewCraftApp.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize menu manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menuManager = new MenuManager();
});