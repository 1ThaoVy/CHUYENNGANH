// Profile page functionality
let isEditing = false;

// Load user profile data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
});

// Load user profile from localStorage or API
function loadUserProfile() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
            // Redirect to login if not authenticated
            console.log('No user found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        console.log('User found:', user);
        
        // Update UI with user data
        updateProfileUI(user);
        
        // Load additional profile data from API if needed
        const userId = user.nguoi_dung_id || user.id;
        if (userId) {
            fetchUserProfile(userId);
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // If there's an error, still try to show login
        window.location.href = 'login.html';
    }
}

// Update UI with user data
function updateProfileUI(user) {
    // Update sidebar
    const displayName = user.ho_ten || user.fullname || user.email || 'Người dùng';
    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarEmail = document.getElementById('sidebar-email');
    
    if (sidebarUsername) sidebarUsername.textContent = displayName;
    if (sidebarEmail) sidebarEmail.textContent = user.email || '';
    
    // Update avatar
    const avatar = document.getElementById('user-avatar');
    if (avatar) {
        avatar.textContent = displayName.charAt(0).toUpperCase();
    }
    
    // Update form fields
    const fullnameField = document.getElementById('fullname');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const addressField = document.getElementById('address');
    
    if (fullnameField) fullnameField.value = user.ho_ten || user.fullname || '';
    if (emailField) emailField.value = user.email || '';
    if (phoneField) phoneField.value = user.so_dien_thoai || user.phone || '';
    if (addressField) addressField.value = user.dia_chi || user.address || '';
}

// Fetch user profile from API
async function fetchUserProfile(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const userData = await response.json();
            updateProfileUI(userData);
            
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(userData));
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

// Show different sections
function showSection(sectionName) {
    // Hide all sections
    document.getElementById('personal-info-section').classList.add('hidden');
    document.getElementById('change-password-section').classList.add('hidden');
    document.getElementById('notifications-section').classList.add('hidden');
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.remove('hidden');
    
    // Update sidebar active state
    const menuItems = document.querySelectorAll('nav a');
    menuItems.forEach(item => {
        item.classList.remove('bg-orange-50', 'text-orange-600', 'font-semibold');
        item.classList.add('text-gray-700');
    });
    
    // Add active state to clicked item
    event.target.classList.add('bg-orange-50', 'text-orange-600', 'font-semibold');
    event.target.classList.remove('text-gray-700');
}

// Toggle edit mode for personal info
function toggleEdit() {
    isEditing = !isEditing;
    
    const fields = ['fullname', 'phone', 'address'];
    const editBtn = document.getElementById('edit-btn');
    const formActions = document.getElementById('form-actions');
    
    if (isEditing) {
        // Enable editing
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.disabled = false;
            field.classList.remove('bg-gray-100');
            field.classList.add('bg-white');
        });
        
        editBtn.textContent = 'Hủy';
        editBtn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
        editBtn.classList.add('bg-gray-500', 'hover:bg-gray-600');
        formActions.classList.remove('hidden');
    } else {
        // Disable editing
        cancelEdit();
    }
}

// Cancel edit mode
function cancelEdit() {
    isEditing = false;
    
    const fields = ['fullname', 'phone', 'address'];
    const editBtn = document.getElementById('edit-btn');
    const formActions = document.getElementById('form-actions');
    
    // Disable fields
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.disabled = true;
        field.classList.add('bg-gray-100');
        field.classList.remove('bg-white');
    });
    
    // Reset button
    editBtn.textContent = 'Chỉnh sửa';
    editBtn.classList.add('bg-orange-500', 'hover:bg-orange-600');
    editBtn.classList.remove('bg-gray-500', 'hover:bg-gray-600');
    formActions.classList.add('hidden');
    
    // Reload original data
    const user = JSON.parse(localStorage.getItem('user'));
    updateProfileUI(user);
}

// Handle profile form submission
document.getElementById('profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        fullname: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const updatedUser = await response.json();
            
            // Update localStorage
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const newUser = { ...currentUser, ...updatedUser };
            localStorage.setItem('user', JSON.stringify(newUser));
            
            // Update UI
            updateProfileUI(newUser);
            
            // Exit edit mode
            cancelEdit();
            
            // Show success message
            showNotification('Cập nhật thông tin thành công!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Có lỗi xảy ra khi cập nhật thông tin', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Có lỗi xảy ra khi cập nhật thông tin', 'error');
    }
});

// Handle password change form
document.getElementById('password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        if (response.ok) {
            // Clear form
            document.getElementById('password-form').reset();
            showNotification('Đổi mật khẩu thành công!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Có lỗi xảy ra khi đổi mật khẩu', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Có lỗi xảy ra khi đổi mật khẩu', 'error');
    }
});

// Change avatar function (placeholder)
function changeAvatar() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Here you would typically upload the file to your server
            // For now, we'll just show a placeholder message
            showNotification('Tính năng đổi avatar sẽ được cập nhật sớm!', 'info');
        }
    };
    
    input.click();
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}