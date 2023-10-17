import React, { useCallback, useEffect } from "react";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { 
  ButtonContainer, 
  ButtonInInput, 
  FilterBox, 
  FormBox, 
  FormBoxWrap, 
  GridContainer, 
  GridContainerWrap, 
  GridTitle, 
  GridTitleContainer, 
  Title, 
  TitleContainer 
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, unsavedAttadatnumsState } from "../store/atoms";
import { useApi } from "../hooks/api";
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
  toDate,
  useSysMessage
} from "../components/CommonFunction";
import { COM_CODE_DEFAULT_VALUE, EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import { Iparameters, TColumn, TEditorHandle, TGrid, TPermissions } from "../store/types";
import { gridList } from "../store/columns/CM_A5000W_C";
import TopButtons from "../components/Buttons/TopButtons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import UserWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { 
  Grid, 
  GridColumn, 
  GridDataStateChangeEvent, 
  GridFooterCellProps, 
  GridItemChangeEvent, 
  GridPageChangeEvent, 
  GridRowDoubleClickEvent, 
  GridSelectionChangeEvent, 
  getSelectedState 
} from "@progress/kendo-react-grid";
import DateCell from "../components/Cells/DateCell";
import { bytesToBase64 } from "byte-base64";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import RichEditor from "../components/RichEditor";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
let reference = "";
let reference1 = "";
const DateField = [ "request_date", "finexpdt", "completion_date" ];

interface IPrsnnum {
  user_id: string;
  user_name: string;
}

