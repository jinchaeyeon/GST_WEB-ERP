import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
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
import CheckBoxCell from "../components/Cells/CheckBoxCell";
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
  findMessage,
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
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData, ICustData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { gridList } from "../store/columns/CM_A4000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;

var height = 0;
var height2 = 0;
var height3 = 0;
const CM_A4100W: React.FC = () => {
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    frdt: new Date(),
    todt: new Date(),
    datnum: "",
    custcd: "",
    custnm: "",
    title: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    datnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".ButtonContainer2");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2(getDeviceHeight(true) - height);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A4000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A4000W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_sysUserMaster_001", setBizComponentData);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [custWindowVisible2, setCustWindowVisible2] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onCustWndClick2 = () => {
    setCustWindowVisible2(true);
  };
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };
  const setCustData2 = (data: ICustData) => {
    setInformation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const [information, setInformation] = useState({
    workType: "N",
    apperson: "",
    attdatnum: "",
    files: "",
    chkperson: "",
    chkyn: "N",
    closeyn: "N",
    contents: "",
    custcd: "",
    custnm: "",
    datnum: "",
    filename: "",
    orgdiv: sessionOrgdiv,
    person: userId,
    recdt: new Date(),
    title: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_datnum": filters.datnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_title": filters.title,
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
            (row: any) => row.datnum == filters.find_row_value
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
            : rows.find((row: any) => row.datnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            datnum: selectedRow.datnum,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            datnum: rows[0].datnum,
          }));
        }
      }
    }
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
      procedureName: "P_CM_A4000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_datnum": filters2.datnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_title": filters.title,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setInformation({
          workType: "U",
          apperson: rows[0].apperson,
          attdatnum: rows[0].attdatnum,
          files: rows[0].files,
          chkperson: rows[0].chkperson,
          chkyn: rows[0].chkyn,
          closeyn: rows[0].closeyn,
          contents: rows[0].contents,
          custcd: rows[0].custcd,
          custnm: rows[0].custnm,
          datnum: rows[0].datnum,
          filename: rows[0].filename,
          orgdiv: rows[0].orgdiv,
          person: rows[0].person,
          recdt: toDate(rows[0].recdt),
          title: rows[0].title,
        });
      } else {
        setInformation({
          workType: "N",
          apperson: "",
          attdatnum: "",
          files: "",
          chkperson: "",
          chkyn: "N",
          closeyn: "N",
          contents: "",
          custcd: "",
          custnm: "",
          datnum: "",
          filename: "",
          orgdiv: sessionOrgdiv,
          person: userId,
          recdt: new Date(),
          title: "",
        });
      }
    }
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
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData, bizComponentData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      customOptionData !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);

  let gridRef: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

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
      isSearch: true,
      pgNum: 1,
      datnum: selectedRowData.datnum,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
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
  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chk") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit = () => {
    const newData = mainDataResult.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const CheckChange = (e: any) => {
    const { value, name } = e.target;
    if (value != null) {
      if (value == false || value == "N") {
        setInformation((prev) => ({
          ...prev,
          [name]: "N",
        }));
      } else {
        setInformation((prev) => ({
          ...prev,
          [name]: "Y",
        }));
      }
    }
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

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

  const onAddClick = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );

    setInformation((prev) => ({
      workType: "N",
      apperson: defaultOption.find((item: any) => item.id == "apperson")
        ?.valueCode,
      attdatnum: "",
      files: "",
      chkperson: defaultOption.find((item: any) => item.id == "chkperson")
        ?.valueCode,
      chkyn: "N",
      closeyn: "N",
      contents: "",
      custcd: "",
      custnm: "",
      datnum: "",
      filename: "",
      orgdiv: sessionOrgdiv,
      person: defaultOption.find((item: any) => item.id == "person")?.valueCode,
      recdt: new Date(),
      title: "",
    }));
    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onSaveClick = () => {
    if (information.title == "") {
      alert("제목을 입력해주세요.");
    } else {
      setParaData((prev) => ({
        ...prev,
        workType: information.workType,
        orgdiv: information.orgdiv,
        location: sessionLocation,
        datnum: information.datnum,
        recdt: convertDateToStr(information.recdt),
        custcd: information.custcd,
        title: information.title,
        contents: information.contents,
        person: information.person,
        chkperson: information.chkperson,
        chkyn: information.chkyn,
        apperson: information.apperson,
        closeyn: information.closeyn,
        attdatnum: information.attdatnum,
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    datnum: "",
    recdt: "",
    custcd: "",
    title: "",
    contents: "",
    person: "",
    chkperson: "",
    chkyn: "",
    apperson: "",
    closeyn: "",
    attdatnum: "",
    datnum_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A4000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_datnum": paraData.datnum,
      "@p_recdt": paraData.recdt,
      "@p_custcd": paraData.custcd,
      "@p_title": paraData.title,
      "@p_contents": paraData.contents,
      "@p_person": paraData.person,
      "@p_chkperson": paraData.chkperson,
      "@p_chkyn": paraData.chkyn,
      "@p_apperson": paraData.apperson,
      "@p_closeyn": paraData.closeyn,
      "@p_attdatnum": paraData.attdatnum,
      "@p_datnum_s": paraData.datnum_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A4000W",
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && paraData.workType != "D") return;
    if (!permissions.delete && paraData.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        find_row_value: data.returnString,
      }));
      if (paraData.workType == "D" && information.attdatnum != "") {
        setDeletedAttadatnums([information.attdatnum]);
      }

      setUnsavedName([]);
      setUnsavedAttadatnums([]);

      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        datnum: "",
        recdt: "",
        custcd: "",
        title: "",
        contents: "",
        person: "",
        chkperson: "",
        chkyn: "",
        apperson: "",
        closeyn: "",
        attdatnum: "",
        datnum_s: "",
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
      paraData.workType != "" &&
      permissions.save &&
      paraData.workType != "D"
    ) {
      fetchTodoGridSaved();
    }
    if (paraData.workType == "D" && permissions.delete) {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = (e: any) => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.data.length != 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        datnum: information.datnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onCopyClick = () => {
    if (!permissions.save) return;

    const dataItem = mainDataResult.data.filter(
      (item: any) => item.chk == true
    );

    let valid = true;

    dataItem.map((item) => {
      if (item.rowstatus == "N") {
        valid = false;
      }
    });

    if (valid != true) {
      alert("신규행은 저장 후 복사를 진행해주세요.");
      return false;
    }

    if (dataItem.length == 0) return false;

    let dataArr: any = {
      datnum_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { datnum } = item;
      dataArr.datnum_s.push(datnum);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "COPY",
      datnum_s: dataArr.datnum_s.join("|"),
    }));
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
              <th>문서번호</th>
              <td>
                <Input
                  name="datnum"
                  type="text"
                  value={filters.datnum}
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
            </tr>
            <tr>
              <th>제목</th>
              <td colSpan={5}>
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
                  <GridTitle>요약정보</GridTitle>
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
                      onClick={onCopyClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="copy"
                      disabled={permissions.save ? false : true}
                    >
                      복사
                    </Button>
                    <Button
                      onClick={onDeleteClick}
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
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-right"
                      themeColor={"primary"}
                      fillMode={"flat"}
                    ></Button>
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
                      height: mobileheight,
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
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
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell2}
                      cell={CheckBoxCell}
                    />
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
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <ButtonContainer
                  style={{ justifyContent: "space-between" }}
                  className="ButtonContainer2"
                >
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
                  <Button
                    onClick={onSaveClick}
                    themeColor={"primary"}
                    fillMode="outline"
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                </ButtonContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight2 }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>문서번호</th>
                        <td colSpan={3}>
                          <Input
                            name="datnum"
                            type="text"
                            value={information.datnum}
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
                        <th>업체코드</th>
                        <td>
                          <Input
                            name="custcd"
                            type="text"
                            value={information.custcd}
                            className="readonly"
                          />
                          <ButtonInInput>
                            <Button
                              type="button"
                              icon="more-horizontal"
                              fillMode="flat"
                              onClick={onCustWndClick2}
                            />
                          </ButtonInInput>
                        </td>
                        <th>업체명</th>
                        <td>
                          <Input
                            name="custnm"
                            type="text"
                            value={information.custnm}
                            className="readonly"
                          />
                        </td>
                        <th>작성자</th>
                        <td>
                          {information.workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="person"
                                  value={information.person}
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
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
                                  valueField="user_id"
                                  textField="user_name"
                                />
                              )}
                        </td>
                      </tr>
                      <tr>
                        <th>검토자</th>
                        <td>
                          {information.workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="chkperson"
                                  value={information.chkperson}
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  textField="user_name"
                                  valueField="user_id"
                                  type="new"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="chkperson"
                                  value={information.chkperson}
                                  bizComponentId="L_sysUserMaster_001"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  valueField="user_id"
                                  textField="user_name"
                                />
                              )}
                        </td>
                        <th>승인자</th>
                        <td>
                          {information.workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="apperson"
                                  value={information.apperson}
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  textField="user_name"
                                  valueField="user_id"
                                  type="new"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentComboBox
                                  name="apperson"
                                  value={information.apperson}
                                  bizComponentId="L_sysUserMaster_001"
                                  bizComponentData={bizComponentData}
                                  changeData={ComboBoxChange}
                                  valueField="user_id"
                                  textField="user_name"
                                />
                              )}
                        </td>
                        <td>
                          <Checkbox
                            name="chkyn"
                            label={"검토여부"}
                            value={information.chkyn == "Y" ? true : false}
                            onChange={CheckChange}
                          />
                        </td>
                        <td>
                          <Checkbox
                            name="closeyn"
                            label={"승인여부"}
                            value={information.closeyn == "Y" ? true : false}
                            onChange={CheckChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>제목</th>
                        <td colSpan={5}>
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
                        <th>내용</th>
                        <td colSpan={5}>
                          <TextArea
                            value={information.contents}
                            name="contents"
                            rows={40}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>첨부파일</th>
                        <td colSpan={5}>
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
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <GridContainerWrap>
          <GridContainer width="50%">
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>요약정보</GridTitle>
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
                  onClick={onCopyClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="copy"
                  disabled={permissions.save ? false : true}
                >
                  복사
                </Button>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="delete"
                  disabled={permissions.delete ? false : true}
                >
                  삭제
                </Button>
                <Button
                  onClick={onSaveClick}
                  themeColor={"primary"}
                  fillMode="outline"
                  icon="save"
                  disabled={permissions.save ? false : true}
                >
                  저장
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
                  height: webheight,
                }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
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
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
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
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : undefined
                            }
                          ></GridColumn>
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainer width={`calc(50% - ${GAP}px)`}>
            <FormBoxWrap border={true} style={{ height: webheight2 }}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>문서번호</th>
                    <td colSpan={3}>
                      <Input
                        name="datnum"
                        type="text"
                        value={information.datnum}
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
                    <th>업체코드</th>
                    <td>
                      <Input
                        name="custcd"
                        type="text"
                        value={information.custcd}
                        className="readonly"
                      />
                      <ButtonInInput>
                        <Button
                          type="button"
                          icon="more-horizontal"
                          fillMode="flat"
                          onClick={onCustWndClick2}
                        />
                      </ButtonInInput>
                    </td>
                    <th>업체명</th>
                    <td>
                      <Input
                        name="custnm"
                        type="text"
                        value={information.custnm}
                        className="readonly"
                      />
                    </td>
                    <th>작성자</th>
                    <td>
                      {information.workType == "N"
                        ? customOptionData !== null && (
                            <CustomOptionComboBox
                              name="person"
                              value={information.person}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
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
                              valueField="user_id"
                              textField="user_name"
                            />
                          )}
                    </td>
                  </tr>
                  <tr>
                    <th>검토자</th>
                    <td>
                      {information.workType == "N"
                        ? customOptionData !== null && (
                            <CustomOptionComboBox
                              name="chkperson"
                              value={information.chkperson}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              textField="user_name"
                              valueField="user_id"
                              type="new"
                            />
                          )
                        : bizComponentData !== null && (
                            <BizComponentComboBox
                              name="chkperson"
                              value={information.chkperson}
                              bizComponentId="L_sysUserMaster_001"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                              valueField="user_id"
                              textField="user_name"
                            />
                          )}
                    </td>
                    <th>승인자</th>
                    <td>
                      {information.workType == "N"
                        ? customOptionData !== null && (
                            <CustomOptionComboBox
                              name="apperson"
                              value={information.apperson}
                              customOptionData={customOptionData}
                              changeData={ComboBoxChange}
                              textField="user_name"
                              valueField="user_id"
                              type="new"
                            />
                          )
                        : bizComponentData !== null && (
                            <BizComponentComboBox
                              name="apperson"
                              value={information.apperson}
                              bizComponentId="L_sysUserMaster_001"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                              valueField="user_id"
                              textField="user_name"
                            />
                          )}
                    </td>
                    <td>
                      <Checkbox
                        name="chkyn"
                        label={"검토여부"}
                        value={information.chkyn == "Y" ? true : false}
                        onChange={CheckChange}
                      />
                    </td>
                    <td>
                      <Checkbox
                        name="closeyn"
                        label={"승인여부"}
                        value={information.closeyn == "Y" ? true : false}
                        onChange={CheckChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>제목</th>
                    <td colSpan={5}>
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
                    <th>내용</th>
                    <td colSpan={5}>
                      <TextArea
                        value={information.contents}
                        name="contents"
                        rows={40}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>첨부파일</th>
                    <td colSpan={5}>
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
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </GridContainerWrap>
      )}
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
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

export default CM_A4100W;
