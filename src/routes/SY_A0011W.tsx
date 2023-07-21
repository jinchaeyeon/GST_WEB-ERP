import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  TreeList,
  createDataTree,
  treeToFlat,
  mapTree,
  extendDataItem,
  TreeListExpandChangeEvent,
  TreeListColumnProps,
  TreeListItemChangeEvent,
  modifySubItems,
} from "@progress/kendo-react-treelist";
import { gridList } from "../store/columns/SY_A0011W_C";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridPageChangeEvent,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import FilterContainer from "../components/Containers/FilterContainer";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridContainerWrap,
} from "../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  getQueryFromBizComponent,
  getYn,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  handleKeyPressSearch,
  UseParaPc,
  UseGetValueFromSessionItem,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  EXPANDED_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import { Renderers } from "../components/Renderers/TreeListRenderers";
import CheckBoxTreeListCell from "../components/Cells/CheckBoxTreeListCell";
import { isLoading } from "../store/atoms";
import { useSetRecoilState } from "recoil";
import DetailWindow from "../components/Windows/SY_A0011W_Window";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "num";
const USER_MENU_DATA_ITEM_KEY = "KeyID";
const ALL_MENU_DATA_ITEM_KEY = "KeyID";
const SUB_ITEMS_FIELD: string = "menus";
let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;

const RowRenderForDragging = (properties: any) => {
  const {
    row = "",
    props = "",
    onDrop = "",
    onDragStart = "",
  } = { ...properties };
  const additionalProps = {
    ...props,
    onBlur: () => {
      setTimeout(() => {
        const activeElement = document.activeElement;

        if (activeElement === null) return false;
        if (activeElement.className.indexOf("k-calendar") < 0) {
          props.render();
        }
      });
    },
    onDragStart: (e: any) => onDragStart(e, props.dataItem),
    onDragOver: (e: any) => {
      e.preventDefault();
    },
    onDrop: (e: any) => onDrop(e),
    draggable: true,
  };

  return React.cloneElement(
    row,
    { ...row.props, ...additionalProps },
    row.props.children
  );
};

