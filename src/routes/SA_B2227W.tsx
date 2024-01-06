import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Knob } from "primereact/knob";
import React, { useEffect, useRef, useState } from "react";
import { Map } from "react-kakao-maps-sdk";
import { useRecoilState } from "recoil";
import {
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  SubTitle,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { convertDateToStr, dateformat2 } from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import BarChart from "../components/KPIcomponents/Chart/BarChart";
import SpecialDial from "../components/KPIcomponents/SpecialDial/SpecialDial";
import Table from "../components/KPIcomponents/Table/Table";
import { colors, colorsName } from "../store/atoms";
import CardBox from "../components/CardBox";
import ClusterMap from "../components/ClusterMap";

const SA_B2227W: React.FC = () => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [color, setColor] = useRecoilState(colors);
  const [colorName, setColorName] = useRecoilState(colorsName);

  const theme = createTheme({
    palette: {
      primary: {
        main: `${color[0]}`,
        dark: `${color[1]}`,
        light: `${color[2]}`,
      },
      secondary: {
        main: `${color[3]}`,
      },
    },
  });

  useEffect(() => {}, [color]);

  const [AllPanel, setAllPanel] = useState({
    three_cnt: 380,
    cnt: 21,
    contract_rate: 60,
    new_question_cnt: 30,
    new_contract_cnt: 20,
  });

  const cardOption = [
    {
      title: "3년간 수주 고객 수",
      data:
        AllPanel.three_cnt != null ? AllPanel.three_cnt + "개사" : 0 + "개사",
      backgroundColor: theme.palette.primary.dark,
    },
    {
      title: "올해 신규 고객 수",
      data: AllPanel.cnt != null ? AllPanel.cnt + "개사" : 0 + "개사",
      backgroundColor: theme.palette.primary.main,
    },
  ];

  const [ItemList, setItemList] = useState<any[]>([
    {
      testpart: "일반독성",
      cnt: 5,
      num: 1,
    },
    {
      testpart: "생식독성",
      cnt: 3,
      num: 2,
    },
    {
      testpart: "국소/면역",
      cnt: 1,
      num: 3,
    },
    {
      testpart: "안전성약리",
      cnt: 50,
      num: 4,
    },
    {
      testpart: "유전독성",
      cnt: 1,
      num: 5,
    },
    {
      testpart: "대체독성",
      cnt: 0,
      num: 6,
    },
    {
      testpart: "분석",
      cnt: 1,
      num: 7,
    },
  ]);

  const [TeamList, setTeamList] = useState<any[]>([
    {
      teamnm: "1팀",
      cnt: 7,
      num: 1,
    },
    {
      teamnm: "2팀",
      cnt: 12,
      num: 2,
    },
    {
      teamnm: "3팀",
      cnt: 5,
      num: 3,
    },
  ]);

  const [ThreeList, setThreeList] = useState<any[]>([
    {
      yyyy: "23년",
      cnt: 21,
      num: 1,
    },
    {
      yyyy: "22년",
      cnt: 150,
      num: 2,
    },
    {
      yyyy: "21년",
      cnt: 219,
      num: 3,
    },
  ]);

  const [CountryData, setCountryData] = useState<any[]>([
    {
      KR_cnt: 90,
      JP_cnt: 20,
      CN_cnt: 16,
      US_cnt: 10,
      DE_cnt: 9,
      SE_cnt: 8,
      RU_cnt: 7,
      Any_cnt: 13,
      total_cnt: 173,
    },
  ]);

  const [map, setMap] = useState<any>(null);
  const ref = useRef<any>();
  useEffect(() => {
    const newMap = new window.google.maps.Map(ref.current, {
      center: { lat: 37.569227, lng: 126.9777256 },
      zoom: 2,
      disableDefaultUI: true,
      maxZoom: 16,
    });

    setMap(newMap);
  }, []);

  return (
    <>
      <div
        style={{
          fontFamily: "TheJamsil5Bold",
          marginBottom: "50px",
          paddingTop: "25px",
        }}
      >
        <ThemeProvider theme={theme}>
          <GridContainerWrap mobilemaxWidth={1600}>
            <GridContainer mobilemaxWidth={1600} width="50%">
              <GridContainerWrap height="15vh">
                <GridContainer width="35%">
                  <TitleContainer
                    style={{ marginBottom: "0px", justifyContent: "center" }}
                  >
                    <Title>신규 고객 유치현황</Title>
                  </TitleContainer>
                  <TitleContainer
                    style={{ paddingBottom: "25px", justifyContent: "center" }}
                  >
                    <SubTitle>
                      {dateformat2(convertDateToStr(new Date()))}
                    </SubTitle>
                  </TitleContainer>
                </GridContainer>
                <GridContainer width={`calc(65% - ${GAP}px)`}>
                  <Grid container spacing={2} style={{ marginBottom: "15px" }}>
                    {cardOption.map((item) => (
                      <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                        <Card
                          style={{
                            height: "120px",
                            width: "100%",
                            marginRight: "15px",
                            backgroundColor: item.backgroundColor,
                            color: "white",
                            fontFamily: "TheJamsil5Bold",
                          }}
                        >
                          <CardContent
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              paddingBottom: 0,
                            }}
                          >
                            <Typography
                              style={{
                                fontSize: "2rem",
                                fontWeight: 900,
                                color: "white",
                                fontFamily: "TheJamsil5Bold",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {item.data}
                            </Typography>
                          </CardContent>
                          <CardHeader
                            title={
                              <>
                                <Typography
                                  style={{
                                    fontSize: "1.1rem",
                                    color: "white",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontFamily: "TheJamsil5Bold",
                                  }}
                                >
                                  {item.title}
                                </Typography>
                              </>
                            }
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </GridContainer>
              </GridContainerWrap>
              <GridContainer>
                <GridTitle>지도로 보는 고객사 현황</GridTitle>
                <div
                  ref={ref}
                  id="map"
                  style={{ width: "100%", height: "70vh" }}
                ></div>
                {/* <ClusterMap /> */}
              </GridContainer>
            </GridContainer>
            <GridContainer mobilemaxWidth={1600} width={`calc(50% - ${GAP}px)`}>
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ marginBottom: "10px" }}
                >
                  <GridTitle>신규 고객 계약율</GridTitle>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <Knob
                          value={AllPanel.contract_rate}
                          size={200}
                          valueTemplate={"{value}%"}
                          valueColor={theme.palette.primary.dark}
                          rangeColor={theme.palette.secondary.main}
                          readOnly
                          strokeWidth={10}
                        />
                      </div>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={12} xl={6}>
                      <CardBox
                        title={"신규고객 문의 건수"}
                        titlefontsize={"1rem"}
                        data={AllPanel.new_question_cnt + "건"}
                        backgroundColor={theme.palette.primary.dark}
                        fontsize={"1.6rem"}
                        form={"SA_B2227W"}
                        height={"120px"}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={12} xl={6}>
                      <CardBox
                        title={"신규고객 계약 건수"}
                        titlefontsize={"1rem"}
                        data={AllPanel.new_contract_cnt + "건"}
                        backgroundColor={theme.palette.primary.dark}
                        fontsize={"1.6rem"}
                        form={"SA_B2227W"}
                        height={"120px"}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ marginBottom: "10px" }}
                >
                  <GridTitle>사업부별 신규 문의 건수</GridTitle>
                  <BarChart
                    props={ItemList}
                    value="cnt"
                    alllabel={ItemList.map((item) => item.testpart)}
                    name="testpart"
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ marginBottom: "10px" }}
                >
                  <GridTitle>팀별 신규 고객 유치</GridTitle>
                  <BarChart
                    props={TeamList}
                    value="cnt"
                    alllabel={TeamList.map((item) => item.teamnm)}
                    name="teamnm"
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={6}
                  xl={6}
                  style={{ marginBottom: "10px" }}
                >
                  <GridTitle>3개년 신규고객 수 현황</GridTitle>
                  <BarChart
                    props={ThreeList}
                    value="cnt"
                    alllabel={ThreeList.map((item) => item.yyyy)}
                    name="yyyy"
                    random={true}
                    colorName={colorName}
                  />
                </Grid>
              </Grid>
            </GridContainer>
          </GridContainerWrap>
          <GridContainer style={{ marginTop: "25px" }}>
            <GridTitleContainer>
              <GridTitle>국가별 고객사 집계</GridTitle>
            </GridTitleContainer>
            <Table
              value={CountryData}
              column={{
                KR_cnt: "한국",
                JP_cnt: "일본",
                CN_cnt: "중국",
                US_cnt: "미국",
                DE_cnt: "독일",
                SE_cnt: "스웨덴",
                RU_cnt: "러시아",
                Any_cnt: "기타",
                total_cnt: "합계",
              }}
              width={[100, 100, 100, 100, 100, 100, 100, 100, 100, 100]}
            />
          </GridContainer>
          <SpecialDial />
        </ThemeProvider>
      </div>
    </>
  );
};

export default SA_B2227W;
