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
  GridContainerWrap,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import {
  Input,
  RadioGroup,
  RadioGroupChangeEvent,
} from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters } from "../store/types";
import YearCalendar from "../components/YearCalendar";
import {
  chkScrollHandler,
  convertDateToStr,
  setDefaultDate,
  UseCommonQuery,
  UseCustomOption,
  //UseMenuDefaults,
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/ItemsWindow";
import { IItemData, TCommonCodeData } from "../hooks/interfaces";
import {
  commonCodeDefaultValue,
  gnvWidth,
  clientWidth,
  gridMargin,
  itemgradeQuery,
  itemlvl1Query,
  itemlvl2Query,
  itemlvl3Query,
  useynRadioButtonData,
  zeroynRadioButtonData,
  pageSize,
  SELECTED_FIELD,
} from "../components/CommonString";
import NumberCell from "../components/Cells/NumberCell";
import DateCell from "../components/Cells/DateCell";
import CommonComboBox from "../components/ComboBoxes/CommonComboBox";
import CommonRadioGroup from "../components/CommonRadioGroup";
//import {useAuth} from "../../hooks/auth";

const numberField = [
  "col_safeqty",
  "col_stockqty",
  "col_stockqty1",
  "col_stockwgt",
  "col_unp",
  "col_baseqty",
  "col_basewgt",
  "col_inqty",
  "col_inwgt",
  "col_outqty",
  "col_outwgt",
  "col_amt",
  "col_amt2",
  "col_unp2",
  "col_bnatur_insiz",
];

const dateField = ["col_indt"];

const pathname: string = window.location.pathname.replace("/", "");

//그리드 별 키 필드값
const DATA_ITEM_KEY = "itemcd";
const DETAIL_DATA_ITEM_KEY = "lotnum";

const MA_B7000: React.FC = () => {
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [detail1DataState, setDetail1DataState] = useState<State>({
    sort: [],
  });

  const [detail2DataState, setDetail2DataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detail1DataResult, setDetail1DataResult] = useState<DataResult>(
    process([], detail1DataState)
  );

  const [detail2DataResult, setDetail2DataResult] = useState<DataResult>(
    process([], detail2DataState)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //그리드 별 페이지 넘버
  const [mainPgNum, setMainPgNum] = useState(1);
  const [detail1PgNum, setDetail1PgNum] = useState(1);
  const [detail2PgNum, setDetail2PgNum] = useState(1);

  const [isInitSearch, setIsInitSearch] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    console.log("e~!");
    console.log(e);
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: pageSize,
    work_type: "LIST",
    orgdiv: "01",
    cboLocation: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    ymdyyyy: new Date(),
    cboItemacnt: "", //filterData.find((item: any) => item.name === "itemacnt").value,
    radzeroyn: "%",
    lotnum: "",
    load_place: "",
    heatno: "",
    cboItemlvl1: "",
    cboItemlvl2: "",
    cboItemlvl3: "",
    radUseyn: "Y", //filterData.find((item: any) => item.name === "useyn").value,
    service_id: pathname,
  });

  const [detailFilters1, setDetailFilters1] = useState({
    pgSize: pageSize,
    work_type: "DETAIL1",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    yyyymm: "",
    itemacnt: "",
    zeroyn: "%",
    lotnum: "",
    load_place: "",
    heatno: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    useyn: "Y",
    service_id: pathname,
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: pageSize,
    work_type: "DETAIL2",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    yyyymm: "",
    itemacnt: "",
    zeroyn: "%",
    lotnum: "",
    load_place: "",
    heatno: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    useyn: "Y",
    service_id: pathname,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_WEB_MA_B7000_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.cboLocation,
      "@p_yyyymm": convertDateToStr(filters.ymdyyyy),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_itemacnt": filters.cboItemacnt,
      "@p_zeroyn": filters.radzeroyn,
      "@p_lotnum": filters.lotnum,
      "@p_load_place": filters.load_place,
      "@p_heatno": filters.heatno,
      "@p_itemlvl1": filters.cboItemlvl1,
      "@p_itemlvl2": filters.cboItemlvl2,
      "@p_itemlvl3": filters.cboItemlvl3,
      "@p_useyn": filters.radUseyn,
      "@p_service_id": filters.service_id,
    },
  };

  const detailParameters: Iparameters = {
    procedureName: "P_WEB_MA_B7000_Q",
    pageNumber: detail1PgNum,
    pageSize: detailFilters1.pgSize,
    parameters: {
      "@p_work_type": "DETAIL1",
      "@p_orgdiv": detailFilters1.orgdiv,
      "@p_location": filters.cboLocation,
      // "@p_location":
      //   (filters.cboLocation ? filters.cboLocation.sub_code : "") === ""
      //     ? "01"
      //     : filters.cboLocation.sub_code,
      "@p_yyyymm": convertDateToStr(filters.ymdyyyy),
      "@p_itemcd": detailFilters1.itemcd,
      "@p_itemnm": detailFilters1.itemnm,
      "@p_insiz": detailFilters1.insiz,
      "@p_itemacnt": detailFilters1.itemacnt,
      "@p_zeroyn": detailFilters1.zeroyn,
      "@p_lotnum": detailFilters1.lotnum,
      "@p_load_place": detailFilters1.load_place,
      "@p_heatno": detailFilters1.heatno,
      "@p_itemlvl1": "",
      "@p_itemlvl2": "",
      "@p_itemlvl3": "",
      "@p_useyn": detailFilters1.useyn,
      "@p_service_id": detailFilters1.service_id,
    },
  };

  const detail2Parameters: Iparameters = {
    procedureName: "P_WEB_MA_B7000_Q",
    pageNumber: detail2PgNum,
    pageSize: detailFilters2.pgSize,
    parameters: {
      "@p_work_type": "DETAIL2",
      "@p_orgdiv": detailFilters2.orgdiv,
      "@p_location": filters.cboLocation,
      "@p_yyyymm": convertDateToStr(filters.ymdyyyy),
      "@p_itemcd": detailFilters1.itemcd,
      "@p_itemnm": detailFilters2.itemnm,
      "@p_insiz": "",
      "@p_itemacnt": detailFilters1.itemacnt,
      "@p_zeroyn": "",
      "@p_lotnum": detailFilters2.lotnum,
      "@p_load_place": "",
      "@p_heatno": detailFilters2.heatno,
      "@p_itemlvl1": "",
      "@p_itemlvl2": "",
      "@p_itemlvl3": "",
      "@p_useyn": "",
      "@p_service_id": detailFilters2.service_id,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    let data: any;

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
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (mainDataResult.total > 0) {
      const firstRowData = mainDataResult.data[0];
      setSelectedState({ [firstRowData.itemcd]: true });

      setDetailFilters1((prev) => ({
        ...prev,
        itemacnt: firstRowData.itemacnt,
        itemcd: firstRowData.itemcd,
        work_type: "DETAIL1",
      }));
    }
  }, [mainDataResult]);

  //디테일1 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (detail1DataResult.total > 0) {
      const firstRowData = detail1DataResult.data[0];
      setDetailSelectedState({ [firstRowData.lotnum]: true });

      setDetailFilters2((prev) => ({
        ...prev,
        lotnum: firstRowData.lotnum,
        work_type: "DETAIL2",
      }));
    }
  }, [detail1DataResult]);

  //그리드 데이터 조회
  const fetchDetailGrid1 = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetail1DataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    }
  };

  const fetchDetailGrid2 = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", detail2Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].Rows.length;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0)
        setDetail2DataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    }
  };

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchDetailGrid1();
    }
  }, [detail1PgNum]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchDetailGrid2();
    }
  }, [detail2PgNum]);

  useEffect(() => {
    if (customOptionData !== null) {
      resetAllDetailGrid();
      fetchDetailGrid1();
    }
  }, [detailFilters1]);

  useEffect(() => {
    if (customOptionData !== null) {
      resetDetail2Grid();
      fetchDetailGrid2();
    }
  }, [detailFilters2]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setDetail1PgNum(1);
    setDetail2PgNum(1);
    setMainDataResult(process([], mainDataState));
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
  };

  const resetAllDetailGrid = () => {
    setDetail1PgNum(1);
    setDetail2PgNum(1);
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
  };

  const resetDetail2Grid = () => {
    setDetail2PgNum(1);
    setDetail2DataResult(process([], detail2DataState));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters1((prev) => ({
      ...prev,
      itemacnt: selectedRowData.itemacnt,
      itemcd: selectedRowData.itemcd,
      work_type: "DETAIL1",
    }));
  };

  //디테일1 그리드 선택 이벤트 => 디테일2 그리드 조회
  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters2({
      ...detailFilters2,
      lotnum: selectedRowData.lotnum,
      work_type: "DETAIL2",
    });
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
    if (chkScrollHandler(event, mainPgNum, pageSize))
      setMainPgNum((prev) => prev + 1);
  };
  const onDetail1ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detail1PgNum, pageSize))
      setDetail1PgNum((prev) => prev + 1);
  };
  const onDetail2ScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, detail2PgNum, pageSize))
      setDetail2PgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetail1DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail1DataState(event.dataState);
  };
  const onDetail2DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail2DataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const detail1TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detail1DataResult.total}건
      </td>
    );
  };

  const detail2TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detail2DataResult.total}건
      </td>
    );
  };

  //품목마스터 팝업
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };
  const getItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail1SortChange = (e: any) => {
    setDetail1DataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail2SortChange = (e: any) => {
    setDetail2DataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (대분류, 중분류, 소분류, 품목등급)
  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl1Query, setItemlvl1ListData);

  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl2Query, setItemlvl2ListData);

  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemlvl3Query, setItemlvl3ListData);

  const [itemgradeListData, setItemgradeListData] = React.useState([
    commonCodeDefaultValue,
  ]);
  UseCommonQuery(itemgradeQuery, setItemgradeListData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        ymdyyyy: setDefaultDate(customOptionData, "ymdyyyy"),
        cboItemacnt: defaultOption.find(
          (item: any) => item.id === "cboItemacnt"
        ).value,
        cboItemlvl1: defaultOption.find(
          (item: any) => item.id === "cboItemlvl1"
        ).value,
        cboItemlvl2: defaultOption.find(
          (item: any) => item.id === "cboItemlvl2"
        ).value,
        cboItemlvl3: defaultOption.find(
          (item: any) => item.id === "cboItemlvl3"
        ).value,
        cboLocation: defaultOption.find(
          (item: any) => item.id === "cboLocation"
        ).value,
        //radUseyn: defaultOption.find(
        //  (item: any) => item.id === "ymdyyyy"
        //  ).value,
        radzeroyn: defaultOption.find((item: any) => item.id === "radzeroyn")
          .value,
      }));
    }
  }, [customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData !== null && isInitSearch === false) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters]);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl1: itemlvl1ListData.find(
          (item: any) => item.sub_code === row.itemlvl1
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemlvl1ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl2: itemlvl2ListData.find(
          (item: any) => item.sub_code === row.itemlvl2
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemlvl2ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemlvl3: itemlvl3ListData.find(
          (item: any) => item.sub_code === row.itemlvl3
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemlvl3ListData]);

  useEffect(() => {
    setMainDataResult((prev) => {
      const rows = prev.data.map((row: any) => ({
        ...row,
        itemgrade: itemgradeListData.find(
          (item: any) => item.sub_code === row.itemgrade
        )?.code_name,
      }));

      return {
        data: [...rows],
        total: prev.total,
      };
    });
  }, [itemgradeListData]);

  return (
    <>
      <TitleContainer>
        <Title>재고조회</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>재고년도</th>
              <td>
                <DatePicker
                  name="ymdyyyy"
                  value={filters.ymdyyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  calendar={YearCalendar}
                />
              </td>

              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>

              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CommonComboBox
                    name="cboItemacnt"
                    value={filters.cboItemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>대분류</th>
              <td>
                {customOptionData !== null && (
                  <CommonComboBox
                    name="cboItemlvl1"
                    value={filters.cboItemlvl1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>중분류</th>
              <td>
                {customOptionData !== null && (
                  <CommonComboBox
                    name="cboItemlvl2"
                    value={filters.cboItemlvl2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>소분류</th>
              <td>
                {customOptionData !== null && (
                  <CommonComboBox
                    name="cboItemlvl3"
                    value={filters.cboItemlvl3}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  // <CommonRadioGroup
                  //   name="radUseyn"
                  //   customOptionData={customOptionData}
                  //   changeData={filterRadioChange}
                  // />
                  <RadioGroup
                    name="useyn"
                    data={useynRadioButtonData}
                    layout={"horizontal"}
                    defaultValue={filters.radUseyn}
                    onChange={filterRadioChange}
                  />
                )}
              </td>

              <th>재고수량</th>
              <td colSpan={3}>
                <div className="radio_form_box">
                  <div className="radio_inner">
                    {customOptionData !== null && (
                      <CommonRadioGroup
                        name="radzeroyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                    {/* <RadioGroup
                      name="zeroyn"
                      data={zeroynRadioButtonData}
                      layout={"horizontal"}
                      defaultValue={filters.zeroyn}
                      onChange={filterRadioChange}
                    /> */}
                  </div>
                </div>
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CommonComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>

              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>

              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>

              <th>적재장소</th>
              <td>
                <Input
                  name="load_place"
                  type="text"
                  value={filters.load_place}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

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
            style={{ height: "360px" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                itemlvl1: itemlvl1ListData.find(
                  (item: any) => item.sub_code === row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (item: any) => item.sub_code === row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (item: any) => item.sub_code === row.itemlvl3
                )?.code_name,
                itemgrade: itemgradeListData.find(
                  (item: any) => item.sub_code === row.itemgrade
                )?.code_name,
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
              customOptionData.menuCustomColumnOptions["gvwList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.id.replace("col_", "")}
                      title={item.caption}
                      width={item.width}
                      cell={numberField.includes(item.id) ? NumberCell : ""}
                      footerCell={
                        item.sortOrder === 1 ? mainTotalFooterCell : ""
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainerWrap>
        <GridContainer width={"500px"}>
          <GridTitleContainer>
            <GridTitle>계정별LOT</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "360px" }}
            data={process(
              detail1DataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: detailSelectedState[detailIdGetter(row)],
              })),
              detail1DataState
            )}
            {...detail1DataState}
            onDataStateChange={onDetail1DataStateChange}
            //선택기능
            dataItemKey={DETAIL_DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onDetailSelectionChange}
            //정렬기능
            sortable={true}
            onSortChange={onDetail1SortChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detail1DataResult.total}
            onScroll={onDetail1ScrollHandler}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["gvwStockdetail"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.id.replace("col_", "")}
                      title={item.caption}
                      width={item.width + "px"}
                      cell={numberField.includes(item.id) ? NumberCell : ""}
                      footerCell={
                        item.sortOrder === 1 ? detail1TotalFooterCell : ""
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </GridContainer>
        <GridContainer
          width={clientWidth - gnvWidth - gridMargin - 15 - 500 + "px"}
        >
          <GridTitleContainer>
            <GridTitle>LOT별 상세이력</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "360px" }}
            data={process(detail2DataResult.data, detail2DataState)}
            {...detail2DataState}
            onDataStateChange={onDetail2DataStateChange}
            //정렬기능
            sortable={true}
            onSortChange={onDetail2SortChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={detail2DataResult.total}
            onScroll={onDetail2ScrollHandler}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["gvwLotdetail"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      field={item.id.replace("col_", "")}
                      title={item.caption}
                      width={item.width ?? 120 + "px"}
                      cell={
                        numberField.includes(item.id)
                          ? NumberCell
                          : dateField.includes(item.id)
                          ? DateCell
                          : ""
                      }
                      footerCell={
                        item.sortOrder === 1 ? detail2TotalFooterCell : ""
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      {itemWindowVisible && (
        <ItemsWindow
          getVisible={setItemWindowVisible}
          workType={"FILTER"}
          getData={getItemData}
          para={undefined}
        />
      )}
    </>
  );
};

export default MA_B7000;
