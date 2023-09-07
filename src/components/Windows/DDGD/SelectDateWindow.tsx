import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useState } from "react";
import { ButtonContainer } from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { dateformat4 } from "../../CommonFunction";

type IKendoWindow = {
  setVisible(arg: boolean): void;
  data: any;
  changeDate: string;
  reload(): void;
};

const KendoWindow = ({
  setVisible,
  data,
  changeDate,
  reload,
}: IKendoWindow) => {
  console.log(data);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 400,
    height: 600,
  });
  const processApi = useApi();
  const [date, setDate] = useState<{ [name: string]: any }>({ date: null });
  const onClose = () => {
    setVisible(false);
  };

  const onSave = () => {
    if (date != null) {
    } else {
      alert("변경 등원일을 선택해주세요.");
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setDate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };

  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  return (
    <Window
      title={`등원 변경 신청`}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={true}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Card
            style={{
              width: "100%",
              marginRight: "15px",
              borderRadius: "10px",
              backgroundColor: "white",
            }}
          >
            <CardHeader
              title={
                <>
                  <Typography
                    style={{
                      color: "black",
                      fontSize: "20px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "TheJamsil5Bold",
                    }}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL}/Born.png`}
                      alt=""
                      width={"20px"}
                      height={"20px"}
                      style={{
                        marginRight: "2px",
                        marginBottom: "2px",
                      }}
                    />
                    {data.custnm}의 등원 변경 남은 횟수
                  </Typography>
                </>
              }
            />
            <CardContent style={{ display: "flex" }}>
              <Typography
                style={{
                  color: "black",
                  fontSize: "25px",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {data.adjqty}회
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Card
            style={{
              width: "100%",
              marginRight: "15px",
              borderRadius: "10px",
              backgroundColor: "white",
            }}
          >
            <CardHeader
              title={
                <>
                  <Typography
                    style={{
                      color: "black",
                      fontSize: "20px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "TheJamsil5Bold",
                    }}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL}/Born.png`}
                      alt=""
                      width={"20px"}
                      height={"20px"}
                      style={{
                        marginRight: "2px",
                        marginBottom: "2px",
                      }}
                    />
                    선택 등원일
                  </Typography>
                </>
              }
            />
            <CardContent style={{ display: "flex" }}>
              <Typography
                style={{
                  color: "black",
                  fontSize: "25px",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {dateformat4(changeDate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Card
            style={{
              width: "100%",
              marginRight: "15px",
              borderRadius: "10px",
              backgroundColor: data.color,
            }}
          >
            <CardHeader
              title={
                <>
                  <Typography
                    style={{
                      color: "black",
                      fontSize: "20px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "TheJamsil5Bold",
                    }}
                  >
                    <img
                      src={`${process.env.PUBLIC_URL}/Born.png`}
                      alt=""
                      width={"20px"}
                      height={"20px"}
                      style={{
                        marginRight: "2px",
                        marginBottom: "2px",
                      }}
                    />
                    변경 등원일
                  </Typography>
                </>
              }
            />
            <CardContent style={{ display: "flex" }}>
              <Typography
                style={{
                  color: "#8f918d",
                  fontSize: "25px",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DatePicker
                  name="date"
                  value={date.date}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  size={"large"}
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <ButtonContainer>
            <Button
              style={{ width: "48%", backgroundColor: "#D3D3D3" }}
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              themeColor={"primary"}
              onClick={onSave}
              style={{ width: "48%" }}
            >
              확인
            </Button>
          </ButtonContainer>
        </Grid>
      </Grid>
    </Window>
  );
};

export default KendoWindow;
