import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import ExcelUploadButton from "../components/Buttons/ExcelUploadButton";
import TopButtons from "../components/Buttons/TopButtons";
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
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_B5040W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const numberField = ["splyamt", "taxamt", "amt"];
const dateField = ["recdt"];

type TDetailData = {
  rowstatus_s: string[];
  recnum_s: string[];
  recdt_s: string[];
  baldt_s: string[];
  trsdt_s: string[];
  bizregnum_s: string[];
  bizregnum2_s: string[];
  bizname_s: string[];
  bizceoname_s: string[];
  custregnum_s: string[];
  custregnum2_s: string[];
  custname_s: string[];
  custceoname_s: string[];
  amt_s: string[];
  splyamt_s: string[];
  taxamt_s: string[];
  taxdiv_s: string[];
  taxkind_s: string[];
  balkind_s: string[];
  remark_s: string[];
  remark2_s: string[];
  taxgubun_s: string[];
  bizemail_s: string[];
  custemail_s: string[];
  custemail2_s: string[];
  itemdt_s: string[];
  itemnm_s: string[];
  spec_s: string[];
  itemqty_s: string[];
  itemunp_s: string[];
  itemsplyamt_s: string[];
  itemtaxamt_s: string[];
  remark3_s: string[];
};

const AC_B5040W: React.FC = () => {
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("AC_B5040W", setMessagesData);
  const [tabSelected, setTabSelected] = React.useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_B5040W", setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_AC405, R_Override, R_gubunD, L_AC402, L_AC003, L_AC403, L_AC404",
    setBizComponentData
  );

  const [taxdivListData, setTaxdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [inoutdivListData, setInoutdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxkindListData, setTaxkindListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [balkindListData, setBalkindListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [taxgubunListData, setTaxgubunListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const taxgubunQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC405")
      );
      const taxdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC402")
      );
      const inoutdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC003")
      );
      const taxkindQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC403")
      );
      const balkindQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC404")
      );
      fetchQuery(taxdivQueryStr, setTaxdivListData);
      fetchQuery(inoutdivQueryStr, setInoutdivListData);
      fetchQuery(taxkindQueryStr, setTaxkindListData);
      fetchQuery(balkindQueryStr, setBalkindListData);
      fetchQuery(taxgubunQueryStr, setTaxgubunListData);
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
        inoutdiv: defaultOption.find((item: any) => item.id === "inoutdiv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "chk" || name == "chktax") {
      setFilters((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const RadioChange = (e: any) => {
    const { value, name } = e;

    setInformation((prev) => ({
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

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LIST1",
    orgdiv: "01",
    daygb: "",
    frdt: new Date(),
    todt: new Date(),
    inoutdiv: "",
    taxdiv: "",
    taxkind: "",
    balkind: "",
    custcd: "",
    custnm: "",
    bizregnum: "",
    chk: "",
    chktax: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //조회조건 초기값
  const [information, setInformation] = useState({
    listyn: "A",
    inoutdiv: "1",
  });

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B5040W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B5040W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        if (tabSelected == 0) {
          setFilters((prev) => ({
            ...prev,
            worktype: "LIST1",
            inoutdiv: "",
            pgNum: 1,
            isSearch: true,
          }));
        } else if (tabSelected == 1) {
          setFilters((prev) => ({
            ...prev,
            worktype: "LIST3",
            inoutdiv: "2",
            pgNum: 1,
            isSearch: true,
          }));
        } else if (tabSelected == 2) {
          setFilters((prev) => ({
            ...prev,
            worktype: "LIST2",
            inoutdiv: "1",
            pgNum: 1,
            isSearch: true,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
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
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_B5040W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_daygb": "A",
        "@p_fdate": convertDateToStr(filters.frdt),
        "@p_tdate": convertDateToStr(filters.todt),
        "@p_inoutdiv": filters.inoutdiv,
        "@p_taxdiv": filters.taxdiv,
        "@p_taxkind": filters.taxkind,
        "@p_balkind": filters.balkind,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_bizregnum": filters.bizregnum,
        "@p_chk": filters.chk,
        "@p_chktax": filters.chktax,
        "@p_find_row_value": "",
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
      }));

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
  const handleSelectTab = (e: any) => {
    resetAllGrid();
    setTabSelected(e.selected);
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        worktype: "LIST1",
        orgdiv: "01",
        daygb: "",
        inoutdiv: "",
        taxdiv: "",
        taxkind: "",
        balkind: "",
        custcd: "",
        custnm: "",
        bizregnum: "",
        chk: "",
        chktax: "",
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        worktype: "LIST3",
        orgdiv: "01",
        daygb: "",
        inoutdiv: "2",
        taxdiv: "",
        taxkind: "",
        balkind: "",
        custcd: "",
        custnm: "",
        bizregnum: "",
        chk: "",
        chktax: "",
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        worktype: "LIST2",
        orgdiv: "01",
        daygb: "",
        inoutdiv: "1",
        taxdiv: "",
        taxkind: "",
        balkind: "",
        custcd: "",
        custnm: "",
        bizregnum: "",
        chk: "",
        chktax: "",
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"cnt1"}
        title={"매수"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"taxdt1"}
        title={"일자"}
        cell={DateCell}
        width="120px"
      />
    );
    array.push(
      <GridColumn
        field={"splyamt1"}
        title={"공급가액"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"taxamt1"}
        title={"세액"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"amt1"}
        title={"합계"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"cnt2"}
        title={"매수"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"taxdt2"}
        title={"일자"}
        cell={DateCell}
        width="120px"
      />
    );
    array.push(
      <GridColumn
        field={"splyamt2"}
        title={"공급가액"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"taxamt2"}
        title={"세액"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    array.push(
      <GridColumn
        field={"amt2"}
        title={"합계"}
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
        width="100px"
      />
    );
    return array;
  };

  const saveExcel = (jsonArr: any[]) => {
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
      return;
    }
    console.log(jsonArr); //
    const columns: string[] = [
      "공급가액",
      "공급받는자사업자번호",
      "공급받는자이메일주소1",
      "공급받는자이메일주소2",
      "공급자사업자등록번호",
      "공급자이메일주소",
      "대표자명",
      "대표자명_1",
      "발행유형",
      "발행일자",
      "번호",
      "비고",
      "상호",
      "상호_1",
      "세액",
      "승인번호",
      "영수/청구 구분",
      "작성일자",
      "전송일자",
      "전자세금계산서분류",
      "전자세금계산서종류",
      "종사업장번호",
      "종사업장번호_1",
      "품목공급가액",
      "품목규격",
      "품목단가",
      "품목명",
      "품목비고",
      "품목세액",
      "품목수량",
      "품목일자",
      "합계금액",
    ];
    setLoading(true);

    let valid = true;

    jsonArr.map((items: any) => {
      Object.keys(items).map((item: any) => {
        if (!columns.includes(item) && valid == true) {
          alert("양식이 맞지 않습니다.");
          valid = false;
          return;
        }
      });
    });

    let detailArr: TDetailData = {
      rowstatus_s: [],
      recnum_s: [],
      recdt_s: [],
      baldt_s: [],
      trsdt_s: [],
      bizregnum_s: [],
      bizregnum2_s: [],
      bizname_s: [],
      bizceoname_s: [],
      custregnum_s: [],
      custregnum2_s: [],
      custname_s: [],
      custceoname_s: [],
      amt_s: [],
      splyamt_s: [],
      taxamt_s: [],
      taxdiv_s: [],
      taxkind_s: [],
      balkind_s: [],
      remark_s: [],
      remark2_s: [],
      taxgubun_s: [],
      bizemail_s: [],
      custemail_s: [],
      custemail2_s: [],
      itemdt_s: [],
      itemnm_s: [],
      spec_s: [],
      itemqty_s: [],
      itemunp_s: [],
      itemsplyamt_s: [],
      itemtaxamt_s: [],
      remark3_s: [],
    };

    jsonArr.forEach(async (item: any) => {
      const {
        공급가액 = "",
        공급받는자사업자번호 = "",
        공급받는자이메일주소1 = "",
        공급받는자이메일주소2 = "",
        공급자사업자등록번호 = "",
        공급자이메일주소 = "",
        대표자명 = "",
        대표자명_1 = "",
        발행유형 = "",
        발행일자 = "",
        비고 = "",
        상호 = "",
        상호_1 = "",
        세액 = "",
        승인번호 = "",
        작성일자 = "",
        전송일자 = "",
        전자세금계산서분류 = "",
        전자세금계산서종류 = "",
        종사업장번호 = "",
        종사업장번호_1 = "",
        품목공급가액 = "",
        품목규격 = "",
        품목단가 = "",
        품목명 = "",
        품목비고 = "",
        품목세액 = "",
        품목수량 = "",
        품목일자 = "",
        합계금액 = "",
      } = item;
      const 세금계산서 =
        전자세금계산서분류 == "전자세금계산서"
          ? "세금계산서"
          : 전자세금계산서분류 == "수정전자세금계산서"
          ? "수정세금계산서"
          : 전자세금계산서분류;
      detailArr.rowstatus_s.push("N");
      detailArr.recnum_s.push(승인번호 == undefined ? "" : 승인번호);
      detailArr.recdt_s.push(작성일자 == undefined ? "" : 작성일자);
      detailArr.baldt_s.push(발행일자 == undefined ? "" : 발행일자);
      detailArr.trsdt_s.push(전송일자 == undefined ? "" : 전송일자);
      detailArr.bizregnum_s.push(
        공급자사업자등록번호 == undefined ? "" : 공급자사업자등록번호
      );
      detailArr.bizregnum2_s.push(
        종사업장번호 == undefined ? "" : 종사업장번호
      );
      detailArr.bizname_s.push(상호 == undefined ? "" : 상호);
      detailArr.bizceoname_s.push(대표자명 == undefined ? "" : 대표자명);
      detailArr.custregnum_s.push(
        공급받는자사업자번호 == undefined ? "" : 공급받는자사업자번호
      );
      detailArr.custregnum2_s.push(
        종사업장번호_1 == undefined ? "" : 종사업장번호_1
      );
      detailArr.custname_s.push(상호_1 == undefined ? "" : 상호_1);
      detailArr.custceoname_s.push(대표자명_1 == undefined ? "" : 대표자명_1);
      detailArr.amt_s.push(합계금액 == undefined ? "" : 합계금액);
      detailArr.splyamt_s.push(공급가액 == undefined ? "" : 공급가액);
      detailArr.taxamt_s.push(세액 == undefined ? "" : 세액);
      detailArr.taxdiv_s.push(
        taxdivListData.find((item: any) => item.code_name == 세금계산서)
          ?.sub_code == undefined
          ? 세금계산서
          : taxdivListData.find((item: any) => item.code_name == 세금계산서)
              ?.sub_code
      );
      detailArr.taxkind_s.push(
        taxkindListData.find(
          (item: any) => item.code_name == 전자세금계산서종류
        )?.sub_code == undefined
          ? 전자세금계산서종류
          : taxkindListData.find(
              (item: any) => item.code_name == 전자세금계산서종류
            )?.sub_code
      );
      detailArr.balkind_s.push(
        balkindListData.find((item: any) => item.code_name == 발행유형)
          ?.sub_code == undefined
          ? 발행유형
          : balkindListData.find((item: any) => item.code_name == 발행유형)
              ?.sub_code
      );
      detailArr.remark_s.push(비고 == undefined ? "" : 비고);
      detailArr.remark2_s.push("");
      detailArr.taxgubun_s.push(
        taxgubunListData.find(
          (items: any) => items.code_name == item["영수/청구 구분"]
        )?.sub_code == undefined
          ? item["영수/청구 구분"]
          : taxgubunListData.find(
              (items: any) => items.code_name == item["영수/청구 구분"]
            )?.sub_code
      );
      detailArr.bizemail_s.push(
        공급자이메일주소 == undefined ? "" : 공급자이메일주소
      );
      detailArr.custemail_s.push(
        공급받는자이메일주소1 == undefined ? "" : 공급받는자이메일주소1
      );
      detailArr.custemail2_s.push(
        공급받는자이메일주소2 == undefined ? "" : 공급받는자이메일주소2
      );
      detailArr.itemdt_s.push(품목일자 == undefined ? "" : 품목일자);
      detailArr.itemnm_s.push(품목명 == undefined ? "" : 품목명);
      detailArr.spec_s.push(품목규격 == undefined ? "" : 품목규격);
      detailArr.itemqty_s.push(품목수량 == undefined ? "" : 품목수량);
      detailArr.itemunp_s.push(품목단가 == undefined ? "" : 품목단가);
      detailArr.itemsplyamt_s.push(
        품목공급가액 == undefined ? "" : 품목공급가액
      );
      detailArr.itemtaxamt_s.push(품목세액 == undefined ? "" : 품목세액);
      detailArr.remark3_s.push(품목비고 == undefined ? "" : 품목비고);
    });

    setParaData({
      workType: "N",
      orgdiv: "01",
      inoutdiv: information.inoutdiv,
      listyn: information.listyn,
      rowstatus_s: detailArr.rowstatus_s.join("|"),
      recnum_s: detailArr.recnum_s.join("|"),
      recdt_s: detailArr.recdt_s.join("|"),
      baldt_s: detailArr.baldt_s.join("|"),
      trsdt_s: detailArr.trsdt_s.join("|"),
      bizregnum_s: detailArr.bizregnum_s.join("|"),
      bizregnum2_s: detailArr.bizregnum2_s.join("|"),
      bizname_s: detailArr.bizname_s.join("|"),
      bizceoname_s: detailArr.bizceoname_s.join("|"),
      custregnum_s: detailArr.custregnum_s.join("|"),
      custregnum2_s: detailArr.custregnum2_s.join("|"),
      custname_s: detailArr.custname_s.join("|"),
      custceoname_s: detailArr.custceoname_s.join("|"),
      amt_s: detailArr.amt_s.join("|"),
      splyamt_s: detailArr.splyamt_s.join("|"),
      taxamt_s: detailArr.taxamt_s.join("|"),
      taxdiv_s: detailArr.taxdiv_s.join("|"),
      taxkind_s: detailArr.taxkind_s.join("|"),
      balkind_s: detailArr.balkind_s.join("|"),
      remark_s: detailArr.remark_s.join("|"),
      remark2_s: detailArr.remark2_s.join("|"),
      taxgubun_s: detailArr.taxgubun_s.join("|"),
      bizemail_s: detailArr.bizemail_s.join("|"),
      custemail_s: detailArr.custemail_s.join("|"),
      custemail2_s: detailArr.custemail2_s.join("|"),
      itemdt_s: detailArr.itemdt_s.join("|"),
      itemnm_s: detailArr.itemnm_s.join("|"),
      spec_s: detailArr.spec_s.join("|"),
      itemqty_s: detailArr.itemqty_s.join("|"),
      itemunp_s: detailArr.itemunp_s.join("|"),
      itemsplyamt_s: detailArr.itemsplyamt_s.join("|"),
      itemtaxamt_s: detailArr.itemtaxamt_s.join("|"),
      remark3_s: detailArr.remark3_s.join("|"),
    });

    setLoading(false);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const selectRow = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setParaData((prev) => ({
        ...prev,
        workType: "D",
        recnum_s: selectRow.recnum,
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    inoutdiv: "",
    listyn: "",
    rowstatus_s: "",
    recnum_s: "",
    recdt_s: "",
    baldt_s: "",
    trsdt_s: "",
    bizregnum_s: "",
    bizregnum2_s: "",
    bizname_s: "",
    bizceoname_s: "",
    custregnum_s: "",
    custregnum2_s: "",
    custname_s: "",
    custceoname_s: "",
    amt_s: "",
    splyamt_s: "",
    taxamt_s: "",
    taxdiv_s: "",
    taxkind_s: "",
    balkind_s: "",
    remark_s: "",
    remark2_s: "",
    taxgubun_s: "",
    bizemail_s: "",
    custemail_s: "",
    custemail2_s: "",
    itemdt_s: "",
    itemnm_s: "",
    spec_s: "",
    itemqty_s: "",
    itemunp_s: "",
    itemsplyamt_s: "",
    itemtaxamt_s: "",
    remark3_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_B5040W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_inoutdiv": paraData.inoutdiv,
      "@p_listyn": paraData.listyn,

      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_recnum_s": paraData.recnum_s,
      "@p_recdt_s": paraData.recdt_s,
      "@p_baldt_s": paraData.baldt_s,
      "@p_trsdt_s": paraData.trsdt_s,
      "@p_bizregnum_s": paraData.bizregnum_s,
      "@p_bizregnum2_s": paraData.bizregnum2_s,
      "@p_bizname_s": paraData.bizname_s,
      "@p_bizceoname_s": paraData.bizceoname_s,
      "@p_custregnum_s": paraData.custregnum_s,
      "@p_custregnum2_s": paraData.custregnum2_s,
      "@p_custname_s": paraData.custname_s,
      "@p_custceoname_s": paraData.custceoname_s,
      "@p_amt_s": paraData.amt_s,
      "@p_splyamt_s": paraData.splyamt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_taxdiv_s": paraData.taxdiv_s,
      "@p_taxkind_s": paraData.taxkind_s,
      "@p_balkind_s": paraData.balkind_s,
      "@p_remark_s": paraData.remark_s,
      "@p_remark2_s": paraData.remark2_s,
      "@p_taxgubun_s": paraData.taxgubun_s,
      "@p_bizemail_s": paraData.bizemail_s,
      "@p_custemail_s": paraData.custemail_s,
      "@p_custemail2_s": paraData.custemail2_s,
      "@p_itemdt_s": paraData.itemdt_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_spec_s": paraData.spec_s,
      "@p_itemqty_s": paraData.itemqty_s,
      "@p_itemunp_s": paraData.itemunp_s,
      "@p_itemsplyamt_s": paraData.itemsplyamt_s,
      "@p_itemtaxamt_s": paraData.itemtaxamt_s,
      "@p_remark3_s": paraData.remark3_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_B5040W",
    },
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

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
        workType: "",
        orgdiv: "",
        inoutdiv: "",
        listyn: "",
        rowstatus_s: "",
        recnum_s: "",
        recdt_s: "",
        baldt_s: "",
        trsdt_s: "",
        bizregnum_s: "",
        bizregnum2_s: "",
        bizname_s: "",
        bizceoname_s: "",
        custregnum_s: "",
        custregnum2_s: "",
        custname_s: "",
        custceoname_s: "",
        amt_s: "",
        splyamt_s: "",
        taxamt_s: "",
        taxdiv_s: "",
        taxkind_s: "",
        balkind_s: "",
        remark_s: "",
        remark2_s: "",
        taxgubun_s: "",
        bizemail_s: "",
        custemail_s: "",
        custemail2_s: "",
        itemdt_s: "",
        itemnm_s: "",
        spec_s: "",
        itemqty_s: "",
        itemunp_s: "",
        itemsplyamt_s: "",
        itemtaxamt_s: "",
        remark3_s: "",
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
        <Title>전자세금계산서비교현황</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="AC_B5040W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
      >
        <TabStripTab title="국세청자료">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>작성일자</th>
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
                  <th>매입매출</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="inoutdiv"
                        value={filters.inoutdiv}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <FormBoxWrap border={true}>
            <GridTitleContainer>
              <GridTitle>세금계산서오류사항변경</GridTitle>
            </GridTitleContainer>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "10%" }}>자료구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="inoutdiv"
                        value={information.inoutdiv}
                        bizComponentId="R_gubunD"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                  <th style={{ width: "10%" }}>저장옵션</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="listyn"
                        value={information.listyn}
                        bizComponentId="R_Override"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                  <td>
                    <ExcelUploadButton
                      saveExcel={saveExcel}
                      permissions={{
                        view: true,
                        save: true,
                        delete: true,
                        print: true,
                      }}
                      style={{}}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
          <GridContainer width="100%">
            <GridTitleContainer>
              <GridTitle></GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                >
                  삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "60vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    taxdiv: taxdivListData.find(
                      (item: any) => item.sub_code == row.taxdiv
                    )?.code_name,
                    inoutdiv: inoutdivListData.find(
                      (item: any) => item.sub_code == row.inoutdiv
                    )?.code_name,
                    taxkind: taxkindListData.find(
                      (item: any) => item.sub_code == row.taxkind
                    )?.code_name,
                    balkind: balkindListData.find(
                      (item: any) => item.sub_code == row.balkind
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
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : dateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
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
        </TabStripTab>
        <TabStripTab title="매출">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>작성일자</th>
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
                <tr>
                  <th>사업자/주민번호</th>
                  <td>
                    <Input
                      name="bizregnum"
                      type="text"
                      value={filters.bizregnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <td>
                    <Checkbox
                      name="chk"
                      value={filters.chk == "Y" ? true : false}
                      onChange={filterInputChange}
                      label={"계산서유무"}
                    />
                  </td>
                  <td>
                    <Checkbox
                      name="chktax"
                      value={filters.chktax == "Y" ? true : false}
                      onChange={filterInputChange}
                      label={"차이나는 데이터만 보기"}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer width="100%">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "74vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
                <GridColumn
                  field="custcd"
                  title="업체코드"
                  width="120px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="custnm" title="업체명" width="120px" />
                <GridColumn
                  field="bizregnum"
                  title="사업자등록번호"
                  width="150px"
                />
                <GridColumn title="ERP">{createColumn()}</GridColumn>
                <GridColumn title="E세로">{createColumn2()}</GridColumn>
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="매입">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>작성일자</th>
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
                <tr>
                  <th>사업자/주민번호</th>
                  <td>
                    <Input
                      name="bizregnum"
                      type="text"
                      value={filters.bizregnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <td>
                    <Checkbox
                      name="chk"
                      value={filters.chk == "Y" ? true : false}
                      onChange={filterInputChange}
                      label={"계산서유무"}
                    />
                  </td>
                  <td>
                    <Checkbox
                      name="chktax"
                      value={filters.chktax == "Y" ? true : false}
                      onChange={filterInputChange}
                      label={"차이나는 데이터만 보기"}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer width="100%">
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "74vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
                <GridColumn
                  field="custcd"
                  title="업체코드"
                  width="120px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn field="custnm" title="업체명" width="120px" />
                <GridColumn
                  field="bizregnum"
                  title="사업자등록번호"
                  width="150px"
                />
                <GridColumn title="ERP">{createColumn()}</GridColumn>
                <GridColumn title="E세로">{createColumn2()}</GridColumn>
              </Grid>
            </ExcelExport>
          </GridContainer>
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

export default AC_B5040W;
