import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UseParaPc,
  getGridItemChangedData,
  getQueryFromBizComponent,
  numberWithCommas
} from "../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";

type TData = {
  gonum: string;
  goseq: any;
};
type TKendoWindow = {
  setVisible(t: boolean): void;
  gokey: TData;
  reloadData(saveyn: string): void; // 저장 유무
  modal?: boolean;
};

const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
let deletedMainRows: object[] = [];

const KendoWindow = ({
  setVisible,
  gokey,
  reloadData,
  modal = false,
}: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");

  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
const pc = UseGetValueFromSessionItem("pc");

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 600,
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

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010, L_fxcode, L_sysUserMaster_001, L_BA015",
    setBizComponentData
  );

  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  const [prodmacListData, setProdmacListData] = useState([
    { fxcode: "", fxfull: "" },
  ]);

  const [prodempListData, setProdempListData] = useState([
    { user_id: "", user_name: "" },
  ]);

  const [qtyunitListData, setQtyunitListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_PR010")
      );
      const prodmacQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_fxcode")
      );
      const prodempQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_sysUserMaster_001"
        )
      );
      const qtyunitQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA015")
      );
      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(prodmacQueryStr, setProdmacListData);
      fetchQuery(prodempQueryStr, setProdempListData);
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

    if (data.isSuccess == true) {
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
    workType: "PRODLIST",
    orgdiv: orgdiv,
    location: location,
    gonum: gokey.gonum,
    goseq: gokey.goseq,
    pgNum: 1,
    isSearch: true,
  });

  let gridRef: any = useRef(null);
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
        "@p_proccd": "",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_gonum": filters.gonum,
        "@p_goseq": filters.goseq,
        "@p_planno": "",
        "@p_planseq": 0,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_finyn": "",
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

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.rekey == filters.find_row_value
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
            : rows.find((row: any) => row.rekey == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
      deletedMainRows = [];
    } else {
      console.log("[에러 발생]");
      console.log(data);
    }

    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = mainDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    mainDataResult.data.forEach((item) =>
      props.field !== undefined
        ? (sum += parseFloat(
            item[props.field] == "" || item[props.field] == undefined
              ? 0
              : item[props.field]
          ))
        : 0
    );

    return (
      <td colSpan={props.colSpan} style={{ textAlign: "right" }}>
        {numberWithCommas(sum)}
      </td>
    );
  };

  const onRemoveClick = () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    //삭제 안 할 데이터 newData에 push
    mainDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
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

    setMainDataResult((prev) => ({
      ...prev,
      data: newData,
      total: prev.total - Object.length,
    }));

    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  type TRowsArr = {
    rowstatus: string[];
    renum: string[];
    reseq: string[];
  };

  // 저장 파라미터 초기값
  const [paraSaved, setParaSaved] = useState({
    workType: "D",
    rowstatus: "",
    renum: "",
    reseq: "",
    userid: userId,
    pc: pc,
    form_id: "PR_A2000W",
  });

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    let rowsArr: TRowsArr = {
      rowstatus: [],
      renum: [],
      reseq: [],
    };

    dataItem.forEach((item: any) => {
      const { rowstatus, renum, reseq } = item;

      rowsArr.rowstatus.push(rowstatus);
      rowsArr.renum.push(renum);
      rowsArr.reseq.push(reseq);
    });

    deletedMainRows.forEach((item: any) => {
      const { rowstatus, renum, reseq } = item;

      rowsArr.rowstatus.push(rowstatus);
      rowsArr.renum.push(renum);
      rowsArr.reseq.push(reseq);
    });

    setParaSaved((prev) => ({
      ...prev,
      workType: "D",
      rowstatus: rowsArr.rowstatus.join("|"),
      renum: rowsArr.renum.join("|"),
      reseq: rowsArr.reseq.join("|"),
      userid: userId,
      pc: pc,
      form_id: "PR_A2000W",
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
        "@p_gubun_s": "",
        "@p_initemcd_s": "",
        "@p_inlotnum_s": "",
        "@p_inqty_s": "",
        "@p_qtyunit_s": "",
        "@p_proccd_s": "",
        "@p_renum_s": paraSaved.renum,
        "@p_reseq_s": paraSaved.reseq,
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

    if (data.isSuccess == true) {
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
      reloadData("Y");
    } else {
      console.log("[에러 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraSaved.workType != "") {
      fetchTodoGridSaved();
    }
  }, [paraSaved]);

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
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

  return (
    <Window
      title={"생산계획참조"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>생산실적내역</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onRemoveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="minus"
              title="행 삭제"
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: "43vh" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              proccd: proccdListData.find(
                (items: any) => items.sub_code == row.proccd
              )?.code_name,
              prodemp: prodempListData.find(
                (items: any) => items.user_id == row.prodemp
              )?.user_name,
              prodmac: prodmacListData.find(
                (items: any) => items.fxcode == row.prodmac
              )?.fxfull,
              qtyunit: qtyunitListData.find(
                (items: any) => items.sub_code == row.qtyunit
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
          onItemChange={onMainItemChange}
          // incell 수정
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
          <GridColumn
            field="chk"
            title=" "
            width="45px"
            headerCell={CustomCheckBoxCell}
            cell={CheckBoxCell}
          />
          <GridColumn
            field="proddt"
            title="생산일자"
            width="120px"
            cell={DateCell}
            footerCell={mainTotalFooterCell}
          />
          <GridColumn field="proccd" title="공정" width="120px" />
          <GridColumn field="prodemp" title="작업자" width="120px" />
          <GridColumn field="prodmac" title="설비" width="120px" />
          <GridColumn field="itemcd" title="품목코드" width="120px" />
          <GridColumn field="itemnm" title="품목명" width="150px" />
          <GridColumn field="lotnum" title="LOT NO" width="120px" />
          <GridColumn
            field="prodqty"
            title="생산량"
            width="100px"
            cell={NumberCell}
            footerCell={editNumberFooterCell}
          />
          <GridColumn
            field="qty"
            title="양품수량"
            width="100px"
            cell={NumberCell}
            footerCell={editNumberFooterCell}
          />
          <GridColumn
            field="badqty"
            title="불량수량"
            width="100px"
            cell={NumberCell}
            footerCell={editNumberFooterCell}
          />
          <GridColumn field="qtyunit" title="단위" width="120px" />
          <GridColumn field="strtime" title="시작시간" width="150px" />
          <GridColumn field="endtime" title="종료시간" width="150px" />
          <GridColumn field="remark" title="비고" width="150px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button
            themeColor={"primary"}
            fillMode={"outline"}
            onClick={onSaveClick}
            icon="save"
          >
            저장
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
