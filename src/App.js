import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import Profile from "./Profile";
import Home from "./Home";
import Nav from "./Nav";
import Auth from "./Auth/Auth";
import Callback from "./Callback";

class App extends Component {
  constructor(props){
    super(props);
    this.auth = new Auth(props.history);
  }

  render() {
    return (
      <>
        <Nav/>
        <div className='body'>
          <Route path='/' exact render={(props) => <Home auth={this.auth} {...props} />} />
          <Route path='/callback' exact render={(props) => <Callback auth={this.auth} {...props} />} />
          <Route path='/profile' component={Profile}/>
        </div>
      </>
    );
  }
}

export default App;
