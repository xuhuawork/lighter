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
            window.location.href = '/success';
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