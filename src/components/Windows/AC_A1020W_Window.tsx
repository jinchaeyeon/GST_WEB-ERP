import { DataResult, State, getter, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridCellProps,
  GridColumn,
  GridDataStateChangeEvent,
  GridFooterCellProps,
  GridHeaderCellProps,
  GridItemChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Checkbox,
  Input,
  InputChangeEvent,
} from "@progress/kendo-react-inputs";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import {
  IAttachmentData,
  ICustData,
  IWindowPosition,
} from "../../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  loginResultState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CheckBoxCell from "../Cells/CheckBoxCell";
import ComboBoxCell from "../Cells/ComboBoxCell";
import DateCell from "../Cells/DateCell";
import NumberCell from "../Cells/NumberCell";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  ThreeNumberceil,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseParaPc,
  convertDateToStr,
  dateformat,
  getGridItemChangedData,
  toDate,
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import { CellRender, RowRender } from "../Renderers/Renderers";
import PrsnnumWindow from "../Windows/CommonWindows/PrsnnumWindow";
import CodeWindow from "./CommonWindows/CodeWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";

type IKendoWindow = {
  setVisible(t: boolean): void;
  setData(data: string): void;
  pathname: string;
  workType: "N" | "U" | "C";
  para?: any;
  modal?: boolean;
};
const DATA_ITEM_KEY = "num";
let deletedMainRows: object[] = [];
let temp = 0;

