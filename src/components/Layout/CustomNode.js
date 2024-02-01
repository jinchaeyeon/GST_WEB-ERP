import LaunchIcon from "@mui/icons-material/Launch";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import IconButton from "@mui/material/IconButton";
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            width: "20px",
            backgroundColor: data.clickcolor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid rgba(0, 0, 0, .125)",
          }}
        >
          <div>
            {data.link == "" ? (
              <IconButton disabled>
                <LinkOffIcon sx={{ fontSize: 10 }} />
              </IconButton>
            ) : (
              <IconButton onClick={() => window.open(`${data.link}`)}>
                <LaunchIcon sx={{ fontSize: 10 }} />
              </IconButton>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: `calc(100% - 20px)`,
          }}
        >
          <p
            style={{
              display: "block",
              marginLeft: "10px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {data.label}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
    </>
  );
});
