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

    // 检查打火机编号
    if (numberInput.value < 1 || numberInput.value > 25) {
        numberInput.classList.add('error');
        errorAlert.textContent = '打火机编号必须在1-25之间';
        errorAlert.style.display = 'flex';
        isValid = false;
    }

    // 检查必填字段
    if (!sourceInput.value.trim() || !messageInput.value.trim() || !locationInput.value.trim()) {
        errorAlert.textContent = '请填写所有必填项';
        errorAlert.style.display = 'flex';
        isValid = false;
    }

    // 检查故事字数
    if (messageInput.value.trim().length < 10) {
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