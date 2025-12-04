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

// Load tất cả sản phẩm giảm giá
async function loadDiscountedProductsByBrand(categories) {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = '<div class="text-center">Đang tải...</div>';

    try {
        // Lấy tất cả sản phẩm giảm giá (không phân biệt thương hiệu)
        const productsData = await apiCall(`/products?giam_gia=true&limit=10`);
        
        if (productsData.data && productsData.data.length > 0) {
            container.innerHTML = `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    ${productsData.data.map(product => createProductCard(product)).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<div class="text-center text-gray-500">Chưa có sản phẩm giảm giá</div>';
        }
    } catch (error) {
        console.error('Error loading discounted products:', error);
        container.innerHTML = '<div class="text-center text-red-500">Lỗi tải sản phẩm</div>';
    }
}

// Tạo card sản phẩm với hiển thị giảm giá
function createProductCard(product) {
    const hasDiscount = product.phan_tram_giam_gia > 0;
    
    return `
        <a href="product-detail.html?id=${product.san_pham_id}" 
           class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition relative">
            ${hasDiscount ? `
                <div class="absolute top-3 left-3 bg-red-500 text-white px-4 py-2 rounded-lg text-base font-bold z-10">
                    -${product.phan_tram_giam_gia}%
                </div>
            ` : ''}
            <div class="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
                ${product.url_hinh_anh_chinh ? `
                    <img src="http://localhost:3001${product.url_hinh_anh_chinh}" 
                         alt="${product.ten_san_pham}" 
                         class="w-full h-full object-cover"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div style="display:none" class="w-full h-full flex items-center justify-center">
                        <span class="text-gray-400">Hình ảnh</span>
                    </div>
                ` : `
                    <span class="text-gray-400">Hình ảnh</span>
                `}
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-1">${product.ten_san_pham}</h3>
                <p class="text-sm text-gray-500 mb-3">${product.ten_danh_muc}</p>
                <div class="flex justify-between items-end">
                    <div class="flex flex-col">
                        ${hasDiscount && product.gia_goc ? `
                            <span class="text-sm text-gray-300 line-through mb-1">${formatCurrency(product.gia_goc)}</span>
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

    // Brand CSS classes - 5 thương hiệu: Dior, Chanel, Calvin Klein, Le Labo, Gucci
    const brandClasses = {
        'Dior': 'brand-dior',
        'Chanel': 'brand-chanel',
        'Calvin Klein': 'brand-calvinklein',
        'Le Labo': 'brand-lelabo',
        'Gucci': 'brand-gucci'
    };

    container.innerHTML = categories.map(cat => `
        <a href="products.html?category=${cat.danh_muc_id}" 
           class="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-xl hover:scale-105 transition">
            <h3 class="${brandClasses[cat.ten_danh_muc] || 'font-semibold text-lg'}">${cat.ten_danh_muc.toUpperCase()}</h3>
        </a>
    `).join('');
}



// Load data when page loads
if (document.getElementById('categories') || document.getElementById('products')) {
    document.addEventListener('DOMContentLoaded', loadHomeData);
}
