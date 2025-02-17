// 创建背景动画
function initBackgroundAnimation() {
    const canvas = document.createElement('canvas');
    canvas.className = 'background-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let gridOffset = { x: 0, y: 0 };
    const squareSize = 40;
    const speed = 0.5;

    // 设置画布尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // 绘制网格
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const startX = Math.floor(gridOffset.x / squareSize) * squareSize;
        const startY = Math.floor(gridOffset.y / squareSize) * squareSize;

        // 设置网格线样式
        ctx.strokeStyle = 'rgba(15, 56, 15, 0.2)';
        ctx.lineWidth = 1;

        // 绘制网格
        for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
            for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
                const squareX = x - (gridOffset.x % squareSize);
                const squareY = y - (gridOffset.y % squareSize);
                ctx.strokeRect(squareX, squareY, squareSize, squareSize);
            }
        }

        // 添加渐变效果
        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.max(canvas.width, canvas.height)
        );
        gradient.addColorStop(0, 'rgba(8, 31, 15, 0)');
        gradient.addColorStop(1, 'rgba(8, 31, 15, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 更新动画
    function updateAnimation() {
        gridOffset.x = (gridOffset.x - speed + squareSize) % squareSize;
        gridOffset.y = (gridOffset.y - speed + squareSize) % squareSize;
        drawGrid();
        animationFrameId = requestAnimationFrame(updateAnimation);
    }

    // 初始化
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    updateAnimation();

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .background-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);

    // 清理函数
    return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationFrameId);
        document.body.removeChild(canvas);
        document.head.removeChild(style);
    };
} 