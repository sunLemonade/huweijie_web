class ZhipuAI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    }

    // 生成JWT Token
    async generateToken() {
        const [id, secret] = this.apiKey.split('.');
        
        // 当前时间戳（毫秒）
        const timestamp = Date.now();
        
        // payload
        const payload = {
            api_key: id,
            exp: timestamp + 3600 * 1000, // 1小时后过期
            timestamp: timestamp
        };

        // header
        const header = {
            alg: 'HS256',
            sign_type: 'SIGN'
        };

        try {
            // 使用 HMAC SHA256 算法生成签名
            const encodedHeader = btoa(JSON.stringify(header));
            const encodedPayload = btoa(JSON.stringify(payload));
            const signature = await this.hmacSha256(`${encodedHeader}.${encodedPayload}`, secret);
            const token = `${encodedHeader}.${encodedPayload}.${signature}`;
            return token;
        } catch (error) {
            console.error('Token generation failed:', error);
            throw error;
        }
    }

    // HMAC SHA256 签名函数
    async hmacSha256(message, secret) {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const messageData = encoder.encode(message);
        
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        
        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            messageData
        );
        
        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    // 发送消息到AI
    async sendMessage(messages) {
        try {
            const token = await this.generateToken();
            
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'glm-4',
                    messages: messages
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }
} 