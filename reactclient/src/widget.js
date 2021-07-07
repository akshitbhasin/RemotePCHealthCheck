import React, { Component } from 'react';
import Cpu from './cpu';
import Memory from './memory';
import Info from './info';
import './widget.css';


class Widget extends Component{
    constructor(){
        super();
        this.state = {};
    }
    render(){
        const {
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
            macAddress,
            isActive
       } = this.props.data;
       const cpuWidgetId = `cpu-widget-${macAddress}`;
       const memWidgetId = `mem-widget-${macAddress}`;
       const cpu = {cpuLoad, cpuWidgetId};
       const mem = {totalMem, usedMem, memUsage, freeMem, memWidgetId};
       const info = {macAddress, osType, upTime, cpuModel, cpuCores, cpuSpeed};
       let notActiveDiv = '';
       if(!isActive){
           notActiveDiv = <div className="not-active">Offline</div>
       }

       

        return(
            <div className="widget col-sm-12">
                {notActiveDiv}
                <Cpu cpuData = {cpu} />
                <Memory memData = {mem} />
                <Info infoData = {info} />
            </div>
            
        )
    }
}
export default Widget;