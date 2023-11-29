import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
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
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/MA_A2310_606W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const dateField = ["outdt"];
const numberField = ["amt", "taxamt", "qty"];
var barcode = "";
let temp = 0;
let targetRowIndex: null | number = null;

const MA_A2310_606W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const companyCode = loginResult ? loginResult.companyCode : "";
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
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const processApi = useApi();

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_sysUserMaster_001, L_BA061", setBizComponentData);

  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      fetchQueryData(userQueryStr, setUserListData);
      fetchQueryData(itemacntQueryStr, setItemacntListData);
    }
  }, [bizComponentData]);

  const fetchQueryData = useCallback(
    async (queryStr: string, setListData: any) => {
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
    },
    []
  );

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
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
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

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LIST",
    orgdiv: "01",
    location: "",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    lotnum: "",
    ordnum: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    finyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [Information, setInformation] = useState({
    lotnum: "",
    isSearch: false,
  });

  let gridRef: any = useRef(null);

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_MA_A2310_606W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": "01",
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_lotnum": filters.lotnum,
        "@p_ordnum": filters.ordnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_finyn": filters.finyn,
        "@p_lotnum2": "",
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
  const fetchLotNoGrid = async (Information: any) => {
    //if (!permissions?.view) return;
    barcode = "";
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A2310_606W_Q",
      pageNumber: 1,
      pageSize: 1,
      parameters: {
        "@p_work_type": "LOTNUM",
        "@p_orgdiv": "01",
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_lotnum": filters.lotnum,
        "@p_ordnum": filters.ordnum,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_finyn": filters.finyn,
        "@p_lotnum2": Information.lotnum,
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
      console.log(data);
      if (totalRowCnt > 0) {
      } else {
        alert("해당 LOT번호가 없습니다.");
        barcode = "";
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setInformation((prev) => ({
      ...prev,
      lotnum: "",
      isSearch: false,
    }));
  };

  useEffect(() => {
    if (filters.isSearch && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (Information.isSearch && Information.lotnum != "") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(Information);
      setInformation((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchLotNoGrid(deepCopiedFilters);
    }
  }, [Information, bizComponentData, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2310_606W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2310_606W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };

  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

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

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
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

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
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

  useEffect(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code == "Enter") {
        if (barcode != "") {
          setInformation((prev) => ({
            ...prev,
            lotnum: barcode,
            isSearch: true,
          }));
        }
      } else if (
        evt.code != "ShiftLeft" &&
        evt.code != "Shift" &&
        evt.code != "Enter"
      ) {
        barcode += evt.key;
      }
    });
    document.addEventListener("click", function (evt) {
      barcode = "";
    });
  }, []);

  const onDeleteClick = (e: any) => {
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );
    if (dataItem.length != 0) {
      let dataArr: any = {
        rekey_s: [],
        recdt_s: [],
        seq1_s: [],
        seq2_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const { reckey = "", recdt = "", seq1 = "", seq2 = "" } = item;
        dataArr.rekey_s.push(reckey);
        dataArr.recdt_s.push(recdt);
        dataArr.seq1_s.push(seq1);
        dataArr.seq2_s.push(seq2);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "D",
        orgdiv: "01",
        location: "01",
        indt: convertDateToStr(new Date()),
        rekey_s: dataArr.rekey_s.join("|"),
        recdt_s: dataArr.recdt_s.join("|"),
        seq1_s: dataArr.seq1_s.join("|"),
        seq2_s: dataArr.seq2_s.join("|"),
        userid: userId,
        pc: pc,
        form_id: "MA_A2310_606W",
        companyCode: companyCode,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onAddClick = (e: any) => {
    if (mainDataResult2.data.length != 0) {
      let dataArr: any = {
        rekey_s: [],
        recdt_s: [],
        seq1_s: [],
        seq2_s: [],
      };

      mainDataResult2.data.forEach((item: any, idx: number) => {
        const { reckey = "", recdt = "", seq1 = "", seq2 = "" } = item;
        dataArr.rekey_s.push(reckey);
        dataArr.recdt_s.push(recdt);
        dataArr.seq1_s.push(seq1);
        dataArr.seq2_s.push(seq2);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "N",
        orgdiv: "01",
        location: "01",
        indt: convertDateToStr(new Date()),
        rekey_s: dataArr.rekey_s.join("|"),
        recdt_s: dataArr.recdt_s.join("|"),
        seq1_s: dataArr.seq1_s.join("|"),
        seq2_s: dataArr.seq2_s.join("|"),
        userid: userId,
        pc: pc,
        form_id: "MA_A2310_606W",
        companyCode: companyCode,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onAddClick2 = () => {
    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    let valid = false;
    mainDataResult2.data.map((item) => {
      dataItem.map((item2) => {
        if (
          item.lotnum == item2.lotnum &&
          item.seq1 == item2.seq1 &&
          item.seq2 == item2.seq2 &&
          item.recdt == item2.recdt &&
          valid == false
        ) {
          valid = true;
        }
      });
    });

    if (valid == false) {
      dataItem.map((items) => {
        mainDataResult2.data.map((item) => {
          if (item.num > temp) {
            temp = item.num;
          }
        });

        const newDataItem = {
          [DATA_ITEM_KEY2]: ++temp,
          amt: items.amt,
          amtunit: items.amtunit,
          bnatur: items.bnatur,
          contractno: items.contractno,
          custcd: items.custcd,
          custnm: items.custnm,
          doexdiv: items.doexdiv,
          insiz: items.insiz,
          itemacnt: items.itemacnt,
          itemcd: items.itemcd,
          itemnm: items.itemnm,
          lcno: items.lcno,
          location: items.location,
          lotnum: items.lotnum,
          ordnum: items.ordnum,
          ordseq: items.ordseq,
          orgdiv: items.orgdiv,
          outdt: items.outdt,
          outdt2: items.outdt2,
          outkind: items.outkind,
          outtype: items.outtype,
          person: items.person,
          pgmdiv: items.pgmdiv,
          qty: items.qty,
          rcvcustcd: items.rcvcustcd,
          recdt: items.recdt,
          reckey: items.reckey,
          remark: items.remark,
          seq1: items.seq1,
          seq2: items.seq2,
          shipdt: items.shipdt,
          spec: items.spec,
          taxamt: items.taxamt,
          uschgrat: items.uschgrat,
          wonchgrat: items.wonchgrat,
        };

        setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
        setMainDataResult2((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      });
    } else {
      alert("동일한 행이 이미 추가되어있습니다.");
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    orgdiv: "01",
    location: "",
    indt: "",
    rekey_s: "",
    recdt_s: "",
    seq1_s: "",
    seq2_s: "",
    userid: userId,
    pc: pc,
    form_id: "MA_A2310_606W",
    companyCode: companyCode,
  });

  const para: Iparameters = {
    procedureName: "P_MA_A2310_606W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": "01",
      "@p_location": ParaData.location,
      "@p_indt": ParaData.indt,
      "@p_rekey_s": ParaData.rekey_s,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_seq1_s": ParaData.seq1_s,
      "@p_seq2_s": ParaData.seq2_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "MA_A2310_606W",
      "@p_company_code": ParaData.companyCode,
    },
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
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));

      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        orgdiv: "01",
        location: "",
        indt: "",
        rekey_s: "",
        recdt_s: "",
        seq1_s: "",
        seq2_s: "",
        userid: userId,
        pc: pc,
        form_id: "MA_A2310_606W",
        companyCode: companyCode,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
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

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
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
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>입고확정</Title>

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
              <th>출고일자</th>
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
              <th>수주번호</th>
              <td>
                <Input
                  name="ordnum"
                  type="text"
                  value={filters.ordnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>LOT번호</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
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
              <th>진행</th>
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
                onClick={onAddClick}
                themeColor={"primary"}
                icon="check-circle"
              >
                확정
              </Button>
              <Button
                onClick={onDeleteClick}
                icon="close-circle"
                fillMode="outline"
                themeColor={"primary"}
              >
                삭제
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "40vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                person: userListData.find(
                  (items: any) => items.user_id == row.person
                )?.user_name,
                itemacnt: itemacntListData.find(
                  (item: any) => item.sub_code === row.itemacnt
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange}
            //스크롤 조회기능
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
              headerCell={CustomCheckBoxCell2}
              cell={CheckBoxCell}
            />
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
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>Keeping</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onAddClick2}
              themeColor={"primary"}
              icon="plus"
              title="행 추가"
            ></Button>
            <Button
              onClick={onDeleteClick2}
              themeColor={"primary"}
              fillMode="outline"
              icon="minus"
              title="행 삭제"
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: "30vh" }}
          data={process(
            mainDataResult2.data.map((row) => ({
              ...row,
              person: userListData.find(
                (items: any) => items.user_id == row.person
              )?.user_name,
              itemacnt: itemacntListData.find(
                (item: any) => item.sub_code === row.itemacnt
              )?.code_name,
              [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
            })),
            mainDataState2
          )}
          onDataStateChange={onMainDataStateChange2}
          {...mainDataState2}
          //선택 기능
          dataItemKey={DATA_ITEM_KEY2}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onMainSelectionChange2}
          //스크롤 조회기능
          fixedScroll={true}
          total={mainDataResult2.total}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange2}
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
                      numberField.includes(item.fieldName)
                        ? NumberCell
                        : dateField.includes(item.fieldName)
                        ? DateCell
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
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
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

export default MA_A2310_606W;
