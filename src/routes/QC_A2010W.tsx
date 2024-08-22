import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  convertDateToStrWithTime2,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, IItemData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/QC_A2010W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

let index = 0;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const dateField = ["indt", "qcdt"];
const numberField = ["qty", "qcqty", "badqty", "qcvalue1", "qc_sort"];
const comboField = ["qcresult1"];

let targetRowIndex: null | number = null;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_MA034 ", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "qcresult1" ? "L_MA034" : "";
  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const QC_A2000: React.FC = () => {
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".FormBoxWrap");
      height5 = getHeight(".ButtonContainer3");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setMobileHeight3(getDeviceHeight(true) - height);
        setMobileHeight4(getDeviceHeight(true) - height - height5);
        setWebHeight((getDeviceHeight(true) - height) / 2 - height2);
        setWebHeight2((getDeviceHeight(true) - height) / 2 - height3);
        setWebHeight3(getDeviceHeight(true) - height - height4 - height5);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);
  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001, L_QC006, L_QC100", setBizComponentData);
  const [qcnoListData, setQcnoListData] = useState([{ code: "", name: "" }]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [inspeccdListData, setInspeccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  // 그룹 카테고리 조회
  useEffect(() => {
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setQcnoListData(getBizCom(bizComponentData, "L_QC006"));
      setInspeccdListData(getBizCom(bizComponentData, "L_QC100"));
    }
  }, [bizComponentData]);
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
        prodemp: defaultOption.find((item: any) => item.id == "prodemp")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        qcyn: defaultOption.find((item: any) => item.id == "qcyn")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A2010W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A2010W_001");
      } else {
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          find_row_value: "",
          pgNum: 1,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[0].title = "입고상세정보";
      optionsGridOne.sheets[1].title = "검사실적정보";
      optionsGridOne.sheets[2].title = "검사상세정보";
      _export.save(optionsGridOne);
    }
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    prodemp: "",
    lotnum: "",
    reckey: "",
    itemcd: "",
    itemnm: "",
    qcyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    recdt: "",
    seq1: 0,
    seq2: 0,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    qcnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setPage2(initialPageState);
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));
    setPage({
      ...event.page,
    });
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;
    setPage3(initialPageState);
    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setFilters2((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));
    setPage2({
      ...event.page,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      find_row_value: "",
      isSearch: true,
    }));
    setPage3({
      ...event.page,
    });
  };

  let gridRef: any = useRef(null);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [tempState3, setTempState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [information, setInformation] = useState({
    workType: "N",
    attdatnum: "",
    badqty: 0,
    endtime: "",
    files: "",
    itemcd: "",
    itemnm: "",
    orgdiv: "",
    person: "",
    qcdecision: "",
    qcdt: new Date(),
    qcno: "",
    qcnum: "",
    qcqty: 0,
    remark: "",
    result1: "",
    strtime: "",
  });
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A2010W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PRLIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_person": filters.prodemp,
        "@p_qcyn": filters.qcyn,
        "@p_lotnum": filters.lotnum,
        "@p_reckey": filters.reckey,
        "@p_recdt": "",
        "@p_seq1": 0,
        "@p_seq2": 0,
        "@p_qcnum": "",
        "@p_company_code": companyCode,
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
            (row: any) => row.reckey == filters.find_row_value
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
      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.reckey == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            recdt: selectedRow.recdt,
            seq1: selectedRow.seq1,
            seq2: selectedRow.seq2,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            recdt: rows[0].recdt,
            seq1: rows[0].seq1,
            seq2: rows[0].seq2,
            pgNum: 1,
            isSearch: true,
          }));
        }
      } else {
        setPage2(initialPageState);
        setPage3(initialPageState);
        setMainDataResult2(process([], mainDataState2));
        setMainDataResult3(process([], mainDataState3));
        setInformation({
          workType: "N",
          attdatnum: "",
          badqty: 0,
          endtime: "",
          files: "",
          itemcd: "",
          itemnm: "",
          orgdiv: "",
          person: "",
          qcdecision: "",
          qcdt: new Date(),
          qcno: "",
          qcnum: "",
          qcqty: 0,
          remark: "",
          result1: "",
          strtime: "",
        });
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
      procedureName: "P_QC_A2010W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "QCLIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_person": filters.prodemp,
        "@p_qcyn": filters.qcyn,
        "@p_lotnum": filters.lotnum,
        "@p_reckey": filters.reckey,
        "@p_recdt": filters2.recdt,
        "@p_seq1": filters2.seq1,
        "@p_seq2": filters2.seq2,
        "@p_qcnum": "",
        "@p_company_code": companyCode,
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

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        setFilters3((prev) => ({
          ...prev,
          qcnum: rows[0].qcnum,
          pgNum: 1,
          isSearch: true,
        }));
        setInformation({
          workType: "U",
          attdatnum: rows[0].attdatnum,
          badqty: rows[0].badqty,
          endtime: rows[0].endtime,
          files: rows[0].files,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
          orgdiv: rows[0].orgdiv,
          person: rows[0].person,
          qcdecision: rows[0].qcdecision,
          qcdt: toDate(rows[0].qcdt),
          qcno: rows[0].qcno,
          qcnum: rows[0].qcnum,
          qcqty: rows[0].qcqty,
          remark: rows[0].remark,
          result1: rows[0].result1,
          strtime: rows[0].strtime,
        });
      } else {
        setPage3(initialPageState);
        setMainDataResult3(process([], mainDataState3));
        setInformation({
          workType: "N",
          attdatnum: "",
          badqty: 0,
          endtime: "",
          files: "",
          itemcd: "",
          itemnm: "",
          orgdiv: "",
          person: "",
          qcdecision: "",
          qcdt: new Date(),
          qcno: "",
          qcnum: "",
          qcqty: 0,
          remark: "",
          result1: "",
          strtime: "",
        });
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

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A2010W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "QCDETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_person": filters.prodemp,
        "@p_qcyn": filters.qcyn,
        "@p_lotnum": filters.lotnum,
        "@p_reckey": filters.reckey,
        "@p_recdt": filters2.recdt,
        "@p_seq1": filters2.seq1,
        "@p_seq2": filters2.seq2,
        "@p_qcnum": filters3.qcnum,
        "@p_company_code": companyCode,
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

      setMainDataResult3({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

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
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
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

  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  useEffect(() => {
    if (filters2.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData]);

  useEffect(() => {
    if (filters3.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, customOptionData]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
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
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setFilters2((prev) => ({
      ...prev,
      recdt: selectedRowData.recdt,
      seq1: selectedRowData.seq1,
      seq2: selectedRowData.seq2,
      pgNum: 1,
      isSearch: true,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    const person = userListData.find(
      (items: any) => items.user_name == selectedRowData.person
    )?.user_id;
    const qcno = qcnoListData.find(
      (item: any) => item.name == selectedRowData.qcno
    )?.code;
    setInformation({
      workType: "U",
      attdatnum: selectedRowData.attdatnum,
      badqty: selectedRowData.badqty,
      endtime: selectedRowData.endtime,
      files: selectedRowData.files,
      itemcd: selectedRowData.itemcd,
      itemnm: selectedRowData.itemnm,
      orgdiv: selectedRowData.orgdiv,
      person: person == undefined ? "" : person,
      qcdecision: selectedRowData.qcdecision,
      qcdt: toDate(selectedRowData.qcdt),
      qcno: qcno == undefined ? "" : qcno,
      qcnum: selectedRowData.qcnum,
      qcqty: selectedRowData.qcqty,
      remark: selectedRowData.remark,
      result1: selectedRowData.result1,
      strtime: selectedRowData.strtime,
    });
    setFilters3((prev) => ({
      ...prev,
      qcnum: selectedRowData.qcnum,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
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
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };
  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = "";
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );

    var parts = parseFloat(sum).toString().split(".");
    return parts[0] != "NaN" ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
      </td>
    ) : (
      <td></td>
    );
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
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

  const onNowTime = (e: any) => {
    setInformation((prev) => ({
      ...prev,
      strtime: convertDateToStrWithTime2(new Date()),
    }));
  };

  const onNowTime2 = (e: any) => {
    setInformation((prev) => ({
      ...prev,
      endtime: convertDateToStrWithTime2(new Date()),
    }));
  };
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
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

  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "qcvalue1" || field == "qcresult1") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult3((prev) => {
        return {
          data: mainDataResult3.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != mainDataResult3.data) {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
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
      setTempResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onNewClick = async () => {
    if (mainDataResult.total > 0) {
      let data: any;
      const datas = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      if (unsavedName.length > 0) {
        setDeletedName(unsavedName);
      }
      if (unsavedAttadatnums.length > 0) {
        setDeletedAttadatnums(unsavedAttadatnums);
      }
      //조회조건 파라미터
      const parameters: Iparameters = {
        procedureName: "P_QC_A2010W_Q",
        pageNumber: filters2.pgNum,
        pageSize: filters2.pgSize,
        parameters: {
          "@p_work_type": datas.qcnum == "" ? "QCDETAIL_NEW" : "QCDETAIL_LAST",
          "@p_orgdiv": filters.orgdiv,
          "@p_location": filters.location,
          "@p_frdt": convertDateToStr(filters.frdt),
          "@p_todt": convertDateToStr(filters.todt),
          "@p_itemcd": datas.itemcd,
          "@p_itemnm": filters.itemnm,
          "@p_person": filters.prodemp,
          "@p_qcyn": filters.qcyn,
          "@p_lotnum": filters.lotnum,
          "@p_reckey": filters.reckey,
          "@p_recdt": filters2.recdt,
          "@p_seq1": filters2.seq1,
          "@p_seq2": filters2.seq2,
          "@p_qcnum": datas.qcnum,
          "@p_company_code": companyCode,
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

        setMainDataResult3({
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        });

        if (totalRowCnt > 0) {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
        }
      }
      setInformation({
        workType: "N",
        attdatnum: "",
        badqty: 0,
        endtime: convertDateToStrWithTime2(new Date()),
        files: datas.files,
        itemcd: datas.itemcd,
        itemnm: datas.itemnm,
        orgdiv: datas.orgdiv,
        person: userId,
        qcdecision: datas.qcdecision,
        qcdt: new Date(),
        qcno: "01",
        qcnum: datas.qcnum,
        qcqty: datas.qty,
        remark: "",
        result1: datas.result1,
        strtime: convertDateToStrWithTime2(new Date()),
      });
      if (swiper && isMobile) {
        swiper.slideTo(2);
      }
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const saveList = () => {
    if (!permissions.save) return;
    if (mainDataResult3.total > 0) {
      if (
        convertDateToStr(information.qcdt).substring(0, 4) < "1997" ||
        convertDateToStr(information.qcdt).substring(6, 8) > "31" ||
        convertDateToStr(information.qcdt).substring(6, 8) < "01" ||
        convertDateToStr(information.qcdt).substring(6, 8).length != 2 ||
        information.person == null ||
        information.person == "" ||
        information.person == undefined ||
        information.qcno == null ||
        information.qcno == "" ||
        information.qcno == undefined
      ) {
        alert("필수값을 채워주세요.");
      } else {
        const dataItem = mainDataResult3.data;

        let dataArr: any = {
          rowstatus_s: [],
          qcseq_s: [],
          stdnum_s: [],
          stdrev_s: [],
          stdseq_s: [],
          qc_sort_s: [],
          inspeccd_s: [],
          qc_spec_s: [],
          qcvalue1_s: [],
          qcresult1_s: [],
        };

        if (dataItem.length !== 0) {
          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              qcseq = "",
              stdnum = "",
              stdrev = "",
              stdseq = "",
              qc_sort = "",
              inspeccd = "",
              qc_spec = "",
              qcvalue1 = "",
              qcresult1 = "",
            } = item;

            dataArr.rowstatus_s.push(rowstatus);
            dataArr.qcseq_s.push(qcseq);
            dataArr.stdnum_s.push(stdnum);
            dataArr.stdrev_s.push(stdrev);
            dataArr.stdseq_s.push(stdseq);
            dataArr.qc_sort_s.push(qc_sort);
            dataArr.inspeccd_s.push(inspeccd);
            dataArr.qc_spec_s.push(qc_spec);
            dataArr.qcvalue1_s.push(qcvalue1);
            dataArr.qcresult1_s.push(qcresult1);
          });
        }

        setParaData((prev) => ({
          ...prev,
          workType: information.workType,
          recdt: filters2.recdt,
          seq1: filters2.seq1,
          seq2: filters2.seq2,
          qcnum: information.qcnum == undefined ? "" : information.qcnum,
          qcdt: convertDateToStr(information.qcdt),
          person: information.person,
          qcno: information.qcno,
          qcqty: information.qcqty == undefined ? 0 : information.qcqty,
          badqty: information.badqty == undefined ? 0 : information.badqty,
          strtime: information.strtime,
          endtime: information.endtime,
          qcdecision:
            information.qcdecision == undefined ? "" : information.qcdecision,
          attdatnum:
            information.attdatnum == undefined ? "" : information.attdatnum,
          remark: information.remark == undefined ? "" : information.remark,
          itemcd: information.itemcd,
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          qcseq_s: dataArr.qcseq_s.join("|"),
          stdnum_s: dataArr.stdnum_s.join("|"),
          stdrev_s: dataArr.stdrev_s.join("|"),
          stdseq_s: dataArr.stdseq_s.join("|"),
          qc_sort_s: dataArr.qc_sort_s.join("|"),
          inspeccd_s: dataArr.inspeccd_s.join("|"),
          qc_spec_s: dataArr.qc_spec_s.join("|"),
          qcvalue1_s: dataArr.qcvalue1_s.join("|"),
          qcresult1_s: dataArr.qcresult1_s.join("|"),
        }));
      }
    } else {
      alert("검사항목이 없습니다. 신규 버튼을 눌러 주세요.");
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    recdt: "",
    seq1: 0,
    seq2: 0,
    qcnum: "",
    qcdt: "",
    person: "",
    qcno: "",
    qcqty: 0,
    badqty: 0,
    strtime: "",
    endtime: "",
    qcdecision: "",
    attdatnum: "",
    remark: "",
    itemcd: "",
    rowstatus_s: "",
    qcseq_s: "",
    stdnum_s: "",
    stdrev_s: "",
    stdseq_s: "",
    qc_sort_s: "",
    inspeccd_s: "",
    qc_spec_s: "",
    qcvalue1_s: "",
    qcresult1_s: "",
    userid: userId,
    pc: pc,
  });

  const para: Iparameters = {
    procedureName: "P_QC_A2010W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_recdt": ParaData.recdt,
      "@p_seq1": ParaData.seq1,
      "@p_seq2": ParaData.seq2,
      "@p_qcnum": ParaData.qcnum,
      "@p_qcdt": ParaData.qcdt,
      "@p_person": ParaData.person,
      "@p_qcno": ParaData.qcno,
      "@p_qcqty": ParaData.qcqty,
      "@p_badqty": ParaData.badqty,
      "@p_strtime": ParaData.strtime,
      "@p_endtime": ParaData.endtime,
      "@p_qcdecision": ParaData.qcdecision,
      "@p_remark": ParaData.remark,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_itemcd": ParaData.itemcd,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_qcseq_s": ParaData.qcseq_s,
      "@p_stdnum_s": ParaData.stdnum_s,
      "@p_stdrev_s": ParaData.stdrev_s,
      "@p_stdseq_s": ParaData.stdseq_s,
      "@p_qc_sort_s": ParaData.qc_sort_s,
      "@p_inspeccd_s": ParaData.inspeccd_s,
      "@p_qc_spec_s": ParaData.qcseq_s,
      "@p_qcvalue1_s": ParaData.qcvalue1_s,
      "@p_qcresult1_s": ParaData.qcresult1_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A2010W",
      "@p_company_code": companyCode,
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        recdt: "",
        seq1: 0,
        seq2: 0,
        qcnum: "",
        qcdt: "",
        person: "",
        qcno: "",
        qcqty: 0,
        badqty: 0,
        strtime: "",
        endtime: "",
        qcdecision: "",
        attdatnum: "",
        remark: "",
        itemcd: "",
        rowstatus_s: "",
        qcseq_s: "",
        stdnum_s: "",
        stdrev_s: "",
        stdseq_s: "",
        qc_sort_s: "",
        inspeccd_s: "",
        qc_spec_s: "",
        qcvalue1_s: "",
        qcresult1_s: "",
        userid: userId,
        pc: pc,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      ParaData.workType != "" &&
      permissions.save &&
      ParaData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (ParaData.workType == "D" && permissions.delete) {
      fetchToDelete();
    }
  }, [ParaData, permissions]);

  const questionToDelete = useSysMessage("QuestionToDelete");

  const deleteList = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.total == 0) {
      alert("데이터가 없습니다.");
      return false;
    }
    setParaData((prev) => ({
      ...prev,
      workType: "D",
      qcnum: information.qcnum,
    }));
  };

  const fetchToDelete = async () => {
    if (!permissions.delete) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted2 =
        mainDataResult.data.length == 1 && filters.pgNum == 1;
      const findRow2 = mainDataResult.data.filter(
        (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      // 첨부파일 삭제
      if (information.attdatnum) setDeletedAttadatnums([information.attdatnum]);
      if (isLastDataDeleted2) {
        if (mainDataResult.data.length == 1) {
          setPage({
            skip:
              filters.pgNum == 1 || filters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev) => ({
            ...prev,
            find_row_value: findRow2.reckey,
            pgNum:
              mainDataResult.data.length == 1
                ? prev.pgNum != 1
                  ? prev.pgNum - 1
                  : prev.pgNum
                : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            find_row_value: findRow2.reckey,
            isSearch: true,
          }));
        }
      } else {
        const isLastDataDeleted =
          mainDataResult.data.length == 1 && filters.pgNum > 0;
        const findRowIndex = mainDataResult.data.findIndex(
          (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
        );

        if (isLastDataDeleted) {
          setPage2({
            skip:
              filters.pgNum == 1 || filters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });

          setFilters((prev) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted
              ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev) => ({
            ...prev,
            find_row_value: data.returnString,
            isSearch: true,
          }));
        }
      }
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    setParaData({
      workType: "",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      recdt: "",
      seq1: 0,
      seq2: 0,
      qcnum: "",
      qcdt: "",
      person: "",
      qcno: "",
      qcqty: 0,
      badqty: 0,
      strtime: "",
      endtime: "",
      qcdecision: "",
      attdatnum: "",
      remark: "",
      itemcd: "",
      rowstatus_s: "",
      qcseq_s: "",
      stdnum_s: "",
      stdrev_s: "",
      stdseq_s: "",
      qc_sort_s: "",
      inspeccd_s: "",
      qc_spec_s: "",
      qcvalue1_s: "",
      qcresult1_s: "",
      userid: userId,
      pc: pc,
    });
  };
  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

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
              <th>일자구분</th>
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
              <th>담당자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodemp"
                    value={filters.prodemp}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
              <th>LOT NO</th>
              <td>
                <Input
                  name="lotnum"
                  type="text"
                  value={filters.lotnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>입고번호</th>
              <td>
                <Input
                  name="reckey"
                  type="text"
                  value={filters.reckey}
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
              <th>검사유무</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="qcyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>입고상세내역</GridTitle>
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
                      height: mobileheight,
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        person: userListData.find(
                          (items: any) => items.user_id == row.person
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
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
                                  item.sortOrder == 0
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
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>검사실적정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <div>
                      <Button
                        onClick={onNewClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="file-add"
                        disabled={permissions.save ? false : true}
                      >
                        신규
                      </Button>
                      <Button
                        onClick={deleteList}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="delete"
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(2);
                          }
                        }}
                        icon="arrow-right"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        다음
                      </Button>
                    </div>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{
                      height: mobileheight2,
                    }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        person: userListData.find(
                          (items: any) => items.user_id == row.person
                        )?.user_name,
                        qcno: qcnoListData.find(
                          (item: any) => item.code == row.qcno
                        )?.name,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                      })),
                      mainDataState2
                    )}
                    {...mainDataState2}
                    onDataStateChange={onMainDataStateChange2}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange2}
                    fixedScroll={true}
                    total={mainDataResult2.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
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
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight3 }}>
                  <GridTitleContainer>
                    <GridTitle>검사실적상세정보</GridTitle>
                    <ButtonContainer
                      style={{
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                        icon="arrow-left"
                        themeColor={"primary"}
                        fillMode={"outline"}
                      >
                        이전
                      </Button>
                      <div>
                        <Button
                          onClick={saveList}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          disabled={permissions.save ? false : true}
                        >
                          저장
                        </Button>
                        <Button
                          onClick={() => {
                            if (swiper && isMobile) {
                              swiper.slideTo(3);
                            }
                          }}
                          icon="arrow-right"
                          themeColor={"primary"}
                          fillMode={"outline"}
                        >
                          다음
                        </Button>
                      </div>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>품목코드</th>
                        <td>
                          <Input
                            name="itemcd"
                            type="text"
                            value={information.itemcd}
                            className="readonly"
                          />
                        </td>
                        <th>품목명</th>
                        <td colSpan={3}>
                          <Input
                            name="itemnm"
                            type="text"
                            value={information.itemnm}
                            className="readonly"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>검사일자</th>
                        <td>
                          <DatePicker
                            name="qcdt"
                            value={information.qcdt}
                            format="yyyy-MM-dd"
                            onChange={InputChange}
                            placeholder=""
                            className="required"
                          />
                        </td>
                        <th>검사자</th>
                        <td>
                          {information.workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="person"
                                  value={information.person}
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                  textField="user_name"
                                  valueField="user_id"
                                  type="new"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="person"
                                  value={information.person}
                                  bizComponentId="L_sysUserMaster_001"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                  textField="user_name"
                                  valueField="user_id"
                                />
                              )}
                        </td>
                        <th>검사차수</th>
                        <td>
                          {information.workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="qcno"
                                  value={information.qcno}
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                  textField="name"
                                  valueField="code"
                                  type="new"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="qcno"
                                  value={information.qcno}
                                  bizComponentId="L_QC006"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  className="required"
                                  textField="name"
                                  valueField="code"
                                />
                              )}
                        </td>
                      </tr>
                      <tr>
                        <th>시작시간</th>
                        <td>
                          <Input
                            name="strtime"
                            type="text"
                            value={information.strtime}
                          />
                          <ButtonInInput>
                            <Button
                              onClick={onNowTime}
                              icon="search"
                              fillMode="flat"
                            />
                          </ButtonInInput>
                        </td>
                        <th>종료시간</th>
                        <td>
                          <Input
                            name="endtime"
                            type="text"
                            value={information.endtime}
                          />
                          <ButtonInInput>
                            <Button
                              onClick={onNowTime2}
                              icon="search"
                              fillMode="flat"
                            />
                          </ButtonInInput>
                        </td>
                        <th>검사수량</th>
                        <td>
                          <Input
                            name="qcqty"
                            type="number"
                            value={information.qcqty}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>첨부파일</th>
                        <td colSpan={3}>
                          <Input
                            name="files"
                            type="text"
                            value={information.files}
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
                        <th>불량수량</th>
                        <td>
                          <Input
                            name="badqty"
                            type="number"
                            value={information.badqty}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>비고</th>
                        <td colSpan={5}>
                          <TextArea
                            value={information.remark}
                            name="remark"
                            rows={3}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>검사상세정보</GridTitle>
                  <ButtonContainer
                    style={{
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{
                      height: mobileheight4,
                    }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        inspeccd: inspeccdListData.find(
                          (items: any) => items.sub_code == row.inspeccd
                        )?.code_name,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                      })),
                      mainDataState3
                    )}
                    {...mainDataState3}
                    onDataStateChange={onMainDataStateChange3}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange3}
                    fixedScroll={true}
                    total={mainDataResult3.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange3}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={onMainItemChange3}
                    cellRender={customCellRender3}
                    rowRender={customRowRender3}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
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
                                    : comboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell3
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          {" "}
          <GridContainerWrap>
            <GridContainer width="50%">
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>입고상세내역</GridTitle>
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
                      height: webheight,
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        person: userListData.find(
                          (items: any) => items.user_id == row.person
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
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
                                  item.sortOrder == 0
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
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>검사실적정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{
                      height: webheight2,
                    }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        person: userListData.find(
                          (items: any) => items.user_id == row.person
                        )?.user_name,
                        qcno: qcnoListData.find(
                          (item: any) => item.code == row.qcno
                        )?.name,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                      })),
                      mainDataState2
                    )}
                    {...mainDataState2}
                    onDataStateChange={onMainDataStateChange2}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange2}
                    fixedScroll={true}
                    total={mainDataResult2.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
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
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <FormBoxWrap border={true} className="FormBoxWrap">
                <GridTitleContainer>
                  <GridTitle>검사실적상세정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onNewClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="file-add"
                      disabled={permissions.save ? false : true}
                    >
                      신규
                    </Button>
                    <Button
                      onClick={saveList}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                    <Button
                      onClick={deleteList}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>품목코드</th>
                      <td>
                        <Input
                          name="itemcd"
                          type="text"
                          value={information.itemcd}
                          className="readonly"
                        />
                      </td>
                      <th>품목명</th>
                      <td colSpan={3}>
                        <Input
                          name="itemnm"
                          type="text"
                          value={information.itemnm}
                          className="readonly"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>검사일자</th>
                      <td>
                        <DatePicker
                          name="qcdt"
                          value={information.qcdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          placeholder=""
                          className="required"
                        />
                      </td>
                      <th>검사자</th>
                      <td>
                        {information.workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="person"
                                value={information.person}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="user_name"
                                valueField="user_id"
                                type="new"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="person"
                                value={information.person}
                                bizComponentId="L_sysUserMaster_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="user_name"
                                valueField="user_id"
                              />
                            )}
                      </td>
                      <th>검사차수</th>
                      <td>
                        {information.workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="qcno"
                                value={information.qcno}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="name"
                                valueField="code"
                                type="new"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="qcno"
                                value={information.qcno}
                                bizComponentId="L_QC006"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                className="required"
                                textField="name"
                                valueField="code"
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>시작시간</th>
                      <td>
                        <Input
                          name="strtime"
                          type="text"
                          value={information.strtime}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onNowTime}
                            icon="search"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>종료시간</th>
                      <td>
                        <Input
                          name="endtime"
                          type="text"
                          value={information.endtime}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onNowTime2}
                            icon="search"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>검사수량</th>
                      <td>
                        <Input
                          name="qcqty"
                          type="number"
                          value={information.qcqty}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>첨부파일</th>
                      <td colSpan={3}>
                        <Input
                          name="files"
                          type="text"
                          value={information.files}
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
                      <th>불량수량</th>
                      <td>
                        <Input
                          name="badqty"
                          type="number"
                          value={information.badqty}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={5}>
                        <TextArea
                          value={information.remark}
                          name="remark"
                          rows={3}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>검사상세정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{
                      height: webheight3,
                    }}
                    data={process(
                      mainDataResult3.data.map((row) => ({
                        ...row,
                        inspeccd: inspeccdListData.find(
                          (items: any) => items.sub_code == row.inspeccd
                        )?.code_name,
                        [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                      })),
                      mainDataState3
                    )}
                    {...mainDataState3}
                    onDataStateChange={onMainDataStateChange3}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange3}
                    fixedScroll={true}
                    total={mainDataResult3.total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange3}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={onMainItemChange3}
                    cellRender={customCellRender3}
                    rowRender={customRowRender3}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
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
                                    : comboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell3
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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

export default QC_A2000;
