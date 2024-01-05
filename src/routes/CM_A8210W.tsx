import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { TabStrip } from "@progress/kendo-react-layout/dist/npm/tabstrip/TabStrip";
import { TabStripTab } from "@progress/kendo-react-layout/dist/npm/tabstrip/TabStripTab";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
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
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  toDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/CM_A8210W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;
const NumberField = [
  "amt",
  "rate",
  "worktime",
  "depre_price",
  "std_dir_depre_price",
  "fx_depre_price",
];
const CustomComboField = ["extra_field1", "prodemp", "prodmac"];

let targetRowIndex: null | number = null;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 화폐단위, 품목계정
  UseBizComponent("L_BA901,L_sysUserMaster_001,L_fxcode", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "extra_field1"
      ? "L_BA901"
      : field === "prodemp"
      ? "L_sysUserMaster_001"
      : field === "prodmac"
      ? "L_fxcode"
      : "";

  const fieldName =
    field === "prodemp"
      ? "user_name"
      : field == "prodmac"
      ? "fxfull"
      : undefined;
  const filedValue =
    field === "prodemp" ? "user_id" : field == "prodmac" ? "fxcode" : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={filedValue}
      {...props}
    />
  ) : (
    <td />
  );
};

const CM_A8210W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setSubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;
    setSubFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage4(initialPageState);
    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setSubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const userId = UseGetValueFromSessionItem("user_id");

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A8210W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A8210W", setCustomOptionData);

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
        fxcode: defaultOption.find((item: any) => item.id === "fxcode")
          .valueCode,
        useyn: defaultOption.find((item: any) => item.id === "useyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA171, L_BA172, L_BA173",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  useEffect(() => {
    if (bizComponentData !== null) {
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
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
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "USERLIST",
    orgdiv: "01",
    recdt: new Date(),
    frdt: new Date(),
    todt: new Date(),
    fxcode: "",
    useyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "USERDETAIL",
    orgdiv: "01",
    recdt: new Date(),
    frdt: "",
    todt: "",
    fxcode: "",
    useyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A8210W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_recdt": convertDateToStr(filters.recdt),
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_fxcode": filters.fxcode,
        "@p_useyn": filters.useyn,
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
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.valueboxcd == filters.find_row_value
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

      setSubDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.recdt == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
          setFilters((prev) => ({
            ...prev,
            recdt: toDate(selectedRow.recdt),
          }));
          if (tabSelected == 0) {
            setSubFilters((prev) => ({
              ...prev,
              workType: "USERDETAIL",
              recdt: toDate(selectedRow.recdt),
              isSearch: true,
              pgNum: 1,
            }));
          } else if (tabSelected == 1) {
            setSubFilters((prev) => ({
              ...prev,
              workType: "PRODDETAIL",
              recdt: toDate(selectedRow.recdt),
              isSearch: true,
              pgNum: 1,
            }));
          }
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
          setFilters((prev) => ({
            ...prev,
            recdt: toDate(rows[0].recdt),
          }));
          if (tabSelected == 0) {
            setSubFilters((prev) => ({
              ...prev,
              workType: "USERDETAIL",
              recdt: toDate(rows[0].recdt),
              isSearch: true,
              pgNum: 1,
            }));
          } else if (tabSelected == 1) {
            setSubFilters((prev) => ({
              ...prev,
              workType: "PRODDETAIL",
              recdt: toDate(rows[0].recdt),
              isSearch: true,
              pgNum: 1,
            }));
          }
        }
      }
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
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_CM_A8210W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_recdt": convertDateToStr(subfilters.recdt),
        "@p_frdt": "",
        "@p_todt": "",
        "@p_fxcode": "",
        "@p_useyn": "",
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

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
    setSubFilters((prev) => ({
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (subfilters.isSearch && permissions !== null) {
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

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [subDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setMainDataResult(process([], mainDataState));
    setSubDataResult(process([], subDataState));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setFilters((prev) => ({
      ...prev,
      recdt: toDate(selectedRowData.recdt),
    }));
    if (tabSelected == 0) {
      setSubFilters((prev) => ({
        ...prev,
        workType: "USERDETAIL",
        recdt: toDate(selectedRowData.recdt),
        isSearch: true,
        pgNum: 1,
      }));
    } else if (tabSelected == 1) {
      setSubFilters((prev) => ({
        ...prev,
        workType: "PRODDETAIL",
        recdt: toDate(selectedRowData.recdt),
        isSearch: true,
        pgNum: 1,
      }));
    }
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(item[props.field] == "" || item[props.field] == undefined ? 0 : item[props.field]))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A8210W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A8210W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState);
        setPage2(initialPageState);
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        deletedMainRows = [];
      }
    } catch (e) {
      alert(e);
    }
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (!(field == "prodmac" && dataItem.rowstatus != "N")) {
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

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      if (editedField == "fx_depre_price" || editedField == "worktime") {
        const newData = mainDataResult.data.map((item) =>
          item.fx_depre_price == 0 || item.worktime == 0
            ? {
                ...item,
                std_dir_depre_price: 0,
                [EDIT_FIELD]: undefined,
              }
            : item.rate == 0
            ? {
                ...item,
                std_dir_depre_price: item.fx_depre_price / item.worktime,
                depre_price: 0,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                std_dir_depre_price: item.fx_depre_price / item.worktime,
                depre_price: item.fx_depre_price / item.worktime / item.rate,
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
      } else if (editedField == "rate") {
        const newData = mainDataResult.data.map((item) =>
          item.std_dir_depre_price == 0 || item.rate == 0
            ? {
                ...item,
                depre_price: 0,
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                depre_price: item.std_dir_depre_price / item.rate,
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
      }

      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                useyn:
                  typeof item.useyn == "boolean"
                    ? item.useyn
                    : item.useyn == "Y"
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

  const customCellRender = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit}
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    try {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        amt: 0,
        depre_price: 0,
        extra_field1: "",
        fx_depre_price: 0,
        keycode: "",
        orgdiv: "01",
        part: "",
        prodemp: "",
        prodmac: "",
        rate: 0,
        recdt: filters.recdt,
        remark: "",
        std_dir_depre_price: 0,
        type: "",
        worktime: 0,
        rowstatus: "N",
      };
      setSelectedState({ [newDataItem.num]: true });
      setPage((prev) => ({
        ...prev,
        skip: 0,
        take: prev.take + 1,
      }));
      setMainDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    } catch (e) {
      alert(e);
    }
  };

  const [paraData, setParaData] = useState({
    workType: "N",
    orgdiv: "01",
    location: "01",
    recdt: "",
    rowstatus_s: "",
    type_s: "",
    keycode_s: "",
    prodemp_s: "",
    proccd_s: "",
    prodmac_s: "",
    amt_s: "",
    rate_s: "",
    fx_depre_price_s: "",
    std_dir_depre_price: "",
    depre_price_s: "",
    worktime_s: "",
    remark_s: "",
    extra_field1_s: "",
    user_id: userId,
    form_id: "CM_A8210W",
    pc: pc,
    companyCode: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_CM_A8210W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@P_recdt": paraData.recdt,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_type_s": paraData.type_s,
      "@p_keycode_s": paraData.keycode_s,
      "@p_prodemp_s": paraData.prodemp_s,
      "@p_proccd_s": paraData.proccd_s,
      "@p_prodmac_s": paraData.prodmac_s,
      "@p_amt_s": paraData.amt_s,
      "@p_rate_s": paraData.rate_s,
      "@p_fx_depre_price_s": paraData.fx_depre_price_s,
      "@p_std_dir_depre_price_s": paraData.std_dir_depre_price,
      "@p_depre_price_s": paraData.depre_price_s,
      "@p_worktime_s": paraData.worktime_s,
      "@p_remark_s": paraData.remark_s,
      "@p_extra_field1_s": paraData.extra_field1_s,
      "@p_userid": paraData.user_id,
      "@p_form_id": paraData.form_id,
      "@p_pc": pc,
      "@p_company_code": paraData.companyCode,
    },
  };

  type TdataArr = {
    rowstatus_s: string[];
    type_s: string[];
    keycode_s: string[];
    prodemp_s: string[];
    proccd_s: string[];
    prodmac_s: string[];
    amt_s: string[];
    rate_s: string[];
    fx_depre_price_s: string[];
    std_dir_depre_price: string[];
    depre_price_s: string[];
    worktime_s: string[];
    remark_s: string[];
    extra_field1_s: string[];
  };

  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return item.rowstatus === "N" && item.rowstatus !== undefined;
    });

    if (dataItem.length === 0) {
      const dataItem2 = mainDataResult.data.filter((item: any) => {
        return item.rowstatus === "U" && item.rowstatus !== undefined;
      });

      let dataArr: TdataArr = {
        rowstatus_s: [],
        type_s: [],
        keycode_s: [],
        prodemp_s: [],
        proccd_s: [],
        prodmac_s: [],
        amt_s: [],
        rate_s: [],
        fx_depre_price_s: [],
        std_dir_depre_price: [],
        depre_price_s: [],
        worktime_s: [],
        remark_s: [],
        extra_field1_s: [],
      };

      dataItem2.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          type = "",
          keycode = "",
          prodemp = "",
          proccd = "",
          prodmac = "",
          amt = "",
          rate = "",
          fx_depre_price = "",
          std_dir_depre_price = "",
          depre_price = "",
          worktime = "",
          remark = "",
          extra_field1 = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.type_s.push(type == "" ? (tabSelected == 0 ? "P" : "F") : type);
        dataArr.keycode_s.push(keycode);
        dataArr.prodemp_s.push(prodemp);
        dataArr.proccd_s.push("");
        dataArr.prodmac_s.push(prodmac);
        dataArr.amt_s.push(amt);
        dataArr.rate_s.push(rate);
        dataArr.fx_depre_price_s.push(fx_depre_price);
        dataArr.std_dir_depre_price.push(std_dir_depre_price);
        dataArr.depre_price_s.push(depre_price);
        dataArr.worktime_s.push(worktime);
        dataArr.remark_s.push(remark);
        dataArr.extra_field1_s.push(extra_field1);
      });

      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          type = "",
          keycode = "",
          prodemp = "",
          proccd = "",
          prodmac = "",
          amt = "",
          rate = "",
          fx_depre_price = "",
          std_dir_depre_price = "",
          depre_price = "",
          worktime = "",
          remark = "",
          extra_field1 = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.type_s.push(type == "" ? (tabSelected == 0 ? "P" : "F") : type);
        dataArr.keycode_s.push(keycode);
        dataArr.prodemp_s.push(prodemp);
        dataArr.proccd_s.push("");
        dataArr.prodmac_s.push(prodmac);
        dataArr.amt_s.push(amt);
        dataArr.rate_s.push(rate);
        dataArr.fx_depre_price_s.push(fx_depre_price);
        dataArr.std_dir_depre_price.push(std_dir_depre_price);
        dataArr.depre_price_s.push(depre_price);
        dataArr.worktime_s.push(worktime);
        dataArr.remark_s.push(remark);
        dataArr.extra_field1_s.push(extra_field1);
      });

      setParaData((prev) => ({
        ...prev,
        recdt: convertDateToStr(filters.recdt),
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        type_s: dataArr.type_s.join("|"),
        keycode_s: dataArr.keycode_s.join("|"),
        prodemp_s: dataArr.prodemp_s.join("|"),
        proccd_s: dataArr.proccd_s.join("|"),
        prodmac_s: dataArr.prodmac_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        rate_s: dataArr.rate_s.join("|"),
        fx_depre_price_s: dataArr.fx_depre_price_s.join("|"),
        std_dir_depre_price: dataArr.std_dir_depre_price.join("|"),
        depre_price_s: dataArr.depre_price_s.join("|"),
        worktime_s: dataArr.worktime_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        extra_field1_s: dataArr.extra_field1_s.join("|"),
      }));
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        type_s: [],
        keycode_s: [],
        prodemp_s: [],
        proccd_s: [],
        prodmac_s: [],
        amt_s: [],
        rate_s: [],
        fx_depre_price_s: [],
        std_dir_depre_price: [],
        depre_price_s: [],
        worktime_s: [],
        remark_s: [],
        extra_field1_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          type = "",
          keycode = "",
          prodemp = "",
          proccd = "",
          prodmac = "",
          amt = "",
          rate = "",
          fx_depre_price = "",
          std_dir_depre_price = "",
          depre_price = "",
          worktime = "",
          remark = "",
          extra_field1 = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.type_s.push(type == "" ? (tabSelected == 0 ? "P" : "F") : type);
        dataArr.keycode_s.push(keycode);
        dataArr.prodemp_s.push(prodemp);
        dataArr.proccd_s.push("");
        dataArr.prodmac_s.push(prodmac);
        dataArr.amt_s.push(amt);
        dataArr.rate_s.push(rate);
        dataArr.fx_depre_price_s.push(fx_depre_price);
        dataArr.std_dir_depre_price.push(std_dir_depre_price);
        dataArr.depre_price_s.push(depre_price);
        dataArr.worktime_s.push(worktime);
        dataArr.remark_s.push(remark);
        dataArr.extra_field1_s.push(extra_field1);
      });

      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          type = "",
          keycode = "",
          prodemp = "",
          proccd = "",
          prodmac = "",
          amt = "",
          rate = "",
          fx_depre_price = "",
          std_dir_depre_price = "",
          depre_price = "",
          worktime = "",
          remark = "",
          extra_field1 = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.type_s.push(type == "" ? (tabSelected == 0 ? "P" : "F") : type);
        dataArr.keycode_s.push(keycode);
        dataArr.prodemp_s.push(prodemp);
        dataArr.proccd_s.push("");
        dataArr.prodmac_s.push(prodmac);
        dataArr.amt_s.push(amt);
        dataArr.rate_s.push(rate);
        dataArr.fx_depre_price_s.push(fx_depre_price);
        dataArr.std_dir_depre_price.push(std_dir_depre_price);
        dataArr.depre_price_s.push(depre_price);
        dataArr.worktime_s.push(worktime);
        dataArr.remark_s.push(remark);
        dataArr.extra_field1_s.push(extra_field1);
      });

      setParaData((prev) => ({
        ...prev,
        recdt: convertDateToStr(filters.recdt),
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        type_s: dataArr.type_s.join("|"),
        keycode_s: dataArr.keycode_s.join("|"),
        prodemp_s: dataArr.prodemp_s.join("|"),
        proccd_s: dataArr.proccd_s.join("|"),
        prodmac_s: dataArr.prodmac_s.join("|"),
        amt_s: dataArr.amt_s.join("|"),
        rate_s: dataArr.rate_s.join("|"),
        fx_depre_price_s: dataArr.fx_depre_price_s.join("|"),
        std_dir_depre_price: dataArr.std_dir_depre_price.join("|"),
        depre_price_s: dataArr.depre_price_s.join("|"),
        worktime_s: dataArr.worktime_s.join("|"),
        remark_s: dataArr.remark_s.join("|"),
        extra_field1_s: dataArr.extra_field1_s.join("|"),
      }));
    }
  };

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
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        workType: "N",
        orgdiv: "01",
        location: "01",
        recdt: "",
        rowstatus_s: "",
        type_s: "",
        keycode_s: "",
        prodemp_s: "",
        proccd_s: "",
        prodmac_s: "",
        amt_s: "",
        rate_s: "",
        fx_depre_price_s: "",
        std_dir_depre_price: "",
        depre_price_s: "",
        worktime_s: "",
        remark_s: "",
        extra_field1_s: "",
        user_id: userId,
        form_id: "CM_A8210W",
        pc: pc,
        companyCode: companyCode,
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    temp = 0;
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        workType: "USERLIST",
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        workType: "PRODLIST",
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    }
    deletedMainRows = [];
  };

  return (
    <>
      <TitleContainer>
        <Title>임률관리</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A8210W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="작업자">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>일자</th>
                  <td>
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
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap>
            <GridContainer width={`15%`}>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "72.5vh" }}
                data={process(
                  subDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                  })),
                  subDataState
                )}
                {...subDataState}
                onDataStateChange={onSubDataStateChange}
                //선택 기능
                dataItemKey={SUB_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSubDataSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={subDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onSubDataSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="recdt"
                  title="입력일자"
                  cell={DateCell}
                  width="120px"
                  footerCell={subTotalFooterCell}
                />
                <GridColumn
                  field="cnt"
                  title="건수"
                  cell={NumberCell}
                  width="100"
                />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>입력일자</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="recdt"
                            value={filters.recdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <Grid
                  style={{ height: "62vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
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
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  //incell 수정 기능
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="rowstatus"
                    title=" "
                    width="50px"
                    editable={false}
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
                              CustomComboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : NumberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : NumberField.includes(item.fieldName)
                                ? editNumberFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="설비">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>일자</th>
                  <td>
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
                  <th>설비</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="fxcode"
                        value={filters.fxcode}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="fxfull"
                        valueField="fxcode"
                      />
                    )}
                  </td>
                  <th>사용여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="useyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap>
            <GridContainer width={`15%`}>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "72.5vh" }}
                data={process(
                  subDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                  })),
                  subDataState
                )}
                {...subDataState}
                onDataStateChange={onSubDataStateChange}
                //선택 기능
                dataItemKey={SUB_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSubDataSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={subDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //정렬기능
                sortable={true}
                onSortChange={onSubDataSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="recdt"
                  title="입력일자"
                  cell={DateCell}
                  width="120px"
                  footerCell={subTotalFooterCell}
                />
                <GridColumn
                  field="cnt"
                  title="건수"
                  cell={NumberCell}
                  width="100"
                />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(85% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>상세정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="plus"
                    title="행 추가"
                  ></Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>입력일자</th>
                      <td>
                        <div className="filter-item-wrap">
                          <DatePicker
                            name="recdt"
                            value={filters.recdt}
                            format="yyyy-MM-dd"
                            onChange={filterInputChange}
                            className="required"
                            placeholder=""
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <Grid
                  style={{ height: "62vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
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
                  skip={page2.skip}
                  take={page2.take}
                  pageable={true}
                  onPageChange={pageChange2}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  //incell 수정 기능
                  onItemChange={onMainItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="rowstatus"
                    title=" "
                    width="50px"
                    editable={false}
                  />
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
                              NumberField.includes(item.fieldName)
                                ? NumberCell
                                : CustomComboField.includes(item.fieldName)
                                ? CustomComboBoxCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : NumberField.includes(item.fieldName)
                                ? editNumberFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
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

export default CM_A8210W;
