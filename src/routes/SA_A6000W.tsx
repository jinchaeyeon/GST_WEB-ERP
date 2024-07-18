import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
import YearCalendar from "../components/Calendars/YearCalendar";
import CenterCell from "../components/Cells/CenterCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import NumberCell from "../components/Cells/NumberCell";
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
  getMasterUserQuery,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/SA_A6000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

let targetRowIndex: null | number = null;
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
const numberField = ["amt", "conamt", "dif"];
const percentField = ["rat"];
const contextField = ["person"];
const requireField = ["person"];
const centerField = ["name"];
const customComboField = ["dptcd"];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "dptcd" ? "L_dptcd_001" : "";

  const valueField = field == "dptcd" ? "dptcd" : undefined;
  const textField = field == "dptcd" ? "dptnm" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

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

let deletedMainRows: object[] = [];
let temp = 0;

const FormContext = createContext<{
  userid: string;
  setUserId: (d: any) => void;
  username: string;
  setUsername: (d: any) => void;
  dptcd: string;
  setDptcd: (d: any) => void;
  mainDataState3: State;
  setMainDataState3: (d: any) => void;
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
    userid,
    username,
    dptcd,
    setUserId,
    setUsername,
    setDptcd,
    mainDataState3,
    setMainDataState3,
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

  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);

  const onPrsnnumWndClick = () => {
    if (dataItem.rowstatus == "N") {
      setPrsnnumWindowVisible(true);
    } else {
      alert("신규행만 수정가능합니다.");
    }
  };
  interface IPrsnnum {
    user_id: string;
    user_name: string;
    dptcd: string;
  }
  const setPrsnnumData = (data: IPrsnnum) => {
    setUserId(data.user_id);
    setUsername(data.user_name);
    setDptcd(data.dptcd);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit && dataItem.rowstatus == "N" ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onPrsnnumWndClick}
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
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"N"}
          setData={setPrsnnumData}
          modal={true}
        />
      )}
    </>
  );
};

