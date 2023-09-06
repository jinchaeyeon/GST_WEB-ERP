import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { UseGetValueFromSessionItem } from "../components/CommonFunction";
import { useApi } from "../hooks/api";
import { loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";
import {
  GridContainer,
  GridContainerWrap,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { GAP } from "../components/CommonString";
import { Grid } from "@mui/material";
import CardBox from "../components/DDGDcomponents/CardBox";

interface Tsize {
  width: number;
  height: number;
}

const Main: React.FC = () => {
  const processApi = useApi();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);

  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 850;
  const size: Tsize = useWindowSize();
  function useWindowSize() {
    // Initialize state with undefined width/height so server and client renders match
    // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
    const [windowSize, setWindowSize] = useState({
      width: 0,
      height: 0,
    });

    useEffect(() => {
      // Handler to call on window resize
      function handleResize() {
        // Set window width/height to state
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      // Add event listener
      window.addEventListener("resize", handleResize);
      // Call handler right away so state gets updated with initial window size
      handleResize();
      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }, []); // Empty array ensures that effect is only run on mount
    return windowSize;
  }
  useEffect(() => {
    if (sessionUserId === "") fetchSessionItem();
    // if (token && sessionUserId === "") fetchSessionItem();
  }, [sessionUserId]);

  const fetchSessionItem = useCallback(async () => {
    let data;
    try {
      const para: Iparameters = {
        procedureName: "sys_biz_configuration",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_user_id": userId,
        },
      };

      data = await processApi<any>("procedure", para);

      if (data.isSuccess === true) {
        const rows = data.tables[0].Rows;
        setSessionItem(
          rows
            .filter((item: any) => item.class === "Session")
            .map((item: any) => ({
              code: item.code,
              value: item.value,
            }))
        );
      }
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);

  //더미 데이터
  const cardOption = [
    {
      name: "오토리",
      class: "활동반",
      date: "23.08.01 ~ 23.08.31",
      data: 1,
      backgroundColor: "#fff2cc",
      attendance: 5,
      change: 2,
    },
    {
      name: "오토리",
      class: "활동반",
      date: "23.08.01 ~ 23.08.31",
      data: 1,
      backgroundColor: "#fff2cc",
      attendance: 5,
      change: 2,
    },
    {
      name: "오토리",
      class: "활동반",
      date: "23.08.01 ~ 23.08.31",
      data: 1,
      backgroundColor: "#fff2cc",
      attendance: 5,
      change: 2,
    },
    {
      name: "오토리",
      class: "활동반",
      date: "23.08.01 ~ 23.08.31",
      data: 1,
      backgroundColor: "#fff2cc",
      attendance: 5,
      change: 2,
    },
  ];

  return (
    <>
      <TitleContainer>
        <Title>
          우리집 강아지
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
        <GridContainer
          width="25%"
          height="100%"
          style={{
            overflowY: isMobile ? "visible" : "scroll",
            maxHeight: window.innerHeight - 100,
          }}
        >
          <Grid container spacing={2}>
            {cardOption.map((item) => (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <CardBox
                  name={item.name}
                  class={item.class}
                  date={item.date}
                  attendance={item.attendance}
                  change={item.change}
                  data={item.data}
                  backgroundColor={item.backgroundColor}
                  fontsize={size.width < 600 ? "1.8rem" : "3.3rem"}
                />
              </Grid>
            ))}
          </Grid>
        </GridContainer>
        {isMobile ? (
          ""
        ) : (
          <GridContainer width={`calc(75% - ${GAP})`}></GridContainer>
        )}
      </GridContainerWrap>
    </>
  );
};

export default Main;
