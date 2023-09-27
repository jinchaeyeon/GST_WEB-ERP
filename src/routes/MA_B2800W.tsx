import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { useTableKeyboardNavigation } from "@progress/kendo-react-data-tools";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  GRID_COL_INDEX_ATTRIBUTE,
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
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
import CenterCell from "../components/Cells/CenterCell";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat2,
  findMessage,
  getGridItemChangedData,
  getQueryFromBizComponent,
  handleKeyPressSearch,
  setDefaultDate
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import MA_B2800W_Window from "../components/Windows/MA_B2800W_Window";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { gridList } from "../store/columns/MA_B2800W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;

const CustomLockedCell = (props: GridCellProps) => {
  const field = props.field || "";
  const navigationAttributes = useTableKeyboardNavigation(props.id);
  return (
    <td
      style={props.style} // this applies styles that lock the column at a specific position
      className={props.className} // this adds classes needed for locked columns
      colSpan={props.colSpan}
      role={"gridcell"}
      aria-colindex={props.ariaColumnIndex}
      aria-selected={props.isSelected}
      {...{ [GRID_COL_INDEX_ATTRIBUTE]: props.columnIndex }}
      {...navigationAttributes}
    >
      <div style={{ textAlign: "center" }}>
        {dateformat2(props.dataItem[field].toString())}
      </div>
    </td>
  );
};

export const FormContext = createContext<{
  purInfo: TPurData;
  setPutInfo: (d: React.SetStateAction<TPurData>) => void;
}>({} as any);

type TPurData = {
  purnum: string;
  purseq: number;
  recnum: string;
};

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    dataItem,
    render,
  } = props;
  const { setPutInfo } = useContext(FormContext);

  const setPurData = () => {
    if(dataItem != undefined) {
      setPutInfo({
        purnum: dataItem.purnum,
        purseq: dataItem.purseq,
        recnum: dataItem.recnum
      });
    }
  };

  const defaultRendering = (
    <td
    style={props.style} // this applies styles that lock the column at a specific position
    className={props.className} // this adds classes needed for locked columns
    colSpan={props.colSpan}
    {...{ [GRID_COL_INDEX_ATTRIBUTE]: 0 }}
  >
    <Button
      themeColor={"primary"}
      fillMode="outline"
      onClick={setPurData}
      icon="edit"
    ></Button>
  </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
    </>
  );
};

