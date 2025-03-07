document.addEventListener('DOMContentLoaded', function() {
    // 从URL获取打火机编号并自动填充
    const urlParams = new URLSearchParams(window.location.search);
    const lighterNumber = urlParams.get('number');
    if (lighterNumber) {
        document.getElementById('lighterNumber').value = lighterNumber;
    }

    // 添加分享卡片样式
    const style = document.createElement('style');
    style.innerHTML = `
        .share-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        .share-card {
            background: #9bbc0f;
            padding: 20px;
            border-radius: 8px;
            max-width: 90%;
            width: 320px;
            animation: fadeIn 0.3s ease-out;
        }

        .share-card-content {
            background: #306230;
            border: 4px solid #0f380f;
            padding: 20px;
            box-shadow: 
                0 0 0 4px #306230,
                inset 0 0 20px rgba(15, 56, 15, 0.5);
        }

        .card-header {
            margin-bottom: 20px;
            text-align: center;
        }

        .card-header h2 {
            font-size: 1.6em;
            margin: 0;
            color: #9bbc0f;
        }
        
        .card-header .subtitle {
            font-size: 1.1em;
            margin-top: 8px;
            color: #9bbc0f;
            opacity: 0.9;
        }

        .share-info {
            margin: 20px 0;
        }

        .share-info p {
            margin: 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 1.1em;
        }

        .share-info i {
            width: 20px;
            text-align: center;
            color: #9bbc0f;
        }

        .countdown {
            margin-top: 24px;
            text-align: center;
        }

        .screenshot-text {
            margin: 8px 0;
            font-size: 1.3em;
            animation: blink 1.5s infinite;
            color: #9bbc0f;
        }

        .timer-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-top: 10px;
        }

        .timer-number {
            font-size: 2em;
            color: #9bbc0f;
            background: rgba(15, 56, 15, 0.5);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .timer-text {
            font-size: 1.1em;
            color: #9bbc0f;
        }

        .pulse-animation {
            animation: pulse-scale 0.5s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes pulse-scale {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
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
        location: document.getElementById('location').value.trim(),
        surroundings: document.getElementById('surroundings').value.trim(),
        message: document.getElementById('message').value.trim(),
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
            <p class="pixel-text"><strong>说到：</strong>${item.message || '无'}</p>
            <p class="pixel-text"><strong>记录地点：</strong>${item.location || '未知'}</p>
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
    
    // 获取格式化的时间
    const formattedTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // 获取使用者编号
    fetch(`/api/history/${data.lighterNumber}`)
        .then(response => response.json())
        .then(historyData => {
            // 计算当前是第几个使用者
            const userNumber = historyData.length + 1;
            
            card.innerHTML = `
                <div class="share-card-content pixel-border">
                    <div class="card-header">
                        <h2 class="pixel-text">🔥 流浪火机 #${data.lighterNumber}</h2>
                        <p class="subtitle pixel-text">第 ${userNumber} 个使用者</p>
                    </div>
                    <div class="share-info">
                        <p class="location pixel-text"><i class="fas fa-map-marker-alt"></i> ${data.location}</p>
                        <p class="username pixel-text"><i class="fas fa-user"></i> ${data.username || '匿名用户'}</p>
                        <p class="time pixel-text"><i class="fas fa-clock"></i> ${formattedTime}</p>
                    </div>
                    <div class="countdown pixel-text">
                        <p class="screenshot-text">请截图保存 ⬇️</p>
                        <div class="timer-container">
                            <span class="timer-number">${7}</span>
                            <span class="timer-text">秒后为您展示历史记录</span>
                        </div>
                    </div>
                </div>
            `;
            
            shareModal.appendChild(card);
            document.body.appendChild(shareModal);
            
            // 开始倒计时
            let secondsLeft = 7;
            const timerNumber = card.querySelector('.timer-number');
            const countdownInterval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    timerNumber.textContent = secondsLeft;
                    // 添加动画效果
                    timerNumber.classList.remove('pulse-animation');
                    void timerNumber.offsetWidth; // 触发重绘
                    timerNumber.classList.add('pulse-animation');
                } else {
                    clearInterval(countdownInterval);
                    window.location.href = `/history/${data.lighterNumber}`;
                }
            }, 1000);
        })
        .catch(error => {
            console.error('获取历史记录失败:', error);
            // 如果获取历史记录失败，则默认为第1个使用者
            card.innerHTML = `
                <div class="share-card-content pixel-border">
                    <div class="card-header">
                        <h2 class="pixel-text">🔥 流浪火机 #${data.lighterNumber}</h2>
                        <p class="subtitle pixel-text">新的旅程开始</p>
                    </div>
                    <div class="share-info">
                        <p class="location pixel-text"><i class="fas fa-map-marker-alt"></i> ${data.location}</p>
                        <p class="username pixel-text"><i class="fas fa-user"></i> ${data.username || '匿名用户'}</p>
                        <p class="time pixel-text"><i class="fas fa-clock"></i> ${formattedTime}</p>
                    </div>
                    <div class="countdown pixel-text">
                        <p class="screenshot-text">请截图保存 ⬇️</p>
                        <div class="timer-container">
                            <span class="timer-number">${7}</span>
                            <span class="timer-text">秒后为您展示历史记录</span>
                        </div>
                    </div>
                </div>
            `;
            
            shareModal.appendChild(card);
            document.body.appendChild(shareModal);
            
            // 开始倒计时
            let secondsLeft = 7;
            const timerNumber = card.querySelector('.timer-number');
            const countdownInterval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    timerNumber.textContent = secondsLeft;
                    // 添加动画效果
                    timerNumber.classList.remove('pulse-animation');
                    void timerNumber.offsetWidth; // 触发重绘
                    timerNumber.classList.add('pulse-animation');
                } else {
                    clearInterval(countdownInterval);
                    window.location.href = `/history/${data.lighterNumber}`;
                }
            }, 1000);
        });
}

// 更新二维码生成的 URL 格式
function generateQRCode(lighterNumber) {
    const currentHost = window.location.hostname;
    const port = window.location.port;
    
    // 获取本机局域网IP
    let baseUrl;
    if (currentHost === 'localhost') {
        // 如果是本地开发环境，尝试获取实际的局域网IP
        baseUrl = `http://${getLocalIP()}:${port}`;
    } else {
        baseUrl = window.location.origin;
    }
    
    // 使用新的URL格式
    return `${baseUrl}/welcome/${lighterNumber}`;
}

