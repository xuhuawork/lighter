// 创建验证函数
function validateForm(form) {
    const numberInput = form.querySelector('#lighterNumber');
    const sourceInput = form.querySelector('#source');
    const messageInput = form.querySelector('#message');
    const locationInput = form.querySelector('#location');
    const usernameInput = form.querySelector('#username');

    let isValid = true;
    
    // 重置之前的错误提示
    const errorAlert = document.querySelector('.alert.error');
    errorAlert.style.display = 'none';
    numberInput.classList.remove('error');
    messageInput.classList.remove('error');

    // 检查打火机编号格式
    if (!numberInput.value || isNaN(numberInput.value)) {
        numberInput.classList.add('error');
        errorAlert.textContent = '打火机编号必须是数字';
        errorAlert.style.display = 'flex';
        isValid = false;
    }
    // 检查打火机编号范围
    else if (numberInput.value < 1 || numberInput.value > 25) {
        numberInput.classList.add('error');
        errorAlert.textContent = '打火机编号必须在1-25之间';
        errorAlert.style.display = 'flex';
        isValid = false;
    }

    // 检查必填字段
    if (!sourceInput.value.trim()) {
        sourceInput.classList.add('error');
        errorAlert.textContent = '请选择获取来源';
        errorAlert.style.display = 'flex';
        isValid = false;
    }

    if (!locationInput.value.trim()) {
        locationInput.classList.add('error');
        errorAlert.textContent = '请填写你所在的地点';
        errorAlert.style.display = 'flex';
        isValid = false;
    }

    if (!messageInput.value.trim()) {
        messageInput.classList.add('error');
        errorAlert.textContent = '请填写你的故事';
        errorAlert.style.display = 'flex';
        isValid = false;
    }
    // 检查故事字数
    else if (messageInput.value.trim().length < 10) {
        messageInput.classList.add('error');
        errorAlert.textContent = '请分享至少10个字符的故事';
        errorAlert.style.display = 'flex';
        isValid = false;
    }

    // 用户名长度验证（如果填写了的话）
    if (usernameInput.value.trim() && usernameInput.value.trim().length > 20) {
        usernameInput.classList.add('error');
        errorAlert.textContent = '名字不能超过20个字符';
        errorAlert.style.display = 'flex';
        isValid = false;
    }

    // 添加错误提示的自动消失
    if (!isValid) {
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 3000);
    }

    return isValid;
}

// 导出验证函数
window.validateForm = validateForm;

// 添加错误样式
const style = document.createElement('style');
style.innerHTML = `
    .error {
        border-color: #dc3545 !important;
        animation: shake 0.5s;
    }
    @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
    }
`;
document.head.appendChild(style);

function validateFormStep3() {
    const message = document.getElementById('message').value.trim();
    
    if (message.length < 10) {
        alert('故事内容至少需要10个字符');
        return false;
    }
    
    if (message.length > 500) {
        alert('故事内容不能超过500个字符');
        return false;
    }
    
    return true;
}

// 修改提交函数
function submitForm() {
    if (!validateFormStep3()) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const formData = {
        lighterNumber: urlParams.get('number'),
        location: urlParams.get('location'),
        source: urlParams.get('source'),
        username: urlParams.get('username'),
        surroundings: urlParams.get('surroundings'),
        message: document.getElementById('message').value
    };

    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 直接调用showShareCard函数
            showShareCard(formData);
        } else {
            alert('提交失败，请重试');
        }
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert error pixel-text';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.querySelector('.form-container').prepend(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// 添加分享卡片生成和显示功能
function showShareCard(data) {
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