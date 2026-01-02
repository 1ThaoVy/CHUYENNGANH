// API Configuration
const API_URL = 'http://localhost:3001/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, requireAuth = false) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token || requireAuth) {
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
        const response = await fetch(`${API_URL}${endpoint}`, options);

        const responseData = await response.json();

        if (!response.ok) {
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
