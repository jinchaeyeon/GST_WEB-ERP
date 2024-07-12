import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { MonthView, Scheduler } from "@progress/kendo-react-scheduler";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "swiper/css";
import { ButtonContainer, Title, TitleContainer } from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import {
  dateformat2,
  getDeviceHeight,
  getHeight,
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import { FormWithCustomEditor2 } from "../components/Scheduler/custom-form";
import { useApi } from "../hooks/api";
import { isLoading, OSState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

let height = 0;
let height2 = 0;

const AC_A0050W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [osstate, setOSState] = useRecoilState(OSState);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A0050W", setCustomOptionData);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const userId = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages("AC_A0050W", setMessagesData);
  const [tabSelected, setTabSelected] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-tabstrip-items-wrapper");
      height2 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height - height2);
        setWebHeight(getDeviceHeight(false) - height - height2);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, tabSelected]);

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
    }
  }, [customOptionData]);

  const defaultData: any[] = [
    {
      id: 0,
      title: "Default Data",
      start: new Date("2021-01-01T08:30:00.000Z"),
      end: new Date("2021-01-01T09:00:00.000Z"),
      colorID: { sub_code: 0, code_name: "없음", color: "" },
      dptcd: { text: "", value: "" },
      person: { text: "", value: "" },
    },
  ];

  const [mainDataResult, setMainDataResult] = useState(defaultData);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "SCHEDULER",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A0050W_tab1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_userid": userId,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => ({
        ...row,
        start: new Date(dateformat2(row.Strdt) + " 00:00"),
        end: new Date(
          dateformat2(row.Enddt) + (row.AllDay == 1 ? " 24:00" : " 23:00")
        ),
        description: row.contents,
        title: row.title,
        id: row.num,
        isAllday: row.AllDay == 1 ? true : false,
      }));

      setMainDataResult(rows);
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const search = () => {
    try {
      if (tabSelected == 0) {
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  const exportExcel = () => {};

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  const displayDate: Date = new Date();
  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>자금관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A0050W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="스케줄러"
          disabled={permissions.view ? false : true}
        >
          {osstate == true ? (
            <div
              style={{
                backgroundColor: "#ccc",
                height: isMobile ? mobileheight : webheight,
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
              height={isMobile ? mobileheight : webheight}
              data={mainDataResult}
              defaultDate={displayDate}
              editable={{
                add: false,
                remove: false,
                select: true,
                resize: false,
                drag: false,
                edit: true,
              }}
              form={FormWithCustomEditor2}
            >
              <MonthView />
            </Scheduler>
          )}
        </TabStripTab>
      </TabStrip>
    </>
  );
};

export default AC_A0050W;
