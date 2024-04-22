import {
  DataResult,
  FilterDescriptor,
  SortDescriptor,
  State,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  TreeList,
  TreeListColumnProps,
  TreeListExpandChangeEvent,
  createDataTree,
  extendDataItem,
  mapTree,
  treeToFlat,
} from "@progress/kendo-react-treelist";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CheckBoxTreeListCell from "../components/Cells/CheckBoxTreeListCell";
import BizComponentComboBox from "../components/ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  UsePermissions,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  EXPANDED_FIELD,
  GAP,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import DepartmentsWindow from "../components/Windows/CommonWindows/DepartmentsWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { gridList } from "../store/columns/SY_A0125W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

var index = 0;

const allMenuColumns: TreeListColumnProps[] = [
  { field: "dptcd", title: "부서코드", expandable: true },
  { field: "dptnm", title: "부서명", expandable: false },
  {
    field: "useyn",
    title: "사용여부",
    expandable: false,
    cell: CheckBoxTreeListCell,
  },
  { field: "remark", title: "비고", expandable: false },
];

export interface dpt {
  dptcd: string;
  dptnm: string;
  location: string;
  mfcsaldv: string;
  orgdiv: string;
  prntdptcd: string;
  prntdptnm: string;
  refdptcd: string;
  remark: string;
  useyn: string;
}

export interface DataState {
  sort: SortDescriptor[];
  filter: FilterDescriptor[];
}

const SUB_DATA_ITEM_KEY = "user_id";
const SUB_ITEMS_FIELD: string = "menus";
const ALL_MENU_DATA_ITEM_KEY = "dptcd";
let targetRowIndex: null | number = null;

