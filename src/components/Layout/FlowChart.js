import { useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { GridContainer, GridContainerWrap } from "../../CommonStyled";
import { GAP } from "../CommonString";
import CustomNode from "./CustomNode";
import GroupNode from "./GroupNode";

const nodeTypes = {
  customNode: CustomNode,
  groupNode: GroupNode,
};

let id = 0;
const getId = () => `${++id}`;

const FlowChart = (props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    id = props.props.total;
    setNodes([
      {
        id: "1",
        data: { label: "choose" },
        position: {
          x: 0,
          y: 0,
        },
        type: "customNode",
        style: {
          border: "1px solid #ddd",
          padding: "20px 40px",
          background: "white",
        },
      },
      {
        id: "2",
        data: { label: "your" },
        position: {
          x: 100,
          y: 100,
        },
        type: "groupNode",
        style: {
          border: "1px solid #ddd",
          padding: "20px 40px",
          background: "red",
        },
      },
      {
        id: "3",
        data: { label: "desired" },
        position: {
          x: 0,
          y: 200,
        },
        type: "customNode",
        style: {
          border: "1px solid #ddd",
          padding: "20px 40px",
          background: "white",
        },
      },
      {
        id: "4",
        data: { label: "edge" },
        position: {
          x: 100,
          y: 300,
        },
        type: "customNode",
        style: {
          border: "1px solid #ddd",
          padding: "20px 40px",
          background: "white",
        },
      },
      {
        id: "5",
        data: { label: "type" },
        position: {
          x: 0,
          y: 400,
        },
        type: "customNode",
        style: {
          border: "1px solid #ddd",
          padding: "20px 40px",
          background: "white",
        },
      },
    ]);

    setEdges([
      {
        type: "straight",
        source: "1",
        target: "2",
        id: "1",
        label: "straight",
        markerEnd: {
          type: MarkerType.Arrow,
        },
        sourceHandle: "bottom",
        targetHandle: "top",
      },
      {
        type: "step",
        source: "2",
        target: "3",
        id: "2",
        label: "step",
        markerEnd: {
          type: MarkerType.Arrow,
        },
        sourceHandle: "bottom",
        targetHandle: "top",
      },
      {
        type: "smoothstep",
        source: "3",
        target: "4",
        id: "3",
        label: "smoothstep",
        markerEnd: {
          type: MarkerType.Arrow,
        },
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        type: "bezier",
        source: "4",
        target: "5",
        id: "4",
        label: "bezier",
        markerEnd: {
          type: MarkerType.Arrow,
        },
        sourceHandle: "bottom",
        targetHandle: "top",
      },
    ]);
  }, []);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: getId(),
            markerEnd: {
              type: MarkerType.Arrow,
            },
          },
          eds
        )
      ),
    []
  );

  return (
    <>
      <GridContainerWrap height="83vh">
        <GridContainer width="70%" style={{ border: "1px solid #d3d3d3" }}>
          <div className="simple-floatingedges">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
            >
              <Background variant="lines" />
            </ReactFlow>
          </div>
        </GridContainer>
        <GridContainer width={`calc(30% - ${GAP}px)`}></GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default FlowChart;
