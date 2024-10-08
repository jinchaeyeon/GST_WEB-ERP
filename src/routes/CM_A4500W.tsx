import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
} from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { Buffer } from "buffer";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  ButtonInGridInput,
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
  UsePermissions,
  convertDateToStr,
  dateformat,
  getBizCom,
  getBookQuery,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
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
import CM_A4500W_Window from "../components/Windows/CM_A4500W_Window";
import BookWindow from "../components/Windows/CommonWindows/BookWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/CM_A4500W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
const IMAGE_MAX_SIZE = 500 * 1024 * 1024;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
let targetRowIndex: null | number = null;
const NumberField = ["amt"];
let deletedMainRows2: object[] = [];
let temp2 = 0;
const dateField = ["date"];
const comboField = ["inoutdiv", "person"];
const customField = ["bookcd"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_inoutdiv_001, L_sysUserMaster_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "inoutdiv"
      ? "L_inoutdiv_001"
      : field == "person"
      ? "L_sysUserMaster_001"
      : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField =
    field == "person"
      ? "user_name"
      : field == "inoutdiv"
      ? "name"
      : "code_name";
  const valueField =
    field == "person" ? "user_id" : field == "inoutdiv" ? "code" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

const defaultBookInfo = {
  bookcd: "",
  booknm: "",
  bookacnt: "",
};

export const FormContext = createContext<{
  bookInfo: any;
  setBookInfo: (d: React.SetStateAction<any>) => void;
}>({} as any);

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const { setBookInfo } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };

  const [bookWindowVisible, setBookWindowVisible] = useState<boolean>(false);

  const onBookWndClick = () => {
    setBookWindowVisible(true);
  };

  const setBookData = (data: any) => {
    const { bookcd, booknm, bookacnt } = data;
    setBookInfo({
      bookcd,
      booknm,
      bookacnt,
    });
  };
  //BA_A0080W에만 사용
  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInGridInput>
        <Button
          name="bookcd"
          onClick={onBookWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {bookWindowVisible && (
        <BookWindow
          setVisible={setBookWindowVisible}
          setData={setBookData}
          modal={true}
        />
      )}
    </>
  );
};

