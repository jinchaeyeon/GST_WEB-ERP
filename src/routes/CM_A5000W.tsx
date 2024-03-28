import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  MultiSelect,
  MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
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
  StatusIcon,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
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
  setDefaultDate2,
  toDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RichEditor from "../components/RichEditor";
import CopyWindow from "../components/Windows/CM_A5000W_Copy_Window";
import ProjectsWindow from "../components/Windows/CM_A5000W_Project_Window";
import CM_A5000W_Project_Window_PoP from "../components/Windows/CM_A5000W_Project_Window_PoP";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A5000W_C";
import {
  Iparameters,
  TColumn,
  TEditorHandle,
  TGrid,
  TPermissions,
} from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
let reference = "";
const DateField = ["request_date", "finexpdt", "completion_date"];
const StatusField = ["status"];

interface IPrsnnum {
  user_id: string;
  user_name: string;
}

const StatusCell = (props: GridCellProps) => {
  const { ariaColumnIndex, columnIndex, dataItem, field = "" } = props;

  return (
    <td
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ textAlign: "left", display: "flex", alignItems: "center" }}
    >
      <StatusIcon status={dataItem[field]} />{" "}
      {dataItem[field] === "001"
        ? "컨설팅 요청"
        : dataItem[field] === "002"
        ? "담당자지정"
        : dataItem[field] === "003"
        ? "요청취소"
        : dataItem[field] === "004"
        ? "대응불가"
        : dataItem[field] === "005"
        ? "검토 중"
        : dataItem[field] === "006"
        ? "답변 완료"
        : ""}
    </td>
  );
};

