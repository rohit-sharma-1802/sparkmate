import React, { Component } from "react";

class ImageUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
    };
  }

  handleFileChange = (e) => {
    this.setState({
      selectedFile: e.target.files[0],
    });
  };

  handleUpload = () => {
    // Here, you can implement the code to upload the image to your server.
    // You may use a library like Axios to make the API request.
    // Example: axios.post('/upload', formData);
    // Don't forget to handle errors and success accordingly.
  };

  render() {
    return (
      <div>
        <input type="file" onChange={this.handleFileChange} />
        <button onClick={this.handleUpload}>Upload Image</button>
      </div>
    );
  }
}

export default ImageUpload;