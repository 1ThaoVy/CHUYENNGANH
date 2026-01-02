// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting dashboard...');
    loadDashboard();
    initGlobalRevenueFilter();
});

// Initialize global revenue filter
function initGlobalRevenueFilter() {
    const globalFilter = document.getElementById('global-revenue-filter');
    if (globalFilter) {
        globalFilter.addEventListener('change', function() {
            updateAllRevenueCharts(this.value);
        });
        
        // Load default charts (monthly)
        updateAllRevenueCharts('month');
    }
}

// Update all revenue charts based on global filter
async function updateAllRevenueCharts(period) {
    try {
        console.log(`🔄 Loading revenue data for period: ${period}`);
        // Fetch real revenue data from API
        const revenueData = await apiCall(`/dashboard/revenue?period=${period}`);
        console.log('📈 Revenue data received:', revenueData);
        const chartData = revenueData.data;
        
        let periodText = '';
        let title = '';
        
        switch(period) {
            case 'day':
                periodText = 'ngày';
                title = '7 ngày qua';
                break;
            case 'week':
                periodText = 'tuần';
                title = '4 tuần qua';
                break;
            case 'month':
                periodText = 'tháng';
                title = '12 tháng qua';
                break;
            case 'year':
                periodText = 'năm';
                title = '5 năm qua';
                break;
        }
        
        // Update main revenue chart
        updateMainRevenueChart(chartData, periodText);
        
        // Update detailed revenue chart
        updateDetailedRevenueChart(chartData, periodText, title);
        
        // Update chart titles
        document.getElementById('revenue-chart-title').textContent = `Doanh thu ${title}`;
        document.getElementById('detailed-revenue-title').textContent = `Chi tiết doanh thu theo ${periodText}`;
        
        // Update last updated time
        document.getElementById('last-updated').textContent = new Date().toLocaleString('vi-VN');
        
        console.log('✅ Revenue charts updated successfully');
        
    } catch (error) {
        console.error('❌ Error loading revenue data:', error);
        console.log('🔄 Using fallback static data...');
        // Fallback to static data if API fails
        updateAllRevenueChartsStatic(period);
    }
}

// Fallback static data function
function updateAllRevenueChartsStatic(period) {
    let chartData = {};
    let totalRevenue = 0;
    let periodText = '';
    
    switch(period) {
        case 'day':
            chartData = {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                data: [12, 19, 15, 25, 22, 30, 28],
                unit: 'M',
                title: '7 ngày qua'
            };
            periodText = 'ngày';
            break;
            
        case 'week':
            chartData = {
                labels: ['T1', 'T2', 'T3', 'T4'],
                data: [85, 92, 78, 95],
                unit: 'M',
                title: '4 tuần qua'
            };
            periodText = 'tuần';
            break;
            
        case 'month':
            chartData = {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                data: [15, 18, 22, 25, 28, 32, 29, 31, 34, 37, 35, 40],
                unit: 'M',
                title: '12 tháng qua'
            };
            periodText = 'tháng';
            break;
            
        case 'year':
            chartData = {
                labels: ['2020', '2021', '2022', '2023', '2024'],
                data: [280, 320, 365, 420, 485],
                unit: 'M',
                title: '5 năm qua'
            };
            periodText = 'năm';
            break;
    }
    
    totalRevenue = chartData.data.reduce((a, b) => a + b, 0);
    
    // Update main revenue chart
    updateMainRevenueChart(chartData, periodText);
    
    // Update detailed revenue chart
    updateDetailedRevenueChart(chartData, periodText, chartData.title);
    
    // Update chart titles
    document.getElementById('revenue-chart-title').textContent = `Doanh thu ${chartData.title}`;
    document.getElementById('detailed-revenue-title').textContent = `Chi tiết doanh thu theo ${periodText}`;
    
    // Update last updated time
    document.getElementById('last-updated').textContent = new Date().toLocaleString('vi-VN');
}

