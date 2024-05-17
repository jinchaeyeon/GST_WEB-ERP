import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import MonthCalendar from "../components/Calendars/MonthCalendar";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import UserWindow from "../components/Windows/CommonWindows/UserWindow";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
interface IPrsnnum {
  prsnnum: string;
  prsnnm: string;
  dptcd: string;
  abilcd: string;
  postcd: string;
}

const CustomColorCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;

  const value = field && dataItem[field] ? dataItem[field] : "";

  return value == "연차" ? (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{
        color: "white",
        backgroundColor: "green",
      }}
    >
      {value}
    </td>
  ) : dataItem["work_strtime"] < value ? (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{
        color: "white",
        backgroundColor: "red",
      }}
    >
      {value}
    </td>
  ) : (
    <td aria-colindex={ariaColumnIndex} data-grid-col-index={columnIndex}>
      {value}
    </td>
  );
};

const CustomColorCell2 = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field } = props;

  const value = field && dataItem[field] ? dataItem[field] : "";

  return value == "반차" ? (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{
        backgroundColor: "green",
        color: "white",
      }}
    >
      {value}
    </td>
  ) : value == "연장" ? (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{
        backgroundColor: "#B8DFF8",
        color: "white",
      }}
    >
      {value}
    </td>
  ) : value != "" ? (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{
        backgroundColor: "grey",
        color: "white",
      }}
    >
      {value}
    </td>
  ) : (
    <td aria-colindex={ariaColumnIndex} data-grid-col-index={columnIndex}>
      {value}
    </td>
  );
};

const HU_B3180W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let isMobile = deviceWidth <= 1200;
  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
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
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("HU_B3180W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        yyyymm: setDefaultDate(customOptionData, "yyyymm"),
        rtrchk: defaultOption.find((item: any) => item.id == "rtrchk")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);
  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const dptcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_dptcd_001"
        )
      );

      fetchQuery(dptcdQueryStr, setdptcdListData);
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
  const [userWindowVisible, setuserWindowVisible] = useState<boolean>(false);

  const onUserWndClick = () => {
    setuserWindowVisible(true);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: "",
    yyyymm: new Date(),
    user_id: "",
    user_name: "",
    dptcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_B3180W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
        "@p_dptcd": filters.dptcd,
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev) => ({
      ...prev,
      user_id: data.prsnnum,
      user_name: data.prsnnm,
    }));
  };

  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "기본정보";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const list = () => {
    let array = [];
    for (var i = 1; i < 32; i++) {
      let array2 = [];

      array2.push(
        <GridColumn
          field={"str_" + i}
          title={"출근"}
          cell={CustomColorCell}
          width="100px"
        />
      );
      array2.push(
        <GridColumn
          field={"end_" + i}
          title={"퇴근"}
          cell={CustomColorCell2}
          width="100px"
        />
      );

      array.push(<GridColumn title={i.toString()}>{array2}</GridColumn>);
    }

    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>출퇴근부_월별</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="HU_B3180W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>일자</th>
              <td>
                <DatePicker
                  name="yyyymm"
                  value={filters.yyyymm}
                  format={"yyyy-MM"}
                  onChange={filterInputChange}
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
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
              <th>성명</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={filters.user_id}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>사용자 이름</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>퇴사여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="rtrchk"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer
        style={{
          width: isMobile ? `${deviceWidth - 30}px` : "100%",
        }}
      >
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="출퇴근부_월별"
        >
          <Grid
            style={{
              height: isMobile ? deviceHeight : "85vh",
            }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd == row.dptcd
                )?.dptnm,
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
              field="dptcd"
              title="부서"
              width="120px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="user_name" title="이름" width="120px" />
            <GridColumn field="work_strtime" title="출근" width="120px" />
            <GridColumn field="work_endtime" title="퇴근" width="120px" />
            {list()}
            <GridColumn
              field="cnt"
              title="연차집계"
              width="100px"
              cell={NumberCell}
            />
          </Grid>
        </ExcelExport>
      </GridContainer>
      {userWindowVisible && (
        <UserWindow
          setVisible={setuserWindowVisible}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};

export default HU_B3180W;
