const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://<YOUR_CREDENTIALS>@cluster0.niocv.mongodb.net/<YOUR_DATABSE>?retryWrites=true&w=majority', {useNewUrlParser:true, useUnifiedTopology: true})
.then(console.log("MongoDB Connected on worker threads"))
.catch((err)=>{
    console.log(err);
})
const Machine = require('./models/Machine');




function socketMain(io, socket) {
    let macAddress;
    socket.on('clientAuth', (secretKey)=>{
        if(secretKey === 'somePassword')
            socket.join('clients');
        else if(secretKey === 'someUIKey'){
            socket.join('ui');
            console.log("A React Client Has Joined");
            Machine.find({}, (err, docs)=>{
                docs.forEach((machine)=>{
                    // Assume All Machines are offline on load
                    machine.isActive = false;
                    io.to('ui').emit('data', machine);
                });
            });
        }else
            socket.disconnect(true);    
    })

    socket.on('disconnect', ()=>{
             Machine.find({macAddress: macAddress}, (err, docs)=>{
                 if(docs.length>0){
                    docs[0].isActive = false;
                     io.to('ui').emit('data', docs[0]);
                 }
             });
    })

    // verifying if a new machine has connected
    socket.on('initPerformanceData', async (data)=>{
        macAddress = data.macAddress;
        const response = await checkAndAdd(data);
        console.log(response);   
    });

    // RealTime Data Flow
    socket.on('performanceData', (data)=>{
        io.to('ui').emit('data', data);
        console.log("Data Sent!");
    })
}

function checkAndAdd(data){
    return new Promise((resolve, reject)=>{
        Machine.findOne(
            {macAddress: data.macAddress},
            (err, docs)=>{
                if(err)
                    {throw err;
                    reject(err);
                }else if(docs === null){
                    // Works whenever a new machine joins, so add to MongoDB
                    let newMachine = new Machine(data);
                    newMachine.save();
                    resolve('A New Machine Added To DB');
                }else{
                    resolve('Machine Found On DB');
                }

            }
        )
    });

}

module.exports = socketMain;