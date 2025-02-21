const Lighter = require('../models/lighter.model');

exports.createLighter = async (req, res) => {
    try {
        // 验证请求数据
        const { lighterNumber, source, message, location, username } = req.body;
        const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const lighter = new Lighter({
            lighterNumber,
            source,
            message,
            location,
            username: username || '匿名用户',
            userIP
        });

        await lighter.save();
        res.status(201).json({ success: true, data: lighter });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getLighterHistory = async (req, res) => {
    try {
        const history = await Lighter.find({ 
            lighterNumber: req.params.number 
        }).sort({ timestamp: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 添加缺失的 getUsageCount 方法
exports.getUsageCount = async (req, res) => {
    try {
        const count = await Lighter.countDocuments({ 
            lighterNumber: req.params.number 
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 