import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
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
import { gridList } from "../store/columns/AC_A0020W_C";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import AccountWindow from "../components/Windows/CommonWindows/AccountWindow";
import {
  Title,
  FilterBox,
  GridContainer,
  TitleContainer,
  ButtonContainer,
  GridTitleContainer,
  GridTitle,
  GridContainerWrap,
  ButtonInInput,
} from "../CommonStyled";
import FilterContainer from "../components/Containers/FilterContainer";
import { useApi } from "../hooks/api";
import { CellRender, RowRender } from "../components/Renderers/GroupRenderers";
import { Iparameters, TColumn, TGrid, TPermissions } from "../store/types";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import {
  chkScrollHandler,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  UsePermissions,
  handleKeyPressSearch,
  getGridItemChangedData,
  UseParaPc,
  UseGetValueFromSessionItem,
  findMessage,
} from "../components/CommonFunction";
import NumberCell from "../components/Cells/NumberCell";
import {
  COM_CODE_DEFAULT_VALUE,
  PAGE_SIZE,
  SELECTED_FIELD,
  EDIT_FIELD,
  GAP,
} from "../components/CommonString";
import TopButtons from "../components/Buttons/TopButtons";
import { bytesToBase64 } from "byte-base64";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../store/atoms";
import { Input, InputChangeEvent } from "@progress/kendo-react-inputs";
import CheckBoxCell from "../components/Cells/CheckBoxCell";
import ComboBoxCell from "../components/Cells/ComboBoxCell";
import { Button } from "@progress/kendo-react-buttons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import RequiredHeader from "../components/HeaderCells/RequiredHeader";
import RadioGroupCell from "../components/Cells/RadioGroupCell";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";

const DATA_ITEM_KEY = "num";
const customField = ["controltype", "acntgrpgb", "grpchr"];
const checkField = ["system_yn", "p_line", "p_border", "p_color"];
const numberField = ["p_seq"];
const requiredField = ["acntgrpnm", "acntcd", "stdrmkcd", "stdrmknm1"];
let deletedMainRows: object[] = [];
let deletedMainRows2: object[] = [];

type TdataArr = {
  rowstatus_s: string[];
  mngitemcd_s: string[];
  mngitemnm_s: string[];
  system_yn_s: string[];
  extra_field1_s: string[];
  extra_field2_s: string[];
  extra_field3_s: string[];
  table_id_s: string[];
  remark_s: string[];
  controltype_s: string[];
};

type TdataArr2 = {
  rowstatus_s: string[];
  acntgrpcd_s: string[];
  prntacntgrp_s: string[];
  highestyn_s: string[];
  acntgrpgb_s: string[];
  acntgrpnm_s: string[];
  grpchr_s: string[];
  p_line_s: string[];
  p_border_s: string[];
  p_color_s: string[];
  p_seq_s: string[];
  extra_field1_s: string[];
  extra_field2_s: string[];
  extra_field3_s: string[];
  rowstatus2_s: string[];
  acntcd_s: string[];
  acntgrpnm2_s: string[];
  caculationgb_s: string[];
  acntgrpauto_s: string[];
};

type TdataArr3 = {
  rowstatus_s: string[];
  stdrmkcd_s: string[];
  stdrmknm1_s: string[];
  stdrmknm2_s: string[];
  acntcd_s: string[];
  acntnm_s: string[];
};

type TdataArr4 = {
  rowstatus_s: string[];
  itemacnt_s: string[];
  doexdiv_s: string[];
  inoutdiv_s: string[];
  soyn_s: string[];
  dracntcd_s: string[];
  cracntcd_s: string[];
  sodracntcd_s: string[];
  socracntcd_s: string[];
};
let temp = 0;
let temp2 = 0;
let temp3 = 0;
let temp4 = 0;
let temp5 = 0;
const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "L_AC910, L_AC911, L_AC080, L_BA061,L_BA005",
    setBizComponentData
  );
  //보고서구분, 그룹구분, 그룹특성, 품목계정, 내수구분

  const field = props.field ?? "";
  const bizComponentIdVal =
    field === "controltype"
      ? "L_AC910"
      : field === "acntgrpgb"
      ? "L_AC911"
      : field === "grpchr"
      ? "L_AC080"
      : field === "itemacnt"
      ? "L_BA061"
      : field === "doexdiv"
      ? "L_BA005"
      : "";

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
  UseBizComponent("R_Calc", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field == "caculationgb" ? "R_Calc" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

interface IAccountData {
  acntcd: string;
  acntnm: string;
}

const FormContext = createContext<{
  acntcd: string;
  setAcntcd: (d: any) => void;
  acntnm: string;
  setAcntnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext2 = createContext<{
  acntcd2: string;
  setAcntcd2: (d: any) => void;
  acntnm2: string;
  setAcntnm2: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext3 = createContext<{
  acntcd3: string;
  setAcntcd3: (d: any) => void;
  acntnm3: string;
  setAcntnm3: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext4 = createContext<{
  acntcd4: string;
  setAcntcd4: (d: any) => void;
  acntnm4: string;
  setAcntnm4: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext5 = createContext<{
  acntcd5: string;
  setAcntcd5: (d: any) => void;
  acntnm5: string;
  setAcntnm5: (d: any) => void;
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
    acntcd,
    acntnm,
    setAcntcd,
    setAcntnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext);
  let isInEdit = field === dataItem.inEdit;
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
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd(data.acntcd);
    setAcntnm(data.acntnm);
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
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
        />
      )}
    </>
  );
};

const ColumnCommandCell2 = (props: GridCellProps) => {
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
    acntcd2,
    acntnm2,
    setAcntcd2,
    setAcntnm2,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext2);
  let isInEdit = field === dataItem.inEdit;
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
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd2(data.acntcd);
    setAcntnm2(data.acntnm);
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
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
        />
      )}
    </>
  );
};

const ColumnCommandCell3 = (props: GridCellProps) => {
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
    acntcd3,
    acntnm3,
    setAcntcd3,
    setAcntnm3,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext3);
  let isInEdit = field === dataItem.inEdit;
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
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd3(data.acntcd);
    setAcntnm3(data.acntnm);
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
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
        />
      )}
    </>
  );
};

const ColumnCommandCell4 = (props: GridCellProps) => {
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
    acntcd4,
    acntnm4,
    setAcntcd4,
    setAcntnm4,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext4);
  let isInEdit = field === dataItem.inEdit;
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
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd4(data.acntcd);
    setAcntnm4(data.acntnm);
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
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
        />
      )}
    </>
  );
};

const ColumnCommandCell5 = (props: GridCellProps) => {
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
    acntcd5,
    acntnm5,
    setAcntcd5,
    setAcntnm5,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext5);
  let isInEdit = field === dataItem.inEdit;
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
  const [accountWindowVisible, setAccountWindowVisible] =
    useState<boolean>(false);

  const onAccountWndClick = () => {
    setAccountWindowVisible(true);
  };

  const setAcntData = (data: IAccountData) => {
    setAcntcd5(data.acntcd);
    setAcntnm5(data.acntnm);
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
          onClick={onAccountWndClick}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInInput>
    </td>
  );

  return (
    <>
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {accountWindowVisible && (
        <AccountWindow
          setVisible={setAccountWindowVisible}
          setData={setAcntData}
        />
      )}
    </>
  );
};

