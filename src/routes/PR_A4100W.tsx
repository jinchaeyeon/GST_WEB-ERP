import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { getter } from "@progress/kendo-react-common";
import {
  setExpandedState,
  setGroupIds,
} from "@progress/kendo-react-data-tools";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridExpandChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import { Checkbox, Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import DateCell from "../components/Cells/DateCell";
import NumberCell from "../components/Cells/NumberCell";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UsePermissions,
  convertDateToStr,
  dateformat,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  getHeight,
  handleKeyPressSearch,
  numberWithCommas,
  setDefaultDate,
  useSysMessage,
} from "../components/CommonFunction";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { CellRender, RowRender } from "../components/Renderers/GroupRenderers";
import ItemsWindow from "../components/Windows/CommonWindows/ItemsWindow";
import { useApi } from "../hooks/api";
import {
  heightstate,
  isLoading,
  isMobileState,
  loginResultState,
} from "../store/atoms";
import { gridList } from "../store/columns/PR_A4100W_C";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";

const customField = ["outprocyn", "prodmac"];
const dateField = ["plandt", "finexpdt"];
const numberField = ["procseq", "prodqty", "qty", "badqty"];
const DATA_ITEM_KEY = "num";
let targetRowIndex: null | number = null;

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_BA011, L_fxcode", setBizComponentData);
  //수당종류, 세액구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field == "outprocyn" ? "L_BA011" : field == "prodmac" ? "L_fxcode" : "";

  const fieldName = field == "prodmac" ? "fxfull" : undefined;
  const filedValue = field == "prodmac" ? "fxcode" : undefined;
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={fieldName}
      valueField={filedValue}
      {...props}
    />
  ) : (
    <td />
  );
};

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

type TdataArr = {
  planno_s: string[];
  planseq_s: string[];
  qty_s: string[];
  finyn_s: string[];
};
type TdataArr2 = {
  planno_s: string[];
  planseq_s: string[];
  plandt_s: string[];
  finexpdt_s: string[];
  proccd_s: string[];
  procseq_s: string[];
  outprocyn_s: string[];
  prodmac_s: string[];
  qty_s: string[];
  remark_s: string[];
  finyn_s: string[];
};

