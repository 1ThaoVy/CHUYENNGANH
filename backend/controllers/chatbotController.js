const db = require('../config/database');

// Dữ liệu kiến thức về nước hoa và shop
const knowledgeBase = {
    // Thông tin sản phẩm
    products: {
        chanel: {
            name: "Chanel",
            description: "Thương hiệu nước hoa Pháp cổ điển và sang trọng",
            popular: ["Chanel N°5", "Coco Mademoiselle", "Bleu de Chanel"],
            price_range: "2,500,000 - 5,000,000 VND"
        },
        dior: {
            name: "Dior",
            description: "Thương hiệu nước hoa với phong cách quyến rũ và thanh lịch",
            popular: ["Sauvage", "Miss Dior", "J'adore"],
            price_range: "2,300,000 - 6,000,000 VND"
        },
        gucci: {
            name: "Gucci",
            description: "Thương hiệu nước hoa Ý với thiết kế độc đáo",
            popular: ["Gucci Bloom", "Guilty", "Flora"],
            price_range: "2,100,000 - 7,800,000 VND"
        },
        lelabo: {
            name: "Le Labo",
            description: "Thương hiệu nước hoa thủ công, tập trung vào chất lượng cao",
            popular: ["Santal 33", "Rose 31", "Another 13"],
            price_range: "3,200,000 - 8,200,000 VND"
        },
        calvinklein: {
            name: "Calvin Klein",
            description: "Thương hiệu nước hoa hiện đại, trẻ trung và unisex",
            popular: ["CK One", "Eternity", "Euphoria"],
            price_range: "840,000 - 1,900,000 VND"
        }
    },
    
    // Thông tin shop
    shop_info: {
        name: "Orianna Perfume Store",
        address: "Nguyễn Thiện Thành, Phường Hòa Thuận, Tỉnh Vĩnh Long",
        phone: "078 747 2078",
        email: "nguyenhuynhkitthuat94tv@gmail.com",
        working_hours: "Thứ 2 - Thứ 6: 8:00 - 17:00, Thứ 7 - CN: 8:00 - 16:00",
        shipping_fee: "25,000 VND",
        free_shipping: "Miễn phí ship cho đơn hàng từ 500,000 VND"
    },
    
    // Chính sách
    policies: {
        warranty: "Sản phẩm nước hoa chính hãng được bảo hành về chất lượng. Đổi trả nếu phát hiện hàng giả hoặc không đúng mô tả.",
        return: "Đổi trả sản phẩm trong 3 ngày nếu sản phẩm bị lỗi hoặc không đúng mô tả. Sản phẩm phải còn nguyên seal.",
        shipping: "Giao hàng tận nơi trong khu vực Vĩnh Long. Phí ship 25,000 VND. Miễn phí ship cho đơn hàng từ 500,000 VND.",
        privacy: "Cam kết bảo mật thông tin cá nhân của khách hàng. Không chia sẻ thông tin cho bên thứ ba khi chưa có sự đồng ý."
    }
};

// Phân tích ý định của người dùng
function analyzeIntent(message) {
    const msg = message.toLowerCase();
    
    // Chào hỏi
    if (msg.includes('xin chào') || msg.includes('hello') || msg.includes('hi') || msg.includes('chào')) {
        return 'greeting';
    }
    
    // Hỏi về sản phẩm
    if (msg.includes('sản phẩm') || msg.includes('nước hoa') || msg.includes('perfume')) {
        return 'product_inquiry';
    }
    
    // Hỏi về thương hiệu
    if (msg.includes('chanel') || msg.includes('dior') || msg.includes('gucci') || 
        msg.includes('le labo') || msg.includes('calvin klein')) {
        return 'brand_inquiry';
    }
    
    // Hỏi về giá
    if (msg.includes('giá') || msg.includes('bao nhiêu') || msg.includes('price')) {
        return 'price_inquiry';
    }
    
    // Hỏi về giao hàng
    if (msg.includes('giao hàng') || msg.includes('ship') || msg.includes('vận chuyển')) {
        return 'shipping_inquiry';
    }
    
    // Hỏi về chính sách
    if (msg.includes('chính sách') || msg.includes('bảo hành') || msg.includes('đổi trả')) {
        return 'policy_inquiry';
    }
    
    // Hỏi về thông tin liên hệ
    if (msg.includes('liên hệ') || msg.includes('địa chỉ') || msg.includes('số điện thoại')) {
        return 'contact_inquiry';
    }
    
    // Tư vấn
    if (msg.includes('tư vấn') || msg.includes('gợi ý') || msg.includes('recommend')) {
        return 'consultation';
    }
    
    return 'general';
}