const CM_A5000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);

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
  UseMessages("CM_A5000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A5000W", setCustomOptionData);
  const history = useHistory();
  const location = useLocation();
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const queryParams = new URLSearchParams(location.search);
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      if (queryParams.has("go")) {
        history.replace({}, "");
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          dtgb1: defaultOption.find((item: any) => item.id === "dtgb1")
            .valueCode,
          isSearch: true,
          find_row_value: queryParams.get("go") as string,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          dtgb1: defaultOption.find((item: any) => item.id === "dtgb1")
            .valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_CM500_603_Q, L_CM501_603_Q", setBizComponentData);
  //상태, 의약품상세분류

  const [statusListData, setStatusListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [meditypeListData, setMeditypeListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const statusQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_CM500_603_Q"
        )
      );

      const meditypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_CM501_603_Q"
        )
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const [PrsnnumWindowVisible2, setPrsnnumWindowVisible2] =
    useState<boolean>(false);
  const [copyWindowVisible, setCopyWindowvisible] = useState<boolean>(false);
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const [projectWindowVisible2, setProjectWindowVisible2] =
    useState<boolean>(false);
  const [projectWindowVisible3, setProjectWindowVisible3] =
    useState<boolean>(false);
  const [attachmentsQWindowVisible, setAttachmentsQWindowVisible] =
    useState<boolean>(false);
  const [attachmentsAWindowVisible, setAttachmentsAWindowVisible] =
    useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const onPrsnnumWndClick2 = () => {
    setPrsnnumWindowVisible2(true);
  };

  const onProjectWndClick = () => {
    setProjectWindowVisible(true);
  };

  const onProjectWndClick2 = () => {
    setProjectWindowVisible2(true);
  };

  const onProjectWndClick3 = () => {
    setProjectWindowVisible3(true);
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

  const setCustData2 = (data: ICustData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        customer_code: data.custcd,
        customernm: data.custnm,
      };
    });
  };

  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        user_name: data.user_name,
      };
    });
  };

  const setPrsnnumData2 = (data: IPrsnnum) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        user_id: data.user_id,
        user_name: data.user_name,
      };
    });
  };

  const setCopyData = (data: any) => {
    setWorkType("N");
    setTabSelected(1);
    setInformation({
      document_id: "",
      cpmnum: data.cpmnum,
      user_id: data.user_id,
      user_name: data.user_name,
      request_date: new Date(),
      finexpdt: new Date(),
      require_type: data.require_type,
      completion_method: data.completion_method,
      medicine_type: data.medicine_type,
      status: data.status,
      customer_code: data.customer_code,
      customernm: data.customernm,
      title: data.title,
      is_emergency: data.is_emergency,
      testnum: data.testnum,
      attdatnum: data.attdatnum,
      files: data.files,
      ref_document_id: "",
      project: data.project,
    });
    setInformation2({
      document_id: "",
      attdatnum: "",
      files: "",
      ref_document_id: "",
      person: "",
      recdt: null,
    });
  };

  // 상세정보 프로젝트 데이터
  const setProjectData = (data: any) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        testnum: data.testnum,
        user_name: data.smperson == undefined ? "" : data.smperson,
        customer_code: data.custcd,
        customernm: data.custnm,
        project: data.quokey,
      };
    });
  };

  // 요약정보 프로젝트 데이터
  const setProjectData2 = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        project: data.quokey,
      };
    });
  };

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const getAttachmentsQData = (data: IAttachmentData) => {
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
    setInformation2((prev) => {
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedAttadatnums([]);
    }

    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setWorkType("");
    } else if (e.selected == 1) {
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
        customer_code: selectedRowData.customer_code,
        customernm: selectedRowData.customernm,
        title: selectedRowData.title,
        is_emergency: selectedRowData.is_emergency,
        testnum: selectedRowData.testnum,
        attdatnum: selectedRowData.attdatnum,
        files: selectedRowData.files,
        ref_document_id: selectedRowData.ref_document_id,
        project: selectedRowData.project,
      });

      setInformation2({
        document_id: selectedRowData.document_id,
        attdatnum: selectedRowData.answer_attdatnum,
        files: selectedRowData.answer_files,
        ref_document_id: selectedRowData.ref_document_id,
        person: selectedRowData.person == null ? "" : selectedRowData.person,
        recdt:
          selectedRowData.recdt == null ? null : toDate(selectedRowData.recdt),
      });
      fetchHtmlDocument(selectedRowData);
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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "user_name") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        user_id: value == "" ? "" : prev.user_id,
      }));
    } else if (name == "custnm") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        customer_code: value == "" ? "" : prev.customer_code,
      }));
    }

    if (name == "project") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        project: value,
      }));
    }

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

  const filterMultiSelectChange = (event: MultiSelectChangeEvent) => {
    const values = event.value;
    const name = event.target.props.name ?? "";

    setFilters((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "user_name") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        user_id: value == "" ? "" : prev.user_id,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange2 = (e: any) => {
    const { value, name } = e.target;

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange2 = (e: any) => {
    const { name, value } = e;

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const CheckChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value == true ? "Y" : "N",
    }));
  };

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    document_id: "",
    frdt: new Date(),
    todt: new Date(),
    dtgb1: "",
    status: [{ sub_code: "%", code_name: "전체" }],
    medicine_type: [{ sub_code: "%", code_name: "전체" }],
    custnm: "",
    user_id: "",
    user_name: "",
    project: "",
    customer_code: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    document_id: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState({
    document_id: "",
    cpmnum: "",
    user_id: "",
    user_name: "",
    project: "",
    request_date: new Date(),
    finexpdt: new Date(),
    require_type: "",
    completion_method: "",
    medicine_type: "",
    status: "",
    customer_code: "",
    customernm: "",
    title: "",
    is_emergency: "",
    testnum: "",
    attdatnum: "",
    files: "",
    ref_document_id: "", //답변
  });

  const [information2, setInformation2] = useState<{ [name: string]: any }>({
    document_id: "", //질문
    attdatnum: "",
    files: "",
    ref_document_id: "", //답변
    person: "",
    recdt: null,
  });

  function getName(data: { sub_code: string }[]) {
    let str = "";
    data.map((item: { sub_code: string }) => (str += item.sub_code + "|"));
    return data.length > 0 ? str.slice(0, -1) : str;
  }

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const status =
      filters.status.length == 0
        ? getName(statusListData)
        : filters.status.length == 1
        ? filters.status[0].sub_code
        : getName(filters.status);

    const medicine_type =
      filters.medicine_type.length == 0
        ? ""
        : filters.medicine_type.length == 1
        ? filters.medicine_type[0].sub_code
        : getName(filters.medicine_type);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A5000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_document_id": filters.document_id,
        "@p_dtgb": filters.dtgb1,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_status": status,
        "@p_medicine_type": medicine_type,
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_project": filters.project,
        "@p_customer_code": filters.custnm == "" ? "" : filters.customer_code,
        "@p_customernm": filters.custnm,
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
            (row: any) => row.document_id == filters.find_row_value
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
                (row: any) => row.document_id == filters.find_row_value
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

          setInformation({
            document_id: selectedRow.document_id,
            cpmnum: selectedRow.cpmnum,
            user_id: selectedRow.user_id,
            user_name: selectedRow.user_name,
            project: selectedRow.project,
            request_date: toDate(selectedRow.request_date),
            finexpdt: toDate(selectedRow.finexpdt),
            require_type: selectedRow.require_type,
            completion_method: selectedRow.completion_method,
            medicine_type: selectedRow.medicine_type,
            status: selectedRow.status,
            customer_code: selectedRow.customer_code,
            customernm: selectedRow.customernm,
            title: selectedRow.title,
            is_emergency: selectedRow.is_emergency,
            testnum: selectedRow.testnum,
            attdatnum: selectedRow.attdatnum,
            files: selectedRow.files,
            ref_document_id: selectedRow.ref_document_id,
          });
          fetchHtmlDocument(selectedRow);
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setWorkType("U");
          setDetailFilters((prev) => ({
            ...prev,
            document_id: rows[0].document_id,
            pgNum: 1,
            isSearch: true,
          }));
          setInformation({
            document_id: rows[0].document_id,
            cpmnum: rows[0].cpmnum,
            user_id: rows[0].user_id,
            user_name: rows[0].user_name,
            project: rows[0].project,
            request_date: toDate(rows[0].request_date),
            finexpdt: toDate(rows[0].finexpdt),
            require_type: rows[0].require_type,
            completion_method: rows[0].completion_method,
            medicine_type: rows[0].medicine_type,
            status: rows[0].status,
            customer_code: rows[0].customer_code,
            customernm: rows[0].customernm,
            title: rows[0].title,
            is_emergency: rows[0].is_emergency,
            testnum: rows[0].testnum,
            attdatnum: rows[0].attdatnum,
            files: rows[0].files,
            ref_document_id: rows[0].ref_document_id,
          });
          fetchHtmlDocument(rows[0]);
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
        "@p_project": "",
        "@p_customer_code": "",
        "@p_customernm": "",
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

      if (totalRowCnt > 0) {
        setInformation2({
          document_id: rows[0].ref_document_id,
          attdatnum: rows[0].attdatnum,
          files: rows[0].files,
          ref_document_id: rows[0].document_id,
          person: rows[0].person,
          recdt: rows[0].recdt == "" ? null : toDate(rows[0].recdt),
        });
      } else {
        setInformation2({
          document_id: "",
          attdatnum: "",
          files: "",
          ref_document_id: "",
          person: "",
          recdt: null,
        });
      }
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

  const fetchHtmlDocument = async (key: any) => {
    //if (!permissions?.view) return;
    let data: any;
    let data1: any;
    setLoading(true);

    if (mainDataResult.total < 0) {
      return false;
    }

    const para = {
      folder: "CM_A5000W",
      id: key.document_id,
    };
    const para1 = {
      folder: "CM_A5000W_ANS",
      id: key.document_id,
    };

    try {
      data = await processApi<any>("html-query", para);
    } catch (error) {
      data = null;
    }

    try {
      data1 = await processApi<any>("html-query", para1);
    } catch (error) {
      data1 = null;
    }

    if (key.ref_document_id != "") {
      //답변 완료
      if (data !== null && data.document !== "") {
        // Edior에 HTML & CSS 세팅
        reference = data.document;
        if (docEditorRef) {
          setHtmlOnEditor2({ document: data.document, type: "Question" });
        }
      } else {
        setHtmlOnEditor2({ document: "", type: "Question" });
      }

      if (data1 !== null && data1.document !== "") {
        // Edior에 HTML & CSS 세팅
        if (docEditorRef1.current) {
          setHtmlOnEditor2({ document: data1.document, type: "Answer" });
        }
      } else {
        setHtmlOnEditor2({ document: "", type: "Answer" });
      }
    } else {
      //답변진행중
      //답변 완료
      if (data !== null && data.document !== "") {
        // Edior에 HTML & CSS 세팅
        reference = data.document;
        if (docEditorRef) {
          setHtmlOnEditor({ document: data.document, type: "Question" });
        }
      } else {
        setHtmlOnEditor({ document: "", type: "Question" });
      }

      if (data1 !== null && data1.document !== "") {
        // Edior에 HTML & CSS 세팅
        if (docEditorRef1.current) {
          setHtmlOnEditor({ document: data1.document, type: "Answer" });
        }
      } else {
        setHtmlOnEditor({ document: "", type: "Answer" });
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (workType == "N" && tabSelected == 1) {
      if (docEditorRef.current) {
        docEditorRef.current.setHtml("");
      }
      if (docEditorRef1.current) {
        docEditorRef1.current.updateEditable(true);
        docEditorRef1.current.setHtml("");
        docEditorRef1.current.updateEditable(false);
      }
    }
  }, [tabSelected]);

  const setHtmlOnEditor = ({
    document,
    type,
  }: {
    document: string;
    type: string;
  }) => {
    if (docEditorRef.current && type == "Question") {
      docEditorRef.current.setHtml(document);
    } else if (docEditorRef1.current && type == "Answer") {
      docEditorRef1.current.setHtml(document);
    }
  };

  const setHtmlOnEditor2 = ({
    document,
    type,
  }: {
    document: string;
    type: string;
  }) => {
    if (docEditorRef.current && type == "Question") {
      docEditorRef.current.updateEditable(true);
      docEditorRef.current.setHtml(document);
      docEditorRef.current.updateEditable(false);
    } else if (docEditorRef1.current && type == "Answer") {
      docEditorRef1.current.setHtml(document);
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
  }, [detailfilters, tabSelected]);

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
    setInformation({
      document_id: "",
      cpmnum: "",
      user_id: "",
      user_name: "",
      project: "",
      request_date: new Date(),
      finexpdt: new Date(),
      require_type: "",
      completion_method: "",
      medicine_type: "",
      status: "",
      customer_code: "",
      customernm: "",
      title: "",
      is_emergency: "",
      testnum: "",
      attdatnum: "",
      files: "",
      ref_document_id: "", //답변
    });
    setInformation2({
      document_id: "",
      attdatnum: "",
      files: "",
      ref_document_id: "",
      person: "",
      recdt: null,
    });
  };

  // 엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
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
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
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
      project: selectedRowData.project,
      request_date: toDate(selectedRowData.request_date),
      finexpdt: toDate(selectedRowData.finexpdt),
      require_type: selectedRowData.require_type,
      completion_method: selectedRowData.completion_method,
      medicine_type: selectedRowData.medicine_type,
      status: selectedRowData.status,
      customer_code: selectedRowData.customer_code,
      customernm: selectedRowData.customernm,
      title: selectedRowData.title,
      is_emergency: selectedRowData.is_emergency,
      testnum: selectedRowData.testnum,
      attdatnum: selectedRowData.attdatnum,
      files: selectedRowData.files,
      ref_document_id: selectedRowData.ref_document_id,
    });
    setInformation2({
      document_id: selectedRowData.document_id,
      attdatnum: selectedRowData.answer_attdatnum,
      files: selectedRowData.answer_files,
      ref_document_id: selectedRowData.ref_document_id,
      person: selectedRowData.person == null ? "" : selectedRowData.person,
      recdt:
        selectedRowData.recdt == null ? null : toDate(selectedRowData.recdt),
    });
    fetchHtmlDocument(selectedRowData);
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
    customer_code: "",
    title: "",
    is_emergency: "",
    testnum: "",
    attdatnum: "",
    document_id_A: "",
    person: "",
    recdt: "",
    userid: "",
    username: "",
    project: "",
    pc: pc,
    formid: "CM_A5000W",
  });

  const onSaveClick = () => {
    if (information.ref_document_id != "") {
      alert("답변이 존재하는 요청 건은 수정할 수 없습니다.");
      return false;
    }
    console.log(information);
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

    setParaDataSaved((prev) => ({
      ...prev,
      workType: workType,
      document_id: information.document_id,
      cpmnum: information.cpmnum,
      request_date: convertDateToStr(information.request_date),
      finexpdt: convertDateToStr(information.finexpdt),
      require_type: information.require_type,
      completion_method: information.completion_method,
      medicine_type: information.medicine_type,
      status: information.status,
      customer_code: information.customer_code,
      title: information.title,
      is_emergency: information.is_emergency,
      testnum: information.testnum,
      attdatnum: information.attdatnum,
      username: information.user_name,
      project: information.project,
      userid: information.user_id,
      pc: pc,
      formid: "CM_A5000W",
    }));
  };

  const onSaveClick2 = () => {
    if (workType == "N") {
      alert("문의를 등록해주세요.");
    } else {
      if (
        information2.person == "" ||
        convertDateToStr(information2.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(information2.recdt).substring(6, 8) > "31" ||
        convertDateToStr(information2.recdt).substring(6, 8) < "01" ||
        convertDateToStr(information2.recdt).substring(6, 8).length != 2 ||
        information2.recdt == null ||
        information2.recdt == undefined ||
        information2.recdt == ""
      ) {
        alert("필수값을 입력해주세요.");
      } else {
        const selectedRowData = mainDataResult.data.filter(
          (item) =>
            item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        )[0];

        // 답변 문서 ID가 없을 경우 신규, 있으면 업데이트
        setParaDataSaved((prev) => ({
          ...prev,
          workType: selectedRowData.ref_document_id == "" ? "N1" : "U1",
          document_id: selectedRowData.document_id,
          document_id_A: information.ref_document_id,
          attdatnum: information2.attdatnum,
          person: information2.person,
          recdt: convertDateToStr(information2.recdt),
          userid: userId,
          pc: pc,
          formid: "CM_A5000W",
        }));
      }
    }
  };

  useEffect(() => {
    if (paraDataSaved.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraDataSaved]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    let editorContent: any = "";
    if (docEditorRef.current) {
      editorContent = docEditorRef.current.getContent();
    }
    let editorContent2: any = "";
    if (docEditorRef1.current) {
      editorContent2 = docEditorRef1.current.getContent();
    }
    const bytes = require("utf8-bytes");
    const bytes2 = require("utf8-bytes");
    const convertedEditorContent = bytesToBase64(bytes(editorContent));
    const convertedEditorContent2 = bytesToBase64(bytes2(editorContent2));

    const parameters = {
      folder:
        "html-doc?folder=" +
        (paraDataSaved.workType.length == 1 ? "CM_A5000W" : "CM_A5000W_ANS"),
      procedureName:
        paraDataSaved.workType.length == 1
          ? "P_CM_A5000W_S"
          : "P_CM_A5000W_ANS_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type":
          paraDataSaved.workType.length == 1
            ? paraDataSaved.workType
            : paraDataSaved.workType[0],
        "@p_document_id": paraDataSaved.document_id,
        "@p_cpmnum": paraDataSaved.cpmnum,
        "@p_request_date": paraDataSaved.request_date,
        "@p_finexpdt": paraDataSaved.finexpdt,
        "@p_require_type": paraDataSaved.require_type,
        "@p_completion_method":
          paraDataSaved.completion_method == undefined
            ? ""
            : paraDataSaved.completion_method,
        "@p_medicine_type": paraDataSaved.medicine_type,
        "@p_status": paraDataSaved.status,
        "@p_customer_code": paraDataSaved.customer_code,
        "@p_title": paraDataSaved.title,
        "@p_is_emergency": paraDataSaved.is_emergency,
        "@p_testnum": paraDataSaved.testnum,
        "@p_attdatnum":
          paraDataSaved.attdatnum == undefined ? "" : paraDataSaved.attdatnum,
        "@p_document_id_A": paraDataSaved.document_id_A,
        "@p_person": paraDataSaved.person,
        "@p_recdt": paraDataSaved.recdt,
        "@p_user_id_sm": paraDataSaved.userid,
        "@p_user_name": paraDataSaved.username,
        "@p_project": paraDataSaved.project,
        "@p_userid": userId,
        "@p_pc": paraDataSaved.pc,
      },
      fileBytes:
        paraDataSaved.workType.length == 1
          ? convertedEditorContent
          : convertedEditorContent2,
    };

    try {
      data = await processApi<any>("html-save", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      if (workType == "N" || workType == "D") {
        setTabSelected(0);
        setWorkType("");
      } else {
        setTabSelected(1);
      }

      if (workType == "D" && paraDataSaved.attdatnum != "") {
        setDeletedAttadatnums([paraDataSaved.attdatnum]);
      }
      setUnsavedName([]);
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaDataSaved({
        workType: "",
        document_id: "",
        cpmnum: "",
        request_date: "",
        finexpdt: "",
        require_type: "",
        completion_method: "",
        medicine_type: "",
        status: "",
        customer_code: "",
        title: "",
        is_emergency: "",
        testnum: "",
        attdatnum: "",
        document_id_A: "",
        person: "",
        recdt: "",
        userid: "",
        username: "",
        project: "",
        pc: pc,
        formid: "CM_A5000W",
      });
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
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    setInformation({
      document_id: "",
      cpmnum: "",
      user_id: "",
      user_name: "",
      project: "",
      request_date: setDefaultDate2(customOptionData, "request_date"),
      finexpdt: setDefaultDate2(customOptionData, "finexpdt"),
      require_type: "",
      completion_method: "",
      medicine_type: "",
      status: "001",
      customer_code: "",
      customernm: "",
      title: "",
      is_emergency: defaultOption.find(
        (item: any) => item.id === "is_emergency"
      ).valueCode,
      testnum: "",
      attdatnum: "",
      files: "",
      ref_document_id: "",
    });
    setInformation2({
      document_id: "",
      attdatnum: "",
      files: "",
      ref_document_id: "",
      person: "",
      recdt: null,
    });
  };

  const onCopyClick = () => {
    // 이전질문참조 팝업창 오픈
    setCopyWindowvisible(true);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    const selectRows = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
    } else if (selectRows.ref_document_id != "") {
      alert("답변이 존재하는 요청 건은 삭제할 수 없습니다.");
    } else {
      fetchHtmlDocument(selectRows);
      setWorkType("D");
      setParaDataSaved((prev) => ({
        ...prev,
        workType: "D",
        document_id: selectRows.document_id,
        attdatnum: selectRows.attdatnum,
      }));
    }
  };

  const onDeleteClick2 = () => {
    if (workType == "N") {
      alert("문의를 등록해주세요.");
    } else {
      if (!window.confirm(questionToDelete)) {
        return false;
      }
      const selectRows = mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      if (selectRows.ref_document_id == "") {
        alert("등록된 답변이 없습니다.");
        return;
      } else {
        setWorkType("D");
        setParaDataSaved((prev) => ({
          ...prev,
          workType: "D1",
          document_id: selectRows.document_id,
          document_id_A: selectRows.ref_document_id,
          attdatnum: selectRows.answer_attdatnum,
        }));
      }
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>컨설팅(문의·답변) 관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A5000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
      >
        <TabStripTab title="요약정보">
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
                            name="dtgb1"
                            value={filters.dtgb1}
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
                        <MultiSelect
                          name="status"
                          data={statusListData}
                          onChange={filterMultiSelectChange}
                          value={filters.status}
                          textField="code_name"
                          dataItemKey="sub_code"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>의약품 상세분류</th>
                      <td>
                        <MultiSelect
                          name="medicine_type"
                          data={meditypeListData}
                          onChange={filterMultiSelectChange}
                          value={filters.medicine_type}
                          textField="code_name"
                          dataItemKey="sub_code"
                        />
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
                            onClick={onPrsnnumWndClick}
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
                    <tr>
                      <th>프로젝트</th>
                      <td>
                        <Input
                          name="project"
                          type="text"
                          value={filters.project}
                          onChange={filterInputChange}
                        />
                        <ButtonInInput>
                          <Button
                            icon="more-horizontal"
                            fillMode="flat"
                            onClick={onProjectWndClick3}
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
            </GridContainer>
            <GridContainer width={`calc(88% - ${GAP}px)`}>
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
                    onClick={onCopyClick}
                    themeColor={"primary"}
                    fillMode={"outline"}
                    icon="copy"
                  >
                    이전요청 복사
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="컨설팅(문의·답변)관리"
              >
                <Grid
                  style={{ height: "78vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      medicine_type: meditypeListData.find(
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
                            width={item.width}
                            cell={
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : StatusField.includes(item.fieldName)
                                ? StatusCell
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
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>상세정보</GridTitle>

                  <ButtonContainer>
                    <Button
                      onClick={onDeleteClick}
                      themeColor={"primary"}
                      fillMode={"outline"}
                      icon="delete"
                    >
                      문의 삭제
                    </Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                    >
                      문의 저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                {information.ref_document_id != "" ? (
                  <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>CPM관리번호</th>
                          <td colSpan={3}>
                            <Input
                              name="cpmnum"
                              type="text"
                              value={information.cpmnum}
                              className="readonly"
                              readOnly={true}
                            />
                          </td>
                          <th>SM담당자</th>
                          <td colSpan={3}>
                            <Input
                              name="user_name"
                              type="text"
                              value={information.user_name}
                              className="readonly"
                              readOnly={true}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>문의일</th>
                          <td colSpan={3}>
                            <DatePicker
                              name="request_date"
                              value={information.request_date}
                              format="yyyy-MM-dd"
                              placeholder=""
                              className="readonly"
                            />
                          </td>
                          <th>답변기한요청일</th>
                          <td colSpan={3}>
                            <DatePicker
                              name="finexpdt"
                              value={information.finexpdt}
                              format="yyyy-MM-dd"
                              placeholder=""
                              className="readonly"
                            />
                          </td>
                        </tr>
                        <tr>
                          <th>문의분야</th>
                          <td colSpan={3}>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="require_type"
                                value={information.require_type}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="readonly"
                                disabled={true}
                              />
                            )}
                          </td>
                          <th>문의답변방법</th>
                          <td colSpan={3}>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="completion_method"
                                value={information.completion_method}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="readonly"
                                disabled={true}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>의약품상세분류</th>
                          <td colSpan={3}>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="medicine_type"
                                value={information.medicine_type}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="readonly"
                                disabled={true}
                              />
                            )}
                          </td>
                          <th>상태</th>
                          <td colSpan={3}>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="status"
                                value={information.status}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="readonly"
                                disabled={true}
                              />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>회사명</th>
                          <td colSpan={3}>
                            <Input
                              name="customernm"
                              type="text"
                              value={information.customernm}
                              className="readonly"
                            />
                          </td>
                          <th>시험번호</th>
                          <td colSpan={3}>
                            <Input
                              name="testnum"
                              type="text"
                              value={information.testnum}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                type={"button"}
                                onClick={onProjectWndClick2}
                                icon="search"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>프로젝트</th>
                          <td colSpan={3}>
                            <Input
                              name="project"
                              type="text"
                              value={information.project}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                icon="more-horizontal"
                                fillMode="flat"
                                onClick={onProjectWndClick}
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>제목</th>
                          <td colSpan={6}>
                            <Input
                              name="title"
                              type="text"
                              value={information.title}
                              className="readonly"
                            />
                          </td>
                          <th style={{ width: "10%" }}>
                            <Checkbox
                              title="긴급"
                              name="is_emergency"
                              value={
                                information.is_emergency == "Y" ? true : false
                              }
                              onChange={CheckChange}
                              label={"긴급"}
                              disabled={true}
                            />
                          </th>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                ) : (
                  <FormBoxWrap border={true}>
                    <FormBox>
                      <tbody>
                        <tr>
                          <th>CPM관리번호</th>
                          <td colSpan={3}>
                            <Input
                              name="cpmnum"
                              type="text"
                              value={information.cpmnum}
                              onChange={InputChange}
                            />
                          </td>
                          <th>SM담당자</th>
                          <td colSpan={3}>
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
                                onClick={onPrsnnumWndClick2}
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>문의일</th>
                          <td colSpan={3}>
                            <DatePicker
                              name="request_date"
                              value={information.request_date}
                              format="yyyy-MM-dd"
                              onChange={InputChange}
                              placeholder=""
                              className="required"
                            />
                          </td>
                          <th>답변기한요청일</th>
                          <td colSpan={3}>
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
                          <td colSpan={3}>
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
                          <td colSpan={3}>
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
                          <td colSpan={3}>
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
                          <td colSpan={3}>
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
                          <th>회사명</th>
                          <td colSpan={3}>
                            <Input
                              name="customernm"
                              type="text"
                              value={information.customernm}
                              onChange={filterInputChange}
                            />
                            <ButtonInInput>
                              <Button
                                type={"button"}
                                onClick={onCustWndClick2}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                          <th>시험번호</th>
                          <td colSpan={3}>
                            <Input
                              name="testnum"
                              type="text"
                              value={information.testnum}
                              onChange={filterInputChange}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                type={"button"}
                                onClick={onProjectWndClick}
                                icon="more-horizontal"
                                fillMode="flat"
                              />
                              <Button
                                type={"button"}
                                onClick={onProjectWndClick2}
                                icon="search"
                                fillMode="flat"
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>프로젝트</th>
                          <td>
                            <Input
                              name="project"
                              type="text"
                              value={information.project}
                              className="readonly"
                            />
                            <ButtonInInput>
                              <Button
                                icon="more-horizontal"
                                fillMode="flat"
                                onClick={onProjectWndClick}
                              />
                            </ButtonInInput>
                          </td>
                        </tr>
                        <tr>
                          <th>제목</th>
                          <td colSpan={6}>
                            <Input
                              name="title"
                              type="text"
                              value={information.title}
                              onChange={InputChange}
                              className="required"
                            />
                          </td>
                          <th style={{ width: "10%" }}>
                            <Checkbox
                              title="긴급"
                              name="is_emergency"
                              value={
                                information.is_emergency == "Y" ? true : false
                              }
                              onChange={CheckChange}
                              label={"긴급"}
                            />
                          </th>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                )}
              </GridContainer>
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>문의</GridTitle>
                </GridTitleContainer>
                <GridContainer height="35.5vh">
                  <RichEditor id="docEditor" ref={docEditorRef} hideTools />
                </GridContainer>
              </GridContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: isMobile ? "" : "5%" }}>첨부파일</th>
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
                <GridTitle>
                  <div style={{ display: "flex" }}>
                    <p style={{ marginRight: "5px" }}>답변</p>
                    {workType == "N" ? (
                      ""
                    ) : information2.ref_document_id != "" ? (
                      <div
                        style={{
                          width: "80px",
                          borderRadius: "2px",
                          backgroundColor: "#70ad47",
                          color: "white",
                          padding: "5px 10px",
                          textAlign: "center",
                          marginRight: "5px",
                          fontWeight: 700,
                          fontSize: "12px",
                        }}
                      >
                        완료
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "80px",
                          borderRadius: "2px",
                          backgroundColor: "#ffc000",
                          color: "white",
                          padding: "5px 10px",
                          textAlign: "center",
                          marginRight: "5px",
                          fontWeight: 700,
                          fontSize: "12px",
                        }}
                      >
                        대기중
                      </div>
                    )}
                  </div>
                </GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick2}
                    themeColor={"primary"}
                    fillMode={"outline"}
                    icon="delete"
                  >
                    답변 삭제
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    답변 저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <td>
                        <Button
                          onClick={() => {
                            if (workType != "N") {
                              setInformation2((prev) => ({
                                ...prev,
                                recdt: new Date(),
                                person: userId,
                              }));
                            }
                          }}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="gear"
                        >
                          자동셋팅
                        </Button>
                      </td>
                      <th>답변일</th>
                      <td>
                        {workType == "N" ? (
                          <DatePicker
                            name="recdt"
                            value={information2.recdt}
                            format="yyyy-MM-dd"
                            placeholder=""
                            className="readonly"
                          />
                        ) : (
                          <DatePicker
                            name="recdt"
                            value={information2.recdt}
                            format="yyyy-MM-dd"
                            placeholder=""
                            onChange={InputChange2}
                            className="required"
                          />
                        )}
                      </td>
                      <th>담당자</th>
                      <td>
                        {workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="person"
                                value={information2.person}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange2}
                                textField="user_name"
                                valueField="user_id"
                                className="readonly"
                                disabled={true}
                              />
                            )
                          : customOptionData !== null && (
                              <CustomOptionComboBox
                                name="person"
                                value={information2.person}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange2}
                                textField="user_name"
                                valueField="user_id"
                                className="required"
                              />
                            )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer height={`calc(100% - 185px)`}>
                <RichEditor id="docEditor1" ref={docEditorRef1} hideTools />
              </GridContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th style={{ width: isMobile ? "" : "5%" }}>첨부파일</th>
                      <td>
                        <div className="filter-item-wrap">
                          <Input
                            name="files"
                            value={information2.files}
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
      {custWindowVisible2 && (
        <CustomersWindow
          setVisible={setCustWindowVisible2}
          workType={"N"}
          setData={setCustData2}
          modal={true}
        />
      )}
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
          modal={true}
        />
      )}
      {PrsnnumWindowVisible2 && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible2}
          workType="N"
          setData={setPrsnnumData2}
          modal={true}
        />
      )}
      {attachmentsQWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsQWindowVisible}
          setData={getAttachmentsQData}
          para={information.attdatnum}
          permission={
            information.ref_document_id != ""
              ? { upload: false, download: true, delete: false }
              : { upload: true, download: true, delete: true }
          }
          modal={true}
        />
      )}
      {attachmentsAWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsAWindowVisible}
          setData={getAttachmentsAData}
          para={information2.attdatnum}
          modal={true}
          permission={
            workType == "N"
              ? { upload: false, download: true, delete: false }
              : { upload: true, download: true, delete: true }
          }
        />
      )}
      {copyWindowVisible && (
        <CopyWindow
          setVisible={setCopyWindowvisible}
          setData={setCopyData}
          modal={true}
          pathname="CM_A5000W"
        />
      )}
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="CM_A5000W"
        />
      )}
      {projectWindowVisible2 && (
        <CM_A5000W_Project_Window_PoP
          setVisible={setProjectWindowVisible2}
          testnum={information.testnum}
          modal={true}
          pathname="CM_A5000W"
        />
      )}
      {projectWindowVisible3 && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible3}
          setData={setProjectData2}
          modal={true}
          pathname="CM_A5000W"
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
