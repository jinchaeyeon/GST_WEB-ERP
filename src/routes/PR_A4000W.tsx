import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Grid,
    GridColumn,
    GridDataStateChangeEvent,
    GridSelectionChangeEvent,
    getSelectedState,
    GridFooterCellProps,
    GridCellProps,
    GridItemChangeEvent,
    GridPageChangeEvent,
  } from "@progress/kendo-react-grid";
import { gridList } from "../store/columns/PR_A4000W_C";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { 
  ButtonContainer, 
  ButtonInInput, 
  FilterBox, 
  FormBoxWrap, 
  FormBox,
  GridContainer, 
  GridContainerWrap, 
  GridTitle,
  GridTitleContainer, 
  Title, 
  TitleContainer, 
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import FilterContainer from "../components/Containers/FilterContainer";
import { 
  UseBizComponent, 
  UseCustomOption, 
  UseGetValueFromSessionItem, 
  UseMessages, 
  UseParaPc, 
  UsePermissions, 
  convertDateToStr, 
  convertDateToStrWithTime2, 
  findMessage, 
  getGridItemChangedData, 
  getQueryFromBizComponent, 
  handleKeyPressSearch, 
  setDefaultDate 
} from "../components/CommonFunction";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import NumberCell from "../components/Cells/NumberCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../components/CommonString";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isLoading, sessionItemState } from "../store/atoms";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import PlanWindow from "../components/Windows/PR_A4000W_Plan_Window";
import DetailWindow from "../components/Windows/PR_A4000W_Window";
import { bytesToBase64 } from "byte-base64";
import CenterCell from "../components/Cells/CenterCell";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import MonthCalendar from "../components/Calendars/MonthCalendar";

const DATA_ITEM_KEY = "num";
const DETAIL_ITEM_KEY = "num";
const NumberField = ["qty", "badqty", "time"];
const CustomComboField = ["proccd", "prodmac", "prodemp", "qtyunit", "itemacnt"];
const CeneterField = ["strtime", "endtime", "ordnum", "gb"];

let temp = 0;
let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_PR010, L_fxcode, L_sysUserMaster_001, L_BA015, L_BA061", setBizComponentData);
  //공정, 설비, 작업자, 수량단위, 품목계정

  const field = props.field ?? "";
  const bizComponentIdVal = 
    field === "proccd"
      ? "L_PR010"
      : field === "prodmac"
      ? "L_fxcode"
      : field === "prodemp"
      ? "L_sysUserMaster_001"
      : field === "qtyunit"
      ? "L_BA015"
      : field === "itemacnt"
      ? "L_BA061"
      : "";
  
  const fieldName = field === "prodemp" 
                      ? "user_name" 
                      : field === "prodmac"
                      ? "fxfull"
                      : undefined;
  const fieldValue = field === "prodemp" 
                      ? "user_id" 
                      : field === "prodmac"
                      ? "fxcode"
                      : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell 
      bizComponent={bizComponent} 
      textField={fieldName}
      valueField={fieldValue}
      {...props} />
  ) : (
    <td />
  );
};

