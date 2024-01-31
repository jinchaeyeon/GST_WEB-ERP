import React, { memo } from "react";
import { Handle, Position,  } from "reactflow";

export default memo(({ data }) => {
  return (
    <>
      <div>{data.label}</div>
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom"/>
      <Handle type="source" position={Position.Left} id="left"/>
    </>
  );
});