const SY_A0125W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(ALL_MENU_DATA_ITEM_KEY);
  const idGetter2 = getter(SUB_DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [departmentWindowVisible, setDepartmentWindowVisible] =
    useState<boolean>(false);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("SY_A0125W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SY_A0125W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA002,R_USEYN,L_HU005, L_dptcd_001",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [dptcdListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      const dtpcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      fetchQuery(dtpcdQueryStr, setDptcdListData);
      fetchQuery(postcdQueryStr, setpostcdListData);
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

  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    process([], subDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [allMenuDataResult, setAllMenuDataResult] = useState<any>({
    data: [],
    expanded: [],
    editItem: undefined,
    editItemField: undefined,
  });

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [selectedsubDataState, setSelectedsubDataState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setsubFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  let gridRef: any = useRef(null);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "useyn") {
      if (value == false || value == "N") {
        setInfomation((prev) => ({
          ...prev,
          [name]: "N",
        }));
      } else {
        setInfomation((prev) => ({
          ...prev,
          [name]: "Y",
        }));
      }
    } else if (name == "prntdptcd") {
      const values = dptcdListData.find(
        (item: any) => item.dptcd == value
      )?.dptnm;

      setInfomation((prev) => ({
        ...prev,
        prntdptcd: value,
        prntdptnm: values == undefined ? "" : values,
      }));
    } else {
      setInfomation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInfomation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setDepartmentData = (data: IDepartmentData) => {
    setInfomation((prev) => ({
      ...prev,
      prntdptcd: data.dptcd,
      prntdptnm: data.dptnm,
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

  const [infomation, setInfomation] = useState({
    pgSize: PAGE_SIZE,
    workType: "U",
    orgdiv: "01",
    dptcd: "",
    dptnm: "",
    insert_form_id: "",
    insert_pc: "",
    insert_time: "",
    insert_user_id: "",
    last_update_time: "",
    location: "",
    mfcsaldv: "1",
    prntdptcd: "",
    prntdptnm: "",
    refdptcd: "",
    remark: "",
    update_form_id: "",
    update_pc: "",
    update_time: "",
    update_userid: "",
    useyn: "Y",
  });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: "01",
    location: "",
    dptcd: "",
    dptnm: "",
    user_name: "",
    serviceid: companyCode,
    find_row_value: "",
    isSearch: true,
  });

  const [subfilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "USERINFO",
    orgdiv: "01",
    dptcd: infomation.dptcd,
    dptnm: "",
    user_name: "",
    serviceid: companyCode,
    location: "",
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
      procedureName: "P_SY_A0125W_Q",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dptcd": filters.dptcd,
        "@p_dptnm": filters.dptnm,
        "@p_user_name": filters.user_name,
        "@p_serviceid": filters.serviceid,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        const dataTree: any = createDataTree(
          rows,
          (i: any) => i.dptcd,
          (i: any) => i.prntdptcd,
          SUB_ITEMS_FIELD
        );

        setAllMenuDataResult({
          ...allMenuDataResult,
          data: dataTree,
        });

        if (totalRowCnt > 0) {
          const selectedRow =
            filters.find_row_value == ""
              ? rows[0]
              : rows.find((row: any) => row.dptcd == filters.find_row_value);

          if (selectedRow != undefined) {
            let array = [];
            let valid = selectedRow.prntdptcd;
            while (valid != "" && valid != undefined && valid != null) {
              array.push(valid);
              if (rows.find((row: any) => row.dptcd == valid) != undefined) {
                valid = rows.find((row: any) => row.dptcd == valid).prntdptcd;
              } else {
                valid = "";
              }
            }

            if (selectedRow.prntdptcd != "") {
              setAllMenuDataResult({
                ...allMenuDataResult,
                data: dataTree,
                expanded: array,
              });
            }
            setInfomation({
              pgSize: PAGE_SIZE,
              workType: "U",
              orgdiv: "01",
              dptcd: selectedRow.dptcd,
              dptnm: selectedRow.dptnm,
              insert_form_id: selectedRow.insert_form_id,
              insert_pc: selectedRow.insert_pc,
              insert_time: selectedRow.insert_time,
              insert_user_id: selectedRow.insert_user_id,
              last_update_time: selectedRow.last_update_time,
              location: selectedRow.location,
              mfcsaldv: selectedRow.mfcsaldv,
              prntdptcd: selectedRow.prntdptcd,
              prntdptnm: selectedRow.prntdptnm,
              refdptcd: selectedRow.refdptcd,
              remark: selectedRow.remark,
              update_form_id: selectedRow.update_form_id,
              update_pc: selectedRow.update_pc,
              update_time: selectedRow.update_time,
              update_userid: selectedRow.update_userid,
              useyn: selectedRow.useyn == "Y" ? "Y" : "N",
            });
            setSelectedState({
              [selectedRow[ALL_MENU_DATA_ITEM_KEY]]: true,
            });
            setsubFilters((prev) => ({
              ...prev,
              workType: "USERINFO",
              dptcd: selectedRow.dptcd,
              isSearch: true,
            }));
          } else {
            setSelectedState({
              [rows[0][ALL_MENU_DATA_ITEM_KEY]]: true,
            });
            setInfomation({
              pgSize: PAGE_SIZE,
              workType: "U",
              orgdiv: "01",
              dptcd: rows[0].dptcd,
              dptnm: rows[0].dptnm,
              insert_form_id: rows[0].insert_form_id,
              insert_pc: rows[0].insert_pc,
              insert_time: rows[0].insert_time,
              insert_user_id: rows[0].insert_user_id,
              last_update_time: rows[0].last_update_time,
              location: rows[0].location,
              mfcsaldv: rows[0].mfcsaldv,
              prntdptcd: rows[0].prntdptcd,
              prntdptnm: rows[0].prntdptnm,
              refdptcd: rows[0].refdptcd,
              remark: rows[0].remark,
              update_form_id: rows[0].update_form_id,
              update_pc: rows[0].update_pc,
              update_time: rows[0].update_time,
              update_userid: rows[0].update_userid,
              useyn: rows[0].useyn == "Y" ? "Y" : "N",
            });

            setsubFilters((prev) => ({
              ...prev,
              workType: "USERINFO",
              dptcd: rows[0].dptcd,
              isSearch: true,
            }));
          }
        }
      } else {
        setAllMenuDataResult((prev: any) => {
          return { ...prev, data: [] };
        });
        setInfomation({
          pgSize: PAGE_SIZE,
          workType: "N",
          orgdiv: "01",
          dptcd: "",
          dptnm: "",
          insert_form_id: "",
          insert_pc: "",
          insert_time: "",
          insert_user_id: "",
          last_update_time: "",
          location: "",
          mfcsaldv: "",
          prntdptcd: "",
          prntdptnm: "",
          refdptcd: "",
          remark: "",
          update_form_id: "",
          update_pc: "",
          update_time: "",
          update_userid: "",
          useyn: "Y",
        });
        setsubFilters((prev) => ({
          ...prev,
          pgNum: 1,
        }));
        setSubDataResult(process([], subDataState));
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchSubGrid = async (subfilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const subparameters: Iparameters = {
      procedureName: "P_SY_A0125W_Q",
      pageNumber: subfilters.pgNum,
      pageSize: subfilters.pgSize,
      parameters: {
        "@p_work_type": subfilters.workType,
        "@p_orgdiv": subfilters.orgdiv,
        "@p_location": subfilters.location,
        "@p_dptcd": subfilters.dptcd,
        "@p_dptnm": subfilters.dptnm,
        "@p_user_name": subfilters.user_name,
        "@p_serviceid": subfilters.serviceid,
      },
    };
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      const row = rows.map((item: any) => ({
        ...item,
      }));

      if (subfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[SUB_DATA_ITEM_KEY] == subfilters.find_row_value
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
      setSubDataResult(() => {
        return {
          data: row,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          subfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row[SUB_DATA_ITEM_KEY] == subfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedsubDataState({ [selectedRow[SUB_DATA_ITEM_KEY]]: true });
        } else {
          setSelectedsubDataState({ [rows[0][SUB_DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setsubFilters((prev) => ({
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
    if (filters.isSearch) {
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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [subDataResult]);

  useEffect(() => {
    if (subfilters.isSearch && subfilters.dptcd) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(subfilters);
      setsubFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchSubGrid(deepCopiedFilters);
    }
  }, [subfilters]);

  const onSelectionChange = useCallback(
    (event: any) => {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: ALL_MENU_DATA_ITEM_KEY,
      });
      setSelectedState(newSelectedState);
      const selectedIdx = event.startRowIndex;
      const selectedRowData = event.dataItems[selectedIdx];

      setInfomation({
        pgSize: PAGE_SIZE,
        workType: "U",
        orgdiv: "01",
        dptcd: selectedRowData.dptcd,
        dptnm: selectedRowData.dptnm,
        insert_form_id: selectedRowData.insert_form_id,
        insert_pc: selectedRowData.insert_pc,
        insert_time: selectedRowData.insert_time,
        insert_user_id: selectedRowData.insert_user_id,
        last_update_time: selectedRowData.last_update_time,
        location: selectedRowData.location,
        mfcsaldv: selectedRowData.mfcsaldv,
        prntdptcd: selectedRowData.prntdptcd,
        prntdptnm: selectedRowData.prntdptnm,
        refdptcd: selectedRowData.refdptcd,
        remark: selectedRowData.remark,
        update_form_id: selectedRowData.update_form_id,
        update_pc: selectedRowData.update_pc,
        update_time: selectedRowData.update_time,
        update_userid: selectedRowData.update_userid,
        useyn: selectedRowData.useyn == "Y" ? "Y" : "N",
      });
      if (swiper && isMobile) {
        swiper.slideTo(1);
      }
      setPage(initialPageState);
      setsubFilters((prev) => ({
        ...prev,
        workType: "USERINFO",
        dptcd: selectedRowData.dptcd,
        pgNum: 1,
        isSearch: true,
      }));
    },
    [selectedState]
  );

  const onSubDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: SUB_DATA_ITEM_KEY,
    });

    setSelectedsubDataState(newSelectedState);
  };

  //엑셀 내보내기
  let _export: any;
  let _export2: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions(
        treeToFlat(
          mapTree(data, SUB_ITEMS_FIELD, (item) =>
            extendDataItem(item, SUB_ITEMS_FIELD, {
              [EXPANDED_FIELD]: true,
              [EDIT_FIELD]:
                item[ALL_MENU_DATA_ITEM_KEY] === editItemId
                  ? editItemField
                  : undefined,
              [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
            })
          ),
          EXPANDED_FIELD,
          SUB_ITEMS_FIELD
        ),
        allMenuColumns
      );
      const optionsGridTwo = _export2.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "부서리스트";
      optionsGridOne.sheets[1].title = "부서인원정보";
      _export.save(optionsGridOne);
    }
  };

  const onSubDataStateChange = (event: GridDataStateChangeEvent) => {
    setSubDataState(event.dataState);
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

  const onAddClick2 = () => {
    setInfomation({
      pgSize: PAGE_SIZE,
      workType: "N",
      orgdiv: "01",
      dptcd: "",
      dptnm: "",
      insert_form_id: "",
      insert_pc: "",
      insert_time: "",
      insert_user_id: "",
      last_update_time: "",
      location: "",
      mfcsaldv: "",
      prntdptcd: "",
      prntdptnm: "",
      refdptcd: "",
      remark: "",
      update_form_id: "",
      update_pc: "",
      update_time: "",
      update_userid: "",
      useyn: "Y",
    });
    setSubDataResult(process([], subDataState));
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

  interface IDepartmentData {
    dptcd: string;
    dptnm: string;
    useyn: string;
  }

  type TdataArr = {
    userid_s: String[];
    postcd_s: String[];
    email_s: String[];
    mobile_no_s: String[];
    memo_s: String[];
  };

  const onSubDataSortChange = (e: any) => {
    setSubDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setAllMenuDataResult({
      data: [],
      expanded: [],
      editItem: undefined,
      editItemField: undefined,
    });
  };

  const search = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
  };

  const onSubItemChange = (event: GridItemChangeEvent) => {
    setSubDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      subDataResult,
      setSubDataResult,
      SUB_DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (field != "postcd" && field != "user_id") {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] === dataItem[SUB_DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: subDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != subDataResult.data) {
      const newData = subDataResult.data.map((item) =>
        item[SUB_DATA_ITEM_KEY] ==
        Object.getOwnPropertyNames(selectedsubDataState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: undefined,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = subDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setSubDataResult((prev) => {
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

  const [paraDataDeleted, setParaDataDeleted] = useState({
    work_type: "",
    dptcd: "",
  });
  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick2 = (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    if (allMenuDataResult.data.length == 0) {
      alert("데이터가 없습니다");
    } else {
      const item = Object.getOwnPropertyNames(selectedState)[0];
      setParaDataDeleted((prev) => ({
        ...prev,
        work_type: "D",
        dptcd: item,
      }));
    }
  };

  const [paraData, setParaData] = useState({
    workType: "UM",
    orgdiv: "01",
    dptcd: infomation.dptcd,
    dptnm: infomation.dptnm,
    location: infomation.location,
    mfcsaldv: infomation.mfcsaldv,
    prntdptcd: infomation.prntdptcd,
    remark: infomation.remark,
    useyn: infomation.useyn == "Y" ? "Y" : "N",
    userid_s: "",
    postcd_s: "",
    email_s: "",
    mobile_no_s: "",
    memo_s: "",
    userid: userId,
    pc: pc,
    form_id: "SY_A0125W",
  });

  const para: Iparameters = {
    procedureName: "P_SY_A0125W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_dptcd": paraData.dptcd,
      "@p_dptnm": paraData.dptnm,
      "@p_prntdptcd": paraData.prntdptcd,
      "@p_mfcsaldv": paraData.mfcsaldv,
      "@p_useyn": paraData.useyn,
      "@p_remark": paraData.remark,
      "@p_userid_s": paraData.userid_s,
      "@p_postcd_s": paraData.postcd_s,
      "@p_email_s": paraData.email_s,
      "@p_mobile_no_s": paraData.mobile_no_s,
      "@p_memo_s": paraData.memo_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SY_A0125W",
    },
  };

  const paraDeleted: Iparameters = {
    procedureName: "P_SY_A0125W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataDeleted.work_type,
      "@p_orgdiv": infomation.orgdiv,
      "@p_location": infomation.location,
      "@p_dptcd": paraDataDeleted.dptcd,
      "@p_dptnm": infomation.dptnm,
      "@p_prntdptcd": infomation.prntdptcd,
      "@p_mfcsaldv": infomation.mfcsaldv,
      "@p_useyn": infomation.useyn,
      "@p_remark": infomation.remark,
      "@p_userid_s": "",
      "@p_postcd_s": "",
      "@p_email_s": "",
      "@p_mobile_no_s": "",
      "@p_memo_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SY_A0125W",
    },
  };

  const infopara: Iparameters = {
    procedureName: "P_SY_A0125W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": infomation.workType,
      "@p_orgdiv": infomation.orgdiv,
      "@p_location": infomation.location,
      "@p_dptcd": infomation.dptcd,
      "@p_dptnm": infomation.dptnm,
      "@p_prntdptcd": infomation.prntdptcd,
      "@p_mfcsaldv": infomation.mfcsaldv,
      "@p_useyn": infomation.useyn,
      "@p_remark": infomation.remark,
      "@p_userid_s": "",
      "@p_postcd_s": "",
      "@p_email_s": "",
      "@p_mobile_no_s": "",
      "@p_memo_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SY_A0125W",
    },
  };

  useEffect(() => {
    if (paraDataDeleted.work_type === "D") {
      fetchToDelete();
    }
  }, [paraDataDeleted]);

  const onSaveClick = async () => {
    const dataItem = subDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0) return false;
    let dataArr: TdataArr = {
      userid_s: [],
      postcd_s: [],
      email_s: [],
      mobile_no_s: [],
      memo_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const { user_id, postcd, email, mobile_no, memo } = item;

      dataArr.userid_s.push(user_id);
      dataArr.postcd_s.push(postcd);
      dataArr.email_s.push(email);
      dataArr.mobile_no_s.push(mobile_no);
      dataArr.memo_s.push(memo);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "UM",
      orgdiv: "01",
      dptcd: infomation.dptcd,
      dptnm: infomation.dptnm,
      location: infomation.location,
      mfcsaldv: infomation.mfcsaldv,
      prntdptcd: infomation.prntdptcd,
      remark: infomation.remark,
      useyn: infomation.useyn == "Y" ? "Y" : "N",
      userid_s: dataArr.userid_s.join("|"),
      postcd_s: dataArr.postcd_s.join("|"),
      email_s: dataArr.email_s.join("|"),
      mobile_no_s: dataArr.mobile_no_s.join("|"),
      memo_s: dataArr.memo_s.join("|"),
      userid: userId,
      pc: pc,
      form_id: "SY_A0125W",
    }));
  };

  const fetchToDelete = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraDeleted);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    paraDataDeleted.work_type = ""; //초기화
    paraDataDeleted.dptcd = "";
  };

  const onSaveClick2 = async () => {
    let data: any;

    let valid = true;
    try {
      if (!infomation.dptcd) {
        throw findMessage(messagesData, "SY_A0125W_001");
      }

      if (!infomation.dptnm) {
        throw findMessage(messagesData, "SY_A0125W_002");
      }

      if (infomation.dptcd == infomation.prntdptcd) {
        throw findMessage(messagesData, "SY_A0125W_004");
      }

      let valid = true;
      allMenuDataResult.data.map((item: any) => {
        if (infomation.workType == "N") {
          if (item.dptcd == infomation.dptcd && valid == true) {
            valid = false;
            throw findMessage(messagesData, "SY_A0125W_003");
          }
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    setLoading(true);

    try {
      data = await processApi<any>("procedure", infopara);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      resetAllGrid();
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setsubFilters((prev) => ({
        ...prev,
        find_row_value: Object.getOwnPropertyNames(selectedsubDataState)[0],
        isSearch: true,
      }));
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.dptcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const onDepartmentWndClick = () => {
    setDepartmentWindowVisible(true);
  };
  const { data, expanded, editItem, editItemField } = allMenuDataResult;
  const editItemId = editItem ? editItem[ALL_MENU_DATA_ITEM_KEY] : null;


  
  return (
    <>
      {isMobile ? (
        <GridContainerWrap >
          <Swiper
            className="leading_95_Swiper"
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0} className="leading_PDA">
              <GridContainer style={{ width: `${deviceWidth-30}px`}}>
                <TitleContainer>
                  <Title>부서관리</Title>

                  <ButtonContainer>
                    {permissions && (
                      <TopButtons
                        search={search}
                        exportExcel={exportExcel}
                        permissions={permissions}
                        pathname="SY_A0125W"
                      />
                    )}
                  </ButtonContainer>
                </TitleContainer>
                <FilterContainer>
                  <FilterBox
                    onKeyPress={(e) => handleKeyPressSearch(e, search)}
                  >
                    <tbody>
                      <tr>
                        <th>부서코드</th>
                        <td>
                          <Input
                            name="dptcd"
                            type="text"
                            value={filters.dptcd}
                            onChange={filterInputChange}
                          />
                        </td>
                        <th>부서명</th>
                        <td>
                          <Input
                            name="dptnm"
                            type="text"
                            value={filters.dptnm}
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
                <ExcelExport
                  ref={(exporter) => (_export = exporter)}
                  hierarchy={true}
                  fileName="부서관리"
                >
                  <TreeList
                    style={{
                      height: "80vh",
                      overflow: "auto",
                    }}
                    data={mapTree(data, SUB_ITEMS_FIELD, (item) =>
                      extendDataItem(item, SUB_ITEMS_FIELD, {
                        [EXPANDED_FIELD]: expanded.includes(
                          item[ALL_MENU_DATA_ITEM_KEY]
                        ),
                        [EDIT_FIELD]:
                          item[ALL_MENU_DATA_ITEM_KEY] === editItemId
                            ? editItemField
                            : undefined,
                        [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
                      })
                    )}
                    expandField={EXPANDED_FIELD}
                    subItemsField={SUB_ITEMS_FIELD}
                    onExpandChange={onAllMenuExpandChange}
                    // 선택
                    selectable={{
                      enabled: true,
                      drag: false,
                      cell: false,
                      mode: "single",
                    }}
                    selectedField={SELECTED_FIELD}
                    onSelectionChange={onSelectionChange}
                    columns={allMenuColumns}
                  />
                </ExcelExport>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide
              key={1}
              className="leading_PDA"
              style={{ display: "flex", flexDirection: "column" }}
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
                >
                  이전
                </Button>
              </div>
              <GridContainer
                style={{
                  minHeight: "68vh",
                  width: `${deviceWidth - 30}px`,
                 overflow: "auto",
                }}
              >
                <GridTitleContainer>
                  <GridTitle>기본정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick2}
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      신규
                    </Button>
                    <Button
                      onClick={onDeleteClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="delete"
                    >
                      삭제
                    </Button>
                    <Button
                      onClick={onSaveClick2}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                    >
                      저장
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap
                  border={true}
                  style={{ minHeight: "60vh", width: `${deviceWidth - 30}px` }}
                >
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>상위부서</th>
                        <td>
                          <Input
                            name="prntdptcd"
                            type="text"
                            value={infomation.prntdptcd}
                            onChange={InputChange}
                          />
                          <ButtonInInput>
                            <Button
                              onClick={onDepartmentWndClick}
                              icon="more-horizontal"
                              fillMode="flat"
                            />
                          </ButtonInInput>
                        </td>
                        <th>상위부서명</th>
                        <td>
                          <Input
                            name="prntdptnm"
                            type="text"
                            value={infomation.prntdptnm}
                            onChange={InputChange}
                            className="readonly"
                          />
                        </td>
                        <th>사업장</th>
                        <td>
                          {bizComponentData !== null && (
                            <BizComponentComboBox
                              name="location"
                              value={infomation.location}
                              bizComponentId="L_BA002"
                              bizComponentData={bizComponentData}
                              changeData={ComboBoxChange}
                            />
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>부서코드</th>
                        <td>
                          <Input
                            name="dptcd"
                            type="text"
                            value={infomation.dptcd}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>부서명</th>
                        <td>
                          <Input
                            name="dptnm"
                            type="text"
                            value={infomation.dptnm}
                            onChange={InputChange}
                            className="required"
                          />
                        </td>
                        <th>사용여부</th>
                        <td>
                          <Checkbox
                            name="useyn"
                            value={infomation.useyn == "Y" ? true : false}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>비고</th>
                        <td colSpan={5}>
                          <TextArea
                            value={infomation.remark}
                            name="remark"
                            rows={2}
                            onChange={InputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <GridTitleContainer>
                  <GridTitle>부서인원정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onSaveClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="save"
                      title="저장"
                    ></Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <ExcelExport
                  ref={(exporter) => (_export2 = exporter)}
                  data={subDataResult.data}
                  fileName="부서관리"
                >
                  <Grid
                    style={{ height:"40vh"  }}
                    data={process(
                      subDataResult.data.map((row) => ({
                        ...row,
                        postcd: postcdListData.find(
                          (item: any) => item.sub_code === row.postcd
                        )?.code_name,
                        [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                      })),
                      subDataState
                    )}
                    {...subDataState}
                    onDataStateChange={onSubDataStateChange}
                    //선택 기능
                    dataItemKey={SUB_DATA_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onSubDataSelectionChange}
                    //스크롤 조회 기능
                    fixedScroll={true}
                    total={subDataResult.total}
                    skip={page.skip}
                    take={page.take}
                    pageable={true}
                    onPageChange={pageChange}
                    //원하는 행 위치로 스크롤 기능
                    ref={gridRef}
                    rowHeight={30}
                    //정렬기능
                    sortable={true}
                    onSortChange={onSubDataSortChange}
                    //컬럼순서조정
                    reorderable={true}
                    //컬럼너비조정
                    resizable={true}
                    onItemChange={onSubItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn
                      field="rowstatus"
                      title=" "
                      width="50px"
                      editable={false}
                    />
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions[
                        "grdAllList"
                      ].map(
                        (item: any, idx: number) =>
                          item.sortOrder !== -1 && (
                            <GridColumn
                              key={idx}
                              id={item.id}
                              field={item.fieldName}
                              title={item.caption}
                              width={item.width}
                              footerCell={
                                item.sortOrder === 0
                                  ? subTotalFooterCell
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
        </GridContainerWrap>
      ) : (
        <>
          <TitleContainer>
            <Title>부서관리</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  exportExcel={exportExcel}
                  permissions={permissions}
                  pathname="SY_A0125W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>부서코드</th>
                  <td>
                    <Input
                      name="dptcd"
                      type="text"
                      value={filters.dptcd}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>부서명</th>
                  <td>
                    <Input
                      name="dptnm"
                      type="text"
                      value={filters.dptnm}
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
          <GridContainerWrap>
            <GridContainer width="46%">
              <GridTitleContainer>
                <GridTitle>부서리스트</GridTitle>
              </GridTitleContainer>
              <ExcelExport
                ref={(exporter) => (_export = exporter)}
                hierarchy={true}
                fileName="부서관리"
              >
                <TreeList
                  style={{
                    height: isMobile ? "50vh" : "81.6vh",
                    overflow: "auto",
                  }}
                  data={mapTree(data, SUB_ITEMS_FIELD, (item) =>
                    extendDataItem(item, SUB_ITEMS_FIELD, {
                      [EXPANDED_FIELD]: expanded.includes(
                        item[ALL_MENU_DATA_ITEM_KEY]
                      ),
                      [EDIT_FIELD]:
                        item[ALL_MENU_DATA_ITEM_KEY] === editItemId
                          ? editItemField
                          : undefined,
                      [SELECTED_FIELD]: selectedState[idGetter(item)], //선택된 데이터
                    })
                  )}
                  expandField={EXPANDED_FIELD}
                  subItemsField={SUB_ITEMS_FIELD}
                  onExpandChange={onAllMenuExpandChange}
                  // 선택
                  selectable={{
                    enabled: true,
                    drag: false,
                    cell: false,
                    mode: "single",
                  }}
                  selectedField={SELECTED_FIELD}
                  onSelectionChange={onSelectionChange}
                  columns={allMenuColumns}
                />
              </ExcelExport>
            </GridContainer>
            <GridContainer width={`calc(54% - ${GAP}px)`}>
              <GridTitleContainer>
                <GridTitle>기본정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onAddClick2}
                    themeColor={"primary"}
                    icon="file-add"
                  >
                    신규
                  </Button>
                  <Button
                    onClick={onDeleteClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="delete"
                  >
                    삭제
                  </Button>
                  <Button
                    onClick={onSaveClick2}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                  >
                    저장
                  </Button>
                </ButtonContainer>
              </GridTitleContainer>
              <FormBoxWrap border={true}>
                <FormBox>
                  <tbody>
                    <tr>
                      <th>상위부서</th>
                      <td>
                        <Input
                          name="prntdptcd"
                          type="text"
                          value={infomation.prntdptcd}
                          onChange={InputChange}
                        />
                        <ButtonInInput>
                          <Button
                            onClick={onDepartmentWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </td>
                      <th>상위부서명</th>
                      <td>
                        <Input
                          name="prntdptnm"
                          type="text"
                          value={infomation.prntdptnm}
                          onChange={InputChange}
                          className="readonly"
                        />
                      </td>
                      <th>사업장</th>
                      <td>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="location"
                            value={infomation.location}
                            bizComponentId="L_BA002"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>부서코드</th>
                      <td>
                        <Input
                          name="dptcd"
                          type="text"
                          value={infomation.dptcd}
                          onChange={InputChange}
                          className="required"
                        />
                      </td>
                      <th>부서명</th>
                      <td>
                        <Input
                          name="dptnm"
                          type="text"
                          value={infomation.dptnm}
                          onChange={InputChange}
                          className="required"
                        />
                      </td>
                      <th>사용여부</th>
                      <td>
                        <Checkbox
                          name="useyn"
                          value={infomation.useyn == "Y" ? true : false}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>비고</th>
                      <td colSpan={5}>
                        <TextArea
                          value={infomation.remark}
                          name="remark"
                          rows={2}
                          onChange={InputChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </FormBox>
              </FormBoxWrap>
              <GridTitleContainer>
                <GridTitle>부서인원정보</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onSaveClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="save"
                    title="저장"
                  ></Button>
                </ButtonContainer>
              </GridTitleContainer>
              <ExcelExport
                ref={(exporter) => (_export2 = exporter)}
                data={subDataResult.data}
                fileName="부서관리"
              >
                <Grid
                  style={{ height: isMobile ? "40vh" : "60.3vh" }}
                  data={process(
                    subDataResult.data.map((row) => ({
                      ...row,
                      postcd: postcdListData.find(
                        (item: any) => item.sub_code === row.postcd
                      )?.code_name,
                      [SELECTED_FIELD]: selectedsubDataState[idGetter2(row)],
                    })),
                    subDataState
                  )}
                  {...subDataState}
                  onDataStateChange={onSubDataStateChange}
                  //선택 기능
                  dataItemKey={SUB_DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSubDataSelectionChange}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={subDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
                  rowHeight={30}
                  //정렬기능
                  sortable={true}
                  onSortChange={onSubDataSortChange}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onSubItemChange}
                  cellRender={customCellRender}
                  rowRender={customRowRender}
                  editField={EDIT_FIELD}
                >
                  <GridColumn
                    field="rowstatus"
                    title=" "
                    width="50px"
                    editable={false}
                  />
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdAllList"].map(
                      (item: any, idx: number) =>
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            footerCell={
                              item.sortOrder === 0
                                ? subTotalFooterCell
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
      {departmentWindowVisible && (
        <DepartmentsWindow
          setVisible={setDepartmentWindowVisible}
          workType={"FILTER"}
          setData={setDepartmentData}
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

export default SY_A0125W;
