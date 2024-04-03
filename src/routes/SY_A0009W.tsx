import CampaignIcon from "@mui/icons-material/Campaign";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import ModeOutlinedIcon from "@mui/icons-material/ModeOutlined";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import {
  Avatar as AvatarMUI,
  Badge,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Avatar } from "@progress/kendo-react-layout";
import React from "react";
import {
  GridContainer,
  GridContainerWrap,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { GAP } from "../components/CommonString";

const SY_A0009W: React.FC = () => {
  return (
    <>
      <TitleContainer>
        <Title>마이페이지</Title>
      </TitleContainer>
      <GridContainerWrap>
        <GridContainer width="23%">
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={12}
              md={12}
              lg={12}
              xl={12}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <AvatarMUI style={{ width: "35px", height: "35px" }}>
                    <ModeOutlinedIcon fontSize="small" />
                  </AvatarMUI>
                }
                onClick={() => console.log("dd")}
                style={{ cursor: "pointer" }}
              >
                <Avatar
                  rounded="full"
                  type="image"
                  style={{
                    width: "128px",
                    height: "128px",
                    flexBasis: "128px",
                  }}
                >
                  {/* <img
                      src={"data:image/png;base64," + contact[0].avatar}
                      alt="UserImage"
                    /> */}
                  T
                </Avatar>
              </Badge>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <List
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "15px",
                  boxShadow: "1px 1px 1px 1px gray",
                  padding: "0px",
                }}
              >
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify">
                      <AvatarMUI>
                        <ModeOutlinedIcon />
                      </AvatarMUI>
                    </IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="프로필 사진 변경"
                      style={{ textAlign: "center" }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <List
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "15px",
                  boxShadow: "1px 1px 1px 1px gray",
                  padding: "0px",
                }}
              >
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify"></IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="이름"
                      style={{ textAlign: "center" }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify">
                      <AvatarMUI>
                        <ModeOutlinedIcon />
                      </AvatarMUI>
                    </IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="전화번호"
                      style={{ textAlign: "center" }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify">
                      <AvatarMUI>
                        <ModeOutlinedIcon />
                      </AvatarMUI>
                    </IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="이메일"
                      style={{ textAlign: "center" }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify"></IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="비밀번호 변경"
                      style={{ textAlign: "center" }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(77% - ${GAP}px)`}>
          <Grid container spacing={2}>
            <Grid
              item
              xs={6}
              sm={3}
              md={3}
              lg={3}
              xl={3}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <IconButton aria-label="notice">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <CampaignIcon fontSize="large" />
                  <Typography variant="h6" gutterBottom>
                    공지사항
                  </Typography>
                </div>
              </IconButton>
            </Grid>
            <Grid
              item
              xs={6}
              sm={3}
              md={3}
              lg={3}
              xl={3}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <IconButton aria-label="notice">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <SupportAgentIcon fontSize="large" />
                  <Typography variant="h6" gutterBottom>
                    고객센터
                  </Typography>
                </div>
              </IconButton>
            </Grid>
            <Grid
              item
              xs={6}
              sm={3}
              md={3}
              lg={3}
              xl={3}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <IconButton aria-label="notice">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <CardGiftcardIcon fontSize="large" />
                  <Typography variant="h6" gutterBottom>
                    복지혜택
                  </Typography>
                </div>
              </IconButton>
            </Grid>
            <Grid
              item
              xs={6}
              sm={3}
              md={3}
              lg={3}
              xl={3}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <IconButton aria-label="notice">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <ContactEmergencyIcon fontSize="large" />
                  <Typography variant="h6" gutterBottom>
                    자격증관리
                  </Typography>
                </div>
              </IconButton>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
              <Card
                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: "120px",
                  alignItems: "center",
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    입사: 2011-01-20
                  </Typography>
                  <Typography variant="h5" component="div">
                    13년 2개월
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
              <Card
                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: "120px",
                  alignItems: "center",
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    연차: 15/17
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={4}>
              <Card
                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: "120px",
                  alignItems: "center",
                }}
              >
                <CardContent>
                  <Typography variant="h5" component="div">
                    복지포인트 잔여
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default SY_A0009W;
