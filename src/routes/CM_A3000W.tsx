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
  GridHeaderCellProps,
  GridHeaderSelectionChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox, TextArea } from "@progress/kendo-react-inputs";
import { gridList } from "../store/columns/CM_A3000W_C";
import {
  TreeList,
  createDataTree,
  mapTree,
  TreeListToolbar,
  extendDataItem,
  TreeListExpandChangeEvent,
  TreeListColumnProps,
  filterBy,
  orderBy,
  treeToFlat,
  TreeListSelectionChangeEvent,
} from "@progress/kendo-react-treelist";
import { FilterDescriptor, SortDescriptor } from "@progress/kendo-data-query";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
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
  FormBoxWrap,
  FormBox,
  GridContainerWrap,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseParaPc,
  UseGetValueFromSessionItem,
  useSysMessage,
  setDefaultDate,
  toDate,
  convertDateToStrWithTime2,
} from "../components/CommonFunction";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  EXPANDED_FIELD,
  GAP,
} from "../components/CommonString";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  deletedAttadatnumsState,
} from "../store/atoms";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import { DatePicker } from "@progress/kendo-react-dateinputs/dist/npm/datepicker/DatePicker";
import DateCell from "../components/Cells/DateCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import { IAttachmentData, IWindowPosition } from "../hooks/interfaces";

const DateField = ["recdt"];

const allMenuColumns: TreeListColumnProps[] = [
  { field: "code", title: "코드", expandable: true },
  { field: "name", title: "코드명", expandable: false },
];

interface AppState {
  data: Code[];
  dataState: DataState;
  expanded: string[];
}

export interface Code {
  code: string;
  key_id: string;
  name: string;
  num: number;
  parent_key_id: string;
  use_yn: string;
}

export interface DataState {
  sort: SortDescriptor[];
  filter: FilterDescriptor[];
}

const DATA_ITEM_KEY = "key_id";
const SUB_DATA_ITEM_KEY = "num";
const ATT_DATA_ITEM_KEY = "saved_name";
const SUB_ITEMS_FIELD: string = "menus";
const ALL_MENU_DATA_ITEM_KEY = "key_id";

