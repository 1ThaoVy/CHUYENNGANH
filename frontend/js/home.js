// Load categories and products on home page
async function loadHomeData() {
    try {
        // Load categories
        const categoriesData = await apiCall('/categories');
        displayCategories(categoriesData.data);

        // Load discounted products by brand
        await loadDiscountedProductsByBrand(categoriesData.data);
        
        // Load featured products
        await loadFeaturedProducts();
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
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
           class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition relative group">
            ${hasDiscount ? `
                <div class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                    -${product.phan_tram_giam_gia}%
                </div>
            ` : ''}
            <div class="aspect-square bg-gray-200 flex items-center justify-center overflow-hidden">
                ${product.url_hinh_anh_chinh ? `
                    <img src="http://localhost:3001${product.url_hinh_anh_chinh}" 
                         alt="${product.ten_san_pham}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div style="display:none" class="w-full h-full flex items-center justify-center">
                        <span class="text-gray-400 text-xs">Hình ảnh</span>
                    </div>
                ` : `
                    <span class="text-gray-400 text-xs">Hình ảnh</span>
                `}
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">${product.ten_san_pham}</h3>
                <p class="text-xs text-gray-500 mb-2">${product.ten_danh_muc}</p>
                <div class="space-y-1">
                    <div class="text-center">
                        ${hasDiscount && product.gia_goc ? `
                            <div class="text-xs text-gray-400 line-through">${formatCurrency(product.gia_goc)}</div>
                            <div class="text-sm font-bold text-red-600">${formatCurrency(product.gia_ban)}</div>
                        ` : `
                            <div class="text-sm font-bold text-primary">${formatCurrency(product.gia_ban)}</div>
                        `}
                    </div>
                    <div class="text-center text-xs text-gray-500 border-t pt-1">
                        ${product.dung_tich}
                    </div>
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



// Load featured products (10 sản phẩm nổi bật)
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) {
        console.log('Featured products container not found');
        return;
    }

    console.log('Loading featured products...');
    container.innerHTML = '<div class="text-center w-full">Đang tải...</div>';

    try {
        // Lấy 10 sản phẩm mới nhất (vì chưa có sort theo lượt xem)
        const productsData = await apiCall(`/products?sort=moi_nhat&limit=10`);
        console.log('Featured products data:', productsData);
        
        if (productsData.data && productsData.data.length > 0) {
            container.innerHTML = productsData.data.map(product => createFeaturedProductCard(product)).join('');
            console.log('Featured products loaded successfully');
        } else {
            container.innerHTML = '<div class="text-center w-full text-gray-500">Chưa có sản phẩm nổi bật</div>';
            console.log('No featured products found');
        }
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = '<div class="text-center w-full text-red-500">Lỗi tải sản phẩm</div>';
    }
}

// Tạo card sản phẩm nổi bật với thiết kế đặc biệt
function createFeaturedProductCard(product) {
    const hasDiscount = product.phan_tram_giam_gia > 0;
    
    return `
        <div class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary">
            <a href="product-detail.html?id=${product.san_pham_id}" class="block">
                ${hasDiscount ? `
                    <div class="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        -${product.phan_tram_giam_gia}%
                    </div>
                ` : ''}
                <div class="relative overflow-hidden">
                    <div class="aspect-square bg-gray-100 flex items-center justify-center">
                        ${product.url_hinh_anh_chinh ? `
                            <img src="http://localhost:3001${product.url_hinh_anh_chinh}" 
                                 alt="${product.ten_san_pham}" 
                                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                            <div style="display:none" class="w-full h-full flex items-center justify-center">
                                <span class="text-gray-400">Hình ảnh</span>
                            </div>
                        ` : `
                            <span class="text-gray-400">Hình ảnh</span>
                        `}
                    </div>
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>
                <div class="p-4">
                    <div class="mb-2">
                        <span class="text-xs font-medium text-primary bg-primary bg-opacity-10 px-2 py-1 rounded-full">
                            ${product.ten_danh_muc}
                        </span>
                    </div>
                    <h3 class="font-bold text-base mb-3 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                        ${product.ten_san_pham}
                    </h3>
                    <div class="space-y-2">
                        <div class="text-center">
                            ${hasDiscount && product.gia_goc ? `
                                <div class="text-sm text-gray-400 line-through mb-1">${formatCurrency(product.gia_goc)}</div>
                                <div class="text-xl font-bold text-red-600">${formatCurrency(product.gia_ban)}</div>
                            ` : `
                                <div class="text-xl font-bold text-primary">${formatCurrency(product.gia_ban)}</div>
                            `}
                        </div>
                        <div class="text-center text-sm text-gray-500 border-t pt-2">
                            <span class="font-medium">${product.dung_tich}</span>
                        </div>
                    </div>
                    <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div class="bg-primary text-white text-center py-2 rounded-lg text-sm font-medium">
                            Xem chi tiết
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `;
}

// Load data when page loads
if (document.getElementById('categories') || document.getElementById('products') || document.getElementById('featured-products')) {
    document.addEventListener('DOMContentLoaded', loadHomeData);
}
