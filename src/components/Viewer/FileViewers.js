import React, { Component } from "react";
import FileViewer from "react-file-viewer";
import { CustomErrorComponent } from "custom-error";

class FileViewers extends Component {
  render() {
    return (
      <div key={this.props.file} ref={this.props.ref != undefined ? this.props.ref : undefined}>
        <FileViewer
          fileType={this.props.type}
          filePath={this.props.file}
          errorComponent={CustomErrorComponent}
          onError={this.onError}
        />
      </div>
    );
  }

  onError(e) {
    console.log(e, "error in file-viewer");
  }
}

export default FileViewers;
