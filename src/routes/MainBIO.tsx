import { DataResult, State, process } from "@progress/kendo-data-query";
import React, { CSSProperties, useCallback, useEffect, useState } from "react";
// ES2015 module syntax
import { Grid as GridMui } from "@mui/material";
import { Button } from "@progress/kendo-react-buttons";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  DayView,
  MonthView,
  Scheduler,
  SchedulerItem,
  SchedulerItemProps,
  WeekView,
} from "@progress/kendo-react-scheduler";
import { bytesToBase64 } from "byte-base64";
import { Card as CardPrime } from "primereact/card";
import { useRecoilState } from "recoil";
import {
  AnswerIcon,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer
} from "../CommonStyled";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  convertDateToStr,
  convertDateToStrWithTime2,
  getQueryFromBizComponent,
  toDate2
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import { LayoutSquareRead } from "../components/DnD/LayoutSquareRead";
import { PieceRead } from "../components/DnD/PieceRead";
import Card from "../components/KPIcomponents/Card/CardBox";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import MessengerWindow from "../components/Windows/CommonWindows/MessengerWindow";
import { useApi } from "../hooks/api";
import { loginResultState, sessionItemState } from "../store/atoms";
import { Iparameters } from "../store/types";

interface Tsize {
  width: number;
  height: number;
}

type TSchedulerDataResult = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

const boardStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexWrap: "wrap",
};
const containerStyle: CSSProperties = {
  width: "100%",
  height: "600px",
};

const answerynBodyTemplate = (rowData: any) => {
  return (
    <>
      <AnswerIcon status={rowData.answeryn} />
    </>
  );
};

