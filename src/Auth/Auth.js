import auth from 'auth0-js';

export const REDIRECT_ON_LOGIN = 'redirect_on_login';

let _idToken = null;
let _accessToken = null;
let _expiresAt = null;
let _scopes = null;

export default class Auth {
  constructor(history) {
    this.userProfile = null;
    this.history = history;
    this.requestedScopes = 'openid profile email read:courses';
    this.auth = new auth.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URI,
      audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      responseType: 'token id_token',
      scope: this.requestedScopes,
    });
  }

  login = () => {
    localStorage.setItem(
      REDIRECT_ON_LOGIN,
      JSON.stringify(this.history.location));
    this.auth.authorize();
  };

  handleAuthentication = () => {
    this.auth.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        const redirectLocation = localStorage.getItem(REDIRECT_ON_LOGIN) === undefined
          ? '/' : JSON.parse(localStorage.getItem(REDIRECT_ON_LOGIN));
        this.history.push(redirectLocation);
      } else if (err) {
        this.history.push('/');
        alert(`Error: ${err.error}. Check the console for further information.`);
        console.log(err);
      }
      localStorage.removeItem(REDIRECT_ON_LOGIN);
    });
  };

  setSession = (authResult) => {
    // set the time that the access token will expire
    _expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    _scopes = authResult.scope || this.requestedScopes || '';

    _accessToken = authResult.accessToken;
    _idToken = authResult.idToken;

    this.scheduleTokenRenewal();
  };

  isAuthenticated = () => {
    return new Date().getTime() < _expiresAt;
  };

  logout = () => {
    // this.history.push("/"); // for local logout
    this.auth.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: 'http://localhost:3000'
    });
  };

  getAccessToken = () => {
    const accessToken = _accessToken;
    if (!accessToken) {
      throw new Error('Could not get access token.');
    }
    return accessToken;
  };

  getProfile = (cb) => {
    if (this.userProfile) return cb(this.userProfile);
    this.auth.client.userInfo(this.getAccessToken(), (err, profile) => {
      if (profile) {
        this.userProfile = profile;
      }
      cb(profile, err);
    });
  };

  userHasScopes = (scopes) => {
    const grantedScopes = _scopes.split(' ');
    return scopes.every(scope => grantedScopes.includes(scope));
  };

  renewToken(cb) {
    this.auth.checkSession({}, (err, result) => {
      if(err) {
        console.log(`Error ${err.error} - ${err.error_description}.`);
      } else {
        this.setSession(result);
      }
      if (cb) cb(err, result);
    });
  }

  scheduleTokenRenewal() {
    const delay = _expiresAt - Date.now();
    if (delay > 0) setTimeout(() => this.renewToken(), delay);
  }
}
