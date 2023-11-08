import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderSelectionChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import NumberCell from "../Cells/NumberCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseParaPc,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  GetPropertyValueByName,
} from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE, GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import FilterContainer from "../Containers/FilterContainer";
import ItemsWindow from "./CommonWindows/ItemsWindow";
const DATA_ITEM_KEY3 = "num";
const DATA_ITEM_KEY = "itemcd";
const DATA_ITEM_KEY2 = "itemcd";

const topHeight = 55.56;
const bottomHeight = 55;
const leftOverHeight = (topHeight + bottomHeight) / 2;

type TKendoWindow = {
  getVisible(isVisible: boolean): void;
  setData(data: object, itemcd: string): void;
  para: any;
  modal?: boolean;
};

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;
let targetRowIndex3: null | number = null;

const KendoWindow = ({
  getVisible,
  para = "",
  setData,
  modal = false,
}: TKendoWindow) => {
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const pathname: string = window.location.pathname.replace("/", "");
  const setLoading = useSetRecoilState(isLoading);
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // 비즈니스 컴포넌트 조회
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA061,L_PR010,L_BA011,L_sysUserMaster_001,L_BA015",
    setBizComponentData
  );

  const [itemacntListData, setItemacntListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [outprocynListData, setOutprocynListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);
  const [qtyunitListData, setQtyunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [procunitListData, setProcunitListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
  });

  const handleMove = (event: WindowMoveEvent) => {
    setPosition({ ...position, left: event.left, top: event.top });
  };
  const handleResize = (event: WindowMoveEvent) => {
    setPosition({
      left: event.left,
      top: event.top,
      width: event.width,
      height: event.height,
    });
  };

  const onClose = () => {
    getVisible(false);
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);

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

    setFilters3((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage3(initialPageState);
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

  const processApi = useApi();

  const [detailState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [detailState2, setDetailDataState2] = useState<State>({
    sort: [],
  });

  const [detailState3, setDetailDataState3] = useState<State>({
    sort: [],
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailState)
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailState2)
  );

  const [detailDataResult3, setDetailDataResult3] = useState<DataResult>(
    process([], detailState3)
  );
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);

  const [selecteddetailState, setSelectedDetailState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selecteddetailState2, setSelectedDetailState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selecteddetailState3, setSelectedDetailState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "COPY",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "PASTE",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    workType: "BOM",
    orgdiv: "01",
    itemcd: "",
    itemnm: "",
    insiz: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  let gridRef3: any = useRef(null);

  useEffect(() => {
    setFilters3((item) => ({
      ...item,
      itemcd: para,
      isSearch: true,
    }));
  }, [para]);

  //상세그리드 조회
  const fetchGrid = async (filters: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0050W_Sub1_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_itemacnt": filters.itemacnt,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY] === filters.find_row_value
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
      setDetailDataResult((prev) => {
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
          setSelectedDetailState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setFilters3((prev) => ({
            ...prev,
            itemcd: selectedRow.itemcd,
            isSearch: true,
            pgNum: 1,
          }));
        } else {
          setSelectedDetailState({ [rows[0][DATA_ITEM_KEY]]: true });

          setFilters3((prev) => ({
            ...prev,
            itemcd: rows[0].itemcd,
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

  //상세그리드 조회
  const fetchGrid2 = async (filters2: any) => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터

    const parameters2: Iparameters = {
      procedureName: "P_BA_A0050W_Sub1_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_itemcd": filters2.itemcd,
        "@p_itemnm": filters2.itemnm,
        "@p_insiz": filters2.insiz,
        "@p_itemacnt": filters2.itemacnt,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY2] === filters2.find_row_value
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

      setDetailDataResult2(() => {
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
                (row: any) => row[DATA_ITEM_KEY2] == filters2.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedDetailState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedDetailState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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

  const fetchGrid3 = async (filters3: any) => {
    let data: any;
    const parameters3: Iparameters = {
      procedureName: "P_BA_A0050W_Sub1_Q",
      pageNumber: filters3.pgNum,
      pageSize: filters3.pgSize,
      parameters: {
        "@p_work_type": filters3.workType,
        "@p_orgdiv": filters3.orgdiv,
        "@p_itemcd": filters3.itemcd,
        "@p_itemnm": filters3.itemnm,
        "@p_insiz": filters3.insiz,
        "@p_itemacnt": filters3.itemacnt,
        "@p_company_code": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      if (filters3.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef3.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY3] == filters3.find_row_value
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
      setDetailDataResult3((prev) => {
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
                (row: any) => row[DATA_ITEM_KEY3] == filters3.find_row_value
              );
        if (selectedRow != undefined) {
          setSelectedDetailState3({ [selectedRow[DATA_ITEM_KEY3]]: true });
        } else {
          setSelectedDetailState3({ [rows[0][DATA_ITEM_KEY3]]: true });
        }
      }
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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult2]);

  useEffect(() => {
    if (targetRowIndex3 !== null && gridRef3.current) {
      gridRef3.current.scrollIntoView({ rowIndex: targetRowIndex3 });
      targetRowIndex3 = null;
    }
  }, [detailDataResult3]);

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    if (filters3.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setPage2(initialPageState); // 페이지 초기화
    setPage3(initialPageState); // 페이지 초기화
    setDetailDataResult(process([], detailState));
    setDetailDataResult2(process([], detailState2));
    setDetailDataResult3(process([], detailState3));
  };

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );
      const outprocynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA011")
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const procunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
      fetchQuery(outprocynQueryStr, setOutprocynListData);
      fetchQuery(prodempQueryStr, setProdempListData);
      fetchQuery(qtyunitQueryStr, setQtyunitListData);
      fetchQuery(procunitQueryStr, setProcunitListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

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

  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

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

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };
  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };
  const onDetailDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setDetailDataState3(event.dataState);
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onDetailSortChange3 = (e: any) => {
    setDetailDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setFilters2((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
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

  const detailTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = detailDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onDetailDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selecteddetailState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedDetailState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setPage3(initialPageState);
    setFilters3((prev) => ({
      ...prev,
      itemcd: selectedRowData.itemcd,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onDetailDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selecteddetailState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedDetailState2(newSelectedState);
  };

  const onDetailDataSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selecteddetailState3,
      dataItemKey: DATA_ITEM_KEY3,
    });
    setSelectedDetailState3(newSelectedState);
  };

  const onHeaderSelectionChange = React.useCallback(
    (event: GridHeaderSelectionChangeEvent) => {
      const checkboxElement: any = event.syntheticEvent.target;
      const checked = checkboxElement.checked;
      const newSelectedState: any = {};

      event.dataItems.forEach((item: any) => {
        newSelectedState[idGetter2(item)] = checked;
      });
      setSelectedDetailState2(newSelectedState);
    },
    []
  );

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const selectData = (selectedData: any) => {
    let arr: any = [];
    for (const [key, value] of Object.entries(selecteddetailState2)) {
      if (value == true) {
        arr.push(key);
      }
    }
    const selectRows = detailDataResult2.data.filter(
      (item: any) => arr.includes(item.itemcd) == true
    );
    setData(selectRows, Object.getOwnPropertyNames(selecteddetailState)[0]);
    onClose();
  };

  return (
    <Window
      title={"BOM복사"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={true}
    >
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
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
              <th>품목계정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemacnt"
                    value={filters.itemacnt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
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
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainerWrap height={`calc(50% - ${leftOverHeight}px)`}>
        <GridContainer width={`45%`}>
          <GridTitleContainer>
            <GridTitle>품목리스트</GridTitle>
          </GridTitleContainer>
          <Grid
            data={process(
              detailDataResult.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (items: any) => items.sub_code == row.itemacnt
                )?.code_name,
                [SELECTED_FIELD]: selecteddetailState[idGetter(row)], //선택된 데이터
              })),
              detailState
            )}
            {...detailState}
            onDataStateChange={onDetailDataStateChange}
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onDetailDataSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={detailDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            //더블클릭
            style={{ height: "calc(100% - 5px)" }}
          >
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="200px"
              footerCell={detailTotalFooterCell}
            />
            <GridColumn field="itemnm" title="품목명" width="185PX" />
            <GridColumn field="insiz" title="규격" width="150px" />
            <GridColumn field="itemacnt" title="품목계정" width="150px" />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(55% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>복사대상</GridTitle>
          </GridTitleContainer>
          <Grid
            data={process(
              detailDataResult2.data.map((row) => ({
                ...row,
                itemacnt: itemacntListData.find(
                  (items: any) => items.sub_code == row.itemacnt
                )?.code_name,
                [SELECTED_FIELD]: selecteddetailState2[idGetter2(row)], //선택된 데이터
              })),
              detailState2
            )}
            {...detailState2}
            onDataStateChange={onDetailDataStateChange2}
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single"
            }}
            //스크롤 조회기능
            fixedScroll={true}
            total={detailDataResult2.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef2}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            style={{ height: "calc(100% - 5px)" }}
            onSelectionChange={onDetailDataSelectionChange2}
            onHeaderSelectionChange={onHeaderSelectionChange}
          >
            <GridColumn
              field={SELECTED_FIELD}
              width="45px"
              headerSelectionValue={
                detailDataResult2.data.findIndex(
                  (item: any) => !selecteddetailState2[idGetter2(item)]
                ) === -1
              }
            />
            <GridColumn
              field="itemcd"
              title="품목코드"
              width="230px"
              footerCell={detailTotalFooterCell2}
            />
            <GridColumn field="itemnm" title="품목명" width="200PX" />
            <GridColumn field="insiz" title="규격" width="200px" />
            <GridColumn field="itemacnt" title="품목계정" width="150px" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      <GridContainer height={`calc(50% - ${leftOverHeight}px)`} width={`99.9%`}>
        <GridTitleContainer>
          <GridTitle>BOM상세</GridTitle>
        </GridTitleContainer>
        <Grid
          style={{ height: "calc(100% - 40px)" }}
          data={process(
            detailDataResult3.data.map((row) => ({
              ...row,
              proccd: proccdListData.find(
                (items: any) => items.sub_code === row.proccd
              )?.code_name,
              outprocyn: outprocynListData.find(
                (items: any) => items.sub_code === row.outprocyn
              )?.code_name,
              prodemp: prodempListData.find(
                (items: any) => items.user_id === row.prodemp
              )?.user_name,
              qtyunit: qtyunitListData.find(
                (items: any) => items.sub_code === row.qtyunit
              )?.code_name,
              procunit: procunitListData.find(
                (items: any) => items.sub_code === row.procunit
              )?.code_name,
              [SELECTED_FIELD]: selecteddetailState3[idGetter3(row)], //선택된 데이터
            })),
            detailState3
          )}
          {...detailState3}
          onDataStateChange={onDetailDataStateChange3}
          dataItemKey={DATA_ITEM_KEY3}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          //스크롤 조회기능
          fixedScroll={true}
          total={detailDataResult3.total}
          skip={page3.skip}
          take={page3.take}
          pageable={true}
          onPageChange={pageChange3}
          //원하는 행 위치로 스크롤 기능
          ref={gridRef3}
          rowHeight={30}
          //정렬기능
          sortable={true}
          onSortChange={onDetailSortChange3}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          onSelectionChange={onDetailDataSelectionChange3}
        >
          <GridColumn
            field="proccd"
            title="공정"
            width="150px"
            footerCell={detailTotalFooterCell3}
          />
          <GridColumn
            field="procseq"
            title="공정순서"
            width="100px"
            cell={NumberCell}
          />
          <GridColumn field="outprocyn" title="외주구분" width="100px" />
          <GridColumn field="prodemp" title="작업자" width="150px" />
          <GridColumn field="prodmac" title="설비" width="150px" />
          <GridColumn field="chlditemcd" title="소요자재코드" width="150px" />
          <GridColumn field="chlditemnm" title="소요자재명" width="150px" />
          <GridColumn
            field="unitqty"
            title="단위수량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn field="qtyunit" title="수량단위" width="120px" />
          <GridColumn field="outgb" title="불출구분" width="120px" />
          <GridColumn
            field="procqty"
            title="재공생산량"
            width="120px"
            cell={NumberCell}
          />
          <GridColumn field="procunit" title="생산량단위" width="120px" />
          <GridColumn field="remark" title="비고" width="200px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={selectData}>
            저장
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
