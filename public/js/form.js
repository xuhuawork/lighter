document.addEventListener('DOMContentLoaded', function() {
    // 从URL获取打火机编号并自动填充
    const urlParams = new URLSearchParams(window.location.search);
    const lighterNumber = urlParams.get('number');
    if (lighterNumber) {
        document.getElementById('lighterNumber').value = lighterNumber;
    }
});

document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault(); // 阻止表单默认提交
    const button = this.querySelector('button');
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = '提交中...';

    // 获取表单数据
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    // 验证数据
    if (!data.lighterNumber || !data.source || !data.message || !data.location) {
        const errorAlert = document.querySelector('.alert.error');
        errorAlert.textContent = '请填写所有必要信息';
        errorAlert.style.display = 'flex';
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 3000);
        return;
    }

    console.log('准备发送数据:', data);

    // 发送请求
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(async response => {
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.error || response.statusText);
        }
        return responseData;
    })
    .then(result => {
        if (result.success) {
            // 提交成功后跳转到历史记录页面
            window.location.href = `/history/${data.lighterNumber}`;
            const successAlert = document.querySelector('.alert.success');
            successAlert.innerHTML = `
                <i class="fas fa-check-circle"></i> 
                提交成功！你的故事已经加入这个打火机的旅程
            `;
            successAlert.style.display = 'flex';
        } else {
            throw new Error(result.error || '提交失败');
        }
    })
    .catch(error => {
        console.error('提交错误:', error);
        const errorAlert = document.querySelector('.alert.error');
        errorAlert.textContent = error.message || '提交失败，请重试';
        errorAlert.style.display = 'flex';
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 3000);
    })
    .finally(() => {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = '提交';
    });
});

function showHistoryPreview(data) {
    const previewList = document.getElementById('previewList');
    previewList.innerHTML = '';
    
    if (data.length === 0) {
        previewList.innerHTML = '<p class="pixel-text">暂无历史记录</p>';
        return;
    }

    data.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item pixel-box';
        historyItem.innerHTML = `
            <p class="pixel-text"><strong>时间：</strong>${new Date(item.timestamp).toLocaleString()}</p>
            <p class="pixel-text"><strong>来源：</strong>${item.source || '未知'}</p>
            <p class="pixel-text"><strong>留言：</strong>${item.message || '无'}</p>
            <p class="pixel-text"><strong>使用地点：</strong>${item.location || '未知'}</p>
        `;
        previewList.appendChild(historyItem);
    });
} 