const PR_A4100W: React.FC = () => {
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [deviceHeight, setDeviceHeight] = useRecoilState(heightstate);
  var height = getHeight(".ButtonContainer");
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pc = UseGetValueFromSessionItem("pc");
  const initialPageState = { skip: 0, take: PAGE_SIZE };
  const [page, setPage] = useState(initialPageState);
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
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
    const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const userId = UseGetValueFromSessionItem("user_id");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_A4100W", setMessagesData);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_A4100W", setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        frdt: setDefaultDate(customOptionData, "frdt"),
        todt: setDefaultDate(customOptionData, "todt"),
        dtgb: defaultOption.find((item: any) => item.id == "dtgb")?.valueCode,
        prodemp: defaultOption.find((item: any) => item.id == "prodemp")
          ?.valueCode,
        prodmac: defaultOption.find((item: any) => item.id == "prodmac")
          ?.valueCode,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        proccd: defaultOption.find((item: any) => item.id == "proccd")
          ?.valueCode,
        outprocyn: defaultOption.find((item: any) => item.id == "outprocyn")
          ?.valueCode,
        finyn: defaultOption.find((item: any) => item.id == "finyn")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_PR010, L_BA171,L_BA061,L_BA015,L_BA005,L_BA172,L_BA173, L_BA003,L_sysUserMaster_001, L_BA020, L_BA016",
    //대분류, 품목계정, 수량단위, 내수구분, 중분류, 소분류, 입고구분, 담당자, 화폐단위, 도/사
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [itemlvl1ListData, setItemlvl1ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl2ListData, setItemlvl2ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [proccdListData, setProccdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setItemlvl1ListData(getBizCom(bizComponentData, "L_BA171"));
      setItemlvl2ListData(getBizCom(bizComponentData, "L_BA172"));
      setItemlvl3ListData(getBizCom(bizComponentData, "L_BA173"));
      setProccdListData(getBizCom(bizComponentData, "L_PR010"));
    }
  }, [bizComponentData]);

  const [group, setGroup] = React.useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [resultState, setResultState] = React.useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );
  //그리드 데이터 스테이트
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [tempState, setTempState] = useState<State>({
    sort: [],
  });
  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [tempResult, setTempResult] = useState<DataResult>(
    process([], tempState)
  );
  const [collapsedState, setCollapsedState] = React.useState<string[]>([]);

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [itemWindowVisible, setItemWindowVisible] = useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    dtgb: "",
    frdt: new Date(),
    todt: new Date(),
    prodemp: "",
    prodmac: "",
    itemcd: "",
    itemnm: "",
    insiz: "",
    proccd: "",
    plankey: "",
    ordnum: "",
    pono: "",
    planno: "",
    outprocyn: "",
    finyn: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A4100W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "Q",
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dtgb": filters.dtgb,
        "@p_frdt": convertDateToStr(filters.frdt),
        "@p_todt": convertDateToStr(filters.todt),
        "@p_itemcd": filters.itemcd,
        "@p_itemnm": filters.itemnm,
        "@p_insiz": filters.insiz,
        "@p_proccd": filters.proccd,
        "@p_prodemp": filters.prodemp,
        "@p_prodmac": filters.prodmac,
        "@p_planno": filters.planno,
        "@p_outprocyn": filters.outprocyn,
        "@p_finyn": filters.finyn,
        "@p_ordnum": filters.ordnum,
        "@p_pono": filters.pono,
        "@p_lotnum": "",
        "@p_plankey": filters.plankey,
        "@p_gonum": "",
        "@p_projectno": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_ordsts": "",
        "@p_find_row_value": filters.find_row_value,
        "@p_service_id": companyCode,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;

      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.planno + "planno",
          group_category_name: "생산계획번호" + " : " + row.planno,
        };
      });

      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) =>
              row.planno + "-" + row.planseq == filters.find_row_value
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

      const newDataState = processWithGroups(rows, group);
      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
      setTotal(totalRowCnt);
      setResultState(newDataState);

      if (totalRowCnt > 0) {
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) =>
                  row.planno + "-" + row.planseq == filters.find_row_value
              );

        if (selectedRow != undefined) {
          setSelectedState({ [selectedRow[DATA_ITEM_KEY]]: true });
        } else {
          setSelectedState({ [rows[0][DATA_ITEM_KEY]]: true });
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

  useEffect(() => {
    if (
      customOptionData != null &&
      filters.isSearch &&
      permissions !== null &&
      bizComponentData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  let gridRef: any = useRef(null);

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
  };

  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [resultState]);

  const newData = setExpandedState({
    data: resultState,
    collapsedIds: collapsedState,
  });

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };

  //그리드 푸터
  const mainTotalFooterCell = (props: GridFooterCellProps) => {
    var parts = total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총
        {total == -1
          ? 0
          : parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
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

  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);
  };

  const onItemWndClick = () => {
    setItemWindowVisible(true);
  };

  interface IItemData {
    itemcd: string;
    itemno: string;
    itemnm: string;
    insiz: string;
    model: string;
    itemacnt: string;
    itemacntnm: string;
    bnatur: string;
    spec: string;
    invunit: string;
    invunitnm: string;
    unitwgt: string;
    wgtunit: string;
    wgtunitnm: string;
    maker: string;
    dwgno: string;
    remark: string;
    itemlvl1: string;
    itemlvl2: string;
    itemlvl3: string;
    extra_field1: string;
    extra_field2: string;
    extra_field7: string;
    extra_field6: string;
    extra_field8: string;
    packingsiz: string;
    unitqty: string;
    color: string;
    gubun: string;
    qcyn: string;
    outside: string;
    itemthick: string;
    itemlvl4: string;
    itemlvl5: string;
    custitemnm: string;
  }

  //품목마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setItemData = (data: IItemData) => {
    setFilters((prev) => ({
      ...prev,
      itemcd: data.itemcd,
      itemnm: data.itemnm,
    }));
  };

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4100W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "PR_A4100W_001");
      } else if (
        filters.dtgb == "" ||
        filters.dtgb == undefined ||
        filters.dtgb == null
      ) {
        throw findMessage(messagesData, "PR_A4100W_002");
      } else {
        setPage(initialPageState); // 페이지 초기화
        resetAllGrid();
        setValues2(false);
        setFilters((prev) => ({
          ...prev,
          pgNum: 1,
          find_row_value: "",
          isSearch: true,
        }));
      }
    } catch (e) {
      alert(e);
    }
  };
  const onExpandChange = React.useCallback(
    (event: GridExpandChangeEvent) => {
      const item = event.dataItem;

      if (item.groupId) {
        const collapsedIds = !event.value
          ? [...collapsedState, item.groupId]
          : collapsedState.filter((groupId) => groupId != item.groupId);
        setCollapsedState(collapsedIds);
      }
    },
    [collapsedState]
  );

  const CustomCheckBoxCell = (props: GridCellProps) => {
    const { ariaColumnIndex, columnIndex, dataItem, field } = props;
    if (props.rowType == "groupHeader") {
      return null;
    }

    const handleChange = () => {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              chk:
                typeof item.chk == "boolean"
                  ? !item.chk
                  : item.chk == "Y"
                  ? false
                  : true,
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    };

    return (
      <td style={{ textAlign: "center" }}>
        <Checkbox value={dataItem["chk"]} onClick={handleChange}></Checkbox>
      </td>
    );
  };

  const [values2, setValues2] = React.useState<boolean>(false);
  const CustomCheckBoxCell2 = (props: GridHeaderCellProps) => {
    const changeCheck = () => {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        rowstatus: item.rowstatus == "N" ? "N" : "U",
        chk: !values2,
        [EDIT_FIELD]: props.field,
      }));
      setValues2(!values2);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const onMainItemChange = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult,
      setMainDataResult,
      DATA_ITEM_KEY
    );
  };

  const enterEdit = (dataItem: any, field: string) => {
    let valid = true;
    if (
      field == "chk" ||
      field == "finexpdt" ||
      field == "outprocyn" ||
      field == "prodmac" ||
      field == "qty" ||
      field == "remark"
    ) {
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
      setTempResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
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
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
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
      const newDataState = processWithGroups(newData, group);
      setResultState(newDataState);
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
  const questionToDelete = useSysMessage("QuestionToDelete");

  const onDeleteClick = async (e: any) => {
    if (!window.confirm(questionToDelete)) {
      return false;
    }

    const dataItem = mainDataResult.data.filter((item: any, index: number) => {
      return item.chk == true && item.rowstatus !== undefined;
    });
    if (dataItem.length == 0) return false;
    let dataArr: TdataArr = {
      planno_s: [],
      planseq_s: [],
      qty_s: [],
      finyn_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const { planno = "", planseq = "", qty = "", finyn2 = "" } = item;

      dataArr.planno_s.push(planno);
      dataArr.planseq_s.push(planseq);
      dataArr.qty_s.push(qty);
      dataArr.finyn_s.push(finyn2 == "완료" ? "Y" : "N");
    });
    const paraD: Iparameters = {
      procedureName: "P_PR_A4100W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "D",
        "@p_orgdiv": sessionOrgdiv,
        "@p_planno_s": dataArr.planno_s.join("|"),
        "@p_planseq_s": dataArr.planseq_s.join("|"),
        "@p_plandt_s": "",
        "@p_finexpdt_s": "",
        "@p_proccd_s": "",
        "@p_procseq_s": "",
        "@p_outprocyn_s": "",
        "@p_prodmac_s": "",
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_remark_s": "",
        "@p_finyn_s": dataArr.finyn_s.join("|"),
        "@p_rowstatus_s": "",
        "@p_chlditemcd_s": "",
        "@p_unitqty_s": "",
        "@p_qtyunit_s": "",
        "@p_outgb_s": "",
        "@p_seq_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4100W",
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", paraD);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    } else {
      setValues2(false);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
    }
  };

  const onCheckClick = async (e: any) => {
    if (!window.confirm("선택한 자료를 완료/완료해제 처리합니다.")) {
      return false;
    }

    const dataItem = mainDataResult.data.filter((item: any, index: number) => {
      return item.chk == true && item.rowstatus !== undefined;
    });
    if (dataItem.length == 0) return false;
    let dataArr: TdataArr = {
      planno_s: [],
      planseq_s: [],
      qty_s: [],
      finyn_s: [],
    };
    dataItem.forEach((item: any, idx: number) => {
      const { planno = "", planseq = "", qty = "", finyn2 = "" } = item;

      dataArr.planno_s.push(planno);
      dataArr.planseq_s.push(planseq);
      dataArr.qty_s.push(qty);
      dataArr.finyn_s.push(finyn2 == "완료" ? "Y" : "N");
    });
    const paraC: Iparameters = {
      procedureName: "P_PR_A4100W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "FINYN",
        "@p_orgdiv": sessionOrgdiv,
        "@p_planno_s": dataArr.planno_s.join("|"),
        "@p_planseq_s": dataArr.planseq_s.join("|"),
        "@p_plandt_s": "",
        "@p_finexpdt_s": "",
        "@p_proccd_s": "",
        "@p_procseq_s": "",
        "@p_outprocyn_s": "",
        "@p_prodmac_s": "",
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_remark_s": "",
        "@p_finyn_s": dataArr.finyn_s.join("|"),
        "@p_rowstatus_s": "",
        "@p_chlditemcd_s": "",
        "@p_unitqty_s": "",
        "@p_qtyunit_s": "",
        "@p_outgb_s": "",
        "@p_seq_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4100W",
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", paraC);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    } else {
      resetAllGrid();
      setValues2(false);
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        find_row_value: data.returnString,
      }));
    }
  };

  const onSaveClick = async (e: any) => {
    const dataItem = mainDataResult.data.filter((item: any, index: number) => {
      return (
        (item.rowstatus == "N" || item.rowstatus == "U") &&
        item.rowstatus !== undefined
      );
    });
    if (dataItem.length == 0) return false;
    let dataArr: TdataArr2 = {
      planno_s: [],
      planseq_s: [],
      plandt_s: [],
      finexpdt_s: [],
      proccd_s: [],
      procseq_s: [],
      outprocyn_s: [],
      prodmac_s: [],
      qty_s: [],
      remark_s: [],
      finyn_s: [],
    };

    dataItem.forEach((item: any, idx: number) => {
      const {
        planno = "",
        planseq = "",
        plandt = "",
        finexpdt = "",
        proccd = "",
        procseq = "",
        outprocyn = "",
        prodmac = "",
        qty = "",
        remark = "",
        finyn2 = "",
      } = item;

      dataArr.planno_s.push(planno);
      dataArr.planseq_s.push(planseq);
      dataArr.plandt_s.push(plandt);
      dataArr.finexpdt_s.push(finexpdt == "99991231" ? "" : finexpdt);
      dataArr.proccd_s.push(proccd);
      dataArr.procseq_s.push(procseq);
      dataArr.outprocyn_s.push(outprocyn);
      dataArr.prodmac_s.push(prodmac);
      dataArr.qty_s.push(qty);
      dataArr.remark_s.push(remark);
      dataArr.finyn_s.push(finyn2 == "완료" ? "Y" : "N");
    });
    const para: Iparameters = {
      procedureName: "P_PR_A4100W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "U",
        "@p_orgdiv": sessionOrgdiv,
        "@p_planno_s": dataArr.planno_s.join("|"),
        "@p_planseq_s": dataArr.planseq_s.join("|"),
        "@p_plandt_s": dataArr.plandt_s.join("|"),
        "@p_finexpdt_s": dataArr.finexpdt_s.join("|"),
        "@p_proccd_s": dataArr.proccd_s.join("|"),
        "@p_procseq_s": dataArr.procseq_s.join("|"),
        "@p_outprocyn_s": dataArr.outprocyn_s.join("|"),
        "@p_prodmac_s": dataArr.prodmac_s.join("|"),
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_remark_s": dataArr.remark_s.join("|"),
        "@p_finyn_s": dataArr.finyn_s.join("|"),
        "@p_rowstatus_s": "",
        "@p_chlditemcd_s": "",
        "@p_unitqty_s": "",
        "@p_qtyunit_s": "",
        "@p_outgb_s": "",
        "@p_seq_s": "",
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "PR_A4100W",
      },
    };
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    } else {
      resetAllGrid();
      setValues2(false);
      setFilters((prev) => ({
        ...prev,
        isSearch: true,
        find_row_value: data.returnString,
      }));
    }
  };

  return (
    <>
      <TitleContainer>
        <Title>생산계획현황</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="PR_A4100W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th colSpan={3}>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dtgb"
                    value={filters.dtgb}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                    textField="name"
                    valueField="code"
                  />
                )}
              </th>
              <td>
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>작업자</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodemp"
                    value={filters.prodemp}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="user_name"
                    valueField="user_id"
                  />
                )}
              </td>
              <th>설비</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="prodmac"
                    value={filters.prodmac}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="fxfull"
                    valueField="fxcode"
                  />
                )}
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>품목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={filters.itemcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onItemWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>품목명</th>
              <td>
                <Input
                  name="itemnm"
                  type="text"
                  value={filters.itemnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>규격</th>
              <td>
                <Input
                  name="insiz"
                  type="text"
                  value={filters.insiz}
                  onChange={filterInputChange}
                />
              </td>
              <th>공정</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="proccd"
                    value={filters.proccd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>작업지시번호</th>
              <td>
                <Input
                  name="plankey"
                  type="text"
                  value={filters.plankey}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th>수주번호</th>
              <td>
                <Input
                  name="ordnum"
                  type="text"
                  value={filters.ordnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>PO번호</th>
              <td>
                <Input
                  name="pono"
                  type="text"
                  value={filters.pono}
                  onChange={filterInputChange}
                />
              </td>
              <th>생산계획번호</th>
              <td>
                <Input
                  name="planno"
                  type="text"
                  value={filters.planno}
                  onChange={filterInputChange}
                />
              </td>
              <th>외주구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="outprocyn"
                    value={filters.outprocyn}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>완료여부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="finyn"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>

      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>요약정보</GridTitle>
          <ButtonContainer>
            <Button
              onClick={onCheckClick}
              themeColor={"primary"}
              icon="check"
              title="일괄처리"
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
          data={newData}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="생산계획현황"
          group={group}
        >
          <Grid
            style={{ height: isMobile ? deviceHeight - height : "72vh" }}
            data={newData.map((item: { items: any[] }) => ({
              ...item,
              items: item.items.map((row: any) => ({
                ...row,
                finexpdt: row.finexpdt
                  ? new Date(dateformat(row.finexpdt))
                  : new Date(dateformat("99991231")),
                proccd: proccdListData.find(
                  (items: any) => items.sub_code == row.proccd
                )?.code_name,
                itemlvl1: itemlvl1ListData.find(
                  (items: any) => items.sub_code == row.itemlvl1
                )?.code_name,
                itemlvl2: itemlvl2ListData.find(
                  (items: any) => items.sub_code == row.itemlvl2
                )?.code_name,
                itemlvl3: itemlvl3ListData.find(
                  (items: any) => items.sub_code == row.itemlvl3
                )?.code_name,
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
            }))}
            //스크롤 조회 기능
            fixedScroll={true}
            //그룹기능
            group={group}
            groupable={true}
            onExpandChange={onExpandChange}
            expandField="expanded"
            //선택 기능
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //페이지네이션
            total={total}
            skip={page.skip}
            take={page.take}
            pageable={true}
            onPageChange={pageChange}
            //원하는 행 위치로 스크롤 기능
            ref={gridRef}
            rowHeight={30}
            onItemChange={onMainItemChange}
            cellRender={customCellRender}
            rowRender={customRowRender}
            editField={EDIT_FIELD}
          >
            <GridColumn field="rowstatus" title=" " width="50px" />
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CustomCheckBoxCell}
            />
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                ?.map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        cell={
                          dateField.includes(item.fieldName)
                            ? DateCell
                            : numberField.includes(item.fieldName)
                            ? NumberCell
                            : customField.includes(item.fieldName)
                            ? CustomComboBoxCell
                            : undefined
                        }
                        footerCell={
                          item.sortOrder == 0
                            ? mainTotalFooterCell
                            : numberField.includes(item.fieldName)
                            ? editNumberFooterCell
                            : undefined
                        }
                      ></GridColumn>
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {itemWindowVisible && (
        <ItemsWindow
          setVisible={setItemWindowVisible}
          workType={"FILTER"}
          setData={setItemData}
          modal={true}
        />
      )}
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

export default PR_A4100W;
