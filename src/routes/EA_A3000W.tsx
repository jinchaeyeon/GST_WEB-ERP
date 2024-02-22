import AttachFileIcon from "@mui/icons-material/AttachFile";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
import React from "react";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { GAP } from "../components/CommonString";

const EA_A3000W: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  return (
    <>
      <div style={{ marginBottom: "40px" }}>
        <TitleContainer style={{ borderBottom: "1px solid #d3d3d3" }}>
          <Title>전자결재</Title>
        </TitleContainer>
        <GridContainerWrap>
          <GridContainer
            width="10%"
            height="89%"
            style={{
              borderRight: "1px solid #d3d3d3",
              borderBottom: "1px solid #d3d3d3",
            }}
            color="#4cbce1"
          >
            <PanelBar>
              <PanelBarItem expanded={true} title="개인함" icon={"user"}>
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
            height="89%"
            style={{
              borderBottom: "1px solid #d3d3d3",
            }}
          >
            <Grid container spacing={2} style={{ marginTop: "10px" }}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={5}>
                <GridContainer height={isMobile ? "100%" : "87vh"}>
                  <GridTitleContainer style={{ display: "flex" }}>
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
                      height: isMobile ? "100%" : "79vh",
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                            <ScheduleIcon fontSize="small" /> &nbsp; 2018.04.12
                            13:15 pm
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                            <ScheduleIcon fontSize="small" /> &nbsp; 2018.04.12
                            12:21 pm
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                            <ScheduleIcon fontSize="small" /> &nbsp; 2018.04.12
                            12:20 pm
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                            <ScheduleIcon fontSize="small" /> &nbsp; 2018.04.12
                            12:19 pm
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                            <ScheduleIcon fontSize="small" /> &nbsp; 2018.04.12
                            12:18 pm
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                            <ScheduleIcon fontSize="small" /> &nbsp; 2018.04.12
                            12:21 pm
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
                                style={{ color: "#4cbce1", fontWeight: 700 }}
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
                            <ScheduleIcon fontSize="small" /> &nbsp; 2018.04.12
                            12:20 pm
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
                    <GridTitleContainer style={{ display: "flex" }}>
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
                      height={isMobile ? "100%" : "38vh"}
                      style={{ overflow: "auto" }}
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
                              style={{ marginLeft: "5px", color: "#BDBDBD" }}
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
                    <GridTitleContainer style={{ display: "flex" }}>
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
                      height={isMobile ? "100%" : "38vh"}
                      style={{ overflow: "auto" }}
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
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                    <GridTitleContainer style={{ display: "flex" }}>
                      <GridTitle>반려함</GridTitle>
                      <ButtonContainer>
                        <Button variant="text" style={{ color: "#b8b8b8" }}>
                          more
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <GridContainer
                      height={isMobile ? "100%" : "38vh"}
                      style={{ overflow: "auto" }}
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
                    <GridTitleContainer style={{ display: "flex" }}>
                      <GridTitle>완료함</GridTitle>
                      <ButtonContainer>
                        <Button variant="text" style={{ color: "#b8b8b8" }}>
                          more
                        </Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <GridContainer
                      height={isMobile ? "100%" : "38vh"}
                      style={{ overflow: "auto" }}
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
      </div>
    </>
  );
};
export default EA_A3000W;
