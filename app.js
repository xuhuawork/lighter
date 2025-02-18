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
    username: { 
        type: String, 
        default: '匿名用户' 
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
        
        // 创建新记录，包含用户名
        const newLighter = new Lighter({
            lighterNumber,
            source: req.body.source.trim(),
            message: req.body.message.trim(),
            location: req.body.location.trim(),
            username: req.body.username ? req.body.username.trim() : '匿名用户',
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
    } catch (error) {
        console.error('保存记录时出错:', error);
        res.status(500).json({
            success: false,
            error: '服务器错误'
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
        // 获取所有历史记录并按时间排序
        const allHistory = await Lighter.find({ lighterNumber: req.params.lighterNumber })
            .sort({ timestamp: 1 }); // 按时间正序排列

        if (allHistory.length === 0) {
            return res.json([]);
        }

        // 为每条记录添加计数
        const historyWithCount = allHistory.map((record, index) => ({
            ...record.toObject(),
            count: index + 1
        }));

        let selectedHistory = [];
        
        // 1. 添加第一条记录（最早的）
        selectedHistory.push(historyWithCount[0]);

        // 2. 如果有超过3条记录，添加随机的中间记录
        if (allHistory.length > 3) {
            // 排除第一条和最后两条记录
            const middleRecords = historyWithCount.slice(1, -2);
            // 计算需要随机选择的数量（最多4条）
            const randomCount = Math.min(4, middleRecords.length);
            
            // 随机选择记录
            const randomIndices = new Set();
            while (randomIndices.size < randomCount) {
                const randomIndex = Math.floor(Math.random() * middleRecords.length);
                randomIndices.add(randomIndex);
            }
            
            // 添加随机选择的记录
            [...randomIndices].forEach(index => {
                selectedHistory.push(middleRecords[index]);
            });
        } else if (allHistory.length > 1) {
            // 如果记录数在2-3条之间，添加所有中间记录
            selectedHistory = selectedHistory.concat(historyWithCount.slice(1, -1));
        }

        // 3. 添加最后两条记录（如果存在）
        if (allHistory.length >= 2) {
            selectedHistory.push(historyWithCount[historyWithCount.length - 2]); // 倒数第二条
        }
        if (allHistory.length >= 1) {
            selectedHistory.push(historyWithCount[historyWithCount.length - 1]); // 最后一条
        }

        // 确保最多返回6条记录
        selectedHistory = selectedHistory.slice(0, 6);

        res.json(selectedHistory);
    } catch (err) {
        console.error('获取历史记录错误:', err);
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    // 获取本机的局域网 IP 地址
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // 跳过内部 IP 和非 IPv4 地址
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`局域网访问地址: http://${net.address}:${PORT}`);
            }
        }
    }
}); 