const MA_B2800W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();

  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  const [purInfo, setPutInfo] = useState<TPurData>({
    purnum: "",
    purseq: 0,
    recnum: "",
  });

  useEffect(() => {
    if(purInfo.purnum != "" && purInfo.recnum != "") {
      setSelectedState({ [purInfo.recnum]: true });
      
      setDetailFilters((prev) => ({
        ...prev,
        purnum: purInfo.purnum,
        purseq: purInfo.purseq,
      }));
  
      setWindowVisible(true);
    }
  }, [purInfo]);
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
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        inkind: defaultOption.find((item: any) => item.id === "inkind")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
        finyn: defaultOption.find((item: any) => item.id === "finyn").valueCode,
        doexdiv: defaultOption.find((item: any) => item.id === "doexdiv")
          .valueCode,
        purdt: defaultOption.find((item: any) => item.id === "purdt").valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA020,L_BA005,L_BA061,L_BA015",
    //화폐단위, 내수구분, 품목계정, 수량단위
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [doexdivListData, setDoexdivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemacntListData, setItemacntListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [amtunitListData, setAmtunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const doexdivQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA005")
      );
      const itemacntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA061")
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
      );
      const amtunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA020")
      );
      fetchQuery(amtunitQueryStr, setAmtunitListData);
      fetchQuery(doexdivQueryStr, setDoexdivListData);
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [windowVisible, setWindowVisible] = useState<boolean>(false);

  const [workType, setWorkType] = useState<"N" | "U">("N");
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

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
    orgdiv: "01",
    location: "",
    position: "",
    itemcd: "",
    itemnm: "",
    custcd: "",
    custnm: "",
    purdt: "",
    frdt: new Date(),
    todt: new Date(),
    finyn: "N",
    inkind: "",
    purnum: "",
    purseq: 0,
    chklateyn: false,
    poregnum: "",
    project: "",
    doexdiv: "",
    pgNum: 1,
    isSearch: true,
    find_row_value: "",
  });

  const [detailFilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    purnum: "",
    purseq: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_MA_B2800W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "LIST",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_position": filters.position,
      "@p_custcd": filters.custcd,
      "@p_custnm": filters.custnm,
      "@p_itemcd": filters.itemcd,
      "@p_itemnm": filters.itemnm,
      "@p_purdt": filters.purdt,
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
      "@p_finyn": filters.finyn,
      "@p_inkind": filters.inkind,
      "@p_purnum": filters.purnum,
      "@p_purseq": filters.purseq,
      "@p_chklateyn":
        filters.chklateyn == true
          ? "Y"
          : filters.chklateyn == false
          ? "N"
          : filters.chklateyn,
      "@p_poregnum": filters.poregnum,
      "@p_project": filters.project,
      "@p_doexdiv": filters.doexdiv,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async (filters : any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
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
            (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
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
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  let gridRef : any = useRef(null); 

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        setSelectedState({ [firstRowData.num]: true });

        setDetailFilters((prev) => ({
          ...prev,
          purnum: firstRowData.purnum,
          purseq: firstRowData.purseq,
        }));
      }
    }
  }, [mainDataResult]);

  //그리드 리셋
  const resetAllGrid = () => {
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

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setDetailFilters((prev) => ({
      ...prev,
      purnum: selectedRowData.purnum,
      purseq: selectedRowData.purseq,
    }));
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
      <td
        colSpan={props.colSpan}
        className={"k-grid-footer-sticky"}
        style={props.style}
        {...{ [GRID_COL_INDEX_ATTRIBUTE]: 2 }}
      >
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  interface ICustData {
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B2800W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "MA_B2800W_001");
      } else if (
        filters.purdt == null ||
        filters.purdt == "" ||
        filters.purdt == undefined
      ) {
        throw findMessage(messagesData, "MA_B2800W_002");
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
  };

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const pageChange = (event:GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch : true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"purnum"}
        title={"발주번호"}
        width="150px"
        locked={true}
      />
    );
    array.push(
      <GridColumn
        field={"purdt"}
        locked={true}
        editable={false}
        title={"발주일자"}
        cell={CustomLockedCell}
        footerCell={mainTotalFooterCell}
        width="120px"
      />
    );
    array.push(
      <GridColumn
        field={"inexpdt"}
        locked={true}
        editable={false}
        title={"입고요청일"}
        cell={CustomLockedCell}
        width="120px"
      />
    );
    array.push(
      <GridColumn field={"d_day"} locked={true} title={"D-DAY"} width="80px" />
    );
    array.push(
      <GridColumn field={"custnm"} locked={true} title={"업체"} width="150px" />
    );
    array.push(
      <GridColumn
        field={"itemnm"}
        locked={true}
        title={"품목명"}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"insiz"} locked={true} title={"규격"} width="150px" />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"qty"}
        title={"수량"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"unp"}
        title={"단가"}
        width="100px"
        cell={NumberCell}
      />
    );
    array.push(
      <GridColumn
        field={"wonamt"}
        title={"원화금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(<GridColumn field={"amtunit"} title={"화폐"} width="150px" />);
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"delaydt"}
        title={"구매리드일수"}
        width="100px"
        cell={CenterCell}
      />
    );
    array.push(
      <GridColumn
        field={"indt"}
        title={"입고일"}
        width="120px"
        cell={DateCell}
      />
    );
    array.push(
      <GridColumn
        field={"inqty"}
        title={"수량"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"inamt"}
        title={"원화금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(<GridColumn field={"amtunit"} title={"화폐"} width="150px" />);
    return array;
  };

  const createColumn4 = () => {
    const array = [];

    array.push(
      <GridColumn
        field={"janqty"}
        title={"수량"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    array.push(
      <GridColumn
        field={"janamt"}
        title={"원화금액"}
        width="100px"
        cell={NumberCell}
        footerCell={gridSumQtyFooterCell}
      />
    );
    return array;
  };

  const createColumn5 = () => {
    const array = [];

    array.push(
      <GridColumn field={"doexdiv"} title={"내수구분"} width="100px" />
    );
    array.push(
      <GridColumn
        field={"finyn"}
        title={"완료여부"}
        width="100px"
        cell={CheckBoxCell}
      />
    );
    array.push(<GridColumn field={"remark"} title={"비고"} width="150px" />);
    return array;
  };

  const CommandCell = (props: GridCellProps) => {
    const onEditClick = () => {
      //요약정보 행 클릭, 디테일 팝업 창 오픈 (수정용)
      const rowData = props.dataItem;
      setSelectedState({ [rowData.recnum]: true });
      
      setDetailFilters((prev) => ({
        ...prev,
        purnum: rowData.purnum,
        purseq: rowData.purseq,
      }));

      setWindowVisible(true);
    };

    return (
      <td
        style={props.style} // this applies styles that lock the column at a specific position
        className={props.className} // this adds classes needed for locked columns
        colSpan={props.colSpan}
        {...{ [GRID_COL_INDEX_ATTRIBUTE]: 0 }}
      >
        <Button
          themeColor={"primary"}
          fillMode="outline"
          onClick={() => onEditClick}
          icon="edit"
        ></Button>
      </td>
    );
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
  const customCellRender2 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit2}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender2 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit2}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit2 = (dataItem: any, field: string) => {
      if (field == "") {
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
  
        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      }
  };

  const exitEdit2 = () => {
    const newData = mainDataResult.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  
  return (
    <>
      <TitleContainer>
        <Title>발주대비입고현황</Title>

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
              <th colSpan={3}>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="purdt"
                    value={filters.purdt}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="name"
                    valueField="code"
                    className="required"
                  />
                )}
              </th>
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
              <th>발주번호</th>
              <td>
                <Input
                  name="purnum"
                  type="text"
                  value={filters.purnum}
                  onChange={filterInputChange}
                />
              </td>
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
            </tr>
            <tr>
              <th>업체코드</th>
              <td>
                <div className="filter-item-wrap">
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
                </div>
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
              <th>사업부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="position"
                    value={filters.position}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>PO번호</th>
              <td>
                <Input
                  name="poregnum"
                  type="text"
                  value={filters.poregnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>내수구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="doexdiv"
                    value={filters.doexdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
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
              <th>입고유형</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="inkind"
                    value={filters.inkind}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>프로젝트</th>
              <td>
                <Input
                  name="project"
                  type="text"
                  value={filters.project}
                  onChange={filterInputChange}
                />
              </td>
              <th>지연미입고건</th>
              <td>
                <Checkbox
                  name="chklateyn"
                  value={filters.project}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <FormContext.Provider
          value={{
            purInfo,
            setPutInfo,
          }}
        >
      <GridContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
        >
          <GridTitleContainer>
            <GridTitle>발주대비입고자료</GridTitle>
          </GridTitleContainer>
          <Grid
            style={{ height: "73.8vh" }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                doexdiv: doexdivListData.find(
                  (item: any) => item.sub_code === row.doexdiv
                )?.code_name,
                amtunit: amtunitListData.find(
                  (item: any) => item.sub_code === row.amtunit
                )?.code_name,
                finyn: row.finyn == "Y" ? true : false,
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
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onItemChange={onMainItemChange}
            cellRender={customCellRender2}
            rowRender={customRowRender2}
            editField={EDIT_FIELD}
          >
            <GridColumn cell={ColumnCommandCell} locked={true} width="60px" />
            <GridColumn locked={true} title="자료">
              {createColumn()}
            </GridColumn>
            <GridColumn title="발주">{createColumn2()}</GridColumn>
            <GridColumn title="입고">{createColumn3()}</GridColumn>
            <GridColumn title="미입고">{createColumn4()}</GridColumn>
            <GridColumn title="">{createColumn5()}</GridColumn>
          </Grid>
        </ExcelExport>
      </GridContainer>
      </FormContext.Provider>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
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
      {windowVisible && (
        <MA_B2800W_Window setVisible={setWindowVisible} para={detailFilters} />
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

export default MA_B2800W;
