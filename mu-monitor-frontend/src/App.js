import './App.css';
import React, { Component } from 'react';
import Wrap from './Common/Wrap';
import {Form, Button} from 'react-bootstrap';
import BE from './Common/comm';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      SessionName:"",
      SessionKey:"",
      loggedIn: false,
      clients: []
    }
    this.SessionNameChanged = this.SessionNameChanged.bind(this);
    this.SessionKeyChanged = this.SessionKeyChanged.bind(this);
  }
  componentDidMount(){
    document.title = "MU Monitor";
  }

  SessionNameChanged(item){
    this.setState({SessionName:item.target.value});
  }
  SessionKeyChanged(item){
    this.setState({SessionKey:item.target.value});
  }

  go_login(e){
    BE.tryLogIn(this.state.SessionName, this.state.SessionKey).then((res)=>{
      console.log("APP: logged in" + JSON.stringify(res) );
      if (res.authenticated)
        this.setState({loggedIn:res.authenticated,clients:res.payload.muclients });
      else
        this.setState({loggedIn:res.authenticated});
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
  let ele = <Wrap>
    {JSON.stringify(this.state.clients)}  
  </Wrap>;
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

export default App;