const Main: React.FC = () => {
  const pathname: string = window.location.pathname.replace("/", "");
  const processApi = useApi();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionUserId = UseGetValueFromSessionItem("user_id");
  const [sessionItem, setSessionItem] = useRecoilState(sessionItemState);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [tabSelected2, setTabSelected2] = React.useState(0);
  const [layoutTab, setLayoutTab] = useState<any[]>([]);
  const [squares, setSquares] = useState<any[]>([]);
  const [colorData, setColorData] = useState<any[]>([]);
  const [purposeData, setPurposeData] = useState<any[]>([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  const [selected, setSelected] = useState<any>();
  const [selected2, setSelected2] = useState<any>();
  const [selected3, setSelected3] = useState<any>();
  const userName = loginResult ? loginResult.userName : "";
  UseBizComponent("L_APPOINTMENT_COLOR, L_BA400", setBizComponentData);

  const [windowVisible, setWindowVisible] = useState<boolean>(false);
  const onMessengerClick = () => {
    setWindowVisible(true);
  };
  //그리드 데이터 스테이트
  const [allPanelDataState, setAllPanelDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [meetingDataState, setMeetingDataState] = useState<State>({
    sort: [],
  });
  const [consultDataState, setConsultDataState] = useState<State>({
    sort: [],
  });
  const [waitDataState, setWaitDataState] = useState<State>({
    sort: [],
  });
  const [AllPanel, setAllPanel] = useState<DataResult>(
    process([], allPanelDataState)
  );
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [meetingList, setMeetingList] = useState<DataResult>(
    process([], meetingDataState)
  );
  const [consultList, setConsultList] = useState<DataResult>(
    process([], consultDataState)
  );
  const [waitList, setWaitList] = useState<DataResult>(
    process([], waitDataState)
  );
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const handleSelectTab2 = (e: any) => {
    setTabSelected2(e.selected);
    const selectedRow = mainDataResult.data[e.selected];

    const width = 100 / selectedRow.col_cnt;
    const height = 100 / selectedRow.row_cnt;
    const squareStyle: CSSProperties = {
      width: width + "%",
      height: height + "%",
    };
    let arrays = [];
    const datas = detailDataResult.data.filter(
      (item) => mainDataResult.data[e.selected].layout_key == item.layout_key
    );

    for (let i = 0; i < selectedRow.row_cnt; i++) {
      for (let j = 0; j < selectedRow.col_cnt; j++) {
        arrays.push(renderSquare(i, j, squareStyle, datas));
      }
    }
    setSquares(arrays);
  };

  useEffect(() => {
    let arrays = [];
    for (let i = 0; i < mainDataResult.data.length; i++) {
      var name: string = mainDataResult.data[i].layout_name;
      arrays.push(
        <TabStripTab title={name}>
          <div style={containerStyle}>
            <div style={boardStyle}>{squares}</div>
          </div>
        </TabStripTab>
      );
    }
    setLayoutTab(arrays);
  }, [mainDataResult, tabSelected2, tabSelected]);

  function renderSquare(
    row: number,
    col: number,
    squareStyle: CSSProperties,
    knightLists: any[]
  ) {
    const data = knightLists.filter(
      (item: any) => item.col_index == col && item.row_index == row
    );

    return (
      <div key={`${row}${col}`} style={squareStyle}>
        <LayoutSquareRead x={row} y={col}>
          <PieceRead
            isKnight={knights(data, row, col)}
            list={data}
            info={data}
          />
        </LayoutSquareRead>
      </div>
    );
  }

  function knights(data: any[], x: number, y: number) {
    let valid = false;
    data.map((item) => {
      if (item.row_index == x && item.col_index == y) {
        valid = true;
      }
    });
    return valid;
  }

  useEffect(() => {
    if (bizComponentData !== null) {
      const colorQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_APPOINTMENT_COLOR"
        )
      );
      const purposeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA400")
      );

      fetchQuery(purposeQueryStr, setPurposeData);
      fetchQuery(colorQueryStr, setColorData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    const bytes = require("utf8-bytes");
    const convertedQueryStr = bytesToBase64(bytes(queryStr));

    let query = {
      query: convertedQueryStr,
    };

    try {
      data = await processApi<any>("query", query);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  useEffect(() => {
    if (sessionUserId === "") fetchSessionItem();
    // if (token && sessionUserId === "") fetchSessionItem();
  }, [sessionUserId]);

  let sessionOrgdiv = sessionItem.find(
    (sessionItem) => sessionItem.code === "orgdiv"
  )!.value;
  let sessionLocation = sessionItem.find(
    (sessionItem) => sessionItem.code === "location"
  )!.value;

  if (sessionOrgdiv === "") sessionOrgdiv = "01";
  if (sessionLocation === "") sessionLocation = "01";

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setSchedulerFilter((prev) => ({
        ...prev,
        cboSchedulerType: defaultOption.find(
          (item: any) => item.id === "cboSchedulerType"
        ).valueCode,
        isSearch: true,
      }));
      setLayoutFilter((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [schedulerFilter, setSchedulerFilter] = useState({
    cboSchedulerType: "MY",
    user_id: userId,
    isSearch: false,
  });

  const [layoutFilter, setLayoutFilter] = useState({
    pgSize: PAGE_SIZE,
    worktype: "process_layout",
    isSearch: true,
  });

  const schedulerParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": schedulerFilter.cboSchedulerType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_user_id": schedulerFilter.user_id,
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ref_date": "",
      "@p_ref_key": "N",
    },
  };

  const layoutParameters: Iparameters = {
    procedureName: "sys_sel_default_home_web",
    pageNumber: 1,
    pageSize: layoutFilter.pgSize,
    parameters: {
      "@p_work_type": layoutFilter.worktype,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_user_id": userId,
      "@p_frdt": "",
      "@p_todt": "",
      "@p_ref_date": "",
      "@p_ref_key": "",
    },
  };

  const cardParameters: Iparameters = {
    procedureName: "P_HM_A1000_603W_Q",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": "CARD",
      "@p_orgdiv": sessionOrgdiv,
      "@p_userid": userId,
    },
  };

  const tableParameters: Iparameters = {
    procedureName: "P_HM_A1000_603W_Q",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": sessionOrgdiv,
      "@p_userid": userId,
    },
  };

  const [schedulerDataResult, setSchedulerDataResult] = useState<
    TSchedulerDataResult[]
  >([]);

  const fetchScheduler = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", schedulerParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true && data.tables[0]) {
      let rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        id: row.datnum,
        title: row.title,
        start: new Date(row.strtime),
        end: new Date(row.endtime),
      }));

      setSchedulerDataResult(rows);
    }
    setSchedulerFilter((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchTable = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", tableParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      let rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
      }));
      let rows1 = data.tables[1].Rows.map((row: any) => ({
        ...row,
      }));
      let rows2 = data.tables[2].Rows.map((row: any) => ({
        ...row,
        meetingdt: convertDateToStrWithTime2(toDate2(row.meetingdt)),
        meetingpurpose: purposeData.find(
          (item: any) => item.sub_code == row.meetingpurpose
        )?.code_name,
      }));

      setWaitList((prev) => {
        return {
          data: rows,
          total: data.tables[0].RowCount,
        };
      });
      setSelected(rows[0]);
      setConsultList((prev) => {
        return {
          data: rows1,
          total: data.tables[1].RowCount,
        };
      });
      setSelected2(rows1[0]);
      setMeetingList((prev) => {
        return {
          data: rows2,
          total: data.tables[2].RowCount,
        };
      });
      setSelected3(rows2[0]);
    }
    setFilters3((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchCard = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", cardParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true && data.tables[0]) {
      let rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
      }));

      setAllPanel((prev) => {
        return {
          data: rows,
          total: 1,
        };
      });
    }
    setFilters2((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

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

  const fetchLayout = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", layoutParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true && data.tables[0]) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      const totalRowCnt2 = data.tables[1].RowCount;
      const rows2 = data.tables[1].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setDetailDataResult((prev) => {
        return {
          data: rows2,
          total: totalRowCnt2 == -1 ? 0 : totalRowCnt2,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow = rows[0];

        const width = 100 / selectedRow.col_cnt;
        const height = 100 / selectedRow.row_cnt;
        const squareStyle: CSSProperties = {
          width: width + "%",
          height: height + "%",
        };
        let arrays = [];
        const datas = rows2.filter(
          (item: any) => selectedRow.layout_key == item.layout_key
        );

        for (let i = 0; i < selectedRow.row_cnt; i++) {
          for (let j = 0; j < selectedRow.col_cnt; j++) {
            arrays.push(renderSquare(i, j, squareStyle, datas));
          }
        }
        setSquares(arrays);
      }
    }
    setLayoutFilter((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "01",
    frdt: new Date(),
    todt: new Date(),
    dtdiv: "W",
    dtgb: "B",
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    userId: userId,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    userId: userId,
    isSearch: true,
  });

  useEffect(() => {
    if (schedulerFilter.isSearch === true && bizComponentData !== null) {
      fetchScheduler();
    }
  }, [schedulerFilter]);

  useEffect(() => {
    if (layoutFilter.isSearch === true && bizComponentData !== null) {
      fetchLayout();
    }
  }, [layoutFilter]);

  useEffect(() => {
    if (filters2.isSearch === true && bizComponentData !== null) {
      fetchCard();
    }
  }, [filters2]);

  useEffect(() => {
    if (filters3.isSearch === true && bizComponentData !== null) {
      fetchTable();
    }
  }, [filters3]);

  //스케줄러조회조건 Change 함수 => 사용자가 선택한 드롭다운리스트 값을 조회 파라미터로 세팅
  const schedulerFilterChange = (e: any) => {
    const { name, value } = e;

    setSchedulerFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cardOption = [
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약 수",
      data: AllPanel.total > 0 ? AllPanel.data[0].year_count + "건" : 0 + "건",
      backgroundColor: "#64b5f6",
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약금액",
      data: AllPanel.total > 0 ? AllPanel.data[0].year_amt + "억" : 0 + "원",
      backgroundColor: "#bbdefb",
    },
  ];

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
  const displayDate: Date = new Date();

  const CustomItem = (props: SchedulerItemProps) => {
    let colorCode = "";
    if (props.dataItem.colorID != undefined) {
      if (
        typeof props.dataItem.colorID == "number" ||
        typeof props.dataItem.colorID == "string"
      ) {
        colorCode =
          colorData.find(
            (item: any) => item.sub_code == props.dataItem.colorID
          ) == undefined
            ? ""
            : colorData.find(
                (item: any) => item.sub_code == props.dataItem.colorID
              ).color;
      } else {
        colorCode =
          colorData.find(
            (item: any) => item.sub_code == props.dataItem.colorID.sub_code
          ) == undefined
            ? ""
            : colorData.find(
                (item: any) => item.sub_code == props.dataItem.colorID.sub_code
              ).color;
      }
    }
    return (
      <SchedulerItem
        {...props}
        style={{
          ...props.style,
          backgroundColor: colorCode,
        }}
      />
    );
  };

  return (
    <>
      <GridContainerWrap>
        <GridContainer width="55%">
          <GridContainer style={{ marginTop: "20px" }}>
            <GridMui container spacing={2}>
              <GridMui item xs={12} sm={6} md={4} lg={4} xl={4}>
                <CardPrime
                  style={{
                    height: "140px",
                    width: "100%",
                    marginRight: "15px",
                    backgroundColor: "white",
                    color: "black",
                  }}
                  title={`${userName}님, 환영합니다.`}
                >
                  <p
                    style={{
                      fontSize: size.width < 600 ? "2.2rem" : "3rem",
                      fontWeight: "900",
                      color: "white",
                      marginTop: 0,
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    <Button
                      onClick={onMessengerClick}
                      icon="email"
                      themeColor={"primary"}
                      title="쪽지"
                    ></Button>
                  </p>
                </CardPrime>
              </GridMui>
              {cardOption.map((item) => (
                <GridMui item xs={12} sm={6} md={4} lg={4} xl={4}>
                  <Card
                    title={item.title}
                    data={item.data}
                    backgroundColor={item.backgroundColor}
                    fontsize={size.width < 600 ? "2.2rem" : "3rem"}
                    height={"140px"}
                  />
                </GridMui>
              ))}
            </GridMui>
          </GridContainer>
          <GridContainer style={{ marginTop: "20px" }}>
            <TabStrip
              style={{ width: "100%" }}
              selected={tabSelected}
              onSelect={handleSelectTab}
            >
              <TabStripTab title="업무 달력">
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle></GridTitle>
                    {customOptionData !== null && (
                      <div>
                        <CustomOptionComboBox
                          name="cboSchedulerType"
                          value={schedulerFilter.cboSchedulerType}
                          customOptionData={customOptionData}
                          changeData={schedulerFilterChange}
                        />
                      </div>
                    )}
                  </GridTitleContainer>
                  <Scheduler
                    height={"600px"}
                    data={schedulerDataResult}
                    defaultDate={displayDate}
                    item={CustomItem}
                  >
                    <MonthView />
                    <DayView />
                    <WeekView />
                  </Scheduler>
                </GridContainer>
              </TabStripTab>
              <TabStripTab
                title="프로세스 레이아웃"
                disabled={mainDataResult.total == 0 ? true : false}
              >
                <TabStrip
                  style={{ width: "100%" }}
                  selected={tabSelected2}
                  onSelect={handleSelectTab2}
                >
                  {layoutTab}
                </TabStrip>
              </TabStripTab>
            </TabStrip>
          </GridContainer>
        </GridContainer>
        <GridContainer width={`calc(45% - ${GAP}px)`}>
          <GridContainer style={{ marginTop: "20px" }}>
            <GridMui container spacing={2}>
              <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
                <PaginatorTable
                  value={waitList.data}
                  column={{
                    projectNo: "프로젝트NO",
                    status: "진행상태",
                  }}
                  title={"업무 대기(프로젝트 관리)"}
                  width={[150, 120]}
                  key="num"
                  selection={selected}
                  onSelectionChange={(e: any) => {
                    setSelected(e.value);
                  }}
                  height={"210px"}
                  filters={false}
                />
              </GridMui>
              <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
                <PaginatorTable
                  value={consultList.data}
                  column={{
                    title: "제목",
                    projectNo: "프로젝트NO",
                    requestNo: "요청NO",
                    answeryn: "답변",
                  }}
                  title={"컨설팅 요청 및 답변"}
                  width={[150, 150, 150, 80]}
                  key="num"
                  selection={selected2}
                  onSelectionChange={(e: any) => {
                    setSelected2(e.value);
                  }}
                  height={"210px"}
                  filters={false}
                  customCell={[["answeryn", answerynBodyTemplate]]}
                />
              </GridMui>
              <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
                <PaginatorTable
                  value={meetingList.data}
                  column={{
                    meetingdt: "미팅시간",
                    meetingpurpose: "구분",
                    remark: "비고",
                  }}
                  title={"미팅 일정"}
                  width={[120, 120, 200]}
                  key="num"
                  selection={selected3}
                  onSelectionChange={(e: any) => {
                    setSelected3(e.value);
                  }}
                  height={"210px"}
                  filters={false}
                />
              </GridMui>
            </GridMui>
          </GridContainer>
        </GridContainer>
      </GridContainerWrap>
      {windowVisible && (
        <MessengerWindow setVisible={setWindowVisible} modal={false} />
      )}
    </>
  );
};

export default Main;
