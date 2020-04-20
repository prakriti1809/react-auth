import auth from 'auth0-js';

export default class Auth {
  constructor(history) {
    this.history = history;
    this.auth = new auth.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
      redirectUri: process.env.REACT_APP_AUTH0_CALLBACK_URI,
      responseType: 'token id_token',
      scope: 'openid profile email'
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
    const expiresAt = JSON.stringify(authResult.expiresIn*1000 + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.accessToken);
    localStorage.setItem('expiresAt', expiresAt);
  };

  isAuthenticated = () => {
    return new Date().getTime() < localStorage.getItem("expiresAt");
  };
}
