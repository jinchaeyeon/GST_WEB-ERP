import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import {
  Grid,
  GridCellProps,
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
import * as React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IItemData, IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getGridItemChangedData,
  getHeight,
  getWindowDeviceHeight,
  numberWithCommas
} from "../CommonFunction";
import { EDIT_FIELD, GAP, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { CellRender, RowRender } from "../Renderers/Renderers";
import StockWindow from "../Windows/PR_A4000W_ProdStock_Window";
import Window from "./WindowComponent/Window";

let temp = 0;
const DATA_ITEM_KEY = "num";
const BAD_DATA_ITEM_KEY = "num";

const idGetter = getter(DATA_ITEM_KEY);
const idGetter1 = getter(BAD_DATA_ITEM_KEY);
let deletedMainRows: object[] = [];
let deletedMainRows1: object[] = [];

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR300200, L_BA015, L_QC002",
    // 구분, 단위, 불량유형
    setBizComponentData
  );

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "div"
      ? "L_PR300200"
      : field == "qtyunit"
      ? "L_BA015"
      : field == "badcd"
      ? "L_QC002"
      : "";

  const fieldName = field == "div" ? "code_name" : undefined;
  const fieldValue = field == "div" ? "code" : undefined;

  const bizComponent = bizComponentData?.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={fieldValue}
      {...props}
    />
  ) : (
    <td />
  );
};

type TKendoWindow = {
  getVisible(t: boolean): void;
  rekey?: string;
  reloadData(saveyn: string): void; // 저장 유무
  modal?: boolean;
};

type TInData = {
  rowstatus: string[];
  div: string[];
  itemcd: string[];
  itemnm: string[];
  insiz: string[];
  qty: string[];
  qtyunit: string[];
  lotnum: string[];
  remark: string[];
  keyfield: string[];
  proccd: string[];
};

type TBadData = {
  rowstatus: string[];
  keyfield: string[];
  baddt: string[];
  badcd: string[];
  qty: string[];
  remark: string[];
};

var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;

