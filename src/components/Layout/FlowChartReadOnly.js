import { useEffect, useState } from "react";
import ReactFlow, {
  ConnectionMode,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { GridContainer, GridContainerWrap } from "../../CommonStyled";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
} from "../CommonFunction";
import CustomNode from "./CustomNode";
import GroupNode from "./GroupNode";
import ImageNode from "./ImageNode";
const nodeTypes = {
  customNode: CustomNode,
  groupNode: GroupNode,
  imageNode: ImageNode,
};

const FlowChartReadOnly = (props) => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [bizComponentData, setBizComponentData] = useState(null);
  UseBizComponent(
    "L_SY060_COLOR",
    //품목계정, 수량단위
    setBizComponentData
  );
  const [customOptionData, setCustomOptionData] = useState(null);
  UseCustomOption(setCustomOptionData);
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const { setViewport } = useReactFlow();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [Information, setInformation] = useState({
    orgdiv: sessionOrgdiv,
    location: "",
    layout_key: "",
    layout_id: "",
    layout_name: "",
    attdatnum: "",
    background_image: "",
    view: {
      x: 0,
      y: 0,
      zoom: 1,
    },
  });

  useEffect(() => {
    const data = props.data;
    if (props.data.length > 0) {
      const info = data.filter((item) => item.type == "data")[0];
      const nodeList = data.filter((item) => item.type == "node");
      const edgeList = data.filter((item) => item.type == "edge");
      if (nodeList.length > 0) {
        const nodeData = nodeList.map((item) => {
          return item.config_json_s;
        });
        setNodes(nodeData);
      }
      if (edgeList.length > 0) {
        const edgeData = edgeList.map((item) => {
          return item.config_json_s;
        });
        setEdges(edgeData);
      }
      setInformation({
        orgdiv: props.filters.orgdiv,
        location: props.filters.location,
        layout_key: props.filters.layout_key,
        layout_id: props.filters.layout_id,
        layout_name: props.filters.layout_name,
        attdatnum: props.filters.attdatnum,
        background_image: info.background_image,
        view: info.view,
      });
      setViewport({
        x: info.view.x,
        y: info.view.y,
        zoom: info.view.zoom,
      });
    }
  }, [props.data, setViewport]);

  useEffect(() => {
    if (nodes != undefined) {
      if (nodes.length > 0) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.type == "customNode" || node.type == "groupNode") {
              if (node.selected != true) {
                // it's important that you create a new object here
                // in order to notify react flow about the change
                node.style = {
                  ...node.style,
                  backgroundColor: node.data.color,
                  color: node.data.fontcolor,
                };
              } else {
                node.style = {
                  ...node.style,
                  backgroundColor: node.data.clickcolor,
                  color: node.data.fontcolor,
                };
              }

              return node;
            } else {
              return node;
            }
          })
        );
      }
    }
  }, []);

  return (
    <>
      <GridContainerWrap height={props.height}>
        <GridContainer
          width="100%"
          height={"100%"}
          style={{ border: "1px solid #d3d3d3" }}
        >
          <div
            className="simple-floatingedges"
            style={{ backgroundColor: "white" }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              panOnDrag={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {Information.background_image != "" ? (
                  <img src={`${Information.background_image}`} />
                ) : (
                  ""
                )}
              </div>
            </ReactFlow>
          </div>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default (props) => (
  <ReactFlowProvider>
    <FlowChartReadOnly {...props} />
  </ReactFlowProvider>
);
