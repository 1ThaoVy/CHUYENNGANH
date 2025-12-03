// Check admin authentication
const user = JSON.parse(localStorage.getItem('user') || '{}');
const token = localStorage.getItem('token');

if (!token || !user || user.vai_tro !== 'admin') {
    alert('Bạn không có quyền truy cập trang này!');
    window.location.href = '../login.html';
}

// Display admin name
const adminNameEl = document.getElementById('admin-name');
if (adminNameEl) {
    adminNameEl.textContent = user.ho_ten || 'Admin';
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../index.html';
    }
}
