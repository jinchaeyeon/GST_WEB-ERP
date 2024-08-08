import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
var height = 0;

const SY_A0150: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);

  UseMessages(setMessagesData);

  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height);
        setWebHeight(getDeviceHeight(true) - height);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        prsnnum: defaultOption.find((item: any) => item.id == "prsnnum")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
        dutydt: setDefaultDate(customOptionData, "dutydt"),
        workType: defaultOption.find((item: any) => item.id == "workType")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      isSearch: name == "dutydt" ? true : false,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      isSearch: name == "workType" ? true : false,
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "1",
    orgdiv: sessionOrgdiv,
    dutydt: new Date(),
    prsnnum: "",
    dptcd: "",
    rtrchk: "",
    pgNum: 1,
    isSearch: false,
  });

  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_B0001W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_workType": filters.workType == "1" ? "TIME_ANALYSIS" : "TOTAL_TIME",
        "@p_orgdiv": filters.orgdiv,
        "@p_dutydt": convertDateToStr(filters.dutydt).substring(0, 6),
        "@p_prsnnum": filters.prsnnum,
        "@p_dptcd": filters.dptcd,
        "@p_rtrchk": filters.rtrchk,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[에러발생]");
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

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData != null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  const search = () => {
    try {
      if (
        convertDateToStr(filters.dutydt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.dutydt).substring(6, 8) > "31" ||
        convertDateToStr(filters.dutydt).substring(6, 8) < "01" ||
        convertDateToStr(filters.dutydt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SY_B0001W_001");
      } else {
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const TimeList = () => {
    let array: any[] = [];

    for (var i = 1; i <= 31; i++) {
      var day = filters.dutydt;
      day.setDate(i);
      array.push(
        <GridColumn
          field={`day${i}`}
          title={`${i}(${getDays(day)})`}
          width="120px"
          cell={CustomCell}
          headerCell={
            getDays(day) == "토"
              ? CustomHeaderCell
              : getDays(day) == "일"
              ? CustomHeaderCell2
              : undefined
          }
        />
      );
    }

    if (filters.workType == "2") {
      array.push(
        <GridColumn
          field={`totoverday`}
          title={`잔여연장시간`}
          width="120px"
          cell={CustomCell2}
        />
      );
      array.push(
        <GridColumn
          field={`overday`}
          title={`월 연장시간`}
          width="120px"
          cell={CustomCell2}
        />
      );
    }

    return array;
  };

  const getDays = (date: Date) => {
    var dayofweek = new Date(date).getDay();

    if (dayofweek == 0) {
      return "일";
    } else if (dayofweek == 1) {
      return "월";
    } else if (dayofweek == 2) {
      return "화";
    } else if (dayofweek == 3) {
      return "수";
    } else if (dayofweek == 4) {
      return "목";
    } else if (dayofweek == 5) {
      return "금";
    } else if (dayofweek == 6) {
      return "토";
    } else {
      return "";
    }
  };

  const CustomHeaderCell = (props: GridHeaderCellProps) => {
    return (
      <div style={{ textAlign: "center", color: "blue" }}>{props.title}</div>
    );
  };

  const CustomHeaderCell2 = (props: GridHeaderCellProps) => {
    return (
      <div style={{ textAlign: "center", color: "red" }}>{props.title}</div>
    );
  };

  const CustomCell = (props: GridCellProps) => {
    const {
      ariaColumnIndex,
      columnIndex,
      dataItem,
      field = "",
      render,
      onChange,
      className = "",
    } = props;
    const value = field && dataItem[field] ? dataItem[field] : "";

    function checkValue(value: string) {
      if (value != "" && value != "00:00") {
        const str = value.replace(":", "");
        if (parseInt(str) < 850) {
          return "blue";
        } else if (parseInt(str) < 900 && parseInt(str) >= 850) {
          return "green";
        } else {
          return "red";
        }
      } else {
        return undefined;
      }
    }

    return (
      <td
        className={className}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{
          backgroundColor: checkValue(value),
          fontWeight: 600,
          fontSize: "15px",
          textAlign: "center",
        }}
      >
        {value}
      </td>
    );
  };

  const CustomCell2 = (props: GridCellProps) => {
    const {
      ariaColumnIndex,
      columnIndex,
      dataItem,
      field = "",
      render,
      onChange,
      className = "",
    } = props;
    const value = field && dataItem[field] ? dataItem[field] : "";

    return (
      <td
        className={className}
        aria-colindex={ariaColumnIndex}
        data-grid-col-index={columnIndex}
        style={{
          fontWeight: 600,
          fontSize: "15px",
          textAlign: "center",
        }}
      >
        {value}
      </td>
    );
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>날짜</th>
              <td>
                <DatePicker
                  name="dutydt"
                  value={filters.dutydt}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  placeholder=""
                  className="required"
                  calendar={MonthCalendar}
                />
              </td>
              <th>사용자명</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prsnnum"
                    value={filters.prsnnum}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    valueField="user_id"
                    textField="user_name"
                  />
                )}
              </td>
              <th>근무구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>시간분석</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="workType"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th colSpan={6}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <p
                    style={{ color: "blue", fontSize: "17px", fontWeight: 600 }}
                  >
                    ※파란색 : ~ 8:50
                  </p>
                  <p
                    style={{
                      color: "green",
                      fontSize: "17px",
                      fontWeight: 600,
                    }}
                  >
                    ※초록색 : 8:50 ~ 9:00
                  </p>
                  <p
                    style={{ color: "red", fontSize: "17px", fontWeight: 600 }}
                  >
                    ※빨간색 : 9:00 ~
                  </p>
                </div>
              </th>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName={getMenuName()}
        >
          <Grid
            style={{
              height: isMobile ? mobileheight : webheight,
            }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            {...mainDataState}
            onDataStateChange={onMainDataStateChange}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            <GridColumn
              field="prsnnum"
              title="사번"
              width="120px"
              locked={true}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="prsnnm"
              title="업체명"
              width="120px"
              locked={true}
            />
            {TimeList()}
          </Grid>
        </ExcelExport>
      </GridContainer>
    </>
  );
};

export default SY_A0150;
