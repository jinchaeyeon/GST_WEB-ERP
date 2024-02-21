import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ScheduleIcon from "@mui/icons-material/Schedule";
import {
  Button,
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
      {isMobile == false ? (
        <>
          <TitleContainer style={{ borderBottom: "1px solid #d3d3d3" }}>
            <Title>전자결재</Title>
          </TitleContainer>
          <GridContainerWrap>
            <GridContainer
              width="10%"
              height="89vh"
              style={{
                borderRight: "1px solid #d3d3d3",
                borderBottom: "1px solid #d3d3d3",
              }}
              color="#4cbce1"
            >
              <PanelBar>
                <PanelBarItem expanded={true} title="개인함" icon={"user"}>
                  <PanelBarItem title="예고함" />
                  <PanelBarItem title="미결함" />
                  <PanelBarItem title="진행함" />
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
              height="89vh"
              style={{
                borderBottom: "1px solid #d3d3d3",
              }}
            >
              <Grid container spacing={2} style={{ marginTop: "10px" }}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={5}>
                  <GridContainer height="87vh">
                    <GridTitleContainer>
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
                        height: "79vh",
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
                      2
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                      3
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                      4
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                      5
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </GridContainer>
          </GridContainerWrap>
        </>
      ) : (
        ""
      )}
    </>
  );
};
export default EA_A3000W;
