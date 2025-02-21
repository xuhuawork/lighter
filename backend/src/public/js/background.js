function initBackgroundAnimation() {
    const container = document.querySelector('.container');
    if (!container) return;

    // 添加动态背景
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.background = '#306230';
    container.style.animation = 'gradientBG 15s ease infinite';

    // 添加网格背景
    container.style.backgroundImage = `
        linear-gradient(rgba(15, 56, 15, 0.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 56, 15, 0.2) 1px, transparent 1px)
    `;
    container.style.backgroundSize = '16px 16px';
    container.style.animation = 'backgroundMove 20s linear infinite';
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
@keyframes backgroundMove {
    0% { background-position: 0 0; }
    100% { background-position: 32px 32px; }
}

@keyframes gradientBG {
    0% { background-color: #306230; }
    50% { background-color: #407240; }
    100% { background-color: #306230; }
}

.container::before {
    content: '';
    position: absolute;
    top: -100%;
    left: -100%;
    right: -100%;
    bottom: -100%;
    background: inherit;
    background-attachment: fixed;
    filter: blur(4px);
    z-index: -1;
}
`;
document.head.appendChild(style);

// 初始化动画
document.addEventListener('DOMContentLoaded', initBackgroundAnimation); 