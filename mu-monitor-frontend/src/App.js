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
    console.log("from new deploy")
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
  if (this.state.clients.length === 0){
    uiClients.push(
      <h6 key="noprocesses message">No Processes to present.</h6>
    )
  }

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

renderToS(){
  let ele = <Wrap>
    <h1>Website Terms and Conditions of Use</h1>

<h2>1. Terms</h2>

<p>By accessing this Website, accessible from www.mumonitor.com, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are protected by copyright and trade mark law.</p>

<h2>2. Use License</h2>

<p>Permission is granted to temporarily download one copy of the materials on olegvod's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>

<ul>
    <li>modify or copy the materials;</li>
    <li>use the materials for any commercial purpose or for any public display;</li>
    <li>attempt to reverse engineer any software contained on olegvod's Website;</li>
    <li>remove any copyright or other proprietary notations from the materials; or</li>
    <li>transferring the materials to another person or "mirror" the materials on any other server.</li>
</ul>

<p>This will let olegvod to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format. These Terms of Service has been created with the help of the <a href="https://www.termsofservicegenerator.net">Terms Of Service Generator</a> and the <a href="https://www.generateprivacypolicy.com">Privacy Policy Generator</a>.</p>

<h2>3. Disclaimer</h2>

<p>All the materials on olegvod’s Website are provided "as is". olegvod makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, olegvod does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>

<h2>4. Limitations</h2>

<p>olegvod or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on olegvod’s Website, even if olegvod or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.</p>

<h2>5. Revisions and Errata</h2>

<p>The materials appearing on olegvod’s Website may include technical, typographical, or photographic errors. olegvod will not promise that any of the materials in this Website are accurate, complete, or current. olegvod may change the materials contained on its Website at any time without notice. olegvod does not make any commitment to update the materials.</p>

<h2>6. Links</h2>

<p>olegvod has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by olegvod of the site. The use of any linked website is at the user’s own risk.</p>

<h2>7. Site Terms of Use Modifications</h2>

<p>olegvod may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.</p>

<h2>8. Your Privacy</h2>

<p>Please read our Privacy Policy.</p>

<h2>9. Governing Law</h2>

<p>Any claim related to olegvod's Website shall be governed by the laws of il without regards to its conflict of law provisions.</p>
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
      {this.renderToS()}
      {!this.state.loggedIn ? 
      <div className="loginForm">
        {this.renderLoginDiv()}
        {
          this.state.invalidSessionCredentials ? 
          this.renderFailureMessage(): null
        }
      </div>
      :
      <div className="dataWrapper">
        {this.renderData()}       
      </div>  
    }
    </div>
    )
  
}
    
}

class ProcessUI extends Component {
  
  render(){
      let d = 0;
      if (UF.isDefined(this.props.data) && UF.isDefined(this.props.data.timestamp)){
        d = new Date(Date.parse(this.props.data.timestamp)).toLocaleString();
      }
      let state = {
        processID: UF.isDefined(this.props.data) ? this.props.data.processID : 0,
        alias: UF.isDefined(this.props.data) ? this.props.data.alias : "",
        disconnected: UF.isDefined(this.props.data) ? this.props.data.disconnected : false,
        suspicious: UF.isDefined(this.props.data) ? this.props.data.suspicious : false,
        timestamp: d
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
      let screenWidth = window.screen.availWidth;
      let width_ = (screenWidth - 80*4 )/4  ;
      let margin_ = "3% 0% 0 20px";
      let float_ = "left";
      let style_ = {width: width_, margin:"3% 0% 0 20px", float:"left"};
      if (width_ < 300){
        style_ = {width: "300px", margin:"3% 0% 0 20px", float:"left"};
        //width_ = 300;
      }
      if( width_ < 200 ){
        margin_ = "3% auto";
        float_ = "none";
        style_ = {width: "300px", margin:"3% 0% 0 20px", float:"left"};
        
      }
      
      if( width_ < 100 ){
        margin_ = "3% auto";
        float_ = "none";
        style_ = {width: "300", margin:"3% auto", display:"block"}
      }

      let ele = <Wrap > 
        {/* <Alert style={{width: width_,margin:margin_, float:float_}} variant={variant}> */}
        <Alert style={style_} variant={variant}>
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
