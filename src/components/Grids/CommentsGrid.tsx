import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  getSelectedState,
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  GridSortChangeEvent,
} from "@progress/kendo-react-grid";
import React, { useEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CenterCell from "../Cells/CenterCell";
import {
  convertDateToStr,
  dateformat2,
  getGridItemChangedData,
  UseGetValueFromSessionItem,
  UseParaPc,
  UsePermissions,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";

const DATA_ITEM_KEY = "seq";
let deletedRows: object[] = [];
let temp = 0;
let targetRowIndex: null | number = null;

const CommentsGrid = (props: {
  ref_key: string;
  form_id: string;
  table_id: string;
  style: { height: string };
}) => {
  const { ref_key, form_id, table_id, style } = props;
  const { height } = style;

  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const user_id = UseGetValueFromSessionItem("user_id");
  const user_name = UseGetValueFromSessionItem("user_name");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const idGetter = getter(DATA_ITEM_KEY);
  const gridRef = useRef<any>(null);
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const onDataStateChange = (event: GridDataStateChangeEvent) => {
    setDataState(event.dataState);
  };

  const [dataState, setDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  const [dataResult, setDataResult] = useState<DataResult>(
    process([], dataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onSortChange = (e: GridSortChangeEvent) => {
    setDataState((prev: State) => ({ ...prev, sort: e.sort }));
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
    const newData = dataResult.data.map((item) =>
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
    setTempResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    setDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const exitEdit = () => {
    if (tempResult.data != dataResult.data) {
      const newData = dataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              row_status: item.row_status == "N" ? "N" : "U",
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
      setDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = dataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const onItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(event, dataResult, setDataResult, DATA_ITEM_KEY);
  };

  const TotalFooterCell = (props: GridFooterCellProps) => {
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총 {dataResult.total}건
      </td>
    );
  };
  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: page.skip / page.take + 1,
      isSearch: true,
    }));

    setPage({
      ...event.page,
    });
  };

  const fetchGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "sys_sel_comments",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_form_id": form_id,
        "@p_table_id": table_id,
        "@p_orgdiv": orgdiv,
        "@p_ref_key": ref_key,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.seq == filters.find_row_value
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
      setDataResult(process(rows, dataState));

      if (rows.length > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.seq == filters.find_row_value);

        setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
      }
    } else {
      console.log("[에러발생]");
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

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [dataResult]);

  //메인 그리드 선택 이벤트 => 디테일1 그리드 조회
  const onMainSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };
  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setDataState(event.dataState);
  };
  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  useEffect(() => {
    if (filters.isSearch && permissions !== null && ref_key != "") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid(deepCopiedFilters);
    }
  }, [filters, permissions, ref_key]);

  //계획 저장 파라미터 초기값
  const [paraDataSaved, setParaDataSaved] = useState({
    work_type: "",
    row_status: "",
    id: "",
    seq: "",
    recdt: "",
    comment: "",
    user_id: "",
    ref_key: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "sys_sav_comments ",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraDataSaved.work_type,
      "@p_row_status": paraDataSaved.row_status,
      "@p_id": paraDataSaved.id,
      "@p_seq": paraDataSaved.seq,
      "@p_recdt": paraDataSaved.recdt,
      "@p_comment": paraDataSaved.comment,
      "@p_user_id": paraDataSaved.user_id,
      "@p_form_id": form_id,
      "@p_table_id": table_id,
      "@p_orgdiv": orgdiv,
      "@p_ref_key": paraDataSaved.ref_key,
      "@p_exec_pc": pc,
    },
  };

  const onAddClick = () => {
    dataResult.data.map((item) => {
      if (item.seq > temp) {
        temp = item.seq;
      }
    });

    const idx: number =
      Number(Object.getOwnPropertyNames(selectedState)[0]) ??
      //Number(plandataResult.data[0].idx) ??
      null;
    if (idx === null) return false;
    const selectedRowData = dataResult.data.find(
      (item) => item[DATA_ITEM_KEY] == idx
    );

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      // planno: selectedRowData.planno,
      recdt: convertDateToStr(new Date()),
      row_status: "N",
      user_id: user_id,
      user_name: user_name,
    };
    setDataResult((prev) => {
      return process([newDataItem, ...prev.data], dataState);
    });
    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
  };

  const onRemoveClick = () => {
    //삭제 안 할 데이터 newData에 push, 삭제 데이터 deletedRows에 push
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
    dataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
        Object2.push(index);
      } else {
        Object.push(index);
        deletedRows.push(item);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = dataResult.data[Math.min(...Object2)];
    } else {
      data = dataResult.data[Math.min(...Object) - 1];
    }
    const isLastDataDeleted = dataResult.data.length === 1 && filters.pgNum > 1;
    if (isLastDataDeleted) {
      setPage({
        skip: PAGE_SIZE * (filters.pgNum - 2),
        take: PAGE_SIZE,
      });
    }
    //newData 생성
    setDataResult(process(newData, dataState));

    setSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onSaveClick = () => {
    const dataItem: { [name: string]: any } = dataResult.data.filter(
      (item: any) => {
        return (
          (item.row_status === "N" || item.row_status === "U") &&
          item.row_status !== undefined
        );
      }
    );
    if (
      dataResult.data.length === 0 ||
      (dataItem.length === 0 && deletedRows.length === 0)
    )
      return false;

    type TData = {
      row_status: string[];
      id: string[];
      seq: string[];
      recdt: string[];
      comment: string[];
      user_id: string[];
    };

    let dataArr: TData = {
      row_status: [],
      id: [],
      comment: [],
      seq: [],
      recdt: [],
      user_id: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const { comment, row_status, id = "", seq, recdt, user_id } = item;

      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.row_status.push(row_status);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(user_id);
    });

    deletedRows.forEach((item: any, idx: number) => {
      const { comment, id = "", seq, recdt, user_id } = item;

      dataArr.row_status.push("D");
      dataArr.comment.push(comment);
      dataArr.id.push(id);
      dataArr.seq.push(seq);
      dataArr.recdt.push(recdt);
      dataArr.user_id.push(user_id);
    });

    setParaDataSaved((prev) => ({
      ...prev,
      work_type: "save",
      row_status: dataArr.row_status.join("|"),
      comment: dataArr.comment.join("|"),
      id: dataArr.id.join("|"),
      seq: dataArr.seq.join("|"),
      recdt: dataArr.recdt.join("|"),
      user_id: dataArr.user_id.join("|"),
      ref_key: ref_key,
    }));
  };

  const fetchGridSaved = async () => {
    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setFilters((prev) => ({
        ...prev,
        find_row_value: dataResult.data.filter(
          (item: any) =>
            item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        )[0].seq,
        isSearch: true,
      }));
      deletedRows = [];
    } else {
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    //초기화
    setParaDataSaved((prev) => ({ ...prev, work_type: "" }));

    setLoading(false);
  };

  useEffect(() => {
    if (paraDataSaved.work_type !== "") fetchGridSaved();
  }, [paraDataSaved]);

  const isSaveDisabled = !(permissions?.save && ref_key !== "");

  return (
    <>
      <GridTitleContainer>
        <GridTitle data-control-name="grtlCmtList">코멘트</GridTitle>

        {permissions && (
          <ButtonContainer>
            <Button
              onClick={onAddClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="plus"
              disabled={isSaveDisabled}
            ></Button>
            <Button
              onClick={onRemoveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="minus"
              disabled={isSaveDisabled}
            ></Button>
            <Button
              onClick={onSaveClick}
              fillMode="outline"
              themeColor={"primary"}
              icon="save"
              disabled={isSaveDisabled}
            ></Button>
          </ButtonContainer>
        )}
      </GridTitleContainer>
      <Grid
        style={{ height }}
        data={process(
          dataResult.data.map((row) => ({
            ...row,
            recdt: dateformat2(row.recdt),
            [SELECTED_FIELD]: selectedState[idGetter(row)],
          })),
          dataState
        )}
        {...dataState}
        onDataStateChange={onDataStateChange}
        //선택기능
        dataItemKey={DATA_ITEM_KEY}
        selectedField={SELECTED_FIELD}
        selectable={{
          enabled: true,
          mode: "single",
        }}
        onSelectionChange={onSelectionChange}
        //정렬기능
        sortable={true}
        onSortChange={onSortChange}
        //스크롤 조회 기능
        fixedScroll={true}
        total={dataResult.total}
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
        //incell 수정 기능
        onItemChange={onItemChange}
        cellRender={customCellRender}
        rowRender={customRowRender}
        editField={EDIT_FIELD}
      >
        <GridColumn
          field="row_status"
          title=" "
          width="40px"
          editable={false}
        />
        <GridColumn
          field="recdt"
          title="작성일"
          width="100px"
          editable={false}
          cell={CenterCell}
          footerCell={TotalFooterCell}
        />
        <GridColumn
          field="user_name"
          title="작성자"
          width="120px"
          editable={false}
        />
        <GridColumn field="comment" title="코멘트" />
      </Grid>
    </>
  );
};

export default CommentsGrid;