const DetailWindow = ({
  getVisible,
  rekey,
  reloadData,
  modal = false,
}: TKendoWindow) => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);

  const pc = UseGetValueFromSessionItem("pc");
  const processApi = useApi();
  const [isInitSearch, setIsInitSearch] = useState(false);
  const [stockWindowVisible, setStockWindowVisible] = useState<boolean>(false);
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userId = UseGetValueFromSessionItem("user_id");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
  const [page2, setPage2] = useState(initialPageState);

  let grdRef: any = useRef(null);
  let grdRef2: any = useRef(null);
  let targetRowIndex: null | number = null;
  let targetRowIndex2: null | number = null;

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1400) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 700) / 2,
    width: isMobile == true ? deviceWidth : 1400,
    height: isMobile == true ? deviceHeight : 700,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".WindowButtonContainer");
      height4 = getHeight(".WindowButtonContainer2");
      setMobileHeight(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
      );
      setMobileHeight2(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height4
      );
      setWebHeight(
        getWindowDeviceHeight(false, position.height) -
          height -
          height2 -
          height3
      );
      setWebHeight2(
        getWindowDeviceHeight(false, position.height) -
          height -
          height2 -
          height3
      );
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
    setWebHeight2(
      getWindowDeviceHeight(false, position.height) - height - height2 - height3
    );
  };

  const onClose = () => {
    temp = 0;
    getVisible(false);
  };

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

  const pageChange2 = (event: GridPageChangeEvent) => {
    const { page } = event;

    setBadFilters((prev) => ({
      ...prev,
      pgNum: Math.floor(page.skip / initialPageState.take) + 1,
      find_row_value: "",
      isSearch: true,
    }));

    setPage2({
      skip: page.skip,
      take: initialPageState.take,
    });
  };

  //그리드 데이터 스테이트
  const [inDataState, setInDataState] = useState<State>({
    sort: [],
  });

  const [badDataState, setBadDataState] = useState<State>({
    sort: [],
  });

  const [tempState, setTempState] = useState<State>({
    sort: [],
  });

  const [tempState1, setTempState1] = useState<State>({
    sort: [],
  });

  const [inDataResult, setInDataResult] = useState<DataResult>(
    process([], inDataState)
  );

  const [badDataResult, setBadDataResult] = useState<DataResult>(
    process([], badDataState)
  );

  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );

  const [tempResult1, setTempResult1] = useState<DataResult>(
    process([], tempState)
  );

  //선택 상태
  const [inselectedState, setInSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  //선택 상태
  const [badselectedState, setBadSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    rekey: rekey,
    pgNum: 1,
    isSearch: true,
    find_row_value: "",
  });

  const [badfilters, setBadFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: orgdiv,
    rekey: rekey,
    pgNum: 1,
    isSearch: true,
    find_row_value: "",
  });

  // 그리드 데이터 조회
  const fetchInGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const inparameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "PRODDETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": filters.rekey,
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": "",
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": "",
        "@p_itemacnt": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", inparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.keyfield == filters.find_row_value
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
        if (grdRef.current) {
          targetRowIndex = 0;
        }
      }

      setInDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find((row: any) => row.keyfield == filters.find_row_value);

        if (selectedRow != undefined) {
          setInSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setInSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
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

  const fetchBadGrid = async (badfilters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);

    const badparameters: Iparameters = {
      procedureName: "P_PR_A4000W_Q",
      pageNumber: badfilters.pgNum,
      pageSize: badfilters.pgSize,
      parameters: {
        "@p_work_type": "PRODDETAIL",
        "@p_orgdiv": badfilters.orgdiv,
        "@p_frdt": "",
        "@p_todt": "",
        "@p_prodemp": "",
        "@p_prodmac": "",
        "@p_itemcd": "",
        "@p_itemnm": "",
        "@p_insiz": "",
        "@p_lotnum": "",
        "@p_rekey": badfilters.rekey,
        "@p_plankey": "",
        "@p_gokey": "",
        "@p_proccd": "",
        "@p_yyyymm": "",
        "@p_ordnum": "",
        "@p_dptcd": "",
        "@p_location": "",
        "@p_itemacnt": "",
        "@p_find_row_value": badfilters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", badparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[1].Rows;

      if (badfilters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (grdRef2.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.num == badfilters.find_row_value
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
        if (grdRef2.current) {
          targetRowIndex2 = 0;
        }
      }

      setBadDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

      if (totalRowCnt > 0) {
        const selectedRow =
          badfilters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row.keyfield == badfilters.find_row_value
              );

        if (selectedRow != undefined) {
          setBadSelectedState({ [selectedRow[BAD_DATA_ITEM_KEY]]: true });
        } else {
          setBadSelectedState({ [rows[0][BAD_DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }

    // 필터 isSearch false처리, pgNum 세팅
    setBadFilters((prev) => ({
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
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false }));
      fetchInGrid(deepCopiedFilters);
    }
  }, [filters, permissions, customOptionData]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (badfilters.isSearch && permissions.view && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(badfilters);
      setBadFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      }));
      fetchBadGrid(deepCopiedFilters);
    }
  }, [badfilters, permissions, customOptionData]);

  const resetAllGrid = () => {
    setPage(initialPageState); // 페이지 초기화
    setBadDataResult(process([], badDataState));
    setInDataResult(process([], inDataState));
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
    setBadFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };

  const onInDataStateChange = (event: GridDataStateChangeEvent) => {
    setInDataState(event.dataState);
  };

  const onBadDataStateChange = (event: GridDataStateChangeEvent) => {
    setBadDataState(event.dataState);
  };

  const onInSortChange = (e: any) => {
    setInDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const onBadSortChange = (e: any) => {
    setBadDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //그리드 선택 이벤트
  const onInSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: inselectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setInSelectedState(newSelectedState);
  };

  const onBadSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: badselectedState,
      dataItemKey: BAD_DATA_ITEM_KEY,
    });
    setBadSelectedState(newSelectedState);
  };

  //그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (inDataResult.total > 0 && isInitSearch == false) {
      const firstRowData = inDataResult.data[0];
      setInSelectedState({ [firstRowData[DATA_ITEM_KEY]]: true });

      setFilters((prev) => ({
        ...prev,
        rekey: firstRowData.rekey,
      }));
    }
  }, [inDataResult]);

  useEffect(() => {
    if (badDataResult.total > 0 && isInitSearch == false) {
      const firstRowData = badDataResult.data[0];
      setBadSelectedState({ [firstRowData[BAD_DATA_ITEM_KEY]]: true });

      setFilters((prev) => ({
        ...prev,
        rekey: firstRowData.rekey,
      }));
    }
  }, [badDataResult]);

  // 그리드 푸터
  const inTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = inDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const badTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = badDataResult.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style} {...props}>
        총
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const editNumberFooterCell = (props: GridFooterCellProps) => {
    let sum = 0;
    inDataResult.data.forEach((item) =>
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

  const editNumberFooterCell2 = (props: GridFooterCellProps) => {
    let sum = 0;
    badDataResult.data.forEach((item) =>
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

  const enterEdit = (dataItem: any, field: string) => {
    if (field == "qty" || field == "remark" || field == "chk") {
      const newData = inDataResult.data.map((item) =>
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
      setInDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult((prev) => {
        return {
          data: inDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = (item: any) => {
    if (tempResult.data != inDataResult.data) {
      const newData = inDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(inselectedState)[0]
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
      setInDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = inDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));

      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });

      setInDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const enterEdit1 = (dataItem: any, field: string | undefined) => {
    if (
      field == "badcd" ||
      field == "qty" ||
      field == "remark" ||
      field == "chk"
    ) {
      const newData = badDataResult.data.map((item) =>
        item[BAD_DATA_ITEM_KEY] == dataItem[BAD_DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setTempResult1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setBadDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      setTempResult1((prev) => {
        return {
          data: badDataResult.data,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit1 = (item: any) => {
    if (tempResult1.data != badDataResult.data) {
      const newData = badDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(badselectedState)[0]
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
      setTempResult1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setBadDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else {
      const newData = badDataResult.data.map((item) => ({
        ...item,
        [EDIT_FIELD]: undefined,
      }));
      setTempResult1((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      setBadDataResult((prev) => {
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

  const customCellRender1 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit1}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender1 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit1}
      editField={EDIT_FIELD}
    />
  );

  const onInItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(event, inDataResult, setInDataResult, DATA_ITEM_KEY);
  };

  const onBadItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      badDataResult,
      setBadDataResult,
      BAD_DATA_ITEM_KEY
    );
  };

  const [values, setValues] = React.useState<boolean>(false);
  const CustomCheckBoxCell = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = inDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values,
        [EDIT_FIELD]: props.field,
      }));
      setValues(!values);
      setInDataResult((prev) => {
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

  const [values1, setValues1] = React.useState<boolean>(false);
  const CustomCheckBoxCell1 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = badDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values1,
        [EDIT_FIELD]: props.field,
      }));
      setValues1(!values1);
      setBadDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values1} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onInRemoveClick = async () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    //삭제 안 할 데이터 newData에 push
    inDataResult.data.forEach((item: any, index: number) => {
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
      data = inDataResult.data[Math.min(...Object2)];
    } else {
      data = inDataResult.data[Math.min(...Object) - 1];
    }

    setInDataResult((prev) => ({
      ...prev,
      data: newData,
      total: prev.total - Object.length,
    }));

    setInSelectedState({
      [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
    });
  };

  const onBadAddClick = () => {
    // 불량내역 행 추가
    badDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newDataItem = {
      [BAD_DATA_ITEM_KEY]: ++temp,
      baddt: convertDateToStr(new Date()),
      badcd: "",
      qty: 0,
      remark: "",
      rowstatus: "N",
    };

    setBadDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onBadRemoveClick = async () => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;

    //삭제 안 할 데이터 newData에 push
    badDataResult.data.forEach((item: any, index: number) => {
      if (item.chk != true) {
        newData.push(item);
        Object2.push(index);
      } else {
        if (!item.rowstatus || item.rowstatus != "N") {
          const newData2 = item;
          newData2.rowstatus = "D";
          deletedMainRows1.push(newData2);
        }
        Object.push(index);
      }
    });

    if (Math.min(...Object) < Math.min(...Object2)) {
      data = badDataResult.data[Math.min(...Object2)];
    } else {
      data = badDataResult.data[Math.min(...Object) - 1];
    }

    setBadDataResult((prev) => ({
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setBadSelectedState({
        [data != undefined ? data[BAD_DATA_ITEM_KEY] : newData[0]]: true,
      });
    }
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;
    const dataItem = inDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    const dataItem1 = badDataResult.data.filter((item: any) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });

    if (
      dataItem.length == 0 &&
      deletedMainRows.length == 0 &&
      dataItem1.length == 0 &&
      deletedMainRows1.length == 0
    )
      return false;

    let inArr: TInData = {
      rowstatus: [],
      div: [],
      itemcd: [],
      itemnm: [],
      insiz: [],
      qty: [],
      qtyunit: [],
      lotnum: [],
      remark: [],
      keyfield: [],
      proccd: [],
    };

    let badArr: TBadData = {
      rowstatus: [],
      keyfield: [],
      baddt: [],
      badcd: [],
      qty: [],
      remark: [],
    };

    let data: any;
    let data1: any;

    setLoading(true);

    if (dataItem.length > 0 || deletedMainRows.length > 0) {
      dataItem.forEach((item: any) => {
        const {
          rowstatus,
          div,
          itemcd,
          itemnm,
          insiz,
          qty,
          qtyunit,
          lotnum,
          remark,
          keyfield,
          proccd,
        } = item;

        inArr.rowstatus.push(rowstatus);
        inArr.div.push(div);
        inArr.itemcd.push(itemcd);
        inArr.itemnm.push(itemnm);
        inArr.insiz.push(insiz);
        inArr.qty.push(qty);
        inArr.qtyunit.push(qtyunit);
        inArr.lotnum.push(lotnum);
        inArr.remark.push(remark);
        inArr.keyfield.push(keyfield);
        inArr.proccd.push(proccd);
      });

      deletedMainRows.forEach((item: any) => {
        const {
          rowstatus,
          div,
          itemcd,
          itemnm,
          insiz,
          qty,
          qtyunit,
          lotnum,
          remark,
          keyfield,
          proccd,
        } = item;

        inArr.rowstatus.push(rowstatus);
        inArr.div.push(div);
        inArr.itemcd.push(itemcd);
        inArr.itemnm.push(itemnm);
        inArr.insiz.push(insiz);
        inArr.qty.push(qty);
        inArr.qtyunit.push(qtyunit);
        inArr.lotnum.push(lotnum);
        inArr.remark.push(remark);
        inArr.keyfield.push(keyfield);
        inArr.proccd.push(proccd);
      });

      // 프로시저 파라미터
      const inparaSaved: Iparameters = {
        procedureName: "P_PR_A4000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "INITEM",
          "@p_orgdiv": orgdiv,
          "@p_rowstatus": inArr.rowstatus.join("|"),
          "@p_rekey": rekey,
          "@p_location": location,
          "@p_prodemp": "",
          "@p_prodmac": "",
          "@p_qty": inArr.qty.join("|"),
          "@p_qtyunit": inArr.qtyunit.join("|"),
          "@p_lotnum": inArr.lotnum.join("|"),
          "@p_strtime": "",
          "@p_endtime": "",
          "@p_remark": inArr.remark.join("|"),
          "@p_prodemp1": "",
          "@p_prodemp2": "",
          "@p_keyfield": inArr.keyfield.join("|"),
          "@p_div": inArr.div.join("|"),
          "@p_itemcd": inArr.itemcd.join("|"),
          "@p_proccd": inArr.proccd.join("|"),
          "@p_baddt": "",
          "@p_badcd": "",
          "@p_proddt": "",
          "@p_custdiv": "",
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A4000W",
        },
      };

      try {
        data = await processApi<any>("procedure", inparaSaved);
      } catch (error) {
        data = null;
      }

      if (data.isSuccess == true) {
        const isLastDataDeleted =
          inDataResult.data.length == 0 && filters.pgNum > 0;

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
    }

    if (dataItem1.length > 0 || deletedMainRows1.length > 0) {
      dataItem1.forEach((item: any) => {
        const { rowstatus, keyfield, baddt, badcd, qty, remark } = item;
        badArr.rowstatus.push(rowstatus);
        badArr.keyfield.push(keyfield);
        badArr.baddt.push(baddt);
        badArr.badcd.push(badcd);
        badArr.qty.push(qty);
        badArr.remark.push(remark);
      });

      deletedMainRows1.forEach((item: any) => {
        const { rowstatus, keyfield, baddt, badcd, qty, remark } = item;
        badArr.rowstatus.push(rowstatus);
        badArr.keyfield.push(keyfield);
        badArr.baddt.push(baddt);
        badArr.badcd.push(badcd);
        badArr.qty.push(qty);
        badArr.remark.push(remark);
      });

      // 프로시저 파라미터
      const badparaSaved: Iparameters = {
        procedureName: "P_PR_A4000W_S",
        pageNumber: 0,
        pageSize: 0,
        parameters: {
          "@p_work_type": "BAD",
          "@p_orgdiv": orgdiv,
          "@p_rowstatus": badArr.rowstatus.join("|"),
          "@p_rekey": rekey,
          "@p_location": location,
          "@p_prodemp": "",
          "@p_prodmac": "",
          "@p_qty": badArr.qty.join("|"),
          "@p_qtyunit": "",
          "@p_lotnum": "",
          "@p_strtime": "",
          "@p_endtime": "",
          "@p_remark": badArr.remark.join("|"),
          "@p_prodemp1": "",
          "@p_prodemp2": "",
          "@p_keyfield": badArr.keyfield.join("|"),
          "@p_div": "",
          "@p_itemcd": "",
          "@p_proccd": "",
          "@p_baddt": badArr.baddt.join("|"),
          "@p_badcd": badArr.badcd.join("|"),
          "@p_proddt": "",
          "@p_custdiv": "",
          "@p_userid": userId,
          "@p_pc": pc,
          "@p_form_id": "PR_A4000W",
        },
      };

      try {
        data1 = await processApi<any>("procedure", badparaSaved);
      } catch (error) {
        data1 = null;
      }

      if (data1.isSuccess == true) {
        const isLastDataDeleted =
          badDataResult.data.length == 0 && badfilters.pgNum > 0;

        if (isLastDataDeleted) {
          setPage2({
            skip:
              badfilters.pgNum == 1 || badfilters.pgNum == 0
                ? 0
                : PAGE_SIZE * (filters.pgNum - 2),
            take: PAGE_SIZE,
          });
          setBadFilters((prev: any) => ({
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
          setBadFilters((prev: any) => ({
            ...prev,
            find_row_value: data1.returnString,
            pgNum: prev.pgNum,
            isSearch: true,
          }));
        }
        deletedMainRows1 = [];
      } else {
        console.log("[오류 발생]");
        console.log(data1);
        alert(data1.resultMessage);
      }
    }
    setLoading(false);
  };

  const onStockWndClick = () => {
    setStockWindowVisible(true);
  };

  const setCopyData = (data: IItemData[]) => {
    inDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });

    const newData = data.map((item) => ({
      ...item,
      num: ++temp,
      rowstatus: "N",
      qty: 0,
      badqty: 0,
    }));

    setInDataResult((prev) => {
      return {
        data: [...newData, ...prev.data],
        total: prev.total + data.length,
      };
    });
  };

  return (
    <Window
      titles={"상세정보등록"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <GridContainerWrap>
        <GridContainer width={`50%`}>
          <GridTitleContainer className="WindowButtonContainer">
            <GridTitle>투입이력</GridTitle>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onInRemoveClick}
                title="행 삭제"
                icon="minus"
                disabled={permissions.save ? false : true}
              ></Button>
              <Button
                themeColor={"primary"}
                onClick={onStockWndClick}
                icon="folder-open"
                disabled={permissions.save ? false : true}
              >
                재고참조
              </Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight : webheight }}
            data={process(
              inDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: inselectedState[idGetter(row)],
              })),
              inDataState
            )}
            {...inDataState}
            onDataStateChange={onInDataStateChange}
            // 선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onInSelectionChange}
            // 스크롤 조회 기능
            fixedScroll={true}
            total={inDataResult.total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            // 원하는 행 위치로 스크롤 기능
            ref={grdRef}
            rowHeight={30}
            // 정렬기능
            sortable={true}
            onSortChange={onInSortChange}
            // 컬럼순서조정
            reorderable={true}
            // 컬럼너비조정
            resizable={true}
            onItemChange={onInItemChange}
            // incell 수정 기능
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="40px" />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="div"
              title="구분"
              width="100px"
              cell={CustomComboBoxCell}
              footerCell={inTotalFooterCell}
            />
            <GridColumn field="itemcd" title="품목코드" width="150px" />
            <GridColumn field="itemnm" title="품목명" width="180px" />
            <GridColumn field="insiz" title="규격" width="150px" />
            <GridColumn
              field="qty"
              title="사용량"
              width="100px"
              cell={NumberCell}
              footerCell={editNumberFooterCell}
            />
            <GridColumn
              field="qtyunit"
              title="단위"
              width="80px"
              cell={CustomComboBoxCell}
            />
            <GridColumn field="lotnum" title="LOT NO" width="120px" />
            <GridColumn field="remark" title="비고" width="200px" />
          </Grid>
        </GridContainer>
        <GridContainer width={`calc(50% - ${GAP}px)`}>
          <GridTitleContainer className="WindowButtonContainer2">
            <GridTitle>불량내역</GridTitle>
            <ButtonContainer>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onBadAddClick}
                title="행 추가"
                icon="plus"
                disabled={permissions.save ? false : true}
              ></Button>
              <Button
                themeColor={"primary"}
                fillMode="outline"
                onClick={onBadRemoveClick}
                title="행 삭제"
                icon="minus"
                disabled={permissions.save ? false : true}
              ></Button>
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: isMobile ? mobileheight2 : webheight2 }}
            data={process(
              badDataResult.data.map((row) => ({
                ...row,
                [SELECTED_FIELD]: badselectedState[idGetter1(row)], // 선택된 데이터
              })),
              badDataState
            )}
            onDataStateChange={onBadDataStateChange}
            {...badDataState}
            // 선택 기능
            dataItemKey={BAD_DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onBadSelectionChange}
            // 스크롤 조회기능
            fixedScroll={true}
            total={badDataResult.total}
            skip={page2.skip}
            take={page2.take}
            pageable={true}
            onPageChange={pageChange2}
            // 원하는 행 위치로 스크롤 기능
            ref={grdRef2}
            rowHeight={30}
            // 정렬기능
            sortable={true}
            onSortChange={onBadSortChange}
            // 컬럼순서조정
            reorderable={true}
            // 컬럼너비조정
            resizable={true}
            onItemChange={onBadItemChange}
            // incell 수정 기능
            cellRender={customCellRender1}
            rowRender={customRowRender1}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="40px" />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell1}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="baddt"
              title="불량일자"
              width="120px"
              cell={DateCell}
              footerCell={badTotalFooterCell}
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
              footerCell={editNumberFooterCell2}
            />
            <GridColumn field="remark" title="비고" width="180px" />
          </Grid>
        </GridContainer>
      </GridContainerWrap>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          {permissions.save && (
            <Button onClick={onSaveClick} themeColor={"primary"} icon="save">
              저장
            </Button>
          )}
          <Button onClick={onClose} themeColor={"primary"} fillMode="outline">
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>

      {stockWindowVisible && (
        <StockWindow setVisible={setStockWindowVisible} setData={setCopyData} />
      )}
    </Window>
  );
};

export default DetailWindow;
