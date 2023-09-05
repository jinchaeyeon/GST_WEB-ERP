import React, { useCallback, useEffect, useState, useRef } from "react";
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
import { Window } from "@progress/kendo-react-dialogs";
import { Calendar, DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import DaliyReport from "../components/Prints/DaliyReport";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
  GridContainerWrap,
  FormBoxWrap,
  FormBox,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
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
  UseParaPc,
  useSysMessage,
  findMessage,
  UseMessages,
} from "../components/CommonFunction";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, unsavedAttadatnumsState } from "../store/atoms";
import { gridList } from "../store/columns/CM_A1000W_C";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import { IAttachmentData } from "../hooks/interfaces";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";

const checkField = ["finyn", "planyn"];
const centerField = ["usetime"];

const DATA_ITEM_KEY = "num";
const CM_A1000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  const [previewVisible, setPreviewVisible] = React.useState<boolean>(false);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  UseParaPc(setPc);
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
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
        kind1: defaultOption.find((item: any) => item.id === "kind1").valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
        planyn: defaultOption.find((item: any) => item.id === "planyn")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA400, L_USERS",
    //대분류, 품목계정, 수량단위, 내수구분, 중분류, 소분류, 입고구분, 담당자, 화폐단위, 도/사
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [usersListData, setUsersListData] = useState([{ code: "", name: "" }]);
  const [kindListData, setKindListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_USERS")
      );
      const kindQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA400")
      );

      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(kindQueryStr, setKindListData);
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [workType, setWorkType] = useState<"N" | "U">("N");
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == undefined) {
      setWorkType("N");
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        frdt: value,
        todt: value,
        isSearch: true,
        pgNum: 1,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "custcd") {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setInfomation((prev) => ({
        ...prev,
        custcd: value,
        custnm:
          value == ""
            ? ""
            : defaultOption
                .find((item: any) => item.id === "custnm")
                .Rows.filter((item: { custcd: any }) => item.custcd == value)[0]
                .custnm,
      }));
    } else {
      setInfomation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name == "custnm") {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setInfomation((prev) => ({
        ...prev,
        custcd:
          value == ""
            ? ""
            : defaultOption
                .find((item: any) => item.id === "custnm")
                .Rows.filter((item: { custnm: any }) => item.custnm == value)[0]
                .custcd,
        custnm: value,
      }));
    } else if (name == "strhh") {
      const date1 = new Date(2023, 5, 17, value, parseInt(infomation.strmm), 0);
      const date2 = new Date(
        2023,
        5,
        17,
        parseInt(infomation.endhh),
        parseInt(infomation.endmm),
        0
      );

      var elapsedMSec = date2.getTime() - date1.getTime();
      var elapsedMin = elapsedMSec / 1000 / 60;

      setInfomation((prev) => ({
        ...prev,
        [name]: value,
        usehh: Math.abs(elapsedMin / 60) < 1 ? 0 : Math.floor(elapsedMin / 60),
        usemm: elapsedMin % 60,
      }));
    } else if (name == "strmm") {
      const date1 = new Date(2023, 5, 17, parseInt(infomation.strhh), value, 0);
      const date2 = new Date(
        2023,
        5,
        17,
        parseInt(infomation.endhh),
        parseInt(infomation.endmm),
        0
      );

      var elapsedMSec = date2.getTime() - date1.getTime();
      var elapsedMin = elapsedMSec / 1000 / 60;

      setInfomation((prev) => ({
        ...prev,
        [name]: value,
        usehh: Math.abs(elapsedMin / 60) < 1 ? 0 : Math.floor(elapsedMin / 60),
        usemm: elapsedMin % 60,
      }));
    } else if (name == "endhh") {
      const date1 = new Date(
        2023,
        5,
        17,
        parseInt(infomation.strhh),
        parseInt(infomation.strmm),
        0
      );
      const date2 = new Date(2023, 5, 17, value, parseInt(infomation.endmm), 0);

      var elapsedMSec = date2.getTime() - date1.getTime();
      var elapsedMin = elapsedMSec / 1000 / 60;

      setInfomation((prev) => ({
        ...prev,
        [name]: value,
        usehh: Math.abs(elapsedMin / 60) < 1 ? 0 : Math.floor(elapsedMin / 60),
        usemm: elapsedMin % 60,
      }));
    } else if (name == "endmm") {
      const date1 = new Date(
        2023,
        5,
        17,
        parseInt(infomation.strhh),
        parseInt(infomation.strmm),
        0
      );
      const date2 = new Date(2023, 5, 17, parseInt(infomation.endhh), value, 0);

      var elapsedMSec = date2.getTime() - date1.getTime();
      var elapsedMin = elapsedMSec / 1000 / 60;

      setInfomation((prev) => ({
        ...prev,
        [name]: value,
        usehh: Math.abs(elapsedMin / 60) < 1 ? 0 : Math.floor(elapsedMin / 60),
        usemm: elapsedMin % 60,
      }));
    } else {
      setInfomation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    datnum: "",
    title: "",
    kind1: "",
    planyn: "",
    person: "",
    yyyymm: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [infomation, setInfomation] = useState({
    amt: 0,
    attdatnum: "",
    contents: "",
    custcd: "",
    custnm: "",
    custperson: "",
    datnum: "",
    enddt: filters.todt,
    endhh: "00",
    endmm: "00",
    endtime: "",
    exphh: 0,
    expmm: 0,
    files: "",
    finyn: false,
    insert_user_id: "",
    key_id: "",
    kind1: "",
    kind2: "",
    opengb: "",
    person: "",
    pgmid: "",
    pgmnm: "",
    planyn: false,
    project: "",
    ref_key: "",
    strdt: filters.todt,
    strhh: "00",
    strmm: "00",
    strtime: "",
    title: "",
    usehh: 0,
    usemm: 0,
    usetime: "",
    total_usetime: "",
    memo: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_CM_A1000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "list",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_datnum": filters.datnum,
      "@p_title": filters.title,
      "@p_kind1": filters.kind1,
      "@p_planyn": filters.planyn,
      "@p_person": filters.person,
      "@p_user_id": userId,
      "@p_yyyymm": convertDateToStr(filters.todt).substring(0, 6),
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const memoparameters: Iparameters = {
    procedureName: "P_CM_A1000W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "monthly",
      "@p_orgdiv": filters.orgdiv,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_datnum": filters.datnum,
      "@p_title": filters.title,
      "@p_kind1": filters.kind1,
      "@p_planyn": filters.planyn,
      "@p_person": filters.person,
      "@p_user_id": userId,
      "@p_yyyymm": convertDateToStr(filters.todt).substring(0, 6),
      "@p_find_row_value": filters.find_row_value,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    fetchMemoGrid();
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
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
          const row = data.tables[1].Rows[0];
          setWorkType("U");
          setInfomation((prev) => ({
            ...prev,
            amt: firstRowData.amt,
            attdatnum: firstRowData.attdatnum,
            contents: firstRowData.contents,
            custcd: firstRowData.custcd,
            custnm: firstRowData.custnm,
            custperson: firstRowData.custperson,
            datnum: firstRowData.datnum,
            enddt: toDate(firstRowData.enddt),
            endhh: firstRowData.endhh,
            endmm: firstRowData.endmm,
            endtime: firstRowData.endtime,
            exphh: firstRowData.exphh,
            expmm: firstRowData.expmm,
            files: firstRowData.files,
            finyn: firstRowData.finyn == "Y" ? true : false,
            insert_user_id: firstRowData.insert_user_id,
            key_id: firstRowData.key_id,
            kind1: firstRowData.kind1,
            kind2: firstRowData.kind2,
            opengb: firstRowData.opengb,
            person: firstRowData.person,
            pgmid: firstRowData.pgmid,
            pgmnm: firstRowData.pgmnm,
            planyn: firstRowData.planyn == "Y" ? true : false,
            project: firstRowData.project,
            ref_key: firstRowData.ref_key,
            strdt: toDate(firstRowData.strdt),
            strhh: firstRowData.strhh,
            strmm: firstRowData.strmm,
            strtime: firstRowData.strtime,
            title: firstRowData.title,
            usehh: parseInt(firstRowData.usehh),
            usemm: parseInt(firstRowData.usemm),
            usetime: firstRowData.usetime,
            total_usetime: row.total_usetime,
          }));
        }
      } else {
        setWorkType("N");
        setInfomation((prev) => ({
          ...prev,
          amt: 0,
          attdatnum: "",
          contents: "",
          custcd: "",
          custnm: "",
          custperson: "",
          datnum: "",
          enddt: filters.todt,
          endhh: "00",
          endmm: "00",
          endtime: "",
          exphh: 0,
          expmm: 0,
          files: "",
          finyn: false,
          insert_user_id: "",
          key_id: "",
          kind1: "",
          kind2: "",
          opengb: "",
          person: "",
          pgmid: "",
          pgmnm: "",
          planyn: false,
          project: "",
          ref_key: "",
          strdt: filters.todt,
          strhh: "00",
          strmm: "00",
          strtime: "",
          title: "",
          usehh: 0,
          usemm: 0,
          usetime: "",
          total_usetime: "",
        }));
      }
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMemoGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", memoparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      if (data.tables[0].Rows.length > 0) {
        const rows = data.tables[0].Rows;

        const firstRowData = rows[0];

        setInfomation((prev) => ({
          ...prev,
          memo: firstRowData.contents,
        }));
      } else {
        setInfomation((prev) => ({
          ...prev,
          memo: "",
        }));
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
        총 {mainDataResult.total}건
      </td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        <div style={{ textAlign: "center" }}>{infomation.total_usetime}</div>
      </td>
    );
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setWorkType("U");
    setSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    const kind = kindListData.find(
      (item: any) => item.code_name == selectedRowData.kind1
    )?.sub_code;
    setInfomation((prev) => ({
      ...prev,
      amt: selectedRowData.amt,
      attdatnum: selectedRowData.attdatnum,
      contents: selectedRowData.contents,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custperson: selectedRowData.custperson,
      datnum: selectedRowData.datnum,
      enddt: toDate(selectedRowData.enddt),
      endhh: selectedRowData.endhh,
      endmm: selectedRowData.endmm,
      endtime: selectedRowData.endtime,
      exphh: selectedRowData.exphh,
      expmm: selectedRowData.expmm,
      files: selectedRowData.files,
      finyn: selectedRowData.finyn == "Y" ? true : false,
      insert_user_id: selectedRowData.insert_user_id,
      key_id: selectedRowData.key_id,
      kind1: kind != undefined ? kind : "",
      kind2: selectedRowData.kind2,
      opengb: selectedRowData.opengb,
      person: selectedRowData.person,
      pgmid: selectedRowData.pgmid,
      pgmnm: selectedRowData.pgmnm,
      planyn: selectedRowData.planyn == "Y" ? true : false,
      project: selectedRowData.project,
      ref_key: selectedRowData.ref_key,
      strdt: toDate(selectedRowData.strdt),
      strhh: selectedRowData.strhh,
      strmm: selectedRowData.strmm,
      strtime: selectedRowData.strtime,
      title: selectedRowData.title,
      usehh: parseInt(selectedRowData.usehh),
      usemm: parseInt(selectedRowData.usemm),
      usetime: selectedRowData.usetime,
      memo: selectedRowData.memo,
    }));
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A1000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A1000W_001");
      } else {
        resetAllGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    if (!infomation.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

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

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: "01",
    datnum: "",
    strdt: "",
    strhh: "",
    strmm: "",
    enddt: "",
    endhh: "",
    endmm: "",
    title: "",
    contents: "",
    kind1: "",
    kind2: "",
    custcd: "",
    custnm: "",
    opengb: "",
    attdatnum: "",
    finyn: "",
    person: "",
    custperson: "",
    planyn: "",
    usehh: 0,
    usemm: 0,
    ref_key: "",
    project: "",
    amt: 0,
    referrer_id: "",
    chooses: "",
    yyyymm: "",
    memo: "",
  });

  const [memoparaData, setMemoParaData] = useState({
    workType: "",
    person: "",
    yyyymm: "",
    memo: "",
  });

  const onMemoSaveClick = (e: any) => {
    setMemoParaData((prev) => ({
      ...prev,
      workType: "monthly",
      yyyymm: convertDateToStr(filters.todt).substring(0, 6),
      person: infomation.person,
      memo: infomation.memo,
    }));
  };

  const memopara: Iparameters = {
    procedureName: "P_CM_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": memoparaData.workType,
      "@p_orgdiv": "01",
      "@p_datnum": null,
      "@p_strdt": null,
      "@p_strhh": null,
      "@p_strmm": null,
      "@p_enddt": null,
      "@p_endhh": null,
      "@p_endmm": null,
      "@p_title": null,
      "@p_contents": null,
      "@p_kind1": null,
      "@p_kind2": null,
      "@p_custcd": null,
      "@p_opengb": null,
      "@p_attdatnum": null,
      "@p_finyn": null,
      "@p_person": userId,
      "@p_custperson": null,
      "@p_planyn": null,
      "@p_usehh": 0,
      "@p_usemm": 0,
      "@p_ref_key": null,
      "@p_project": null,
      "@p_amt": 0,
      "@p_referrer_id": null,
      "@p_chooses": null,
      "@p_yyyymm": memoparaData.yyyymm,
      "@p_memo": memoparaData.memo,
      "@p_id": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A1000W",
    },
  };

  const para: Iparameters = {
    procedureName: "P_CM_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": "01",
      "@p_datnum": paraData.datnum,
      "@p_strdt": paraData.strdt,
      "@p_strhh": paraData.strhh,
      "@p_strmm": paraData.strmm,
      "@p_enddt": paraData.enddt,
      "@p_endhh": paraData.endhh,
      "@p_endmm": paraData.endmm,
      "@p_title": paraData.title,
      "@p_contents": paraData.contents,
      "@p_kind1": paraData.kind1,
      "@p_kind2": paraData.kind2,
      "@p_custcd": paraData.custcd,
      "@p_opengb": paraData.opengb,
      "@p_attdatnum": paraData.attdatnum,
      "@p_finyn": paraData.finyn,
      "@p_person":
        paraData.person == undefined || paraData.person == ""
          ? userId
          : paraData.person,
      "@p_custperson": paraData.custperson,
      "@p_planyn": paraData.planyn,
      "@p_usehh": paraData.usehh,
      "@p_usemm": paraData.usemm,
      "@p_ref_key": paraData.ref_key,
      "@p_project": paraData.project,
      "@p_amt": paraData.amt,
      "@p_referrer_id": paraData.referrer_id,
      "@p_chooses": paraData.chooses,
      "@p_yyyymm": paraData.yyyymm,
      "@p_memo": paraData.memo,
      "@p_id": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A1000W",
    },
  };

  const fetchMemoTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", memopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setMemoParaData((prev) => ({
        ...prev,
        workType: "",
        yyyymm: "",
        memo: "",
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
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
      setWorkType("U");
      setParaData({
        workType: "",
        orgdiv: "01",
        datnum: "",
        strdt: "",
        strhh: "",
        strmm: "",
        enddt: "",
        endhh: "",
        endmm: "",
        title: "",
        contents: "",
        kind1: "",
        kind2: "",
        custcd: "",
        custnm: "",
        opengb: "",
        attdatnum: "",
        finyn: "",
        person: "",
        custperson: "",
        planyn: "",
        usehh: 0,
        usemm: 0,
        ref_key: "",
        project: "",
        amt: 0,
        referrer_id: "",
        chooses: "",
        yyyymm: "",
        memo: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  useEffect(() => {
    if (memoparaData.workType != "") {
      fetchMemoTodoGridSaved();
    }
  }, [memoparaData]);

  const onAddClick = () => {
    setWorkType("N");
    setInfomation((prev) => ({
      ...prev,
      amt: 0,
      attdatnum: "",
      contents: "",
      custcd: "",
      custnm: "",
      custperson: "",
      datnum: "",
      enddt: filters.todt,
      endhh: "00",
      endmm: "00",
      endtime: "",
      exphh: 0,
      expmm: 0,
      files: "",
      finyn: false,
      insert_user_id: "",
      key_id: "",
      kind1: "",
      kind2: "",
      opengb: "",
      person: "",
      pgmid: "",
      pgmnm: "",
      planyn: false,
      project: "",
      ref_key: "",
      strdt: filters.todt,
      strhh: "00",
      strmm: "00",
      strtime: "",
      title: "",
      usehh: 0,
      usemm: 0,
      usetime: "",
      total_usetime: "",
    }));
  };

  const onSaveClick = () => {
    if (
      infomation.strhh.toString() == "" ||
      infomation.strmm.toString() == ""
    ) {
      alert("시작일을 입력해주세요");
    } else if (
      infomation.endhh.toString() == "" ||
      infomation.endmm.toString() == ""
    ) {
      alert("종료일을 입력해주세요");
    } else if (infomation.kind1 == "") {
      alert("전체분류를 입력해주세요");
    } else if (infomation.title == "") {
      alert("제목을 입력해주세요.");
    } else {
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        orgdiv: "01",
        datnum: infomation.datnum,
        strdt: convertDateToStr(infomation.strdt),
        strhh: infomation.strhh.toString(),
        strmm: infomation.strmm.toString(),
        enddt: convertDateToStr(infomation.enddt),
        endhh: infomation.endhh.toString(),
        endmm: infomation.endmm.toString(),
        title: infomation.title,
        contents: infomation.contents,
        kind1: infomation.kind1,
        kind2: infomation.kind2,
        custcd: infomation.custcd,
        custnm: infomation.custnm,
        opengb: infomation.opengb,
        attdatnum: infomation.attdatnum,
        finyn: infomation.finyn == true ? "Y" : "N",
        person: infomation.person,
        custperson: infomation.custperson,
        planyn: infomation.planyn == true ? "Y" : "N",
        usehh: infomation.usehh,
        usemm: infomation.usemm,
        ref_key: infomation.ref_key,
        project: infomation.project,
        amt: infomation.amt,
        referrer_id: "",
        chooses: "",
        yyyymm: "",
        memo: "",
      }));
    }
  };

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    datnum: "",
  });

  const paraDeleted: Iparameters = {
    procedureName: "P_CM_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": "01",
      "@p_datnum": paraDataDeleted.datnum,
      "@p_strdt": "",
      "@p_strhh": "",
      "@p_strmm": "",
      "@p_enddt": "",
      "@p_endhh": "",
      "@p_endmm": "",
      "@p_title": "",
      "@p_contents": "",
      "@p_kind1": "",
      "@p_kind2": "",
      "@p_custcd": "",
      "@p_opengb": "",
      "@p_attdatnum": "",
      "@p_finyn": "",
      "@p_person": "",
      "@p_custperson": "",
      "@p_planyn": "",
      "@p_usehh": 0,
      "@p_usemm": 0,
      "@p_ref_key": "",
      "@p_project": "",
      "@p_amt": 0,
      "@p_referrer_id": "",
      "@p_chooses": "",
      "@p_yyyymm": "",
      "@p_memo": "",
      "@p_id": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A1000W",
    },
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.datnum = "";
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      datnum: infomation.datnum,
    }));
  };

  const onPrintWndClick = () => {
    if(mainDataResult.data.length == 0) {
      alert("조회된 자료가 없습니다");
    } else {
      window.scrollTo(0, 0);
      setPreviewVisible((prev) => !prev);
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>업무일지</Title>

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
      <GridContainerWrap>
        <GridContainer width="19%" style={{ marginTop: "5px" }}>
          <Calendar
            focusedDate={filters.todt}
            value={filters.todt}
            onChange={filterInputChange}
          />
          <GridTitleContainer>
            <GridTitle>메모(월 기준)</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onMemoSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
                title="저장"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <TextArea
            value={infomation.memo}
            name="memo"
            rows={27}
            onChange={InputChange}
          />
        </GridContainer>
        <GridContainer width={`calc(81% - ${GAP}px)`}>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>작성일</th>
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
                  <th>전체분류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="kind1"
                        value={filters.kind1}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>작성자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="name"
                        valueField="code"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>제목/내용</th>
                  <td colSpan={3}>
                    <Input
                      name="title"
                      type="text"
                      value={filters.title}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>완료여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="planyn"
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
                    onClick={onPrintWndClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="print"
                  >
                    미리보기
                  </Button>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                  <Button
                    onClick={onSaveClick}
                    themeColor={"primary"}
                    fillMode="outline"
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: "31.5vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: usersListData.find(
                      (item: any) => item.code === row.person
                    )?.name,
                    kind1: kindListData.find(
                      (item: any) => item.sub_code === row.kind1
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
                              checkField.includes(item.fieldName)
                                ? CheckBoxReadOnlyCell
                                : centerField.includes(item.fieldName)
                                ? CenterCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
                                : item.sortOrder === 6
                                ? gridSumQtyFooterCell2
                                : undefined
                            }
                          ></GridColumn>
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>시작일</th>
                  <td>
                    <DatePicker
                      name="strdt"
                      format="yyyy-MM-dd"
                      value={infomation.strdt}
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <td colSpan={2}>
                    <div style={{ display: "flex" }}>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="strhh"
                          value={infomation.strhh}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                      &nbsp;:&nbsp;
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="strmm"
                          value={infomation.strmm}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                    </div>
                  </td>
                  <th>소요시간</th>
                  <td>
                    <div style={{ display: "flex" }}>
                      <Input
                        name="usehh"
                        type="number"
                        value={infomation.usehh}
                        className="readonly"
                      />
                      &nbsp;:&nbsp;
                      <Input
                        name="usemm"
                        type="number"
                        value={infomation.usemm}
                        className="readonly"
                      />
                    </div>
                  </td>
                  <th>전체분류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="kind1"
                        value={infomation.kind1}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>종료일</th>
                  <td>
                    <DatePicker
                      name="enddt"
                      format="yyyy-MM-dd"
                      value={infomation.enddt}
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <td colSpan={2}>
                    <div style={{ display: "flex" }}>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="endhh"
                          value={infomation.endhh}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                      &nbsp;:&nbsp;
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="endmm"
                          value={infomation.endmm}
                          customOptionData={customOptionData}
                          changeData={ComboBoxChange}
                          className="required"
                        />
                      )}
                    </div>
                  </td>
                  <th>업체담당자</th>
                  <td>
                    <Input
                      name="custperson"
                      type="text"
                      value={infomation.custperson}
                      onChange={InputChange}
                    />
                  </td>
                  <th>참조번호</th>
                  <td>
                    <Input
                      name="ref_key"
                      type="text"
                      value={infomation.ref_key}
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
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </td>
                  <th>업체명</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="custnm"
                        value={infomation.custnm}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        valueField="custnm"
                        textField="custnm"
                      />
                    )}
                  </td>
                  <th>금액</th>
                  <td>
                    <Input
                      name="amt"
                      type="number"
                      value={infomation.amt}
                      onChange={InputChange}
                    />
                  </td>
                  <th>개인분류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="kind2"
                        value={infomation.kind2}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>제목</th>
                  <td colSpan={5}>
                    <Input
                      name="title"
                      type="text"
                      value={infomation.title}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>
                    <Checkbox
                      name="finyn"
                      label={"완료여부"}
                      value={infomation.finyn}
                      onChange={InputChange}
                    />
                  </th>
                  <th>
                    <Checkbox
                      name="planyn"
                      label={"계획여부"}
                      value={infomation.planyn}
                      onChange={InputChange}
                    />
                  </th>
                </tr>
                <tr>
                  <th>내용</th>
                  <td colSpan={7}>
                    <TextArea
                      value={infomation.contents}
                      name="contents"
                      rows={9}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>첨부파일</th>
                  <td colSpan={7}>
                    <Input
                      name="files"
                      type="text"
                      value={infomation.files}
                      className="readonly"
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
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
      </GridContainerWrap>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
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
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={infomation.attdatnum}
        />
      )}
      {previewVisible && (
        <Window
          title={"미리보기"}
          onClose={() => {
            setPreviewVisible((prev) => !prev);
          }}
          initialHeight={794}
          initialWidth={1123}
        >
          <DaliyReport data={filters} />
        </Window>
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

export default CM_A1000W;
