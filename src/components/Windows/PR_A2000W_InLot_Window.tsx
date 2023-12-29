import React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { IWindowPosition } from "../../hooks/interfaces";
import { useCallback, useEffect, useState } from "react";
import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../store/atoms";
import { useApi } from "../../hooks/api";
import { 
  GetPropertyValueByName, 
  UseBizComponent, 
  UseCustomOption, 
  UseGetValueFromSessionItem,
  UseParaPc, 
  getGridItemChangedData, 
  getQueryFromBizComponent 
} from "../CommonFunction";
import { 
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD, 
  PAGE_SIZE, 
  SELECTED_FIELD 
} from "../CommonString";
import { 
  BottomContainer, 
  ButtonContainer, 
  GridContainer, 
  GridTitle, 
  GridTitleContainer, 
} from "../../CommonStyled";
import { Button } from "@progress/kendo-react-buttons";
import { 
  Grid, 
  GridColumn, 
  GridDataStateChangeEvent, 
  GridFooterCellProps, 
  GridHeaderCellProps, 
  GridItemChangeEvent, 
  GridPageChangeEvent, 
  GridRowDoubleClickEvent, 
  GridSelectionChangeEvent, 
  getSelectedState 
} from "@progress/kendo-react-grid";
import { Iparameters } from "../../store/types";
import { bytesToBase64 } from "byte-base64";
import CheckBoxCell from "../Cells/CheckBoxCell";
import { Checkbox } from "@progress/kendo-react-inputs";
import { CellRender, RowRender } from "../Renderers/Renderers";
import NumberCell from "../Cells/NumberCell";

type TKendoWindow = {
  setVisible(t: boolean): void;
  plankey: string;
  setData(data: object): void;
  modal?: boolean;
  pathname: string;
};

const DATA_ITEM_KEY =  "num";

