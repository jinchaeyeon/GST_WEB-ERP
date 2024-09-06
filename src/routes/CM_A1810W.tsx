import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  MultiSelect,
  MultiSelectChangeEvent,
} from "@progress/kendo-react-dropdowns";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
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
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
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
  dateformat,
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
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
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
import { gridList } from "../store/columns/CM_A1810W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
const dateField = ["cotracdt", "recdt", "finexpdt", "date"];
const checkboxField = [
  "progress_status",
  "is_finished",
  "is_monitoring",
  "finyn",
];
const requiredField = ["date", "title"];
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
let deletedMainRows2: object[] = [];

const CM_A1810W: React.FC = () => {
  let temp2 = 0;
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [tabSelected, setTabSelected] = useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".k-tabstrip-items-wrapper");
      height4 = getHeight(".FormBoxWrap");
      height5 = getHeight(".ButtonContainer2");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(getDeviceHeight(false) - height2 - height3);
        setMobileHeight3(getDeviceHeight(false) - height2 - height3 - height5);
        setWebHeight(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight2(
          getDeviceHeight(false) - height2 - height3 - height4 - height5
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, tabSelected, webheight2]);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
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
  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const userName = UseGetValueFromSessionItem("user_name");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
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
        date_type: defaultOption.find((item: any) => item.id == "date_type")
          ?.valueCode,
        pjt_person: defaultOption.find((item: any) => item.id == "pjt_person")
          ?.valueCode,
        progress_status: defaultOption.find(
          (item: any) => item.id == "progress_status"
        )?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [Information, setInformation] = useState<{ [name: string]: any }>({
    workType: "N",
    attdatnum: "",
    cotracdt: new Date(),
    custcd: "",
    custnm: "",
    devmngnum: "",
    files: "",
    finchkdt: "",
    findt: "",
    finexpdt: new Date(),
    is_finished: "N",
    lvl: "",
    midchkdt: "",
    number: 0,
    pjtmanager: "",
    pjtperson: userId,
    progress_status: "Y",
    project: "",
    recdt: new Date(),
    remark: "",
  });
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_finyn2, L_sysUserMaster_001, L_CUST", setBizComponentData);
  const [statusListData, setStatusListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [custListData, setCustListData] = useState([
    { custcd: "", custnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setStatusListData(getBizCom(bizComponentData, "L_finyn2"));
      setCustListData(getBizCom(bizComponentData, "L_CUST"));
    }
  }, [bizComponentData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  const filterMultiSelectChange = (event: MultiSelectChangeEvent) => {
    const values = event.value;
    const name = event.target.props.name ?? "";

    setFilters((prev) => ({
      ...prev,
      [name]: values,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "list",
    date_type: "",
    frdt: new Date(),
    todt: new Date(),
    customer_name: "",
    status: [
      { sub_code: "Y", code_name: "완료" },
      { sub_code: "N", code_name: "미완료" },
    ],
    progress_status: "",
    pjt_person: "",
    project: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "detail",
    devmngnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  let gridRef: any = useRef(null);
  function getName(data: { sub_code: string }[]) {
    let str = "";
    data.map((item: { sub_code: string }) => (str += item.sub_code + "|"));
    return data.length > 0 ? str.slice(0, -1) : str;
  }
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const status =
      filters.status.length == 0
        ? getName(statusListData)
        : filters.status.length == 1
        ? filters.status[0].sub_code
        : getName(filters.status);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A1810W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_date_type": filters.date_type,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_customer_name": filters.customer_name,
        "@p_progress_status": filters.progress_status,
        "@p_pjt_person": filters.pjt_person,
        "@p_project": filters.project,
        "@p_status": status,
        "@p_devmngnum": "",
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.devmngnum == filters.find_row_value
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
            : rows.find((row: any) => row.devmngnum == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            attdatnum: selectedRow.attdatnum,
            cotracdt: toDate(selectedRow.cotracdt),
            custcd: selectedRow.custcd,
            custnm: selectedRow.custnm,
            devmngnum: selectedRow.devmngnum,
            files: selectedRow.files,
            finchkdt: selectedRow.finchkdt,
            findt: selectedRow.findt,
            finexpdt: toDate(selectedRow.finexpdt),
            is_finished: selectedRow.is_finished,
            lvl: selectedRow.lvl,
            midchkdt: selectedRow.midchkdt,
            number: selectedRow.number,
            pjtmanager: selectedRow.pjtmanager,
            pjtperson: selectedRow.pjtperson,
            progress_status: selectedRow.progress_status,
            project: selectedRow.project,
            recdt: toDate(selectedRow.recdt),
            remark: selectedRow.remark,
          });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            devmngnum: selectedRow.devmngnum,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setInformation({
            workType: "U",
            attdatnum: rows[0].attdatnum,
            cotracdt: toDate(rows[0].cotracdt),
            custcd: rows[0].custcd,
            custnm: rows[0].custnm,
            devmngnum: rows[0].devmngnum,
            files: rows[0].files,
            finchkdt: rows[0].finchkdt,
            findt: rows[0].findt,
            finexpdt: toDate(rows[0].finexpdt),
            is_finished: rows[0].is_finished,
            lvl: rows[0].lvl,
            midchkdt: rows[0].midchkdt,
            number: rows[0].number,
            pjtmanager: rows[0].pjtmanager,
            pjtperson: rows[0].pjtperson,
            progress_status: rows[0].progress_status,
            project: rows[0].project,
            recdt: toDate(rows[0].recdt),
            remark: rows[0].remark,
          });
          setFilters2((prev) => ({
            ...prev,
            isSearch: true,
            pgNum: 1,
            devmngnum: rows[0].devmngnum,
          }));
        }
      } else {
        setInformation({
          workType: "N",
          attdatnum: "",
          cotracdt: new Date(),
          custcd: "",
          custnm: "",
          devmngnum: "",
          files: "",
          finchkdt: "",
          findt: "",
          finexpdt: new Date(),
          is_finished: "N",
          lvl: "",
          midchkdt: "",
          number: 0,
          pjtmanager: "",
          pjtperson: userId,
          progress_status: "Y",
          project: "",
          recdt: new Date(),
          remark: "",
        });
        setMainDataResult2(process([], mainDataState2));
        setPage2(initialPageState);
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
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const status =
      filters.status.length == 0
        ? getName(statusListData)
        : filters.status.length == 1
        ? filters.status[0].sub_code
        : getName(filters.status);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A1810W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.work_type,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_date_type": filters.date_type,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_customer_name": filters.customer_name,
        "@p_progress_status": filters.progress_status,
        "@p_pjt_person": filters.pjt_person,
        "@p_project": filters.project,
        "@p_status": status,
        "@p_devmngnum": filters2.devmngnum,
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
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
      }));

      setMainDataResult2((prev) => {
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
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
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
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, customOptionData, bizComponentData]);
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
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    const pjtperson = userListData.find(
      (items: any) => items.user_name == selectedRowData.pjtperson
    )?.user_id;
    const pjtmanager = userListData.find(
      (items: any) => items.user_name == selectedRowData.pjtmanager
    )?.user_id;

    setInformation({
      workType: "U",
      attdatnum: selectedRowData.attdatnum,
      cotracdt: toDate(selectedRowData.cotracdt),
      custcd: selectedRowData.custcd,
      custnm: selectedRowData.custnm,
      devmngnum: selectedRowData.devmngnum,
      files: selectedRowData.files,
      finchkdt: selectedRowData.finchkdt,
      findt: selectedRowData.findt,
      finexpdt: toDate(selectedRowData.finexpdt),
      is_finished: selectedRowData.is_finished,
      lvl: selectedRowData.lvl,
      midchkdt: selectedRowData.midchkdt,
      number: selectedRowData.number,
      pjtmanager: pjtmanager == undefined ? "" : pjtmanager,
      pjtperson: pjtperson == undefined ? "" : pjtperson,
      progress_status: selectedRowData.progress_status,
      project: selectedRowData.project,
      recdt: toDate(selectedRowData.recdt),
      remark: selectedRowData.remark,
    });
    setFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      devmngnum: selectedRowData.devmngnum,
    }));
  };

  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (tabSelected == 0) {
      if (_export !== null && _export !== undefined) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    } else {
      if (_export2 !== null && _export2 !== undefined) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "상세정보";
        _export2.save(optionsGridTwo);
      }
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A1810W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "CM_A1810W_001");
      } else if (
        filters.date_type == "" ||
        filters.date_type == undefined ||
        filters.date_type == null
      ) {
        throw findMessage(messagesData, "CM_A1810W_001");
      } else if (
        filters.progress_status == "" ||
        filters.progress_status == undefined ||
        filters.progress_status == null
      ) {
        throw findMessage(messagesData, "CM_A1810W_001");
      } else {
        if (unsavedName.length > 0) {
          setDeletedName(unsavedName);
        }
        if (unsavedAttadatnums.length > 0) {
          setDeletedAttadatnums(unsavedAttadatnums);
        }
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
        setTabSelected(0);
      }
    } catch (e) {
      alert(e);
    }
  };

  const onAddClick = () => {
    setPage2(initialPageState);
    setMainDataResult2(process([], mainDataState2));
    setTabSelected(1);
    if (unsavedName.length > 0) {
      setDeletedName(unsavedName);
    }
    if (unsavedAttadatnums.length > 0) {
      setDeletedAttadatnums(unsavedAttadatnums);
    }
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    const custcd = defaultOption.find(
      (item: any) => item.id == "custcd"
    )?.valueCode;
    const custnm = custListData.find(
      (items: any) =>
        items.custcd ==
        defaultOption.find((item: any) => item.id == "custcd")?.valueCode
    )?.custnm;
    setInformation({
      workType: "N",
      attdatnum: "",
      cotracdt: setDefaultDate2(customOptionData, "cotracdt"),
      custcd: custcd == undefined ? "" : custcd,
      custnm: custnm == undefined ? "" : custnm,
      devmngnum: "",
      files: "",
      finchkdt: "",
      findt: "",
      finexpdt: setDefaultDate2(customOptionData, "finexpdt"),
      is_finished: "N",
      lvl: "",
      midchkdt: "",
      number: 0,
      pjtmanager: defaultOption.find((item: any) => item.id == "pjtmanager")
        ?.valueCode,
      pjtperson: defaultOption.find((item: any) => item.id == "pjtperson")
        ?.valueCode,
      progress_status: "Y",
      project: "",
      recdt: setDefaultDate2(customOptionData, "recdt"),
      remark: "",
    });
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    if (name == "progress_status") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
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

    if (name == "custcd") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const setCustData = (data: ICustData) => {
    setInformation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
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

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows2.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }

    setMainDataResult2((prev) => ({
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
    mainDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
      date: convertDateToStr(new Date()),
      finyn: "N",
      guid: "",
      is_monitoring: "Y",
      sort_order: 1,
      title: "",
      user_name: userName,
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setPage2((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  type TDataInfo = {
    DATA_ITEM_KEY: string;
    selectedState: {
      [id: string]: boolean | number[];
    };
    dataResult: DataResult;
    setDataResult: (p: any) => any;
  };

  type TArrowBtnClick = {
    direction: string;
    dataInfo: TDataInfo;
  };

  const onArrowsBtnClick = (para: TArrowBtnClick) => {
    const { direction, dataInfo } = para;
    const { DATA_ITEM_KEY, selectedState, dataResult, setDataResult } =
      dataInfo;
    const selectedField = Object.getOwnPropertyNames(selectedState)[0];

    const rowData = dataResult.data.find(
      (row) => row[DATA_ITEM_KEY] == selectedField
    );

    const rowIndex = dataResult.data.findIndex(
      (row) => row[DATA_ITEM_KEY] == selectedField
    );

    if (rowIndex == -1) {
      alert("이동시킬 행을 선택해주세요.");
      return false;
    }

    if (!(rowIndex == 0 && direction == "UP")) {
      const newData = dataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      let replaceData = 0;
      if (direction == "UP" && rowIndex != 0) {
        replaceData = dataResult.data[rowIndex - 1].sort_order;
      } else {
        replaceData = dataResult.data[rowIndex + 1].sort_order;
      }

      newData.splice(rowIndex, 1);
      newData.splice(rowIndex + (direction == "UP" ? -1 : 1), 0, rowData);
      if (direction == "UP" && rowIndex != 0) {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] == rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                sort_order: replaceData,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex - 1].num
            ? {
                ...item,
                sort_order: rowData.sort_order,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      } else {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] == rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                sort_order: replaceData,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex + 1].num
            ? {
                ...item,
                sort_order: rowData.sort_order,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                [EDIT_FIELD]: undefined,
              }
        );

        setDataResult((prev: any) => {
          return {
            data: newDatas,
            total: prev.total,
          };
        });
      }
    }
  };

  const arrowBtnClickPara = {
    DATA_ITEM_KEY: DATA_ITEM_KEY2,
    selectedState: selectedState2,
    dataResult: mainDataResult2,
    setDataResult: setMainDataResult2,
  };

  const onItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "user_name") {
      const newData = mainDataResult2.data.map((item) =>
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev: { total: any }) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onSaveClick = () => {
    if (!permissions.save) return;

    const dataItem = mainDataResult2.data;

    let valid = true;

    dataItem.map((item) => {
      if(item.date == "" || item.title == "") {
        valid = false
      }
    })

    if(valid != true) {
      alert("필수값을 채워주세요.");
      return false;
    }

    if (dataItem.length == 0) {
      setParaData((prev) => ({
        ...prev,
        workType: Information.workType,
        devmngnum: Information.devmngnum,
        custcd: Information.custcd,
        project: Information.project,
        recdt: convertDateToStr(Information.recdt),
        cotracdt: convertDateToStr(Information.cotracdt),
        finexpdt: convertDateToStr(Information.finexpdt),
        pjtmanager: Information.pjtmanager,
        pjtperson: Information.pjtperson,
        remark: Information.remark,
        attdatnum: Information.attdatnum,
        progress_status: Information.progress_status,
      }));
    } else {
      let dataArr: any = {
        guid_s: [],
        sort_order_s: [],
        date_s: [],
        title_s: [],
        finyn_s: [],
        is_monitoring_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const {
          guid = "",
          sort_order = "",
          date = "",
          title = "",
          finyn = "",
          is_monitoring = "",
        } = item;
        dataArr.guid_s.push(guid);
        dataArr.sort_order_s.push(sort_order);
        dataArr.date_s.push(date);
        dataArr.title_s.push(title);
        dataArr.finyn_s.push(
          finyn == true ? "Y" : finyn == false ? "N" : finyn
        );
        dataArr.is_monitoring_s.push(
          is_monitoring == true
            ? "Y"
            : is_monitoring == false
            ? "N"
            : is_monitoring
        );
      });
      setParaData((prev) => ({
        ...prev,
        workType: Information.workType,
        devmngnum: Information.devmngnum,
        custcd: Information.custcd,
        project: Information.project,
        recdt: convertDateToStr(Information.recdt),
        cotracdt: convertDateToStr(Information.cotracdt),
        finexpdt: convertDateToStr(Information.finexpdt),
        pjtmanager: Information.pjtmanager,
        pjtperson: Information.pjtperson,
        remark: Information.remark,
        attdatnum: Information.attdatnum,
        progress_status: Information.progress_status,
        guid_s: dataArr.guid_s.join("|"),
        sort_order_s: dataArr.sort_order_s.join("|"),
        date_s: dataArr.date_s.join("|"),
        title_s: dataArr.title_s.join("|"),
        finyn_s: dataArr.finyn_s.join("|"),
        is_monitoring_s: dataArr.is_monitoring_s.join("|"),
      }));
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    devmngnum: "",
    custcd: "",
    project: "",
    recdt: "",
    cotracdt: "",
    finexpdt: "",
    pjtmanager: "",
    pjtperson: "",
    remark: "",
    attdatnum: "",
    progress_status: "",
    guid_s: "",
    sort_order_s: "",
    date_s: "",
    title_s: "",
    finyn_s: "",
    is_monitoring_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A1810W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": sessionLocation,
      "@p_devmngnum": ParaData.devmngnum,
      "@p_custcd": ParaData.custcd,
      "@p_project": ParaData.project,
      "@p_recdt": ParaData.recdt,
      "@p_cotracdt": ParaData.cotracdt,
      "@p_finexpdt": ParaData.finexpdt,
      "@p_pjtmanager": ParaData.pjtmanager,
      "@p_pjtperson": ParaData.pjtperson,
      "@p_remark": ParaData.remark,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_progress_status": ParaData.progress_status,
      "@p_guid": ParaData.guid_s,
      "@p_sort_order": ParaData.sort_order_s,
      "@p_date": ParaData.date_s,
      "@p_title": ParaData.title_s,
      "@p_finyn": ParaData.finyn_s,
      "@p_is_monitoring": ParaData.is_monitoring_s,
      "@p_form_id": "CM_A1810W",
      "@p_pc": pc,
      "@p_userid": userId,
    },
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.total > 0) {
      const data = mainDataResult.data.filter(
        (item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        devmngnum: data.devmngnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
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
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save && ParaData.workType != "D") return;
    if (!permissions.delete && ParaData.workType == "D") return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (ParaData.workType == "N") {
        setTabSelected(0);
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
      if (ParaData.workType == "D") {
        setDeletedAttadatnums([Information.attdatnum]);
      }
      setUnsavedAttadatnums([]);
      setUnsavedName([]);
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        devmngnum: "",
        custcd: "",
        project: "",
        recdt: "",
        cotracdt: "",
        finexpdt: "",
        pjtmanager: "",
        pjtperson: "",
        remark: "",
        attdatnum: "",
        progress_status: "",
        guid_s: "",
        sort_order_s: "",
        date_s: "",
        title_s: "",
        finyn_s: "",
        is_monitoring_s: "",
      });
      deletedMainRows2 = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
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
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="요약정보"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>조회타입</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="date_type"
                        value={filters.date_type}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="name"
                        valueField="code"
                        className="required"
                      />
                    )}
                  </td>
                  <th>일자</th>
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
                  <th>업체</th>
                  <td>
                    <Input
                      name="customer_name"
                      type="text"
                      value={filters.customer_name}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>완료여부</th>
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
                  <th>진행여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="progress_status"
                        value={filters.progress_status}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="name"
                        valueField="code"
                        className="required"
                      />
                    )}
                  </td>
                  <th>사업진행담당</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="pjt_person"
                        value={filters.pjt_person}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="user_name"
                        valueField="user_id"
                      />
                    )}
                  </td>
                  <th>프로젝트</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
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
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
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
                    pjtperson: userListData.find(
                      (items: any) => items.user_id == row.pjtperson
                    )?.user_name,
                    pjtmanager: userListData.find(
                      (items: any) => items.user_id == row.pjtmanager
                    )?.user_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
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
                onSelectionChange={onMainSelectionChange}
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
                              dateField.includes(item.fieldName)
                                ? DateCell
                                : checkboxField.includes(item.fieldName)
                                ? CheckBoxReadOnlyCell
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
          disabled={permissions.view ? false : true}
        >
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
                    <FormBoxWrap style={{ height: mobileheight2 }}>
                      <ButtonContainer>
                        <Button
                          onClick={onSaveClick}
                          themeColor={"primary"}
                          icon="save"
                          disabled={permissions.save ? false : true}
                        >
                          저장
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
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>개발관리번호</th>
                            <td>
                              <div>
                                <Input
                                  name="devmngnum"
                                  type="text"
                                  value={Information.devmngnum}
                                  className="readonly"
                                  style={{
                                    width: "85%",
                                    marginRight: "5px",
                                    float: "left",
                                  }}
                                />
                                <Checkbox
                                  name="progress_status"
                                  value={
                                    Information.progress_status == "N"
                                      ? false
                                      : Information.progress_status == "Y"
                                      ? true
                                      : false
                                  }
                                  label={"진행"}
                                  onChange={InputChange}
                                ></Checkbox>
                              </div>
                            </td>
                            <th>계약일</th>
                            <td>
                              <DatePicker
                                name="cotracdt"
                                value={Information.cotracdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                className="required"
                                placeholder=""
                              />
                            </td>
                            <th>PJ요청일</th>
                            <td>
                              <DatePicker
                                name="recdt"
                                value={Information.recdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                className="required"
                                placeholder=""
                              />
                            </td>
                            <th>PJ완료예정일</th>
                            <td>
                              <DatePicker
                                name="finexpdt"
                                value={Information.finexpdt}
                                format="yyyy-MM-dd"
                                onChange={InputChange}
                                className="required"
                                placeholder=""
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>업체코드</th>
                            <td>
                              <Input
                                name="custcd"
                                type="text"
                                value={Information.custcd}
                                className="readonly"
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
                                  name="custcd"
                                  value={Information.custcd}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  valueField="custcd"
                                  textField="custnm"
                                  className="required"
                                />
                              )}
                            </td>
                            <th>담당PM</th>
                            <td>
                              {customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="pjtmanager"
                                  value={Information.pjtmanager}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  valueField="user_id"
                                  textField="user_name"
                                  className="required"
                                />
                              )}
                            </td>
                            <th>사업진행담당</th>
                            <td>
                              {customOptionData !== null && (
                                <CustomOptionComboBox
                                  name="pjtperson"
                                  value={Information.pjtperson}
                                  type="new"
                                  customOptionData={customOptionData}
                                  changeData={ComboBoxChange}
                                  valueField="user_id"
                                  textField="user_name"
                                  className="required"
                                />
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th>프로젝트</th>
                            <td colSpan={5}>
                              <Input
                                name="project"
                                type="text"
                                value={Information.project}
                                onChange={InputChange}
                              />
                            </td>
                            <th>첨부파일</th>
                            <td>
                              <Input
                                name="files"
                                type="text"
                                value={Information.files}
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
                          <tr>
                            <th>비고</th>
                            <td colSpan={7}>
                              <TextArea
                                value={Information.remark}
                                name="remark"
                                rows={4}
                                onChange={filterInputChange}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={1}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer2">
                      <GridTitle>상세정보</GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
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
                        <div>
                          <Button
                            onClick={onAddClick2}
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
                          <Button
                            onClick={() =>
                              onArrowsBtnClick({
                                direction: "UP",
                                dataInfo: arrowBtnClickPara,
                              })
                            }
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="chevron-up"
                            title="행 위로 이동"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={() =>
                              onArrowsBtnClick({
                                direction: "DOWN",
                                dataInfo: arrowBtnClickPara,
                              })
                            }
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="chevron-down"
                            title="행 아래로 이동"
                            disabled={permissions.save ? false : true}
                          ></Button>
                          <Button
                            onClick={onSaveClick}
                            themeColor={"primary"}
                            icon="save"
                            disabled={permissions.save ? false : true}
                          >
                            저장
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
                          height: mobileheight3,
                        }}
                        data={process(
                          mainDataResult2.data.map((row) => ({
                            ...row,
                            date: row.date
                              ? new Date(dateformat(row.date))
                              : new Date(dateformat("99991231")),
                            [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
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
                        onSelectionChange={onMainSelectionChange2}
                        //스크롤 조회 기능
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
                        onItemChange={onItemChange2}
                        cellRender={customCellRender2}
                        rowRender={customRowRender2}
                        editField={EDIT_FIELD}
                      >
                        <GridColumn field="rowstatus" title=" " width="50px" />
                        {customOptionData !== null &&
                          customOptionData.menuCustomColumnOptions["grdList2"]
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
                            ?.map(
                              (item: any, idx: number) =>
                                item.sortOrder !== -1 && (
                                  <GridColumn
                                    key={idx}
                                    field={item.fieldName}
                                    title={item.caption}
                                    width={item.width}
                                    headerCell={
                                      requiredField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    cell={
                                      dateField.includes(item.fieldName)
                                        ? DateCell
                                        : checkboxField.includes(item.fieldName)
                                        ? CheckBoxCell
                                        : undefined
                                    }
                                    footerCell={
                                      item.sortOrder == 0
                                        ? mainTotalFooterCell2
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
            <GridContainer>
              <FormBoxWrap className="FormBoxWrap">
                <ButtonContainer>
                  <Button
                    onClick={onSaveClick}
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                </ButtonContainer>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>개발관리번호</th>
                      <td>
                        <div>
                          <Input
                            name="devmngnum"
                            type="text"
                            value={Information.devmngnum}
                            className="readonly"
                            style={{ width: "85%", marginRight: "5px" }}
                          />
                          <Checkbox
                            name="progress_status"
                            value={
                              Information.progress_status == "N"
                                ? false
                                : Information.progress_status == "Y"
                                ? true
                                : false
                            }
                            label={"진행"}
                            onChange={InputChange}
                          ></Checkbox>
                        </div>
                      </td>
                      <th>계약일</th>
                      <td>
                        <DatePicker
                          name="cotracdt"
                          value={Information.cotracdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          className="required"
                          placeholder=""
                        />
                      </td>
                      <th>PJ요청일</th>
                      <td>
                        <DatePicker
                          name="recdt"
                          value={Information.recdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          className="required"
                          placeholder=""
                        />
                      </td>
                      <th>PJ완료예정일</th>
                      <td>
                        <DatePicker
                          name="finexpdt"
                          value={Information.finexpdt}
                          format="yyyy-MM-dd"
                          onChange={InputChange}
                          className="required"
                          placeholder=""
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>업체코드</th>
                      <td>
                        <Input
                          name="custcd"
                          type="text"
                          value={Information.custcd}
                          className="readonly"
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
                            name="custcd"
                            value={Information.custcd}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            valueField="custcd"
                            textField="custnm"
                            className="required"
                          />
                        )}
                      </td>
                      <th>담당PM</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="pjtmanager"
                            value={Information.pjtmanager}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            valueField="user_id"
                            textField="user_name"
                            className="required"
                          />
                        )}
                      </td>
                      <th>사업진행담당</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="pjtperson"
                            value={Information.pjtperson}
                            type="new"
                            customOptionData={customOptionData}
                            changeData={ComboBoxChange}
                            valueField="user_id"
                            textField="user_name"
                            className="required"
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>프로젝트</th>
                      <td colSpan={5}>
                        <Input
                          name="project"
                          type="text"
                          value={Information.project}
                          onChange={InputChange}
                        />
                      </td>
                      <th>첨부파일</th>
                      <td>
                        <Input
                          name="files"
                          type="text"
                          value={Information.files}
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
                    <tr>
                      <th>비고</th>
                      <td colSpan={7}>
                        <TextArea
                          value={Information.remark}
                          name="remark"
                          rows={4}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
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
                    <Button
                      onClick={() =>
                        onArrowsBtnClick({
                          direction: "UP",
                          dataInfo: arrowBtnClickPara,
                        })
                      }
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="chevron-up"
                      title="행 위로 이동"
                      disabled={permissions.save ? false : true}
                    ></Button>
                    <Button
                      onClick={() =>
                        onArrowsBtnClick({
                          direction: "DOWN",
                          dataInfo: arrowBtnClickPara,
                        })
                      }
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="chevron-down"
                      title="행 아래로 이동"
                      disabled={permissions.save ? false : true}
                    ></Button>
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
                      height: webheight2,
                    }}
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        date: row.date
                          ? new Date(dateformat(row.date))
                          : new Date(dateformat("99991231")),
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)], //선택된 데이터
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
                    onSelectionChange={onMainSelectionChange2}
                    //스크롤 조회 기능
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
                    onItemChange={onItemChange2}
                    cellRender={customCellRender2}
                    rowRender={customRowRender2}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
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
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                cell={
                                  dateField.includes(item.fieldName)
                                    ? DateCell
                                    : checkboxField.includes(item.fieldName)
                                    ? CheckBoxCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
          )}
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
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={Information.attdatnum}
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

export default CM_A1810W;
