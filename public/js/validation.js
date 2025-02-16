document.querySelector('form').addEventListener('submit', function(e) {
    const numberInput = document.getElementById('lighterNumber');
    const sourceInput = document.getElementById('source');
    const messageInput = document.getElementById('message');
    const locationInput = document.getElementById('location');

    // 移除之前的 e.preventDefault()，因为 form.js 已经处理了提交
    if (numberInput.value < 1 || numberInput.value > 25) {
        numberInput.classList.add('error');
        return false;
    }

    if (!sourceInput.value.trim() || !messageInput.value.trim() || !locationInput.value.trim()) {
        return false;
    }

    if (messageInput.value.trim().length < 10) {
        messageInput.classList.add('error');
        const errorAlert = document.querySelector('.alert.error');
        errorAlert.textContent = '请分享至少10个字符的故事';
        errorAlert.style.display = 'flex';
        return false;
    }

    return true;
});

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