document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('storyForm');
    
    // 从URL获取打火机编号并自动填充
    const urlParams = new URLSearchParams(window.location.search);
    const lighterNumber = urlParams.get('number');
    if (lighterNumber) {
        const input = document.getElementById('lighterNumber');
        input.value = lighterNumber;
        input.readOnly = true; // 防止用户修改编号
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // 首先进行表单验证
        if (!validateForm(this)) {
            return; // 如果验证失败，直接返回
        }
        
        const button = this.querySelector('button[type="submit"]');
        button.disabled = true;
        button.textContent = '提交中...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(async data => {
            if (data.success) {
                // 显示分享卡片而不是直接下载
                showShareCard();
                // 3秒后跳转
                setTimeout(() => {
                    window.location.href = `/${lighterNumber}`;
                }, 3000);
            } else {
                alert('提交失败：' + (data.error || '未知错误'));
                button.disabled = false;
                button.textContent = '提交';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('提交失败，请稍后再试');
            button.disabled = false;
            button.textContent = '提交';
        });
    });
});

function showHistoryPreview(data) {
    const previewList = document.getElementById('previewList');
    previewList.innerHTML = '';
    
    if (data.length === 0) {
        previewList.innerHTML = '<p class="pixel-text">暂无历史记录</p>';
        return;
    }

    data.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item pixel-box';
        historyItem.innerHTML = `
            <p class="pixel-text"><strong>时间：</strong>${new Date(item.timestamp).toLocaleString()}</p>
            <p class="pixel-text"><strong>来源：</strong>${item.source || '未知'}</p>
            <p class="pixel-text"><strong>留言：</strong>${item.message || '无'}</p>
            <p class="pixel-text"><strong>使用地点：</strong>${item.location || '未知'}</p>
        `;
        previewList.appendChild(historyItem);
    });
}

// 显示分享卡片的函数
function showShareCard() {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    // 创建分享卡片容器
    const card = document.createElement('div');
    card.className = 'share-card';
    card.style.cssText = `
        background: #306230;
        padding: 20px;
        width: 300px;
        border: 4px solid #0f380f;
        box-shadow: 0 0 0 4px #306230;
        color: #9bbc0f;
        font-family: 'Press Start 2P', cursive;
        position: relative;
        animation: fadeIn 0.5s ease;
    `;
    
    // 填充卡片内容
    card.innerHTML = `
        <h2 style="font-size: 16px; margin-bottom: 20px; text-align: center;">
            🔥 流浪火机 No.${document.getElementById('lighterNumber').value}
        </h2>
        <p style="font-size: 12px; margin-bottom: 15px;">📍 ${document.getElementById('location').value}</p>
        <p style="font-size: 12px; margin-bottom: 15px;">💫 ${document.getElementById('source').value}</p>
        <p style="font-size: 12px; line-height: 1.5;">${document.getElementById('message').value}</p>
        <p style="font-size: 10px; margin-top: 20px; text-align: right;">
            - ${document.getElementById('username').value || '匿名用户'}
        </p>
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
            故事已记录，即将跳转...
        </div>
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    // 组装并显示
    overlay.appendChild(card);
    document.body.appendChild(overlay);
}

// 修改生成二维码的 URL
function generateQRCode(lighterNumber) {
    const currentHost = window.location.hostname;
    const port = window.location.port;
    // 如果是本地开发环境，使用局域网 IP
    const baseUrl = currentHost === 'localhost' 
        ? `http://192.168.31.63:${port}`  // 替换为你的实际 IP
        : window.location.origin;
    return `${baseUrl}/welcome?number=${lighterNumber}`;
}

// 添加生成分享图片的函数
async function generateShareImage() {
    // 创建分享卡片容器
    const card = document.createElement('div');
    card.className = 'share-card';
    
    // 保存原始样式
    const originalStyle = card.style.cssText;
    
    // 设置卡片样式
    card.style.cssText = `
        position: fixed;
        top: -9999px;
        background: #306230;
        padding: 20px;
        width: 300px;
        border: 4px solid #0f380f;
        box-shadow: 0 0 0 4px #306230;
        color: #9bbc0f;
        font-family: 'Press Start 2P', cursive;
    `;
    
    // 填充卡片内容
    card.innerHTML = `
        <h2 style="font-size: 16px; margin-bottom: 20px;">🔥 流浪火机 No.${document.getElementById('lighterNumber').value}</h2>
        <p style="font-size: 12px; margin-bottom: 15px;">📍 ${document.getElementById('location').value}</p>
        <p style="font-size: 12px; margin-bottom: 15px;">💫 ${document.getElementById('source').value}</p>
        <p style="font-size: 12px; line-height: 1.5;">${document.getElementById('message').value}</p>
        <p style="font-size: 10px; margin-top: 20px; text-align: right;">- ${document.getElementById('username').value || '匿名用户'}</p>
    `;
    
    // 添加到页面
    document.body.appendChild(card);
    
    try {
        // 使用html2canvas生成图片
        const canvas = await html2canvas(card, {
            backgroundColor: '#306230',
            scale: 2,
            logging: false
        });
        
        // 导出图片
        const link = document.createElement('a');
        link.download = `流浪火机${document.getElementById('lighterNumber').value}号.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        
        // 清理
        document.body.removeChild(card);
    } catch (error) {
        console.error('生成图片失败:', error);
        if (card.parentNode) {
            document.body.removeChild(card);
        }
        throw error;
    }
} 