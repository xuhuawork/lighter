const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// 添加在连接之前
mongoose.set('strictQuery', false);

// 更详细的数据库连接和错误处理
mongoose.connect('mongodb://127.0.0.1:27017/lighter', {
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
const Record = require('./models/Record');

// 添加访问计数器模型
const visitorSchema = new mongoose.Schema({
    count: { type: Number, default: 0 }
});
const Visitor = mongoose.model('Visitor', visitorSchema);

// 中间件
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 添加字体文件的静态服务
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));

// 确保视图引擎正确配置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// 引入路由
const indexRouter = require('./routes/index');

// 使用路由
app.use('/', indexRouter);

// 路由
app.get('/', (req, res) => {
    res.redirect('/w');
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
        
        // 创建新记录时包含 surroundings
        const newRecord = new Record({
            lighterNumber,
            source: req.body.source.trim(),
            message: req.body.message.trim(),
            location: req.body.location.trim(),
            surroundings: req.body.surroundings ? req.body.surroundings.trim() : '',  // 确保包含这个字段
            username: req.body.username ? req.body.username.trim() : '匿名用户',
            userIP
        });

        // 保存前打印记录内容
        console.log('准备保存的记录:', newRecord);

        // 保存记录
        await newRecord.save();
        console.log('记录保存成功:', newRecord);
        
        res.json({ success: true });
    } catch (error) {
        console.error('提交错误:', error);
        res.status(500).json({ success: false, error: '服务器错误' });
    }
});

app.get('/history/:lighterNumber', async (req, res) => {
    try {
        // 先获取数据，确保有数据再发送页面
        const history = await Record.find({ 
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
        const history = await Record.find({ 
            lighterNumber: req.params.lighterNumber 
        })
        .select('source location message timestamp username surroundings') // 确保选择 surroundings 字段
        .sort({ timestamp: -1 });
        
        res.json(history);
    } catch (err) {
        console.error('获取历史记录失败:', err);
        res.status(500).json({ error: '获取历史记录失败' });
    }
});

// 修改欢迎页面路由
app.get('/w', (req, res) => {
    console.log('访问欢迎页面');
    const filePath = path.join(__dirname, 'views', 'welcome.html');
    res.sendFile(filePath);
});

// 修改 /w/:number 路由
app.get('/w/:number', (req, res) => {
    const lighterNumber = parseInt(req.params.number);
    
    // 验证打火机编号
    if (isNaN(lighterNumber) || lighterNumber < 1 || lighterNumber > 25) {
        return res.redirect('/w');
    }
    
    // 重定向到带查询参数的欢迎页面
    res.redirect(`/w?number=${lighterNumber}`);
});

// 修改表单页面路由
app.get('/form', (req, res) => {
    const number = parseInt(req.query.number);
    
    // 验证打火机编号
    if (isNaN(number) || number < 1 || number > 25) {
        return res.redirect('/w');
    }
    
    // 读取HTML文件
    let formHtml = fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8');
    
    // 获取本机局域网IP
    const networkInterfaces = require('os').networkInterfaces();
    let localIP = '192.168.1.14'; // 默认IP
    
    // 查找实际的局域网IP
    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            // 跳过内部IP和非IPv4地址
            if (net.family === 'IPv4' && !net.internal) {
                localIP = net.address;
                break;
            }
        }
    }
    
    // 注入IP到页面
    formHtml = formHtml.replace('</head>',
        `<meta name="local-ip" content="${localIP}">
        </head>`
    );
    
    res.send(formHtml);
});

// 获取使用次数API
app.get('/api/usage-count/:lighterNumber', async (req, res) => {
    try {
        const count = await Record.countDocuments({ 
            lighterNumber: req.params.lighterNumber 
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: '获取使用次数失败' });
    }
});

// 获取最后位置API
app.get('/api/last-location/:lighterNumber', async (req, res) => {
    try {
        const lastRecord = await Record.findOne({ 
            lighterNumber: req.params.lighterNumber 
        })
        .sort({ timestamp: -1 })
        .select('location timestamp');
        
        res.json(lastRecord || {});
    } catch (err) {
        res.status(500).json({ error: '获取位置信息失败' });
    }
});

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 确保 404 处理在所有路由之后
app.use((req, res, next) => {
    res.status(404).send('页面未找到');
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