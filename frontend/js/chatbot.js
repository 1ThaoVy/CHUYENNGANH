class OriannaChat {
    constructor() {
        this.isOpen = false;
        this.sessionId = this.generateSessionId();
        this.messages = [];
        this.init();
    }

    generateSessionId() {
        return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        this.createChatWidget();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createChatWidget() {
        const chatHTML = `
            <!-- Chat Button -->
            <div id="chat-button" class="fixed bottom-6 right-6 z-50">
                <button class="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                </button>
                <div class="absolute -top-2 -left-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>

            <!-- Chat Window -->
            <div id="chat-window" class="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-50 hidden flex flex-col">
                <!-- Header -->
                <div class="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span class="text-sm font-bold">O</span>
                        </div>
                        <div>
                            <h3 class="font-semibold">Orianna Assistant</h3>
                            <p class="text-xs opacity-90">Tư vấn nước hoa</p>
                        </div>
                    </div>
                    <button id="chat-close" class="text-white/80 hover:text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Messages -->
                <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    <!-- Messages will be added here -->
                </div>

                <!-- Input -->
                <div class="p-4 border-t bg-white rounded-b-lg">
                    <div class="flex space-x-2">
                        <input 
                            type="text" 
                            id="chat-input" 
                            placeholder="Nhập tin nhắn..." 
                            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                        <button 
                            id="chat-send" 
                            class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Quick Suggestions -->
                    <div id="chat-suggestions" class="mt-2 flex flex-wrap gap-1">
                        <!-- Suggestions will be added here -->
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    bindEvents() {
        // Toggle chat window
        document.getElementById('chat-button').addEventListener('click', () => {
            this.toggleChat();
        });

        // Close chat
        document.getElementById('chat-close').addEventListener('click', () => {
            this.closeChat();
        });

        // Send message on Enter
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Send button
        document.getElementById('chat-send').addEventListener('click', () => {
            this.sendMessage();
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatButton = document.getElementById('chat-button');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatButton = document.getElementById('chat-button');
        
        chatWindow.classList.remove('hidden');
        chatButton.style.display = 'none';
        this.isOpen = true;
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chat-input').focus();
        }, 100);
    }

    closeChat() {
        const chatWindow = document.getElementById('chat-window');
        const chatButton = document.getElementById('chat-button');
        
        chatWindow.classList.add('hidden');
        chatButton.style.display = 'block';
        this.isOpen = false;
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            text: "Xin chào! Tôi là trợ lý ảo của Orianna Shop. Tôi có thể giúp bạn tư vấn về nước hoa, thông tin sản phẩm và chính sách của shop. Bạn cần hỗ trợ gì ạ?",
            suggestions: ["Xem sản phẩm", "Tư vấn nước hoa", "Thông tin liên hệ", "Chính sách shop"],
            isBot: true
        };
        
        this.addMessage(welcomeMessage);
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addMessage({ text: message, isBot: false });
        input.value = '';
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Send to API
            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.hideTyping();
            
            if (data.success) {
                // Add bot response
                this.addMessage({
                    text: data.data.message,
                    suggestions: data.data.suggestions,
                    isBot: true
                });
            } else {
                this.addMessage({
                    text: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
                    isBot: true
                });
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTyping();
            this.addMessage({
                text: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
                isBot: true
            });
        }
    }

    addMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        
        if (message.isBot) {
            messageDiv.className = 'flex justify-start';
            messageDiv.innerHTML = `
                <div class="max-w-xs">
                    <div class="bg-white rounded-lg p-3 shadow-sm border">
                        <p class="text-sm text-gray-800 whitespace-pre-line">${message.text}</p>
                    </div>
                    ${message.suggestions ? this.createSuggestions(message.suggestions) : ''}
                </div>
            `;
        } else {
            messageDiv.className = 'flex justify-end';
            messageDiv.innerHTML = `
                <div class="max-w-xs">
                    <div class="bg-primary text-white rounded-lg p-3">
                        <p class="text-sm">${message.text}</p>
                    </div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createSuggestions(suggestions) {
        if (!suggestions || suggestions.length === 0) return '';
        
        const suggestionsHTML = suggestions.map(suggestion => 
            `<button class="suggestion-btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs transition-colors" data-text="${suggestion}">
                ${suggestion}
            </button>`
        ).join('');
        
        setTimeout(() => {
            document.querySelectorAll('.suggestion-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const text = e.target.getAttribute('data-text');
                    document.getElementById('chat-input').value = text;
                    this.sendMessage();
                });
            });
        }, 100);
        
        return `<div class="mt-2 flex flex-wrap gap-1">${suggestionsHTML}</div>`;
    }

    showTyping() {
        const messagesContainer = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex justify-start';
        typingDiv.innerHTML = `
            <div class="bg-white rounded-lg p-3 shadow-sm border">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if not in admin pages
    if (!window.location.pathname.includes('/admin/')) {
        window.oriannaChat = new OriannaChat();
    }
});