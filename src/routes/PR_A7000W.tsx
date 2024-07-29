import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
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
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
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
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  numberWithCommas,
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
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import {
  CellRender as CellRender2,
  RowRender as RowRender2,
} from "../components/Renderers/GroupRenderers";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { IItemData } from "../hooks/interfaces";
import { isLoading, loginResultState, sessionItemState } from "../store/atoms";
import { gridList } from "../store/columns/PR_A7000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY4 = "num";
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;

const numberField = [
  "qty",
  "plqty",
  "reqty",
  "procseq",
  "jisiqty",
  "goodqty",
  "badqty",
  "tot_jisiqty",
  "planqty",
  "prodqty",
];
const numberField2 = ["reqty"];
const DateField = ["plandt", "finexpdt", "godt"];
const customField = ["proccd", "prodmac", "prodemp"];
const customHeaderField = ["proccd", "procseq", "reqty"];
const checkField = ["finyn"];
type TdataArr = {
  planno_s: string[];
  chkyn_s: string[];
  plankey_s: string[];
  prodmac_s: string[];
  prodemp_s: string[];
  gokey_s: string[];
  qty_s: string[];
  godt_s: string[];
};
type TdataArr2 = {
  rowstatus_s: string[];
  gonum_s: string[];
  goseq_s: string[];
  location_s: string[];
  godt_s: string[];
  prodmac_s: string[];
  prodemp_s: string[];
  qty_s: string[];
  planno_s: string[];
  planseq_s: string[];
  ordnum_s: string[];
  ordseq_s: string[];
  remark_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 공정,대분류,중분류,소분류,품목계정,단위,중량단위
  UseBizComponent("L_PR010,L_sysUserMaster_001,L_fxcode", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "proccd"
      ? "L_PR010"
      : field == "prodmac"
      ? "L_fxcode"
      : field == "prodemp"
      ? "L_sysUserMaster_001"
      : "";

  const fieldName =
    field == "prodemp"
      ? "user_name"
      : field == "prodmac"
      ? "fxfull"
      : undefined;

  const filedValue =
    field == "prodemp" ? "user_id" : field == "prodmac" ? "fxcode" : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return props.rowType == "groupHeader" ? null : bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      {...props}
      textField={fieldName}
      valueField={filedValue}
    />
  ) : (
    <td></td>
  );
};

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;

