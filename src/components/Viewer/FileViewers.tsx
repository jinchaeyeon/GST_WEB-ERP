import * as React from "react";

interface FloatingToolbarExampleProps {
  fileUrl: string;
}

const FileViewers: React.FC<FloatingToolbarExampleProps> = ({ fileUrl }) => {
  return (
    <iframe
      src={fileUrl}
      width={"100%"}
      height={"100%"}
    />
  );
};

export default FileViewers;
