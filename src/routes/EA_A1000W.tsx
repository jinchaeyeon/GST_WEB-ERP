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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  ButtonContainer,
  FilterBox,
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
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/EA_A1000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";

let deletedMainRows: object[] = [];
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let temp4 = 0;
const headerField = ["user_name", "appseq", "appline"];
const editableField = ["user_name", "dptcd", "postcd", "resno", "appgb"];
const checkboxField = ["chooses", "arbitragb"];
const requiredField = ["appseq", "appline"];
const numberField = ["appseq"];
const customField = ["appline"];

type TdataArr = {
  rowstatus_s: string[];
  postcd: string[];
  resno: string[];
  appgb: string[];
  appseq: string[];
  arbitragb: string[];
  aftergb: string[];
  vicargb: string[];
  vicarid: string[];
  appline: string[];
  dptcd: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 결재라인표시
  UseBizComponent("L_EA004", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "appline" ? "L_EA004" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;

const EA_A1000: React.FC = () => {
  const user_id = UseGetValueFromSessionItem("user_id");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const pc = UseGetValueFromSessionItem("pc");
  const processApi = useApi();
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

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
  UseCustomOption("EA_A1000W", setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height5);
        setMobileHeight2(getDeviceHeight(true) - height2 - height5);
        setMobileHeight3(getDeviceHeight(true) - height3 - height5);
        setMobileHeight4(getDeviceHeight(true) - height4 - height5);
        setWebHeight(getDeviceHeight(true) - height5 - height);
        setWebHeight2((getDeviceHeight(true) - height5) / 2 - height2);
        setWebHeight3((getDeviceHeight(true) - height5) / 2 - height3);
        setWebHeight4((getDeviceHeight(true) - height5) / 2 - height4);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3, webheight4]);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
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
  UseMessages("EA_A1000W", setMessagesData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        pgmgb: defaultOption.find((item: any) => item.id == "pgmgb")?.valueCode,
        resno: defaultOption.find((item: any) => item.id == "resno")?.valueCode,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        pgmgb: defaultOption.find((item: any) => item.id == "pgmgb")?.valueCode,
        resno: defaultOption.find((item: any) => item.id == "resno")?.valueCode,
        isSearch: true,
      }));
      setFilters3((prev) => ({
        ...prev,
        pgmgb: defaultOption.find((item: any) => item.id == "pgmgb")?.valueCode,
        resno: defaultOption.find((item: any) => item.id == "resno")?.valueCode,
        isSearch: true,
      }));
      setFilters4((prev) => ({
        ...prev,
        pgmgb: defaultOption.find((item: any) => item.id == "pgmgb")?.valueCode,
        resno: defaultOption.find((item: any) => item.id == "resno")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_HU005, L_sysUserMaster_004, L_EA001",
    //부서, 직위(직책), 사용자, 결재구분,
    setBizComponentData
  );

  //공통코드 리스트 조회 ()

  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [resnoListData, setResnoListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [appgbListData, setappgbListData] = useState([COM_CODE_DEFAULT_VALUE]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
      setResnoListData(getBizCom(bizComponentData, "L_sysUserMaster_004"));
      setappgbListData(getBizCom(bizComponentData, "L_EA001"));
    }
  }, [bizComponentData]);

  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
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
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
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
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters2((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters3((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LOAD",
    orgdiv: sessionOrgdiv,
    pgmgb: "A",
    resno: "admin",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LINE_S",
    orgdiv: sessionOrgdiv,
    pgmgb: "A",
    resno: "admin",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LINE_J",
    orgdiv: sessionOrgdiv,
    pgmgb: "A",
    resno: "admin",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    worktype: "LINE_T",
    orgdiv: sessionOrgdiv,
    pgmgb: "A",
    resno: "admin",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true); //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_A1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.worktype,
        "@p_orgdiv": filters.orgdiv,
        "@p_person": filters.resno,
        "@p_pgmgb": filters.pgmgb,
        "@p_find_row_Value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });

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
    setLoading(true); //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_A1000W_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.worktype,
        "@p_orgdiv": filters2.orgdiv,
        "@p_person": filters2.resno,
        "@p_pgmgb": filters2.pgmgb,
        "@p_find_row_Value": filters2.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.resno == filters2.find_row_value.split("|")[0]
          );
          targetRowIndex2 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage2({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef2.current) {
          targetRowIndex2 = 0;
        }
      }
      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.resno == filters2.find_row_value.split("|")[0]
              );
        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
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
    setLoading(true); //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_A1000W_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.worktype,
        "@p_orgdiv": filters3.orgdiv,
        "@p_person": filters3.resno,
        "@p_pgmgb": filters3.pgmgb,
        "@p_find_row_Value": filters3.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.resno == filters3.find_row_value.split("|")[1]
          );
          targetRowIndex3 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage3({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef3.current) {
          targetRowIndex3 = 0;
        }
      }
      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters3.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.resno == filters3.find_row_value.split("|")[1]
              );
        if (selectedRow != undefined) {
          setSelectedState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
        } else {
          setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
        }
      }
    }
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
    setLoading(true); //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_A1000W_Q",
      pageNumber: filters4.pgNum,
      pageSize: filters4.pgSize,
      parameters: {
        "@p_work_type": filters4.worktype,
        "@p_orgdiv": filters4.orgdiv,
        "@p_person": filters4.resno,
        "@p_pgmgb": filters4.pgmgb,
        "@p_find_row_Value": filters4.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters4.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.resno == filters4.find_row_value.split("|")[2]
          );
          targetRowIndex4 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage4({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef4.current) {
          targetRowIndex4 = 0;
        }
      }
      setMainDataResult4((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters4.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.resno == filters4.find_row_value.split("|")[2]
              );
        if (selectedRow != undefined) {
          setSelectedState4({ [selectedRow[DATA_ITEM_KEY4]]: true });
        } else {
          setSelectedState4({ [rows[0][DATA_ITEM_KEY4]]: true });
        }
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
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
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
      setFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters3.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3, permissions, bizComponentData, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      filters4.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters4);
      setFilters4((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid4(deepCopiedFilters);
    }
  }, [filters4, permissions, bizComponentData, customOptionData]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [mainDataResult2]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [mainDataResult3]);
  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [mainDataResult4]);
  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
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

  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedState3(newSelectedState);
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
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      const optionsGridFour = _export4.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[3] = optionsGridFour.sheets[0];
      optionsGridOne.sheets[0].title = "참조리스트";
      optionsGridOne.sheets[1].title = "결재라인";
      optionsGridOne.sheets[2].title = "참조자";
      optionsGridOne.sheets[3].title = "시행자";
      _export.save(optionsGridOne);
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

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const search = () => {
    deletedMainRows = [];
    try {
      if (
        filters.pgmgb == null ||
        filters.pgmgb == "" ||
        filters.pgmgb == undefined
      ) {
        throw findMessage(messagesData, "EA_A1000W_001");
      } else if (
        filters.resno == null ||
        filters.resno == "" ||
        filters.resno == undefined
      ) {
        throw findMessage(messagesData, "EA_A1000W_002");
      } else {
        resetAllGrid();
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters2((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters3((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        setFilters4((prev: any) => ({
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "chooses") {
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
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev: { total: any }) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
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
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = mainDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setMainDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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

  const onAddClick = () => {
    const rows = mainDataResult.data.filter((item) => item.chooses == true);
    if (rows.length == 0) {
      alert("반영할 결재자가 선택되지 않았습니다.");
      return false;
    } else {
      let isValid = true;
      rows.map((item) => {
        mainDataResult2.data.map((items) => {
          if (item.user_id == items.resno) {
            isValid = false;
            return false;
          }
        });
      });

      if (!isValid) {
        alert("중복되는 유저가 있습니다.");
        return false;
      }

      let count = 0;

      mainDataResult2.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
        if (item.appseq > count) {
          count = item.appseq;
        }
      });

      rows.map((item) => {
        const newDataItem = {
          aftergb: "N",
          appgb: "S",
          appline: "",
          appseq: count + 1,
          arbitragb: "N",
          dptcd: item.dptcd,
          insert_pc: pc,
          insert_time: "",
          insert_userid: item.user_id,
          userid: user_id,
          num: ++temp2,
          orgdiv: sessionOrgdiv,
          person: filters.resno,
          pgmgb: "A",
          postcd: item.postcd,
          resno: item.user_id,
          vicargb: "N",
          vicarid: "",
          rowstatus: "N",
          form_id: "EA_A1000W",
          inEdit: undefined,
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
      });
    }
  };

  const onAddClick2 = () => {
    const rows = mainDataResult.data.filter((item) => item.chooses == true);
    if (rows.length == 0) {
      alert("반영할 참조자가 선택되지 않았습니다.");
      return false;
    } else {
      let isValid = true;
      rows.map((item) => {
        mainDataResult3.data.map((items) => {
          if (item.user_id == items.resno) {
            isValid = false;
            return false;
          }
        });
      });

      if (!isValid) {
        alert("중복되는 유저가 있습니다.");
        return false;
      }

      let count = 0;

      mainDataResult3.data.map((item) => {
        if (item.num > temp3) {
          temp3 = item.num;
        }
        if (item.appseq > count) {
          count = item.appseq;
        }
      });

      rows.map((item) => {
        const newDataItem = {
          aftergb: "N",
          appgb: "T",
          appline: "",
          appseq: count + 1,
          arbitragb: "N",
          dptcd: item.dptcd,
          insert_pc: pc,
          insert_time: "",
          insert_userid: item.user_id,
          userid: user_id,
          num: ++temp3,
          orgdiv: sessionOrgdiv,
          person: filters.resno,
          pgmgb: "A",
          postcd: item.postcd,
          resno: item.user_id,
          vicargb: "N",
          vicarid: "",
          rowstatus: "N",
          form_id: "EA_A1000W",
          inEdit: undefined,
        };

        setSelectedState3({ [newDataItem[DATA_ITEM_KEY3]]: true });
        setPage3((prev) => ({
          ...prev,
          skip: 0,
          take: prev.take + 1,
        }));
        setMainDataResult3((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      });
    }
  };

  const onAddClick3 = () => {
    const rows = mainDataResult.data.filter((item) => item.chooses == true);
    if (rows.length == 0) {
      alert("반영할 합의자가 선택되지 않았습니다.");
      return false;
    } else {
      let isValid = true;
      rows.map((item) => {
        mainDataResult2.data.map((items) => {
          if (item.user_id == items.resno) {
            isValid = false;
            return false;
          }
        });
      });

      if (!isValid) {
        alert("중복되는 유저가 있습니다.");
        return false;
      }
      let count = 0;

      mainDataResult2.data.map((item) => {
        if (item.num > temp2) {
          temp2 = item.num;
        }
        if (item.appseq > count) {
          count = item.appseq;
        }
      });

      rows.map((item) => {
        const newDataItem = {
          aftergb: "N",
          appgb: "H",
          appline: "",
          appseq: count + 1,
          arbitragb: "N",
          dptcd: item.dptcd,
          insert_pc: pc,
          insert_time: "",
          insert_userid: item.user_id,
          userid: user_id,
          num: ++temp2,
          orgdiv: sessionOrgdiv,
          person: filters.resno,
          pgmgb: "A",
          postcd: item.postcd,
          resno: item.user_id,
          vicargb: "N",
          vicarid: "",
          rowstatus: "N",
          form_id: "EA_A1000W",
          inEdit: undefined,
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
      });
    }
  };

  const onAddClick4 = () => {
    const rows = mainDataResult.data.filter((item) => item.chooses == true);
    if (rows.length == 0) {
      alert("반영할 시행자가 선택되지 않았습니다.");
      return false;
    } else {
      let isValid = true;
      rows.map((item) => {
        mainDataResult4.data.map((items) => {
          if (item.user_id == items.resno) {
            isValid = false;
            return false;
          }
        });
      });

      if (!isValid) {
        alert("중복되는 유저가 있습니다.");
        return false;
      }

      let count = 0;

      mainDataResult4.data.map((item) => {
        if (item.num > temp4) {
          temp4 = item.num;
        }
        if (item.appseq > count) {
          count = item.appseq;
        }
      });

      rows.map((item) => {
        const newDataItem = {
          aftergb: "N",
          appgb: "J",
          appline: "",
          appseq: count + 1,
          arbitragb: "N",
          dptcd: item.dptcd,
          insert_pc: pc,
          insert_time: "",
          insert_userid: item.user_id,
          userid: user_id,
          num: ++temp4,
          orgdiv: sessionOrgdiv,
          person: filters.resno,
          pgmgb: "A",
          postcd: item.postcd,
          resno: item.user_id,
          vicargb: "N",
          vicarid: "",
          rowstatus: "N",
          form_id: "EA_A1000W",
          inEdit: undefined,
        };

        setSelectedState4({ [newDataItem.num]: true });
        setPage4((prev) => ({
          ...prev,
          skip: 0,
          take: prev.take + 1,
        }));
        setMainDataResult4((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
      });
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    person: filters.resno,
    pgmgb: filters.pgmgb,
    postcd: "",
    resno: "",
    appgb: "",
    appseq: "",
    arbitragb: "",
    aftergb: "",
    vicargb: "",
    vicarid: "",
    appline: "",
    rowstatus_s: "",
    dptcd: "",
    userid: user_id,
    pc: pc,
    form_id: "EA_A1000W",
  });

  const para: Iparameters = {
    procedureName: "P_EA_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": "N",
      "@p_orgdiv": ParaData.orgdiv,
      "@p_person": ParaData.person,
      "@p_pgmgb": ParaData.pgmgb,
      "@p_postcd": ParaData.postcd,
      "@p_resno": ParaData.resno,
      "@p_appgb": ParaData.appgb,
      "@p_appseq": ParaData.appseq,
      "@p_arbitragb": ParaData.arbitragb,
      "@p_aftergb": ParaData.aftergb,
      "@p_vicargb": ParaData.vicargb,
      "@p_vicarid": ParaData.vicarid,
      "@p_appline": ParaData.appline,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_dptcd": ParaData.dptcd,
      "@p_userid": ParaData.userid,
      "@p_pc": ParaData.pc,
      "@p_form_id": ParaData.form_id,
    },
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;
    let isValid = true;

    if (mainDataResult2.total != 0) {
      for (var i = mainDataResult2.total; i > 0; i--) {
        if (
          mainDataResult2.data[mainDataResult2.total - i].appseq == 0 &&
          isValid == true
        ) {
          alert("결재순서를 입력해주세요.");
          isValid = false;
          return false;
        } else if (
          mainDataResult2.data[mainDataResult2.total - i].appline == "" &&
          isValid == true
        ) {
          alert("결재라인을 선택해주세요.");
          isValid = false;
          return false;
        }
      }
    }

    if (!isValid) {
      return false;
    } else {
      let dataArr: TdataArr = {
        rowstatus_s: [],
        postcd: [],
        resno: [],
        appgb: [],
        appseq: [],
        arbitragb: [],
        aftergb: [],
        vicargb: [],
        vicarid: [],
        appline: [],
        dptcd: [],
      };
      const dataItem = mainDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      const dataItem2 = mainDataResult3.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      const dataItem3 = mainDataResult4.data.filter((item: any) => {
        return (
          (item.rowstatus == "N" || item.rowstatus == "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.forEach((item: any, idx: number) => {
        const {
          postcd = "",
          resno = "",
          appgb = "",
          appseq = "",
          arbitragb = "",
          aftergb = "",
          vicargb = "",
          vicarid = "",
          appline = "",
          rowstatus = "",
          dptcd = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.postcd.push(postcd);
        dataArr.resno.push(resno);
        dataArr.appgb.push(appgb);
        dataArr.appseq.push(appseq);
        dataArr.arbitragb.push(
          arbitragb == true
            ? "Y"
            : arbitragb == false
            ? "N"
            : arbitragb == "Y"
            ? "Y"
            : "N"
        );
        dataArr.aftergb.push(aftergb);
        dataArr.vicargb.push(vicargb);
        dataArr.vicarid.push(vicarid);
        dataArr.appline.push(appline);
        dataArr.dptcd.push(dptcd);
      });
      dataItem2.forEach((item: any, idx: number) => {
        const {
          postcd = "",
          resno = "",
          appgb = "",
          appseq = "",
          arbitragb = "",
          aftergb = "",
          vicargb = "",
          vicarid = "",
          appline = "",
          rowstatus = "",
          dptcd = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.postcd.push(postcd);
        dataArr.resno.push(resno);
        dataArr.appgb.push(appgb);
        dataArr.appseq.push(appseq);
        dataArr.arbitragb.push(
          arbitragb == true
            ? "Y"
            : arbitragb == false
            ? "N"
            : arbitragb == "Y"
            ? "Y"
            : "N"
        );
        dataArr.aftergb.push(aftergb);
        dataArr.vicargb.push(vicargb);
        dataArr.vicarid.push(vicarid);
        dataArr.appline.push(appline);
        dataArr.dptcd.push(dptcd);
      });
      dataItem2.forEach((item: any, idx: number) => {
        const {
          postcd = "",
          resno = "",
          appgb = "",
          appseq = "",
          arbitragb = "",
          aftergb = "",
          vicargb = "",
          vicarid = "",
          appline = "",
          rowstatus = "",
          dptcd = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.postcd.push(postcd);
        dataArr.resno.push(resno);
        dataArr.appgb.push(appgb);
        dataArr.appseq.push(appseq);
        dataArr.arbitragb.push(
          arbitragb == true
            ? "Y"
            : arbitragb == false
            ? "N"
            : arbitragb == "Y"
            ? "Y"
            : "N"
        );
        dataArr.aftergb.push(aftergb);
        dataArr.vicargb.push(vicargb);
        dataArr.vicarid.push(vicarid);
        dataArr.appline.push(appline);
        dataArr.dptcd.push(dptcd);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          postcd = "",
          resno = "",
          appgb = "",
          appseq = "",
          arbitragb = "",
          aftergb = "",
          vicargb = "",
          vicarid = "",
          appline = "",
          rowstatus = "",
          dptcd = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.postcd.push(postcd);
        dataArr.resno.push(resno);
        dataArr.appgb.push(appgb);
        dataArr.appseq.push(appseq);
        dataArr.arbitragb.push(
          arbitragb == true
            ? "Y"
            : arbitragb == false
            ? "N"
            : arbitragb == "Y"
            ? "Y"
            : "N"
        );
        dataArr.aftergb.push(aftergb);
        dataArr.vicargb.push(vicargb);
        dataArr.vicarid.push(vicarid);
        dataArr.appline.push(appline);
        dataArr.dptcd.push(dptcd);
      });
      setParaData((prev) => ({
        ...prev,
        person: filters.resno,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        postcd: dataArr.postcd.join("|"),
        resno: dataArr.resno.join("|"),
        appgb: dataArr.appgb.join("|"),
        appseq: dataArr.appseq.join("|"),
        arbitragb: dataArr.arbitragb.join("|"),
        aftergb: dataArr.aftergb.join("|"),
        vicargb: dataArr.vicargb.join("|"),
        vicarid: dataArr.vicarid.join("|"),
        appline: dataArr.appline.join("|"),
        dptcd: dataArr.dptcd.join("|"),
      }));
    }
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

    if (data.isSuccess == false) {
      alert("결재자가 중복되어 저장할 수 없습니다.");
    } else {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
      setFilters4((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: data.returnString,
      }));
    }

    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s.length != 0 && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const onDeleteClick = (e: any) => {
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
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult2.data[Math.min(...Object2)];
    } else {
      data = mainDataResult2.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult2((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState2({
      [data != undefined ? data[DATA_ITEM_KEY2] : newData[0]]: true,
    });
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY3]]) {
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
      data = mainDataResult3.data[Math.min(...Object2)];
    } else {
      data = mainDataResult3.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult3((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState3({
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };

  const onDeleteClick3 = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult4.data.forEach((item: any, index: number) => {
      if (!selectedState4[item[DATA_ITEM_KEY4]]) {
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
      data = mainDataResult4.data[Math.min(...Object2)];
    } else {
      data = mainDataResult4.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult4((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState4({
      [data != undefined ? data[DATA_ITEM_KEY4] : newData[0]]: true,
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
    if (filters.resno == rowData.resno) {
      alert("작성자의 행은 이동 불가능합니다.");
      return false;
    }
    if (!(rowIndex == 0 && direction == "UP")) {
      const newData = dataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      let replaceData = 0;
      if (direction == "UP" && rowIndex != 0) {
        replaceData = dataResult.data[rowIndex - 1].appseq;
      } else {
        replaceData = dataResult.data[rowIndex + 1].appseq;
      }

      newData.splice(rowIndex, 1);
      newData.splice(rowIndex + (direction == "UP" ? -1 : 1), 0, rowData);
      if (direction == "UP" && rowIndex != 0) {
        const newDatas = newData.map((item) =>
          item[DATA_ITEM_KEY] == rowData[DATA_ITEM_KEY]
            ? {
                ...item,
                appseq: replaceData,
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex - 1].num
            ? {
                ...item,
                appseq: rowData.appseq,
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
                appseq: replaceData,
                [EDIT_FIELD]: undefined,
              }
            : item[DATA_ITEM_KEY] == dataResult.data[rowIndex + 1].num
            ? {
                ...item,
                appseq: rowData.appseq,
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

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <>
              <TopButtons
                search={search}
                exportExcel={exportExcel}
                permissions={permissions}
                pathname="EA_A1000W"
              />
            </>
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>프로그램구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="pgmgb"
                    value={filters.pgmgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>작성자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="resno"
                    value={filters.resno}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                    className="required"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

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
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <GridTitle>참조</GridTitle>
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
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    결재
                  </Button>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    참조
                  </Button>
                  <Button
                    onClick={onAddClick3}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    합의
                  </Button>
                  <Button
                    onClick={onAddClick4}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    시행
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="결재라인지정"
              >
                <Grid
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
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
                  style={{ height: mobileheight }}
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
                              editable={
                                editableField.includes(item.fieldName)
                                  ? false
                                  : true
                              }
                              className={
                                requiredField.includes(item.fieldName)
                                  ? "required"
                                  : undefined
                              }
                              cell={
                                checkboxField.includes(item.fieldName)
                                  ? CheckBoxCell
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
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer2">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
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
                    <GridTitle>결재라인</GridTitle>
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
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick}
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
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                    disabled={permissions.save ? false : true}
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName="결재라인지정"
              >
                <Grid
                  data={process(
                    mainDataResult2.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
                      )?.code_name,
                      resno: resnoListData.find(
                        (item: any) => item.user_id == row.resno
                      )?.user_name,
                      appgb: appgbListData.find(
                        (item: any) => item.sub_code == row.appgb
                      )?.code_name,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                    })),
                    mainDataState2
                  )}
                  {...mainDataState2}
                  style={{ height: mobileheight2 }}
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
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef2}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange2}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  //incell 수정 기능
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
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              headerCell={
                                headerField.includes(item.fieldName)
                                  ? RequiredHeader
                                  : undefined
                              }
                              editable={
                                editableField.includes(item.fieldName)
                                  ? false
                                  : true
                              }
                              className={
                                requiredField.includes(item.fieldName)
                                  ? "required"
                                  : undefined
                              }
                              cell={
                                checkboxField.includes(item.fieldName)
                                  ? CheckBoxCell
                                  : numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : customField.includes(item.fieldName)
                                  ? CustomComboBoxCell
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
          <SwiperSlide key={2}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer3">
                <ButtonContainer style={{ justifyContent: "space-between" }}>
                  <ButtonContainer>
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
                    <GridTitle>참조자</GridTitle>
                  </ButtonContainer>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(3);
                      }
                    }}
                    icon="chevron-right"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                </ButtonContainer>
                <ButtonContainer>
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
              <ExcelExport
                data={mainDataResult3.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName="결재라인지정"
              >
                <Grid
                  data={process(
                    mainDataResult3.data.map((row) => ({
                      ...row,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
                      )?.code_name,
                      resno: resnoListData.find(
                        (item: any) => item.user_id == row.resno
                      )?.user_name,
                      appgb: appgbListData.find(
                        (item: any) => item.sub_code == row.appgb
                      )?.code_name,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                    })),
                    mainDataState3
                  )}
                  {...mainDataState3}
                  style={{ height: mobileheight3 }}
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
                  ref={gridRef3}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange3}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
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
                              editable={
                                editableField.includes(item.fieldName)
                                  ? false
                                  : true
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
          <SwiperSlide key={3}>
            <GridContainer style={{ width: "100%", overflow: "auto" }}>
              <GridTitleContainer className="ButtonContainer4">
                <ButtonContainer style={{ justifyContent: "left" }}>
                  <Button
                    onClick={() => {
                      if (swiper && isMobile) {
                        swiper.slideTo(2);
                      }
                    }}
                    icon="chevron-left"
                    themeColor={"primary"}
                    fillMode={"flat"}
                  ></Button>
                  <GridTitle>시행자</GridTitle>
                </ButtonContainer>
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick3}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult4.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName="결재라인지정"
              >
                <Grid
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
                      )?.code_name,
                      resno: resnoListData.find(
                        (item: any) => item.user_id == row.resno
                      )?.user_name,
                      appgb: appgbListData.find(
                        (item: any) => item.sub_code == row.appgb
                      )?.code_name,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      rowstatus:
                        row.rowstatus == null ||
                        row.rowstatus == "" ||
                        row.rowstatus == undefined
                          ? ""
                          : row.rowstatus,
                      [SELECTED_FIELD]: selectedState4[idGetter4(row)],
                    })),
                    mainDataState4
                  )}
                  {...mainDataState4}
                  style={{ height: mobileheight4 }}
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
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef4}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange4}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
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
                              editable={
                                editableField.includes(item.fieldName)
                                  ? false
                                  : true
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell4
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
            <GridContainer width="35%">
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>참조</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    결재
                  </Button>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    참조
                  </Button>
                  <Button
                    onClick={onAddClick3}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    합의
                  </Button>
                  <Button
                    onClick={onAddClick4}
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    시행
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult.data}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="결재라인지정"
              >
                <Grid
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      dptcd: dptcdListData.find(
                        (item: any) => item.dptcd == row.dptcd
                      )?.dptnm,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code == row.postcd
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
                  style={{ height: webheight }}
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
                              editable={
                                editableField.includes(item.fieldName)
                                  ? false
                                  : true
                              }
                              className={
                                requiredField.includes(item.fieldName)
                                  ? "required"
                                  : undefined
                              }
                              cell={
                                checkboxField.includes(item.fieldName)
                                  ? CheckBoxCell
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
            <GridContainer width={`calc(65% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>결재라인</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onDeleteClick}
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
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                      disabled={permissions.save ? false : true}
                    >
                      저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult2.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="결재라인지정"
                >
                  <Grid
                    data={process(
                      mainDataResult2.data.map((row) => ({
                        ...row,
                        dptcd: dptcdListData.find(
                          (item: any) => item.dptcd == row.dptcd
                        )?.dptnm,
                        postcd: postcdListData.find(
                          (item: any) => item.sub_code == row.postcd
                        )?.code_name,
                        resno: resnoListData.find(
                          (item: any) => item.user_id == row.resno
                        )?.user_name,
                        appgb: appgbListData.find(
                          (item: any) => item.sub_code == row.appgb
                        )?.code_name,
                        rowstatus:
                          row.rowstatus == null ||
                          row.rowstatus == "" ||
                          row.rowstatus == undefined
                            ? ""
                            : row.rowstatus,
                        [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                      })),
                      mainDataState2
                    )}
                    {...mainDataState2}
                    style={{ height: webheight2 }}
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
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    //incell 수정 기능
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                headerCell={
                                  headerField.includes(item.fieldName)
                                    ? RequiredHeader
                                    : undefined
                                }
                                editable={
                                  editableField.includes(item.fieldName)
                                    ? false
                                    : true
                                }
                                className={
                                  requiredField.includes(item.fieldName)
                                    ? "required"
                                    : undefined
                                }
                                cell={
                                  checkboxField.includes(item.fieldName)
                                    ? CheckBoxCell
                                    : numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : customField.includes(item.fieldName)
                                    ? CustomComboBoxCell
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
              <GridContainerWrap>
                <GridContainer width={`50%`}>
                  <GridTitleContainer className="ButtonContainer3">
                    <GridTitle>참조자</GridTitle>
                    <ButtonContainer>
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
                  <ExcelExport
                    data={mainDataResult3.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="결재라인지정"
                  >
                    <Grid
                      data={process(
                        mainDataResult3.data.map((row) => ({
                          ...row,
                          postcd: postcdListData.find(
                            (item: any) => item.sub_code == row.postcd
                          )?.code_name,
                          resno: resnoListData.find(
                            (item: any) => item.user_id == row.resno
                          )?.user_name,
                          appgb: appgbListData.find(
                            (item: any) => item.sub_code == row.appgb
                          )?.code_name,
                          dptcd: dptcdListData.find(
                            (item: any) => item.dptcd == row.dptcd
                          )?.dptnm,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
                          [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                        })),
                        mainDataState3
                      )}
                      {...mainDataState3}
                      style={{ height: webheight3 }}
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
                      ref={gridRef3}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange3}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
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
                                  editable={
                                    editableField.includes(item.fieldName)
                                      ? false
                                      : true
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
                <GridContainer width={`calc(50% - ${GAP}px)`}>
                  <GridTitleContainer className="ButtonContainer4">
                    <GridTitle>시행자</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onDeleteClick3}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        title="행 삭제"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={mainDataResult4.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="결재라인지정"
                  >
                    <Grid
                      data={process(
                        mainDataResult4.data.map((row) => ({
                          ...row,
                          postcd: postcdListData.find(
                            (item: any) => item.sub_code == row.postcd
                          )?.code_name,
                          resno: resnoListData.find(
                            (item: any) => item.user_id == row.resno
                          )?.user_name,
                          appgb: appgbListData.find(
                            (item: any) => item.sub_code == row.appgb
                          )?.code_name,
                          dptcd: dptcdListData.find(
                            (item: any) => item.dptcd == row.dptcd
                          )?.dptnm,
                          rowstatus:
                            row.rowstatus == null ||
                            row.rowstatus == "" ||
                            row.rowstatus == undefined
                              ? ""
                              : row.rowstatus,
                          [SELECTED_FIELD]: selectedState4[idGetter4(row)],
                        })),
                        mainDataState4
                      )}
                      {...mainDataState4}
                      style={{ height: webheight4 }}
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
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange4}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
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
                                  editable={
                                    editableField.includes(item.fieldName)
                                      ? false
                                      : true
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell4
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainerWrap>
            </GridContainer>
          </GridContainerWrap>
        </>
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

export default EA_A1000;
