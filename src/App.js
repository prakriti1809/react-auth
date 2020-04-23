import React, {Component} from 'react';
import {Route, Redirect} from 'react-router-dom';
import Profile from "./Profile";
import Home from "./Home";
import Nav from "./Nav";
import Auth from "./Auth/Auth";
import Callback from "./Callback";
import Public from "./Public";
import Private from "./Private";
import Course from "./Course";

class App extends Component {
  constructor(props){
    super(props);
    this.auth = new Auth(props.history);
  }

  render() {
    const {isAuthenticated, login, userHasScopes} = this.auth;
    return (
      <>
        <Nav auth={this.auth}/>
        <div className='body'>
          <Route path='/' exact render={(props) => <Home auth={this.auth} {...props} />} />
          <Route path='/callback' exact render={(props) => <Callback auth={this.auth} {...props} />} />
          <Route path='/profile' render={
            (props) => isAuthenticated()
              ? <Profile auth={this.auth} {...props} />
              : <Redirect to='/' />
          } />
          <Route path='/public' component={Public} />
          <Route path='/private' render={(props) => {
            if (isAuthenticated()) {
              return <Private auth={this.auth} {...props} />
            } else {
              login();
              return null;
            }
          }
          } />
          <Route path='/course' render={(props) => {
            if (isAuthenticated() && userHasScopes(['read:courses'])) {
              return <Course auth={this.auth} {...props} />
            } else {
              login();
              return null;
            }
          }
          } />
        </div>
      </>
    );
  }
}

export default App;
