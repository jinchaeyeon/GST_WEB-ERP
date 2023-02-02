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
import { FormReadOnly } from "../components/Editors";
import { filter } from "@progress/kendo-data-query/dist/npm/transducers";

const DATA_ITEM_KEY = "fxcode";
const SUB_DATA_ITEM_KEY = "num";
const SUB_DATA_ITEM_KEY2 = "num";
let deletedMainRows: any[] = [];
let deletedMainRows2: any[] = [];

const PR_A0060: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(SUB_DATA_ITEM_KEY2);
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
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR030,R_USEYN,L_dptcd_001,L_sysUserMaster_001,L_PR010,L_sysUserMaster_004",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

    useEffect(() => {
      if (bizComponentData !== null) {
        const dptcdQueryStr = getQueryFromBizComponent(
          bizComponentData.find(
            (item: any) => item.bizComponentId === "L_dptcd_001"
          )
        );
        const personQueryStr = getQueryFromBizComponent(
          bizComponentData.find(
            (item: any) => item.bizComponentId === "L_sysUserMaster_004"
          )
        );

        fetchQuery(dptcdQueryStr, setdptcdListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [subDataState2, setSubDataState2] = useState<State>({
    sort: [],
  });
  const [isInitSearch, setIsInitSearch] = useState(false);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subDataResult2, setSubDataResult2] = useState<DataResult>(
    process([], subDataState2)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState2, setSelectedsubDataState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSubPgNum] = useState(1);
  const [subPgNum2, setSubPgNum2] = useState(1);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [workType, setWorkType] = useState<string>("U");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

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
    orgdiv: "01",
    fxcode: "",
    fxdiv: "",
    location: "",
    recdt: new Date(),
    fxnum: "",
    fxnm: "",
    fxno: "",
    spec: "",
    dptcd: "",
    person: "",
    place: "",
    makedt: new Date(),
    maker: "",
    indt: new Date(),
    custcd: "",
    kind: "",
    amt: 0,
    uph: 0,
    classnm1: "",
    classnm2: "",
    classnm3: "",
    remark: "",
    useyn: "Y",
    attdatnum: "",
    proccd: "",
    IOT_TER_ID: 0,
    iotserialno: "",
    attdatnum_img: null,
    custnm: "",
    cnt: 0,
    files: "",
    availabletime: 0,
    viewyn: "",
    insert_form_id: "PR_A0060W",
    update_form_id: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    fxcode: "",
    fxnum: "",
    fxnm: "",
    fxno: "",
    raduseyn: "Y",
    custcd: "",
    custnm: "",
    maker: "",
    kind: "",
    classnm1: "",
    classnm2: "",
    classnm3: "",
    custdiv: "",
    position: "",
    location: "01",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_PR_A0060W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_fxcode": filters.fxcode,
      "@p_fxnum": filters.fxnum,
      "@p_fxnm": filters.fxnm,
      "@p_fxno": filters.fxno,
      "@p_useyn": filters.raduseyn,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_maker": filters.maker,
      "@p_kind": filters.kind,
      "@p_classnm1": filters.classnm1,
      "@p_classnm2": filters.classnm2,
      "@p_classnm3": filters.classnm3,
      "@p_position": filters.position,
    },
  };

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "CustPerson",
    custcd: infomation.custcd,
    custnm: "",
    custdiv: "",
    bizregnum: "",
    ceonm: "",
    useyn: "",
  });

  const [subfilters2, setsubFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "MONEY",
    custcd: infomation.custcd,
    custnm: "",
    custdiv: "",
    bizregnum: "",
    ceonm: "",
    useyn: "",
  });

  //조회조건 파라미터
  const subparameters: Iparameters = {
    procedureName: "P_BA_A0020W_Q",
    pageNumber: subPgNum,
    pageSize: subfilters.pgSize,
    parameters: {
      "@p_work_type": subfilters.workType,
      "@p_orgdiv": "01",
      "@p_useyn": subfilters.useyn,
      "@p_custcd": subfilters.custcd,
      "@p_custnm": subfilters.custnm,
      // "@p_custdiv":
      //   custdivListData.find(
      //     (item: any) => item.code_name === subfilters.custdiv
      //   )?.sub_code == undefined
      //     ? ""
      //     : custdivListData.find(
      //         (item: any) => item.code_name === subfilters.custdiv
      //       )?.sub_code,
      "@p_bizregnum": subfilters.bizregnum,
      "@p_ceonm": subfilters.ceonm,
      "@p_company_code": "2207A046",
      "@p_find_row_value": null,
    },
  };

  const subparameters2: Iparameters = {
    procedureName: "P_BA_A0020W_Q",
    pageNumber: subPgNum2,
    pageSize: subfilters2.pgSize,
    parameters: {
      "@p_work_type": subfilters2.workType,
      "@p_orgdiv": "01",
      "@p_useyn": subfilters2.useyn,
      "@p_custcd": subfilters2.custcd,
      "@p_custnm": subfilters2.custnm,
      // "@p_custdiv":
      //   custdivListData.find(
      //     (item: any) => item.code_name === subfilters2.custdiv
      //   )?.sub_code == undefined
      //     ? ""
      //     : custdivListData.find(
      //         (item: any) => item.code_name === subfilters2.custdiv
      //       )?.sub_code,
      "@p_bizregnum": subfilters2.bizregnum,
      "@p_ceonm": subfilters2.ceonm,
      "@p_company_code": "2207A046",
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

    console.log(parameters);
    console.log(data);
    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
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
  console.log(mainDataResult);
  const fetchSubGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
        inEdit: "recdt",
        rowstatus: "U",
      }));
      if (totalRowCnt > 0) {
        setSubDataResult((prev) => {
          return {
            data: [...prev.data, ...row],
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

  const fetchSubGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
        inEdit: "recdt",
        rowstatus: "U",
      }));
      if (totalRowCnt > 0) {
        setSubDataResult2((prev) => {
          return {
            data: [...prev.data, ...row],
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

  useEffect(() => {
    fetchSubGrid();
  }, [subPgNum]);

  useEffect(() => {
    fetchSubGrid2();
  }, [subPgNum2]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.fxcode]: true });

        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "U",
          orgdiv: firstRowData.orgdiv,
          fxcode: firstRowData.fxcode,
          fxdiv: firstRowData.fxdiv,
          location: firstRowData.location,
          recdt: new Date(dateformat(firstRowData.recdt)),
          fxnum: firstRowData.fxnum,
          fxnm: firstRowData.fxnm,
          fxno: firstRowData.fxno,
          spec: firstRowData.spec,
          dptcd: firstRowData.dptcd,
          person: firstRowData.person,
          place: firstRowData.place,
          makedt: new Date(dateformat(firstRowData.makedt)),
          maker: firstRowData.maker,
          indt: new Date(dateformat(firstRowData.indt)),
          custcd: firstRowData.custcd,
          kind: firstRowData.kind,
          amt: firstRowData.amt,
          uph: firstRowData.uph,
          classnm1: firstRowData.classnm1,
          classnm2: firstRowData.classnm2,
          classnm3: firstRowData.classnm3,
          remark: firstRowData.remark,
          useyn: firstRowData.useyn == "Y" ? "Y" : "N" ,
          attdatnum: firstRowData.attdatnum,
          proccd: firstRowData.proccd,
          IOT_TER_ID: firstRowData.IOT_TER_ID,
          iotserialno: firstRowData.iotserialno,
          attdatnum_img: firstRowData.attdatnum_img,
          custnm: firstRowData.custnm,
          cnt: firstRowData.cnt,
          files: firstRowData.files,
          availabletime: firstRowData.availabletime,
          viewyn: firstRowData.viewyn == "Y" ? "Y" : "N" ,
          insert_form_id: "PR_A0060W",
          update_form_id: "",
        });

        //   setsubFilters((prev) => ({
        //     ...prev,
        //     workType: "CustPerson",
        //     useyn: firstRowData.useyn,
        //     custcd: firstRowData.custcd,
        //     custnm:  firstRowData.custnm,
        //     custdiv:  firstRowData.custdiv,
        //     bizregnum:  firstRowData.bizregnum,
        //     ceonm:  firstRowData.ceonm,
        //   }));

        //   setsubFilters2((prev) => ({
        //     ...prev,
        //     workType: "MONEY",
        //     useyn:  firstRowData.useyn,
        //     custcd:  firstRowData.custcd,
        //     custnm:  firstRowData.custnm,
        //     custdiv:  firstRowData.custdiv,
        //     bizregnum:  firstRowData.bizregnum,
        //     ceonm:  firstRowData.ceonm,
        //   }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (ifSelectFirstRow) {
      if (subDataResult.total > 0) {
        const firstRowData = subDataResult.data[0];
        // setSelectedsubDataState({ [firstRowData.num]: true });

        // setIfSelectFirstRow(true);
      }
    }
  }, [subDataResult]);

  useEffect(() => {
    if (ifSelectFirstRow) {
      if (subDataResult2.total > 0) {
        const firstRowData = subDataResult2.data[0];
        // setSelectedsubDataState({ [firstRowData.num]: true });

        // setIfSelectFirstRow(true);
      }
    }
  }, [subDataResult2]);

  useEffect(() => {
    setSubPgNum(1);
    setSubDataResult(process([], subDataState));
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subfilters]);

  useEffect(() => {
    setSubPgNum2(1);
    setSubDataResult2(process([], subDataState2));
    if (customOptionData !== null) {
      fetchSubGrid2();
    }
  }, [subfilters2]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subPgNum]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid2();
    }
  }, [subPgNum2]);

  useEffect(() => {
    if (customOptionData !== null) {
      if (tabSelected == 1) {
        fetchSubGrid();
      } else if (tabSelected == 2) {
        fetchSubGrid2();
      }
    }
  }, [tabSelected]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    setSubPgNum(1);
    setSubDataResult(process([], subDataState));
    setSubPgNum2(1);
    setSubDataResult2(process([], subDataState2));
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
      orgdiv: selectedRowData.orgdiv,
      fxcode: selectedRowData.fxcode,
      fxdiv: selectedRowData.fxdiv,
      location: selectedRowData.location,
      recdt: new Date(dateformat(selectedRowData.recdt)),
      fxnum: selectedRowData.fxnum,
      fxnm: selectedRowData.fxnm,
      fxno: selectedRowData.fxno,
      spec: selectedRowData.spec,
      dptcd: selectedRowData.dptcd,
      person: selectedRowData.person,
      place: selectedRowData.place,
      makedt: new Date(dateformat(selectedRowData.makedt)),
      maker: selectedRowData.maker,
      indt: new Date(dateformat(selectedRowData.indt)),
      custcd: selectedRowData.custcd,
      kind: selectedRowData.kind,
      amt: selectedRowData.amt,
      uph: selectedRowData.uph,
      classnm1: selectedRowData.classnm1,
      classnm2: selectedRowData.classnm2,
      classnm3: selectedRowData.classnm3,
      remark: selectedRowData.remark,
      useyn: selectedRowData.useyn == "Y" ? "Y" : "N" ,
      attdatnum: selectedRowData.attdatnum,
      proccd: selectedRowData.proccd,
      IOT_TER_ID: selectedRowData.IOT_TER_ID,
      iotserialno: selectedRowData.iotserialno,
      attdatnum_img: selectedRowData.attdatnum_img,
      custnm: selectedRowData.custnm,
      cnt: selectedRowData.cnt,
      files: selectedRowData.files,
      availabletime: selectedRowData.availabletime,
      viewyn: selectedRowData.viewyn == "Y" ? "Y" : "N" ,
      insert_form_id: "PR_A0060W",
      update_form_id: "",
    });

    // if(tabSelected == 1){
    //   setsubFilters((prev) => ({
    //     ...prev,
    //     workType: "CustPerson",
    //     useyn: selectedRowData.useyn,
    //     custcd: selectedRowData.custcd,
    //     custnm: selectedRowData.custnm,
    //     custdiv: selectedRowData.custdiv,
    //     bizregnum: selectedRowData.bizregnum,
    //     ceonm: selectedRowData.ceonm,
    //   }));
    // } else if(tabSelected == 2){
    //   setsubFilters2((prev) => ({
    //     ...prev,
    //     workType: "MONEY",
    //     useyn: selectedRowData.useyn,
    //     custcd: selectedRowData.custcd,
    //     custnm: selectedRowData.custnm,
    //     custdiv: selectedRowData.custdiv,
    //     bizregnum: selectedRowData.bizregnum,
    //     ceonm: selectedRowData.ceonm,
    //   }));
    // }
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });
    setSelectedsubDataState(newSelectedState);
  };

  const onSubDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY2,
    });
    setSelectedsubDataState2(newSelectedState);
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

  const onSubScrollHandler2 = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum2, PAGE_SIZE))
      setSubPgNum2((prev) => prev + 1);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const onSubDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setSubDataState2(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    subDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {sum}
      </td>
    );
  };
  const onAddClick2 = () => {
    setWorkType("N");
    setInfomation({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: "01",
        fxcode: "",
        fxdiv: "",
        location: "",
        recdt: new Date(),
        fxnum: "",
        fxnm: "",
        fxno: "",
        spec: "",
        dptcd: "",
        person: "",
        place: "",
        makedt: new Date(),
        maker: "",
        indt: new Date(),
        custcd: "",
        kind: "",
        amt: 0,
        uph: 0,
        classnm1: "",
        classnm2: "",
        classnm3: "",
        remark: "",
        useyn: "Y",
        attdatnum: "",
        proccd: "",
        IOT_TER_ID: 0,
        iotserialno: "",
        attdatnum_img: null,
        custnm: "",
        cnt: 0,
        files: "",
        availabletime: 0,
        viewyn: "",
        insert_form_id: "PR_A0060W",
        update_form_id: "",
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
      attdatnum: "",
      custcd: infomation.custcd,
      custprsncd: "",
      dptnm: "",
      email: "",
      files: "",
      insert_form_id: "",
      insert_pc: "",
      insert_time: "",
      insert_userid: "",
      phoneno: "",
      prsnnm: "",
      remark: "",
      rtrchk: "N",
      sort_seq: 0,
      telno: "",
      update_form_id: "BA_A0020",
      update_pc: "",
      update_time: "",
      update_userid: "",
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

  const onAddClick3 = () => {
    let seq = 1;

    if (subDataResult2.total > 0) {
      subDataResult2.data.forEach((item) => {
        if (item[SUB_DATA_ITEM_KEY2] > seq) {
          seq = item[SUB_DATA_ITEM_KEY2];
        }
      });
      seq++;
    }

    const newDataItem = {
      [SUB_DATA_ITEM_KEY2]: seq,
      custcd: infomation.custcd,
      current_income: 0,
      dedt_ratio: 0,
      operating_profits: 0,
      paid_up_capital: 0,
      ramark: "",
      salesmoney: 0,
      seq: 0,
      totasset: 0,
      totcapital: 0,
      yyyy: "",
      rowstatus: "N",
    };

    setSubDataResult2((prev) => {
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

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    // setSubPgNum(1);
    // setSubDataResult(process([], subDataState));
    // setSubPgNum2(1);
    // setSubDataResult2(process([], subDataState2));
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const [attachmentsWindowVisible2, setAttachmentsWindowVisible2] =
    useState<boolean>(false);

  const getAttachmentsData2 = (data: IAttachmentData) => {
    const datas = subDataResult.data.map((item: any) =>
      item.num == rows
        ? {
            ...item,
            attdatnum: data.attdatnum,
            files:
              data.original_name +
              (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
          }
        : { ...item }
    );

    setSubDataResult((prev) => {
      return {
        data: datas,
        total: prev.total,
      };
    });
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
    rowstatus: string[];
    remark_s: string[];
    custprsncd_s: string[];
    prsnnm_s: string[];
    dptnm: string[];
    postcd_s: string[];
    telno: string[];
    phoneno_s: string[];
    email_s: string[];
    rtrchk_s: string[];
    attdatnum_s: string[];
    sort_seq_s: string[];
  };

  type TdataArr2 = {
    rowstatus: string[];
    remark_s: string[];
    seq_s: string[];
    yyyy_s: string[];
    totasset_s: string[];
    paid_up_capital_s: string[];
    totcaptial_s: string[];
    salesmoney_s: string[];
    operating_profits_s: string[];
    current_income_s: string[];
    dedt_rati_s: string[];
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

//   const onSubDataSortChange = (e: any) => {
//     setSubDataState((prev) => ({ ...prev, sort: e.sort }));
//   };

//   const onSubDataSortChange2 = (e: any) => {
//     setSubDataState2((prev) => ({ ...prev, sort: e.sort }));
//   };

  const search = () => {
    // setSubPgNum(1);
    // setSubDataResult(process([], subDataState));
    // setSubPgNum2(1);
    // setSubDataResult2(process([], subDataState2));
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    fetchMainGrid();
    // fetchSubGrid();
    // fetchSubGrid2();
  };

  //   const onSubItemChange = (event: GridItemChangeEvent) => {
  //     getGridItemChangedData(
  //       event,
  //       subDataResult,
  //       setSubDataResult,
  //       SUB_DATA_ITEM_KEY
  //     );
  //   };

  //   const onSubItemChange2 = (event: GridItemChangeEvent) => {
  //     getGridItemChangedData(
  //       event,
  //       subDataResult2,
  //       setSubDataResult2,
  //       SUB_DATA_ITEM_KEY2
  //     );
  //   };

  //   const enterEdit = (dataItem: any, field: string) => {
  //     const newData = subDataResult.data.map((item) =>
  //       item[SUB_DATA_ITEM_KEY] === dataItem[SUB_DATA_ITEM_KEY]
  //         ? {
  //             ...item,
  //             rowstatus: item.rowstatus === "N" ? "N" : "U",
  //             [EDIT_FIELD]: field,
  //           }
  //         : {
  //             ...item,
  //             [EDIT_FIELD]: undefined,
  //           }
  //     );

  //     setSubDataResult((prev) => {
  //       return {
  //         data: newData,
  //         total: prev.total,
  //       };
  //     });
  //   };

  //   const enterEdit2 = (dataItem: any, field: string) => {
  //     const newData = subDataResult2.data.map((item) =>
  //       item[SUB_DATA_ITEM_KEY2] === dataItem[SUB_DATA_ITEM_KEY2]
  //         ? {
  //             ...item,
  //             rowstatus: item.rowstatus === "N" ? "N" : "U",
  //             [EDIT_FIELD]: field,
  //           }
  //         : {
  //             ...item,
  //             [EDIT_FIELD]: undefined,
  //           }
  //     );

  //     setSubDataResult2((prev) => {
  //       return {
  //         data: newData,
  //         total: prev.total,
  //       };
  //     });
  //   };

  //   const exitEdit = () => {
  //     const newData = subDataResult.data.map((item) => ({
  //       ...item,
  //       [EDIT_FIELD]: undefined,
  //     }));

  //     setSubDataResult((prev) => {
  //       return {
  //         data: newData,
  //         total: prev.total,
  //       };
  //     });
  //   };

  //   const exitEdit2 = () => {
  //     const newData = subDataResult2.data.map((item) => ({
  //       ...item,
  //       [EDIT_FIELD]: undefined,
  //     }));

  //     setSubDataResult2((prev) => {
  //       return {
  //         data: newData,
  //         total: prev.total,
  //       };
  //     });
  //   };

  //   const customCellRender = (td: any, props: any) => (
  //     <CellRender
  //       originalProps={props}
  //       td={td}
  //       enterEdit={enterEdit}
  //       editField={EDIT_FIELD}
  //     />
  //   );

  //   const customCellRender2 = (td: any, props: any) => (
  //     <CellRender
  //       originalProps={props}
  //       td={td}
  //       enterEdit={enterEdit2}
  //       editField={EDIT_FIELD}
  //     />
  //   );

  //   const customRowRender = (tr: any, props: any) => (
  //     <RowRender
  //       originalProps={props}
  //       tr={tr}
  //       exitEdit={exitEdit}
  //       editField={EDIT_FIELD}
  //     />
  //   );

  //   const customRowRender2 = (tr: any, props: any) => (
  //     <RowRender
  //       originalProps={props}
  //       tr={tr}
  //       exitEdit={exitEdit2}
  //       editField={EDIT_FIELD}
  //     />
  //   );

    const [paraDataDeleted, setParaDataDeleted] = useState({
      work_type: "",
      fxcode: "",
    });

  //   const onDeleteClick = (e: any) => {
  //     let newData: any[] = [];

  //     subDataResult.data.forEach((item: any, index: number) => {
  //       if (!selectedsubDataState[item[SUB_DATA_ITEM_KEY]]) {
  //         newData.push(item);
  //       } else {
  //         const newData2 = {
  //           ...item,
  //           rowstatus: "D",
  //         };
  //         deletedMainRows.push(newData2);
  //       }
  //     });
  //     setSubDataResult((prev) => ({
  //       data: newData,
  //       total: newData.length,
  //     }));

  //     setSubDataState({});
  //   };

  //   const onDeleteClick3 = (e: any) => {
  //     let newData: any[] = [];

  //     subDataResult2.data.forEach((item: any, index: number) => {
  //       if (!selectedsubDataState2[item[SUB_DATA_ITEM_KEY2]]) {
  //         newData.push(item);
  //       } else {
  //         const newData2 = {
  //           ...item,
  //           rowstatus: "D",
  //         };
  //         deletedMainRows2.push(newData2);
  //       }
  //     });
  //     setSubDataResult2((prev) => ({
  //       data: newData,
  //       total: newData.length,
  //     }));

  //     setSubDataState2({});
  //   };

    const onDeleteClick2 = (e: any) => {
      const item = Object.getOwnPropertyNames(selectedState)[0];
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        fxcode: item,
      }));
    };

  //   const [paraData, setParaData] = useState({
  //     workType: "CustPerson",
  //     orgdiv: "01",
  //     custcd: "",
  //     custnm: "",
  //     custdiv: "",
  //     custabbr: "",
  //     bizdiv: "",
  //     bizregnum: "",
  //     ceonm: "",
  //     repreregno: "",
  //     comptype: "",
  //     compclass: "",
  //     zipcode: 0,
  //     address: "",
  //     phonenum: "",
  //     faxnum: "",
  //     estbdt: new Date(),
  //     compnm_eng: "",
  //     address_eng: "",
  //     bnkinfo: "",
  //     etelnum: "",
  //     efaxnum: "",
  //     unpitem: "",
  //     useyn: "",
  //     remark: "",
  //     attdatnum: "",
  //     bill_type: "",
  //     recvid: "",
  //     rtxisuyn: "",
  //     etxprs: "",
  //     emailaddr_og: "",
  //     phonenum_og: "",
  //     etax: "",
  //     inunpitem: "",
  //     email: "",
  //     itemlvl1: "",
  //     itemlvl2: "",
  //     itemlvl3: "",
  //     bankacnt: "",
  //     bankacntuser: "",
  //     scmyn: "",
  //     pariodyn: "",
  //     bnkinfo2: "",
  //     bankacnt2: "",
  //     area: "",
  //     rowstatus: "",
  //     remark_s: "",
  //     custprsncd_s: "",
  //     prsnnm_s: "",
  //     dptnm: "",
  //     postcd_s: "",
  //     telno: "",
  //     phoneno_s: "",
  //     email_s: "",
  //     rtrchk_s: "",
  //     attdatnum_s: "",
  //     sort_seq_s: "",
  //     seq_s: "",
  //     yyyy_s: "",
  //     totasset_s: "",
  //     paid_up_capital_s: "",
  //     totcapital_s: "",
  //     salesmoney_s: "",
  //     operating_profits_s: "",
  //     current_income_s: "",
  //     dedt_rati_s: "",
  //     user_id: userId,
  //     pc: pc,
  //     form_id: "BA_A0020W",
  //     company_code: "2207A046",
  //   });

  //   const para: Iparameters = {
  //     procedureName: "P_BA_A0020W_S",
  //     pageNumber: 0,
  //     pageSize: 0,
  //     parameters: {
  //       "@p_work_type": paraData.workType,
  //       "@p_orgdiv": "01",
  //       "@p_location": "01",
  //       "@p_auto": "N",
  //       "@p_custcd": paraData.custcd,
  //       "@p_custnm": paraData.custnm,
  //       "@p_custdiv":
  //         custdivListData.find(
  //           (item: any) => item.code_name === infomation.custdiv
  //         )?.sub_code == undefined
  //           ? ""
  //           : custdivListData.find(
  //               (item: any) => item.code_name === infomation.custdiv
  //             )?.sub_code,
  //       "@p_custabbr": paraData.custabbr,
  //       "@p_bizdiv":
  //         bizdivListData.find((item: any) => item.code_name === infomation.bizdiv)
  //           ?.sub_code == undefined
  //           ? ""
  //           : bizdivListData.find(
  //               (item: any) => item.code_name === infomation.bizdiv
  //             )?.sub_code,
  //       "@p_bizregnum": paraData.bizregnum,
  //       "@p_ceonm": paraData.ceonm,
  //       "@p_repreregno": paraData.repreregno,
  //       "@p_comptype": paraData.comptype,
  //       "@p_compclass": paraData.compclass,
  //       "@p_zipcode": paraData.zipcode,
  //       "@p_address": paraData.address,
  //       "@p_phonenum": paraData.phonenum,
  //       "@p_faxnum": paraData.faxnum,
  //       "@p_estbdt": convertDateToStr(paraData.estbdt),
  //       "@p_compnm_eng": paraData.compnm_eng,
  //       "@p_address_eng": paraData.address_eng,
  //       "@p_bnkinfo": paraData.bnkinfo,
  //       "@p_etelnum": paraData.etelnum,
  //       "@p_efaxnum": paraData.efaxnum,
  //       "@p_unpitem": paraData.unpitem,
  //       "@p_useyn": paraData.useyn,
  //       "@p_remark": paraData.remark,
  //       "@p_attdatnum": paraData.attdatnum,
  //       "@p_bill_type": paraData.bill_type,
  //       "@p_recvid": paraData.recvid,
  //       "@p_rtxisuyn": paraData.rtxisuyn,
  //       "@p_etxprs": paraData.etxprs,
  //       "@p_emailaddr_og": paraData.emailaddr_og,
  //       "@p_phonenum_og": paraData.phonenum_og,
  //       "@p_etax": paraData.etax,
  //       "@p_inunpitem": paraData.inunpitem,
  //       "@p_email": paraData.email,
  //       "@p_itemlvl1": paraData.itemlvl1,
  //       "@p_itemlvl2": paraData.itemlvl2,
  //       "@p_itemlvl3": paraData.itemlvl3,
  //       "@p_bankacnt": paraData.bankacnt,
  //       "@p_bankacntuser": paraData.bankacntuser,
  //       "@p_scmyn": paraData.scmyn,
  //       "@p_periodyn": paraData.pariodyn == undefined ? "" : paraData.pariodyn,
  //       "@p_bnkinfo2": paraData.bnkinfo2,
  //       "@p_bankacnt2": paraData.bankacnt2,
  //       "@p_area": paraData.area,
  //       "@p_rowstatus_s": paraData.rowstatus,
  //       "@p_remark_s": paraData.remark_s,
  //       "@p_custprsncd_s": paraData.custprsncd_s,
  //       "@p_prsnnm_s": paraData.prsnnm_s,
  //       "@p_dptnm_s": paraData.dptnm,
  //       "@p_postcd_s": paraData.postcd_s,
  //       "@p_telno_s": paraData.telno,
  //       "@p_phoneno_s": paraData.phoneno_s,
  //       "@p_email_s": paraData.email_s,
  //       "@p_rtrchk_s": paraData.rtrchk_s,
  //       "@p_attdatnum_s": paraData.attdatnum_s,
  //       "@p_sort_seq_s": paraData.sort_seq_s,
  //       "@p_seq_s": paraData.seq_s,
  //       "@p_yyyy_s": paraData.yyyy_s,
  //       "@p_totasset_s": paraData.totasset_s,
  //       "@p_paid_up_capital_s": paraData.paid_up_capital_s,
  //       "@p_totcapital_s": paraData.totcapital_s,
  //       "@p_salesmoney_s": paraData.salesmoney_s,
  //       "@p_operating_profits_s": paraData.operating_profits_s,
  //       "@p_current_income_s": paraData.current_income_s,
  //       "@p_dedt_rati_s": paraData.dedt_rati_s,
  //       "@p_userid": userId,
  //       "@p_pc": pc,
  //       "@p_form_id": "BA_A0020W",
  //       "@p_company_code": "2207A046",
  //     },
  //   };

    const paraDeleted: Iparameters = {
      procedureName: "P_PR_A0060W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraDataDeleted.work_type,
        "@p_orgdiv": "01",
        "@p_location": "01",
        "@p_fxcode": paraDataDeleted.fxcode,
        "@p_recdt": convertDateToStr(infomation.recdt),
        "@p_fxnum": infomation.fxnum,
        "@p_fxnm": infomation.fxnm,
        "@p_fxno": infomation.fxno,
        "@p_spec": infomation.spec,
        "@p_dptcd": dptcdListData.find(
          (item: any) => item.dptnm === infomation.dptcd
        )?.dptcd == undefined ? "" : dptcdListData.find(
          (item: any) => item.dptnm === infomation.dptcd
        )?.dptcd,
        "@p_person": personListData.find(
          (item: any) => item.user_name === infomation.person
        )?.user_id == undefined ? "" : personListData.find(
          (item: any) => item.user_name === infomation.person
        )?.user_id,
        "@p_place": infomation.place,
        "@p_makedt": convertDateToStr(infomation.makedt),
        "@p_maker": infomation.maker,
        "@p_indt": convertDateToStr(infomation.indt),
        "@p_custcd": infomation.custcd,
        "@p_amt": infomation.amt,
        "@p_remark": infomation.remark,
        "@p_attdatnum_img": null,
        "@p_viewyn" : infomation.viewyn,
        "@p_useyn": infomation.useyn,
        "@p_attdatnum": infomation.attdatnum,
        "@p_kind": infomation.kind,
        "@p_uph": infomation.uph,
        "@p_IOT_TER_ID": infomation.IOT_TER_ID,
        "@p_iotserialno": infomation.iotserialno,
        "@p_classnm1": infomation.classnm1,
        "@p_classnm2": infomation.classnm2,
        "@p_classnm3": infomation.classnm3,
        "@p_fxdiv": infomation.fxdiv,
        "@p_proccd": infomation.proccd,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_pgmdiv": "F",
        "@p_position": "",
        "@p_form_id": 'PR_A0060W',
        "@p_availabletime": 2,
        "@p_rowstatus_s":'',
        "@p_fxseq_s": '',
        "@p_fxdt_s":'',
        "@p_custcd_s":'',
        "@p_custnm_s":'',
        "@p_errtext_s":'',
        "@p_protext_s":'',
        "@p_fxcost_s":'',
        "@p_remark1_s":'',
        "@p_attdatnum_s":'',
        "@p_stdtime_s":'',
        "@p_company_code": "2207A046"
      },
    };

    const infopara: Iparameters = {
      procedureName: "P_PR_A0060W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": infomation.workType,
        "@p_orgdiv": "01",
        "@p_location": "01",
        "@p_fxcode": infomation.fxcode,
        "@p_recdt": convertDateToStr(infomation.recdt),
        "@p_fxnum": infomation.fxnum,
        "@p_fxnm": infomation.fxnm,
        "@p_fxno": infomation.fxno,
        "@p_spec": infomation.spec,
        "@p_dptcd": dptcdListData.find(
          (item: any) => item.dptnm === infomation.dptcd
        )?.dptcd == undefined ? "" : dptcdListData.find(
          (item: any) => item.dptnm === infomation.dptcd
        )?.dptcd,
        "@p_person": personListData.find(
          (item: any) => item.user_name === infomation.person
        )?.user_id == undefined ? "" : personListData.find(
          (item: any) => item.user_name === infomation.person
        )?.user_id,
        "@p_place": infomation.place,
        "@p_makedt": convertDateToStr(infomation.makedt),
        "@p_maker": infomation.maker,
        "@p_indt": convertDateToStr(infomation.indt),
        "@p_custcd": infomation.custcd,
        "@p_amt": infomation.amt,
        "@p_remark": infomation.remark,
        "@p_attdatnum_img": null,
        "@p_viewyn" : infomation.viewyn,
        "@p_useyn": infomation.useyn,
        "@p_attdatnum": infomation.attdatnum,
        "@p_kind": infomation.kind,
        "@p_uph": infomation.uph,
        "@p_IOT_TER_ID": infomation.IOT_TER_ID,
        "@p_iotserialno": infomation.iotserialno,
        "@p_classnm1": infomation.classnm1,
        "@p_classnm2": infomation.classnm2,
        "@p_classnm3": infomation.classnm3,
        "@p_fxdiv": infomation.fxdiv,
        "@p_proccd": infomation.proccd,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_pgmdiv": "F",
        "@p_position": "",
        "@p_form_id": 'PR_A0060W',
        "@p_availabletime": 2,
        "@p_rowstatus_s":'',
        "@p_fxseq_s": '',
        "@p_fxdt_s":'',
        "@p_custcd_s":'',
        "@p_custnm_s":'',
        "@p_errtext_s":'',
        "@p_protext_s":'',
        "@p_fxcost_s":'',
        "@p_remark1_s":'',
        "@p_attdatnum_s":'',
        "@p_stdtime_s":'',
        "@p_company_code": "2207A046"
      },
    };

    useEffect(() => {
      if (paraDataDeleted.work_type === "D") fetchToDelete();
    }, [paraDataDeleted]);

  //   const onSaveClick = async () => {
  //     const dataItem = subDataResult.data.filter((item: any) => {
  //       return (
  //         (item.rowstatus === "N" || item.rowstatus === "U") &&
  //         item.rowstatus !== undefined
  //       );
  //     });

  //     if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
  //     let dataArr: TdataArr = {
  //       rowstatus: [],
  //       remark_s: [],
  //       custprsncd_s: [],
  //       prsnnm_s: [],
  //       dptnm: [],
  //       postcd_s: [],
  //       telno: [],
  //       phoneno_s: [],
  //       email_s: [],
  //       rtrchk_s: [],
  //       attdatnum_s: [],
  //       sort_seq_s: [],
  //     };
  //     dataItem.forEach((item: any, idx: number) => {
  //       const {
  //         rowstatus = "",
  //         remark = "",
  //         custprsncd = "",
  //         custprsncd_s = "",
  //         prsnnm = "",
  //         prsnnm_s = "",
  //         dptnm = "",
  //         postcd_s = "",
  //         telno = "",
  //         phoneno = "",
  //         email = "",
  //         rtrchk = "",
  //         attdatnum = "",
  //         sort_seq = "",
  //       } = item;

  //       dataArr.rowstatus.push(rowstatus);
  //       dataArr.remark_s.push(remark);
  //       dataArr.custprsncd_s.push(custprsncd);
  //       dataArr.prsnnm_s.push(prsnnm);
  //       dataArr.dptnm.push(dptnm);
  //       dataArr.postcd_s.push(postcd_s);
  //       dataArr.telno.push(telno);
  //       dataArr.phoneno_s.push(phoneno);
  //       dataArr.email_s.push(email);
  //       dataArr.rtrchk_s.push(rtrchk == true || rtrchk == "Y" ? "Y" : "N");
  //       dataArr.attdatnum_s.push(attdatnum);
  //       dataArr.sort_seq_s.push(sort_seq);
  //     });
  //     deletedMainRows.forEach(async (item: any, idx: number) => {
  //       const paraD: Iparameters = {
  //         procedureName: "P_BA_A0020W_S",
  //         pageNumber: 0,
  //         pageSize: 0,
  //         parameters: {
  //           "@p_work_type": "CustPerson",
  //           "@p_orgdiv": "01",
  //           "@p_location": "01",
  //           "@p_auto": "N",
  //           "@p_custcd": infomation.custcd,
  //           "@p_custnm": infomation.custnm,
  //           "@p_custdiv": infomation.custdiv,
  //           "@p_custabbr": infomation.custabbr,
  //           "@p_bizdiv": infomation.bizdiv,
  //           "@p_bizregnum": infomation.bizregnum,
  //           "@p_ceonm": infomation.ceonm,
  //           "@p_repreregno": infomation.repreregno,
  //           "@p_comptype": infomation.comptype,
  //           "@p_compclass": infomation.compclass,
  //           "@p_zipcode": infomation.zipcode,
  //           "@p_address": infomation.address,
  //           "@p_phonenum": infomation.phonenum,
  //           "@p_faxnum": infomation.faxnum,
  //           "@p_estbdt": convertDateToStr(infomation.estbdt),
  //           "@p_compnm_eng": infomation.compnm_eng,
  //           "@p_address_eng": infomation.address_eng,
  //           "@p_bnkinfo": infomation.bnkinfo,
  //           "@p_etelnum": infomation.etelnum,
  //           "@p_efaxnum": infomation.efaxnum,
  //           "@p_unpitem": infomation.unpitem,
  //           "@p_useyn": infomation.useyn,
  //           "@p_remark": infomation.remark,
  //           "@p_attdatnum": infomation.attdatnum,
  //           "@p_bill_type": infomation.bill_type,
  //           "@p_recvid": infomation.recvid,
  //           "@p_rtxisuyn": infomation.rtxisuyn,
  //           "@p_etxprs": infomation.etxprs,
  //           "@p_emailaddr_og": infomation.emailaddr_og,
  //           "@p_phonenum_og": infomation.phonenum_og,
  //           "@p_etax": infomation.etax,
  //           "@p_inunpitem": infomation.inunpitem,
  //           "@p_email": infomation.email,
  //           "@p_itemlvl1": infomation.itemlvl1,
  //           "@p_itemlvl2": infomation.itemlvl2,
  //           "@p_itemlvl3": infomation.itemlvl3,
  //           "@p_bankacnt": infomation.bankacnt,
  //           "@p_bankacntuser": infomation.bankacntuser,
  //           "@p_scmyn": infomation.scmyn,
  //           "@p_periodyn":
  //             infomation.pariodyn == undefined ? "" : infomation.pariodyn,
  //           "@p_bnkinfo2": infomation.bnkinfo2,
  //           "@p_bankacnt2": infomation.bankacnt2,
  //           "@p_area": infomation.area,
  //           "@p_rowstatus_s": item.rowstatus,
  //           "@p_remark_s": item.remark,
  //           "@p_custprsncd_s": item.custprsncd,
  //           "@p_prsnnm_s": item.prsnnm,
  //           "@p_dptnm_s": item.dptnm,
  //           "@p_postcd_s": "",
  //           "@p_telno_s": item.telno,
  //           "@p_phoneno_s": item.phoneno,
  //           "@p_email_s": item.email,
  //           "@p_rtrchk_s": item.rtrchk == true || item.rtrchk == "Y" ? "Y" : "N",
  //           "@p_attdatnum_s": item.attdatnum,
  //           "@p_sort_seq_s": item.sort_seq,
  //           "@p_seq_s": "",
  //           "@p_yyyy_s": "",
  //           "@p_totasset_s": "",
  //           "@p_paid_up_capital_s": "",
  //           "@p_totcapital_s": "",
  //           "@p_salesmoney_s": "",
  //           "@p_operating_profits_s": "",
  //           "@p_current_income_s": "",
  //           "@p_dedt_rati_s": "",
  //           "@p_userid": userId,
  //           "@p_pc": pc,
  //           "@p_form_id": "BA_A0020W",
  //           "@p_company_code": "2207A046",
  //         },
  //       };
  //       let data: any;

  //       try {
  //         data = await processApi<any>("procedure", paraD);
  //       } catch (error) {
  //         data = null;
  //       }

  //       if (data.isSuccess !== true) {
  //         console.log("[오류 발생]");
  //         console.log(data);
  //       }
  //     });
  //     deletedMainRows = [];
  //     const item = Object.getOwnPropertyNames(selectedState)[0];

  //     setParaData((prev) => ({
  //       ...prev,
  //       workType: "CustPerson",
  //       custcd: item.toString(),
  //       custnm: infomation.custnm,
  //       custdiv: infomation.custdiv,
  //       custabbr: infomation.custabbr,
  //       bizdiv: infomation.bizdiv,
  //       bizregnum: infomation.bizregnum,
  //       ceonm: infomation.ceonm,
  //       repreregno: infomation.repreregno,
  //       comptype: infomation.comptype,
  //       compclass: infomation.compclass,
  //       zipcode: infomation.zipcode,
  //       address: infomation.address,
  //       phonenum: infomation.phonenum,
  //       faxnum: infomation.faxnum,
  //       estbdt: infomation.estbdt,
  //       compnm_eng: infomation.compnm_eng,
  //       address_eng: infomation.address_eng,
  //       bnkinfo: infomation.bnkinfo,
  //       etelnum: infomation.etelnum,
  //       efaxnum: infomation.efaxnum,
  //       unpitem: infomation.unpitem,
  //       useyn: infomation.useyn,
  //       remark: infomation.remark,
  //       attdatnum: infomation.attdatnum,
  //       bill_type: infomation.bill_type,
  //       recvid: infomation.recvid,
  //       rtxisuyn: infomation.rtxisuyn,
  //       etxprs: infomation.etxprs,
  //       emailaddr_og: infomation.emailaddr_og,
  //       phonenum_og: infomation.phonenum_og,
  //       etax: infomation.etax,
  //       inunpitem: infomation.inunpitem,
  //       email: infomation.email,
  //       itemlvl1: infomation.itemlvl1,
  //       itemlvl2: infomation.itemlvl2,
  //       itemlvl3: infomation.itemlvl3,
  //       bankacnt: infomation.bankacnt,
  //       bankacntuser: infomation.bankacntuser,
  //       scmyn: infomation.scmyn,
  //       pariodyn: infomation.pariodyn,
  //       bnkinfo2: infomation.bnkinfo2,
  //       bankacnt2: infomation.bankacnt2,
  //       area: infomation.area,
  //       remark_s: dataArr.remark_s.join("|"),
  //       rowstatus: dataArr.rowstatus.join("|"),
  //       prsnnm_s: dataArr.prsnnm_s.join("|"),
  //       custprsncd_s: dataArr.custprsncd_s.join("|"),
  //       dptnm: dataArr.dptnm.join("|"),
  //       postcd_s: dataArr.postcd_s.join("|"),
  //       telno: dataArr.telno.join("|"),
  //       phoneno_s: dataArr.phoneno_s.join("|"),
  //       email_s: dataArr.email_s.join("|"),
  //       rtrchk_s: dataArr.rtrchk_s.join("|"),
  //       attdatnum_s: dataArr.attdatnum_s.join("|"),
  //       sort_seq_s: dataArr.sort_seq_s.join("|"),
  //       seq_s: "",
  //       yyyy_s:"",
  //       totasset_s: "",
  //       paid_up_capital_s: "",
  //       totcapital_s:"",
  //       salesmoney_s:"",
  //       operating_profits_s:"",
  //       current_income_s:"",
  //       dedt_rati_s: "",
  //     }));
  //   };

  //   const onSaveClick3 = async () => {
  //     const dataItem = subDataResult2.data.filter((item: any) => {
  //       return (
  //         (item.rowstatus === "N" || item.rowstatus === "U") &&
  //         item.rowstatus !== undefined
  //       );
  //     });

  //     if (dataItem.length === 0 && deletedMainRows2.length === 0) return false;
  //     let dataArr: TdataArr2 = {
  //       rowstatus: [],
  //       remark_s: [],
  //       seq_s: [],
  //       yyyy_s: [],
  //       totasset_s: [],
  //       paid_up_capital_s: [],
  //       totcaptial_s: [],
  //       salesmoney_s: [],
  //       operating_profits_s: [],
  //       current_income_s: [],
  //       dedt_rati_s: [],
  //     };
  //     dataItem.forEach((item: any, idx: number) => {
  //       const {
  //         rowstatus = "",
  //         remark = "",
  //         current_income=0,
  //         dedt_ratio=0,
  //         operating_profits = 0,
  //         paid_up_capital =0,
  //         salesmoney =0,
  //         seq=0,
  //         totasset=0,
  //         totcapital=0,
  //         yyyy=""
  //       } = item;

  //       dataArr.rowstatus.push(rowstatus);
  //       dataArr.remark_s.push(remark);
  //       dataArr.seq_s.push(seq);
  //       dataArr.yyyy_s.push(yyyy);
  //       dataArr.totasset_s.push(totasset);
  //       dataArr.paid_up_capital_s.push(paid_up_capital);
  //       dataArr.totcaptial_s.push(totcapital);
  //       dataArr.salesmoney_s.push(salesmoney);
  //       dataArr.operating_profits_s.push(operating_profits);
  //       dataArr.current_income_s.push(current_income);
  //       dataArr.dedt_rati_s.push(dedt_ratio);
  //     });
  //     deletedMainRows2.forEach(async (item: any, idx: number) => {
  //       const paraD: Iparameters = {
  //         procedureName: "P_BA_A0020W_S",
  //         pageNumber: 0,
  //         pageSize: 0,
  //         parameters: {
  //           "@p_work_type": "MONEY",
  //           "@p_orgdiv": "01",
  //           "@p_location": "01",
  //           "@p_auto": "N",
  //           "@p_custcd": infomation.custcd,
  //           "@p_custnm": infomation.custnm,
  //           "@p_custdiv": infomation.custdiv,
  //           "@p_custabbr": infomation.custabbr,
  //           "@p_bizdiv": infomation.bizdiv,
  //           "@p_bizregnum": infomation.bizregnum,
  //           "@p_ceonm": infomation.ceonm,
  //           "@p_repreregno": infomation.repreregno,
  //           "@p_comptype": infomation.comptype,
  //           "@p_compclass": infomation.compclass,
  //           "@p_zipcode": infomation.zipcode,
  //           "@p_address": infomation.address,
  //           "@p_phonenum": infomation.phonenum,
  //           "@p_faxnum": infomation.faxnum,
  //           "@p_estbdt": convertDateToStr(infomation.estbdt),
  //           "@p_compnm_eng": infomation.compnm_eng,
  //           "@p_address_eng": infomation.address_eng,
  //           "@p_bnkinfo": infomation.bnkinfo,
  //           "@p_etelnum": infomation.etelnum,
  //           "@p_efaxnum": infomation.efaxnum,
  //           "@p_unpitem": infomation.unpitem,
  //           "@p_useyn": infomation.useyn,
  //           "@p_remark": infomation.remark,
  //           "@p_attdatnum": infomation.attdatnum,
  //           "@p_bill_type": infomation.bill_type,
  //           "@p_recvid": infomation.recvid,
  //           "@p_rtxisuyn": infomation.rtxisuyn,
  //           "@p_etxprs": infomation.etxprs,
  //           "@p_emailaddr_og": infomation.emailaddr_og,
  //           "@p_phonenum_og": infomation.phonenum_og,
  //           "@p_etax": infomation.etax,
  //           "@p_inunpitem": infomation.inunpitem,
  //           "@p_email": infomation.email,
  //           "@p_itemlvl1": infomation.itemlvl1,
  //           "@p_itemlvl2": infomation.itemlvl2,
  //           "@p_itemlvl3": infomation.itemlvl3,
  //           "@p_bankacnt": infomation.bankacnt,
  //           "@p_bankacntuser": infomation.bankacntuser,
  //           "@p_scmyn": infomation.scmyn,
  //           "@p_periodyn":
  //             infomation.pariodyn == undefined ? "" : infomation.pariodyn,
  //           "@p_bnkinfo2": infomation.bnkinfo2,
  //           "@p_bankacnt2": infomation.bankacnt2,
  //           "@p_area": infomation.area,
  //           "@p_rowstatus_s": item.rowstatus,
  //           "@p_remark_s": item.remark,
  //           "@p_custprsncd_s": "",
  //           "@p_prsnnm_s": "",
  //           "@p_dptnm_s": "",
  //           "@p_postcd_s": "",
  //           "@p_telno_s": "",
  //           "@p_phoneno_s": "",
  //           "@p_email_s": "",
  //           "@p_rtrchk_s": "",
  //           "@p_attdatnum_s": "",
  //           "@p_sort_seq_s": "",
  //           "@p_seq_s": item.seq,
  //           "@p_yyyy_s": item.yyyy,
  //           "@p_totasset_s":  item.totasset,
  //           "@p_paid_up_capital_s":  item.paid_up_capital,
  //           "@p_totcapital_s":  item.totcapital,
  //           "@p_salesmoney_s":  item.salesmoney,
  //           "@p_operating_profits_s":  item.operating_profits,
  //           "@p_current_income_s":  item.current_income,
  //           "@p_dedt_rati_s":  item.dedt_ratio,
  //           "@p_userid": userId,
  //           "@p_pc": pc,
  //           "@p_form_id": "BA_A0020W",
  //           "@p_company_code": "2207A046",
  //         },
  //       };
  //       let data: any;

  //       try {
  //         data = await processApi<any>("procedure", paraD);
  //       } catch (error) {
  //         data = null;
  //       }

  //       if (data.isSuccess !== true) {
  //         console.log("[오류 발생]");
  //         console.log(data);
  //       }
  //     });
  //     deletedMainRows2 = [];
  //     const item = Object.getOwnPropertyNames(selectedState)[0];

  //     setParaData((prev) => ({
  //       ...prev,
  //       workType: "MONEY",
  //       custcd: item.toString(),
  //       custnm: infomation.custnm,
  //       custdiv: infomation.custdiv,
  //       custabbr: infomation.custabbr,
  //       bizdiv: infomation.bizdiv,
  //       bizregnum: infomation.bizregnum,
  //       ceonm: infomation.ceonm,
  //       repreregno: infomation.repreregno,
  //       comptype: infomation.comptype,
  //       compclass: infomation.compclass,
  //       zipcode: infomation.zipcode,
  //       address: infomation.address,
  //       phonenum: infomation.phonenum,
  //       faxnum: infomation.faxnum,
  //       estbdt: infomation.estbdt,
  //       compnm_eng: infomation.compnm_eng,
  //       address_eng: infomation.address_eng,
  //       bnkinfo: infomation.bnkinfo,
  //       etelnum: infomation.etelnum,
  //       efaxnum: infomation.efaxnum,
  //       unpitem: infomation.unpitem,
  //       useyn: infomation.useyn,
  //       remark: infomation.remark,
  //       attdatnum: infomation.attdatnum,
  //       bill_type: infomation.bill_type,
  //       recvid: infomation.recvid,
  //       rtxisuyn: infomation.rtxisuyn,
  //       etxprs: infomation.etxprs,
  //       emailaddr_og: infomation.emailaddr_og,
  //       phonenum_og: infomation.phonenum_og,
  //       etax: infomation.etax,
  //       inunpitem: infomation.inunpitem,
  //       email: infomation.email,
  //       itemlvl1: infomation.itemlvl1,
  //       itemlvl2: infomation.itemlvl2,
  //       itemlvl3: infomation.itemlvl3,
  //       bankacnt: infomation.bankacnt,
  //       bankacntuser: infomation.bankacntuser,
  //       scmyn: infomation.scmyn,
  //       pariodyn: infomation.pariodyn,
  //       bnkinfo2: infomation.bnkinfo2,
  //       bankacnt2: infomation.bankacnt2,
  //       area: infomation.area,
  //       remark_s: dataArr.remark_s.join("|"),
  //       rowstatus: dataArr.rowstatus.join("|"),
  //       prsnnm_s: "",
  //       custprsncd_s: "",
  //       dptnm: "",
  //       postcd_s: "",
  //       telno: "",
  //       phoneno_s:  "",
  //       email_s:  "",
  //       rtrchk_s:  "",
  //       attdatnum_s:  "",
  //       sort_seq_s: "",
  //       seq_s: dataArr.seq_s.join("|"),
  //       yyyy_s:dataArr.yyyy_s.join("|"),
  //       totasset_s: dataArr.totasset_s.join("|"),
  //       paid_up_capital_s: dataArr.paid_up_capital_s.join("|"),
  //       totcapital_s:dataArr.totcaptial_s.join("|"),
  //       salesmoney_s:dataArr.salesmoney_s.join("|"),
  //       operating_profits_s: dataArr.operating_profits_s.join("|"),
  //       current_income_s:dataArr.current_income_s.join("|"),
  //       dedt_rati_s: dataArr.dedt_rati_s.join("|"),
  //     }));
  //   };

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
      paraDataDeleted.fxcode = "";
    };

    const onSaveClick2 = async () => {
      fetchSaved();
    };

    const fetchSaved = async () => {
      let data: any;

      let valid = true;
      try {
        if (!infomation.fxnum) {
          throw findMessage(messagesData, "PR_A0060W_001");
        }

        if (!infomation.fxnm) {
          throw findMessage(messagesData, "PR_A0060W_002");
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

    // const fetchTodoGridSaved = async () => {
    //   let data: any;
    //   setLoading(true);
    //   try {
    //     data = await processApi<any>("procedure", para);
    //   } catch (error) {
    //     data = null;
    //   }

    //   if (data.isSuccess === true) {
    //     setSubPgNum(1);
    //     setSubDataResult(process([], subDataState));

    //     fetchSubGrid();
    //   } else {
    //     console.log("[오류 발생]");
    //     console.log(data);
    //   }
    //   setLoading(false);
    // };

  //   useEffect(() => {
  //     if (paraData.custcd != "") {
  //       fetchTodoGridSaved();
  //     }
  //   }, [paraData]);
  const [rows, setrows] = useState<number>(0);
  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSubDataState({ [rowData[SUB_DATA_ITEM_KEY]]: true });
      setrows(rowData.num);
      setAttachmentsWindowVisible2(true);
    };

    return (
      <>
        {props.rowType === "groupHeader" ? null : (
          <td className="k-command-cell">
            <Button
              type={"button"}
              onClick={onEditClick}
              icon="more-horizontal"
              fillMode="flat"
            />
          </td>
        )}
      </>
    );
  };

  return (
    <>
      <TitleContainer>
        <Title>설비관리</Title>

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
              <th>설비번호</th>
              <td>
                <Input
                  name="fxnum"
                  type="text"
                  value={filters.fxnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비명</th>
              <td>
                <Input
                  name="fxnm"
                  type="text"
                  value={filters.fxnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비호기</th>
              <td>
                <Input
                  name="fxno"
                  type="text"
                  value={filters.fxno}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비종류</th>
              <td>
                <Input
                  name="kind"
                  type="text"
                  value={filters.kind}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>제조사</th>
              <td>
                <Input
                  name="maker"
                  type="text"
                  value={filters.maker}
                  onChange={filterInputChange}
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
            </tr>
            <tr>
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
              <th>이더넷</th>
              <td>
                <Input
                  name="classnm1"
                  type="text"
                  value={filters.classnm1}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류2</th>
              <td>
                <Input
                  name="classnm2"
                  type="text"
                  value={filters.classnm2}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류3</th>
              <td>
                <Input
                  name="classnm3"
                  type="text"
                  value={filters.classnm3}
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
                설비생성
              </Button>
              <Button
                onClick={onDeleteClick2}
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
            style={{ height: "35vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                dptcd: dptcdListData.find(
                  (item: any) => item.dptcd === row.dptcd
                )?.dptnm,
                person: personListData.find(
                  (item: any) => item.user_id === row.person
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
              field="fxnum"
              title="설비번호"
              footerCell={mainTotalFooterCell}
              width="140px"
            />
            <GridColumn field="fxnm" title="설비명" width="200px" />
            <GridColumn field="fxno" title="설비호기" width="140px" />
            <GridColumn field="spec" title="사양" width="120px" />
            <GridColumn field="dptcd" title="담당부서" width="100px" />
            <GridColumn field="person" title="책임자" width="180px" />
            <GridColumn field="place" title="장소" width="400px" />
            <GridColumn
              field="recdt"
              title="입력일자"
              width="180px"
              cell={DateCell}
            />
            <GridColumn
              field="makedt"
              title="제조일자"
              width="150px"
              cell={DateCell}
            />
            <GridColumn field="maker" title="제조사" width="150px" />
            <GridColumn
              field="indt"
              title="구입일자"
              width="100px"
              cell={DateCell}
            />
            <GridColumn field="custnm" title="업체명" width="300px" />
            <GridColumn field="kind" title="설비종류" width="150px" />
            <GridColumn field="classnm1" title="이더넷1" width="150px" />
            <GridColumn field="classnm2" title="분류2" width="100px" />
            <GridColumn field="classnm3" title="분류3" width="300px" />
            <GridColumn
              field="uph"
              title="시간당생산수량"
              width="300px"
              cell={NumberCell}
            />
            <GridColumn
              field="cnt"
              title="설비이력"
              width="150px"
              cell={NumberCell}
            />
            <GridColumn
              field="useyn"
              title="사용여부"
              width="150px"
              cell={CheckBoxCell}
            />
            <GridColumn
              field="IOT_TER_ID"
              title="IOT설비번호"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn field="iotserialno" title="IOT I/F No" width="300px" />
          </Grid>
        </ExcelExport>
      </GridContainer>
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="설비정보">
          <FilterBoxWrap style={{ height: "30vh" }}>
            <FilterBox>
              <tbody>
                <tr>
                  <th>설비번호</th>
                  <td>
                    <Input
                      name="fxnum"
                      type="text"
                      value={infomation.fxnum}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>설비명</th>
                  <td>
                    <Input
                      name="fxnm"
                      type="text"
                      value={infomation.fxnm}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>설비호기</th>
                  <td>
                    <Input
                      name="fxno"
                      type="text"
                      value={infomation.fxno}
                      onChange={InputChange}
                    />
                  </td>
                  <th>설비코드</th>
                  <td>
                    <Input
                      name="fxcode"
                      type="text"
                      value={infomation.fxcode}
                      onChange={InputChange}
                      className="readonly"
                    />
                  </td>
                  <th>설비구분</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="fxdiv"
                        value={infomation.fxdiv}
                        bizComponentId="L_PR030"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>가용시간</th>
                  <td>
                    <Input
                      name="uph"
                      type="number"
                      value={infomation.uph}
                      onChange={InputChange}
                    />
                  </td>
                  <th>사양</th>
                  <td>
                    <Input
                      name="spec"
                      value={infomation.spec}
                      onChange={InputChange}
                    />
                  </td>
                  <th>시간당생산수량</th>
                  <td>
                    <Input
                      name="uph"
                      type="number"
                      value={infomation.uph}
                      onChange={InputChange}
                    />
                  </td>
                  <th>입력일자</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={infomation.recdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                    />
                  </td>
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
                </tr>
                <tr>
                  <th>설비종류</th>
                  <td>
                    <Input
                      name="kind"
                      type="text"
                      value={infomation.kind}
                      onChange={InputChange}
                    />
                  </td>
                  <th>담당부서</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="dptcd"
                        value={infomation.dptcd}
                        bizComponentId="L_dptcd_001"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField="dptnm"
                        valueField="dptnm"
                      />
                    )}
                  </td>
                  <th>책임자</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="person"
                        value={infomation.person}
                        bizComponentId="L_sysUserMaster_001"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                        textField="user_name"
                        valueField="user_name"
                      />
                    )}
                  </td>
                  <th>장소</th>
                  <td>
                    <Input
                      name="place"
                      type="text"
                      value={infomation.place}
                      onChange={InputChange}
                    />
                  </td>
                  <th>IOT설비번호</th>
                  <td>
                    <Input
                      name="IOT_TER_ID"
                      type="number"
                      value={infomation.IOT_TER_ID}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>제조일자</th>
                  <td>
                    <DatePicker
                      name="makedt"
                      value={infomation.makedt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                    />
                  </td>
                  <th>제조사</th>
                  <td>
                    <Input
                      name="maker"
                      type="text"
                      value={infomation.maker}
                      onChange={InputChange}
                    />
                  </td>
                  <th>이더넷1</th>
                  <td>
                    <Input
                      name="classnm1"
                      type="text"
                      value={infomation.classnm1}
                      onChange={InputChange}
                    />
                  </td>
                  <th>분류2</th>
                  <td>
                    <Input
                      name="classnm2"
                      type="text"
                      value={infomation.classnm2}
                      onChange={InputChange}
                    />
                  </td>
                  <th>분류3</th>
                  <td>
                    <Input
                      name="classnm3"
                      type="text"
                      value={infomation.classnm3}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>업체코드</th>
                  <td>
                    <Input
                      name="custcd"
                      type="text"
                      value={infomation.custcd}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick2}
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
                      value={infomation.custnm}
                      onChange={InputChange}
                    />
                  </td>
                  <th>구입일자</th>
                  <td>
                    <DatePicker
                      name="indt"
                      value={infomation.indt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                    />
                  </td>
                  <th>구입금액</th>
                  <td>
                    <Input
                      name="amt"
                      type="number"
                      value={infomation.amt}
                      onChange={InputChange}
                    />
                  </td>
                  <th>IOT I/F No</th>
                  <td>
                    <Input
                      name="iotserialno"
                      type="text"
                      value={infomation.iotserialno}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>소속공정</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="proccd"
                        value={infomation.proccd}
                        bizComponentId="L_PR010"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
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
                      onChange={InputChange}
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
              </tbody>
            </FilterBox>
          </FilterBoxWrap>
        </TabStripTab>
        {/* <TabStripTab title="업체담당자">
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>업체담당자</GridTitle>
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
              style={{ height: "34vh" }}
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
                mode: "multiple",
              }}
              onSelectionChange={onSubDataSelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={subDataResult.total}
              onScroll={onSubScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onSubDataSortChange}
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
                  subDataResult.data.findIndex(
                    (item: any) => !selectedsubDataState[idGetter2(item)]
                  ) === -1
                }
              />
              <GridColumn
                field="sort_seq"
                title="정렬순서"
                width="80px"
                cell={NumberCell}
              />
              <GridColumn
                field="custprsncd"
                title="업체담당자"
                width="150px"
                editable={false}
              />
              <GridColumn field="prsnnm" title="성명" width="150px" />
              <GridColumn field="dptnm" title="부서명" width="200px" />
              <GridColumn field="telno" title="전화번호" width="150px" />
              <GridColumn field="phoneno" title="휴대폰번호" width="180px" />
              <GridColumn field="email" title="이메일" width="200px" />
              <GridColumn field="remark" title="비고" width="290px" />
              <GridColumn
                field="rtrchk"
                title="퇴사"
                width="80px"
                cell={CheckBoxCell}
              />
              <GridColumn
                field="attdatnum"
                title="첨부파일"
                width="160px"
                cell={CommandCell}
              />
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="재무현황">
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>재무현황</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick3}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="plus"
                ></Button>
                <Button
                  onClick={onDeleteClick3}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                ></Button>
                <Button
                  onClick={onSaveClick3}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "34vh" }}
              data={process(
                subDataResult2.data.map((row) => ({
                  ...row,
                  [SELECTED_FIELD]: selectedsubDataState2[idGetter3(row)],
                })),
                subDataState2
              )}
              {...subDataState2}
              onDataStateChange={onSubDataStateChange2}
              //선택 기능
              dataItemKey={SUB_DATA_ITEM_KEY2}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "multiple",
              }}
              onSelectionChange={onSubDataSelectionChange2}
              //스크롤 조회 기능
              fixedScroll={true}
              total={subDataResult2.total}
              onScroll={onSubScrollHandler2}
              //정렬기능
              sortable={true}
              onSortChange={onSubDataSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              onItemChange={onSubItemChange2}
              cellRender={customCellRender2}
              rowRender={customRowRender2}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field={SELECTED_FIELD}
                width="45px"
                headerSelectionValue={
                  subDataResult.data.findIndex(
                    (item: any) => !selectedsubDataState[idGetter2(item)]
                  ) === -1
                }
              />
              <GridColumn field="yyyy" title="결산년도" width="150px"/>
              <GridColumn
                field="totasset"
                title="총자산"
                width="160px"
                cell={NumberCell}
                footerCell={gridSumQtyFooterCell}
              />
              <GridColumn
                field="paid_up_capital"
                title="납입자본"
                width="160px"
                cell={NumberCell}
                footerCell={gridSumQtyFooterCell}
              />
              <GridColumn
                field="totcapital"
                title="자본총계"
                width="160px"
                cell={NumberCell}
                footerCell={gridSumQtyFooterCell}
              />
              <GridColumn
                field="salesmoney"
                title="매출액"
                width="200px"
                cell={NumberCell}
                footerCell={gridSumQtyFooterCell}
              />
              <GridColumn
                field="operating_profits"
                title="영업이익"
                width="200px"
                cell={NumberCell}
                footerCell={gridSumQtyFooterCell}
              />
              <GridColumn
                field="current_income"
                title="당기순이익"
                width="160px"
                cell={NumberCell}
                footerCell={gridSumQtyFooterCell}
              />
              <GridColumn
                field="dedt_ratio"
                title="부채비율"
                width="160px"
                cell={NumberCell}
                footerCell={gridSumQtyFooterCell}
              />
              <GridColumn field="remark" title="비고" width="290px" />
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
      {attachmentsWindowVisible2 && (
        <AttachmentsWindow
          getVisible={setAttachmentsWindowVisible2}
          getData={getAttachmentsData2}
          para={subDataResult.data[rows - 1].attdatnum}
        />
      )}
    </>
  );
};

export default PR_A0060;
