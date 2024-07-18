import { DataResult, State, process } from "@progress/kendo-data-query";
import React, { useEffect, useLayoutEffect, useState } from "react";
// ES2015 module syntax
import { Grid as GridMui } from "@mui/material";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  DayView,
  MonthView,
  Scheduler,
  SchedulerItem,
  SchedulerItemProps,
  WeekView,
} from "@progress/kendo-react-scheduler";
import { useRecoilState } from "recoil";
import { AnswerIcon, GridContainer, GridContainerWrap } from "../CommonStyled";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getBizCom,
  getDeviceHeight,
  getHeight,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import Card from "../components/KPIcomponents/Card/CardBox";
import PaginatorTable from "../components/KPIcomponents/Table/PaginatorTable";
import { useApi } from "../hooks/api";
import { OSState, loginResultState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

type TSchedulerDataResult = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

const answerynBodyTemplate = (rowData: any) => {
  return (
    <>
      <AnswerIcon status={rowData.answeryn} />
    </>
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const Main: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const processApi = useApi();
  const [loginResult, setLoginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [tabSelected, setTabSelected] = React.useState(0);
  const [colorData, setColorData] = useState<any[]>([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  const [selected, setSelected] = useState<any>();
  const [selected2, setSelected2] = useState<any>();
  UseBizComponent("L_APPOINTMENT_COLOR", setBizComponentData);

  const [osstate, setOSState] = useRecoilState(OSState);

  //그리드 데이터 스테이트
  const [allPanelDataState, setAllPanelDataState] = useState<State>({
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
  const [consultList, setConsultList] = useState<DataResult>(
    process([], consultDataState)
  );
  const [waitList, setWaitList] = useState<DataResult>(
    process([], waitDataState)
  );
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  useEffect(() => {
    if (bizComponentData !== null) {
      setColorData(getBizCom(bizComponentData, "L_APPOINTMENT_COLOR"));
    }
  }, [bizComponentData]);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".Cards");
      height2 = getHeight(".p-datatable-header");
      height3 = getHeight(".p-paginator-bottom");
      height4 = getHeight(".k-tabstrip-items-wrapper");
      const paddings = 20;
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false));
        setWebHeight(getDeviceHeight(false) - height - height4 - paddings);
        setWebHeight2(
          getDeviceHeight(false) / 2 - height2 - height3 - paddings
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, tabSelected]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setSchedulerFilter((prev) => ({
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
    if (!permissions.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", schedulerParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true && data.tables[0]) {
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
    if (!permissions.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", tableParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
      }));
      let rows1 = data.tables[1].Rows.map((row: any) => ({
        ...row,
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
    }
    setFilters3((prev) => ({
      ...prev,
      isSearch: false,
    }));
  };

  const fetchCard = async () => {
    if (!permissions.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", cardParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true && data.tables[0]) {
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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    dtdiv: "W",
    dtgb: "B",
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    userId: userId,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    userId: userId,
    isSearch: false,
  });

  useEffect(() => {
    if (
      schedulerFilter.isSearch == true &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      fetchScheduler();
    }
  }, [schedulerFilter, bizComponentData, permissions, customOptionData]);

  useEffect(() => {
    if (
      filters2.isSearch == true &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      fetchCard();
    }
  }, [filters2, bizComponentData, permissions, customOptionData]);

  useEffect(() => {
    if (
      filters3.isSearch == true &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      fetchTable();
    }
  }, [filters3, bizComponentData, permissions, customOptionData]);

  const cardOption = [
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약 수",
      data: AllPanel.total > 0 ? AllPanel.data[0].year_count + "건" : 0 + "건",
      backgroundColor: "#64b5f6",
    },
    {
      title: convertDateToStr(filters.frdt).substring(0, 4) + "년 계약금액",
      data:
        AllPanel.total > 0
          ? Math.ceil(AllPanel.data[0].year_amt) + "억"
          : 0 + "원",
      backgroundColor: "#bbdefb",
    },
  ];

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

  const onLinkChange = (event: any) => {
    const origin = window.location.origin;
    window.open(origin + `/SA_A1000W_603?go=` + event.projectNo);
  };

  const onLinkChange2 = (event: any) => {
    console.log(event)
    const origin = window.location.origin;
    window.open(origin + `/CM_A5000W?go=` + event.document_id);
  };

  return (
    <>
      {!isMobile ? (
        <GridContainerWrap>
          <GridContainer width="55%" style={{ paddingTop: "20px" }}>
            <GridContainer className="Cards">
              <GridMui container spacing={2}>
                {cardOption.map((item) => (
                  <GridMui item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <Card
                      title={item.title}
                      data={item.data}
                      backgroundColor={item.backgroundColor}
                      fontsize={deviceWidth < 600 ? "2.2rem" : "3rem"}
                      height={"140px"}
                    />
                  </GridMui>
                ))}
              </GridMui>
            </GridContainer>
            <GridContainer style={{ paddingTop: "20px" }}>
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected}
                onSelect={handleSelectTab}
                scrollable={isMobile}
              >
                <TabStripTab title="업무 달력">
                  <GridContainer>
                    {osstate == true ? (
                      <div
                        style={{
                          backgroundColor: "#ccc",
                          height: webheight,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        현재 OS에서는 지원이 불가능합니다.
                      </div>
                    ) : (
                      <Scheduler
                        height={webheight}
                        data={schedulerDataResult}
                        defaultDate={displayDate}
                        item={CustomItem}
                      >
                        <MonthView />
                        <DayView />
                        <WeekView />
                      </Scheduler>
                    )}
                  </GridContainer>
                </TabStripTab>
              </TabStrip>
            </GridContainer>
          </GridContainer>
          <GridContainer
            width={`calc(45% - ${GAP}px)`}
            style={{ paddingTop: "20px" }}
          >
            <GridMui container spacing={2}>
              <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
                <PaginatorTable
                  value={waitList.data}
                  column={{
                    projectNo: "PJT NO",
                    status: "상태",
                    consts: "계약여부",
                    custnm: "업체명",
                    chkperson: "영업담당자",
                  }}
                  title={"프로젝트 관리"}
                  width={[150, 120, 100, 120, 120]}
                  key="num"
                  selection={selected}
                  height={webheight2}
                  onSelectionChange={(e: any) => {
                    setSelected(e.value);
                  }}
                  onDoubleClick={(e: any) => {
                    onLinkChange(selected);
                  }}
                  filters={false}
                />
              </GridMui>
              <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
                <PaginatorTable
                  value={consultList.data}
                  column={{
                    projectNo: "PJT NO",
                    custnm: "업체명",
                    title: "제목",
                    answeryn: "답변여부",
                  }}
                  title={"컨설팅 요청 및 답변"}
                  width={[150, 120, 150, 150]}
                  key="num"
                  selection={selected2}
                  height={webheight2}
                  onSelectionChange={(e: any) => {
                    setSelected2(e.value);
                  }}
                  onDoubleClick={(e: any) => {
                    onLinkChange2(selected2);
                  }}
                  filters={false}
                  customCell={[["answeryn", answerynBodyTemplate]]}
                />
              </GridMui>
            </GridMui>
          </GridContainer>
        </GridContainerWrap>
      ) : (
        <div
          style={{
            fontFamily: "TheJamsil5Bold",
            height: webheight,
            overflow: "auto",
          }}
          className="MUI"
        >
          <GridMui container spacing={2}>
            <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
              <GridMui container spacing={2}>
                {cardOption.map((item) => (
                  <GridMui item xs={12} sm={6} md={6} lg={6} xl={6}>
                    <Card
                      title={item.title}
                      data={item.data}
                      backgroundColor={item.backgroundColor}
                      fontsize={deviceWidth < 600 ? "2.2rem" : "3rem"}
                      height={"140px"}
                    />
                  </GridMui>
                ))}
              </GridMui>
            </GridMui>
            <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
              <TabStrip
                style={{ width: "100%" }}
                selected={tabSelected}
                onSelect={handleSelectTab}
                scrollable={isMobile}
              >
                <TabStripTab title="업무 달력">
                  <GridContainer>
                    {osstate == true ? (
                      <div
                        style={{
                          backgroundColor: "#ccc",
                          height: "500px",
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        현재 OS에서는 지원이 불가능합니다.
                      </div>
                    ) : (
                      <Scheduler
                        height={"500px"}
                        data={schedulerDataResult}
                        defaultDate={displayDate}
                        item={CustomItem}
                      >
                        <MonthView />
                        <DayView />
                        <WeekView />
                      </Scheduler>
                    )}
                  </GridContainer>
                </TabStripTab>
              </TabStrip>
            </GridMui>
            <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
              <PaginatorTable
                value={waitList.data}
                column={{
                  projectNo: "PJT NO",
                  status: "상태",
                  consts: "계약여부",
                  custnm: "업체명",
                  chkperson: "영업담당자",
                }}
                title={"프로젝트 관리"}
                width={[150, 120, 100, 120, 120]}
                key="num"
                selection={selected}
                onSelectionChange={(e: any) => {
                  setSelected(e.value);
                }}
                onDoubleClick={(e: any) => {
                  onLinkChange(selected);
                }}
                height={"300px"}
                filters={false}
              />
            </GridMui>
            <GridMui item xs={12} sm={12} md={12} lg={12} xl={12}>
              <PaginatorTable
                value={consultList.data}
                column={{
                  projectNo: "PJT NO",
                  custnm: "업체명",
                  title: "제목",
                  answeryn: "답변여부",
                }}
                title={"컨설팅 요청 및 답변"}
                width={[150, 120, 150, 150]}
                key="num"
                selection={selected2}
                onSelectionChange={(e: any) => {
                  setSelected2(e.value);
                }}
                onDoubleClick={(e: any) => {
                  onLinkChange2(selected2);
                }}
                height={"300px"}
                filters={false}
                customCell={[["answeryn", answerynBodyTemplate]]}
              />
            </GridMui>
          </GridMui>
        </div>
      )}
    </>
  );
};

export default Main;