// Update main revenue chart (top chart)
function updateMainRevenueChart(chartData, periodText) {
    const chartContainer = document.getElementById('main-revenue-chart');
    
    // Handle both API data and static data formats
    let labels, data, unit;
    
    if (chartData.labels && chartData.data) {
        // API format
        labels = chartData.labels;
        data = chartData.data;
        unit = 'M';
    } else {
        // Static format (fallback)
        labels = chartData.labels || [];
        data = chartData.data || [];
        unit = chartData.unit || 'M';
    }
    
    if (data.length === 0) {
        chartContainer.innerHTML = '<div class="flex items-center justify-center h-64 text-gray-500">Không có dữ liệu</div>';
        return;
    }
    
    const maxValue = Math.max(...data);
    
    const chartHTML = data.map((value, index) => {
        const height = maxValue > 0 ? (value / maxValue) * 180 : 0; // Max height 180px
        return `
            <div class="flex flex-col items-center">
                <div class="bg-blue-500 rounded-t w-8 mb-2 transition-all duration-500 hover:bg-blue-600" 
                     style="height: ${height}px;" 
                     title="${labels[index]}: ${value}${unit} VNĐ"></div>
                <span class="text-xs text-gray-600">${labels[index]}</span>
                <span class="text-xs font-bold">${value}${unit}</span>
            </div>
        `;
    }).join('');
    
    chartContainer.innerHTML = chartHTML;
}

// Update detailed revenue chart (bottom chart)
function updateDetailedRevenueChart(chartData, periodText, title) {
    const chartContainer = document.getElementById('detailed-revenue-chart');
    const totalRevenueEl = document.getElementById('detailed-total-revenue');
    
    // Handle both API data and static data formats
    let labels, data, unit;
    
    if (chartData.labels && chartData.data) {
        // API format
        labels = chartData.labels;
        data = chartData.data;
        unit = 'M';
    } else {
        // Static format (fallback)
        labels = chartData.labels || [];
        data = chartData.data || [];
        unit = chartData.unit || 'M';
    }
    
    if (data.length === 0) {
        chartContainer.innerHTML = '<div class="flex items-center justify-center h-48 text-gray-500">Không có dữ liệu</div>';
        return;
    }
    
    const maxValue = Math.max(...data);
    const totalRevenue = data.reduce((a, b) => a + b, 0);
    
    // Update total revenue display
    if (totalRevenueEl) {
        totalRevenueEl.textContent = `${totalRevenue}${unit} VNĐ`;
    }
    
    const chartHTML = `
        <div class="flex justify-between items-end h-48 space-x-2">
            ${data.map((value, index) => {
                const height = maxValue > 0 ? (value / maxValue) * 180 : 0; // Max height 180px
                return `
                    <div class="flex flex-col items-center space-y-1">
                        <div class="bg-gradient-to-t from-primary to-blue-400 rounded-t w-8 transition-all duration-500 hover:from-blue-500 hover:to-blue-300" 
                             style="height: ${height}px;" 
                             title="${labels[index]}: ${value}${unit} VNĐ"></div>
                        <span class="text-xs text-gray-600">${labels[index]}</span>
                        <span class="text-xs font-bold">${value}${unit}</span>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="mt-4 text-center">
            <div class="inline-flex items-center space-x-4 text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 bg-gradient-to-t from-primary to-blue-400 rounded"></div>
                    <span>Doanh thu chi tiết (${title || 'theo ' + periodText})</span>
                </div>
                <div class="text-primary font-semibold">
                    Tổng: <span id="detailed-total-revenue">${totalRevenue}${unit} VNĐ</span>
                </div>
            </div>
        </div>
    `;
    
    chartContainer.innerHTML = chartHTML;
}

// Load dashboard data
async function loadDashboard() {
    try {
        console.log('Loading dashboard data...');
        
        // Load overview stats from API
        await loadOverviewStats();
        
        // Load recent orders
        await loadRecentOrders();
        
        // Load top products
        await loadTopProducts();
        
        // Load order statistics
        await loadOrderStats();

        console.log('✅ Dashboard loaded successfully!');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to placeholder data if API fails
        loadPlaceholderData();
    }
}

// Load overview statistics
async function loadOverviewStats() {
    try {
        console.log('🔄 Loading overview stats...');
        const data = await apiCall('/dashboard/overview');
        console.log('📊 Overview data received:', data);
        
        document.getElementById('total-products').textContent = data.data.totalProducts;
        document.getElementById('new-orders').textContent = data.data.newOrders;
        document.getElementById('revenue').textContent = formatCurrency(data.data.monthlyRevenue);
        document.getElementById('total-customers').textContent = data.data.totalCustomers;
        
        console.log('✅ Overview stats loaded successfully');
    } catch (error) {
        console.error('❌ Error loading overview stats:', error);
        console.log('🔄 Using fallback data...');
        // Keep placeholder values if API fails
        document.getElementById('total-products').textContent = '156';
        document.getElementById('new-orders').textContent = '12';
        document.getElementById('revenue').textContent = '125,000,000đ';
        document.getElementById('total-customers').textContent = '248';
    }
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const data = await apiCall('/dashboard/recent-orders');
        
        const container = document.getElementById('recent-orders');
        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(order => `
                <div class="flex items-center justify-between py-2 border-b">
                    <div>
                        <p class="font-medium">#${order.don_hang_id}</p>
                        <p class="text-sm text-gray-500">${order.ho_ten}</p>
                        <p class="text-xs text-gray-400">${formatCurrency(order.tong_tien)}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm" style="background-color: ${order.mau_sac}20; color: ${order.mau_sac}">
                        ${order.ten_trang_thai}
                    </span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Chưa có đơn hàng nào</p>';
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        loadPlaceholderOrders();
    }
}