// Tạo phản hồi dựa trên ý định
function generateResponse(intent, message) {
    const msg = message.toLowerCase();
    
    switch (intent) {
        case 'greeting':
            return {
                text: "Xin chào! Tôi là trợ lý ảo của Orianna Shop. Tôi có thể giúp bạn tư vấn về nước hoa, thông tin sản phẩm, giá cả và chính sách của shop. Bạn cần hỗ trợ gì ạ?",
                suggestions: ["Xem sản phẩm", "Tư vấn nước hoa", "Thông tin liên hệ", "Chính sách shop"]
            };
            
        case 'product_inquiry':
            return {
                text: "Orianna Shop có đầy đủ các dòng nước hoa chính hãng từ các thương hiệu nổi tiếng như:\n\n" +
                      "🌟 Chanel - Sang trọng, cổ điển\n" +
                      "🌹 Dior - Quyến rũ, thanh lịch\n" +
                      "👑 Gucci - Độc đáo, thời thượng\n" +
                      "🎨 Le Labo - Thủ công, chất lượng cao\n" +
                      "✨ Calvin Klein - Hiện đại, unisex\n\n" +
                      "Bạn quan tâm đến thương hiệu nào?",
                suggestions: ["Chanel", "Dior", "Gucci", "Le Labo", "Calvin Klein"]
            };
            
        case 'brand_inquiry':
            let brand = '';
            if (msg.includes('chanel')) brand = 'chanel';
            else if (msg.includes('dior')) brand = 'dior';
            else if (msg.includes('gucci')) brand = 'gucci';
            else if (msg.includes('le labo')) brand = 'lelabo';
            else if (msg.includes('calvin klein')) brand = 'calvinklein';
            
            if (brand && knowledgeBase.products[brand]) {
                const info = knowledgeBase.products[brand];
                return {
                    text: `Thông tin về ${info.name}:\n\n` +
                          `📝 ${info.description}\n\n` +
                          `🔥 Sản phẩm nổi bật: ${info.popular.join(', ')}\n\n` +
                          `💰 Khoảng giá: ${info.price_range}\n\n` +
                          `Bạn muốn xem chi tiết sản phẩm nào?`,
                    suggestions: info.popular.concat(["Xem tất cả sản phẩm", "Tư vấn khác"])
                };
            }
            break;
            
        case 'price_inquiry':
            return {
                text: "Giá nước hoa tại Orianna Shop:\n\n" +
                      "💎 Chanel: 2,500,000 - 5,000,000 VND\n" +
                      "🌹 Dior: 2,300,000 - 6,000,000 VND\n" +
                      "👑 Gucci: 2,100,000 - 7,800,000 VND\n" +
                      "🎨 Le Labo: 3,200,000 - 8,200,000 VND\n" +
                      "✨ Calvin Klein: 840,000 - 1,900,000 VND\n\n" +
                      "Tất cả sản phẩm đều chính hãng 100% với chế độ bảo hành.",
                suggestions: ["Xem sản phẩm giảm giá", "Tư vấn theo ngân sách", "Chính sách bảo hành"]
            };
            
        case 'shipping_inquiry':
            return {
                text: `📦 Thông tin giao hàng:\n\n` +
                      `🚚 ${knowledgeBase.shop_info.shipping_fee}\n` +
                      `🎁 ${knowledgeBase.shop_info.free_shipping}\n` +
                      `📍 Giao hàng tận nơi trong khu vực Vĩnh Long\n` +
                      `⏰ Thời gian giao: 1-2 ngày làm việc\n\n` +
                      `Bạn có cần hỗ trợ thêm về giao hàng không?`,
                suggestions: ["Tính phí ship", "Thời gian giao hàng", "Khu vực giao hàng"]
            };
            
        case 'policy_inquiry':
            return {
                text: "📋 Chính sách của Orianna Shop:\n\n" +
                      "🛡️ Bảo hành: " + knowledgeBase.policies.warranty + "\n\n" +
                      "↩️ Đổi trả: " + knowledgeBase.policies.return + "\n\n" +
                      "🚛 Giao hàng: " + knowledgeBase.policies.shipping + "\n\n" +
                      "🔒 Bảo mật: " + knowledgeBase.policies.privacy,
                suggestions: ["Hướng dẫn đổi trả", "Liên hệ hỗ trợ", "Xem sản phẩm"]
            };
            
        case 'contact_inquiry':
            return {
                text: `📞 Thông tin liên hệ Orianna Shop:\n\n` +
                      `🏪 ${knowledgeBase.shop_info.name}\n` +
                      `📍 ${knowledgeBase.shop_info.address}\n` +
                      `☎️ ${knowledgeBase.shop_info.phone}\n` +
                      `📧 ${knowledgeBase.shop_info.email}\n` +
                      `🕐 ${knowledgeBase.shop_info.working_hours}\n\n` +
                      `Bạn có thể liên hệ trực tiếp hoặc đặt hàng online!`,
                suggestions: ["Đặt hàng ngay", "Xem bản đồ", "Gọi điện tư vấn"]
            };
            
        case 'consultation':
            return {
                text: "🎯 Tư vấn nước hoa phù hợp:\n\n" +
                      "Để tư vấn chính xác nhất, bạn có thể cho tôi biết:\n" +
                      "• Giới tính và độ tuổi\n" +
                      "• Ngân sách dự kiến\n" +
                      "• Dịp sử dụng (hàng ngày, dự tiệc, tặng người yêu...)\n" +
                      "• Phong cách yêu thích (tươi mát, ngọt ngào, mạnh mẽ...)\n\n" +
                      "Hoặc bạn có thể chọn tư vấn nhanh bên dưới:",
                suggestions: ["Nam giới", "Nữ giới", "Unisex", "Quà tặng", "Theo ngân sách"]
            };
            
        default:
            return {
                text: "Cảm ơn bạn đã liên hệ! Tôi có thể giúp bạn về:\n\n" +
                      "🛍️ Thông tin sản phẩm và giá cả\n" +
                      "🎯 Tư vấn chọn nước hoa phù hợp\n" +
                      "📦 Chính sách giao hàng và đổi trả\n" +
                      "📞 Thông tin liên hệ\n\n" +
                      "Bạn cần hỗ trợ gì ạ?",
                suggestions: ["Xem sản phẩm", "Tư vấn nước hoa", "Thông tin liên hệ", "Chính sách shop"]
            };
    }
    
    return {
        text: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi lại hoặc chọn một trong các chủ đề bên dưới:",
        suggestions: ["Xem sản phẩm", "Tư vấn nước hoa", "Thông tin liên hệ", "Chính sách shop"]
    };
}

