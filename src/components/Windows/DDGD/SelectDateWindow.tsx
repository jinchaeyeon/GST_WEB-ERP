import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { Button } from "@progress/kendo-react-buttons";
import {
  Calendar,
  CalendarChangeEvent,
} from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useState } from "react";
import { ButtonContainer } from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import {
  UseGetValueFromSessionItem,
  convertDateToStr,
  dateformat4,
} from "../../CommonFunction";

type IKendoWindow = {
  setVisible(arg: boolean): void;
  data: any;
  changeDate: string;
  reload(
    pastday: string,
    currentday: string,
    shows: boolean,
    shows2: boolean
  ): void;
  show: boolean;
  show2: boolean;
};

const KendoWindow = ({
  setVisible,
  data,
  changeDate,
  reload,
  show,
  show2,
}: IKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [shows, setShows] = useState(show);
  const [shows2, setShows2] = useState(show2);
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 400,
    height: 600,
  });
  const onClose = () => {
    setVisible(false);
  };
  const processApi = useApi();
  const onSave = () => {
    if (date != null) {
      reload(changeDate, convertDateToStr(date), shows, shows2);
    } else {
      alert("변경 등원일을 선택해주세요.");
    }
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [adjnumber, setAdjnumber] = useState<number>(0);
  const [date, setDate] = useState<Date | null>(null);
  const filterInputChange = async (event: CalendarChangeEvent) => {
    const dayOfWeek = event.value.getDay();
    if (!(convertDateToStr(event.value) < convertDateToStr(new Date()))) {
      if (!(convertDateToStr(event.value) > data.enddt)) {
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          let datas: any = "";
          const Parameters = {
            procedureName: "P_CR_A1000W_Q",
            pageNumber: 1,
            pageSize: 100,
            parameters: {
              "@p_work_type": "CAPACITY",
              "@p_orgdiv": sessionOrgdiv,
              "@p_custcd": data.custcd,
              "@p_adjdt": convertDateToStr(event.value),
            },
          };

          try {
            datas = await processApi("procedure", Parameters);
          } catch (error) {
            datas = null;
          }

          if (datas.isSuccess == true) {
            const rowCount = datas.tables[0].RowCount;
            const row = datas.tables[0].Rows[0];

            if (rowCount > 0) {
              setAdjnumber(row.cnt);
            } else {
              setAdjnumber(0);
            }
            setDate(event.value);
            setShows2(false);
            setShows(false);
          } else {
            console.log("[오류 발생]");
            console.log(datas);
          }
        }
      } else {
        setShows(true);
        setShows2(false);
      }
    } else {
      setShows2(true);
      setShows(false);
    }
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
                      fontSize: "1vw",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "TheJamsil5Bold",
                    }}
                  >
                    <img
                      src={`/Born.png`}
                      alt=""
                      width={"20px"}
                      height={"20px"}
                      style={{
                        marginRight: "2px",
                        marginBottom: "2px",
                      }}
                    />
                    {data.custnm}의 등원 변경 가능 횟수
                  </Typography>
                </>
              }
            />
            <CardContent style={{ display: "flex" }}>
              <Typography
                style={{
                  color: "black",
                  fontSize: "1.2vw",
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
                      fontSize: "1vw",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "TheJamsil5Bold",
                    }}
                  >
                    <img
                      src={`/Born.png`}
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
                  fontSize: "1.5vw",
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
                      src={`/Born.png`}
                      alt=""
                      width={"20px"}
                      height={"20px"}
                      style={{
                        marginRight: "2px",
                        marginBottom: "2px",
                      }}
                    />
                    회원권 유효기간
                  </Typography>
                </>
              }
            />
            <CardContent style={{ display: "flex" }}>
              <Typography
                style={{
                  color: "black",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {dateformat4(data.strdt)}~{dateformat4(data.enddt)}
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
                      fontSize: "1vw",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      fontFamily: "TheJamsil5Bold",
                    }}
                  >
                    <img
                      src={`/Born.png`}
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
                  fontSize: "1.2vw",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Calendar
                  navigation={false}
                  value={date}
                  onChange={filterInputChange}
                />
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
            <CardContent
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Typography
                style={{
                  color: "black",
                  fontSize: "25px",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                }}
              >
                해당 일자 잔여석
              </Typography>
              <Typography
                style={{
                  color: "black",
                  fontSize: "25px",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                }}
              >
                {adjnumber}석
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {shows ? (
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <p
              style={{
                color: "red",
                fontSize: "20px",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
              }}
            >
              설정하신 일자가 회원권 종료일 이후입니다.
            </p>
            <p
              style={{
                color: "red",
                fontSize: "20px",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
              }}
            >
              다시 설정해주세요.
            </p>
          </Grid>
        ) : (
          ""
        )}
        {shows2 ? (
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <p
              style={{
                color: "red",
                fontSize: "20px",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
              }}
            >
              설정하신 일자가 오늘 이전입니다.
            </p>
            <p
              style={{
                color: "red",
                fontSize: "20px",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
              }}
            >
              다시 설정해주세요.
            </p>
          </Grid>
        ) : (
          ""
        )}
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
