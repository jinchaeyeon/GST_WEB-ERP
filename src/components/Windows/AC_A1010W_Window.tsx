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
} from "@progress/kendo-react-grid";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import "swiper/css";
import {
  ButtonContainer,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import {
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import Window from "./WindowComponent/Window";

type IWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
};
let deletedMainRows: object[] = [];
let temp = 0;
const DATA_ITEM_KEY = "num";
var height = 0;
var height2 = 0;

const CopyWindow = ({ setVisible, modal = false }: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 700) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 500) / 2,
    width: isMobile == true ? deviceWidth : 700,
    height: isMobile == true ? deviceHeight : 500,
  });
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".WindowButtonContainer");
    setMobileHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  }, [webheight]);

  const onChangePostion = (position: any) => {
    setPosition(position);
  };
  const onClose = () => {
    setVisible(false);
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
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const pageChange = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage({
      skip: page.skip,
      take: initialPageState.take,
    });
  };
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1010W_Sub1_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_group_code_s": "AC610",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });

      if (totalRowCnt > 0) {
        setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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
    if (filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const resetAllGrid = () => {
    deletedMainRows = [];
    setPage(initialPageState);
    setMainDataResult(process([], mainDataState));
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
    if (field != "rowstatus") {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      code_name: "",
      extra_field1: "",
      extra_field2: "Y",
      extra_field3: "",
      extra_field4: "",
      extra_field5: "",
      group_code: "AC610",
      memo: "",
      numref1: 0,
      numref2: 0,
      numref3: 0,
      numref4: 0,
      numref5: 0,
      sort_seq: 0,
      sub_code: "",
      system_yn: "N",
      use_yn: "Y",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setPage((prev) => ({
      ...prev,
      skip: 0,
      take: prev.take + 1,
    }));
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onRemoveClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
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
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onReset = () => {
    resetAllGrid();
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
      pgNum: 1,
    }));
  };

  const onSaveClick = () => {
    if (!permissions.save) return;
    const dataItem = mainDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (dataItem.length == 0 && deletedMainRows.length == 0) return false;

    let dataArr: any = {
      rowstatus_s: [],
      sub_code_s: [],
      code_name_s: [],
      system_yn_s: [],
      extra_field1_s: [],
      extra_field2_s: [],
      extra_field3_s: [],
      extra_field4_s: [],
      extra_field5_s: [],
      numref1_s: [],
      numref2_s: [],
      numref3_s: [],
      numref4_s: [],
      numref5_s: [],
      sort_seq_s: [],
      use_yn_s: [],
      memo_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        group_code = "",
        sub_code = "",
        code_name = "",
        system_yn = "",
        extra_field1 = "",
        extra_field2 = "",
        extra_field3 = "",
        extra_field4 = "",
        extra_field5 = "",
        numref1 = "",
        numref2 = "",
        numref3 = "",
        numref4 = "",
        numref5 = "",
        sort_seq = "",
        use_yn = "",
        memo = "",
      } = item;

      dataArr.rowstatus_s.push(rowstatus);
      dataArr.sub_code_s.push(sub_code);
      dataArr.code_name_s.push(code_name);
      dataArr.system_yn_s.push(
        system_yn == true ? "Y" : system_yn == false ? "N" : system_yn
      );
      dataArr.extra_field1_s.push(extra_field1);
      dataArr.extra_field2_s.push(extra_field2);
      dataArr.extra_field3_s.push(extra_field3);
      dataArr.extra_field4_s.push(extra_field4);
      dataArr.extra_field5_s.push(extra_field5);
      dataArr.numref1_s.push(numref1);
      dataArr.numref2_s.push(numref2);
      dataArr.numref3_s.push(numref3);
      dataArr.numref4_s.push(numref4);
      dataArr.numref5_s.push(numref5);
      dataArr.sort_seq_s.push(sort_seq);
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
      dataArr.memo_s.push(memo);
    });

    deletedMainRows.forEach((item: any, idx: number) => {
      const {
        rowstatus = "",
        group_code = "",
        sub_code = "",
        code_name = "",
        system_yn = "",
        extra_field1 = "",
        extra_field2 = "",
        extra_field3 = "",
        extra_field4 = "",
        extra_field5 = "",
        numref1 = "",
        numref2 = "",
        numref3 = "",
        numref4 = "",
        numref5 = "",
        sort_seq = "",
        use_yn = "",
        memo = "",
      } = item;

      dataArr.rowstatus_s.push("D");
      dataArr.sub_code_s.push(sub_code);
      dataArr.code_name_s.push(code_name);
      dataArr.system_yn_s.push(
        system_yn == true ? "Y" : system_yn == false ? "N" : system_yn
      );
      dataArr.extra_field1_s.push(extra_field1);
      dataArr.extra_field2_s.push(extra_field2);
      dataArr.extra_field3_s.push(extra_field3);
      dataArr.extra_field4_s.push(extra_field4);
      dataArr.extra_field5_s.push(extra_field5);
      dataArr.numref1_s.push(numref1);
      dataArr.numref2_s.push(numref2);
      dataArr.numref3_s.push(numref3);
      dataArr.numref4_s.push(numref4);
      dataArr.numref5_s.push(numref5);
      dataArr.sort_seq_s.push(sort_seq);
      dataArr.use_yn_s.push(
        use_yn == true ? "Y" : use_yn == false ? "N" : use_yn
      );
      dataArr.memo_s.push(memo);
    });

    setParaData((prev) => ({
      ...prev,
      workType: "S",
      group_code: "AC610",
      rowstatus: dataArr.rowstatus_s.join("|"),
      sub_code: dataArr.sub_code_s.join("|"),
      code_name: dataArr.code_name_s.join("|"),
      system_yn: dataArr.system_yn_s.join("|"),
      extra_field1: dataArr.extra_field1_s.join("|"),
      extra_field2: dataArr.extra_field2_s.join("|"),
      extra_field3: dataArr.extra_field3_s.join("|"),
      extra_field4: dataArr.extra_field4_s.join("|"),
      extra_field5: dataArr.extra_field5_s.join("|"),
      numref1: dataArr.numref1_s.join("|"),
      numref2: dataArr.numref2_s.join("|"),
      numref3: dataArr.numref3_s.join("|"),
      numref4: dataArr.numref4_s.join("|"),
      numref5: dataArr.numref5_s.join("|"),
      sort_seq: dataArr.sort_seq_s.join("|"),
      use_yn: dataArr.use_yn_s.join("|"),
      memo: dataArr.memo_s.join("|"),
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    rowstatus: "",
    group_code: "",
    sub_code: "",
    code_name: "",
    system_yn: "",
    extra_field1: "",
    extra_field2: "",
    extra_field3: "",
    extra_field4: "",
    extra_field5: "",
    numref1: "",
    numref2: "",
    numref3: "",
    numref4: "",
    numref5: "",
    sort_seq: "",
    use_yn: "",
    memo: "",
    userid: userId,
    pc: pc,
    form_id: "AC_A1010W",
  });

  //조회조건 파라미터
  const para: Iparameters = {
    procedureName: "P_AC_A1010W_Sub1_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_group_code": ParaData.group_code,

      "@p_rowstatus_s": ParaData.rowstatus,
      "@p_sub_code_s": ParaData.sub_code,
      "@p_code_name_s": ParaData.code_name,
      "@p_system_yn_s": ParaData.system_yn,
      "@p_extra_field1_s": ParaData.extra_field1,
      "@p_extra_field2_s": ParaData.extra_field2,
      "@p_extra_field3_s": ParaData.extra_field3,
      "@p_extra_field4_s": ParaData.extra_field4,
      "@p_extra_field5_s": ParaData.extra_field5,
      "@p_numref1_s": ParaData.numref1,
      "@p_numref2_s": ParaData.numref2,
      "@p_numref3_s": ParaData.numref3,
      "@p_numref4_s": ParaData.numref4,
      "@p_numref5_s": ParaData.numref5,
      "@p_sort_seq_s": ParaData.sort_seq,
      "@p_use_yn_s": ParaData.use_yn,
      "@p_memo_s": ParaData.memo,
      "@p_userid": ParaData.userid,
      "@p_pc": ParaData.pc,
      "@p_form_id": ParaData.form_id,
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      resetAllGrid();

      setFilters((prev: any) => ({
        ...prev,
        pgNum: 1,
        isSearch: true,
      }));

      setParaData({
        workType: "",
        rowstatus: "",
        group_code: "",
        sub_code: "",
        code_name: "",
        system_yn: "",
        extra_field1: "",
        extra_field2: "",
        extra_field3: "",
        extra_field4: "",
        extra_field5: "",
        numref1: "",
        numref2: "",
        numref3: "",
        numref4: "",
        numref5: "",
        sort_seq: "",
        use_yn: "",
        memo: "",
        userid: userId,
        pc: pc,
        form_id: "AC_A1010W",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  return (
    <>
      <Window
        titles={"기준정보 수정"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <GridContainer>
          <GridTitleContainer className="WindowButtonContainer">
            <GridTitle>
              상세정보(키워드는 사용내역의 가맹점명 기준입니다.)
            </GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
                themeColor={"primary"}
                icon="plus"
                title="행 추가"
                disabled={permissions.save ? false : true}
              ></Button>
              <Button
                onClick={onRemoveClick}
                fillMode="outline"
                themeColor={"primary"}
                icon="minus"
                title="행 삭제"
                disabled={permissions.save ? false : true}
              ></Button>
              <Button
                onClick={onSaveClick}
                themeColor={"primary"}
                icon="save"
                title="저장"
                disabled={permissions.save ? false : true}
              ></Button>
              <Button
                onClick={onReset}
                fillMode="outline"
                themeColor={"primary"}
                icon="reset"
                title="Reset"
                disabled={permissions.view ? false : true}
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
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
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn field="code_name" title="키워드" width="120px" />
            <GridColumn field="extra_field1" title="계정과목" width="120px" />
            <GridColumn
              field="extra_field2"
              title="부가세여부"
              width="100px"
              cell={CheckBoxCell}
            />
            <GridColumn
              field="use_yn"
              title="사용"
              width="80px"
              cell={CheckBoxCell}
            />
            <GridColumn field="memo" title="메모" width="150px" />
          </Grid>
        </GridContainer>
      </Window>
    </>
  );
};

export default CopyWindow;
