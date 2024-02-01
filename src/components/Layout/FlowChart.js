import Crop32Icon from "@mui/icons-material/Crop32";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import { Button, Grid } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { Input } from "@progress/kendo-react-inputs";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  ConnectionMode,
  MarkerType,
  addEdge,
  useEdgesState,
  useNodesState,
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
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import { UseBizComponent } from "../CommonFunction";
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
  const [bizComponentData, setBizComponentData] = useState(null);
  UseBizComponent(
    "L_SY060_COLOR",
    //품목계정, 수량단위
    setBizComponentData
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [clickNode, setClickNode] = useState({
    id: "1",
    data: {
      label: "",
      link: "",
      color: "#def2fb",
      fontcolor: "#39a2d0",
      clickcolor: "#c9e8f8",
    },
    position: {
      x: 0,
      y: 0,
    },
    type: "customNode",
    style: {
      border: "1px solid rgba(0, 0, 0, .125)",
      backgroundColor: "#c9e8f8",
      width: 150,
      height: 30,
    },
  });
  const [clickEdge, setClickEdge] = useState({
    type: "straight",
    source: "1",
    target: "2",
    id: "2",
    label: "straight",
    markerEnd: {
      type: MarkerType.Arrow,
    },
    sourceHandle: "bottom",
    targetHandle: "top",
  });
  const [Type, setType] = useState("C"); //c : 커스텀노드, G: 그룹노드, E: edge

  useEffect(() => {
    id = props.props.total;
    setNodes([]);
    setEdges([]);
  }, [props]);

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
    if (node.type == "customNode") {
      setType("C");
    } else {
      setType("G");
    }
  };

  const onEdgeClick = (event, edge) => {
    setClickEdge(edge);
    setType("E");
  };

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id != clickNode.id) {
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
      })
    );
  }, [clickNode]);

  const InputChange = (e) => {
    const { value, name } = e.target;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id == clickNode.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.data = {
            ...node.data,
            [name]: value,
          };
        }

        return node;
      })
    );

    setClickNode((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: value,
      },
    }));
  };

  const ComboBoxChange = (e) => {
    const { name, values } = e;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id == clickNode.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          node.style = {
            ...node.style,
            backgroundColor: values.click,
            color: values.font,
          };
          node.data = {
            ...node.data,
            color: values.sub_code,
            fontcolor: values.font,
            clickcolor: values.click,
          };
        }

        return node;
      })
    );
  };

  const onNodeAdd = () => {
    const newNode = {
      id: getId(),
      type: "customNode",
      position: {
        x: 0,
        y: 0,
      },
      data: {
        label: "",
        link: "",
        color: "#def2fb",
        fontcolor: "#39a2d0",
        clickcolor: "#c9e8f8",
      },
      style: {
        border: "1px solid rgba(0, 0, 0, .125)",
        backgroundColor: "#c9e8f8",
        width: 150,
        height: 30,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setClickNode(newNode);
    setType("C");
  };

  const onGroupNodeAdd = () => {
    const newNode = {
      id: getId(),
      type: "groupNode",
      position: {
        x: 0,
        y: 0,
      },
      data: {
        label: "",
        link: "",
        color: "#def2fb",
        fontcolor: "#39a2d0",
        clickcolor: "#c9e8f8",
      },
      style: {
        border: "1px solid rgba(0, 0, 0, .125)",
        backgroundColor: "#c9e8f8",
        width: 200,
        height: 300,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setClickNode(newNode);
    setType("G");
  };

  return (
    <>
      <GridContainerWrap height="83vh">
        <GridContainer width="80%" style={{ border: "1px solid #d3d3d3" }}>
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
              onEdgeClick={onEdgeClick}
            >
              <Background variant="lines" />
            </ReactFlow>
          </div>
        </GridContainer>
        <GridContainer width={`calc(20% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>편집</GridTitle>
          </GridTitleContainer>
          <GridContainer>
            {Type == "C" || Type == "G" ? (
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
                          <th style={{ minWidth: "40px", width: "20%" }}>
                            테마
                          </th>
                          <td>
                            {bizComponentData !== null && (
                              <BizComponentComboBox
                                name="backgroundColor"
                                value={clickNode.data.color}
                                bizComponentId="L_SY060_COLOR"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                para="SY_A0060W"
                                className="required"
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th style={{ minWidth: "40px", width: "20%" }}>
                            텍스트
                          </th>
                          <td>
                            <Input
                              name="label"
                              type="text"
                              value={clickNode.data.label}
                              onChange={InputChange}
                            />
                          </td>
                        </tr>
                        {Type == "C" ? (
                          <tr>
                            <th style={{ minWidth: "40px", width: "20%" }}>
                              링크
                            </th>
                            <td>
                              <Input
                                name="link"
                                type="text"
                                value={clickNode.data.link}
                                onChange={InputChange}
                              />
                            </td>
                          </tr>
                        ) : (
                          ""
                        )}
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </AccordionDetails>
              </Accordion>
            ) : (
              ""
            )}
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>노드</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <FormBoxWrap>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                      <Button
                        style={{ color: "rgba(0, 0, 0, .725)" }}
                        variant="text"
                        onClick={() => onNodeAdd()}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Crop32Icon />
                          <Typography variant="caption">노드생성</Typography>
                        </div>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                      <Button
                        style={{ color: "rgba(0, 0, 0, .725)" }}
                        variant="text"
                        onClick={() => onGroupNodeAdd()}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <WebAssetIcon />
                          <Typography variant="caption">
                            그룹 노드 생성
                          </Typography>
                        </div>
                      </Button>
                    </Grid>
                  </Grid>
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