const CM_A3000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(ALL_MENU_DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const idGetter3 = getter(ATT_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

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
        recdt_s: setDefaultDate(customOptionData, "recdt_s"),
        recdt_e: setDefaultDate(customOptionData, "recdt_e"),
        dptcd: defaultOption.find((item: any) => item.id === "dptcd").valueCode,
        person: defaultOption.find((item: any) => item.id === "person")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_BA198, L_dptcd_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [userListData, setUserListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const userQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(userQueryStr, setUserListData);
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
  const [attDataResult, setAttDataResult] = useState<DataResult>(
    process([], {})
  );
  const [allMenuDataResult, setAllMenuDataResult] = useState<any>([]);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedattDataState, setSelectedattDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [mainPgNum, setMainPgNum] = useState(1);
  const [subPgNum, setSubPgNum] = useState(1);
  const [attPgNum, setAttPgNum] = useState(1);
  const [workType, setWorkType] = useState<string>("U");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
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
    attdatnum: "",
    contents: "",
    datnum: "",
    dptcd: "",
    files: "",
    itemlvl1: "",
    location: "",
    num: "",
    person: "",
    recdt: new Date(),
    title: "",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "TREE",
    orgdiv: "01",
    location: "01",
    recdt_s: new Date(),
    recdt_e: new Date(),
    dptcd: "",
    title: "",
    attdatnum: "",
    person: "",
    datnum: "",
    datdt: "",
    itemlvl1: "%",
    find_row_value: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_CM_A3000W_Q",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_recdt_s": convertDateToStr(filters.recdt_s),
      "@p_recdt_e": convertDateToStr(filters.recdt_e),
      "@p_dptcd": filters.dptcd,
      "@p_title": filters.title,
      "@p_attdatnum": filters.attdatnum,
      "@p_person": filters.person,
      "@p_datnum": filters.datnum,
      "@p_datdt": filters.datdt,
      "@p_itemlvl1": filters.itemlvl1,
      "@p_find_row_value": filters.find_row_value,
    },
  };

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    attdatnum: "",
    datnum: "",
    itemlvl1: "",
  });

  //조회조건 파라미터
  const subparameters: Iparameters = {
    procedureName: "P_CM_A3000W_Q",
    pageNumber: subPgNum,
    pageSize: subfilters.pgSize,
    parameters: {
      "@p_work_type": subfilters.workType,
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_recdt_s": convertDateToStr(filters.recdt_s),
      "@p_recdt_e": convertDateToStr(filters.recdt_e),
      "@p_dptcd": filters.dptcd,
      "@p_title": filters.title,
      "@p_attdatnum": subfilters.attdatnum,
      "@p_person": filters.person,
      "@p_datnum": subfilters.datnum,
      "@p_datdt": filters.datdt,
      "@p_itemlvl1": subfilters.itemlvl1,
      "@p_find_row_value": filters.find_row_value,
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
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.key_id,
          (i: any) => i.parent_key_id,
          SUB_ITEMS_FIELD
        );

        setAllMenuDataResult(dataTree);
        setState((prev) => {
          return {
            ...prev,
            data: dataTree,
          };
        });
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchSubGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true && data.tables.length != 0) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
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

  const [attachmentNumber, setAttachmentNumber] = useState<string>("");

  useEffect(() => {
    fetchAttdatnumGrid();
  }, [attachmentNumber]);

  //그리드 조회
  const fetchAttdatnumGrid = async () => {
    let data: any;
    if (attachmentNumber === "") return false;
    const parameters = {
      attached: "list?attachmentNumber=" + attachmentNumber,
    };

    try {
      data = await processApi<any>("file-list", parameters);
    } catch (error) {
      data = null;
    }

    let result: IAttachmentData = {
      attdatnum: "",
      original_name: "",
      rowCount: 0,
    };

    if (data !== null) {
      const totalRowCnt = data.tables[0].RowCount;

      if (totalRowCnt > 0) {
        const rows = data.tables[0].Rows;

        setAttDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt,
          };
        });

        result = {
          attdatnum: rows[0].attdatnum,
          original_name: rows[0].original_name,
          rowCount: totalRowCnt,
        };
      } else {
        setAttDataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });

        result = {
          attdatnum: attachmentNumber,
          original_name: "",
          rowCount: 0,
        };
      }
    }
  };

  const uploadFile = async (files: File) => {
    let data: any;

    const filePara = {
      attached: attachmentNumber
        ? "attached?attachmentNumber=" + attachmentNumber
        : "attached",
      files: files, //.FileList,
    };

    try {
      data = await processApi<any>("file-upload", filePara);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      if (data.attachmentNumber !== attachmentNumber) {
        setUnsavedAttadatnums([data.attachmentNumber]);
      }
      fetchAttdatnumGrid();
    }
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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];

        setSelectedState({ [firstRowData.key_id]: true });

        setsubFilters((prev) => ({
          ...prev,
          itemlvl1: firstRowData.code == "" ? "%" : firstRowData.code,
        }));

        setIfSelectFirstRow(true);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (ifSelectFirstRow) {
      if (subDataResult.total > 0) {
        const firstRowData = subDataResult.data[0];
        setSelectedsubDataState({ [firstRowData[SUB_DATA_ITEM_KEY]]: true });
        setAttDataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
        if (firstRowData.attdatnum == "") {
          setAttachmentNumber("");
        } else {
          setAttachmentNumber(firstRowData.attdatnum);
        }
        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "U",
          orgdiv: firstRowData.orgdiv,
          dptcd: firstRowData.dptcd,
          attdatnum: firstRowData.attdatnum,
          contents: firstRowData.contents,
          datnum: firstRowData.datnum,
          files: firstRowData.files,
          itemlvl1: firstRowData.itemlvl1,
          location: firstRowData.location,
          num: firstRowData.num,
          person: firstRowData.person,
          recdt: toDate(firstRowData.recdt),
          title: firstRowData.title,
        });
      } else {
        setAttachmentNumber("");
        setAttDataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "U",
          orgdiv: "01",
          attdatnum: "",
          contents: "",
          datnum: "",
          dptcd: "",
          files: "",
          itemlvl1: "",
          location: "",
          num: "",
          person: "",
          recdt: new Date(),
          title: "",
        });
      }
    }
  }, [subDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subfilters]);

  useEffect(() => {
    if (customOptionData !== null) {
      fetchSubGrid();
    }
  }, [subPgNum]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: TreeListSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setSubPgNum(1);
    setSubDataResult(process([], subDataState));
    setsubFilters((prev) => ({
      ...prev,
      itemlvl1: selectedRowData.code == "" ? "%" : selectedRowData.code,
    }));
  };

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedsubDataState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSelectedsubDataState(newSelectedState);
    if (unsavedAttadatnums.length > 0)
      setDeletedAttadatnums(unsavedAttadatnums);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    const user = userListData.find(
      (item: any) => item.user_name === selectedRowData.person
    )?.user_id;
    setAttDataResult((prev) => {
      return {
        data: [],
        total: 0,
      };
    });
    if (selectedRowData.attdatnum == "") {
      setAttachmentNumber("");
    } else {
      setAttachmentNumber(selectedRowData.attdatnum);
    }

    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "U",
      orgdiv: selectedRowData.orgdiv,
      dptcd: selectedRowData.dptcd,
      attdatnum: selectedRowData.attdatnum,
      contents: selectedRowData.contents,
      datnum: selectedRowData.datnum,
      files: selectedRowData.files,
      itemlvl1: selectedRowData.itemlvl1,
      location: selectedRowData.location,
      num: selectedRowData.num,
      person: user != undefined ? user : "",
      recdt: toDate(selectedRowData.recdt),
      title: selectedRowData.title,
    });
  };

  const onAttDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedattDataState,
      dataItemKey: ATT_DATA_ITEM_KEY,
    });

    setSelectedattDataState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save(
        treeToFlat(processData(), EXPANDED_FIELD, SUB_ITEMS_FIELD),
        allMenuColumns
      );
    }
  };

  const onSubScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, subPgNum, PAGE_SIZE))
      setSubPgNum((prev) => prev + 1);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
  };

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {subDataResult.total}건
      </td>
    );
  };
  const excelsInput: any = React.useRef();

  const onAddClick2 = () => {
    setWorkType("N");
    setAttachmentNumber("");
    setAttDataResult((prev) => {
      return {
        data: [],
        total: 0,
      };
    });
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      orgdiv: "01",
      attdatnum: "",
      contents: "",
      datnum: "",
      dptcd: "",
      files: "",
      itemlvl1: "",
      location: "",
      num: "",
      person: "",
      recdt: new Date(),
      title: "",
    });
  };

  const onAllMenuExpandChange = (e: TreeListExpandChangeEvent) => {
    setState({
      ...state,
      expanded: e.value
        ? state.expanded.filter(
            (id) => id !== e.dataItem[ALL_MENU_DATA_ITEM_KEY]
          )
        : [...state.expanded, e.dataItem[ALL_MENU_DATA_ITEM_KEY]],
    });
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    setSubPgNum(1);
    setSubDataResult(process([], subDataState));
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    fetchMainGrid();
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const selectedRowData = subDataResult.data.filter(
      (item: any) =>
        item.num == Object.getOwnPropertyNames(selectedsubDataState)[0]
    )[0];

    setWorkType("D");
    setAttDataResult((prev) => {
      return {
        data: [],
        total: 0,
      };
    });
    if (selectedRowData.attdatnum == "") {
      setAttachmentNumber("");
    } else {
      setAttachmentNumber(selectedRowData.attdatnum);
      setDeletedAttadatnums(selectedRowData.attdatnum);
    }

    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "D",
      orgdiv: selectedRowData.orgdiv,
      dptcd: selectedRowData.dptcd,
      attdatnum: selectedRowData.attdatnum,
      contents: selectedRowData.contents,
      datnum: selectedRowData.datnum,
      files: selectedRowData.files,
      itemlvl1: selectedRowData.itemlvl1,
      location: selectedRowData.location,
      num: selectedRowData.num,
      person: selectedRowData.person,
      recdt: toDate(selectedRowData.recdt),
      title: selectedRowData.title,
    });
  };

  const infopara: Iparameters = {
    procedureName: "P_CM_A3000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": infomation.orgdiv,
      "@p_datnum": infomation.datnum,
      "@p_location": infomation.location,
      "@p_title": infomation.title,
      "@p_recdt": convertDateToStr(infomation.recdt),
      "@p_contents": infomation.contents,
      "@p_dptcd": infomation.dptcd,
      "@p_attdatnum": infomation.attdatnum,
      "@p_person": infomation.person,
      "@p_itemlvl1": infomation.itemlvl1,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SY_A0125W",
    },
  };

  useEffect(() => {
    if (infomation.workType === "D") {
      fetchSaved();
    }
  }, [infomation]);

  const onSaveClick2 = async () => {
    fetchSaved();
  };

  const fetchSaved = async () => {
    let data: any;

    let valid = true;
    try {
      if (!infomation.person) {
        throw findMessage(messagesData, "CM_A3000W_001");
      }

      if (!infomation.dptcd) {
        throw findMessage(messagesData, "CM_A3000W_002");
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
      resetAllGrid();
      fetchMainGrid();
      setUnsavedAttadatnums([]);
      setAttDataResult((prev) => {
        return {
          data: [],
          total: 0,
        };
      });
      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "U",
        orgdiv: "01",
        attdatnum: "",
        contents: "",
        datnum: "",
        dptcd: "",
        files: "",
        itemlvl1: "",
        location: "",
        num: "",
        person: "",
        recdt: new Date(),
        title: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setSubPgNum(1);
    setAttPgNum(1);
    setSubDataResult(process([], subDataState));
  };

  const [state, setState] = React.useState<AppState>({
    data: [...allMenuDataResult],
    dataState: {
      sort: [],
      filter: [],
    },
    expanded: ["전체"],
  });

  const processData = () => {
    let { data, dataState } = state;
    let filteredData = filterBy(data, dataState.filter, SUB_ITEMS_FIELD);
    let sortedData = orderBy(filteredData, dataState.sort, SUB_ITEMS_FIELD);
    return addExpandField(sortedData);
  };

  const addExpandField = (dataTree: TreeListColumnProps[]) => {
    const expanded = state.expanded;
    return mapTree(dataTree, SUB_ITEMS_FIELD, (item) =>
      extendDataItem(item, SUB_ITEMS_FIELD, {
        [EXPANDED_FIELD]: expanded.includes(item.key_id),
        [SELECTED_FIELD]: selectedsubDataState[idGetter(item)],
      })
    );
  };

  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const downloadFiles = async () => {
    // value 가 false인 속성 삭제
    const datas = attDataResult.data.filter(
      (item) => item.chk == true
    );
    if (datas.length == 0) {
      alert("선택된 행이 없습니다.");
      return false;
    }

    // const parameter = parameters[0];
    let response: any;

    datas.forEach(async (parameter) => {
      console.log(parameter.saved_name);
      try {
        response = await processApi<any>("file-download", {
          attached: parameter.saved_name,
        });
      } catch (error) {
        response = null;
      }

      if (response !== null) {
        const blob = new Blob([response.data]);
        // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.
        // const blob = new Blob([this.content], {type: 'text/plain'})

        // blob을 사용해 객체 URL을 생성합니다.
        const fileObjectUrl = window.URL.createObjectURL(blob);

        // blob 객체 URL을 설정할 링크를 만듭니다.
        const link = document.createElement("a");
        link.href = fileObjectUrl;
        link.style.display = "none";

        // 다운로드 파일 이름을 추출하는 함수
        const extractDownloadFilename = (response: any) => {
          console.log(response);
          if (response.headers) {
            const disposition = response.headers["content-disposition"];
            let filename = "";
            if (disposition) {
              var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              var matches = filenameRegex.exec(disposition);
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, "");
              }
            }
            return filename;
          } else {
            return "";
          }
        };

        // 다운로드 파일 이름을 지정 할 수 있습니다.
        // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.
        link.download = extractDownloadFilename(response);

        // 다운로드 파일의 이름은 직접 지정 할 수 있습니다.
        // link.download = "sample-file.xlsx";

        // 링크를 body에 추가하고 강제로 click 이벤트를 발생시켜 파일 다운로드를 실행시킵니다.
        document.body.appendChild(link);
        link.click();
        link.remove();

        // 다운로드가 끝난 리소스(객체 URL)를 해제합니다
      }
    });
  };

  const deleteFiles = () => {
    const datas = attDataResult.data.filter(
      (item) => item.chk == true
    );

    if (datas.length == 0) {
      alert("선택된 행이 없습니다.");
      return false;
    }

    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }
    let data: any;

    datas.forEach(async (parameter) => {
      try {
        data = await processApi<any>("file-delete", { attached: parameter.saved_name });
      } catch (error) {
        data = null;
      }
      if (parameter.saved_name) setDeletedAttadatnums(parameter.saved_name);

      if (data !== null) {
        setAttDataResult((prev) => {
          return {
            data: [],
            total: 0,
          };
        });
        fetchAttdatnumGrid();
        setSelectedattDataState({});
      } else {
        alert("처리 중 오류가 발생하였습니다.");
      }
    });
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = attDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setAttDataResult((prev) => {
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

  const onAttItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      attDataResult,
      setAttDataResult,
      ATT_DATA_ITEM_KEY
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
    let valid = true;
    if (field == "chk") {
      const newData = attDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              chk: typeof item.chk == "boolean" ? item.chk : false,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setAttDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = attDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setAttDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  return (
    <>
      <TitleContainer>
        <Title>자료실</Title>

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
              <th>작성일</th>
              <td colSpan={3}>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="recdt_s"
                    value={filters.recdt_s}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                  ~
                  <DatePicker
                    name="recdt_e"
                    value={filters.recdt_e}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </div>
              </td>
              <th>부서코드</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
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
                    valueField="user_id"
                    textField="user_name"
                  />
                )}
              </td>
              <th>제목</th>
              <td colSpan={3}>
                <Input
                  name="title"
                  type="text"
                  value={filters.title}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainerWrap>
        <GridContainer width="30%">
          <ExcelExport
            ref={(exporter) => (_export = exporter)}
            hierarchy={true}
          >
            <GridTitleContainer>
              <GridTitle>부서리스트</GridTitle>
            </GridTitleContainer>
            <TreeList
              style={{ height: "80vh", overflow: "auto" }}
              data={processData()}
              expandField={EXPANDED_FIELD}
              subItemsField={SUB_ITEMS_FIELD}
              onExpandChange={onAllMenuExpandChange}
              //선택 기능
              dataItemKey={ALL_MENU_DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              onSelectionChange={onSelectionChange}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              {...state.dataState}
              sortable={{ mode: "multiple" }}
              //드래그용 행
              columns={allMenuColumns}
              toolbar={<TreeListToolbar />}
            />
          </ExcelExport>
        </GridContainer>
        <GridContainer width={`calc(70% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>부서인원정보</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "23vh" }}
            data={process(
              subDataResult.data.map((row) => ({
                ...row,
                person: userListData.find(
                  (item: any) => item.user_id === row.person
                )?.user_name,
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
                      className={
                        item.sortOrder === 0
                          ? "readonly"
                          : item.sortOrder === 1
                          ? "readonly"
                          : undefined
                      }
                      cell={
                        DateField.includes(item.fieldName)
                          ? DateCell
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 0 ? subTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="file-add"
              >
                신규
              </Button>
              <Button
                onClick={onDeleteClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                삭제
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
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>대분류</th>
                  <td>
                    {bizComponentData !== null && (
                      <BizComponentComboBox
                        name="itemlvl1"
                        value={infomation.itemlvl1}
                        bizComponentId="L_BA198"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )}
                  </td>
                  <th>작성일</th>
                  <td>
                    <DatePicker
                      name="recdt"
                      value={infomation.recdt}
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      placeholder=""
                      className="required"
                    />
                  </td>
                  <th>작성자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={infomation.person}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                  <th>부서코드</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="dptcd"
                        value={infomation.dptcd}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                        textField="dptnm"
                        valueField="dptcd"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>제목</th>
                  <td colSpan={7}>
                    <Input
                      value={infomation.title}
                      name="title"
                      type="text"
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>내용</th>
                  <td colSpan={7}>
                    <TextArea
                      value={infomation.contents}
                      name="contents"
                      rows={7}
                      onChange={InputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <th>첨부파일</th>
                  <td colSpan={7}>
                    <GridContainer>
                      <Grid
                        style={{ height: "20vh" }}
                        data={process(
                          attDataResult.data.map((row) => ({
                            ...row,
                            person: userListData.find(
                              (item: any) => item.user_id === row.person
                            )?.user_name,
                            insert_time: convertDateToStrWithTime2(
                              new Date(row.insert_time)
                            ),
                            [SELECTED_FIELD]:
                              selectedattDataState[idGetter3(row)],
                          })),
                          {}
                        )}
                        sortable={true}
                        groupable={false}
                        reorderable={true}
                        //onDataStateChange={dataStateChange}
                        fixedScroll={true}
                        total={attDataResult.total}
                        selectedField={SELECTED_FIELD}
                        selectable={{
                          enabled: true,
                          drag: false,
                          cell: false,
                          mode: "multiple",
                        }}
                        onSelectionChange={onAttDataSelectionChange}
                        onItemChange={onAttItemChange}
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
                        <GridColumn
                          field="original_name"
                          title="파일이름"
                          width="400px"
                        />
                        <GridColumn
                          field="file_size"
                          title="파일SIZE"
                          width="150px"
                        />
                        <GridColumn
                          field="user_name"
                          title="등록자명"
                          width="150px"
                        />
                        <GridColumn
                          field="insert_time"
                          title="입력시간"
                          width="200px"
                        />
                      </Grid>
                    </GridContainer>
                  </td>
                </tr>
                <tr>
                  <th></th>
                  <td>
                    <ButtonContainer>
                      <Button
                        onClick={upload}
                        themeColor={"primary"}
                        fillMode={"outline"}
                        icon={"upload"}
                      >
                        업로드
                        <input
                          id="uploadAttachment"
                          style={{ display: "none" }}
                          type="file"
                          multiple
                          ref={excelsInput}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const files = event.target.files;
                            if (files === null) return false;
                            for (let i = 0; i < files.length; ++i) {
                              const file = files[i];
                              uploadFile(file);
                            }
                            if(infomation.workType != "N") {
                              resetAllGrid();
                              fetchMainGrid();
                            } else {
                              fetchAttdatnumGrid();
                            }
                          }}
                        />
                      </Button>
                      <Button
                        onClick={downloadFiles}
                        themeColor={"primary"}
                        fillMode={"outline"}
                        icon={"download"}
                      >
                        다운로드
                      </Button>
                      <Button
                        onClick={deleteFiles}
                        themeColor={"primary"}
                        fillMode={"outline"}
                        icon={"delete"}
                      >
                        삭제
                      </Button>
                    </ButtonContainer>
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
      </GridContainerWrap>
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

export default CM_A3000W;
