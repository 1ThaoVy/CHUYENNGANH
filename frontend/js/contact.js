// Contact page functionality
class ContactManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadContactInfo();
        this.setupContactForm();
    }

    // Load contact information from settings API
    async loadContactInfo() {
        try {
            // Define API_BASE_URL if not available
            const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3001/api';
            
            const response = await fetch(`${API_BASE_URL}/settings/public`);
            const result = await response.json();
            
            if (result.success && result.data) {
                this.updateContactDisplay(result.data);
            }
        } catch (error) {
            console.error('Error loading contact info:', error);
            // Keep default values if API fails
        }
    }

    // Update contact information display
    updateContactDisplay(settings) {
        // Update address
        const addressElement = document.getElementById('contact-address');
        if (addressElement && settings.dia_chi) {
            addressElement.innerHTML = settings.dia_chi.replace(/\n/g, '<br>');
        }
        
        // Update phone numbers
        const hotlineElement = document.getElementById('contact-hotline');
        if (hotlineElement && settings.hotline) {
            hotlineElement.textContent = settings.hotline;
            hotlineElement.href = `tel:${settings.hotline}`;
        }
        
        const mobileElement = document.getElementById('contact-mobile');
        if (mobileElement && settings.so_dien_thoai) {
            mobileElement.textContent = settings.so_dien_thoai;
            mobileElement.href = `tel:${settings.so_dien_thoai}`;
        }
        
        // Update email
        const emailElement = document.getElementById('contact-email');
        if (emailElement && settings.email) {
            emailElement.textContent = settings.email;
            emailElement.href = `mailto:${settings.email}`;
        }
        
        // Update working hours
        const workingHoursElement = document.getElementById('contact-working-hours');
        if (workingHoursElement && settings.gio_lam_viec) {
            workingHoursElement.innerHTML = settings.gio_lam_viec.replace(/\n/g, '<br>');
        }
    }

    // Setup contact form handling
    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
        }
    }

    // Handle contact form submission
    handleContactSubmit(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Vui lòng nhập email hợp lệ!');
            return;
        }
        
        // In a real application, you would send this to your backend
        this.sendContactMessage(data);
    }

    // Send contact message (placeholder for real implementation)
    async sendContactMessage(data) {
        try {
            // Define API_BASE_URL if not available
            const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3001/api';
            
            // Call API to send contact message
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(localStorage.getItem('token') && {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    })
                },
                body: JSON.stringify({
                    ho_ten: data.name,
                    email: data.email,
                    so_dien_thoai: data.phone,
                    chu_de: data.subject,
                    noi_dung: data.message
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Show success message
                alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
                
                // Reset form
                document.getElementById('contact-form').reset();
            } else {
                throw new Error(result.message || 'Có lỗi xảy ra khi gửi tin nhắn');
            }
            
        } catch (error) {
            console.error('Error sending contact message:', error);
            alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau!');
        }
    }
}

// Initialize contact manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ContactManager();
});