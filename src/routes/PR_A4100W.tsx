import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridExpandChangeEvent,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  handleKeyPressSearch,
  UseGetValueFromSessionItem,
  toDate,
  useSysMessage,
  UseParaPc,
  findMessage,
  UseMessages,
} from "../components/CommonFunction";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/PR_A4100W_C";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/GroupRenderers";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

const customField = ["outprocyn", "prodmac"];
const dateField = ["plandt", "finexpdt"];
const numberField = ["procseq", "prodqty", "qty", "badqty"];
const DATA_ITEM_KEY = "num";

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA011, L_fxcode", setBizComponentData);
  //수당종류, 세액구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "outprocyn" ? "L_BA011" : field === "prodmac" ? "L_fxcode" : "";

  const fieldName = field === "prodmac" ? "fxfull" : undefined;
  const filedValue = field === "prodmac" ? "fxcode" : undefined;
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

type TdataArr = {
  planno_s: string[];
  planseq_s: string[];
  qty_s: string[];
  finyn_s: string[];
};
type TdataArr2 = {
  planno_s: string[];
  planseq_s: string[];
  plandt_s: string[];
  finexpdt_s: string[];
  proccd_s: string[];
  procseq_s: string[];
  outprocyn_s: string[];
  prodmac_s: string[];
  qty_s: string[];
  remark_s: string[];
  finyn_s: string[];
};
const PR_A4100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = UseGetValueFromSessionItem("user_id");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dtgb: defaultOption.find((item: any) => item.id === "dtgb").valueCode,
        prodemp: defaultOption.find((item: any) => item.id === "prodemp")
          .valueCode,
        prodmac: defaultOption.find((item: any) => item.id === "prodmac")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
        outprocyn: defaultOption.find((item: any) => item.id === "outprocyn")
          .valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010, L_BA171,L_BA061,L_BA015,L_BA005,L_BA172,L_BA173, L_BA003,L_sysUserMaster_001, L_BA020, L_BA016",
    //대분류, 품목계정, 수량단위, 내수구분, 중분류, 소분류, 입고구분, 담당자, 화폐단위, 도/사
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [doexdivListData, setDoexdivListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [inkindListData, setInkindListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [amtunitListData, setAmtunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [PacListData, setPacListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA171")
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA173")
      );
      const inkindQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA003")
      );
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const amtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      const pacQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA016")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(inkindQueryStr, setInkindListData);
      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(amtunitQueryStr, setAmtunitListData);
      fetchQuery(pacQueryStr, setPacListData);
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
    group: [
      {
        field: "group_category_name",
      },
    ],
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [workType, setWorkType] = useState<"N" | "U">("N");

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
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    prodemp: "",
    prodmac: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    proccd: "",
    plankey: "",
    ordnum: "",
    pono: "",
    planno: "",
    outprocyn: "",
    finyn: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A4100W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_dtgb": filters.dtgb,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_insiz": filters.insiz,
      "@p_proccd": filters.proccd,
      "@p_prodemp": filters.prodemp,
      "@p_prodmac": filters.prodmac,
      "@p_planno": filters.planno,
      "@p_outprocyn": filters.outprocyn,
      "@p_finyn": filters.finyn,
      "@p_ordnum": filters.ordnum,
      "@p_pono": filters.pono,
      "@p_lotnum": "",
      "@p_plankey": filters.plankey,
      "@p_gonum": "",
      "@p_projectno": "",
      "@p_custcd": "",
      "@p_custnm": "",
      "@p_ordsts": "",
      "@p_service_id": companyCode,
    },
  };
  const [mainDataTotal, setMainDataTotal] = useState<number>(0);
  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
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
          groupId: row.planno + "planno",
          group_category_name: "생산계획번호" + " : " + row.planno,
          chk : false
        };
      });
      if (totalRowCnt > 0) {
        setMainDataTotal(totalRowCnt);
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
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

  let gridRef : any = useRef(null); 

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataTotal}건
      </td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

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
  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  const setCustData2 = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      outcustcd: data.custcd,
      outcustnm: data.custnm,
    }));
  };
  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4100W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4100W_001");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const onExpandChange = (event: GridExpandChangeEvent) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    setMainDataResult({ ...mainDataResult });
  };

  const CustomCheckBoxCell = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;
    if (props.rowType === "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = mainDataResult.data.map((item) =>
        item.num == dataItem.num
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <td
        style={{ textAlign: "center" }}
        // aria-colindex={ariaColumnIndex}
        // data-grid-col-index={columnIndex}
      >
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const getGridItemChangedData = (
    event: GridItemChangeEvent,
    dataResult: any,
    setDataResult: any,
    DATA_ITEM_KEY: string
  ) => {
    let field = event.field || "";
    event.dataItem[field] = event.value;
    let newData = dataResult.data.map((item: any) => {
      if (item[DATA_ITEM_KEY] === event.dataItem[DATA_ITEM_KEY]) {
        item[field] = event.value;
      }

      return item;
    });

    if (event.value)
      newData = newData.map((item: any) => {
        const result =
          item.inEdit &&
          typeof event.value === "object" &&
          !Array.isArray(event.value) &&
          event.value !== null
            ? {
                ...item,
                [field]: item[field].sub_code ?? "",
              }
            : item;

        return result;
      });

    //return newData;

    setDataResult((prev: any) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;
    if (
      field == "chk" ||
      field == "finexpdt" ||
      field == "outprocyn" ||
      field == "prodmac" ||
      field == "qty" ||
      field == "remark"
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
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
  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = async (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const dataItem = mainDataResult.data.filter((item: any, index: number) => {
      return item.chk === true && item.rowstatus !== undefined;
    });
    if (dataItem.length === 0) return false;
    let dataArr: TdataArr = {
      planno_s: [],
      planseq_s: [],
      qty_s: [],
      finyn_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const { planno = "", planseq = "", qty = "", finyn2 = "" } = item;

      dataArr.planno_s.push(planno);
      dataArr.planseq_s.push(planseq);
      dataArr.qty_s.push(qty);
      dataArr.finyn_s.push(finyn2 == "완료" ? "Y" : "N");
    });
    const paraD: Iparameters = {
      procedureName: "P_PR_A4100W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "D",
        "@p_orgdiv": "01",
        "@p_planno_s": dataArr.planno_s.join("|"),
        "@p_planseq_s": dataArr.planseq_s.join("|"),
        "@p_plandt_s": "",
        "@p_finexpdt_s": "",
        "@p_proccd_s": "",
        "@p_procseq_s": "",
        "@p_outprocyn_s": "",
        "@p_prodmac_s": "",
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_remark_s": "",
        "@p_finyn_s": dataArr.finyn_s.join("|"),
        "@p_rowstatus_s": "",
        "@p_chlditemcd_s": "",
        "@p_unitqty_s": "",
        "@p_qtyunit_s": "",
        "@p_outgb_s": "",
        "@p_seq_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4100W",
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", paraD);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    resetAllGrid();
  };

  const onCheckClick = async (e: any) => {
    if (!window.confirm("선택한 자료를 완료/완료해제 처리합니다.")) {
      return false;
    }

    const dataItem = mainDataResult.data.filter((item: any, index: number) => {
      return item.chk === true && item.rowstatus !== undefined;
    });
    if (dataItem.length === 0) return false;
    let dataArr: TdataArr = {
      planno_s: [],
      planseq_s: [],
      qty_s: [],
      finyn_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const { planno = "", planseq = "", qty = "", finyn2 = "" } = item;

      dataArr.planno_s.push(planno);
      dataArr.planseq_s.push(planseq);
      dataArr.qty_s.push(qty);
      dataArr.finyn_s.push(finyn2 == "완료" ? "Y" : "N");
    });
    const paraC: Iparameters = {
      procedureName: "P_PR_A4100W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "FINYN",
        "@p_orgdiv": "01",
        "@p_planno_s": dataArr.planno_s.join("|"),
        "@p_planseq_s": dataArr.planseq_s.join("|"),
        "@p_plandt_s": "",
        "@p_finexpdt_s": "",
        "@p_proccd_s": "",
        "@p_procseq_s": "",
        "@p_outprocyn_s": "",
        "@p_prodmac_s": "",
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_remark_s": "",
        "@p_finyn_s": dataArr.finyn_s.join("|"),
        "@p_rowstatus_s": "",
        "@p_chlditemcd_s": "",
        "@p_unitqty_s": "",
        "@p_qtyunit_s": "",
        "@p_outgb_s": "",
        "@p_seq_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4100W",
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", paraC);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    resetAllGrid();
  };

  const onSaveClick = async (e: any) => {
    const dataItem = mainDataResult.data.filter((item: any, index: number) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0) return false;
    let dataArr: TdataArr2 = {
      planno_s: [],
      planseq_s: [],
      plandt_s: [],
      finexpdt_s: [],
      proccd_s: [],
      procseq_s: [],
      outprocyn_s: [],
      prodmac_s: [],
      qty_s: [],
      remark_s: [],
      finyn_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        planno = "",
        planseq = "",
        plandt = "",
        finexpdt = "",
        proccd = "",
        procseq = "",
        outprocyn = "",
        prodmac = "",
        qty = "",
        remark = "",
        finyn2 = "",
      } = item;

      dataArr.planno_s.push(planno);
      dataArr.planseq_s.push(planseq);
      dataArr.plandt_s.push(plandt);
      dataArr.finexpdt_s.push(finexpdt);
      dataArr.proccd_s.push(proccd);
      dataArr.procseq_s.push(procseq);
      dataArr.outprocyn_s.push(outprocyn);
      dataArr.prodmac_s.push(prodmac);
      dataArr.qty_s.push(qty);
      dataArr.remark_s.push(remark);
      dataArr.finyn_s.push(finyn2 == "완료" ? "Y" : "N");
    });
    const para: Iparameters = {
      procedureName: "P_PR_A4100W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "U",
        "@p_orgdiv": "01",
        "@p_planno_s": dataArr.planno_s.join("|"),
        "@p_planseq_s": dataArr.planseq_s.join("|"),
        "@p_plandt_s": dataArr.plandt_s.join("|"),
        "@p_finexpdt_s": dataArr.finexpdt_s.join("|"),
        "@p_proccd_s": dataArr.proccd_s.join("|"),
        "@p_procseq_s": dataArr.procseq_s.join("|"),
        "@p_outprocyn_s": dataArr.outprocyn_s.join("|"),
        "@p_prodmac_s": dataArr.prodmac_s.join("|"),
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_remark_s": dataArr.remark_s.join("|"),
        "@p_finyn_s": dataArr.finyn_s.join("|"),
        "@p_rowstatus_s": "",
        "@p_chlditemcd_s": "",
        "@p_unitqty_s": "",
        "@p_qtyunit_s": "",
        "@p_outgb_s": "",
        "@p_seq_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4100W",
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    resetAllGrid();
  };

  return (
    <>
      <TitleContainer>
        <Title>생산계획현황</Title>

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
              <th colSpan={3}>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dtgb"
                    value={filters.dtgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                    textField="name"
                    valueField="code"
                  />
                )}
              </th>
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
              <th>작업자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodemp"
                    value={filters.prodemp}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
              <th>설비</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodmac"
                    value={filters.prodmac}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="fxfull"
                    valueField="fxcode"
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
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
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>작업지시번호</th>
              <td>
                <Input
                  name="plankey"
                  type="text"
                  value={filters.plankey}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>수주번호</th>
              <td>
                <Input
                  name="ordnum"
                  type="text"
                  value={filters.ordnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>PO번호</th>
              <td>
                <Input
                  name="pono"
                  type="text"
                  value={filters.pono}
                  onChange={filterInputChange}
                />
              </td>
              <th>생산계획번호</th>
              <td>
                <Input
                  name="planno"
                  type="text"
                  value={filters.planno}
                  onChange={filterInputChange}
                />
              </td>
              <th>외주구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="outprocyn"
                    value={filters.outprocyn}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>완료여부</th>
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
            <GridTitle>요약정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onCheckClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="check"
                title="일괄처리"
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
          <Grid
            style={{ height: "74vh" }}
            data={process(
              mainDataResult.data.map((row, idx) => ({
                ...row,
                finexpdt: toDate(row.finexpdt),
                proccd: proccdListData.find(
                  (items: any) => items.sub_code === row.proccd
                )?.code_name,
                itemlvl1: itemlvl1ListData.find(
                  (items: any) => items.sub_code === row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (items: any) => items.sub_code === row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (items: any) => items.sub_code === row.itemlvl3
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
            total={mainDataTotal}
            onScroll={onMainScrollHandler}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //그룹기능
            groupable={true}
            onExpandChange={onExpandChange}
            expandField="expanded"
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn
              field="rowstatus"
              title=" "
              width="40px"
              editable={false}
            />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CustomCheckBoxCell}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                .map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          dateField.includes(item.fieldName)
                            ? DateCell
                            : numberField.includes(item.fieldName)
                            ? NumberCell
                            : customField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell
                            : numberField.includes(item.fieldName)
                            ? gridSumQtyFooterCell2
                            : undefined
                        }
                      ></GridColumn>
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={workType}
          setData={setCustData2}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default PR_A4100W;