// API endpoint để chat
exports.chat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Tin nhắn không được để trống'
            });
        }
        
        // Phân tích ý định và tạo phản hồi
        const intent = analyzeIntent(message);
        const response = generateResponse(intent, message);
        
        // Lưu lịch sử chat (nếu có sessionId)
        if (sessionId) {
            try {
                // Lưu tin nhắn của user
                await db.execute(
                    'INSERT INTO lich_su_chat (session_id, loai_nguoi_gui, noi_dung) VALUES (?, ?, ?)',
                    [sessionId, 'nguoi_dung', message]
                );
                
                // Lưu phản hồi của bot
                await db.execute(
                    'INSERT INTO lich_su_chat (session_id, loai_nguoi_gui, noi_dung) VALUES (?, ?, ?)',
                    [sessionId, 'bot', response.text]
                );
            } catch (dbError) {
                console.log('Database save error (non-critical):', dbError.message);
            }
        }
        
        res.json({
            success: true,
            data: {
                message: response.text,
                suggestions: response.suggestions || [],
                intent: intent
            }
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống, vui lòng thử lại sau'
        });
    }
};

// Lấy lịch sử chat
exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const [history] = await db.execute(
            'SELECT * FROM lich_su_chat WHERE session_id = ? ORDER BY thoi_gian ASC LIMIT 50',
            [sessionId]
        );
        
        res.json({
            success: true,
            data: history
        });
        
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy lịch sử chat'
        });
    }
};