const CustomPercentCell = (props: GridCellProps) => {
  const field = props.field ?? "";
  const value = props.dataItem[field];

  const formattedValue = parseFloat(value).toLocaleString() + "%";

  return (
    <td
      style={{ textAlign: "right" }}
      aria-colindex={props.ariaColumnIndex}
      data-grid-col-index={props.columnIndex}
    >
      {formattedValue}
    </td>
  );
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;

const SA_A6000W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const processApi = useApi();
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else {
      setFilters3((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: "",
        isSearch: true,
      }));
    }
    deletedMainRows = [];
    setTabSelected(e.selected);
  };

  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const pc = UseGetValueFromSessionItem("pc");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setPage2(initialPageState);

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: 1,
    }));
    setPage4(initialPageState);
    deletedMainRows = [];
    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters4((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_A6000W", setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".k-tabstrip-items-wrapper");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".FormBoxWrap");
      height5 = getHeight(".ButtonContainer2");
      height6 = getHeight(".ButtonContainer3");
      height7 = getHeight(".ButtonContainer4");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(
          getDeviceHeight(true) - height - height2 - height4 - height5
        );
        setMobileHeight3(getDeviceHeight(true) - height - height2 - height6);
        setMobileHeight4(getDeviceHeight(true) - height - height2 - height7);
        setWebHeight(getDeviceHeight(true) - height - height2 - height3);
        setWebHeight2(getDeviceHeight(true) - height - height2 - height4);
        setWebHeight3(getDeviceHeight(true) - height - height2 - height6);
        setWebHeight4(getDeviceHeight(true) - height - height2 - height7);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [
    customOptionData,
    webheight,
    webheight2,
    webheight3,
    webheight4,
    tabSelected,
  ]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [userid, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [dptcd, setDptcd] = useState<string>("");

  useEffect(() => {
    const newData = mainDataResult3.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState3)[0])
        ? {
            ...item,
            person: userid,
            user_name: username,
            dptcd: dptcd,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult3((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setTempResult3((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [userid, username]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [tempState2, setTempState2] = useState<State>({
    sort: [],
  });
  const [tempState3, setTempState3] = useState<State>({
    sort: [],
  });
  const [tempState4, setTempState4] = useState<State>({
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
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [tempResult2, setTempResult2] = useState<DataResult>(
    process([], tempState2)
  );
  const [tempResult3, setTempResult3] = useState<DataResult>(
    process([], tempState3)
  );
  const [tempResult4, setTempResult4] = useState<DataResult>(
    process([], tempState4)
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
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "yyyy") {
      deletedMainRows = [];
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      isSearch: name == "yyyy" ? true : false,
    }));
    setFilters2((prev) => ({
      ...prev,
      isSearch: name == "yyyy" ? true : false,
    }));
    setFilters3((prev) => ({
      ...prev,
      isSearch: name == "yyyy" ? true : false,
    }));
  };
  const [PrsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  interface IPrsnnum {
    user_id: string;
    user_name: string;
  }
  const setPrsnnumData = (data: IPrsnnum) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        user_name: data.user_name,
        user_id: data.user_id,
      };
    });
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    yyyy: new Date(),
    user_id: "",
    user_name: "",
    pgNum: 1,
    isSearch: false,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    pgNum: 1,
    isSearch: false,
  });
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    pgNum: 1,
    find_row_value: "",
    isSearch: false,
  });
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    person: "",
    pgNum: 1,
    isSearch: false,
  });
  const [information, setInformation] = useState({
    amt: 0,
  });
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A6000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "YEAR_LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        amt: Math.ceil(item.amt),
        conamt: Math.ceil(item.conamt),
        rat: Math.ceil(item.rat),
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
      procedureName: "P_SA_A6000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "YEAR_DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        amt: Math.ceil(item.amt),
        conamt: Math.ceil(item.conamt),
        rat: Math.ceil(item.rat),
        dif: Math.ceil(item.dif),
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      setInformation({
        amt: data.returnString == "" ? 0 : Math.ceil(data.returnString),
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A6000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": "PERSON_LIST",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_user_id": filters.user_id,
        "@p_user_name": filters.user_name,
        "@p_find_row_value": filters3.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        amt: Math.ceil(item.amt),
        conamt: Math.ceil(item.conamt),
        rat: Math.ceil(item.rat),
      }));

      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.person == filters3.find_row_value
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

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTempResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters3.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.person == filters3.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
          setFilters4((prev) => ({
            ...prev,
            person: selectedRow.person,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
          setFilters4((prev) => ({
            ...prev,
            person: rows[0].person,
            isSearch: true,
            pgNum: 1,
          }));
        }
      } else {
        setMainDataResult4(process([], mainDataState4));
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

  //그리드 데이터 조회
  const fetchMainGrid4 = async (filters4: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A6000W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": "PERSON_DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_yyyy": convertDateToStr(filters.yyyy).substring(0, 4),
        "@p_user_id": filters4.person,
        "@p_user_name": filters.user_name,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
        amt: Math.ceil(item.amt),
        conamt: Math.ceil(item.conamt),
        rat: Math.ceil(item.rat),
        dif: Math.ceil(item.dif),
      }));

      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
      }
    }
    setFilters4((prev) => ({
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters4.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions, customOptionData]);
  let gridRef: any = useRef(null);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setPage3(initialPageState); // 페이지 초기화
    setPage4(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    deletedMainRows = [];
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
  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedState2(newSelectedState);
  };

  const [predata, setPreData] = useState<any>(undefined);
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const datas = mainDataResult3.data.filter(
      (item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
    )[0];
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    let valid = true;

    if (datas[DATA_ITEM_KEY3] != selectedRowData[DATA_ITEM_KEY3]) {
      mainDataResult4.data.map((item) => {
        if (item.rowstatus == "N" || item.rowstatus == "U") {
          valid = false;
        }
      });

      if (valid != true) {
        if (
          !window.confirm(
            "작성중인 내용이 초기화됩니다. 새로 조회하시겠습니까?"
          )
        ) {
          return false;
        }
      }

      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState3,
        dataItemKey: DATA_ITEM_KEY3,
      });
      setSelectedState3(newSelectedState);

      const selectedRowData2 = event.dataItems[selectedIdx];

      setFilters3((prev) => ({
        ...prev,
        person: selectedRowData2.person,
        find_row_value: selectedRowData2.person,
        isSearch: true,
      }));
      if (swiper && isMobile) {
        swiper.slideTo(1);
      }
    }
  };

  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY4,
    });
    setSelectedState4(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (tabSelected == 0) {
      if (_export !== null && _export !== undefined) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "분기별";
        optionsGridOne.sheets[1].title = "월별";
        _export.save(optionsGridOne);
      }
    } else {
      if (_export3 !== null && _export4 !== undefined) {
        const optionsGridOne = _export3.workbookOptions();
        const optionsGridTwo = _export4.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[0].title = "분기별";
        optionsGridOne.sheets[1].title = "월별";
        _export3.save(optionsGridOne);
      }
    }
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
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        합계
      </td>
    );
  };

  const mainPercentFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return sum == 0 ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        0%
      </td>
    ) : (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum / mainDataResult.data.length))}%
      </td>
    );
  };

  const mainPercentFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return sum == 0 ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        0%
      </td>
    ) : (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum / mainDataResult2.data.length))}%
      </td>
    );
  };

  const mainPercentFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return sum == 0 ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        0%
      </td>
    ) : (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum / mainDataResult3.data.length))}%
      </td>
    );
  };

  const mainPercentFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return sum == 0 ? (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        0%
      </td>
    ) : (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum / mainDataResult4.data.length))}%
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum))}
      </td>
    );
  };

  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult2.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum))}
      </td>
    );
  };

  const editNumberFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum))}
      </td>
    );
  };

  const editNumberFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
      props.field !== undefined
        ? (sum += Math.ceil(
            parseFloat(
              item[props.field] == "" || item[props.field] == undefined
                ? 0
                : item[props.field]
            )
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(Math.ceil(sum))}
      </td>
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
  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (convertDateToStr(filters.yyyy).substring(0, 4) < "1997") {
        throw findMessage(messagesData, "SA_A6000W_001");
      } else {
        resetAllGrid();
        if (tabSelected == 0) {
          setFilters((prev: any) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
          }));
          setFilters2((prev: any) => ({
            ...prev,
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setFilters3((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        }
        if (swiper && isMobile) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState2((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY2
    );
  };
  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
    );
  };
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState4((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
      DATA_ITEM_KEY4
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
  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
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
  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );
  const enterEdit = (dataItem: any, field: string) => {
    if (field == "amt") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == dataItem[DATA_ITEM_KEY2]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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
      setTempResult2((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field == "dptcd" || field == "person") {
      const newData = mainDataResult3.data.map((item) =>
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

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "amt") {
      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY4] == dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setTempResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult4((prev) => {
        return {
          data: mainDataResult4.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult2.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              rat:
                item.amt == 0 ? 0 : Math.ceil((item.conamt / item.amt) * 100),
              dif: item.conamt - item.amt,
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

      const datas = mainDataResult2.data.filter(
        (item) =>
          item[DATA_ITEM_KEY2] == Object.getOwnPropertyNames(selectedState2)[0]
      )[0];

      let name = "";

      if (datas.mm == "01" || datas.mm == "02" || datas.mm == "03") {
        name = "1분기";
      } else if (datas.mm == "04" || datas.mm == "05" || datas.mm == "06") {
        name = "2분기";
      } else if (datas.mm == "07" || datas.mm == "08" || datas.mm == "09") {
        name = "3분기";
      } else if (datas.mm == "10" || datas.mm == "11" || datas.mm == "12") {
        name = "4분기";
      }

      if (name == "1분기") {
        let array = mainDataResult2.data.filter(
          (item) => item.mm == "01" || item.mm == "02" || item.mm == "03"
        );

        let amt = 0;
        let conamt = 0;

        array.map((item) => {
          amt += item.amt;
          conamt += item.conamt;
        });

        const newData2 = mainDataResult.data.map((item) =>
          name == item.name
            ? {
                ...item,
                amt: amt,
                conamt: conamt,
                rat: amt == 0 ? 0 : Math.ceil((conamt / amt) * 100),
              }
            : {
                ...item,
              }
        );
        setMainDataResult((prev) => {
          return {
            data: newData2,
            total: prev.total,
          };
        });
      } else if (name == "2분기") {
        let array = mainDataResult2.data.filter(
          (item) => item.mm == "04" || item.mm == "05" || item.mm == "06"
        );

        let amt = 0;
        let conamt = 0;

        array.map((item) => {
          amt += item.amt;
          conamt += item.conamt;
        });

        const newData2 = mainDataResult.data.map((item) =>
          name == item.name
            ? {
                ...item,
                amt: amt,
                conamt: conamt,
                rat: amt == 0 ? 0 : Math.ceil((conamt / amt) * 100),
              }
            : {
                ...item,
              }
        );
        setMainDataResult((prev) => {
          return {
            data: newData2,
            total: prev.total,
          };
        });
      } else if (name == "3분기") {
        let array = mainDataResult2.data.filter(
          (item) => item.mm == "07" || item.mm == "08" || item.mm == "09"
        );

        let amt = 0;
        let conamt = 0;

        array.map((item) => {
          amt += item.amt;
          conamt += item.conamt;
        });

        const newData2 = mainDataResult.data.map((item) =>
          name == item.name
            ? {
                ...item,
                amt: amt,
                conamt: conamt,
                rat: amt == 0 ? 0 : Math.ceil((conamt / amt) * 100),
              }
            : {
                ...item,
              }
        );
        setMainDataResult((prev) => {
          return {
            data: newData2,
            total: prev.total,
          };
        });
      } else if (name == "4분기") {
        let array = mainDataResult2.data.filter(
          (item) => item.mm == "10" || item.mm == "11" || item.mm == "12"
        );

        let amt = 0;
        let conamt = 0;

        array.map((item) => {
          amt += item.amt;
          conamt += item.conamt;
        });

        const newData2 = mainDataResult.data.map((item) =>
          name == item.name
            ? {
                ...item,
                amt: amt,
                conamt: conamt,
                rat: amt == 0 ? 0 : Math.ceil((conamt / amt) * 100),
              }
            : {
                ...item,
              }
        );
        setMainDataResult((prev) => {
          return {
            data: newData2,
            total: prev.total,
          };
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

  const exitEdit2 = () => {
    if (tempResult3.data != mainDataResult3.data) {
      if (editedField == "person") {
        mainDataResult3.data.map(
          async (item: { [x: string]: any; person: any }) => {
            if (editIndex == item[DATA_ITEM_KEY3]) {
              const person = await fetchUserData(item.person);
              if (person != null && person != undefined) {
                const newData = mainDataResult3.data.map((item) =>
                  item[DATA_ITEM_KEY3] ==
                  Object.getOwnPropertyNames(selectedState3)[0]
                    ? {
                        ...item,
                        person: person.user_id,
                        user_name: person.user_name,
                        dptcd: person.dptcd,
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
                const newData = mainDataResult3.data.map((item) =>
                  item[DATA_ITEM_KEY3] ==
                  Object.getOwnPropertyNames(selectedState3)[0]
                    ? {
                        ...item,
                        rowstatus: item.rowstatus == "N" ? "N" : "U",
                        user_name: "",
                        dptcd: "",
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
              }
            }
          }
        );
      } else {
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
      }
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

  const exitEdit3 = () => {
    if (tempResult4.data != mainDataResult4.data) {
      const pre = tempResult3.data.filter(
        (item) =>
          item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
      )[0];
      setPreData(pre);

      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState4)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              rat:
                item.amt == 0 ? 0 : Math.ceil((item.conamt / item.amt) * 100),
              dif: item.conamt - item.amt,
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setTempResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      let amt = 0;
      let conamt = 0;

      mainDataResult4.data.map((item) => {
        amt += item.amt;
        conamt += item.conamt;
      });

      const newData2 = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
          ? {
              ...item,
              amt: amt,
              conamt: conamt,
              rat: amt == 0 ? 0 : Math.ceil((conamt / amt) * 100),
              rowstatus: item.rowstatus == "N" ? "N" : "U",
            }
          : {
              ...item,
            }
      );
      setMainDataResult3((prev) => {
        return {
          data: newData2,
          total: prev.total,
        };
      });
      setTempResult3((prev) => {
        return {
          data: newData2,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult4.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const fetchUserData = async (person: string) => {
    if (!permissions.view) return;
    if (person == "") return;
    let data: any;
    let personInfo: any = null;

    const queryStr = getMasterUserQuery(person);
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
        personInfo = {
          user_id: rows[0].user_id,
          user_name: rows[0].user_name,
          dptcd: rows[0].dptcd,
        };
      }
    }

    return personInfo;
  };

  const onSave = () => {
    if (!permissions.save) return;
    const dataItem: { [name: string]: any } = mainDataResult2.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );
    if (dataItem.length == 0) return false;

    type TData = {
      rowstatus_s: string[];
      targetnum_s: string[];
      yyyy_s: string[];
      mm_s: string[];
      amt_s: string[];
    };

    let dataArr: TData = {
      rowstatus_s: [],
      targetnum_s: [],
      yyyy_s: [],
      mm_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        targetnum = "",
        yyyy = "",
        mm = "",
        amt = "",
      } = item;

      dataArr.rowstatus_s.push(targetnum == "" ? "N" : "U");
      dataArr.targetnum_s.push(targetnum);
      dataArr.yyyy_s.push(yyyy);
      dataArr.mm_s.push(mm);
      dataArr.amt_s.push(amt);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "N",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      targetnum_s: dataArr.targetnum_s.join("|"),
      yyyy_s: dataArr.yyyy_s.join("|"),
      mm_s: dataArr.mm_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    }));
  };

  const onSave2 = () => {
    if (!permissions.save) return;
    const dataItem: { [name: string]: any } = mainDataResult4.data.filter(
      (item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      }
    );

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    const data = mainDataResult3.data.filter(
      (item) =>
        item[DATA_ITEM_KEY3] == Object.getOwnPropertyNames(selectedState3)[0]
    )[0];

    if (data.person == "") {
      alert("사번을 입력해주세요.");
      return false;
    }

    type TData = {
      rowstatus_s: string[];
      targetnum_s: string[];
      yyyy_s: string[];
      mm_s: string[];
      amt_s: string[];
    };

    let dataArr: TData = {
      rowstatus_s: [],
      targetnum_s: [],
      yyyy_s: [],
      mm_s: [],
      amt_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        targetnum = "",
        yyyy = "",
        mm = "",
        amt = "",
      } = item;

      dataArr.rowstatus_s.push(targetnum == "" ? "N" : "U");
      dataArr.targetnum_s.push(targetnum);
      dataArr.yyyy_s.push(yyyy);
      dataArr.mm_s.push(mm);
      dataArr.amt_s.push(amt);
    });

    deletedMainRows.forEach((items: any, idx: number) => {
      items.map((item: any) => {
        dataArr.rowstatus_s.push("D");
        dataArr.targetnum_s.push(item.targetnum);
        dataArr.yyyy_s.push(item.yyyy);
        dataArr.mm_s.push(item.mm);
        dataArr.amt_s.push(item.amt);
      });
    });

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "N",
      person: data.person,
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      targetnum_s: dataArr.targetnum_s.join("|"),
      yyyy_s: dataArr.yyyy_s.join("|"),
      mm_s: dataArr.mm_s.join("|"),
      amt_s: dataArr.amt_s.join("|"),
    }));
  };

  const [paraDataSaved, setParaDataSaved] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    person: "",
    rowstatus_s: "",
    targetnum_s: "",
    yyyy_s: "",
    mm_s: "",
    amt_s: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "P_SA_A6000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataSaved.work_type,
      "@p_orgdiv": paraDataSaved.orgdiv,
      "@p_person": paraDataSaved.person,
      "@p_rowstatus_s": paraDataSaved.rowstatus_s,
      "@p_targetnum_s": paraDataSaved.targetnum_s,
      "@p_yyyy_s": paraDataSaved.yyyy_s,
      "@p_mm_s": paraDataSaved.mm_s,
      "@p_amt_s": paraDataSaved.amt_s,
      "@p_userid": userId,
      "@p_form_id": "SA_A6000W",
      "@p_pc": pc,
    },
  };

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
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
        }));
        setFilters2((prev) => ({
          ...prev,
          isSearch: true,
        }));
      } else {
        setFilters3((prev) => ({
          ...prev,
          find_row_value: data.returnString,
          isSearch: true,
        }));
      }
      setParaDataSaved({
        work_type: "",
        orgdiv: sessionOrgdiv,
        person: "",
        rowstatus_s: "",
        targetnum_s: "",
        yyyy_s: "",
        mm_s: "",
        amt_s: "",
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

  useEffect(() => {
    if (paraDataSaved.work_type !== "") fetchTodoGridSaved();
  }, [paraDataSaved]);

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data: any;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          deletedMainRows.push(mainDataResult4.data);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object) - 1];
    }

    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState3({
        [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
      });
    }
    change4(data);
  };

  const change4 = (datas: any) => {
    const data = mainDataResult3.data.filter(
      (item) => item[DATA_ITEM_KEY3] == datas[DATA_ITEM_KEY3]
    )[0];

    if (data != undefined) {
      setFilters4((prev) => ({
        ...prev,
        person: data.person,
        isSearch: true,
      }));
    } else {
      setMainDataResult3(process([], mainDataState3));
    }
  };

  const onAddClick = () => {
    let valid = true;

    mainDataResult3.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
      if (item.rowstatus == "N" || item.rowstatus == "U") {
        valid = false;
      }
    });

    if (valid != true) {
      alert("행 저장 후 진행해주세요.");
    } else {
      const newDataItem = {
        [DATA_ITEM_KEY3]: ++temp,
        amt: 0,
        conamt: 0,
        dptcd: "",
        orgdiv: sessionOrgdiv,
        person: "",
        rat: 0,
        user_name: "",
        rowstatus: "N",
      };

      setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
      setMainDataResult3((prev) => {
        return {
          data: [newDataItem, ...prev.data],
          total: prev.total + 1,
        };
      });

      const datas: any[] = [
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "01",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 1,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "02",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 2,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "03",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 3,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "04",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 4,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "05",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 5,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "06",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 6,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "07",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 7,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "08",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 8,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "09",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 9,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "10",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 10,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "11",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 11,
          rowstatus: "N",
        },
        {
          targetnum: "",
          yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
          mm: "12",
          amt: 0,
          conamt: 0,
          rat: 0,
          dif: 0,
          num: 12,
          rowstatus: "N",
        },
      ];
      setMainDataResult4((prev) => {
        return {
          data: datas,
          total: datas.length,
        };
      });
    }
  };

  const onAddClick2 = () => {
    if (mainDataResult2.data.length > 0) {
      if (!window.confirm("기존 자료가 초기화가 됩니다, 진행하시겠습니까?")) {
        return false;
      }
    }

    const datas: any[] = [
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "01",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 1,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "02",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 2,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "03",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 3,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "04",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 4,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "05",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 5,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "06",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 6,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "07",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 7,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "08",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 8,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "09",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 9,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "10",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 10,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "11",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 11,
        rowstatus: "N",
      },
      {
        targetnum: "",
        yyyy: convertDateToStr(filters.yyyy).substring(0, 4),
        mm: "12",
        amt: 0,
        conamt: 0,
        rat: 0,
        dif: 0,
        num: 12,
        rowstatus: "N",
      },
    ];
    setMainDataResult2((prev) => {
      return {
        data: datas,
        total: datas.length,
      };
    });
    if (isMobile && swiper) {
      swiper.slideTo(1);
    }
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
              <th>년도</th>
              <td>
                <DatePicker
                  name="yyyy"
                  value={filters.yyyy}
                  format="yyyy"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={YearCalendar}
                />
              </td>
              {tabSelected == 1 ? (
                <>
                  <th>사번</th>
                  <td>
                    <Input
                      name="user_id"
                      type="text"
                      value={filters.user_id}
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
                  <th>성명</th>
                  <td>
                    <Input
                      name="user_name"
                      type="text"
                      value={filters.user_name}
                      onChange={filterInputChange}
                    />
                  </td>
                </>
              ) : isMobile ? (
                ""
              ) : (
                <>
                  <th></th>
                  <td></td>
                  <th></th>
                  <td></td>
                </>
              )}
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        scrollable={isMobile}
      >
        <TabStripTab
          title="전사관리"
          disabled={permissions.view ? false : true}
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
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <GridTitle>
                        {convertDateToStr(filters.yyyy).substring(0, 4)}년
                      </GridTitle>
                      <GridTitle>
                        <Button
                          onClick={onAddClick2}
                          themeColor={"primary"}
                          icon="file-add"
                          disabled={permissions.save ? false : true}
                        >
                          신규
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
                      </GridTitle>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="판매계획관리"
                  >
                    <Grid
                      style={{ height: mobileheight }}
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
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : centerField.includes(item.fieldName)
                                      ? CenterCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell
                                      : numberField.includes(item.fieldName)
                                      ? editNumberFooterCell
                                      : percentField.includes(item.fieldName)
                                      ? mainPercentFooterCell
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
                    </ButtonContainer>
                  </GridTitleContainer>
                  <FormBoxWrap border={true} className="FormBoxWrap">
                    <FormBox>
                      <tr>
                        <th>이전년도 계약변경건 실적</th>
                        <td>
                          <Input
                            name="amt"
                            type="text"
                            value={numberWithCommas(information.amt)}
                            style={{ textAlign: "right" }}
                            className="readonly"
                          />
                        </td>
                        <td colSpan={2}>
                          <Button
                            onClick={onSave}
                            fillMode="outline"
                            themeColor={"primary"}
                            icon="save"
                            disabled={permissions.save ? false : true}
                          >
                            저장
                          </Button>
                        </td>
                      </tr>
                    </FormBox>
                  </FormBoxWrap>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="판매계획관리"
                  >
                    <Grid
                      style={{ height: mobileheight2 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
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
                      onItemChange={onMainItemChange}
                      cellRender={customCellRender}
                      rowRender={customRowRender}
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
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : undefined
                                  }
                                  footerCell={
                                    numberField.includes(item.fieldName)
                                      ? editNumberFooterCell2
                                      : percentField.includes(item.fieldName)
                                      ? mainPercentFooterCell2
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
          ) : (
            <>
              <GridContainerWrap>
                <GridContainer width="40%">
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>
                      {convertDateToStr(filters.yyyy).substring(0, 4)}년
                    </GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick2}
                        themeColor={"primary"}
                        icon="file-add"
                        disabled={permissions.save ? false : true}
                      >
                        신규
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export = exporter;
                    }}
                    fileName="판매계획관리"
                  >
                    <Grid
                      style={{ height: webheight }}
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
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : centerField.includes(item.fieldName)
                                      ? CenterCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell
                                      : numberField.includes(item.fieldName)
                                      ? editNumberFooterCell
                                      : percentField.includes(item.fieldName)
                                      ? mainPercentFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(60% - ${GAP}px)`}>
                  <GridTitleContainer>
                    <FormBoxWrap border={true} className="FormBoxWrap">
                      <FormBox>
                        <tr>
                          <th>이전년도 계약변경건 실적</th>
                          <td>
                            <Input
                              name="amt"
                              type="text"
                              value={numberWithCommas(information.amt)}
                              style={{ textAlign: "right" }}
                              className="readonly"
                            />
                          </td>
                          <td colSpan={2}>
                            <Button
                              onClick={onSave}
                              fillMode="outline"
                              themeColor={"primary"}
                              icon="save"
                              disabled={permissions.save ? false : true}
                            >
                              저장
                            </Button>
                          </td>
                        </tr>
                      </FormBox>
                    </FormBoxWrap>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult2.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName="판매계획관리"
                  >
                    <Grid
                      style={{ height: webheight2 }}
                      data={process(
                        mainDataResult2.data.map((row) => ({
                          ...row,
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
                      onItemChange={onMainItemChange}
                      cellRender={customCellRender}
                      rowRender={customRowRender}
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
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : undefined
                                  }
                                  footerCell={
                                    numberField.includes(item.fieldName)
                                      ? editNumberFooterCell2
                                      : percentField.includes(item.fieldName)
                                      ? mainPercentFooterCell2
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="개인관리"
          disabled={permissions.view ? false : true}
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
                <FormContext.Provider
                  value={{
                    userid,
                    username,
                    dptcd,
                    setUserId,
                    setUsername,
                    setDptcd,
                    mainDataState3,
                    setMainDataState3,
                    // fetchGrid,
                  }}
                >
                  <GridContainer style={{ width: "100%" }}>
                    <GridTitleContainer className="ButtonContainer3">
                      <ButtonContainer
                        style={{ justifyContent: "space-between" }}
                      >
                        <GridTitle>
                          {convertDateToStr(filters.yyyy).substring(0, 4)}년
                        </GridTitle>
                        <GridTitle>
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
                        </GridTitle>
                      </ButtonContainer>
                      <ButtonContainer>
                        <Button
                          onClick={onDeleteClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="판매계획관리"
                    >
                      <Grid
                        style={{ height: mobileheight3 }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
                            ...row,
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
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult3.total}
                        skip={page3.skip}
                        take={page3.take}
                        pageable={true}
                        onPageChange={pageChange3}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef}
                        rowHeight={30}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange3}
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
                          customOptionData.menuCustomColumnOptions["grdList3"]
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
                                    cell={
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : percentField.includes(item.fieldName)
                                        ? CustomPercentCell
                                        : contextField.includes(item.fieldName)
                                        ? ColumnCommandCell
                                        : customComboField.includes(
                                            item.fieldName
                                          )
                                        ? CustomComboBoxCell
                                        : undefined
                                    }
                                    headerCell={
                                      requireField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    footerCell={
                                      numberField.includes(item.fieldName)
                                        ? editNumberFooterCell3
                                        : percentField.includes(item.fieldName)
                                        ? mainPercentFooterCell3
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </FormContext.Provider>
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer4">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
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
                          themeColor={"primary"}
                          fillMode={"flat"}
                        ></Button>
                      </GridTitle>
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
                          onClick={onSave2}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          disabled={permissions.save ? false : true}
                        >
                          저장
                        </Button>
                      </ButtonContainer>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult4.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="판매계획관리"
                  >
                    <Grid
                      style={{ height: mobileheight4 }}
                      data={process(
                        mainDataResult4.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState4[idGetter4(row)],
                        })),
                        mainDataState4
                      )}
                      {...mainDataState4}
                      onDataStateChange={onMainDataStateChange4}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange4}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult4.total}
                      skip={page4.skip}
                      take={page4.take}
                      pageable={true}
                      onPageChange={pageChange4}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange4}
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
                        customOptionData.menuCustomColumnOptions["grdList4"]
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
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : undefined
                                  }
                                  footerCell={
                                    numberField.includes(item.fieldName)
                                      ? editNumberFooterCell4
                                      : percentField.includes(item.fieldName)
                                      ? mainPercentFooterCell4
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
          ) : (
            <>
              <GridContainerWrap>
                <FormContext.Provider
                  value={{
                    userid,
                    username,
                    dptcd,
                    setUserId,
                    setUsername,
                    setDptcd,
                    mainDataState3,
                    setMainDataState3,
                    // fetchGrid,
                  }}
                >
                  <GridContainer width="40%">
                    <GridTitleContainer className="ButtonContainer3">
                      <GridTitle>
                        {convertDateToStr(filters.yyyy).substring(0, 4)}년
                      </GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onDeleteClick}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                          disabled={permissions.save ? false : true}
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <ExcelExport
                      data={mainDataResult3.data}
                      ref={(exporter) => {
                        _export3 = exporter;
                      }}
                      fileName="판매계획관리"
                    >
                      <Grid
                        style={{ height: webheight3 }}
                        data={process(
                          mainDataResult3.data.map((row) => ({
                            ...row,
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
                        //스크롤 조회 기능
                        fixedScroll={true}
                        total={mainDataResult3.total}
                        skip={page3.skip}
                        take={page3.take}
                        pageable={true}
                        onPageChange={pageChange3}
                        //원하는 행 위치로 스크롤 기능
                        ref={gridRef}
                        rowHeight={30}
                        //정렬기능
                        sortable={true}
                        onSortChange={onMainSortChange3}
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
                          customOptionData.menuCustomColumnOptions["grdList3"]
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
                                    cell={
                                      numberField.includes(item.fieldName)
                                        ? NumberCell
                                        : percentField.includes(item.fieldName)
                                        ? CustomPercentCell
                                        : contextField.includes(item.fieldName)
                                        ? ColumnCommandCell
                                        : customComboField.includes(
                                            item.fieldName
                                          )
                                        ? CustomComboBoxCell
                                        : undefined
                                    }
                                    headerCell={
                                      requireField.includes(item.fieldName)
                                        ? RequiredHeader
                                        : undefined
                                    }
                                    footerCell={
                                      numberField.includes(item.fieldName)
                                        ? editNumberFooterCell3
                                        : percentField.includes(item.fieldName)
                                        ? mainPercentFooterCell3
                                        : undefined
                                    }
                                  />
                                )
                            )}
                      </Grid>
                    </ExcelExport>
                  </GridContainer>
                </FormContext.Provider>
                <GridContainer width={`calc(60% - ${GAP}px)`}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle></GridTitle>
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
                        onClick={onSave2}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        disabled={permissions.save ? false : true}
                      >
                        저장
                      </Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult4.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="판매계획관리"
                  >
                    <Grid
                      style={{ height: webheight4 }}
                      data={process(
                        mainDataResult4.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState4[idGetter4(row)],
                        })),
                        mainDataState4
                      )}
                      {...mainDataState4}
                      onDataStateChange={onMainDataStateChange4}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY4}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelectionChange4}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={mainDataResult4.total}
                      skip={page4.skip}
                      take={page4.take}
                      pageable={true}
                      onPageChange={pageChange4}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange4}
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
                        customOptionData.menuCustomColumnOptions["grdList4"]
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
                                      : percentField.includes(item.fieldName)
                                      ? CustomPercentCell
                                      : undefined
                                  }
                                  footerCell={
                                    numberField.includes(item.fieldName)
                                      ? editNumberFooterCell4
                                      : percentField.includes(item.fieldName)
                                      ? mainPercentFooterCell4
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainerWrap>
            </>
          )}
        </TabStripTab>
      </TabStrip>
      {PrsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType="N"
          setData={setPrsnnumData}
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

export default SA_A6000W;
