import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import * as React from "react";

interface FloatingToolbarExampleProps {
  fileUrl: string;
  isMobile: boolean;
}

const FileViewers: React.FC<FloatingToolbarExampleProps> = ({
  fileUrl,
  isMobile,
}) => {
  if (isMobile) {
    return (
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={fileUrl} />
      </Worker>
    );
  } else {
    return (
      <iframe src={fileUrl + "#view=fit"} width={"100%"} height={"100%"} />
    );
  }
};

export default FileViewers;
