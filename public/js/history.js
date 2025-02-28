window.addEventListener('load', function() {
    const pathParts = window.location.pathname.split('/');
    const lighterNumber = pathParts[pathParts.length - 1];
    document.getElementById('lighterNumber').textContent = lighterNumber;

    fetch(`/api/history/${lighterNumber}`)
        .then(response => response.json())
        .then(data => {
            showHistoryPreview(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('historyList').innerHTML = '<p>加载历史记录失败，请稍后再试。</p>';
        });
});

function addContentSparks(contentElement) {
    function createContentSpark() {
        const spark = document.createElement('div');
        spark.className = 'content-spark';
        
        // 随机位置和移动方向
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const moveX = -20 + Math.random() * 40;
        const moveY = -20 + Math.random() * 40;
        
        // 随机大小和持续时间
        const scale = 0.5 + Math.random() * 1;
        const duration = 1 + Math.random() * 2;
        
        // 设置样式
        spark.style.cssText = `
            left: ${startX}%;
            top: ${startY}%;
            transform: scale(${scale});
            --moveX: ${moveX}px;
            --moveY: ${moveY}px;
            animation: contentSpark ${duration}s ease-out forwards;
            box-shadow: 0 0 ${2 + scale * 2}px #ffac33;
        `;
        
        contentElement.appendChild(spark);
        
        // 动画结束后移除火星
        spark.addEventListener('animationend', () => spark.remove());
    }

    // 定期创建新的火星
    function generateContentSparks() {
        if (Math.random() < 0.2) { // 20% 的概率生成火星
            createContentSpark();
        }
    }

    // 每100ms检查是否生成新火星
    const intervalId = setInterval(generateContentSparks, 100);
    
    // 当元素不可见时停止生成火星
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                clearInterval(intervalId);
            }
        });
    });
    
    observer.observe(contentElement);
}

function showHistoryPreview(data) {
    const previewList = document.getElementById('historyList');
    previewList.innerHTML = '';
    
    if (data.length === 0) {
        previewList.innerHTML = '<div class="empty-state pixel-text">暂无历史记录</div>';
        return;
    }

    // 将数据按时间倒序排列
    const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 选择要显示的记录
    let selectedRecords = new Set(); // 使用 Set 来避免重复
    
    // 1. 添加第一条记录（最早的）
    selectedRecords.add(sortedData[sortedData.length - 1]);
    
    // 2. 如果有超过3条记录，添加随机的中间记录（最多4条）
    if (sortedData.length > 3) {
        // 排除第一条和最后两条记录
        const middleRecords = sortedData.slice(1, -2);
        // 计算需要随机选择的数量（最多4条）
        const randomCount = Math.min(4, middleRecords.length);
        
        // 创建可选记录的索引数组
        const availableIndices = Array.from({ length: middleRecords.length }, (_, i) => i);
        
        // 随机选择不重复的记录
        for (let i = 0; i < randomCount && availableIndices.length > 0; i++) {
            // 随机选择一个索引位置
            const randomPosition = Math.floor(Math.random() * availableIndices.length);
            // 获取并移除选中的索引
            const selectedIndex = availableIndices.splice(randomPosition, 1)[0];
            // 添加对应的记录
            selectedRecords.add(middleRecords[selectedIndex]);
        }
    } else if (sortedData.length > 1) {
        // 如果记录数在2-3条之间，添加所有中间记录
        sortedData.slice(1, -1).forEach(record => selectedRecords.add(record));
    }
    
    // 3. 添加最后两条记录（如果存在）
    if (sortedData.length >= 2) {
        selectedRecords.add(sortedData[1]); // 倒数第二条
        selectedRecords.add(sortedData[0]); // 最新一条
    }
    
    // 转换为数组并按时间排序
    let selectedArray = Array.from(selectedRecords);
    selectedArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 确保最多显示7条记录
    selectedArray = selectedArray.slice(0, 7);

    // 显示选中的记录
    selectedArray.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item pixel-box';
        
        // 添加动画延迟
        historyItem.style.animationDelay = `${index * 0.1}s`;
        
        // 确定标签类型
        let timeLabel;
        if (index === selectedArray.length - 1 && item === sortedData[sortedData.length - 1]) {
            timeLabel = '<span class="time-label first">最初的故事 #1</span>';
        } else if (index === 0) {
            timeLabel = '<span class="time-label latest">最新故事</span>';
        } else {
            const storyNumber = sortedData.length - sortedData.indexOf(item);
            timeLabel = `<span class="time-label">故事 #${storyNumber}</span>`;
        }

        historyItem.innerHTML = `
            ${timeLabel}
            <div class="history-content larger-font">
                <p class="pixel-text"><strong>来源：</strong>${item.source || '未知'}</p>
                <p class="pixel-text"><strong>记录地点：</strong>${item.location || '未知'}</p>
                ${item.surroundings ? `<p class="pixel-text"><strong>现在正在：</strong>${item.surroundings}</p>` : ''}
                <p class="pixel-text"><strong>说到：</strong>${item.message || '无'}</p>
            </div>
            <div class="history-signature larger-font">
                <span>${formatDate(item.timestamp)}</span>
                <span class="username">${item.username ? `· ${item.username}` : '· 匿名用户'}</span>
            </div>
        `;
        
        previewList.appendChild(historyItem);
        
        // 为内容区域添加火星效果
        const contentElement = historyItem.querySelector('.history-content');
        addContentSparks(contentElement);
    });
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function getTimeLabel(index, total) {
    if (index === total - 1) {
        return '<span class="time-label first">最初的故事 #1</span>';
    }
    const storyNumber = total - index;
    return `<span class="time-label ${index === 0 ? 'latest' : ''}">${
        index === 0 ? '最新故事' : `故事 #${storyNumber}`
    }</span>`;
} 