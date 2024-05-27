import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { useEffect, useRef, useState } from "react";
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
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UseParaPc,
  convertDateToStr,
  getGridItemChangedData,
  numberWithCommas,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";

let temp = 0;
const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;
let deletedMainRows: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_QC002", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "badcd" ? "L_QC002" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

type TData = {
  renum: string;
  reseq: any;
};

type TKendoWindow = {
  setVisible(visible: boolean): void;
  rekey: TData;
  reloadData(saveyn: string): void; // 저장 유무
  modal?: boolean;
};

const NoneDiv = () => {
  return <div></div>;
};
const KendoWindow = ({
  setVisible,
  rekey,
  reloadData,
  modal = false,
}: TKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const idGetter = getter(DATA_ITEM_KEY);
const pc = UseGetValueFromSessionItem("pc");
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1000,
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

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    renum: rekey.renum,
    reseq: rekey.reseq,
    pgNum: 1,
    isSearch: true,
    find_row_value: "",
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
        "@p_work_type": "BAD",
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_proccd": "",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_gonum": "",
        "@p_goseq": 0,
        "@p_planno": "",
        "@p_planseq": 0,
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_finyn": "",
        "@p_renum": filters.renum,
        "@p_reseq": filters.reseq,
        "@p_find_row_value": filters.find_row_value,
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
            (row: any) => row.badkey == filters.find_row_value
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
        // 작업지시 사용여부 세팅
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.badkey == filters.find_row_value);

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
      deletedMainRows = [];
    } else {
      console.log("[오류발생]");
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
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  // 메인 그리드 선택 이벤트
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const MainTotalFooterCell = (props: GridFooterCellProps) => {
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

  const onAddClick = () => {
    // 불량내역 행 추가
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      baddt: convertDateToStr(new Date()),
      badcd: "",
      qty: 0,
      remark: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveClick = async () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    //삭제 안 할 데이터 newData에 push
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
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

  const [paraSaved, setParaSaved] = useState({
    workType: "BAD",
    renum: "",
    reseq: "",
    rowstatus: "",
    badnum: "",
    badseq: "",
    baddt: "",
    badcd: "",
    qty: "",
    remark: "",
  });

  const onSaveClick = () => {
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    type TRowData = {
      rowstatus: string[];
      badnum: string[];
      badseq: string[];
      baddt: string[];
      badcd: string[];
      qty: string[];
      remark: string[];
    };

    let rowsArr: TRowData = {
      rowstatus: [],
      badnum: [],
      badseq: [],
      baddt: [],
      badcd: [],
      qty: [],
      remark: [],
    };

    dataItem.forEach((item: any) => {
      const { rowstatus, badnum, badseq, baddt, badcd, qty, remark } = item;
      rowsArr.rowstatus.push(rowstatus);
      rowsArr.badnum.push(badnum);
      rowsArr.badseq.push(badseq);
      rowsArr.baddt.push(baddt);
      rowsArr.badcd.push(badcd);
      rowsArr.qty.push(qty);
      rowsArr.remark.push(remark);
    });

    deletedMainRows.forEach((item: any) => {
      const { rowstatus, badnum, badseq, baddt, badcd, qty, remark } = item;
      rowsArr.rowstatus.push(rowstatus);
      rowsArr.badnum.push(badnum);
      rowsArr.badseq.push(badseq);
      rowsArr.baddt.push(baddt);
      rowsArr.badcd.push(badcd);
      rowsArr.qty.push(qty);
      rowsArr.remark.push(remark);
    });

    setParaSaved((prev) => ({
      ...prev,
      workType: "BAD",
      rowstatus: rowsArr.rowstatus.join("|"),
      badnum: rowsArr.badnum.join("|"),
      badseq: rowsArr.badseq.join("|"),
      baddt: rowsArr.baddt.join("|"),
      badcd: rowsArr.badcd.join("|"),
      qty: rowsArr.qty.join("|"),
      remark: rowsArr.remark.join("|"),
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
        "@p_renum": rekey.renum,
        "@p_reseq": rekey.reseq,
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
        "@p_renum_s": "",
        "@p_reseq_s": "",
        "@p_rowstatus_s": paraSaved.rowstatus,
        "@p_badnum_s": paraSaved.badnum,
        "@p_badseq_s": paraSaved.badseq,
        "@p_baddt_s": paraSaved.baddt,
        "@p_badcd_s": paraSaved.badcd,
        "@p_qty_s": paraSaved.qty,
        "@p_remark_s": paraSaved.remark,
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
      reloadData("Y");
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
      deletedMainRows = [];
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (paraSaved.rowstatus != "") {
      fetchTodoGridSaved();
    }
  }, [paraSaved]);

  const enterEdit = (dataItem: any, field: string) => {
    if (field !== "rowstatus") {
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
      setTempResult((prev) => {
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
      setTempResult((prev) => {
        return {
          data: mainDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (tempResult.data != mainDataResult.data) {
      const newData = mainDataResult.data.map((item) =>
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
      setTempResult((prev) => {
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
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));

      setTempResult((prev) => {
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

  return (
    <Window
      minimizeButton={NoneDiv}
      maximizeButton={NoneDiv}
      title={"불량등록"}
      initialWidth={position.width}
      initialHeight={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <GridContainer>
        <GridTitleContainer>
          <GridTitle>불량내역</GridTitle>
          <ButtonContainer>
            <Button
              themeColor={"primary"}
              onClick={onAddClick}
              title="행 추가"
              icon="plus"
            ></Button>
            <Button
              themeColor={"primary"}
              fillMode="outline"
              onClick={onRemoveClick}
              title="행 삭제"
              icon="minus"
            ></Button>
          </ButtonContainer>
        </GridTitleContainer>
        <Grid
          style={{ height: "43vh" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              [SELECTED_FIELD]: selectedState[idGetter(row)],
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          // 선택기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          {...mainDataState}
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
          <GridColumn field="rowstatus" title=" " width="30px" />
          <GridColumn
            field="baddt"
            title="불량일자"
            width="120px"
            cell={DateCell}
            footerCell={MainTotalFooterCell}
          />
          <GridColumn
            field="badcd"
            title="불량유형"
            width="120px"
            cell={CustomComboBoxCell}
          />
          <GridColumn
            field="qty"
            title="불량수량"
            width="100px"
            cell={NumberCell}
            footerCell={editNumberFooterCell}
          />
          <GridColumn field="remark" title="비고" width="200px" />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button
            onClick={onSaveClick}
            themeColor={"primary"}
            fillMode={"outline"}
            icon="save"
          >
            저장
          </Button>
          <Button onClick={onClose} themeColor={"primary"} fillMode="outline">
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
