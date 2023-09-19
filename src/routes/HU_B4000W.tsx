import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridPageChangeEvent,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridContainerWrap,
} from "../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions, TColumn, TGrid } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  convertDateToStr,
  UsePermissions,
  UseGetValueFromSessionItem,
  UseCustomOption,
  setDefaultDate,
} from "../components/CommonFunction";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import { gridList } from "../store/columns/HU_B4000W_C";

import {
  SELECTED_FIELD,
  PAGE_SIZE,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import Calendar from "../components/Calendars/Calendar";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { bytesToBase64 } from "byte-base64";

const DATA_ITEM_KEY_USE = "prsnnum";
const DateField = ["regorgdt", "rtrdt", "startdate" ];
const NumberField = ["totalday", "usedday", "ramainday"];

const HU_B4000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter_use = getter(DATA_ITEM_KEY_USE);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  let grdUserAdj: any = useRef(null);
  let userAdjRowIndex: null | number = null;

  let grdAdjDetail: any = useRef(null);
  let adjDetailRowIndex: null | number = null;

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  
  // 조회조건
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    orgdiv: "01",
    ymdFrdt: new Date(),
    cboPrsnnum: "",
    radRtryn: "%",

    find_row_value: "",
    pgNum: 1,
    isSearch: true,

    pgGap: 0,
    scrollDirrection: "down",
    pgSize: PAGE_SIZE,
  });

  //
  const [subfilters, setSubFilters] = useState<{ [name: string]: any }>({
    workType: "DETAIL1",
    prsnnum: "",

    find_row_value: "",
    pgNum: 1,
    isSearch: true,

    pgGap: 0,
    scrollDirrection: "down",
    pgSize: PAGE_SIZE,
  });

  // 사용자별 연차집계
  const [userAdjDataState, setUserAdjDataState] = useState<State>({
    sort: [],
  });

  const [userAdjDataResult, setUserAdjDataResult] = useState<DataResult>(
    process([], userAdjDataState)
  );

  // 연차상세
  const [adjDetailDataState, setAdjDetailDataState] = useState<State>({
    sort: [],
  });

  const [adjDetailDataResult, setAdjDetailDataResult] = useState<DataResult>(
    process([], adjDetailDataState)
  );

  const [selectedUserAdjState, setSelectedUserAdjState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedAdjDetailState, setSelectedAdjDetailState] = useState<{
    [id: string]: boolean | number[];
  }>({});


  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        ymdFrdt: setDefaultDate(customOptionData, "ymdFrdt"),
        cboPrsnnum: defaultOption.find((item: any) => item.id === "cboPrsnnum")
          .valueCode,
        radRtryn: defaultOption.find((item: any) => item.id === "radRtryn")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  // 사용자별 연차 집계 선택 시 연차상세, 출퇴근부, 일지상세내역 조회 
  useEffect(() => {   
    if (subfilters.isSearch && subfilters.prsnnum) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);

      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
  useEffect(() => {
    if (userAdjRowIndex !== null && grdUserAdj.current) {
      grdUserAdj.current.scrollIntoView({ rowIndex: userAdjRowIndex });
      userAdjRowIndex = null;
    }
  }, [userAdjDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setUserAdjDataResult(process([], userAdjDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST1",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": filters.cboPrsnnum,
        "@p_rtrchk": filters.radRtryn,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdUserAdj.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.itemcd === filters.find_row_value
          );
          userAdjRowIndex = findRowIndex;
        }
        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (grdUserAdj.current) {
          userAdjRowIndex = 0;
        }
      }

      setUserAdjDataResult((prev) => {
        return {
          data: [...data.tables[0].Rows],
          total: totalRowCnt === -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.prsnnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedUserAdjState({ [selectedRow[DATA_ITEM_KEY_USE]]: true });

          setSubFilters((prev) => ({
            ...prev,
            prsnnum: selectedRow.prsnnum,
            isSearch: true,
          }));
        } else {
          setSelectedUserAdjState({ [rows[0][DATA_ITEM_KEY_USE]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
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

  //그리드 데이터 조회
  const fetchSubGrid = async (subfilters: any) => {
    let data: any;

    setLoading(true);

    //조회프로시저  파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymmdd": convertDateToStr(filters.ymdFrdt),
        "@p_prsnnum": subfilters.prsnnum,
        "@p_rtrchk": filters.radRtryn,
        "@p_find_row_value": subfilters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (grdAdjDetail.current) {
        adjDetailRowIndex = 0;
      }

      setAdjDetailDataResult((prev) => {
          return {
            data: [...data.tables[0].Rows],
            total: totalRowCnt === -1 ? 0 : totalRowCnt,
          };
      });

      if(totalRowCnt > 0)
      {
        setSelectedAdjDetailState({ [rows[0]["startdate"]]: true });
      }

    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
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

  // 사용자별 연차 집계 페이지 변경
  const userAdjPageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };


  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedUserAdjState,
      dataItemKey: DATA_ITEM_KEY_USE,
    });

    setUserAdjDataState(newSelectedState);
    
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setPage(initialPageState);

    setSubFilters((prev) => ({
      ...prev,
      prsnnum: selectedRowData.prsnnum,
      pgNum: 1,
      isSearch: true,
    }));

  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const search = () => {
    try {
      resetAllGrid();
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } catch (e) {
      alert(e);
    }
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  return (
    <>
      <TitleContainer>
        <Title style={{ height: "10%" }}>연차사용현황(관리자))</Title>
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
        <FilterBox style={{ height: "10%" }}>
          <colgroup>
            <col width="0%" />
            <col width="15%" />
            <col width="0%" />
            <col width="20%" />
            <col width="0%" />
            <col width="20%" />
            <col width="30%" />
          </colgroup>
          <tbody>
            <tr>
              <th>기준일</th>
              <td>
                <DatePicker
                  name="ymdFrdt"
                  value={filters.ymdFrdt}
                  format="yyyy-MM-dd"
                  onChange={InputChange}
                  className="required"
                  placeholder=""
                  calendar={Calendar}
                />
              </td>
              <th> 성명</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboPrsnnum"
                    value={filters.cboPrsnnum}
                    customOptionData={customOptionData}
                    changeData={ComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="radRtryn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th></th>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainer
        style={{
          height: "40vh",
        }}
      >
        <TabStrip
          selected={tabSelected}
          onSelect={handleSelectTab}
          style={{ width: "100%" }}
        >
          <TabStripTab title="연차사용현황">
            <GridContainerWrap>              
              <GridContainer width={"35%"}>
                <GridTitleContainer>
                  <GridTitle style={{ height: "10%" }}>
                    사용자별 연차 집계
                  </GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    userAdjDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedUserAdjState[idGetter_use(row)],
                    })),
                    userAdjDataState
                  )}
                  {...userAdjDataState}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY_USE}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={userAdjDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={userAdjPageChange}
                  onScroll={onMainScrollHandler}
                  // //원하는 행 위치로 스크롤 기능
                  ref={grdUserAdj}
                  //정렬기능
                  sortable={true}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  id="grdUserAdj"
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdUserAdj"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            //footerCell={grdTotalFooterCell}
                          />
                        )
                    )}
                </Grid>
              </GridContainer>
              <GridContainer width={"15%"}>
                <GridTitleContainer>
                  <GridTitle style={{ height: "10%" }}>연차상세</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "70vh" }}
                  data={process(
                    adjDetailDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedAdjDetailState[idGetter_use(row)],
                    })),
                    adjDetailDataState
                  )}
                  {...adjDetailDataState}
                  //선택 기능
                  dataItemKey={"startdate"}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}

                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={adjDetailDataResult.total}
                  // skip={page.skip}
                  // take={page.take}
                  // pageable={true}
                  // onPageChange={adjDetailPageChange}
                  //onScroll={onMainScrollHandler}
                  // //원하는 행 위치로 스크롤 기능
                  ref={grdAdjDetail}
                  //정렬기능
                  sortable={true}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  id="grdAdjDetail"
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions[
                      "grdAdjDetail"
                    ].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            //footerCell={grdTotalFooterCell}
                          />
                        )
                    )}
                </Grid>
              </GridContainer>

              <GridContainer width={"50%"}>
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle style={{ height: "10%" }}>출퇴근부</GridTitle>
                  </GridTitleContainer>
                  <Grid style={{ height: "20vh" }}></Grid>
                </GridContainer>

                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle style={{ height: "10%" }}>일지상세</GridTitle>
                  </GridTitleContainer>
                  <Grid style={{ height: "46vh" }}></Grid>
                </GridContainer>
              </GridContainer>
            </GridContainerWrap>
          </TabStripTab>
          <TabStripTab title="연차조정"></TabStripTab>
        </TabStrip>
      </GridContainer>

      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default HU_B4000W;
