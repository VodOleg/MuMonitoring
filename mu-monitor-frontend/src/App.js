import './App.css';
import React, { Component } from 'react';
import Wrap from './Common/Wrap';
import {Form, Button, Alert, Modal, InputGroup, FormControl} from 'react-bootstrap';
import BE from './Common/comm';
import {UtilityFunctions as UF} from './Common/Utils';
import logo from './logo_main.png';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      SessionName:"",
      SessionKey:"",
      loggedIn: false,
      invalidSessionCredentials:false,
      clients: [],
      showTos:false,
      showEmailConfirm:false,
      email:"",
      email_place_holder:"your email for notifications",
      email_color: "white"
    }
    this.SessionNameChanged = this.SessionNameChanged.bind(this);
    this.SessionKeyChanged = this.SessionKeyChanged.bind(this);
    
    this.periodicHandle = setInterval(() => {
      this.fetchData();
    }, 1000 * 30);
  }
  componentDidMount(){
    document.title = "MU Monitor";
  }

  fetchData(){
    if (this.state.loggedIn){
      BE.getSessions(this.state.SessionName, this.state.SessionKey).then((sessions)=>{
        //update state
        let loggedIn = UF.isDefined(sessions);
        if ( loggedIn){
          loggedIn = UF.isDefined(sessions.username) && UF.isDefined(sessions.sessionKey);
        }
        if (loggedIn){
          loggedIn = UF.isNonEmptyString(sessions.username) && UF.isNonEmptyString(sessions.sessionKey);
        }
        if (loggedIn){
          let email = UF.isDefined(sessions.email) ? sessions.email : "your email for notifications";
          this.setState({clients:sessions.muclients, email_place_holder:email})
        }else{
          this.setState({loggedIn:false})
        }
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
      if (res.authenticated){
        let _email = this.state.email_place_holder;
        let _color = this.state.email_color;
        if( UF.isDefined(res.payload.email)){
          _email = res.payload.email;
          _color = "#dffcc0";
        }
        this.setState({loggedIn:res.authenticated,clients:res.payload.muclients,email_place_holder:_email ,email_color:_color, invalidSessionCredentials:false });
      }
      else
        this.setState({loggedIn:res.authenticated,invalidSessionCredentials:true});
    });    
  }


  renderLoginDiv(isRegister){
    let ele = <Wrap>
        <Form onSubmit={this.onSubmitCustom}>
            <Form.Group controlId="formBasicSessionName">
                <Form.Label>Session Name</Form.Label>
                <Form.Control type="text" placeholder="Your Session Name" value={this.state.SessionName} onChange={this.SessionNameChanged}/>
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
                
            <Button style={{background:"#40b385", borderColor:"#3a3a3a"}} type="button" onClick={e=>this.go_login(e)}>
                Submit
            </Button> 
        </Form>
    </Wrap>;
    return ele;
}

resetNotificationHandle(processID){
  BE.resetNotification(this.state.SessionName, this.state.SessionKey, processID).then((response)=>{
    if (response){
      this.fetchData();
    }
  })
}

renderData(){
  let uiClients = []
  let ad_index = 0;
  let ad_key = 0;
  uiClients.push(<Ad key={"ad_"+ad_key}>This ad could be yours!</Ad>)
  ad_index++;
  if (this.state.clients.length === 0){
    uiClients.push(
      <Wrap key="no processes message wrap">
      <br />
      <h6 key="noprocesses message">No Processes to present.</h6>
    </Wrap>
    )
  }else{
    try{
      this.state.clients.forEach(client => {
        let key_= "ui_item_of_"+client.processID;
        uiClients.push(
          <ProcessUI data={client} key={key_} name={key_} resetNotificationCB={this.resetNotificationHandle.bind(this)}/>     
          )
          if(ad_index % 5 === 0){
            ad_index = 1;
            ad_key++;
            uiClients.push(<Ad key={"ad_"+ad_key}>This ad could be yours!</Ad>)
        }else{
          ad_index++;
        }
      });
    }catch(exc){
    }
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

confirmationClose(){
  this.setState({showEmailConfirm:false});
}

verifyCode(code){
  let verified = this.state.emailVerificationCode === code.value;
  if( !verified ){
    // notify wrong code
    alert("incorrect code, check the email for the code MuMonitor has sent.");
    this.setState({
      email_color:"#fed5d9"
    })
  }else{
    if(UF.isNonEmptyString(this.state.email)){
      BE.notifyMailVerified(this.state.SessionName, this.state.SessionKey, this.state.email);
      this.setState({
        email_color:"#dffcc0",
        showEmailConfirm: false
      })
    }
  }
}

renderEmailModal(){
  let ele = <Wrap>
    <SimpleMessageModal onClose={this.confirmationClose.bind(this)}>
      <p>Update mail for this session.<br />
      Please note:<br />
      - You will receive one email per client event.<br />
      - Email might be filtered to spam box. </p>
      <p className="mb-0" style={{fontSize:"small"}}>
          To use email notification please verify the email by filling in the code sent to the email you submmitted.<br />
          * <span style={{color:"gray", fontSize:"smaller"}}>The verification is required once per email address.</span>
          <div style={{width:"200px"}}>
          <InputWithSubmit
          value="" 
          type="number" 
          placeholder={"4-digit code."} 
          title="Code" 
          applyCB={this.verifyCode.bind(this)}
           ></InputWithSubmit>
           </div>
      </p>
    </SimpleMessageModal>
  </Wrap>
  return ele;
}

renderToS(){
  let ele = <Wrap>
    <SimpleMessageModal onClose={this.tosClosed.bind(this)}>

    <div className="tos-container">
    <h1>MuMonitor Terms and Conditions of Use</h1>

<h6>1. Terms</h6>

<p>By accessing this Website, accessible from www.mumonitor.com, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are protected by copyright and trade mark law.</p>

<h6>2. Use License</h6>

<p>Permission is granted to temporarily download one copy of the materials on olegvod's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>

<ul>
    <li>modify or copy the materials;</li>
    <li>use the materials for any commercial purpose or for any public display;</li>
    <li>attempt to reverse engineer any software contained on olegvod's Website;</li>
    <li>remove any copyright or other proprietary notations from the materials; or</li>
    <li>transferring the materials to another person or "mirror" the materials on any other server.</li>
</ul>

<p>This will let olegvod to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format. These Terms of Service has been created with the help of the <a href="https://www.termsofservicegenerator.net">Terms Of Service Generator</a> and the <a href="https://www.generateprivacypolicy.com">Privacy Policy Generator</a>.</p>

<h6>3. Disclaimer</h6>

<p>All the materials on olegvod’s Website are provided "as is". olegvod makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, olegvod does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>

<h6>4. Limitations</h6>

<p>olegvod or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on olegvod’s Website, even if olegvod or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.</p>

<h6>5. Revisions and Errata</h6>

<p>The materials appearing on olegvod’s Website may include technical, typographical, or photographic errors. olegvod will not promise that any of the materials in this Website are accurate, complete, or current. olegvod may change the materials contained on its Website at any time without notice. olegvod does not make any commitment to update the materials.</p>

<h6>6. Links</h6>

<p>olegvod has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by olegvod of the site. The use of any linked website is at the user’s own risk.</p>

<h6>7. Site Terms of Use Modifications</h6>

<p>olegvod may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.</p>

<h6>8. Your Privacy</h6>

<p>Please read our Privacy Policy.</p>

<h6>9. Governing Law</h6>

<p>Any claim related to olegvod's Website shall be governed by the laws of il without regards to its conflict of law provisions.</p>
  </div>
<a href="https://github.com/VodOleg/MuMonitoring/releases/download/1.1/MuMonitor.zip">Agree and Download</a>
</SimpleMessageModal>

  </Wrap>
  return ele;
}

renderFooter(){
  let ele = <Wrap>
    <footer className="footer-continer">  
    For business and feature request inquiries, please reach out to mumonitor.com@gmail.com<br />
    @Copyright OlegVod 2021- All Right Reserved.   
    </footer>
  </Wrap>
  return ele;
}



downloadClicked(){
  this.setState({
    showTos:true
  })
}

tosClosed(){
  this.setState({
    showTos:false
  })
}

registerEmail(item){
  BE.registerEmail(this.state.SessionName,this.state.SessionKey,item.value).then((emailObj)=>{
    if (UF.isDefined(emailObj)){
      if (emailObj.verified){
        this.setState({
          email:item.value,
          email_color:"#dffcc0"
        })
      }else if(emailObj.banned){
        this.setState({
          email:item.value,
          email_color:"#fed5d9"
        })
      }else
      {
        this.setState({
          email:item.value,
          emailVerificationCode: emailObj.code,
          showEmailConfirm:true
        });
      }
    }
    
  });
  // if mail verified notify all set
  // else promt with email confirm
}

renderGeneral(){
  let ele = <Wrap>
    <div className="general-content">
      <div>
        <span id="heading1">Simple to use:</span><br />
        1. <span className="download-cfa" onClick={(e)=>{this.downloadClicked(e)}}>Download</span> and run the app. <br />
        2. In the app chose a session name and you will be assigned with a session key.<br />
        3. Login this page using your session name and the assigned key.<br />
      </div>
    </div>
  </Wrap>
  return ele;
}

  render() {
    return (<Wrap>
    <div className="App">
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
        integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
        crossOrigin="anonymous"
      />
      <div className="logo-container">
        <img src={logo} alt="MuMonitor"></img>
      </div>
      {!this.state.loggedIn ? 
      <Wrap>
        <div className="loginForm">
          {this.state.showTos ? this.renderToS() : null}
          {this.renderLoginDiv()}
          {
            this.state.invalidSessionCredentials ? 
            this.renderFailureMessage(): null
          }
        </div>
        <br />
        <div className="general">
          {this.renderGeneral()}
        </div>

      </Wrap>
      :
      <Wrap>
        <div style={{width:window.screen.availWidth < 500 ? window.screen.availWidth - 40 : 500, margin:"20px auto"}}>
          <InputWithSubmit 
          value="" 
          type="email" 
          placeholder={this.state.email_place_holder} 
          title="Email" 
          color={this.state.email_color}
          applyCB={this.registerEmail.bind(this)} />

        </div>

          {this.state.showEmailConfirm ? this.renderEmailModal(): null}
      <div className="dataWrapper">
        {this.renderData()}       
      </div>  
      </Wrap>
    }
    {
    }
    </div>
    {this.renderFooter()}
    </Wrap>
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
        timestamp: d,
        notified: UF.isDefined(this.props.data) ? this.props.data.notified : false
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
      let style_ = {width: width_, margin:"3% 0% 0 20px", float:"left",minHeight:"200px"};
      if (width_ < 300){
        style_ = {width: "300px", margin:"3% 0% 0 20px", float:"left",minHeight:"200px"};
      }
      if( width_ < 200 ){
        style_ = {width: "300px", margin:"3% 0% 0 20px", float:"left",minHeight:"200px"};
        
      }
      
      if( width_ < 100 ){
        style_ = {width: "300", margin:"3% auto", display:"block",minHeight:"200px"}
      }

      let ele = <Wrap > 
        <Alert style={style_} variant={variant}>
        <Alert.Heading>{state.alias} ({state.processID}) </Alert.Heading>
        <p>
          {message}
          {state.notified ? <Wrap><br /><span style={{color:"red", fontSize:"small"}}>notified by email.</span> <Button onClick={(e)=>{this.props.resetNotificationCB(state.processID)}} title="Reset notification." variant="outline-secondary" size="sm" className="reset-notification"><i className="fa fa-refresh fa-spin" style={{fontSize:"12px"}}></i></Button></Wrap> : null}
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


class Ad extends Component {
  
  render(){
      
      let variant = "light";
      
      let screenWidth = window.screen.availWidth;
      let width_ = (screenWidth - 80*4 )/4  ;
      let style_ = {borderColor:"lightgrey" ,width: width_, margin:"3% 0% 0 20px", float:"left",minHeight:"200px"};
      if (width_ < 300){
        style_ = {borderColor:"lightgrey" ,width: "300px", margin:"3% 0% 0 20px", float:"left",minHeight:"200px"};
      }
      if( width_ < 200 ){
        style_ = {borderColor:"lightgrey" ,width: "300px", margin:"3% 0% 0 20px", float:"left",minHeight:"200px"};
      }
      if( width_ < 100 ){
        style_ = {borderColor:"lightgrey" ,width: "300", margin:"3% auto", display:"block",minHeight:"200px"}
      }
      

      let ele = <Wrap > 
        <Alert style={style_} variant={variant}>
        <Alert.Heading> Advertisment </Alert.Heading>
        <p>
          {this.props.children}
        </p>
        <hr />
        <p>
          mumonitor.com@gmail.com
        </p>
      
      </Alert>
      </Wrap>;
      return ele;
    }
  
}

class SimpleMessageModal extends Component {

  constructor(props){
      super(props);
      this.onCloseCB=props.onClose;
      this.state = {
          show: true,
      }       

  }

  handleClose(){
      this.setState({show:false});
      this.onCloseCB("modal closed");
  }

  handleShow(){
      this.setState({show:true});
  }

  render() {
      return (
          <div>
              <Modal show={this.state.show} onHide={this.handleClose.bind(this)}>
                  <Modal.Header>
                  <Modal.Title>{this.props.message}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      {this.props.children}
                  </Modal.Body>
                  <Modal.Footer>
                  </Modal.Footer>
              </Modal>
          </div>
      )
  }
}

class InputWithSubmit extends Component {
    
  constructor(props){
      super(props);
      this.textInput = React.createRef();
  }

  handleApply(e){
      let data = {
          key: this.props.title,
          value: this.textInput.current.value
      };
      this.props.applyCB(data);
  }

  render() {
    let _color ="white";
    if(UF.isDefined(this.props.color)){
      _color = this.props.color;
    }
      return (
          <InputGroup size="sm" className="mb-3 btn-group-sm inBox">
              <InputGroup.Prepend>
                  <InputGroup.Text className="logName">{this.props.title}</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl
              style={{backgroundColor:_color}}
              placeholder={this.props.placeholder}
              aria-label={this.props.title}
              aria-describedby="basic-addon2"
              ref={this.textInput}
              type={this.props.type}
              />
              <InputGroup.Append>
              <Button variant="outline-secondary" onClick={(e)=>{this.handleApply(e)}}>Apply</Button>
              </InputGroup.Append>
          </InputGroup>
      )
  }
}



export default App;
