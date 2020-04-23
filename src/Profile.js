import React, {Component} from 'react';

class Profile extends Component {
  state = {
    profile: {},
    error: ''
  };

  componentDidMount() {
    this.loadUserInfo();
  }

  loadUserInfo = () => {
    this.props.auth.getProfile((profile, error) => this.setState({ profile, error }));
  };

  render() {
    const { profile }  = this.state;
    return (
      <>
        <h1>
          Profile
        </h1>
        <h2>{profile.nickname}</h2>
        <img src={profile.picture} style={{maxWidth: 100}} alt='profile'/>
        <pre>
          {JSON.stringify(profile, null, 2)}
        </pre>
      </>

    );
  }
}

export default Profile;
