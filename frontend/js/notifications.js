// Notifications Management
class NotificationsManager {
    constructor() {
        this.currentPage = 1;
        this.limit = 10;
        this.init();
    }

    async init() {
        if (this.isUserLoggedIn()) {
            await this.loadNotifications();
            await this.loadNotificationCount();
            this.showNotificationMenu();
        }
    }

    isUserLoggedIn() {
        return localStorage.getItem('token') && localStorage.getItem('user');
    }

    showNotificationMenu() {
        const notificationMenu = document.getElementById('notification-menu');
        if (notificationMenu) {
            notificationMenu.classList.remove('hidden');
        }
    }

    async loadNotificationCount() {
        try {
            const response = await apiCall('/notifications?limit=1', 'GET', null, true);
            
            if (response.success) {
                this.updateNotificationCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading notification count:', error);
        }
    }

    updateNotificationCount(count) {
        const countElement = document.getElementById('notification-count');
        if (countElement) {
            if (count > 0) {
                countElement.textContent = count > 99 ? '99+' : count;
                countElement.classList.remove('hidden');
            } else {
                countElement.classList.add('hidden');
            }
        }
    }

    async loadNotifications(page = 1) {
        try {
            const response = await apiCall(`/notifications?page=${page}&limit=${this.limit}`, 'GET', null, true);
            
            if (response.success) {
                this.displayNotifications(response.data.notifications);
                this.displayPagination(response.data.pagination);
                this.updateNotificationCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    async loadNotificationsDropdown() {
        try {
            const response = await apiCall('/notifications?limit=5', 'GET', null, true);
            
            if (response.success) {
                this.displayNotificationsDropdown(response.data.notifications);
                this.updateNotificationCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error loading notifications dropdown:', error);
        }
    }

    displayNotifications(notifications) {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                    <p>Không có thông báo nào</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notifications.map(notification => `
            <div class="p-4 ${notification.da_doc ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg border-l-4 ${notification.da_doc ? 'border-gray-300' : 'border-blue-500'}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            ${!notification.da_doc ? '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>' : ''}
                            <h4 class="font-semibold text-gray-900">${notification.tieu_de}</h4>
                            <span class="text-xs px-2 py-1 rounded-full ${this.getNotificationTypeBadge(notification.loai_thong_bao)}">${this.getNotificationTypeText(notification.loai_thong_bao)}</span>
                        </div>
                        <p class="text-sm text-gray-700 mb-2">${notification.noi_dung}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">${this.formatDate(notification.ngay_tao)}</span>
                            <div class="flex items-center space-x-2">
                                ${notification.lien_he_id ? `
                                    <button onclick="notificationsManager.viewContactReply(${notification.lien_he_id})" 
                                            class="text-xs text-primary hover:text-primary/80">
                                        Xem chi tiết
                                    </button>
                                ` : ''}
                                ${!notification.da_doc ? `
                                    <button onclick="notificationsManager.markAsRead(${notification.thong_bao_id})" 
                                            class="text-xs text-blue-600 hover:text-blue-800">
                                        Đánh dấu đã đọc
                                    </button>
                                ` : ''}
                                <button onclick="notificationsManager.deleteNotification(${notification.thong_bao_id})" 
                                        class="text-xs text-red-600 hover:text-red-800">
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayNotificationsDropdown(notifications) {
        const container = document.querySelector('#notifications-dropdown #notifications-list');
        if (!container) return;

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <p>Không có thông báo mới</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notifications.map(notification => `
            <div class="p-4 hover:bg-gray-50 border-b border-gray-100 ${!notification.da_doc ? 'bg-blue-50' : ''} cursor-pointer"
                 onclick="notificationsManager.viewNotificationDetail(${notification.thong_bao_id})">
                <div class="flex items-start space-x-3">
                    ${!notification.da_doc ? '<div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>' : '<div class="w-2 h-2"></div>'}
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">${notification.tieu_de}</p>
                        <p class="text-sm text-gray-600 truncate">${notification.noi_dung}</p>
                        <p class="text-xs text-gray-500 mt-1">${this.formatDate(notification.ngay_tao)}</p>
                    </div>
                </div>
            </div>
        `).join('') + `
            <div class="p-4 text-center border-t">
                <a href="profile.html" onclick="showNotificationsSection()" class="text-sm text-primary hover:text-primary/80 font-medium">
                    Xem tất cả thông báo
                </a>
            </div>
        `;
    }

    displayPagination(pagination) {
        const container = document.getElementById('notifications-pagination');
        if (!container || pagination.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="flex items-center justify-between">';
        
        // Info
        paginationHTML += `
            <div class="text-sm text-gray-700">
                Hiển thị ${((pagination.page - 1) * pagination.limit) + 1} - 
                ${Math.min(pagination.page * pagination.limit, pagination.total)} 
                trong tổng số ${pagination.total} thông báo
            </div>
        `;
        
        // Pagination buttons
        paginationHTML += '<div class="flex space-x-2">';
        
        // Previous button
        if (pagination.page > 1) {
            paginationHTML += `
                <button onclick="notificationsManager.changePage(${pagination.page - 1})" 
                        class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Trước
                </button>
            `;
        }
        
        // Page numbers
        for (let i = Math.max(1, pagination.page - 2); i <= Math.min(pagination.totalPages, pagination.page + 2); i++) {
            const isActive = i === pagination.page;
            paginationHTML += `
                <button onclick="notificationsManager.changePage(${i})" 
                        class="px-3 py-2 text-sm ${isActive ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 rounded-lg">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        if (pagination.page < pagination.totalPages) {
            paginationHTML += `
                <button onclick="notificationsManager.changePage(${pagination.page + 1})" 
                        class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Sau
                </button>
            `;
        }
        
        paginationHTML += '</div></div>';
        container.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPage = page;
        this.loadNotifications(page);
    }

    async markAsRead(notificationId) {
        try {
            const response = await apiCall(`/notifications/${notificationId}/read`, 'PUT', null, true);
            
            if (response.success) {
                this.loadNotifications(this.currentPage);
                this.loadNotificationCount();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            const response = await apiCall('/notifications/read-all', 'PUT', null, true);
            
            if (response.success) {
                this.loadNotifications(this.currentPage);
                this.loadNotificationCount();
                this.loadNotificationsDropdown();
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }

    async deleteNotification(notificationId) {
        if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;

        try {
            const response = await apiCall(`/notifications/${notificationId}`, 'DELETE', null, true);
            
            if (response.success) {
                this.loadNotifications(this.currentPage);
                this.loadNotificationCount();
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    async viewContactReply(lienHeId) {
        try {
            const response = await apiCall(`/notifications/contact-reply/${lienHeId}`, 'GET', null, true);
            
            if (response.success) {
                this.showContactReplyModal(response.data);
            }
        } catch (error) {
            console.error('Error loading contact reply:', error);
        }
    }

    showContactReplyModal(data) {
        const { message, replies } = data;
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('contact-reply-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'contact-reply-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-50';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center p-6 border-b">
                        <h3 class="text-xl font-semibold text-gray-900">Phản hồi liên hệ</h3>
                        <button onclick="notificationsManager.closeContactReplyModal()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <!-- Original Message -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold text-gray-900 mb-2">Tin nhắn gốc của bạn:</h4>
                            <div class="text-sm text-gray-700">
                                <p><strong>Chủ đề:</strong> ${message.chu_de || 'Câu hỏi chung'}</p>
                                <p class="mt-2">${message.noi_dung}</p>
                                <p class="text-xs text-gray-500 mt-2">Gửi lúc: ${this.formatDate(message.ngay_tao)}</p>
                            </div>
                        </div>

                        <!-- Replies -->
                        ${replies.length > 0 ? `
                            <div>
                                <h4 class="font-semibold text-gray-900 mb-4">Phản hồi từ chúng tôi:</h4>
                                <div class="space-y-4">
                                    ${replies.map(reply => `
                                        <div class="bg-blue-50 rounded-lg p-4">
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-sm font-medium text-blue-900">${reply.ten_admin}</span>
                                                <span class="text-xs text-blue-600">${this.formatDate(reply.ngay_phan_hoi)}</span>
                                            </div>
                                            <p class="text-sm text-blue-800">${reply.noi_dung_phan_hoi}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : '<p class="text-gray-500">Chưa có phản hồi nào.</p>'}
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    closeContactReplyModal() {
        const modal = document.getElementById('contact-reply-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    viewNotificationDetail(notificationId) {
        // Đánh dấu đã đọc và chuyển đến trang profile
        this.markAsRead(notificationId);
        
        // Lưu ID thông báo để highlight trong trang profile
        localStorage.setItem('selectedNotificationId', notificationId);
        
        // Chuyển đến trang profile
        window.location.href = 'profile.html';
    }

    getNotificationTypeBadge(type) {
        const badges = {
            'lien_he': 'bg-blue-100 text-blue-800',
            'don_hang': 'bg-green-100 text-green-800',
            'he_thong': 'bg-gray-100 text-gray-800'
        };
        return badges[type] || badges['he_thong'];
    }

    getNotificationTypeText(type) {
        const texts = {
            'lien_he': 'Liên hệ',
            'don_hang': 'Đơn hàng',
            'he_thong': 'Hệ thống'
        };
        return texts[type] || 'Hệ thống';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString('vi-VN');
    }
}

// Global functions
function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            notificationsManager.loadNotificationsDropdown();
        }
    }
}

function markAllNotificationsAsRead() {
    notificationsManager.markAllAsRead();
}

function showNotificationsSection() {
    // Function để hiển thị section thông báo trong profile
    if (typeof showSection === 'function') {
        showSection('notifications');
    }
}

// Initialize notifications manager
let notificationsManager;
document.addEventListener('DOMContentLoaded', function() {
    notificationsManager = new NotificationsManager();
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('notifications-dropdown');
    const button = document.querySelector('#notification-menu button');
    
    if (dropdown && !dropdown.contains(e.target) && !button.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});