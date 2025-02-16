const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// 添加在连接之前
mongoose.set('strictQuery', false);

// 更详细的数据库连接和错误处理
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lighter', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('MongoDB 连接成功');
    // 测试数据库操作
    return mongoose.connection.db.listCollections().toArray();
})
.then(collections => {
    console.log('现有集合:', collections.map(c => c.name));
})
.catch(err => {
    console.error('MongoDB 连接错误:', err);
});

// 定义数据模型
const lighterSchema = new mongoose.Schema({
    lighterNumber: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 25 
    },
    source: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    userIP: String
});

// 添加模型的错误处理中间件
lighterSchema.post('save', function(error, doc, next) {
    console.log('保存后中间件触发:', error);
    next(error);
});

const Lighter = mongoose.model('Lighter', lighterSchema);

// 中间件
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.get('/', (req, res) => {
    res.redirect('/welcome');
});

app.post('/submit', async (req, res) => {
    try {
        console.log('收到提交请求:', req.body);

        // 验证请求体是否为空
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('请求体为空');
            return res.status(400).json({
                success: false,
                error: '请求数据无效'
            });
        }

        // 验证所有必要字段
        const requiredFields = ['lighterNumber', 'source', 'message', 'location'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.log('缺少字段:', missingFields);
            return res.status(400).json({
                success: false,
                error: `缺少必要信息: ${missingFields.join(', ')}`
            });
        }

        const lighterNumber = parseInt(req.body.lighterNumber);
        if (isNaN(lighterNumber) || lighterNumber < 1 || lighterNumber > 25) {
            return res.status(400).json({
                success: false,
                error: '打火机编号必须在1-25之间'
            });
        }

        const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        // 创建新记录
        const newLighter = new Lighter({
            lighterNumber,
            source: req.body.source.trim(),
            message: req.body.message.trim(),
            location: req.body.location.trim(),
            userIP
        });

        // 保存前验证
        const validationError = newLighter.validateSync();
        if (validationError) {
            console.error('验证错误:', validationError);
            return res.status(400).json({
                success: false,
                error: '数据验证失败'
            });
        }

        await newLighter.save();
        console.log('记录保存成功:', newLighter);
        res.json({ success: true });
    } catch (err) {
        console.error('提交错误:', err);
        res.status(500).json({
            success: false,
            error: '提交失败，请稍后再试。',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

app.get('/history/:lighterNumber', async (req, res) => {
    try {
        // 先获取数据，确保有数据再发送页面
        const history = await Lighter.find({ 
            lighterNumber: req.params.lighterNumber 
        }).sort({ timestamp: -1 });
        
        if (history.length === 0) {
            return res.status(404).send('未找到该打火机的记录');
        }
        
        res.sendFile(path.join(__dirname, 'views', 'history.html'));
    } catch (err) {
        res.status(500).send('获取历史记录失败');
    }
});

app.get('/api/history/:lighterNumber', async (req, res) => {
    try {
        const history = await Lighter.find({ lighterNumber: req.params.lighterNumber })
            .sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: '获取历史记录失败' });
    }
});

// 欢迎页面路由
app.get('/welcome', (req, res) => {
    console.log('访问欢迎页面');
    const filePath = path.join(__dirname, 'views', 'welcome.html');
    console.log('文件路径:', filePath);
    res.sendFile(filePath);
});

// 表单页面路由
app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 获取使用次数API
app.get('/api/usage-count/:lighterNumber', async (req, res) => {
    try {
        const count = await Lighter.countDocuments({ 
            lighterNumber: req.params.lighterNumber 
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: '获取使用次数失败' });
    }
});

// 在所有路由之后添加
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
});

// 确保数据库连接正确
mongoose.connection.on('connected', () => {
    console.log('MongoDB 连接成功');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB 连接错误:', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
}); 