import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { setGroupIds } from "@progress/kendo-react-data-tools";
import { Calendar } from "@progress/kendo-react-dateinputs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import {
  AgendaView,
  DayView,
  MonthView,
  Scheduler,
  SchedulerDataChangeEvent,
  TimelineView,
  WeekView,
} from "@progress/kendo-react-scheduler";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import {
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { FormWithCustomEditor } from "../components/Scheduler/custom-form_CM_A3100W";
import { useApi } from "../hooks/api";
import { OSState, isLoading, loginResultState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

let temp = 0;
const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const DATA_ITEM_KEY = "num";
const CM_A3100W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".ButtonContainer3");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height2);
        setMobileHeight2(getDeviceHeight(false) - height - height2);
        setMobileHeight3(getDeviceHeight(false) - height3 - height2);
        setWebHeight(getDeviceHeight(false) - height - height2);
        setWebHeight2(getDeviceHeight(false) - height3 - height2 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const [data, setData] = React.useState<any[]>([]);
  const [group, setGroup] = useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [resultState, setResultState] = useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [osstate, setOSState] = useRecoilState(OSState);
  const [list, setList] = useState([]);
  const [view, setView] = React.useState("week");
  const [date, setDate] = React.useState(new Date());
  const [orientation, setOrientation] = React.useState<
    "horizontal" | "vertical"
  >("vertical");
  const [resourceDataState, setResourceDataState] = useState<State>({
    sort: [],
  });
  const [resourceDataResult, setResourceDataResult] = useState<DataResult>(
    process([], resourceDataState)
  );
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const handleViewChange = React.useCallback(
    (event: any) => {
      setView(event.value);
    },
    [setView]
  );
  const handleDateChange = React.useCallback(
    (event: any) => {
      setDate(event.value);
    },
    [setDate]
  );

  const handleDataChange = ({
    created,
    updated,
    deleted,
  }: SchedulerDataChangeEvent) => {
    if (!permissions.save) return;
    let valid = true;
    let valid2 = true;

    created.map((item) => {
      if (item.title == "") {
        valid2 = false;
      }
      if (
        item.resource == "" ||
        item.resource == undefined ||
        item.resource == null
      ) {
        valid2 = false;
      }
    });

    updated.map((item) => {
      if (item.person != userId) {
        valid = false;
      }
      if (item.title == "") {
        valid2 = false;
      }
      if (
        item.resource == "" ||
        item.resource == undefined ||
        item.resource == null ||
        item.resource.sub_code == ""
      ) {
        valid2 = false;
      }
    });
    deleted.map((item) => {
      if (item.person != userId) {
        valid = false;
      }
      if (item.title == "") {
        valid2 = false;
      }
      if (
        item.resource == "" ||
        item.resource == undefined ||
        item.resource == null ||
        item.resource.sub_code == ""
      ) {
        valid2 = false;
      }
    });

    if (valid != true) {
      alert(findMessage(messagesData, "CM_A3100W_001"));
      return false;
    }
    if (valid2 != true) {
      alert(findMessage(messagesData, "CM_A3100W_002"));
      return false;
    }

    type TdataArr = {
      rowstatus_s: string[];
      datnum_s: string[];
      seq_s: string[];
      title_s: string[];
      strtime_s: string[];
      endtime_s: string[];
      resource_s: string[];
    };

    let dataArr: TdataArr = {
      rowstatus_s: [],
      datnum_s: [],
      seq_s: [],
      title_s: [],
      strtime_s: [],
      endtime_s: [],
      resource_s: [],
    };
    created.forEach((item) => (item["rowstatus"] = "N"));
    updated.forEach((item) => (item["rowstatus"] = "U"));
    deleted.forEach((item) => (item["rowstatus"] = "D"));

    const mergedArr = [...created, ...updated, ...deleted];

    mergedArr.forEach((item) => {
      const {
        rowstatus = "",
        datnum = "",
        seq = "",
        start,
        end,
        title = "",
        isAllDay,
        resource,
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.datnum_s.push(rowstatus == "N" ? "" : datnum);
      dataArr.seq_s.push(rowstatus == "N" ? "0" : seq);
      dataArr.title_s.push(title);
      dataArr.strtime_s.push(
        isAllDay
          ? convertDateToStrWithTime(start).substr(0, 8) + " 0:0"
          : convertDateToStrWithTime(start)
      );
      dataArr.endtime_s.push(
        isAllDay
          ? convertDateToStrWithTime(
              new Date(start.setDate(start.getDate() + 1))
            ).substr(0, 8) + " 0:0"
          : convertDateToStrWithTime(end)
      );
      dataArr.resource_s.push(
        typeof resource == "string" ? resource : resource.sub_code
      );
    });

    setParaData((prev) => ({
      ...prev,
      work_type: "N",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      strtime_s: dataArr.strtime_s.join("|"),
      endtime_s: dataArr.endtime_s.join("|"),
      title_s: dataArr.title_s.join("|"),
      resource_s: dataArr.resource_s.join("|"),
    }));
  };

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    rowstatus_s: "",
    datnum_s: "",
    seq_s: "",
    title_s: "",
    strtime_s: "",
    endtime_s: "",
    resource_s: "",
    userid: userId,
    pc: pc,
    form_id: "CM_A3100W",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A3100W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_orgdiv": paraData.orgdiv,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_datnum_s": paraData.datnum_s,
      "@p_seq_s": paraData.seq_s,
      "@p_title_s": paraData.title_s,
      "@p_strtime_s": paraData.strtime_s,
      "@p_endtime_s": paraData.endtime_s,
      "@p_resource_s": paraData.resource_s,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_form_id": paraData.form_id,
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        resource: paraData.resource_s,
        pgNum: 1,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        resource: paraData.resource_s,
        pgNum: 1,
      }));
      setParaData({
        work_type: "",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "",
        datnum_s: "",
        seq_s: "",
        title_s: "",
        strtime_s: "",
        endtime_s: "",
        resource_s: "",
        userid: userId,
        pc: pc,
        form_id: "CM_A3100W",
      });
    } else {
      alert(data.resultMessage);
    }
  };

  useEffect(() => {
    if (paraData.work_type !== "" && permissions.save) fetchTodoGridSaved();
  }, [paraData, permissions]);

  const search = () => {
    setFilters((prev) => ({
      ...prev,
      resource: "%",
      group: "%",
      isSearch: true,
      pgNum: 1,
    }));
    setFilters2((prev) => ({
      ...prev,
      resource: "%",
      group: "%",
      isSearch: true,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      resource: "%",
      group: "%",
      isSearch: true,
      pgNum: 1,
    }));
    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "resource",
    orgdiv: sessionOrgdiv,
    todt: new Date(),
    resource: "%",
    group: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "schedule",
    orgdiv: sessionOrgdiv,
    resource: "%",
    group: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "list",
    orgdiv: sessionOrgdiv,
    todt: new Date(),
    resource: "%",
    group: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    const selectedDate = value;
    setDate(selectedDate);
    if (name == undefined) {
      setFilters((prev) => ({
        ...prev,
        todt: value,
        isSearch: true,
        pgNum: 1,
      }));
      setFilters3((prev) => ({
        ...prev,
        todt: value,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A3100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_date": convertDateToStr(filters.todt),
        "@p_resource": filters.resource,
        // "@p_group": filters.group,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      setResourceDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const newDataState = processWithGroups(rows, group);
        setTotal(totalRowCnt);
        setResultState(
          newDataState
            .filter((item: any, index: any) => index != 0)
            .map((item2) => ({
              ...item2,
              text:
                rows.filter(
                  (items: any) => items.office_resource_num == item2.value
                )[0] != undefined
                  ? rows.filter(
                      (items: any) => items.office_resource_num == item2.value
                    )[0].resource_name
                  : "",
            }))
        );
      } else {
        setResultState([]);
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    temp = 0;
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A3100W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_date": convertDateToStr(filters.todt),
        "@p_resource": filters2.resource,
        // "@p_group": filters2.group,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        //resource까지 사용컬럼
        start: new Date(item.strtime),
        end: new Date(item.endtime),
        title: item.contents,
        person: item.user_id,
      }));
      setData(rows);
      rows.map((item: { num: number }) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters2((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A3100W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": filters3.orgdiv,
        "@p_date": convertDateToStr(filters3.todt),
        "@p_resource": filters3.resource,
        // "@p_group": filters3.group,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        text: item.resources_name,
        value: item.office_resources_num,
      }));

      if (totalRowCnt > 0) {
        setList(rows);
      } else {
        setList([]);
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters3((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && resourceDataResult.data.length > 0) {
      const firstItem = resourceDataResult.data[0];
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        resource: firstItem.sub_code,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        resource: firstItem.sub_code,
      }));
      hasInitialized.current = true;
    }
  }, [resourceDataResult.data]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  useEffect(() => {
    if (filters3.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, customOptionData]);

  const handleRowClick = (e: { dataItem: any }) => {
    const items = e.dataItem;

    if (!permissions.view) return;

    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      group: "",
      resource: items.sub_code,
    }));

    setFilters3((prev) => ({
      ...prev,
      isSearch: true,
      group: "",
      resource: items.sub_code,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(2);
    }
  };

  const onResourceDataStateChange = (event: GridDataStateChangeEvent) => {
    setResourceDataState(event.dataState);
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              disable={true}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>

      {isMobile ? (
        <Swiper
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onActiveIndexChange={(swiper) => {
            index = swiper.activeIndex;
          }}
        >
          <SwiperSlide key={0}>
            <GridContainer
              style={{
                width: "100%",
                overflow: "auto",
                height: mobileheight,
              }}
            >
              <GridTitleContainer>
                <GridTitle>
                  달력
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </GridTitle>
              </GridTitleContainer>
              <Calendar
                id="CM_A3100W_CALENDAR"
                focusedDate={filters.todt}
                value={filters.todt}
                onChange={filterInputChange}
              />
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(0);
                      }
                    }}
                    icon="chevron-left"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                  회의실 정보
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(2);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </GridTitle>
              </GridTitleContainer>
              <Grid
                data={process(
                  resourceDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
                  })),
                  resourceDataState
                )}
                {...resourceDataState}
                onDataStateChange={onResourceDataStateChange}
                onRowClick={handleRowClick}
                dataItemKey={DATA_ITEM_KEY}
                fixedScroll={true}
                style={{ height: mobileheight3 }}
              >
                <GridColumn field="code_name" title="회의실" />
                <GridColumn field="memo" title="메모" />
              </Grid>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={2}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(1);
                      }
                    }}
                    icon="chevron-left"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                  회의실 예약
                </GridTitle>
              </GridTitleContainer>
              {osstate == true ? (
                <div
                  style={{
                    backgroundColor: "#ccc",
                    height: mobileheight2,
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
                  // id="CM_A3100W_SCHEDULER"
                  data={data}
                  onDataChange={handleDataChange}
                  view={view}
                  onViewChange={handleViewChange}
                  date={date}
                  onDateChange={handleDateChange}
                  editable={true}
                  defaultDate={filters.todt}
                  footer={(props) => <React.Fragment />}
                  group={{
                    resources: ["전체"],
                    orientation,
                  }}
                  resources={[
                    {
                      name: "전체",
                      data: list,
                      field: "resource",
                      valueField: "value",
                      textField: "text",
                    },
                  ]}
                  form={FormWithCustomEditor}
                  height={mobileheight2}
                >
                  <TimelineView showWorkHours={false} />
                  <DayView showWorkHours={false} />
                  <WeekView />
                  <MonthView />
                  <AgendaView />
                </Scheduler>
              )}
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={2}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer>
                <GridTitle>
                  <ButtonContainer style={{ justifyContent: "left" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-left"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
                  </ButtonContainer>
                </GridTitle>
              </GridTitleContainer>
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width="20%">
              <GridContainer className="ButtonContainer2">
                <GridTitleContainer>
                  <GridTitle>달력</GridTitle>
                </GridTitleContainer>
                <Calendar
                  id="CM_A3100W_CALENDAR"
                  focusedDate={filters.todt}
                  value={filters.todt}
                  onChange={filterInputChange}
                />
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>회의실 정보</GridTitle>
                </GridTitleContainer>
                <Grid
                  data={process(
                    resourceDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)],
                    })),
                    resourceDataState
                  )}
                  {...resourceDataState}
                  onDataStateChange={onResourceDataStateChange}
                  onRowClick={handleRowClick}
                  dataItemKey={DATA_ITEM_KEY}
                  fixedScroll={true}
                  style={{ height: webheight2 }}
                >
                  <GridColumn field="code_name" title="회의실" />
                  <GridColumn field="memo" title="메모" />
                </Grid>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(80% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>회의실 예약</GridTitle>
                </GridTitleContainer>
                {osstate == true ? (
                  <div
                    style={{
                      backgroundColor: "#ccc",
                      height: webheight, // 88vh
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
                    // id="CM_A3100W_SCHEDULER"
                    height={webheight}
                    data={data}
                    onDataChange={handleDataChange}
                    view={view}
                    onViewChange={handleViewChange}
                    date={date}
                    onDateChange={handleDateChange}
                    editable={true}
                    defaultDate={filters.todt}
                    footer={(props) => <React.Fragment />}
                    group={{
                      resources: ["전체"],
                      orientation,
                    }}
                    resources={[
                      {
                        name: "전체",
                        data: list,
                        field: "resource",
                        valueField: "value",
                        textField: "text",
                      },
                    ]}
                    form={FormWithCustomEditor}
                  >
                    <TimelineView showWorkHours={false} />
                    <DayView showWorkHours={false} />
                    <WeekView />
                    <MonthView />
                    <AgendaView />
                  </Scheduler>
                )}
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
    </>
  );
};

export default CM_A3100W;
