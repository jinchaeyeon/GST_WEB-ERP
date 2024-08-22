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
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
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
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
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
  getCustDataQuery,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
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
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { useApi } from "../hooks/api";
import { ICustData } from "../hooks/interfaces";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/QC_A3400W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";

const dateField = ["recdt", "storenddt"];
const numberField = ["qty"];
const checkField = ["use_yn"];
const commandField = ["custcd"];
const comboField = ["load_place", "usegb", "outuse"];
const requiredField = ["recdt", "div", "load_place", "qty"];
const requiredField2 = ["recdt", "div", "qty"];

let targetRowIndex: null | number = null;
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];
var index = 0;
let temp = 0;
let temp2 = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_LOADPLACE_603, L_BA195, L_SA014", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "load_place"
      ? "L_LOADPLACE_603"
      : field == "usegb"
      ? "L_BA195"
      : field == "outuse"
      ? "L_SA014"
      : "";

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField = field == "load_place" ? "load_placenm" : "code_name";
  const valueField = field == "load_place" ? "load_place" : "sub_code";

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

const FormContext = createContext<{
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  detailDataState2: State;
  setDetailDataState2: (d: any) => void;
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
  const {
    custcd,
    custnm,
    setCustcd,
    setCustnm,
    detailDataState2,
    setDetailDataState2,
  } = useContext(FormContext);
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
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setCustcd(data.custcd);
    setCustnm(data.custnm);
  };

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
      <ButtonInInput>
        <Button
          onClick={onCustWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
};

