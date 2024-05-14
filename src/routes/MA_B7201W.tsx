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
  GridColumn,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
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
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import DateCell from "../components/Cells/DateCell";
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
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { heightstate, isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_B7201W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";

const dateField = ["indt", "outdt"];
const numberField = ["now_qty", "qty"];

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

let deviceWidth = window.innerWidth;
let deviceHeight = window.innerHeight - 50;
let isMobile = deviceWidth <= 1200;
var index = 0;

const MA_B7201W: React.FC = () => {
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = 0;
  var height2 = 0;
  var height3 = 0;

  var container = document.querySelector(".ButtonContainer");
  var container2 = document.querySelector(".ButtonContainer2");
  var container3 = document.querySelector(".ButtonContainer3");

  if (container?.clientHeight != undefined) {
    height = container == undefined ? 0 : container.clientHeight;
  }
  if (container2?.clientHeight != undefined) {
    height2 = container2 == undefined ? 0 : container2.clientHeight;
  }
  if (container3?.clientHeight != undefined) {
    height3 = container3 == undefined ? 0 : container3.clientHeight;
  }
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const processApi = useApi();
  const [group, setGroup] = React.useState(initialGroup);

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  const [swiper, setSwiper] = useState<SwiperCore>();

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("MA_B7201W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("MA_B7201W", setCustomOptionData);

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
        zeroyn: defaultOption.find((item: any) => item.id == "zeroyn")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA171,L_BA172,L_BA173,L_BA061,L_BA015,L_sysUserMaster_001",
    //대분류, 중분류, 소분류, 품목계정, 수량단위, 사용자
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [personListData, setPersonListData] = useState([
    { user_id: "", user_name: "" },
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );
      const personQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
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
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(personQueryStr, setPersonListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState2, setDetailDataState2] = useState<State>({
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

  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );

  const [total, setTotal] = useState(0);

  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState2, setDetailSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    insiz: "",
    zeroyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST_IN",
    itemcd: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST_OUT",
    itemcd: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
    setPage3(initialPageState);
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

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_MA_B7201W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_zeroyn": filters.zeroyn,
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
          groupId: row.itemacnt + "itemacnt",
          group_category_name:
            "품목계정" +
            " : " +
            itemacntListData.find((item: any) => item.sub_code == row.itemacnt)
              ?.code_name,
          itemlvl1: itemlvl1ListData.find(
            (item: any) => item.sub_code == row.itemlvl1
          )?.code_name,
          itemlvl2: itemlvl2ListData.find(
            (item: any) => item.sub_code == row.itemlvl2
          )?.code_name,
          itemlvl3: itemlvl3ListData.find(
            (item: any) => item.sub_code == row.itemlvl3
          )?.code_name,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.itemacnt == filters.find_row_value
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
      const newDataState = processWithGroups(rows, group);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal(totalRowCnt);
      setResultState(newDataState);
      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.itemacnt == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            itemacnt: selectedRow.itemacnt,
            lotnum: selectedRow.lotnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            itemacnt: selectedRow.itemacnt,
            lotnum: selectedRow.lotnum,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setDetailFilters((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            itemacnt: rows[0].itemacnt,
            lotnum: rows[0].lotnum,
            isSearch: true,
            pgNum: 1,
          }));
          setDetailFilters2((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
            itemacnt: rows[0].itemacnt,
            lotnum: rows[0].lotnum,
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

  const fetchDetailGrid = async (detailfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    //조회조건 파라미터
    const detailparameters: Iparameters = {
      procedureName: "P_MA_B7201W_Q",
      pageNumber: detailfilters.pgNum,
      pageSize: detailfilters.pgSize,
      parameters: {
        "@p_work_type": detailfilters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": detailfilters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": detailfilters.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_zeroyn": filters.zeroyn,
      },
    };
    try {
      data = await processApi<any>("procedure", detailparameters);
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

  const fetchDetailGrid2 = async (detailfilters2: any) => {
    //if (!permissions?.view) return;
    let data: any;

    setLoading(true);
    const detailparameters2: Iparameters = {
      procedureName: "P_MA_B7201W_Q",
      pageNumber: detailfilters2.pgNum,
      pageSize: detailfilters2.pgSize,
      parameters: {
        "@p_work_type": "LIST_OUT",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": detailfilters2.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": detailfilters2.itemacnt,
        "@p_insiz": filters.insiz,
        "@p_zeroyn": filters.zeroyn,
      },
    };
    try {
      data = await processApi<any>("procedure", detailparameters2);
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
        throw findMessage(messagesData, "MA_B7201W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B7201W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) !=
        convertDateToStr(filters.frdt).substring(0, 4)
      ) {
        throw findMessage(messagesData, "MA_B7201W_002");
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
      }
    } catch (e) {
      alert(e);
    }

    if (swiper && isMobile) {
      swiper.slideTo(0);
    }
  };
  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData]);

  useEffect(() => {
    if (permissions !== null && detailfilters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters);
      setDetailFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid(deepCopiedFilters);
    }
  }, [detailfilters, permissions]);

  useEffect(() => {
    if (permissions !== null && detailfilters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailfilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록

      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailfilters2, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [detailDataResult2]);

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [resultState]);

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
      itemcd: selectedRowData.itemcd,
      itemacnt: selectedRowData.itemacnt,
      isSearch: true,
      pgNum: 1,
    }));
    setDetailFilters2((prev: any) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      itemacnt: selectedRowData.itemacnt,
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
      optionsGridOne.sheets[1].title = "입고상세내역";
      optionsGridOne.sheets[2].title = "출고상세내역";
      _export.save(optionsGridOne);
    }
  };

  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
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

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
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

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

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

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
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

  return (
    <>
      <TitleContainer>
        <Title>기간재고조회(품목별)</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="MA_B7201W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준년월</th>
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
              <th>재고수량</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="zeroyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
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
                  <GridTitle>품목별기간재고</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={newData}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="기간재고조회(품목별)"
                  group={group}
                >
                  <Grid
                    style={{ height: deviceHeight - height }}
                    data={newData.map((item: { items: any[] }) => ({
                      ...item,
                      items: item.items.map((row: any) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                      })),
                    }))}
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
                    total={total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //그룹기능
                    group={group}
                    groupable={true}
                    onExpandChange={onExpandChange}
                    expandField="expanded"
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]?.map(
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
                    <GridTitle>입고상세내역</GridTitle>
                    <Button
                      onClick={() => {
                        if (swiper) {
                          swiper.slideTo(2);
                        }
                      }}
                      icon="chevron-right"
                      fillMode={"flat"}
                      themeColor={"primary"}
                    />
                  </div>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="기간재고조회(품목별)"
                >
                  <Grid
                    style={{
                      height: deviceHeight - height2,
                    }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
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
                      customOptionData.menuCustomColumnOptions["grdList2"]?.map(
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
                    <GridTitle>출고상세내역</GridTitle>
                    <ButtonContainer>
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
                        처음으로
                      </Button>
                    </ButtonContainer>
                  </div>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult2.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="기간재고조회(품목별)"
                >
                  <Grid
                    style={{
                      height: deviceHeight - height3,
                    }}
                    data={process(
                      detailDataResult2.data.map((row) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
                        [SELECTED_FIELD]: detailselectedState2[idGetter3(row)],
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
                    ref={gridRef3}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]?.map(
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
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <>
          <GridContainerWrap>
            <GridContainer width={`55%`}>
              <GridTitleContainer>
                <GridTitle>품목별기간재고</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={newData}
                ref={(exporter) => {
                  _export = exporter;
                }}
                fileName="기간재고조회(품목별)"
                group={group}
              >
                <Grid
                  style={{ height: "77vh" }}
                  data={newData.map((item: { items: any[] }) => ({
                    ...item,
                    items: item.items.map((row: any) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                  }))}
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
                  total={total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
                  rowHeight={30}
                  //그룹기능
                  group={group}
                  groupable={true}
                  onExpandChange={onExpandChange}
                  expandField="expanded"
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList"]?.map(
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
              <GridContainer>
                <GridTitleContainer>
                  <GridTitle>입고상세내역</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="기간재고조회(품목별)"
                >
                  <Grid
                    style={{ height: "37vh" }}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
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
                      customOptionData.menuCustomColumnOptions["grdList2"]?.map(
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
                <GridTitleContainer>
                  <GridTitle>출고상세내역</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={detailDataResult2.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName="기간재고조회(품목별)"
                >
                  <Grid
                    style={{ height: "36vh" }}
                    data={process(
                      detailDataResult2.data.map((row) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        person: personListData.find(
                          (item: any) => item.user_id == row.person
                        )?.user_name,
                        [SELECTED_FIELD]: detailselectedState2[idGetter3(row)],
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
                    ref={gridRef3}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange2}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList3"]?.map(
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
