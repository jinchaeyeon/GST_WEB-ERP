import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  UseGetValueFromSessionItem,
  convertDateToStr,
  dateformat2,
  dateformat4,
} from "../components/CommonFunction";
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
import Calender from "../components/DDGDcomponents/Calender";
import {
  DataResult,
  State,
  process as processQuery,
} from "@progress/kendo-data-query";

interface Tsize {
  width: number;
  height: number;
}
const DATA_ITEM_KEY = "custcd";
const Main: React.FC = () => {
  const processApi = useApi();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const [cardOptionState, setCardOptionState] = useState<State>({
    sort: [],
  });
  const [cardOptionData, setCardOptionData] = useState<DataResult>(
    processQuery([], cardOptionState)
  );
  const [selectedState, setSelectedState] = useState<string>("");
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

  const fetchMain = async () => {
    let data: any;
    const Parameters: Iparameters = {
      procedureName: "sys_sel_default_home_web",
      pageNumber: 1,
      pageSize: 100,
      parameters: {
        "@p_work_type": "ATTENDANCE",
        "@p_orgdiv": "01",
        "@p_location": "",
        "@p_user_id": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_ref_date": convertDateToStr(new Date()),
        "@p_ref_key": "",
      },
    };
    try {
      data = await processApi<any>("procedure", Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rowCount = data.tables[0].RowCount;
      const row = data.tables[0].Rows;

      if (rowCount > 0) {
        setCardOptionData((prev) => {
          return {
            data: row,
            total: rowCount == -1 ? 0 : rowCount,
          };
        });

        setSelectedState(row[0][DATA_ITEM_KEY]);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
  };

  useEffect(() => {
    fetchMain();
  }, []);

  const changeColor = (code: string) => {
    const newData = cardOptionData.data.map((item) =>
      item[DATA_ITEM_KEY] == selectedState
        ? {
            ...item,
            color: code,
          }
        : {
            ...item,
          }
    );

    setCardOptionData((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  
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
            {cardOptionData.data.map((item) => (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <CardBox
                  name={item.custnm}
                  class={item.class}
                  date={`${dateformat4(item.strdt)} ~ ${dateformat4(
                    item.enddt
                  )}`}
                  attendance={item.useqty}
                  change={item.adjqty}
                  backgroundColor={item.color}
                  fontsize={size.width < 600 ? "1.8rem" : "3.3rem"}
                  propFunction={(code: string) => changeColor(code)}
                  Click={() => setSelectedState(item[DATA_ITEM_KEY])}
                />
              </Grid>
            ))}
          </Grid>
        </GridContainer>
        {isMobile ? (
          ""
        ) : (
          <GridContainer width={`calc(75% - ${GAP}px)`}>
            <Calender
              data={
                cardOptionData.data.filter(
                  (item) => item[DATA_ITEM_KEY] == selectedState
                )[0]
              }
            />
          </GridContainer>
        )}
      </GridContainerWrap>
    </>
  );
};

export default Main;
