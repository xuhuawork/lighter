document.addEventListener('DOMContentLoaded', function() {
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

function showHistoryPreview(data) {
    const previewList = document.getElementById('historyList');
    previewList.innerHTML = '';
    
    if (data.length === 0) {
        previewList.innerHTML = '<p class="pixel-text">暂无历史记录</p>';
        return;
    }

    data.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item pixel-box';
        
        // 添加特殊标记
        let timeLabel = '';
        if (index === 0) {
            timeLabel = '<span class="time-label first">最初的故事 #1</span>';
        } else if (index === data.length - 2) {
            timeLabel = `<span class="time-label previous">第 ${item.count} 个故事</span>`;
        } else if (index === data.length - 1) {
            timeLabel = `<span class="time-label latest">第 ${item.count} 个故事</span>`;
        } else {
            timeLabel = `<span class="time-label">第 ${item.count} 个故事</span>`;
        }

        historyItem.innerHTML = `
            ${timeLabel}
            <div class="history-content">
                <p class="pixel-text"><strong>时间：</strong>${new Date(item.timestamp).toLocaleString()}</p>
                <p class="pixel-text"><strong>来源：</strong>${item.source || '未知'}</p>
                <p class="pixel-text"><strong>留言：</strong>${item.message || '无'}</p>
                <p class="pixel-text"><strong>使用地点：</strong>${item.location || '未知'}</p>
            </div>
            <div class="history-signature">
                <p class="pixel-text username">
                    ${item.username ? `${item.username}` : '匿名用户'}
                </p>
            </div>
        `;
        previewList.appendChild(historyItem);
    });
} 