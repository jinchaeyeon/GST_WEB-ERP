import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridFooterCellProps
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import Calendar from "../components/Calendars/Calendar";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_B1020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "prsnnum";
const dateField = ["birdt", "regorgdt", "rtrdt"];

const HU_B1020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);

  const pathname: string = window.location.pathname.replace("/", "");
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001 , L_HU028 , L_BA002",
    //부서, 급여지급유형, 사업장
    setBizComponentData
  );

  // #region 공통코드 리스트 조회 ()
  const [dptcdLstsListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);

  const [postcdListData, setPostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [paycdListData, setPaydListData] = useState([COM_CODE_DEFAULT_VALUE]);

  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  //#endregion

  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      const paycdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU028")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      fetchQuery(dptcdQueryStr, setDptcdListData);
      fetchQuery(postcdQueryStr, setPostcdListData);
      fetchQuery(paycdQueryStr, setPaydListData);
      fetchQuery(locationQueryStr, setLocationListData);
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

  type TFilters = {
    pgSize: number;
    orgdiv: string;
    ymdFrdt: Date | null;
    cboPaycd: string;
    cboLocation: string;
    cboDptcd: string;

    find_row_value: string;
    scrollDirrection: "up" | "down";
    pgNum: number;
    isSearch: boolean;
    pgGap: number;
  };

  //조회조건 초기값
  const [filters, setFilters] = useState<TFilters>({
    orgdiv: "01",
    cboLocation: "",
    cboDptcd: "",
    cboPaycd: "",
    ymdFrdt: new Date(),
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
    find_row_value: "",
    scrollDirrection: "down",
    pgSize: PAGE_SIZE,
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  //조회프로시저  파라미터
  const parameters: Iparameters = {
    procedureName: "P_HU_B1020W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.cboLocation,
      "@p_dptcd": filters.cboDptcd,
      "@p_paycd": filters.cboPaycd,
      "@p_stddt": convertDateToStr(filters.ymdFrdt),
    },
  };

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

      setFilters((prev) => ({
        ...prev,

        cboDptcd: defaultOption.find((item: any) => item.id === "cboDptcd")
          .valueCode,
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).valueCode,
        cboPaycd: defaultOption.find((item: any) => item.id === "cboPaycd")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  const search = () => {
    try {
      resetAllGrid();
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

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
   //if (!permissions?.view) return;

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
    }
    setLoading(false);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  return (
    <>
      <TitleContainer>
        <Title style={{ height: "10%" }}>인원명부</Title>
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
          <tbody>
            <tr>
              <th>기준일</th>
              <td>
                <DatePicker
                  name="ymdFrdt"
                  value={filters.ymdFrdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={Calendar}
                />
              </td>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboDptcd"
                    value={filters.cboDptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>급여지급유형</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboPaycd"
                    value={filters.cboPaycd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainer>
        <GridTitleContainer>
          <GridTitle style={{ height: "10%" }}>사원 LIST</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "70%" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              dptcd: dptcdLstsListData.find(
                (item: any) => item.dptcd === row.dptcd
              )?.dptnm,
              postcd: postcdListData.find(
                (item: any) => item.sub_code === row.postcd
              )?.code_name,
              paycd: paycdListData.find(
                (item: any) => item.sub_code === row.paycd
              )?.code_name,
              location: locationListData.find(
                (item: any) => item.sub_code === row.location
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)],
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
                    id={item.id}
                    field={item.fieldName}
                    title={item.caption}
                    width={item.width}
                    cell={
                      dateField.includes(item.fieldName) ? DateCell : undefined
                    }
                    footerCell={
                      item.sortOrder === 0 ? mainTotalFooterCell : undefined
                    }
                  ></GridColumn>
                )
            )}
        </Grid>
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

export default HU_B1020W;
