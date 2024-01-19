import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A1060W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
let targetRowIndex: null | number = null;
const dateField = ["outdt", "shipdt"];
const numberField = [
  "wonchgrat",
  "wonamt",
  "amt",
  "qty",
  "taxamt",
  "slipamt_1",
  "slipamt_2",
  "mngamt",
  "rate",
  "salerat",
  "saleamt",
  "amt_1",
  "amt_2",
];
const checkBoxField = ["slipyn"];
const radioField = ["drcrdiv"];

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_DRCR", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "drcrdiv" ? "R_DRCR" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell
      bizComponentData={bizComponent}
      {...props}
      disabled={true}
    />
  ) : (
    <td />
  );
};
const AC_A1060W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };
  const [pc, setPc] = useState("");
  const userId = UseGetValueFromSessionItem("user_id");
  UseParaPc(setPc);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_A1060W", setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A1060W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
        collectnumyn: defaultOption.find(
          (item: any) => item.id === "collectnumyn"
        ).valueCode,
        dtgubun: defaultOption.find((item: any) => item.id === "dtgubun")
          .valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002, L_BA020, L_BA061, L_sysUserMaster_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const locationQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA002")
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const amtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(amtunitQueryStr, setAmtunitListData);
      fetchQuery(locationQueryStr, setLocationListData);
      fetchQuery(personQueryStr, setPersonListData);
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    dtgubun: "",
    location: "",
    position: "",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    collectnumyn: "",
    finyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    act_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    ref_key: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  let gridRef: any = useRef(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage2({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage3({
      ...event.page,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage4({
      ...event.page,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1060W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_dtgubun": filters.dtgubun,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_ref_key": "",
        "@p_collectnumyn": filters.collectnumyn,
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        slipyn: item.slipyn == "Y" ? true : item.slipyn == "N" ? false : false,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.ref_key == filters.find_row_value
          );
          targetRowIndex = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef.current) {
          targetRowIndex = 0;
        }
      }

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value === ""
            ? rows[0]
            : rows.find((row: any) => row.ref_key == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setFilters2((prev) => ({
            ...prev,
            ref_key: selectedRow.ref_key,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters3((prev) => ({
            ...prev,
            act_key: selectedRow.act_key,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters4((prev) => ({
            ...prev,
            ref_key: selectedRow.ref_key,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setFilters2((prev) => ({
            ...prev,
            ref_key: rows[0].ref_key,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters3((prev) => ({
            ...prev,
            act_key: rows[0].act_key,
            isSearch: true,
            pgNum: 1,
          }));
          setFilters4((prev) => ({
            ...prev,
            ref_key: rows[0].ref_key,
            isSearch: true,
            pgNum: 1,
          }));
        }
      }
    }
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
  const fetchMainGrid2 = async (filters2: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1060W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "TAB1",
        "@p_orgdiv": filters.orgdiv,
        "@p_dtgubun": filters.dtgubun,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_ref_key": filters2.ref_key,
        "@p_collectnumyn": filters.collectnumyn,
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

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    }
    setFilters2((prev) => ({
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
  const fetchMainGrid3 = async (filters3: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1060W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "TAB2",
        "@p_orgdiv": filters.orgdiv,
        "@p_dtgubun": filters.dtgubun,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_ref_key": filters3.act_key,
        "@p_collectnumyn": filters.collectnumyn,
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

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    }
    setFilters3((prev) => ({
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
  const fetchMainGrid4 = async (filters4: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1060W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": "TAB3",
        "@p_orgdiv": filters.orgdiv,
        "@p_dtgubun": filters.dtgubun,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_location": filters.location,
        "@p_position": filters.position,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_finyn": filters.finyn,
        "@p_ref_key": filters4.ref_key,
        "@p_collectnumyn": filters.collectnumyn,
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

      setMainDataResult4({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
      }
    }
    setFilters4((prev) => ({
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
    if (filters.isSearch && customOptionData !== null) {
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4]);

  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});

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

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  interface ICustData {
    address: string;
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

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A1060W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A1060W_001");
      } else if (
        filters.location == "" ||
        filters.location == null ||
        filters.location == undefined
      ) {
        throw findMessage(messagesData, "AC_A1060W_002");
      } else {
        setPage(initialPageState); // 페이지 초기화
        resetAllGrid(); // 데이터 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
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

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      ref_key: selectedRowData.ref_key,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters3((prev) => ({
      ...prev,
      act_key: selectedRowData.act_key,
      isSearch: true,
      pgNum: 1,
    }));
    setFilters4((prev) => ({
      ...prev,
      ref_key: selectedRowData.ref_key,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };

  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState4(newSelectedState);
  };

  const [tabSelected, setTabSelected] = useState(0);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };

  const onMainItemChange4 = (event: GridItemChangeEvent) => {
    setMainDataState4((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
      DATA_ITEM_KEY4
    );
  };

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );
  const customCellRender4 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );
  const customRowRender4 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };
  const enterEdit3 = (dataItem: any, field: string) => {};
  const enterEdit4 = (dataItem: any, field: string) => {};
  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                chk:
                  typeof item.chk == "boolean"
                    ? item.chk
                    : item.chk == "Y"
                    ? true
                    : false,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit3 = () => {};
  const exitEdit4 = () => {};

  const onDeleteClick = () => {
    if (mainDataResult.total > 0) {
      const datas = mainDataResult.data.filter((item) => item.chk == true);
      if (datas.length > 0) {
        let valid = true;

        datas.map((item) => {
          if (item.slipyn == false) {
            valid = false;
          }
        });

        if (valid != true) {
          alert("전표가 없는 건이 있습니다.");
        } else {
          let dataArr: any = {
            ref_key_s: [],
          };

          datas.forEach((item: any, idx: number) => {
            const { ref_key = "" } = item;
            dataArr.ref_key_s.push(ref_key);
          });

          setParaData((prev) => ({
            ...prev,
            workType: "DELETE",
            orgdiv: "01",
            location: filters.location,
            ref_key_s: dataArr.ref_key_s.join("|"),
          }));
        }
      } else {
        alert("선택된 행이 없습니다.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onAddClick = () => {
    if (mainDataResult.total > 0) {
      const datas = mainDataResult.data.filter((item) => item.chk == true);
      if (datas.length > 0) {
        let valid = true;

        datas.map((item) => {
          if (item.slipyn == true) {
            valid = false;
          }
        });

        if (valid != true) {
          alert("전표처리가 된 건이 있습니다");
        } else {
          let dataArr: any = {
            ref_key_s: [],
          };

          datas.forEach((item: any, idx: number) => {
            const { ref_key = "" } = item;
            dataArr.ref_key_s.push(ref_key);
          });

          setParaData((prev) => ({
            ...prev,
            workType: "INSERT",
            orgdiv: "01",
            location: filters.location,
            ref_key_s: dataArr.ref_key_s.join("|"),
          }));
        }
      } else {
        alert("선택된 행이 없습니다.");
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    location: "",
    ref_key_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A1060W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_ref_key_s": ParaData.ref_key_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1060W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setPage(initialPageState);
      setPage2(initialPageState);
      setPage3(initialPageState);
      setPage4(initialPageState);
      if (ParaData.workType == "DELETE") {
        const findRowIndex = mainDataResult.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        );

        setFilters((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
            undefined
              ? ""
              : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                  .ref_key,
          isSearch: true,
          pgNum: 1,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
          pgNum: 1,
        }));
      }

      setParaData({
        workType: "",
        orgdiv: "01",
        location: "",
        ref_key_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <TitleContainer>
        <Title>매출전표(수출)</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_A1060W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th colSpan={2}>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="dtgubun"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </th>
              <td colSpan={2}>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>사업부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="position"
                    value={filters.position}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
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
              <th>수금여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="collectnumyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>전표처리</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="finyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
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
        >
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                매출전표생성
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                매출전표해제
              </Button>
              <Button
                //onClick={onAddClick}
                themeColor={"primary"}
                icon="file-add"
              >
                수금전표생성
              </Button>
              <Button
                //onClick={onDeleteClick}
                icon="delete"
                fillMode="outline"
                themeColor={"primary"}
              >
                수금전표해제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "40vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                location: locationListData.find(
                  (item: any) => (item.sub_code = row.location)
                )?.code_name,
                amtunit: amtunitListData.find(
                  (item: any) => (item.sub_code = row.amtunit)
                )?.code_name,
                person: personListData.find(
                  (item: any) => item.user_id == row.person
                )?.user_name,
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
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
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
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : checkBoxField.includes(item.fieldName)
                          ? CheckBoxReadOnlyCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell
                          : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="판매자료">
          <Grid
            style={{ height: "30vh" }}
            data={process(
              mainDataResult2.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (items: any) => items.sub_code === row.itemacnt
                )?.code_name,
                [SELECTED_FIELD]: selectedState2[idGetter2(row)],
              })),
              mainDataState2
            )}
            {...mainDataState2}
            onDataStateChange={onMainDataStateChange2}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange2}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult2.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
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
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell2
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell2
                          : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </TabStripTab>
        <TabStripTab title="매출전표">
          <Grid
            style={{ height: "30vh" }}
            data={process(
              mainDataResult3.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState3[idGetter3(row)],
              })),
              mainDataState3
            )}
            {...mainDataState3}
            onDataStateChange={onMainDataStateChange3}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY3}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange3}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult3.total}
            skip={page3.skip}
            take={page3.take}
            pageable={true}
            onPageChange={pageChange3}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange3}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange3}
            cellRender={customCellRender3}
            rowRender={customRowRender3}
            editField={EDIT_FIELD}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList3"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : dateField.includes(item.fieldName)
                          ? DateCell
                          : radioField.includes(item.fieldName)
                          ? CustomRadioCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell3
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell3
                          : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </TabStripTab>
        <TabStripTab title="수금전표">
          <Grid
            style={{ height: "30vh" }}
            data={process(
              mainDataResult4.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selectedState4[idGetter4(row)],
              })),
              mainDataState4
            )}
            {...mainDataState4}
            onDataStateChange={onMainDataStateChange4}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY4}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange4}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult4.total}
            skip={page4.skip}
            take={page4.take}
            pageable={true}
            onPageChange={pageChange4}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange4}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange4}
            cellRender={customCellRender4}
            rowRender={customRowRender4}
            editField={EDIT_FIELD}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList4"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={item.width}
                      cell={
                        numberField.includes(item.fieldName)
                          ? NumberCell
                          : radioField.includes(item.fieldName)
                          ? CustomRadioCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder == 0
                          ? mainTotalFooterCell4
                          : numberField.includes(item.fieldName)
                          ? gridSumQtyFooterCell4
                          : undefined
                      }
                    ></GridColumn>
                  )
              )}
          </Grid>
        </TabStripTab>
      </TabStrip>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
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

export default AC_A1060W;
