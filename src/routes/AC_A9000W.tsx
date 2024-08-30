import { DataResult, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
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
import MonthCalendar from "../components/Calendars/MonthCalendar";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import {
  convertDateToStr,
  findMessage,
  getBizCom,
  getDeviceHeight,
  getGridItemChangedData,
  getHeight,
  getMenuName,
  GetPropertyValueByName,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/AC_A9000W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let deletedMainRows: any[] = [];
let targetRowIndex: null | number = null;

const editableField = ["chainamt", "outamt", "chaoutamt", "inoutamt"];
const numberField: string[] = [
  "baseamt",
  "inamt",
  "chainamt",
  "outamt",
  "chaoutamt",
  "inoutamt",
  "adjustamt",
];
const numberField2: string[] = ["slipamt", "stdamt"];
const DateField = [""];

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;

var index = 0;

let rtnamt: number | null = null;

const AC_A9000W: React.FC = () => {
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const location = UseGetValueFromSessionItem("location");
  const setLoading = useSetRecoilState(isLoading);
  const initialPageState = { skip: 0, take: PAGE_SIZE };

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [mobileheight5, setMobileHeight5] = useState(0);
  const [mobileheight6, setMobileHeight6] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);
  const [webheight4, setWebHeight4] = useState(0);
  const [webheight5, setWebHeight5] = useState(0);
  const [webheight6, setWebHeight6] = useState(0);
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [swiper, setSwiper] = useState<SwiperCore>();
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".ButtonContainer2");
      height3 = getHeight(".ButtonContainer3");
      height4 = getHeight(".ButtonContainer4");
      height5 = getHeight(".ButtonContainer5");
      height6 = getHeight(".ButtonContainer6");
      height7 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height - height7);
        setMobileHeight2(getDeviceHeight(true) - height2 - height7);
        setMobileHeight3(getDeviceHeight(true) - height3 - height7);
        setMobileHeight4(getDeviceHeight(true) - height4 - height7);
        setMobileHeight5(getDeviceHeight(true) - height5 - height7);
        setMobileHeight6(getDeviceHeight(true) - height6 - height7);

        setWebHeight((getDeviceHeight(true) - height7) / 2 - height);
        setWebHeight2(getDeviceHeight(true) - height7 - height2);
        setWebHeight3((getDeviceHeight(true) - height7) / 3 - height3);
        setWebHeight4((getDeviceHeight(true) - height7) / 3 - height4);
        setWebHeight5((getDeviceHeight(true) - height7) / 3 - height5);
        setWebHeight6(getDeviceHeight(true) - height7 - height6);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2]);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });

  UsePermissions(setPermissions);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        stddt: setDefaultDate(customOptionData, "stddt"),
        isSearch: true,
      }));
      setSubFilters((prev) => ({
        ...prev,
        stddt: setDefaultDate(customOptionData, "stddt"),
      }));
      setSubFilters2((prev) => ({
        ...prev,
        stddt: setDefaultDate(customOptionData, "stddt"),
      }));
    }
  }, [customOptionData]);

  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY);
  const idGetter3 = getter(DATA_ITEM_KEY);
  const idGetter4 = getter(DATA_ITEM_KEY);
  const idGetter5 = getter(DATA_ITEM_KEY);
  const idGetter6 = getter(DATA_ITEM_KEY);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const [page4, setPage4] = useState(initialPageState);
  const [page5, setPage5] = useState(initialPageState);
  const [page6, setPage6] = useState(initialPageState);
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

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page2.skip,
      take: initialPageState.take,
    });
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
  };

  const pageChange4 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
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

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage5({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const pageChange6 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage6({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_AC510", setBizComponentData);

  const [acntcdListData, setAcntcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setAcntcdListData(getBizCom(bizComponentData, "L_AC510"));
    }
  }, [bizComponentData]);

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
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
    sort: [],
  });
  const [mainDataState7, setMainDataState7] = useState<State>({
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
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
  );
  const [mainDataResult7, setMainDataResult7] = useState<DataResult>(
    process([], mainDataState7)
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
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);
  let gridRef4: any = useRef(null);
  let gridRef5: any = useRef(null);
  let gridRef6: any = useRef(null);

  const [filters, setFilters] = useState({
    work_type: "",
    orgdiv: orgdiv,
    location: location,
    stddt: new Date(),
    find_row_value: "",
    pgSize: PAGE_SIZE,
    pgNum: 1,
    isSearch: false,
  });

  const [subFilters, setSubFilters] = useState({
    work_type: "RECAL",
    orgdiv: orgdiv,
    location: location,
    stddt: new Date(),
    find_row_value: "",
    pgSize: PAGE_SIZE,
    pgNum: 1,
    isSearch: false,
  });

  const [subFilters2, setSubFilters2] = useState({
    work_type: "SUM",
    orgdiv: orgdiv,
    location: location,
    stddt: new Date(),
    find_row_value: "",
    pgSize: PAGE_SIZE,
    pgNum: 1,
    isSearch: false,
  });

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
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
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
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange4 = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange5 = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult5,
      setMainDataResult5,
      DATA_ITEM_KEY
    );
  };
  const onMainItemChange6 = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult6,
      setMainDataResult6,
      DATA_ITEM_KEY
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
  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
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
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState2(newSelectedState);
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState3(newSelectedState);
  };
  const onSelectionChange4 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState4(newSelectedState);
  };
  const onSelectionChange5 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState5,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState5(newSelectedState);
  };
  const onSelectionChange6 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState6,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState6(newSelectedState);
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A9000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_stddt": convertDateToStr(filters.stddt).substring(0, 6),
        "@p_find_row_value": filters.find_row_value,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      const totalRowCnt = data.tables[0].TotalRowCount;
      if (filters.work_type == "ACNTLIST") {
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
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      } else if (filters.work_type == "LIST1") {
        setMainDataResult2((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState2({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState2({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      } else if (filters.work_type == "LIST2") {
        setMainDataResult3((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState3({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState3({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      } else if (filters.work_type == "LIST3") {
        setMainDataResult4((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState4({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState4({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      } else if (filters.work_type == "LIST4") {
        setMainDataResult5((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState5({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState5({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      } else if (filters.work_type == "LIST5") {
        setMainDataResult6((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
                );

          if (selectedRow != undefined) {
            setSelectedState6({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState6({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      } else if (filters.work_type == "RECAL") {
        const rows = data.tables[0].Rows;
        const updatedMainDataResult = mainDataResult.data.map((item) => {
          const matchingRow = rows.find(
            (row: any) => row.acntcd === item.acntcd
          );
          if (matchingRow) {
            return {
              ...item,
              baseamt: matchingRow.baseamt,
              inamt: matchingRow.inamt,
              chaoutamt: matchingRow.chaoutamt,
            };
          }
          return item;
        });
        const newData = calc(updatedMainDataResult);
        setMainDataResult((prev: { total: any }) => ({
          ...prev,
          data: newData,
        }));
      } else if (filters.work_type == "SUM") {
        if (totalRowCnt > 0) {
          const existingAcntcdSet = new Set(
            mainDataResult.data.map((item: any) => item.acntcd)
          );
          const filteredNewData = rows.filter(
            (row: any) => !existingAcntcdSet.has(row.acntcd)
          );
          if (filteredNewData.length > 0) {
            const newData = filteredNewData.map((row: any) => {
              return {
                ...row,
                num: mainDataResult.total + row.num,
                rowstatus: "N",
                baseamt: row.baseamt || 0,
                inamt: row.inamt || 0,
                chaoutamt: row.chaoutamt || 0,
                chainamt: 0,
                outamt: 0,
                inoutamt: 0,
                adjustamt: 0,
                acseq1: 0,
                tacseq1: 0,
                sacseq1: 0,
              };
            });

            // 중복되지 않은 데이터만 추가
            setMainDataResult((prev) => ({
              ...prev,
              data: [...prev.data, ...newData],
              total: prev.total + filteredNewData.length,
            }));

            const selectedRow = newData[0];

            if (selectedRow !== undefined) {
              setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

            }
          }
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
    setSubFilters2((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //메인 그리드 데이터 변경 되었을 때
  // useEffect(() => {
  //   if (targetRowIndex !== null && gridRef.current) {
  //     gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
  //     targetRowIndex = null;
  //   }
  //   setLoading(false);
  // }, [mainDataResult]);

  const [paraData, setParaData] = useState({
    workType: "",
    orgdiv: orgdiv,
    location: location,
    rowstatus_s: "",
    yyyymm_s: "",
    acntcd_s: "",
    baseamt_s: "",
    inamt_s: "",
    chainamt_s: "",
    outamt_s: "",
    chaoutamt_s: "",
    inoutamt_s: "",
    actdt_s: "",
    acseq1_s: "",
    tactdt_s: "",
    tacseq1_s: "",
    sactdt_s: "",
    sacseq1_s: "",
    div: "1",
  });

  const fetchTodoGridSaved = async () => {
    if (!permissions.delete) return;
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    const para: Iparameters = {
      procedureName: "P_AC_A9000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraData.workType,
        "@p_orgdiv": paraData.orgdiv,
        "@p_location": paraData.location,
        "@p_rowstatus_s": paraData.rowstatus_s,
        "@p_yyyymm_s": paraData.yyyymm_s,
        "@p_acntcd_s": paraData.acntcd_s,
        "@p_baseamt_s": paraData.baseamt_s,
        "@p_inamt_s": paraData.inamt_s,
        "@p_chainamt_s": paraData.chainamt_s,
        "@p_outamt_s": paraData.outamt_s,
        "@p_chaoutamt_s": paraData.chaoutamt_s,
        "@p_inoutamt_s": paraData.inoutamt_s,
        "@p_actdt_s": paraData.actdt_s,
        "@p_acseq1_s": paraData.acseq1_s,
        "@p_tactdt_s": paraData.tactdt_s,
        "@p_tacseq1_s": paraData.tacseq1_s,
        "@p_sactdt_s": paraData.sactdt_s,
        "@p_sacseq1_s": paraData.sacseq1_s,
        "@p_div": paraData.div,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "AC_A9000W",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setParaData({
        workType: "",
        orgdiv: orgdiv,
        location: location,
        rowstatus_s: "",
        yyyymm_s: "",
        acntcd_s: "",
        baseamt_s: "",
        inamt_s: "",
        chainamt_s: "",
        outamt_s: "",
        chaoutamt_s: "",
        inoutamt_s: "",
        actdt_s: "",
        acseq1_s: "",
        tactdt_s: "",
        tacseq1_s: "",
        sactdt_s: "",
        sacseq1_s: "",
        div: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
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
      deepCopiedFilters.work_type = "ACNTLIST";
      const deepCopiedFilters2 = _.cloneDeep(filters);
      deepCopiedFilters2.work_type = "LIST1";
      const deepCopiedFilters3 = _.cloneDeep(filters);
      deepCopiedFilters3.work_type = "LIST2";
      const deepCopiedFilters4 = _.cloneDeep(filters);
      deepCopiedFilters4.work_type = "LIST3";
      const deepCopiedFilters5 = _.cloneDeep(filters);
      deepCopiedFilters5.work_type = "LIST4";
      const deepCopiedFilters6 = _.cloneDeep(filters);
      deepCopiedFilters6.work_type = "LIST5";
      // const deepCopiedFilters7 = _.cloneDeep(filters);
      // deepCopiedFilters7.work_type = "SUM_LIST1";
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
      fetchMainGrid(deepCopiedFilters2);
      fetchMainGrid(deepCopiedFilters3);
      fetchMainGrid(deepCopiedFilters4);
      fetchMainGrid(deepCopiedFilters5);
      fetchMainGrid(deepCopiedFilters6);
      // fetchMainGrid(deepCopiedFilters7);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  // 조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subFilters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters);
      setSubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [subFilters, permissions, bizComponentData, customOptionData]);

  // 조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      subFilters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subFilters2);
      setSubFilters2((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [subFilters2, permissions, bizComponentData, customOptionData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubFilters2((prev) => ({
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

  const search = () => {
    resetAllGrid();
    try {
      if (
        convertDateToStr(filters.stddt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.stddt).substring(6, 8) > "31" ||
        convertDateToStr(filters.stddt).substring(6, 8) < "01" ||
        convertDateToStr(filters.stddt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_A9000W_001");
      } else {
        setFilters((prev: any) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
      if (swiper && isMobile) {
        swiper.slideTo(0);
      }
    } catch (e) {
      alert(e);
    }
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setPage2(initialPageState);
    setPage3(initialPageState);
    setPage4(initialPageState);
    setPage5(initialPageState);
    setPage6(initialPageState);
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
    deletedMainRows = [];
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  let _export3: any;
  let _export4: any;
  let _export5: any;
  let _export6: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      const optionsGridTwo = _export2.workbookOptions();
      const optionsGridThree = _export3.workbookOptions();
      const optionsGridFour = _export4.workbookOptions();
      const optionsGridFive = _export5.workbookOptions();
      const optionsGridSix = _export6.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[3] = optionsGridFour.sheets[0];
      optionsGridOne.sheets[4] = optionsGridFive.sheets[0];
      optionsGridOne.sheets[5] = optionsGridSix.sheets[0];
      optionsGridOne.sheets[0].title = "결산LIST";
      optionsGridOne.sheets[1].title = "노무비 & 제조경비";
      optionsGridOne.sheets[2].title = "매출액";
      optionsGridOne.sheets[3].title = "영업외수익";
      optionsGridOne.sheets[4].title = "영업외비용";
      optionsGridOne.sheets[5].title = "판매비&일반관리비";
      _export.save(optionsGridOne);
    }
  };

  // cell 배경색 변경
  const customCellRender = (td: any, props: any) => {
    const isSelected = selectedState[props.dataItem.num];
    const backgroundColor =
      (props.field === "chainamt" ||
        props.field === "outamt" ||
        props.field === "chaoutamt" ||
        props.field === "inoutamt") &&
      (props.dataItem.acntcd === "원재료" ||
        props.dataItem.acntcd === "부재료" ||
        props.dataItem.acntcd === "재공품" ||
        props.dataItem.acntcd === "제품" ||
        props.dataItem.acntcd === "상품")
        ? isSelected
          ? "rgba(255, 165, 0, 0.6)"
          : "rgba(255, 165, 0, 0.4)"
        : undefined;
    const fontWeight =
      (props.field === "chainamt" ||
        props.field === "outamt" ||
        props.field === "chaoutamt" ||
        props.field === "inoutamt") &&
      (props.dataItem.acntcd === "원재료" ||
        props.dataItem.acntcd === "부재료" ||
        props.dataItem.acntcd === "재공품" ||
        props.dataItem.acntcd === "제품" ||
        props.dataItem.acntcd === "상품")
        ? "bold"
        : undefined;
    return (
      <CellRender
        originalProps={props}
        td={React.cloneElement(td, {
          style: { ...td.props.style, backgroundColor, fontWeight },
        })}
        enterEdit={enterEdit}
        editField={EDIT_FIELD}
      />
    );
  };

  const customRowRender = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit = (dataItem: any, field: string) => {
    if (editableField.includes(field)) {
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
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
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
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? editedField == "inoutamt"
            ? {
                ...item,
                outamt:
                  item.baseamt +
                  item.inamt +
                  item.chainamt -
                  item.inoutamt -
                  item.chaoutamt,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : editedField === "outamt"
            ? {
                ...item,
                inoutamt:
                  item.baseamt +
                  item.inamt +
                  item.chainamt -
                  item.outamt -
                  item.chaoutamt,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : editedField === "chaoutamt"
            ? {
                ...item,
                inoutamt:
                  item.baseamt +
                  item.inamt +
                  item.chainamt -
                  item.outamt -
                  item.chaoutamt,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
                [EDIT_FIELD]: undefined,
              }
            : {
                ...item,
                rowstatus: item.rowstatus === "N" ? "N" : "U",
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

      if (
        editedField === "inoutamt" ||
        editedField === "outamt" ||
        editedField === "chaoutamt"
      ) {
        const newData2 = calc(newData);
        setMainDataResult({ ...mainDataResult, data: newData2 });
      }
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

  const calc = (newData: any) => {
    let sumamt = 0;
    const data = newData.find(
      (item: { acntcd: string }) => item.acntcd === "1130400"
    );
    const data1 = newData.find(
      (item: { acntcd: string }) => item.acntcd === "1130500"
    );
    const data2 = newData.find(
      (item: { acntcd: string }) => item.acntcd === "1130300"
    );
    const data3 = newData.find(
      (item: { acntcd: string }) => item.acntcd === "1130201"
    );
    const data4 = newData.find(
      (item: { acntcd: string }) => item.acntcd === "1130100"
    );
    if (mainDataResult2.total == 0) {
      sumamt = 0;
    } else {
      sumamt = mainDataResult2.data[0].total_slipamt;
    }
    if (data2) {
      data2.inamt = (data?.outamt || 0) + (data1?.outamt || 0) + sumamt;
      data2.outamt =
        (data2.baseamt || 0) +
        (data2.chainamt || 0) +
        (data2.inamt || 0) -
        (data2.inoutamt || 0) -
        (data2.chaoutamt || 0);
      data2.rowstatus = "N" ? "N" : "U";
    }
    if (data3) {
      data3.inamt =
        (data2.baseamt || 0) +
        (data2.chainamt || 0) +
        (data2.inamt || 0) -
        (data2.inoutamt || 0) -
        (data2.chaoutamt || 0);
      data3.outamt =
        (data3.baseamt || 0) +
        (data2.outamt || 0) -
        (data3.chaoutamt || 0) -
        (data3.inoutamt || 0) +
        (data3.chainamt || 0);
      data3.rowstatus = "N" ? "N" : "U";
    }
    const updateData = (data: any) => {
      if (
        data.chainamt === 0 &&
        data.outamt === 0 &&
        data.chaoutamt === 0 &&
        data.inoutamt === 0
      ) {
        data.inoutamt = data.baseamt + data.inamt + data.chainamt;
        data.adjustamt =
          data.baseamt +
          data.inamt +
          data.chainamt -
          data.outamt -
          (data.baseamt + data.inamt + data.chainamt);
        data.rowstatus = "N" ? "N" : "U";
      } else {
        data.adjustamt =
          data.baseamt +
          data.chainamt +
          data.inamt -
          data.outamt -
          data.chaoutamt -
          data.inoutamt;
        data.rowstatus = "N" ? "N" : "U";
      }
    };
    [data, data1, data2, data3, data4].forEach((data) => {
      if (data) {
        updateData(data);
      }
    });

    return newData;
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
  //그리드 푸터
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
  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult4.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult5.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {mainDataResult6.total == -1
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
    mainDataResult2.data.forEach((item) =>
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
  const gridSumQtyFooterCell3 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult3.data.forEach((item) =>
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
  const gridSumQtyFooterCell4 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult4.data.forEach((item) =>
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
  const gridSumQtyFooterCell5 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult5.data.forEach((item) =>
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
  const gridSumQtyFooterCell6 = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult6.data.forEach((item) =>
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

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    let valid = true;

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (item.chk == "Y") {
          valid = false;
        } else {
          if (!item.rowstatus || item.rowstatus != "N") {
            const newData = item;
            newData.rowstatus = "D";
            deletedMainRows.push(newData);
          }
          Object.push(index);
        }
      }
    });

    if (valid != true) {
      alert("전표처리 된 자료는 삭제 할 수 없습니다.");
      return false;
    }

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }

    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onRecalClick = () => {
    if (mainDataResult.total < 1) {
      setSubFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  };

  const onSaveClick = (workType: string) => {
    if (mainDataResult.total < 0) return false;
    const confirmMessage =
      workType == "SET"
        ? "결산전표를 생성 하시겠습니까?"
        : workType == "DEL"
        ? "결산전표를 해제 하시겠습니까?"
        : null;
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return false;
    }
    const dataItem = mainDataResult.data.filter((item: any) => {
      return item.rowstatus === "U" || item.rowstatus === "N";
    });
    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;
    if (paraData.workType != "D") {
      let dataArr: any = {
        rowstatus_s: [],
        yyyymm_s: [],
        acntcd_s: [],
        baseamt_s: [],
        inamt_s: [],
        chainamt_s: [],
        outamt_s: [],
        chaoutamt_s: [],
        inoutamt_s: [],
        actdt_s: [],
        acseq1_s: [],
        tactdt_s: [],
        tacseq1_s: [],
        sactdt_s: [],
        sacseq1_s: [],
      };
      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          acntcd = "",
          baseamt = "",
          inamt = "",
          chainamt = "",
          outamt = "",
          chaoutamt = "",
          inoutamt = "",
          actdt = "",
          acseq1 = "",
          tactdt = "",
          tacseq1 = "",
          sactdt = "",
          sacseq1 = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.yyyymm_s.push(convertDateToStr(filters.stddt).substring(0, 6));
        dataArr.acntcd_s.push(acntcd);
        dataArr.baseamt_s.push(baseamt);
        dataArr.inamt_s.push(inamt);
        dataArr.chainamt_s.push(chainamt);
        dataArr.outamt_s.push(outamt);
        dataArr.chaoutamt_s.push(chaoutamt);
        dataArr.inoutamt_s.push(inoutamt);
        dataArr.actdt_s.push(actdt);
        dataArr.acseq1_s.push(acseq1);
        dataArr.tactdt_s.push(tactdt);
        dataArr.tacseq1_s.push(tacseq1);
        dataArr.sactdt_s.push(sactdt);
        dataArr.sacseq1_s.push(sacseq1);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          acntcd = "",
          baseamt = "",
          inamt = "",
          chainamt = "",
          outamt = "",
          chaoutamt = "",
          inoutamt = "",
          actdt = "",
          acseq1 = "",
          tactdt = "",
          tacseq1 = "",
          sactdt = "",
          sacseq1 = "",
        } = item;
        dataArr.rowstatus_s.push(rowstatus);
        dataArr.yyyymm_s.push(convertDateToStr(filters.stddt).substring(0, 6));
        dataArr.acntcd_s.push(acntcd);
        dataArr.baseamt_s.push(baseamt);
        dataArr.inamt_s.push(inamt);
        dataArr.chainamt_s.push(chainamt);
        dataArr.outamt_s.push(outamt);
        dataArr.chaoutamt_s.push(chaoutamt);
        dataArr.inoutamt_s.push(inoutamt);
        dataArr.actdt_s.push(actdt);
        dataArr.acseq1_s.push(acseq1);
        dataArr.tactdt_s.push(tactdt);
        dataArr.tacseq1_s.push(tacseq1);
        dataArr.sactdt_s.push(sactdt);
        dataArr.sacseq1_s.push(sacseq1);
      });
      setParaData((prev) => ({
        ...prev,
        workType: workType,
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        yyyymm_s:
          workType == "LIST"
            ? dataArr.yyyymm_s.join("|")
            : convertDateToStr(filters.stddt).substring(0, 6),
        acntcd_s: dataArr.acntcd_s.join("|"),
        baseamt_s: dataArr.baseamt_s.join("|"),
        inamt_s: dataArr.inamt_s.join("|"),
        chainamt_s: dataArr.chainamt_s.join("|"),
        outamt_s: dataArr.outamt_s.join("|"),
        chaoutamt_s: dataArr.chaoutamt_s.join("|"),
        inoutamt_s: dataArr.inoutamt_s.join("|"),
        actdt_s: dataArr.actdt_s.join("|"),
        acseq1_s: dataArr.acseq1_s.join("|"),
        tactdt_s: dataArr.tactdt_s.join("|"),
        tacseq1_s: dataArr.tacseq1_s.join("|"),
        sactdt_s: dataArr.sactdt_s.join("|"),
        sacseq1_s: dataArr.sacseq1_s.join("|"),
      }));
    }
  };

  useEffect(() => {
    if (paraData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [paraData, permissions]);

  const onAddClick = () => {
    fetchMainGrid(subFilters2);
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>결산자동전표</Title>
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
              <th>기준년월</th>
              <td>
                <DatePicker
                  name="stddt"
                  value={filters.stddt}
                  format="yyyy-MM"
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
                  calendar={MonthCalendar}
                />
              </td>
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="drcrdiv"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
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
            <GridContainer>
              <GridTitleContainer className="ButtonContainer">
                <GridTitle>
                  결산LIST{" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-right"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(1);
                      }
                    }}
                  ></Button>
                </GridTitle>
                <ButtonContainer style={{ rowGap: "5px" }}>
                  <Button
                    onClick={onDeleteClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="minus"
                    title="행 삭제"
                    disabled={
                      permissions.delete
                        ? mainDataResult.total > 0
                          ? false
                          : true
                        : true
                    }
                  ></Button>
                  <Button
                    onClick={onRecalClick}
                    icon="refresh"
                    fillMode="outline"
                    themeColor={"primary"}
                  >
                    기초/입고금액 재집계
                  </Button>
                  <Button
                    onClick={() => onSaveClick("SET")}
                    themeColor={"primary"}
                    icon="check-circle"
                    disabled={permissions.save ? false : true}
                  >
                    전표생성
                  </Button>
                  <Button
                    onClick={() => onSaveClick("DEL")}
                    icon="close-circle"
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.save ? false : true}
                  >
                    전표해제
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
                    onClick={() => onSaveClick("LIST")}
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
                      acntcd: acntcdListData.find(
                        (items: any) => items.sub_code == row.acntcd
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
                  <GridColumn field="rowstatus" title=" " width="40px" />
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
                                DateField.includes(item.fieldName)
                                  ? DateCell
                                  : numberField.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell
                                  : numberField.includes(item.fieldName)
                                  ? editNumberFooterCell
                                  : editableField.includes(item.fileName)
                                  ? gridSumQtyFooterCell
                                  : undefined
                              }
                            />
                          )
                      )}
                  <GridColumn title="전표번호" width={130}>
                    <GridColumn
                      id="col_actdt"
                      field="actdt"
                      title="일자"
                      width="80px"
                      cell={DateCell}
                    />
                    <GridColumn
                      id="col_acseq1"
                      field="acseq1"
                      title="순번"
                      width="50px"
                      cell={NumberCell}
                    />
                  </GridColumn>
                  <GridColumn title="전표번호2" width={130}>
                    <GridColumn
                      id="col_tactdt"
                      field="tactdt"
                      title="일자"
                      width="80px"
                      cell={DateCell}
                    />
                    <GridColumn
                      id="col_tacseq1"
                      field="tacseq1"
                      title="순번"
                      width="50px"
                      cell={NumberCell}
                    />
                  </GridColumn>
                  <GridColumn title="전표번호3" width={130}>
                    <GridColumn
                      id="col_sactdt"
                      field="sactdt"
                      title="일자"
                      width="80px"
                      cell={DateCell}
                    />
                    <GridColumn
                      id="col_sacseq1"
                      field="sacseq1"
                      title="순번"
                      width="50px"
                      cell={NumberCell}
                    />
                  </GridColumn>
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={1}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-left"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(0);
                      }
                    }}
                  ></Button>{" "}
                  노무비 & 제조경비{" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-right"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(2);
                      }
                    }}
                  ></Button>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName={getMenuName()}
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
                  dataItemKey={DATA_ITEM_KEY}
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
                  onItemChange={onMainItemChange2}
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
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField2.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell2
                                  : numberField2.includes(item.fieldName)
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
            <GridContainer>
              <GridTitleContainer className="ButtonContainer3">
                <GridTitle>
                  {" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-left"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(1);
                      }
                    }}
                  ></Button>
                  매출액{" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-right"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(3);
                      }
                    }}
                  ></Button>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult3.data}
                ref={(exporter) => {
                  _export3 = exporter;
                }}
                fileName={getMenuName()}
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
                  dataItemKey={DATA_ITEM_KEY}
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
                  onItemChange={onMainItemChange3}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
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
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField2.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell3
                                  : numberField2.includes(item.fieldName)
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
          <SwiperSlide key={3}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer4">
                <GridTitle>
                  {" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-left"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(2);
                      }
                    }}
                  ></Button>
                  영업외수익{" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-right"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(4);
                      }
                    }}
                  ></Button>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult4.data}
                ref={(exporter) => {
                  _export4 = exporter;
                }}
                fileName={getMenuName()}
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
                  dataItemKey={DATA_ITEM_KEY}
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
                  onItemChange={onMainItemChange4}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
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
                              cell={
                                numberField2.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell4
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell4
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={4}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer5">
                <GridTitle>
                  {" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-left"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(3);
                      }
                    }}
                  ></Button>
                  영업외비용{" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-right"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(5);
                      }
                    }}
                  ></Button>
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult5.data}
                ref={(exporter) => {
                  _export5 = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight5 }}
                  data={process(
                    mainDataResult5.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState5[idGetter5(row)],
                    })),
                    mainDataState5
                  )}
                  {...mainDataState5}
                  onDataStateChange={onMainDataStateChange5}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange5}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult5.total}
                  skip={page5.skip}
                  take={page5.take}
                  pageable={true}
                  onPageChange={pageChange5}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef5}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange5}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange5}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList5"]
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
                                numberField2.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell5
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell5
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={5}>
            <GridContainer>
              <GridTitleContainer className="ButtonContainer6">
                <GridTitle>
                  {" "}
                  <Button
                    themeColor={"primary"}
                    fillMode={"flat"}
                    icon={"chevron-left"}
                    onClick={() => {
                      if (swiper) {
                        swiper.slideTo(4);
                      }
                    }}
                  ></Button>
                  판매비&일반관리비
                </GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult6.data}
                ref={(exporter) => {
                  _export6 = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: mobileheight6 }}
                  data={process(
                    mainDataResult6.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                    })),
                    mainDataState6
                  )}
                  {...mainDataState6}
                  onDataStateChange={onMainDataStateChange6}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange6}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult6.total}
                  skip={page6.skip}
                  take={page6.take}
                  pageable={true}
                  onPageChange={pageChange6}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef6}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange6}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange6}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList6"]
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
                                numberField2.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell6
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell6
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
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>결산LIST</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onDeleteClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제"
                  disabled={
                    permissions.delete
                      ? mainDataResult.total > 0
                        ? false
                        : true
                      : true
                  }
                ></Button>
                <Button
                  onClick={onRecalClick}
                  icon="refresh"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  기초/입고금액 재집계
                </Button>
                <Button
                  onClick={() => onSaveClick("SET")}
                  themeColor={"primary"}
                  icon="check-circle"
                  disabled={permissions.save ? false : true}
                >
                  전표생성
                </Button>
                <Button
                  onClick={() => onSaveClick("DEL")}
                  icon="close-circle"
                  fillMode="outline"
                  themeColor={"primary"}
                  disabled={permissions.save ? false : true}
                >
                  전표해제
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
                  onClick={() => onSaveClick("LIST")}
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
                    acntcd: acntcdListData.find(
                      (items: any) => items.sub_code == row.acntcd
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
                <GridColumn field="rowstatus" title=" " width="40px" />
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
                              DateField.includes(item.fieldName)
                                ? DateCell
                                : numberField.includes(item.fieldName)
                                ? NumberCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder == 0
                                ? mainTotalFooterCell
                                : numberField.includes(item.fieldName)
                                ? editNumberFooterCell
                                : editableField.includes(item.fileName)
                                ? gridSumQtyFooterCell
                                : undefined
                            }
                          />
                        )
                    )}
                <GridColumn title="전표번호" width={130}>
                  <GridColumn
                    id="col_actdt"
                    field="actdt"
                    title="일자"
                    width="80px"
                    cell={DateCell}
                  />
                  <GridColumn
                    id="col_acseq1"
                    field="acseq1"
                    title="순번"
                    width="50px"
                    cell={NumberCell}
                  />
                </GridColumn>
                <GridColumn title="전표번호2" width={130}>
                  <GridColumn
                    id="col_tactdt"
                    field="tactdt"
                    title="일자"
                    width="80px"
                    cell={DateCell}
                  />
                  <GridColumn
                    id="col_tacseq1"
                    field="tacseq1"
                    title="순번"
                    width="50px"
                    cell={NumberCell}
                  />
                </GridColumn>
                <GridColumn title="전표번호3" width={130}>
                  <GridColumn
                    id="col_sactdt"
                    field="sactdt"
                    title="일자"
                    width="80px"
                    cell={DateCell}
                  />
                  <GridColumn
                    id="col_sacseq1"
                    field="sacseq1"
                    title="순번"
                    width="50px"
                    cell={NumberCell}
                  />
                </GridColumn>
              </Grid>
            </ExcelExport>
          </GridContainer>
          <GridContainerWrap>
            <GridContainer width="33%">
              <GridTitleContainer className="ButtonContainer2">
                <GridTitle>노무비 & 제조경비</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult2.data}
                ref={(exporter) => {
                  _export2 = exporter;
                }}
                fileName={getMenuName()}
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
                  dataItemKey={DATA_ITEM_KEY}
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
                  onItemChange={onMainItemChange2}
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
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              cell={
                                numberField2.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell2
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell2
                                  : undefined
                              }
                            />
                          )
                      )}
                </Grid>
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(33% - ${GAP}px)`}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>매출액</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult3.data}
                  ref={(exporter) => {
                    _export3 = exporter;
                  }}
                  fileName={getMenuName()}
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
                    dataItemKey={DATA_ITEM_KEY}
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
                    onItemChange={onMainItemChange3}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
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
                                field={item.fieldName}
                                title={item.caption}
                                width={item.width}
                                cell={
                                  numberField2.includes(item.fieldName)
                                    ? NumberCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell3
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell3
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer4">
                  <GridTitle>영업외수익</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult4.data}
                  ref={(exporter) => {
                    _export4 = exporter;
                  }}
                  fileName={getMenuName()}
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
                    dataItemKey={DATA_ITEM_KEY}
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
                    onItemChange={onMainItemChange4}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
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
                                cell={
                                  numberField2.includes(item.fieldName)
                                    ? NumberCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell4
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell4
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer5">
                  <GridTitle>영업외비용</GridTitle>
                </GridTitleContainer>
                <ExcelExport
                  data={mainDataResult5.data}
                  ref={(exporter) => {
                    _export5 = exporter;
                  }}
                  fileName={getMenuName()}
                >
                  <Grid
                    style={{ height: webheight5 }}
                    data={process(
                      mainDataResult5.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: selectedState5[idGetter5(row)],
                      })),
                      mainDataState5
                    )}
                    {...mainDataState5}
                    onDataStateChange={onMainDataStateChange5}
                    //선택 기능
                    dataItemKey={DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSelectionChange5}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={mainDataResult5.total}
                    skip={page5.skip}
                    take={page5.take}
                    pageable={true}
                    onPageChange={pageChange5}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef5}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onMainSortChange5}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={onMainItemChange5}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList5"]
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
                                  numberField2.includes(item.fieldName)
                                    ? NumberCell
                                    : undefined
                                }
                                footerCell={
                                  item.sortOrder == 0
                                    ? mainTotalFooterCell5
                                    : numberField2.includes(item.fieldName)
                                    ? gridSumQtyFooterCell5
                                    : undefined
                                }
                              />
                            )
                        )}
                  </Grid>
                </ExcelExport>
              </GridContainer>
            </GridContainer>
            <GridContainer width={`calc(33% - ${GAP}px)`}>
              <GridTitleContainer className="ButtonContainer6">
                <GridTitle>판매비&일반관리비</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                data={mainDataResult6.data}
                ref={(exporter) => {
                  _export6 = exporter;
                }}
                fileName={getMenuName()}
              >
                <Grid
                  style={{ height: webheight6 }}
                  data={process(
                    mainDataResult6.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState6[idGetter6(row)],
                    })),
                    mainDataState6
                  )}
                  {...mainDataState6}
                  onDataStateChange={onMainDataStateChange6}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange6}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult6.total}
                  skip={page6.skip}
                  take={page6.take}
                  pageable={true}
                  onPageChange={pageChange6}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef6}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange6}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange6}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList6"]
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
                                numberField2.includes(item.fieldName)
                                  ? NumberCell
                                  : undefined
                              }
                              footerCell={
                                item.sortOrder == 0
                                  ? mainTotalFooterCell6
                                  : numberField2.includes(item.fieldName)
                                  ? gridSumQtyFooterCell6
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
export default AC_A9000W;
