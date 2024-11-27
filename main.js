// 在文件开头添加
const zhipuAI = new ZhipuAI('39918346b50e511a01601780abe0ba84.mP6c7Y7oXGLZDjm8');

// 在文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播图
    const swiper = new Swiper('.swiper', {
        // 基本配置
        loop: true,
        effect: 'coverflow', // 使用3D覆盖流效果
        speed: 1000, // 转换速度
        grabCursor: true, // 抓手光标
        centeredSlides: true, // 居中显示
        slidesPerView: 'auto', // 自动计算显示数量
        autoplay: {
            delay: 5000, // 自动播放间隔
            disableOnInteraction: false, // 用户交互后继续自动播放
        },
        coverflowEffect: {
            rotate: 50, // 旋转角度
            stretch: 0, // 拉伸
            depth: 100, // 深度
            modifier: 1, // 修饰值
            slideShadows: true, // 开启阴影
        },
        
        // 分页器配置
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true, // 动态分页器
        },
        
        // 导航按钮配置
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        // 添加视差效果
        parallax: true,
        
        // 添加鼠标滚轮控制
        mousewheel: true,
        
        // 添加键盘控制
        keyboard: {
            enabled: true,
            onlyInViewport: false,
        },
    });

    // 更新轮播图图片路径
    const slides = document.querySelectorAll('.swiper-slide img');
    const imagePaths = [
        'images/96262271_p0.jpg',
        'images/96538906_p0.jpg',
        'images/105648310_p0.jpg',
        'images/105648310_p1.jpg'
    ];
    
    slides.forEach((slide, index) => {
        if (imagePaths[index]) {
            slide.src = imagePaths[index];
        }
    });

    // 初始化智谱AI
    const zhipuAI = new ZhipuAI('39918346b50e511a01601780abe0ba84.mP6c7Y7oXGLZDjm8');

    // 聊天功能相关代码
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatClose = document.getElementById('chat-close');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-message');
    const chatMessages = document.querySelector('.chat-messages');

    // 确保所有必需的元素都存在
    if (!chatToggle || !chatContainer || !chatClose || !messageInput || !sendButton || !chatMessages) {
        console.error('Some chat elements are missing');
        return;
    }

    // 添加消息到聊天界面
    function addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 发送消息
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            try {
                // 添加用户消息
                addMessage(message, 'user');
                messageInput.value = '';
                
                // 添加加载状态
                const loadingDiv = document.createElement('div');
                loadingDiv.className = 'message ai-message loading';
                loadingDiv.innerHTML = '<div class="message-content">正在思考...</div>';
                chatMessages.appendChild(loadingDiv);
                
                // 准备消息历史
                const messages = Array.from(chatMessages.querySelectorAll('.message:not(.loading)'))
                    .map(msg => {
                        const content = msg.querySelector('.message-content');
                        return {
                            role: msg.classList.contains('user-message') ? 'user' : 'assistant',
                            content: content?.textContent || ''
                        };
                    });
                
                try {
                    // 调用API
                    const response = await zhipuAI.sendMessage(messages);
                    
                    // 移除加载消息
                    loadingDiv.remove();
                    
                    // 添加AI响应
                    if (response.choices && response.choices[0] && response.choices[0].message) {
                        const aiMessage = response.choices[0].message.content;
                        addMessage(aiMessage, 'ai');
                    } else {
                        throw new Error('Invalid API response format');
                    }
                } catch (error) {
                    console.error('API call failed:', error);
                    loadingDiv.remove();
                    addMessage('抱歉，我遇到了一些问题，请稍后再试。', 'ai');
                }
            } catch (error) {
                console.error('Message handling failed:', error);
                addMessage('发送消息时出现错误。', 'ai');
            }
        }
    }

    // 事件监听器
    chatToggle.addEventListener('click', () => {
        chatContainer.style.display = 'flex';
        chatToggle.style.display = 'none';
        messageInput.focus();
    });

    chatClose.addEventListener('click', () => {
        chatContainer.style.display = 'none';
        chatToggle.style.display = 'flex';
    });

    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 自动调整输入框高度
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
    });

    // 导航栏激活状态
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    function updateActiveLink() {
        const currentPos = window.scrollY;

        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY - 100;
            const sectionBottom = sectionTop + rect.height;

            if (currentPos >= sectionTop && currentPos < sectionBottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLinks[index]?.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
});