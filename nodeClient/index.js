const os = require('os');
const io = require('socket.io-client');
const socket = io('http://127.0.0.1:8181');
socket.on('connect', ()=>{
    
    const networkInterface = os.networkInterfaces();
    let macAddress;
    for (let key in networkInterface) {
        if (!networkInterface[key][0].internal) {
            if(networkInterface[key][0].mac === '00:00:00:00:00:00'){
                macAddress = Math.random().toString(36).substr(2, 15);
            }else{
                // Gets Unique MAC Address for each client machine
                macAddress = networkInterface[key][0].mac; }
            break;
        }
    }
    
    socket.emit('clientAuth', 'somePassword');

    performanceData().then((data)=>{
        data.macAddress = macAddress;
        socket.emit('initPerformanceData', data);
    })

    let performanceDataInterval = setInterval(() => {
        performanceData().then((data)=>{
            data.macAddress = macAddress;
            socket.emit('performanceData', data);
        })
    }, 1000);
    socket.on('disconnect', ()=>{
        clearInterval(performanceDataInterval);
    })
})

function performanceData(){
    return new Promise(async(resolve, reject)=>{
        const cpus = os.cpus();
        const osType = os.type() == 'Darwin'?'Mac':os.type();
        const upTime = os.uptime();
        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        const usedMem = totalMem-freeMem;
        const memUsage = Math.floor(usedMem/totalMem*100)/100;
        const cpuModel = cpus[0].model;
        const cpuSpeed = cpus[0].speed;
        const cpuCores = cpus.length;
        const cpuLoad = await getCPULoad();   
        const isActive = true; 
        resolve({
             freeMem,
             totalMem,
             usedMem,
             memUsage,
             osType,
             upTime,
             cpuModel,
             cpuCores,
             cpuSpeed,
             cpuLoad,
             isActive
        })
    })
     
}




function cpuAverage(){
    const cpus = os.cpus();
    let idleMS = 0;
    let totalMS = 0;
    cpus.forEach((aCore)=>{
        for(key in aCore.times){
            totalMS += aCore.times[key];
        }
        idleMS+=aCore.times.idle
    });
    return {
        idle: idleMS/cpus.length,
        total: totalMS/cpus.length
    }
}

function getCPULoad(){
    return new Promise((resolve, reject)=>{
        const start = cpuAverage();
    setTimeout(()=>{
        const end = cpuAverage();
        const idleDiff = end.idle - start.idle;
        const totalDiff = end.total - start.total;
        const percentageCPU =  100 - Math.floor(100*idleDiff/totalDiff);
        resolve(percentageCPU);
    }, 100);
    })
}

