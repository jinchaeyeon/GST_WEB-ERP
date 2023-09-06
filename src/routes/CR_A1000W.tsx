import { Card, CardHeader, Grid, Typography } from "@mui/material";
import "hammerjs";
import React, { useRef } from "react";
import {
  FilterBox,
  FilterBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { GAP } from "../components/CommonString";
import Calender from "../components/DDGDcomponents/Calender";

const App: React.FC = () => {
  const filterRef = useRef<HTMLDivElement>(null);
  function CardDatas() {
    let array = [];
    for (var i = 0; i < 3; i++) {
      array.push(
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <Card
            style={{
              width: "100%",
              marginRight: "15px",
              borderRadius: "10px",
              backgroundColor: "#fff2cc",
              padding: "0 0",
            }}
          >
            <CardHeader
              subheaderTypographyProps={{
                color: "#8f918d",
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
              }}
              title={
                <Typography
                  style={{
                    color: "black",
                    fontSize: "20px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/Born.png`}
                    alt=""
                    width={"20px"}
                    height={"20px"}
                    style={{ marginRight: "2px", marginBottom: "2px" }}
                  />
                  {i == 0
                    ? "이용 기간"
                    : i == 1
                    ? "회원권 사용"
                    : "변경권 사용"}
                </Typography>
              }
              subheader={
                <Typography
                  style={{
                    color: "black",
                    fontSize: "20px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {i == 0
                    ? "23.08.01 ~ 23.08.31"
                    : i == 1
                    ? `8회/3회 (5회 남음)`
                    : `3회/1회 (2회 남음)`}
                </Typography>
              }
            />
          </Card>
        </Grid>
      );
    }
    return array;
  }

  return (
    <>
      <TitleContainer>
        <Title>
          등원 및 변경관리
          <img
            src={`${process.env.PUBLIC_URL}/PuppyFoot.png`}
            alt=""
            width={"30px"}
            height={"30px"}
            style={{ marginLeft: "5px", marginBottom: "-3px" }}
          />
        </Title>
      </TitleContainer>
      <GridContainerWrap height={"87vh"}>
        <GridContainer width="15%">
          <GridTitleContainer>
            <GridTitle>강아지 정보</GridTitle>
          </GridTitleContainer>
          <FilterBoxWrap ref={filterRef}>
            <FilterBox>
              <tbody>
                <tr>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterBoxWrap>
          <Grid container spacing={2}>
            {CardDatas()}
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(85% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>강아지 등원 일정</GridTitle>
          </GridTitleContainer>
          <Calender color={"black"}/>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default App;
