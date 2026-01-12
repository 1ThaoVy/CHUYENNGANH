// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const API_URL = API_BASE_URL; // Backward compatibility

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, requireAuth = false) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    // Always add token if available, or if requireAuth is true
    if (token && (requireAuth || token)) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method: method,
        headers: headers
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        const responseData = await response.json();

        if (!response.ok) {
            // Handle authentication errors
            if (response.status === 401 && requireAuth) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '../login.html';
                return;
            }
            throw new Error(responseData.message || 'Có lỗi xảy ra');
        }

        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Format currency
function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('vi-VN') + 'đ';
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}
