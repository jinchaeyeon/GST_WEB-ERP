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
  CardMedia,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { SvgIcon } from "@progress/kendo-react-common";
import { Avatar } from "@progress/kendo-react-layout";
import { userIcon } from "@progress/kendo-svg-icons";
import { Buffer } from "buffer";
import React, { useState } from "react";
import {
  GridContainer,
  GridContainerWrap,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { GAP } from "../components/CommonString";
import ChangePasswordWindow from "../components/Windows/CommonWindows/ChangePasswordWindow";

type TItemInfo = {
  files: string;
  url: string;
};
const defaultItemInfo = {
  files: "",
  url: "",
};

const SY_A0009W: React.FC = () => {
  const [changePasswordWindowVisible, setChangePasswordWindowVisible] =
    useState<boolean>(false);
  const excelInput: any = React.useRef();
  const [imgBase64, setImgBase64] = useState<string>(""); // 파일 base64
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);

  const onAttWndClick = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const getAttachmentsData = async (files: FileList | null) => {
    if (files != null) {
      let uint8 = new Uint8Array(await files[0].arrayBuffer());
      let arrHexString = Buffer.from(uint8).toString("hex");
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      return new Promise((resolve) => {
        reader.onload = () => {
          if (reader.result != null) {
            setImgBase64(reader.result.toString());
            setItemInfo({
              files: "0x" + arrHexString,
              url: reader.result.toString(),
            });
          }
        };
      });
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };
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
                  <AvatarMUI
                    style={{
                      width: "35px",
                      height: "35px",
                      backgroundColor: "#2289C3",
                      border: "1px solid white",
                    }}
                  >
                    <ModeOutlinedIcon fontSize="small" />
                  </AvatarMUI>
                }
                onClick={onAttWndClick}
                style={{ cursor: "pointer" }}
              >
                {imgBase64 != "" ? (
                  <Avatar
                    rounded="full"
                    type="image"
                    style={{
                      width: "128px",
                      height: "128px",
                      flexBasis: "128px",
                      backgroundColor: "white",
                      border: "2px solid #2289C3",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        height: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        style={{
                          height: "100%",
                          width: "100%",
                        }}
                        ref={excelInput}
                        src={imgBase64}
                        alt="UserImage"
                      />
                    </div>
                  </Avatar>
                ) : (
                  <Avatar
                    rounded="full"
                    type="icon"
                    style={{
                      width: "128px",
                      height: "128px",
                      flexBasis: "128px",
                    }}
                  >
                    <SvgIcon icon={userIcon} size="large" />
                  </Avatar>
                )}
                <input
                  id="uploadAttachment"
                  style={{ display: "none" }}
                  type="file"
                  accept="image/*"
                  ref={excelInput}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    getAttachmentsData(event.target.files);
                  }}
                />
              </Badge>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <List
                style={{
                  border: "2px solid #2289C3",
                  borderRadius: "15px",
                  padding: "0px",
                }}
              >
                <ListItem
                  disablePadding
                  secondaryAction={
                    <>
                      <IconButton
                        edge="end"
                        aria-label="mudify"
                        onClick={onAttWndClick}
                      >
                        <AvatarMUI style={{ backgroundColor: "#2289C3" }}>
                          <ModeOutlinedIcon />
                        </AvatarMUI>
                      </IconButton>
                      <input
                        id="uploadAttachment"
                        style={{ display: "none" }}
                        type="file"
                        accept="image/*"
                        ref={excelInput}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          getAttachmentsData(event.target.files);
                        }}
                      />
                    </>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="프로필 사진 변경"
                      disableTypography
                      style={{
                        textAlign: "center",
                        fontFamily: "TheJamsil5Bold",
                        lineHeight: "1.6",
                        fontSize: "1.1rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
              <List
                style={{
                  border: "2px solid #2289C3",
                  borderRadius: "15px",
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
                      disableTypography
                      style={{
                        textAlign: "center",
                        fontFamily: "TheJamsil5Bold",
                        lineHeight: "1.6",
                        fontSize: "1.1rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify">
                      <AvatarMUI style={{ backgroundColor: "#2289C3" }}>
                        <ModeOutlinedIcon />
                      </AvatarMUI>
                    </IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="전화번호"
                      disableTypography
                      style={{
                        textAlign: "center",
                        fontFamily: "TheJamsil5Bold",
                        lineHeight: "1.6",
                        fontSize: "1.1rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify">
                      <AvatarMUI style={{ backgroundColor: "#2289C3" }}>
                        <ModeOutlinedIcon />
                      </AvatarMUI>
                    </IconButton>
                  }
                >
                  <ListItemButton>
                    <ListItemText
                      primary="이메일"
                      disableTypography
                      style={{
                        textAlign: "center",
                        fontFamily: "TheJamsil5Bold",
                        lineHeight: "1.6",
                        fontSize: "1.1rem",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider />
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" aria-label="mudify"></IconButton>
                  }
                  onClick={() => setChangePasswordWindowVisible(true)}
                >
                  <ListItemButton>
                    <ListItemText
                      primary="비밀번호 변경"
                      disableTypography
                      style={{
                        textAlign: "center",
                        fontFamily: "TheJamsil5Bold",
                        lineHeight: "1.6",
                        fontSize: "1.1rem",
                      }}
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
              <IconButton
                aria-label="notice"
                onClick={() => {
                  window.open(`https://erp.gsti.co.kr/CM_A0000W`);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <CampaignIcon fontSize="large" style={{ color: "#2289C3" }} />
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
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
              <IconButton
                aria-label="notice"
                onClick={() => {
                  window.open(`https://spm.gsti.co.kr/QnA`);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <SupportAgentIcon
                    fontSize="large"
                    style={{ color: "#2289C3" }}
                  />
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
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
                  <CardGiftcardIcon
                    fontSize="large"
                    style={{ color: "#2289C3" }}
                  />
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
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
                  <ContactEmergencyIcon
                    fontSize="large"
                    style={{ color: "#2289C3" }}
                  />
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
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
                  <Typography
                    variant="h5"
                    component="div"
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
                    입사: 2011-01-20
                  </Typography>
                  <Typography
                    variant="h5"
                    component="div"
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
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
                  <Typography
                    variant="h5"
                    component="div"
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
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
                {/* <CardMedia
                  component="div"
                  style={{
                    backgroundColor: "#2289C3",
                    width: "50px",
                    height: "100%",
                  }}
                /> */}
                <CardContent>
                  <Typography
                    variant="h5"
                    component="div"
                    style={{ fontFamily: "TheJamsil5Bold" }}
                  >
                    복지포인트 잔여
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {changePasswordWindowVisible && (
        <ChangePasswordWindow setVisible={setChangePasswordWindowVisible} />
      )}
    </>
  );
};

export default SY_A0009W;