const Page: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(USER_MENU_DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        use_yn: defaultOption.find((item: any) => item.id === "use_yn")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_COM013,L_BA001,L_BA002,L_HU005,L_SYS1205_1",
    setBizComponentData
  );

  const allMenuColumns: TreeListColumnProps[] = [
    { field: "menu_name", title: "메뉴명", expandable: true },
  ];

  const userMenuColumns: TreeListColumnProps[] = [
    {
      field: "rowstatus",
      title: " ",
      width: "40px",
    },
    {
      field: "menu_name",
      title: "메뉴명",
      expandable: true,
      width: "250px",
    },
    {
      field: "form_view_yn",
      title: "조회 권한",
      width: "100px",
      cell: CheckBoxTreeListCell,
    },
    {
      field: "form_print_yn",
      title: "출력 권한",
      width: "100px",
      cell: CheckBoxTreeListCell,
    },
    {
      field: "form_save_yn",
      title: "저장 권한",
      width: "100px",
      cell: CheckBoxTreeListCell,
    },
    {
      field: "form_delete_yn",
      title: "삭제 권한",
      width: "100px",
      cell: CheckBoxTreeListCell,
    },
  ];

  const [workType, setWorkType] = useState("");
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [userMenuDataResult, setUserMenuDataResult] = useState<any>({
    data: [],
    expanded: ["M2022062210224011070"],
    editItem: undefined,
    editItemField: undefined,
  });
  const [allMenuDataResult, setAllMenuDataResult] = useState<any>({
    data: [],
    expanded: ["M2022062210224011070"],
    editItem: undefined,
    editItemField: undefined,
  });

  //선택 상태
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [userMenuSelectedState, setUserMenuSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [allMenuSelectedState, setAllMenuSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;
    if (value !== null)
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
  let gridRef : any = useRef(null); 

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    user_group_id: "",
    user_group_name: "",
    lang_id: "",
    use_yn: "",
    find_row_value: "",
    find_row_value2: "",
    pgNum: 1,
    isSearch: true,
  });

  const [userMenuFilters, setUserMenuFilters] = useState({
    pgSize: PAGE_SIZE,
    user_group_id: "",
    find_row_value: "",
    isSearch: true,
  });

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

  //그리드 데이터 조회
  const fetchMainGrid = async (filter: any) => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0011W_Q ",
      pageNumber: filter.pgNum,
      pageSize: filter.pgSize,
      parameters: {
        "@p_work_type": filter.work_type,
        "@p_user_group_id": filter.user_group_id,
        "@p_user_group_name": filter.user_group_name,
        "@p_culture_name": filter.lang_id,
        "@p_use_yn": filter.use_yn,
        "@p_find_row_value": filter.find_row_value,
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

      if (filter.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.user_group_id == filter.find_row_value
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
          total: totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filter.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.user_group_id == filter.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });

          setUserMenuFilters((prev) => ({
            ...prev,
            user_group_id: selectedRow.user_group_id,
            isSearch: true,
          }));
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });

          setUserMenuFilters((prev) => ({
            ...prev,
            user_group_id: rows[0].user_group_id,
            isSearch: true,
          }));
        }
      }
    } else {
      console.log("[에러발생]");
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

  const fetchUserMenuGrid = async (userMenuFilter: any) => {
    let data: any;
    setLoading(true);

    const userMenuParameters: Iparameters = {
      procedureName: "P_SY_A0011W_Q ",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_user_group_id": userMenuFilter.user_group_id,
        "@p_user_group_name": filters.user_group_name,
        "@p_culture_name": filters.lang_id,
        "@p_use_yn": filters.use_yn,
        "@p_find_row_value": userMenuFilter.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", userMenuParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          SUB_ITEMS_FIELD
        );

        setUserMenuDataResult({
          ...userMenuDataResult,
          data: dataTree,
        });

        if (totalRowCnt > 0) {
          const selectedRow =
            userMenuFilter.find_row_value == ""
              ? rows[0]
              : rows.find(
                  (row: any) => row.KeyID == userMenuFilter.find_row_value
                );

          setUserMenuSelectedState({
            [selectedRow[USER_MENU_DATA_ITEM_KEY]]: true,
          });
        }
      } else {
        // 앱 메뉴 (최상위 메뉴) 없을 시 데이터 세팅
        // 드래그앤드롭 사용 시 그리드 내 데이터 최소 1개 필요함
        const appMenuRow = [
          {
            KeyID:
              allMenuDataResult.data.length == 0
                ? "M2022062210224011070"
                : allMenuDataResult.data[0].KeyID,
            ParentKeyID: "",
            form_delete_yn: "Y",
            form_id: "",
            form_print_yn: "Y",
            form_save_yn: "Y",
            form_view_yn: "Y",
            menu_name:
              allMenuDataResult.data.length == 0
                ? "PlusWin6"
                : allMenuDataResult.data[0].menu_name,
            path: "",
            row_state: "Q",
            sort_order: 0,
            rowstatus: "N",
          },
        ];

        const appMenuDataTree = createDataTree(
          appMenuRow,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          SUB_ITEMS_FIELD
        );

        setUserMenuDataResult((prev: any) => ({
          ...prev,
          data: appMenuDataTree,
        }));
        setUserMenuSelectedState({
          [appMenuRow[0][USER_MENU_DATA_ITEM_KEY]]: true,
        });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setUserMenuFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchAllMenuGrid = async (filter: any) => {
    let data: any;
    setLoading(true);

    const allMenuParameters: Iparameters = {
      procedureName: "P_SY_A0011W_Q ",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": "ALL",
        "@p_user_group_id": filter.user_group_id,
        "@p_user_group_name": filter.user_group_name,
        "@p_culture_name": filter.lang_id,
        "@p_use_yn": filter.use_yn,
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", allMenuParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          SUB_ITEMS_FIELD
        );

        setAllMenuDataResult({
          ...allMenuDataResult,
          data: dataTree,
        });
        if (totalRowCnt > 0) {
          const selectedRow =
            filter.find_row_value2 == ""
              ? rows[0]
              : rows.find(
                  (row: any) =>
                    row[ALL_MENU_DATA_ITEM_KEY] == filter.find_row_value2
                );

          setAllMenuSelectedState({
            [selectedRow[ALL_MENU_DATA_ITEM_KEY]]: true,
          });
        }
      } else {
        // 앱 메뉴 (최상위 메뉴) 없을 시 데이터 세팅
        // 드래그앤드롭 사용 시 그리드 내 데이터 최소 1개 필요함

        const appMenuData = rows.find((item: any) => item.ParentKeyID === "");

        const appMenuRow = [
          {
            KeyID: appMenuData.KeyID,
            ParentKeyID: appMenuData.ParentKeyID,
            form_delete_yn: "Y",
            form_id: "",
            form_print_yn: "Y",
            form_save_yn: "Y",
            form_view_yn: "Y",
            menu_name: appMenuData.menu_name,
            path: "",
            row_state: "Q",
            sort_order: 0,
            rowstatus: "N",
          },
        ];

        const appMenuDataTree = createDataTree(
          appMenuRow,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          SUB_ITEMS_FIELD
        );

        setAllMenuDataResult((prev: any) => {
          if (prev.length === 0) {
            return { ...prev, data: appMenuDataTree };
          } else {
            return prev;
          }
        });
        setAllMenuSelectedState({
          [appMenuRow[0][ALL_MENU_DATA_ITEM_KEY]]: true,
        });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setLoading(false);
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (filters.isSearch && permissions !== null && bizComponentData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
      fetchAllMenuGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData]);

  useEffect(() => {
    if (
      userMenuFilters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(userMenuFilters);
      setUserMenuFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchUserMenuGrid(deepCopiedFilters);
    }
  }, [userMenuFilters, permissions, bizComponentData]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setMainDataResult(process([], mainDataState));
  };

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

    setUserMenuFilters((prev) => ({
      ...prev,
      user_group_id: selectedRowData.user_group_id,
      isSearch: true,
    }));
  };

  const onUserMenuSelectionChange = useCallback(
    (event: any) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: userMenuSelectedState,
        dataItemKey: USER_MENU_DATA_ITEM_KEY,
      });
      setUserMenuSelectedState(newSelectedState);
    },
    [userMenuSelectedState]
  );

  const onAllMenuSelectionChange = useCallback(
    (event: any) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: allMenuSelectedState,
        dataItemKey: ALL_MENU_DATA_ITEM_KEY,
      });
      setAllMenuSelectedState(newSelectedState);
    },
    [allMenuSelectedState]
  );

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (사용자구분, 직위)
  const [postcdListData, setPostcdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [useYnListData, setUseYnListData] = React.useState<any>([]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );

      const useYnQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_COM013")
      );

      fetchQuery(postcdQueryStr, setPostcdListData);
      fetchQuery(useYnQueryStr, setUseYnListData);
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

  const onAddClick = () => {
    setWorkType("N");
    setDetailWindowVisible(true);
  };

  //삭제 프로시저 초기값
  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    user_group_id: "",
  });

  //삭제 프로시저 파라미터
  const paraDeleted: Iparameters = {
    procedureName: "P_SY_A0011W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_user_group_id": paraDataDeleted.user_group_id,
      "@p_user_group_name": "",
      "@p_memo": "",
      "@p_use_yn": "",
      "@p_userid": userId,
      "@p_pc": pc,
    },
  };

  const onDeleteClick = () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }
    if(mainDataResult.data.length == 0) {
      alert("데이터가 없습니다");
    } else {
      const data = mainDataResult.data.filter(
        (item) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0];
  
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        user_group_id: data.user_group_id,
      }));
    }
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") fetchToDelete();
  }, [paraDataDeleted]);

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const isLastDataDeleted =
        mainDataResult.data.length === 1 && filters.pgNum > 1;
      const findRowIndex = mainDataResult.data.findIndex(
        (row: any) => row.num == Object.getOwnPropertyNames(selectedState)[0]
      );
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
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      } else {
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          find_row_value: 
            mainDataResult.data[findRowIndex == 0 ? 1 : findRowIndex - 1]
              .user_group_id,
          pgNum: isLastDataDeleted ? prev.pgNum - 1 : prev.pgNum,
          isSearch: true,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.user_group_id = "";
  };

  const onSaveClick = () => {
    const flatData: any = treeToFlat(
      userMenuDataResult.data,
      "menu_name",
      SUB_ITEMS_FIELD
    );
    flatData.forEach((item: any) => delete item[SUB_ITEMS_FIELD]);

    const dataItem: { [name: string]: any } = flatData.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    const key = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == key
    );

    try {
      deletedMainRows.forEach((item: any) => {
        const {
          KeyID,
          form_view_yn = "",
          form_print_yn = "",
          form_excel_yn = "",
          form_save_yn = "",
          form_delete_yn = "",
        } = item;

        const para: Iparameters = {
          procedureName: "P_SY_A0011W_S1",
          pageNumber: 1,
          pageSize: 10,
          parameters: {
            "@p_work_type": "D",
            "@p_menu_id": KeyID,
            "@p_user_group_id": selectedRowData.user_group_id,
            "@p_form_view_yn": getYn(form_view_yn),
            "@p_form_print_yn": getYn(form_print_yn),
            "@p_form_excel_yn": getYn(form_excel_yn),
            "@p_form_save_yn": getYn(form_save_yn),
            "@p_form_delete_yn": getYn(form_delete_yn),
            "@p_userid": userId,
            "@p_pc": pc,
          },
        };

        const result = fetchGridSaved(para);
        if (result instanceof Error) throw result;
      });

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus,
          KeyID,
          form_view_yn = "",
          form_print_yn = "",
          form_excel_yn = "",
          form_save_yn = "",
          form_delete_yn = "",
        } = item;

        const para: Iparameters = {
          procedureName: "P_SY_A0011W_S1",
          pageNumber: 1,
          pageSize: 10,
          parameters: {
            "@p_work_type": rowstatus,
            "@p_menu_id": KeyID,
            "@p_user_group_id": selectedRowData.user_group_id,
            "@p_form_view_yn": getYn(form_view_yn),
            "@p_form_print_yn": getYn(form_print_yn),
            "@p_form_excel_yn": getYn(form_excel_yn),
            "@p_form_save_yn": getYn(form_save_yn),
            "@p_form_delete_yn": getYn(form_delete_yn),
            "@p_userid": userId,
            "@p_pc": pc,
          },
        };

        const result = fetchGridSaved(para);
        if (result instanceof Error) throw result;
      });

      resetAllGrid();

      setFilters((prev) => ({
        ...prev,
        find_row_value: selectedRowData.user_group_id,
        isSearch: true,
      }));
      deletedMainRows = [];
    } catch (e) {
      alert(e);
    }
  };

  const fetchGridSaved = async (para: any) => {
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      return new Error("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  const [dragDataItem, setDragDataItem] = useState<any>(null);

  const allMenuRowRender = (tr: any, props: any) => (
    <RowRenderForDragging
      props={props}
      row={tr}
      onDrop={handleAllMenuDrop}
      onDragStart={handleAllMenuDragStart}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  const userMenuRowRender = (tr: any, props: any) => (
    <RowRenderForDragging
      props={props}
      row={tr}
      onDrop={handleUserMenuDrop}
      onDragStart={handleUserMenuDragStart}
      exitEdit={exitEdit}
      editField={EDIT_FIELD}
    />
  );

  // 사용자별 메뉴에서 데이터 삭제
  const handleAllMenuDrop = (e: any) => {
    if (dragDataItem !== null) {
      const flatData: any = treeToFlat(
        userMenuDataResult.data,
        "menu_name",
        SUB_ITEMS_FIELD
      );

      flatData.forEach((item: any) => delete item[SUB_ITEMS_FIELD]);

      const newRowData =
        dragDataItem["ParentKeyID"] === "" // 최상위 항목 선택시 전체 메뉴 삭제
          ? flatData.filter((item: any) => item["ParentKeyID"] === "")
          : flatData.filter((item: any) => {
              if (
                item[USER_MENU_DATA_ITEM_KEY] !==
                  dragDataItem[USER_MENU_DATA_ITEM_KEY] &&
                item["ParentKeyID"] !== dragDataItem[USER_MENU_DATA_ITEM_KEY]
              ) {
                return true;
              } else {
                deletedMainRows.push(item);
                return false;
              }
            });

      const dataTree: any = createDataTree(
        newRowData,
        (i: any) => i.KeyID,
        (i: any) => i.ParentKeyID,
        SUB_ITEMS_FIELD
      );

      setUserMenuDataResult((prev: any) => ({ ...prev, data: dataTree }));
      setUserMenuSelectedState({
        [newRowData[0][USER_MENU_DATA_ITEM_KEY]]: true,
      });
    }
    setDragDataItem(null);
  };
  const handleAllMenuDragStart = (e: any, dataItem: any) => {
    setAllMenuSelectedState({
      [dataItem[ALL_MENU_DATA_ITEM_KEY]]: true,
    });
    setDragDataItem(dataItem);
  };

  // 사용자별 메뉴에 데이터 추가
  const handleUserMenuDrop = (e: any) => {
    if (dragDataItem === null) {
      return false;
    }

    const flatAllMenuData: any = treeToFlat(
      allMenuDataResult.data,
      "menu_name",
      SUB_ITEMS_FIELD
    );

    flatAllMenuData.forEach((item: any) => delete item[SUB_ITEMS_FIELD]);

    let dragDataItemWithChildren: any[] =
      dragDataItem["ParentKeyID"] === "" // 최상위 항목 선택시 전체 메뉴 추가
        ? flatAllMenuData
        : flatAllMenuData.filter(
            (item: any) =>
              item[USER_MENU_DATA_ITEM_KEY] === dragDataItem["ParentKeyID"] ||
              item["ParentKeyID"] === dragDataItem[USER_MENU_DATA_ITEM_KEY] ||
              item[USER_MENU_DATA_ITEM_KEY] ===
                dragDataItem[USER_MENU_DATA_ITEM_KEY]
          );

    dragDataItemWithChildren.forEach((dragDataItem: any) => {
      const newRowData = [
        {
          KeyID: dragDataItem.KeyID,
          ParentKeyID: dragDataItem.ParentKeyID,
          form_delete_yn: "Y",
          form_id: "",
          form_print_yn: "Y",
          form_save_yn: "Y",
          form_view_yn: "Y",
          menu_name: dragDataItem.menu_name,
          path: "",
          row_state: "Q",
          sort_order: 0,
          rowstatus: "N",
        },
      ];

      setUserMenuDataResult((prev: any) => {
        const flatData: any = treeToFlat(
          prev.data,
          "menu_name",
          SUB_ITEMS_FIELD
        );
        flatData.forEach((item: any) => delete item[SUB_ITEMS_FIELD]);

        const sameKeyData = flatData.find(
          (item: any) =>
            item[USER_MENU_DATA_ITEM_KEY] ===
            dragDataItem[USER_MENU_DATA_ITEM_KEY]
        );

        if (sameKeyData) {
          return prev;
        } else {
          return {
            ...prev,
            data: createDataTree(
              [...flatData, ...newRowData],
              (i: any) => i.KeyID,
              (i: any) => i.ParentKeyID,
              SUB_ITEMS_FIELD
            ),
          };
        }
      });
    });

    setUserMenuSelectedState({
      [dragDataItem[USER_MENU_DATA_ITEM_KEY]]: true,
    });

    setDragDataItem(null);
  };

  const handleUserMenuDragStart = (e: any, dataItem: any) => {
    setUserMenuSelectedState({
      [dataItem[ALL_MENU_DATA_ITEM_KEY]]: true,
    });
    setDragDataItem(dataItem);
  };

  const onAllMenuExpandChange = (event: TreeListExpandChangeEvent) => {
    setAllMenuDataResult({
      ...allMenuDataResult,
      expanded: event.value
        ? allMenuDataResult.expanded.filter(
            (id: any) => id !== event.dataItem[ALL_MENU_DATA_ITEM_KEY]
          )
        : [
            ...allMenuDataResult.expanded,
            event.dataItem[ALL_MENU_DATA_ITEM_KEY],
          ],
    });
  };

  const setGroupCode = (group_id: string | undefined) => {
    // 리셋
    resetAllGrid();

    // 메인 조회
    setFilters((prev) => ({
      ...prev,
      find_row_value: group_id == undefined ? "" : group_id,
      isSearch: true,
    }));
  };

  const reloadData = (workType: string, group_id: string | undefined) => {
    if (workType === "U") {
      // 일반조회
      const rows = mainDataResult.data.filter(
        (item) => Object.getOwnPropertyNames(selectedState)[0] == item.num
      );
      setFilters((prev) => ({
        ...prev,
        find_row_value: rows[0].user_group_id,
        isSearch: true,
      }));
    } else {
      setGroupCode(group_id);
    }
  };

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });

      setUserMenuFilters((prev) => ({
        ...prev,
        user_group_id: rowData.user_group_id,
      }));

      setWorkType("U");
      setDetailWindowVisible(true);
    };

    return (
      <>
        {props.rowType === "groupHeader" ? null : (
          <td className="k-command-cell">
            <Button
              className="k-grid-edit-command"
              themeColor={"primary"}
              fillMode="outline"
              onClick={onEditClick}
              icon="edit"
            ></Button>
          </td>
        )}
      </>
    );
  };

  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
    setUserMenuFilters((prev) => ({ ...prev, find_row_value: "" }));
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  let renderers;

  const enterEdit = (dataItem: any, field: string) => {
    setUserMenuDataResult({
      ...userMenuDataResult,
      editItem: { ...dataItem },
      editItemField: field,
    });
  };

  const exitEdit = () => {
    setUserMenuDataResult({
      ...userMenuDataResult,
      editItem: undefined,
      editItemField: undefined,
    });
  };
  renderers = new Renderers(enterEdit, exitEdit, EDIT_FIELD);

  const onUserMenuExpandChange = (event: TreeListExpandChangeEvent) => {
    setUserMenuDataResult({
      ...userMenuDataResult,
      expanded: event.value
        ? userMenuDataResult.expanded.filter(
            (id: any) => id !== event.dataItem[USER_MENU_DATA_ITEM_KEY]
          )
        : [
            ...userMenuDataResult.expanded,
            event.dataItem[USER_MENU_DATA_ITEM_KEY],
          ],
    });
  };

  const onUserMenuItemChange = (event: TreeListItemChangeEvent) => {
    const { field, dataItem, value, level } = event;

    // flat data로 변환
    const flatData: any = treeToFlat(
      userMenuDataResult.data,
      "menu_name",
      SUB_ITEMS_FIELD
    );
    flatData.forEach((item: any) => delete item[SUB_ITEMS_FIELD]);

    // 데이터 업데이트
    const updatedUserMenuData =
      level.length === 1 // 최상위 요소 change 시, 전체 데이터의 rowstatus, field 업데이트
        ? flatData.map((item: any) => ({
            ...item,
            rowstatus: item["rowstatus"] === "N" ? "N" : "U",
            [field!]: value,
          }))
        : flatData.map(
            (
              item: any // 그 외, change 된 데이터의 rowstatus 업데이트
            ) =>
              item[USER_MENU_DATA_ITEM_KEY] ===
              dataItem[USER_MENU_DATA_ITEM_KEY]
                ? { ...item, rowstatus: item["rowstatus"] === "N" ? "N" : "U" }
                : { ...item }
          );

    // tree data로 변환
    const dataTree: any = createDataTree(
      updatedUserMenuData,
      (i: any) => i.KeyID,
      (i: any) => i.ParentKeyID,
      SUB_ITEMS_FIELD
    );

    // 자식 데이터 업데이트
    const newData = modifySubItems(
      dataTree,
      SUB_ITEMS_FIELD,
      (item) =>
        item[USER_MENU_DATA_ITEM_KEY] === dataItem[USER_MENU_DATA_ITEM_KEY],
      (subItems) =>
        subItems.map((subItem) => ({
          ...subItem,
          rowstatus: "U",
          [field!]: value,
        }))
    );

    // 데이터 적용
    setUserMenuDataResult({
      ...userMenuDataResult,
      data: mapTree(newData, SUB_ITEMS_FIELD, (item) =>
        dataItem[USER_MENU_DATA_ITEM_KEY] === item[USER_MENU_DATA_ITEM_KEY]
          ? extendDataItem(item, SUB_ITEMS_FIELD, { [field!]: value })
          : item
      ),
    });
  };
  const { data, expanded, editItem, editItemField } = userMenuDataResult;
  const editItemId = editItem ? editItem[USER_MENU_DATA_ITEM_KEY] : null;
  const editItemId2 = allMenuDataResult.editItem
    ? allMenuDataResult.editItem[ALL_MENU_DATA_ITEM_KEY]
    : null;


  
    const minGridWidth = React.useRef<number>(0);
    const grid = React.useRef<any>(null);
    const [applyMinWidth, setApplyMinWidth] = React.useState(false);
    const [gridCurrent, setGridCurrent] = React.useState(0);
  
    React.useEffect(() => {
      if (customOptionData != null) {
        grid.current = document.getElementById("grdHeaderList");
        window.addEventListener("resize", handleResize);
  
        //가장작은 그리드 이름
        customOptionData.menuCustomColumnOptions["grdHeaderList"].map((item: TColumn) =>
          item.width !== undefined
            ? (minGridWidth.current += item.width)
            : minGridWidth.current 
        );
  
        setGridCurrent(grid.current.offsetWidth-55);
        setApplyMinWidth(grid.current.offsetWidth-55 < minGridWidth.current);
      }
    }, [customOptionData]);
  
    const handleResize = () => {
      if (grid.current.offsetWidth-55 < minGridWidth.current && !applyMinWidth) {
        setApplyMinWidth(true);
      } else if (grid.current.offsetWidth-55 > minGridWidth.current) {
        setGridCurrent(grid.current.offsetWidth-55);
        setApplyMinWidth(false);
      }
    };
  
    const setWidth = (Name: string, minWidth: number | undefined) => {
      if (minWidth == undefined) {
        minWidth = 0;
      }
      let width = applyMinWidth
        ? minWidth
        : minWidth +
          (gridCurrent - minGridWidth.current) /
            customOptionData.menuCustomColumnOptions[Name].length;
  
      return width;
    };

    
  return (
    <>
      <TitleContainer>
        <Title>사용자 그룹</Title>

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
              <th>사용자그룹ID</th>
              <td>
                <Input
                  name="user_group_id"
                  type="text"
                  value={filters.user_group_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자그룹명</th>
              <td>
                <Input
                  name="user_group_name"
                  type="text"
                  value={filters.user_group_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="use_yn"
                    value={filters.use_yn}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="name"
                    valueField="code"
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainerWrap>
        <GridContainer width={`30%`}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>사용자그룹 정보</GridTitle>
              {permissions && (
                <ButtonContainer>
                  <Button
                    onClick={onAddClick}
                    themeColor={"primary"}
                    icon="file-add"
                    disabled={permissions.save ? false : true}
                  >
                    생성
                  </Button>
                  <Button
                    onClick={onDeleteClick}
                    icon="delete"
                    fillMode="outline"
                    themeColor={"primary"}
                    disabled={permissions.delete ? false : true}
                  >
                    삭제
                  </Button>
                </ButtonContainer>
              )}
            </GridTitleContainer>
            <Grid
              style={{ height: "82vh" }}
              data={process(
                mainDataResult.data.map((row, idx) => ({
                  ...row,
                  use_yn: useYnListData.find(
                    (item: any) => item.code === row.use_yn
                  )?.name,
                  postcd: postcdListData.find(
                    (item: any) => item.sub_code === row.postcd
                  )?.code_name,
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
              id="grdHeaderList"
            >
              <GridColumn cell={CommandCell} width="55px" />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdHeaderList"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={setWidth("grdHeaderList", item.width)}
                        footerCell={
                          item.sortOrder === 0 ? mainTotalFooterCell : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </ExcelExport>
        </GridContainer>
        <GridContainer width={`calc(45% - ${GAP}px)`}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>사용자그룹별 메뉴 권한</GridTitle>
              {permissions !== null && (
                <ButtonContainer>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    disabled={permissions.save ? false : true}
                  ></Button>
                </ButtonContainer>
              )}
            </GridTitleContainer>

            <TreeList
              style={{ height: "82vh", overflow: "auto" }}
              data={mapTree(data, SUB_ITEMS_FIELD, (item) =>
                extendDataItem(item, SUB_ITEMS_FIELD, {
                  [EXPANDED_FIELD]: expanded.includes(
                    item[USER_MENU_DATA_ITEM_KEY]
                  ),
                  [EDIT_FIELD]:
                    item[USER_MENU_DATA_ITEM_KEY] === editItemId
                      ? editItemField
                      : undefined,
                  [SELECTED_FIELD]: userMenuSelectedState[idGetter2(item)], //선택된 데이터
                })
              )}
              subItemsField={SUB_ITEMS_FIELD}
              expandField={EXPANDED_FIELD}
              onExpandChange={onUserMenuExpandChange}
              // 수정 기능
              editField={EDIT_FIELD}
              cellRender={renderers.cellRender}
              onItemChange={onUserMenuItemChange}
              // 행 드래그 앤 드롭 기능
              rowRender={userMenuRowRender}
              // 컬럼 리스트
              columns={userMenuColumns}
              // 선택
              selectable={{
                enabled: true,
                drag: false,
                cell: false,
                mode: "single",
              }}
              selectedField={SELECTED_FIELD}
              onSelectionChange={onUserMenuSelectionChange}
            />
          </ExcelExport>
        </GridContainer>
        <GridContainer width={`calc(35% - ${GAP}px)`}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>[참조] 전체 메뉴</GridTitle>
            </GridTitleContainer>
            <TreeList
              style={{ height: "82vh" }}
              data={mapTree(allMenuDataResult.data, SUB_ITEMS_FIELD, (item) =>
                extendDataItem(item, SUB_ITEMS_FIELD, {
                  [EXPANDED_FIELD]: allMenuDataResult.expanded.includes(
                    item[ALL_MENU_DATA_ITEM_KEY]
                  ),
                  [EDIT_FIELD]:
                    item[ALL_MENU_DATA_ITEM_KEY] == editItemId2
                      ? allMenuDataResult.editItemField
                      : undefined,
                  [SELECTED_FIELD]: allMenuSelectedState[idGetter2(item)], //선택된 데이터
                })
              )}
              expandField={EXPANDED_FIELD}
              subItemsField={SUB_ITEMS_FIELD}
              onExpandChange={onAllMenuExpandChange}
              //선택 기능
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                drag: false,
                cell: false,
                mode: "single",
              }}
              onSelectionChange={onAllMenuSelectionChange}
              //드래그용 행
              rowRender={allMenuRowRender}
              columns={allMenuColumns}
            ></TreeList>
          </ExcelExport>
        </GridContainer>
      </GridContainerWrap>
      {detailWindowVisible && (
        <DetailWindow
          setVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          user_group_id={userMenuFilters.user_group_id}
          setGroupId={setGroupCode}
          reloadData={reloadData}
          para={{
            procedureName: "P_SY_A0011W_Q ",
            pageNumber: 1,
            pageSize: 500,
            parameters: {
              "@p_work_type": "DETAIL",
              "@p_user_group_id": userMenuFilters.user_group_id,
              "@p_user_group_name": filters.user_group_name,
              "@p_culture_name": filters.lang_id,
              "@p_use_yn": filters.use_yn,
              "@p_find_row_value": userMenuFilters.find_row_value,
            },
          }}
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

export default Page;
