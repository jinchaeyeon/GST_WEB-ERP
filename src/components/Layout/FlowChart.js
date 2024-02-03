import Crop32Icon from "@mui/icons-material/Crop32";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MovingIcon from "@mui/icons-material/Moving";
import RedoIcon from "@mui/icons-material/Redo";
import StraightIcon from "@mui/icons-material/Straight";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import { Button, Grid } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import { Button as ButtonKendo } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
    Background,
    ConnectionMode,
    MarkerType,
    ReactFlowProvider,
    addEdge,
    getRectOfNodes,
    getTransformForBounds,
    useEdgesState,
    useNodesState,
    useReactFlow,
    useViewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSetRecoilState } from "recoil";
import {
    ButtonContainer,
    FormBox,
    FormBoxWrap,
    GridContainer,
    GridContainerWrap,
    GridTitle,
    GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { isLoading } from "../../store/atoms";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
    UseBizComponent,
    UseCustomOption,
    UseGetValueFromSessionItem,
    UseParaPc,
    useSysMessage,
} from "../CommonFunction";
import { GAP } from "../CommonString";
import CustomNode from "./CustomNode";
import GroupNode from "./GroupNode";

const nodeTypes = {
  customNode: CustomNode,
  groupNode: GroupNode,
};

let id = 0;
const getId = () => `${++id}`;

const initNode = {
  id: "0",
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
};

const initEdge = {
  type: "straight",
  source: "1",
  target: "2",
  id: "0",
  label: "straight",
  markerEnd: {
    type: MarkerType.Arrow,
  },
  sourceHandle: "bottom",
  targetHandle: "top",
};

