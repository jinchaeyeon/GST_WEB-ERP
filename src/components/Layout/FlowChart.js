import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
  useOnSelectionChange,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { GAP } from "../CommonString";
import CustomNode from "./CustomNode";
import GroupNode from "./GroupNode";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Input } from "@progress/kendo-react-inputs";

const nodeTypes = {
  customNode: CustomNode,
  groupNode: GroupNode,
};

let id = 0;
const getId = () => `${++id}`;

const FlowChart = (props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [clickNode, setClickNode] = useState({
    id: "",
    data: { label: "" },
    position: {
      x: 0,
      y: 0,
    },
    type: "customNode",
    style: {
      border: "1px solid rgba(0, 0, 0, .125)",
      padding: "20px 40px",
      backgroundColor: "white",
    },
  });

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
          border: "1px solid rgba(0, 0, 0, .125)",
          padding: "20px 40px",
          backgroundColor: "white",
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
          border: "1px solid rgba(0, 0, 0, .125)",
          padding: "20px 40px",
          backgroundColor: "red",
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
          border: "1px solid rgba(0, 0, 0, .125)",
          padding: "20px 40px",
          backgroundColor: "white",
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
          border: "1px solid rgba(0, 0, 0, .125)",
          padding: "20px 40px",
          backgroundColor: "white",
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
          border: "1px solid rgba(0, 0, 0, .125)",
          padding: "20px 40px",
          backgroundColor: "white",
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

  const onNodeClick = (event, node) => {
    setClickNode(node);
  };

  const InputChange = (e) => {
    const { value, name } = e.target;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id == clickNode.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node[value] = {
            ...node[value],
            label: name,
          };
        }

        return node;
      })
    );
  };

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
              onNodeClick={onNodeClick}
            >
              <Background variant="lines" />
            </ReactFlow>
          </div>
        </GridContainer>
        <GridContainer width={`calc(30% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>편집</GridTitle>
          </GridTitleContainer>
          <GridContainer>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>속성</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <FormBoxWrap>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th style={{ width: "10%" }}>테마</th>
                        <td></td>
                      </tr>
                      <tr>
                        <th>텍스트</th>
                        <td>
                          <Input
                            name="data"
                            type="text"
                            value={clickNode.data}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </AccordionDetails>
            </Accordion>
          </GridContainer>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default FlowChart;
