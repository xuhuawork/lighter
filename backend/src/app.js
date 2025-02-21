const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const path = require('path');
const LighterHistory = require('./models/LighterHistory');

const app = express();

// 允许跨域请求
app.use(cors());
app.use(express.json());

// 添加静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 添加表单页面路由
app.get('/form', (req, res) => {
  const formPath = path.join(__dirname, 'views', 'index.html');
  console.log('Serving form from:', formPath);
  res.sendFile(formPath);
});

// 修改表单提交路由
app.post('/api/submit', async (req, res) => {
    try {
        // 验证请求体
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                error: '请求数据无效'
            });
        }

        // 验证必要字段
        const requiredFields = ['lighterNumber', 'source', 'message', 'location'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `缺少必要信息: ${missingFields.join(', ')}`
            });
        }

        // 创建并保存新记录
        const newRecord = new LighterHistory({
            lighterNumber: parseInt(req.body.lighterNumber),
            source: req.body.source,
            message: req.body.message,
            location: req.body.location,
            username: req.body.username || '匿名用户',
            createdAt: new Date()
        });

        // 保存到数据库
        await newRecord.save();
        console.log('记录已保存:', newRecord);

        res.json({ success: true });
    } catch (error) {
        console.error('提交失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 添加处理单个打火机历史记录页面的路由
app.get('/:number', async (req, res) => {
    const number = parseInt(req.params.number);
    if (isNaN(number) || number < 1 || number > 25) {
        return res.status(404).send('无效的打火机编号');
    }
    
    // 发送历史记录页面
    const historyPath = path.join(__dirname, 'views', 'history.html');
    res.sendFile(historyPath);
});

// 修改获取历史记录的路由
app.get('/api/lighters/:number/history', async (req, res) => {
    try {
        const number = parseInt(req.params.number);
        if (isNaN(number) || number < 1 || number > 25) {
            return res.status(400).json({
                success: false,
                error: '无效的打火机编号'
            });
        }

        // 从数据库获取历史记录
        const history = await LighterHistory.find({ lighterNumber: number })
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        console.error('获取历史记录失败:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 路由模块化
const lighterRoutes = require('./routes/lighter.routes');
app.use('/api/lighters', lighterRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 在 Express 初始化后添加
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lighter', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('成功连接到 MongoDB'))
.catch(err => console.error('MongoDB 连接失败:', err));

module.exports = app; 