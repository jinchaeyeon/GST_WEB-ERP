import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  TreeList,
  createDataTree,
  treeToFlat,
  mapTree,
  extendDataItem,
  TreeListExpandChangeEvent,
  TreeListColumnProps,
} from "@progress/kendo-react-treelist";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  FilterBoxWrap,
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
import { Iparameters, TPermissions } from "../store/types";
import {
  chkScrollHandler,
  convertDateToStr,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  //UseMenuDefaults,
} from "../components/CommonFunction";
import {
  CLIENT_WIDTH,
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  GNV_WIDTH,
  GRID_MARGIN,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import { CellRender, RowRender } from "../components/Renderers";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import CheckBoxTreeListCell from "../components/Cells/CheckBoxTreeListCell";
import { tokenState } from "../store/atoms";
import { useRecoilState, useRecoilValue } from "recoil";
import TopButtons from "../components/TopButtons";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "idx";
const USER_MENU_DATA_ITEM_KEY = "KeyID";
const ALL_MENU_DATA_ITEM_KEY = "KeyID";
const expandField: string = "expanded";
const subItemsField: string = "menus";
let deletedMainRows: object[] = [];

const RowRenderForDragging = (properties: any) => {
  const {
    row = "",
    props = "",
    onDrop = "",
    onDragStart = "",
  } = { ...properties };
  const additionalProps = {
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

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 사용자구분, 사업장, 사업부, 부서코드, 직위, 공개범위
  UseBizComponent(
    "L_SYS005,L_BA002,L_BA028,L_dptcd_001,L_HU005,L_BA410",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "user_category"
      ? "L_SYS005"
      : field === "location"
      ? "L_BA002"
      : field === "position"
      ? "L_BA028"
      : field === "dptcd"
      ? "L_dptcd_001"
      : field === "postcd"
      ? "L_HU005"
      : field === "opengb"
      ? "L_BA410"
      : "";

  const fieldName = field === "dptcd" ? "dptnm" : undefined;

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      {...props}
    />
  ) : (
    <td></td>
  );
};
let selectedRowIdx = 0;
const SY_A0120: React.FC = () => {
  const [token] = useRecoilState(tokenState);
  const { userId } = token;
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_SYS005,L_BA001,L_BA002,L_HU005,L_SYS1205_1",
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
    { field: "path", title: "경로", width: "100px" },
  ];

  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [userMenuDataState, setUserMenuDataState] = useState<State>({
    sort: [],
  });
  const [allMenuDataState, setAllMenuDataState] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [userMenuDataResult, setUserMenuDataResult] = useState<any>([]);
  const [allMenuDataResult, setAllMenuDataResult] = useState<any>([]);

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

  //그리드 별 페이지 넘버
  const [mainPgNum, setMainPgNum] = useState(1);

  const [isInitSearch, setIsInitSearch] = useState(false);

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
    work_type: "LIST",
    cboOrgdiv: "01",
    cboLocation: "",
    dptcd: "",
    lang_id: "KOR",
    user_category: "",
    user_id: "",
    user_name: "",
    menu_name: "",
    layout_key: "",
    category: "",
  });

  const [userMenuFilters, setUserMenuFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "DETAIL",
    lang_id: "",
    user_id: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0013W_Q ",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_orgdiv": filters.cboOrgdiv,
      "@p_location": filters.cboLocation,
      "@p_dptcd": filters.dptcd,
      "@p_lang_id": filters.lang_id,
      "@p_user_category": filters.user_category,
      "@p_user_id": filters.user_id,
      "@p_user_name": filters.user_name,
      "@p_menu_name": filters.menu_name,
      "@p_layout_key": filters.layout_key,
      "@p_category": filters.category,
      "@p_service_id": pathname,
    },
  };

  const userMenuParameters: Iparameters = {
    procedureName: "P_SY_A0013W_Q ",
    pageNumber: 1,
    pageSize: 500,
    parameters: {
      "@p_work_type": userMenuFilters.work_type,
      "@p_orgdiv": filters.cboOrgdiv,
      "@p_location": filters.cboLocation,
      "@p_dptcd": filters.dptcd,
      "@p_lang_id": filters.lang_id,
      "@p_user_category": filters.user_category,
      "@p_user_id": userMenuFilters.user_id,
      "@p_user_name": filters.user_name,
      "@p_menu_name": filters.menu_name,
      "@p_layout_key": filters.layout_key,
      "@p_category": filters.category,
      "@p_service_id": pathname,
    },
  };
  const allMenuParameters: Iparameters = {
    procedureName: "P_SY_A0013W_Q ",
    pageNumber: 1,
    pageSize: 500,
    parameters: {
      "@p_work_type": "MENU",
      "@p_orgdiv": filters.cboOrgdiv,
      "@p_location": filters.cboLocation,
      "@p_dptcd": filters.dptcd,
      "@p_lang_id": filters.lang_id,
      "@p_user_category": filters.user_category,
      "@p_user_id": userMenuFilters.user_id,
      "@p_user_name": filters.user_name,
      "@p_menu_name": filters.menu_name,
      "@p_layout_key": filters.layout_key,
      "@p_category": filters.category,
      "@p_service_id": pathname,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions?.view) return;
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  const fetchUserMenuGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", userMenuParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          subItemsField
        );

        setUserMenuDataResult(dataTree);
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }

    fetchAllMenuGrid();
  };

  const fetchAllMenuGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", allMenuParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any, idx: number) => ({
        ...row,
        idx: idx,
      }));

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.KeyID,
          (i: any) => i.ParentKeyID,
          subItemsField
        );

        setAllMenuDataResult(dataTree);

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
          subItemsField
        );

        setUserMenuDataResult((prev: any) => {
          if (prev.length === 0) {
            return appMenuDataTree;
          } else {
            return prev;
          }
        });
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (mainDataResult.total > 0) {
      const firstRowData = mainDataResult.data[selectedRowIdx];
      setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

      selectedRowIdx = 0;
      setUserMenuFilters((prev) => ({
        ...prev,
        user_id: firstRowData.user_id,
      }));
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (bizComponentData !== null && customOptionData !== null) {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainPgNum(1);
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
      user_id: selectedRowData.user_id,
    }));
  };
  const onUserMenuSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: USER_MENU_DATA_ITEM_KEY,
    });

    setUserMenuSelectedState(newSelectedState);
  };

  const onAllMenuSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: ALL_MENU_DATA_ITEM_KEY,
    });

    setAllMenuSelectedState(newSelectedState);
  };

  useEffect(() => {
    if (customOptionData !== null) {
      setUserMenuDataResult([]);
      fetchUserMenuGrid();
    }
  }, [userMenuFilters]);

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onUserMenuDataStateChange = (event: GridDataStateChangeEvent) => {
    setUserMenuDataState(event.dataState);
  };

  const onAllMenuDataStateChange = (event: GridDataStateChangeEvent) => {
    setAllMenuDataState(event.dataState);
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };
  const userMenuTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {userMenuDataResult.total}건
      </td>
    );
  };
  const allMenuTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {allMenuDataResult.total}건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onUserMenuSortChange = (e: any) => {
    setUserMenuDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onAllMenuSortChange = (e: any) => {
    setAllMenuDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //공통코드 리스트 조회 (사용자구분, 직위)
  const [postcdListData, setPostcdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [userCategoryListData, setUserCategoryListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [pathListData, setPathListData] = React.useState<any>([]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );

      const userCategoryQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_SYS005")
      );

      const pathQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SYS1205_1"
        )
      );

      fetchQuery(postcdQueryStr, setPostcdListData);
      fetchQuery(userCategoryQueryStr, setUserCategoryListData);
      fetchQuery(pathQueryStr, setPathListData);
    }
  }, [bizComponentData]);

  const fetchQuery = useCallback(async (queryStr: string, setListData: any) => {
    let data: any;

    let query = {
      query: "query?query=" + encodeURIComponent(queryStr),
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

  // 최초 한번만 실행
  useEffect(() => {
    if (isInitSearch === false && permissions !== null) {
      fetchMainGrid();
      fetchAllMenuGrid();
      setIsInitSearch(true);
    }
  }, [filters, permissions]);

  //공통코드 리스트 조회 후 그리드 데이터 세팅
  // useEffect(() => {
  //   setMainDataResult((prev) => {
  //     const rows = prev.data.map((row: any) => ({
  //       ...row,
  //       itemlvl1: itemlvl1ListData.find(
  //         (item: any) => item.sub_code === row.itemlvl1
  //       )?.code_name,
  //     }));

  //     return {
  //       data: [...rows],
  //       total: prev.total,
  //     };
  //   });
  // }, [itemlvl1ListData]);

  // useEffect(() => {
  //   setMainDataResult((prev) => {
  //     const rows = prev.data.map((row: any) => ({
  //       ...row,
  //       itemlvl2: itemlvl2ListData.find(
  //         (item: any) => item.sub_code === row.itemlvl2
  //       )?.code_name,
  //     }));

  //     return {
  //       data: [...rows],
  //       total: prev.total,
  //     };
  //   });
  // }, [itemlvl2ListData]);

  // useEffect(() => {
  //   setMainDataResult((prev) => {
  //     const rows = prev.data.map((row: any) => ({
  //       ...row,
  //       itemlvl3: itemlvl3ListData.find(
  //         (item: any) => item.sub_code === row.itemlvl3
  //       )?.code_name,
  //     }));

  //     return {
  //       data: [...rows],
  //       total: prev.total,
  //     };
  //   });
  // }, [itemlvl3ListData]);

  // useEffect(() => {
  //   setMainDataResult((prev) => {
  //     const rows = prev.data.map((row: any) => ({
  //       ...row,
  //       itemgrade: itemgradeListData.find(
  //         (item: any) => item.sub_code === row.itemgrade
  //       )?.code_name,
  //     }));

  //     return {
  //       data: [...rows],
  //       total: prev.total,
  //     };
  //   });
  // }, [itemgradeListData]);

  const onAddClick = () => {
    let seq = 1;

    if (mainDataResult.total > 0) {
      mainDataResult.data.forEach((item) => {
        if (item[DATA_ITEM_KEY] > seq) {
          seq = item[DATA_ITEM_KEY];
        }
      });
      seq++;
    }

    const idx: number =
      Number(Object.getOwnPropertyNames(selectedState)[0]) ??
      //Number(planDataResult.data[0].idx) ??
      null;
    if (idx === null) return false;
    const selectedRowData = mainDataResult.data.find(
      (item) => item.idx === idx
    );

    const newDataItem = {
      [DATA_ITEM_KEY]: seq,
      // planno: selectedRowData.planno,
      // planseq: selectedRowData.planseq,
      // proccd: selectedRowData.proccd,
      apply_start_date: convertDateToStr(new Date()),
      apply_end_date: "19991231",
      birdt: "19991231",
      rowstatus: "N",
    };
    setMainDataResult((prev) => {
      return {
        data: [...prev.data, newDataItem],
        total: prev.total,
      };
    });
  };

  const onRemoveClick = () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    let newData: any[] = [];

    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        deletedMainRows.push(item);
      }
    });

    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));

    //선택 상태 초기화
    setSelectedState({});
  };

  const onSaveClick = () => {
    const flatData: any = treeToFlat(
      userMenuDataResult,
      "menu_name",
      subItemsField
    );
    flatData.forEach((item: any) => delete item[subItemsField]);

    const dataItem: { [name: string]: any } = flatData.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;

    type TData = {
      row_state_s: string[];
      add_delete_type_s: string[];
      menu_id_s: string[];
      form_view_yn_s: string[];
      form_print_yn_s: string[];
      form_save_yn_s: string[];
      form_delete_yn_s: string[];
    };

    let dataArr: TData = {
      row_state_s: [],
      add_delete_type_s: [],
      menu_id_s: [],
      form_view_yn_s: [],
      form_print_yn_s: [],
      form_save_yn_s: [],
      form_delete_yn_s: [],
    };

    deletedMainRows.forEach((item: any) => {
      const {
        add_delete_type_s,
        KeyID,
        form_view_yn,
        form_print_yn,
        form_save_yn,
        form_delete_yn,
      } = item;

      dataArr.row_state_s.push("D");
      dataArr.add_delete_type_s.push(add_delete_type_s);
      dataArr.menu_id_s.push(KeyID);
      dataArr.form_view_yn_s.push(form_view_yn);
      dataArr.form_print_yn_s.push(form_print_yn);
      dataArr.form_save_yn_s.push(form_save_yn);
      dataArr.form_delete_yn_s.push(form_delete_yn);
    });

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus,
        add_delete_type_s,
        KeyID,
        form_view_yn,
        form_print_yn,
        form_save_yn,
        form_delete_yn,
      } = item;

      dataArr.row_state_s.push(rowstatus);
      dataArr.add_delete_type_s.push(add_delete_type_s);
      dataArr.menu_id_s.push(KeyID);
      dataArr.form_view_yn_s.push(form_view_yn);
      dataArr.form_print_yn_s.push(form_print_yn);
      dataArr.form_save_yn_s.push(form_save_yn);
      dataArr.form_delete_yn_s.push(form_delete_yn);
    });

    const key = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item["idx"] === Number(key)
    );

    selectedRowIdx = mainDataResult.data.findIndex(
      (item) => item["idx"] === Number(key)
    );

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "U",
      user_id_s: selectedRowData.user_id,
      row_state_s: dataArr.row_state_s.join("|"),
      add_delete_type_s: dataArr.add_delete_type_s.join("|"),
      menu_id_s: dataArr.menu_id_s.join("|"),
      form_view_yn_s: dataArr.form_view_yn_s.join("|"),
      form_print_yn_s: dataArr.form_print_yn_s.join("|"),
      form_save_yn_s: dataArr.form_save_yn_s.join("|"),
      form_delete_yn_s: dataArr.form_delete_yn_s.join("|"),
    }));
  };

  //계획 저장 파라미터 초기값
  const [paraDataSaved, setParaDataSaved] = useState({
    work_type: "",
    orgdiv: "01",
    chk_yn_s: "",
    user_group_id_s: "",
    user_id_s: "",
    target_user_s: "",
    row_state_s: "",
    add_delete_type_s: "",
    menu_id_s: "",
    form_view_yn_s: "",
    form_print_yn_s: "",
    form_save_yn_s: "",
    form_delete_yn_s: "",
    layout_key: "",
    category: "",
    userid: userId,
    pc: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "P_SY_A0013W_S ",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraDataSaved.work_type,
      "@p_orgdiv": paraDataSaved.orgdiv,
      "@p_chk_yn_s": paraDataSaved.chk_yn_s,
      "@p_user_group_id_s": paraDataSaved.user_group_id_s,
      "@p_user_id_s": paraDataSaved.user_id_s,
      "@p_target_user_s": paraDataSaved.target_user_s,
      "@p_row_state_s": paraDataSaved.row_state_s,
      "@p_add_delete_type_s": paraDataSaved.add_delete_type_s,
      "@p_menu_id_s": paraDataSaved.menu_id_s,
      "@p_form_view_yn_s": paraDataSaved.form_view_yn_s,
      "@p_form_print_yn_s": paraDataSaved.form_print_yn_s,
      "@p_form_save_yn_s": paraDataSaved.form_save_yn_s,
      "@p_form_delete_yn_s": paraDataSaved.form_delete_yn_s,
      "@p_layout_key": paraDataSaved.layout_key,
      "@p_category": paraDataSaved.category,
      "@p_userid": paraDataSaved.userid,
      "@p_pc": paraDataSaved.pc,
    },
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert(findMessage(messagesData, "SY_A0013W_001"));

      resetAllGrid();
      fetchMainGrid();
      deletedMainRows = [];
    } else {
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  useEffect(() => {
    if (paraDataSaved.work_type !== "") fetchGridSaved();
  }, [paraDataSaved]);

  const onUserMenuItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      userMenuDataResult,
      setUserMenuDataResult,
      USER_MENU_DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    // const dataTree: any = createDataTree(
    //   rows,
    //   (i: any) => i.KeyID,
    //   (i: any) => i.ParentKeyID,
    //   subItemsField
    // );

    //setAllMenuDataResult(dataTree);

    const newData = userMenuDataResult.map((item: any) =>
      item[USER_MENU_DATA_ITEM_KEY] === dataItem[USER_MENU_DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : { ...item, [EDIT_FIELD]: undefined }
    );

    setUserMenuDataResult((prev: any) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit = () => {
    const newData = userMenuDataResult.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setUserMenuDataResult((prev: any) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
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

  const [dragDataItem, setDragDataItem] = useState<any>(null);

  const allMenuRowRender = (tr: any, props: any) => (
    <RowRenderForDragging
      props={props}
      row={tr}
      onDrop={handleAllMenuDrop}
      onDragStart={handleAllMenuDragStart}
    />
  );

  const userMenuRowRender = (tr: any, props: any) => (
    <RowRenderForDragging
      props={props}
      row={tr}
      onDrop={handleUserMenuDrop}
      onDragStart={handleUserMenuDragStart}
    />
  );

  // 사용자별 메뉴에서 데이터 삭제
  const handleAllMenuDrop = (e: any) => {
    if (dragDataItem !== null) {
      const flatData: any = treeToFlat(
        userMenuDataResult,
        "menu_name",
        subItemsField
      );

      flatData.forEach((item: any) => delete item[subItemsField]);

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
        subItemsField
      );

      setUserMenuDataResult(dataTree);
    }

    setDragDataItem(null);
  };
  const handleAllMenuDragStart = (e: any, dataItem: any) => {
    setDragDataItem(dataItem);
  };

  // 사용자별 메뉴에 데이터 추가
  const handleUserMenuDrop = (e: any) => {
    if (dragDataItem === null) {
      return false;
    }

    const flatAllMenuData: any = treeToFlat(
      allMenuDataResult,
      "menu_name",
      subItemsField
    );

    flatAllMenuData.forEach((item: any) => delete item[subItemsField]);

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
        const flatData: any = treeToFlat(prev, "menu_name", subItemsField);
        flatData.forEach((item: any) => delete item[subItemsField]);

        const sameKeyData = flatData.find(
          (item: any) =>
            item[USER_MENU_DATA_ITEM_KEY] ===
            dragDataItem[USER_MENU_DATA_ITEM_KEY]
        );

        if (sameKeyData) {
          return prev;
        } else {
          return createDataTree(
            [...flatData, ...newRowData],
            (i: any) => i.KeyID,
            (i: any) => i.ParentKeyID,
            subItemsField
          );
        }
      });
    });

    setDragDataItem(null);
  };

  const handleUserMenuDragStart = (e: any, dataItem: any) => {
    setDragDataItem(dataItem);
  };
  const [allMenuExpanded, setAllMenuExpanded] = React.useState<string[]>([
    "M2022062210224011070",
  ]);
  const [userMenuExpanded, setUserMenuExpanded] = React.useState<string[]>([
    "M2022062210224011070",
  ]);

  const onAllMenuExpandChange = (e: TreeListExpandChangeEvent) => {
    setAllMenuExpanded(
      e.value
        ? allMenuExpanded.filter(
            (id) => id !== e.dataItem[ALL_MENU_DATA_ITEM_KEY]
          )
        : [...allMenuExpanded, e.dataItem[ALL_MENU_DATA_ITEM_KEY]]
    );
  };

  const allMenuCallback = (item: any) =>
    allMenuExpanded.includes(item[ALL_MENU_DATA_ITEM_KEY])
      ? extendDataItem(item, subItemsField, { [expandField]: true })
      : item;

  const onUserMenuExpandChange = (e: TreeListExpandChangeEvent) => {
    setUserMenuExpanded(
      e.value
        ? userMenuExpanded.filter(
            (id) => id !== e.dataItem[USER_MENU_DATA_ITEM_KEY]
          )
        : [...userMenuExpanded, e.dataItem[USER_MENU_DATA_ITEM_KEY]]
    );
  };

  const userMenuCallback = (item: any) =>
    userMenuExpanded.includes(item[USER_MENU_DATA_ITEM_KEY])
      ? extendDataItem(item, subItemsField, { [expandField]: true })
      : item;

  const search = () => {
    resetAllGrid();
    fetchMainGrid();
    fetchAllMenuGrid();
  };
  return (
    <>
      <TitleContainer>
        <Title>사용자 권한</Title>

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
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>회사구분</th>
              <td>
                {/* {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="cboOrgdiv"
                    value={filters.cboOrgdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )} */}

                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboOrgdiv"
                    value={filters.cboOrgdiv}
                    bizComponentId="L_BA001"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cboLocation"
                    value={filters.cboLocation}
                    bizComponentId="L_BA002"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>부서코드</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    bizComponentId="L_dptcd_001"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>사용자명ID</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={filters.user_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자명</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자구분</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="user_category"
                    value={filters.user_category}
                    bizComponentId="L_SYS005"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterBoxWrap>

      <GridContainerWrap>
        <GridContainer width={"500px"}>
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>사용자 리스트</GridTitle>
            </GridTitleContainer>
            <Grid
              style={{ height: "650px" }}
              data={process(
                mainDataResult.data.map((row, idx) => ({
                  ...row,
                  user_category: userCategoryListData.find(
                    (item: any) => item.sub_code === row.user_category
                  )?.code_name,
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
              onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="rowstatus"
                title=" "
                width="40px"
                editable={false}
              />

              <GridColumn
                field={"user_id"}
                title={"사용자ID"}
                width={"100px"}
                //cell={numberField.includes(item.id) ? NumberCell : ""}
                footerCell={mainTotalFooterCell}
              />
              <GridColumn
                field={"user_name"}
                title={"사용자명"}
                width={"150px"}
              />
              <GridColumn
                field={"user_category"}
                title={"사용자구분"}
                width={"110px"}
              />
              <GridColumn field={"postcd"} title={"직위"} width={"150px"} />
            </Grid>
          </ExcelExport>
        </GridContainer>
        <GridContainer
          width={CLIENT_WIDTH - GNV_WIDTH - GRID_MARGIN - 15 - 500 - 300 + "px"}
        >
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>사용자별 메뉴 권한</GridTitle>

              {permissions && (
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
              style={{ height: "650px", overflow: "auto" }}
              data={mapTree(
                userMenuDataResult,
                subItemsField,
                userMenuCallback
              )}
              expandField={expandField}
              subItemsField={subItemsField}
              onExpandChange={onUserMenuExpandChange}
              //선택 기능
              dataItemKey={USER_MENU_DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              //드래그용 행
              rowRender={userMenuRowRender}
              columns={userMenuColumns}
            ></TreeList>
            {/* <Grid
              style={{ height: "650px" }}
              data={process(
                userMenuDataResult.data.map((row, idx) => ({
                  ...row,
                  path: pathListData.find((item: any) => item.code === row.path)
                    ?.name,
                  [SELECTED_FIELD]: userMenuSelectedState[idGetter(row)], //선택된 데이터
                })),
                userMenuDataState
              )}
              {...userMenuDataState}
              onDataStateChange={onUserMenuDataStateChange}
              //선택 기능
              dataItemKey={USER_MENU_DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onUserMenuSelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={userMenuDataResult.total}
              //onScroll={onMainScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onUserMenuSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              //incell 수정 기능
              onItemChange={onUserMenuItemChange}
              cellRender={customCellRender}
              //rowRender={customRowRender}
              rowRender={userMenuRowRender}
              editField={EDIT_FIELD}
            >
              <GridColumn
                field="rowstatus"
                title=" "
                width="40px"
                editable={false}
              />

              <GridColumn
                field={"menu_name"}
                title={"메뉴명"}
                width={"250px"}
                footerCell={userMenuTotalFooterCell}
                editable={false}
              />
              <GridColumn
                field={"form_view_yn"}
                title={"조회 권한"}
                width={"100px"}
                cell={CheckBoxCell}
              />
              <GridColumn
                field={"form_print_yn"}
                title={"출력 권한"}
                width={"100px"}
                cell={CheckBoxCell}
              />
              <GridColumn
                field={"form_save_yn"}
                title={"저장 권한"}
                width={"100px"}
                cell={CheckBoxCell}
              />
              <GridColumn
                field={"form_delete_yn"}
                title={"삭제 권한"}
                width={"100px"}
                cell={CheckBoxCell}
              />
              <GridColumn
                field={"path"}
                title={"경로"}
                width={"100px"}
                editable={false}
              />
            </Grid> */}
          </ExcelExport>
        </GridContainer>
        <GridContainer width={"300px"}>
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
              style={{ height: "650px", overflow: "auto" }}
              data={mapTree(allMenuDataResult, subItemsField, allMenuCallback)}
              expandField={expandField}
              subItemsField={subItemsField}
              onExpandChange={onAllMenuExpandChange}
              //선택 기능
              dataItemKey={ALL_MENU_DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              //드래그용 행
              rowRender={allMenuRowRender}
              columns={allMenuColumns}
            ></TreeList>
            {/* <Grid
              style={{ height: "650px" }}
              data={process(
                allMenuDataResult.data.map((row, idx) => ({
                  ...row,
                  user_category: userCategoryListData.find(
                    (item: any) => item.sub_code === row.user_category
                  )?.code_name,
                  postcd: postcdListData.find(
                    (item: any) => item.sub_code === row.postcd
                  )?.code_name,
                  [SELECTED_FIELD]: allMenuSelectedState[idGetter(row)], //선택된 데이터
                })),
                allMenuDataState
              )}
              {...allMenuDataState}
              onDataStateChange={onAllMenuDataStateChange}
              //선택 기능
              dataItemKey={ALL_MENU_DATA_ITEM_KEY}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onAllMenuSelectionChange}
              //스크롤 조회 기능
              fixedScroll={true}
              total={allMenuDataResult.total}
              //nScroll={onAllMenuScrollHandler}
              //정렬기능
              sortable={true}
              onSortChange={onAllMenuSortChange}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              //드래그용 행
              rowRender={allMenuRowRender}
            >
              <GridColumn
                field={"menu_name"}
                title={"메뉴명"}
                // width={"150px"}
                footerCell={allMenuTotalFooterCell}
              />
            </Grid> */}
          </ExcelExport>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};

export default SY_A0120;
