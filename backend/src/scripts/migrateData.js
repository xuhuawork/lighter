const mongoose = require('mongoose');
const Lighter = require('../models/lighter.model');

async function migrateData() {
    try {
        // 连接旧数据库
        const oldDb = await mongoose.createConnection(process.env.OLD_MONGODB_URI);
        const oldLighters = await oldDb.collection('lighters').find({}).toArray();
        
        // 迁移到新数据库
        for (const lighter of oldLighters) {
            await Lighter.create(lighter);
        }
        
        console.log('数据迁移完成');
    } catch (error) {
        console.error('数据迁移失败:', error);
    }
} 