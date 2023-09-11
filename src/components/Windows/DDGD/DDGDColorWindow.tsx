import { Box, DialogContent, DialogTitle, Grid } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Paper, { PaperProps } from "@mui/material/Paper";
import { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { useRecoilState } from "recoil";
import { BottomContainer, ButtonContainer } from "../../../CommonStyled";
import { IWindowPosition } from "../../../hooks/interfaces";
import { colors, colorsName } from "../../../store/atoms";
import { UseGetValueFromSessionItem, UseParaPc } from "../../CommonFunction";
import { useApi } from "../../../hooks/api";

type IKendoWindow = {
  setVisible(arg: boolean): void;
  setData(code: string): void;
  para: string;
  custcd: string;
};

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const KendoWindow = ({ setVisible, setData, para, custcd }: IKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : 500,
    top: isMobile == true ? 0 : 50,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? window.innerHeight : 800,
  });
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");

  useEffect(() => {
    if(para != undefined) {
      if(para == "#FFBEBE") {
        setColorNames("빨강");
      } else if(para == "#FFC8A2") {
        setColorNames("주황");
      } else if(para == "#fff8eb") {
        setColorNames("아이보리");
      } else if(para == "#fff2cc") {
        setColorNames("노랑");
      } else if(para == "#e2f0d9") {
        setColorNames("연두");
      } else if(para == "#85D4BE") {
        setColorNames("초록");
      } else if(para == "#CDEEF3") {
        setColorNames("하늘");
      } else if(para == "#C4C5FF") {
        setColorNames("파랑");
      } else if(para == "#EADFF2") {
        setColorNames("연보라");
      } else if(para == "#dcc8ed") {
        setColorNames("보라");
      } else if(para == "#FFE1E8") {
        setColorNames("연핑크");
      } else if(para == "#FFBCD9") {
        setColorNames("핑크");
      } else {
        setColorNames("노랑");
      }
    }
  },[])
  const [colorNames, setColorNames] = useState("노랑");
  
  const onClose = () => {
    setVisible(false);
  }

  const onSave = async () => {
    let code = ""
    setColorNames(colorNames);
    if(colorNames == "빨강") {
      setData("#FFBEBE");
      code = "#FFBEBE"
    } else if(colorNames == "주황") {
      setData("#FFC8A2");
      code = "#FFC8A2"
    } else if(colorNames == "아이보리") {
      setData("#fff8eb");
      code = "#fff8eb"
    } else if(colorNames == "노랑") {
      setData("#fff2cc");
      code = "#fff2cc"
    } else if(colorNames == "연두") {
      setData("#e2f0d9");
      code = "#e2f0d9"
    } else if(colorNames == "초록") {
      setData("#85D4BE");
      code = "#85D4BE"
    } else if(colorNames == "하늘") {
      setData("#CDEEF3");
      code = "#CDEEF3"
    } else if(colorNames == "파랑") {
      setData("#C4C5FF");
      code = "#C4C5FF"
    } else if(colorNames == "연보라") {
      setData("#EADFF2");
      code = "#EADFF2"
    } else if(colorNames == "보라") {
      setData("#dcc8ed");
      code = "#dcc8ed"
    } else if(colorNames == "연핑크") {
      setData("#FFE1E8");
      code = "#FFE1E8"
    } else if(colorNames == "핑크") {
      setData("#FFBCD9");
      code = "#FFBCD9"
    } else {
      setData("#fff2cc");
      code = "#fff2cc"
    }
    const paraSaved = {
      procedureName: "P_CR_A0020W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "COLOR",
        "@p_orgdiv": "01", // 세션 회사구분
        "@p_custcd": custcd, // 반려견코드
        "@p_location": "",
        "@p_custnm": "",
        "@p_class": "",
        "@p_owner": "",
        "@p_species": "",
        "@p_gender": "",
        "@p_age": 0,
        "@p_manager": "",
        "@p_strdt": "",
        "@p_enddt": "",
        "@p_dayofweek": "",
        "@p_birdt": "",
        "@p_bircd": "",
        "@p_useyn": "",
        "@p_color": code, // 색상코드
        "@p_remark": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "HOME",
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert("저장되었습니다.");
      setVisible(false);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  return (
    <Dialog
      onClose={onClose}
      open={true}
      PaperComponent={PaperComponent}
      maxWidth="lg"
      style={{
        zIndex: 1000000000,
        width: position.width,
        height: position.height,
        top: position.top,
        left: position.left,
      }}
    >
      <DialogTitle>컬러 설정 색상 - {colorNames}</DialogTitle>
      <DialogContent>
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("빨강")}
                style={{ backgroundColor: "#FFBEBE", width: "100%", color: "black" }}
              >
                빨강
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("주황")}
                style={{ backgroundColor: "#FFC8A2", width: "100%", color: "black" }}
              >
                주황
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("아이보리")}
                style={{ backgroundColor: "#fff8eb", width: "100%", color: "black" }}
              >
                아이보리
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("노랑")}
                style={{ backgroundColor: "#fff2cc", width: "100%", color: "black" }}
              >
                노랑
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("연두")}
                style={{ backgroundColor: "#e2f0d9", width: "100%", color: "black" }}
              >
                연두
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("초록")}
                style={{ backgroundColor: "#85D4BE", width: "100%", color: "black" }}
              >
                초록
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("하늘")}
                style={{ backgroundColor: "#CDEEF3", width: "100%", color: "black" }}
              >
                하늘
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("파랑")}
                style={{ backgroundColor: "#C4C5FF", width: "100%", color: "black" }}
              >
                파랑
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("연보라")}
                style={{ backgroundColor: "#EADFF2", width: "100%", color: "black" }}
              >
                연보라
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("보라")}
                style={{ backgroundColor: "#dcc8ed", width: "100%", color: "black" }}
              >
                보라
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("연핑크")}
                style={{ backgroundColor: "#FFE1E8", width: "100%", color: "black" }}
              >
                연핑크
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={4} xl={3}>
              <Button
                variant="contained"
                onClick={() => setColorNames("핑크")}
                style={{ backgroundColor: "#FFBCD9", width: "100%", color: "black" }}
              >
                핑크
              </Button>
            </Grid>
          </Grid>
        </Box>
        <BottomContainer>
          <ButtonContainer>
            <Button onClick={onClose}>취소</Button>
            <Button onClick={onSave}>확인</Button>
          </ButtonContainer>
        </BottomContainer>
      </DialogContent>
    </Dialog>
  );
};

export default KendoWindow;
