import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBoxWrap,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  convertDateToStrWithTime2,
  UseBizComponent,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  //UseMenuDefaults,
  UseGetValueFromSessionItem,
  UseCustomOption,
  getGridItemChangedData,
  setDefaultDate,
} from "../components/CommonFunction";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import TopButtons from "../components/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { gridList } from "../store/columns/CM_B1101W_C";
import DateCell from "../components/Cells/DateCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import { Button } from "@progress/kendo-react-buttons";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import CenterCell from "../components/Cells/CenterCell";
//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const centerField = [
  "usetime",
  "dt_01",
  "dt_02",
  "dt_03",
  "dt_04",
  "dt_05",
  "dt_06",
  "dt_07",
  "dt_08",
  "dt_09",
  "dt_10",
  "dt_11",
  "dt_12",
  "dt_13",
  "dt_14",
  "dt_15",
  "dt_16",
  "dt_17",
  "dt_18",
  "dt_19",
  "dt_20",
  "dt_21",
  "dt_22",
  "dt_23",
  "dt_24",
  "dt_25",
  "dt_26",
  "dt_27",
  "dt_28",
  "dt_29",
  "dt_30",
  "dt_31",
  "total",
];

type TdataArr = {
  rowstatus: string[];
  user_id: string[];
  user_name: string[];
  tel_no: string[];
  mobile_no: string[];
  user_ip: string[];
  birdt: string[];
  bircd: string[];
};

