document.addEventListener('DOMContentLoaded', function() {
    // 从URL获取打火机编号并自动填充
    const urlParams = new URLSearchParams(window.location.search);
    const lighterNumber = urlParams.get('number');
    if (lighterNumber) {
        document.getElementById('lighterNumber').value = lighterNumber;
    }
});

document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault(); // 阻止表单默认提交

    // 首先进行表单验证
    if (!validateForm(this)) {
        return; // 如果验证失败，直接返回
    }

    const button = this.querySelector('button[type="submit"]');
    button.disabled = true;
    button.classList.add('loading');
    button.innerHTML = '提交中...';

    // 收集表单数据
    const data = {
        lighterNumber: document.getElementById('lighterNumber').value,
        source: document.getElementById('source').value.trim(),
        message: document.getElementById('message').value.trim(),
        location: document.getElementById('location').value.trim(),
        username: document.getElementById('username').value.trim()
    };

    // 发送请求
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(async response => {
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.error || response.statusText);
        }
        return responseData;
    })
    .then(result => {
        if (result.success) {
            // 生成分享卡片
            showShareCard({
                lighterNumber: data.lighterNumber,
                location: data.location,
                message: data.message,
                username: data.username
            });
            
            // 3秒后再跳转到历史记录页面
            setTimeout(() => {
                window.location.href = `/history/${data.lighterNumber}`;
            }, 3000);
        } else {
            throw new Error(result.error || '提交失败');
        }
    })
    .catch(error => {
        console.error('提交错误:', error);
        const errorAlert = document.querySelector('.alert.error');
        errorAlert.textContent = error.message || '提交失败，请重试';
        errorAlert.style.display = 'flex';
    })
    .finally(() => {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = '提交';
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

// 添加分享卡片生成和显示功能
function showShareCard(data) {
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    
    const card = document.createElement('div');
    card.className = 'share-card';
    
    // 生成分享卡片内容，优化文字长度和换行
    const truncatedMessage = data.message.length > 50 ? 
        data.message.substring(0, 50) + '...' : 
        data.message;
    
    card.innerHTML = `
        <div class="share-card-content pixel-border">
            <div class="card-header">
                <h2 class="pixel-text">🔥 流浪火机 #${data.lighterNumber}</h2>
            </div>
            <div class="share-info">
                <p class="location pixel-text"><i class="fas fa-map-marker-alt"></i> ${data.location}</p>
                <p class="message pixel-text">${truncatedMessage}</p>
                ${data.username ? `<p class="username pixel-text"><i class="fas fa-user"></i> ${data.username}</p>` : ''}
            </div>
            <div class="share-footer pixel-text">
                <div class="qr-placeholder"></div>
                <p>- 扫码加入流浪火机的旅程 -</p>
            </div>
        </div>
        <div class="share-actions">
            <button class="share-btn" onclick="downloadShareCard()">
                <i class="fas fa-download"></i> 保存图片
            </button>
            <p class="share-tip pixel-text">保存图片后分享到社交媒体</p>
        </div>
    `;
    
    shareModal.appendChild(card);
    document.body.appendChild(shareModal);
}

// 优化下载分享卡片功能
function downloadShareCard() {
    const card = document.querySelector('.share-card-content');
    
    // 设置临时样式以确保正确的输出比例
    const originalStyle = card.style.cssText;
    card.style.width = '600px';  // 固定宽度
    card.style.height = 'auto';
    card.style.transform = 'scale(1)';
    
    html2canvas(card, {
        scale: 2,  // 调整缩放比例
        useCORS: true,
        backgroundColor: '#9bbc0f',
        logging: false,
        imageRendering: 'pixelated',  // 确保图片像素化
        onclone: function(clonedDoc) {
            const clonedCard = clonedDoc.querySelector('.share-card-content');
            if (clonedCard) {
                // 在克隆的文档中应用像素化样式
                clonedCard.style.imageRendering = 'pixelated';
                clonedCard.querySelectorAll('*').forEach(el => {
                    el.style.imageRendering = 'pixelated';
                    if (el.classList.contains('pixel-text')) {
                        el.style.textRendering = 'optimizeSpeed';
                        el.style.webkitFontSmoothing = 'none';
                        el.style.fontSmooth = 'never';
                    }
                });
            }
        }
    }).then(canvas => {
        // 创建一个新的画布来调整最终输出
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        
        // 设置最终输出尺寸
        finalCanvas.width = 1200;  // 2倍宽度以保持清晰度
        finalCanvas.height = (canvas.height * 1200) / canvas.width;
        
        // 启用像素化渲染
        ctx.imageSmoothingEnabled = false;
        
        // 绘制图像
        ctx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);
        
        // 导出图片
        const link = document.createElement('a');
        link.download = `流浪火机${document.getElementById('lighterNumber').value}号.png`;
        link.href = finalCanvas.toDataURL('image/png', 1.0);
        link.click();
        
        // 恢复原始样式
        card.style.cssText = originalStyle;
    });
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