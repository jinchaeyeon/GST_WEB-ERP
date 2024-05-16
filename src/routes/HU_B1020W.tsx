import { DataResult, State, process } from "@progress/kendo-data-query";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import Calendar from "../components/Calendars/Calendar";
import DateCell from "../components/Cells/DateCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getQueryFromBizComponent,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/HU_B1020W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const dateField = ["birdt", "regorgdt", "rtrdt"];

const HU_B1020W: React.FC = () => {
  let deviceWidth = window.innerWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);

  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

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
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU005")
      );
      const paycdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_HU028")
      );
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA002")
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

    if (data.isSuccess == true) {
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

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  //조회조건 초기값
  const [filters, setFilters] = useState<TFilters>({
    orgdiv: sessionOrgdiv,
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

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B1020W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,

        cboDptcd: defaultOption.find((item: any) => item.id == "cboDptcd")
          ?.valueCode,
        cboLocation: defaultOption.find(
          (item: any) => item.id == "cboLocation"
        )?.valueCode,
        cboPaycd: defaultOption.find((item: any) => item.id == "cboPaycd")
          ?.valueCode,
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
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  const search = () => {
    try {
      resetAllGrid();
      setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    } catch (e) {
      alert(e);
    }
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "사원 LIST";
      _export.save(optionsGridOne);
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;

    let data: any;
    setLoading(true);

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
          total: totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
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
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
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
              pathname="HU_B1020W"
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

      <GridContainer style={{ width: `${deviceWidth - 30}px`, overflow: "auto" }}>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="인원명부"
        >
          <Grid
            style={{ height: isMobile ? deviceHeight :  "85vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdLstsListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
                postcd: postcdListData.find(
                  (item: any) => item.sub_code == row.postcd
                )?.code_name,
                paycd: paycdListData.find(
                  (item: any) => item.sub_code == row.paycd
                )?.code_name,
                location: locationListData.find(
                  (item: any) => item.sub_code == row.location
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
            onSelectionChange={onSelectionChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        dateField.includes(item.fieldName)
                          ? DateCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0 ? mainTotalFooterCell : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
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
