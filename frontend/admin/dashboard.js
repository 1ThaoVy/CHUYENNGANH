// Load dashboard data
async function loadDashboard() {
    try {
        // Load products count
        const productsRes = await apiCall('/products?limit=1');
        document.getElementById('total-products').textContent = productsRes.pagination.total;

        // Placeholder data - you can replace with real API calls
        document.getElementById('new-orders').textContent = '12';
        document.getElementById('revenue').textContent = '125,000,000đ';
        document.getElementById('total-customers').textContent = '248';

        // Load recent orders
        loadRecentOrders();
        
        // Load top products
        loadTopProducts();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadRecentOrders() {
    try {
        // This would need an admin endpoint to get all orders
        // For now, showing placeholder
        document.getElementById('recent-orders').innerHTML = `
            <div class="flex items-center justify-between py-2 border-b">
                <div>
                    <p class="font-medium">#DH001</p>
                    <p class="text-sm text-gray-500">Nguyễn Văn A</p>
                </div>
                <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Chờ xử lý</span>
            </div>
            <div class="flex items-center justify-between py-2 border-b">
                <div>
                    <p class="font-medium">#DH002</p>
                    <p class="text-sm text-gray-500">Trần Thị B</p>
                </div>
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Đã xác nhận</span>
            </div>
            <div class="flex items-center justify-between py-2">
                <div>
                    <p class="font-medium">#DH003</p>
                    <p class="text-sm text-gray-500">Lê Văn C</p>
                </div>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Hoàn thành</span>
            </div>
        `;
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadTopProducts() {
    try {
        const data = await apiCall('/products?limit=5&sort=moi_nhat');
        
        document.getElementById('top-products').innerHTML = data.data.map(product => `
            <div class="flex items-center justify-between py-2 border-b">
                <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-200 rounded"></div>
                    <div>
                        <p class="font-medium text-sm">${product.ten_san_pham}</p>
                        <p class="text-xs text-gray-500">${product.ten_danh_muc}</p>
                    </div>
                </div>
                <span class="text-sm font-bold text-primary">${formatCurrency(product.gia_ban)}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

loadDashboard();
