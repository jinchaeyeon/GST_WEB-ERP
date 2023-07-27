import { useEffect, useState, useCallback, useRef } from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { bytesToBase64 } from "byte-base64";
import { DataResult, process, State, getter } from "@progress/kendo-data-query";
import { useApi } from "../../../hooks/api";
import NumberCell from "../../Cells/NumberCell";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  GridTitleContainer,
  GridTitle,
  GridContainerWrap,
} from "../../../CommonStyled";
import {
  COM_CODE_DEFAULT_VALUE,
  GAP,
  SELECTED_FIELD,
} from "../../CommonString";
import { Iparameters } from "../../../store/types";
import {
  UseBizComponent,
  getQueryFromBizComponent,
} from "../../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import { IWindowPosition } from "../../../hooks/interfaces";
import { PAGE_SIZE } from "../../CommonString";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../../store/atoms";
const DATA_ITEM_KEY = "pattern_id";
const DATA_ITEM_KEY2 = "num";

let targetRowIndex: null | number = null;
let targetRowIndex2: null | number = null;

type TPara = {
  user_id: string;
  user_name: string;
};
type TKendoWindow = {
  getVisible(isVisible: boolean): void;
  setData(data: object): void;
  para: TPara;
  modal?: boolean;
};

const KendoWindow = ({
  getVisible,
  setData,
  para = { user_id: "", user_name: "" },
  modal = false,
}: TKendoWindow) => {
  // 비즈니스 컴포넌트 조회
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA011,L_PR010", setBizComponentData);

  const [outprocynListData, setOutprocynListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 768;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1200,
    height: 670,
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
    getVisible(false);
  };

  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
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
    setFilters2((prev) => ({
      ...prev,
      pgNum: 1,
      isSearch: true,
    }));

    setPage2(initialPageState);
  };

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters2((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  const [detailState, setDetailDataState] = useState<State>({
    sort: [],
  });

  const [detailState2, setDetailDataState2] = useState<State>({
    sort: [],
  });

  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], detailState)
  );

  const [detailDataResult2, setDetailDataResult2] = useState<DataResult>(
    process([], detailState2)
  );

  const [selecteddetailState, setSelectedDetailState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selecteddetailState2, setSelectedDetailState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    location: "01",
    pattern_id: "",
    pattern_name: "",
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    orgdiv: "01",
    location: "01",
    pattern_id: "",
    pattern_name: "",
    proccd: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  let gridRef : any = useRef(null); 
  let gridRef2 : any = useRef(null); 

  //상세그리드 조회
  const fetchGrid = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_BA_A0050W_Sub2_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_pattern_id": filters.pattern_id,
        "@p_pattern_name": filters.pattern_name,
        "@p_proccd": filters.proccd,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY] === filters.find_row_value
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
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedDetailState({ [selectedRow[DATA_ITEM_KEY]]: true });
        
          setFilters2((prev) => ({
            ...prev,
            pattern_id: selectedRow.pattern_id,
            isSearch: true,
          }));
        } else {
          setSelectedDetailState({ [rows[0][DATA_ITEM_KEY]]: true });
        
          setFilters2((prev) => ({
            ...prev,
            pattern_id: rows[0].pattern_id,
            isSearch: true,
          }));

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
  //상세그리드 조회
  const fetchGrid2 = async (filters2: any) => {
    let data: any;

    //조회조건 파라미터
    const parameters2: Iparameters = {
      procedureName: "P_BA_A0050W_Sub2_Q ",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters2.location,
        "@p_pattern_id": filters2.pattern_id,
        "@p_pattern_name": filters2.pattern_name,
        "@p_proccd": filters2.proccd,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
        };
      });
      if (filters2.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row[DATA_ITEM_KEY2] === filters2.find_row_value
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

      setDetailDataResult2(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        const selectedRow =
          filters2.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY2] == filters2.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedDetailState2({ [selectedRow[DATA_ITEM_KEY2]]: true });
        } else {
          setSelectedDetailState2({ [rows[0][DATA_ITEM_KEY2]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [detailDataResult]);

  useEffect(() => {
    if (targetRowIndex2 !== null && gridRef2.current) {
      gridRef2.current.scrollIntoView({ rowIndex: targetRowIndex2 });
      targetRowIndex2 = null;
    }
  }, [detailDataResult2]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const outprocynQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA011")
      );
      const proccdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_PR010")
      );

      fetchQuery(proccdQueryStr, setProccdListData);
      fetchQuery(outprocynQueryStr, setOutprocynListData);
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

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onDetailDataStateChange = (event: GridDataStateChangeEvent) => {
    setDetailDataState(event.dataState);
  };
  const onDetailDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setDetailDataState2(event.dataState);
  };

  const onDetailSortChange = (e: any) => {
    setDetailDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onDetailSortChange2 = (e: any) => {
    setDetailDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const detailTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = detailDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const detailTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = detailDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {detailDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onDetailDataSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selecteddetailState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedDetailState(newSelectedState);
    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters2((prev) => ({
      ...prev,
      pattern_id: selectedRowData.pattern_id,
      isSearch: true,
      pgNum: 1
    }));
    setPage2(initialPageState);
  };

  const onDetailDataSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selecteddetailState2,
      dataItemKey: DATA_ITEM_KEY2,
    });
    setSelectedDetailState2(newSelectedState);
  };

  const onRowDoubleClick = async (props: any) => {
    let data: any;
    const parameters2: Iparameters = {
      procedureName: "P_BA_A0050W_Sub2_Q ",
      pageNumber: 1,
      pageSize: detailDataResult2.total + 1,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_location": filters2.location,
        "@p_pattern_id": filters2.pattern_id,
        "@p_pattern_name": filters2.pattern_name,
        "@p_proccd": filters2.proccd,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      setData(rows);
      onClose();
    }
  };

  return (
    <Window
      title={"패턴공정도 참조"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <GridContainerWrap height="calc(100% - 70px)">
        <GridContainer width={`45%`}>
          <GridTitleContainer>
            <GridTitle>요약정보</GridTitle>
          </GridTitleContainer>
          <Grid
            data={process(
              detailDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: selecteddetailState[idGetter(row)], //선택된 데이터
              })),
              detailState
            )}
            {...detailState}
            onDataStateChange={onDetailDataStateChange}
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onDetailDataSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={detailDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            style={{ height: `calc(100% - 40px)` }}
          >
            <GridColumn
              field="pattern_id"
              title="패턴ID"
              width="120px"
              footerCell={detailTotalFooterCell}
            />
            <GridColumn field="pattern_name" title="패턴명" width="185px" />
            <GridColumn field="remark" title="비고" width="200px" />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(55% - ${GAP}px)`}>
          <GridTitleContainer>
            <GridTitle>상세정보</GridTitle>
          </GridTitleContainer>
          <Grid
            data={process(
              detailDataResult2.data.map((row) => ({
                ...row,
                outprocyn: outprocynListData.find(
                  (items: any) => items.sub_code === row.outprocyn
                )?.code_name,
                proccd: proccdListData.find(
                  (items: any) => items.sub_code === row.proccd
                )?.code_name,
                [SELECTED_FIELD]: selecteddetailState2[idGetter2(row)], //선택된 데이터
              })),
              detailState2
            )}
            {...detailState2}
            onDataStateChange={onDetailDataStateChange2}
            dataItemKey={DATA_ITEM_KEY2}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "multiple",
            }}
            //스크롤 조회기능
            fixedScroll={true}
            total={detailDataResult2.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef2}
            rowHeight={30}
            //정렬기능
            sortable={true}
            onSortChange={onDetailSortChange2}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
            onSelectionChange={onDetailDataSelectionChange2}
            onRowDoubleClick={onRowDoubleClick}
            style={{ height: `calc(100% - 40px)` }}
          >
            <GridColumn
              field="proccd"
              title="공정"
              width="165px"
              footerCell={detailTotalFooterCell2}
            />
            <GridColumn
              field="procseq"
              title="공정순서"
              width="120px"
              cell={NumberCell}
            />
            <GridColumn field="outprocyn" title="외주구분" width="120px" />
            <GridColumn field="remark" title="비고" width="200px" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