const PR_A7000W: React.FC = () => {
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const idGetter4 = getter(DATA_ITEM_KEY4);
  const pc = UseGetValueFromSessionItem("pc");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;
    setDetailFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: 1,
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
  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
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
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [tabSelected, setTabSelected] = React.useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".k-tabstrip-items-wrapper");
      height3 = getHeight(".ButtonContainer");
      height4 = getHeight(".ButtonContainer2");
      height5 = getHeight(".ButtonContainer3");
      height6 = getHeight(".ButtonContainer4");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height2 - height3);
        setMobileHeight2(getDeviceHeight(true) - height - height2 - height4);
        setMobileHeight3(getDeviceHeight(true) - height - height2 - height5);
        setMobileHeight4(getDeviceHeight(true) - height - height2 - height6);
        setWebHeight((getDeviceHeight(true) - height - height2) / 2 - height3);
        setWebHeight2((getDeviceHeight(true) - height - height2) / 2 - height4);
        setWebHeight3((getDeviceHeight(true) - height - height2) / 2 - height5);
        setWebHeight4(getDeviceHeight(true) - height - height2 - height6);
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
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
        prodmac: defaultOption.find((item: any) => item.id == "prodmac")
          ?.valueCode,
        prodemp: defaultOption.find((item: any) => item.id == "prodemp")
          ?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_fxcode, L_sysUserMaster_001, L_BA015,L_PR010,L_BA002",
    setBizComponentData
  );

  const [prodmacListData, setProdmacListData] = React.useState([
    { fxcode: "", fxfull: "" },
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [locationListData, setLocationListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setProdmacListData(getBizCom(bizComponentData, "L_fxcode"));
      setProdempListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
      setLocationListData(getBizCom(bizComponentData, "L_BA002"));
    }
  }, [bizComponentData]);

  const [sessionItem] = useRecoilState(sessionItemState);
  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [group2, setGroup2] = React.useState(initialGroup);
  const [total2, setTotal2] = useState(0);
  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [resultState2, setResultState2] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);
  const [collapsedState2, setCollapsedState2] = React.useState<string[]>([]);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  //그리드 데이터 스테이트
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
  //그리드 데이터 결과값
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
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
  //그리드 데이터 결과값
  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailDataState2)
  );

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  //선택 상태
  const [detailselectedState, setDetailselectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState2, setDetailselectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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
  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "PLAN",
    orgdiv: sessionOrgdiv,
    location: "",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    insiz: "",
    finyn: "",
    planno: "",
    ordnum: "",
    plankey: "",
    ordkey: "",
    gokey: "",
    custcd: "",
    custnm: "",
    project: "",
    proccd: "",
    prodmac: "",
    prodemp: "",
    companyCode: companyCode,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "PROC",
    planno: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [detailfilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "GOLIST",
    planno: "",
    godt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A7000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code == "orgdiv"
        )?.value,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_finyn": filters.finyn,
        "@p_planno": filters.planno,
        "@p_ordnum": filters.ordnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_gonum_s": "",
        "@p_ordnump": "",
        "@p_pcnt": 0,
        "@p_gonum": "",
        "@p_godt": "",
        "@p_proccd": "",
        "@p_prodmac": "",
        "@p_prodemp": "",
        "@p_rcvcustcd": "",
        "@p_rcvcustnm": "",
        "@p_bnatur": "",
        "@p_project": filters.project,
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
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
      }));

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.planno == filters.find_row_value
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
            : rows.find((row: any) => row.planno == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            planno: selectedRow.planno,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            planno: selectedRow.planno,
            godt: selectedRow.plandt,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            planno: rows[0].planno,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            planno: rows[0].planno,
            godt: rows[0].plandt,
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    if (!permissions.view) return;
    let data: any;
    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_PR_A7000W_LIST_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code == "orgdiv"
        )?.value,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_proccd": filters.proccd,
        "@p_prodmac": filters.prodmac,
        "@p_prodemp": filters.prodemp,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_ordkey": filters.ordkey,
        "@p_plankey": filters.plankey,
        "@p_gokey": filters.gokey,
        "@p_finyn": filters.finyn,
        "@p_gonum_s": "",
        "@p_goseq_s": "",
        "@p_dwgno": "",
        "@p_project": filters.project,
        "@p_bnatur": "",
        "@p_find_row_value": filters2.find_row_value,
      },
    };
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
        groupId: row.gonum + "gonum",
        group_category_name: "작업지시번호" + " : " + row.gonum,
      }));

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.gonum + "-" + row.goseq == filters2.find_row_value
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
      const newDataState = processWithGroups(rows, group2);
      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal2(totalRowCnt);
      setResultState2(newDataState);
      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.gonum + "-" + row.goseq == filters2.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState2({ [selectedRow[DATA_ITEM_KEY4]]: true });
        } else {
          setSelectedState2({ [rows[0][DATA_ITEM_KEY4]]: true });
        }
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
  const fetchDetailGrid = async (detailfilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const detailParameters: Iparameters = {
      procedureName: "P_PR_A7000W_Q",
      pageNumber: detailfilters.pgNum,
      pageSize: detailfilters.pgSize,
      parameters: {
        "@p_work_type": detailfilters.work_type,
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code == "orgdiv"
        )?.value,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_finyn": filters.finyn,
        "@p_planno": detailfilters.planno,
        "@p_ordnum": filters.ordnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_gonum_s": "",
        "@p_ordnump": "",
        "@p_pcnt": 0,
        "@p_gonum": "",
        "@p_godt": "",
        "@p_proccd": "",
        "@p_prodmac": "",
        "@p_prodemp": "",
        "@p_rcvcustcd": "",
        "@p_rcvcustnm": "",
        "@p_bnatur": "",
        "@p_project": filters.project,
        "@p_find_row_value": detailfilters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
        godt: row.godt == "" ? convertDateToStr(new Date()) : row.godt,
        reqty: 0,
        chk: false,
      }));

      if (detailfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.planno == detailfilters.find_row_value
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
      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          detailfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.planno == detailfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailselectedState({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setDetailselectedState({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  //그리드 데이터 조회
  const fetchDetailGrid2 = async (detailfilters2: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const detailParameters2: Iparameters = {
      procedureName: "P_PR_A7000W_Q",
      pageNumber: detailfilters2.pgNum,
      pageSize: detailfilters2.pgSize,
      parameters: {
        "@p_work_type": detailfilters2.work_type,
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code == "orgdiv"
        )?.value,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_finyn": filters.finyn,
        "@p_planno": detailfilters2.planno,
        "@p_ordnum": filters.ordnum,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_gonum_s": "",
        "@p_ordnump": "",
        "@p_pcnt": 0,
        "@p_gonum": "",
        "@p_godt": detailfilters2.godt,
        "@p_proccd": "",
        "@p_prodmac": "",
        "@p_prodemp": "",
        "@p_rcvcustcd": "",
        "@p_rcvcustnm": "",
        "@p_bnatur": "",
        "@p_project": filters.project,
        "@p_find_row_value": detailfilters2.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, num: number) => ({
        ...row,
        groupId: row.gonum + "gonum",
        group_category_name: "작업지시번호" + " : " + row.gonum,
        chk: row.chk == "Y" ? true : row.chk == "N" ? false : row.chk,
      }));

      if (detailfilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.planno == detailfilters2.find_row_value
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
      const newDataState = processWithGroups(rows, group);
      setDetailDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal(totalRowCnt);
      setResultState(newDataState);
      if (totalRowCnt > 0) {
        const selectedRow =
          detailfilters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.planno == detailfilters2.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailselectedState2({ [selectedRow[DATA_ITEM_KEY3]]: true });
        } else {
          setDetailselectedState2({ [rows[0][DATA_ITEM_KEY3]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  //그리드 리셋
  const resetAllGrid = () => {
    setDetailDataResult(process([], detailDataState));
    setDetailDataResult2(process([], detailDataState));
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

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
  }, [detailDataResult]);

  useEffect(() => {
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [resultState]);

  useEffect(() => {
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [resultState2]);

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  const newData2 = setExpandedState({
    data: resultState2,
    collapsedIds: collapsedState2,
  });

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters((prev) => ({
      ...prev,
      planno: selectedRowData.planno,
      pgNum: 1,
      isSearch: true,
    }));
    setDetailFilters2((prev) => ({
      ...prev,
      planno: selectedRowData.planno,
      pgNum: 1,
      isSearch: true,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onMainSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState2(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setDetailselectedState(newSelectedState);
  };

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState2,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setDetailselectedState2(newSelectedState);
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridThree = _export3.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
        optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
        optionsGridOne.sheets[0].title = "생산계획기본";
        optionsGridOne.sheets[1].title = "생산계획상세";
        optionsGridOne.sheets[2].title = "작업지시";
        _export.save(optionsGridOne);
      }
    }
    if (_export4 !== null && _export4 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridFour = _export4.workbookOptions();
        optionsGridFour.sheets[0].title = "작업지시내역";
        _export4.save(optionsGridFour);
      }
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
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
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = total2.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total2 == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  //그리드 푸터
  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };
  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onDetailItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DATA_ITEM_KEY
    );
  };

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
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
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

  const enterEdit2 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
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

      setDetailDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setTempResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult2((prev) => {
        return {
          data: detailDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    if (tempResult2.data != detailDataResult.data) {
      const newData = detailDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = detailDataResult.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onAddClick = async () => {
    if (!permissions.save) return;
    const data = detailDataResult.data.filter((item: any) => item.chk == true);

    let valid = true;
    let valid2 = true;
    data.map((item) => {
      if (item.proccd == "") {
        valid = false;
      }
      data.map((item2) => {
        if (item.procseq == item2.procseq && item.num != item2.num) {
          valid2 = false;
        }
      });
    });

    if (data.length == 0) {
      alert("생산계획상세를 선택해주세요.");
    } else if (valid != true) {
      alert("공정을 입력해주세요.");
    } else if (valid2 != true) {
      alert("공정 순서가 중복됩니다.");
    } else {
      let dataArr: TdataArr = {
        planno_s: [],
        chkyn_s: [],
        plankey_s: [],
        prodmac_s: [],
        prodemp_s: [],
        gokey_s: [],
        qty_s: [],
        godt_s: [],
      };
      data.forEach((item: any, idx: number) => {
        const {
          plankey = "",
          prodmac = "",
          prodemp = "",
          godt = "",
          reqty = "",
        } = item;

        dataArr.chkyn_s.push("Y");
        dataArr.plankey_s.push(plankey);
        dataArr.prodmac_s.push(prodmac);
        dataArr.prodemp_s.push(prodemp);
        dataArr.godt_s.push(godt);
        dataArr.qty_s.push(reqty);
      });
      const datas2 = mainDataResult.data.filter(
        (item) =>
          item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
      )[0];
      dataArr.gokey_s.push(datas2.gokey);
      dataArr.planno_s.push(datas2.planno);

      const para: Iparameters = {
        procedureName: "P_PR_A7000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "N",
          "@p_orgdiv": sessionOrgdiv,
          "@p_location": sessionLocation,
          "@p_planno_s": dataArr.planno_s.join("|"),
          "@p_chkyn_s": dataArr.chkyn_s.join("|"),
          "@p_plankey_s": dataArr.plankey_s.join("|"),
          "@p_prodmac_s": dataArr.prodmac_s.join("|"),
          "@p_prodemp_s": dataArr.prodemp_s.join("|"),
          "@p_gokey_s": dataArr.gokey_s.join("|"),
          "@p_qty_s": dataArr.qty_s.join("|"),
          "@p_godt_s": dataArr.godt_s.join("|"),
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A7000W",
        },
      };

      let datas: any;

      try {
        datas = await processApi<any>("procedure", para);
      } catch (error) {
        datas = null;
      }

      if (datas.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(datas);
        alert(datas.resultMessage);
      } else {
        setValues2(false);
        setValues3(false);
        setValues4(false);
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          find_row_value: datas.returnString,
        }));
      }
    }
  };

  const questionToDelete = useSysMessage("QuestionToDelete");

  const onRemoveClick = async () => {
    if (!permissions.delete) return;
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    const dataItem = detailDataResult2.data.filter(
      (item: any, index: number) => {
        return item.chk == true;
      }
    );

    if (dataItem.length == 0) {
      alert("작업지시를 선택해주세요.");
      return false;
    }
    type TRowsArr = {
      gokey_s: string[];
    };

    let rowsArr: TRowsArr = {
      gokey_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { gokey = "" } = item;

      rowsArr.gokey_s.push(gokey);
    });

    const para: Iparameters = {
      procedureName: "P_PR_A7000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "D",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_planno_s": "",
        "@p_chkyn_s": "",
        "@p_plankey_s": "",
        "@p_prodmac_s": "",
        "@p_prodemp_s": "",
        "@p_gokey_s": rowsArr.gokey_s.join("|"),
        "@p_qty_s": "",
        "@p_godt_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A7000W",
      },
    };
    let datas: any;

    try {
      datas = await processApi<any>("procedure", para);
    } catch (error) {
      datas = null;
    }

    if (datas.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(datas);
      alert(datas.resultMessage);
    } else {
      setValues2(false);
      setValues3(false);
      setValues4(false);
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        find_row_value: datas.returnString,
      }));
    }
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;
    const dataItem = detailDataResult2.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0) return false;

    let dataArr: TdataArr = {
      planno_s: [],
      chkyn_s: [],
      plankey_s: [],
      prodmac_s: [],
      prodemp_s: [],
      gokey_s: [],
      qty_s: [],
      godt_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        gokey = "",
        qty = "",
        godt = "",
        prodmac = "",
        prodemp = "",
      } = item;

      dataArr.gokey_s.push(gokey);
      dataArr.qty_s.push(qty);
      dataArr.godt_s.push(godt);
      dataArr.prodmac_s.push(prodmac);
      dataArr.prodemp_s.push(prodemp);
    });

    const para: Iparameters = {
      procedureName: "P_PR_A7000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "U",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": sessionLocation,
        "@p_planno_s": "",
        "@p_chkyn_s": "",
        "@p_plankey_s": "",
        "@p_prodmac_s": dataArr.prodmac_s.join("|"),
        "@p_prodemp_s": dataArr.prodemp_s.join("|"),
        "@p_gokey_s": dataArr.gokey_s.join("|"),
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_godt_s": dataArr.godt_s.join("|"),
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A7000W",
      },
    };

    let datas: any;

    try {
      datas = await processApi<any>("procedure", para);
    } catch (error) {
      datas = null;
    }

    if (datas.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(datas);
      alert(datas.resultMessage);
    } else {
      setValues2(false);
      setValues3(false);
      setValues4(false);
      setFilters((prev) => ({
        ...prev,
        find_row_value: datas.returnString,
        isSearch: true,
      }));
    }
  };

  const onCompleteClick = async () => {
    if (!permissions.save) return;
    const data = mainDataResult2.data.filter((item: any) => item.chk == true);

    if (data.length == 0) {
      alert("작업지시내역을 선택해주세요.");
    } else {
      let dataArr: TdataArr2 = {
        rowstatus_s: [],
        gonum_s: [],
        goseq_s: [],
        location_s: [],
        godt_s: [],
        prodmac_s: [],
        prodemp_s: [],
        qty_s: [],
        planno_s: [],
        planseq_s: [],
        ordnum_s: [],
        ordseq_s: [],
        remark_s: [],
      };

      data.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          gonum = "",
          goseq = "",
          location = "",
          godt = "",
          prodmac = "",
          prodemp = "",
          jisiqty = "",
          planno = "",
          planseq = "",
          ordnum = "",
          ordseq = "",
          remark = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.gonum_s.push(gonum);
        dataArr.goseq_s.push(goseq);
        dataArr.location_s.push(location);
        dataArr.godt_s.push(godt);
        dataArr.prodmac_s.push(prodmac);
        dataArr.prodemp_s.push(prodemp);
        dataArr.qty_s.push(jisiqty);
        dataArr.planno_s.push(planno);
        dataArr.planseq_s.push(planseq);
        dataArr.ordnum_s.push(ordnum);
        dataArr.ordseq_s.push(ordseq);
        dataArr.remark_s.push(remark);
      });

      const para: Iparameters = {
        procedureName: "P_PR_A7000W_LIST_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "FINYN",
          "@p_orgdiv": sessionOrgdiv,
          "@p_rowstatus_s": dataArr.rowstatus_s.join("|"),
          "@p_gonum_s": dataArr.gonum_s.join("|"),
          "@p_goseq_s": dataArr.goseq_s.join("|"),
          "@p_location_s": dataArr.location_s.join("|"),
          "@p_godt_s": dataArr.godt_s.join("|"),
          "@p_prodmac_s": dataArr.prodmac_s.join("|"),
          "@p_prodemp_s": dataArr.prodemp_s.join("|"),
          "@p_qty_s": dataArr.qty_s.join("|"),
          "@p_planno_s": dataArr.planno_s.join("|"),
          "@p_planseq_s": dataArr.planseq_s.join("|"),
          "@p_ordnum_s": dataArr.ordnum_s.join("|"),
          "@p_ordseq_s": dataArr.ordseq_s.join("|"),
          "@p_remark_s": dataArr.remark_s.join("|"),
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A7000W",
        },
      };

      let datas: any;

      try {
        datas = await processApi<any>("procedure", para);
      } catch (error) {
        datas = null;
      }

      if (datas.isSuccess !== true) {
        console.log("[오류 발생]");
        console.log(datas);
        alert(datas.resultMessage);
      } else {
        setValues2(false);
        setValues3(false);
        setValues4(false);
        setFilters2((prev) => ({
          ...prev,
          find_row_value: datas.returnString,
          isSearch: true,
        }));
      }
    }
  };

  const userId = UseGetValueFromSessionItem("user_id");

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A7000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A7000W_001");
      } else {
        setPage(initialPageState); // 페이지 초기화
        resetAllGrid();
        setValues2(false);
        setValues3(false);
        setValues4(false);
        if (tabSelected == 0) {
          setFilters((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
          if (swiper && isMobile) {
            swiper.slideTo(0);
          }
        } else {
          setFilters2((prev) => ({
            ...prev,
            pgNum: 1,
            find_row_value: "",
            isSearch: true,
          }));
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const handleSelectTab = (e: any) => {
    resetAllGrid();
    setTabSelected(e.selected);
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    } else {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        pgNum: 1,
        find_row_value: "",
      }));
    }
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = detailDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setDetailDataResult((prev) => {
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

  const [values3, setValues3] = React.useState<boolean>(false);
  const CustomCheckBoxCell3 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = detailDataResult2.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values3,
        [EDIT_FIELD]: props.field,
      }));
      setValues3(!values3);
      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values3} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const [values4, setValues4] = React.useState<boolean>(false);
  const CustomCheckBoxCell4 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult2.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values4,
        [EDIT_FIELD]: props.field,
      }));
      setValues4(!values4);
      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values4} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const CustomCheckBoxCell = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;
    if (props.rowType == "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = detailDataResult2.data.map((item) =>
        item.num == dataItem.num
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setDetailDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group2);
      setResultState(newDataState);
    };

    return (
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const CustomCheckBoxCell5 = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;

    if (props.rowType == "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY4] == dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
              [EDIT_FIELD]: field,
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
      const newDataState = processWithGroups(newData, group2);
      setResultState2(newDataState);
    };

    return (
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const CustomCheckBoxCell6 = (props: GridCellProps) => {
    if (props.rowType == "groupHeader") {
      return null;
    }

    return <CheckBoxReadOnlyCell {...props}></CheckBoxReadOnlyCell>;
  };

  const onDetailItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult2,
      setDetailDataResult2,
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

  const enterEdit3 = (dataItem: any, field: string) => {
    let valid = true;
    if (
      field == "chk" ||
      field == "qty" ||
      field == "prodemp" ||
      field == "prodmac"
    ) {
      const newData = detailDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY3] == dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setDetailDataResult2((prev) => {
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
    } else {
      setTempResult3((prev) => {
        return {
          data: detailDataResult2.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    if (tempResult3.data != detailDataResult2.data) {
      const newData = detailDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
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
      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
    } else {
      const newData = detailDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult3((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDetailDataResult2((prev: { total: any }) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
    }
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender2
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender3 = (tr: any, props: any) => (
    <RowRender2
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const customCellRender4 = (td: any, props: any) => (
    <CellRender2
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender4 = (tr: any, props: any) => (
    <RowRender2
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit4 = (dataItem: any, field: string) => {
    let valid = true;
    if (field == "chk") {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY4] == dataItem[DATA_ITEM_KEY4]
          ? {
              ...item,
              [EDIT_FIELD]: field,
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
      setTempResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult4((prev) => {
        return {
          data: mainDataResult2.data,
          total: prev.total,
        };
      });
    }
  };
  const exitEdit4 = () => {
    if (tempResult4.data != mainDataResult2.data) {
      const newData = mainDataResult2.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY4] == Object.getOwnPropertyNames(selectedState2)[0]
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
      setTempResult4((prev: { total: any }) => {
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
      const newDataState = processWithGroups(newData, group2);
      setResultState2(newDataState);
    } else {
      const newData = mainDataResult2.data.map((item: any) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult4((prev: { total: any }) => {
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
      const newDataState = processWithGroups(newData, group2);
      setResultState2(newDataState);
    }
  };

  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );

  const onExpandChange2 = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState2, item.groupId]
          : collapsedState2.filter((groupId) => groupId != item.groupId);
        setCollapsedState2(collapsedIds);
      }
    },
    [collapsedState2]
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
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ width: "100%" }}
        scrollable={isMobile}
      >
        <TabStripTab
          title="작업지시"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>계획일자</th>
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
                  <th>생산계획번호</th>
                  <td>
                    <Input
                      name="planno"
                      type="text"
                      value={filters.planno}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>지시여부</th>
                  <td colSpan={3}>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="finyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>공사명</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={filterInputChange}
                    />
                  </td>
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
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordnum"
                      type="text"
                      value={filters.ordnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>규격</th>
                  <td>
                    <Input
                      name="insiz"
                      type="text"
                      value={filters.insiz}
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
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer">
                    <ButtonContainer
                      style={{ justifyContent: "space-between" }}
                    >
                      <GridTitle>생산계획기본</GridTitle>
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
                        mainDataResult.data.map((row, num) => ({
                          ...row,
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
                      //incell 수정 기능
                      onItemChange={onMainItemChange}
                      cellRender={customCellRender}
                      rowRender={customRowRender}
                      editField={EDIT_FIELD}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, num: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={num}
                                  field={item.fieldName}
                                  title={
                                    item.caption == "" ? " " : item.caption
                                  }
                                  width={item.width}
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : DateField.includes(item.fieldName)
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
              </SwiperSlide>
              <SwiperSlide key={1}>
                <GridContainer style={{ width: "100%" }}>
                  <GridTitleContainer className="ButtonContainer2">
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
                        <GridTitle>생산계획상세</GridTitle>
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
                        onClick={onAddClick}
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
                    data={detailDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: mobileheight2 }}
                      data={process(
                        detailDataResult.data.map((row, num) => ({
                          ...row,
                          [SELECTED_FIELD]: detailselectedState[idGetter2(row)], //선택된 데이터
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
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onDetailSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                      onItemChange={onDetailItemChange}
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
                        field="chk"
                        title=" "
                        width="45px"
                        headerCell={CustomCheckBoxCell2}
                        cell={CheckBoxCell}
                      />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList2"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, num: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={num}
                                  field={item.fieldName}
                                  title={
                                    item.caption == "" ? " " : item.caption
                                  }
                                  width={item.width}
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : DateField.includes(item.fieldName)
                                      ? DateCell
                                      : customField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  headerCell={
                                    customHeaderField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? detailTotalFooterCell
                                      : numberField2.includes(item.fieldName)
                                      ? editNumberFooterCell
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
                  <GridTitleContainer className="ButtonContainer2">
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
                      <GridTitle>작업지시</GridTitle>
                    </ButtonContainer>
                    <ButtonContainer>
                      <Button
                        onClick={onRemoveClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
                        disabled={permissions.delete ? false : true}
                      >
                        삭제
                      </Button>
                      <Button
                        onClick={onSaveClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="save"
                        title="저장"
                        disabled={permissions.save ? false : true}
                      ></Button>
                    </ButtonContainer>
                  </GridTitleContainer>
                  <ExcelExport
                    data={newData}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName={getMenuName()}
                    group={group}
                  >
                    <Grid
                      style={{ height: mobileheight3 }}
                      data={newData.map((item: { items: any[] }) => ({
                        ...item,
                        items: item.items.map((row: any) => ({
                          ...row,
                          qtyunit: qtyunitListData.find(
                            (items: any) => items.sub_code == row.qtyunit
                          )?.code_name,
                          [SELECTED_FIELD]:
                            detailselectedState2[idGetter3(row)], //선택된 데이터
                        })),
                      }))}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      //그룹기능
                      group={group}
                      groupable={true}
                      onExpandChange={onExpandChange}
                      expandField="expanded"
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY3}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onDetailSelectionChange2}
                      //페이지네이션
                      total={total}
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef3}
                      rowHeight={30}
                      onItemChange={onDetailItemChange2}
                      cellRender={customCellRender3}
                      rowRender={customRowRender3}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn
                        field="rowstatus"
                        title=" "
                        width="50px"
                        editable={false}
                      />
                      <GridColumn
                        field="chk"
                        title=" "
                        width="45px"
                        headerCell={CustomCheckBoxCell3}
                        cell={CustomCheckBoxCell}
                      />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList3"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, num: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={num}
                                  field={item.fieldName}
                                  title={
                                    item.caption == "" ? " " : item.caption
                                  }
                                  width={item.width}
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : DateField.includes(item.fieldName)
                                      ? DateCell
                                      : customField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? detailTotalFooterCell2
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
                <GridContainer width={`60%`}>
                  <GridTitleContainer className="ButtonContainer">
                    <GridTitle>생산계획기본</GridTitle>
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
                        mainDataResult.data.map((row, num) => ({
                          ...row,
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
                      //incell 수정 기능
                      onItemChange={onMainItemChange}
                      cellRender={customCellRender}
                      rowRender={customRowRender}
                      editField={EDIT_FIELD}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, num: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={num}
                                  field={item.fieldName}
                                  title={
                                    item.caption == "" ? " " : item.caption
                                  }
                                  width={item.width}
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : DateField.includes(item.fieldName)
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
                <GridContainer width={`calc(40% - ${GAP}px)`}>
                  <GridTitleContainer className="ButtonContainer2">
                    <GridTitle>생산계획상세</GridTitle>
                    <ButtonContainer>
                      <Button
                        onClick={onAddClick}
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
                    data={detailDataResult.data}
                    ref={(exporter) => {
                      _export2 = exporter;
                    }}
                    fileName={getMenuName()}
                  >
                    <Grid
                      style={{ height: webheight2 }}
                      data={process(
                        detailDataResult.data.map((row, num) => ({
                          ...row,
                          [SELECTED_FIELD]: detailselectedState[idGetter2(row)], //선택된 데이터
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
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef2}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onDetailSortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      //incell 수정 기능
                      onItemChange={onDetailItemChange}
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
                        field="chk"
                        title=" "
                        width="45px"
                        headerCell={CustomCheckBoxCell2}
                        cell={CheckBoxCell}
                      />
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList2"]
                          ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          ?.map(
                            (item: any, num: number) =>
                              item.sortOrder !== -1 && (
                                <GridColumn
                                  key={num}
                                  field={item.fieldName}
                                  title={
                                    item.caption == "" ? " " : item.caption
                                  }
                                  width={item.width}
                                  cell={
                                    numberField.includes(item.fieldName)
                                      ? NumberCell
                                      : DateField.includes(item.fieldName)
                                      ? DateCell
                                      : customField.includes(item.fieldName)
                                      ? CustomComboBoxCell
                                      : undefined
                                  }
                                  headerCell={
                                    customHeaderField.includes(item.fieldName)
                                      ? RequiredHeader
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? detailTotalFooterCell
                                      : numberField2.includes(item.fieldName)
                                      ? editNumberFooterCell
                                      : undefined
                                  }
                                />
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainerWrap>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>작업지시</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onRemoveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      disabled={permissions.delete ? false : true}
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                      disabled={permissions.save ? false : true}
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={newData}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName={getMenuName()}
                  group={group}
                >
                  <Grid
                    style={{ height: webheight3 }}
                    data={newData.map((item: { items: any[] }) => ({
                      ...item,
                      items: item.items.map((row: any) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (items: any) => items.sub_code == row.qtyunit
                        )?.code_name,
                        [SELECTED_FIELD]: detailselectedState2[idGetter3(row)], //선택된 데이터
                      })),
                    }))}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    //그룹기능
                    group={group}
                    groupable={true}
                    onExpandChange={onExpandChange}
                    expandField="expanded"
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY3}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange2}
                    //페이지네이션
                    total={total}
                    skip={page3.skip}
                    take={page3.take}
                    pageable={true}
                    onPageChange={pageChange3}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef3}
                    rowHeight={30}
                    onItemChange={onDetailItemChange2}
                    cellRender={customCellRender3}
                    rowRender={customRowRender3}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn
                      field="rowstatus"
                      title=" "
                      width="50px"
                      editable={false}
                    />
                    <GridColumn
                      field="chk"
                      title=" "
                      width="45px"
                      headerCell={CustomCheckBoxCell3}
                      cell={CustomCheckBoxCell}
                    />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]
                        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        ?.map(
                          (item: any, num: number) =>
                            item.sortOrder !== -1 && (
                              <GridColumn
                                key={num}
                                field={item.fieldName}
                                title={item.caption == "" ? " " : item.caption}
                                width={item.width}
                                cell={
                                  numberField.includes(item.fieldName)
                                    ? NumberCell
                                    : DateField.includes(item.fieldName)
                                    ? DateCell
                                    : customField.includes(item.fieldName)
                                    ? CustomComboBoxCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? detailTotalFooterCell2
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </>
          )}
        </TabStripTab>
        <TabStripTab
          title="작업지시내역"
          disabled={permissions.view ? false : true}
        >
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>지시일자</th>
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
                  <th>공정</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="proccd"
                        value={filters.proccd}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>생산계획번호</th>
                  <td>
                    <Input
                      name="plankey"
                      type="text"
                      value={filters.plankey}
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
                  <th>수주번호</th>
                  <td>
                    <Input
                      name="ordkey"
                      type="text"
                      value={filters.ordkey}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>설비</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="prodmac"
                        value={filters.prodmac}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        textField="fxfull"
                        valueField="fxcode"
                      />
                    )}
                  </td>
                  <th>작업지시번호</th>
                  <td>
                    <Input
                      name="gokey"
                      type="text"
                      value={filters.gokey}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
                <tr>
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
                  <th>공사명</th>
                  <td>
                    <Input
                      name="project"
                      type="text"
                      value={filters.project}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>작업자</th>
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
                  <th>완료여부</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="finyn"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer4">
              <GridTitle>작업지시내역</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onCompleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  disabled={permissions.save ? false : true}
                >
                  강제완료
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={newData2}
              ref={(exporter) => {
                _export4 = exporter;
              }}
              fileName={getMenuName()}
              group={group2}
            >
              <Grid
                style={{
                  height: isMobile ? mobileheight4 : webheight4,
                }}
                data={newData2.map((item: { items: any[] }) => ({
                  ...item,
                  items: item.items.map((row: any) => ({
                    ...row,
                    prodmac: prodmacListData.find(
                      (items: any) => items.fxcode == row.prodmac
                    )?.fxfull,
                    prodemp: prodempListData.find(
                      (items: any) => items.user_id == row.prodemp
                    )?.user_name,
                    proccd: proccdListData.find(
                      (items: any) => items.sub_code == row.proccd
                    )?.code_name,
                    location: locationListData.find(
                      (items: any) => items.sub_code == row.location
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState2[idGetter4(row)], //선택된 데이터
                  })),
                }))}
                //스크롤 조회 기능
                fixedScroll={true}
                //그룹기능
                group={group2}
                groupable={true}
                onExpandChange={onExpandChange2}
                expandField="expanded"
                //선택 기능
                dataItemKey={DATA_ITEM_KEY4}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onMainSelectionChange2}
                //페이지네이션
                total={total2}
                skip={page4.skip}
                take={page4.take}
                pageable={true}
                onPageChange={pageChange4}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef4}
                rowHeight={30}
                onItemChange={onMainItemChange2}
                cellRender={customCellRender4}
                rowRender={customRowRender4}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell4}
                  cell={CustomCheckBoxCell5}
                />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList4"]
                    ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    ?.map(
                      (item: any, num: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={num}
                            field={item.fieldName}
                            title={item.caption == "" ? " " : item.caption}
                            width={item.width}
                            cell={
                              numberField.includes(item.fieldName)
                                ? NumberCell
                                : DateField.includes(item.fieldName)
                                ? DateCell
                                : checkField.includes(item.fieldName)
                                ? CustomCheckBoxCell6
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
        </TabStripTab>
      </TabStrip>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}

      {/* 컨트롤 네임 불러오기 용 */}
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

export default PR_A7000W;
