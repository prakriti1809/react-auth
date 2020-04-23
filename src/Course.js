import React, { Component } from "react";

class Course extends Component {
  state = {
    message: "",
    courses: [],
  };

  componentDidMount() {
    fetch("/course", {
      headers: { Authorization: `Bearer ${this.props.auth.getAccessToken()}` }
    })
      .then(response => {
        if (response.ok) return response.json();
        throw new Error("Network response was not ok.");
      })
      .then(response => this.setState({ courses: response }))
      .catch(error => this.setState({ message: error.message }));

    fetch("/admin", {
      headers: { Authorization: `Bearer ${this.props.auth.getAccessToken()}` }
    })
      .then(response => {
        if (response.ok) return response.json();
        throw new Error("Network response was not ok.");
      })
      .then(response => console.log('Hello from admin API!'))
      .catch(error => this.setState({ message: error.message }));
  }

  render() {
    return <ul>
      {this.state.courses.map((course) => <li key={course.id}>{course.title}</li>)}
    </ul>;
  }
}

export default Course;
