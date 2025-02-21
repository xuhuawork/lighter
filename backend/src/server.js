const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

// 添加这行来处理警告
mongoose.set('strictQuery', false);

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('数据库连接成功');
    app.listen(PORT, () => {
      console.log(`后端服务运行在 http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  }); 