// Contact Messages Management
class ContactMessagesManager {
    constructor() {
        this.currentPage = 1;
        this.limit = 10;
        this.currentFilter = '';
        this.init();
    }

    async init() {
        await this.loadStats();
        await this.loadMessages();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Status filter change
        document.getElementById('status-filter').addEventListener('change', () => {
            this.currentPage = 1;
            this.loadMessages();
        });
    }

    async loadStats() {
        try {
            const response = await apiCall('/contact/stats', 'GET', null, true);
            
            if (response.success) {
                this.updateStatsDisplay(response.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        // Update status stats
        let totalMessages = 0;
        let unreadMessages = 0;
        let repliedMessages = 0;

        stats.statusStats.forEach(stat => {
            totalMessages += stat.so_luong;
            if (stat.trang_thai === 'moi') {
                unreadMessages = stat.so_luong;
            } else if (stat.trang_thai === 'da_phan_hoi') {
                repliedMessages = stat.so_luong;
            }
        });

        document.getElementById('total-messages').textContent = totalMessages;
        document.getElementById('unread-messages').textContent = unreadMessages;
        document.getElementById('replied-messages').textContent = repliedMessages;

        // Update monthly stats (current month)
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyData = stats.monthlyStats.find(m => m.thang === currentMonth);
        document.getElementById('monthly-messages').textContent = monthlyData ? monthlyData.so_luong : 0;
    }

    async loadMessages() {
        try {
            const statusFilter = document.getElementById('status-filter').value;
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.limit
            });

            if (statusFilter) {
                params.append('trang_thai', statusFilter);
            }

            const response = await apiCall(`/contact?${params}`, 'GET', null, true);
            
            if (response.success) {
                this.displayMessages(response.data.messages);
                this.displayPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.showError('Lỗi tải danh sách tin nhắn');
        }
    }

    displayMessages(messages) {
        const tbody = document.getElementById('messages-table');
        
        if (messages.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        Không có tin nhắn nào
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = messages.map(message => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${message.ho_ten}</div>
                        <div class="text-sm text-gray-500">${message.email}</div>
                        ${message.ten_nguoi_dung ? `<div class="text-xs text-blue-600">Thành viên: ${message.ten_nguoi_dung}</div>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${message.chu_de || 'Câu hỏi chung'}</div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">${message.noi_dung}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${this.getStatusBadge(message.trang_thai)}
                    ${message.so_phan_hoi > 0 ? `<div class="text-xs text-gray-500 mt-1">${message.so_phan_hoi} phản hồi</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatDate(message.ngay_tao)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="contactManager.viewMessage(${message.lien_he_id})" 
                            class="text-primary hover:text-primary/80 mr-3">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button onclick="contactManager.replyMessage(${message.lien_he_id})" 
                            class="text-green-600 hover:text-green-800">
                        <i class="fas fa-reply"></i> Phản hồi
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getStatusBadge(status) {
        const badges = {
            'moi': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Mới</span>',
            'da_doc': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Đã đọc</span>',
            'da_phan_hoi': '<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã phản hồi</span>'
        };
        return badges[status] || badges['moi'];
    }

    displayPagination(pagination) {
        const paginationDiv = document.getElementById('pagination');
        
        if (pagination.totalPages <= 1) {
            paginationDiv.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="flex items-center justify-between">';
        
        // Info
        paginationHTML += `
            <div class="text-sm text-gray-700">
                Hiển thị ${((pagination.page - 1) * pagination.limit) + 1} - 
                ${Math.min(pagination.page * pagination.limit, pagination.total)} 
                trong tổng số ${pagination.total} tin nhắn
            </div>
        `;
        
        // Pagination buttons
        paginationHTML += '<div class="flex space-x-2">';
        
        // Previous button
        if (pagination.page > 1) {
            paginationHTML += `
                <button onclick="contactManager.changePage(${pagination.page - 1})" 
                        class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Trước
                </button>
            `;
        }
        
        // Page numbers
        for (let i = Math.max(1, pagination.page - 2); i <= Math.min(pagination.totalPages, pagination.page + 2); i++) {
            const isActive = i === pagination.page;
            paginationHTML += `
                <button onclick="contactManager.changePage(${i})" 
                        class="px-3 py-2 text-sm ${isActive ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300 rounded-lg">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        if (pagination.page < pagination.totalPages) {
            paginationHTML += `
                <button onclick="contactManager.changePage(${pagination.page + 1})" 
                        class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Sau
                </button>
            `;
        }
        
        paginationHTML += '</div></div>';
        paginationDiv.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPage = page;
        this.loadMessages();
    }

    async viewMessage(messageId) {
        try {
            const response = await apiCall(`/contact/${messageId}`, 'GET', null, true);
            
            if (response.success) {
                this.showMessageModal(response.data);
            }
        } catch (error) {
            console.error('Error loading message detail:', error);
            this.showError('Lỗi tải chi tiết tin nhắn');
        }
    }

    showMessageModal(data) {
        const { message, replies } = data;
        
        let modalContent = `
            <div class="space-y-6">
                <!-- Message Info -->
                <div class="bg-gray-50 rounded-lg p-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Người gửi</label>
                            <p class="text-sm text-gray-900">${message.ho_ten}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <p class="text-sm text-gray-900">${message.email}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <p class="text-sm text-gray-900">${message.so_dien_thoai || 'Không có'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Chủ đề</label>
                            <p class="text-sm text-gray-900">${message.chu_de || 'Câu hỏi chung'}</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700">Nội dung</label>
                        <p class="text-sm text-gray-900 mt-1 whitespace-pre-wrap">${message.noi_dung}</p>
                    </div>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-xs text-gray-500">Gửi lúc: ${this.formatDate(message.ngay_tao)}</span>
                        ${this.getStatusBadge(message.trang_thai)}
                    </div>
                </div>

                <!-- Replies -->
                ${replies.length > 0 ? `
                    <div>
                        <h4 class="text-lg font-medium text-gray-900 mb-4">Phản hồi (${replies.length})</h4>
                        <div class="space-y-4">
                            ${replies.map(reply => `
                                <div class="bg-blue-50 rounded-lg p-4">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-medium text-blue-900">${reply.ten_admin}</span>
                                        <span class="text-xs text-blue-600">${this.formatDate(reply.ngay_phan_hoi)}</span>
                                    </div>
                                    <p class="text-sm text-blue-800 whitespace-pre-wrap">${reply.noi_dung_phan_hoi}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Reply Form -->
                <div>
                    <h4 class="text-lg font-medium text-gray-900 mb-4">Gửi phản hồi</h4>
                    <form id="reply-form" onsubmit="contactManager.submitReply(event, ${message.lien_he_id})">
                        <div class="mb-4">
                            <textarea id="reply-content" name="noi_dung_phan_hoi" rows="4" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Nhập nội dung phản hồi..." required></textarea>
                        </div>
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="closeMessageModal()" 
                                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                Đóng
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                                <i class="fas fa-paper-plane mr-2"></i>
                                Gửi phản hồi
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('message-content').innerHTML = modalContent;
        document.getElementById('message-modal').classList.remove('hidden');
    }

    async submitReply(event, messageId) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const replyData = {
            noi_dung_phan_hoi: formData.get('noi_dung_phan_hoi')
        };

        try {
            const response = await apiCall(`/contact/${messageId}/reply`, 'POST', replyData, true);
            
            if (response.success) {
                this.showSuccess('Phản hồi thành công!');
                this.closeMessageModal();
                this.loadMessages();
                this.loadStats();
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
            this.showError('Lỗi gửi phản hồi: ' + error.message);
        }
    }

    replyMessage(messageId) {
        this.viewMessage(messageId);
    }

    closeMessageModal() {
        document.getElementById('message-modal').classList.add('hidden');
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleString('vi-VN');
    }

    showSuccess(message) {
        alert(message); // Replace with better notification system
    }

    showError(message) {
        alert(message); // Replace with better notification system
    }
}

// Global functions
function closeMessageModal() {
    contactManager.closeMessageModal();
}

function loadMessages() {
    contactManager.loadMessages();
}

// Initialize when DOM is loaded
let contactManager;
document.addEventListener('DOMContentLoaded', function() {
    contactManager = new ContactMessagesManager();
});