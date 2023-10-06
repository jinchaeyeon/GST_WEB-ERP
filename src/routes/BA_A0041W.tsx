import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridCellProps,
  GridHeaderCellProps,
  GridPageChangeEvent,
} from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { gridList } from "../store/columns/BA_A0041W_C";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import ExcelUploadButtons from "../components/Buttons/ExcelUploadButton";
import {
  Title,
  FilterBox,
  GridContainer,
  GridTitle,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  ButtonInInput,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import {
  findMessage,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseParaPc,
  UseGetValueFromSessionItem,
} from "../components/CommonFunction";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, loginResultState } from "../store/atoms";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CheckBoxReadOnlyCell from "../components/Cells/CheckBoxReadOnlyCell";

const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;
const NumberField = ["unitwgt", "len", "safeqty", "purqty", "ctunp"];
const CheckField = ["useyn", "auto", "qcyn", "bomyn"];
const CustomComboField = [
  "itemlvl1",
  "itemlvl2",
  "itemacnt",
  "itemlvl3",
  "load_place",
  "invunit",
];
const requiredField = ["useyn", "itemnm", "itemacnt"];
let targetRowIndex: null | number = null;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  // 중분류, 소분류, 품목계정, 대분류, 적재장소, 수량단위
  UseBizComponent(
    "L_BA172,L_BA173,L_BA061, L_BA171, L_LOADPLACE, L_BA015",
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "itemlvl2"
      ? "L_BA172"
      : field === "itemlvl3"
      ? "L_BA173"
      : field === "itemacnt"
      ? "L_BA061"
      : field === "itemlvl1"
      ? "L_BA171"
      : field === "load_place"
      ? "L_LOADPLACE"
      : field === "invunit"
      ? "L_BA015"
      : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td></td>
  );
};

const CustomCheckCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field,
    render,
    onChange,
    className = "",
  } = props;

  return props != undefined ? (
    props.dataItem["itemcd"] != "" ? (
      <CheckBoxReadOnlyCell {...props} />
    ) : (
      <CheckBoxCell {...props} />
    )
  ) : (
    <td></td>
  );
};