type TdataArr = {
  rowstatus_s: string[];
  expenseseq2_s: string[];
  indt_s: string[];
  usekind_s: string[];
  cardcd_s: string[];
  taxdiv_s: string[];
  etax_s: string[];
  dptcd_s: string[];
  custcd_s: string[];
  custnm_s: string[];
  rcvcustcd_s: string[];
  rcvcustnm_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  amt_s: string[];
  taxamt_s: string[];
  acntcd_s: string[];
  acntnm_s: string[];
  attdatnum_s: string[];
  remark_s: string[];
  carddt_s: string[];
  taxtype_s: string[];
};
const FormContext = createContext<{
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const ColumnCommandCell = (props: GridCellProps) => {
  const {
    ariaColumnIndex,
    columnIndex,
    dataItem,
    field = "",
    render,
    onChange,
    className = "",
  } = props;
  const {
    custcd,
    custnm,
    setCustcd,
    setCustnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
  let isInEdit = field == dataItem.inEdit;
  const value = field && dataItem[field] ? dataItem[field] : "";

  const handleChange = (e: InputChangeEvent) => {
    if (onChange) {
      onChange({
        dataIndex: 0,
        dataItem: dataItem,
        field: field,
        syntheticEvent: e.syntheticEvent,
        value: e.target.value ?? "",
      });
    }
  };
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  const setCustData = (data: ICustData) => {
    setCustcd(data.custcd);
    setCustnm(data.custnm);
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
      <ButtonInInput>
        <Button
          onClick={onCustWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_dptcd_001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "dptcd" ? "L_dptcd_001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  const textField = field == "dptcd" ? "dptnm" : "code_name";
  const valueField = field == "dptcd" ? "dptcd" : "sub_code";

  return bizComponent ? (
    <ComboBoxCell
      bizComponent={bizComponent}
      textField={textField}
      valueField={valueField}
      {...props}
    />
  ) : (
    <td />
  );
};

const KendoWindow = ({
  setVisible,
  setData,
  para,
  workType,
  pathname,
  modal = false,
}: IKendoWindow) => {
  const idGetter = getter(DATA_ITEM_KEY);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 900,
  });
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [worktype, setWorkType] = useState<string>(workType);
  // 삭제할 첨부파일 리스트를 담는 함수
  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_AC038, L_AC024, L_AC013, R_TAXDIV_, L_AC401, L_AC030T",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

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

  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);
    setVisible(false);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    expenseseq1: 0,
    expenseno: "",
    location: sessionLocation,
    expensedt: new Date(),
    position: "",
    prsnnum: "",
    prsnnm: "",
    dptcd: "",
    dptnm: "",
    isSearch: true,
    find_row_value: "",
    pgNum: 1,
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

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

  const InputChange = (e: any) => {
    const { value, name } = e.target;
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [name]: value,
            [EDIT_FIELD]: name,
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
  };

  const ComboBoxChange = (e: any) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [e.name]: e.name == "itemcd" ? e.values.stdrmkcd : e.value,
            itemnm: e.name == "itemcd" ? e.values.stdrmknm1 : item.itemnm,
            acntcd: e.name == "itemcd" ? e.values.acntcd : item.acntcd,
            acntnm: e.name == "itemcd" ? e.values.acntnm : item.acntnm,
            [EDIT_FIELD]: e.name,
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
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [name]: value,
            taxdiv:
              name == "usekind"
                ? value == "A" || value == "D" || value == "F"
                  ? "2"
                  : "1"
                : item.taxdiv,
            taxtype:
              name == "usekind"
                ? value == "A" || value == "D" || value == "F"
                  ? ""
                  : value == "B"
                  ? "115"
                  : value == "C"
                  ? "110"
                  : value == "E"
                  ? "900"
                  : item.taxtype
                : item.taxtype,
            taxamt:
              name == "usekind"
                ? value == "A" || value == "D" || value == "F"
                  ? 0
                  : value == "B" || value == "C" || value == "E"
                  ? ThreeNumberceil(item.amt * 0.1)
                  : item.taxamt
                : item.taxamt,
            totamt:
              name == "usekind"
                ? item.amt +
                  (name == "usekind"
                    ? value == "A" || value == "D" || value == "F"
                      ? 0
                      : value == "B" || value == "C" || value == "E"
                      ? ThreeNumberceil(item.amt * 0.1)
                      : item.taxamt
                    : item.taxamt)
                : item.totamt,
            [EDIT_FIELD]: name,
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
  };

  interface IUser {
    user_id: string;
    user_name: string;
    dptcd: string;
    dptnm: string;
  }

  const setUserData = (data: IUser) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        prsnnum: data.user_id,
        prsnnm: data.user_name,
        dptcd: data.dptcd,
        dptnm: data.dptnm,
      };
    });
  };

  const setCustData = (data: ICustData) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            custcd: data.custcd,
            custnm: data.custnm,
          }
        : {
            ...item,
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
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            attdatnum: data.attdatnum,
            files:
              data.original_name +
              (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
          }
        : {
            ...item,
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
  };
  interface ICodeData {
    stdrmkcd: string;
    stdrmknm1: string;
    acntcd: string;
    acntnm: string;
  }

  const setCodeData = (data: ICodeData) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            itemcd: data.stdrmkcd,
            itemnm: data.stdrmknm1,
            acntcd: data.acntcd,
            acntnm: data.acntnm,
          }
        : {
            ...item,
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
  };

  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const [codeWindowVisible, setCodeWindowVisible] = useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };
  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };
  const onCodeWndClick = () => {
    setCodeWindowVisible(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
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

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
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
    if (field != "totamt" && field != "taxamt" && field != "rowstatus") {
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
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              taxamt: item.taxdiv == "1" ? ThreeNumberceil(item.amt * 0.1) : 0,
              totamt:
                item.amt +
                (item.taxdiv == "1" ? ThreeNumberceil(item.amt * 0.1) : 0),
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

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            rcvcustcd: custcd,
            rcvcustnm: custnm,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [custcd, custnm]);

  useEffect(() => {
    if (worktype != "N" && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if ((worktype == "U" || worktype == "C") && para != undefined) {
      setFilters((prev) => ({
        ...prev,
        expenseseq1: para.expenseseq1,
        expenseno: para.expenseno,
        location: para.location,
        expensedt: para.expensedt == "" ? new Date() : toDate(para.expensedt),
        position: para.position,
        prsnnum: para.prsnnum,
        prsnnm: para.prsnnm,
        dptcd: para.dptcd,
        dptnm: para.dptnm,
        isSearch: true,
        find_row_value: "",
        pgNum: 1,
      }));
    }
  }, []);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_AC_A1020W_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": sessionOrgdiv,
        "@p_strdt": "",
        "@p_enddt": "",
        "@p_location": "",
        "@p_prsnnum": "",
        "@p_dptcd": "",
        "@p_expensedt": convertDateToStr(filters.expensedt),
        "@p_expenseseq1": filters.expenseseq1,
        "@p_prsnnm": "",
        "@p_appsts": "",
        "@p_position": "",
        "@p_acntdiv": "",
        "@p_dtgb": "",
        "@p_expensedt_s": "",
        "@p_expenseseq1_s": "",
        "@p_serviceId": companyCode,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (worktype == "C") {
        const newData = rows.map((item: any) => ({
          ...item,
          rowstatus: "N",
          attdatnum: "",
        }));

        setMainDataResult((prev) => {
          return {
            data: newData,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      } else {
        setMainDataResult((prev) => {
          return {
            data: rows,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      }
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
      expenseno: worktype == "C" ? "" : prev.expenseno,
      expensedt: worktype == "C" ? new Date() : prev.expensedt,
      expenseseq1: worktype == "C" ? 0 : prev.expenseseq1,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  const onDeleteClick = (e: any) => {
    let newData: any[] = [];
    let Object: any[] = [];
    let Object2: any[] = [];
    let data;
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
      data: newData,
      total: prev.total - Object.length,
    }));
    if (Object.length > 0) {
      setSelectedState({
        [data != undefined ? data[DATA_ITEM_KEY] : newData[0]]: true,
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
      acntcd: "",
      acntnm: "",
      actkey: "",
      amt: 0,
      attdatnum: "",
      cardcd: "",
      carddt: convertDateToStr(new Date()),
      chk: "N",
      custcd: "",
      custnm: "",
      dptcd: worktype == "N" || worktype == "C" ? filters.dptcd : para.dptcd,
      etax: "",
      expensedt: convertDateToStr(new Date()),
      expenseno: "",
      expenseseq1: 0,
      expenseseq2: 0,
      files: "",
      indt: convertDateToStr(new Date()),
      itemcd: "",
      itemnm: "",
      orgdiv: sessionOrgdiv,
      remark: "",
      taxamt: 0,
      taxdiv: "2",
      taxtype: "",
      totamt: 0,
      usekind: "A",
      rowstatus: "N",
    };

    setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
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
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Checkbox value={values2} onClick={changeCheck}></Checkbox>
      </div>
    );
  };

  const selectData = (selectedData: any) => {
    if (mainDataResult.total == 0) {
      alert("저장할 데이터가 존재하지 않습니다.");
    } else {
      let valid = true;

      mainDataResult.data.map((item) => {
        if (
          item.location == "" ||
          item.prsnnum == "" ||
          item.usekind == "" ||
          item.itemcd == "" ||
          item.carddt == ""
        ) {
          valid = false;
        }
      });

      if (valid != true) {
        alert("필수값을 채워주세요.");
      } else {
        const dataItem = mainDataResult.data.filter((item: any) => {
          return (
            (item.rowstatus == "N" || item.rowstatus == "U") &&
            item.rowstatus !== undefined
          );
        });

        let dataArr: TdataArr = {
          rowstatus_s: [],
          expenseseq2_s: [],
          indt_s: [],
          usekind_s: [],
          cardcd_s: [],
          taxdiv_s: [],
          etax_s: [],
          dptcd_s: [],
          custcd_s: [],
          custnm_s: [],
          rcvcustcd_s: [],
          rcvcustnm_s: [],
          itemcd_s: [],
          itemnm_s: [],
          amt_s: [],
          taxamt_s: [],
          acntcd_s: [],
          acntnm_s: [],
          attdatnum_s: [],
          remark_s: [],
          carddt_s: [],
          taxtype_s: [],
        };

        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            expenseseq2 = "",
            indt = "",
            usekind = "",
            cardcd = "",
            taxdiv = "",
            etax = "",
            dptcd = "",
            custcd = "",
            custnm = "",
            rcvcustcd = "",
            rcvcustnm = "",
            itemcd = "",
            itemnm = "",
            amt = "",
            taxamt = "",
            acntcd = "",
            acntnm = "",
            attdatnum = "",
            remark = "",
            carddt = "",
            taxtype = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.expenseseq2_s.push(
            expenseseq2 == undefined || expenseseq2 == "" ? 0 : expenseseq2
          );
          dataArr.indt_s.push(indt == undefined ? "" : indt);
          dataArr.usekind_s.push(usekind == undefined ? "" : usekind);
          dataArr.cardcd_s.push(cardcd == undefined ? "" : cardcd);
          dataArr.taxdiv_s.push(taxdiv == undefined ? "" : taxdiv);
          dataArr.etax_s.push(etax == undefined ? "" : etax);
          dataArr.dptcd_s.push(dptcd == undefined ? "" : dptcd);
          dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
          dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
          dataArr.rcvcustcd_s.push(rcvcustcd == undefined ? "" : rcvcustcd);
          dataArr.rcvcustnm_s.push(rcvcustnm == undefined ? "" : rcvcustnm);
          dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
          dataArr.itemnm_s.push(itemnm == undefined ? "" : itemnm);
          dataArr.amt_s.push(amt == undefined ? 0 : amt);
          dataArr.taxamt_s.push(taxamt == undefined ? 0 : taxamt);
          dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
          dataArr.acntnm_s.push(acntnm == undefined ? "" : acntnm);
          dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
          dataArr.remark_s.push(remark == undefined ? "" : remark);
          dataArr.carddt_s.push(carddt == undefined ? "" : carddt);
          dataArr.taxtype_s.push(taxtype == undefined ? "" : taxtype);
        });

        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            expenseseq2 = "",
            indt = "",
            usekind = "",
            cardcd = "",
            taxdiv = "",
            etax = "",
            dptcd = "",
            custcd = "",
            custnm = "",
            rcvcustcd = "",
            rcvcustnm = "",
            itemcd = "",
            itemnm = "",
            amt = "",
            taxamt = "",
            acntcd = "",
            acntnm = "",
            attdatnum = "",
            remark = "",
            carddt = "",
            taxtype = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.expenseseq2_s.push(
            expenseseq2 == undefined || expenseseq2 == "" ? 0 : expenseseq2
          );
          dataArr.indt_s.push(indt == undefined ? "" : indt);
          dataArr.usekind_s.push(usekind == undefined ? "" : usekind);
          dataArr.cardcd_s.push(cardcd == undefined ? "" : cardcd);
          dataArr.taxdiv_s.push(taxdiv == undefined ? "" : taxdiv);
          dataArr.etax_s.push(etax == undefined ? "" : etax);
          dataArr.dptcd_s.push(dptcd == undefined ? "" : dptcd);
          dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
          dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
          dataArr.rcvcustcd_s.push(rcvcustcd == undefined ? "" : rcvcustcd);
          dataArr.rcvcustnm_s.push(rcvcustnm == undefined ? "" : rcvcustnm);
          dataArr.itemcd_s.push(itemcd == undefined ? "" : itemcd);
          dataArr.itemnm_s.push(itemnm == undefined ? "" : itemnm);
          dataArr.amt_s.push(amt == undefined ? 0 : amt);
          dataArr.taxamt_s.push(taxamt == undefined ? 0 : taxamt);
          dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
          dataArr.acntnm_s.push(acntnm == undefined ? "" : acntnm);
          dataArr.attdatnum_s.push(attdatnum == undefined ? "" : attdatnum);
          dataArr.remark_s.push(remark == undefined ? "" : remark);
          dataArr.carddt_s.push(carddt == undefined ? "" : carddt);
          dataArr.taxtype_s.push(taxtype == undefined ? "" : taxtype);
        });

        setParaData((prev) => ({
          ...prev,
          workType: worktype == "C" ? "N" : worktype,
          expensedt: convertDateToStr(filters.expensedt),
          expenseseq1: filters.expenseseq1,
          location: filters.location,
          prsnnum: filters.prsnnum,
          dptcd: filters.dptcd,
          position: filters.position,
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          expenseseq2_s: dataArr.expenseseq2_s.join("|"),
          indt_s: dataArr.indt_s.join("|"),
          usekind_s: dataArr.usekind_s.join("|"),
          cardcd_s: dataArr.cardcd_s.join("|"),
          taxdiv_s: dataArr.taxdiv_s.join("|"),
          etax_s: dataArr.etax_s.join("|"),
          dptcd_s: dataArr.dptcd_s.join("|"),
          custcd_s: dataArr.custcd_s.join("|"),
          custnm_s: dataArr.custnm_s.join("|"),
          rcvcustcd_s: dataArr.rcvcustcd_s.join("|"),
          rcvcustnm_s: dataArr.rcvcustnm_s.join("|"),
          itemcd_s: dataArr.itemcd_s.join("|"),
          itemnm_s: dataArr.itemnm_s.join("|"),
          amt_s: dataArr.amt_s.join("|"),
          taxamt_s: dataArr.taxamt_s.join("|"),
          acntcd_s: dataArr.acntcd_s.join("|"),
          acntnm_s: dataArr.acntnm_s.join("|"),
          attdatnum_s: dataArr.attdatnum_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
          carddt_s: dataArr.carddt_s.join("|"),
          taxtype_s: dataArr.taxtype_s.join("|"),
        }));
      }
    }
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    expensedt: "",
    expenseseq1: 0,
    location: "",
    prsnnum: "",
    dptcd: "",
    position: "",
    rowstatus_s: "",
    expenseseq2_s: "",
    indt_s: "",
    usekind_s: "",
    cardcd_s: "",
    taxdiv_s: "",
    etax_s: "",
    dptcd_s: "",
    custcd_s: "",
    custnm_s: "",
    rcvcustcd_s: "",
    rcvcustnm_s: "",
    itemcd_s: "",
    itemnm_s: "",
    amt_s: "",
    taxamt_s: "",
    acntcd_s: "",
    acntnm_s: "",
    attdatnum_s: "",
    remark_s: "",
    carddt_s: "",
    taxtype_s: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "P_AC_A1020W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_expensedt": ParaData.expensedt,
      "@p_expenseseq1": ParaData.expenseseq1,
      "@p_location": ParaData.location,
      "@p_prsnnum": ParaData.prsnnum,
      "@p_dptcd": ParaData.dptcd,
      "@p_position": ParaData.position,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_expenseseq2_s": ParaData.expenseseq2_s,
      "@p_indt_s": ParaData.indt_s,
      "@p_usekind_s": ParaData.usekind_s,
      "@p_cardcd_s": ParaData.cardcd_s,
      "@p_taxdiv_s": ParaData.taxdiv_s,
      "@p_etax_s": ParaData.etax_s,
      "@p_dptcd_s": ParaData.dptcd_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_rcvcustcd_s": ParaData.rcvcustcd_s,
      "@p_rcvcustnm_s": ParaData.rcvcustnm_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_amt_s": ParaData.amt_s,
      "@p_taxamt_s": ParaData.taxamt_s,
      "@p_acntcd_s": ParaData.acntcd_s,
      "@p_acntnm_s": ParaData.acntnm_s,
      "@p_attdatnum_s": ParaData.attdatnum_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_carddt_s": ParaData.carddt_s,
      "@p_taxtype_s": ParaData.taxtype_s,
      "@p_expenseno_s": "",
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1020W",
    },
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setData(data.returnString);
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      let array: any[] = [];
      deletedMainRows.map((item: any) => {
        array.push(item.attdatnum);
      });
      setDeletedAttadatnums(array);
      setUnsavedName([]);
      deletedMainRows = [];
      if (ParaData.workType == "N") {
        setVisible(false);
      }
      setValues2(false);
      setParaData({
        workType: "",
        expensedt: "",
        expenseseq1: 0,
        location: "",
        prsnnum: "",
        dptcd: "",
        position: "",
        rowstatus_s: "",
        expenseseq2_s: "",
        indt_s: "",
        usekind_s: "",
        cardcd_s: "",
        taxdiv_s: "",
        etax_s: "",
        dptcd_s: "",
        custcd_s: "",
        custnm_s: "",
        rcvcustcd_s: "",
        rcvcustnm_s: "",
        itemcd_s: "",
        itemnm_s: "",
        amt_s: "",
        taxamt_s: "",
        acntcd_s: "",
        acntnm_s: "",
        attdatnum_s: "",
        remark_s: "",
        carddt_s: "",
        taxtype_s: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <Window
      title={
        worktype == "N"
          ? "지출결의서생성"
          : worktype == "C"
          ? "지출결의서복사"
          : "지출결의서정보"
      }
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <FormBoxWrap>
        <FormBox>
          <tbody>
            <tr>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                결의서 No
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                <Input
                  name="expenseno"
                  type="text"
                  value={filters.expenseno}
                  className="readonly"
                />
              </td>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                신청일자
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                <DatePicker
                  name="expensedt"
                  value={filters.expensedt}
                  format="yyyy-MM-dd"
                  className="readonly"
                  placeholder=""
                  disabled={true}
                />
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>사업부</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="position"
                    value={filters.position}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>요청자 사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  onChange={filterInputChange}
                  className="required"
                />
                <ButtonInInput>
                  <Button
                    type="button"
                    icon="more-horizontal"
                    fillMode="flat"
                    onClick={onPrsnnumWndClick}
                  />
                </ButtonInInput>
              </td>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                요청자 성명
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  className="readonly"
                />
              </td>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                요청자 부서
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                <Input
                  name="dptnm"
                  type="text"
                  value={filters.dptnm}
                  className="readonly"
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <FormContext.Provider
        value={{
          custcd,
          custnm,
          setCustcd,
          setCustnm,
          mainDataState,
          setMainDataState,
          // fetchGrid,
        }}
      >
        <GridContainer height={position.height - 500 + "px"}>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
            <ButtonContainer>
              <Button
                onClick={onAddClick}
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
            </ButtonContainer>
          </GridTitleContainer>
          <Grid
            style={{ height: `calc(100% - 35px)` }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
                carddt: row.carddt
                  ? new Date(dateformat(row.carddt))
                  : new Date(dateformat("99991231")),
                [SELECTED_FIELD]: selectedState[idGetter(row)], //선택된 데이터
              })),
              mainDataState
            )}
            onDataStateChange={onMainDataStateChange}
            {...mainDataState}
            //선택 subDataState
            dataItemKey={DATA_ITEM_KEY}
            selectedField={SELECTED_FIELD}
            selectable={{
              enabled: true,
              mode: "single",
            }}
            onSelectionChange={onSelectionChange}
            //스크롤 조회기능
            fixedScroll={true}
            total={mainDataResult.total}
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
            <GridColumn
              field="chk"
              title=" "
              width="45px"
              headerCell={CustomCheckBoxCell2}
              cell={CheckBoxCell}
            />
            <GridColumn
              field="carddt"
              title="사용일"
              width="120px"
              cell={DateCell}
              headerCell={RequiredHeader}
              footerCell={mainTotalFooterCell}
            />
            <GridColumn
              field="rcvcustcd"
              title="사용처"
              width="150px"
              cell={ColumnCommandCell}
            />
            <GridColumn field="rcvcustnm" title="사용처명" width="150px" />
            <GridColumn field="remark" title="품의내역" width="200px" />
            <GridColumn
              field="dptcd"
              title="비용부서"
              width="120px"
              cell={CustomComboBoxCell}
            />
            <GridColumn
              field="amt"
              title="지출금액"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="taxamt"
              title="세액"
              width="100px"
              cell={NumberCell}
            />
            <GridColumn
              field="totamt"
              title="합계"
              width="100px"
              cell={NumberCell}
            />
          </Grid>
        </GridContainer>
      </FormContext.Provider>
      <FormBoxWrap>
        <FormBox>
          <tbody>
            <tr>
              <th>사용유형</th>
              <td colSpan={7}>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="usekind"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? ""
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind
                    }
                    bizComponentId="R_AC038"
                    bizComponentData={bizComponentData}
                    changeData={RadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>고객사코드</th>
              <td>
                <Input
                  name="custcd"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].custcd
                  }
                  onChange={InputChange}
                />
                <ButtonInInput>
                  <Button
                    onClick={onCustWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                고객사명
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                <Input
                  name="custnm"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].custnm
                  }
                  className="readonly"
                />
              </td>
              <th>예산항목코드</th>
              <td>
                <Input
                  name="itemcd"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].itemcd
                  }
                  onChange={InputChange}
                  className="required"
                />
                <ButtonInInput>
                  <Button
                    onClick={onCodeWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>예산항목명</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="itemcd"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? ""
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].itemcd
                    }
                    bizComponentId="L_AC024"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                    valueField="stdrmkcd"
                    textField="stdrmknm1"
                    para="AC_A1020W"
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>계산서유형</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="taxtype"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? ""
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].taxtype
                    }
                    bizComponentId="L_AC013"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                    disabled={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? true
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "A" ||
                          mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "D" ||
                          mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "F"
                        ? true
                        : false
                    }
                    className={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? "readonly"
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "A" ||
                          mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "D" ||
                          mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "F"
                        ? "readonly"
                        : undefined
                    }
                  />
                )}
              </td>
              <th>계산서유형 세액</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentRadioGroup
                    name="taxdiv"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? ""
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].taxdiv
                    }
                    bizComponentId="R_TAXDIV_"
                    bizComponentData={bizComponentData}
                    changeData={RadioChange}
                    disabled={true}
                  />
                )}
              </td>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                계정과목코드
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                <Input
                  name="acntcd"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].acntcd
                  }
                  className="readonly"
                />
              </td>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                계정과목명
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                <Input
                  name="acntnm"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].acntnm
                  }
                  className="readonly"
                />
              </td>
            </tr>
            <tr>
              <th>계산서구분</th>
              <td>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="etax"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? ""
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].etax
                    }
                    bizComponentId="L_AC401"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                  />
                )}
              </td>
              <th className={worktype == "N" ? "hide-on-mobile" : ""}>
                카드관련
              </th>
              <td className={worktype == "N" ? "hide-on-mobile" : ""}>
                {bizComponentData !== null && (
                  <BizComponentComboBox
                    name="cardcd"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? ""
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].cardcd
                    }
                    bizComponentId="L_AC030T"
                    bizComponentData={bizComponentData}
                    changeData={ComboBoxChange}
                    valueField="creditcd"
                    textField="creditnm"
                    disabled={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? true
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "B"
                        ? false
                        : true
                    }
                    className={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? "readonly"
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].usekind == "B"
                        ? undefined
                        : "readonly"
                    }
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>첨부파일</th>
              <td colSpan={7}>
                <Input
                  name="files"
                  type="text"
                  value={
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined
                      ? ""
                      : mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0].files
                  }
                  className="readonly"
                />
                <ButtonInInput>
                  <Button
                    type={"button"}
                    onClick={onAttachmentsWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={selectData}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"N"}
          setData={setUserData}
        />
      )}
      {codeWindowVisible && (
        <CodeWindow setVisible={setCodeWindowVisible} setData={setCodeData} />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={
            mainDataResult.data.filter(
              (item: any) =>
                item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0].attdatnum
          }
        />
      )}
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={workType}
          setData={setCustData}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
