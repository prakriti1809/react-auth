import React, {Component} from 'react';
import {Route} from 'react-router-dom';
import Profile from "./Profile";
import Home from "./Home";
import Nav from "./Nav";
import Auth from "./Auth/Auth";
import Callback from "./Callback";
import Public from "./Public";
import Private from "./Private";
import Course from "./Course";
import PrivateRoute from "./PrivateRoute";
import AuthContext from './AuthContext';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      auth: new Auth(props.history),
      tokenRenewalComplete: false
    };
  }

  componentDidMount() {
    this.state.auth.renewToken(() => this.setState({ tokenRenewalComplete: true }));
  }

  render() {
    const { auth, tokenRenewalComplete } = this.state;
    if (!tokenRenewalComplete) return <h1>Loading...</h1>;

    return (
      <AuthContext.Provider value={auth}>
        <Nav auth={auth}/>
        <div className='body'>
          <Route path='/' exact render={(props) => <Home auth={auth} {...props} />} />
          <Route path='/callback' exact render={(props) => <Callback auth={auth} {...props} />} />
          <PrivateRoute path='/profile' component={Profile}/>
          <Route path='/public' component={Public} />
          <PrivateRoute path='/private' component={Private}/>
          <PrivateRoute path='/course' component={Course} scopes={['read:courses']}/>
        </div>
      </AuthContext.Provider>
    );
  }
}

export default App;
