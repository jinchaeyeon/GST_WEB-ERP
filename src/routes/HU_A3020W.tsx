import React, { useEffect, useState, useRef } from "react";
import * as ReactDOM from "react-dom";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridFooterCellProps,
  GridCellProps,
  GridItemChangeEvent,
} from "@progress/kendo-react-grid";
import { gridList } from "../store/columns/HU_A3020W_C";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Icon, getter } from "@progress/kendo-react-common";
import { CellRender, RowRender } from "../components/Renderers/Renderers";
import { DataResult, process, State } from "@progress/kendo-data-query";
import {
  Title,
  GridContainer,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridTitle,
} from "../CommonStyled";
import { useApi } from "../hooks/api";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  UseParaPc,
  UseGetValueFromSessionItem,
  getGridItemChangedData,
  GetPropertyValueByName,
} from "../components/CommonFunction";
import NumberCell from "../components/Cells/NumberCell";
import {
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import { Button } from "@progress/kendo-react-buttons";
import NameCell from "../components/Cells/NameCell";
const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;
let temp2 = 0;
const NumberField = ["notaxlmt", "stdamt"];
const requiredField = ["payitemcd", "payitemnm"];
const customField = ["payitemkind", "taxcd"];
const checkField = [
  "empinsuranceyn",
  "monthlypayyn",
  "avgwageyn",
  "ordwageyn",
  "rtrpayyn",
  "totincluyn",
  "daycalyn",
];
const radioField = ["fraction"];

type TdataArr = {
  rowstatus_s: string[];
  payitemcd_s: string[];
  payitemnm_s: string[];
  payitemkind_s: string[];
  payitemgroup_s: string[];
  taxcd_s: string[];
  notaxlmt_s: string[];
  empinsuranceyn_s: string[];
  monthlypayyn_s: string[];
  avgwageyn_s: string[];
  ordwageyn_s: string[];
  rtrpayyn_s: string[];
  totincluyn_s: string[];
  stdamt_s: string[];
  fraction_s: string[];
  daycalyn_s: string[];
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_HU042, L_HU029", setBizComponentData);
  //수당종류, 세액구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "payitemkind" ? "L_HU042" : field === "taxcd" ? "L_HU029" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_fraction", setBizComponentData);
  //끝전처리

  const field = props.field ?? "";
  const bizComponentIdVal = field == "fraction" ? "R_fraction" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const HU_A3020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "query");
      setFilters((prev) => ({
        ...prev,
      }));
    }
  }, [customOptionData]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState2, setSelectedState2] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [tabSelected, setTabSelected] = React.useState(0);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    worktype: "PAY",
    orgdiv: "01",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
    tab: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_HU_A3020W_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": filters.worktype,
      "@p_orgdiv": filters.orgdiv,
    },
  };

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
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

      if (filters.worktype == "PAY") {
        if (totalRowCnt > 0) {
          setMainDataResult((prev) => {
            return {
              data: [...prev.data, ...rows],
              total: totalRowCnt == -1 ? 0 : totalRowCnt,
            };
          });
          if (filters.find_row_value === "" && filters.pgNum === 1) {
            // 첫번째 행 선택하기
            const firstRowData = rows[0];
            setSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });
          }
        }
      } else {
        if (totalRowCnt > 0) {
          setMainDataResult2((prev) => {
            return {
              data: [...prev.data, ...rows],
              total: totalRowCnt == -1 ? 0 : totalRowCnt,
            };
          });
          if (filters.find_row_value === "" && filters.pgNum === 1) {
            // 첫번째 행 선택하기
            const firstRowData = rows[0];
            setSelectedState2({ [firstRowData[DATA_ITEM_KEY]]: true });
          }
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions !== null) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  let gridRef : any = useRef(null); 

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 0,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult2.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult2.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 1,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult2]);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    if (tabSelected === 0) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState(newSelectedState);
    } else if (tabSelected === 1) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState2,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState2(newSelectedState);
    }
  };

  //엑셀 내보내기
  let _export: ExcelExport | null | undefined;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      _export.save();
    }
  };

  const onMainScrollHandler = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 0,
      }));
    }
  };

  const onMainScrollHandler2 = (event: GridEvent) => {
    if (filters.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters.pgNum + (filters.scrollDirrection === "up" ? filters.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 1,
      }));
      return false;
    }

    pgNumWithGap =
      filters.pgNum - (filters.scrollDirrection === "down" ? filters.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 1,
      }));
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };

  //그리드 푸터
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

  const mainTotalFooterCell2 = (props: GridFooterCellProps) => {
    var parts = mainDataResult2.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  //그리드 정렬 이벤트
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange2 = (e: any) => {
    setMainDataState2((prev) => ({ ...prev, sort: e.sort }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();
    if (e.selected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        worktype: "PAY",
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
      }));
    } else if (e.selected == 1) {
      setFilters((prev: any) => ({
        ...prev,
        worktype: "DEDUCT",
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
      }));
    }
    deletedMainRows = [];
  };

  const search = () => {
    resetAllGrid();
    deletedMainRows = [];
    if (tabSelected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        worktype: "PAY",
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 0,
      }));
    } else if (tabSelected == 1) {
      setFilters((prev: any) => ({
        ...prev,
        worktype: "DEDUCT",
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
        tab: 1,
      }));
    }
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
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
    // if (
    //   !(
    //     field == "payitemcd" &&
    //     (dataItem.rowstatus == undefined || dataItem.rowstatus == "U")
    //   )
    // ) {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [EDIT_FIELD]: field,
          }
        : { ...item, [EDIT_FIELD]: undefined }
    );

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
    // }
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

  const onMainItemChange2 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult2,
      setMainDataResult2,
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
    if (
      !(
        field == "payitemcd" &&
        (dataItem.rowstatus == undefined || dataItem.rowstatus == "U")
      )
    ) {
      const newData = mainDataResult2.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setMainDataResult2((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    const newData = mainDataResult2.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult2((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if(item.num > temp){
        temp = item.num
      }
  })
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      avgwageyn: "N",
      daycalyn: "N",
      empinsuranceyn: "N",
      fraction: "0",
      monthlypayyn: "N",
      notaxlmt: 0,
      ordwageyn: "N",
      orgdiv: "01",
      paydeductdiv: "1",
      payitemcd: "",
      payitemgroup: "",
      payitemkind: "",
      payitemnm: "",
      rtrpayyn: "N",
      seq: 0,
      stdamt: 0,
      taxcd: "",
      totincluyn: "N",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    mainDataResult.data.forEach((item: any, index: number) => {
      if (!selectedState[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setMainDataState({});
  };

  const onSaveClick = () => {
    let valid = true;
    try {
      const dataItem = mainDataResult.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.payitemcd == undefined ||
          item.payitemcd == null ||
          item.payitemcd == ""
        ) {
          valid = false;
        }
        if (
          item.payitemnm == undefined ||
          item.payitemnm == null ||
          item.payitemnm == ""
        ) {
          valid = false;
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        payitemcd_s: [],
        payitemnm_s: [],
        payitemkind_s: [],
        payitemgroup_s: [],
        taxcd_s: [],
        notaxlmt_s: [],
        empinsuranceyn_s: [],
        monthlypayyn_s: [],
        avgwageyn_s: [],
        ordwageyn_s: [],
        rtrpayyn_s: [],
        totincluyn_s: [],
        stdamt_s: [],
        fraction_s: [],
        daycalyn_s: [],
      };

      if (valid == true) {
        if (dataItem.length === 0 && deletedMainRows.length == 0) return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(payitemkind);
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd);
          dataArr.notaxlmt_s.push(notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == true
              ? "Y"
              : empinsuranceyn == false
              ? "N"
              : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == true
              ? "Y"
              : monthlypayyn == false
              ? "N"
              : monthlypayyn
          );
          dataArr.avgwageyn_s.push(
            avgwageyn == true ? "Y" : avgwageyn == false ? "N" : avgwageyn
          );
          dataArr.ordwageyn_s.push(
            ordwageyn == true ? "Y" : ordwageyn == false ? "N" : ordwageyn
          );
          dataArr.rtrpayyn_s.push(
            rtrpayyn == true ? "Y" : rtrpayyn == false ? "N" : rtrpayyn
          );
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(
            daycalyn == true ? "Y" : daycalyn == false ? "N" : daycalyn
          );
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(payitemkind);
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd);
          dataArr.notaxlmt_s.push(notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == true
              ? "Y"
              : empinsuranceyn == false
              ? "N"
              : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == true
              ? "Y"
              : monthlypayyn == false
              ? "N"
              : monthlypayyn
          );
          dataArr.avgwageyn_s.push(
            avgwageyn == true ? "Y" : avgwageyn == false ? "N" : avgwageyn
          );
          dataArr.ordwageyn_s.push(
            ordwageyn == true ? "Y" : ordwageyn == false ? "N" : ordwageyn
          );
          dataArr.rtrpayyn_s.push(
            rtrpayyn == true ? "Y" : rtrpayyn == false ? "N" : rtrpayyn
          );
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(
            daycalyn == true ? "Y" : daycalyn == false ? "N" : daycalyn
          );
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          paydeductdiv: "1",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          payitemcd_s: dataArr.payitemcd_s.join("|"),
          payitemnm_s: dataArr.payitemnm_s.join("|"),
          payitemkind_s: dataArr.payitemkind_s.join("|"),
          payitemgroup_s: dataArr.payitemgroup_s.join("|"),
          taxcd_s: dataArr.taxcd_s.join("|"),
          notaxlmt_s: dataArr.notaxlmt_s.join("|"),
          empinsuranceyn_s: dataArr.empinsuranceyn_s.join("|"),
          monthlypayyn_s: dataArr.monthlypayyn_s.join("|"),
          avgwageyn_s: dataArr.avgwageyn_s.join("|"),
          ordwageyn_s: dataArr.ordwageyn_s.join("|"),
          rtrpayyn_s: dataArr.rtrpayyn_s.join("|"),
          totincluyn_s: dataArr.totincluyn_s.join("|"),
          stdamt_s: dataArr.stdamt_s.join("|"),
          fraction_s: dataArr.fraction_s.join("|"),
          daycalyn_s: dataArr.daycalyn_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick2 = () => {
    let valid = true;
    try {
      const dataItem = mainDataResult2.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.payitemcd == undefined ||
          item.payitemcd == null ||
          item.payitemcd == ""
        ) {
          valid = false;
        }
        if (
          item.payitemnm == undefined ||
          item.payitemnm == null ||
          item.payitemnm == ""
        ) {
          valid = false;
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        payitemcd_s: [],
        payitemnm_s: [],
        payitemkind_s: [],
        payitemgroup_s: [],
        taxcd_s: [],
        notaxlmt_s: [],
        empinsuranceyn_s: [],
        monthlypayyn_s: [],
        avgwageyn_s: [],
        ordwageyn_s: [],
        rtrpayyn_s: [],
        totincluyn_s: [],
        stdamt_s: [],
        fraction_s: [],
        daycalyn_s: [],
      };

      if (valid == true) {
        if (dataItem.length === 0 && deletedMainRows.length == 0) return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(
            payitemkind == undefined ? "" : payitemkind
          );
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd == undefined ? "" : payitemkind);
          dataArr.notaxlmt_s.push(notaxlmt == undefined ? "" : notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == undefined ? "" : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == undefined ? "" : monthlypayyn
          );
          dataArr.avgwageyn_s.push(avgwageyn == undefined ? "" : avgwageyn);
          dataArr.ordwageyn_s.push(ordwageyn == undefined ? "" : ordwageyn);
          dataArr.rtrpayyn_s.push(rtrpayyn == undefined ? "" : rtrpayyn);
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(daycalyn == undefined ? "" : daycalyn);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            payitemcd = "",
            payitemnm = "",
            payitemkind = "",
            payitemgroup = "",
            taxcd = "",
            notaxlmt = "",
            empinsuranceyn = "",
            monthlypayyn = "",
            avgwageyn = "",
            ordwageyn = "",
            rtrpayyn = "",
            totincluyn = "",
            stdamt = "",
            fraction = "",
            daycalyn = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.payitemcd_s.push(payitemcd);
          dataArr.payitemnm_s.push(payitemnm);
          dataArr.payitemkind_s.push(
            payitemkind == undefined ? "" : payitemkind
          );
          dataArr.payitemgroup_s.push(payitemgroup);
          dataArr.taxcd_s.push(taxcd == undefined ? "" : payitemkind);
          dataArr.notaxlmt_s.push(notaxlmt == undefined ? "" : notaxlmt);
          dataArr.empinsuranceyn_s.push(
            empinsuranceyn == undefined ? "" : empinsuranceyn
          );
          dataArr.monthlypayyn_s.push(
            monthlypayyn == undefined ? "" : monthlypayyn
          );
          dataArr.avgwageyn_s.push(avgwageyn == undefined ? "" : avgwageyn);
          dataArr.ordwageyn_s.push(ordwageyn == undefined ? "" : ordwageyn);
          dataArr.rtrpayyn_s.push(rtrpayyn == undefined ? "" : rtrpayyn);
          dataArr.totincluyn_s.push(
            totincluyn == true ? "Y" : totincluyn == false ? "N" : totincluyn
          );
          dataArr.stdamt_s.push(stdamt);
          dataArr.fraction_s.push(fraction);
          dataArr.daycalyn_s.push(daycalyn == undefined ? "" : daycalyn);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "N",
          paydeductdiv: "2",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          payitemcd_s: dataArr.payitemcd_s.join("|"),
          payitemnm_s: dataArr.payitemnm_s.join("|"),
          payitemkind_s: dataArr.payitemkind_s.join("|"),
          payitemgroup_s: dataArr.payitemgroup_s.join("|"),
          taxcd_s: dataArr.taxcd_s.join("|"),
          notaxlmt_s: dataArr.notaxlmt_s.join("|"),
          empinsuranceyn_s: dataArr.empinsuranceyn_s.join("|"),
          monthlypayyn_s: dataArr.monthlypayyn_s.join("|"),
          avgwageyn_s: dataArr.avgwageyn_s.join("|"),
          ordwageyn_s: dataArr.ordwageyn_s.join("|"),
          rtrpayyn_s: dataArr.rtrpayyn_s.join("|"),
          totincluyn_s: dataArr.totincluyn_s.join("|"),
          stdamt_s: dataArr.stdamt_s.join("|"),
          fraction_s: dataArr.fraction_s.join("|"),
          daycalyn_s: dataArr.daycalyn_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: "01",
    paydeductdiv: "1",
    rowstatus_s: "",
    payitemcd_s: "",
    payitemnm_s: "",
    payitemkind_s: "",
    payitemgroup_s: "",
    taxcd_s: "",
    notaxlmt_s: "",
    empinsuranceyn_s: "",
    monthlypayyn_s: "",
    avgwageyn_s: "",
    ordwageyn_s: "",
    rtrpayyn_s: "",
    totincluyn_s: "",
    stdamt_s: "",
    fraction_s: "",
    daycalyn_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_HU_A3020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_paydeductdiv": ParaData.paydeductdiv,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_payitemcd_s": ParaData.payitemcd_s,
      "@p_payitemnm_s": ParaData.payitemnm_s,
      "@p_payitemkind_s": ParaData.payitemkind_s,
      "@p_payitemgroup_s": ParaData.payitemgroup_s,
      "@p_taxcd_s": ParaData.taxcd_s,
      "@p_notaxlmt_s": ParaData.notaxlmt_s,
      "@p_empinsuranceyn_s": ParaData.empinsuranceyn_s,
      "@p_monthlypayyn_s": ParaData.monthlypayyn_s,
      "@p_avgwageyn_s": ParaData.avgwageyn_s,
      "@p_ordwageyn_s": ParaData.ordwageyn_s,
      "@p_rtrpayyn_s": ParaData.rtrpayyn_s,
      "@p_totincluyn_s": ParaData.totincluyn_s,
      "@p_stdamt_s": ParaData.stdamt_s,
      "@p_fraction_s": ParaData.fraction_s,
      "@p_daycalyn_s": ParaData.daycalyn_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A3020W",
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

    if (data.isSuccess === true) {
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: "01",
        paydeductdiv: "1",
        rowstatus_s: "",
        payitemcd_s: "",
        payitemnm_s: "",
        payitemkind_s: "",
        payitemgroup_s: "",
        taxcd_s: "",
        notaxlmt_s: "",
        empinsuranceyn_s: "",
        monthlypayyn_s: "",
        avgwageyn_s: "",
        ordwageyn_s: "",
        rtrpayyn_s: "",
        totincluyn_s: "",
        stdamt_s: "",
        fraction_s: "",
        daycalyn_s: "",
      });
      deletedMainRows = [];
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev: any) => ({
          ...prev,
          worktype: "PAY",
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
          tab: 0,
        }));
      } else if (tabSelected == 1) {
        setFilters((prev: any) => ({
          ...prev,
          worktype: "DEDUCT",
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
          tab: 1,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const onAddClick2 = () => {
    mainDataResult2.data.map((item) => {
      if(item.num > temp2){
        temp2 = item.num
      }
  })
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
      fraction: "0",
      orgdiv: "01",
      payitemcd: "",
      payitemgroup: "",
      payitemnm: "",
      seq: 0,
      stdamt: 0,
      totincluyn: "N",
      rowstatus: "N",
    };

    setMainDataResult2((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    mainDataResult2.data.forEach((item: any, index: number) => {
      if (!selectedState2[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult2((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setMainDataState2({});
  };

  return (
    <>
      <TitleContainer>
        <Title>지급, 공제항목</Title>
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
      <TabStrip selected={tabSelected} onSelect={handleSelectTab}>
        <TabStripTab title="지급항목">
          <GridContainer width="87vw">
            <GridTitleContainer>
              <GridTitle></GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                ></Button>
                <Button
                  onClick={onDeleteClick}
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
            <ExcelExport
              data={mainDataResult.data}
              ref={(exporter) => {
                _export = exporter;
              }}
            >
              <Grid
                style={{ height: "77.5vh" }}
                data={process(
                  mainDataResult.data.map((row) => ({
                    ...row,
                    fraction: row.fraction == "" ? "4" : row.fraction,
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
                onScroll={onMainScrollHandler}
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
                              : customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : checkField.includes(item.fieldName)
                              ? CheckBoxCell
                              : radioField.includes(item.fieldName)
                              ? CustomRadioCell
                              : NameCell
                          }
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </ExcelExport>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="공제항목">
          <GridContainer width="87vw">
            <GridTitleContainer>
              <GridTitle></GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                ></Button>
                <Button
                  onClick={onDeleteClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제" 
                ></Button>
                <Button
                  onClick={onSaveClick2}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "77.5vh" }}
              data={process(
                mainDataResult2.data.map((row) => ({
                  ...row,
                  fraction: row.fraction == "" ? "4" : row.fraction,
                  [SELECTED_FIELD]: selectedState2[idGetter(row)],
                })),
                mainDataState2
              )}
              {...mainDataState2}
              onDataStateChange={onMainDataStateChange2}
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
              total={mainDataResult2.total}
              onScroll={onMainScrollHandler2}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange2}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              onItemChange={onMainItemChange2}
              cellRender={customCellRender2}
              rowRender={customRowRender2}
              editField={EDIT_FIELD}
            >
              <GridColumn field="rowstatus" title=" " width="50px" />
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
                            : customField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : checkField.includes(item.fieldName)
                            ? CheckBoxCell
                            : radioField.includes(item.fieldName)
                            ? CustomRadioCell
                            : NameCell
                        }
                        headerCell={
                          requiredField.includes(item.fieldName)
                            ? RequiredHeader
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell2
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
      </TabStrip>
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

export default HU_A3020W;
