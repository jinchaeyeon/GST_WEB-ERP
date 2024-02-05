import { memo, useEffect } from "react";
import { Handle, NodeResizer, Position } from "reactflow";
import image_add from "../../img/image_add.png";

export default memo(({ data, selected }) => {
  useEffect(() => {
    const errorHandler = (e) => {
      if (
        e.message.includes(
          "ResizeObserver loop completed with undelivered notifications" ||
            "ResizeObserver loop limit exceeded"
        )
      ) {
        const resizeObserverErr = document.getElementById(
          "webpack-dev-server-client-overlay"
        );
        if (resizeObserverErr) {
          resizeObserverErr.style.display = "none";
        }
      }
    };
    window.addEventListener("error", errorHandler);

    return () => {
      window.removeEventListener("error", errorHandler);
    };
  }, []);
  return (
    <>
      <NodeResizer isVisible={selected} minWidth={100} minHeight={30} />
      <div style={{ width: "100%", height: "100%" }}>
        {data.url == "" ? (
          <img src={image_add} style={{ width: "100%", height: "100%" }} />
        ) : (
          <img src={data.url} style={{ width: "100%", height: "100%" }}/>
        )}
      </div>
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
    </>
  );
});