const KendoWindow = ({
  setVisible,
  plankey,
  setData,
  modal = false,
  pathname
}: TKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);

  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1100,
    height: 700,
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
    setVisible(false);
  };

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
  
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA015",
    setBizComponentData
  );

  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA015")
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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "INLIST",
    orgdiv: orgdiv,
    location: location,
    proccd: "",
    prodemp: "",
    prodmac: "",
    gonum: "",
    goseq: 0,
    planno: plankey.substring(0, plankey.indexOf("-")),
    planseq: plankey.substring(plankey.indexOf("-") + 1 ),
    itemcd: "",
    itemnm: "",
    finyn: "",
    pgNum: 1,
    isSearch: true,
  });

  const fetchMainGrid = async (filters: any) => {
    let data: any;
    setLoading(true);

    // 조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A2000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_proccd": filters.proccd,
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_gonum": filters.gonum,
        "@p_goseq": filters.goseq,
        "@p_planno": filters.planno,
        "@p_planseq": filters.planseq,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_finyn": filters.finyn,
        "@p_renum": "",
        "@p_reseq": 0,
        "@p_find_row_value": "",
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[에러 발생]");
      console.log(data);
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

  useEffect(() => {
    if (customOptionData != null &&
      filters.isSearch
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        pgNum: 1,
        isSearch: false,
      }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus === "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  // 메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  // 그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
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
    if (field == "chk") {
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

  const onConfirmBtnClick = () => {
    const selectedRowData = mainDataResult.data.find(
      (item) => item.chk === true
    );

    if (selectedRowData.length > 1) {
      alert("투입 소재는 한 건만 가능합니다.");
      return;
    } else if (selectedRowData.length == 0) {
      alert("선택한 투입소재가  없습니다.");
      return;
    }
    
    setData(selectedRowData);
    onClose();
  };

  const onRowDoubleClick = (event: GridRowDoubleClickEvent) => {
    const selectedRowData = mainDataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == event.dataItem.num
    );
    setData(selectedRowData);
    onClose();
  };

  type TRowsArr = {
    initemcd: string[];
    inlotnum: string[];
    now_qty: string[];
    qtyunit: string[];
    gubun: string[];
    proccd: string[];
  };

  // 저장 파라미터 초기값
  const [paraSaved, setParaSaved] = useState({
    workType: "USESTOCK",
    gubun: "",
    initemcd: "",
    inlotnum: "",
    now_qty: "",
    qtyunit: "",
    proccd: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A2000W",
  });

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return ( item.chk == true );
    });

    if (dataItem.length === 0) return false;

    let rowsArr: TRowsArr = {
      initemcd: [],
      inlotnum: [],
      now_qty: [],
      qtyunit: [],
      gubun: [],
      proccd: [],
    };

    dataItem.forEach((item: any) => {
      const { 
        initemcd, 
        inlotnum, 
        now_qty, 
        qtyunit, 
        gubun,
        proccd 
      } = item;

      rowsArr.initemcd.push(initemcd);
      rowsArr.inlotnum.push(inlotnum);
      rowsArr.now_qty.push(now_qty);
      rowsArr.qtyunit.push(qtyunit);
      rowsArr.gubun.push(gubun);
      rowsArr.proccd.push(proccd);
    });

    setParaSaved((prev) => ({
      ...prev,
      workType: "USESTOCK",
      initemcd: rowsArr.initemcd.join("|"),
      inlotnum: rowsArr.inlotnum.join("|"),
      now_qty: rowsArr.now_qty.join("|"),
      qtyunit: rowsArr.qtyunit.join("|"),
      gubun: rowsArr.gubun.join("|"),
      proccd: rowsArr.proccd.join("|"),
    }));
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);

    const parameters: Iparameters = {
      procedureName: "P_PR_A2000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraSaved.workType,
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_renum": "",
        "@p_reseq": 0,
        "@p_gonum": "",
        "@p_goseq": 0,
        "@p_planno": "",
        "@p_planseq": 0,
        "@p_prodmac": "",
        "@p_prodemp": "",
        "@p_proccd": "",
        "@p_qty": 0,
        "@p_badqty": 0,
        "@p_remark": "",
        "@p_gubun_s": paraSaved.gubun,
        "@p_initemcd_s": paraSaved.initemcd,
        "@p_inlotnum_s": paraSaved.inlotnum,
        "@p_inqty_s": paraSaved.now_qty,
        "@p_qtyunit_s": paraSaved.qtyunit,
        "@p_proccd_s": paraSaved.proccd,
        "@p_renum_s": "",
        "@p_reseq_s": "",
        "@p_rowstatus_s": "",
        "@p_badnum_s": "",
        "@p_badseq_s": "",
        "@p_baddt_s": "",
        "@p_badcd_s": "",
        "@p_qty_s": "",
        "@p_remark_s": "",
        "@p_stopnum": "",
        "@p_stopcd": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A2000W",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
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
          pgNum: isLastDataDeleted
            ? prev.pgNum != 1
                ? prev.pgNum - 1
                : prev.pgNum
              : prev.pgNum,
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
      console.log("[에러 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
  };

  useEffect(() => {
    if (paraSaved.initemcd != "") {
      fetchTodoGridSaved();
    }
  }, [paraSaved]);

  return (
    <>
      <Window
        title={"투입LOT선택"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <GridContainer height="58vh">
          <GridTitleContainer>
            <GridTitle>투입가능 소재 리스트</GridTitle>
            <Button
              icon="delete"
              onClick={onSaveClick}
              fillMode={"outline"}
              themeColor={"primary"}
            >
              재공잔량처리
            </Button>
          </GridTitleContainer>
          <Grid
            style={{ height: "calc(100% - 40px)"}}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                qtyunit: qtyunitListData.find(
                  (item: any) => item.sub_code === row.qtyunit
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], // 선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            // 선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onMainSelectionChange}
            // 스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            // 정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            // 컬럼순서조정
            reorderable={true}
            // 컬럼너비조정
            resizable={true}
            onRowDoubleClick={onRowDoubleClick}
            onItemChange={onMainItemChange}
            // incell 수정
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn 
              field="chk" 
              title=" " 
              width="45px" 
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="initemcd"
              title="품목코드"
              width="120px"
              footerCell={mainTotalFooterCell}
            />
            <GridColumn field="initemnm" title="품목명" width="150px" />
            <GridColumn field="inlotnum" title="LOT NO" width="120px" />
            <GridColumn 
              field="now_qty" 
              title="재공량" 
              width="100px" 
              cell={NumberCell}
            />
            <GridColumn 
              field="unitqty" 
              title="단위소요량" 
              width="100px" 
              cell={NumberCell}
            />
            <GridColumn 
              field="procqty" 
              title="재공생산량" 
              width="100px" 
              cell={NumberCell}  
            />
            <GridColumn field="qtyunit" title="단위" width="80px" />
          </Grid>
        </GridContainer>
        <BottomContainer>
          <ButtonContainer>
            <Button 
              themeColor={"primary"} 
              onClick={onConfirmBtnClick}
              fillMode={"outline"}
            >
              확인
            </Button>
            <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
              취소
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
    </>
  );
};

export default KendoWindow;
