import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import Crop32Icon from "@mui/icons-material/Crop32";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ImageIcon from "@mui/icons-material/Image";
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
import * as htmlToImage from "html-to-image";
import * as React from "react";
import { createRef, useCallback, useEffect, useState } from "react";
import ReactFlow, {
  ConnectionMode,
  MarkerType,
  ReactFlowProvider,
  addEdge,
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
import { deletedAttadatnumsState, isLoading } from "../../store/atoms";
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
import ImageNode from "./ImageNode";

const nodeTypes = {
  customNode: CustomNode,
  groupNode: GroupNode,
  imageNode: ImageNode,
};

let id = 0;
const getId = () => `${++id}`;

const FlowChart = (props) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);
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
  UseCustomOption("SY_A0060W", setCustomOptionData);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [copyNode, setCopyNode] = useState([]);
  const [EdgeType, setEdgeType] = useState("straight");
  const { x, y, zoom } = useViewport();
  const { setViewport } = useReactFlow();
  const [Type, setType] = useState("B"); //c : 커스텀노드, G: 그룹노드, I: 이미지노드, E: edge
  const [workType, setWorkType] = useState(props.workType);
  const [Information, setInformation] = useState({
    orgdiv: "01",
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
    if (workType == "U") {
      const data = props.data;
      const idList = data.map((item) => parseInt(item.id));
      id = Math.max.apply(null, idList);
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
    } else {
      setInformation({
        orgdiv: props.filters.orgdiv,
        location: props.filters.location,
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
    }
  }, [props.data, setViewport]);

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
    (params) => setEdges((eds) => addEdge(onEdgeAdd(params, "default"), eds)),
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
    setEdgeType(newEgde.type);
  };

  const onNodeClick = (event, node) => {
    if (node.type == "customNode") {
      setType("C");
    } else if (node.type == "groupNode") {
      setType("G");
    } else if (node.type == "imageNode") {
      setType("I");
    }
  };

  const onEdgeClick = (event, edge) => {
    setEdgeType(edge.type);
    setType("E");
  };

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
  }, [nodes]);

  const onEdgeUpdate = useCallback(
    (oldEdge, newConnection) => onEdgeUpdating(oldEdge, newConnection),
    []
  );

  const InputChange = (e) => {
    const { value, name } = e.target;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.selected == true) {
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

    const node = nodes.filter((item) => item.selected == true)[0];
    if (node.type == "customNode") {
      setType("C");
    } else if (node.type == "groupNode") {
      setType("G");
    } else if (node.type == "imageNode") {
      setType("I");
    }
  };

  const InputChange2 = (e) => {
    const { value, name } = e.target;

    setEdges((nds) =>
      nds.map((edge) => {
        if (edge.selected == true) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          edge.label = value;
        }

        return edge;
      })
    );
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
        if (node.selected == true) {
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
    setType("G");
  };

  const onImageNodeAdd = () => {
    const newNode = {
      id: getId(),
      type: "imageNode",
      position: {
        x: 0,
        y: 0,
      },
      data: {
        url: "",
      },
      style: {
        width: 100,
        height: 100,
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setType("I");
  };

  const onChangeEdgeType = (str) => {
    setEdgeType(str);

    setEdges((nds) =>
      nds.map((edge) => {
        if (edge.selected == true) {
          // it's important that you create a new object here
          // in order to notify react flow about the change
          edge.type = str;
        }

        return edge;
      })
    );
  };

  const onChangeSeq = (event, node) => {
    if (nodes.filter((item) => item.selected == true).length < 2) {
      setNodes((prev) => {
        const List = prev.filter((item) => item.id != node.id);
        const nodesList = [...List, node];
        return nodesList;
      });
      if (node.type == "customNode") {
        setType("C");
      } else if (node.type == "groupNode") {
        setType("G");
      } else if (node.type == "imageNode") {
        setType("I");
      }
    } else {
      setNodes((prev) => {
        const List = prev.map((item) => {
          if (item.selected == true || node.id == item.id) {
            return {
              ...item,
              selected: true,
            };
          } else {
            return {
              ...item,
              selected: false,
            };
          }
        });
        return List;
      });
      if (node.type == "customNode") {
        setType("C");
      } else if (node.type == "groupNode") {
        setType("G");
      } else if (node.type == "imageNode") {
        setType("I");
      }
    }
  };

  const onPaneClick = useCallback(() => {
    setType("B");
    setEdgeType("straight");
  }, []);

  const onSaveClick = () => {
    if (Information.location == "" || Information.layout_id == "") {
      alert("필수값을 채워주세요");
      return false;
    }

    takeScreenShot(ref.current).then(download);
  };

  const download = async (image, { name = "img", extension = "jpg" } = {}) => {
    const data = [
      {
        view: {
          x: x,
          y: y,
          zoom: zoom,
        },
        background_image: Information.background_image,
        type: "data",
        config_json_s: "",
        id: 0,
      },
    ];

    nodes.map((item) => {
      data.push({
        view: "",
        background_image: "",
        type: "node",
        config_json_s: item,
        id: item.id,
      });
    });
    edges.map((item) => {
      data.push({
        view: "",
        background_image: "",
        type: "edge",
        config_json_s: item,
        id: item.id,
      });
    });

    let output = JSON.stringify(data);

    const main = new Blob([output], {
      type: "application/json",
    });

    var mainfile = new File([main], "main.json");

    const files = [mainfile];

    //기존것 삭제
    if (Information.attdatnum != "")
      setDeletedAttadatnums([Information.attdatnum]);

    let newAttachmentNumber = "";
    const promises = [];
    for (const file of files) {
      if (!newAttachmentNumber) {
        newAttachmentNumber = await uploadFile(file);
        const promise = newAttachmentNumber;
        promises.push(promise);
        continue;
      }

      const promise = newAttachmentNumber
        ? await uploadFile(file, newAttachmentNumber)
        : await uploadFile(file);
      promises.push(promise);
    }
    const results = await Promise.all(promises);

    if (results.includes(null)) {
      alert("저장에 실패했습니다.");
    } else {
      setParaData({
        workType: workType,
        orgdiv: Information.orgdiv,
        location: Information.location,
        layout_key: Information.layout_key,
        layout_id: Information.layout_id,
        layout_name: Information.layout_name,
        preview_image: image,
        attdatnum: newAttachmentNumber,
      });
    }
  };

  const uploadFile = async (files, newAttachmentNumber) => {
    let data;

    const filePara = {
      attached: newAttachmentNumber
        ? "attached?attachmentNumber=" + newAttachmentNumber
        : "attached",
      files: files, //.FileList,
    };

    try {
      data = await processApi("file-upload", filePara);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      return data.attachmentNumber;
    } else {
      return data;
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    location: "01",
    layout_key: "",
    layout_id: "",
    layout_name: "",
    preview_image: "",
    attdatnum: "",
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
      "@p_preview_image": ParaData.preview_image,
      "@p_attdatnum": ParaData.attdatnum,
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
      if (Information.attdatnum != "")
      setDeletedAttadatnums([Information.attdatnum]);

      props.setData(false);
      setParaData({
        workType: "",
        orgdiv: "01",
        location: "01",
        layout_key: "",
        layout_id: "",
        layout_name: "",
        preview_image: "",
        attdatnum: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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
      attdatnum: "",
    }));
  };

  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput.click();
  };
  const upload2 = () => {
    const uploadInput2 = document.getElementById("uploadAttachment2");
    uploadInput2.click();
  };
  const excelInput = React.useRef();
  const excelInput2 = React.useRef();

  async function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
    });
  }

  const handleFileUpload = async (files) => {
    if (files === null) return false;

    for (const file of files) {
      if (file.size > 1048576) {
        alert("용량 제한: 1MB 입니다.");
        return false;
      } else {
        await getBase64(file) // `file` your img file
          .then((res) => {
            setNodes((nds) =>
              nds.map((node) => {
                if (node.selected == true) {
                  // it's important that you create a new object here
                  // in order to notify react flow about the change
                  node.data = {
                    ...node.data,
                    url: res,
                  };
                }

                return node;
              })
            );
            setType("I");
          }) // `res` base64 of img file
          .catch((err) => console.log(err));
      }
    }
  };

  const handleFileUpload2 = async (files) => {
    if (files === null) return false;

    for (const file of files) {
      if (file.size > 1048576) {
        alert("용량 제한: 1MB 입니다.");
        return false;
      } else {
        await getBase64(file) // `file` your img file
          .then((res) => {
            setInformation((prev) => ({
              ...prev,
              background_image: res,
            }));
          }) // `res` base64 of img file
          .catch((err) => console.log(err));
      }
    }
  };
  const ref = createRef(null);
  const takeScreenShot = async (node) => {
    const dataURI = await htmlToImage.toJpeg(node);
    return dataURI;
  };

  const onCopy = () => {
    setCopyNode(nodes.filter((item) => item.selected == true));
    setType("B");
  };
  const onCopyAll = () => {
    setCopyNode(nodes);
    setType("B");
  };
  const onPaste = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.selected == true) {
          node.selected = false;
        }

        return node;
      })
    );
    copyNode.map((item) => {
      const newNode = {
        ...item,
        id: getId(),
        position: {
          x: item.position.x + 50,
          y: item.position.y + 50,
        },
        selected: true,
      };

      setNodes((nds) => nds.concat(newNode));
      setType("B");
    });

    setCopyNode([]);
  };

  return (
    <>
      <GridContainerWrap height={isMobile ? "200vh" : "83vh"}>
        <GridContainer
          width="65%"
          height={isMobile ? "100%" : ""}
          style={{ border: "1px solid #d3d3d3" }}
        >
          <div
            ref={ref}
            className="simple-floatingedges"
            style={{ backgroundColor: "white" }}
          >
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
              nodeTypes={nodeTypes}
              connectionMode={ConnectionMode.Loose}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              onNodeDragStop={onChangeSeq}
              onEdgeUpdate={onEdgeUpdate}
              onPaneClick={onPaneClick}
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
        <GridContainer
          width={`calc(35% - ${GAP}px)`}
          height={isMobile ? "100%" : ""}
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
                      <tr>
                        <th style={{ minWidth: "40px", width: "30%" }}>
                          배경화면
                        </th>
                        <td>
                          <ButtonKendo
                            onClick={upload2}
                            themeColor={"primary"}
                            icon={"upload"}
                            style={{ width: "100%" }}
                          >
                            이미지 등록
                            <input
                              id="uploadAttachment2"
                              style={{ display: "none" }}
                              type="file"
                              accept=".png, .jpg, .jpeg"
                              ref={excelInput2}
                              onChange={(event) => {
                                handleFileUpload2(event.target.files);
                              }}
                            />
                          </ButtonKendo>
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </AccordionDetails>
            </Accordion>
            {Type == "B" ||
            nodes.filter((item) => item.selected == true).length +
              edges.filter((item) => item.selected == true).length >
              1 ? (
              ""
            ) : (
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
                                  value={
                                    nodes.filter(
                                      (item) => item.selected == true
                                    )[0] == undefined
                                      ? ""
                                      : nodes.filter(
                                          (item) => item.selected == true
                                        )[0].data.color
                                  }
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
                                value={
                                  nodes.filter(
                                    (item) => item.selected == true
                                  )[0] == undefined
                                    ? ""
                                    : nodes.filter(
                                        (item) => item.selected == true
                                      )[0].data.label
                                }
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
                                  value={
                                    nodes.filter(
                                      (item) => item.selected == true
                                    )[0] == undefined
                                      ? ""
                                      : nodes.filter(
                                          (item) => item.selected == true
                                        )[0].data.link
                                  }
                                  onChange={InputChange}
                                />
                              </td>
                            </tr>
                          ) : (
                            ""
                          )}
                        </tbody>
                      ) : Type == "I" ? (
                        <tbody>
                          <tr>
                            <th style={{ minWidth: "40px", width: "30%" }}>
                              첨부파일
                            </th>
                            <td>
                              <ButtonKendo
                                onClick={upload}
                                themeColor={"primary"}
                                icon={"upload"}
                                style={{ width: "100%" }}
                              >
                                이미지 등록
                                <input
                                  id="uploadAttachment"
                                  style={{ display: "none" }}
                                  type="file"
                                  accept=".png, .jpg, .jpeg"
                                  ref={excelInput}
                                  onChange={(event) => {
                                    handleFileUpload(event.target.files);
                                  }}
                                />
                              </ButtonKendo>
                            </td>
                          </tr>
                        </tbody>
                      ) : Type == "E" ? (
                        <tbody>
                          <tr>
                            <th style={{ minWidth: "40px", width: "30%" }}>
                              텍스트
                            </th>
                            <td>
                              <Input
                                name="label"
                                type="text"
                                value={
                                  edges.filter(
                                    (item) => item.selected == true
                                  )[0] == undefined
                                    ? ""
                                    : edges.filter(
                                        (item) => item.selected == true
                                      )[0].label
                                }
                                onChange={InputChange2}
                              />
                            </td>
                          </tr>
                        </tbody>
                      ) : (
                        ""
                      )}
                    </FormBox>
                  </FormBoxWrap>
                </AccordionDetails>
              </Accordion>
            )}
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                style={{ backgroundColor: "#edf4fb" }}
              >
                <Typography>기능</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <FormBoxWrap>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
                      <Button
                        style={{ color: "rgba(0, 0, 0, .725)" }}
                        variant="text"
                        onClick={() => onCopy()}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <ContentCopyIcon />
                          <Typography variant="caption">노드 복사</Typography>
                        </div>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
                      <Button
                        style={{ color: "rgba(0, 0, 0, .725)" }}
                        variant="text"
                        onClick={() => onCopyAll()}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <CopyAllIcon />
                          <Typography variant="caption">
                            전체 노드 복사
                          </Typography>
                        </div>
                      </Button>
                    </Grid>
                    <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
                      <Button
                        style={{
                          color:
                            copyNode.length == 0
                              ? "rgba(0, 0, 0, .325)"
                              : "rgba(0, 0, 0, .725)",
                        }}
                        variant="text"
                        onClick={() => onPaste()}
                        fullWidth
                        disabled={copyNode.length == 0 ? true : false}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <ContentPasteIcon />
                          <Typography variant="caption">붙여넣기</Typography>
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
                <Typography>노드</Typography>
              </AccordionSummary>
              <AccordionDetails
                style={{ borderTop: "1px solid rgba(0, 0, 0, .125)" }}
              >
                <FormBoxWrap>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
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
                    <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
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
                    <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
                      <Button
                        style={{ color: "rgba(0, 0, 0, .725)" }}
                        variant="text"
                        onClick={() => onImageNodeAdd()}
                        fullWidth
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <ImageIcon />
                          <Typography variant="caption">
                            이미지 노드 생성
                          </Typography>
                        </div>
                      </Button>
                    </Grid>
                  </Grid>
                </FormBoxWrap>
              </AccordionDetails>
            </Accordion>
            {edges.filter((item) => item.selected == true).length > 1 ? (
              ""
            ) : (
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
                      <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
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
                      <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
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
                      <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
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
                      <Grid item xs={6} sm={4} md={6} lg={6} xl={4}>
                        <Button
                          style={{
                            color:
                              EdgeType == "default"
                                ? "rgba(0, 0, 0, .725)"
                                : "rgba(0, 0, 0, .325)",
                          }}
                          variant="text"
                          onClick={() => onChangeEdgeType("default")}
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
            )}
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
