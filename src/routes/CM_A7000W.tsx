import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridRowDoubleClickEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
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
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import RichEditor from "../components/RichEditor";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersPersonMultiWindow from "../components/Windows/CommonWindows/CustomersPersonMultiWindow";
import CustomersPersonWindow from "../components/Windows/CommonWindows/CustomersPersonWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import PrsnnumMultiWindow from "../components/Windows/CommonWindows/PrsnnumMultiWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A7000W_C";
import {
  Iparameters,
  TColumn,
  TEditorHandle,
  TGrid,
  TPermissions,
} from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
const DateField = ["recdt"];
let reference = "";
let temp = 0;
let deletedMainRows: any[] = [];

const CM_A7000W: React.FC = () => {
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);

  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const userName = UseGetValueFromSessionItem("user_name");
  const [workType, setWorkType] = useState("");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [loginResult] = useRecoilState(loginResultState);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const refEditorRef = useRef<TEditorHandle>(null);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
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

  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tabSelected, setTabSelected] = React.useState(0);

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custpersonWindowVisible, setCustPersonWindowVisible] =
    useState<boolean>(false);

  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);

  const [attachmentsWindowVisiblePb, setAttachmentsWindowVisiblePb] =
    useState<boolean>(false);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const getAttachmentsDataPb = (data: IAttachmentData) => {
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

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onCustPersonWndClick = () => {
    setCustPersonWindowVisible(true);
  };

  const onAttachPbWndClick = () => {
    setAttachmentsWindowVisiblePb(true);
  };

  const onProjectWndClick = () => {
    setProjectWindowVisible(true);
  };

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>([]);
  UseBizComponent(
    "L_SA019_603, L_Requestgb, L_SA001_603, L_sysUserMaster_001, L_CM700, L_CM701",
    setBizComponentData
  );

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [usegbListData, setUsegbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [typeListData, setTypeListData] = useState([COM_CODE_DEFAULT_VALUE]);

  const [testtypeListData, setTestTypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [requestgbListData, setrequestgbListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [materialtypeListData, setmaterialtypeListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData.length > 0) {
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );
      const typeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_CM701")
      );
      const usegbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_CM700")
      );
      const testtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA019_603"
        )
      );
      const requestgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_Requestgb"
        )
      );
      const materialtypeQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_SA001_603"
        )
      );
      fetchQueryData(typeQueryStr, setTypeListData);
      fetchQueryData(personQueryStr, setPersonListData);
      fetchQueryData(usegbQueryStr, setUsegbListData);
      fetchQueryData(testtypeQueryStr, setTestTypeListData);
      fetchQueryData(requestgbQueryStr, setrequestgbListData);
      fetchQueryData(materialtypeQueryStr, setmaterialtypeListData);
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

      if (data.isSuccess == true) {
        const rows = data.tables[0].Rows;
        setListData(rows);
      }
    },
    []
  );

  const setCustPersonData = (data: any) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        custprsncd: data.custprsncd,
        custprsnnm: data.prsnnm,
        postnm: data.postnm,
        dptnm: data.dptnm,
        address: data.address,
        telno: data.telno,
        phoneno: data.phoneno,
        email: data.email,
      };
    });
  };

  const setCustData = (data: ICustData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: "",
        custprsnnm: "",
        postnm: "",
        dptnm: "",
        address: data.address,
        telno: "",
        phoneno: "",
        email: "",
      };
    });
  };

  const setProjectData = (data: any) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        ref_key: data.quokey,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: data.custprsncd,
        custprsnnm: data.custprsnnm,
        postnm: data.postnm,
        dptnm: data.dptnm,
        address: data.address,
        telno: data.telno,
        phoneno: data.phoneno,
        email: data.email,
        testtype:
          testtypeListData.find((item: any) => item.code_name == data.testtype)
            ?.sub_code == undefined
            ? ""
            : testtypeListData.find(
                (item: any) => item.code_name == data.testtype
              )?.sub_code,
        requestgb:
          requestgbListData.find(
            (item: any) => item.code_name == data.requestgb
          )?.sub_code == undefined
            ? ""
            : requestgbListData.find(
                (item: any) => item.code_name == data.requestgb
              )?.sub_code,
        materialtype:
          materialtypeListData.find(
            (item: any) => item.code_name == data.materialtype
          )?.sub_code == undefined
            ? ""
            : materialtypeListData.find(
                (item: any) => item.code_name == data.materialtype
              )?.sub_code,
        extra_field2: data.extra_field2,
      };
    });
  };

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
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];

      setInformation({
        orgdiv: data.orgidv,
        meetingnum: data.meetingnum,
        usegb: data.usegb,
        person: data.person,
        personnm: data.personnm,
        recdt: toDate(data.recdt),
        title: data.title,
        attdatnum: data.attdatnum == undefined ? "" : data.attdatnum,
        files: data.files,
        ref_key: data.ref_key,
        custcd: data.custcd,
        custnm: data.custnm,
        custprsncd: data.custprsncd,
        custprsnnm: data.custprsnnm,
        postnm: data.postnm,
        dptnm: data.dptnm,
        address: data.address,
        telno: data.telno,
        phoneno: data.phoneno,
        email: data.email,
        testtype: data.testtype,
        requestgb: data.requestgb,
        materialtype: data.materialtype,
        extra_field2: data.extra_field2,
        place: data.place,
        type: data.type,
      });

      fetchDetail();
    }
    setTabSelected(e.selected);
  };

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("CM_A7000W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("CM_A7000W", setCustomOptionData);

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
          isSearch: true,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          custprsncd: defaultOption.find(
            (item: any) => item.id == "custprsncd"
          ).valueCode,
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          ).valueCode,
          person: defaultOption.find((item: any) => item.id == "person")
            .valueCode,
          usegb: defaultOption.find((item: any) => item.id == "usegb")
            .valueCode,
          type: defaultOption.find((item: any) => item.id == "type").valueCode,
          find_row_value: queryParams.get("go") as string,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          custprsncd: defaultOption.find(
            (item: any) => item.id == "custprsncd"
          ).valueCode,
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          ).valueCode,
          person: defaultOption.find((item: any) => item.id == "person")
            .valueCode,
          usegb: defaultOption.find((item: any) => item.id == "usegb")
            .valueCode,
          type: defaultOption.find((item: any) => item.id == "type").valueCode,
          isSearch: true,
        }));
      }
    }
  }, [customOptionData]);

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

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const InputChange2 = (e: any) => {
    const { value, name } = e.target;

    setInformation2((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (name == "custcd") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        custprsncd: "",
        custprsnnm: "",
        postnm: "",
        dptnm: "",
        address: "",
        telno: "",
        phoneno: "",
        email: "",
        testtype: "",
        requestgb: "",
        materialtype: "",
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const history = useHistory();
  const location = useLocation();

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    title: "",
    ref_key: "",
    person: "",
    usegb: "",
    type: "",
    custprsncd: "",
    materialtype: "",
    extra_field2: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "CR083T",
    orgdiv: "01",
    meetingnum: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState({
    orgdiv: "01",
    meetingnum: "",
    usegb: "",
    person: userId,
    personnm: userName,
    recdt: new Date(),
    title: "",
    files: "",
    attdatnum: "",
    ref_key: "",
    custcd: "",
    custnm: "",
    custprsncd: "",
    custprsnnm: "",
    postnm: "",
    dptnm: "",
    address: "",
    telno: "",
    phoneno: "",
    email: "",
    testtype: "",
    requestgb: "",
    materialtype: "",
    type: "",
    extra_field2: "",
    place: "",
  });

  const [information2, setInformation2] = useState({
    user_name: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A7000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custnm": filters.custnm,
        "@p_title": filters.title,
        "@p_ref_key": filters.ref_key,
        "@p_person": filters.person,
        "@p_usegb": filters.usegb,
        "@p_type": filters.type,
        "@p_custprsncd": filters.custprsncd,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_meetingnum": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.orgdiv + "_" + row.meetingnum == filters.find_row_value
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
                  row.orgdiv + "_" + row.meetingnum == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            meetingnum: selectedRow.meetingnum,
            isSearch: true,
          }));
          setWorkType("U");
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            meetingnum: rows[0].meetingnum,
            isSearch: true,
          }));
          setWorkType("U");
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A7000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custnm": filters.custnm,
        "@p_title": filters.title,
        "@p_ref_key": filters.ref_key,
        "@p_person": filters.person,
        "@p_usegb": filters.usegb,
        "@p_type": filters.type,
        "@p_custprsncd": filters.custprsncd,
        "@p_materialtype": filters.materialtype,
        "@p_extra_field2": filters.extra_field2,
        "@p_meetingnum": filters2.meetingnum,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetail = async () => {
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

    const id = "01" + "_" + selectedRowData["meetingnum"];

    const para = {
      folder: "CM_A7000W",
      id: id,
    };

    try {
      data = await processApi<any>("html-query", para);
    } catch (error) {
      data = null;
    }

    if (data !== null && data.document !== "") {
      reference = data.document;
      // Edior에 HTML & CSS 세팅
      if (refEditorRef.current) {
        refEditorRef.current.setHtml(reference);
      }
    }
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions]);

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
    setInformation2({
      user_name: ""
    })
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
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
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
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

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      meetingnum: selectedRowData.meetingnum,
      isSearch: true,
    }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == event.dataItem.num
    );

    setSelectedState({ [selectedRowData[DATA_ITEM_KEY]]: true });

    setWorkType("U");
    setFilters2((prev) => ({
      ...prev,
      meetingnum: selectedRowData.meetingnum,
      isSearch: true,
    }));
    setInformation({
      orgdiv: selectedRowData.orgdiv,
      meetingnum: selectedRowData.meetingnum,
      usegb: selectedRowData.usegb,
      person: selectedRowData.person,
      personnm: selectedRowData.personnm,
      recdt: toDate(selectedRowData.recdt),
      title: selectedRowData.title,
      attdatnum:
        selectedRowData.attdatnum == undefined ? "" : selectedRowData.attdatnum,
      files: selectedRowData.files,
      ref_key: selectedRowData.ref_key,
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      custprsncd: selectedRowData.custprsncd,
      custprsnnm: selectedRowData.custprsnnm,
      postnm: selectedRowData.postnm,
      dptnm: selectedRowData.dptnm,
      address: selectedRowData.address,
      telno: selectedRowData.telno,
      phoneno: selectedRowData.phoneno,
      email: selectedRowData.email,
      testtype: selectedRowData.testtype,
      requestgb: selectedRowData.requestgb,
      materialtype: selectedRowData.materialtype,
      extra_field2: selectedRowData.extra_field2,
      place: selectedRowData.place,
      type: selectedRowData.type,
    });
    fetchDetail();
    setTabSelected(1);
  };

  //저장 파라미터 초기 값
  const [paraDataSaved, setParaDataSaved] = useState({
    workType: "",
    orgdiv: "01",
    meetingnum: "",
    meetingseq: 0,
    recdt: "",
    usegb: "",
    title: "",
    attdatnum: "",
    ref_key: "",
    custcd: "",
    custprsncd: "",
    testtype: "",
    requestgb: "",
    materialtype: "",
    type: "",
    contents: "",
    place: "",
    extra_field2: "",
    rowstatus_s: "",
    seq_s: "",
    prsnnm_s: "",
    userid: userId,
    pc: pc,
    formid: "CM_A7000W",
  });

  const onSaveClick = () => {
    let valid = true;
    try {
      if (
        convertDateToStr(information.recdt).substring(0, 4) < "1997" ||
        convertDateToStr(information.recdt).substring(6, 8) > "31" ||
        convertDateToStr(information.recdt).substring(6, 8) < "01" ||
        convertDateToStr(information.recdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A7000W_001");
      } else if (information.title == "") {
        throw findMessage(messagesData, "CM_A7000W_003");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const dataItem = detailDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let dataArr: any = {
      rowstatus_s: [],
      prsnnm_s: [],
      seq_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { rowstatus = "", prsnnm = "" } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.seq_s.push("0");
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const { rowstatus = "", prsnnm = "", seq = "" } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.seq_s.push(seq);
    });
    setParaDataSaved({
      workType: workType,
      orgdiv: "01",
      meetingnum: information.meetingnum,
      meetingseq: 0,
      recdt: convertDateToStr(information.recdt),
      usegb: information.usegb,
      title: information.title,
      attdatnum: information.attdatnum,
      ref_key: information.ref_key,
      custcd: information.custcd,
      custprsncd: information.custprsncd,
      testtype: information.testtype,
      requestgb: information.requestgb,
      materialtype: information.materialtype,
      type: information.type,
      place: information.place,
      extra_field2: information.extra_field2,
      contents: "",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      seq_s: dataArr.seq_s.join("|"),
      prsnnm_s: dataArr.prsnnm_s.join("|"),
      userid: userId,
      pc: pc,
      formid: "CM_A7000W",
    });
  };

  useEffect(() => {
    if (paraDataSaved.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraDataSaved]);

  useEffect(() => {
    if (workType != "" && workType == "U") {
      fetchDetail();
    }
  }, [workType]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    let editorContent: any = "";
    if (refEditorRef.current) {
      editorContent = refEditorRef.current.getContent();
    }
    const bytes = require("utf8-bytes");
    const convertedEditorContent =
      workType == "D"
        ? bytesToBase64(bytes(reference))
        : bytesToBase64(bytes(editorContent));

    const parameters = {
      folder: "html-doc?folder=" + "CM_A7000W",
      procedureName: "P_CM_A7000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraDataSaved.workType,
        "@p_orgdiv": paraDataSaved.orgdiv,
        "@p_meetingnum": paraDataSaved.meetingnum,
        "@p_meetingseq": paraDataSaved.meetingseq,
        "@p_recdt": paraDataSaved.recdt,
        "@p_usegb": paraDataSaved.usegb,
        "@p_title": paraDataSaved.title,
        "@p_attdatnum": paraDataSaved.attdatnum,
        "@p_ref_key": paraDataSaved.ref_key,
        "@p_custcd": paraDataSaved.custcd,
        "@p_custprsncd": paraDataSaved.custprsncd,
        "@p_testtype": paraDataSaved.testtype,
        "@p_requestgb": paraDataSaved.requestgb,
        "@p_materialtype": paraDataSaved.materialtype,
        "@p_type": paraDataSaved.type,
        "@p_contents": paraDataSaved.contents,
        "@p_place": paraDataSaved.place,
        "@p_extra_field2": paraDataSaved.extra_field2,
        "@p_rowstatus_s": paraDataSaved.rowstatus_s,
        "@p_seq_s": paraDataSaved.seq_s,
        "@p_prsnnm_s": paraDataSaved.prsnnm_s,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "CM_A7000W",
      },
      fileBytes: convertedEditorContent,
    };

    try {
      data = await processApi<any>("html-save", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      let array: any[] = [];
      deletedMainRows = [];
      if (workType == "D" && paraDataSaved.attdatnum != "") {
        array.push(paraDataSaved.attdatnum);
      }
      setDeletedAttadatnums(array);
      setUnsavedName([]);
      if (workType == "N" || workType == "D") {
        setTabSelected(0);
      } else {
        setTabSelected(1);
        fetchDetail();
      }
      setInformation2({
        user_name: ""
      })
      setParaDataSaved({
        workType: "",
        orgdiv: "01",
        meetingnum: "",
        meetingseq: 0,
        recdt: "",
        usegb: "",
        title: "",
        attdatnum: "",
        ref_key: "",
        custcd: "",
        custprsncd: "",
        testtype: "",
        requestgb: "",
        materialtype: "",
        type: "",
        place: "",
        extra_field2: "",
        contents: "",
        rowstatus_s: "",
        seq_s: "",
        prsnnm_s: "",
        userid: userId,
        pc: pc,
        formid: "CM_A7000W",
      });
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
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    setInformation({
      orgdiv: "01",
      meetingnum: "",
      usegb: defaultOption.find((item: any) => item.id == "usegb").valueCode,
      person: userId,
      personnm: userName,
      recdt: setDefaultDate2(customOptionData, "recdt"),
      title: "",
      files: "",
      attdatnum: "",
      ref_key: "",
      custcd: defaultOption.find((item: any) => item.id == "custcd").valueCode,
      custnm: "",
      custprsncd: "",
      custprsnnm: "",
      postnm: "",
      dptnm: "",
      address: "",
      telno: "",
      phoneno: "",
      email: "",
      testtype: defaultOption.find((item: any) => item.id == "testtype")
        .valueCode,
      requestgb: defaultOption.find((item: any) => item.id == "requestgb")
        .valueCode,
      materialtype: defaultOption.find(
        (item: any) => item.id == "materialtype"
      ).valueCode,
      type: defaultOption.find((item: any) => item.id == "type").valueCode,
      extra_field2: "",
      place: "",
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
        orgdiv: selectRows.orgdiv,
        meetingnum: selectRows.meetingnum,
        attdatnum: selectRows.attdatnum,
      }));
    }
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

  const enterEdit = (dataItem: any, field: string) => {};

  const exitEdit = () => {};

  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const [PrsnnumWindowVisible2, setPrsnnumWindowVisible2] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  const onPrsnnumWndClick2 = () => {
    if (
      information.custcd == "" ||
      information.custcd == undefined ||
      information.custcd == null
    ) {
      alert("업체를 선택해주세요.");
    } else {
      setPrsnnumWindowVisible2(true);
    }
  };

  const setPrsnnumData = (data: any[]) => {
    data.map((items) => {
      detailDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });

      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        prsnnm: items.user_name,
        rowstatus: "N",
      };

      setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
      setDetailDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    });
  };

  const setPrsnnumData2 = (data: any[]) => {
    data.map((items) => {
      detailDataResult.data.map((item) => {
        if (item.num > temp) {
          temp = item.num;
        }
      });

      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        prsnnm: items.prsnnm,
        rowstatus: "N",
      };

      setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
      setDetailDataResult((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });
    });
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    detailDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          // const newData2 = {
          //   ...item,
          //   rowstatus: "D",
          // };
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = detailDataResult.data[Math.min(...Object2)];
    } else {
      data = detailDataResult.data[Math.min(...Object) - 1];
    }

    setDetailDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>
          {loginResult.companyCode == "2302BA03" ? "상담일지" : "회의록관리"}
        </Title>
        <ButtonContainer>
          {tabSelected == 1 ? (
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
            >
              저장
            </Button>
          ) : (
            ""
          )}

          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="CM_A7000W"
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
          <GridTitleContainer>
            <GridTitle>조회조건</GridTitle>
          </GridTitleContainer>
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
                  <th>업체명</th>
                  <td>
                    <Input
                      name="custnm"
                      type="text"
                      value={filters.custnm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>제목</th>
                  <td>
                    <Input
                      name="title"
                      type="text"
                      value={filters.title}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>PJT NO.</th>
                  <td>
                    <Input
                      name="ref_key"
                      type="text"
                      value={filters.ref_key}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
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
                  <th>목적</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="usegb"
                        value={filters.usegb}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>유형</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="type"
                        value={filters.type}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th></th>
                  <td></td>
                </tr>
                <tr>
                  <th>의뢰자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="custprsncd"
                        value={filters.custprsncd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                  <th>물질분야</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="materialtype"
                        value={filters.materialtype}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>물질상세분야</th>
                  <td>
                    <Input
                      name="extra_field2"
                      type="text"
                      value={filters.extra_field2}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
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
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="상담일지"
            >
              <Grid
                style={{ height: "60vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    usegb: usegbListData.find(
                      (items: any) => items.sub_code == row.usegb
                    )?.code_name,
                    person: personListData.find(
                      (items: any) => items.user_id == row.person
                    )?.user_name,
                    materialtype: materialtypeListData.find(
                      (items: any) => items.sub_code == row.materialtype
                    )?.code_name,
                    type: typeListData.find(
                      (items: any) => items.sub_code == row.type
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
                cellRender={customCellRender}
                rowRender={customRowRender}
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
                              : undefined
                          }
                          footerCell={
                            item.sortOrder == 0
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>

        <TabStripTab
          title="상세정보"
          disabled={
            mainDataResult.data.length == 0 && workType == "" ? true : false
          }
        >
          <GridContainerWrap>
            <GridContainer width="40%">
              <GridTitleContainer>
                <GridTitle>회의록</GridTitle>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>NO.</th>
                      <td>
                        <Input
                          name="meetingnum"
                          type="text"
                          value={information.meetingnum}
                          className="readonly"
                        />
                      </td>
                      <th>목적</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="usegb"
                            value={information.usegb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>작성자</th>
                      <td>
                        <Input
                          name="personnm"
                          type="text"
                          value={information.personnm}
                          className="readonly"
                        />
                      </td>
                      <th>작성일자</th>
                      <td>
                        <DatePicker
                          name="recdt"
                          value={information.recdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>유형</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="type"
                            value={information.type}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                    <tr>
                      <th>제목</th>
                      <td colSpan={3}>
                        <Input
                          name="title"
                          type="text"
                          value={information.title}
                          onChange={InputChange}
                          className="required"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={3}>
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
                              onClick={onAttachPbWndClick}
                            />
                          </ButtonInInput>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>장소</th>
                      <td colSpan={3}>
                        <Input
                          name="place"
                          type="text"
                          value={information.place}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>PJT NO.</th>
                      <td colSpan={3}>
                        <Input
                          name="ref_key"
                          type="text"
                          value={information.ref_key}
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
                      <th>업체코드</th>
                      <td>
                        <Input
                          name="custcd"
                          type="text"
                          value={information.custcd}
                          className="readonly"
                        />
                        {information.ref_key == "" ? (
                          <ButtonInInput>
                            <Button
                              type="button"
                              icon="more-horizontal"
                              fillMode="flat"
                              onClick={onCustWndClick}
                            />
                          </ButtonInInput>
                        ) : (
                          ""
                        )}
                      </td>
                      <th>업체명</th>
                      <td>
                        {information.ref_key == "" ? (
                          customOptionData !== null && (
                            <CustomOptionComboBox
                              name="custcd"
                              value={information.custcd}
                              type="new"
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              valueField="custcd"
                              textField="custnm"
                            />
                          )
                        ) : (
                          <Input
                            name="custnm"
                            type="text"
                            value={information.custnm}
                            className="readonly"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>의뢰자코드</th>
                      <td>
                        <Input
                          name="custprsncd"
                          type="text"
                          value={information.custprsncd}
                          className="readonly"
                        />
                        {information.custcd != "" ? (
                          <ButtonInInput>
                            <Button
                              type="button"
                              icon="more-horizontal"
                              fillMode="flat"
                              onClick={onCustPersonWndClick}
                            />
                          </ButtonInInput>
                        ) : (
                          ""
                        )}
                      </td>
                      <th>의뢰자</th>
                      <td>
                        <Input
                          name="custprsnnm"
                          type="text"
                          value={information.custprsnnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>소속</th>
                      <td>
                        <Input
                          name="postnm"
                          type="text"
                          value={information.postnm}
                          className="readonly"
                        />
                      </td>
                      <th>직위</th>
                      <td>
                        <Input
                          name="dptnm"
                          type="text"
                          value={information.dptnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>주소</th>
                      <td colSpan={3}>
                        <Input
                          name="address"
                          type="text"
                          value={information.address}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>전화번호</th>
                      <td colSpan={3}>
                        <Input
                          name="telno"
                          type="text"
                          value={information.telno}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>휴대폰</th>
                      <td colSpan={3}>
                        <Input
                          name="phoneno"
                          type="text"
                          value={information.phoneno}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>메일</th>
                      <td colSpan={3}>
                        <Input
                          name="email"
                          type="text"
                          value={information.email}
                          className="readonly"
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>시험분야</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="testtype"
                            value={information.testtype}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            disabled={information.ref_key != "" ? true : false}
                            className={
                              information.ref_key != "" ? "readonly" : undefined
                            }
                          />
                        )}
                      </td>
                      <th>의뢰목적</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="requestgb"
                            value={information.requestgb}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            disabled={information.ref_key != "" ? true : false}
                            className={
                              information.ref_key != "" ? "readonly" : undefined
                            }
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>물질분야</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="materialtype"
                            value={information.materialtype}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            disabled={information.ref_key != "" ? true : false}
                            className={
                              information.ref_key != "" ? "readonly" : undefined
                            }
                          />
                        )}
                      </td>
                      <th>물질상세분야</th>
                      <td>
                        {information.ref_key != "" ? (
                          <Input
                            name="extra_field2"
                            type="text"
                            value={information.extra_field2}
                            className="readonly"
                          />
                        ) : (
                          <Input
                            name="extra_field2"
                            type="text"
                            value={information.extra_field2}
                            onChange={InputChange}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(60% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>참석자 리스트</GridTitle>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    style={{ width: "100%" }}
                    onClick={() => onPrsnnumWndClick()}
                  >
                    참석자등록
                  </Button>
                  <Button
                    themeColor={"primary"}
                    style={{ width: "100%" }}
                    onClick={() => onPrsnnumWndClick2()}
                  >
                    업체참석자등록
                  </Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap>
                <FormBox>
                  <tbody>
                    <th>참석자</th>
                    <td>
                      <Input
                        name="user_name"
                        type="text"
                        value={information2.user_name}
                        onChange={InputChange2}
                      />
                    </td>
                    <td colSpan={2} style={{ textAlign: "center" }}>
                      <Button
                        themeColor={"primary"}
                        onClick={() => {
                          detailDataResult.data.map((item) => {
                            if (item.num > temp) {
                              temp = item.num;
                            }
                          });
                          
                          const newDataItem = {
                            [DATA_ITEM_KEY]: ++temp,
                            prsnnm: information2.user_name,
                            rowstatus: "N",
                          };
                          setSelectedState2({
                            [newDataItem[DATA_ITEM_KEY2]]: true,
                          });
                          setDetailDataResult((prev) => {
                            return {
                              data: [newDataItem, ...prev.data],
                              total: prev.total + 1,
                            };
                          });
                          setInformation2({
                            user_name: "",
                          });
                        }}
                      >
                        등록
                      </Button>
                    </td>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <Grid
                  style={{ height: "18.5vh" }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
                    })),
                    detailDataState
                  )}
                  {...detailDataState}
                  onDataStateChange={onMainDataStateChange2}
                  // 선택기능
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={detailDataResult.total}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    title="성명"
                    field="prsnnm"
                    width={"120px"}
                    footerCell={mainTotalFooterCell2}
                  />
                </Grid>
              </GridContainer>
              <GridTitleContainer>
                <GridTitle>참고자료</GridTitle>
              </GridTitleContainer>
              <GridContainer style={{ height: "47vh" }}>
                <RichEditor id="refEditor" ref={refEditorRef} />
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
      {attachmentsWindowVisiblePb && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisiblePb}
          setData={getAttachmentsDataPb}
          para={information.attdatnum}
          modal={true}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          workType="N"
          setVisible={setCustWindowVisible}
          setData={setCustData}
          modal={true}
        />
      )}
      {projectWindowVisible && (
        <ProjectsWindow
          setVisible={setProjectWindowVisible}
          setData={setProjectData}
          modal={true}
          pathname="CM_A7000W"
        />
      )}
      {custpersonWindowVisible && (
        <CustomersPersonWindow
          setVisible={setCustPersonWindowVisible}
          custcd={information.custcd}
          setData={setCustPersonData}
          modal={true}
        />
      )}
      {PrsnnumWindowVisible && (
        <PrsnnumMultiWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
          modal={true}
        />
      )}
      {PrsnnumWindowVisible2 && (
        <CustomersPersonMultiWindow
          setVisible={setPrsnnumWindowVisible2}
          custcd={information.custcd}
          setData={setPrsnnumData2}
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

export default CM_A7000W;
