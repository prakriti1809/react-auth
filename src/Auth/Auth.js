import auth from 'auth0-js';

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
    this.auth.authorize();
  };

  handleAuthentication = () => {
    this.auth.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        this.history.push('/');
      } else if (err) {
        this.history.push('/');
        alert(`Error: ${err.error}. Check the console for further information.`);
        console.log(err);
      }
    });
  };

  setSession = (authResult) => {
    // set the time that the access token will expire
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.accessToken);
    localStorage.setItem('expiresAt', expiresAt);
    localStorage.setItem('scopes', JSON.stringify(this.requestedScopes));
  };

  isAuthenticated = () => {
    return new Date().getTime() < JSON.parse(localStorage.getItem("expiresAt"));
  };

  logout = () => {
    ['access_token', 'id_token', 'expiresAt', 'scopes'].forEach((item) => localStorage.removeItem(item));
    // this.history.push("/"); // for local logout
    this.auth.logout({
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      returnTo: 'http://localhost:3000'
    });
  };

  getAccessToken = () => {
    const accessToken = localStorage.getItem('access_token');
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
    const grantedScopes = JSON.parse(localStorage.getItem('scopes') || '').split(' ');
    return scopes.every(scope => grantedScopes.includes(scope));
  };
}