const PR_A4000W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter1 = getter(DETAIL_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [sessionItem] = useRecoilState(sessionItemState);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

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

    setDetailFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });

    setPage(initialPageState);
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
        frdt: setDefaultDate(customOptionData, "frdt"),     // 생산실적관리 일자
        todt: setDefaultDate(customOptionData, "todt"),     // 생산실적관리 일자
        frdt1: setDefaultDate(customOptionData, "frdt1"),   // 가동-비가동 일자
        todt1: setDefaultDate(customOptionData, "todt1"),   // 가동-비가동 일자
        prodemp: defaultOption.find((item: any) => item.id === "prodemp")
          .valueCode,
        itemacnt: defaultOption.find((item: any) => item.id === "itemacnt")
          .valueCode,
        dptcd: defaultOption.find((item: any) => item.id === "dptcd")
          .valueCode,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        prodmac: defaultOption.find((item: any) => item.id === "prodmac")
          .valueCode,
        proccd: defaultOption.find((item: any) => item.id === "proccd")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_fxcode, L_sysUserMaster_001, L_BA015, L_PR010, L_BA002",
    setBizComponentData
  );

  const [prodmacListData, setProdmacListData] = React.useState([
    { fxcode: "", fxfull: "" },
  ]);
  const [prodempListData, setProdempListData] = React.useState([
    { user_id: "", user_name: "" },
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const prodmacQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_fxcode")
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_sysUserMaster_001"
        )
      );
      fetchQuery(prodmacQueryStr, setProdmacListData);
      fetchQuery(prodempQueryStr, setProdempListData);
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

  const [tabSelected, setTabSelected] = React.useState(0);
  const handleSelectTab = (e: any) => {
    resetAllGrid();
    setTabSelected(e.selected);
    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      })); 
    } else if (tabSelected == 1) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      })); 
      setDetailFilters((prev) => ({
        ...prev,
        isSearch: true,
      })); 
    } else {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      })); 
    }
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [detailDataState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [detailselectedState, setDetailselectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);
  const [detailWindowVisible, setDetailWindowVisible] = useState<boolean>(false);
  const [planWindowVisible, setPlanWindowVisible] = useState<boolean>(false);
  const [prodtime, setProdTime] = useState<string>("");
  const [stoptime, setStopTime] = useState<string>("");
  const [prodrate, setProdRate] = useState<string>("");
  const [stoprate, setStopRate] = useState<string>("");

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  const [rekey, setRekey] = useState("");
  const CommandCell=(props: GridCellProps) => {
    const onEditClick =() => {
      // 행 클릭, 디테일 팝업 창 오픈 
      const rowData = props.dataItem;
      setSelectedState({ [rowData[DATA_ITEM_KEY]]: true });
      setRekey(rowData.rekey);

      // 실적번호가 없을 경우 메세지처리
      // 실적번호가 존재하지 않습니다. 실적을 먼저 저장해주세요.
      try {
        if (rowData.rekey == null || rowData.rekey == "") 
        {
          setDetailWindowVisible(false);  
          throw findMessage(messagesData, "PR_A4000W_003"); 
        } else {
          setDetailWindowVisible(true);
        }
      } catch (e) {
        alert(e);
      }
    };
    
    return(
      <>
        {props.rowType === "groupHeader" ? null : (
          <td className="k-command-cell">
            <Button
              className="k-grid-edit-command"
              themeColor={"primary"}
              onClick={onEditClick}
            >
              상세정보
            </Button>
          </td>
        )}
      </>
    );
  };

  const reloadData = (saveyn: string | undefined) => {
    let valid = false;

    mainDataResult.data.map((item: any) => {
      if (item.rowstatus != null || item.rowstauts !== undefined){
        valid = true;
      }
    });

    // rowstatus 하나라도 값이 있으면 조회 X (수정된 데이터가 조회로 인해 초기화 되지 않도록)
    if (!valid) {
      if (saveyn == "Y" && (saveyn !== undefined)) {  // 저장했을 경우에만 조회
        resetAllGrid();
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
        })); 
      }
    }
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "",
    frdt: new Date(),
    frdt1: new Date(),
    todt: new Date(),
    todt1: new Date(),
    prodemp: "",
    prodmac: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    lotnum: "",
    rekey: "",
    plankey: "",
    gokey: "",
    proccd: "",
    yyyymm: new Date(),
    ordnum: "",
    dptcd: "",
    location: "",
    itemacnt: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [detailfilters, setDetailFilters] = useState({
    pgSize: PAGE_SIZE,
    prodmac: "",
    prodemp: "",
    pgNum: 1,
    isSearch: true,
  });

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
  };

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    // 조회조건 세팅
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  let gridRef: any = useRef(null);
  let gridRef2: any = useRef(null);
  
  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code === "orgdiv"
        )?.value,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_lotnum": filters.lotnum,
        "@p_rekey": filters.rekey,
        "@p_plankey": filters.plankey,
        "@p_gokey": filters.gokey,
        "@p_proccd": filters.proccd,
        "@p_yyyymm": "",
        "@p_ordnum": filters.ordnum,
        "@p_dptcd": filters.dptcd,
        "@p_location": filters.location,
        "@p_itemacnt": filters.itemacnt,
      },
    };

    const parameters1: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "LIST",
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code === "orgdiv"
        )?.value,
        "@p_frdt": convertDateToStr(filters.frdt1),
        "@p_todt": convertDateToStr(filters.todt1),
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": "",
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": "",
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": "",
        "@p_itemacnt": "",
      },
    };
  
    const parameters2: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "TAB3LIST",
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code === "orgdiv"
        )?.value,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": "",
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": convertDateToStr(filters.yyyymm).substring(0, 6),
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": "",
        "@p_itemacnt": "",
      },
    };

    try {
      if (tabSelected == 0) {
        data = await processApi<any>("procedure", parameters);
      } else if (tabSelected == 1) {
        data = await processApi<any>("procedure", parameters1);
      } else {
        data = await processApi<any>("procedure", parameters2);
      }
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      if (tabSelected == 0) {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;

        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.num == filters.find_row_value
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
            : rows.find((row: any) => row.num == filters.find_row_value);

          if (selectedRow != undefined) {
            setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
          } else {
            setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
          }
        }
      } else if (tabSelected == 1) {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;

        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.num == filters.find_row_value
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
              : rows.find((row: any) => row.num == filters.find_row_value);
              if(selectedRow != undefined) {
                setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
                setDetailFilters((prev) => ({
                  ...prev,
                  prodmac: selectedRow.prodmac,
                  prodemp: selectedRow.prodemp,
                  isSearch: true,
                }));
              } else {
                setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
                setDetailFilters((prev) => ({
                  ...prev,
                  prodmac: rows[0].prodmac,
                  prodemp: rows[0].prodemp,
                  isSearch: true,
                }));
              }
        }

      } else {
        const totalRowCnt = data.tables[0].TotalRowCount;
        const rows = data.tables[0].Rows;

        if (filters.find_row_value !== "") {
          // find_row_value 행으로 스크롤 이동
          if (gridRef.current) {
            const findRowIndex = rows.findIndex(
              (row: any) => row.num == filters.find_row_value
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
              : rows.find((row: any) => row.num == filters.find_row_value);
              if(selectedRow != undefined) {
                setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
              } else {
                setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
              }
        }
      }
    } else {
      console.log("[오류발생]")
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

  const fetchDetailGrid = async () => {
    if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const detailParameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: detailfilters.pgNum,
      pageSize: detailfilters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": sessionItem.find(
          (sessionItem) => sessionItem.code === "orgdiv"
        )?.value,
        "@p_frdt": convertDateToStr(filters.frdt1),
        "@p_todt": convertDateToStr(filters.todt1),
        "@p_prodemp": detailfilters.prodemp,
        "@p_prodmac": detailfilters.prodmac,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": "",
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": "",
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": "",
        "@p_itemacnt": "",
      },
    };
    try {
      data = await processApi<any>("procedure", detailParameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      const rateRowCnt = data.tables[1].TotalRowCount;
      const rate = data.tables[1].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.num == filters.find_row_value
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

      // FormBox 가동률 값 세팅
      if (rateRowCnt > 0 ) {
        rate.map((item: any) => {
          setProdTime(item.prodtime);
          setStopTime(item.stoptime);
          setProdRate(item.prodrate);
          setStopRate(item.stoprate);
        });
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
            : rows.find((row: any) => row.num == filters.find_row_value);

        if (selectedRow != undefined) {
          setDetailselectedState({ [selectedRow[DETAIL_ITEM_KEY]]: true });
        } else {
          setDetailselectedState({ [rows[0][DETAIL_ITEM_KEY]]: true });
        }
      } else {
        console.log("[에러발생]");
        console.log(data);
      }
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
  
  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch && 
      permissions !== null
    ) {
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  useEffect(() => {
    if (
      customOptionData != null &&
      detailfilters.isSearch &&
      permissions !== null
    ) {
      setDetailFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false}));
      fetchDetailGrid();
    }
  }, [detailfilters, permissions]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  useEffect(() => {
    // targetRowIndex 값 설정 후 그리드 데이터 업데이트 시 해당 위치로 스크롤 이동
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult]);

  // 메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  // 그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setDetailDataResult(process([], detailDataState));

    // 가동-비가동 FormBox 빈값 처리
    setProdTime("");
    setStopTime("");
    setProdRate("");
    setStopRate("");
    
  };

  // 메인 그리드 선택 이벤트
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected == 0) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);
    } else if (tabSelected == 1 ) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);
      setDetailDataResult(process([], detailDataState));
      const selectedIdx = event.startRowIndex;

      let dataRow: any[] = [];

      // 설비와 작업자 코드를 갖고 오기 위함
      mainDataResult.data.map((item: any) => {
        //selectedIdx는 0부터 시작, num은 1부터 시작
        if (selectedIdx + 1 === item.num) 
        {
          dataRow.push(item);
        }
      });

      setDetailFilters((prev) => ({
        ...prev,
        prodmac: dataRow[0]["prodmac"],
        prodemp: dataRow[0]["prodemp"],
        pgNum: 1,
        isSearch: true,
      }));
    } else {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);      
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: detailselectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setDetailselectedState(newSelectedState);
  };

  // 엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  // 그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };

  // 그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({...prev, sort: e.sort}));
  };
  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({...prev, sort: e.sort}));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };
  const onDetailItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      detailDataResult,
      setDetailDataResult,
      DETAIL_ITEM_KEY
    );
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {mainDataResult.total}건
      </td>
    );
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {detailDataResult.total}건
      </td>
    );
  };


  const gridSumQtyFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
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

  const gridSumQtyFooterCell1 = (props: GridFooterCellProps) => {
    let sum = 0;
    detailDataResult.data.forEach((item) =>
      props.field !== undefined ? (sum += item[props.field]) : ""
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4000W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4000W_001");
      } else {
        resetAllGrid();
        setPage(initialPageState); // 페이지 초기화
        setPage2(initialPageState); // 페이지 초기화
        setFilters((prev) => ({ ...prev, pgNum: 1, find_row_value: "", isSearch: true }));
        setDetailFilters((prev) => ({ ...prev, pgNum: 1, find_row_value: "", isSearch: true }));
      }
    } catch (e) {
      alert(e);
    }
  };

  const enterEdit = (dataItem: any, field: string) => {
    if (
      field == "prodemp" ||
      field == "prodmac" ||
      field == "strtime" ||
      field == "endtime" ||
      field == "qty"
    ) {
      const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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

  const exitEdit = () => {
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

  const onRemoveClick = async () => {
    
    let deletedRows: any[] = [];

    mainDataResult.data.forEach((item: any) =>{
      if (selectedState[item[DATA_ITEM_KEY]]){
        deletedRows.push(item); //선택된 데이터
      }
    });

    type TRowsArr = {
      rekey: string[];
    };

    let rowsArr: TRowsArr = {
      rekey: [],
    };

    deletedRows.forEach((item: any) => {
      const { rekey = "" } = item;

      rowsArr.rekey.push(rekey);
    });

    const paraSaved: Iparameters = {
      procedureName: "P_PR_A4000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "PROD",
        "@p_orgdiv": "01",
        "@p_rowstatus": "D",
        "@p_rekey": rowsArr.rekey.join("|"),
        "@p_location": "01",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_qty": 0,
        "@p_qtyunit": "",
        "@p_lotnum": "",
        "@p_strtime": convertDateToStrWithTime2(new Date()),
        "@p_endtime": convertDateToStrWithTime2(new Date()),
        "@p_remark": "",
        "@p_prodemp1": "",
        "@p_prodemp2": "",
        "@p_keyfield": "",
        "@p_div": "",
        "@p_itemcd": "",
        "@p_proccd": "",
        "@p_baddt": "",
        "@p_badcd": "",
        "@p_proddt": "",
        "@p_custdiv": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4000W",
      },
    };
  
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    resetAllGrid();

  };
  const onSaveClick = async () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus === "N" || item.rowstatus === "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length === 0) return false;

    // 검증
    let valid = true;
    try {
      dataItem.forEach((item: any) => {
        if (new Date(item.strtime).getTime() > new Date(item.endtime).getTime())
        {
          // 시작시간이 종료시간 보다 큽니다. 시간을 조정해주세요.
          throw findMessage(messagesData, "PR_A4000W_002");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    type TRowsArr = {
      rowstatus: string[];
      rekey: string[];
      location: string[];
      prodemp: string[];
      prodmac: string[];
      qty: string[];
      qtyunit: string[];
      lotnum: string[];
      strtime: string[];
      endtime: string[];
      remark: string[];
      prodemp1: string[];
      prodemp2: string[];
      keyfield: string[];
      div: string[];
      itemcd: string[];
      proccd: string[];
      baddt: string[];
      badcd: string[];
      proddt: string[];
    };

    let rowsArr: TRowsArr = {
      rowstatus: [],
      rekey: [],
      location: [],
      prodemp: [],
      prodmac: [],
      qty: [],
      qtyunit: [],
      lotnum: [],
      strtime: [],
      endtime: [],
      remark: [],
      prodemp1: [],
      prodemp2: [],
      keyfield: [],
      div: [],
      itemcd: [],
      proccd: [],
      baddt: [],
      badcd: [],
      proddt: [],
    };

    dataItem.forEach((item: any) => {
      const { rowstatus, rekey, location, prodemp, prodmac, qty, qtyunit, lotnum,
              strtime, endtime, remark, prodemp1, prodemp2, plankey, div, itemcd,
              proccd, baddt, badcd, proddt} = item;
          
      rowsArr.rowstatus.push(rowstatus);
      rowsArr.rekey.push(rekey);
      rowsArr.location.push(location);
      rowsArr.prodemp.push(prodemp);
      rowsArr.prodmac.push(prodmac);
      rowsArr.qty.push(qty);
      rowsArr.qtyunit.push(qtyunit);
      rowsArr.lotnum.push(lotnum);
      rowsArr.strtime.push(strtime);
      rowsArr.endtime.push(endtime);
      rowsArr.remark.push(remark);
      rowsArr.prodemp1.push(prodemp1);
      rowsArr.prodemp2.push(prodemp2);
      rowsArr.keyfield.push(plankey);
      rowsArr.div.push(div);
      rowsArr.itemcd.push(itemcd);
      rowsArr.proccd.push(proccd);
      rowsArr.baddt.push(baddt);
      rowsArr.badcd.push(badcd);
      rowsArr.proddt.push(proddt);
    });

    const paraSaved: Iparameters = {
      procedureName: "P_PR_A4000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "PROD",
        "@p_orgdiv": "01",
        "@p_rowstatus": rowsArr.rowstatus.join("|"),
        "@p_rekey": rowsArr.rekey.join("|"),
        "@p_location": rowsArr.location.join("|"),
        "@p_prodemp": rowsArr.prodemp.join("|"),
        "@p_prodmac": rowsArr.prodmac.join("|"),
        "@p_qty": rowsArr.qty.join("|"),
        "@p_qtyunit": rowsArr.qtyunit.join("|"),
        "@p_lotnum": rowsArr.lotnum.join("|"),
        "@p_strtime": rowsArr.strtime.join("|"),
        "@p_endtime": rowsArr.endtime.join("|"),
        "@p_remark": rowsArr.remark.join("|"),
        "@p_prodemp1": rowsArr.prodemp1.join("|"),
        "@p_prodemp2": rowsArr.prodemp2.join("|"),
        "@p_keyfield": rowsArr.keyfield.join("|"),
        "@p_div": rowsArr.div.join("|"),
        "@p_itemcd": rowsArr.itemcd.join("|"),
        "@p_proccd": rowsArr.proccd.join("|"),
        "@p_baddt": rowsArr.baddt.join("|"),
        "@p_badcd": rowsArr.badcd.join("|"),
        "@p_proddt": rowsArr.proddt.join("|"),
        "@p_custdiv": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4000W",
      },
    };
   
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    resetAllGrid();
    fetchMainGrid();
  };

  const onPlanWndClick = () => {
    setPlanWindowVisible(true);
  }

  const setCopyData = (data: any) => {
    mainDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
    });

    try {
      data.map((item: any) => {
        const newData = {
          [DATA_ITEM_KEY]: ++temp,
          rowstatus: "N",
          proccd: item.proccd,
          itemcd: item.itemcd,
          itemnm: item.itemnm,
          insiz: item.insiz,
          qty: item.qty,
          badqty: 0,
          qtyunit: item.qtyunit,
          plankey: item.plankey,
          strtime: convertDateToStrWithTime2(new Date()),
          endtime: convertDateToStrWithTime2(new Date()),
        };

        setMainDataResult((prev) => {
          return {
            data: [newData, ...prev.data],
            total: prev.total + data.length,
          };
        });

        setPage((prev) => ({
          ...prev,
          skip: 0,
          take: prev.take + 1,
        }));

        setSelectedState({ [newData[DATA_ITEM_KEY]]: true });
      });
    } catch (e) {
      alert(e);
    }
  };

  const createDateColumn = () => {
    const array = [];
    for (var i = 1; i <= 31; i++) {
      const num = i < 10 ? "0" + i : i + "";
      array.push(
        <GridColumn
          key={i}
          field={num}
          title={num}
          width="70px"
          cell={NumberCell}
        />
      );
    }
    return array;
  };

  return(
    <>
      <TitleContainer>
        <Title>생산실적관리</Title>
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
        <TabStrip
          selected={tabSelected}
          onSelect={handleSelectTab}
          style={{ width: "100%" }}
        >
          <TabStripTab title = "생산실적관리">
            <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                  <tr>
                      <th>생산일자</th>
                      <td>
                        <CommonDateRangePicker
                          value={{
                            start: filters.frdt,
                            end: filters.todt,
                          }}
                          onChange={(e:{ value: {start: any; end: any}}) =>
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
                      <th>LOT NO</th>
                      <td>
                        <Input
                          name="lotnum"
                          type="text"
                          value={filters.lotnum}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>부서</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="dptcd"
                            value={filters.dptcd}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="dptnm"
                            valueField="dptcd"
                          />
                        )}
                      </td>
                      <th>생산실적번호</th>
                      <td>
                        <Input
                          name="rekey"
                          type="text"
                          value={filters.rekey}
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
                      <th>생산계획번호</th>
                      <td>
                        <Input
                          name="plankey"
                          type="text"
                          value={filters.plankey}
                          onChange={filterInputChange}
                        />
                      </td>
                  </tr>
                  <tr>
                    <th>작업자</th>
                      <td>
                        {customOptionData !== null &&(
                          <CustomOptionComboBox 
                              name="prodemp"
                              value={filters.prodemp}
                              customOptionData={customOptionData}
                              changeData={filterComboBoxChange}
                              textField="user_name"
                              valueField="user_id"
                          />
                        )}
                      </td>
                      <th>설비</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="prodmac"
                            value={filters.prodmac}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                            textField="fxnm"
                            valueField="fxcode"
                          />
                        )}
                      </td>
                      <th>공정</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name= "proccd"
                            value={filters.proccd}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                      <th>수주번호</th>
                      <td>
                        <Input
                          name="ordkey"
                          type="text"
                          value={filters.ordnum}
                          onChange={filterInputChange}
                        />
                      </td>
                      <th>작업지시번호</th>
                      <td>
                        <Input
                          name="gokey"
                          type="text"
                          value={filters.gokey}
                          onChange={filterInputChange}
                        />
                      </td>
                  </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>생산실적내역</GridTitle>
                <ButtonContainer>
                  <Button
                    onClick={onPlanWndClick}
                    fillMode="outline"
                    themeColor={"primary"}
                    icon="folder-open"
                  >
                    생산계획참조
                  </Button>
                  <Button
                    onClick={onRemoveClick}
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
                style={{ height: "62vh"}}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                  })),
                  mainDataState
                )}
                {...mainDataState}
                onDataStateChange={onMainDataStateChange}
                // 선택기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange}
                // 스크롤 조회기능
                fixedScroll={true}
                total={mainDataResult.total}
                skip={page.skip}
                take={page.take}
                pageable={true}
                onPageChange={pageChange}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef}
                rowHeight={30}
                // 정렬기능
                sortable={true}
                onSortChange={onMainSortChange}
                // 컬럼순서조정
                reorderable={true}
                // 컬럼너비조정
                resizable={true}
                //incell 수정 기능
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="rowstatus"
                  title=" "
                  width="40px"
                  editable={false}
                />
                <GridColumn
                  cell={CommandCell}
                  width="95px"
                  footerCell={mainTotalFooterCell}
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
                          width={item.width}
                          cell={
                           NumberField.includes(item.fieldName)
                              ? NumberCell
                              : CustomComboField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : undefined
                          }
                          footerCell={
                            NumberField.includes(item.fieldName)
                              ? gridSumQtyFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
          </TabStripTab>
          <TabStripTab title = "가동-비가동">
            <FilterContainer>
              <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                <tbody>
                  <tr>
                    <th>기간</th>
                    <td>
                      <CommonDateRangePicker
                          value={{
                            start: filters.frdt1,
                            end: filters.todt1,
                          }}
                          onChange={(e:{ value: {start: any; end: any}}) =>
                              setFilters((prev) => ({
                                  ...prev,
                                  frdt1: e.value.start,
                                  todt1: e.value.end,
                              }))
                          }
                          className="required" 
                      /> 
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                </tbody>
              </FilterBox>
            </FilterContainer>
            <GridContainerWrap>
              <GridContainer width = {'20%'}>
                <GridTitleContainer>
                  <GridTitle>작업정보</GridTitle>
                </GridTitleContainer>
                <Grid
                  style={{ height: "73.3vh"}}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      prodmac: prodmacListData.find(
                        (items: any) => items.fxcode === row.prodmac
                      )?.fxfull,
                      prodemp: prodempListData.find(
                        (items: any) => items.user_id === row.prodemp
                      )?.user_name,
                    [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
                  // 선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  // 스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  pageable={true}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
                  rowHeight={30}
                  // 정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  // 컬럼순서조정
                  reorderable={true}
                  // 컬럼너비조정
                  resizable={true}
                  editField={EDIT_FIELD}
                >
                  {customOptionData !== null &&
                    customOptionData.menuCustomColumnOptions["grdList1"].map(
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
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
                </Grid>
              </GridContainer>
              <GridContainer width={`calc(80% - ${GAP}px)`}>
                <FormBoxWrap 
                  style={{height: "50px"}}
                  border={true}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <td>가동시간 :</td>
                        <td style={{ fontWeight: "bold", fontSize: "12pt" }}>{prodtime}</td>
                        <th>설비가동률(%) :</th>
                        <td style={{ fontWeight: "bold", fontSize: "12pt" }}>{prodrate}</td>
                        <th>비가동시간 :</th>
                        <td style={{ fontWeight: "bold", fontSize: "12pt" }}>{stoptime}</td>
                        <th>설비비가동률(%) :</th>
                        <td style={{ fontWeight: "bold", fontSize: "12pt" }}>{stoprate}</td>
                        <th></th>
                        <td></td>
                        <th></th>
                        <td></td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>작업내용</GridTitle>
                  </GridTitleContainer>
                  <Grid
                    style={{ height: "67vh"}}
                    data={process(
                      detailDataResult.data.map((row) => ({
                        ...row,
                        [SELECTED_FIELD]: detailselectedState[idGetter1(row)], // 선택된 데이터
                      })),
                      detailDataState
                    )}
                    {...detailDataState}
                    onDataStateChange={onDetailDataStateChange}
                    // 선택 기능
                    dataItemKey={DETAIL_ITEM_KEY}
                    selectedField={SELECTED_FIELD}
                    selectable={{
                      enabled: true,
                      mode: "single",
                    }}
                    onSelectionChange={onDetailSelectionChange}
                    // 스크롤 조회 기능
                    fixedScroll={true}
                    total={detailDataResult.total}
                    skip={page2.skip}
                    take={page2.take}
                    pageable={true}
                    onPageChange={pageChange2}
                  //원하는 행 위치로 스크롤 기능
                    // 정렬기능
                    sortable={true}
                    onSortChange={onDetailSortChange}
                    // 컬럼 순서 조정
                    reorderable={true}
                    // 컬럼 너비 조정
                    resizable={true}
                    onItemChange={onDetailItemChange}
                    editField={EDIT_FIELD}
                  >
                    {customOptionData !== null &&
                      customOptionData.menuCustomColumnOptions["grdList2"].map(
                      (item: any, idx: number) => 
                        item.sortOrder !== -1 && (
                          <GridColumn
                            key={idx}
                            id={item.id}
                            field={item.fieldName}
                            title={item.caption}
                            width={item.width}
                            cell={
                              NumberField.includes(item.fieldName)
                                ? NumberCell
                                : CeneterField.includes(item.fieldName)
                                ? CenterCell
                                : undefined
                            }
                            footerCell={
                              item.sortOrder === 0
                                ? detailTotalFooterCell
                                : NumberField.includes(item.fieldName)
                                ? gridSumQtyFooterCell1
                                : undefined
                            }
                          />
                        )
                    )}
                  </Grid>
                </GridContainer>
              </GridContainer>
            </GridContainerWrap>
          </TabStripTab>
          <TabStripTab title = "일일생산율">
            <FilterContainer>
              <FilterBox>
                <tr>
                  <th>기준년월</th>
                  <td>
                    <DatePicker
                      name="yyyymm"
                      value={filters.yyyymm}
                      format="yyyy-MM"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                      calendar={MonthCalendar}
                    />
                  </td>
                  <th></th>
                  <td></td>
                </tr>
              </FilterBox>
            </FilterContainer>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>작업정보</GridTitle>
              </GridTitleContainer>
              <Grid
                  style={{ height: "73vh" }}
                  data={process(
                    mainDataResult.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState[idGetter(row)],
                    })),
                    mainDataState
                  )}
                  {...mainDataState}
                  onDataStateChange={onMainDataStateChange}
                  // 선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onSelectionChange}
                  // 스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult.total}
                  skip={page.skip}
                  take={page.take}
                  onPageChange={pageChange}
                  //원하는 행 위치로 스크롤 기능
                  ref={gridRef}
                  rowHeight={30}
                  // 정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange}
                  // 컬럼순서조정
                  reorderable={true}
                  // 컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange}
              >
                <GridColumn field="prodmac" title="설비" width="150px" />
                <GridColumn title="일자">{createDateColumn()}</GridColumn>
                <GridColumn 
                  field="총가동시간" 
                  title="총가동시간" 
                  width="100px" 
                  cell={NumberCell}
                  />
                <GridColumn 
                  field="총작업시간" 
                  title="총작업시간" 
                  width="100px" 
                  cell={NumberCell}
                  />
                <GridColumn 
                  field="평균가동률" 
                  title="평균가동률" 
                  width="100px" 
                  cell={NumberCell}
                  />
              </Grid>
            </GridContainer>
          </TabStripTab>
        </TabStrip>
        {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
        />
       )}
        {planWindowVisible && (
          <PlanWindow
            setVisible={setPlanWindowVisible}
            setData={setCopyData}
          />
        )}
        {detailWindowVisible && (
          <DetailWindow
           getVisible={setDetailWindowVisible}
           rekey={rekey}
           reloadData={reloadData}
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
export default PR_A4000W;