const MA_B7201W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const [swiper, setSwiper] = useState<SwiperCore>();

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      height3 = getHeight(".ButtonContainer2");
      height4 = getHeight(".ButtonContainer3");
      height5 = getHeight(".ButtonContainer4");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2);
        setMobileHeight2(getDeviceHeight(true) - height - height3);
        setMobileHeight3(getDeviceHeight(true) - height - height4);
        setWebHeight(getDeviceHeight(true) - height - height2);
        setWebHeight2((getDeviceHeight(true) - height - height5) / 2 - height3);
        setWebHeight3((getDeviceHeight(true) - height - height5) / 2 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3]);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");
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
        usegb: defaultOption.find((item: any) => item.id == "usegb")?.valueCode,
        use_yn: defaultOption.find((item: any) => item.id == "use_yn")
          ?.valueCode,
        chkperson: defaultOption.find((item: any) => item.id == "chkperson")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_inoutdiv_001, L_HU250T, L_BA196, L_BA195,L_BA028,L_BA002,L_sysUserMaster_001",
    //대분류, 중분류, 소분류, 품목계정, 수량단위, 사용자
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [inoutdivListData, setInoutdivListData] = useState([
    { code: "", name: "" },
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [personListData2, setPersonListData2] = useState([
    { prsnnum: "", prsnnm: "" },
  ]);
  const [locationListData, setLocationListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [positionListData, setPositionListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [usegbListData, setUseGbListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const [divListData, setDivListData] = useState([COM_CODE_DEFAULT_VALUE]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setInoutdivListData(getBizCom(bizComponentData, "L_inoutdiv_001"));
      setPositionListData(getBizCom(bizComponentData, "L_BA028"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setUseGbListData(getBizCom(bizComponentData, "L_BA195"));
      setDivListData(getBizCom(bizComponentData, "L_BA196"));
      setPersonListData2(getBizCom(bizComponentData, "L_HU250T"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
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

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    chkperson: "",
    frdt: new Date(),
    todt: new Date(),
    usegb: "",
    testnum: "",
    custcd: "",
    custnm: "",
    use_yn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    datnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [detailfilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL2",
    datnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });
  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  let gridRef: any = useRef(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2(initialPageState);
    setPage3(initialPageState);
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

    setDetailFilters((prev) => ({
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

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A3400W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_datnum": "",
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_usegb": filters.usegb,
        "@p_testnum": filters.testnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_use_yn": filters.use_yn,
        "@p_chkperson": filters.chkperson,
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

          setDetailFilters((prev) => ({
            ...prev,
            datnum: selectedRow.datnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            datnum: selectedRow.datnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            datnum: rows[0].datnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            datnum: rows[0].datnum,
            isSearch: true,
            pgNum: 1,
          }));
        }
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

  const fetchDetailGrid = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A3400W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_datnum": filters2.datnum,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_usegb": filters.usegb,
        "@p_testnum": filters.testnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_use_yn": filters.use_yn,
        "@p_chkperson": filters.chkperson,
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

      const row = rows.map((item: any) => ({
        ...item,
      }));
      setDetailDataResult((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setDetailSelectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
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

  const fetchDetailGrid2 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A3400W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_datnum": filters3.datnum,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_usegb": filters.usegb,
        "@p_testnum": filters.testnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_use_yn": filters.use_yn,
        "@p_chkperson": filters.chkperson,
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

      const row = rows.map((item: any) => ({
        ...item,
      }));

      setDetailDataResult2((prev) => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setDetailSelectedState2({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setDetailFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A3400W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "QC_A3400W_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setPage3(initialPageState); // 페이지 초기화
        resetAllGrid();
        setFilters((prev) => ({
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

  useEffect(() => {
    if (
      detailfilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      detailfilters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailfilters2, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState2));
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

    setDetailFilters((prev: any) => ({
      ...prev,
      datnum: selectedRowData.datnum,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters2((prev: any) => ({
      ...prev,
      datnum: selectedRowData.datnum,
      isSearch: true,
      pgNum: 1,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setDetailSelectedState(newSelectedState);
  };

  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState2,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setDetailSelectedState2(newSelectedState);
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
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[1].title = "입고";
      optionsGridOne.sheets[2].title = "출고";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
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

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {detailDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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
    detailDataResult.data.forEach((item) =>
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

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = "";
    detailDataResult2.data.forEach((item) =>
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

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    detailDataResult.data.forEach((item: any, index: number) => {
      if (!detailselectedState[item[DATA_ITEM_KEY2]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
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
      setDetailSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
      });
    }
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    detailDataResult2.data.forEach((item: any, index: number) => {
      if (!detailselectedState2[item[DATA_ITEM_KEY3]]) {
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
      data = detailDataResult2.data[Math.min(...Object2)];
    } else {
      data = detailDataResult2.data[Math.min(...Object) - 1];
    }

    setDetailDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setDetailSelectedState2({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
  };

  const onAddClick = () => {
    detailDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const data = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const newDataItem = {
      [DATA_ITEM_KEY2]: ++temp,
      bf_load_place: "",
      bf_reckey: "",
      custcd: "",
      custnm: "",
      datnum: data.datnum,
      div: "1",
      load_place: "",
      location: data.location,
      orgdiv: "01",
      outuse: "",
      position: data.position,
      qty: 0,
      recdt: convertDateToStr(new Date()),
      reckey: "",
      remark: "",
      seq1: 0,
      usegb: "",
      rowstatus: "N",
    };

    setDetailDataState({ [newDataItem[DATA_ITEM_KEY2]]: true });
    setDetailDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    detailDataResult2.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });
    const data = mainDataResult.data.filter(
      (item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
    )[0];

    const newDataItem = {
      [DATA_ITEM_KEY3]: ++temp2,
      bf_load_place: "",
      bf_reckey: "",
      custcd: "",
      custnm: "",
      datnum: data.datnum,
      div: "2",
      load_place: "",
      location: data.location,
      orgdiv: "01",
      outuse: "",
      position: data.position,
      qty: 0,
      recdt: convertDateToStr(new Date()),
      reckey: "",
      remark: "",
      seq1: 0,
      usegb: "",
      rowstatus: "N",
    };

    setDetailDataState2({ [newDataItem[DATA_ITEM_KEY3]]: true });
    setDetailDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setDetailDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DATA_ITEM_KEY2
    );
  };

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setDetailDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      detailDataResult2,
      setDetailDataResult2,
      DATA_ITEM_KEY3
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
    if (
      field != "div" &&
      field != "datnum" &&
      field != "rowstatus" &&
      field != "reckey"
    ) {
      const newData = detailDataResult.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
      setTempResult((prev) => {
        return {
          data: detailDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (
      field != "div" &&
      field != "datnum" &&
      field != "custnm" &&
      field != "rowstatus" &&
      field != "reckey"
    ) {
      const newData = detailDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setEditIndex(dataItem[DATA_ITEM_KEY3]);
      if (field) {
        setEditedField(field);
      }
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: detailDataResult2.data,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit = () => {
    if (tempResult.data != detailDataResult.data) {
      const newData = detailDataResult.data.map((item) =>
        item[DATA_ITEM_KEY2] ==
        Object.getOwnPropertyNames(detailselectedState)[0]
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

  const exitEdit2 = () => {
    if (tempResult2.data != detailDataResult2.data) {
      if (editedField == "custcd") {
        detailDataResult2.data.map(async (item) => {
          if (editIndex == item[DATA_ITEM_KEY3]) {
            const custcd = await fetchCustInfo(item.custcd);
            if (custcd != null && custcd != undefined) {
              const newData = detailDataResult2.data.map((item) =>
                item[DATA_ITEM_KEY3] ==
                Object.getOwnPropertyNames(detailselectedState2)[0]
                  ? {
                      ...item,
                      custcd: custcd.custcd,
                      custnm: custcd.custnm,
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
              setDetailDataResult2((prev) => {
                return {
                  data: newData,
                  total: prev.total,
                };
              });
            } else {
              const newData = detailDataResult2.data.map((item) =>
                item[DATA_ITEM_KEY3] ==
                Object.getOwnPropertyNames(detailselectedState2)[0]
                  ? {
                      ...item,
                      rowstatus: item.rowstatus == "N" ? "N" : "U",
                      custnm: "",
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
              setDetailDataResult2((prev) => {
                return {
                  data: newData,
                  total: prev.total,
                };
              });
            }
          }
        });
      } else {
        const newData = detailDataResult2.data.map((item) =>
          item[DATA_ITEM_KEY3] ==
          Object.getOwnPropertyNames(detailselectedState2)[0]
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
        setDetailDataResult2((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      }
    } else {
      const newData = detailDataResult2.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const fetchCustInfo = async (custcd: string) => {
    if (!permissions.view) return;
    if (custcd == "") return;
    let data: any;
    let custInfo: any = null;

    const queryStr = getCustDataQuery(custcd);
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
      if (rows.length > 0) {
        custInfo = {
          custcd: rows[0].custcd,
          custnm: rows[0].custnm,
        };
      }
    }

    return custInfo;
  };

  useEffect(() => {
    const newData = detailDataResult2.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(detailselectedState2)[0])
        ? {
            ...item,
            custcd: custcd,
            custnm: custnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setDetailDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [custcd, custnm]);

  const onSaveClick = () => {
    const dataItem = detailDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    const dataItem2 = detailDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    let valid = true;

    dataItem.map((item) => {
      if (
        item.recdt.substring(0, 4) < "1997" ||
        item.recdt.substring(6, 8) > "31" ||
        item.recdt.substring(6, 8) < "01" ||
        item.recdt.substring(6, 8).length != 2 ||
        item.div == "" ||
        item.div == null ||
        item.div == undefined ||
        item.load_place == "" ||
        item.load_place == null ||
        item.load_place == undefined ||
        item.qty <= 0
      ) {
        valid = false;
      }
    });

    dataItem2.map((item) => {
      if (
        item.recdt.substring(0, 4) < "1997" ||
        item.recdt.substring(6, 8) > "31" ||
        item.recdt.substring(6, 8) < "01" ||
        item.recdt.substring(6, 8).length != 2 ||
        item.div == "" ||
        item.div == null ||
        item.div == undefined ||
        item.qty <= 0
      ) {
        valid = false;
      }
    });

    if (valid != true) {
      alert("필수값을 채워주세요.");
      return false;
    }

    if (
      dataItem.length == 0 &&
      dataItem2.length == 0 &&
      deletedMainRows.length == 0 &&
      deletedMainRows2.length == 0
    )
      return false;
    let dataArr: any = {
      rowstatus_s: [],
      recdt_s: [],
      seq1_s: [],
      div_s: [],
      datnum_s: [],
      location_s: [],
      position_s: [],
      load_place_s: [],
      qty_s: [],
      remark_s: [],
      bf_reckey_s: [],
      outuse_s: [],
      custcd_s: [],
      usegb_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        recdt = "",
        seq1 = "",
        div = "",
        datnum = "",
        location = "",
        position = "",
        load_place = "",
        qty = "",
        remark = "",
        bf_reckey = "",
        outuse = "",
        custcd = "",
        usegb = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.seq1_s.push(seq1 == undefined || seq1 == "" ? 0 : seq1);
      dataArr.div_s.push(div == undefined ? "" : div);
      dataArr.datnum_s.push(datnum == undefined ? "" : datnum);
      dataArr.location_s.push(location == undefined ? "" : location);
      dataArr.position_s.push(position == undefined ? "" : position);
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
      dataArr.qty_s.push(qty == undefined ? 0 : qty);
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.bf_reckey_s.push(bf_reckey == undefined ? "" : bf_reckey);
      dataArr.outuse_s.push(outuse == undefined ? "" : outuse);
      dataArr.usegb_s.push(usegb == undefined ? "" : usegb);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
    });
    dataItem2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        recdt = "",
        seq1 = "",
        div = "",
        datnum = "",
        location = "",
        position = "",
        load_place = "",
        qty = "",
        remark = "",
        bf_reckey = "",
        outuse = "",
        custcd = "",
        usegb = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.seq1_s.push(seq1 == undefined || seq1 == "" ? 0 : seq1);
      dataArr.div_s.push(div == undefined ? "" : div);
      dataArr.datnum_s.push(datnum == undefined ? "" : datnum);
      dataArr.location_s.push(location == undefined ? "" : location);
      dataArr.position_s.push(position == undefined ? "" : position);
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
      dataArr.qty_s.push(qty == undefined ? 0 : qty);
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.bf_reckey_s.push(bf_reckey == undefined ? "" : bf_reckey);
      dataArr.outuse_s.push(outuse == undefined ? "" : outuse);
      dataArr.usegb_s.push(usegb == undefined ? "" : usegb);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        recdt = "",
        seq1 = "",
        div = "",
        datnum = "",
        location = "",
        position = "",
        load_place = "",
        qty = "",
        remark = "",
        bf_reckey = "",
        outuse = "",
        custcd = "",
        usegb = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.seq1_s.push(seq1 == undefined || seq1 == "" ? 0 : seq1);
      dataArr.div_s.push(div == undefined ? "" : div);
      dataArr.datnum_s.push(datnum == undefined ? "" : datnum);
      dataArr.location_s.push(location == undefined ? "" : location);
      dataArr.position_s.push(position == undefined ? "" : position);
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
      dataArr.qty_s.push(qty == undefined ? 0 : qty);
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.bf_reckey_s.push(bf_reckey == undefined ? "" : bf_reckey);
      dataArr.outuse_s.push(outuse == undefined ? "" : outuse);
      dataArr.usegb_s.push(usegb == undefined ? "" : usegb);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
    });
    deletedMainRows2.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        recdt = "",
        seq1 = "",
        div = "",
        datnum = "",
        location = "",
        position = "",
        load_place = "",
        qty = "",
        remark = "",
        bf_reckey = "",
        outuse = "",
        custcd = "",
        usegb = "",
      } = item;
      dataArr.rowstatus_s.push(rowstatus);
      dataArr.recdt_s.push(
        recdt == "99991231" || recdt == undefined ? "" : recdt
      );
      dataArr.seq1_s.push(seq1 == undefined || seq1 == "" ? 0 : seq1);
      dataArr.div_s.push(div == undefined ? "" : div);
      dataArr.datnum_s.push(datnum == undefined ? "" : datnum);
      dataArr.location_s.push(location == undefined ? "" : location);
      dataArr.position_s.push(position == undefined ? "" : position);
      dataArr.load_place_s.push(load_place == undefined ? "" : load_place);
      dataArr.qty_s.push(qty == undefined ? 0 : qty);
      dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
      dataArr.bf_reckey_s.push(bf_reckey == undefined ? "" : bf_reckey);
      dataArr.outuse_s.push(outuse == undefined ? "" : outuse);
      dataArr.usegb_s.push(usegb == undefined ? "" : usegb);
      dataArr.remark_s.push(remark == undefined ? "" : remark);
    });
    setParaData((prev) => ({
      ...prev,
      workType: "N",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      recdt_s: dataArr.recdt_s.join("|"),
      seq1_s: dataArr.seq1_s.join("|"),
      div_s: dataArr.div_s.join("|"),
      datnum_s: dataArr.datnum_s.join("|"),
      location_s: dataArr.location_s.join("|"),
      position_s: dataArr.position_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      qty_s: dataArr.qty_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      bf_reckey_s: dataArr.bf_reckey_s.join("|"),
      outuse_s: dataArr.outuse_s.join("|"),
      usegb_s: dataArr.usegb_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: sessionOrgdiv,
    rowstatus_s: "",
    recdt_s: "",
    seq1_s: "",
    div_s: "",
    datnum_s: "",
    location_s: "",
    position_s: "",
    load_place_s: "",
    custcd_s: "",
    qty_s: "",
    remark_s: "",
    bf_reckey_s: "",
    outuse_s: "",
    usegb_s: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "P_QC_A3400W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_seq1_s": ParaData.seq1_s,
      "@p_div_s": ParaData.div_s,
      "@p_datnum_s": ParaData.datnum_s,
      "@p_location_s": ParaData.location_s,
      "@p_position_s": ParaData.position_s,
      "@p_load_place_s": ParaData.load_place_s,
      "@p_qty_s": ParaData.qty_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_bf_reckey_s": ParaData.bf_reckey_s,
      "@p_outuse_s": ParaData.outuse_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_usegb_s": ParaData.usegb_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "QC_A3400W",
    },
  };
  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      deletedMainRows = [];
      deletedMainRows2 = [];
      setParaData({
        workType: "",
        orgdiv: sessionOrgdiv,
        rowstatus_s: "",
        recdt_s: "",
        seq1_s: "",
        div_s: "",
        datnum_s: "",
        location_s: "",
        position_s: "",
        load_place_s: "",
        custcd_s: "",
        qty_s: "",
        remark_s: "",
        bf_reckey_s: "",
        outuse_s: "",
        usegb_s: "",
      });
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
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
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
              <th>구분</th>
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
              <th>시험번호</th>
              <td>
                <Input
                  name="testnum"
                  type="text"
                  value={filters.testnum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>업체코드</th>
              <td>
                <div className="filter-item-wrap">
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
                </div>
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
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="use_yn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>시험책임자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="chkperson"
                    value={filters.chkperson}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
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
              <GridContainer style={{ width: "100%", height: "100%" }}>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="chevron-right"
                      fillMode={"flat"}
                      themeColor={"primary"}
                    />
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
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
                        chkperson: personListData2.find(
                          (item: any) => item.prsnnum == row.chkperson
                        )?.prsnnm,
                        location: locationListData.find(
                          (item: any) => item.sub_code == row.location
                        )?.code_name,
                        position: positionListData.find(
                          (item: any) => item.sub_code == row.position
                        )?.code_name,
                        usegb: usegbListData.find(
                          (item: any) => item.sub_code == row.usegb
                        )?.code_name,
                        div: divListData.find(
                          (item: any) => item.sub_code == row.div
                        )?.code_name,
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
                                id={item.id}
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : checkField.includes(item.fieldName)
                                    ? CheckBoxReadOnlyCell
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
              <GridContainer style={{ width: "100%" }}>
                <GridTitleContainer className="ButtonContainer2">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <GridTitle>
                      {" "}
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(0);
                          }
                        }}
                        icon="chevron-left"
                        fillMode={"flat"}
                        themeColor={"primary"}
                      />
                      입고
                    </GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          permissions.save
                            ? mainDataResult.total > 0
                              ? false
                              : true
                            : true
                        }
                      ></Button>
                      <Button
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={
                          permissions.save
                            ? mainDataResult.total > 0
                              ? false
                              : true
                            : true
                        }
                      ></Button>
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
                            swiper.slideTo(2);
                          }
                        }}
                        icon="chevron-right"
                        fillMode={"flat"}
                        themeColor={"primary"}
                      />
                    </ButtonContainer>
                  </div>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: mobileheight2 }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        recdt: row.recdt
                          ? new Date(dateformat(row.recdt))
                          : new Date(dateformat("99991231")),
                        div: inoutdivListData.find(
                          (item: any) => item.code == row.div
                        )?.name,
                        [SELECTED_FIELD]: detailselectedState[idGetter2(row)],
                      })),
                      detailDataState
                    )}
                    {...detailDataState}
                    onDataStateChange={onDetailDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange}
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : comboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : undefined
                                }
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? detailTotalFooterCell
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
              <GridContainer style={{ width: "100%" }}>
                <GridTitleContainer className="ButtonContainer3">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <GridTitle>
                      <Button
                        onClick={() => {
                          if (swiper && isMobile) {
                            swiper.slideTo(1);
                          }
                        }}
                        icon="chevron-left"
                        fillMode={"flat"}
                        themeColor={"primary"}
                      />
                      출고
                    </GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="plus"
                        title="행 추가"
                        disabled={
                          permissions.save
                            ? mainDataResult.total > 0
                              ? false
                              : true
                            : true
                        }
                      ></Button>
                      <Button
                        onClick={onDeleteClick2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={
                          permissions.save
                            ? mainDataResult.total > 0
                              ? false
                              : true
                            : true
                        }
                      ></Button>
                      <Button
                        onClick={onSaveClick}
                        themeColor={"primary"}
                        icon="save"
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                    </ButtonContainer>
                  </div>
                </GridTitleContainer>
                <FormContext.Provider
                  value={{
                    custcd,
                    custnm,
                    setCustcd,
                    setCustnm,
                    detailDataState2,
                    setDetailDataState2,
                    // fetchGrid,
                  }}
                >
                  <ExcelExport
                    data={detailDataResult2.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight3 }}
                      data={process(
                        detailDataResult2.data.map((row) => ({
                          ...row,
                          recdt: row.recdt
                            ? new Date(dateformat(row.recdt))
                            : new Date(dateformat("99991231")),
                          div: inoutdivListData.find(
                            (item: any) => item.code == row.div
                          )?.name,
                          [SELECTED_FIELD]:
                            detailselectedState2[idGetter3(row)],
                        })),
                        detailDataState2
                      )}
                      {...detailDataState2}
                      onDataStateChange={onDetailDataStateChange2}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY3}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDetailSelectionChange2}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={detailDataResult2.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      //정렬기능
                      sortable={true}
                      onSortChange={onDetailSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      onItemChange={onMainItemChange2}
                      cellRender={customCellRender2}
                      rowRender={customRowRender2}
                      editField={EDIT_FIELD}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
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
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : commandField.includes(item.fieldName)
                                      ? ColumnCommandCell
                                      : comboField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField2.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? detailTotalFooterCell2
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </FormContext.Provider>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`55%`}>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>요약정보</GridTitle>
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
                      person: personListData.find(
                        (item: any) => item.user_id == row.person
                      )?.user_name,
                      chkperson: personListData2.find(
                        (item: any) => item.prsnnum == row.chkperson
                      )?.prsnnm,
                      location: locationListData.find(
                        (item: any) => item.sub_code == row.location
                      )?.code_name,
                      position: positionListData.find(
                        (item: any) => item.sub_code == row.position
                      )?.code_name,
                      usegb: usegbListData.find(
                        (item: any) => item.sub_code == row.usegb
                      )?.code_name,
                      div: divListData.find(
                        (item: any) => item.sub_code == row.div
                      )?.code_name,
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
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : dateField.includes(item.fieldName)
                                  ? DateCell
                                  : checkField.includes(item.fieldName)
                                  ? CheckBoxReadOnlyCell
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
            <GridContainer width={`calc(45% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer4">
                <GridTitle></GridTitle>
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
              </GridTitleContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>입고</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={
                        permissions.save
                          ? mainDataResult.total > 0
                            ? false
                            : true
                          : true
                      }
                    ></Button>
                    <Button
                      onClick={onDeleteClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                      disabled={
                        permissions.save
                          ? mainDataResult.total > 0
                            ? false
                            : true
                          : true
                      }
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight2 }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        recdt: row.recdt
                          ? new Date(dateformat(row.recdt))
                          : new Date(dateformat("99991231")),
                        div: inoutdivListData.find(
                          (item: any) => item.code == row.div
                        )?.name,
                        [SELECTED_FIELD]: detailselectedState[idGetter2(row)],
                      })),
                      detailDataState
                    )}
                    {...detailDataState}
                    onDataStateChange={onDetailDataStateChange}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY2}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange}
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
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : dateField.includes(item.fieldName)
                                    ? DateCell
                                    : comboField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : undefined
                                }
                                headerCell={
                                  requiredField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? detailTotalFooterCell
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
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>출고</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                      disabled={
                        permissions.save
                          ? mainDataResult.total > 0
                            ? false
                            : true
                          : true
                      }
                    ></Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                      disabled={
                        permissions.save
                          ? mainDataResult.total > 0
                            ? false
                            : true
                          : true
                      }
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormContext.Provider
                  value={{
                    custcd,
                    custnm,
                    setCustcd,
                    setCustnm,
                    detailDataState2,
                    setDetailDataState2,
                    // fetchGrid,
                  }}
                >
                  <ExcelExport
                    data={detailDataResult2.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight3 }}
                      data={process(
                        detailDataResult2.data.map((row) => ({
                          ...row,
                          recdt: row.recdt
                            ? new Date(dateformat(row.recdt))
                            : new Date(dateformat("99991231")),
                          div: inoutdivListData.find(
                            (item: any) => item.code == row.div
                          )?.name,
                          [SELECTED_FIELD]:
                            detailselectedState2[idGetter3(row)],
                        })),
                        detailDataState2
                      )}
                      {...detailDataState2}
                      onDataStateChange={onDetailDataStateChange2}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY3}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDetailSelectionChange2}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={detailDataResult2.total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      //정렬기능
                      sortable={true}
                      onSortChange={onDetailSortChange2}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      onItemChange={onMainItemChange2}
                      cellRender={customCellRender2}
                      rowRender={customRowRender2}
                      editField={EDIT_FIELD}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
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
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : dateField.includes(item.fieldName)
                                      ? DateCell
                                      : commandField.includes(item.fieldName)
                                      ? ColumnCommandCell
                                      : comboField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  headerCell={
                                    requiredField2.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? detailTotalFooterCell2
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell3
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </FormContext.Provider>
              </GridContainer>
            </GridContainer>
          </GridContainerWrap>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
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

export default MA_B7201W;
