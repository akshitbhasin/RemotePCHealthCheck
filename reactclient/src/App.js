import React, {Component} from 'react';
import socket from './utilities/socketConnection';
import Widget from './widget';
class App extends Component {
  constructor(){
    super();
    this.state = {
      performanceData: {}
    };
  };

  componentDidMount(){
    socket.on('data', (data)=>{
    const currentState = ({...this.state.performanceData});
    // MAC Address Is Used To Identify The Machine
    currentState[data.macAddress] = data;
    this.setState({
      performanceData: currentState
    })
    })
  }   
  
  
  render() {
    console.log(this.state.performanceData);
    let widgets = [];
    const data = this.state.performanceData;
    Object.entries(data).forEach(([key, value])=>{
      widgets.push(<Widget key = {key} data = {value} />);
    })
    return (
    <div className="App">
      {widgets}
    </div>
  );}
}

export default App;