const CM_A5000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");
  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const [workType, setWorkType] = useState("");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const docEditorRef = useRef<TEditorHandle>(null);
  const docEditorRef1 = useRef<TEditorHandle>(null);

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
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dtgb: defaultOption.find((item: any) => item.id === "dtgb")
        .valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_CM500_603, L_CM501_603", setBizComponentData);
  //상태, 의약품상세분류

  const [statusListData, setStatusListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [meditypeLData, setMeditypeListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const statusQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_CM500_603"
        )
      );

      const meditypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizCommponentId == "L_CM501_603")
      );

      fetchQueryData(statusQueryStr, setStatusListData);
      fetchQueryData(meditypeQueryStr, setMeditypeListData);
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
  
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [userWindowVisible, setUserWindowVisible] = useState<boolean>(false);
  const [userWindowVisible2, setUserWindowVisible2] = useState<boolean>(false);
  const [attachmentsQWindowVisible, setAttachmentsQWindowVisible] =
    useState<boolean>(false);
  const [attachmentsAWindowVisible, setAttachmentsAWindowVisible] =
    useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onUserWndClick = () => {
    setUserWindowVisible(true);
  };

  const onUserWndClick2 = () => {
    setUserWindowVisible2(true);
  };

  const onAttachQuestionWndClick = () => {
    setAttachmentsQWindowVisible(true);
  };

  const onAttachAnswerWndClick = () => {
    setAttachmentsAWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        custnm: data.custnm,
      };
    });
  };

  const setUserData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        user_name: data.user_name,
      };
    });
  };

  const setUserData2 = (data: IPrsnnum) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        user_id: data.user_id,
        user_name: data.user_name,
      };
    });
  };

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const getAttachmentsQData = (data: IAttachmentData) => {
    if (!information.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const getAttachmentsAData = (data: IAttachmentData) => {
    if (!information.attdatnum) {
      setUnsavedAttadatnums([data.attdatnum]);
    }

    setDetailFilters((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const [tabSelected, setTabSelected] = React.useState(0);

  const handleSelectTab = (e: any) => {
    if (e.selected == 1) {
      if (mainDataResult.data.length == 0) {
        alert("요약정보 데이터가 없습니다.");
        return false;
      };
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setInformation({
        document_id: selectedRowData.document_id,
        cpmnum: selectedRowData.cpmnum,
        user_id: selectedRowData.user_id,
        user_name: selectedRowData.user_name,
        request_date: toDate(selectedRowData.request_date),
        finexpdt: toDate(selectedRowData.finexpdt),
        require_type: selectedRowData.require_type,
        completion_method: selectedRowData.completion_method,
        medicine_type: selectedRowData.medicine_type,
        status: selectedRowData.status,
        title: selectedRowData.title,
        attdatnum: selectedRowData.attdatnum,
        files: selectedRowData.files,
      });
      fetchHtmlDocument("Question");
      fetchHtmlDocument("Answer");
    }
    setTabSelected(e.selected);
  };

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

  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );

      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(grid.current.clientWidth < minGridWidth.current);
    }
  }, [customOptionData, tabSelected]);

  const handleResize = () => {
    if (grid.current.clientWidth < minGridWidth.current && !applyMinWidth) {
      setApplyMinWidth(true);
    } else if (grid.current.clientWidth > minGridWidth.current) {
      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(false);
    }
  };

  const setWidth = (Name: string, minWidth: number | undefined) => {
    if (minWidth == undefined) {
      minWidth = 0;
    }
    let width = applyMinWidth
      ? minWidth
      : minWidth +
        (gridCurrent - minGridWidth.current) /
          customOptionData.menuCustomColumnOptions[Name].length;

    return width;
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 ComboBox에 입력한 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    document_id: "",
    frdt: new Date(),
    todt: new Date(),
    dtgb: "",
    status: "",
    medicine_type: "",
    custcd: "",
    custnm: "",
    user_id: "",
    user_name: "",
    customer_code: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    document_id: "",
    attdatnum: "",
    files: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState({
    document_id: "",
    cpmnum: "",
    user_id: "",
    user_name: "",
    request_date: new Date(),
    finexpdt: new Date(),
    require_type: "",
    completion_method: "",
    medicine_type: "",
    status: "",
    title: "",
    attdatnum: "",
    files: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A5000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_document_id": filters.document_id,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_status": filters.status,
        "@p_medicine_type": filters.medicine_type,
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_customer_code": filters.customer_code,
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

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.document_id == filters.find_row_value
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.document_id == filters.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setWorkType("U");
          setDetailFilters((prev) => ({
            ...prev,
            document_id: selectedRow.document_id,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setWorkType("U");
          setDetailFilters((prev) => ({
            ...prev,
            document_id: rows[0].document_id,
            pgNum: 1,
            isSearch: true,
          }));
        }
      } else {
        setWorkType("");
        resetAllGrid();
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

  const fetchDetailGrid = async (detailfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_CM_A5000W_Q",
      pageNumber: detailfilters.pgNum,
      pageSize: detailfilters.pgSize,
      parameters: {
        "@p_work_type": detailfilters.workType,
        "@p_document_id": detailfilters.document_id,
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_status": "",
        "@p_medicine_type": "",
        "@p_user_id": "",
        "@p_user_name": "",
        "@p_customer_code": "",
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
      const rows = data.tables[0].Rows;

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }

    setDetailFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchHtmlDocument = async (type: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    
    if (mainDataResult.total < 0) {
      return false;
    }
    const mainDataId = Object.getOwnPropertyNames(selectedState)[0];
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == mainDataId
    );

    let para;

    if (type == "Question") {
      para = {
        folder: "CM_A5000W",
        id: selectedRowData["document_id"],
      };
    } else {
      para = {
        folder: "CM_A5000W",
        id: selectedRowData["ref_document_id"],
      };
    }
    
    try {
      data = await processApi<any>("meeting-query", para);
    } catch (error) {
      data = null;
    }
    
    if (data !== null && data.document !== "") {
      if (type == "Question") {
        reference = data.document;
        // Edior에 HTML & CSS 세팅
        if (docEditorRef.current) {
          docEditorRef.current.setHtml(reference);
        }
      } else {
        reference1 = data.document;
        // Edior에 HTML & CSS 세팅
        if (docEditorRef1.current) {
          setHtmlOnEditor({ document: reference1, type: "Answer" });
        }
      }
    } else {
      if (type == "Question") {
        if (docEditorRef.current) {
          docEditorRef.current.setHtml("");
        }
      } else {
        if (docEditorRef1.current) {
        setHtmlOnEditor({ document: "", type: "Answer" });
        }
      }
    }
    setLoading(false);
  };

  const setHtmlOnEditor = ({
    document,
    type,
  }: {
    document: string;
    type: string;
  }) => {
    if (docEditorRef1.current && type == "Answer") {
      docEditorRef1.current.updateEditable(true);
      docEditorRef1.current.setHtml(document);
      docEditorRef1.current.updateEditable(false);
    }
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({ ...prev, isSearch: false })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setWorkType("");
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  // 엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A5000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A5000W_001");
      } else {
        setTabSelected(0);
        resetAllGrid();
        setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

   //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
   const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
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

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == event.dataItem.num
    );
    
    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });
    setDetailDataResult(process([], detailDataState));
    setTabSelected(1);
    setWorkType("U");

    setDetailFilters((prev) => ({
      ...prev,
      document_id: selectedRowData.document_id,
      isSearch: true,
    }));

    setInformation({
      document_id: selectedRowData.document_id,
      cpmnum: selectedRowData.cpmnum,
      user_id: selectedRowData.user_id,
      user_name: selectedRowData.user_name,
      request_date: toDate(selectedRowData.request_date),
      finexpdt: toDate(selectedRowData.finexpdt),
      require_type: selectedRowData.require_type,
      completion_method: selectedRowData.completion_method,
      medicine_type: selectedRowData.medicine_type,
      status: selectedRowData.status,
      title: selectedRowData.title,
      attdatnum: selectedRowData.attdatnum,
      files: selectedRowData.files,
    });

    fetchHtmlDocument("Question");
    fetchHtmlDocument("Answer");
  };

  //저장 파라미터 초기 값
  const [paraDataSaved, setParaDataSaved] = useState({
    workType: "",
    document_id: "",
    cpmnum: "",
    request_date: "",
    finexpdt: "",
    require_type: "",
    completion_method: "",
    medicine_type: "",
    status: "",
    title: "",
    attdatnum: "",
    userid: "",
    username: "",
    pc: pc,
    formid: "CM_A5000W",
  });

  const onSaveClick = () => {
    let valid = true;
    try {
      if (
        convertDateToStr(information.request_date).substring(0, 4) < "1997" ||
        convertDateToStr(information.request_date).substring(6, 8) > "31" ||
        convertDateToStr(information.request_date).substring(6, 8) < "01" ||
        convertDateToStr(information.request_date).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A5000W_001");
      } else if (
        convertDateToStr(information.finexpdt).substring(0, 4) < "1997" ||
        convertDateToStr(information.finexpdt).substring(6, 8) > "31" ||
        convertDateToStr(information.finexpdt).substring(6, 8) < "01" ||
        convertDateToStr(information.finexpdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A5000W_001");
      } else if (information.status == "") {
        throw findMessage(messagesData, "CM_A5000W_002");
      } else if (information.title == "") {
        throw findMessage(messagesData, "CM_A5000W_003");
      } else if (information.user_name == "") {
        throw findMessage(messagesData, "CM_A5000W_004");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setParaDataSaved({
      workType: workType,
      document_id: information.document_id,
      cpmnum: information.cpmnum,
      request_date: convertDateToStr(information.request_date),
      finexpdt: convertDateToStr(information.finexpdt),
      require_type: information.require_type,
      completion_method: information.completion_method,
      medicine_type: information.medicine_type,
      status: information.status,
      title: information.title,
      attdatnum: information.attdatnum,
      username: information.user_name,
      userid: information.user_id,
      pc: pc,
      formid: "CM_A5000W",
    });
  };

  useEffect(() => {
    if (paraDataSaved.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraDataSaved]);

  useEffect(() => {
    if (workType != "" && workType == "U") {
      fetchHtmlDocument("Question");
      fetchHtmlDocument("Answer");
    }
  }, [workType]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    let editorContent: any = "";
    if (docEditorRef.current) {
      editorContent = docEditorRef.current.getContent();
    }
    const bytes = require("utf8-bytes");
    const convertedEditorContent = 
      workType == "D" 
        ? bytesToBase64(bytes(reference)) 
        : bytesToBase64(bytes(editorContent));

    const para = {
      procedureName: "P_CM_A5000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraDataSaved.workType,
        "@p_document_id": paraDataSaved.document_id,
	      "@p_cpmnum": paraDataSaved.cpmnum,
	      "@p_request_date": paraDataSaved.request_date,
	      "@p_finexpdt": paraDataSaved.finexpdt,
	      "@p_require_type": paraDataSaved.require_type,
	      "@p_completion_method": paraDataSaved.completion_method,
	      "@p_medicine_type": paraDataSaved.medicine_type,
	      "@p_status": paraDataSaved.status,
	      "@p_title": paraDataSaved.title,
	      "@p_attdatnum": paraDataSaved.attdatnum,
        "@p_user_id_sm": paraDataSaved.userid,
        "@p_user_name": paraDataSaved.username,
        "@p_userid": userId,
        "@p_pc": paraDataSaved.pc,
      },
      fileBytes: convertedEditorContent,
    };

    console.log(para);
    try {
      data = await processApi<any>("QnA-save", para);
    } catch (error) {
      data = null;
    }
    console.log(data);

    if (data.isSuccess === true) {
      if (workType == "N" || workType == "D") {
        setTabSelected(0);
      } else {
        setTabSelected(1);
        fetchHtmlDocument("Question");
        fetchHtmlDocument("Answer");
      }

      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const onAddClick = () => {
    setWorkType("N");
    setTabSelected(1);
    setDetailDataResult(process([], detailDataState));
    setInformation({
      document_id: "",
      cpmnum: "",
      user_id: "",
      user_name: "",
      request_date: new Date(),
      finexpdt: new Date(),
      require_type: "",
      completion_method: "",
      medicine_type: "",
      status: "001",
      title: "",
      attdatnum: "",
      files: "",
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else {
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setWorkType("D");
      setParaDataSaved((prev) => ({
        ...prev,
        workType: "D",
        document_id: selectRows.document_id,
      }));
    }
  }; 

  return (
    <>
      <TitleContainer>
        <Title>컨설팅 요청등록</Title>
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
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title = "요약정보">
          <GridContainerWrap>
            <GridContainer width="22%">
              <FilterContainer>
                <GridTitleContainer>
                  <GridTitleContainer>
                    <GridTitle>조회조건</GridTitle>
                  </GridTitleContainer>
                </GridTitleContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>일자구분</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dtgb"
                            value={filters.dtgb}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            valueField="code"
                            textField="name"
                            className="required"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>상태</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="status"
                            value={filters.status}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>의약품 상세분류</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="medicine_type"
                            value={filters.medicine_type}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>조회일자</th>
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
                    </tr>
                    <tr>
                      <th>SM담당자</th>
                      <td>
                        <Input
                          name="user_name"
                          type="text"
                          value={filters.user_name}
                          onChange={filterInputChange}
                        />
                        <ButtonInInput>
                          <Button
                            type="button"
                            icon="more-horizontal"
                            fillMode="flat"
                            onClick={onUserWndClick}
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>회사명</th>
                      <td>
                      <Input
                          name="custnm"
                          type="text"
                          value={filters.custnm}
                          onChange={filterInputChange}
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onCustWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
            </GridContainer>
            <GridContainer  width={`calc(88% - ${GAP}px)`}>
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
                      icon="file-add"
                    >
                      신규
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      icon="delete"
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: "78vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      status: statusListData.find(
                        (items: any) => items.sub_code == row.status
                      )?.code_name,
                      medicine_type: meditypeLData.find(
                        (items: any) => items.sub_code == row.medicine_type
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
                  // 선택기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  onRowDoubleClick={onRowDoubleClick}
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
                  editField={EDIT_FIELD}
                  id="grdList"
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={setWidth("grdList", item.width)}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? mainTotalFooterCell
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

        <TabStripTab 
          title="상세정보"
          disabled={
            mainDataResult.data.length == 0 && workType == "" ? true : false
          }
        >
          <GridTitleContainer>
            <GridTitle> </GridTitle>
            <ButtonContainer>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>상세정보</GridTitle>
                </GridTitleContainer>
                <FormBoxWrap border={true}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>CPM관리번호</th>
                        <td>
                          <Input
                            name="cpmnum"
                            type="text"
                            value={information.cpmnum}
                            onChange={InputChange}
                          />
                        </td>
                        <th>SM담당자</th>
                        <td>
                          <Input
                            name="user_name"
                            type="text"
                            value={information.user_name}
                            onChange={InputChange}
                            className="required"
                          />
                          <ButtonInInput>
                            <Button
                              type="button"
                              icon="more-horizontal"
                              fillMode="flat"
                              onClick={onUserWndClick2}
                            />
                          </ButtonInInput>
                        </td>
                      </tr>
                      <tr>
                        <th style={{ width: isMobile ? "" : "15%" }}>문의일</th>
                        <td>
                          <DatePicker
                            name="request_date"
                            value={information.request_date}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                        <th style={{ width: isMobile ? "" : "15%" }}>답변기한요청일</th>
                        <td>
                          <DatePicker
                            name="finexpdt"
                            value={information.finexpdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>문의분야</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="require_type"
                              value={information.require_type}
                              type="new"
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                        <th>문의답변방법</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="completion_method"
                              value={information.completion_method}
                              type="new"
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>의약품상세분류</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="medicine_type"
                              value={information.medicine_type}
                              type="new"
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                        <th>상태</th>
                        <td>
                          {customOptionData !== null && (
                            <CustomOptionComboBox
                              name="status"
                              value={information.status}
                              type="new"
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              className="required"
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>제목</th>
                        <td colSpan={4}>
                          <Input
                            name="title"
                            type="text"
                            value={information.title}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
              <GridContainer style={{ height: "45vh" }}>
                <RichEditor id="docEditor" ref={docEditorRef} hideTools />
              </GridContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: isMobile ? "" : "15%" }}>첨부파일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <Input
                            name="files"
                            value={information.files}
                            className="readonly"
                          />
                          <ButtonInInput>
                            <Button
                              icon="more-horizontal"
                              fillMode={"flat"}
                              onClick={onAttachQuestionWndClick}
                            />
                          </ButtonInInput>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>답변</GridTitle>
              </GridTitleContainer>
              <GridContainer style = {{ height: "68.5vh"}}>
                <RichEditor id="docEditor" ref={docEditorRef1} hideTools />
                <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                    <th style={{ width: isMobile ? "" :  "15%" }}>첨부파일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <Input
                            name="files"
                            value={detailfilters.files}
                            className="readonly"
                          />
                          <ButtonInInput>
                            <Button
                              icon="more-horizontal"
                              fillMode={"flat"}
                              onClick={onAttachAnswerWndClick}
                            />
                          </ButtonInInput>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
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
      {userWindowVisible && (
        <UserWindow
          setVisible={setUserWindowVisible}
          workType={"N"}
          setData={setUserData}
          modal={true}
        />
      )}
      {userWindowVisible2 && (
        <UserWindow
          setVisible={setUserWindowVisible2}
          workType={"N"}
          setData={setUserData2}
          modal={true}
        />
      )}
      {attachmentsQWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsQWindowVisible}
          setData={getAttachmentsQData}
          para={information.attdatnum}
          modal={true}
        />
      )}
      {attachmentsAWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsAWindowVisible}
          setData={getAttachmentsAData}
          para={detailfilters.attdatnum}
          modal={true}
          permission={{ upload: false, download: true, delete: false }}
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

export default CM_A5000W;