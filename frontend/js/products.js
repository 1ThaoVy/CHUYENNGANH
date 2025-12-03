// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
let currentCategory = urlParams.get('category') || '';
let currentSearch = urlParams.get('search') || '';
let currentSort = urlParams.get('sort') || 'moi_nhat';
let currentPage = urlParams.get('page') || 1;
let showDiscountOnly = urlParams.get('giam_gia') === 'true';

// Load categories for filter
async function loadCategories() {
    try {
        const data = await apiCall('/categories');
        const container = document.getElementById('categories-filter');
        
        container.innerHTML = `
            <button onclick="filterByCategory('')" 
                    class="block w-full text-left px-3 py-2 rounded ${!currentCategory ? 'bg-primary text-white' : 'hover:bg-gray-100'}">
                Tất cả
            </button>
            ${data.data.map(cat => `
                <button onclick="filterByCategory('${cat.danh_muc_id}')" 
                        class="block w-full text-left px-3 py-2 rounded ${currentCategory == cat.danh_muc_id ? 'bg-primary text-white' : 'hover:bg-gray-100'}">
                    ${cat.ten_danh_muc}
                </button>
            `).join('')}
        `;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load products
async function loadProducts() {
    const loading = document.getElementById('loading');
    const noProducts = document.getElementById('no-products');
    const grid = document.getElementById('products-grid');
    
    loading.classList.remove('hidden');
    noProducts.classList.add('hidden');
    grid.innerHTML = '';

    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 12,
            sort: currentSort
        });
        
        if (currentCategory) params.append('danh_muc_id', currentCategory);
        if (currentSearch) params.append('search', currentSearch);
        if (showDiscountOnly) params.append('giam_gia', 'true');

        const data = await apiCall(`/products?${params}`);
        
        loading.classList.add('hidden');

        if (data.data.length === 0) {
            noProducts.classList.remove('hidden');
            return;
        }

        grid.innerHTML = data.data.map(product => {
            const hasDiscount = product.phan_tram_giam > 0;
            return `
                <a href="product-detail.html?id=${product.san_pham_id}" 
                   class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition relative">
                    ${hasDiscount ? `
                        <div class="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                            -${product.phan_tram_giam}%
                        </div>
                    ` : ''}
                    <div class="h-64 bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-400">Hình ảnh</span>
                    </div>
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-2 line-clamp-2">${product.ten_san_pham}</h3>
                        <p class="text-sm text-gray-600 mb-2">${product.ten_danh_muc}</p>
                        <div class="flex justify-between items-center">
                            <div class="flex flex-col">
                                ${hasDiscount ? `
                                    <span class="text-sm text-gray-400 line-through">${formatCurrency(product.gia_goc)}</span>
                                    <span class="text-xl font-bold text-red-600">${formatCurrency(product.gia_ban)}</span>
                                ` : `
                                    <span class="text-xl font-bold text-primary">${formatCurrency(product.gia_ban)}</span>
                                `}
                            </div>
                            <span class="text-sm text-gray-500">${product.dung_tich}</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        // Render pagination
        renderPagination(data.pagination);
    } catch (error) {
        console.error('Error loading products:', error);
        loading.classList.add('hidden');
    }
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
    container.innerHTML = pages.map(page => `
        <button onclick="goToPage(${page})" 
                class="px-4 py-2 rounded ${page == currentPage ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}">
            ${page}
        </button>
    `).join('');
}

function filterByCategory(categoryId) {
    currentCategory = categoryId;
    currentPage = 1;
    updateURL();
    loadCategories();
    loadProducts();
}

function goToPage(page) {
    currentPage = page;
    updateURL();
    loadProducts();
    window.scrollTo(0, 0);
}

function updateURL() {
    const params = new URLSearchParams();
    if (currentCategory) params.set('category', currentCategory);
    if (currentSearch) params.set('search', currentSearch);
    if (currentSort !== 'moi_nhat') params.set('sort', currentSort);
    if (currentPage > 1) params.set('page', currentPage);
    if (showDiscountOnly) params.set('giam_gia', 'true');
    
    const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newURL);
}

// Sort change handler
document.getElementById('sort-select').addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    updateURL();
    loadProducts();
});

// Discount filter handler
document.getElementById('discount-filter').addEventListener('change', (e) => {
    showDiscountOnly = e.target.checked;
    currentPage = 1;
    updateURL();
    loadProducts();
});

// Set initial values
document.getElementById('sort-select').value = currentSort;
document.getElementById('discount-filter').checked = showDiscountOnly;

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});