// 获取本机局域网IP
function getLocalIP() {
    // 默认IP，如果无法获取实际IP则使用这个
    let defaultIP = '192.168.1.14';
    
    // 尝试从页面获取实际IP
    // 这个值应该由服务器在渲染页面时注入
    const serverIP = document.querySelector('meta[name="local-ip"]')?.content;
    
    return serverIP || defaultIP;
}

// 修改提交逻辑
function submitForm() {
    if (isSubmitting) return;
    if (!validateFormStep3()) return;

    isSubmitting = true;
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    submitBtn.querySelector('span').style.visibility = 'hidden';

    const urlParams = new URLSearchParams(window.location.search);
    const formData = {
        lighterNumber: urlParams.get('number'),
        location: urlParams.get('location'),
        source: urlParams.get('source'),
        username: urlParams.get('username'),
        surroundings: urlParams.get('surroundings'),
        message: document.getElementById('message').value.trim()
    };

    // 验证所有必填字段
    if (!formData.lighterNumber || !formData.location || !formData.source || !formData.message) {
        showError('请填写所有必填字段');
        resetSubmitButton();
        return;
    }

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '提交失败');
        return data;
    })
    .then(data => {
        if (data.success) {
            window.location.href = '/success';
        } else {
            throw new Error('提交失败');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.message || '提交失败，请重试');
        resetSubmitButton();
    });
}

function resetSubmitButton() {
    isSubmitting = false;
    submitBtn.disabled = false;
    spinner.style.display = 'none';
    submitBtn.querySelector('span').style.visibility = 'visible';
}

// 修改步骤切换逻辑
function showStep(step) {
    const currentStep = document.querySelector('.form-step.active');
    const nextStep = document.querySelector(`.form-step[data-step="${step}"]`);
    
    if (currentStep) {
        // 判断是前进还是后退
        const isPrev = step < currentStep.dataset.step;
        currentStep.classList.remove('active');
        if (isPrev) {
            currentStep.classList.add('prev');
        }
    }
    
    if (nextStep) {
        // 添加延迟以确保动画流畅
        setTimeout(() => {
            nextStep.classList.add('active');
            if (nextStep.classList.contains('prev')) {
                nextStep.classList.remove('prev');
            }
        }, 10);
    }

    // 更新步骤指示器
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
        if (el.dataset.step <= step) {
            el.classList.add('active');
        }
    });
}

// 添加统一的错误处理函数
function showError(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert error pixel-text';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // 移除已存在的错误提示
    const existingError = document.querySelector('.alert.error');
    if (existingError) {
        existingError.remove();
    }
    
    document.querySelector('.form-container').prepend(errorDiv);
    
    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => errorDiv.remove(), 300);
    }, duration);
} 