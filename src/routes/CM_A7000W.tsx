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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
  UsePermissions,
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
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
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import RichEditor from "../components/RichEditor";
import ProjectsWindow from "../components/Windows/CM_A7000W_Project_Window";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersPersonMultiWindow from "../components/Windows/CommonWindows/CustomersPersonMultiWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import PrsnnumMultiWindow from "../components/Windows/CommonWindows/PrsnnumMultiWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isFilterHideState,
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

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;

const CM_A7000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".k-tabstrip-items-wrapper");
      height6 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height5 - height6);
        setMobileHeight2(getDeviceHeight(false) - height2 - height5 - height6);
        setMobileHeight3(getDeviceHeight(false) - height3 - height5 - height6);
        setMobileHeight4(getDeviceHeight(false) - height4 - height5 - height6);
        setWebHeight(getDeviceHeight(true) - height - height5 - height6);
        setWebHeight2(getDeviceHeight(false) - height2 - height5 - height6);
        setWebHeight3(
          (getDeviceHeight(false) - height5 - height6) / 2 - height3
        );
        setWebHeight4(
          (getDeviceHeight(false) - height5 - height6) / 2 - height4
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    tabSelected,
    webheight,
    webheight2,
    webheight3,
    webheight4,
  ]);

  var index = 0;
  var index2 = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);

  let gridRef: any = useRef(null);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const userName = UseGetValueFromSessionItem("user_name");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [workType, setWorkType] = useState("");
  const pc = UseGetValueFromSessionItem("pc");
  const [loginResult] = useRecoilState(loginResultState);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const refEditorRef = useRef<TEditorHandle>(null);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
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
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [projectWindowVisible, setProjectWindowVisible] =
    useState<boolean>(false);
  const [searcProjectWindowVisible, setSearchProjectWindowVisible] =
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

  const onAttachPbWndClick = () => {
    setAttachmentsWindowVisiblePb(true);
  };

  const onProjectWndClick = () => {
    setProjectWindowVisible(true);
  };
  const onSearchProjectWndClick = () => {
    setSearchProjectWindowVisible(true);
  };

  //비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_CM501_603, L_SA019_603, L_Requestgb, L_SA001_603, L_sysUserMaster_001, L_CM700, L_CM701",
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
  const [extra_field2ListData, setExtra_field2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setTypeListData(getBizCom(bizComponentData, "L_CM701"));
      setUsegbListData(getBizCom(bizComponentData, "L_CM700"));
      setTestTypeListData(getBizCom(bizComponentData, "L_SA019_603"));
      setrequestgbListData(getBizCom(bizComponentData, "L_Requestgb"));
      setmaterialtypeListData(getBizCom(bizComponentData, "L_SA001_603"));
      setExtra_field2ListData(getBizCom(bizComponentData, "L_CM501_603"));
    }
  }, [bizComponentData]);

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
  const setSearchProjectData = (data: any) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        ref_key: data.quokey,
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

  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const handleSelectTab = (e: any) => {
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
      setUnsavedAttadatnums([]);
    }
    if (isMobile) {
      setIsFilterHideStates(true);
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
        recdt: data.recdt == "" ? null : toDate(data.recdt),
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
  UseMessages(setMessagesData);

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
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          person: defaultOption.find((item: any) => item.id == "person")
            ?.valueCode,
          usegb: defaultOption.find((item: any) => item.id == "usegb")
            ?.valueCode,
          type: defaultOption.find((item: any) => item.id == "type")?.valueCode,
          extra_field2: defaultOption.find(
            (item: any) => item.id == "extra_field2"
          )?.valueCode,
          find_row_value: queryParams.get("go") as string,
          query: true,
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          frdt: setDefaultDate(customOptionData, "frdt"),
          todt: setDefaultDate(customOptionData, "todt"),
          materialtype: defaultOption.find(
            (item: any) => item.id == "materialtype"
          )?.valueCode,
          person: defaultOption.find((item: any) => item.id == "person")
            ?.valueCode,
          usegb: defaultOption.find((item: any) => item.id == "usegb")
            ?.valueCode,
          type: defaultOption.find((item: any) => item.id == "type")?.valueCode,
          extra_field2: defaultOption.find(
            (item: any) => item.id == "extra_field2"
          )?.valueCode,
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
      find_row_value: "",
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
    orgdiv: sessionOrgdiv,
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
    query: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "CR083T",
    orgdiv: sessionOrgdiv,
    meetingnum: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInformation] = useState<{ [name: string]: any }>({
    orgdiv: sessionOrgdiv,
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

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
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
          if (filters.query == true) {
            setInformation({
              orgdiv: selectedRow.orgdiv,
              meetingnum: selectedRow.meetingnum,
              usegb: selectedRow.usegb,
              person: selectedRow.person,
              personnm: selectedRow.personnm,
              recdt: selectedRow.recdt == "" ? null : toDate(selectedRow.recdt),
              title: selectedRow.title,
              attdatnum:
                selectedRow.attdatnum == undefined ? "" : selectedRow.attdatnum,
              files: selectedRow.files,
              ref_key: selectedRow.ref_key,
              custcd: selectedRow.custcd,
              custnm: selectedRow.custnm,
              custprsncd: selectedRow.custprsncd,
              custprsnnm: selectedRow.custprsnnm,
              postnm: selectedRow.postnm,
              dptnm: selectedRow.dptnm,
              address: selectedRow.address,
              telno: selectedRow.telno,
              phoneno: selectedRow.phoneno,
              email: selectedRow.email,
              testtype: selectedRow.testtype,
              requestgb: selectedRow.requestgb,
              materialtype: selectedRow.materialtype,
              extra_field2: selectedRow.extra_field2,
              place: selectedRow.place,
              type: selectedRow.type,
            });
            fetchDetail();
          }
        } else {
          if (filters.query == true) {
            alert("해당 데이터가 없습니다.");
            setFilters((prev) => ({
              ...prev,
              query: false,
            }));
          }
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
        if (filters.query == true) {
          alert("해당 데이터가 없습니다.");
          setFilters((prev) => ({
            ...prev,
            query: false,
          }));
        }
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
    if (!permissions.view) return;
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
      if (filters.query == true) {
        setTabSelected(1);
        setFilters((prev) => ({
          ...prev,
          query: false,
        }));
      }
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
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    if (mainDataResult.total < 0) {
      return false;
    }

    const mainDataId = Object.getOwnPropertyNames(selectedState)[0];
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == mainDataId
    );

    const id = sessionOrgdiv + "_" + selectedRowData["meetingnum"];

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
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData, customOptionData]);

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
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
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
      recdt: selectedRowData.recdt == "" ? null : toDate(selectedRowData.recdt),
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
    orgdiv: sessionOrgdiv,
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
    remark_s: "",
    userid: userId,
    pc: pc,
    formid: "CM_A7000W",
  });

  const onSaveClick = () => {
    if (!permissions.save) return;
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

    let valid2 = true;

    dataItem.map((item: any) => {
      if (item.prsnnm == "") {
        valid2 = false;
      }
    });

    if (!valid2) {
      alert("참석자 필수값을 채워주세요");
      return false;
    }

    let dataArr: any = {
      rowstatus_s: [],
      prsnnm_s: [],
      remark_s: [],
      seq_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { rowstatus = "", prsnnm = "", remark = "", seq = "" } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.remark_s.push(remark);
      dataArr.seq_s.push(seq);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const { rowstatus = "", prsnnm = "", remark = "", seq = "" } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.prsnnm_s.push(prsnnm);
      dataArr.remark_s.push(remark);
      dataArr.seq_s.push(seq);
    });
    setParaDataSaved({
      workType: workType,
      orgdiv: sessionOrgdiv,
      meetingnum: information.meetingnum,
      meetingseq: 0,
      recdt:
        information.recdt == null ? "" : convertDateToStr(information.recdt),
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
      remark_s: dataArr.remark_s.join("|"),
      userid: userId,
      pc: pc,
      formid: "CM_A7000W",
    });
  };

  useEffect(() => {
    if (
      paraDataSaved.workType != "" &&
      permissions.save &&
      paraDataSaved.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (paraDataSaved.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [paraDataSaved]);

  useEffect(() => {
    if (
      workType != "" &&
      workType == "U" &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      fetchDetail();
    }
  }, [workType, permissions, bizComponentData, customOptionData]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && paraDataSaved.workType != "D") return;
    if (!permissions.delete && paraDataSaved.workType == "D") return;
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
        "@p_remark_s": paraDataSaved.remark_s,
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
      setParaDataSaved({
        workType: "",
        orgdiv: sessionOrgdiv,
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
        remark_s: "",
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
      orgdiv: sessionOrgdiv,
      meetingnum: "",
      usegb: defaultOption.find((item: any) => item.id == "usegb")?.valueCode,
      person: userId,
      personnm: userName,
      recdt: setDefaultDate2(customOptionData, "recdt"),
      title: "",
      files: "",
      attdatnum: "",
      ref_key: "",
      custcd: defaultOption.find((item: any) => item.id == "custcd")?.valueCode,
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
        ?.valueCode,
      requestgb: defaultOption.find((item: any) => item.id == "requestgb")
        ?.valueCode,
      materialtype: defaultOption.find((item: any) => item.id == "materialtype")
        ?.valueCode,
      type: defaultOption.find((item: any) => item.id == "type")?.valueCode,
      extra_field2: defaultOption.find((item: any) => item.id == "extra_field2")
        ?.valueCode,
      place: "",
    });
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!permissions.delete) return;
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
        remark: "",
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
        remark: "",
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

  const onAddClick2 = () => {
    detailDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      prsnnm: "",
      remark: "",
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setDetailDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    const newData = detailDataResult.data.map((item) =>
      item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
        ? {
            ...item,
            [EDIT_FIELD]: field,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );
    setTempResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setDetailDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit2 = () => {
    if (tempResult.data != detailDataResult.data) {
      const newData = detailDataResult.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
        <ButtonContainer>
          {tabSelected == 1 ? (
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
              disabled={permissions.save ? false : true}
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
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
        scrollable={isMobile}
      >
        <TabStripTab
          title="요약정보"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            {!isMobile && (
              <GridTitleContainer>
                <GridTitle>조회조건</GridTitle>
              </GridTitleContainer>
            )}
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
                    <ButtonInInput>
                      <Button
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onSearchProjectWndClick}
                      />
                    </ButtonInInput>
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
                    <Input
                      name="custprsncd"
                      type="text"
                      value={filters.custprsncd}
                      onChange={filterInputChange}
                    />
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
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="extra_field2"
                        value={filters.extra_field2}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th></th>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              {!isMobile && <GridTitle>요약정보</GridTitle>}
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                  disabled={permissions.save ? false : true}
                >
                  신규
                </Button>
                <Button
                  onClick={onDeleteClick}
                  themeColor={"primary"}
                  fillMode={"outline"}
                  icon="delete"
                  disabled={permissions.delete ? false : true}
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
              fileName={getMenuName()}
            >
              <Grid
                style={{
                  height: isMobile ? mobileheight : webheight,
                }}
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
                    extra_field2: extra_field2ListData.find(
                      (items: any) => items.sub_code == row.extra_field2
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
                  customOptionData.menuCustomColumnOptions["grdList"]
                    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    ?.map(
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
            permissions.view
              ? mainDataResult.data.length == 0 && workType == ""
                ? true
                : false
              : true
          }
        >
          {isMobile ? (
            <Swiper
              onSwiper={(swiper) => {
                setSwiper(swiper);
              }}
              onActiveIndexChange={(swiper) => {
                index = swiper.activeIndex;
              }}
            >
              <SwiperSlide key={0}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        {"회의록"}
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap
                    border={true}
                    style={{
                      height: mobileheight2,
                      overflow: "auto",
                    }}
                  >
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
                                disabled={
                                  information.ref_key != "" ? true : false
                                }
                                className={
                                  information.ref_key != ""
                                    ? "readonly"
                                    : undefined
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
                                disabled={
                                  information.ref_key != "" ? true : false
                                }
                                className={
                                  information.ref_key != ""
                                    ? "readonly"
                                    : undefined
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
                                disabled={
                                  information.ref_key != "" ? true : false
                                }
                                className={
                                  information.ref_key != ""
                                    ? "readonly"
                                    : undefined
                                }
                              />
                            )}
                          </td>
                          <th>물질상세분야</th>
                          <td>
                            {customOptionData !== null && (
                              <CustomOptionComboBox
                                name="extra_field2"
                                value={information.extra_field2}
                                type="new"
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                disabled={
                                  information.ref_key != "" ? true : false
                                }
                                className={
                                  information.ref_key != ""
                                    ? "readonly"
                                    : undefined
                                }
                              />
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <ButtonContainer>
                          <Button
                            onClick={() => {
                              if (swiper && isMobile) {
                                swiper.slideTo(0);
                              }
                            }}
                            icon="chevron-left"
                            themeColor={"primary"}
                            fillMode={"flat"}
                          ></Button>
                          참석자 리스트
                        </ButtonContainer>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(2);
                            }
                          }}
                          icon="chevron-right"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </ButtonContainer>
                    </GridTitle>
                    <ButtonContainer>
                      <Button
                        themeColor={"primary"}
                        onClick={() => onPrsnnumWndClick()}
                        disabled={permissions.save ? false : true}
                      >
                        참석자등록
                      </Button>
                      <Button
                        themeColor={"primary"}
                        onClick={() => onPrsnnumWndClick2()}
                        disabled={permissions.save ? false : true}
                      >
                        업체참석자등록
                      </Button>
                      <Button
                        onClick={onAddClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <GridContainer>
                    <Grid
                      style={{
                        height: mobileheight3,
                      }}
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
                      onItemChange={onItemChange}
                      cellRender={customCellRender2}
                      rowRender={customRowRender2}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn
                        field="rowstatus"
                        title=" "
                        width="50px"
                        editable={false}
                      />
                      <GridColumn
                        title="성명"
                        field="prsnnm"
                        width={"120px"}
                        headerCell={RequiredHeader}
                        footerCell={mainTotalFooterCell2}
                      />
                      <GridColumn title="비고" field="remark" width={"120px"} />
                    </Grid>
                  </GridContainer>
                </GridContainer>
              </SwiperSlide>
              <SwiperSlide key={2}>
                <GridContainer>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>
                      <ButtonContainer style={{ justifyContent: "left" }}>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(1);
                            }
                          }}
                          icon="chevron-left"
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                        참고자료
                      </ButtonContainer>
                    </GridTitle>
                  </GridTitleContainer>
                  <GridContainer style={{ height: mobileheight4 }}>
                    <RichEditor id="refEditor" ref={refEditorRef} />
                  </GridContainer>
                </GridContainer>
              </SwiperSlide>
            </Swiper>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="40%">
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>회의록</GridTitle>
                  </GridTitleContainer>
                  <FormBoxWrap style={{ height: webheight2, overflow: "auto" }}>
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
                            <th>의뢰자</th>
                            <td colSpan={3}>
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
                                  disabled={
                                    information.ref_key != "" ? true : false
                                  }
                                  className={
                                    information.ref_key != ""
                                      ? "readonly"
                                      : undefined
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
                                  disabled={
                                    information.ref_key != "" ? true : false
                                  }
                                  className={
                                    information.ref_key != ""
                                      ? "readonly"
                                      : undefined
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
                                  disabled={
                                    information.ref_key != "" ? true : false
                                  }
                                  className={
                                    information.ref_key != ""
                                      ? "readonly"
                                      : undefined
                                  }
                                />
                              )}
                            </td>
                            <th>물질상세분야</th>
                            <td>
                              {customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="extra_field2"
                                  value={information.extra_field2}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  disabled={
                                    information.ref_key != "" ? true : false
                                  }
                                  className={
                                    information.ref_key != ""
                                      ? "readonly"
                                      : undefined
                                  }
                                />
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </FormBoxWrap>
                </GridContainer>
                <GridContainer width={`calc(60% - ${GAP}px)`}>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>참석자 리스트</GridTitle>
                    <ButtonContainer>
                      <Button
                        themeColor={"primary"}
                        style={{ width: "100%" }}
                        onClick={() => onPrsnnumWndClick()}
                        disabled={permissions.save ? false : true}
                      >
                        참석자등록
                      </Button>
                      <Button
                        themeColor={"primary"}
                        style={{ width: "100%" }}
                        onClick={() => onPrsnnumWndClick2()}
                        disabled={permissions.save ? false : true}
                      >
                        업체참석자등록
                      </Button>
                      <Button
                        onClick={onAddClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={permissions.save ? false : true}
                      ></Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <GridContainer>
                    <Grid
                      style={{ height: webheight3 }}
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
                      onItemChange={onItemChange}
                      cellRender={customCellRender2}
                      rowRender={customRowRender2}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn
                        field="rowstatus"
                        title=" "
                        width="50px"
                        editable={false}
                      />
                      <GridColumn
                        title="성명"
                        field="prsnnm"
                        width={"120px"}
                        headerCell={RequiredHeader}
                        footerCell={mainTotalFooterCell2}
                      />
                      <GridColumn title="비고" field="remark" width={"120px"} />
                    </Grid>
                  </GridContainer>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>참고자료</GridTitle>
                  </GridTitleContainer>
                  <GridContainer style={{ height: webheight4 }}>
                    <RichEditor id="refEditor" ref={refEditorRef} />
                  </GridContainer>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {attachmentsWindowVisiblePb && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisiblePb}
          setData={getAttachmentsDataPb}
          para={information.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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
        />
      )}
      {searcProjectWindowVisible && (
        <ProjectsWindow
          setVisible={setSearchProjectWindowVisible}
          setData={setSearchProjectData}
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
