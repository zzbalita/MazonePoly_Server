const Chat = require('../models/Chat');
const User = require('../models/User');
const Product = require('../models/Product');

// Auto response system with enhanced logic
const getAutoResponse = async (userMessage, userId) => {
  const message = userMessage.toLowerCase();
  let responseType = 'default';
  let response = '';
  
  try {
    // Greeting responses
    if (message.includes('chào') || message.includes('hello') || message.includes('hi')) {
      responseType = 'greeting';
      response = 'Chào bạn! Rất vui được hỗ trợ bạn hôm nay. Bạn cần tìm hiểu về sản phẩm nào?';
    }
    
    // Product related queries with database integration
    else if (message.includes('áo') || message.includes('shirt') || message.includes('t-shirt')) {
      responseType = 'product_info';
      try {
        const products = await Product.find({ 
          name: { $regex: /áo|shirt|t-shirt/i } 
        }).limit(3);
        
        if (products.length > 0) {
          const productList = products.map(p => `• ${p.name} - ${p.price.toLocaleString('vi-VN')} VNĐ`).join('\n');
          response = `Chúng tôi có rất nhiều loại áo nam. Đây là một số sản phẩm hot:\n\n${productList}\n\nBạn muốn xem thêm chi tiết sản phẩm nào?`;
        } else {
          response = 'Chúng tôi có rất nhiều loại áo nam: áo sơ mi, áo thun, áo polo, áo hoodie. Bạn muốn xem loại nào? Tôi có thể giúp bạn tìm theo size, màu sắc hoặc giá cả.';
        }
      } catch (err) {
        response = 'Chúng tôi có rất nhiều loại áo nam: áo sơ mi, áo thun, áo polo, áo hoodie. Bạn muốn xem loại nào? Tôi có thể giúp bạn tìm theo size, màu sắc hoặc giá cả.';
      }
    }
    
    else if (message.includes('quần') || message.includes('pants') || message.includes('jeans')) {
      responseType = 'product_info';
      try {
        const products = await Product.find({ 
          name: { $regex: /quần|pants|jeans/i } 
        }).limit(3);
        
        if (products.length > 0) {
          const productList = products.map(p => `• ${p.name} - ${p.price.toLocaleString('vi-VN')} VNĐ`).join('\n');
          response = `Manzone có đa dạng các loại quần. Đây là một số sản phẩm nổi bật:\n\n${productList}\n\nBạn đang tìm loại nào và size bao nhiêu?`;
        } else {
          response = 'Manzone có đa dạng các loại quần: quần jeans, quần kaki, quần short, quần tây. Bạn đang tìm loại nào và size bao nhiêu?';
        }
      } catch (err) {
        response = 'Manzone có đa dạng các loại quần: quần jeans, quần kaki, quần short, quần tây. Bạn đang tìm loại nào và size bao nhiêu?';
      }
    }
    
    // Pricing queries with real data
    else if (message.includes('giá') || message.includes('price') || message.includes('bao nhiêu')) {
      responseType = 'pricing';
      try {
        const priceRanges = await Product.aggregate([
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' },
              avgPrice: { $avg: '$price' }
            }
          }
        ]);
        
        if (priceRanges.length > 0) {
          const { minPrice, maxPrice, avgPrice } = priceRanges[0];
          response = `Giá sản phẩm của chúng tôi rất cạnh tranh:\n• Giá từ: ${minPrice.toLocaleString('vi-VN')} VNĐ\n• Giá cao nhất: ${maxPrice.toLocaleString('vi-VN')} VNĐ\n• Giá trung bình: ${Math.round(avgPrice).toLocaleString('vi-VN')} VNĐ\n\nBạn có thể xem chi tiết giá từng sản phẩm trong danh mục hoặc cho tôi biết sản phẩm cụ thể bạn quan tâm.`;
        } else {
          response = 'Giá sản phẩm của chúng tôi rất cạnh tranh:\n• Áo thun: 200.000 - 500.000 VNĐ\n• Áo sơ mi: 350.000 - 800.000 VNĐ\n• Quần jeans: 400.000 - 900.000 VNĐ\n• Quần kaki: 300.000 - 700.000 VNĐ\nBạn có thể xem chi tiết giá từng sản phẩm trong danh mục.';
        }
      } catch (err) {
        response = 'Giá sản phẩm của chúng tôi rất cạnh tranh:\n• Áo thun: 200.000 - 500.000 VNĐ\n• Áo sơ mi: 350.000 - 800.000 VNĐ\n• Quần jeans: 400.000 - 900.000 VNĐ\n• Quần kaki: 300.000 - 700.000 VNĐ\nBạn có thể xem chi tiết giá từng sản phẩm trong danh mục.';
      }
    }
    
    else if (message.includes('size') || message.includes('kích thước') || message.includes('cỡ')) {
      responseType = 'product_info';
      response = 'Chúng tôi có đầy đủ các size từ S đến XXL:\n• S: 50-55kg (Ngực: 88-92cm)\n• M: 55-65kg (Ngực: 92-96cm)\n• L: 65-75kg (Ngực: 96-100cm)\n• XL: 75-85kg (Ngực: 100-104cm)\n• XXL: 85-95kg (Ngực: 104-108cm)\n\nBạn có thể tham khảo bảng size chi tiết trong mỗi sản phẩm hoặc liên hệ để được tư vấn size phù hợp.';
    }
    
    else if (message.includes('giao hàng') || message.includes('ship') || message.includes('delivery')) {
      responseType = 'shipping';
      response = 'Chúng tôi hỗ trợ giao hàng toàn quốc:\n• Nội thành HCM/HN: 1-2 ngày\n• Ngoại thành: 2-3 ngày\n• Tỉnh thành khác: 3-5 ngày\n• Vùng xa: 5-7 ngày\n\nPhí ship: 30.000 VNĐ (Miễn phí cho đơn hàng từ 500.000 VNĐ)\n\nChúng tôi cam kết giao hàng an toàn, đúng hẹn!';
    }
    
    else if (message.includes('thanh toán') || message.includes('payment') || message.includes('pay')) {
      responseType = 'support';
      response = 'Chúng tôi hỗ trợ nhiều hình thức thanh toán an toàn:\n• 💵 Tiền mặt khi nhận hàng (COD)\n• 🏦 Chuyển khoản ngân hàng\n• 📱 Ví điện tử MoMo\n• 💳 Thẻ tín dụng/ghi nợ Visa, Mastercard\n• 🎫 Ví ShopeePay, ZaloPay\n\nTất cả đều được mã hóa bảo mật SSL 256-bit!';
    }
    
    else if (message.includes('đổi trả') || message.includes('return') || message.includes('exchange')) {
      responseType = 'support';
      response = 'Chính sách đổi trả của Manzone:\n✅ Đổi trả trong 7 ngày kể từ khi nhận hàng\n✅ Sản phẩm còn nguyên tag, chưa qua sử dụng\n✅ Miễn phí đổi size (trong 3 ngày đầu)\n✅ Hoàn tiền 100% nếu lỗi từ shop\n✅ Hỗ trợ đổi trả tại nhà\n\nLiên hệ hotline để được hỗ trợ nhanh chóng!';
    }
    
    else if (message.includes('hotline') || message.includes('liên hệ') || message.includes('contact')) {
      responseType = 'support';
      response = 'Thông tin liên hệ Manzone:\n📞 Hotline: 1900-1234 (miễn phí)\n📧 Email: support@manzone.vn\n📍 Địa chỉ: 123 Nguyễn Văn Cừ, Q.5, TP.HCM\n🕐 Giờ làm việc: 8:00 - 22:00 (T2-CN)\n💬 Live Chat: Ngay tại đây\n📱 Fanpage: fb.com/ManzoneFashion\n\nChúng tôi luôn sẵn sàng hỗ trợ bạn 24/7!';
    }
    
    else if (message.includes('sale') || message.includes('giảm giá') || message.includes('khuyến mãi')) {
      responseType = 'product_info';
      response = 'Chương trình khuyến mãi HOT đang diễn ra:\n🔥 Giảm 20% cho khách hàng mới (mã: NEW20)\n🎁 Mua 2 tặng 1 cho áo thun basic\n💥 Giảm 15% cho đơn hàng từ 1 triệu (mã: SAVE15)\n⚡ Flash sale cuối tuần giảm đến 50%\n🛍️ Freeship toàn quốc cho đơn từ 500K\n\nHãy theo dõi app để không bỏ lỡ ưu đãi!';
    }
    
    // Search for specific products
    else if (message.includes('tìm') || message.includes('search') || message.includes('có')) {
      responseType = 'product_info';
      try {
        // Try to extract product keywords
        const keywords = message.split(' ').filter(word => 
          word.length > 2 && 
          !['tìm', 'có', 'không', 'được', 'cho', 'của', 'trong', 'và', 'với'].includes(word)
        );
        
        if (keywords.length > 0) {
          const searchQuery = keywords.join('|');
          const products = await Product.find({ 
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { description: { $regex: searchQuery, $options: 'i' } }
            ]
          }).limit(5);
          
          if (products.length > 0) {
            const productList = products.map(p => 
              `• ${p.name} - ${p.price.toLocaleString('vi-VN')} VNĐ`
            ).join('\n');
            response = `Tôi tìm thấy ${products.length} sản phẩm phù hợp:\n\n${productList}\n\nBạn muốn xem chi tiết sản phẩm nào?`;
          } else {
            response = 'Xin lỗi, tôi không tìm thấy sản phẩm phù hợp với từ khóa của bạn. Bạn có thể thử tìm với từ khóa khác hoặc duyệt qua danh mục sản phẩm của chúng tôi.';
          }
        } else {
          response = 'Bạn muốn tìm sản phẩm gì? Hãy cho tôi biết cụ thể hơn như: áo sơ mi, quần jeans, giày thể thao... để tôi có thể hỗ trợ bạn tốt hơn.';
        }
      } catch (err) {
        response = 'Bạn muốn tìm sản phẩm gì? Hãy cho tôi biết cụ thể hơn để tôi có thể hỗ trợ bạn tốt hơn.';
      }
    }
    
    // Default responses
    else {
      const defaultResponses = [
        'Cảm ơn bạn đã liên hệ! Tôi đang tìm hiểu thông tin để hỗ trợ bạn tốt nhất. Bạn có thể cho tôi biết chi tiết hơn được không?',
        'Tôi hiểu bạn đang quan tâm đến sản phẩm của chúng tôi. Bạn có thể xem thêm trong danh mục sản phẩm hoặc cho tôi biết bạn cần tìm gì cụ thể?',
        'Để tôi có thể hỗ trợ bạn tốt hơn, bạn có thể nói rõ hơn về nhu cầu của mình không? Ví dụ: loại sản phẩm, size, màu sắc, giá cả...',
        'Tôi có thể giúp bạn tìm sản phẩm, tư vấn size, giải đáp về giá cả, chính sách đổi trả... Bạn cần hỗ trợ gì cụ thể?'
      ];
      
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    return { response, responseType };
    
  } catch (error) {
    console.error('Error in getAutoResponse:', error);
    return {
      response: 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline 1900-1234 để được hỗ trợ.',
      responseType: 'default'
    };
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const chat = await Chat.findOne({ 
      user_id: userId, 
      session_id: sessionId 
    }).populate('user_id', 'full_name email');
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    const recentMessages = chat.getRecentMessages(100);
    
    res.json({
      success: true,
      data: {
        sessionId: chat.session_id,
        messages: recentMessages,
        totalMessages: chat.total_messages,
        lastActivity: chat.last_activity,
        status: chat.status
      }
    });
    
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message too long (max 2000 characters)'
      });
    }
    
    // Find or create chat session
    let chat = await Chat.findOrCreateSession(userId, sessionId);
    
    // Add user message
    const userMessage = chat.addMessage(message.trim(), true);
    
    // Generate bot response
    const { response, responseType } = await getAutoResponse(message.trim(), userId);
    
    // Add bot response after a delay (simulate typing)
    setTimeout(async () => {
      try {
        const botMessage = chat.addMessage(response, false, responseType);
        await chat.save();
        
        // Emit to socket if available
        const io = req.app.get('io');
        if (io) {
          io.to(`user_${userId}`).emit('newMessage', {
            sessionId: sessionId,
            message: {
              message_id: botMessage.message_id,
              text: botMessage.text,
              is_user: false,
              timestamp: botMessage.timestamp,
              response_type: botMessage.response_type
            }
          });
        }
      } catch (error) {
        console.error('Error saving bot response:', error);
      }
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
    
    // Save user message immediately
    await chat.save();
    
    // Emit user message to socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${userId}`).emit('newMessage', {
        sessionId: sessionId,
        message: {
          message_id: userMessage.message_id,
          text: userMessage.text,
          is_user: true,
          timestamp: userMessage.timestamp
        }
      });
    }
    
    res.json({
      success: true,
      data: {
        message: {
          message_id: userMessage.message_id,
          text: userMessage.text,
          is_user: true,
          timestamp: userMessage.timestamp
        }
      }
    });
    
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's chat sessions
const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const sessions = await Chat.find({ user_id: userId })
      .select('session_id last_activity total_messages status messages')
      .sort({ last_activity: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const sessionsWithLastMessage = sessions.map(session => {
      const lastMessage = session.messages[session.messages.length - 1];
      return {
        session_id: session.session_id,
        last_activity: session.last_activity,
        total_messages: session.total_messages,
        status: session.status,
        last_message: lastMessage ? {
          text: lastMessage.text.substring(0, 100) + (lastMessage.text.length > 100 ? '...' : ''),
          is_user: lastMessage.is_user,
          timestamp: lastMessage.timestamp
        } : null
      };
    });
    
    const total = await Chat.countDocuments({ user_id: userId });
    
    res.json({
      success: true,
      data: {
        sessions: sessionsWithLastMessage,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_sessions: total,
          has_next: page * limit < total,
          has_prev: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new chat session
const createChatSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = `session_${userId}_${Date.now()}`;
    
    const chat = await Chat.findOrCreateSession(userId, sessionId);
    
    res.json({
      success: true,
      data: {
        sessionId: chat.session_id,
        messages: chat.getRecentMessages(50),
        created_at: chat.created_at
      }
    });
    
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Close chat session
const closeChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    
    const chat = await Chat.findOne({ 
      user_id: userId, 
      session_id: sessionId 
    });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    chat.status = 'closed';
    await chat.save();
    
    res.json({
      success: true,
      message: 'Chat session closed successfully'
    });
    
  } catch (error) {
    console.error('Error closing chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getChatHistory,
  sendMessage,
  getChatSessions,
  createChatSession,
  closeChatSession
};
