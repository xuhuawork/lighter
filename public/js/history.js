document.addEventListener('DOMContentLoaded', function() {
    const pathParts = window.location.pathname.split('/');
    const lighterNumber = pathParts[pathParts.length - 1];
    document.getElementById('lighterNumber').textContent = lighterNumber;

    fetch(`/api/history/${lighterNumber}`)
        .then(response => response.json())
        .then(data => {
            const historyList = document.getElementById('historyList');
            if (data.length === 0) {
                historyList.innerHTML = '<p>暂无历史记录</p>';
                return;
            }

            data.forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <p><strong>时间：</strong>${new Date(item.timestamp).toLocaleString()}</p>
                    <p><strong>来源：</strong>${item.source || '未知'}</p>
                    <p><strong>留言：</strong>${item.message || '无'}</p>
                    <p><strong>使用地点：</strong>${item.location || '未知'}</p>
                `;
                historyList.appendChild(historyItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('historyList').innerHTML = '<p>加载历史记录失败，请稍后再试。</p>';
        });
}); 