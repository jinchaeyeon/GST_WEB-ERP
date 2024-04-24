import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
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
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
  UseBizComponent,
  UseCustomOption,
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
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/SA_B2410_290W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

let deviceWidth = window.innerWidth;
let isMobile = deviceWidth <= 1200;
var index = 0;

const DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY = "num";
const DETAIL_DATA_ITEM_KEY2 = "num";
const numberField = [
  "qty",
  "wonamt",
  "taxamt",
  "totamt",
  "unp",
  "seq1",
  "seq2",
];
const numberField2 = ["qty", "wonamt", "taxamt", "totamt"];
const dateField = ["outdt"];
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;
let targetRowIndex4: null | number = null;
let targetRowIndex5: null | number = null;

const SA_B2410: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const detailIdGetter = getter(DETAIL_DATA_ITEM_KEY);
  const detailId2Getter = getter(DETAIL_DATA_ITEM_KEY2);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
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

    setPage5(initialPageState);
    setDetailFilters1((prev) => ({
      ...prev,
      workType: "detail",
      isSearch: true,
      pgNum: 1,
    }));
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
    setPage5(initialPageState);
    setDetailFilters1((prev) => ({
      ...prev,
      workType: "detail2",
      isSearch: true,
      pgNum: 1,
    }));
  };

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });

    setPage4(initialPageState);
    setDetailFilters2((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
  };
  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage4({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  const pageChange5 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setDetailFilters1((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B2410_290W", setCustomOptionData);
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SA_B2410_290W", setMessagesData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      setFilters((prev) => ({
        ...prev,
        ymdTodt: setDefaultDate(customOptionData, "ymdTodt"),
        ymdFrdt: setDefaultDate(customOptionData, "ymdFrdt"),
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015",
    //수량단위
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
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

  const [detail1DataState, setDetail1DataState] = useState<State>({
    sort: [],
  });

  const [detail2DataState, setDetail2DataState] = useState<State>({
    sort: [],
  });

  const [tabSelected, setTabSelected] = React.useState(0);

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [detail1DataResult, setDetail1DataResult] = useState<DataResult>(
    process([], detail1DataState)
  );
  const [detail2DataResult, setDetail2DataResult] = useState<DataResult>(
    process([], detail2DataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailSelectedState, setDetailSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [detail2SelectedState, setDetail2SelectedState] = useState<{
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
    orgdiv: "01",
    ymdFrdt: new Date(),
    ymdTodt: new Date(),
    custcd: "",
    custnm: "",
    itemcd: "",
    itemnm: "",
    ordnum: "",
    lotnum: "",
    itemlvl1: "",
    outuse: "",
    doexdiv: "%",
    tax: "%",
    recdt: "",
    seq1: 0,
    itemno: "",
    workType: "Q1",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters1, setDetailFilters1] = useState({
    pgSize: PAGE_SIZE,
    custcd: "",
    itemcd: "",
    workType: "detail",
    ymdFrdt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailFilters2, setDetailFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "detailQ3",
    ymdFrdt: filters.ymdFrdt,
    custcd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_B2410_290W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": filters.ymdFrdt,
        "@p_todt": convertDateToStr(filters.ymdTodt),
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_doexdiv": filters.doexdiv,
        "@p_ordnum": filters.ordnum,
        "@p_lotnum": filters.lotnum,
        "@p_tax": filters.tax,
        "@p_recdt": filters.recdt,
        "@p_seq1": filters.seq1,
        "@p_itemno": filters.itemno,
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
      if (tabSelected == 0) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.itemcd == filters.find_row_value
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
      } else if (tabSelected == 1) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef2.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.itemcd == filters.find_row_value
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
      } else if (tabSelected == 2) {
        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef3.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.itemcd == filters.find_row_value
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
            : rows.find((row: any) => row.itemcd == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          if (filters.workType == "Q1") {
            setDetailFilters1((prev) => ({
              ...prev,
              workType: "detail",
              ymdFrdt: convertDateToStr(filters.ymdFrdt),
              custcd: selectedRow.custcd,
              itemcd: "",
              find_row_value: "",
              pgNum: 1,
              isSearch: true,
            }));
          }
          if (filters.workType == "Q2") {
            setDetailFilters1((prev) => ({
              ...prev,
              workType: "detail2",
              ymdFrdt: convertDateToStr(filters.ymdFrdt),
              custcd: "",
              itemcd: selectedRow.itemcd,
              find_row_value: "",
              pgNum: 1,
              isSearch: true,
            }));
          }
          if (filters.workType == "Q3") {
            setDetailFilters2((prev) => ({
              ...prev,
              custcd: selectedRow.custcd,
              itemcd: "",
              find_row_value: "",
              pgNum: 1,
              isSearch: true,
            }));
          }
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          if (filters.workType == "Q1") {
            setDetailFilters1((prev) => ({
              ...prev,
              workType: "detail",
              ymdFrdt: convertDateToStr(filters.ymdFrdt),
              custcd: rows[0].custcd,
              itemcd: "",
              find_row_value: "",
              pgNum: 1,
              isSearch: true,
            }));
          }
          if (filters.workType == "Q2") {
            setDetailFilters1((prev) => ({
              ...prev,
              workType: "detail2",
              ymdFrdt: convertDateToStr(filters.ymdFrdt),
              custcd: "",
              itemcd: rows[0].itemcd,
              find_row_value: "",
              pgNum: 1,
              isSearch: true,
            }));
          }
          if (filters.workType == "Q3") {
            setDetailFilters2((prev) => ({
              ...prev,
              custcd: rows[0].custcd,
              itemcd: "",
              find_row_value: "",
              pgNum: 1,
              isSearch: true,
            }));
          }
        }
      }
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

  const fetchDetailGrid1 = async (detailFilters1: any) => {
    let data: any;
    setLoading(true);
    const detailParameters: Iparameters = {
      procedureName: "P_SA_B2410_290W_Q",
      pageNumber: detailFilters1.pgNum,
      pageSize: detailFilters1.pgSize,
      parameters: {
        "@p_work_type": detailFilters1.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt":
          detailFilters1.ymdFrdt.length == 8
            ? detailFilters1.ymdFrdt
            : convertDateToStr(detailFilters1.ymdFrdt),
        "@p_todt": convertDateToStr(filters.ymdTodt),
        "@p_custcd": detailFilters1.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": detailFilters1.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_doexdiv": filters.doexdiv,
        "@p_ordnum": filters.ordnum,
        "@p_lotnum": filters.lotnum,
        "@p_tax": filters.tax,
        "@p_recdt": filters.recdt,
        "@p_seq1": filters.seq1,
        "@p_itemno": filters.itemno,
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (detailFilters1.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef5.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.outdt == detailFilters1.find_row_value
          );
          targetRowIndex5 = findRowIndex;
        }

        // find_row_value 데이터가 존재하는 페이지로 설정
        setPage5({
          skip: PAGE_SIZE * (data.pageNumber - 1),
          take: PAGE_SIZE,
        });
      } else {
        // 첫번째 행으로 스크롤 이동
        if (gridRef5.current) {
          targetRowIndex5 = 0;
        }
      }
      setDetail1DataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          detailFilters1.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.outdt == detailFilters1.find_row_value
              );

        if (selectedRow != undefined) {
          setDetailSelectedState({ [selectedRow[DETAIL_DATA_ITEM_KEY]]: true });
        } else {
          setDetailSelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY]]: true });
        }
      }
    }
    // 필터 isSearch false처리, pgNum 세팅
    setDetailFilters1((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchDetailGrid2 = async (detailFilters2: any) => {
    let data: any;
    setLoading(true);
    const detail2Parameters: Iparameters = {
      procedureName: "P_SA_B2410_290W_Q",
      pageNumber: detailFilters2.pgNum,
      pageSize: detailFilters2.pgSize,
      parameters: {
        "@p_work_type": detailFilters2.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": filters.ymdFrdt,
        "@p_todt": convertDateToStr(filters.ymdTodt),
        "@p_custcd": detailFilters2.custcd,
        "@p_custnm": filters.custnm,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_doexdiv": filters.doexdiv,
        "@p_ordnum": filters.ordnum,
        "@p_lotnum": filters.lotnum,
        "@p_tax": filters.tax,
        "@p_recdt": filters.recdt,
        "@p_seq1": filters.seq1,
        "@p_itemno": filters.itemno,
      },
    };
    try {
      data = await processApi<any>("procedure", detail2Parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
      if (detailFilters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef4.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.outdt == detailFilters2.find_row_value
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

      setDetail2DataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          detailFilters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.outdt == detailFilters2.find_row_value
              );

        if (selectedRow != undefined) {
          setDetail2SelectedState({
            [selectedRow[DETAIL_DATA_ITEM_KEY2]]: true,
          });
          setDetailFilters1((prev) => ({
            ...prev,
            workType: "detail3",
            custcd: detailFilters2.custcd,
            ymdFrdt: selectedRow.outdt,
            itemcd: "",
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
        } else {
          setDetail2SelectedState({ [rows[0][DETAIL_DATA_ITEM_KEY2]]: true });
          setDetailFilters1((prev) => ({
            ...prev,
            workType: "detail3",
            custcd: detailFilters2.custcd,
            ymdFrdt: rows[0].outdt,
            itemcd: "",
            find_row_value: "",
            pgNum: 1,
            isSearch: true,
          }));
        }
      }
      setDetailFilters2((prev) => ({
        ...prev,
        pgNum:
          data && data.hasOwnProperty("pageNumber")
            ? data.pageNumber
            : prev.pgNum,
        isSearch: false,
      }));
    }
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
    if (detailFilters1.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters1);
      setDetailFilters1((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid1(deepCopiedFilters);
    }
  }, [detailFilters1]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailFilters2.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(detailFilters2);
      setDetailFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchDetailGrid2(deepCopiedFilters);
    }
  }, [detailFilters2]);

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (tabSelected == 0) {
      if (targetRowIndex !== null && gridRef.current) {
        gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
        targetRowIndex = null;
      }
    } else if (tabSelected == 1) {
      if (targetRowIndex2 !== null && gridRef2.current) {
        gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
        targetRowIndex2 = null;
      }
    } else if (tabSelected == 2) {
      if (targetRowIndex3 !== null && gridRef3.current) {
        gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
        targetRowIndex3 = null;
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex4 !== null && gridRef4.current) {
      gridRef4.current.scrollIntoView({ rowIndex: targetRowIndex4 });
      targetRowIndex4 = null;
    }
  }, [detail1DataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex5 !== null && gridRef5.current) {
      gridRef5.current.scrollIntoView({ rowIndex: targetRowIndex5 });
      targetRowIndex5 = null;
    }
  }, [detail2DataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetail1DataResult(process([], detail1DataState));
    setDetail2DataResult(process([], detail2DataState));
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      if (tabSelected == 0) {
        const optionsGridOne = _export.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        optionsGridOne.sheets[1] = optionsGridFive.sheets[0];
        optionsGridOne.sheets[0].title = "업체별";
        optionsGridOne.sheets[1].title = "세부정보";
        _export.save(optionsGridOne);
      }
    } else if (_export2 !== null && _export2 !== undefined) {
      if (tabSelected == 1) {
        const optionsGridTwo = _export2.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        optionsGridTwo.sheets[1] = optionsGridFive.sheets[0];
        optionsGridTwo.sheets[0].title = "품목별";
        optionsGridTwo.sheets[1].title = "세부정보";
        _export2.save(optionsGridTwo);
      }
    } else if (_export3 !== null && _export3 !== undefined) {
      if (tabSelected == 2) {
        const optionsGridThree = _export3.workbookOptions();
        const optionsGridFour = _export4.workbookOptions();
        const optionsGridFive = _export5.workbookOptions();
        optionsGridThree.sheets[1] = optionsGridFour.sheets[0];
        optionsGridThree.sheets[2] = optionsGridFive.sheets[0];
        optionsGridThree.sheets[0].title = "일자별";
        optionsGridThree.sheets[1].title = "일자별출하";
        optionsGridThree.sheets[2].title = "세부정보";
        _export3.save(optionsGridThree);
      }
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onDetail1DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail1DataState(event.dataState);
  };

  const onDetail2DataStateChange = (event: GridDataStateChangeEvent) => {
    setDetail2DataState(event.dataState);
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailSelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY,
    });
    setDetailSelectedState(newSelectedState);
  };

  const onSelection2Change = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detail2SelectedState,
      dataItemKey: DETAIL_DATA_ITEM_KEY2,
    });
    setDetail2SelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters1((prev) => ({
      ...prev,
      workType: "detail3",
      custcd: detailFilters2.custcd,
      ymdFrdt: selectedRowData.outdt,
      isSearch: true,
      pgNum: 1,
      find_row_value: "",
    }));
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

  //그리드 푸터
  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detail1DataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detail1DataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell2 = (props: GridFooterCellProps) => {
    let sum = "";
    detail1DataResult.data.forEach((item) =>
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

  //그리드 푸터
  const subTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detail2DataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detail2DataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    detail2DataResult.data.forEach((item) =>
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

  const handleSelectTab = (e: any) => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        workType: "Q1",
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters((prev) => ({
        ...prev,
        workType: "Q2",
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters((prev) => ({
        ...prev,
        workType: "Q3",
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    }

    setTabSelected(e.selected);
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

    if (filters.workType == "Q1") {
      setDetailFilters1((prev) => ({
        ...prev,
        custcd: selectedRowData.custcd,
        ymdFrdt: convertDateToStr(filters.ymdFrdt),
        itemcd: "",
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (filters.workType == "Q2") {
      setDetailFilters1((prev) => ({
        ...prev,
        custcd: "",
        itemcd: selectedRowData.itemcd,
        ymdFrdt: convertDateToStr(filters.ymdFrdt),
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    } else if (filters.workType == "Q3") {
      setDetailFilters2((prev) => ({
        ...prev,
        custcd: selectedRowData.custcd,
        find_row_value: "",
        pgNum: 1,
        isSearch: true,
      }));
    }
    if (swiper) {
      swiper.slideTo(1);
    }
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

  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail1SortChange = (e: any) => {
    setDetail1DataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetail2SortChange = (e: any) => {
    setDetail2DataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.ymdFrdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.ymdFrdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.ymdFrdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.ymdFrdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_B2410_290W_001");
      } else if (
        convertDateToStr(filters.ymdTodt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.ymdTodt).substring(6, 8) > "31" ||
        convertDateToStr(filters.ymdTodt).substring(6, 8) < "01" ||
        convertDateToStr(filters.ymdTodt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "SA_B2410_290W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
    if (swiper) {
      swiper.slideTo(0);
    }
  };

  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer>
            <Title>판매현황</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="SA_B2410_290W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>판매일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.ymdFrdt,
                        end: filters.ymdTodt,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters((prev) => ({
                          ...prev,
                          ymdFrdt: e.value.start,
                          ymdTodt: e.value.end,
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
                  <th>LOT NO</th>
                  <td>
                    <Input
                      name="lotnum"
                      type="text"
                      value={filters.lotnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>계산서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="tax"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>내수구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="doexdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <Swiper
            className="leading_80_Swiper"
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0} className="swiper-slide">
              <GridContainer
                className="leading_PDA_container"
                style={{ width: "100%" }}
              >
                <TabStrip
                  selected={tabSelected}
                  onSelect={handleSelectTab}
                  style={{ width: "100%" }}
                >
                  <TabStripTab title="업체별">
                    <GridContainer width="100%">
                      <ExcelExport
                        data={mainDataResult.data}
                        ref={(exporter) => {
                          _export = exporter;
                        }}
                        fileName="판매현황"
                      >
                        <Grid
                          style={{ height: "71vh" }}
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
                        >
                          {customOptionData !== null &&
                            customOptionData.menuCustomColumnOptions["grdList"]
                              .sort(
                                (a: any, b: any) => a.sortOrder - b.sortOrder
                              )
                              .map(
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
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell
                                          : numberField.includes(item.fieldName)
                                          ? gridSumQtyFooterCell
                                          : undefined
                                      }
                                    ></GridColumn>
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </TabStripTab>
                  <TabStripTab title="품목별">
                    <GridContainer width="100%">
                      <ExcelExport
                        data={mainDataResult.data}
                        ref={(exporter) => {
                          _export2 = exporter;
                        }}
                        fileName="판매현황"
                      >
                        <Grid
                          style={{ height: "71vh" }}
                          data={process(
                            mainDataResult.data.map((row) => ({
                              ...row,
                              qtyunit: qtyunitListData.find(
                                (item: any) => item.sub_code == row.qtyunit
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
                          skip={page2.skip}
                          take={page2.take}
                          pageable={true}
                          onPageChange={pageChange2}
                          //원하는 행 위치로 스크롤 기능
                          ref={gridRef2}
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
                            customOptionData.menuCustomColumnOptions["grdList2"]
                              .sort(
                                (a: any, b: any) => a.sortOrder - b.sortOrder
                              )
                              .map(
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
                                          : undefined
                                      }
                                      footerCell={
                                        item.sortOrder == 0
                                          ? mainTotalFooterCell
                                          : numberField.includes(item.fieldName)
                                          ? gridSumQtyFooterCell
                                          : undefined
                                      }
                                    ></GridColumn>
                                  )
                              )}
                        </Grid>
                      </ExcelExport>
                    </GridContainer>
                  </TabStripTab>
                  <TabStripTab title="일자별">
                    <GridContainerWrap>
                      <GridContainer width={`70%`}>
                        <ExcelExport
                          data={mainDataResult.data}
                          ref={(exporter) => {
                            _export3 = exporter;
                          }}
                          fileName="판매현황"
                        >
                          <Grid
                            style={{ height: "34vh" }}
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
                            skip={page3.skip}
                            take={page3.take}
                            pageable={true}
                            onPageChange={pageChange3}
                            //원하는 행 위치로 스크롤 기능
                            ref={gridRef3}
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
                              customOptionData.menuCustomColumnOptions[
                                "grdList3"
                              ]
                                .sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                .map(
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
                                            : undefined
                                        }
                                        footerCell={
                                          item.sortOrder == 0
                                            ? mainTotalFooterCell
                                            : numberField.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell
                                            : undefined
                                        }
                                      ></GridColumn>
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                      <GridContainer width={`calc(30% - ${GAP}px)`}>
                        <ExcelExport
                          data={detail2DataResult.data}
                          ref={(exporter) => {
                            _export4 = exporter;
                          }}
                          fileName="판매현황"
                        >
                          <Grid
                            style={{ height: "34vh" }}
                            data={process(
                              detail2DataResult.data.map((row) => ({
                                ...row,
                                [SELECTED_FIELD]:
                                  detail2SelectedState[detailId2Getter(row)],
                              })),
                              detail2DataState
                            )}
                            {...detail2DataState}
                            onDataStateChange={onDetail2DataStateChange}
                            //선택 기능
                            dataItemKey={DATA_ITEM_KEY}
                            selectedField={SELECTED_FIELD}
                            selectable={{
                              enabled: true,
                              mode: "single",
                            }}
                            onSelectionChange={onSelection2Change}
                            //스크롤 조회 기능
                            fixedScroll={true}
                            total={detail2DataResult.total}
                            skip={page4.skip}
                            take={page4.take}
                            pageable={true}
                            onPageChange={pageChange4}
                            //원하는 행 위치로 스크롤 기능
                            ref={gridRef4}
                            rowHeight={30}
                            //정렬기능
                            sortable={true}
                            onSortChange={onDetail2SortChange}
                            //컬럼순서조정
                            reorderable={true}
                            //컬럼너비조정
                            resizable={true}
                          >
                            {customOptionData !== null &&
                              customOptionData.menuCustomColumnOptions[
                                "grdList4"
                              ]
                                .sort(
                                  (a: any, b: any) => a.sortOrder - b.sortOrder
                                )
                                .map(
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
                                            : numberField.includes(
                                                item.fieldName
                                              )
                                            ? gridSumQtyFooterCell3
                                            : undefined
                                        }
                                      ></GridColumn>
                                    )
                                )}
                          </Grid>
                        </ExcelExport>
                      </GridContainer>
                    </GridContainerWrap>
                  </TabStripTab>
                </TabStrip>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1} className="leading_PDA">
              <GridContainer
                style={{
                  marginTop: "10px",
                  paddingBottom: "20px",
                  width: "100%",
                }}
              >
                <GridTitleContainer>
                  <GridTitle>세부정보</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={detail1DataResult.data}
                  ref={(exporter) => {
                    _export5 = exporter;
                  }}
                  fileName="판매현황"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "left",
                      width: "100%",
                    }}
                  >
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
                  </div>
                  <Grid
                    style={{ height: "69vh" }}
                    data={process(
                      detail1DataResult.data.map((row) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
                        )?.code_name,
                        [SELECTED_FIELD]:
                          detailSelectedState[detailIdGetter(row)],
                      })),
                      detail1DataState
                    )}
                    {...detail1DataState}
                    onDataStateChange={onDetail1DataStateChange}
                    //선택 기능
                    dataItemKey={DETAIL_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={detail1DataResult.total}
                    skip={page5.skip}
                    take={page5.take}
                    pageable={true}
                    onPageChange={pageChange5}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef5}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onDetail1SortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList5"]
                        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        .map(
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
                                    ? detailTotalFooterCell
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell2
                                    : undefined
                                }
                              ></GridColumn>
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
          <TitleContainer>
            <Title>판매현황</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="SA_B2410_290W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>판매일자</th>
                  <td>
                    <CommonDateRangePicker
                      value={{
                        start: filters.ymdFrdt,
                        end: filters.ymdTodt,
                      }}
                      onChange={(e: { value: { start: any; end: any } }) =>
                        setFilters((prev) => ({
                          ...prev,
                          ymdFrdt: e.value.start,
                          ymdTodt: e.value.end,
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
                  <th>LOT NO</th>
                  <td>
                    <Input
                      name="lotnum"
                      type="text"
                      value={filters.lotnum}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>계산서</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="tax"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <th>내수구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="doexdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <TabStrip
            selected={tabSelected}
            onSelect={handleSelectTab}
            style={{ width: "100%" }}
          >
            <TabStripTab title="업체별">
              <GridContainer width="100%">
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export = exporter;
                  }}
                  fileName="판매현황"
                >
                  <Grid
                    style={{ height: "39vh" }}
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
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList"]
                        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        .map(
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
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="품목별">
              <GridContainer width="100%">
                <ExcelExport
                  data={mainDataResult.data}
                  ref={(exporter) => {
                    _export2 = exporter;
                  }}
                  fileName="판매현황"
                >
                  <Grid
                style={{ height: "39vh" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        qtyunit: qtyunitListData.find(
                          (item: any) => item.sub_code == row.qtyunit
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
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef2}
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
                      customOptionData.menuCustomColumnOptions["grdList2"]
                        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                        .map(
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
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell
                                    : numberField.includes(item.fieldName)
                                    ? gridSumQtyFooterCell
                                    : undefined
                                }
                              ></GridColumn>
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </TabStripTab>
            <TabStripTab title="일자별">
              <GridContainerWrap>
                <GridContainer width={`70%`}>
                  <ExcelExport
                    data={mainDataResult.data}
                    ref={(exporter) => {
                      _export3 = exporter;
                    }}
                    fileName="판매현황"
                  >
                    <Grid
                  style={{ height: "39vh" }}
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
                      skip={page3.skip}
                      take={page3.take}
                      pageable={true}
                      onPageChange={pageChange3}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef3}
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
                        customOptionData.menuCustomColumnOptions["grdList3"]
                          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          .map(
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
                                      : undefined
                                  }
                                  footerCell={
                                    item.sortOrder == 0
                                      ? mainTotalFooterCell
                                      : numberField.includes(item.fieldName)
                                      ? gridSumQtyFooterCell
                                      : undefined
                                  }
                                ></GridColumn>
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
                <GridContainer width={`calc(30% - ${GAP}px)`}>
                  <ExcelExport
                    data={detail2DataResult.data}
                    ref={(exporter) => {
                      _export4 = exporter;
                    }}
                    fileName="판매현황"
                  >
                    <Grid
                  style={{ height: "39vh" }}
                      data={process(
                        detail2DataResult.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]:
                            detail2SelectedState[detailId2Getter(row)],
                        })),
                        detail2DataState
                      )}
                      {...detail2DataState}
                      onDataStateChange={onDetail2DataStateChange}
                      //선택 기능
                      dataItemKey={DATA_ITEM_KEY}
                      selectedField={SELECTED_FIELD}
                      selectable={{
                        enabled: true,
                        mode: "single",
                      }}
                      onSelectionChange={onSelection2Change}
                      //스크롤 조회 기능
                      fixedScroll={true}
                      total={detail2DataResult.total}
                      skip={page4.skip}
                      take={page4.take}
                      pageable={true}
                      onPageChange={pageChange4}
                      //원하는 행 위치로 스크롤 기능
                      ref={gridRef4}
                      rowHeight={30}
                      //정렬기능
                      sortable={true}
                      onSortChange={onDetail2SortChange}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                    >
                      {customOptionData !== null &&
                        customOptionData.menuCustomColumnOptions["grdList4"]
                          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                          .map(
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
                                      ? gridSumQtyFooterCell3
                                      : undefined
                                  }
                                ></GridColumn>
                              )
                          )}
                    </Grid>
                  </ExcelExport>
                </GridContainer>
              </GridContainerWrap>
            </TabStripTab>
          </TabStrip>
          <GridContainer style={{ marginTop: "10px", paddingBottom: "20px" }}>
            <GridTitleContainer>
              <GridTitle>세부정보</GridTitle>
            </GridTitleContainer>
            <ExcelExport
              data={detail1DataResult.data}
              ref={(exporter) => {
                _export5 = exporter;
              }}
              fileName="판매현황"
            >
              <Grid
            style={{ height: "28vh" }}
                data={process(
                  detail1DataResult.data.map((row) => ({
                    ...row,
                    qtyunit: qtyunitListData.find(
                      (item: any) => item.sub_code == row.qtyunit
                    )?.code_name,
                    [SELECTED_FIELD]: detailSelectedState[detailIdGetter(row)],
                  })),
                  detail1DataState
                )}
                {...detail1DataState}
                onDataStateChange={onDetail1DataStateChange}
                //선택 기능
                dataItemKey={DETAIL_DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={detail1DataResult.total}
                skip={page5.skip}
                take={page5.take}
                pageable={true}
                onPageChange={pageChange5}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef5}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onDetail1SortChange}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
              >
                {customOptionData !== null &&
                  customOptionData.menuCustomColumnOptions["grdList5"]
                    .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                    .map(
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
                                ? detailTotalFooterCell
                                : numberField2.includes(item.fieldName)
                                ? gridSumQtyFooterCell2
                                : undefined
                            }
                          ></GridColumn>
                        )
                    )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </>
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={""}
          setData={setCustData}
          modal={true}
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

export default SA_B2410;
