// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const userMenu = document.getElementById('user-menu');
    const guestMenu = document.getElementById('guest-menu');
    const userName = document.getElementById('user-name');
    const userAvatarNav = document.getElementById('user-avatar-nav');

    if (token && user) {
        if (userMenu) userMenu.classList.remove('hidden');
        if (guestMenu) guestMenu.classList.add('hidden');
        
        // Update user name
        if (userName) {
            const displayName = user.ho_ten || user.fullname || user.email || 'Người dùng';
            userName.textContent = displayName;
        }
        
        // Update avatar
        if (userAvatarNav) {
            const displayName = user.ho_ten || user.fullname || user.email || 'U';
            userAvatarNav.textContent = displayName.charAt(0).toUpperCase();
        }
        
        // Show admin link if user is admin
        const adminLink = document.getElementById('admin-link');
        if (adminLink && user.vai_tro === 'admin') {
            adminLink.classList.remove('hidden');
        }
    } else {
        if (userMenu) userMenu.classList.add('hidden');
        if (guestMenu) guestMenu.classList.remove('hidden');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Require auth for protected pages
function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để tiếp tục');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', checkAuth);
