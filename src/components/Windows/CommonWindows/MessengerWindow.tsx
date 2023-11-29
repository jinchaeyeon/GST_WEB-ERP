import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
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
} from "@progress/kendo-react-grid";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { getSelectedState } from "@progress/kendo-react-treelist";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
} from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading, loginResultState } from "../../../store/atoms";
import { Iparameters } from "../../../store/types";
import CheckBoxCell from "../../Cells/CheckBoxCell";
import { UseParaPc, getGridItemChangedData } from "../../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../../CommonString";
import { CellRender, RowRender } from "../../Renderers/Renderers";

const topHeight = 55;
const bottomHeight = 55;
const leftOverHeight = (topHeight + bottomHeight) / 2;

type TKendoWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
};
const DATA_ITEM_KEY = "num";
const DATA_ITEM_KEY2 = "num";
const DATA_ITEM_KEY3 = "num";

const KendoWindow = ({ setVisible, modal = false }: TKendoWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const setLoading = useSetRecoilState(isLoading);
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const processApi = useApi();
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);
  const [page3, setPage3] = useState(initialPageState);
  const idGetter = getter(DATA_ITEM_KEY);
  const idGetter2 = getter(DATA_ITEM_KEY2);
  const idGetter3 = getter(DATA_ITEM_KEY3);
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 800,
    height: 800,
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

  const onConfirmClick = () => {
    const dataItem = mainDataResult3.data.filter(
      (item: any) => item.chk == true
    );

    if (dataItem.length != 0) {
      let dataArr: any = {
        receiver_id_s: [],
      };

      dataItem.forEach((item: any, idx: number) => {
        const { user_id = "" } = item;

        dataArr.receiver_id_s.push(user_id);
      });

      setParaData((prev) => ({
        ...prev,
        workType: "new",
        receiver_id_s: dataArr.receiver_id_s.join("|"),
      }));
      setVisible(false);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "",
    slip_id: "",
    receiver_id: "",
    slip_content: "",
    pc: pc,
    slip_save: "",
    receiver_id_s: "",
  });

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    // try {
    //   data = await processApi<any>("procedure", para);
    // } catch (error) {
    //   data = null;
    // }

    if (data.isSuccess === true) {

      setParaData({
        pgSize: PAGE_SIZE,
        workType: "",
        slip_id: "",
        receiver_id: "",
        slip_content: "",
        pc: pc,
        slip_save: "",
        receiver_id_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };


  const [tabSelected, setTabSelected] = useState(0);
  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else if (e.selected == 1) {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
      }));
    } else if (e.selected == 2) {
      setFilters3((prev) => ({
        ...prev,
        isSearch: true,
      }));
      setInformation({
        content: "",
      });
    }
    setTabSelected(e.selected);
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState3, setSelectedState3] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    content: "",
  });

  const [filters, setFilters] = useState({
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [filters2, setFilters2] = useState({
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  const [filters3, setFilters3] = useState({
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  //그리드의 dataState 요소 변경 시 => 데이터 컨트롤에 사용되는 dataState에 적용
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };
  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  //메인 그리드 선택 이벤트
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState(newSelectedState);
  };

  const onSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState2,
      dataItemKey: DATA_ITEM_KEY2,
    });

    setSelectedState2(newSelectedState);
  };
  const onSelectionChange3 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY3,
    });

    setSelectedState3(newSelectedState);
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

  //그리드 푸터
  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult2.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 푸터
  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {mainDataResult3.total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
            (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };
  const gridRef = useRef<any>(null);
  const gridRef2 = useRef<any>(null);
  const gridRef3 = useRef<any>(null);

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

  const pageChange3 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setFilters3((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      isSearch: true,
    }));

    setPage3({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  useEffect(() => {
    if (filters3.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);
      setFilters3((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_messenger",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "receive",
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

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
  };

  //그리드 조회
  const fetchMainGrid2 = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_messenger",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "send",
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult2((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState2({ [rows[0][DATA_ITEM_KEY2]]: true });
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
  };

  //그리드 조회
  const fetchMainGrid3 = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_messenger",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "users",
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult3((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      if (totalRowCnt > 0) {
        setSelectedState3({ [rows[0][DATA_ITEM_KEY3]]: true });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
  };

  const [values2, setValues2] = useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult3.data.map((item) => ({
        ...item,
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult3((prev) => {
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

  const onMainItemChange = (event: GridItemChangeEvent) => {
    setMainDataState3((prev) => ({ ...prev, sort: [] }));
    getGridItemChangedData(
      event,
      mainDataResult3,
      setMainDataResult3,
      DATA_ITEM_KEY3
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
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY3] === dataItem[DATA_ITEM_KEY3]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    const newData = mainDataResult3.data.map((item: any) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));
    setMainDataResult3((prev: { total: any }) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  return (
    <Window
      title={"Messenger"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <TabStrip
        selected={tabSelected}
        onSelect={handleSelectTab}
        style={{ height: `calc(100% - ${leftOverHeight}px)` }}
      >
        <TabStripTab title="받은 쪽지">
          <GridContainer height={"300px"}>
            <Grid
              style={{ height: "100%" }}
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
            >
              <GridColumn
                field="sender_name"
                title="보낸사람"
                width="120px"
                footerCell={mainTotalFooterCell}
              />
              <GridColumn field="slip_content" title="내용" width="200px" />
              <GridColumn field="send_time" title="보낸시각" width="150px" />
              <GridColumn field="read_time" title="읽은시각" width="150px" />
              <GridColumn field="receivers" title="받는사람" width="120px" />
            </Grid>
          </GridContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "10%" }}>보낸사람</th>
                  <td>
                    <Input
                      name="sender_name"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].sender_name
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th style={{ width: "10%" }}>받은사람</th>
                  <td>
                    <Input
                      name="receivers"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].receivers
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>내용</th>
                  <td>
                    <TextArea
                      value={
                        mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].slip_content
                      }
                      name="slip_content"
                      rows={3}
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>보낸시각</th>
                  <td>
                    <Input
                      name="send_time"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].send_time
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>읽은시각</th>
                  <td>
                    <Input
                      name="read_time"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY] ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY] ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].read_time
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </TabStripTab>
        <TabStripTab title="보낸 쪽지">
          <GridContainer height={"300px"}>
            <Grid
              style={{ height: "100%" }}
              data={process(
                mainDataResult2.data.map((row) => ({
                  ...row,
                  [SELECTED_FIELD]: selectedState2[idGetter2(row)],
                })),
                mainDataState2
              )}
              {...mainDataState2}
              onDataStateChange={onMainDataStateChange2}
              //선택 기능
              dataItemKey={DATA_ITEM_KEY2}
              selectedField={SELECTED_FIELD}
              selectable={{
                enabled: true,
                mode: "single",
              }}
              onSelectionChange={onSelectionChange2}
              //스크롤 조회 기능
              fixedScroll={true}
              total={mainDataResult2.total}
              skip={page2.skip}
              take={page2.take}
              pageable={true}
              onPageChange={pageChange2}
              //원하는 행 위치로 스크롤 기능
              ref={gridRef2}
              rowHeight={30}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
            >
              <GridColumn
                field="receivers"
                title="받는사람"
                width="120px"
                footerCell={mainTotalFooterCell2}
              />
              <GridColumn field="slip_content" title="내용" width="200px" />
              <GridColumn field="send_time" title="보낸시각" width="150px" />
            </Grid>
          </GridContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th style={{ width: "10%" }}>보낸사람</th>
                  <td>
                    <Input
                      name="sender_name"
                      type="text"
                      value={
                        mainDataResult2.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY2] ==
                            Object.getOwnPropertyNames(selectedState2)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0].sender_name
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th style={{ width: "10%" }}>받은사람</th>
                  <td>
                    <Input
                      name="receivers"
                      type="text"
                      value={
                        mainDataResult2.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY2] ==
                            Object.getOwnPropertyNames(selectedState2)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0].receivers
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>내용</th>
                  <td>
                    <TextArea
                      value={
                        mainDataResult2.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY2] ==
                            Object.getOwnPropertyNames(selectedState2)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0].slip_content
                      }
                      name="slip_content"
                      rows={3}
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>보낸시각</th>
                  <td>
                    <Input
                      name="send_time"
                      type="text"
                      value={
                        mainDataResult2.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY2] ==
                            Object.getOwnPropertyNames(selectedState2)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0].send_time
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
                <tr>
                  <th>읽은시각</th>
                  <td>
                    <Input
                      name="read_time"
                      type="text"
                      value={
                        mainDataResult2.data.filter(
                          (item) =>
                            item[DATA_ITEM_KEY2] ==
                            Object.getOwnPropertyNames(selectedState2)[0]
                        )[0] == undefined
                          ? ""
                          : mainDataResult2.data.filter(
                              (item) =>
                                item[DATA_ITEM_KEY2] ==
                                Object.getOwnPropertyNames(selectedState2)[0]
                            )[0].read_time
                      }
                      className="readonly"
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </TabStripTab>
        <TabStripTab title="쪽지 보내기">
          <GridContainerWrap height={"580px"}>
            <GridContainer width="50%">
              <Grid
                style={{ height: "100%" }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState3[idGetter3(row)],
                  })),
                  mainDataState3
                )}
                {...mainDataState3}
                onDataStateChange={onMainDataStateChange3}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY3}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onSelectionChange3}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult3.total}
                skip={page3.skip}
                take={page3.take}
                pageable={true}
                onPageChange={pageChange3}
                //원하는 행 위치로 스크롤 기능
                ref={gridRef3}
                rowHeight={30}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange3}
                //컬럼순서조정
                reorderable={true}
                //컬럼너비조정
                resizable={true}
                onItemChange={onMainItemChange}
                cellRender={customCellRender}
                rowRender={customRowRender}
                editField={EDIT_FIELD}
              >
                <GridColumn
                  field="chk"
                  title=" "
                  width="45px"
                  headerCell={CustomCheckBoxCell2}
                  cell={CheckBoxCell}
                />
                <GridColumn
                  field="user_id"
                  title="아이디"
                  width="120px"
                  footerCell={mainTotalFooterCell3}
                />
                <GridColumn field="user_name" title="성명" width="120px" />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(50% - ${GAP}px)`}>
              <TextArea
                value={Information.content}
                name="content"
                rows={3}
                onChange={InputChange}
                style={{ height: "90%" }}
              />
              <BottomContainer>
                <ButtonContainer>
                  <Button themeColor={"primary"} onClick={onConfirmClick}>
                    전송
                  </Button>
                  <Button
                    themeColor={"primary"}
                    fillMode={"outline"}
                    onClick={() =>
                      setInformation({
                        content: "",
                      })
                    }
                  >
                    초기화
                  </Button>
                </ButtonContainer>
              </BottomContainer>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
      </TabStrip>
    </Window>
  );
};

export default KendoWindow;