const CM_A4100W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const excelInput: any = React.useRef();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const processApi = useApi();
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [tabSelected, setTabSelected] = React.useState(0);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");
      height3 = getHeight(".k-tabstrip-items-wrapper");
      if (height4 == 0 && !isMobile) {
        height4 = getHeight(".FormBoxWrap");
      }
      height5 = getHeight(".ButtonContainer2");
      height6 = getHeight(".ButtonContainer3");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(getDeviceHeight(true) - height5 - height2 - height3);
        setMobileHeight3(getDeviceHeight(true) - height6 - height2 - height3);
        setMobileHeight4(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight(
          getDeviceHeight(true) - height - height2 - height3 - height4
        );
        setWebHeight2(getDeviceHeight(true) - height - height2 - height3);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        optionsGridOne.sheets[0].title = "요약정보";
        _export.save(optionsGridOne);
      }
    }
    if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridTwo.sheets[0].title = "요약정보";
        _export2.save(optionsGridTwo);
      }
    }
  };
  const [bookInfo, setBookInfo] = useState<any>(defaultBookInfo);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002,L_CR070, L_sysUserMaster_001, L_dptcd_001",
    //사용자, 교육구분
    setBizComponentData
  );
  const [userListData, setUserListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [dptcdListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [bookacntListData, setBookacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setBookacntListData(getBizCom(bizComponentData, "L_CR070"));
      setUserListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
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
        bookacnt: defaultOption.find((item: any) => item.id == "bookacnt")
          ?.valueCode,
        inoutdiv: defaultOption.find((item: any) => item.id == "inoutdiv")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const search = () => {
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  useEffect(() => {
    console.log(bookInfo);
    const newData = mainDataResult2.data.map((item) =>
      item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
        ? {
            ...item,
            bookcd: bookInfo.bookcd,
            booknm: bookInfo.booknm,
            bookacnt: bookInfo.bookacnt,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [EDIT_FIELD]: undefined,
          }
        : {
            ...item,
            [EDIT_FIELD]: undefined,
          }
    );

    setMainDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [bookInfo]);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    bookcd: "",
    booknm: "",
    bookacnt: "",
    frdt: new Date(),
    todt: new Date(),
    inoutdiv: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [information, setInfomation] = useState({
    workType: "N",
    amt: 0,
    attdatnum_img: "",
    bookacnt: "",
    bookcd: "",
    booknm: "",
    dptcd: "",
    location: "",
    maker: "",
    person: "",
    remark: "",
  });
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  let gridRef: any = useRef(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

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

  const [bookcdWindowVisible, setBookcdWindowVisible] =
    useState<boolean>(false);
  const onBookcdWndClick = () => {
    setBookcdWindowVisible(true);
  };
  const getbookcdData = (data: any) => {
    setFilters((prev) => {
      return {
        ...prev,
        bookcd: data.bookcd,
        booknm: data.booknm,
      };
    });
  };
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A4500W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "BOOK",
        "@p_orgdiv": filters.orgdiv,
        "@p_bookcd": filters.bookcd,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_booknm": filters.booknm,
        "@p_inoutdiv": "",
        "@p_bookacnt": filters.bookacnt,
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
            (row: any) => row.bookcd == filters.find_row_value
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
            : rows.find((row: any) => row.bookcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setInfomation({
            workType: "U",
            amt: selectedRow.amt,
            attdatnum_img: selectedRow.attdatnum_img,
            bookacnt: selectedRow.bookacnt,
            bookcd: selectedRow.bookcd,
            booknm: selectedRow.booknm,
            dptcd: selectedRow.dptcd,
            location: selectedRow.location,
            maker: selectedRow.maker,
            person: selectedRow.person,
            remark: selectedRow.remark,
          });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setInfomation({
            workType: "U",
            amt: rows[0].amt,
            attdatnum_img: rows[0].attdatnum_img,
            bookacnt: rows[0].bookacnt,
            bookcd: rows[0].bookcd,
            booknm: rows[0].booknm,
            dptcd: rows[0].dptcd,
            location: rows[0].location,
            maker: rows[0].maker,
            person: rows[0].person,
            remark: rows[0].remark,
          });
        }
      } else {
        setInfomation({
          workType: "N",
          amt: 0,
          attdatnum_img: "",
          bookacnt: "",
          bookcd: "",
          booknm: "",
          dptcd: "",
          location: "",
          maker: "",
          person: "",
          remark: "",
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
  const fetchMainGrid2 = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_CM_A4500W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "INOUT",
        "@p_orgdiv": filters.orgdiv,
        "@p_bookcd": filters.bookcd,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_booknm": filters.booknm,
        "@p_inoutdiv": filters.inoutdiv,
        "@p_bookacnt": "",
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
      const rows = data.tables[0].Rows.map(
        (item: { date: string | number | Date }) => ({
          ...item,
          date: convertDateToStr(new Date(item.date)),
        })
      );

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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

  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      if (tabSelected == 0) {
        fetchMainGrid(deepCopiedFilters);
      } else {
        fetchMainGrid2(deepCopiedFilters);
      }
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

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
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
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

    const person = userListData.find(
      (items: any) => items.user_name == selectedRowData.person
    )?.user_id;
    const bookacnt = bookacntListData.find(
      (items: any) => items.code_name == selectedRowData.bookacnt
    )?.sub_code;
    const location = locationListData.find(
      (items: any) => items.code_name == selectedRowData.location
    )?.sub_code;
    const dptcd = dptcdListData.find(
      (items: any) => items.dptnm == selectedRowData.dptcd
    )?.dptcd;
    setInfomation({
      workType: "U",
      amt: selectedRowData.amt,
      attdatnum_img: selectedRowData.attdatnum_img,
      bookacnt: bookacnt == undefined ? "" : bookacnt,
      bookcd: selectedRowData.bookcd,
      booknm: selectedRowData.booknm,
      dptcd: dptcd == undefined ? "" : dptcd,
      location: location == undefined ? "" : location,
      maker: selectedRowData.maker,
      person: person == undefined ? "" : person,
      remark: selectedRowData.remark,
    });
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };

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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
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

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
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

  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
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

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus" && field != "booknm" && field != "bookacnt") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY2]);
      if (field) {
        setEditedField(field);
      }
      setTempResult2((prev) => {
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
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
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

  const exitEdit2 = () => {
    if (tempResult2.data != mainDataResult2.data) {
      if (editedField !== "bookcd") {
        const newData = mainDataResult2.data.map((item) =>
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

        setTempResult2((prev) => {
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
        mainDataResult2.data.map((item: { [x: string]: any; bookcd: any }) => {
          if (editIndex == item[DATA_ITEM_KEY2]) {
            fetchBookData(item.bookcd);
          }
        });
      }
    } else {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
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
    }
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

  const onAddClick = () => {
    const defaultOption = GetPropertyValueByName(
      customOptionData.menuCustomDefaultOptions,
      "new"
    );
    setInfomation({
      workType: "N",
      amt: 0,
      attdatnum_img: "",
      bookacnt: defaultOption.find((item: any) => item.id == "bookacnt")
        ?.valueCode,
      bookcd: "",
      booknm: "",
      dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
      location: defaultOption.find((item: any) => item.id == "location")
        ?.valueCode,
      maker: "",
      person: defaultOption.find((item: any) => item.id == "person")?.valueCode,
      remark: "",
    });
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    setParaData((prev) => ({
      ...prev,
      workType: information.workType,
      orgdiv: sessionOrgdiv,
      bookcd: information.bookcd,
      booknm: information.booknm,
      bookacnt: information.bookacnt,
      location: information.location,
      person: information.person,
      dptcd: information.dptcd,
      amt: information.amt,
      maker: information.maker,
      attdatnum_img: information.attdatnum_img
        .replace(information.attdatnum_img.split(",")[0], "")
        .replace(",", ""),
      remark: information.remark,
    }));
  };

  const onSaveClick2 = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    let dataArr: any = {
      rowstatus_s: [],
      datnum_s: [],
      date_s: [],
      person_s: [],
      inoutdiv_s: [],
      bookcd_s: [],
      remark_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        datnum = "",
        date = "",
        person = "",
        inoutdiv = "",
        bookcd = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.datnum_s.push(datnum);
      dataArr.date_s.push(date == "99991231" ? "" : date);
      dataArr.person_s.push(person);
      dataArr.inoutdiv_s.push(inoutdiv);
      dataArr.bookcd_s.push(bookcd);
      dataArr.remark_s.push(remark);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        datnum = "",
        date = "",
        person = "",
        inoutdiv = "",
        bookcd = "",
        remark = "",
      } = item;
      dataArr.rowstatus_s.push("D");
      dataArr.datnum_s.push(datnum);
      dataArr.date_s.push(date == "99991231" ? "" : date);
      dataArr.person_s.push(person);
      dataArr.inoutdiv_s.push(inoutdiv);
      dataArr.bookcd_s.push(bookcd);
      dataArr.remark_s.push(remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "INOUT",
      orgdiv: sessionOrgdiv,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      person_s: dataArr.person_s.join("|"),
      inoutdiv_s: dataArr.inoutdiv_s.join("|"),
      bookcd_s: dataArr.bookcd_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      date_s: dataArr.date_s.join("|"),
    }));
  };

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    bookcd: "",
    booknm: "",
    bookacnt: "",
    location: "",
    person: "",
    dptcd: "",
    amt: 0,
    maker: "",
    attdatnum_img: "",
    remark: "",
    rowstatus_s: "",
    person_s: "",
    inoutdiv_s: "",
    bookcd_s: "",
    remark_s: "",
    datnum_s: "",
    date_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_CM_A4500W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_bookcd": paraData.bookcd,
      "@p_booknm": paraData.booknm,
      "@p_bookacnt": paraData.bookacnt,
      "@p_location": paraData.location,
      "@p_person": paraData.person,
      "@p_dptcd": paraData.dptcd,
      "@p_amt": paraData.amt,
      "@p_maker": paraData.maker,
      "@p_attdatnum_img": paraData.attdatnum_img,
      "@p_remark": paraData.remark,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_person_s": paraData.person_s,
      "@p_inoutdiv_s": paraData.inoutdiv_s,
      "@p_bookcd_s": paraData.bookcd_s,
      "@p_remark_s": paraData.remark_s,
      "@p_datnum_s": paraData.datnum_s,
      "@p_date_s": paraData.date_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "CM_A4500W",
    },
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
  }, [paraData, permissions]);

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
      if (paraData.workType != "D") {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
      } else {
        const isLastDataDeleted =
          mainDataResult.data.length == 1 && filters.pgNum > 1;
        const findRowIndex = mainDataResult.data.findIndex(
          (row: any) =>
            row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        );
        resetAllGrid();

        if (isLastDataDeleted) {
          setPage({
            skip: PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
        }
        setFilters((prev) => ({
          ...prev,
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1] ==
            undefined
              ? ""
              : mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1]
                  .bookcd,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }

      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        bookcd: "",
        booknm: "",
        bookacnt: "",
        location: "",
        person: "",
        dptcd: "",
        amt: 0,
        maker: "",
        attdatnum_img: "",
        remark: "",
        rowstatus_s: "",
        person_s: "",
        inoutdiv_s: "",
        bookcd_s: "",
        remark_s: "",
        datnum_s: "",
        date_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (mainDataResult.data.length != 0) {
      setParaData((prev) => ({
        ...prev,
        workType: "D",
        bookcd: information.bookcd,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const onAttWndClick2 = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const getAttachmentsData = async (files: FileList | null) => {
    if (files != null) {
      let uint8 = new Uint8Array(await files[0].arrayBuffer());
      let arrHexString = Buffer.from(uint8).toString("hex");
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      return new Promise((resolve) => {
        reader.onload = () => {
          if (reader.result != null) {
            setInfomation((prev) => ({
              ...prev,
              attdatnum_img:
                reader.result != null ? reader.result.toString() : "",
            }));
          }
        };
      });
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const onInoutClick = () => {
    if (!permissions.save) return;
    const datas = mainDataResult.data.filter((item) => item.chk == true);

    if (datas.length == 0) {
      alert("데이터를 선택해주세요.");
      return false;
    }

    setDetailWindowVisible(true);
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
      bookacnt: "",
      bookcd: "",
      booknm: "",
      date: convertDateToStr(new Date()),
      datnum: "",
      inoutdiv: "",
      person: userId,
      remark: "",
      rowstatus: "N",
    };

    setSelectedState2({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const fetchBookData = React.useCallback(
    async (bookcd: string) => {
      if (!permissions.view) return;
      let data: any;
      const queryStr = getBookQuery({ bookcd: bookcd, booknm: "" });
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
        const rowCount = data.tables[0].RowCount;

        if (rowCount > 0) {
          const { bookcd, booknm, bookanct } = rows[0];
          setBookInfo({
            bookcd,
            booknm,
            bookanct,
          });
        } else {
          const newData = mainDataResult2.data.map((item: any) =>
            item[DATA_ITEM_KEY2] ==
            Object.getOwnPropertyNames(selectedState2)[0]
              ? {
                  ...item,
                  bookcd: item.bookcd,
                  booknm: "",
                  bookanct: "",
                  [EDIT_FIELD]: undefined,
                }
              : {
                  ...item,
                  [EDIT_FIELD]: undefined,
                }
          );
          setMainDataResult2((prev) => {
            return {
              data: newData,
              total: prev.total,
            };
          });
        }
      }
    },
    [mainDataResult2]
  );
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
        style={{ width: "100%" }}
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="도서관리"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>도서코드</th>
                  <td>
                    <Input
                      name="bookcd"
                      type="text"
                      value={filters.bookcd}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>도서명</th>
                  <td>
                    <Input
                      name="booknm"
                      type="text"
                      value={filters.booknm}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>도서계정</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="bookacnt"
                        value={filters.bookacnt}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
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
                      <GridTitle>요약정보</GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onInoutClick}
                          themeColor={"primary"}
                          icon="folder"
                          disabled={permissions.save ? false : true}
                        >
                          입출고처리
                        </Button>
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
                          icon="delete"
                          fillMode="outline"
                          themeColor={"primary"}
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
                        style={{ height: mobileheight }}
                        data={process(
                          mainDataResult.data.map((row) => ({
                            ...row,
                            person: userListData.find(
                              (item: any) => item.user_id == row.person
                            )?.user_name,
                            bookacnt: bookacntListData.find(
                              (item: any) => item.sub_code == row.bookacnt
                            )?.code_name,
                            location: locationListData.find(
                              (item: any) => item.sub_code == row.location
                            )?.code_name,
                            dptcd: dptcdListData.find(
                              (item: any) => item.dptcd == row.dptcd
                            )?.dptnm,
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
                            ?.sort(
                              (a: any, b: any) => a.sortOrder - b.sortOrder
                            )
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
                                      NumberField.includes(item.fieldName)
                                        ? NumberCell
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
                      <div>
                        <Button
                          onClick={onSaveClick}
                          icon="save"
                          fillMode="outline"
                          themeColor={"primary"}
                          disabled={permissions.save ? false : true}
                        >
                          저장
                        </Button>
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
                      </div>
                    </ButtonContainer>
                    <FormBoxWrap style={{ height: mobileheight2 }}>
                      <FormBox>
                        <tbody>
                          <tr>
                            <th>도서코드</th>
                            <td>
                              <Input
                                name="bookcd"
                                type="text"
                                value={information.bookcd}
                                className="readonly"
                              />
                            </td>
                            <th>사업장</th>
                            <td>
                              {information.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="location"
                                      value={information.location}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="location"
                                      value={information.location}
                                      bizComponentId="L_BA002"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                            </td>
                            <th>금액</th>
                            <td>
                              <Input
                                name="amt"
                                type="number"
                                value={information.amt}
                                onChange={InputChange}
                              />
                            </td>
                            <th>제조사</th>
                            <td>
                              <Input
                                name="maker"
                                type="text"
                                value={information.maker}
                                onChange={InputChange}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>도서명</th>
                            <td colSpan={3}>
                              <Input
                                name="booknm"
                                type="text"
                                value={information.booknm}
                                onChange={InputChange}
                              />
                            </td>
                            <th>도서계정</th>
                            <td>
                              {information.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="bookacnt"
                                      value={information.bookacnt}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange}
                                      type="new"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="bookacnt"
                                      value={information.bookacnt}
                                      bizComponentId="L_CR070"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                    />
                                  )}
                            </td>
                            <th>담당자</th>
                            <td>
                              {information.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="person"
                                      value={information.person}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange}
                                      type="new"
                                      textField="user_name"
                                      valueField="user_id"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="person"
                                      value={information.person}
                                      bizComponentId="L_sysUserMaster_001"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                      textField="user_name"
                                      valueField="user_id"
                                    />
                                  )}
                            </td>
                          </tr>
                          <tr>
                            <th>담당부서</th>
                            <td>
                              {information.workType == "N"
                                ? customOptionData !== null && (
                                    <CustomOptionComboBox
                                      name="dptcd"
                                      value={information.dptcd}
                                      customOptionData={customOptionData}
                                      changeData={ComboBoxChange}
                                      type="new"
                                      textField="dptnm"
                                      valueField="dptcd"
                                    />
                                  )
                                : bizComponentData !== null && (
                                    <BizComponentComboBox
                                      name="dptcd"
                                      value={information.dptcd}
                                      bizComponentId="L_dptcd_001"
                                      bizComponentData={bizComponentData}
                                      changeData={ComboBoxChange}
                                      textField="dptnm"
                                      valueField="dptcd"
                                    />
                                  )}
                            </td>
                            <th>비고</th>
                            <td colSpan={5}>
                              <Input
                                name="booknm"
                                type="text"
                                value={information.booknm}
                                onChange={InputChange}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </GridContainer>
                </SwiperSlide>
                <SwiperSlide key={2}>
                  <GridContainer>
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle></GridTitle>
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
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
                        <div>
                          <Button
                            onClick={onAttWndClick2}
                            themeColor={"primary"}
                          >
                            이미지 업로드
                          </Button>
                          <input
                            id="uploadAttachment"
                            style={{ display: "none" }}
                            type="file"
                            accept="image/*"
                            ref={excelInput}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              if (event.target.files != null) {
                                event.target.files[0].size > IMAGE_MAX_SIZE
                                  ? alert("용량이 너무 큽니다")
                                  : getAttachmentsData(event.target.files);
                              }
                            }}
                          />
                          <Button
                            onClick={onSaveClick}
                            icon="save"
                            fillMode="outline"
                            themeColor={"primary"}
                            disabled={permissions.save ? false : true}
                          >
                            저장
                          </Button>
                        </div>
                      </ButtonContainer>
                    </GridTitleContainer>
                    {information.attdatnum_img != null ? (
                      <img
                        style={{
                          display: "block",
                          margin: "auto",
                          width: "100%",
                          height: mobileheight3,
                        }}
                        ref={excelInput}
                        src={
                          information.attdatnum_img.includes("data:image")
                            ? information.attdatnum_img
                            : "data:image/png;base64," +
                              information.attdatnum_img
                        }
                        alt="UserImage"
                      />
                    ) : (
                      ""
                    )}
                  </GridContainer>
                </SwiperSlide>
              </Swiper>
            </>
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="80%">
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>요약정보</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onInoutClick}
                        themeColor={"primary"}
                        icon="folder"
                        disabled={permissions.save ? false : true}
                      >
                        입출고처리
                      </Button>
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
                        icon="delete"
                        fillMode="outline"
                        themeColor={"primary"}
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={onSaveClick}
                        icon="save"
                        fillMode="outline"
                        themeColor={"primary"}
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
                      style={{ height: webheight }}
                      data={process(
                        mainDataResult.data.map((row) => ({
                          ...row,
                          person: userListData.find(
                            (item: any) => item.user_id == row.person
                          )?.user_name,
                          bookacnt: bookacntListData.find(
                            (item: any) => item.sub_code == row.bookacnt
                          )?.code_name,
                          location: locationListData.find(
                            (item: any) => item.sub_code == row.location
                          )?.code_name,
                          dptcd: dptcdListData.find(
                            (item: any) => item.dptcd == row.dptcd
                          )?.dptnm,
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
                                  id={item.id}
                                  field={item.fieldName}
                                  title={item.caption}
                                  width={item.width}
                                  cell={
                                    NumberField.includes(item.fieldName)
                                      ? NumberCell
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
                <GridContainer width={`calc(20% - ${GAP}px)`}>
                  <GridTitleContainer>
                    <GridTitle></GridTitle>
                    <ButtonContainer>
                      <Button onClick={onAttWndClick2} themeColor={"primary"}>
                        이미지 업로드
                      </Button>
                      <input
                        id="uploadAttachment"
                        style={{ display: "none" }}
                        type="file"
                        accept="image/*"
                        ref={excelInput}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          if (event.target.files != null) {
                            event.target.files[0].size > IMAGE_MAX_SIZE
                              ? alert("용량이 너무 큽니다")
                              : getAttachmentsData(event.target.files);
                          }
                        }}
                      />
                    </ButtonContainer>
                  </GridTitleContainer>
                  {information.attdatnum_img != null ? (
                    <img
                      style={{
                        display: "block",
                        margin: "auto",
                        width: "100%",
                      }}
                      ref={excelInput}
                      src={
                        information.attdatnum_img.includes("data:image")
                          ? information.attdatnum_img
                          : "data:image/png;base64," + information.attdatnum_img
                      }
                      alt="UserImage"
                    />
                  ) : (
                    ""
                  )}
                </GridContainer>
              </GridContainerWrap>
              <FormBoxWrap className="FormBoxWrap">
                <FormBox>
                  <tbody>
                    <tr>
                      <th>도서코드</th>
                      <td>
                        <Input
                          name="bookcd"
                          type="text"
                          value={information.bookcd}
                          className="readonly"
                        />
                      </td>
                      <th>사업장</th>
                      <td>
                        {information.workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="location"
                                value={information.location}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                type="new"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="location"
                                value={information.location}
                                bizComponentId="L_BA002"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>금액</th>
                      <td>
                        <Input
                          name="amt"
                          type="number"
                          value={information.amt}
                          onChange={InputChange}
                        />
                      </td>
                      <th>제조사</th>
                      <td>
                        <Input
                          name="maker"
                          type="text"
                          value={information.maker}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>도서명</th>
                      <td colSpan={3}>
                        <Input
                          name="booknm"
                          type="text"
                          value={information.booknm}
                          onChange={InputChange}
                        />
                      </td>
                      <th>도서계정</th>
                      <td>
                        {information.workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="bookacnt"
                                value={information.bookacnt}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                type="new"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="bookacnt"
                                value={information.bookacnt}
                                bizComponentId="L_CR070"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                              />
                            )}
                      </td>
                      <th>담당자</th>
                      <td>
                        {information.workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="person"
                                value={information.person}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                type="new"
                                textField="user_name"
                                valueField="user_id"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="person"
                                value={information.person}
                                bizComponentId="L_sysUserMaster_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                textField="user_name"
                                valueField="user_id"
                              />
                            )}
                      </td>
                    </tr>
                    <tr>
                      <th>담당부서</th>
                      <td>
                        {information.workType == "N"
                          ? customOptionData !== null && (
                              <CustomOptionComboBox
                                name="dptcd"
                                value={information.dptcd}
                                customOptionData={customOptionData}
                                changeData={ComboBoxChange}
                                type="new"
                                textField="dptnm"
                                valueField="dptcd"
                              />
                            )
                          : bizComponentData !== null && (
                              <BizComponentComboBox
                                name="dptcd"
                                value={information.dptcd}
                                bizComponentId="L_dptcd_001"
                                bizComponentData={bizComponentData}
                                changeData={ComboBoxChange}
                                textField="dptnm"
                                valueField="dptcd"
                              />
                            )}
                      </td>
                      <th>비고</th>
                      <td colSpan={5}>
                        <Input
                          name="booknm"
                          type="text"
                          value={information.booknm}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="입출고내역"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tr>
                <th>날짜</th>
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
                  />
                </td>
                <th>도서코드</th>
                <td>
                  <Input
                    name="bookcd"
                    type="text"
                    value={filters.bookcd}
                    onChange={filterInputChange}
                  />
                  <ButtonInInput>
                    <Button
                      type={"button"}
                      onClick={onBookcdWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>도서명</th>
                <td>
                  <Input
                    name="booknm"
                    type="text"
                    value={filters.booknm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>입출구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionRadioGroup
                      name="inoutdiv"
                      customOptionData={customOptionData}
                      changeData={filterRadioChange}
                    />
                  )}
                </td>
              </tr>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>요약정보</GridTitle>
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
                  onClick={onSaveClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                  disabled={permissions.save ? false : true}
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <FormContext.Provider
              value={{
                bookInfo,
                setBookInfo,
              }}
            >
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: isMobile ? mobileheight4 : webheight2 }}
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      bookacnt: bookacntListData.find(
                        (item: any) => item.sub_code == row.bookacnt
                      )?.code_name,
                      date: row.date
                        ? new Date(dateformat(row.date))
                        : new Date(dateformat("99991231")),
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
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult2.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange2}
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
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                dateField.includes(item.fieldName)
                                  ? DateCell
                                  : comboField.includes(item.fieldName)
                                  ? CustomComboBoxCell
                                  : customField.includes(item.fieldName)
                                  ? ColumnCommandCell
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
            </FormContext.Provider>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
      {detailWindowVisible && (
        <CM_A4500W_Window
          para={mainDataResult.data.filter((item) => item.chk == true)}
          setVisible={setDetailWindowVisible}
          reload={() => {
            setFilters((prev) => ({
              ...prev,
              isSearch: true,
              pgNum: 1,
            }));
            setValues2(false);
          }}
          modal={true}
        />
      )}
      {bookcdWindowVisible && (
        <BookWindow
          setVisible={setBookcdWindowVisible}
          setData={getbookcdData}
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
