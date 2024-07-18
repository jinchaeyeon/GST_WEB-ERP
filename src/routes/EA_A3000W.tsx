import AttachFileIcon from "@mui/icons-material/AttachFile";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LockIcon from "@mui/icons-material/Lock";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { PanelBar, PanelBarItem } from "@progress/kendo-react-layout";
import React, { useLayoutEffect, useState } from "react";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import {
  UseCustomOption,
  getDeviceHeight,
  getHeight,
  getMenuName,
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;

const EA_A3000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [swiper, setSwiper] = useState<SwiperCore>();
  var index = 0;
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".ButtonContainer5");
      height6 = getHeight(".PanelBar");
      height7 = getHeight(".TitleContainer");
      height8 = getHeight(".Divider");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(
          getDeviceHeight(false) - height - height6 - height7 - height8
        );
        setMobileHeight2(getDeviceHeight(true) - height2 - height6 - height7);
        setMobileHeight3(getDeviceHeight(true) - height3 - height6 - height7);
        setMobileHeight4(getDeviceHeight(true) - height4 - height6 - height7);
        setMobileHeight5(getDeviceHeight(true) - height5 - height6 - height7);
        setWebHeight(getDeviceHeight(true) - height - height7);
        setWebHeight2((getDeviceHeight(true) - height7) / 2 - height2);
        setWebHeight3((getDeviceHeight(true) - height7) / 2 - height3);
        setWebHeight4((getDeviceHeight(true) - height7) / 2 - height4);
        setWebHeight5((getDeviceHeight(true) - height7) / 2 - height5);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    webheight,
    webheight2,
    webheight3,
    webheight4,
    webheight5,
  ]);

  return (
    <>
      <div style={{ marginBottom: "40px" }}>
        <TitleContainer
          className="TitleContainer"
          style={{ borderBottom: "1px solid #d3d3d3" }}
        >
          <Title>{getMenuName()}</Title>
        </TitleContainer>

        {isMobile ? (
          <>
            <GridContainer
              style={{
                borderRight: "1px solid #d3d3d3",
                borderBottom: "1px solid #d3d3d3",
              }}
              color="#4cbce1"
            >
              <PanelBar className="PanelBar">
                <PanelBarItem expanded={!isMobile} title="개인함" icon={"user"}>
                  <PanelBarItem title="예고함  3" />
                  <PanelBarItem title="미결함" />
                  <PanelBarItem title="진행함  2" />
                  <PanelBarItem title="완료함" />
                  <PanelBarItem title="반려함" />
                  <PanelBarItem title="임시함" />
                  <PanelBarItem title="참조/회림함" />
                </PanelBarItem>
                <PanelBarItem title="부서함" icon={"myspace"}>
                  <PanelBarItem title="기술경영팀" />
                  <PanelBarItem title="R & D" />
                </PanelBarItem>
                <PanelBarItem title="설정" icon={"gear"} />
                <PanelBarItem title="개인폴더" icon={"folder"} />
              </PanelBar>
            </GridContainer>
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <GridContainer
                style={{
                  width: "100%",
                  borderBottom: "1px solid #d3d3d3",
                }}
              >
                <SwiperSlide key={0}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={5}>
                      <GridContainer>
                        <GridTitleContainer
                          className="ButtonContainer"
                          style={{ display: "flex" }}
                        >
                          <GridTitle>나의 결제현황</GridTitle>
                          <ButtonContainer>
                            <Button variant="text" style={{ color: "#b8b8b8" }}>
                              more
                            </Button>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(1);
                                }
                              }}
                              color="primary"
                              variant="text"
                              endIcon={<ChevronRightIcon />}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <Divider className="Divider" style={{ width: "100%" }}>
                          TODAY
                        </Divider>
                        <List
                          sx={{
                            bgcolor: "background.paper",
                            overflow: "auto",
                            padding: "0px",
                            height: mobileheight,
                          }}
                        >
                          <ListItem
                            style={{
                              backgroundColor: "#e3bb75",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <ChatIcon />
                              의견
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      외주용역 품의
                                    </span>
                                    에 의견이 추가되었습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                  2018.04.12 13:15 pm
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem
                            style={{
                              backgroundColor: "#6eb0e0",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <CheckCircleOutlineIcon />
                              결재완료
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      휴가 품의서
                                    </span>
                                    에 대한 결제가 완료되었습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                  2018.04.12 12:21 pm
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem
                            style={{
                              backgroundColor: "#6fc0b7",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <PendingActionsIcon />
                              결재도착
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      경조금 신청서
                                    </span>
                                    에 대한 결재문서가 도착하였습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                  2018.04.12 12:20 pm
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem
                            style={{
                              backgroundColor: "#6eb0e0",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <CheckCircleOutlineIcon />
                              결재완료
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      휴가 품의서
                                    </span>
                                    에 대한 결제가 완료되었습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                  2018.04.12 12:19 pm
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem
                            style={{
                              backgroundColor: "#e3bb75",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <ChatIcon />
                              의견
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      외주용역 품의
                                    </span>
                                    에 의견이 추가되었습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                  2018.04.12 12:18 pm
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem
                            style={{
                              backgroundColor: "#6eb0e0",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <CheckCircleOutlineIcon />
                              결재완료
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      휴가 품의서
                                    </span>
                                    에 대한 결제가 완료되었습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem
                            style={{
                              backgroundColor: "#6eb0e0",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <CheckCircleOutlineIcon />
                              결재완료
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      휴가 품의서
                                    </span>
                                    에 대한 결제가 완료되었습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                  2018.04.12 12:21 pm
                                </Typography>
                              }
                            />
                          </ListItem>
                          <ListItem
                            style={{
                              backgroundColor: "#6fc0b7",
                              padding: "0px 0px 0px 0px",
                              marginTop: "5px",
                              marginBottom: "5px",
                            }}
                          >
                            <div
                              style={{
                                width: "18%",
                                minWidth: "80px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                color: "white",
                              }}
                            >
                              <PendingActionsIcon />
                              결재도착
                            </div>
                            <ListItemText
                              style={{
                                backgroundColor: "#f2f5fc",
                                paddingLeft: "15px",
                                marginTop: "0px",
                                marginBottom: "0px",
                                minHeight: "90px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                              primary={
                                <>
                                  <Typography variant="subtitle1">
                                    <span
                                      style={{
                                        color: "#4cbce1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      경조금 신청서
                                    </span>
                                    에 대한 결재문서가 도착하였습니다.
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    style={{ color: "#b8b8b8" }}
                                  >
                                    의견: 정신우 차장
                                  </Typography>
                                </>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  style={{ color: "#b8b8b8", display: "flex" }}
                                >
                                  <ScheduleIcon fontSize="small" /> &nbsp;
                                  2018.04.12 12:20 pm
                                </Typography>
                              }
                            />
                          </ListItem>
                        </List>
                      </GridContainer>
                    </Grid>
                  </Grid>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={7}
                    style={{ width: "100%" }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                        <GridTitleContainer
                          className="ButtonContainer2"
                          style={{ display: "flex" }}
                        >
                          <GridTitle>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(0);
                                }
                              }}
                              color="primary"
                              variant="text"
                              startIcon={<ChevronLeftIcon />}
                            ></Button>
                            미결함
                            <Chip
                              label="4"
                              style={{
                                backgroundColor: "#4CBCE1",
                                color: "white",
                                marginLeft: "5px",
                              }}
                            />
                          </GridTitle>
                          <ButtonContainer>
                            <Button variant="text" style={{ color: "#b8b8b8" }}>
                              more
                            </Button>
                            <Button
                              onClick={() => {
                                if (swiper && isMobile) {
                                  swiper.slideTo(2);
                                }
                              }}
                              color="primary"
                              variant="text"
                              endIcon={<ChevronRightIcon />}
                            ></Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <GridContainer
                          style={{
                            height: mobileheight2,
                            width: "100%",
                            overflow: "auto",
                          }}
                        >
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                              width: "100%",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700, display: "flex" }}
                                gutterBottom
                              >
                                시스템 변경 계획서
                                <LockIcon
                                  style={{
                                    marginLeft: "5px",
                                    color: "#BDBDBD",
                                  }}
                                />
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 장안준 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                  <CardActions>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      승인
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      반려
                                    </Button>
                                  </CardActions>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{
                                  fontWeight: 700,
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                                gutterBottom
                              >
                                발주품의 * 그룹웨어 구축
                                <AttachFileIcon style={{ color: "#BDBDBD" }} />
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 김소현 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                  <CardActions>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      승인
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      반려
                                    </Button>
                                  </CardActions>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </GridContainer>
                      </Grid>
                    </Grid>
                  </Grid>
                </SwiperSlide>
                <SwiperSlide key={2}>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={6}
                    style={{ width: "100%" }}
                  >
                    <GridTitleContainer
                      className="ButtonContainer3"
                      style={{ display: "flex" }}
                    >
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          color="primary"
                          variant="text"
                          startIcon={<ChevronLeftIcon />}
                        ></Button>
                        진행함
                        <Chip
                          label="1"
                          style={{
                            backgroundColor: "#4CBCE1",
                            color: "white",
                            marginLeft: "5px",
                          }}
                        />
                      </GridTitle>
                      <ButtonContainer>
                        <Button variant="text" style={{ color: "#b8b8b8" }}>
                          more
                        </Button>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(3);
                            }
                          }}
                          color="primary"
                          variant="text"
                          endIcon={<ChevronRightIcon />}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <GridContainer
                      style={{ height: mobileheight3, overflow: "auto" }}
                    >
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{
                              fontWeight: 700,
                            }}
                            gutterBottom
                          >
                            단품수주품의서
                          </Typography>
                          <div
                            style={{
                              display: "flex",
                              marginBottom: "5px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <Avatar />
                              <Chip
                                size="small"
                                variant="outlined"
                                label="기안"
                                style={{
                                  borderRadius: "3px",
                                  marginTop: "2px",
                                  marginBottom: "2px",
                                }}
                              />
                            </div>

                            <ChevronRightIcon
                              style={{
                                marginLeft: "2px",
                                marginRight: "2px",
                              }}
                            />
                            <Avatar>+1</Avatar>
                            <ChevronRightIcon
                              style={{
                                marginLeft: "2px",
                                marginRight: "2px",
                              }}
                            />
                            <div>
                              <Avatar style={{ border: "1px solid #4CBCE1" }} />
                              <Chip
                                size="small"
                                variant="outlined"
                                label="대기"
                                style={{
                                  borderRadius: "3px",
                                  marginTop: "2px",
                                  marginBottom: "2px",
                                  backgroundColor: "#4CBCE1",
                                  color: "white",
                                }}
                              />
                            </div>
                          </div>
                          <Typography
                            variant="body2"
                            style={{ marginBottom: "0px" }}
                            color="text.secondary"
                          >
                            기안자: 김소현 과장
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            기안일: 2018.04.12 45:16
                          </Typography>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{
                              fontWeight: 700,
                            }}
                            gutterBottom
                          >
                            신제품 개발 인력투입 계획서
                          </Typography>
                          <div
                            style={{
                              display: "flex",
                              marginBottom: "5px",
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <Avatar />
                              <Chip
                                size="small"
                                variant="outlined"
                                label="기안"
                                style={{
                                  borderRadius: "3px",
                                  marginTop: "2px",
                                  marginBottom: "2px",
                                }}
                              />
                            </div>

                            <ChevronRightIcon
                              style={{
                                marginLeft: "2px",
                                marginRight: "2px",
                              }}
                            />
                            <Avatar>+1</Avatar>
                            <ChevronRightIcon
                              style={{
                                marginLeft: "2px",
                                marginRight: "2px",
                              }}
                            />
                            <div>
                              <Avatar style={{ border: "1px solid #4CBCE1" }} />
                              <Chip
                                size="small"
                                variant="outlined"
                                label="대기"
                                style={{
                                  borderRadius: "3px",
                                  marginTop: "2px",
                                  marginBottom: "2px",
                                  backgroundColor: "#4CBCE1",
                                  color: "white",
                                }}
                              />
                            </div>
                            <ChevronRightIcon
                              style={{
                                marginLeft: "2px",
                                marginRight: "2px",
                              }}
                            />
                            <Avatar>+1</Avatar>
                          </div>
                          <Typography
                            variant="body2"
                            style={{ marginBottom: "0px" }}
                            color="text.secondary"
                          >
                            기안자: 정소민 대리
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            기안일: 2018.04.12 45:16
                          </Typography>
                        </CardContent>
                      </Card>
                    </GridContainer>
                  </Grid>
                </SwiperSlide>
                <SwiperSlide key={3}>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={6}
                    style={{ width: "100%" }}
                  >
                    <GridTitleContainer
                      className="ButtonContainer4"
                      style={{ display: "flex" }}
                    >
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          color="primary"
                          variant="text"
                          startIcon={<ChevronLeftIcon />}
                        ></Button>
                        반려함
                      </GridTitle>
                      <ButtonContainer>
                        <Button variant="text" style={{ color: "#b8b8b8" }}>
                          more
                        </Button>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(4);
                            }
                          }}
                          color="primary"
                          variant="text"
                          endIcon={<ChevronRightIcon />}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <GridContainer
                      style={{ height: mobileheight4, overflow: "auto" }}
                    >
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            홍보 포스터 제작 인건비 품의서
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 김소현 과장
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            홍보메일발송 서비스 구매 건
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 김소현 과장
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            세미나 품의서
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 박민혁 차장
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            외중용역 품의서
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 정소민 대리
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </GridContainer>
                  </Grid>
                </SwiperSlide>
                <SwiperSlide key={4}>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={6}
                    style={{ width: "100%" }}
                  >
                    <GridTitleContainer
                      className="ButtonContainer5"
                      style={{ display: "flex" }}
                    >
                      <GridTitle>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(3);
                            }
                          }}
                          color="primary"
                          variant="text"
                          startIcon={<ChevronLeftIcon />}
                        ></Button>
                        완료함
                      </GridTitle>
                      <ButtonContainer>
                        <Button variant="text" style={{ color: "#b8b8b8" }}>
                          more
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <GridContainer
                      style={{ height: mobileheight5, overflow: "auto" }}
                    >
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            휴가신청서
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 김소현 과장
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            발주품의 * 그룹웨어 구축
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 장민준 과장
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            IT브랜드 교육 참가신청서
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 서경훈 사원
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card
                        variant="outlined"
                        style={{
                          backgroundColor: "#f2f5fc",
                          marginBottom: "5px",
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="subtitle1"
                            style={{ fontWeight: 700 }}
                            gutterBottom
                          >
                            휴가신청서
                          </Typography>
                          <div style={{ display: "flex" }}>
                            <Avatar />
                            <div style={{ marginLeft: "15px" }}>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 이정국 차장
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </GridContainer>
                  </Grid>
                </SwiperSlide>
              </GridContainer>
            </Swiper>
          </>
        ) : (
          <>
            <GridContainerWrap>
              <GridContainer
                width="10%"
                style={{
                  borderRight: "1px solid #d3d3d3",
                  borderBottom: "1px solid #d3d3d3",
                }}
                color="#4cbce1"
              >
                <PanelBar className="PanelBar">
                  <PanelBarItem
                    expanded={!isMobile}
                    title="개인함"
                    icon={"user"}
                  >
                    <PanelBarItem title="예고함  3" />
                    <PanelBarItem title="미결함" />
                    <PanelBarItem title="진행함  2" />
                    <PanelBarItem title="완료함" />
                    <PanelBarItem title="반려함" />
                    <PanelBarItem title="임시함" />
                    <PanelBarItem title="참조/회림함" />
                  </PanelBarItem>
                  <PanelBarItem title="부서함" icon={"myspace"}>
                    <PanelBarItem title="기술경영팀" />
                    <PanelBarItem title="R & D" />
                  </PanelBarItem>
                  <PanelBarItem title="설정" icon={"gear"} />
                  <PanelBarItem title="개인폴더" icon={"folder"} />
                </PanelBar>
              </GridContainer>
              <GridContainer
                width={`calc(90% - ${GAP}px)`}
                style={{
                  borderBottom: "1px solid #d3d3d3",
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={5}>
                    <GridContainer>
                      <GridTitleContainer
                        className="ButtonContainer"
                        style={{ display: "flex" }}
                      >
                        <GridTitle>나의 결제현황</GridTitle>
                        <ButtonContainer>
                          <Button variant="text" style={{ color: "#b8b8b8" }}>
                            more
                          </Button>
                        </ButtonContainer>
                      </GridTitleContainer>
                      <Divider>TODAY</Divider>
                      <List
                        sx={{
                          width: "100%",
                          bgcolor: "background.paper",
                          overflow: "auto",
                          padding: "0px",
                          height: webheight,
                        }}
                      >
                        <ListItem
                          style={{
                            backgroundColor: "#e3bb75",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <ChatIcon />
                            의견
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    외주용역 품의
                                  </span>
                                  에 의견이 추가되었습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                                2018.04.12 13:15 pm
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem
                          style={{
                            backgroundColor: "#6eb0e0",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <CheckCircleOutlineIcon />
                            결재완료
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    휴가 품의서
                                  </span>
                                  에 대한 결제가 완료되었습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                                2018.04.12 12:21 pm
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem
                          style={{
                            backgroundColor: "#6fc0b7",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <PendingActionsIcon />
                            결재도착
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    경조금 신청서
                                  </span>
                                  에 대한 결재문서가 도착하였습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                                2018.04.12 12:20 pm
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem
                          style={{
                            backgroundColor: "#6eb0e0",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <CheckCircleOutlineIcon />
                            결재완료
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    휴가 품의서
                                  </span>
                                  에 대한 결제가 완료되었습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                                2018.04.12 12:19 pm
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem
                          style={{
                            backgroundColor: "#e3bb75",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <ChatIcon />
                            의견
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    외주용역 품의
                                  </span>
                                  에 의견이 추가되었습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                                2018.04.12 12:18 pm
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem
                          style={{
                            backgroundColor: "#6eb0e0",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <CheckCircleOutlineIcon />
                            결재완료
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    휴가 품의서
                                  </span>
                                  에 대한 결제가 완료되었습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem
                          style={{
                            backgroundColor: "#6eb0e0",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <CheckCircleOutlineIcon />
                            결재완료
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    휴가 품의서
                                  </span>
                                  에 대한 결제가 완료되었습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                                2018.04.12 12:21 pm
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem
                          style={{
                            backgroundColor: "#6fc0b7",
                            padding: "0px 0px 0px 0px",
                            marginTop: "5px",
                            marginBottom: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "18%",
                              minWidth: "80px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              color: "white",
                            }}
                          >
                            <PendingActionsIcon />
                            결재도착
                          </div>
                          <ListItemText
                            style={{
                              backgroundColor: "#f2f5fc",
                              paddingLeft: "15px",
                              marginTop: "0px",
                              marginBottom: "0px",
                              minHeight: "90px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                            primary={
                              <>
                                <Typography variant="subtitle1">
                                  <span
                                    style={{
                                      color: "#4cbce1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    경조금 신청서
                                  </span>
                                  에 대한 결재문서가 도착하였습니다.
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#b8b8b8" }}
                                >
                                  의견: 정신우 차장
                                </Typography>
                              </>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                style={{ color: "#b8b8b8", display: "flex" }}
                              >
                                <ScheduleIcon fontSize="small" /> &nbsp;
                                2018.04.12 12:20 pm
                              </Typography>
                            }
                          />
                        </ListItem>
                      </List>
                    </GridContainer>
                  </Grid>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={7}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                        <GridTitleContainer
                          className="ButtonContainer2"
                          style={{ display: "flex" }}
                        >
                          <GridTitle>
                            미결함
                            <Chip
                              label="4"
                              style={{
                                backgroundColor: "#4CBCE1",
                                color: "white",
                                marginLeft: "5px",
                              }}
                            />
                          </GridTitle>
                          <ButtonContainer>
                            <Button variant="text" style={{ color: "#b8b8b8" }}>
                              more
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <GridContainer
                          style={{ height: webheight2, overflow: "auto" }}
                        >
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700, display: "flex" }}
                                gutterBottom
                              >
                                시스템 변경 계획서
                                <LockIcon
                                  style={{
                                    marginLeft: "5px",
                                    color: "#BDBDBD",
                                  }}
                                />
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 장안준 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                  <CardActions>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      승인
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      반려
                                    </Button>
                                  </CardActions>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{
                                  fontWeight: 700,
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                                gutterBottom
                              >
                                발주품의 * 그룹웨어 구축
                                <AttachFileIcon style={{ color: "#BDBDBD" }} />
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 김소현 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                  <CardActions>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      승인
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{
                                        color: "black",
                                        backgroundColor: "white",
                                      }}
                                      size="small"
                                    >
                                      반려
                                    </Button>
                                  </CardActions>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </GridContainer>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                        <GridTitleContainer
                          className="ButtonContainer3"
                          style={{ display: "flex" }}
                        >
                          <GridTitle>
                            진행함
                            <Chip
                              label="1"
                              style={{
                                backgroundColor: "#4CBCE1",
                                color: "white",
                                marginLeft: "5px",
                              }}
                            />
                          </GridTitle>
                          <ButtonContainer>
                            <Button variant="text" style={{ color: "#b8b8b8" }}>
                              more
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <GridContainer
                          style={{ height: webheight3, overflow: "auto" }}
                        >
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{
                                  fontWeight: 700,
                                }}
                                gutterBottom
                              >
                                단품수주품의서
                              </Typography>
                              <div
                                style={{
                                  display: "flex",
                                  marginBottom: "5px",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div>
                                  <Avatar />
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label="기안"
                                    style={{
                                      borderRadius: "3px",
                                      marginTop: "2px",
                                      marginBottom: "2px",
                                    }}
                                  />
                                </div>

                                <ChevronRightIcon
                                  style={{
                                    marginLeft: "2px",
                                    marginRight: "2px",
                                  }}
                                />
                                <Avatar>+1</Avatar>
                                <ChevronRightIcon
                                  style={{
                                    marginLeft: "2px",
                                    marginRight: "2px",
                                  }}
                                />
                                <div>
                                  <Avatar
                                    style={{ border: "1px solid #4CBCE1" }}
                                  />
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label="대기"
                                    style={{
                                      borderRadius: "3px",
                                      marginTop: "2px",
                                      marginBottom: "2px",
                                      backgroundColor: "#4CBCE1",
                                      color: "white",
                                    }}
                                  />
                                </div>
                              </div>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 김소현 과장
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{
                                  fontWeight: 700,
                                }}
                                gutterBottom
                              >
                                신제품 개발 인력투입 계획서
                              </Typography>
                              <div
                                style={{
                                  display: "flex",
                                  marginBottom: "5px",
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div>
                                  <Avatar />
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label="기안"
                                    style={{
                                      borderRadius: "3px",
                                      marginTop: "2px",
                                      marginBottom: "2px",
                                    }}
                                  />
                                </div>

                                <ChevronRightIcon
                                  style={{
                                    marginLeft: "2px",
                                    marginRight: "2px",
                                  }}
                                />
                                <Avatar>+1</Avatar>
                                <ChevronRightIcon
                                  style={{
                                    marginLeft: "2px",
                                    marginRight: "2px",
                                  }}
                                />
                                <div>
                                  <Avatar
                                    style={{ border: "1px solid #4CBCE1" }}
                                  />
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label="대기"
                                    style={{
                                      borderRadius: "3px",
                                      marginTop: "2px",
                                      marginBottom: "2px",
                                      backgroundColor: "#4CBCE1",
                                      color: "white",
                                    }}
                                  />
                                </div>
                                <ChevronRightIcon
                                  style={{
                                    marginLeft: "2px",
                                    marginRight: "2px",
                                  }}
                                />
                                <Avatar>+1</Avatar>
                              </div>
                              <Typography
                                variant="body2"
                                style={{ marginBottom: "0px" }}
                                color="text.secondary"
                              >
                                기안자: 정소민 대리
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                기안일: 2018.04.12 45:16
                              </Typography>
                            </CardContent>
                          </Card>
                        </GridContainer>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                        <GridTitleContainer
                          className="ButtonContainer4"
                          style={{ display: "flex" }}
                        >
                          <GridTitle>반려함</GridTitle>
                          <ButtonContainer>
                            <Button variant="text" style={{ color: "#b8b8b8" }}>
                              more
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <GridContainer
                          style={{ height: webheight4, overflow: "auto" }}
                        >
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                홍보 포스터 제작 인건비 품의서
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 김소현 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                홍보메일발송 서비스 구매 건
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 김소현 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                세미나 품의서
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 박민혁 차장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                외중용역 품의서
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 정소민 대리
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </GridContainer>
                      </Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                        <GridTitleContainer
                          className="ButtonContainer5"
                          style={{ display: "flex" }}
                        >
                          <GridTitle>완료함</GridTitle>
                          <ButtonContainer>
                            <Button variant="text" style={{ color: "#b8b8b8" }}>
                              more
                            </Button>
                          </ButtonContainer>
                        </GridTitleContainer>
                        <GridContainer
                          style={{ height: webheight5, overflow: "auto" }}
                        >
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                휴가신청서
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 김소현 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                발주품의 * 그룹웨어 구축
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 장민준 과장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                IT브랜드 교육 참가신청서
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 서경훈 사원
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card
                            variant="outlined"
                            style={{
                              backgroundColor: "#f2f5fc",
                              marginBottom: "5px",
                            }}
                          >
                            <CardContent>
                              <Typography
                                variant="subtitle1"
                                style={{ fontWeight: 700 }}
                                gutterBottom
                              >
                                휴가신청서
                              </Typography>
                              <div style={{ display: "flex" }}>
                                <Avatar />
                                <div style={{ marginLeft: "15px" }}>
                                  <Typography
                                    variant="body2"
                                    style={{ marginBottom: "0px" }}
                                    color="text.secondary"
                                  >
                                    기안자: 이정국 차장
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    기안일: 2018.04.12 45:16
                                  </Typography>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </GridContainer>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </GridContainer>
            </GridContainerWrap>
          </>
        )}
      </div>
    </>
  );
};
export default EA_A3000W;