const AC_A0020W: React.FC = () => {
  const setLoading = useSetRecoilState(isLoading);
  const idGetter = getter(DATA_ITEM_KEY);
  const processApi = useApi();
  const pathname: string = window.location.pathname.replace("/", "");
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [acntcd, setAcntcd] = useState<string>("");
  const [acntnm, setAcntnm] = useState<string>("");
  const [acntcd2, setAcntcd2] = useState<string>("");
  const [acntnm2, setAcntnm2] = useState<string>("");
  const [acntcd3, setAcntcd3] = useState<string>("");
  const [acntnm3, setAcntnm3] = useState<string>("");
  const [acntcd4, setAcntcd4] = useState<string>("");
  const [acntnm4, setAcntnm4] = useState<string>("");
  const [acntcd5, setAcntcd5] = useState<string>("");
  const [acntnm5, setAcntnm5] = useState<string>("");

  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;

      setFilters2((prev) => ({
        ...prev,
        acntses: defaultOption.find((item: any) => item.id === "acntses")
          .valueCode,
      }));

      setFilters4((prev) => ({
        ...prev,
        inoutdiv: defaultOption.find((item: any) => item.id === "inoutdiv")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  useEffect(() => {
    const newData = mainDataResult4.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState4)[0])
        ? {
            ...item,
            acntcd: acntcd,
            acntnm: acntnm,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult4((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd, acntnm]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            cracntcd: acntcd2,
            cracntnm: acntnm2,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd2, acntnm2]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            dracntcd: acntcd3,
            dracntnm: acntnm3,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd3, acntnm3]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            socracntcd: acntcd4,
            socracntnm: acntnm4,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd4, acntnm4]);

  useEffect(() => {
    const newData = mainDataResult6.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState6)[0])
        ? {
            ...item,
            sodracntcd: acntcd5,
            sodracntnm: acntnm5,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  }, [acntcd5, acntnm5]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC062",
    //보고서구분
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [reportgbListData, setReportgbListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const reportgbQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC062")
      );
      fetchQuery(reportgbQueryStr, setReportgbListData);
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

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataState4, setMainDataState4] = useState<State>({
    sort: [],
  });
  const [mainDataState5, setMainDataState5] = useState<State>({
    sort: [],
  });
  const [mainDataState6, setMainDataState6] = useState<State>({
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
  const [mainDataResult4, setMainDataResult4] = useState<DataResult>(
    process([], mainDataState4)
  );
  const [mainDataResult5, setMainDataResult5] = useState<DataResult>(
    process([], mainDataState5)
  );
  const [mainDataResult6, setMainDataResult6] = useState<DataResult>(
    process([], mainDataState6)
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
  const [selectedState4, setSelectedState4] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState5, setSelectedState5] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [selectedState6, setSelectedState6] = useState<{
    [id: string]: boolean | number[];
  }>({});
  const [tabSelected, setTabSelected] = React.useState(0);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 2) {
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters4((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    if (tabSelected == 0) {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (tabSelected == 2) {
      setFilters3((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    mngitemcd: "",
    mngitemnm: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    acntses: "",
    reportgb: "",
    acntgrpcd: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [filters3, setFilters3] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    stdrmkcd: "",
    stdrmknm1: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [filters4, setFilters4] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    inoutdiv: "1",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailfilters2, setDetailFilter2] = useState({
    pgSize: PAGE_SIZE,
    reportgb: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  const [detailfilters2_1, setDetailFilter2_1] = useState({
    pgSize: PAGE_SIZE,
    reportgb: "",
    acntgrpcd: "",
    find_row_value: "",
    scrollDirrection: "down",
    pgNum: 1,
    isSearch: true,
    pgGap: 0,
  });

  //조회조건 파라미터
  const parameters: Iparameters = {
    procedureName: "P_AC_A0020W_tab1_Q",
    pageNumber: filters.pgNum,
    pageSize: filters.pgSize,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": "01",
      "@p_mngitemcd": filters.mngitemcd,
      "@p_mngitemnm": filters.mngitemnm,
    },
  };

  const parameters2: Iparameters = {
    procedureName: "P_AC_A0020W_tab2_Q",
    pageNumber: filters2.pgNum,
    pageSize: filters2.pgSize,
    parameters: {
      "@p_work_type": "REPORTGB",
      "@p_orgdiv": filters2.orgdiv,
      "@p_acntses": filters2.acntses,
      "@p_reportgb": filters2.reportgb,
      "@p_acntgrpcd": filters2.acntgrpcd,
      "@p_find_row_value": "",
    },
  };

  const parameters3: Iparameters = {
    procedureName: "P_AC_A0020W_tab2_Q",
    pageNumber: detailfilters2.pgNum,
    pageSize: detailfilters2.pgSize,
    parameters: {
      "@p_work_type": "FIN1",
      "@p_orgdiv": filters2.orgdiv,
      "@p_acntses": filters2.acntses,
      "@p_reportgb": detailfilters2.reportgb,
      "@p_acntgrpcd": "",
      "@p_find_row_value": "",
    },
  };

  const parameters4: Iparameters = {
    procedureName: "P_AC_A0020W_tab2_Q",
    pageNumber: detailfilters2_1.pgNum,
    pageSize: detailfilters2_1.pgSize,
    parameters: {
      "@p_work_type": "FIN2",
      "@p_orgdiv": filters2.orgdiv,
      "@p_acntses": filters2.acntses,
      "@p_reportgb": detailfilters2_1.reportgb,
      "@p_acntgrpcd": detailfilters2_1.acntgrpcd,
      "@p_find_row_value": "",
    },
  };

  const parameters5: Iparameters = {
    procedureName: "P_AC_A0020W_tab3_Q",
    pageNumber: filters3.pgNum,
    pageSize: filters3.pgSize,
    parameters: {
      "@p_work_type": "STCD",
      "@p_orgdiv": filters3.orgdiv,
      "@p_stdrmkcd": filters3.stdrmkcd,
      "@p_stdrmknm1": filters3.stdrmknm1,
    },
  };

  const parameters6: Iparameters = {
    procedureName: "P_AC_A0020W_tab4_Q",
    pageNumber: filters4.pgNum,
    pageSize: filters4.pgSize,
    parameters: {
      "@p_work_type": "AUTO",
      "@p_orgdiv": filters4.orgdiv,
      "@p_inoutdiv": filters4.inoutdiv,
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
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

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
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid2 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult2((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters2.find_row_value === "" && filters2.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState2({ [firstRowData[DATA_ITEM_KEY]]: true });

          setDetailFilter2((prev) => ({
            ...prev,
            reportgb: firstRowData.reportgb,
            isSearch: true,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters2((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid3 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult3((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });

        if (
          detailfilters2.find_row_value === "" &&
          detailfilters2.pgNum === 1
        ) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState3({ [firstRowData[DATA_ITEM_KEY]]: true });

          setDetailFilter2_1((prev) => ({
            ...prev,
            reportgb: firstRowData.reportgb,
            acntgrpcd: firstRowData.acntgrpcd,
            isSearch: true,
          }));
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setDetailFilter2((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid4 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setMainDataResult4((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters.find_row_value === "" && filters.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState4({ [firstRowData[DATA_ITEM_KEY]]: true });
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

  const fetchMainGrid5 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters5);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      if (totalRowCnt > 0) {
        setMainDataResult5((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters3.find_row_value === "" && filters3.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState5({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters3((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  const fetchMainGrid6 = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", parameters6);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      if (totalRowCnt > 0) {
        setMainDataResult6((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
        if (filters4.find_row_value === "" && filters4.pgNum === 1) {
          // 첫번째 행 선택하기
          const firstRowData = rows[0];
          setSelectedState6({ [firstRowData[DATA_ITEM_KEY]]: true });
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setFilters4((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      setFilters((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid();
    }
  }, [filters, permissions]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (customOptionData != null && filters2.isSearch && permissions !== null) {
      setFilters2((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid2();
    }
  }, [filters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters2.isSearch) {
      setDetailFilter2((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid3();
    }
  }, [detailfilters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (detailfilters2_1.isSearch) {
      setDetailFilter2_1((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid4();
    }
  }, [detailfilters2_1]);

  useEffect(() => {
    if (customOptionData != null && filters3.isSearch && permissions !== null) {
      setFilters3((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid5();
    }
  }, [filters3]);

  useEffect(() => {
    if (customOptionData != null && filters4.isSearch && permissions !== null) {
      setFilters4((prev) => ({ ...prev, isSearch: false }));
      fetchMainGrid6();
    }
  }, [filters4]);

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
      if (filters2.find_row_value !== "" && mainDataResult2.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult2.data.findIndex(
          (item) => idGetter(item) === filters2.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters2((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters2.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult2]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (detailfilters2.find_row_value !== "" && mainDataResult3.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult3.data.findIndex(
          (item) => idGetter(item) === detailfilters2.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setDetailFilter2((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 2,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (detailfilters2.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult3]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters.find_row_value !== "" && mainDataResult4.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult4.data.findIndex(
          (item) => idGetter(item) === filters.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters((prev) => ({
          ...prev,
          find_row_value: "",
          tab: 3,
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult4]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters3.find_row_value !== "" && mainDataResult5.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult5.data.findIndex(
          (item) => idGetter(item) === filters3.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters3((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters3.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult5]);

  useEffect(() => {
    if (customOptionData !== null) {
      // 저장 후, 선택 행 스크롤 유지 처리
      if (filters4.find_row_value !== "" && mainDataResult6.total > 0) {
        const ROW_HEIGHT = 35.56;
        const idx = mainDataResult6.data.findIndex(
          (item) => idGetter(item) === filters4.find_row_value
        );

        const scrollHeight = ROW_HEIGHT * idx;
        gridRef.container.scroll(0, scrollHeight);

        //초기화
        setFilters4((prev) => ({
          ...prev,
          find_row_value: "",
        }));
      }
      // 스크롤 상단으로 조회가 가능한 경우, 스크롤 핸들이 스크롤 바 최상단에서 떨어져있도록 처리
      // 해당 처리로 사용자가 스크롤 업해서 연속적으로 조회할 수 있도록 함
      else if (filters4.scrollDirrection === "up") {
        gridRef.container.scroll(0, 20);
      }
    }
  }, [mainDataResult6]);
  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], mainDataState));
    setMainDataResult2(process([], mainDataState2));
    setMainDataResult3(process([], mainDataState3));
    setMainDataResult4(process([], mainDataState4));
    setMainDataResult5(process([], mainDataState5));
    setMainDataResult6(process([], mainDataState6));
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

      const selectedIdx = event.startRowIndex;
      const selectedRowData = event.dataItems[selectedIdx];
      setMainDataResult3(process([], mainDataState3));
      setMainDataResult4(process([], mainDataState4));
      const report = reportgbListData.find(
        (item: any) => item.code_name === selectedRowData.reportgb
      )?.sub_code;
      setDetailFilter2((prev) => ({
        ...prev,
        reportgb: report == undefined ? "" : report,
        pgNum: 1,
        isSearch: true,
      }));
    } else if (tabSelected === 2) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState5,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState5(newSelectedState);
    } else if (tabSelected === 3) {
      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState6,
        dataItemKey: DATA_ITEM_KEY,
      });

      setSelectedState6(newSelectedState);
    }
  };

  const onDetailSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState3,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState3(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];
    setMainDataResult4(process([], mainDataState4));

    setDetailFilter2_1((prev) => ({
      ...prev,
      reportgb: selectedRowData.reportgb,
      acntgrpcd: selectedRowData.acntgrpcd,
      pgNum: 1,
      isSearch: true,
    }));
  };

  const onDetailSelectionChange2 = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState4,
      dataItemKey: DATA_ITEM_KEY,
    });

    setSelectedState4(newSelectedState);
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
      }));
    }
  };

  const onMainScrollHandler2 = (event: GridEvent) => {
    if (filters2.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters2.pgNum +
      (filters2.scrollDirrection === "up" ? filters2.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters2((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters2.pgNum -
      (filters2.scrollDirrection === "down" ? filters2.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters2((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onMainScrollHandler3 = (event: GridEvent) => {
    if (detailfilters2.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      detailfilters2.pgNum +
      (detailfilters2.scrollDirrection === "up" ? detailfilters2.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setDetailFilter2((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 2,
      }));
      return false;
    }

    pgNumWithGap =
      detailfilters2.pgNum -
      (detailfilters2.scrollDirrection === "down" ? detailfilters2.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setDetailFilter2((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
        tab: 2,
      }));
    }
  };

  const onMainScrollHandler4 = (event: GridEvent) => {
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
        tab: 3,
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
        tab: 3,
      }));
    }
  };

  const onMainScrollHandler5 = (event: GridEvent) => {
    if (filters3.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters3.pgNum +
      (filters3.scrollDirrection === "up" ? filters3.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters3((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters3.pgNum -
      (filters3.scrollDirrection === "down" ? filters3.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters3((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onMainScrollHandler6 = (event: GridEvent) => {
    if (filters4.isSearch) return false; // 한꺼번에 여러번 조회 방지
    let pgNumWithGap =
      filters4.pgNum +
      (filters4.scrollDirrection === "up" ? filters4.pgGap : 0);

    // 스크롤 최하단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE)) {
      setFilters4((prev) => ({
        ...prev,
        scrollDirrection: "down",
        pgNum: pgNumWithGap + 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
      return false;
    }

    pgNumWithGap =
      filters4.pgNum -
      (filters4.scrollDirrection === "down" ? filters4.pgGap : 0);
    // 스크롤 최상단 이벤트
    if (chkScrollHandler(event, pgNumWithGap, PAGE_SIZE, "up")) {
      setFilters4((prev) => ({
        ...prev,
        scrollDirrection: "up",
        pgNum: pgNumWithGap - 1,
        pgGap: prev.pgGap + 1,
        isSearch: true,
      }));
    }
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainDataStateChange2 = (event: GridDataStateChangeEvent) => {
    setMainDataState2(event.dataState);
  };
  const onMainDataStateChange3 = (event: GridDataStateChangeEvent) => {
    setMainDataState3(event.dataState);
  };
  const onMainDataStateChange4 = (event: GridDataStateChangeEvent) => {
    setMainDataState4(event.dataState);
  };
  const onMainDataStateChange5 = (event: GridDataStateChangeEvent) => {
    setMainDataState5(event.dataState);
  };
  const onMainDataStateChange6 = (event: GridDataStateChangeEvent) => {
    setMainDataState6(event.dataState);
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

  const mainTotalFooterCell3 = (props: GridFooterCellProps) => {
    var parts = mainDataResult3.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell4 = (props: GridFooterCellProps) => {
    var parts = mainDataResult4.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell5 = (props: GridFooterCellProps) => {
    var parts = mainDataResult5.total.toString().split(".");
    return (
      <td colSpan={props.colSpan} style={props.style}>
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const mainTotalFooterCell6 = (props: GridFooterCellProps) => {
    var parts = mainDataResult6.total.toString().split(".");
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

  const onMainSortChange3 = (e: any) => {
    setMainDataState3((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange4 = (e: any) => {
    setMainDataState4((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange5 = (e: any) => {
    setMainDataState5((prev) => ({ ...prev, sort: e.sort }));
  };

  const onMainSortChange6 = (e: any) => {
    setMainDataState6((prev) => ({ ...prev, sort: e.sort }));
  };

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
    resetAllGrid();

    if (e.selected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        worktype: "Q",
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    } else if (e.selected == 1) {
      setFilters2((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    } else if (e.selected == 2) {
      setFilters3((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    } else if (e.selected == 3) {
      setFilters4((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    }
    deletedMainRows = [];
  };

  const search = () => {
    resetAllGrid();
    if (tabSelected == 0) {
      setFilters((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    } else if (tabSelected == 1) {
      setFilters2((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    } else if (tabSelected == 2) {
      setFilters3((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    } else if (tabSelected == 3) {
      setFilters4((prev: any) => ({
        ...prev,
        find_row_value: "",
        scrollDirrection: "down",
        pgNum: 1,
        isSearch: true,
        pgGap: 0,
      }));
    }
    deletedMainRows = [];
    deletedMainRows2 = [];
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
    if (field != "rowstatus") {
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
    }
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
      mainDataResult3,
      setMainDataResult3,
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
    if (field != "rowstatus") {
      const newData = mainDataResult3.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setMainDataResult3((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit2 = () => {
    const newData = mainDataResult3.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult3((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onMainItemChange3 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult4,
      setMainDataResult4,
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
    if (field != "rowstatus") {
      const newData = mainDataResult4.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setMainDataResult4((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit3 = () => {
    const newData = mainDataResult4.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult4((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onMainItemChange4 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult5,
      setMainDataResult5,
      DATA_ITEM_KEY
    );
  };

  const customCellRender4 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit4}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender4 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit4}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit4 = (dataItem: any, field: string) => {
    if (field != "rowstatus") {
      const newData = mainDataResult5.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setMainDataResult5((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit4 = () => {
    const newData = mainDataResult5.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult5((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const onMainItemChange5 = (event: GridItemChangeEvent) => {
    getGridItemChangedData(
      event,
      mainDataResult6,
      setMainDataResult6,
      DATA_ITEM_KEY
    );
  };

  const customCellRender5 = (td: any, props: any) => (
    <CellRender
      originalProps={props}
      td={td}
      enterEdit={enterEdit5}
      editField={EDIT_FIELD}
    />
  );

  const customRowRender5 = (tr: any, props: any) => (
    <RowRender
      originalProps={props}
      tr={tr}
      exitEdit={exitEdit5}
      editField={EDIT_FIELD}
    />
  );

  const enterEdit5 = (dataItem: any, field: string) => {
    if (
      field == "soyn" ||
      field == "dracntcd" ||
      field == "cracntcd" ||
      field == "socracntcd" ||
      field == "sodracntcd" ||
      (field == "itemacnt" && dataItem.rowstatus == "N") ||
      (field == "doexdiv" && dataItem.rowstatus == "N")
    ) {
      const newData = mainDataResult6.data.map((item) =>
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );

      setMainDataResult6((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit5 = () => {
    const newData = mainDataResult6.data.map((item) => ({
      ...item,
      [EDIT_FIELD]: undefined,
    }));

    setMainDataResult6((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };
  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp,
      acntdt: undefined,
      controltype: "",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      mngitemcd: "",
      mngitemnm: "",
      orgdiv: "01",
      remark: "",
      system_yn: "N",
      table_id: "",
      rowstatus: "N",
    };

    setMainDataResult((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick2 = () => {
    mainDataResult3.data.map((item) => {
      if (item.num > temp2) {
        temp2 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp2,
      acntgrpauto: "",
      acntgrpcd: "",
      acntgrpgb: "",
      acntgrpnm: "",
      extra_field1: "",
      extra_field2: "",
      extra_field3: "",
      grpchr: "",
      highestyn: "N",
      p_border: "N",
      p_color: "N",
      p_line: "N",
      p_seq: 0,
      prntacntgrp: "",
      reportgb: "01",
      rowstatus: "N",
    };

    setMainDataResult3((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick3 = () => {
    mainDataResult4.data.map((item) => {
      if (item.num > temp3) {
        temp3 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp3,
      acntcd: "",
      acntnm: "",
      caculationgb: "P",
      rowstatus: "N",
    };

    setMainDataResult4((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick4 = () => {
    mainDataResult5.data.map((item) => {
      if (item.num > temp4) {
        temp4 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp4,
      acntcd: "",
      acntnm: "",
      stdrmkcd: "",
      stdrmknm1: "",
      stdrmknm2: "",
      rowstatus: "N",
    };

    setMainDataResult5((prev) => {
      return {
        data: [newDataItem, ...prev.data],
        total: prev.total + 1,
      };
    });
  };

  const onAddClick5 = () => {
    mainDataResult6.data.map((item) => {
      if (item.num > temp5) {
        temp5 = item.num;
      }
    });

    const newDataItem = {
      [DATA_ITEM_KEY]: ++temp5,
      cracntcd: "",
      cracntnm: "",
      doexdiv: "",
      dracntcd: "",
      dracntnm: "",
      inoutdiv: filters4.inoutdiv,
      socracntcd: "",
      socracntnm: "",
      sodracntcd: "",
      sodracntnm: "",
      soyn: "N",
      rowstatus: "N",
    };

    setMainDataResult6((prev) => {
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

  const onDeleteClick2 = (e: any) => {
    let newData: any[] = [];
    let valid = true;
    mainDataResult3.data.forEach((item: any, index: number) => {
      if (!selectedState3[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        try {
          if (mainDataResult4.total != 0) {
            valid = false;
            throw findMessage(messagesData, "AC_A0020W_001");
          } else {
            deletedMainRows.push(newData2);
          }
        } catch (e) {
          alert(e);
        }
      }
    });

    if (valid == true) {
      setMainDataResult3((prev) => ({
        data: newData,
        total: newData.length,
      }));
      setMainDataState3({});
    }
  };

  const onDeleteClick3 = (e: any) => {
    let newData: any[] = [];
    mainDataResult4.data.forEach((item: any, index: number) => {
      if (!selectedState4[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows2.push(newData2);
      }
    });
    setMainDataResult4((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setMainDataState4({});
  };

  const onDeleteClick4 = (e: any) => {
    let newData: any[] = [];
    let valid = true;
    mainDataResult5.data.forEach((item: any, index: number) => {
      if (!selectedState5[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        if (newData2.acntcd != "" && newData2.stdrmkcd != "") {
          deletedMainRows.push(newData2);
        } else {
          alert("필수항목을 채워주세요.");
          valid = false;
        }
      }
    });

    if (valid == true) {
      setMainDataResult5((prev) => ({
        data: newData,
        total: newData.length,
      }));
      setMainDataState5({});
    }
  };

  const onDeleteClick5 = (e: any) => {
    let newData: any[] = [];
    mainDataResult6.data.forEach((item: any, index: number) => {
      if (!selectedState6[item[DATA_ITEM_KEY]]) {
        newData.push(item);
      } else {
        const newData2 = {
          ...item,
          rowstatus: "D",
        };
        deletedMainRows.push(newData2);
      }
    });
    setMainDataResult6((prev) => ({
      data: newData,
      total: newData.length,
    }));
    setMainDataState6({});
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
          item.mngitemcd == undefined ||
          item.mngitemcd == null ||
          item.mngitemcd == ""
        ) {
          valid = false;
        }
      });
      let dataArr: TdataArr = {
        rowstatus_s: [],
        mngitemcd_s: [],
        mngitemnm_s: [],
        system_yn_s: [],
        extra_field1_s: [],
        extra_field2_s: [],
        extra_field3_s: [],
        table_id_s: [],
        remark_s: [],
        controltype_s: [],
      };

      if (valid == true) {
        if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            mngitemcd = "",
            mngitemnm = "",
            system_yn = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            table_id = "",
            remark = "",
            controltype = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.mngitemcd_s.push(mngitemcd);
          dataArr.mngitemnm_s.push(mngitemnm);
          dataArr.system_yn_s.push(
            system_yn == true ? "Y" : system_yn == false ? "N" : system_yn
          );
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
          dataArr.table_id_s.push(table_id);
          dataArr.remark_s.push(remark);
          dataArr.controltype_s.push(controltype);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            mngitemcd = "",
            mngitemnm = "",
            system_yn = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            table_id = "",
            remark = "",
            controltype = "",
          } = item;
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.mngitemcd_s.push(mngitemcd);
          dataArr.mngitemnm_s.push(mngitemnm);
          dataArr.system_yn_s.push(
            system_yn == true ? "Y" : system_yn == false ? "N" : system_yn
          );
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
          dataArr.table_id_s.push(table_id);
          dataArr.remark_s.push(remark);
          dataArr.controltype_s.push(controltype);
        });
        setParaData((prev) => ({
          ...prev,
          workType: "MNGITEM",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          mngitemcd_s: dataArr.mngitemcd_s.join("|"),
          mngitemnm_s: dataArr.mngitemnm_s.join("|"),
          system_yn_s: dataArr.system_yn_s.join("|"),
          extra_field1_s: dataArr.extra_field1_s.join("|"),
          extra_field2_s: dataArr.extra_field2_s.join("|"),
          extra_field3_s: dataArr.extra_field3_s.join("|"),
          table_id_s: dataArr.table_id_s.join("|"),
          remark_s: dataArr.remark_s.join("|"),
          controltype_s: dataArr.controltype_s.join("|"),
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
      const dataItem = mainDataResult3.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      const dataItem2 = mainDataResult4.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      if (dataItem.length != 0) {
        dataItem.map((item) => {
          if (
            item.acntgrpnm == undefined ||
            item.acntgrpnm == null ||
            item.acntgrpnm == ""
          ) {
            valid = false;
          }
        });
      }

      let dataArr: TdataArr2 = {
        rowstatus_s: [],
        acntgrpcd_s: [],
        prntacntgrp_s: [],
        highestyn_s: [],
        acntgrpgb_s: [],
        acntgrpnm_s: [],
        grpchr_s: [],
        p_line_s: [],
        p_border_s: [],
        p_color_s: [],
        p_seq_s: [],
        extra_field1_s: [],
        extra_field2_s: [],
        extra_field3_s: [],
        rowstatus2_s: [],
        acntcd_s: [],
        acntgrpnm2_s: [],
        caculationgb_s: [],
        acntgrpauto_s: [],
      };

      if (valid == true) {
        if (
          dataItem.length === 0 &&
          dataItem2.length === 0 &&
          deletedMainRows.length == 0 &&
          deletedMainRows2.length == 0
        )
          return false;
        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            acntgrpcd = "",
            prntacntgrp = "",
            highestyn = "",
            acntgrpgb = "",
            acntgrpnm = "",
            grpchr = "",
            p_line = "",
            p_border = "",
            p_color = "",
            p_seq = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            acntgrpauto = "",
          } = item;

          dataArr.acntgrpauto_s.push(
            acntgrpauto == undefined ? "" : acntgrpauto
          );
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.acntgrpcd_s.push(acntgrpcd);
          dataArr.prntacntgrp_s.push(prntacntgrp);
          dataArr.highestyn_s.push(
            highestyn == true ? "Y" : highestyn == false ? "N" : highestyn
          );
          dataArr.acntgrpgb_s.push(acntgrpgb);
          dataArr.acntgrpnm_s.push(acntgrpnm);
          dataArr.grpchr_s.push(grpchr);
          dataArr.p_line_s.push(
            p_line == true ? "Y" : p_line == false ? "N" : p_line
          );
          dataArr.p_border_s.push(
            p_border == true ? "Y" : p_border == false ? "N" : p_border
          );
          dataArr.p_color_s.push(
            p_color == true ? "Y" : p_color == false ? "N" : p_color
          );
          dataArr.p_seq_s.push(p_seq);
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
        });
        dataItem2.forEach((item: any, idx: number) => {
          const {
            acntcd = "",
            acntgrpnm2 = "",
            caculationgb = "",
            rowstatus = "",
          } = item;
          dataArr.rowstatus2_s.push(rowstatus == undefined ? "" : rowstatus);
          dataArr.caculationgb_s.push(caculationgb);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntgrpnm2_s.push(acntgrpnm2);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            acntgrpcd = "",
            prntacntgrp = "",
            highestyn = "",
            acntgrpgb = "",
            acntgrpnm = "",
            grpchr = "",
            p_line = "",
            p_border = "",
            p_color = "",
            p_seq = "",
            extra_field1 = "",
            extra_field2 = "",
            extra_field3 = "",
            acntgrpauto = "",
          } = item;
          dataArr.acntgrpauto_s.push(
            acntgrpauto == undefined ? "" : acntgrpauto
          );
          dataArr.rowstatus_s.push(rowstatus);
          dataArr.acntgrpcd_s.push(acntgrpcd);
          dataArr.prntacntgrp_s.push(prntacntgrp);
          dataArr.highestyn_s.push(
            highestyn == true ? "Y" : highestyn == false ? "N" : highestyn
          );
          dataArr.acntgrpgb_s.push(acntgrpgb);
          dataArr.acntgrpnm_s.push(acntgrpnm);
          dataArr.grpchr_s.push(grpchr);
          dataArr.p_line_s.push(
            p_line == true ? "Y" : p_line == false ? "N" : p_line
          );
          dataArr.p_border_s.push(
            p_border == true ? "Y" : p_border == false ? "N" : p_border
          );
          dataArr.p_color_s.push(
            p_color == true ? "Y" : p_color == false ? "N" : p_color
          );
          dataArr.p_seq_s.push(p_seq);
          dataArr.extra_field1_s.push(extra_field1);
          dataArr.extra_field2_s.push(extra_field2);
          dataArr.extra_field3_s.push(extra_field3);
        });
        deletedMainRows2.forEach((item: any, idx: number) => {
          const {
            acntcd = "",
            acntgrpnm2 = "",
            caculationgb = "",
            rowstatus = "",
          } = item;
          dataArr.rowstatus2_s.push(rowstatus == undefined ? "" : rowstatus);
          dataArr.caculationgb_s.push(caculationgb);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntgrpnm2_s.push(acntgrpnm2);
        });
        if (dataArr.acntcd_s.length != 0) {
          setParaData2((prev) => ({
            ...prev,
            workType: "FIN1",
            acntses_s: filters2.acntses,
            reportgb_s: detailfilters2.reportgb,
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            acntgrpcd_s: dataArr.acntgrpcd_s.join("|"),
            prntacntgrp_s: dataArr.prntacntgrp_s.join("|"),
            highestyn_s: dataArr.highestyn_s.join("|"),
            acntgrpgb_s: dataArr.acntgrpgb_s.join("|"),
            acntgrpnm_s: dataArr.acntgrpnm_s.join("|"),
            grpchr_s: dataArr.grpchr_s.join("|"),
            p_line_s: dataArr.p_line_s.join("|"),
            p_border_s: dataArr.p_border_s.join("|"),
            p_color_s: dataArr.p_color_s.join("|"),
            p_seq_s: dataArr.p_seq_s.join("|"),
            extra_field1_s: dataArr.extra_field1_s.join("|"),
            extra_field2_s: dataArr.extra_field2_s.join("|"),
            extra_field3_s: dataArr.extra_field3_s.join("|"),
            rowstatus2_s: dataArr.rowstatus2_s.join("|"),
            acntgrpcd: detailfilters2_1.acntgrpcd,
            acntcd_s: dataArr.acntcd_s.join("|"),
            acntgrpnm2_s: dataArr.acntgrpnm2_s.join("|"),
            caculationgb_s: dataArr.caculationgb_s.join("|"),
            acntgrpauto_s: dataArr.acntgrpauto_s.join("|"),
          }));
        } else {
          setParaData2((prev) => ({
            ...prev,
            workType: "FIN1",
            acntses_s: filters2.acntses,
            reportgb_s: detailfilters2.reportgb,
            rowstatus_s: dataArr.rowstatus_s.join("|"),
            acntgrpcd_s: dataArr.acntgrpcd_s.join("|"),
            prntacntgrp_s: dataArr.prntacntgrp_s.join("|"),
            highestyn_s: dataArr.highestyn_s.join("|"),
            acntgrpgb_s: dataArr.acntgrpgb_s.join("|"),
            acntgrpnm_s: dataArr.acntgrpnm_s.join("|"),
            grpchr_s: dataArr.grpchr_s.join("|"),
            p_line_s: dataArr.p_line_s.join("|"),
            p_border_s: dataArr.p_border_s.join("|"),
            p_color_s: dataArr.p_color_s.join("|"),
            p_seq_s: dataArr.p_seq_s.join("|"),
            extra_field1_s: dataArr.extra_field1_s.join("|"),
            extra_field2_s: dataArr.extra_field2_s.join("|"),
            extra_field3_s: dataArr.extra_field3_s.join("|"),
            rowstatus2_s: "",
            acntgrpcd: "",
            acntcd_s: "",
            acntgrpnm2_s: "",
            caculationgb_s: "",
            acntgrpauto_s: dataArr.acntgrpauto_s.join("|"),
          }));
        }
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick3 = () => {
    let valid = true;
    try {
      const dataItem = mainDataResult5.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });
      dataItem.map((item) => {
        if (
          item.acntcd == undefined ||
          item.acntcd == null ||
          item.acntcd == ""
        ) {
          valid = false;
        } else if (
          item.stdrmkcd == undefined ||
          item.stdrmkcd == null ||
          item.stdrmkcd == ""
        ) {
          valid = false;
        } else if (
          item.stdrmknm1 == undefined ||
          item.stdrmknm1 == null ||
          item.stdrmknm1 == ""
        ) {
          valid = false;
        }
      });

      let dataArr: TdataArr3 = {
        rowstatus_s: [],
        stdrmkcd_s: [],
        stdrmknm1_s: [],
        stdrmknm2_s: [],
        acntcd_s: [],
        acntnm_s: [],
      };

      if (valid == true) {
        if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

        dataItem.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            stdrmkcd = "",
            stdrmknm1 = "",
            stdrmknm2 = "",
            acntcd = "",
            acntnm = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.stdrmkcd_s.push(stdrmkcd);
          dataArr.stdrmknm1_s.push(stdrmknm1);
          dataArr.stdrmknm2_s.push(stdrmknm2);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntnm_s.push(acntnm);
        });
        deletedMainRows.forEach((item: any, idx: number) => {
          const {
            rowstatus = "",
            stdrmkcd = "",
            stdrmknm1 = "",
            stdrmknm2 = "",
            acntcd = "",
            acntnm = "",
          } = item;

          dataArr.rowstatus_s.push(rowstatus);
          dataArr.stdrmkcd_s.push(stdrmkcd);
          dataArr.stdrmknm1_s.push(stdrmknm1);
          dataArr.stdrmknm2_s.push(stdrmknm2);
          dataArr.acntcd_s.push(acntcd);
          dataArr.acntnm_s.push(acntnm);
        });
        setParaData3((prev) => ({
          ...prev,
          workType: "STCD",
          rowstatus_s: dataArr.rowstatus_s.join("|"),
          stdrmkcd_s: dataArr.stdrmkcd_s.join("|"),
          stdrmknm1_s: dataArr.stdrmknm1_s.join("|"),
          stdrmknm2_s: dataArr.stdrmknm2_s.join("|"),
          acntcd_s: dataArr.acntcd_s.join("|"),
          acntnm_s: dataArr.acntnm_s.join("|"),
        }));
      } else {
        alert("필수항목을 채워주세요.");
      }
    } catch (e) {
      alert(e);
    }
  };

  const onSaveClick4 = () => {
    try {
      const dataItem = mainDataResult6.data.filter((item: any) => {
        return (
          (item.rowstatus === "N" || item.rowstatus === "U") &&
          item.rowstatus !== undefined
        );
      });

      let dataArr: TdataArr4 = {
        rowstatus_s: [],
        itemacnt_s: [],
        doexdiv_s: [],
        inoutdiv_s: [],
        soyn_s: [],
        dracntcd_s: [],
        cracntcd_s: [],
        sodracntcd_s: [],
        socracntcd_s: [],
      };

      if (dataItem.length === 0 && deletedMainRows.length == 0) return false;

      dataItem.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          itemacnt = "",
          doexdiv = "",
          inoutdiv = "",
          soyn = "",
          dracntcd = "",
          cracntcd = "",
          sodracntcd = "",
          socracntcd = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.doexdiv_s.push(doexdiv);
        dataArr.inoutdiv_s.push(inoutdiv);
        dataArr.soyn_s.push(soyn == true ? "Y" : soyn == false ? "N" : soyn);
        dataArr.dracntcd_s.push(dracntcd);
        dataArr.cracntcd_s.push(cracntcd);
        dataArr.sodracntcd_s.push(sodracntcd);
        dataArr.socracntcd_s.push(socracntcd);
      });
      deletedMainRows.forEach((item: any, idx: number) => {
        const {
          rowstatus = "",
          itemacnt = "",
          doexdiv = "",
          inoutdiv = "",
          soyn = "",
          dracntcd = "",
          cracntcd = "",
          sodracntcd = "",
          socracntcd = "",
        } = item;

        dataArr.rowstatus_s.push(rowstatus);
        dataArr.itemacnt_s.push(itemacnt);
        dataArr.doexdiv_s.push(doexdiv);
        dataArr.inoutdiv_s.push(inoutdiv);
        dataArr.soyn_s.push(soyn == true ? "Y" : soyn == false ? "N" : soyn);
        dataArr.dracntcd_s.push(dracntcd);
        dataArr.cracntcd_s.push(cracntcd);
        dataArr.sodracntcd_s.push(sodracntcd);
        dataArr.socracntcd_s.push(socracntcd);
      });
      setParaData4((prev) => ({
        ...prev,
        workType: "AUTO",
        rowstatus_s: dataArr.rowstatus_s.join("|"),
        itemacnt_s: dataArr.itemacnt_s.join("|"),
        doexdiv_s: dataArr.doexdiv_s.join("|"),
        inoutdiv_s: dataArr.inoutdiv_s.join("|"),
        soyn_s: dataArr.soyn_s.join("|"),
        dracntcd_s: dataArr.dracntcd_s.join("|"),
        cracntcd_s: dataArr.cracntcd_s.join("|"),
        sodracntcd_s: dataArr.sodracntcd_s.join("|"),
        socracntcd_s: dataArr.socracntcd_s.join("|"),
      }));
    } catch (e) {
      alert(e);
    }
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "MNGITEM",
    orgdiv: "01",
    rowstatus_s: "",
    mngitemcd_s: "",
    mngitemnm_s: "",
    system_yn_s: "",
    extra_field1_s: "",
    extra_field2_s: "",
    extra_field3_s: "",
    table_id_s: "",
    remark_s: "",
    controltype_s: "",
  });

  const [ParaData2, setParaData2] = useState({
    pgSize: PAGE_SIZE,
    workType: "FIN1",
    orgdiv: "01",
    rowstatus_s: "",
    acntses_s: "",
    reportgb_s: "",
    acntgrpcd_s: "",
    prntacntgrp_s: "",
    highestyn_s: "",
    acntgrpgb_s: "",
    acntgrpnm_s: "",
    grpchr_s: "",
    p_line_s: "",
    p_border_s: "",
    p_color_s: "",
    p_seq_s: "",
    extra_field1_s: "",
    extra_field2_s: "",
    extra_field3_s: "",
    rowstatus2_s: "",
    acntgrpcd: "",
    acntcd_s: "",
    acntgrpnm2_s: "",
    caculationgb_s: "",
    acntgrpauto_s: "",
  });

  const [ParaData3, setParaData3] = useState({
    pgSize: PAGE_SIZE,
    workType: "STCD",
    orgdiv: "01",
    rowstatus_s: "",
    stdrmkcd_s: "",
    stdrmknm1_s: "",
    stdrmknm2_s: "",
    acntcd_s: "",
    acntnm_s: "",
  });

  const [ParaData4, setParaData4] = useState({
    pgSize: PAGE_SIZE,
    workType: "AUTO",
    orgdiv: "01",
    location: "01",
    position: "",
    rowstatus_s: "",
    itemacnt_s: "",
    doexdiv_s: "",
    inoutdiv_s: "",
    soyn_s: "",
    dracntcd_s: "",
    cracntcd_s: "",
    sodracntcd_s: "",
    socracntcd_s: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A0020W_tab1_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_mngitemcd_s": ParaData.mngitemcd_s,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_mngitemnm_s": ParaData.mngitemnm_s,
      "@p_system_yn_s": ParaData.system_yn_s,
      "@p_extra_field1_s": ParaData.extra_field1_s,
      "@p_extra_field2_s": ParaData.extra_field2_s,
      "@p_extra_field3_s": ParaData.extra_field3_s,
      "@p_table_id_s": ParaData.table_id_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_controltype_s": ParaData.controltype_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  const para2: Iparameters = {
    procedureName: "P_AC_A0020W_tab2_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.workType,
      "@p_orgdiv": ParaData2.orgdiv,
      "@p_rowstatus_s": ParaData2.rowstatus_s,
      "@p_acntses_s": ParaData2.acntses_s,
      "@p_reportgb_s": ParaData2.reportgb_s,
      "@p_acntgrpcd_s": ParaData2.acntgrpcd_s,
      "@p_prntacntgrp_s": ParaData2.prntacntgrp_s,
      "@p_highestyn_s": ParaData2.highestyn_s,
      "@p_acntgrpgb_s": ParaData2.acntgrpgb_s,
      "@p_acntgrpnm_s": ParaData2.acntgrpnm_s,
      "@p_grpchr_s": ParaData2.grpchr_s,
      "@p_p_line_s": ParaData2.p_line_s,
      "@p_p_border_s": ParaData2.p_border_s,
      "@p_p_color_s": ParaData2.p_color_s,
      "@p_p_seq_s": ParaData2.p_seq_s,
      "@p_extra_field11_s": ParaData2.extra_field1_s,
      "@p_extra_field21_s": ParaData2.extra_field2_s,
      "@p_extra_field31_s": ParaData2.extra_field3_s,
      "@p_rowstatus2_s": ParaData2.rowstatus2_s,
      "@p_acntgrpcd": ParaData2.acntgrpcd,
      "@p_acntcd_s": ParaData2.acntcd_s,
      "@p_acntgrpnm2_s": ParaData2.acntgrpnm2_s,
      "@p_caculationgb_s": ParaData2.caculationgb_s,
      "@p_acntgrpauto_s": ParaData2.acntgrpauto_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  const para3: Iparameters = {
    procedureName: "P_AC_A0020W_tab3_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData3.workType,
      "@p_orgdiv": ParaData3.orgdiv,
      "@p_rowstatus_s": ParaData3.rowstatus_s,
      "@p_stdrmkcd_s": ParaData3.stdrmkcd_s,
      "@p_stdrmknm1_s": ParaData3.stdrmknm1_s,
      "@p_stdrmknm2_s": ParaData3.stdrmknm2_s,
      "@p_acntcd_s": ParaData3.acntcd_s,
      "@p_acntnm_s": ParaData3.acntnm_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  const para4: Iparameters = {
    procedureName: "P_AC_A0020W_tab4_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData4.workType,
      "@p_orgdiv": ParaData4.orgdiv,
      "@p_location": ParaData4.location,
      "@p_position": ParaData4.position,
      "@p_rowstatus_s": ParaData4.rowstatus_s,
      "@p_itemacnt_s": ParaData4.itemacnt_s,
      "@p_doexdiv_s": ParaData4.doexdiv_s,
      "@p_inoutdiv_s": ParaData4.inoutdiv_s,
      "@p_soyn_s": ParaData4.soyn_s,
      "@p_dracntcd_s": ParaData4.dracntcd_s,
      "@p_cracntcd_s": ParaData4.cracntcd_s,
      "@p_sodracntcd_s": ParaData4.sodracntcd_s,
      "@p_socracntcd_s": ParaData4.socracntcd_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A0020W",
    },
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  useEffect(() => {
    if (
      ParaData2.rowstatus_s != "" ||
      ParaData2.acntcd_s != "" ||
      ParaData2.workType == "COPY"
    ) {
      fetchTodoGridSaved2();
    }
  }, [ParaData2]);

  useEffect(() => {
    if (ParaData3.rowstatus_s != "") {
      fetchTodoGridSaved3();
    }
  }, [ParaData3]);

  useEffect(() => {
    if (ParaData4.rowstatus_s != "") {
      fetchTodoGridSaved4();
    }
  }, [ParaData4]);

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
        workType: "MNGITEM",
        orgdiv: "01",
        rowstatus_s: "",
        mngitemcd_s: "",
        mngitemnm_s: "",
        system_yn_s: "",
        extra_field1_s: "",
        extra_field2_s: "",
        extra_field3_s: "",
        table_id_s: "",
        remark_s: "",
        controltype_s: "",
      });
      deletedMainRows = [];
      resetAllGrid();
      if (tabSelected == 0) {
        setFilters((prev: any) => ({
          ...prev,
          worktype: "Q",
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
          tab: 0,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved2 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setParaData2({
        pgSize: PAGE_SIZE,
        workType: "FIN1",
        orgdiv: "01",
        rowstatus_s: "",
        acntses_s: "",
        reportgb_s: "",
        acntgrpcd_s: "",
        prntacntgrp_s: "",
        highestyn_s: "",
        acntgrpgb_s: "",
        acntgrpnm_s: "",
        grpchr_s: "",
        p_line_s: "",
        p_border_s: "",
        p_color_s: "",
        p_seq_s: "",
        extra_field1_s: "",
        extra_field2_s: "",
        extra_field3_s: "",
        rowstatus2_s: "",
        acntgrpcd: "",
        acntcd_s: "",
        acntgrpnm2_s: "",
        caculationgb_s: "",
        acntgrpauto_s: "",
      });
      deletedMainRows = [];
      deletedMainRows2 = [];
      resetAllGrid();
      if (tabSelected == 1) {
        setFilters2((prev: any) => ({
          ...prev,
          worktype: "REPORTGB",
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
          tab: 0,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved3 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para3);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setParaData3({
        pgSize: PAGE_SIZE,
        workType: "STCD",
        orgdiv: "01",
        rowstatus_s: "",
        stdrmkcd_s: "",
        stdrmknm1_s: "",
        stdrmknm2_s: "",
        acntcd_s: "",
        acntnm_s: "",
      });
      deletedMainRows = [];
      resetAllGrid();
      if (tabSelected == 2) {
        setFilters3((prev: any) => ({
          ...prev,
          worktype: "STCD",
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
          tab: 0,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchTodoGridSaved4 = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para4);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      setParaData4({
        pgSize: PAGE_SIZE,
        workType: "AUTO",
        orgdiv: "01",
        location: "01",
        position: "",
        rowstatus_s: "",
        itemacnt_s: "",
        doexdiv_s: "",
        inoutdiv_s: "",
        soyn_s: "",
        dracntcd_s: "",
        cracntcd_s: "",
        sodracntcd_s: "",
        socracntcd_s: "",
      });
      deletedMainRows = [];
      resetAllGrid();
      if (tabSelected == 3) {
        setFilters4((prev: any) => ({
          ...prev,
          find_row_value: "",
          scrollDirrection: "down",
          pgNum: 1,
          isSearch: true,
          pgGap: 0,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  const onCopyClick = () => {
    if (!window.confirm("전월복사를 하시겠습니까?")) {
      return false;
    }
    setParaData2((prev) => ({
      pgSize: PAGE_SIZE,
      workType: "COPY",
      orgdiv: "01",
      rowstatus_s: "",
      acntses_s: filters2.acntses,
      reportgb_s: "",
      acntgrpcd_s: "",
      prntacntgrp_s: "",
      highestyn_s: "",
      acntgrpgb_s: "",
      acntgrpnm_s: "",
      grpchr_s: "",
      p_line_s: "",
      p_border_s: "",
      p_color_s: "",
      p_seq_s: "",
      extra_field1_s: "",
      extra_field2_s: "",
      extra_field3_s: "",
      rowstatus2_s: "",
      acntgrpcd: "",
      acntcd_s: "",
      acntgrpnm2_s: "",
      caculationgb_s: "",
      acntgrpauto_s: "",
    }));
  };

  const createColumn = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"cracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell2}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"cracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  const createColumn2 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"dracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell3}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"dracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  const createColumn3 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"socracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell4}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"socracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  const createColumn4 = () => {
    const array = [];
    array.push(
      <GridColumn
        field={"sodracntcd"}
        title={"계정과목"}
        cell={ColumnCommandCell5}
        width="150px"
      />
    );
    array.push(
      <GridColumn field={"sodracntnm"} title={"계정명"} width="150px" />
    );
    return array;
  };

  return (
    <>
      <TitleContainer>
        <Title>기준정보</Title>
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
        <TabStripTab title="관리항목">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>관리항목코드</th>
                  <td>
                    <Input
                      name="mngitemcd"
                      type="text"
                      value={filters.mngitemcd}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>관리항목명</th>
                  <td>
                    <Input
                      name="mngitemnm"
                      type="text"
                      value={filters.mngitemnm}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
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
                style={{ height: "73vh" }}
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
                            customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : checkField.includes(item.fieldName)
                              ? CheckBoxCell
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
        <TabStripTab title="재무제표">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>회기</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="acntses"
                        value={filters2.acntses}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                        className="required"
                      />
                    )}
                  </td>
                  <td></td>
                  <td>
                    <Button
                      themeColor={"primary"}
                      fillMode="outline"
                      onClick={onCopyClick}
                      icon="copy"
                    >
                      전월복사
                    </Button>
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainerWrap style={{ width: "87vw" }}>
            <GridContainer width={`12%`}>
              <GridTitleContainer>
                <GridTitle></GridTitle>
              </GridTitleContainer>
              <Grid
                style={{ height: "73vh" }}
                data={process(
                  mainDataResult2.data.map((row) => ({
                    ...row,
                    reportgb: reportgbListData.find(
                      (item: any) => item.sub_code === row.reportgb
                    )?.code_name,
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
              >
                <GridColumn field="reportgb" title="보고서구분" width="150px" />
              </Grid>
            </GridContainer>
            <GridContainer width={`calc(65% - ${GAP}px)`}>
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
                style={{ height: "73vh" }}
                data={process(
                  mainDataResult3.data.map((row) => ({
                    ...row,
                    [SELECTED_FIELD]: selectedState3[idGetter(row)],
                  })),
                  mainDataState3
                )}
                {...mainDataState3}
                onDataStateChange={onMainDataStateChange3}
                //선택 기능
                dataItemKey={DATA_ITEM_KEY}
                selectedField={SELECTED_FIELD}
                selectable={{
                  enabled: true,
                  mode: "single",
                }}
                onSelectionChange={onDetailSelectionChange}
                //스크롤 조회 기능
                fixedScroll={true}
                total={mainDataResult3.total}
                onScroll={onMainScrollHandler3}
                //정렬기능
                sortable={true}
                onSortChange={onMainSortChange3}
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
                            customField.includes(item.fieldName)
                              ? CustomComboBoxCell
                              : checkField.includes(item.fieldName)
                              ? CheckBoxCell
                              : numberField.includes(item.fieldName)
                              ? NumberCell
                              : undefined
                          }
                          headerCell={
                            requiredField.includes(item.fieldName)
                              ? RequiredHeader
                              : undefined
                          }
                          footerCell={
                            item.sortOrder === 0
                              ? mainTotalFooterCell3
                              : undefined
                          }
                        />
                      )
                  )}
              </Grid>
            </GridContainer>
            <GridContainer width={`23%`}>
              <FormContext.Provider
                value={{
                  acntcd,
                  acntnm,
                  setAcntcd,
                  setAcntnm,
                  mainDataState,
                  setMainDataState,
                  // fetchGrid,
                }}
              >
                <GridTitleContainer>
                  <GridTitle></GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onAddClick3}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="plus"
                      title="행 추가"
                    ></Button>
                    <Button
                      onClick={onDeleteClick3}
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
                  style={{ height: "73vh" }}
                  data={process(
                    mainDataResult4.data.map((row) => ({
                      ...row,
                      [SELECTED_FIELD]: selectedState4[idGetter(row)],
                    })),
                    mainDataState4
                  )}
                  {...mainDataState4}
                  onDataStateChange={onMainDataStateChange4}
                  //선택 기능
                  dataItemKey={DATA_ITEM_KEY}
                  selectedField={SELECTED_FIELD}
                  selectable={{
                    enabled: true,
                    mode: "single",
                  }}
                  onSelectionChange={onDetailSelectionChange2}
                  //스크롤 조회 기능
                  fixedScroll={true}
                  total={mainDataResult4.total}
                  onScroll={onMainScrollHandler4}
                  //정렬기능
                  sortable={true}
                  onSortChange={onMainSortChange4}
                  //컬럼순서조정
                  reorderable={true}
                  //컬럼너비조정
                  resizable={true}
                  onItemChange={onMainItemChange3}
                  cellRender={customCellRender3}
                  rowRender={customRowRender3}
                  editField={EDIT_FIELD}
                >
                  <GridColumn field="rowstatus" title=" " width="50px" />
                  <GridColumn
                    field="acntcd"
                    title="계정과목코드"
                    width="100px"
                    cell={ColumnCommandCell}
                    footerCell={mainTotalFooterCell4}
                  />
                  <GridColumn field="acntnm" title="계정명" width="100px" />
                  <GridColumn
                    field="caculationgb"
                    title="계산방식"
                    width="110px"
                    cell={CustomRadioCell}
                  />
                </Grid>
              </FormContext.Provider>
            </GridContainer>
          </GridContainerWrap>
        </TabStripTab>
        <TabStripTab title="단축코드">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>단축계정코드</th>
                  <td>
                    <Input
                      name="stdrmkcd"
                      type="text"
                      value={filters3.stdrmkcd}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>단축계정명</th>
                  <td>
                    <Input
                      name="stdrmknm1"
                      type="text"
                      value={filters3.stdrmknm1}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer width="87vw">
            <GridTitleContainer>
              <GridTitle></GridTitle>
              <ButtonContainer>
                <Button
                  onClick={onAddClick4}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="plus"
                  title="행 추가"
                ></Button>
                <Button
                  onClick={onDeleteClick4}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="minus"
                  title="행 삭제"
                ></Button>
                <Button
                  onClick={onSaveClick3}
                  fillMode="outline"
                  themeColor={"primary"}
                  icon="save"
                  title="저장"
                ></Button>
              </ButtonContainer>
            </GridTitleContainer>
            <Grid
              style={{ height: "73vh" }}
              data={process(
                mainDataResult5.data.map((row) => ({
                  ...row,
                  [SELECTED_FIELD]: selectedState5[idGetter(row)],
                })),
                mainDataState5
              )}
              {...mainDataState5}
              onDataStateChange={onMainDataStateChange5}
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
              total={mainDataResult5.total}
              onScroll={onMainScrollHandler5}
              //정렬기능
              sortable={true}
              onSortChange={onMainSortChange5}
              //컬럼순서조정
              reorderable={true}
              //컬럼너비조정
              resizable={true}
              onItemChange={onMainItemChange4}
              cellRender={customCellRender4}
              rowRender={customRowRender4}
              editField={EDIT_FIELD}
            >
              <GridColumn field="rowstatus" title=" " width="50px" />
              {customOptionData !== null &&
                customOptionData.menuCustomColumnOptions["grdList3"].map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        id={item.id}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                        headerCell={
                          requiredField.includes(item.fieldName)
                            ? RequiredHeader
                            : undefined
                        }
                        footerCell={
                          item.sortOrder === 0
                            ? mainTotalFooterCell5
                            : undefined
                        }
                      />
                    )
                )}
            </Grid>
          </GridContainer>
        </TabStripTab>
        <TabStripTab title="자동전표기준">
          <FilterContainer>
            <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
              <tbody>
                <tr>
                  <th>매입매출구분</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionRadioGroup
                        name="inoutdiv"
                        customOptionData={customOptionData}
                        changeData={filterRadioChange}
                      />
                    )}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
          <GridContainer width="87vw">
            <FormContext2.Provider
              value={{
                acntcd2,
                acntnm2,
                setAcntcd2,
                setAcntnm2,
                mainDataState,
                setMainDataState,
                // fetchGrid,
              }}
            >
              <FormContext3.Provider
                value={{
                  acntcd3,
                  acntnm3,
                  setAcntcd3,
                  setAcntnm3,
                  mainDataState,
                  setMainDataState,
                  // fetchGrid,
                }}
              >
                <FormContext4.Provider
                  value={{
                    acntcd4,
                    acntnm4,
                    setAcntcd4,
                    setAcntnm4,
                    mainDataState,
                    setMainDataState,
                    // fetchGrid,
                  }}
                >
                  <FormContext5.Provider
                    value={{
                      acntcd5,
                      acntnm5,
                      setAcntcd5,
                      setAcntnm5,
                      mainDataState,
                      setMainDataState,
                      // fetchGrid,
                    }}
                  >
                    <GridTitleContainer>
                      <GridTitle></GridTitle>
                      <ButtonContainer>
                        <Button
                          onClick={onAddClick5}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="plus"
                          title="행 추가"
                        ></Button>
                        <Button
                          onClick={onDeleteClick5}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="minus"
                          title="행 삭제"
                        ></Button>
                        <Button
                          onClick={onSaveClick4}
                          fillMode="outline"
                          themeColor={"primary"}
                          icon="save"
                          title="저장"
                        ></Button>
                      </ButtonContainer>
                    </GridTitleContainer>
                    <Grid
                      style={{ height: "73vh" }}
                      data={process(
                        mainDataResult6.data.map((row) => ({
                          ...row,
                          [SELECTED_FIELD]: selectedState6[idGetter(row)],
                        })),
                        mainDataState6
                      )}
                      {...mainDataState6}
                      onDataStateChange={onMainDataStateChange6}
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
                      total={mainDataResult6.total}
                      onScroll={onMainScrollHandler6}
                      //정렬기능
                      sortable={true}
                      onSortChange={onMainSortChange6}
                      //컬럼순서조정
                      reorderable={true}
                      //컬럼너비조정
                      resizable={true}
                      onItemChange={onMainItemChange5}
                      cellRender={customCellRender5}
                      rowRender={customRowRender5}
                      editField={EDIT_FIELD}
                    >
                      <GridColumn field="rowstatus" title=" " width="50px" />
                      <GridColumn
                        field="itemacnt"
                        cell={CustomComboBoxCell}
                        title="품목계정"
                        width="120px"
                        footerCell={mainTotalFooterCell6}
                      />
                      <GridColumn
                        field="doexdiv"
                        cell={CustomComboBoxCell}
                        title="내수구분"
                        width="120px"
                      />
                      <GridColumn
                        field="soyn"
                        title="상계여부"
                        cell={CheckBoxCell}
                        width="120px"
                      />
                      <GridColumn title="차변">{createColumn2()}</GridColumn>
                      <GridColumn title="대변">{createColumn()}</GridColumn>
                      <GridColumn title="상계차변">
                        {createColumn4()}
                      </GridColumn>
                      <GridColumn title="상계대변">
                        {createColumn3()}
                      </GridColumn>
                    </Grid>
                  </FormContext5.Provider>
                </FormContext4.Provider>
              </FormContext3.Provider>
            </FormContext2.Provider>
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

export default AC_A0020W;
