// Flash Sale functionality
let flashSaleInterval;

// Load active flash sale
async function loadFlashSale() {
    try {
        const data = await apiCall('/flash-sale/active');
        
        if (data.success && data.data) {
            displayFlashSale(data.data);
        } else {
            hideFlashSale();
        }
    } catch (error) {
        console.error('Error loading flash sale:', error);
        hideFlashSale();
    }
}

// Display flash sale banner
function displayFlashSale(flashSale) {
    const section = document.getElementById('flash-sale-section');
    const banner = document.getElementById('flash-sale-banner');
    
    if (!section || !banner) return;
    
    // Calculate time remaining
    const endTime = new Date(flashSale.ngay_ket_thuc);
    const now = new Date();
    const timeRemaining = endTime - now;
    
    if (timeRemaining <= 0) {
        hideFlashSale();
        return;
    }
    
    // Create flash sale HTML
    banner.innerHTML = `
        <div class="bg-${flashSale.mau_nen_flash_sale || 'gradient-to-r from-red-500 to-pink-600'} text-white relative overflow-hidden">
            <!-- Background decorations -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-4 left-8 w-16 h-16 bg-white rounded-full animate-pulse"></div>
                <div class="absolute top-12 right-12 w-8 h-8 bg-yellow-300 rounded-full animate-bounce"></div>
                <div class="absolute bottom-8 left-1/4 w-12 h-12 bg-white rounded-full animate-pulse delay-1000"></div>
                <div class="absolute bottom-4 right-1/4 w-6 h-6 bg-yellow-300 rounded-full animate-bounce delay-500"></div>
            </div>
            
            <div class="container mx-auto px-6 py-8 relative z-10">
                <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
                    <!-- Left side - Flash sale info -->
                    <div class="flex-1 text-center lg:text-left">
                        <div class="flex items-center justify-center lg:justify-start gap-2 mb-4">
                            <span class="bg-yellow-400 text-red-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                ⚡ FLASH SALE
                            </span>
                        </div>
                        
                        <h2 class="text-3xl lg:text-4xl font-bold mb-2">${flashSale.tieu_de_flash_sale}</h2>
                        <p class="text-lg opacity-90 mb-4">${flashSale.mo_ta_flash_sale}</p>
                        
                        <!-- Countdown timer -->
                        <div class="flex items-center justify-center lg:justify-start gap-4 mb-6">
                            <div class="text-center">
                                <div id="hours" class="bg-white bg-opacity-20 rounded-lg px-3 py-2 min-w-[60px]">
                                    <div class="text-2xl font-bold">00</div>
                                    <div class="text-xs opacity-80">Giờ</div>
                                </div>
                            </div>
                            <div class="text-2xl font-bold">:</div>
                            <div class="text-center">
                                <div id="minutes" class="bg-white bg-opacity-20 rounded-lg px-3 py-2 min-w-[60px]">
                                    <div class="text-2xl font-bold">00</div>
                                    <div class="text-xs opacity-80">Phút</div>
                                </div>
                            </div>
                            <div class="text-2xl font-bold">:</div>
                            <div class="text-center">
                                <div id="seconds" class="bg-white bg-opacity-20 rounded-lg px-3 py-2 min-w-[60px]">
                                    <div class="text-2xl font-bold">00</div>
                                    <div class="text-xs opacity-80">Giây</div>
                                </div>
                            </div>
                        </div>
                        
                        <button onclick="scrollToFlashSaleProducts()" class="bg-white text-red-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg">
                            🛒 Mua Ngay
                        </button>
                    </div>
                    
                    <!-- Right side - Featured products preview -->
                    <div class="flex-1 max-w-md">
                        <div class="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 class="text-xl font-bold mb-4 text-center">🔥 Sản phẩm hot</h3>
                            <div class="grid grid-cols-2 gap-3">
                                ${flashSale.san_pham.slice(0, 4).map(product => `
                                    <a href="product-detail.html?id=${product.san_pham_id}" 
                                       class="bg-white rounded-lg p-2 hover:shadow-lg transition group">
                                        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                                            ${product.url_hinh_anh_chinh ? `
                                                <img src="http://localhost:3001${product.url_hinh_anh_chinh}" 
                                                     alt="${product.ten_san_pham}" 
                                                     class="w-full h-full object-cover group-hover:scale-105 transition-transform">
                                            ` : `
                                                <div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    Hình ảnh
                                                </div>
                                            `}
                                        </div>
                                        <div class="text-xs text-gray-800 font-medium line-clamp-2 mb-1">
                                            ${product.ten_san_pham}
                                        </div>
                                        <div class="text-center">
                                            <div class="text-xs text-gray-500 line-through">${formatCurrency(product.gia_ban)}</div>
                                            <div class="text-sm font-bold text-red-600">${formatCurrency(product.gia_flash_sale)}</div>
                                        </div>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Show the section
    section.classList.remove('hidden');
    
    // Start countdown
    startCountdown(endTime);
}

// Hide flash sale banner
function hideFlashSale() {
    const section = document.getElementById('flash-sale-section');
    if (section) {
        section.classList.add('hidden');
    }
    
    if (flashSaleInterval) {
        clearInterval(flashSaleInterval);
    }
}

// Start countdown timer
function startCountdown(endTime) {
    if (flashSaleInterval) {
        clearInterval(flashSaleInterval);
    }
    
    flashSaleInterval = setInterval(() => {
        const now = new Date();
        const timeRemaining = endTime - now;
        
        if (timeRemaining <= 0) {
            hideFlashSale();
            return;
        }
        
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (hoursEl) hoursEl.querySelector('div').textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.querySelector('div').textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.querySelector('div').textContent = seconds.toString().padStart(2, '0');
    }, 1000);
}

// Scroll to flash sale products
function scrollToFlashSaleProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load flash sale when page loads
if (document.getElementById('flash-sale-section')) {
    document.addEventListener('DOMContentLoaded', loadFlashSale);
    
    // Refresh flash sale every 5 minutes
    setInterval(loadFlashSale, 5 * 60 * 1000);
}