const CM_B1101W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const pathname: string = window.location.pathname.replace("/", "");
  const [tabSelected, setTabSelected] = React.useState(0);
  //커스텀 옵션 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("", setBizComponentData);
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [ifSelectFirstRow2, setIfSelectFirstRow2] = useState(true);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
      }));
    }
  }, [customOptionData]);

  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const handleSelectTab = (e: any) => {
    resetAllGrid();

    if (e.selected == 0) {
      fetchMainGrid();
    } else {
      fetchMainGrid2();
    }
    setTabSelected(e.selected);
  };

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  //그리드 데이터 결과값
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 별 페이지 넘버
  const [mainPgNum, setMainPgNum] = useState(1);
  const [mainPgNum2, setMainPgNum2] = useState(1);
  const [detailPgNum, setDetailPgNum] = useState(1);
  const [isInitSearch, setIsInitSearch] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DATE",
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    custcd: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_CM_B1101W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_userid": userId,
    },
  };

  //조회조건 파라미터
  const parameters2: Iparameters = {
    procedureName: "P_CM_B1101W_Q",
    pageNumber: mainPgNum2,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "MONTH",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt).substring(0, 4),
      "@p_todt": "",
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_userid": userId,
    },
  };

  //조회조건 파라미터
  const detailParameters: Iparameters = {
    procedureName: "P_CM_B1101W_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_custcd": detailFilters.custcd,
      "@p_custnm": filters.custnm,
      "@p_userid": userId,
    },
  };

  const detailParameters2: Iparameters = {
    procedureName: "P_CM_B1101W_Q",
    pageNumber: detailPgNum,
    pageSize: detailFilters.pgSize,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt).substring(0, 4) + "0101",
      "@p_todt": convertDateToStr(filters.frdt).substring(0, 4) + "1231",
      "@p_custcd": detailFilters.custcd,
      "@p_custnm": filters.custnm,
      "@p_userid": userId,
    },
  };
  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchMainGrid2 = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setMainDataResult2((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchDetailGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setDetailDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchDetailGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", detailParameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

      setDetailDataResult((prev) => {
        return {
          data: [...prev.data, ...rows],
          total: totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setDetailPgNum(1);
    setDetailDataResult(process([], detailDataState));
    if (customOptionData !== null) {
      if (tabSelected == 0) {
        fetchDetailGrid();
      } else {
        fetchDetailGrid2();
      }
    }
  }, [detailFilters]);

  useEffect(() => {
    if (customOptionData !== null) {
      if (tabSelected == 0) {
        fetchDetailGrid();
      } else {
        fetchDetailGrid2();
      }
    }
  }, [detailPgNum]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.num]: true });

        setDetailFilters((prev) => ({
          ...prev,
          custcd: firstRowData.custcd,
        }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow2) {
      if (mainDataResult2.total > 0) {
        const firstRowData = mainDataResult2.data[0];
        setSelectedState2({ [firstRowData.num]: true });

        setDetailFilters((prev) => ({
          ...prev,
          custcd: firstRowData.custcd,
        }));
        setIfSelectFirstRow2(true);
      }
    }
  }, [mainDataResult2]);

  useEffect(() => {
    if (ifSelectFirstRow) {
      if (detailDataResult.total > 0) {
        const firstRowData = detailDataResult.data[0];
        setDetailSelectedState({ [firstRowData.num]: true });

        setIfSelectFirstRow(true);
      }
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (bizComponentData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);
  useEffect(() => {
    if (bizComponentData !== null) {
      fetchMainGrid2();
    }
  }, [mainPgNum2]);
  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainPgNum2(1);
    setDetailPgNum(1);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setDetailDataResult(process([], detailDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    setIfSelectFirstRow(false);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
    }));
  };
  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState2(newSelectedState);
    setIfSelectFirstRow2(false);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters((prev) => ({
      ...prev,
      custcd: selectedRowData.custcd,
    }));
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setDetailSelectedState(newSelectedState);

    setIfSelectFirstRow(false);
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
    setIfSelectFirstRow(false);
  };
  //스크롤 핸들러
  const onMainScrollHandler2 = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum2, PAGE_SIZE))
      setMainPgNum2((prev) => prev + 1);
    setIfSelectFirstRow2(false);
  };

  const onDetailScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detailPgNum, PAGE_SIZE))
      setDetailPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult2.total}건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  // 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      isInitSearch === false &&
      permissions !== null
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  const search = () => {
    resetAllGrid();
    if (tabSelected == 0) {
      fetchMainGrid();
    } else {
      fetchMainGrid2();
    }
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined && item.custnm == "총계"
        ? (sum += item[props.field])
        : ""
    );
    return (
      <td colSpan={props.colSpan} style={{ textAlign: "center" }}>
        {sum}
      </td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined && item.custnm == "총계"
        ? (sum += item[props.field])
        : ""
    );
    return (
      <td colSpan={props.colSpan} style={{ textAlign: "center" }}>
        {sum}
      </td>
    );
  };
  return (
    <>
      <TitleContainer>
        <Title>고객대응시간분석</Title>

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
      <FilterBoxWrap>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자</th>
              {tabSelected == 0 ? (
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="frdt"
                      value={filters.frdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                    ~
                    <DatePicker
                      name="todt"
                      value={filters.todt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
                </td>
              ) : (
                <td>
                  <DatePicker
                    name="ftdt"
                    value={filters.frdt}
                    format="yyyy"
                    onChange={filterInputChange}
                    className="required"
                    placeholder=""
                  />
                </td>
              )}

              <th>업체코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={filters.custcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>업체명</th>
              <td>
                <Input
                  name="custnm"
                  type="text"
                  value={filters.custnm}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="일자별">
          <GridContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "40vh" }}
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
                onScroll={onMainScrollHandler}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            centerField.includes(item.fieldName)
                              ? CenterCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell
                              : centerField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="월별">
          <GridContainer>
            <ExcelExport
              data={mainDataResult2.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <GridTitleContainer>
                <GridTitle>요약정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "40vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState2[idGetter(row)], //선택된 데이터
                  })),
                  mainDataState2
                )}
                {...mainDataState2}
                onDataStateChange={onMainDataStateChange2}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onMainSelectionChange2}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult2.total}
                onScroll={onMainScrollHandler2}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange2}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList2"].map(
                    (item: any, idx: number) =>
                      item.sortOrder !== -1 && (
                        <GridColumn
                          key={idx}
                          field={item.fieldName}
                          title={item.caption}
                          width={item.width}
                          cell={
                            centerField.includes(item.fieldName)
                              ? CenterCell
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell2
                              : centerField.includes(item.fieldName)
                              ? gridSumQtyFooterCell2
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>상세정보</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "30vh" }}
          data={process(
            detailDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: detailselectedState[idGetter(row)], //선택된 데이터
            })),
            detailDataState
          )}
          {...detailDataState}
          onDataStateChange={onDetailDataStateChange}
          //선택 기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onDetailSelectionChange}
          //스크롤 조회 기능
          fixedScroll={true}
          total={detailDataResult.total}
          onScroll={onDetailScrollHandler}
          //정렬기능
          sortable={true}
          onSortChange={onDetailSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
        >
          {customOptionData !== null &&
            customOptionData.menuCustomColumnOptions["grdList3"].map(
              (item: any, idx: number) =>
                item.sortOrder !== -1 && (
                  <GridColumn
                    key={idx}
                    field={item.fieldName}
                    title={item.caption}
                    width={item.width}
                    cell={
                      centerField.includes(item.fieldName)
                        ? CenterCell
                        : undefined
                    }
                    footerCell={
                      item.sortOrder === 0 ? mainTotalFooterCell2 : undefined
                    }
                  />
                )
            )}
        </Grid>
      </GridContainer>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"FILTER"}
          setData={setCustData}
        />
      )}
      {gridList.map((grid: any) =>
        grid.columns.map((column: any) => (
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

export default CM_B1101W;
