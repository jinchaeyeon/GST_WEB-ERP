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
import { DatePicker } from "@progress/kendo-react-dateinputs";
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
import { Iparameters } from "../store/types";
import {
  checkIsDDLValid,
  chkScrollHandler,
  convertDateToStr,
  dateformat,
  getGridItemChangedData,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCommonQuery,
  UseCustomOption,
  //UseMenuDefaults,
} from "../components/CommonFunction";
import {
  clientWidth,
  commonCodeDefaultValue,
  EDIT_FIELD,
  gnvWidth,
  gridMargin,
  itemgradeQuery,
  itemlvl1Query,
  itemlvl2Query,
  itemlvl3Query,
  pageSize,
  SELECTED_FIELD,
} from "../components/CommonString";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import CommonRadioGroup from "../components/CommonRadioGroup";
import { CellRender, RowRender } from "../components/Renderers";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import EncryptedCell from "../components/Cells/EncryptedCell";
import { sha256 } from "js-sha256";
import CheckBoxTreeListCell from "../components/Cells/CheckBoxTreeListCell";
import { tokenState } from "../store/atoms";
import { useRecoilState } from "recoil";
import { flatVisibleChildren } from "@progress/kendo-react-layout";
import DetailWindow from "../components/Windows/SY_A0011W_Window";

