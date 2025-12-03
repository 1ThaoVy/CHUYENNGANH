// Load categories and products on home page
async function loadHomeData() {
    try {
        // Load categories
        const categoriesData = await apiCall('/categories');
        displayCategories(categoriesData.data);

        // Load discounted products by brand
        await loadDiscountedProductsByBrand(categoriesData.data);
    } catch (error) {
        console.error('Error loading home data:', error);
    }
}

// Load sản phẩm giảm giá theo từng thương hiệu
async function loadDiscountedProductsByBrand(categories) {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = '<div class="col-span-full text-center">Đang tải...</div>';

    try {
        let allHTML = '';
        
        for (const category of categories) {
            // Lấy sản phẩm giảm giá của từng thương hiệu
            const productsData = await apiCall(`/products?danh_muc_id=${category.danh_muc_id}&giam_gia=true&limit=4`);
            
            if (productsData.data && productsData.data.length > 0) {
                allHTML += `
                    <div class="col-span-full mb-8">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-2xl font-bold">${category.ten_danh_muc} - Giảm giá đặc biệt</h3>
                            <a href="products.html?category=${category.danh_muc_id}&giam_gia=true" 
                               class="text-primary hover:underline">Xem tất cả →</a>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            ${productsData.data.map(product => createProductCard(product)).join('')}
                        </div>
                    </div>
                `;
            }
        }

        if (allHTML) {
            container.innerHTML = allHTML;
        } else {
            container.innerHTML = '<div class="col-span-full text-center text-gray-500">Chưa có sản phẩm giảm giá</div>';
        }
    } catch (error) {
        console.error('Error loading discounted products:', error);
        container.innerHTML = '<div class="col-span-full text-center text-red-500">Lỗi tải sản phẩm</div>';
    }
}

// Tạo card sản phẩm với hiển thị giảm giá
function createProductCard(product) {
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
                <div class="flex justify-between items-center mb-2">
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
}

function displayCategories(categories) {
    const container = document.getElementById('categories');
    if (!container) return;

    // Brand CSS classes
    const brandClasses = {
        'Chanel': 'brand-chanel',
        'Dior': 'brand-dior',
        'Gucci': 'brand-gucci',
        'Le Labo': 'brand-lelabo',
        'Calvin Klein': 'brand-calvinklein'
    };

    container.innerHTML = categories.map(cat => `
        <a href="products.html?category=${cat.danh_muc_id}" 
           class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl hover:scale-105 transition">
            <h3 class="${brandClasses[cat.ten_danh_muc] || 'font-semibold text-lg'}">${cat.ten_danh_muc}</h3>
        </a>
    `).join('');
}



// Load data when page loads
if (document.getElementById('categories') || document.getElementById('products')) {
    document.addEventListener('DOMContentLoaded', loadHomeData);
}