// Load top products
async function loadTopProducts() {
    try {
        const data = await apiCall('/dashboard/top-products');
        
        const container = document.getElementById('top-products');
        if (data.data && data.data.length > 0) {
            container.innerHTML = data.data.map(product => `
                <div class="flex items-center justify-between py-2 border-b">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                            ${product.url_hinh_anh_chinh ? 
                                `<img src="http://localhost:3001${product.url_hinh_anh_chinh}" alt="${product.ten_san_pham}" class="w-full h-full object-cover">` :
                                '<div class="w-full h-full bg-gray-300"></div>'
                            }
                        </div>
                        <div>
                            <p class="font-medium text-sm">${product.ten_san_pham}</p>
                            <p class="text-xs text-gray-500">${product.ten_danh_muc}</p>
                            <p class="text-xs text-primary">Đã bán: ${product.total_sold}</p>
                        </div>
                    </div>
                    <span class="text-sm font-bold text-primary">${formatCurrency(product.gia_ban)}</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">Chưa có dữ liệu bán hàng</p>';
        }
    } catch (error) {
        console.error('Error loading top products:', error);
        loadPlaceholderProducts();
    }
}

// Load order statistics
async function loadOrderStats() {
    try {
        const data = await apiCall('/dashboard/order-stats');
        
        // Update order status chart if needed
        console.log('Order stats loaded:', data.data);
    } catch (error) {
        console.error('Error loading order stats:', error);
    }
}

// Fallback placeholder data
function loadPlaceholderData() {
    document.getElementById('total-products').textContent = '156';
    document.getElementById('new-orders').textContent = '12';
    document.getElementById('revenue').textContent = '125,000,000đ';
    document.getElementById('total-customers').textContent = '248';
    
    loadPlaceholderOrders();
    loadPlaceholderProducts();
}

function loadPlaceholderOrders() {
    document.getElementById('recent-orders').innerHTML = `
        <div class="flex items-center justify-between py-2 border-b">
            <div>
                <p class="font-medium">#DH001</p>
                <p class="text-sm text-gray-500">Nguyễn Văn A</p>
                <p class="text-xs text-gray-400">2,500,000đ</p>
            </div>
            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Chờ xử lý</span>
        </div>
        <div class="flex items-center justify-between py-2 border-b">
            <div>
                <p class="font-medium">#DH002</p>
                <p class="text-sm text-gray-500">Trần Thị B</p>
                <p class="text-xs text-gray-400">3,200,000đ</p>
            </div>
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Đã xác nhận</span>
        </div>
        <div class="flex items-center justify-between py-2">
            <div>
                <p class="font-medium">#DH003</p>
                <p class="text-sm text-gray-500">Lê Văn C</p>
                <p class="text-xs text-gray-400">1,800,000đ</p>
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Hoàn thành</span>
        </div>
    `;
}

function loadPlaceholderProducts() {
    document.getElementById('top-products').innerHTML = `
        <div class="flex items-center justify-between py-2 border-b">
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gray-200 rounded"></div>
                <div>
                    <p class="font-medium text-sm">Chanel N°5</p>
                    <p class="text-xs text-gray-500">Chanel</p>
                    <p class="text-xs text-primary">Đã bán: 45</p>
                </div>
            </div>
            <span class="text-sm font-bold text-primary">3,150,000đ</span>
        </div>
        <div class="flex items-center justify-between py-2 border-b">
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gray-200 rounded"></div>
                <div>
                    <p class="font-medium text-sm">Dior Sauvage</p>
                    <p class="text-xs text-gray-500">Dior</p>
                    <p class="text-xs text-primary">Đã bán: 38</p>
                </div>
            </div>
            <span class="text-sm font-bold text-primary">2,890,000đ</span>
        </div>
    `;
}