const BA_A0041W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
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
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        raduseyn: defaultOption.find((item: any) => item.id === "raduseyn")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
        itemlvl1: defaultOption.find((item: any) => item.id === "itemlvl1")
          .valueCode,
        itemlvl2: defaultOption.find((item: any) => item.id === "itemlvl2")
          .valueCode,
        itemlvl3: defaultOption.find((item: any) => item.id === "itemlvl3")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_LOADPLACE,L_BA061,L_BA015, R_USEYN,L_BA171,L_BA172,L_BA173,R_YESNOALL",
    //품목계정, 수량단위
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
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
  const [loadplaceListData, setLoadPlaceListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const loadplaceQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_LOADPLACE"
        )
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA171")
      );
      const itemlvl2QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA172")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA173")
      );
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl2QueryStr, setItemlvl2ListData);
      fetchQuery(loadplaceQueryStr, setLoadPlaceListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(itemacntQueryStr, setItemacntListData);
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
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
    workType: "Q",
    orgdiv: "01",
    location: "",
    itemcd: "",
    itemnm: "",
    itemacnt: "",
    bnatur: "",
    insiz: "",
    spec: "",
    dwgno: "",
    itemlvl1: "",
    itemlvl2: "",
    itemlvl3: "",
    raduseyn: "Y",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  let gridRef: any = useRef(null);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0041W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_itemacnt": filters.itemacnt,
        "@p_bnatur": filters.bnatur,
        "@p_insiz": filters.insiz,
        "@p_spec": filters.spec,
        "@p_dwgno": filters.dwgno,
        "@p_itemlvl1": filters.itemlvl1,
        "@p_itemlvl2": filters.itemlvl2,
        "@p_itemlvl3": filters.itemlvl3,
        "@p_useyn": filters.raduseyn,
        "@p_company_code": companyCode,
        "@p_find_row_value": filters.find_row_value,
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
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
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

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

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

  type TdataArr = {
    rowstatus_s: string[];
    itemcd_s: string[];
    itemnm_s: string[];
    itemacnt_s: string[];
    bnatur_s: string[];
    insiz_s: string[];
    spec_s: string[];
    maker_s: string[];
    dwgno_s: string[];
    itemlvl1_s: string[];
    itemlvl2_s: string[];
    itemlvl3_s: string[];
    qcyn_s: string[];
    hscode_s: string[];
    useyn_s: string[];
    attdatnum_s: string[];
    remark_s: string[];
    safeqty_s: string[];
    purqty_s: string[];
    unitwgt_s: string[];
    len_s: string[];
    auto_s: string[];
    itemno_s: string[];
    model_s: string[];
    invunit_s: string[];
    custcd_s: string[];
    custnm_s: string[];
    load_place_s: string[];
    ctunp_s: string[];
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

  const search = () => {
    deletedMainRows = [];
    resetAllGrid();
    setPage(initialPageState); // 페이지 초기화
    setFilters((prev: any) => ({
      ...prev,
      pgNum: 1,
      find_row_value: "",
      isSearch: true,
    }));
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

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;
    if (dataItem.rowstatus == "N") {
      if (
        (dataItem.auto == "Y" || dataItem.auto == "true") &&
        field == "itemcd"
      ) {
        valid = false;
      }
    } else if (dataItem.rowstatus != "N") {
      if (field == "itemcd") {
        valid = false;
      }
    }

    if (
      (field != "rowstatus" &&
        field != "bomyn" &&
        field != "files" &&
        valid == true) ||
      (field == "auto" && dataItem.rowstatus == "N")
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
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
      const newData = mainDataResult.data.map(
        (item: { [x: string]: string; rowstatus: string }) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
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

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        chk: !values2,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      attdatnum: "",
      auto: "Y",
      basinvunp: 0,
      bassalunp: 0,
      bnatur: "",
      bomyn: "N",
      chk: "",
      cnt: "",
      ctunp: 0,
      custcd: "",
      custnm: "",
      dwgno: "",
      files: "",
      hscode: "",
      insiz: "",
      invunit: "",
      itemacnt: "",
      itemcd: "",
      itemlvl1: "",
      itemlvl2: "",
      itemlvl3: "",
      itemnm: "",
      itemno: "",
      len: 0,
      lenunit: "",
      load_place: "",
      maker: "",
      model: "",
      position: "",
      purqty: 0,
      qcyn: "N",
      remark: "",
      safeqty: 0,
      spec: "",
      stockyn: "N",
      unitwgt: 0,
      useyn: "Y",
      wgtunit: "",
      rowstatus: "N",
    };
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
       if(!item.rowstatus || item.rowstatus != "N") {
          const newData2 = {
            ...item,
            rowstatus: "D",
          };
          deletedMainRows.push(newData2);
        }
        Object.push(index);
      }
    });
    if (Math.min(...Object) < Math.min(...Object2)) {
      data = mainDataResult.data[Math.min(...Object2)];
    } else {
      data = mainDataResult.data[Math.min(...Object) - 1];
    }
    //newData 생성
    setMainDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const [paraData, setParaData] = useState({
    workType: "N",
    location: "",
    position: "",
    rowstatus_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    bnatur_s: "",
    insiz_s: "",
    spec_s: "",
    maker_s: "",
    dwgno_s: "",
    itemlvl1_s: "",
    itemlvl2_s: "",
    itemlvl3_s: "",
    qcyn_s: "",
    hscode_s: "",
    useyn_s: "",
    attdatnum_s: "",
    remark_s: "",
    safeqty_s: "",
    purqty_s: "",
    unitwgt_s: "",
    len_s: "",
    auto_s: "",
    itemno_s: "",
    model_s: "",
    invunit_s: "",
    custcd_s: "",
    custnm_s: "",
    load_place_s: "",
    ctunp_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_BA_A0041W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_location": paraData.location,
      "@p_position": paraData.position,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_bnatur_s": paraData.bnatur_s,
      "@p_insiz_s": paraData.insiz_s,
      "@p_spec_s": paraData.spec_s,
      "@p_maker_s": paraData.maker_s,
      "@p_dwgno_s": paraData.dwgno_s,
      "@p_itemlvl1_s": paraData.itemlvl1_s,
      "@p_itemlvl2_s": paraData.itemlvl2_s,
      "@p_itemlvl3_s": paraData.itemlvl3_s,
      "@p_qcyn_s": paraData.qcyn_s,
      "@p_hscode_s": paraData.hscode_s,
      "@p_useyn_s": paraData.useyn_s,
      "@p_attdatnum_s": paraData.attdatnum_s,
      "@p_remark_s": paraData.remark_s,
      "@p_safeqty_s": paraData.safeqty_s,
      "@p_purqty_s": paraData.purqty_s,
      "@p_unitwgt_s": paraData.unitwgt_s,
      "@p_len_s": paraData.len_s,
      "@p_auto_s": paraData.auto_s,
      "@p_itemno_s": paraData.itemno_s,
      "@p_model_s": paraData.model_s,
      "@p_invunit_s": paraData.invunit_s,
      "@p_custcd_s": paraData.custcd_s,
      "@p_custnm_s": paraData.custnm_s,
      "@p_load_place_s": paraData.load_place_s,
      "@p_ctunp_s": paraData.ctunp_s,
      "@p_service_id": "PW6BizBase",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "BA_A0041W",
    },
  };

  const onSaveClick = async () => {
    let valid = true;
    let valid2 = true;

    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    try {
      dataItem.map((item: any) => {
        if (item.itemnm == "") {
          throw findMessage(messagesData, "BA_A0041W_001");
        } else if (item.itemacnt == "") {
          throw findMessage(messagesData, "BA_A0041W_001");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    mainDataResult.data.map((item) => {
      mainDataResult.data.map((item2) => {
        if (item.num != item2.num && item.itemcd == item2.itemcd) {
          if (item.itemcd != "") {
            valid2 = false;
          }
        }
      });
    });

    if (!valid2) {
      alert("이미 등록된 품목코드입니다.");
      return false;
    }

    if (dataItem.length === 0 && deletedMainRows.length === 0) return false;
    let dataArr: TdataArr = {
      rowstatus_s: [],
      itemcd_s: [],
      itemnm_s: [],
      itemacnt_s: [],
      bnatur_s: [],
      insiz_s: [],
      spec_s: [],
      maker_s: [],
      dwgno_s: [],
      itemlvl1_s: [],
      itemlvl2_s: [],
      itemlvl3_s: [],
      qcyn_s: [],
      hscode_s: [],
      useyn_s: [],
      attdatnum_s: [],
      remark_s: [],
      safeqty_s: [],
      purqty_s: [],
      unitwgt_s: [],
      len_s: [],
      auto_s: [],
      itemno_s: [],
      model_s: [],
      invunit_s: [],
      custcd_s: [],
      custnm_s: [],
      load_place_s: [],
      ctunp_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        itemcd = "",
        itemnm = "",
        itemacnt = "",
        bnatur = "",
        insiz = "",
        spec = "",
        maker = "",
        dwgno = "",
        itemlvl1 = "",
        itemlvl2 = "",
        itemlvl3 = "",
        qcyn = "",
        hscode = "",
        useyn = "",
        attdatnum = "",
        remark = "",
        safeqty = "",
        purqty = "",
        unitwgt = "",
        len = "",
        auto = "",
        itemno = "",
        model = "",
        invunit = "",
        custcd = "",
        custnm = "",
        load_place = "",
        ctunp = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.itemacnt_s.push(itemacnt);
      dataArr.bnatur_s.push(bnatur);
      dataArr.insiz_s.push(insiz);
      dataArr.spec_s.push(spec);
      dataArr.maker_s.push(maker);
      dataArr.dwgno_s.push(dwgno);
      dataArr.itemlvl1_s.push(itemlvl1);
      dataArr.itemlvl2_s.push(itemlvl2);
      dataArr.itemlvl3_s.push(itemlvl3);
      dataArr.qcyn_s.push(qcyn == true ? "Y" : qcyn == false ? "N" : qcyn);
      dataArr.hscode_s.push(hscode);
      dataArr.useyn_s.push(useyn == true ? "Y" : useyn == false ? "N" : useyn);
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.remark_s.push(remark);
      dataArr.safeqty_s.push(
        safeqty == undefined || safeqty == "" ? 0 : safeqty
      );
      dataArr.purqty_s.push(purqty == undefined || purqty == "" ? 0 : purqty);
      dataArr.unitwgt_s.push(
        unitwgt == undefined || unitwgt == "" ? 0 : unitwgt
      );
      dataArr.len_s.push(len == undefined || len == "" ? 0 : len);
      dataArr.auto_s.push(auto == true ? "Y" : auto == false ? "N" : auto);
      dataArr.itemno_s.push(itemno);
      dataArr.model_s.push(model);
      dataArr.invunit_s.push(invunit);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
      dataArr.load_place_s.push(load_place);
      dataArr.ctunp_s.push(ctunp == undefined || ctunp == "" ? 0 : ctunp);
    });
    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        itemcd = "",
        itemnm = "",
        itemacnt = "",
        bnatur = "",
        insiz = "",
        spec = "",
        maker = "",
        dwgno = "",
        itemlvl1 = "",
        itemlvl2 = "",
        itemlvl3 = "",
        qcyn = "",
        hscode = "",
        useyn = "",
        attdatnum = "",
        remark = "",
        safeqty = "",
        purqty = "",
        unitwgt = "",
        len = "",
        auto = "",
        itemno = "",
        model = "",
        invunit = "",
        custcd = "",
        custnm = "",
        load_place = "",
        ctunp = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.itemacnt_s.push(itemacnt);
      dataArr.bnatur_s.push(bnatur);
      dataArr.insiz_s.push(insiz);
      dataArr.spec_s.push(spec);
      dataArr.maker_s.push(maker);
      dataArr.dwgno_s.push(dwgno);
      dataArr.itemlvl1_s.push(itemlvl1);
      dataArr.itemlvl2_s.push(itemlvl2);
      dataArr.itemlvl3_s.push(itemlvl3);
      dataArr.qcyn_s.push(qcyn == true ? "Y" : qcyn == false ? "N" : qcyn);
      dataArr.hscode_s.push(hscode);
      dataArr.useyn_s.push(useyn == true ? "Y" : useyn == false ? "N" : useyn);
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.remark_s.push(remark);
      dataArr.safeqty_s.push(
        safeqty == undefined || safeqty == "" ? 0 : safeqty
      );
      dataArr.purqty_s.push(purqty == undefined || purqty == "" ? 0 : purqty);
      dataArr.unitwgt_s.push(
        unitwgt == undefined || unitwgt == "" ? 0 : unitwgt
      );
      dataArr.len_s.push(len == undefined || len == "" ? 0 : len);
      dataArr.auto_s.push(auto == true ? "Y" : auto == false ? "N" : auto);
      dataArr.itemno_s.push(itemno);
      dataArr.model_s.push(model);
      dataArr.invunit_s.push(invunit);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
      dataArr.load_place_s.push(load_place);
      dataArr.ctunp_s.push(ctunp == undefined || ctunp == "" ? 0 : ctunp);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      location: "01",
      position: "",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      itemnm_s: dataArr.itemnm_s.join("|"),
      itemacnt_s: dataArr.itemacnt_s.join("|"),
      bnatur_s: dataArr.bnatur_s.join("|"),
      insiz_s: dataArr.insiz_s.join("|"),
      spec_s: dataArr.spec_s.join("|"),
      maker_s: dataArr.maker_s.join("|"),
      dwgno_s: dataArr.dwgno_s.join("|"),
      itemlvl1_s: dataArr.itemlvl1_s.join("|"),
      itemlvl2_s: dataArr.itemlvl2_s.join("|"),
      itemlvl3_s: dataArr.itemlvl3_s.join("|"),
      qcyn_s: dataArr.qcyn_s.join("|"),
      hscode_s: dataArr.hscode_s.join("|"),
      useyn_s: dataArr.useyn_s.join("|"),
      attdatnum_s: dataArr.attdatnum_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      safeqty_s: dataArr.safeqty_s.join("|"),
      purqty_s: dataArr.purqty_s.join("|"),
      unitwgt_s: dataArr.unitwgt_s.join("|"),
      len_s: dataArr.len_s.join("|"),
      auto_s: dataArr.auto_s.join("|"),
      itemno_s: dataArr.itemno_s.join("|"),
      model_s: dataArr.model_s.join("|"),
      invunit_s: dataArr.invunit_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      custnm_s: dataArr.custnm_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      ctunp_s: dataArr.ctunp_s.join("|"),
    }));
  };

  const onDeleteClick2 = async () => {
    let valid = true;

    if (mainDataResult.data.length == 0) {
      alert("데이터가 없습니다.");
      return false;
    }
    const dataItem = mainDataResult.data.filter((item: any) => {
      return item.chk == true;
    });

    try {
      dataItem.map((item: any) => {
        if (item.bomyn == "Y" || item.bomyn == true) {
          throw findMessage(messagesData, "BA_A0041W_002");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    if (dataItem.length === 0) {
      alert("데이터가 없습니다.");
      return false;
    }
    if (!window.confirm("선택한 품목들을 삭제하시겠습니까?")) {
      return false;
    }
    let dataArr: TdataArr = {
      rowstatus_s: [],
      itemcd_s: [],
      itemnm_s: [],
      itemacnt_s: [],
      bnatur_s: [],
      insiz_s: [],
      spec_s: [],
      maker_s: [],
      dwgno_s: [],
      itemlvl1_s: [],
      itemlvl2_s: [],
      itemlvl3_s: [],
      qcyn_s: [],
      hscode_s: [],
      useyn_s: [],
      attdatnum_s: [],
      remark_s: [],
      safeqty_s: [],
      purqty_s: [],
      unitwgt_s: [],
      len_s: [],
      auto_s: [],
      itemno_s: [],
      model_s: [],
      invunit_s: [],
      custcd_s: [],
      custnm_s: [],
      load_place_s: [],
      ctunp_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        itemcd = "",
        itemnm = "",
        itemacnt = "",
        bnatur = "",
        insiz = "",
        spec = "",
        maker = "",
        dwgno = "",
        itemlvl1 = "",
        itemlvl2 = "",
        itemlvl3 = "",
        qcyn = "",
        hscode = "",
        useyn = "",
        attdatnum = "",
        remark = "",
        safeqty = "",
        purqty = "",
        unitwgt = "",
        len = "",
        auto = "",
        itemno = "",
        model = "",
        invunit = "",
        custcd = "",
        custnm = "",
        load_place = "",
        ctunp = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.itemcd_s.push(itemcd);
      dataArr.itemnm_s.push(itemnm);
      dataArr.itemacnt_s.push(itemacnt);
      dataArr.bnatur_s.push(bnatur);
      dataArr.insiz_s.push(insiz);
      dataArr.spec_s.push(spec);
      dataArr.maker_s.push(maker);
      dataArr.dwgno_s.push(dwgno);
      dataArr.itemlvl1_s.push(itemlvl1);
      dataArr.itemlvl2_s.push(itemlvl2);
      dataArr.itemlvl3_s.push(itemlvl3);
      dataArr.qcyn_s.push(qcyn == true ? "Y" : qcyn == false ? "N" : qcyn);
      dataArr.hscode_s.push(hscode);
      dataArr.useyn_s.push(useyn == true ? "Y" : useyn == false ? "N" : useyn);
      dataArr.attdatnum_s.push(attdatnum);
      dataArr.remark_s.push(remark);
      dataArr.safeqty_s.push(
        safeqty == undefined || safeqty == "" ? 0 : safeqty
      );
      dataArr.purqty_s.push(purqty == undefined || purqty == "" ? 0 : purqty);
      dataArr.unitwgt_s.push(
        unitwgt == undefined || unitwgt == "" ? 0 : unitwgt
      );
      dataArr.len_s.push(len == undefined || len == "" ? 0 : len);
      dataArr.auto_s.push(auto == true ? "Y" : auto == false ? "N" : auto);
      dataArr.itemno_s.push(itemno);
      dataArr.model_s.push(model);
      dataArr.invunit_s.push(invunit);
      dataArr.custcd_s.push(custcd);
      dataArr.custnm_s.push(custnm);
      dataArr.load_place_s.push(load_place);
      dataArr.ctunp_s.push(ctunp == undefined || ctunp == "" ? 0 : ctunp);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "D",
      location: "01",
      position: "",
      rowstatus_s: dataArr.rowstatus_s.join("|"),
      itemcd_s: dataArr.itemcd_s.join("|"),
      itemnm_s: dataArr.itemnm_s.join("|"),
      itemacnt_s: dataArr.itemacnt_s.join("|"),
      bnatur_s: dataArr.bnatur_s.join("|"),
      insiz_s: dataArr.insiz_s.join("|"),
      spec_s: dataArr.spec_s.join("|"),
      maker_s: dataArr.maker_s.join("|"),
      dwgno_s: dataArr.dwgno_s.join("|"),
      itemlvl1_s: dataArr.itemlvl1_s.join("|"),
      itemlvl2_s: dataArr.itemlvl2_s.join("|"),
      itemlvl3_s: dataArr.itemlvl3_s.join("|"),
      qcyn_s: dataArr.qcyn_s.join("|"),
      hscode_s: dataArr.hscode_s.join("|"),
      useyn_s: dataArr.useyn_s.join("|"),
      attdatnum_s: dataArr.attdatnum_s.join("|"),
      remark_s: dataArr.remark_s.join("|"),
      safeqty_s: dataArr.safeqty_s.join("|"),
      purqty_s: dataArr.purqty_s.join("|"),
      unitwgt_s: dataArr.unitwgt_s.join("|"),
      len_s: dataArr.len_s.join("|"),
      auto_s: dataArr.auto_s.join("|"),
      itemno_s: dataArr.itemno_s.join("|"),
      model_s: dataArr.model_s.join("|"),
      invunit_s: dataArr.invunit_s.join("|"),
      custcd_s: dataArr.custcd_s.join("|"),
      custnm_s: dataArr.custnm_s.join("|"),
      load_place_s: dataArr.load_place_s.join("|"),
      ctunp_s: dataArr.ctunp_s.join("|"),
    }));
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
      if (paraData.workType == "N") {
        const isLastDataDeleted =
          mainDataResult.data.length == 0 && filters.pgNum > 0;

        if (isLastDataDeleted) {
          setPage({
            skip:
              filters.pgNum == 1 || filters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum != 1 ? prev.pgNum - 1 : prev.pgNum : prev.pgNum,
            isSearch: true,
          }));
        } else {
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: data.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
      } else {
        const chkdata = mainDataResult.data.filter((item: any) => {
          return item.chk == false;
        });
        const isLastDataDeleted = chkdata.length == 0 && filters.pgNum > 0;

        if (isLastDataDeleted) {
          setPage({
            skip:
              filters.pgNum == 1 || filters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setFilters((prev: any) => ({
            ...prev,
            find_row_value: "",
            pgNum: isLastDataDeleted ? prev.pgNum != 1 ? prev.pgNum - 1 : prev.pgNum : prev.pgNum,
            isSearch: true,
          }));
        } else {
          let newData: any[] = [];
          let Object: any[] = [];
          let Object2: any[] = [];
          let selectRowData: any;

          mainDataResult.data.forEach((item: any, index: number) => {
            if (item.chk != true) {
              newData.push(item);
              Object2.push(index);
            } else {
              if(!item.rowstatus || item.rowstatus != "N") {
                const newData2 = {
                  ...item,
                  rowstatus: "D",
                };
                deletedMainRows.push(newData2);
              }
              Object.push(index);
            }
          });
          if (Math.min(...Object) < Math.min(...Object2)) {
            selectRowData = mainDataResult.data[Math.min(...Object2)];
          } else {
            selectRowData = mainDataResult.data[Math.min(...Object) - 1];
          }

          if (selectRowData != undefined) {
            const row = mainDataResult.data.filter(
              (item) => item[DATA_ITEM_KEY] == selectRowData[DATA_ITEM_KEY]
            )[0];
            setFilters((prev: any) => ({
              ...prev,
              find_row_value: row.itemcd,
              pgNum: prev.pgNum,
              isSearch: true,
            }));
          } else {
            const row = mainDataResult.data.filter(
              (item) => item[DATA_ITEM_KEY] == newData[0][DATA_ITEM_KEY]
            )[0];
            setFilters((prev: any) => ({
              ...prev,
              find_row_value: row.itemcd,
              pgNum: prev.pgNum,
              isSearch: true,
            }));
          }
        }
      }
      setParaData({
        workType: "N",
        location: "",
        position: "",
        rowstatus_s: "",
        itemcd_s: "",
        itemnm_s: "",
        itemacnt_s: "",
        bnatur_s: "",
        insiz_s: "",
        spec_s: "",
        maker_s: "",
        dwgno_s: "",
        itemlvl1_s: "",
        itemlvl2_s: "",
        itemlvl3_s: "",
        qcyn_s: "",
        hscode_s: "",
        useyn_s: "",
        attdatnum_s: "",
        remark_s: "",
        safeqty_s: "",
        purqty_s: "",
        unitwgt_s: "",
        len_s: "",
        auto_s: "",
        itemno_s: "",
        model_s: "",
        invunit_s: "",
        custcd_s: "",
        custnm_s: "",
        load_place_s: "",
        ctunp_s: "",
      });
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      alert(data.resultMessage);
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraData.rowstatus_s != "" || paraData.workType == "D") {
      fetchTodoGridSaved();
    }
  }, [paraData]);

  const saveExcel = (jsonArr: any[]) => {
    setLoading(true);
    if (jsonArr.length == 0) {
      alert("데이터가 없습니다.");
      setLoading(false);
    } else {
      let valid = true;
      let valid2 = true;
      jsonArr.map((item: any) => {
        if (
          item.품목명 == undefined ||
          item.품목계정 == undefined ||
          item.사용여부 == undefined
        ) {
          valid = false;
        }

        var itemacnts = itemacntListData.find(
          (items: any) => items.code_name == item.품목계정
        )?.sub_code;

        if (itemacnts == undefined) {
          valid2 = false;
        }
      });

      if (valid == true) {
        if (valid2 == true) {
          let dataArr: TdataArr = {
            rowstatus_s: [],
            itemcd_s: [],
            itemnm_s: [],
            itemacnt_s: [],
            bnatur_s: [],
            insiz_s: [],
            spec_s: [],
            maker_s: [],
            dwgno_s: [],
            itemlvl1_s: [],
            itemlvl2_s: [],
            itemlvl3_s: [],
            qcyn_s: [],
            hscode_s: [],
            useyn_s: [],
            attdatnum_s: [],
            remark_s: [],
            safeqty_s: [],
            purqty_s: [],
            unitwgt_s: [],
            len_s: [],
            auto_s: [],
            itemno_s: [],
            model_s: [],
            invunit_s: [],
            custcd_s: [],
            custnm_s: [],
            load_place_s: [],
            ctunp_s: [],
          };
          jsonArr.forEach((item: any, idx: number) => {
            const {
              품목코드 = "",
              품목명 = "",
              품목계정 = "",
              재질 = "",
              규격 = "",
              MODEL = "",
              사양 = "",
              메이커 = "",
              대분류 = "",
              중분류 = "",
              소분류 = "",
              적재장소 = "",
              단위중량 = "",
              단위길이 = "",
              구매단위 = "",
              안전재고량 = "",
              재발주량 = "",
              사용여부 = "",
              품번 = "",
              검사유무 = "",
              도면번호 = "",
              비고 = "",
              ctunp = "",
            } = item;

            const itemacnts = itemacntListData.find(
              (items: any) => items.code_name == 품목계정
            )?.sub_code;
            const load_places = loadplaceListData.find(
              (items: any) => items.code_name == 적재장소
            )?.sub_code;
            const itemlvl1 = itemlvl1ListData.find(
              (item: any) => item.code_name == 대분류
            )?.sub_code;
            const itemlvl2 = itemlvl2ListData.find(
              (item: any) => item.code_name == 중분류
            )?.sub_code;
            const itemlvl3 = itemlvl3ListData.find(
              (item: any) => item.code_name == 소분류
            )?.sub_code;
            const invunit = qtyunitListData.find(
              (item: any) => item.code_name === 구매단위
            )?.sub_code;

            dataArr.rowstatus_s.push("N");
            dataArr.itemcd_s.push(품목코드 == undefined ? "" : 품목코드);
            dataArr.itemnm_s.push(품목명);
            dataArr.itemacnt_s.push(itemacnts != undefined ? itemacnts : "");
            dataArr.bnatur_s.push(재질 == undefined ? "" : 재질);
            dataArr.insiz_s.push(규격 == undefined ? "" : 규격);
            dataArr.spec_s.push(사양 == undefined ? "" : 사양);
            dataArr.maker_s.push(메이커 == undefined ? "" : 메이커);
            dataArr.dwgno_s.push(도면번호 == undefined ? "" : 도면번호);
            dataArr.itemlvl1_s.push(itemlvl1 != undefined ? itemlvl1 : "");
            dataArr.itemlvl2_s.push(itemlvl2 != undefined ? itemlvl2 : "");
            dataArr.itemlvl3_s.push(itemlvl3 != undefined ? itemlvl3 : "");
            dataArr.qcyn_s.push(
              검사유무 == undefined
                ? "N"
                : 검사유무 == ("Y" || "N")
                ? 검사유무
                : "N"
            );
            dataArr.hscode_s.push("");
            dataArr.useyn_s.push(
              사용여부 == undefined
                ? "N"
                : 사용여부 == ("Y" || "N")
                ? 사용여부
                : "N"
            );
            dataArr.attdatnum_s.push("");
            dataArr.remark_s.push(비고 == undefined ? "" : 비고);
            dataArr.safeqty_s.push(안전재고량 == "" ? 0 : 안전재고량);
            dataArr.purqty_s.push(재발주량 == "" ? 0 : 재발주량);
            dataArr.unitwgt_s.push(단위중량 == "" ? 0 : 단위중량);
            dataArr.len_s.push(단위길이 == "" ? 0 : 단위길이);
            dataArr.auto_s.push("N");
            dataArr.itemno_s.push(품번 == undefined ? "" : 품번);
            dataArr.model_s.push(MODEL == undefined ? "" : MODEL);
            dataArr.invunit_s.push(invunit != undefined ? invunit : "");
            dataArr.custcd_s.push("");
            dataArr.custnm_s.push("");
            dataArr.load_place_s.push(
              load_places != undefined ? load_places : ""
            );
            dataArr.ctunp_s.push(ctunp == undefined || ctunp == "" ? 0 : ctunp);
          });

          setParaData((prev) => ({
            ...prev,
            workType: "N",
            location: "01",
            position: "",
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            itemcd_s: dataArr.itemcd_s.join("|"),
            itemnm_s: dataArr.itemnm_s.join("|"),
            itemacnt_s: dataArr.itemacnt_s.join("|"),
            bnatur_s: dataArr.bnatur_s.join("|"),
            insiz_s: dataArr.insiz_s.join("|"),
            spec_s: dataArr.spec_s.join("|"),
            maker_s: dataArr.maker_s.join("|"),
            dwgno_s: dataArr.dwgno_s.join("|"),
            itemlvl1_s: dataArr.itemlvl1_s.join("|"),
            itemlvl2_s: dataArr.itemlvl2_s.join("|"),
            itemlvl3_s: dataArr.itemlvl3_s.join("|"),
            qcyn_s: dataArr.qcyn_s.join("|"),
            hscode_s: dataArr.hscode_s.join("|"),
            useyn_s: dataArr.useyn_s.join("|"),
            attdatnum_s: dataArr.attdatnum_s.join("|"),
            remark_s: dataArr.remark_s.join("|"),
            safeqty_s: dataArr.safeqty_s.join("|"),
            purqty_s: dataArr.purqty_s.join("|"),
            unitwgt_s: dataArr.unitwgt_s.join("|"),
            len_s: dataArr.len_s.join("|"),
            auto_s: dataArr.auto_s.join("|"),
            itemno_s: dataArr.itemno_s.join("|"),
            model_s: dataArr.model_s.join("|"),
            invunit_s: dataArr.invunit_s.join("|"),
            custcd_s: dataArr.custcd_s.join("|"),
            custnm_s: dataArr.custnm_s.join("|"),
            load_place_s: dataArr.load_place_s.join("|"),
            ctunp_s: dataArr.ctunp_s.join("|"),
          }));
        } else {
          alert("품목계정코드를 잘못입력하였습니다.");
        }
      } else {
        alert("양식이 맞지 않습니다.");
      }
    }
    setLoading(false);
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const minGridWidth = React.useRef<number>(0);
  const grid = React.useRef<any>(null);
  const [applyMinWidth, setApplyMinWidth] = React.useState(false);
  const [gridCurrent, setGridCurrent] = React.useState(0);

  React.useEffect(() => {
    if (customOptionData != null) {
      grid.current = document.getElementById("grdList");
      window.addEventListener("resize", handleResize);

      //가장작은 그리드 이름
      customOptionData.menuCustomColumnOptions["grdList"].map((item: TColumn) =>
        item.width !== undefined
          ? (minGridWidth.current += item.width)
          : minGridWidth.current
      );
      minGridWidth.current += 95;

      setGridCurrent(grid.current.clientWidth);
      setApplyMinWidth(grid.current.clientWidth < minGridWidth.current);
    }
  }, [customOptionData]);

  const handleResize = () => {
    if (grid.current.clientWidth < minGridWidth.current && !applyMinWidth) {
      setApplyMinWidth(true);
    } else if (grid.current.clientWidth > minGridWidth.current) {
      setGridCurrent(grid.current.clientWidth);
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
        <Title>품목관리(멀티)</Title>

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
            </tr>
            <tr>
              <th>대분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl1"
                    value={filters.itemlvl1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>중분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl2"
                    value={filters.itemlvl2}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>소분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl3"
                    value={filters.itemlvl3}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>사양</th>
              <td>
                <Input
                  name="spec"
                  type="text"
                  value={filters.spec}
                  onChange={filterInputChange}
                />
              </td>
              <th>재질</th>
              <td>
                <Input
                  name="bnatur"
                  type="text"
                  value={filters.bnatur}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
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
              <th>도면번호</th>
              <td>
                <Input
                  name="dwgno"
                  type="text"
                  value={filters.dwgno}
                  onChange={filterInputChange}
                />
              </td>
              <th>사용여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="raduseyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer width={`100%`}>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
            <ButtonContainer>
              {permissions && (
                <ExcelUploadButtons
                  saveExcel={() => saveExcel}
                  permissions={permissions}
                  style={{ marginLeft: "15px" }}
                />
              )}
              <Button
                title="Export Excel"
                onClick={onAttachmentsWndClick}
                icon="file"
                fillMode="outline"
                themeColor={"primary"}
              >
                엑셀양식
              </Button>
              <Button
                onClick={onDeleteClick2}
                fillMode="outline"
                themeColor={"primary"}
                icon="delete"
              >
                즉시 삭제
              </Button>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
              ></Button>
              <Button
                onClick={onDeleteClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
              ></Button>
              <Button
                onClick={onSaveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="save"
                title="저장"
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: "67vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                rowstatus:
                  row.rowstatus == null ||
                  row.rowstatus == "" ||
                  row.rowstatus == undefined
                    ? ""
                    : row.rowstatus,
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
            id="grdList"
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CheckBoxCell}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"].map(
                (item: any, idx: number) =>
                  item.sortOrder !== -1 && (
                    <GridColumn
                      key={idx}
                      id={item.id}
                      field={item.fieldName}
                      title={item.caption}
                      width={setWidth("grdList", item.width)}
                      cell={
                        CheckField.includes(item.fieldName)
                          ? CustomCheckCell
                          : NumberField.includes(item.fieldName)
                          ? NumberCell
                          : CustomComboField.includes(item.fieldName)
                          ? CustomComboBoxCell
                          : undefined
                      }
                      headerCell={
                        requiredField.includes(item.fieldName)
                          ? RequiredHeader
                          : undefined
                      }
                      footerCell={
                        item.sortOrder === 1 ? mainTotalFooterCell : undefined
                      }
                    />
                  )
              )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"ROW_ADD"}
          setData={setItemData}
          modal={true}
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          para={"BA_A0041W"}
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

export default BA_A0041W;
