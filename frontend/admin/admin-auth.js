// Check admin authentication
const user = JSON.parse(localStorage.getItem('user') || '{}');
const token = localStorage.getItem('token');

// Redirect to login if not authenticated or not admin
if (!token || !user || user.vai_tro !== 'admin') {
    alert('Bạn cần đăng nhập với tài khoản admin để truy cập trang này');
    window.location.href = '../login.html';
}

// Display admin name
const adminNameEl = document.getElementById('admin-name');
if (adminNameEl) {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    adminNameEl.textContent = currentUser.ho_ten || 'Admin';
}

// API call function for admin pages (only if not already defined)
if (typeof apiCall === 'undefined') {
    async function apiCall(endpoint, method = 'GET', data = null, requireAuth = false) {
        const API_BASE_URL = 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };

        if (requireAuth && token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        const url = `${API_BASE_URL}${endpoint}`;
        console.log('🔧 API Call:', method, url);
        console.log('🔧 Headers:', headers);
        if (data) console.log('🔧 Data:', data);

        try {
            const response = await fetch(url, config);
            console.log('🔧 Response status:', response.status);
            
            const result = await response.json();
            console.log('🔧 Response data:', result);
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            
            return result;
        } catch (error) {
            console.error('❌ API call error:', error);
            throw error;
        }
    }
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
}
