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
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
  useSysMessage,
  getHeight,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import DetailWindow from "../components/Windows/MA_A2410W_Window";
import { useApi } from "../hooks/api";
import { ICustData, IItemData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  heightstate,
  isLoading,
} from "../store/atoms";
import { gridList } from "../store/columns/MA_A2410W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

const DATA_ITEM_KEY = "purnum";
const DETAIL_DATA_ITEM_KEY = "num";
const dateField = ["purdt", "inexpdt"];
const numberField = [
  "qty",
  "amt",
  "wonamt",
  "taxamt",
  "totamt",
  "wgt",
  "unitwgt",
  "unp",
  "inqty",
];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

var index = 0;

const MA_A2410W: React.FC = () => {
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;
  var height = getHeight(".ButtonContainer");
  var height2 = getHeight(".ButtonContainer2");

  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter1 = getter(DETAIL_DATA_ITEM_KEY);
  const processApi = useApi();
const pc = UseGetValueFromSessionItem("pc");

  const [swiper, setSwiper] = useState<SwiperCore>();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [workType, setWorkType] = useState<"N" | "U">("N");
  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);

  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("MA_A2410W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("MA_A2410W", setCustomOptionData);

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
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_sysUserMaster_001, L_finyn, L_BA015, L_PR010, L_BA171, L_BA172, L_BA173",
    //담당자, 완료여부, 수량단위, 공정, 대분류, 중분류, 소분류
    setBizComponentData
  );

  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [usersListData, setUsersListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [wgtunitListData, setWgtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemlvl2ListData, setItemlvl2ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [itemlvl3ListData, setItemlvl3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [finynListData, setFinynListData] = useState([{ code: "", name: "" }]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const usersQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_PR010")
      );
      const wgtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA171")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA173")
      );
      const finynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_finyn")
      );

      fetchQuery(usersQueryStr, setUsersListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(wgtunitQueryStr, setWgtunitListData);
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(finynQueryStr, setFinynListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

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
      setListData(rows);
    }
  }, []);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: 1,
    }));

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

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    // 조회조건 세팅
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

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

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.purnum]: true });
      setDetailFilters((prev) => ({
        ...prev,
        purnum: rowData.purnum,
      }));

      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <td className="k-command-cell">
        <Button
          className="k-grid-edit-command"
          themeColor={"primary"}
          fillMode="outline"
          onClick={onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
  };

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    frdt: new Date(),
    todt: new Date(),
    custcd: "",
    custnm: "",
    itemcd: "",
    itemnm: "",
    person: "",
    ordnum: "",
    planno: "",
    finyn: "",
    purnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    purnum: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_A2410W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_person": filters.person,
        "@p_ordnum": filters.ordnum,
        "@p_planno": filters.planno,
        "@p_finyn": filters.finyn,
        "@p_purnum": filters.purnum,
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.purnum == filters.find_row_value
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
            : rows.find((row: any) => row.purnum == filters.find_row_value);
        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            purnum: selectedRow.purnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          setDetailFilters((prev) => ({
            ...prev,
            purnum: rows[0].purnum,
            isSearch: true,
            pgNum: 1,
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

  const fetchDetailGrid = async (detailfilters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_MA_A2410W_Q",
      pageNumber: detailfilters.pgNum,
      pageSize: detailfilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_person": "",
        "@p_ordnum": "",
        "@p_planno": "",
        "@p_finyn": "",
        "@p_purnum": detailfilters.purnum,
        "@p_find_row_value": detailfilters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (detailfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.purnum == detailfilters.find_row_value
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
                (row: any) => row.purnum == detailfilters.find_row_value
              );
        if (selectedRow != undefined) {
          setDetailSelectedState({ [selectedRow[DETAIL_DATA_ITEM_KEY]]: true });
        } else {
          setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
        }
      }
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters]);

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

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "요약정보";
      optionsGridOne.sheets[1].title = "상세정보";
      _export.save(optionsGridOne);
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
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
      purnum: selectedRowData.purnum,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);
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

  const subTotalFooterCell = (props: GridFooterCellProps) => {
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

  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum = item["total_" + props.field]) : ""
    );
    if (sum != undefined) {
      var parts = sum.toString().split(".");

      return parts[0] != "NaN" ? (
        <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
          {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        </td>
      ) : (
        <td></td>
      );
    } else {
      return <td></td>;
    }
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2410W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_A2410W_001");
      } else if (
        filters.finyn == null ||
        filters.finyn == "" ||
        filters.finyn == undefined
      ) {
        throw findMessage(messagesData, "MA_A2410W_002");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
        if(swiper) {
          swiper.slideTo(0);
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    purnum: "",
    attdatnum: "",
  });

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  const questionToDelete = useSysMessage("QuestionToDelete");
  const onDeleteClick = () => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }
    if (mainDataResult.total > 0) {
      const data = mainDataResult.data.filter(
        (item) => item.purnum == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        purnum: data.purnum,
        attdatnum: data.attdatnum,
      }));
    } else {
      alert("데이터가 없습니다.");
    }
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDataDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const isLastDataDeleted =
        mainDataResult.data.length == 1 && filters.pgNum > 0;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) =>
          row[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
      );
      if (paraDataDeleted.attdatnum)
        setDeletedAttadatnums([paraDataDeleted.attdatnum]);
      resetAllGrid();
      if (isLastDataDeleted) {
        setPage({
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
          find_row_value:
            mainDataResult.data[findRowIndex < 1 ? 1 : findRowIndex - 1][
              DATA_ITEM_KEY
            ],
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
  };

  useEffect(() => {
    if (paraDataDeleted.work_type == "D") fetchToDelete();
  }, [paraDataDeleted]);

  return (
    <>
      <TitleContainer>
        <Title>외주처리</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="MA_A2410W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>발주일자</th>
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
              <th>발주번호</th>
              <td>
                <Input
                  name="purnum"
                  type="text"
                  value={filters.purnum}
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
              <GridContainer style={{ width: "100%" }}>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>요약정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick}
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      외주처리생성
                    </Button>
                    <Button
                      onClick={onDeleteClick}
                      icon="delete"
                      fillMode="outline"
                      themeColor={"primary"}
                    >
                      외주처리삭제
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="외주처리"
                >
                  <Grid
                    style={{
                      height: deviceHeight - height,
                      width: "100%",
                    }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        person: usersListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
                        finyn: finynListData.find(
                          (item: any) => item.code == row.finyn
                        )?.name,
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
                  >
                    <GridColumn cell={CommandCell} width="50px" />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
              <GridContainer style={{ width: "100%" }}>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>상세정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(0);
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
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="외주처리"
                >
                  <Grid
                    style={{
                      height: deviceHeight - height2,
                      width: "100%",
                    }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        proccd: proccdListData.find(
                          (item: any) => item.sub_code == row.proccd
                        )?.code_name,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        itemlvl1: itemlvl1ListData.find(
                          (item: any) => item.sub_code == row.itemlvl1
                        )?.code_name,
                        itemlvl2: itemlvl2ListData.find(
                          (item: any) => item.sub_code == row.itemlvl2
                        )?.code_name,
                        itemlvl3: itemlvl3ListData.find(
                          (item: any) => item.sub_code == row.itemlvl3
                        )?.code_name,
                        wgtunit: wgtunitListData.find(
                          (item: any) => item.sub_code == row.wgtunit
                        )?.code_name,
                        [SELECTED_FIELD]: detailSelectedState[idGetter1(row)],
                      })),
                      detailDataState
                    )}
                    {...detailDataState}
                    onDataStateChange={onDetailDataStateChange}
                    dataItemKey={DETAIL_DATA_ITEM_KEY}
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList1"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
                                  ? subTotalFooterCell
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
          </Swiper>
        </>
      ) : (
        <>
          <GridContainer>
            <GridTitleContainer>
              <GridTitle>요약정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  themeColor={"primary"}
                  icon="file-add"
                >
                  외주처리생성
                </Button>
                <Button
                  onClick={onDeleteClick}
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  외주처리삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
              fileName="외주처리"
            >
              <Grid
                style={{ height: "34vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    person: usersListData.find(
                      (item: any) => item.user_id == row.person
                    )?.user_name,
                    finyn: finynListData.find(
                      (item: any) => item.code == row.finyn
                    )?.name,
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
              >
                <GridColumn cell={CommandCell} width="50px" />
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
            <GridTitleContainer>
              <GridTitle>상세정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={detailDataResult.data}
              ref={(exporter) => {
                _export2 = exporter;
              }}
              fileName="외주처리"
            >
              <Grid
                style={{ height: "39vh" }}
                data={process(
                  detailDataResult.data.map((row) => ({
                    ...row,
                    proccd: proccdListData.find(
                      (item: any) => item.sub_code == row.proccd
                    )?.code_name,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    itemlvl1: itemlvl1ListData.find(
                      (item: any) => item.sub_code == row.itemlvl1
                    )?.code_name,
                    itemlvl2: itemlvl2ListData.find(
                      (item: any) => item.sub_code == row.itemlvl2
                    )?.code_name,
                    itemlvl3: itemlvl3ListData.find(
                      (item: any) => item.sub_code == row.itemlvl3
                    )?.code_name,
                    wgtunit: wgtunitListData.find(
                      (item: any) => item.sub_code == row.wgtunit
                    )?.code_name,
                    [SELECTED_FIELD]: detailSelectedState[idGetter1(row)],
                  })),
                  detailDataState
                )}
                {...detailDataState}
                onDataStateChange={onDetailDataStateChange}
                dataItemKey={DETAIL_DATA_ITEM_KEY}
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
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList1"]?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)?.map(
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
                              ? subTotalFooterCell
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
        </>
      )}
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          data={
            mainDataResult.data.filter(
              (item: any) =>
                item.purnum == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.purnum == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          reload={(str) => {
            setFilters((prev) => ({
              ...prev,
              find_row_value: str,
              isSearch: true,
            }));
          }}
          modal={true}
          pathname="MA_A2410W"
        />
      )}
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
          workType={"FILTER"}
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

export default MA_A2410W;
