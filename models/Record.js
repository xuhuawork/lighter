const mongoose = require('mongoose');

// 修改记录模型
const recordSchema = new mongoose.Schema({
    lighterNumber: { type: Number, required: true },
    source: { type: String, required: true },
    location: { type: String, required: true },
    surroundings: { type: String }, // 确保包含这个字段
    message: { type: String, required: true },
    username: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Record', recordSchema); 