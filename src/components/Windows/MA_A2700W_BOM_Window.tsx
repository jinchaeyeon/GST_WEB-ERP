import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isFilterHideState2, isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  getBizCom,
  getHeight,
  handleKeyPressSearch,
  setDefaultDate,
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import WindowFilterContainer from "../Containers/WindowFilterContainer";
import CommonDateRangePicker from "../DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  setData(data: object): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let temp = 0;

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;

const CopyWindow = ({
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 900) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [isFilterHideStates2, setisFilterHideStates2] =
    useRecoilState(isFilterHideState2);
  var index = 0;
  const [swiper, setSwiper] = useState<SwiperCore>();

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".TitleContainer"); //조회버튼있는 title부분
      height3 = getHeight(".BottomContainer"); //하단 버튼부분
      height4 = getHeight(".filterBox2"); //필터 웹
      height5 = getHeight(".visible-mobile-only2"); //필터 모바일
      height6 = getHeight(".WindowButtonContainer");
      height7 = getHeight(".WindowButtonContainer2");
      height8 = getHeight(".WindowButtonContainer3");

      setMobileHeight(deviceHeight - height - height2 - height5 - height6);
      setMobileHeight2(deviceHeight - height - height2 - height5 - height7);
      setMobileHeight3(
        deviceHeight - height - height2 - height3 - height5 - height8
      );
      setWebHeight(
        (position.height - height - height2 - height3 - height4) / 2
      );
      setWebHeight2(
        (position.height - height - height2 - height3 - height4) / 2 - height7
      );
      setWebHeight3(
        (position.height - height - height2 - height3 - height4) / 2 - height8
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight((position.height - height - height2 - height3 - height4) / 2);
    setWebHeight2(
      (position.height - height - height2 - height3 - height4) / 2 - height7
    );
    setWebHeight3(
      (position.height - height - height2 - height3 - height4) / 2 - height8
    );
  };
  const DATA_ITEM_KEY = "num";
  const DATA_ITEM_KEY2 = "num";
  const DATA_ITEM_KEY3 = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

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
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        doexdiv: defaultOption.find((item: any) => item.id == "doexdiv")
          ?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        ordsts: defaultOption.find((item: any) => item.id == "ordsts")
          ?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL,L_sysUserMaster_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemacntListData(getBizCom(bizComponentData, "L_BA061"));
      setQtyunitListData(getBizCom(bizComponentData, "L_BA015"));
      setPersonListData(getBizCom(bizComponentData, "L_sysUserMaster_001"));
    }
  }, [bizComponentData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [subselectedState, setSubSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

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

  const onClose = () => {
    setisFilterHideStates2(true);
    setVisible(false);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
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
  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const processApi = useApi();
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    dtgb: "A",
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    itemacnt: "",
    ordnum: "",
    ordseq: 0,
    poregnum: "",
    doexdiv: "",
    ordsts: "",
    person: "",
    finyn: "",
    remark: "",
    pac: "A",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    itemcd: "",
    ordnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
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

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (detailFilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailFilters]);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A2000W_Sub2_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_ordnum": filters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_poregnum": filters.poregnum,
        "@p_ordsts": filters.ordsts,
        "@p_doexdiv": filters.doexdiv,
        "@p_person": filters.person,
        "@p_finyn": filters.finyn,
        "@p_remark": filters.remark,
        "@p_pac": filters.pac,
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
        const selectedRow = rows[0];
        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        setDetailFilters((prev) => ({
          ...prev,
          itemcd: selectedRow.itemcd,
          ordnum: selectedRow.ordnum,
          isSearch: true,
          pgNum: 1,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
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

  const fetchDetailGrid = async (detailFilters: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const detailParameters: Iparameters = {
      procedureName: "P_MA_A2000W_Sub2_Q",
      pageNumber: detailFilters.pgNum,
      pageSize: detailFilters.pgSize,
      parameters: {
        "@p_work_type": "BOM",
        "@p_orgdiv": sessionOrgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": detailFilters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_ordnum": detailFilters.ordnum,
        "@p_ordseq": filters.ordseq,
        "@p_poregnum": filters.poregnum,
        "@p_ordsts": filters.ordsts,
        "@p_doexdiv": filters.doexdiv,
        "@p_person": filters.person,
        "@p_finyn": filters.finyn,
        "@p_remark": filters.remark,
        "@p_pac": filters.pac,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          rowstatus: "N",
          amt: row.amt == null ? 0 : row.amt,
          unp: row.unp == null ? 0 : row.unp,
          qty: row.qty == 0 ? 1 : row.qty,
          wonamt: row.wonamt == null ? 0 : row.wonamt,
          taxamt: row.taxamt == null ? 0 : row.taxamt,
          totwgt: row.totwgt == null ? 0 : row.totwgt,
          width: row.width == null ? 0 : row.width,
          singular: "N",
        };
      });

      setDetailDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow = rows[0];
        setDetailSelectedState({ [selectedRow[DATA_ITEM_KEY2]]: true });
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

    setDetailFilters((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      ordnum: selectedRowData.ordnum,
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

  const onSubSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: subselectedState,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSubSelectedState(newSelectedState);
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = subDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {subDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSubSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
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
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    setData(subDataResult.data);
    onClose();
  };

  const onRowDoubleClick = (props: any) => {
    subDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const selectRow = detailDataResult.data.filter(
      (item: any) =>
        item.num == Object.getOwnPropertyNames(detailselectedState)[0]
    )[0];
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      amt: selectRow.amt,
      amtunit: selectRow.amtunit,
      chk: selectRow.chk,
      custcd: selectRow.custcd,
      custnm: selectRow.custnm,
      insiz: selectRow.insiz,
      itemacnt: selectRow.itemacnt,
      itemcd: selectRow.itemcd,
      itemlvl1: selectRow.itemlvl1,
      itemlvl2: selectRow.itemlvl2,
      itemlvl3: selectRow.itemlvl3,
      itemnm: selectRow.itemnm,
      itemno: selectRow.itemno,
      itemthick: selectRow.itemthick,
      len: selectRow.len,
      lev: selectRow.lev,
      lotnum: selectRow.lotnum,
      need_qty: selectRow.need_qty,
      needqty: selectRow.needqty,
      nowqty: selectRow.nowqty,
      ordkey: selectRow.ordkey,
      ordnum: selectRow.ordnum,
      ordseq: selectRow.ordseq,
      pac: selectRow.pac,
      poregnum: selectRow.poregnum,
      project: selectRow.project,
      qty: selectRow.qty,
      qtyunit: selectRow.qtyunit,
      rowstatus: "N",
      safeqty: selectRow.safeqty,
      selected: selectRow.selected,
      singular: selectRow.singular,
      spec: selectRow.spec,
      taxamt: selectRow.taxamt,
      taxdiv: selectRow.taxdiv,
      totwgt: selectRow.totwgt,
      unitwgt: selectRow.unitwgt,
      unp: selectRow.unp,
      wgtunit: selectRow.wgtunit,
      width: selectRow.width,
      wonamt: selectRow.wonamt,
    };
    setSubDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setSubSelectedState({ [newDataItem[DATA_ITEM_KEY3]]: true });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    subDataResult.data.forEach((item: any, index: number) => {
      if (!subselectedState[item[DATA_ITEM_KEY3]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = subDataResult.data[Math.min(...Object2)];
    } else {
      data = subDataResult.data[Math.min(...Object) - 1];
    }
    setSubDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));

    setSubSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY3] : newData[0]]: true,
    });
  };
  return (
    <>
      <Window
        titles={"수주BOM참조"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <TitleContainer className="TitleContainer">
          <Title></Title>
          <ButtonContainer>
            <Button
              onClick={() => search()}
              icon="search"
              themeColor={"primary"}
            >
              조회
            </Button>
          </ButtonContainer>
        </TitleContainer>
        <WindowFilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th colSpan={3}>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dtgb"
                      value={filters.dtgb}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="name"
                      valueField="code"
                      className="required"
                    />
                  )}
                </th>
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
                <th>내수구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="doexdiv"
                      value={filters.doexdiv}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>수주상태</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="ordsts"
                      value={filters.ordsts}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
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
                <th>담당자</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="person"
                      value={filters.person}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="user_name"
                      valueField="user_id"
                    />
                  )}
                </td>
                <th>사업장</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="location"
                      value={filters.location}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      className="required"
                    />
                  )}
                </td>
                <th>완료구분</th>
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
                <th>비고</th>
                <td colSpan={5}>
                  <Input
                    name="remark"
                    type="text"
                    value={filters.remark}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FilterBox>
        </WindowFilterContainer>
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
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer">
                  <ButtonContainer style={{ justifyContent: "end" }}>
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
                <Grid
                  style={{ height: mobileheight }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      person: personListData.find(
                        (item: any) => item.user_id == row.person
                      )?.user_name,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code == row.qtyunit
                      )?.code_name,
                      [SELECTED_FIELD]: selectedState[idGetter(row)],
                    })),
                    mainDataState
                  )}
                  onDataStateChange={onMainDataStateChange}
                  {...mainDataState}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  //스크롤 조회기능
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
                  <GridColumn
                    field="ordnum"
                    title="수주번호"
                    width="150px"
                    footerCell={mainTotalFooterCell}
                  />
                  <GridColumn
                    field="orddt"
                    title="수주일자"
                    cell={DateCell}
                    width="100px"
                  />
                  <GridColumn
                    field="dlvdt"
                    title="납기일자"
                    cell={DateCell}
                    width="100px"
                  />
                  <GridColumn field="custcd" title="업체코드" width="200px" />
                  <GridColumn field="custnm" title="업체명" width="200px" />
                  <GridColumn field="itemcd" title="품목코드" width="200px" />
                  <GridColumn field="itemnm" title="품목명" width="200px" />
                  <GridColumn field="insiz" title="규격" width="200px" />
                  <GridColumn field="lotnum" title="LOT NO" width="200px" />
                  <GridColumn field="qtyunit" title="단위" width="120px" />
                  <GridColumn
                    field="ordqty"
                    title="수주량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="inqty"
                    title="입고량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="janqty"
                    title="잔량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="rcvcustnm"
                    title="인수처명"
                    width="200px"
                  />
                  <GridColumn field="poregnum" title="PO번호" width="120px" />
                  <GridColumn field="remark" title="비고" width="300px" />
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer2">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <div>
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
                      BOM 제품하위자재조회
                    </div>
                    <div>
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
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight2 }}
                  data={process(
                    detailDataResult.data.map((row) => ({
                      ...row,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code == row.qtyunit
                      )?.code_name,
                      itemacnt: itemacntListData.find(
                        (item: any) => item.sub_code == row.itemacnt
                      )?.code_name,
                      [SELECTED_FIELD]: detailselectedState[idGetter2(row)], //선택된 데이터
                    })),
                    detailDataState
                  )}
                  onDataStateChange={onDetailDataStateChange}
                  {...detailDataState}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY2}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange}
                  //스크롤 조회기능
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
                  //더블클릭
                  onRowDoubleClick={onRowDoubleClick}
                >
                  <GridColumn
                    field="itemcd"
                    title="품목코드"
                    width="200px"
                    footerCell={detailTotalFooterCell}
                  />
                  <GridColumn field="itemnm" title="품목명" width="250px" />
                  <GridColumn field="insiz" title="규격" width="250px" />
                  <GridColumn field="itemacnt" title="품목계정" width="200px" />
                  <GridColumn
                    field="needqty"
                    title="단위소요량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="now_qty"
                    title="재고수량"
                    cell={NumberCell}
                    width="120px"
                  />
                  <GridColumn
                    field="need_qty"
                    title="부족수량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn field="qtyunit" title="수량단위" width="150px" />
                </Grid>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="WindowButtonContainer3">
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
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
                    <Button
                      onClick={onDeleteClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="minus"
                      title="행 삭제"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid
                  style={{ height: mobileheight3 }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      qtyunit: qtyunitListData.find(
                        (item: any) => item.sub_code == row.qtyunit
                      )?.code_name,
                      itemacnt: itemacntListData.find(
                        (item: any) => item.sub_code == row.itemacnt
                      )?.code_name,
                      [SELECTED_FIELD]: subselectedState[idGetter3(row)], //선택된 데이터
                    })),
                    subDataState
                  )}
                  onDataStateChange={onSubDataStateChange}
                  {...subDataState}
                  //선택 subDataState
                  dataItemKey={DATA_ITEM_KEY3}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubSelectionChange}
                  //스크롤 조회기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                >
                  <GridColumn
                    field="itemcd"
                    title="품목코드"
                    width="300px"
                    footerCell={subTotalFooterCell}
                  />
                  <GridColumn field="itemnm" title="품목명" width="200px" />
                  <GridColumn field="insiz" title="규격" width="200px" />
                  <GridColumn field="itemacnt" title="품목계정" width="200px" />
                  <GridColumn field="lotnum" title="LOT NO" width="200px" />
                  <GridColumn
                    field="needqty"
                    title="단위소요량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn
                    field="qty"
                    title="수량"
                    width="120px"
                    cell={NumberCell}
                  />
                  <GridColumn field="qtyunit" title="수량단위" width="150px" />
                </Grid>
                <BottomContainer className="BottomContainer">
                  <ButtonContainer>
                    <Button themeColor={"primary"} onClick={selectData}>
                      확인
                    </Button>
                    <Button
                      themeColor={"primary"}
                      fillMode={"outline"}
                      onClick={onClose}
                    >
                      닫기
                    </Button>
                  </ButtonContainer>
                </BottomContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        ) : (
          <>
            <GridContainer>
              <Grid
                style={{ height: webheight }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: personListData.find(
                      (item: any) => item.user_id == row.person
                    )?.user_name,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)],
                  })),
                  mainDataState
                )}
                onDataStateChange={onMainDataStateChange}
                {...mainDataState}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                //스크롤 조회기능
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
                <GridColumn
                  field="ordnum"
                  title="수주번호"
                  width="150px"
                  footerCell={mainTotalFooterCell}
                />
                <GridColumn
                  field="orddt"
                  title="수주일자"
                  cell={DateCell}
                  width="100px"
                />
                <GridColumn
                  field="dlvdt"
                  title="납기일자"
                  cell={DateCell}
                  width="100px"
                />
                <GridColumn field="custcd" title="업체코드" width="200px" />
                <GridColumn field="custnm" title="업체명" width="200px" />
                <GridColumn field="itemcd" title="품목코드" width="200px" />
                <GridColumn field="itemnm" title="품목명" width="200px" />
                <GridColumn field="insiz" title="규격" width="200px" />
                <GridColumn field="lotnum" title="LOT NO" width="200px" />
                <GridColumn field="qtyunit" title="단위" width="120px" />
                <GridColumn
                  field="ordqty"
                  title="수주량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="inqty"
                  title="입고량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="janqty"
                  title="잔량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="rcvcustnm" title="인수처명" width="200px" />
                <GridColumn field="poregnum" title="PO번호" width="120px" />
                <GridColumn field="remark" title="비고" width="300px" />
              </Grid>
            </GridContainer>
            <GridContainer>
              <GridTitleContainer className="WindowButtonContainer2">
                <GridTitle>BOM 제품하위자재조회</GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: webheight2 }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code == row.itemacnt
                    )?.code_name,
                    [SELECTED_FIELD]: detailselectedState[idGetter2(row)], //선택된 데이터
                  })),
                  detailDataState
                )}
                onDataStateChange={onDetailDataStateChange}
                {...detailDataState}
                //선택 subDataState
                dataItemKey={DATA_ITEM_KEY2}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailSelectionChange}
                //스크롤 조회기능
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
                //더블클릭
                onRowDoubleClick={onRowDoubleClick}
              >
                <GridColumn
                  field="itemcd"
                  title="품목코드"
                  width="200px"
                  footerCell={detailTotalFooterCell}
                />
                <GridColumn field="itemnm" title="품목명" width="250px" />
                <GridColumn field="insiz" title="규격" width="250px" />
                <GridColumn field="itemacnt" title="품목계정" width="200px" />
                <GridColumn
                  field="needqty"
                  title="단위소요량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="now_qty"
                  title="재고수량"
                  cell={NumberCell}
                  width="120px"
                />
                <GridColumn
                  field="need_qty"
                  title="부족수량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="qty"
                  title="수량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="qtyunit" title="수량단위" width="150px" />
              </Grid>
            </GridContainer>
            <GridContainer>
              <GridTitleContainer className="WindowButtonContainer3">
                <ButtonContainer>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <Grid
                style={{ height: webheight3 }}
                data={process(
                  subDataResult.data.map((row) => ({
                    ...row,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    itemacnt: itemacntListData.find(
                      (item: any) => item.sub_code == row.itemacnt
                    )?.code_name,
                    [SELECTED_FIELD]: subselectedState[idGetter3(row)], //선택된 데이터
                  })),
                  subDataState
                )}
                onDataStateChange={onSubDataStateChange}
                {...subDataState}
                //선택 subDataState
                dataItemKey={DATA_ITEM_KEY3}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSubSelectionChange}
                //스크롤 조회기능
                fixedScroll={true}
                total={subDataResult.total}
                //정렬기능
                sortable={true}
                onSortChange={onSubSortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                <GridColumn
                  field="itemcd"
                  title="품목코드"
                  width="300px"
                  footerCell={subTotalFooterCell}
                />
                <GridColumn field="itemnm" title="품목명" width="200px" />
                <GridColumn field="insiz" title="규격" width="200px" />
                <GridColumn field="itemacnt" title="품목계정" width="200px" />
                <GridColumn field="lotnum" title="LOT NO" width="200px" />
                <GridColumn
                  field="needqty"
                  title="단위소요량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn
                  field="qty"
                  title="수량"
                  width="120px"
                  cell={NumberCell}
                />
                <GridColumn field="qtyunit" title="수량단위" width="150px" />
              </Grid>
            </GridContainer>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                <Button themeColor={"primary"} onClick={selectData}>
                  확인
                </Button>
                <Button
                  themeColor={"primary"}
                  fillMode={"outline"}
                  onClick={onClose}
                >
                  닫기
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </>
        )}
      </Window>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"ROW_ADD"}
          setData={setCustData}
        />
      )}
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
        />
      )}
    </>
  );
};

export default CopyWindow;
