// Load categories and products on home page
async function loadHomeData() {
    try {
        // Load categories
        const categoriesData = await apiCall('/categories');
        displayCategories(categoriesData.data);

        // Load featured products
        const productsData = await apiCall('/products?limit=8');
        displayProducts(productsData.data);
    } catch (error) {
        console.error('Error loading home data:', error);
    }
}

function displayCategories(categories) {
    const container = document.getElementById('categories');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <a href="products.html?category=${cat.danh_muc_id}" 
           class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-105 transition">
            <h3 class="font-semibold text-lg">${cat.ten_danh_muc}</h3>
        </a>
    `).join('');
}

function displayProducts(products) {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <a href="product-detail.html?id=${product.san_pham_id}" 
           class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div class="h-64 bg-gray-200 flex items-center justify-center">
                <span class="text-gray-400">Hình ảnh</span>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2 line-clamp-2">${product.ten_san_pham}</h3>
                <p class="text-sm text-gray-600 mb-2">${product.ten_danh_muc}</p>
                <div class="flex justify-between items-center">
                    <span class="text-xl font-bold text-primary">${formatCurrency(product.gia_ban)}</span>
                    <span class="text-sm text-gray-500">${product.dung_tich}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// Load data when page loads
if (document.getElementById('categories') || document.getElementById('products')) {
    document.addEventListener('DOMContentLoaded', loadHomeData);
}
