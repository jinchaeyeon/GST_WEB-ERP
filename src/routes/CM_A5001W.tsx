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
import ProjectsWindow from "../components/Windows/CM_A5001W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import UserWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A5001W_C";
import {
  Iparameters,
  TColumn,
  TEditorHandle,
  TGrid,
  TPermissions,
} from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
const DateField = ["request_date", "finexpdt", "completion_date"];
const StatusField = ["status"];

interface IUser {
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

const CM_A5001W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);

  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
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
  UseMessages("CM_A5001W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A5001W", setCustomOptionData);

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
        dtgb: defaultOption.find((item: any) => item.id === "dtgb").valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent("L_CM500_603_Q, L_CM501_603_Q", setBizComponentData);
  //상태, 의약품상세분류

  const [statusListData, setStatusListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [meditypeListData, setMeditypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
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
  const [userWindowVisible, setUserWindowVisible] = useState<boolean>(false);
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
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

  const onProjectWndClick = () => {
    setProjectWindowVisible(true);
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
        //customer_code: data.custcd,
        custnm: data.custnm,
      };
    });
  };

  const setUserData = (data: IUser) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        user_name: data.user_name,
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
      });
      setInformation2({
        document_id: selectedRowData.ref_document_id,
        attdatnum: selectedRowData.answer_attdatnum,
        files: selectedRowData.answer_files,
        ref_document_id: selectedRowData.document_id,
        person: selectedRowData.answer_person,
        recdt:
          selectedRowData.answer_recdt == ""
            ? null
            : toDate(selectedRowData.answer_recdt),
      });
      fetchHtmlDocument(
        selectedRowData,
        selectedRowData.ref_document_id == "" ? "N" : "U"
      );
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

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
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
    dtgb: "",
    status: [{ sub_code: "%", code_name: "전체" }],
    medicine_type: [{ sub_code: "%", code_name: "전체" }],
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
    customer_code: "",
    customernm: "",
    title: "",
    is_emergency: "",
    testnum: "",
    attdatnum: "",
    files: "",
  });

  const [information2, setInformation2] = useState<{ [name: string]: any }>({
    document_id: "",
    attdatnum: "",
    files: "",
    ref_document_id: "",
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
      procedureName: "P_CM_A5001W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_document_id": filters.document_id,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_status": status,
        "@p_medicine_type": medicine_type,
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_customer_code": filters.customer_code,
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
          setDetailFilters((prev) => ({
            ...prev,
            document_id: selectedRow.document_id,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            document_id: rows[0].document_id,
            pgNum: 1,
            isSearch: true,
          }));
        }
      } else {
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
      procedureName: "P_CM_A5001W_Q",
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
          document_id: rows[0].document_id,
          attdatnum: rows[0].attdatnum,
          files: rows[0].files,
          ref_document_id: rows[0].ref_document_id,
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

    // 필터 isSearch false처리, pgNum 세팅
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

  const fetchHtmlDocument = async (key: any, workType: any) => {
    let data: any;
    let data1: any;
    let valid = true;
    let valid1 = true;

    if (mainDataResult.total < 0) {
      valid = false;
    }

    if (key == undefined || key == "") {
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    const selectedRowData = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const para = {
      folder: "CM_A5000W",
      id: selectedRowData.document_id,
    };

    try {
      data = await processApi<any>("html-query", para);
    } catch (error) {
      data = null;
    }

    if (data !== null && data.document !== "") {
      // Edior에 HTML & CSS 세팅
      if (docEditorRef.current) {
        setHtmlOnEditor({ document: data.document, type: "Question" });
      }

      // 신규&삭제 - returnString id / 수정 - ref_document_id
      const id = workType == "U" ? key.ref_document_id : key.returnString;

      // 신규 상태로 조회했을 때는 답변HTML 조회X
      if (workType == "N") {
        if (key.returnString == "" || key.returnString == undefined) {
          valid1 = false;
        }
      } else if (workType !== "U") {
        valid1 = false;
      }

      if (valid1) {
        const para1 = {
          folder: "CM_A5001W",
          id: id,
        };

        try {
          data1 = await processApi<any>("html-query", para1);
        } catch (error) {
          data1 = null;
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
    } else {
      setHtmlOnEditor({ document: "", type: "Question" });
      setHtmlOnEditor({ document: "", type: "Answer" });
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
  }, [filters]);

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
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
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
        throw findMessage(messagesData, "CM_A5001W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A5001W_001");
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
      customer_code: selectedRowData.customer_code,
      customernm: selectedRowData.customernm,
      title: selectedRowData.title,
      is_emergency: selectedRowData.is_emergency,
      testnum: selectedRowData.testnum,
      attdatnum: selectedRowData.attdatnum,
      files: selectedRowData.files,
    });
    setInformation2({
      document_id: selectedRowData.ref_document_id,
      attdatnum: selectedRowData.answer_attdatnum,
      files: selectedRowData.answer_files,
      ref_document_id: selectedRowData.document_id,
      person: selectedRowData.person,
      recdt: selectedRowData.recdt,
    });
    fetchHtmlDocument(
      selectedRowData,
      selectedRowData.ref_document_id == "" ? "N" : "U"
    );
  };

  //저장 파라미터 초기 값
  const [paraDataSaved, setParaDataSaved] = useState({
    workType: "",
    document_id: "",
    document_id_Q: "", // 요청문서ID
    attdatnum: "",
    person: "",
    recdt: "",
    userid: "",
    pc: pc,
    formid: "CM_A5001W",
  });

  const onSaveClick = () => {
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
      setParaDataSaved({
        workType: selectedRowData.ref_document_id == "" ? "N" : "U",
        document_id: selectedRowData.ref_document_id,
        document_id_Q: information.document_id,
        attdatnum: information2.attdatnum,
        person: information2.person,
        recdt: convertDateToStr(information2.recdt),
        userid: userId,
        pc: pc,
        formid: "CM_A5001W",
      });
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
    if (docEditorRef1.current) {
      editorContent = docEditorRef1.current.getContent();
    }
    const bytes = require("utf8-bytes");
    const convertedEditorContent = bytesToBase64(bytes(editorContent));

    const parameters = {
      folder: "html-doc?folder=" + "CM_A5001W",
      procedureName: "P_CM_A5001W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraDataSaved.workType,
        "@p_document_id": paraDataSaved.document_id,
        "@p_document_id_Q": paraDataSaved.document_id_Q, // 요청 문서 ID
        "@p_attdatnum": paraDataSaved.attdatnum,
        "@p_person": paraDataSaved.person,
        "@p_recdt": paraDataSaved.recdt,
        "@p_userid": userId,
        "@p_pc": paraDataSaved.pc,
      },
      fileBytes: convertedEditorContent,
    };

    try {
      data = await processApi<any>("html-save", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setDetailFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));

      if (paraDataSaved.workType == "D" && paraDataSaved.attdatnum != "") {
        setDeletedAttadatnums([paraDataSaved.attdatnum]);
      }
      setUnsavedName([]);
      const selectedRowData = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      fetchHtmlDocument(
        paraDataSaved.workType == "U" ? selectedRowData : data,
        paraDataSaved.workType
      );
      setTabSelected(1);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      if (data.resultMessage != undefined) {
        alert(data.resultMessage);
      }
    }
    setLoading(false);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
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
      setParaDataSaved((prev) => ({
        ...prev,
        workType: "D",
        document_id: selectRows.ref_document_id,
        document_id_Q: selectRows.document_id,
      }));
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>컨설팅 답변관리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A5001W"
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
            <GridContainer width={`calc(88% - ${GAP}px)`}>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
              >
                <GridTitleContainer>
                  <GridTitle>요약정보</GridTitle>
                </GridTitleContainer>
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
          disabled={mainDataResult.data.length == 0 ? true : false}
        >
          <GridTitleContainer>
            <GridTitle> </GridTitle>
            <ButtonContainer>
              <Button
                onClick={onDeleteClick}
                themeColor={"primary"}
                fillMode={"outline"}
                icon="delete"
              >
                답변삭제
              </Button>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
              >
                답변저장
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <GridContainerWrap>
            <GridContainer width="50%">
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
                          className="readonly"
                          readOnly={true}
                        />
                      </td>
                      <th>SM담당자</th>
                      <td>
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
                      <td>
                        <DatePicker
                          name="request_date"
                          value={information.request_date}
                          format="yyyy-MM-dd"
                          placeholder=""
                          className="readonly"
                        />
                      </td>
                      <th>답변기한요청일</th>
                      <td>
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
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="require_type"
                            value={information.require_type}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            className="readonly"
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
                            className="readonly"
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
                            className="readonly"
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
                            className="readonly"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>회사명</th>
                      <td>
                        <Input
                          name="customernm"
                          type="text"
                          value={information.customernm}
                          className="readonly"
                        />
                      </td>
                      <th>시험번호</th>
                      <td>
                        <Input
                          name="testnum"
                          type="text"
                          value={information.testnum}
                          className="readonly"
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onProjectWndClick}
                            icon="search"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                    </tr>
                    <tr>
                      <th>긴급</th>
                      <td>
                        <Checkbox
                          title="긴급"
                          name="is_emergency"
                          value={information.is_emergency == "Y" ? true : false}
                          onChange={CheckChange}
                          disabled={true}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td colSpan={3}>
                        <Input
                          name="title"
                          type="text"
                          value={information.title}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer height="37.5vh">
                <RichEditor id="docEditor" ref={docEditorRef} hideTools />
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
                <GridTitle>답변</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>답변일</th>
                      <td>
                        <DatePicker
                          name="recdt"
                          value={information2.recdt}
                          format="yyyy-MM-dd"
                          placeholder=""
                          onChange={InputChange}
                          className="required"
                        />
                      </td>
                      <th>담당자</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="person"
                            value={information2.person}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
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
                <RichEditor
                  id="docEditor1"
                  ref={docEditorRef1}
                  hideTools
                  border={true}
                />
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
      {userWindowVisible && (
        <UserWindow
          setVisible={setUserWindowVisible}
          workType={"N"}
          setData={setUserData}
          modal={true}
        />
      )}
      {attachmentsQWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsQWindowVisible}
          setData={getAttachmentsQData}
          para={information.attdatnum}
          modal={true}
          permission={{ upload: false, download: true, delete: false }}
        />
      )}
      {attachmentsAWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsAWindowVisible}
          setData={getAttachmentsAData}
          para={information2.attdatnum}
          modal={true}
        />
      )}
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          testnum={information.testnum}
          modal={true}
          pathname="CM_A5001W"
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

export default CM_A5001W;
