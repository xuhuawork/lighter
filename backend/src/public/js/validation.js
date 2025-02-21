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

    return isValid;
} 