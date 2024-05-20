import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
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
import * as React from "react";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";
import { Iparameters } from "../../../store/types";
import NumberCell from "../../Cells/NumberCell";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UseMessages,
  findMessage,
  getBizCom,
  getGridItemChangedData,
} from "../../CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../../CommonString";
import { CellRender, RowRender } from "../../Renderers/Renderers";

type TdataArr = {
  rowstatus_s: string[];
  badqty_s: string[];
  badcd_s: string[];
  badnum_s: string[];
  badseq_s: string[];
};

type IWindow = {
  setVisible(t: boolean): void;
  setData(str: any): void;
  renum: string;
  modal?: boolean;
  pathname: string;
};

const Badwindow = ({
  setVisible,
  setData,
  renum,
  modal = false,
  pathname,
}: IWindow) => {
  const setLoading = useSetRecoilState(isLoading);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 500,
    height: isMobile == true ? deviceHeight : 650,
  });
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
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
  const DATA_ITEM_KEY = "num";
  const idGetter = getter(DATA_ITEM_KEY);
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_QC002",
    //사용여부,
    setBizComponentData
  );
  const [badcdListData, setBadcdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setBadcdListData(getBizCom(bizComponentData, "L_QC002"));
    }
  }, [bizComponentData]);

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

  const processApi = useApi();

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
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    itemcd: "",
    itemnm: "",
    frdt: "",
    todt: "",
    bnatur: "",
    renum: renum == undefined ? "" : renum,
    isSearch: true,
    pgNum: 1,
  });

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "BAD",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    badrenum: filters.renum,
    rowstatus_s: "",
    renum_s: "",
    reseq_s: "",
    itemcd_s: "",
    person_s: "",
    lotnum_s: "",
    badqty_s: "",
    qcdecision: "",
    qcdt_s: "",
    qcnum_s: "",
    badcd_s: "",
    badnum_s: "",
    badseq_s: "",
    eyeqc_s: "",
    chkqty_s: "",
    remark_s: "",
    userid: userId,
    pc: pc,
  });

  const para: Iparameters = {
    procedureName: "P_QC_A6000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_badrenum": ParaData.badrenum,
      "@p_row_status_s": ParaData.rowstatus_s,
      "@p_renum_s": ParaData.renum_s,
      "@p_reseq_s": ParaData.reseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_person_s": ParaData.person_s,
      "@p_lotnum_s": ParaData.lotnum_s,
      "@p_badqty_s": ParaData.badqty_s,
      "@p_qcdecision_s": ParaData.qcdecision,
      "@p_qcdt_s": ParaData.qcdt_s,
      "@p_qcnum_s": ParaData.qcnum_s,
      "@p_badcd_s": ParaData.badcd_s,
      "@p_badnum_s": ParaData.badnum_s,
      "@p_badseq_s": ParaData.badseq_s,
      "@p_eyeqc_s": ParaData.eyeqc_s,
      "@p_chkqty_s": ParaData.chkqty_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "P_QC_A6000W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setData(data.returnString);
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_QC_A6000W_Q",
      pageNumber: filters.pgNum,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "BAD",
        "@p_orgdiv": filters.orgdiv,
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_frdt": filters.frdt,
        "@p_todt": filters.todt,
        "@p_bnatur": filters.bnatur,
        "@p_renum": filters.renum,
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

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
      }
    }
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSaveClick = () => {
    const data = mainDataResult.data.filter(
      (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
    )[0];
    if (data != null) {
      try {
        if (data.qty < 0) {
          throw findMessage(messagesData, "QC_A6000W_003");
        } else {
          const dataItem = mainDataResult.data.filter((item: any) => {
            return (
              (item.rowstatus == "N" || item.rowstatus == "U") &&
              item.rowstatus !== undefined
            );
          });
          if (dataItem.length == 0) return false;
          let dataArr: TdataArr = {
            rowstatus_s: [],
            badqty_s: [],
            badcd_s: [],
            badnum_s: [],
            badseq_s: [],
          };
          dataItem.forEach((item: any, idx: number) => {
            const {
              rowstatus = "",
              qty = "",
              badcd = "",
              badnum = "",
              badseq = "",
            } = item;
            dataArr.rowstatus_s.push(rowstatus);
            dataArr.badcd_s.push(badcd == undefined ? "" : badcd);
            dataArr.badqty_s.push(qty == undefined ? "" : qty);
            dataArr.badnum_s.push(badnum == undefined ? "" : badnum);
            dataArr.badseq_s.push(badseq == undefined ? "" : badseq);
          });

          setParaData((prev) => ({
            ...prev,
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            badqty_s: dataArr.badqty_s.join("|"),
            badcd_s: dataArr.badcd_s.join("|"),
            badnum_s: dataArr.badnum_s.join("|"),
            badseq_s: dataArr.badseq_s.join("|"),
          }));
        }
      } catch (e) {
        alert(e);
      }
    } else {
      onClose();
    }
  };

  //메인 그리드 선택 이벤트
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
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

  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    setMainDataState((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const customCellRender3 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit3}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender3 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit3}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit3 = (dataItem: any, field: string) => {
    if (field == "qty") {
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

  const exitEdit3 = () => {
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

  return (
    <Window
      title={"불량처리"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <GridContainer>
        <Grid
          style={{ height: "500px" }}
          data={process(
            mainDataResult.data.map((row) => ({
              ...row,
              rowstatus:
                row.rowstatus == null ||
                row.rowstatus == "" ||
                row.rowstatus == undefined
                  ? ""
                  : row.rowstatus,
              badcd: badcdListData.find(
                (item: any) => item.sub_code == row.badcd
              )?.code_name,
              [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
            })),
            mainDataState
          )}
          onDataStateChange={onMainDataStateChange}
          {...mainDataState}
          //선택 기능
          dataItemKey={DATA_ITEM_KEY}
          selectedField={SELECTED_FIELD}
          selectable={{
            enabled: true,
            mode: "single",
          }}
          onSelectionChange={onMainSelectionChange}
          //스크롤 조회기능
          fixedScroll={true}
          total={mainDataResult.total}
          skip={page.skip}
          take={page.take}
          pageable={true}
          onPageChange={pageChange}
          //정렬기능
          sortable={true}
          onSortChange={onMainSortChange}
          //컬럼순서조정
          reorderable={true}
          //컬럼너비조정
          resizable={true}
          //더블클릭
          onItemChange={onMainItemChange3}
          cellRender={customCellRender3}
          rowRender={customRowRender3}
          editField={EDIT_FIELD}
        >
          <GridColumn field="rowstatus" title=" " width="48px" />
          <GridColumn
            field="badcd"
            title="불량유형"
            width="200px"
            footerCell={mainTotalFooterCell}
          />
          <GridColumn
            field="qty"
            title="불량수량"
            width="200px"
            cell={NumberCell}
          />
        </Grid>
      </GridContainer>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onSaveClick}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default Badwindow;
