import './App.css';
import React, { Component } from 'react';
import Wrap from './Common/Wrap';
import {Form, Button, Alert} from 'react-bootstrap';
import BE from './Common/comm';
import {UtilityFunctions as UF} from './Common/Utils';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      SessionName:"",
      SessionKey:"",
      loggedIn: false,
      invalidSessionCredentials:false,
      clients: []
    }
    this.SessionNameChanged = this.SessionNameChanged.bind(this);
    this.SessionKeyChanged = this.SessionKeyChanged.bind(this);

    this.periodicHandle = setInterval(() => {
      this.fetchData();
    }, 5000);
  }
  componentDidMount(){
    document.title = "MU Monitor";
  }

  fetchData(){
    if (this.state.loggedIn){
      BE.getSessions(this.state.SessionName, this.state.SessionKey).then((sessions)=>{
        //update state
        this.setState({clients:sessions})
      })
    }
  }

  SessionNameChanged(item){
    this.setState({SessionName:item.target.value});
  }
  SessionKeyChanged(item){
    this.setState({SessionKey:item.target.value});
  }

  go_login(e){
    BE.tryLogIn(this.state.SessionName, this.state.SessionKey).then((res)=>{
      if (res.authenticated)
        this.setState({loggedIn:res.authenticated,clients:res.payload.muclients, invalidSessionCredentials:true });
      else
        this.setState({loggedIn:res.authenticated,invalidSessionCredentials:true});
    });    
  }


  renderLoginDiv(isRegister){
    let ele = <Wrap>
        <Form onSubmit={this.onSubmitCustom}>
            <Form.Group controlId="formBasicSessionName">
                <Form.Label>Session Name</Form.Label>
                <Form.Control type="text" placeholder="Your Session name" value={this.state.SessionName} onChange={this.SessionNameChanged}/>
                <Form.Text className="text-muted">
                This is the session name you picked when started the app on your machine.
                </Form.Text>
            </Form.Group>

            <Form.Group controlId="formBasicSessionKey">
                <Form.Label>Session Key</Form.Label>
                <Form.Control name="SessionKey" type="text" placeholder="Session Key" value={this.state.SessionKey} onChange={this.SessionKeyChanged} />
                <Form.Text className="text-muted">
                This is the session key you were given after starting the app and connecting.
                </Form.Text>
            </Form.Group>
                
            <Button variant="primary" type="button" onClick={e=>this.go_login(e)}>
                Submit
            </Button> 
        </Form>
    </Wrap>;
    return ele;
}

renderData(){
  let uiClients = []
  this.state.clients.forEach(client => {
    let key_= "ui_item_of_"+client.processID;
    uiClients.push(
      <ProcessUI data={client} key={key_} name={key_}/>     
    )
  });

  let ele = <Wrap>
    <div className="client-cards-div">
      {uiClients}  
    </div>
  </Wrap>;
  
  return ele;
}
renderFailureMessage(){
  let ele = <Wrap>
    <h6 style={{color:"red"}}>Invalid session credentials or the session does not exist.</h6>
  </Wrap>
  return ele;
}

  render() {
    return (
    <div className="App">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
        integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
        crossOrigin="anonymous"
      />
      {!this.state.loggedIn ? 
      <div className="loginForm">
        {this.renderLoginDiv()}
        {
          this.state.invalidSessionCredentials ? 
          this.renderFailureMessage(): null
        }
      </div>
      :
      <div>
        {this.renderData()}       
      </div>  
    }
    </div>
    )
  
}
    
}

class ProcessUI extends Component {
  
    render(){
    let state = {
        processID: UF.isDefined(this.props.data) ? this.props.data.processID : 0,
        alias: UF.isDefined(this.props.data) ? this.props.data.alias : "",
        disconnected: UF.isDefined(this.props.data) ? this.props.data.disconnected : false,
        suspicious: UF.isDefined(this.props.data) ? this.props.data.suspicios : false,
        timestamp: UF.isDefined(this.props.data) ? this.props.data.timestamp : 0
    }
      let variant = "success";
      let message = "Seems fine.";
      if (state.disconnected){
        variant="danger";
        message = "This process was disconnected.";
      }
      else if (state.suspicious){
        variant="warning";
        message= "This process had suspiciously low activity";
      }

      let ele = <Wrap>
        <Alert variant={variant}>
        <Alert.Heading>{state.alias} ({state.processID})  </Alert.Heading>
        <p>
          {message}
        </p>
        <hr />
        <p className="mb-0">
          Timestamp: {state.timestamp}
        </p>
      </Alert>
      </Wrap>;
      return ele;
    }
  
}


export default App;