//그리드 별 키 필드값
const DATA_ITEM_KEY = "user_group_id";
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
    ...props,
    onBlur: () => {
      setTimeout(() => {
        const activeElement = document.activeElement;

        if (activeElement === null) return false;
        if (activeElement.className.indexOf("k-calendar") < 0) {
          props.exitEdit();
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

let selectedRowIdx = 0;
const SY_A0120: React.FC = () => {
  const [token] = useRecoilState(tokenState);
  const { userId } = token;
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001,L_COM013,L_BA001,L_BA002,L_HU005,L_SYS1205_1",
    setBizComponentData
  );

  const allMenuColumns: TreeListColumnProps[] = [
    { field: "menu_name", title: "메뉴명", expandable: true },
  ];

  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);
  const [willSearch, setWillSearch] = useState(false);

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

  const [workType, setWorkType] = useState("");
  const [detailWindowVisible, setDetailWindowVisible] =
    useState<boolean>(false);

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
    pgSize: pageSize,
    work_type: "LIST",
    user_group_id: "",
    user_group_name: "",
    lang_id: "",
    use_yn: "",
  });

  const [userMenuFilters, setUserMenuFilters] = useState({
    pgSize: pageSize,
    user_group_id: "",
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_SY_A0011W_Q ",
    pageNumber: mainPgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.work_type,
      "@p_user_group_id": filters.user_group_id,
      "@p_user_group_name": filters.user_group_name,
      "@p_lang_id": filters.lang_id,
      "@p_use_yn": filters.use_yn,
    },
  };

  const userMenuParameters: Iparameters = {
    procedureName: "P_SY_A0011W_Q ",
    pageNumber: 1,
    pageSize: 500,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_user_group_id": userMenuFilters.user_group_id,
      "@p_user_group_name": filters.user_group_name,
      "@p_lang_id": filters.lang_id,
      "@p_use_yn": filters.use_yn,
    },
  };

  const allMenuParameters: Iparameters = {
    procedureName: "P_SY_A0011W_Q ",
    pageNumber: 1,
    pageSize: 500,
    parameters: {
      "@p_work_type": "ALL",
      "@p_user_group_id": filters.user_group_id,
      "@p_user_group_name": filters.user_group_name,
      "@p_lang_id": filters.lang_id,
      "@p_use_yn": filters.use_yn,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
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

      if (totalRowCnt > 0) {
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
      }
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
        user_group_id: firstRowData.user_group_id,
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
      user_group_id: selectedRowData.user_group_id,
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
    if (chkScrollHandler(event, mainPgNum, pageSize))
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
    commonCodeDefaultValue,
  ]);

  const [useYnListData, setUseYnListData] = React.useState<any>([]);

  const [pathListData, setPathListData] = React.useState<any>([]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );

      const useYnQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_COM013")
      );

      const pathQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_SYS1205_1"
        )
      );

      fetchQuery(postcdQueryStr, setPostcdListData);
      fetchQuery(useYnQueryStr, setUseYnListData);
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
    if (isInitSearch === false) {
      fetchMainGrid();
      fetchAllMenuGrid();
      setIsInitSearch(true);
    }
  }, [filters]);

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
      "@p_userid": "",
      "@p_pc": "",
    },
  };

  const onDeleteClick = () => {
    if (!window.confirm("삭제하시겠습니까?")) {
      return false;
    }

    const user_group_id = Object.getOwnPropertyNames(selectedState)[0];

    setParaDataDeleted((prev) => ({
      ...prev,
      work_type: "D",
      user_group_id: user_group_id,
    }));
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
      alert("삭제가 완료되었습니다.");

      resetAllGrid();
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted[DATA_ITEM_KEY] = "";
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

    //검증
    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        // mainDataResult.data.forEach((chkItem: any) => {
        //   if (
        //     (item.proccd === chkItem.proccd ||
        //       item.procseq === chkItem.procseq) &&
        //     item[PLAN_DATA_ITEM_KEY] !== chkItem[PLAN_DATA_ITEM_KEY] &&
        //     item.planno === chkItem.planno
        //   ) {
        //     throw공정과 공정순서를 확인하세요."; //   }
        // });
        // if (!item.user_id) {
        //   throw "사용자ID을 입력하세요.";
        // }
        // if (!item.user_name) {
        //   throw "사용자명을 입력하세요.";
        // }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const key = Object.getOwnPropertyNames(selectedState)[0];

    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] === key
    );

    selectedRowIdx = mainDataResult.data.findIndex(
      (item) => item[DATA_ITEM_KEY] === key
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
            "@p_form_view_yn": form_view_yn,
            "@p_form_print_yn": form_print_yn,
            "@p_form_excel_yn": form_excel_yn,
            "@p_form_save_yn": form_save_yn,
            "@p_form_delete_yn": form_delete_yn,
            "@p_userid": userId,
            "@p_pc": "",
          },
        };

        const result = fetchGridSaved(para);
        if (result instanceof Error) throw result;
      });

      console.log(dataItem);
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
            "@p_form_view_yn": form_view_yn,
            "@p_form_print_yn": form_print_yn,
            "@p_form_excel_yn": form_excel_yn,
            "@p_form_save_yn": form_save_yn,
            "@p_form_delete_yn": form_delete_yn,
            "@p_userid": userId,
            "@p_pc": "",
          },
        };

        const result = fetchGridSaved(para);
        console.log(result);
        console.log(result instanceof Error);
        if (result instanceof Error) throw result;
      });

      alert("저장이 완료되었습니다.");

      resetAllGrid();
      fetchMainGrid();
      deletedMainRows = [];
    } catch (e) {
      alert(e);
    }
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

  const fetchGridSaved = async (para: any) => {
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    console.log("data");
    console.log(data);
    // if (data.isSuccess === true) {
    //   alert("저장이 완료되었습니다.");

    //   resetAllGrid();
    //   fetchMainGrid();
    //   deletedMainRows = [];
    // } else {
    //   alert(
    //     "[" +
    //       data.statusCode +
    //       "] " +
    //       data.resultMessage
    //   );
    // }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      return new Error("[" + data.statusCode + "] " + data.resultMessage);
    }
  };

  // useEffect(() => {
  //   if (paraDataSaved.work_type !== "") fetchGridSaved();
  // }, [paraDataSaved]);

  const onUserMenuItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      userMenuDataResult,
      setUserMenuDataResult,
      USER_MENU_DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    const flatData: any = treeToFlat(
      userMenuDataResult,
      "menu_name",
      subItemsField
    );

    flatData.forEach((item: any) => delete item[subItemsField]);

    const newData = flatData.map((item: any) =>
      item[USER_MENU_DATA_ITEM_KEY] === dataItem[USER_MENU_DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : { ...item, [EDIT_FIELD]: undefined }
    );

    const dataTree: any = createDataTree(
      newData,
      (i: any) => i.KeyID,
      (i: any) => i.ParentKeyID,
      subItemsField
    );

    setUserMenuDataResult(dataTree);
  };

  const exitEdit = () => {
    const flatData: any = treeToFlat(
      userMenuDataResult,
      "menu_name",
      subItemsField
    );

    flatData.forEach((item: any) => delete item[subItemsField]);

    const newData = flatData.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    const dataTree: any = createDataTree(
      newData,
      (i: any) => i.KeyID,
      (i: any) => i.ParentKeyID,
      subItemsField
    );

    setUserMenuDataResult(dataTree);
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

  const setGroupCode = (group_code: string) => {
    setFilters((prev) => ({ ...prev, group_code }));
    setWillSearch(true);
  };

  const reloadData = (workType: string) => {
    //수정한 경우 행선택 유지, 신규건은 첫번째 행 선택
    if (workType === "U") {
      setIfSelectFirstRow(false);
    } else {
      setIfSelectFirstRow(true);
    }

    resetAllGrid();
    fetchMainGrid();
    //fetchDetailGrid();
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

  return (
    <>
      <TitleContainer>
        <Title>사용자 그룹</Title>

        <ButtonContainer>
          <Button
            onClick={() => {
              resetAllGrid();
              fetchMainGrid();
              fetchAllMenuGrid();
            }}
            icon="search"
            //fillMode="outline"
            themeColor={"primary"}
          >
            조회
          </Button>
          <Button
            title="Export Excel"
            onClick={exportExcel}
            icon="download"
            fillMode="outline"
            themeColor={"primary"}
          >
            Excel
          </Button>
        </ButtonContainer>
      </TitleContainer>
      <FilterBoxWrap>
        <FilterBox>
          <tbody>
            <tr>
              <th>사용자그룹ID</th>
              <td>
                <Input
                  name="user_id"
                  type="text"
                  value={filters.user_group_id}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자그룹명</th>
              <td>
                <Input
                  name="user_name"
                  type="text"
                  value={filters.user_group_name}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용자구분</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="use_yn"
                    value={filters.use_yn}
                    bizComponentId="L_COM013"
                    bizComponentData={bizComponentData}
                    changeData={filterComboBoxChange}
                    textField="name"
                    valueField="code"
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
              <GridTitle>사용자그룹 정보</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="file-add"
                >
                  생성
                </Button>
                <Button
                  onClick={onDeleteClick}
                  icon="delete"
                  fillMode="outline"
                  themeColor={"primary"}
                >
                  삭제
                </Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "650px" }}
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

              <GridColumn cell={CommandCell} width="55px" />
              <GridColumn
                field={"user_group_id"}
                title={"사용자그룹ID"}
                width={"100px"}
                //cell={numberField.includes(item.id) ? NumberCell : ""}
                footerCell={mainTotalFooterCell}
              />
              <GridColumn
                field={"user_group_name"}
                title={"사용자그룹명"}
                width={"150px"}
              />
              <GridColumn field={"use_yn"} title={"사용유무"} width={"110px"} />
            </Grid>
          </ExcelExport>
        </GridContainer>
        <GridContainer
          width={clientWidth - gnvWidth - gridMargin - 15 - 500 - 300 + "px"}
        >
          <ExcelExport
            data={mainDataResult.data}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <GridTitleContainer>
              <GridTitle>사용자그룹별 메뉴 권한</GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onSaveClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>

            <TreeList
              style={{ height: "650px" }}
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
              cellRender={customCellRender}
              //rowRender={customRowRender}
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
              style={{ height: "650px" }}
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
      {detailWindowVisible && (
        <DetailWindow
          getVisible={setDetailWindowVisible}
          workType={workType} //신규 : N, 수정 : U
          user_group_id={userMenuFilters.user_group_id}
          setGroupId={setGroupCode}
          reloadData={reloadData}
          para={userMenuParameters}
        />
      )}
    </>
  );
};

export default SY_A0120;
