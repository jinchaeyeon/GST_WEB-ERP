import { memo, useEffect } from "react";
import { Handle, NodeResizer, Position } from "reactflow";

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
      <NodeResizer
        color={data.clickcolor}
        isVisible={selected}
        minWidth={100}
        minHeight={30}
      />
      <div style={{ width: "100%", height: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "30px",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              display: "block",
              color: "#8d98a4",
              marginLeft: "10px",
              marginRight: "10px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {data.label}
          </p>
        </div>
        <div
          style={{
            backgroundColor: "white",
            height: `calc(100% - 30px)`,
          }}
        />
      </div>
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
    </>
  );
});