const FlowChart = (props) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [bizComponentData, setBizComponentData] = useState(null);
  UseBizComponent(
    "L_SY060_COLOR",
    //품목계정, 수량단위
    setBizComponentData
  );
  const setLoading = useSetRecoilState(isLoading);
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);
  const processApi = useApi();
  const [customOptionData, setCustomOptionData] = useState(null);
  UseCustomOption("SY_A0500W", setCustomOptionData);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [clickNode, setClickNode] = useState(initNode);
  const [clickEdge, setClickEdge] = useState(initEdge);
  const [EdgeType, setEdgeType] = useState("straight");
  const { x, y, zoom } = useViewport();
  const { setViewport } = useReactFlow();
  const [Type, setType] = useState("C"); //c : 커스텀노드, G: 그룹노드, E: edge
  const [workType, setWorkType] = useState(props.workType);
  const [Information, setInformation] = useState({
    orgdiv: "01",
    location: "",
    layout_key: "",
    layout_id: "",
    layout_name: "",
    config_json: {
      x: 0,
      y: 0,
      zoom: 1,
    },
  });

  useEffect(() => {
    if (workType == "U") {
      if (props.props.data.length > 0) {
        const data = props.props.data;

        const idList = data.map((item) => parseInt(item.id));

        id = Math.max.apply(null, idList);
        const nodeList = data.filter((item) => item.type == "node");
        const edgeList = data.filter((item) => item.type == "edge");

        if (nodeList.length > 0) {
          const nodeData = nodeList.map((item) => {
            return JSON.parse(item.config_json);
          });
          setNodes(nodeData);
          setClickNode(
            nodeData.filter((item) => item.selected == true)[0] == undefined
              ? nodeData[0]
              : nodeData.filter((item) => item.selected == true)[0]
          );
        }
        if (edgeList.length > 0) {
          const edgeData = edgeList.map((item) => {
            return JSON.parse(item.config_json);
          });
          setEdges(edgeData);
        }
      }
      setInformation({
        orgdiv: props.filters.orgdiv,
        location: props.filters.location,
        layout_key: props.filters.layout_key,
        layout_id: props.filters.layout_id,
        layout_name: props.filters.layout_name,
        config_json: JSON.parse(props.filters.config_json),
      });
      setViewport(JSON.parse(props.filters.config_json), { duration: 500 });
    } else {
      setInformation({
        orgdiv: props.filters.orgdiv,
        location: props.filters.location,
        layout_key: "",
        layout_id: "",
        layout_name: "",
        config_json: {
          x: 0,
          y: 0,
          zoom: 1,
        },
      });
    }
  }, [props.props]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(onEdgeAdd(params, "straight"), eds)),
    []
  );

  const onConnect2 = useCallback(
    (params) => setEdges((eds) => addEdge(onEdgeAdd(params, "step"), eds)),
    []
  );

  const onConnect3 = useCallback(
    (params) =>
      setEdges((eds) => addEdge(onEdgeAdd(params, "smoothstep"), eds)),
    []
  );

  const onConnect4 = useCallback(
    (params) => setEdges((eds) => addEdge(onEdgeAdd(params, "bezier"), eds)),
    []
  );

  const onEdgeAdd = (params, str) => {
    const newEgde = {
      ...params,
      id: getId(),
      type: str,
      label: "",
      markerEnd: {
        type: MarkerType.Arrow,
      },
    };
    setType("E");
    setClickEdge(newEgde);
    setEdgeType(str);
    return newEgde;
  };

  const onEdgeUpdating = (oldEdge, newConnection) => {
    setEdges((nds) =>
      nds.map((edge) => {
        if (edge.id == oldEdge.id) {
          return {
            ...edge,
            source: newConnection.source,
            target: newConnection.target,
            sourceHandle: newConnection.sourceHandle,
            targetHandle: newConnection.targetHandle,
          };
        }

        return edge;
      })
    );
    const newEgde = {
      ...oldEdge,
      source: newConnection.source,
      target: newConnection.target,
      sourceHandle: newConnection.sourceHandle,
      targetHandle: newConnection.targetHandle,
    };
    setType("E");
    setClickEdge(newEgde);
    setEdgeType(newEgde.type);
  };

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
    setEdgeType(edge.type);
    setType("E");
  };

  useEffect(() => {
    if (nodes != undefined) {
      if (nodes.length > 0) {
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
      }
    }
  }, [clickNode]);

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => onEdgeUpdating(oldEdge, newConnection),
    []
  );

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
    if (clickNode.type == "customNode") {
      setType("C");
    } else {
      setType("G");
    }
  };

  const InputChange2 = (e) => {
    const { value, name } = e.target;

    setEdges((nds) =>
      nds.map((edge) => {
        if (edge.id == clickEdge.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          edge.label = value;
        }

        return edge;
      })
    );

    setClickEdge((prev) => ({
      ...prev,
      label: value,
    }));
  };

  const ComboBoxChange2 = (e) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const InputChange3 = (e) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
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

  const onChangeEdgeType = (str) => {
    setEdgeType(str);

    setEdges((nds) =>
      nds.map((edge) => {
        if (edge.id == clickEdge.id) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          edge.type = str;
        }

        return edge;
      })
    );
  };

  const onChangeSeq = (event, node) => {
    setNodes((prev) => {
      const List = prev.filter((item) => item.id != node.id);
      const nodesList = [...List, node];
      return nodesList;
    });
    setClickNode(node);
    if (node.type == "customNode") {
      setType("C");
    } else {
      setType("G");
    }
  };

  const onPaneClick = useCallback(() => {
    setClickNode(initNode);
    setClickEdge(initEdge);
    setType("C");
    setEdgeType("straight");
  }, [clickNode, clickEdge]);

  const onSaveClick = () => {
    if (Information.location == "" || Information.layout_id == "") {
      alert("필수값을 채워주세요");
      return false;
    }

    const nodesBounds = getRectOfNodes(nodes);
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "white",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(function downloadImage(dataUrl) {
      let dataArr = {
        id_s: [],
        type_s: [],
        config_json_s: [],
      };

      nodes.forEach((item) => {
        dataArr.id_s.push(item.id);
        dataArr.type_s.push("node");
        dataArr.config_json_s.push(JSON.stringify(item));
      });
      edges.forEach((item) => {
        dataArr.id_s.push(item.id);
        dataArr.type_s.push("edge");
        dataArr.config_json_s.push(JSON.stringify(item));
      });

      setParaData({
        workType: workType,
        orgdiv: Information.orgdiv,
        location: Information.location,
        layout_key: Information.layout_key,
        layout_id: Information.layout_id,
        layout_name: Information.layout_name,
        config_json: JSON.stringify({
          x: x,
          y: y,
          zoom: zoom,
        }),
        preview_image: dataUrl,
        id_s: dataArr.id_s.join("|"),
        type_s: dataArr.type_s.join("|"),
        config_json_s: dataArr.config_json_s.join("|"),
      });
    });
  };

  const imageWidth = 1024;
  const imageHeight = 768;

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    location: "01",
    layout_key: "",
    layout_id: "",
    layout_name: "",
    config_json: "",
    preview_image: "",
    id_s: "",
    type_s: "",
    config_json_s: "",
  });

  const para = {
    procedureName: "P_SY_A0060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_layout_key": ParaData.layout_key,
      "@p_layout_id": ParaData.layout_id,
      "@p_layout_name": ParaData.layout_name,
      "@p_config_json_m_s": ParaData.config_json,
      "@p_preview_image": ParaData.preview_image,
      "@p_id_s": ParaData.id_s,
      "@p_type_s": ParaData.type_s,
      "@p_config_json_s": ParaData.config_json_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SY_A0060W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data;
    setLoading(true);
    try {
      data = await processApi("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      props.setData(false);
      setParaData({
        workType: "",
        orgdiv: "01",
        location: "01",
        layout_key: "",
        layout_id: "",
        layout_name: "",
        config_json: "",
        preview_image: "",
        id_s: "",
        type_s: "",
        config_json_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = (e) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    setParaData((prev) => ({
      workType: "D",
      orgdiv: Information.orgdiv,
      location: "",
      layout_key: Information.layout_key,
      layout_id: "",
      layout_name: "",
      preview_image: "",
      id_s: "",
      type_s: "",
      config_json_s: "",
    }));
  };

  return (
    <>
      <GridContainerWrap height="83vh">
        <GridContainer
          width="75%"
          height={isMobile ? "200vh" : ""}
          style={{ border: "1px solid #d3d3d3" }}
        >
          <div className="simple-floatingedges">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={
                EdgeType == "straight"
                  ? onConnect
                  : EdgeType == "step"
                  ? onConnect2
                  : EdgeType == "smoothstep"
                  ? onConnect3
                  : onConnect4
              }
              fitView
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onNodeDragStop={onChangeSeq}
              onEdgeUpdate={onEdgeUpdate}
              onPaneClick={onPaneClick}
            >
              <Background variant="lines" />
            </ReactFlow>
          </div>
        </GridContainer>
        <GridContainer
          width={`calc(25% - ${GAP}px)`}
          height={isMobile ? "100vh" : ""}
          style={{ overflowY: "scroll" }}
        >
          <GridTitleContainer style={{ marginRight: isMobile ? "0px" : "5px" }}>
            <GridTitle>편집</GridTitle>
            <ButtonContainer style={{ marginBottom: "5px" }}>
              <ButtonKendo
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                삭제
              </ButtonKendo>
              <ButtonKendo
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </ButtonKendo>
            </ButtonContainer>
          </GridTitleContainer>
          <GridContainer style={{ marginRight: isMobile ? "0px" : "5px" }}>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>정보</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <FormBoxWrap>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th style={{ minWidth: "40px", width: "30%" }}>
                          사업장
                        </th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="location"
                              value={Information.location}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange2}
                              className="required"
                              type="new"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ minWidth: "40px", width: "30%" }}>
                          레이아웃ID
                        </th>
                        <td>
                          {workType == "N" ? (
                            <Input
                              name="layout_id"
                              type="text"
                              value={Information.layout_id}
                              onChange={InputChange3}
                              className="required"
                            />
                          ) : (
                            <Input
                              name="layout_id"
                              type="text"
                              value={Information.layout_id}
                              className="readonly"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ minWidth: "40px", width: "30%" }}>
                          레이아웃명
                        </th>
                        <td>
                          <Input
                            name="layout_name"
                            type="text"
                            value={Information.layout_name}
                            onChange={InputChange3}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </AccordionDetails>
            </Accordion>
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
                    {Type == "C" || Type == "G" ? (
                      <tbody>
                        <tr>
                          <th style={{ minWidth: "40px", width: "30%" }}>
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
                          <th style={{ minWidth: "40px", width: "30%" }}>
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
                            <th style={{ minWidth: "40px", width: "30%" }}>
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
                    ) : (
                      <tbody>
                        <tr>
                          <th style={{ minWidth: "40px", width: "30%" }}>
                            텍스트
                          </th>
                          <td>
                            <Input
                              name="label"
                              type="text"
                              value={clickEdge.label}
                              onChange={InputChange2}
                            />
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </FormBox>
                </FormBoxWrap>
              </AccordionDetails>
            </Accordion>
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
                    <Grid item xs={6} sm={6} md={6} lg={12} xl={6}>
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
                    <Grid item xs={6} sm={6} md={6} lg={12} xl={6}>
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
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>선</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <FormBoxWrap>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={6} md={6} lg={12} xl={6}>
                      <Button
                        style={{
                          color:
                            EdgeType == "straight"
                              ? "rgba(0, 0, 0, .725)"
                              : "rgba(0, 0, 0, .325)",
                        }}
                        variant="text"
                        onClick={() => onChangeEdgeType("straight")}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <StraightIcon />
                          <Typography variant="caption">직선</Typography>
                        </div>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={12} xl={6}>
                      <Button
                        style={{
                          color:
                            EdgeType == "step"
                              ? "rgba(0, 0, 0, .725)"
                              : "rgba(0, 0, 0, .325)",
                        }}
                        variant="text"
                        onClick={() => onChangeEdgeType("step")}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <TrendingUpIcon />
                          <Typography variant="caption">꺽은선</Typography>
                        </div>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={12} xl={6}>
                      <Button
                        style={{
                          color:
                            EdgeType == "smoothstep"
                              ? "rgba(0, 0, 0, .725)"
                              : "rgba(0, 0, 0, .325)",
                        }}
                        variant="text"
                        onClick={() => onChangeEdgeType("smoothstep")}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <MovingIcon />
                          <Typography variant="caption">
                            부드러운 꺽은선
                          </Typography>
                        </div>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={12} xl={6}>
                      <Button
                        style={{
                          color:
                            EdgeType == "bezier"
                              ? "rgba(0, 0, 0, .725)"
                              : "rgba(0, 0, 0, .325)",
                        }}
                        variant="text"
                        onClick={() => onChangeEdgeType("bezier")}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <RedoIcon />
                          <Typography variant="caption">곡선</Typography>
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

export default (props) => (
  <ReactFlowProvider>
    <FlowChart {...props} />
  </ReactFlowProvider>
);
