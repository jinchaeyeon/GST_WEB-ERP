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
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { IAttachmentData, IWindowPosition } from "../hooks/interfaces";
import { CellRender, RowRender } from "../components/Renderers";
import CommonRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { Field } from "@progress/kendo-react-form";
import calculateSize from "calculate-size";
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
  ButtonInFieldWrap,
  ButtonInField,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  dateformat,
  UseParaPc,
  dateformat2,
  UseGetValueFromSessionItem,
} from "../components/CommonFunction";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";

const DATA_ITEM_KEY = "custcd";
const SUB_DATA_ITEM_KEY = "num";
let deletedTodoRows: object[] = [];

const BA_A0020: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
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
        raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
          .valueCode,
        custdiv: defaultOption.find((item: any) => item.id === "custdiv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA026,L_BA027,L_AC901,L_sysUserMaster_001,R_USEYN,L_BA173,L_BA172,L_BA171,L_BA049,R_RTXISUYN,L_BA008",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [custdivListData, setCustdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [bizdivListData, setBizdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const custdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA026")
      );
      const BizdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA027")
      );

      fetchQuery(custdivQueryStr, setCustdivListData);
      fetchQuery(BizdivQueryStr, setBizdivListData);
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

  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSubPgNum] = useState(1);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [workType, setWorkType] = useState<string>("U");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
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

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "U",
    custcd: "자동생성",
    custnm: "",
    custdiv: "",
    custabbr: "",
    compnm_eng: "",
    inunpitem: "",
    bizregnum: "",
    zipcode: 0,
    area: "",
    unpitem: "",
    ceonm: "",
    address: "",
    bizdiv: "",
    repreregno: "",
    address_eng: "",
    estbdt: new Date(),
    phonenum: "",
    bnkinfo: "",
    bankacntuser: "",
    compclass: "",
    etelnum: "",
    bankacnt: "",
    comptype: "",
    faxnum: "",
    bnkinfo2: "",
    bankacnt2: "",
    taxorg: "",
    efaxnum: "",
    email: "",
    taxortnm: "",
    useyn: "Y",
    scmyn: "Y",
    pariodyn: "",
    attdatnum: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    etax: "",
    remark: "",
    etxprs: "",
    phonenum_og: "",
    emailaddr_og: "",
    bill_type: "",
    recvid: "",
    rtxisuyn: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    custcd: "",
    custnm: "",
    custdiv: "",
    bizregnum: "",
    ceonm: "",
    raduseyn: "Y",
    company_code: "2207A046",
    row_value: null,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_BA_A0020W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_custdiv": filters.custdiv,
      "@p_bizregnum": filters.bizregnum,
      "@p_ceonm": filters.ceonm,
      "@p_useyn": filters.raduseyn,
      "@p_company_code": filters.company_code,
      "@p_find_row_value": filters.row_value,
    },
  };

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "UNP",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    useyn: "",
    custcd: "",
    custnm: "",
    itemcd_s: "",
    spec: "",
    location: "",
    remark: "",
    bnatur: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
  });

  //조회조건 파라미터
  const subparameters: Iparameters = {
    procedureName: "P_BA_A0040W_Q",
    pageNumber: subPgNum,
    pageSize: subfilters.pgSize,
    parameters: {
      "@p_work_type": subfilters.workType,
      "@p_itemcd": subfilters.itemcd,
      "@p_itemnm": subfilters.itemnm,
      "@p_insiz": subfilters.insiz,
      "@p_itemacnt": subfilters.itemacnt,
      "@p_useyn": subfilters.useyn,
      "@p_custcd": subfilters.custcd,
      "@p_custnm": subfilters.custnm,
      "@p_itemcd_s": subfilters.itemcd_s,
      "@p_spec": subfilters.spec,
      // "@p_location": subfilters.location,
      "@p_remark": subfilters.remark,
      // "@p_bnatur":subfilters.bnatur,
      // "@p_itemlvl1": subfilters.itemlvl1,
      // "@p_itemlvl2": subfilters.itemlvl2,
      // "@p_itemlvl3": subfilters.itemlvl3,
      "@p_find_row_value": null,
    },
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

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //   const fetchSubGrid = async () => {
  //     //if (!permissions?.view) return;
  //     let data: any;

  //     setLoading(true);
  //     try {
  //       data = await processApi<any>("procedure", subparameters);
  //     } catch (error) {
  //       data = null;
  //     }

  //     if (data.isSuccess === true) {
  //       const totalRowCnt = data.tables[0].RowCount;
  //       const rows = data.tables[0].Rows;

  //       const row = rows.map((item: any) => ({
  //         ...item,
  //         inEdit: "recdt",
  //         rowstatus: "U",
  //       }));
  //       if (totalRowCnt > 0) {
  //         setSubDataResult((prev) => {
  //           return {
  //             data: [...prev.data, ...row],
  //             total: totalRowCnt,
  //           };
  //         });
  //       }
  //     } else {
  //       console.log("[오류 발생]");
  //       console.log(data);
  //     }
  //     setLoading(false);
  //   };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData !== null &&
      isInitSearch === false &&
      permissions !== null
    ) {
      fetchMainGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  //   useEffect(() => {
  //     fetchSubGrid();
  //   }, [subPgNum]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.custcd]: true });

        setsubFilters((prev) => ({
          ...prev,
          workType: "UNP",
          itemcd: firstRowData.itemcd,
          itemnm: firstRowData.itemnm,
          insiz: firstRowData.insiz,
          itemacnt: firstRowData.itemacnt,
          useyn: firstRowData.useyn,
          custcd: firstRowData.custcd,
          custnm: firstRowData.custnm,
          itemcd_s: "",
          spec: firstRowData.spec,
          location: firstRowData.location,
          remark: firstRowData.remark,
          bnatur: firstRowData.bnatur,
          itemlvl1: firstRowData.itemlvl1,
          itemlvl2: firstRowData.itemlvl2,
          itemlvl3: firstRowData.itemlvl3,
        }));

        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "U",
          custcd: firstRowData.custcd,
          custnm: firstRowData.custnm,
          custdiv: firstRowData.custdiv,
          custabbr: firstRowData.custabbr,
          compnm_eng: firstRowData.compnm_eng,
          inunpitem: firstRowData.inunpitem,
          bizregnum: firstRowData.bizregnum,
          zipcode: firstRowData.zipcode,
          area: firstRowData.area,
          unpitem: firstRowData.unpitem,
          ceonm: firstRowData.ceonm,
          address: firstRowData.address,
          bizdiv: firstRowData.bizdiv,
          repreregno: firstRowData.repreregno,
          address_eng: firstRowData.address_eng,
          estbdt: new Date(dateformat(firstRowData.estbdt)),
          phonenum: firstRowData.phonenum,
          bnkinfo: firstRowData.bnkinfo,
          bankacntuser: firstRowData.bankacntuser,
          compclass: firstRowData.compclass,
          etelnum: firstRowData.etelnum,
          bankacnt: firstRowData.bankacnt,
          comptype: firstRowData.comptype,
          faxnum: firstRowData.faxnum,
          bnkinfo2: firstRowData.bnkinfo2,
          bankacnt2: firstRowData.bankacnt2,
          taxorg: firstRowData.taxorg,
          efaxnum: firstRowData.efaxnum,
          email: firstRowData.email,
          taxortnm: firstRowData.taxortnm,
          useyn: firstRowData.useyn,
          scmyn: firstRowData.scmyn,
          pariodyn: firstRowData.pariodyn,
          attdatnum: firstRowData.attdatnum,
          itemlvl1: firstRowData.itemlvl1,
          itemlvl2: firstRowData.itemlvl2,
          itemlvl3: firstRowData.itemlvl3,
          etax: firstRowData.etax,
          remark: firstRowData.remark,
          etxprs: firstRowData.etxprs,
          phonenum_og: firstRowData.phonenum_og,
          emailaddr_og: firstRowData.emailaddr_og,
          bill_type: firstRowData.bill_type,
          recvid: firstRowData.recvid,
          rtxisuyn: firstRowData.rtxisuyn,
        });

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  //   useEffect(() => {
  //     setSubPgNum(1);
  //     setSubDataResult(process([], subDataState));
  //     if (customOptionData !== null) {
  //       fetchSubGrid();
  //     }
  //   }, [subfilters]);

  //   useEffect(() => {
  //     if (customOptionData !== null) {
  //       fetchSubGrid();
  //     }
  //   }, [subPgNum]);

  //   useEffect(() => {
  //     setSubPgNum(1);
  //     setSubDataResult(process([], subDataState));
  //     if (customOptionData !== null) {
  //       fetchSubGrid();
  //     }
  //   }, [tabSelected]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    setSubPgNum(1);
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

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custdiv: selectedRowData.custdiv,
      custabbr: selectedRowData.custabbr,
      compnm_eng: selectedRowData.compnm_eng,
      inunpitem: selectedRowData.inunpitem,
      bizregnum: selectedRowData.bizregnum,
      zipcode: selectedRowData.zipcode,
      area: selectedRowData.area,
      unpitem: selectedRowData.unpitem,
      ceonm: selectedRowData.ceonm,
      address: selectedRowData.address,
      bizdiv: selectedRowData.bizdiv,
      repreregno: selectedRowData.repreregno,
      address_eng: selectedRowData.address_eng,
      estbdt: new Date(dateformat(selectedRowData.estbdt)),
      phonenum: selectedRowData.phonenum,
      bnkinfo: selectedRowData.bnkinfo,
      bankacntuser: selectedRowData.bankacntuser,
      compclass: selectedRowData.compclass,
      etelnum: selectedRowData.etelnum,
      bankacnt: selectedRowData.bankacnt,
      comptype: selectedRowData.comptype,
      faxnum: selectedRowData.faxnum,
      bnkinfo2: selectedRowData.bnkinfo2,
      bankacnt2: selectedRowData.bankacnt2,
      taxorg: selectedRowData.taxorg,
      efaxnum: selectedRowData.efaxnum,
      email: selectedRowData.email,
      taxortnm: selectedRowData.taxortnm,
      useyn: selectedRowData.useyn,
      scmyn: selectedRowData.scmyn,
      pariodyn: selectedRowData.pariodyn,
      attdatnum: selectedRowData.attdatnum,
      itemlvl1: selectedRowData.itemlvl1,
      itemlvl2: selectedRowData.itemlvl2,
      itemlvl3: selectedRowData.itemlvl3,
      etax: selectedRowData.etax,
      remark: selectedRowData.remark,
      etxprs: selectedRowData.etxprs,
      phonenum_og: selectedRowData.phonenum_og,
      emailaddr_og: selectedRowData.emailaddr_og,
      bill_type: selectedRowData.bill_type,
      recvid: selectedRowData.recvid,
      rtxisuyn: selectedRowData.rtxisuyn,
    });
    if (tabSelected === 1) {
      setsubFilters((prev) => ({
        ...prev,
        itemcd: selectedRowData.itemcd,
        itemnm: selectedRowData.itemnm,
        insiz: selectedRowData.insiz,
        itemacnt: selectedRowData.itemacnt,
        useyn: selectedRowData.useyn,
        custcd: selectedRowData.custcd,
        custnm: selectedRowData.custnm,
        itemcd_s: "",
        spec: selectedRowData.spec,
        location: selectedRowData.location,
        remark: selectedRowData.remark,
        bnatur: selectedRowData.bnatur,
        itemlvl1: selectedRowData.itemlvl1,
        itemlvl2: selectedRowData.itemlvl2,
        itemlvl3: selectedRowData.itemlvl3,
      }));
    }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
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
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const onAddClick2 = () => {
    setWorkType("N");
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      custcd: "자동생성",
      custnm: "",
      custdiv: "",
      custabbr: "",
      compnm_eng: "",
      inunpitem: "",
      bizregnum: "",
      zipcode: 0,
      area: "",
      unpitem: "",
      ceonm: "",
      address: "",
      bizdiv: "",
      repreregno: "",
      address_eng: "",
      estbdt: new Date(),
      phonenum: "",
      bnkinfo: "",
      bankacntuser: "",
      compclass: "",
      etelnum: "",
      bankacnt: "",
      comptype: "",
      faxnum: "",
      bnkinfo2: "",
      bankacnt2: "",
      taxorg: "",
      efaxnum: "",
      email: "",
      taxortnm: "",
      useyn: "",
      scmyn: "",
      pariodyn: "",
      attdatnum: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      etax: "",
      remark: "",
      etxprs: "",
      phonenum_og: "",
      emailaddr_og: "",
      bill_type: "",
      recvid: "",
      rtxisuyn: "",
    });
  };

  const onAddClick = () => {
    let seq = 1;

    if (subDataResult.total > 0) {
      subDataResult.data.forEach((item) => {
        if (item[SUB_DATA_ITEM_KEY] > seq) {
          seq = item[SUB_DATA_ITEM_KEY];
        }
      });
      seq++;
    }

    const newDataItem = {
      [SUB_DATA_ITEM_KEY]: seq,
      recdt: convertDateToStr(new Date()),
      unpitem: "SYS01",
      amtunit: "KRW",
      itemacnt: "2",
      unp: 0,
      remark: "",
      inEdit: "recdt",
      rowstatus: "N",
    };

    setSubDataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total + 1,
      };
    });
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

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    setSubPgNum(1);
    setSubDataResult(process([], subDataState));
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setInfomation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
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

  type TdataArr = {
    unpitem: string[];
    rowstatus: string[];
    itemcd: string[];
    unp: string[];
    itemacnt: string[];
    remark: string[];
    recdt: string[];
    amtunit: string[];
  };
  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setCustData2 = (data: ICustData) => {
    setInfomation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
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

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      SUB_DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    const newData = subDataResult.data.map((item) =>
      item[SUB_DATA_ITEM_KEY] === dataItem[SUB_DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );

    setSubDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit = () => {
    const newData = subDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setSubDataResult((prev) => {
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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    custcd: "",
  });

  const onDeleteClick = (e: any) => {
    const item = Object.getOwnPropertyNames(selectedState)[0];
    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      custcd: item,
    }));
  };

  // const [paraData, setParaData] = useState({
  //   workType: "",
  //   orgdiv: "01",
  //   user_id: userId,
  //   form_id: "BA_A0020W",
  //   pc: pc,
  //   unpitem: "",
  //   rowstatus: "",
  //   itemcd: "",
  //   unp: "",
  //   itemacnt: "",
  //   remark: "",
  //   recdt: "",
  //   amtunit: "",
  // });

  // const para: Iparameters = {
  //   procedureName: "P_BA_A0080W_S",
  //   pageNumber: 0,
  //   pageSize: 0,
  //   parameters: {
  //     "@p_work_type": "",
  //     "@p_orgdiv": paraData.orgdiv,
  //     "@p_unpitem_s": paraData.unpitem,
  //     "@p_rowstatus_s": paraData.rowstatus,
  //     "@p_itemcd_s": paraData.itemcd,
  //     "@p_itemacnt_s": paraData.itemacnt,
  //     "@p_unp_s": paraData.unp,
  //     "@p_remark_s": paraData.remark,
  //     "@p_userid": paraData.user_id,
  //     "@p_recdt_s": paraData.recdt,
  //     "@p_amtunit_s": paraData.amtunit,
  //     "@p_form_id": paraData.form_id,
  //     "@p_pc": paraData.pc,
  //   },
  // };

  const paraDeleted: Iparameters = {
    procedureName: "P_BA_A0020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_auto": "Y",
      "@p_custcd": paraDataDeleted.custcd,
      "@p_custnm": infomation.custnm,
      "@p_custdiv": custdivListData.find(
        (item: any) => item.code_name === infomation.custdiv
      )?.sub_code,
      "@p_custabbr": infomation.custabbr,
      "@p_bizdiv": bizdivListData.find(
        (item: any) => item.code_name === infomation.bizdiv
      )?.sub_code,
      "@p_bizregnum": infomation.bizregnum,
      "@p_ceonm": infomation.ceonm,
      "@p_repreregno": infomation.repreregno,
      "@p_comptype": infomation.comptype,
      "@p_compclass": infomation.compclass,
      "@p_zipcode": infomation.zipcode,
      "@p_address": infomation.address,
      "@p_phonenum": infomation.phonenum,
      "@p_faxnum": infomation.faxnum,
      "@p_estbdt": convertDateToStr(infomation.estbdt),
      "@p_compnm_eng": infomation.compnm_eng,
      "@p_address_eng": infomation.address_eng,
      "@p_bnkinfo": infomation.bnkinfo,
      "@p_etelnum": infomation.etelnum,
      "@p_efaxnum": infomation.efaxnum,
      "@p_unpitem": infomation.unpitem,
      "@p_useyn": infomation.useyn,
      "@p_remark": infomation.remark,
      "@p_attdatnum": infomation.attdatnum,
      "@p_bill_type": infomation.bill_type,
      "@p_recvid": infomation.recvid,
      "@p_rtxisuyn": infomation.rtxisuyn,
      "@p_etxprs": infomation.etxprs,
      "@p_emailaddr_og": infomation.emailaddr_og,
      "@p_phonenum_og": infomation.phonenum_og,
      "@p_etax": infomation.etax,
      "@p_inunpitem": infomation.inunpitem,
      "@p_email": infomation.email,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_itemlvl2": infomation.itemlvl2,
      "@p_itemlvl3": infomation.itemlvl3,
      "@p_bankacnt": infomation.bankacnt,
      "@p_bankacntuser": infomation.bankacntuser,
      "@p_scmyn": infomation.scmyn,
      "@p_periodyn": "",
      "@p_bnkinfo2": infomation.bnkinfo2,
      "@p_bankacnt2": infomation.bankacnt2,
      "@p_area": infomation.area,
      "@p_rowstatus_s": "",
      "@p_remark_s": "",
      "@p_custprsncd_s": "",
      "@p_prsnnm_s": "",
      "@p_dptnm_s": "",
      "@p_postcd_s": "",
      "@p_telno_s": "",
      "@p_phoneno_s": "",
      "@p_email_s": "",
      "@p_rtrchk_s": "",
      "@p_attdatnum_s": "",
      "@p_sort_seq_s": "",
      "@p_seq_s": "",
      "@p_yyyy_s": "",
      "@p_totasset_s": "",
      "@p_paid_up_capital_s": "",
      "@p_totcapital_s": "",
      "@p_salesmoney_s": "",
      "@p_operating_profits_s": "",
      "@p_current_income_s": "",
      "@p_dedt_rati_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0020W",
      "@p_company_code": "2207A046",
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_BA_A0020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_auto": "Y",
      "@p_custcd": infomation.custcd,
      "@p_custnm": infomation.custnm,
      "@p_custdiv": custdivListData.find(
        (item: any) => item.code_name === infomation.custdiv
      )?.sub_code,
      "@p_custabbr": infomation.custabbr,
      "@p_bizdiv": bizdivListData.find(
        (item: any) => item.code_name === infomation.bizdiv
      )?.sub_code,
      "@p_bizregnum": infomation.bizregnum,
      "@p_ceonm": infomation.ceonm,
      "@p_repreregno": infomation.repreregno,
      "@p_comptype": infomation.comptype,
      "@p_compclass": infomation.compclass,
      "@p_zipcode": infomation.zipcode,
      "@p_address": infomation.address,
      "@p_phonenum": infomation.phonenum,
      "@p_faxnum": infomation.faxnum,
      "@p_estbdt": convertDateToStr(infomation.estbdt),
      "@p_compnm_eng": infomation.compnm_eng,
      "@p_address_eng": infomation.address_eng,
      "@p_bnkinfo": infomation.bnkinfo,
      "@p_etelnum": infomation.etelnum,
      "@p_efaxnum": infomation.efaxnum,
      "@p_unpitem": infomation.unpitem,
      "@p_useyn": infomation.useyn,
      "@p_remark": infomation.remark,
      "@p_attdatnum": infomation.attdatnum,
      "@p_bill_type": infomation.bill_type,
      "@p_recvid": infomation.recvid,
      "@p_rtxisuyn": infomation.rtxisuyn,
      "@p_etxprs": infomation.etxprs,
      "@p_emailaddr_og": infomation.emailaddr_og,
      "@p_phonenum_og": infomation.phonenum_og,
      "@p_etax": infomation.etax,
      "@p_inunpitem": infomation.inunpitem,
      "@p_email": infomation.email,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_itemlvl2": infomation.itemlvl2,
      "@p_itemlvl3": infomation.itemlvl3,
      "@p_bankacnt": infomation.bankacnt,
      "@p_bankacntuser": infomation.bankacntuser,
      "@p_scmyn": infomation.scmyn,
      "@p_periodyn": "",
      "@p_bnkinfo2": infomation.bnkinfo2,
      "@p_bankacnt2": infomation.bankacnt2,
      "@p_area": infomation.area,
      "@p_rowstatus_s": "",
      "@p_remark_s": "",
      "@p_custprsncd_s": "",
      "@p_prsnnm_s": "",
      "@p_dptnm_s": "",
      "@p_postcd_s": "",
      "@p_telno_s": "",
      "@p_phoneno_s": "",
      "@p_email_s": "",
      "@p_rtrchk_s": "",
      "@p_attdatnum_s": "",
      "@p_sort_seq_s": "",
      "@p_seq_s": "",
      "@p_yyyy_s": "",
      "@p_totasset_s": "",
      "@p_paid_up_capital_s": "",
      "@p_totcapital_s": "",
      "@p_salesmoney_s": "",
      "@p_operating_profits_s": "",
      "@p_current_income_s": "",
      "@p_dedt_rati_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0020W",
      "@p_company_code": "2207A046",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  // const onSaveClick = async () => {
  //   const dataItem = subDataResult.data.filter((item: any) => {
  //     return (
  //       (item.rowstatus === "N" || item.rowstatus === "U") &&
  //       item.rowstatus !== undefined
  //     );
  //   });

  //   let dataArr: TdataArr = {
  //     unpitem: [],
  //     rowstatus: [],
  //     itemcd: [],
  //     unp: [],
  //     itemacnt: [],
  //     remark: [],
  //     recdt: [],
  //     amtunit: [],
  //   };
  //   dataItem.forEach((item: any, idx: number) => {
  //     const {
  //       unpitem = "",
  //       rowstatus = "",
  //       itemcd = "",
  //       unp = "",
  //       itemacnt = "",
  //       remark = "",
  //       recdt = "",
  //       amtunit = "",
  //     } = item;

  //     dataArr.rowstatus.push(rowstatus);
  //     dataArr.unpitem.push(unpitem);
  //     dataArr.itemcd.push(Object.getOwnPropertyNames(selectedState)[0]);
  //     dataArr.unp.push(unp);
  //     dataArr.itemacnt.push(itemacnt);
  //     dataArr.remark.push(remark);
  //     dataArr.recdt.push(recdt);
  //     dataArr.amtunit.push(amtunit);
  //   });
  //   deletedTodoRows.forEach((item: any, idx: number) => {
  //     const {
  //       unpitem = "",
  //       rowstatus = "",
  //       itemcd = "",
  //       unp = "",
  //       itemacnt = "",
  //       remark = "",
  //       recdt = "",
  //       amtunit = "",
  //     } = item;
  //     dataArr.rowstatus.push("D");
  //     dataArr.unpitem.push(unpitem);
  //     dataArr.itemcd.push(Object.getOwnPropertyNames(selectedState)[0]);
  //     dataArr.unp.push(unp);
  //     dataArr.itemacnt.push(itemacnt);
  //     dataArr.remark.push(remark);
  //     dataArr.recdt.push(recdt);
  //     dataArr.amtunit.push(amtunit);
  //   });

  //   setParaData((prev) => ({
  //     ...prev,
  //     workType: "",
  //     orgdiv: "01",
  //     user_id: userId,
  //     form_id: "BA_A0040W",
  //     pc: pc,
  //     unpitem: dataArr.unpitem.join("|"),
  //     rowstatus: dataArr.rowstatus.join("|"),
  //     itemcd: dataArr.itemcd.join("|"),
  //     unp: dataArr.unp.join("|"),
  //     itemacnt: dataArr.itemacnt.join("|"),
  //     remark: dataArr.remark.join("|"),
  //     recdt: dataArr.recdt.join("|"),
  //     amtunit: dataArr.amtunit.join("|"),
  //   }));
  // };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.custcd = "";
  };

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;
    try {
      if (!infomation.custnm) {
        throw findMessage(messagesData, "BA_A0020W_001");
      }

      if (!infomation.custdiv) {
        throw findMessage(messagesData, "BA_A0020W_002");
      }

      if (!infomation.bizdiv) {
        throw findMessage(messagesData, "BA_A0020W_003");
      }

      if (!infomation.inunpitem) {
        throw findMessage(messagesData, "BA_A0020W_004");
      }

      if (!infomation.unpitem) {
        throw findMessage(messagesData, "BA_A0020W_005");
      }

      if (!infomation.rtxisuyn) {
        throw findMessage(messagesData, "BA_A0020W_006");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setMainPgNum(1);
      setMainDataResult(process([], mainDataState));

      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //   const fetchTodoGridSaved = async () => {
  //     let data: any;
  //     setLoading(true);
  //     try {
  //       data = await processApi<any>("procedure", para);
  //     } catch (error) {
  //       data = null;
  //     }

  //     if (data.isSuccess === true) {
  //       setSubPgNum(1);
  //       setSubDataResult(process([], subDataState));

  //       fetchSubGrid();
  //     } else {
  //       console.log("[오류 발생]");
  //       console.log(data);
  //     }
  //     setLoading(false);
  //   };

  //   useEffect(() => {
  //     if (paraData.itemcd != "") {
  //       fetchTodoGridSaved();
  //     }
  //   }, [paraData]);
  return (
    <>
      <TitleContainer>
        <Title>업체관리</Title>

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
              <th>업체구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="custdiv"
                    value={filters.custdiv}
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
                  <CustomOptionRadioGroup
                    name="raduseyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>대표자명</th>
              <td>
                <Input
                  name="ceonm"
                  type="text"
                  value={filters.ceonm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사업자등록번호</th>
              <td>
                <Input
                  name="bizregnum"
                  type="text"
                  value={filters.bizregnum}
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
            <ButtonContainer>
              <Button
                onClick={onAddClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="file-add"
              >
                업체생성
              </Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                품목삭제
              </Button>
              <Button
                onClick={onSaveClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "30vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                custdiv: custdivListData.find(
                  (item: any) => item.sub_code === row.custdiv
                )?.code_name,
                bizdiv: bizdivListData.find(
                  (item: any) => item.sub_code === row.bizdiv
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
            onScroll={onMainScrollHandler}
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
              footerCell={mainTotalFooterCell}
              width="140px"
            />
            <GridColumn field="custnm" title="업체명" width="200px" />
            <GridColumn field="custdiv" title="업체구분" width="140px" />
            <GridColumn field="bizdiv" title="사업자구분" width="120px" />
            <GridColumn field="ceonm" title="대표자명" width="100px" />
            <GridColumn
              field="bizregnum"
              title="사업자등록번호"
              width="180px"
            />
            <GridColumn field="address" title="주소" width="400px" />
            <GridColumn field="email" title="이메일" width="180px" />
            <GridColumn field="phonenum" title="전화번호" width="150px" />
            <GridColumn field="faxnum" title="팩스번호" width="150px" />
            <GridColumn
              field="raduseyn"
              title="사용여부"
              width="100px"
              cell={CheckBoxCell}
            />
            <GridColumn field="remark" title="비고" width="300px" />
          </Grid>
        </ExcelExport>
      </GridContainer>
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="상세정보">
          <FilterBoxWrap style={{ height: "40vh" }}>
            <FilterBox>
              <tbody>
                <tr>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={infomation.custcd}
                      className="readonly"
                    />
                  </td>
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={infomation.custnm}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>업체구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="custdiv"
                        value={infomation.custdiv}
                        bizComponentId="L_BA026"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField={"code_name"}
                        valueField={"code_name"}
                      />
                    )}
                  </td>
                  <th>업체약어</th>
                  <td>
                    <Input
                      name="custabbr"
                      type="text"
                      value={infomation.custabbr}
                      onChange={InputChange}
                    />
                  </td>
                  <th>사업자구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="bizdiv"
                        value={infomation.bizdiv}
                        bizComponentId="L_BA027"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField={"code_name"}
                        valueField={"code_name"}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>매입단가항목</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="inunpitem"
                        value={infomation.inunpitem}
                        bizComponentId="L_BA008"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>사업자등록번호</th>
                  <td>
                    <Input
                      name="bizregnum"
                      value={infomation.bizregnum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>우편번호</th>
                  <td>
                    <Input
                      name="zipcode"
                      type="number"
                      value={infomation.zipcode}
                      onChange={InputChange}
                    />
                  </td>
                  <th>지역</th>
                  <td>
                    <Input
                      name="area"
                      value={infomation.area}
                      onChange={InputChange}
                    />
                  </td>
                  <th>단가항목</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="unpitem"
                        value={infomation.unpitem}
                        bizComponentId="L_BA008"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>대표자명</th>
                  <td>
                    <Input
                      name="ceonm"
                      type="text"
                      value={infomation.ceonm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>주소</th>
                  <td>
                    <Input
                      name="address"
                      type="text"
                      value={infomation.address}
                      onChange={InputChange}
                    />
                  </td>
                  <th>영문회사명</th>
                  <td>
                    <Input
                      name="compnm_eng"
                      type="text"
                      value={infomation.compnm_eng}
                      onChange={InputChange}
                    />
                  </td>
                  <th>주민등록번호</th>
                  <td>
                    <Input
                      name="repreregno"
                      value={infomation.repreregno}
                      onChange={InputChange}
                    />
                  </td>
                  <th>영문주소</th>
                  <td>
                    <Input
                      name="address_eng"
                      type="text"
                      value={infomation.address_eng}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>개업년월일</th>
                  <td>
                    <DatePicker
                      name="estbdt"
                      value={infomation.estbdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                    />
                  </td>
                  <th>은행정보</th>
                  <td>
                    <Input
                      name="bnkinfo"
                      type="text"
                      value={infomation.bnkinfo}
                      onChange={InputChange}
                    />
                  </td>
                  <th>예금주</th>
                  <td>
                    <Input
                      name="bankacntuser"
                      type="text"
                      value={infomation.bankacntuser}
                      onChange={InputChange}
                    />
                  </td>
                  <th>업태</th>
                  <td>
                    <Input
                      name="compclass"
                      type="text"
                      value={infomation.compclass}
                      onChange={InputChange}
                    />
                  </td>
                  <th>전자팩스번호</th>
                  <td>
                    <Input
                      name="efaxnum"
                      type="text"
                      value={infomation.efaxnum}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>전자전화번호</th>
                  <td>
                    <Input
                      name="etelnum"
                      type="text"
                      value={infomation.etelnum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>전화번호</th>
                  <td>
                    <Input
                      name="phonenum"
                      type="text"
                      value={infomation.phonenum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>계좌번호</th>
                  <td>
                    <Input
                      name="bankacnt"
                      type="text"
                      value={infomation.bankacnt}
                      onChange={InputChange}
                    />
                  </td>
                  <th>업종</th>
                  <td>
                    <Input
                      name="comptype"
                      type="text"
                      value={infomation.comptype}
                      onChange={InputChange}
                    />
                  </td>
                  <th>이메일</th>
                  <td>
                    <Input
                      name="email"
                      type="text"
                      value={infomation.email}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>팩스번호</th>
                  <td>
                    <Input
                      name="faxnum"
                      type="text"
                      value={infomation.faxnum}
                      onChange={InputChange}
                    />
                  </td>
                  <th>은행정보2</th>
                  <td>
                    <Input
                      name="bnkinfo2"
                      type="text"
                      value={infomation.bnkinfo2}
                      onChange={InputChange}
                    />
                  </td>
                  <th>계좌번호2</th>
                  <td>
                    <Input
                      name="bankacnt2"
                      type="text"
                      value={infomation.bankacnt2}
                      onChange={InputChange}
                    />
                  </td>
                  <th>TAX구분</th>
                  <td>
                    <Input
                      name="etax"
                      type="text"
                      value={infomation.etax}
                      onChange={InputChange}
                    />
                  </td>
                  <th>역발행여부</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="rtxisuyn"
                        value={infomation.rtxisuyn}
                        bizComponentId="R_RTXISUYN"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>신고세무소</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="taxorg"
                        value={infomation.taxorg}
                        bizComponentId="L_BA049"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>신고세무소명</th>
                  <td>
                    <Input
                      name="taxortnm"
                      type="text"
                      value={infomation.taxortnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>대분류</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemlvl1"
                        value={infomation.itemlvl1}
                        bizComponentId="L_BA171"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>중분류</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemlvl2"
                        value={infomation.itemlvl2}
                        bizComponentId="L_BA172"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>소분류</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemlvl3"
                        value={infomation.itemlvl3}
                        bizComponentId="L_BA173"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>사용여부</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="useyn"
                        value={infomation.useyn}
                        bizComponentId="R_USEYN"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                  <th>SCM사용여부</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentRadioGroup
                        name="scmyn"
                        value={infomation.scmyn}
                        bizComponentId="R_USEYN"
                        bizComponentData={bizComponentData}
                        changeData={RadioChange}
                      />
                    )}
                  </td>
                  <th>정기/비정기</th>
                  <td>
                    <Input
                      name="pariodyn"
                      type="text"
                      value={infomation.pariodyn}
                      onChange={InputChange}
                    />
                  </td>
                  <th>비고</th>
                  <td>
                    <Input
                      name="remark"
                      type="text"
                      value={infomation.remark}
                      onChange={InputChange}
                    />
                  </td>
                  <th>첨부파일</th>
                  <td>
                    <Input
                      name="attdatnum"
                      type="text"
                      value={infomation.attdatnum}
                    />
                    <ButtonInInput>
                      <Button
                        type={"button"}
                        onClick={onAttachmentsWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                </tr>
                <tr>
                  <th>etax담당자</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="etxprs"
                        value={infomation.etxprs}
                        bizComponentId="L_sysUserMaster_001"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>etax전화번호</th>
                  <td>
                    <Input
                      name="phonenum_og"
                      type="text"
                      value={infomation.phonenum_og}
                      onChange={InputChange}
                    />
                  </td>
                  <th>etax이메일</th>
                  <td>
                    <Input
                      name="emailaddr_og"
                      type="text"
                      value={infomation.emailaddr_og}
                      onChange={InputChange}
                    />
                  </td>
                  <th>센드빌회원여부</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="bill_type"
                        value={infomation.bill_type}
                        bizComponentId="L_AC901"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterBoxWrap>
        </TabStripTab>
        {/* <TabStripTab title="단가">
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>단가정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="plus"
                ></Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                ></Button>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "26vh" }}
              data={process(
                subData2Result.data.map((row) => ({
                  ...row,
                  recdt: new Date(dateformat(row.recdt)),
                  [SELECTED_FIELD]: selectedsubData2State[idGetter2(row)],
                })),
                subData2State
              )}
              {...subData2State}
              onDataStateChange={onSubData2StateChange}
              //선택 기능
              dataItemKey={SUB_DATA_ITEM_KEY2}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "multiple",
              }}
              onSelectionChange={onSubData2SelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={subData2Result.total}
              onScroll={onSub2ScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onSubData2SortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              onItemChange={onSubItemChange}
              cellRender={customCellRender}
              rowRender={customRowRender}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field={SELECTED_FIELD}
                width="45px"
                headerSelectionValue={
                  subData2Result.data.findIndex(
                    (item: any) => !selectedsubData2State[idGetter2(item)]
                  ) === -1
                }
              />
              <GridColumn
                field="recdt"
                title="적용일"
                width="260px"
                cell={DateCell}
              />
              <GridColumn
                field="unpitem"
                title="단가항목"
                width="370px"
                cell={CustomComboBoxCell}
              />
              <GridColumn
                field="amtunit"
                title="화폐단위"
                width="200px"
                cell={CustomComboBoxCell}
              />
              <GridColumn
                field="itemacnt"
                title="품목계정"
                width="200px"
                cell={CustomComboBoxCell}
              />
              <GridColumn field="unp" title="단가" width="210px" />
              <GridColumn field="remark" title="비고" width="400px" />
            </Grid>
          </GridContainer>
        </TabStripTab> */}
      </TabStrip>
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          getVisible={setAttachmentsWindowVisible}
          getData={getAttachmentsData}
          para={infomation.attdatnum}
        />
      )}
    </>
  );
};

export default BA_A0020;
