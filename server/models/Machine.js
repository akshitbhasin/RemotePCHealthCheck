const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Machine = new Schema({
     macAddress: String,
    
    freeMem: Number,
    totalMem: Number,
    usedMem: Number,
    memUsage: Number,
    upTime: Number,
    cpuModel: String,
    cpuCores: Number,
    cpuSpeed: Number,
    cpuLoad: Number,
    osType: String,
});

module.exports = mongoose.model('Machine', Machine);
