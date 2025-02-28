// 添加新的路由
router.get('/form-step1', (req, res) => {
    res.render('form-step1');
});

router.get('/form-step2', (req, res) => {
    res.render('form-step2');
});

router.get('/form-step3', (req, res) => {
    res.render('form-step3');
});

// 修改提交路由
router.post('/submit', async (req, res) => {
    try {
        const { lighterNumber, source, location, surroundings, message, username } = req.body;

        // 验证必填字段
        if (!lighterNumber || !source || !location || !message) {
            return res.status(400).json({ success: false, error: '缺少必填字段' });
        }

        // 创建新记录
        const newRecord = new Record({
            lighterNumber,
            source,
            location,
            surroundings,  // 确保这个字段被包含
            message,
            username,
            timestamp: new Date()
        });

        await newRecord.save();
        res.json({ success: true });
    } catch (error) {
        console.error('提交错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

// 修改历史记录路由
router.get('/api/history/:lighterNumber', async (req, res) => {
    try {
        const history = await Record.find({ 
            lighterNumber: parseInt(req.params.lighterNumber) 
        })
        .select('source location message timestamp username surroundings')
        .sort({ timestamp: -1 });
        
        // 添加序号
        const historyWithCount = history.map((record, index) => ({
            ...record.toObject(),
            count: history.length - index
        }));
        
        res.json(historyWithCount);
    } catch (err) {
        console.error('获取历史记录失败:', err);
        res.status(500).json({ error: '获取历史记录失败' });
    }
}); 