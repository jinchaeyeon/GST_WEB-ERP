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
  GridItemChangeEvent,
  GridPageChangeEvent,
  GridSelectionChangeEvent,
  getSelectedState,
} from "@progress/kendo-react-grid";
import {
  Input,
  InputChangeEvent,
  NumericTextBox,
} from "@progress/kendo-react-inputs";
import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInGridInput,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedNameState,
  isLoading,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import NumberCell from "../Cells/NumberCell";
import RadioGroupCell from "../Cells/RadioGroupCell";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  convertDateToStr,
  findMessage,
  getBizCom,
  getGridItemChangedData,
  numberWithCommas,
  toDate
} from "../CommonFunction";
import { EDIT_FIELD, PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import { CellRender, RowRender } from "../Renderers/Renderers";
import AC_A1000W_Note_Window from "./AC_A1000W_Note_Window";
import AccountWindow from "./CommonWindows/AccountWindow";
import CodeWindow from "./CommonWindows/CodeWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import StandardWindow from "./CommonWindows/StandardWindow";
type IWindow = {
  workType: "N" | "A" | "C";
  data?: Idata;
  setVisible(t: boolean): void;
  setData(str: string): void;
  modal?: boolean;
  pathname: string;
};

const CustomRadioCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("R_DRCR", setBizComponentData);
  //합부판정
  const field = props.field ?? "";
  const bizComponentIdVal = field == "drcrdiv" ? "R_DRCR" : "";
  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId == bizComponentIdVal
  );

  return bizComponent ? (
    <RadioGroupCell bizComponentData={bizComponent} {...props} />
  ) : (
    <td />
  );
};

type TdataArr = {
  rowstatus_s: string[];
  acseq2_s: string[];
  acntses_s: string[];
  drcrdiv_s: string[];
  acntcd_s: string[];
  acntchr_s: string[];
  alcchr_s: string[];
  acntbaldiv_s: string[];
  budgyn_s: string[];
  partacnt_s: string[];
  slipamt_s: string[];
  usedptcd_s: string[];
  mngdrcustyn_s: string[];
  mngcrcustyn_s: string[];
  mngsumcustyn_s: string[];
  mngdramtyn_s: string[];
  mngcramtyn_s: string[];
  mngdrrateyn_s: string[];
  mngcrrateyn_s: string[];
  custcd_s: string[];
  custnm_s: string[];
  mngamt_s: string[];
  rate_s: string[];
  mngitemcd1_s: string[];
  mngitemcd2_s: string[];
  mngitemcd3_s: string[];
  mngitemcd4_s: string[];
  mngitemcd5_s: string[];
  mngitemcd6_s: string[];
  mngdata1_s: string[];
  mngdata2_s: string[];
  mngdata3_s: string[];
  mngdata4_s: string[];
  mngdata5_s: string[];
  mngdata6_s: string[];
  mngdatanm1_s: string[];
  mngdatanm2_s: string[];
  mngdatanm3_s: string[];
  mngdatanm4_s: string[];
  mngdatanm5_s: string[];
  mngdatanm6_s: string[];
  budgcd_s: string[];
  stdrmkcd_s: string[];
  remark3_s: string[];
  evidentialkind_s: string[];
  autorecnum_s: string[];
  taxtype_s: string[];
  propertykind_s: string[];
  creditcd_s: string[];
  reason_intax_deduction_s: string[];
};

type Acnt = {
  acntbaldiv: string;
  acntchr: string;
  acntdiv: string;
  acntgrp: string;
  acseq2: number;
  budgyn: string;
  controltype1: string;
  controltype2: string;
  controltype3: string;
  controltype4: string;
  controltype5: string;
  controltype6: string;
  diststd: string;
  makesha: string;
  mngcramtyn: string;
  mngcrcustyn: string;
  mngcrrateyn: string;
  mngdramtyn: string;
  mngdrcustyn: string;
  mngdrrateyn: string;
  mngitemcd1: string;
  mngitemcd2: string;
  mngitemcd3: string;
  mngitemcd4: string;
  mngitemcd5: string;
  mngitemcd6: string;
  prodyn: string;
  profitchr: string;
  profitsha: string;
  relacntcd: string;
  relacntgrp: string;
  show_collect_yn: string;
  show_payment_yn: string;
  sho_pur_sal_yn: string;
  slipentyn: string;
  soyn: string;
  system_yn: string;
  useyn: string;
};

type Idata = {
  location: string;
  acntdt: string;
  position: string;
  inoutdiv: string;
  files: string;
  attdatnum: string;
  acseq1: number;
  ackey: string;
  actdt: string;
  apperson: string;
  approvaldt: string;
  closeyn: string;
  consultdt: string;
  consultnum: number;
  custnm: string;
  dptcd: string;
  inputpath: string;
  remark3: string;
  slipdiv: string;
  sumslipamt: number;
  sumslipamt_1: number;
  sumslipamt_2: number;
  bizregnum: string;
  mngamt: number;
  rate: number;
  usedptcd: string;
  propertykind: string;
  evidentialkind: string;
  creditcd: string;
  reason_intax_deduction: string;
  printcnt: number;
};

let deletedMainRows: object[] = [];
let targetRowIndex: null | number = null;

interface IAccountData {
  acntcd: string;
  acntnm: string;
}

interface ICustData {
  custcd: string;
  custnm: string;
}

interface ICodeData {
  stdrmkcd: string;
  stdrmknm1: string;
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
  custcd: string;
  setCustcd: (d: any) => void;
  custnm: string;
  setCustnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

const FormContext3 = createContext<{
  stdrmkcd: string;
  setStdrmkcd: (d: any) => void;
  stdrmknm: string;
  setStdrmknm: (d: any) => void;
  acntcd: string;
  setAcntcd: (d: any) => void;
  acntnm: string;
  setAcntnm: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
}>({} as any);

export const FormContext4 = createContext<{
  attdatnum: string;
  files: string;
  setAttdatnum: (d: any) => void;
  setFiles: (d: any) => void;
  mainDataState: State;
  setMainDataState: (d: any) => void;
  // fetchGrid: (n: number) => any;
}>({} as any);
let temp = 0;
let temp2 = 0;
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
      {render == undefined
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
    custcd,
    custnm,
    setCustcd,
    setCustnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext2);
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
    stdrmkcd,
    stdrmknm,
    acntcd,
    acntnm,
    setStdrmkcd,
    setStdrmknm,
    setAcntcd,
    setAcntnm,
    mainDataState,
    setMainDataState,
  } = useContext(FormContext3);
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
  const [codeWindowVisible, setCodeWindowVisible] = useState<boolean>(false);

  const onCodeWndClick = () => {
    setCodeWindowVisible(true);
  };

  const setCodeData = (data: ICodeData) => {
    setStdrmkcd(data.stdrmkcd);
    setStdrmknm(data.stdrmknm1);
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
          onClick={onCodeWndClick}
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
      {codeWindowVisible && (
        <CodeWindow setVisible={setCodeWindowVisible} setData={setCodeData} />
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
  const { setAttdatnum, setFiles } = useContext(FormContext4);
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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const onAttWndClick2 = () => {
    setAttachmentsWindowVisible(true);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setAttdatnum(data.attdatnum);
    setFiles(
      data.original_name +
        (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : "")
    );
  };

  const defaultRendering = (
    <td
      className={className}
      aria-colindex={ariaColumnIndex}
      data-grid-col-index={columnIndex}
      style={{ position: "relative" }}
    >
      {value}
      <ButtonInGridInput>
        <Button
          name="itemcd"
          onClick={onAttWndClick2}
          icon="more-horizontal"
          fillMode="flat"
        />
      </ButtonInGridInput>
    </td>
  );

  return (
    <>
      {render == undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: false, download: true, delete: false }}
        />
      )}
    </>
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 900,
  });
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const [worktype, setWorkType] = useState<string>(workType);
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
  const [acntcd, setAcntcd] = useState<string>("");
  const [acntnm, setAcntnm] = useState<string>("");
  const [custcd, setCustcd] = useState<string>("");
  const [custnm, setCustnm] = useState<string>("");
  const [stdrmkcd, setStdrmkcd] = useState<string>("");
  const [stdrmknm, setStdrmknm] = useState<string>("");
  const [attdatnum, setAttdatnum] = useState<string>("");
  const [files, setFiles] = useState<string>("");
  const idGetter = getter(DATA_ITEM_KEY);
  const setLoading = useSetRecoilState(isLoading);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  //메시지 조회

  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && worktype == "N") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        position: defaultOption.find((item: any) => item.id == "position")
          ?.valueCode,
        inoutdiv: defaultOption.find((item: any) => item.id == "inoutdiv")
          ?.valueCode,
        usedptcd: defaultOption.find((item: any) => item.id == "usedptcd")
          ?.valueCode,
        propertykind: defaultOption.find(
          (item: any) => item.id == "propertykind"
        )?.valueCode,
        evidentialkind: defaultOption.find(
          (item: any) => item.id == "evidentialkind"
        )?.valueCode,
        creditcd: defaultOption.find((item: any) => item.id == "creditcd")
          ?.valueCode,
        reason_intax_deduction: defaultOption.find(
          (item: any) => item.id == "reason_intax_deduction"
        )?.valueCode,
      }));
    }
  }, [customOptionData]);

  useEffect(() => {
    if (acntcd != "" && acntcd != undefined) {
      const data = acntListData.find((items: any) => items.acntcd == acntcd);
      async function fetchDatas() {
        let datas: any;
        const select = mainDataResult.data.filter(
          (item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        )[0];

        const parameters2: Iparameters = {
          procedureName: "P_AC_A1000W_Q",
          pageNumber: filters.pgNum,
          pageSize: filters.pgSize,
          parameters: {
            "@p_work_type": "ITEM",
            "@p_orgdiv": filters.orgdiv,
            "@p_actdt": "",
            "@p_acseq1": 0,
            "@p_acnum": "",
            "@p_acseq2": 0,
            "@p_acntcd": acntcd,
            "@p_frdt": "",
            "@p_todt": "",
            "@p_location": "",
            "@p_person": "",
            "@p_inputpath": "",
            "@p_custcd": "",
            "@p_custnm": "",
            "@p_slipdiv": "",
            "@p_remark3": "",
            "@p_maxacseq2": 0,
            "@p_framt": 0,
            "@p_toamt": 0,
            "@p_position": "",
            "@p_inoutdiv": "",
            "@p_drcrdiv": select == undefined ? "" : select.drcrdiv,
            "@p_actdt_s": "",
            "@p_acseq1_s": "",
            "@p_printcnt_s": "",
            "@p_rowstatus_s": "",
            "@p_chk_s": "",
            "@p_ackey_s": "",
            "@p_acntnm": "",
            "@p_find_row_value": "",
          },
        };

        try {
          datas = await processApi<any>("procedure", parameters2);
        } catch (error) {
          datas = null;
        }
        const rows = datas.tables[0].Rows[0];
        if (data != undefined) {
          const newData = mainDataResult.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
              ? {
                  ...item,
                  acntcd: acntcd,
                  acntnm: acntnm,
                  mngitemnm1: data.mngitemnm1,
                  mngitemnm2: data.mngitemnm2,
                  mngitemnm3: data.mngitemnm3,
                  mngitemnm4: data.mngitemnm4,
                  mngitemnm5: data.mngitemnm5,
                  mngitemnm6: data.mngitemnm6,
                  acntbaldiv: rows.acntbaldiv,
                  acntchr: rows.acntchr,
                  acntdiv: rows.acntdiv,
                  acntgrp: rows.acntgrp,
                  budgyn: rows.budgyn,
                  controltype1: rows.controltype1,
                  controltype2: rows.controltype2,
                  controltype3: rows.controltype3,
                  controltype4: rows.controltype4,
                  controltype5: rows.controltype5,
                  controltype6: rows.controltype6,
                  diststd: rows.diststd,
                  makesha: rows.makesha,
                  mngcramtyn: rows.mngcramtyn,
                  mngcrcustyn: rows.mngcrcustyn,
                  mngcrrateyn: rows.mngcrrateyn,
                  mngdramtyn: rows.mngdramtyn,
                  mngdrcustyn: rows.mngdrcustyn,
                  mngdrrateyn: rows.mngdrrateyn,
                  mngitemcd1: rows.mngitemcd1,
                  mngitemcd2: rows.mngitemcd2,
                  mngitemcd3: rows.mngitemcd3,
                  mngitemcd4: rows.mngitemcd4,
                  mngitemcd5: rows.mngitemcd5,
                  mngitemcd6: rows.mngitemcd6,
                  prodyn: rows.prodyn,
                  profitchr: rows.profitchr,
                  profitsha: rows.profitsha,
                  relacntcd: rows.relacntcd,
                  relacntgrp: rows.relacntgrp,
                  show_collect_yn: rows.show_collect_yn,
                  show_payment_yn: rows.show_payment_yn,
                  sho_pur_sal_yn: rows.sho_pur_sal_yn,
                  slipentyn: rows.slipentyn,
                  soyn: rows.soyn,
                  system_yn: rows.system_yn,
                  useyn: rows.useyn,
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
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
        }
      }
      fetchDatas();
    }
  }, [acntcd, acntnm]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            custcd: custcd,
            custnm: custnm,
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
    if (stdrmkcd != "" && stdrmknm != undefined) {
      const data = acntListData.find((items: any) => items.acntcd == acntcd);
      async function fetchDatas() {
        let datas: any;
        const select = mainDataResult.data.filter(
          (item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        )[0];

        const parameters2: Iparameters = {
          procedureName: "P_AC_A1000W_Q",
          pageNumber: filters.pgNum,
          pageSize: filters.pgSize,
          parameters: {
            "@p_work_type": "ITEM",
            "@p_orgdiv": filters.orgdiv,
            "@p_actdt": convertDateToStr(filters.acntdt),
            "@p_acseq1": 0,
            "@p_acnum": "",
            "@p_acseq2": 0,
            "@p_acntcd": acntcd,
            "@p_frdt": "",
            "@p_todt": "",
            "@p_location": "",
            "@p_person": "",
            "@p_inputpath": "",
            "@p_custcd": "",
            "@p_custnm": "",
            "@p_slipdiv": "",
            "@p_remark3": "",
            "@p_maxacseq2": 0,
            "@p_framt": 0,
            "@p_toamt": 0,
            "@p_position": "",
            "@p_inoutdiv": "",
            "@p_drcrdiv": select == undefined ? "" : select.drcrdiv,
            "@p_actdt_s": "",
            "@p_acseq1_s": "",
            "@p_printcnt_s": "",
            "@p_rowstatus_s": "",
            "@p_chk_s": "",
            "@p_ackey_s": "",
            "@p_acntnm": "",
            "@p_find_row_value": "",
          },
        };

        try {
          datas = await processApi<any>("procedure", parameters2);
        } catch (error) {
          datas = null;
        }
        const rows = datas.tables[0].Rows[0];
        if (data != undefined) {
          const newData = mainDataResult.data.map((item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
              ? {
                  ...item,
                  acntcd: acntcd,
                  acntnm: acntnm,
                  stdrmkcd: stdrmkcd,
                  stdrmknm: stdrmknm,
                  mngitemnm1: data.mngitemnm1,
                  mngitemnm2: data.mngitemnm2,
                  mngitemnm3: data.mngitemnm3,
                  mngitemnm4: data.mngitemnm4,
                  mngitemnm5: data.mngitemnm5,
                  mngitemnm6: data.mngitemnm6,
                  acntbaldiv: rows.acntbaldiv,
                  acntchr: rows.acntchr,
                  acntdiv: rows.acntdiv,
                  acntgrp: rows.acntgrp,
                  budgyn: rows.budgyn,
                  controltype1: rows.controltype1,
                  controltype2: rows.controltype2,
                  controltype3: rows.controltype3,
                  controltype4: rows.controltype4,
                  controltype5: rows.controltype5,
                  controltype6: rows.controltype6,
                  diststd: rows.diststd,
                  makesha: rows.makesha,
                  mngcramtyn: rows.mngcramtyn,
                  mngcrcustyn: rows.mngcrcustyn,
                  mngcrrateyn: rows.mngcrrateyn,
                  mngdramtyn: rows.mngdramtyn,
                  mngdrcustyn: rows.mngdrcustyn,
                  mngdrrateyn: rows.mngdrrateyn,
                  mngitemcd1: rows.mngitemcd1,
                  mngitemcd2: rows.mngitemcd2,
                  mngitemcd3: rows.mngitemcd3,
                  mngitemcd4: rows.mngitemcd4,
                  mngitemcd5: rows.mngitemcd5,
                  mngitemcd6: rows.mngitemcd6,
                  prodyn: rows.prodyn,
                  profitchr: rows.profitchr,
                  profitsha: rows.profitsha,
                  relacntcd: rows.relacntcd,
                  relacntgrp: rows.relacntgrp,
                  show_collect_yn: rows.show_collect_yn,
                  show_payment_yn: rows.show_payment_yn,
                  sho_pur_sal_yn: rows.sho_pur_sal_yn,
                  slipentyn: rows.slipentyn,
                  soyn: rows.soyn,
                  system_yn: rows.system_yn,
                  useyn: rows.useyn,
                  rowstatus: item.rowstatus == "N" ? "N" : "U",
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
        }
      }
      fetchDatas();
    }
  }, [stdrmkcd, stdrmknm]);

  useEffect(() => {
    const newData = mainDataResult.data.map((item) =>
      item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        ? {
            ...item,
            attdatnum: attdatnum,
            files: files,
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
  }, [attdatnum, files]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_AC023T, L_acntcd, L_AC024",
    //공정, 관리항목리스트
    setBizComponentData
  );

  //공통코드 리스트 조회 ()
  const [acntListData, setAcntListData] = useState([
    {
      acntcd: "",
      acntnm: "",
      mngitemnm1: "",
      mngitemnm2: "",
      mngitemnm3: "",
      mngitemnm4: "",
      mngitemnm5: "",
      mngitemnm6: "",
    },
  ]);
  const [codeListData, setCodeListData] = useState([
    { acntcd: "", acntnm: "", stdrmkcd: "", stdrmknm1: "" },
  ]);
  const [mngItemListData, setMngItemListData] = React.useState([
    { mngitemcd: "", mngitemnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setAcntListData(getBizCom(bizComponentData, "L_acntcd"));
      setCodeListData(getBizCom(bizComponentData, "L_AC024"));
      setMngItemListData(getBizCom(bizComponentData, "L_AC023T"));
    }
  }, [bizComponentData]);

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

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [standardWindowVisible, setStandardWindowVisible] =
    useState<boolean>(false);
  const [noteWindowVisible, setNoteWindowVisible] = useState<boolean>(false);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
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
    if (
      (mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0].controltype1 == "D" &&
        name == "mngdata1") ||
      (mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0].controltype2 == "D" &&
        name == "mngdata2") ||
      (mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0].controltype3 == "D" &&
        name == "mngdata3") ||
      (mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0].controltype4 == "D" &&
        name == "mngdata4") ||
      (mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0].controltype5 == "D" &&
        name == "mngdata5") ||
      (mainDataResult.data.filter(
        (item: any) => item.num == Object.getOwnPropertyNames(selectedState)[0]
      )[0].controltype6 == "D" &&
        name == "mngdata6")
    ) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus == "N" ? "N" : "U",
              [name]: convertDateToStr(value),
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
    } else {
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
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

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
    if (unsavedName.length > 0) setDeletedName(unsavedName);
    setVisible(false);
  };

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const [index, setIndex] = useState(1);
  const onStandardWndClick = () => {
    setIndex(1);
    setStandardWindowVisible(true);
  };
  const onNoteWndClick = () => {
    setIndex(1);
    setNoteWindowVisible(true);
  };

  const onStandardWndClick2 = () => {
    setIndex(2);
    setStandardWindowVisible(true);
  };
  const onStandardWndClick3 = () => {
    setIndex(3);
    setStandardWindowVisible(true);
  };
  const onStandardWndClick4 = () => {
    setIndex(4);
    setStandardWindowVisible(true);
  };
  const onStandardWndClick5 = () => {
    setIndex(5);
    setStandardWindowVisible(true);
  };
  const onStandardWndClick6 = () => {
    setIndex(6);
    setStandardWindowVisible(true);
  };

  interface IStandard {
    item1: string;
    item2: string;
    item3: string;
  }

  interface INote {
    notenum: string;
    custnm: string;
    pubdt: string;
    enddt: string;
    pubbank: string;
    pubperson: string;
  }

  const setStandardData = (data: IStandard) => {
    let mng = "";
    let mng2 = "";
    if (index == 1) {
      mng = "mngdata1";
      mng2 = "mngdatanm1";
    } else if (index == 2) {
      mng = "mngdata2";
      mng2 = "mngdatanm2";
    } else if (index == 3) {
      mng = "mngdata3";
      mng2 = "mngdatanm3";
    } else if (index == 4) {
      mng = "mngdata4";
      mng2 = "mngdatanm4";
    } else if (index == 5) {
      mng = "mngdata5";
      mng2 = "mngdatanm5";
    } else if (index == 6) {
      mng = "mngdata6";
      mng2 = "mngdatanm6";
    }
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            [mng]: data.item1,
            [mng2]: data.item2,
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

  const setNoteData = (data: INote) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus == "N" ? "N" : "U",
            mngdata1: data.notenum,
            mngdatanm1: data.custnm,
            mngdata2: data.pubdt,
            mngdata3: data.enddt,
            mngdata4: data.pubbank,
            mngdata5: data.pubperson,
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

  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: sessionOrgdiv,
    location: "",
    acntdt: new Date(),
    position: "",
    inoutdiv: "",
    files: "",
    attdatnum: "",
    acseq1: 0,
    ackey: "",
    actdt: new Date(),
    apperson: "",
    approvaldt: "",
    closeyn: "",
    consultdt: "",
    consultnum: 0,
    custnm: "",
    dptcd: "",
    inputpath: "",
    remark3: "",
    slipdiv: "",
    sumslipamt: 0,
    sumslipamt_1: 0,
    sumslipamt_2: 0,
    bizregnum: "",
    mngamt: 0,
    rate: 0,
    usedptcd: "",
    propertykind: "",
    evidentialkind: "",
    creditcd: "",
    reason_intax_deduction: "",
    find_row_value: "",
    printcnt: 0,
    pgNum: 1,
    isSearch: true,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    const parameters: Iparameters = {
      procedureName: "P_AC_A1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": filters.orgdiv,
        "@p_actdt": convertDateToStr(filters.acntdt),
        "@p_acseq1": filters.acseq1,
        "@p_acnum": "",
        "@p_acseq2": 0,
        "@p_acntcd": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_location": filters.location,
        "@p_person": "",
        "@p_inputpath": "",
        "@p_custcd": "",
        "@p_custnm": "",
        "@p_slipdiv": "",
        "@p_remark3": "",
        "@p_maxacseq2": 0,
        "@p_framt": 0,
        "@p_toamt": 0,
        "@p_position": filters.position,
        "@p_inoutdiv": filters.inoutdiv,
        "@p_drcrdiv": "",
        "@p_actdt_s": "",
        "@p_acseq1_s": "",
        "@p_printcnt_s": "",
        "@p_rowstatus_s": "",
        "@p_chk_s": "",
        "@p_ackey_s": "",
        "@p_acntnm": "",
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
      if (filters.find_row_value !== "") {
        // find_row_value 행으로 스크롤 이동
        if (gridRef.current) {
          const findRowIndex = rows.findIndex(
            (row: any) => row.actdt + "-" + row.acseq1 == filters.find_row_value
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
      if (workType == "C") {
        const newData = rows.map((item: any) => ({
          ...item,
          rowstatus: "N",
          attdatnum: "",
        }));
        setWorkType("N");
        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
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
        const selectedRow =
          filters.find_row_value == ""
            ? rows[0]
            : rows.find(
                (row: any) => row[DATA_ITEM_KEY] == filters.find_row_value
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
    if (worktype != "N" && filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if ((worktype == "A" || worktype == "C") && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        location: data.location,
        acntdt: toDate(data.acntdt),
        position: data.position,
        inoutdiv: data.inoutdiv,
        files: worktype == "C" ? "" : data.files,
        attdatnum: worktype == "C" ? "" : data.attdatnum,
        acseq1: data.acseq1,
        ackey: data.ackey,
        actdt: toDate(data.actdt),
        apperson: data.apperson,
        approvaldt: data.approvaldt,
        closeyn: data.closeyn,
        consultdt: data.consultdt,
        consultnum: data.consultnum,
        custnm: data.custnm,
        dptcd: data.dptcd,
        inputpath: data.inputpath,
        remark3: data.remark3,
        slipdiv: data.slipdiv,
        sumslipamt: data.sumslipamt,
        sumslipamt_1: data.sumslipamt_1,
        sumslipamt_2: data.sumslipamt_2,
        bizregnum: data.bizregnum,
        mngamt: data.mngamt == undefined ? 0 : data.mngamt,
        rate: data.rate == undefined ? 0 : data.rate,
        usedptcd: data.usedptcd,
        propertykind: data.propertykind,
        evidentialkind: data.evidentialkind,
        creditcd: data.creditcd,
        reason_intax_deduction: data.reason_intax_deduction,
        printcnt: data.printcnt == undefined ? 0 : data.printcnt,
        isSearch: true,
        find_row_value: "",
        pgNum: 1,
      }));
    } else {
      const datas = mainDataResult.data[mainDataResult.data.length - 1];

      for (var i = 1; i < 3; i++) {
        mainDataResult.data.map((item) => {
          if (item.num > temp2) {
            temp2 = item.num;
          }
        });
        const newDataItem = {
          [DATA_ITEM_KEY]: ++temp2,
          ackey: filters.ackey,
          acntbaldiv: "",
          acntcd: "",
          acntcd2: "",
          acntchr: "",
          acntdt: convertDateToStr(filters.acntdt),
          acntnm: "",
          acntses: "",
          acseq1: 0,
          acseq2: i,
          actdt: convertDateToStr(filters.actdt),
          alcchr: "",
          apperson: "",
          approvaldt: filters.approvaldt,
          attdatnum: "",
          autorecnum: "",
          bizregnum: "",
          budgcd: "",
          budgyn: "N",
          closeyn: filters.closeyn,
          consultdt: filters.consultdt,
          consultnum: filters.consultnum,
          consultseq: 0,
          controltype1: "",
          controltype2: "",
          controltype3: "",
          controltype4: "",
          controltype5: "",
          controltype6: "",
          creditcd: "",
          creditnm: "",
          creditnum: "",
          custcd: "",
          custnm: "",
          dptcd: filters.dptcd,
          drcrdiv: i.toString(),
          evidentialkind: "",
          files: "",
          inoutdiv: filters.inoutdiv,
          inputpath: filters.inputpath,
          location: filters.location,
          mngamt: 0,
          mngcramtyn: "",
          mngcrctlyn1: "",
          mngcrctlyn2: "",
          mngcrctlyn3: "",
          mngcrctlyn4: "",
          mngcrctlyn5: "",
          mngcrctlyn6: "",
          mngcrcustyn: "",
          mngcrrateyn: "",
          mngdata1: "",
          mngdata2: "",
          mngdata3: "",
          mngdata4: "",
          mngdata5: "",
          mngdata6: "",
          mngdatanm1: "",
          mngdatanm2: "",
          mngdatanm3: "",
          mngdatanm4: "",
          mngdatanm5: "",
          mngdatanm6: "",
          mngdrctlyn1: "",
          mngdrctlyn2: "",
          mngdrctlyn3: "",
          mngdrctlyn4: "",
          mngdrctlyn5: "",
          mngdrctlyn6: "",
          mngdrrateyn: "",
          mngitemcd1: "",
          mngitemcd2: "",
          mngitemcd3: "",
          mngitemcd4: "",
          mngitemcd5: "",
          mngitemcd6: "",
          mngsumcustyn: "",
          orgdiv: sessionOrgdiv,
          partacnt: "",
          position: filters.position,
          propertykind: "",
          rate: 0,
          reason_intax_deduction: "",
          remark3: "",
          slipamt: 0,
          slipamt_1: 0,
          slipamt_2: 0,
          slipdiv: filters.slipdiv,
          stdrmkcd: "",
          stdrmknm: "",
          taxtype: "",
          taxtypenm: "",
          usedptcd: "",
          rowstatus: "N",
        };

        setMainDataResult((prev) => {
          return {
            data: [newDataItem, ...prev.data],
            total: prev.total + 1,
          };
        });
        setPage((prev) => ({
          ...prev,
          skip: 0,
          take: prev.take + 1,
        }));
        setSelectedState({ [newDataItem[DATA_ITEM_KEY]]: true });
      }
    }
  }, []);

  let gridRef: any = React.useRef(null);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (targetRowIndex !== null && gridRef.current) {
      gridRef.current.scrollIntoView({ rowIndex: targetRowIndex });
      targetRowIndex = null;
    }
  }, [mainDataResult]);

  //메인 그리드 선택 이벤트 => 디테일 그리드 조회
  const onSelectionChange = (event: GridSelectionChangeEvent) => {
    const newSelectedState = getSelectedState({
      event,
      selectedState: selectedState,
      dataItemKey: DATA_ITEM_KEY,
    });
    setSelectedState(newSelectedState);

    const selectedIdx = event.startRowIndex;
    const selectedRowData = event.dataItems[selectedIdx];

    setFilters((prev) => ({
      ...prev,
      mngamt: selectedRowData.mngamt,
      rate: selectedRowData.rate,
      usedptcd: selectedRowData.usedptcd,
      propertykind: selectedRowData.propertykind,
      evidentialkind: selectedRowData.evidentialkind,
      creditcd: selectedRowData.creditcd,
      reason_intax_deduction: selectedRowData.reason_intax_deduction,
    }));
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const getAttachmentsData = (data: IAttachmentData) => {
    setFilters((prev: any) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
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

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "W",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    actdt: new Date(),
    acseq1: 0,
    acntdt: new Date(),
    dptcd: "",
    slipdiv: "",
    consultdt: "",
    consultnum: 0,
    inputpath: "",
    closeyn: "",
    approvaldt: "",
    apperson: "",
    remark3: "",
    printcnt: 0,
    position: "",
    inoutdiv: "",
    rowstatus_s: "",
    acseq2_s: "",
    acntses_s: "",
    drcrdiv_s: "",
    acntcd_s: "",
    acntchr_s: "",
    alcchr_s: "",
    acntbaldiv_s: "",
    budgyn_s: "",
    partacnt_s: "",
    slipamt_s: "",
    usedptcd_s: "",
    mngdrcustyn_s: "",
    mngcrcustyn_s: "",
    mngsumcustyn_s: "",
    mngdramtyn_s: "",
    mngcramtyn_s: "",
    mngdrrateyn_s: "",
    mngcrrateyn_s: "",
    custcd_s: "",
    custnm_s: "",
    mngamt_s: "",
    rate_s: "",
    mngitemcd1_s: "",
    mngitemcd2_s: "",
    mngitemcd3_s: "",
    mngitemcd4_s: "",
    mngitemcd5_s: "",
    mngitemcd6_s: "",
    mngdata1_s: "",
    mngdata2_s: "",
    mngdata3_s: "",
    mngdata4_s: "",
    mngdata5_s: "",
    mngdata6_s: "",
    mngdatanm1_s: "",
    mngdatanm2_s: "",
    mngdatanm3_s: "",
    mngdatanm4_s: "",
    mngdatanm5_s: "",
    mngdatanm6_s: "",
    budgcd_s: "",
    stdrmkcd_s: "",
    remark3_s: "",
    evidentialkind_s: "",
    autorecnum_s: "",
    taxtype_s: "",
    propertykind_s: "",
    creditcd_s: "",
    reason_intax_deduction_s: "",
    attdatnum: "",
  });

  const para: Iparameters = {
    procedureName: "P_AC_A1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_actdt": convertDateToStr(ParaData.actdt),
      "@p_acseq1": ParaData.acseq1,
      "@p_acntdt": convertDateToStr(ParaData.acntdt),
      "@p_dptcd": ParaData.dptcd,
      "@p_slipdiv": ParaData.slipdiv,
      "@p_consultdt": ParaData.consultdt,
      "@p_consultnum": ParaData.consultnum,
      "@p_inputpath": ParaData.inputpath,
      "@p_closeyn": ParaData.closeyn,
      "@p_approvaldt": ParaData.approvaldt,
      "@p_apperson": ParaData.apperson,
      "@p_remark3": ParaData.remark3,
      "@p_printcnt": ParaData.printcnt,
      "@p_position": ParaData.position,
      "@p_inoutdiv": ParaData.inoutdiv,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_acseq2_s": ParaData.acseq2_s,
      "@p_acntses_s": ParaData.acntses_s,
      "@p_drcrdiv_s": ParaData.drcrdiv_s,
      "@p_acntcd_s": ParaData.acntcd_s,
      "@p_acntchr_s": ParaData.acntchr_s,
      "@p_alcchr_s": ParaData.alcchr_s,
      "@p_acntbaldiv_s": ParaData.acntbaldiv_s,
      "@p_budgyn_s": ParaData.budgyn_s,
      "@p_partacnt_s": ParaData.partacnt_s,
      "@p_slipamt_s": ParaData.slipamt_s,
      "@p_usedptcd_s": ParaData.usedptcd_s,
      "@p_mngdrcustyn_s": ParaData.mngdrcustyn_s,
      "@p_mngcrcustyn_s": ParaData.mngcrcustyn_s,
      "@p_mngsumcustyn_s": ParaData.mngsumcustyn_s,
      "@p_mngdramtyn_s": ParaData.mngdramtyn_s,
      "@p_mngcramtyn_s": ParaData.mngcramtyn_s,
      "@p_mngdrrateyn_s": ParaData.mngdrrateyn_s,
      "@p_mngcrrateyn_s": ParaData.mngcrrateyn_s,
      "@p_custcd_s": ParaData.custcd_s,
      "@p_custnm_s": ParaData.custnm_s,
      "@p_mngamt_s": ParaData.mngamt_s,
      "@p_rate_s": ParaData.rate_s,
      "@p_mngitemcd1_s": ParaData.mngitemcd1_s,
      "@p_mngitemcd2_s": ParaData.mngitemcd2_s,
      "@p_mngitemcd3_s": ParaData.mngitemcd3_s,
      "@p_mngitemcd4_s": ParaData.mngitemcd4_s,
      "@p_mngitemcd5_s": ParaData.mngitemcd5_s,
      "@p_mngitemcd6_s": ParaData.mngitemcd6_s,
      "@p_mngdata1_s": ParaData.mngdata1_s,
      "@p_mngdata2_s": ParaData.mngdata2_s,
      "@p_mngdata3_s": ParaData.mngdata3_s,
      "@p_mngdata4_s": ParaData.mngdata4_s,
      "@p_mngdata5_s": ParaData.mngdata5_s,
      "@p_mngdata6_s": ParaData.mngdata6_s,
      "@p_mngdatanm1_s": ParaData.mngdatanm1_s,
      "@p_mngdatanm2_s": ParaData.mngdatanm2_s,
      "@p_mngdatanm3_s": ParaData.mngdatanm3_s,
      "@p_mngdatanm4_s": ParaData.mngdatanm4_s,
      "@p_mngdatanm5_s": ParaData.mngdatanm5_s,
      "@p_mngdatanm6_s": ParaData.mngdatanm6_s,
      "@p_budgcd_s": ParaData.budgcd_s,
      "@p_stdrmkcd_s": ParaData.stdrmkcd_s,
      "@p_remark3_s": ParaData.remark3_s,
      "@p_evidentialkind_s": ParaData.evidentialkind_s,
      "@p_autorecnum_s": ParaData.autorecnum_s,
      "@p_taxtype_s": ParaData.taxtype_s,
      "@p_propertykind_s": ParaData.propertykind_s,
      "@p_creditcd_s": ParaData.creditcd_s,
      "@p_reason_intax_deduction_s": ParaData.reason_intax_deduction_s,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "AC_A1000W",
    },
  };

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = (selectedData: any) => {
    let valid = true;
    if (
      filters.location == undefined ||
      filters.location == null ||
      filters.location == ""
    ) {
      alert("사업장을 채워주세요.");
      valid = false;
      return false;
    }
    mainDataResult.data.map((item) => {
      if (item.acntcd == "" && valid == true) {
        alert("계정코드를 채워주세요.");
        valid = false;
        return false;
      } else if (item.controltype1 != "" && valid == true) {
        if (item.controltype1 == "B") {
          if (item.mngdata1 == "") {
            alert("관리항목값코드1을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype1 == "D") {
          if (
            parseInt(convertDateToStr(item.mngdata1).substring(0, 4)) < 2000
          ) {
            alert("관리항목값코드1을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype1 == "T") {
          if (item.mngdatanm1 == "") {
            alert("관리항목값이름1을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      } else if (item.controltype2 != "" && valid == true) {
        if (item.controltype2 == "B") {
          if (item.mngdata2 == "") {
            alert("관리항목값코드2을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype2 == "D") {
          if (
            parseInt(convertDateToStr(item.mngdata2).substring(0, 4)) < 2000
          ) {
            alert("관리항목값코드2을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype2 == "T") {
          if (item.mngdatanm2 == "") {
            alert("관리항목값이름2을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      } else if (item.controltype3 != "" && valid == true) {
        if (item.controltype3 == "B") {
          if (item.mngdata3 == "") {
            alert("관리항목값코드3을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype3 == "D") {
          if (
            parseInt(convertDateToStr(item.mngdata3).substring(0, 4)) < 2000
          ) {
            alert("관리항목값코드3을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype3 == "T") {
          if (item.mngdatanm3 == "") {
            alert("관리항목값이름3을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      } else if (item.controltype4 != "" && valid == true) {
        if (item.controltype4 == "B") {
          if (item.mngdata4 == "") {
            alert("관리항목값코드4을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype4 == "D") {
          if (
            parseInt(convertDateToStr(item.mngdata4).substring(0, 4)) < 2000
          ) {
            alert("관리항목값코드4을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype4 == "T") {
          if (item.mngdatanm4 == "") {
            alert("관리항목값이름4을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      } else if (item.controltype5 != "" && valid == true) {
        if (item.controltype5 == "B") {
          if (item.mngdata5 == "") {
            alert("관리항목값코드5을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype5 == "D") {
          if (
            parseInt(convertDateToStr(item.mngdata5).substring(0, 4)) < 2000
          ) {
            alert("관리항목값코드5을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype5 == "T") {
          if (item.mngdatanm5 == "") {
            alert("관리항목값이름5을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      } else if (item.controltype6 != "" && valid == true) {
        if (item.controltype6 == "B") {
          if (item.mngdata6 == "") {
            alert("관리항목값코드6을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype6 == "D") {
          if (
            parseInt(convertDateToStr(item.mngdata6).substring(0, 4)) < 2000
          ) {
            alert("관리항목값코드6을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if (item.controltype6 == "T") {
          if (item.mngdatanm6 == "") {
            alert("관리항목값이름6을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      }
    });

    if (valid == true) {
      try {
        if (mainDataResult.data.length == 0) {
          throw findMessage(messagesData, "AC_A1000W_001");
        } else {
          if (valid == true) {
            let valid = true;
            const dataItem = mainDataResult.data.filter((item: any) => {
              return (
                (item.rowstatus == "N" || item.rowstatus == "U") &&
                item.rowstatus !== undefined
              );
            });

            if (dataItem.length == 0 && deletedMainRows.length == 0) {
              setParaData((prev) => ({
                ...prev,
                workType: worktype,
                location: filters.location,
                actdt: filters.actdt,
                acseq1: filters.acseq1,
                acntdt: filters.acntdt,
                dptcd: filters.dptcd,
                slipdiv: filters.slipdiv == undefined ? "" : filters.slipdiv,
                consultdt: filters.consultdt,
                consultnum: filters.consultnum,
                inputpath: filters.inputpath,
                closeyn: filters.closeyn,
                approvaldt: filters.approvaldt,
                apperson: filters.apperson,
                remark3: filters.remark3,
                printcnt: filters.printcnt == undefined ? 0 : filters.printcnt,
                position: filters.position,
                inoutdiv: filters.inoutdiv,
                attdatnum: filters.attdatnum,
              }));
            } else {
              let dataArr: TdataArr = {
                rowstatus_s: [],
                acseq2_s: [],
                acntses_s: [],
                drcrdiv_s: [],
                acntcd_s: [],
                acntchr_s: [],
                alcchr_s: [],
                acntbaldiv_s: [],
                budgyn_s: [],
                partacnt_s: [],
                slipamt_s: [],
                usedptcd_s: [],
                mngdrcustyn_s: [],
                mngcrcustyn_s: [],
                mngsumcustyn_s: [],
                mngdramtyn_s: [],
                mngcramtyn_s: [],
                mngdrrateyn_s: [],
                mngcrrateyn_s: [],
                custcd_s: [],
                custnm_s: [],
                mngamt_s: [],
                rate_s: [],
                mngitemcd1_s: [],
                mngitemcd2_s: [],
                mngitemcd3_s: [],
                mngitemcd4_s: [],
                mngitemcd5_s: [],
                mngitemcd6_s: [],
                mngdata1_s: [],
                mngdata2_s: [],
                mngdata3_s: [],
                mngdata4_s: [],
                mngdata5_s: [],
                mngdata6_s: [],
                mngdatanm1_s: [],
                mngdatanm2_s: [],
                mngdatanm3_s: [],
                mngdatanm4_s: [],
                mngdatanm5_s: [],
                mngdatanm6_s: [],
                budgcd_s: [],
                stdrmkcd_s: [],
                remark3_s: [],
                evidentialkind_s: [],
                autorecnum_s: [],
                taxtype_s: [],
                propertykind_s: [],
                creditcd_s: [],
                reason_intax_deduction_s: [],
              };
              dataItem.forEach((item: any, idx: number) => {
                const {
                  rowstatus = "",
                  acseq2 = "",
                  acntses = "",
                  drcrdiv = "",
                  acntcd = "",
                  acntchr = "",
                  alcchr = "",
                  acntbaldiv = "",
                  budgyn = "",
                  partacnt = "",
                  slipamt_1 = "",
                  slipamt_2 = "",
                  usedptcd = "",
                  mngdrcustyn = "",
                  mngcrcustyn = "",
                  mngsumcustyn = "",
                  mngdramtyn = "",
                  mngcramtyn = "",
                  mngdrrateyn = "",
                  mngcrrateyn = "",
                  custcd = "",
                  custnm = "",
                  mngamt = "",
                  rate = "",
                  mngitemcd1 = "",
                  mngitemcd2 = "",
                  mngitemcd3 = "",
                  mngitemcd4 = "",
                  mngitemcd5 = "",
                  mngitemcd6 = "",
                  mngdata1 = "",
                  mngdata2 = "",
                  mngdata3 = "",
                  mngdata4 = "",
                  mngdata5 = "",
                  mngdata6 = "",
                  mngdatanm1 = "",
                  mngdatanm2 = "",
                  mngdatanm3 = "",
                  mngdatanm4 = "",
                  mngdatanm5 = "",
                  mngdatanm6 = "",
                  budgcd = "",
                  stdrmkcd = "",
                  remark3 = "",
                  evidentialkind = "",
                  autorecnum = "",
                  taxtype = "",
                  propertykind = "",
                  creditcd = "",
                  reason_intax_deduction = "",
                } = item;
                dataArr.rowstatus_s.push(rowstatus);
                dataArr.acseq2_s.push(
                  acseq2 == undefined || acseq2 == "" ? 0 : acseq2
                );
                dataArr.acntses_s.push(acntses == undefined ? "" : acntses);
                dataArr.drcrdiv_s.push(drcrdiv == undefined ? "" : drcrdiv);
                dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
                dataArr.acntchr_s.push(acntchr == undefined ? "" : acntchr);
                dataArr.alcchr_s.push(alcchr == undefined ? "" : alcchr);
                dataArr.acntbaldiv_s.push(
                  acntbaldiv == undefined ? "" : acntbaldiv
                );
                dataArr.budgyn_s.push(budgyn == undefined ? "" : budgyn);
                dataArr.partacnt_s.push(partacnt == undefined ? "" : partacnt);
                if (slipamt_1 != 0) {
                  dataArr.slipamt_s.push(slipamt_1);
                } else if (slipamt_2 != 0) {
                  dataArr.slipamt_s.push(slipamt_2);
                }
                dataArr.usedptcd_s.push(usedptcd == undefined ? "" : usedptcd);
                dataArr.mngdrcustyn_s.push(
                  mngdrcustyn == undefined ? "" : mngdrcustyn
                );
                dataArr.mngcrcustyn_s.push(
                  mngcrcustyn == undefined ? "" : mngcrcustyn
                );
                dataArr.mngsumcustyn_s.push(
                  mngsumcustyn == undefined ? "" : mngsumcustyn
                );
                dataArr.mngdramtyn_s.push(
                  mngdramtyn == undefined ? "" : mngdramtyn
                );
                dataArr.mngcramtyn_s.push(
                  mngcramtyn == undefined ? "" : mngcramtyn
                );
                dataArr.mngdrrateyn_s.push(
                  mngdrrateyn == undefined ? "" : mngdrrateyn
                );
                dataArr.mngcrrateyn_s.push(
                  mngcrrateyn == undefined ? "" : mngcrrateyn
                );
                dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
                dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
                dataArr.mngamt_s.push(mngamt == undefined ? 0 : mngamt);
                dataArr.rate_s.push(rate == undefined ? 0 : rate);
                dataArr.mngitemcd1_s.push(
                  mngitemcd1 == undefined ? "" : mngitemcd1
                );
                dataArr.mngitemcd2_s.push(
                  mngitemcd2 == undefined ? "" : mngitemcd2
                );
                dataArr.mngitemcd3_s.push(
                  mngitemcd3 == undefined ? "" : mngitemcd3
                );
                dataArr.mngitemcd4_s.push(
                  mngitemcd4 == undefined ? "" : mngitemcd4
                );
                dataArr.mngitemcd5_s.push(
                  mngitemcd5 == undefined ? "" : mngitemcd5
                );
                dataArr.mngitemcd6_s.push(
                  mngitemcd6 == undefined ? "" : mngitemcd6
                );
                dataArr.mngdata1_s.push(mngdata1 == undefined ? "" : mngdata1);
                dataArr.mngdata2_s.push(mngdata2 == undefined ? "" : mngdata2);
                dataArr.mngdata3_s.push(mngdata3 == undefined ? "" : mngdata3);
                dataArr.mngdata4_s.push(mngdata4 == undefined ? "" : mngdata4);
                dataArr.mngdata5_s.push(mngdata5 == undefined ? "" : mngdata5);
                dataArr.mngdata6_s.push(mngdata6 == undefined ? "" : mngdata6);
                dataArr.mngdatanm1_s.push(
                  mngdatanm1 == undefined ? "" : mngdatanm1
                );
                dataArr.mngdatanm2_s.push(
                  mngdatanm2 == undefined ? "" : mngdatanm2
                );
                dataArr.mngdatanm3_s.push(
                  mngdatanm3 == undefined ? "" : mngdatanm3
                );
                dataArr.mngdatanm4_s.push(
                  mngdatanm4 == undefined ? "" : mngdatanm4
                );
                dataArr.mngdatanm5_s.push(
                  mngdatanm5 == undefined ? "" : mngdatanm5
                );
                dataArr.mngdatanm6_s.push(
                  mngdatanm6 == undefined ? "" : mngdatanm6
                );
                dataArr.budgcd_s.push(budgcd == undefined ? "" : budgcd);
                dataArr.stdrmkcd_s.push(stdrmkcd == undefined ? "" : stdrmkcd);
                dataArr.remark3_s.push(remark3 == undefined ? "" : remark3);
                dataArr.evidentialkind_s.push(
                  evidentialkind == undefined ? "" : evidentialkind
                );
                dataArr.autorecnum_s.push(
                  autorecnum == undefined ? "" : autorecnum
                );
                dataArr.taxtype_s.push(taxtype == undefined ? "" : taxtype);
                dataArr.propertykind_s.push(
                  propertykind == undefined ? "" : propertykind
                );
                dataArr.creditcd_s.push(creditcd == undefined ? "" : creditcd);
                dataArr.reason_intax_deduction_s.push(
                  reason_intax_deduction == undefined
                    ? ""
                    : reason_intax_deduction
                );
              });
              deletedMainRows.forEach((item: any, idx: number) => {
                const {
                  rowstatus = "",
                  acseq2 = "",
                  acntses = "",
                  drcrdiv = "",
                  acntcd = "",
                  acntchr = "",
                  alcchr = "",
                  attdatnum = "",
                  acntbaldiv = "",
                  budgyn = "",
                  partacnt = "",
                  slipamt_1 = "",
                  slipamt_2 = "",
                  usedptcd = "",
                  mngdrcustyn = "",
                  mngcrcustyn = "",
                  mngsumcustyn = "",
                  mngdramtyn = "",
                  mngcramtyn = "",
                  mngdrrateyn = "",
                  mngcrrateyn = "",
                  custcd = "",
                  custnm = "",
                  mngamt = "",
                  rate = "",
                  mngitemcd1 = "",
                  mngitemcd2 = "",
                  mngitemcd3 = "",
                  mngitemcd4 = "",
                  mngitemcd5 = "",
                  mngitemcd6 = "",
                  mngdata1 = "",
                  mngdata2 = "",
                  mngdata3 = "",
                  mngdata4 = "",
                  mngdata5 = "",
                  mngdata6 = "",
                  mngdatanm1 = "",
                  mngdatanm2 = "",
                  mngdatanm3 = "",
                  mngdatanm4 = "",
                  mngdatanm5 = "",
                  mngdatanm6 = "",
                  budgcd = "",
                  stdrmkcd = "",
                  remark3 = "",
                  evidentialkind = "",
                  autorecnum = "",
                  taxtype = "",
                  propertykind = "",
                  creditcd = "",
                  reason_intax_deduction = "",
                } = item;
                dataArr.rowstatus_s.push(rowstatus);
                dataArr.acseq2_s.push(
                  acseq2 == undefined || acseq2 == "" ? 0 : acseq2
                );
                dataArr.acntses_s.push(acntses == undefined ? "" : acntses);
                dataArr.drcrdiv_s.push(drcrdiv == undefined ? "" : drcrdiv);
                dataArr.acntcd_s.push(acntcd == undefined ? "" : acntcd);
                dataArr.acntchr_s.push(acntchr == undefined ? "" : acntchr);
                dataArr.alcchr_s.push(alcchr == undefined ? "" : alcchr);
                dataArr.acntbaldiv_s.push(
                  acntbaldiv == undefined ? "" : acntbaldiv
                );
                dataArr.budgyn_s.push(budgyn == undefined ? "" : budgyn);
                dataArr.partacnt_s.push(partacnt == undefined ? "" : partacnt);
                if (slipamt_1 != 0) {
                  dataArr.slipamt_s.push(slipamt_1);
                } else if (slipamt_2 != 0) {
                  dataArr.slipamt_s.push(slipamt_2);
                }
                dataArr.usedptcd_s.push(usedptcd == undefined ? "" : usedptcd);
                dataArr.mngdrcustyn_s.push(
                  mngdrcustyn == undefined || mngdrcustyn == ""
                    ? "N"
                    : mngdrcustyn
                );
                dataArr.mngcrcustyn_s.push(
                  mngcrcustyn == undefined || mngcrcustyn == ""
                    ? "N"
                    : mngcrcustyn
                );
                dataArr.mngsumcustyn_s.push(
                  mngsumcustyn == undefined || mngsumcustyn == ""
                    ? "N"
                    : mngsumcustyn
                );
                dataArr.mngdramtyn_s.push(
                  mngdramtyn == undefined || mngdramtyn == "" ? "N" : mngdramtyn
                );
                dataArr.mngcramtyn_s.push(
                  mngcramtyn == undefined || mngcramtyn == "" ? "N" : mngcramtyn
                );
                dataArr.mngdrrateyn_s.push(
                  mngdrrateyn == undefined || mngdrrateyn == ""
                    ? "N"
                    : mngdrrateyn
                );
                dataArr.mngcrrateyn_s.push(
                  mngcrrateyn == undefined || mngcrrateyn == ""
                    ? "N"
                    : mngcrrateyn
                );
                dataArr.custcd_s.push(custcd == undefined ? "" : custcd);
                dataArr.custnm_s.push(custnm == undefined ? "" : custnm);
                dataArr.mngamt_s.push(mngamt == undefined ? 0 : mngamt);
                dataArr.rate_s.push(rate == undefined ? 0 : rate);
                dataArr.mngitemcd1_s.push(
                  mngitemcd1 == undefined ? "" : mngitemcd1
                );
                dataArr.mngitemcd2_s.push(
                  mngitemcd2 == undefined ? "" : mngitemcd2
                );
                dataArr.mngitemcd3_s.push(
                  mngitemcd3 == undefined ? "" : mngitemcd3
                );
                dataArr.mngitemcd4_s.push(
                  mngitemcd4 == undefined ? "" : mngitemcd4
                );
                dataArr.mngitemcd5_s.push(
                  mngitemcd5 == undefined ? "" : mngitemcd5
                );
                dataArr.mngitemcd6_s.push(
                  mngitemcd6 == undefined ? "" : mngitemcd6
                );
                dataArr.mngdata1_s.push(mngdata1 == undefined ? "" : mngdata1);
                dataArr.mngdata2_s.push(mngdata2 == undefined ? "" : mngdata2);
                dataArr.mngdata3_s.push(mngdata3 == undefined ? "" : mngdata3);
                dataArr.mngdata4_s.push(mngdata4 == undefined ? "" : mngdata4);
                dataArr.mngdata5_s.push(mngdata5 == undefined ? "" : mngdata5);
                dataArr.mngdata6_s.push(mngdata6 == undefined ? "" : mngdata6);
                dataArr.mngdatanm1_s.push(
                  mngdatanm1 == undefined ? "" : mngdatanm1
                );
                dataArr.mngdatanm2_s.push(
                  mngdatanm2 == undefined ? "" : mngdatanm2
                );
                dataArr.mngdatanm3_s.push(
                  mngdatanm3 == undefined ? "" : mngdatanm3
                );
                dataArr.mngdatanm4_s.push(
                  mngdatanm4 == undefined ? "" : mngdatanm4
                );
                dataArr.mngdatanm5_s.push(
                  mngdatanm5 == undefined ? "" : mngdatanm5
                );
                dataArr.mngdatanm6_s.push(
                  mngdatanm6 == undefined ? "" : mngdatanm6
                );
                dataArr.budgcd_s.push(budgcd == undefined ? "" : budgcd);
                dataArr.stdrmkcd_s.push(stdrmkcd == undefined ? "" : stdrmkcd);
                dataArr.remark3_s.push(remark3 == undefined ? "" : remark3);
                dataArr.evidentialkind_s.push(
                  evidentialkind == undefined ? "" : evidentialkind
                );
                dataArr.autorecnum_s.push(
                  autorecnum == undefined ? "" : autorecnum
                );
                dataArr.taxtype_s.push(taxtype == undefined ? "" : taxtype);
                dataArr.propertykind_s.push(
                  propertykind == undefined ? "" : propertykind
                );
                dataArr.creditcd_s.push(creditcd == undefined ? "" : creditcd);
                dataArr.reason_intax_deduction_s.push(
                  reason_intax_deduction == undefined
                    ? ""
                    : reason_intax_deduction
                );
              });
              setParaData((prev) => ({
                ...prev,
                workType: worktype,
                location: filters.location,
                actdt: filters.actdt,
                acseq1: filters.acseq1,
                acntdt: filters.acntdt,
                dptcd: filters.dptcd,
                slipdiv: filters.slipdiv == undefined ? "" : filters.slipdiv,
                consultdt: filters.consultdt,
                consultnum: filters.consultnum,
                inputpath: filters.inputpath,
                closeyn: filters.closeyn,
                approvaldt: filters.approvaldt,
                apperson: filters.apperson,
                remark3: filters.remark3,
                printcnt: filters.printcnt == undefined ? 0 : filters.printcnt,
                position: filters.position,
                inoutdiv: filters.inoutdiv,
                attdatnum: filters.attdatnum,
                rowstatus_s: dataArr.rowstatus_s.join("|"),
                acseq2_s: dataArr.acseq2_s.join("|"),
                acntses_s: dataArr.acntses_s.join("|"),
                drcrdiv_s: dataArr.drcrdiv_s.join("|"),
                acntcd_s: dataArr.acntcd_s.join("|"),
                acntchr_s: dataArr.acntchr_s.join("|"),
                alcchr_s: dataArr.alcchr_s.join("|"),
                acntbaldiv_s: dataArr.acntbaldiv_s.join("|"),
                budgyn_s: dataArr.budgyn_s.join("|"),
                partacnt_s: dataArr.partacnt_s.join("|"),
                slipamt_s: dataArr.slipamt_s.join("|"),
                usedptcd_s: dataArr.usedptcd_s.join("|"),
                mngdrcustyn_s: dataArr.mngdrcustyn_s.join("|"),
                mngcrcustyn_s: dataArr.mngcrcustyn_s.join("|"),
                mngsumcustyn_s: dataArr.mngsumcustyn_s.join("|"),
                mngdramtyn_s: dataArr.mngdramtyn_s.join("|"),
                mngcramtyn_s: dataArr.mngcramtyn_s.join("|"),
                mngdrrateyn_s: dataArr.mngdrrateyn_s.join("|"),
                mngcrrateyn_s: dataArr.mngcrrateyn_s.join("|"),
                custcd_s: dataArr.custcd_s.join("|"),
                custnm_s: dataArr.custnm_s.join("|"),
                mngamt_s: dataArr.mngamt_s.join("|"),
                rate_s: dataArr.rate_s.join("|"),
                mngitemcd1_s: dataArr.mngitemcd1_s.join("|"),
                mngitemcd2_s: dataArr.mngitemcd2_s.join("|"),
                mngitemcd3_s: dataArr.mngitemcd3_s.join("|"),
                mngitemcd4_s: dataArr.mngitemcd4_s.join("|"),
                mngitemcd5_s: dataArr.mngitemcd5_s.join("|"),
                mngitemcd6_s: dataArr.mngitemcd6_s.join("|"),
                mngdata1_s: dataArr.mngdata1_s.join("|"),
                mngdata2_s: dataArr.mngdata2_s.join("|"),
                mngdata3_s: dataArr.mngdata3_s.join("|"),
                mngdata4_s: dataArr.mngdata4_s.join("|"),
                mngdata5_s: dataArr.mngdata5_s.join("|"),
                mngdata6_s: dataArr.mngdata6_s.join("|"),
                mngdatanm1_s: dataArr.mngdatanm1_s.join("|"),
                mngdatanm2_s: dataArr.mngdatanm2_s.join("|"),
                mngdatanm3_s: dataArr.mngdatanm3_s.join("|"),
                mngdatanm4_s: dataArr.mngdatanm4_s.join("|"),
                mngdatanm5_s: dataArr.mngdatanm5_s.join("|"),
                mngdatanm6_s: dataArr.mngdatanm6_s.join("|"),
                budgcd_s: dataArr.budgcd_s.join("|"),
                stdrmkcd_s: dataArr.stdrmkcd_s.join("|"),
                remark3_s: dataArr.remark3_s.join("|"),
                evidentialkind_s: dataArr.evidentialkind_s.join("|"),
                autorecnum_s: dataArr.autorecnum_s.join("|"),
                taxtype_s: dataArr.taxtype_s.join("|"),
                propertykind_s: dataArr.propertykind_s.join("|"),
                creditcd_s: dataArr.creditcd_s.join("|"),
                reason_intax_deduction_s:
                  dataArr.reason_intax_deduction_s.join("|"),
              }));
            }
          }
        }
      } catch (e) {
        alert(e);
      }
    }
  };

  useEffect(() => {
    if (ParaData.workType != "W") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

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
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        isSearch: true,
      }));
      setUnsavedName([]);
      if (ParaData.workType == "N") {
        setVisible(false);
      }
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "W",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        actdt: new Date(),
        acseq1: 0,
        acntdt: new Date(),
        dptcd: "",
        slipdiv: "",
        consultdt: "",
        consultnum: 0,
        inputpath: "",
        closeyn: "",
        approvaldt: "",
        apperson: "",
        remark3: "",
        printcnt: 0,
        position: "",
        inoutdiv: "",
        rowstatus_s: "",
        acseq2_s: "",
        acntses_s: "",
        drcrdiv_s: "",
        acntcd_s: "",
        acntchr_s: "",
        alcchr_s: "",
        acntbaldiv_s: "",
        budgyn_s: "",
        partacnt_s: "",
        slipamt_s: "",
        usedptcd_s: "",
        mngdrcustyn_s: "",
        mngcrcustyn_s: "",
        mngsumcustyn_s: "",
        mngdramtyn_s: "",
        mngcramtyn_s: "",
        mngdrrateyn_s: "",
        mngcrrateyn_s: "",
        custcd_s: "",
        custnm_s: "",
        mngamt_s: "",
        rate_s: "",
        mngitemcd1_s: "",
        mngitemcd2_s: "",
        mngitemcd3_s: "",
        mngitemcd4_s: "",
        mngitemcd5_s: "",
        mngitemcd6_s: "",
        mngdata1_s: "",
        mngdata2_s: "",
        mngdata3_s: "",
        mngdata4_s: "",
        mngdata5_s: "",
        mngdata6_s: "",
        mngdatanm1_s: "",
        mngdatanm2_s: "",
        mngdatanm3_s: "",
        mngdatanm4_s: "",
        mngdatanm5_s: "",
        mngdatanm6_s: "",
        budgcd_s: "",
        stdrmkcd_s: "",
        remark3_s: "",
        evidentialkind_s: "",
        autorecnum_s: "",
        taxtype_s: "",
        propertykind_s: "",
        creditcd_s: "",
        reason_intax_deduction_s: "",
        attdatnum: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
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
    let valid = true;
    if (
      field == "acntnm" ||
      field == "stdrmknm" ||
      field == "custnm" ||
      field == "acseq2" ||
      field == "rowstatus" ||
      (dataItem.drcrdiv == "2" && field == "slipamt_1") ||
      (dataItem.drcrdiv == "1" && field == "slipamt_2")
    ) {
      valid = false;
      return false;
    }

    if (valid == true) {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              [EDIT_FIELD]: field,
            }
          : { ...item, [EDIT_FIELD]: undefined }
      );
      setEditIndex(dataItem[DATA_ITEM_KEY]);
      if (field) {
        setEditedField(field);
      }
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
      if (editedField !== "acntcd" && editedField !== "stdrmkcd") {
        const newData = mainDataResult.data.map((item) =>
          item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
            ? {
                ...item,
                rowstatus: item.rowstatus == "N" ? "N" : "U",
                slipamt_1: item.drcrdiv == "2" ? 0 : item.slipamt_1,
                slipamt_2: item.drcrdiv == "1" ? 0 : item.slipamt_2,
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
      } else if (editedField == "stdrmkcd") {
        mainDataResult.data.map(async (item) => {
          if (editIndex == item.num) {
            const data = codeListData.find(
              (items: any) => items.stdrmkcd == item.stdrmkcd
            );

            if (data == undefined) {
              const newData = mainDataResult.data.map((item) =>
                item[DATA_ITEM_KEY] ==
                Object.getOwnPropertyNames(selectedState)[0]
                  ? {
                      ...item,
                      rowstatus: item.rowstatus == "N" ? "N" : "U",
                      stdrmkcd: item.stdrmkcd,
                      stdrmknm: item.stdrmknm,
                      acntcd: item.acntcd,
                      acntnm: item.acntnm,
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
              const data2 = acntListData.find(
                (items: any) => items.acntcd == data.acntcd
              );

              let datas: any;
              const select = mainDataResult.data.filter(
                (item) =>
                  item.num ==
                  parseInt(Object.getOwnPropertyNames(selectedState)[0])
              )[0];
              const parameters2: Iparameters = {
                procedureName: "P_AC_A1000W_Q",
                pageNumber: filters.pgNum,
                pageSize: filters.pgSize,
                parameters: {
                  "@p_work_type": "ITEM",
                  "@p_orgdiv": filters.orgdiv,
                  "@p_actdt": convertDateToStr(filters.acntdt),
                  "@p_acseq1": 0,
                  "@p_acnum": "",
                  "@p_acseq2": 0,
                  "@p_acntcd": data2 == undefined ? "" : data2?.acntcd,
                  "@p_frdt": "",
                  "@p_todt": "",
                  "@p_location": "",
                  "@p_person": "",
                  "@p_inputpath": "",
                  "@p_custcd": "",
                  "@p_custnm": "",
                  "@p_slipdiv": "",
                  "@p_remark3": "",
                  "@p_maxacseq2": 0,
                  "@p_framt": 0,
                  "@p_toamt": 0,
                  "@p_position": "",
                  "@p_inoutdiv": "",
                  "@p_drcrdiv": select.drcrdiv,
                  "@p_actdt_s": "",
                  "@p_acseq1_s": "",
                  "@p_printcnt_s": "",
                  "@p_rowstatus_s": "",
                  "@p_chk_s": "",
                  "@p_ackey_s": "",
                  "@p_acntnm": "",
                  "@p_find_row_value": "",
                },
              };

              try {
                datas = await processApi<any>("procedure", parameters2);
              } catch (error) {
                datas = null;
              }

              const rows = datas.tables[0].Rows[0];
              if (data != undefined && data2 != undefined) {
                const newData = mainDataResult.data.map((item) =>
                  item.num ==
                  parseInt(Object.getOwnPropertyNames(selectedState)[0])
                    ? {
                        ...item,
                        acntcd: data.acntcd,
                        acntnm: data.acntnm,
                        stdrmkcd: data.stdrmkcd,
                        stdrmknm: data.stdrmknm1,
                        mngitemnm1: data2.mngitemnm1,
                        mngitemnm2: data2.mngitemnm2,
                        mngitemnm3: data2.mngitemnm3,
                        mngitemnm4: data2.mngitemnm4,
                        mngitemnm5: data2.mngitemnm5,
                        mngitemnm6: data2.mngitemnm6,
                        acntbaldiv: rows.acntbaldiv,
                        acntchr: rows.acntchr,
                        acntdiv: rows.acntdiv,
                        acntgrp: rows.acntgrp,
                        budgyn: rows.budgyn,
                        controltype1: rows.controltype1,
                        controltype2: rows.controltype2,
                        controltype3: rows.controltype3,
                        controltype4: rows.controltype4,
                        controltype5: rows.controltype5,
                        controltype6: rows.controltype6,
                        diststd: rows.diststd,
                        makesha: rows.makesha,
                        mngcramtyn: rows.mngcramtyn,
                        mngcrcustyn: rows.mngcrcustyn,
                        mngcrrateyn: rows.mngcrrateyn,
                        mngdramtyn: rows.mngdramtyn,
                        mngdrcustyn: rows.mngdrcustyn,
                        mngdrrateyn: rows.mngdrrateyn,
                        mngitemcd1: rows.mngitemcd1,
                        mngitemcd2: rows.mngitemcd2,
                        mngitemcd3: rows.mngitemcd3,
                        mngitemcd4: rows.mngitemcd4,
                        mngitemcd5: rows.mngitemcd5,
                        mngitemcd6: rows.mngitemcd6,
                        prodyn: rows.prodyn,
                        profitchr: rows.profitchr,
                        profitsha: rows.profitsha,
                        relacntcd: rows.relacntcd,
                        relacntgrp: rows.relacntgrp,
                        show_collect_yn: rows.show_collect_yn,
                        show_payment_yn: rows.show_payment_yn,
                        sho_pur_sal_yn: rows.sho_pur_sal_yn,
                        slipentyn: rows.slipentyn,
                        soyn: rows.soyn,
                        system_yn: rows.system_yn,
                        useyn: rows.useyn,
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
              }
            }
          }
        });
      } else {
        mainDataResult.data.map(async (item) => {
          if (editIndex == item.num) {
            let acntcds = item.acntcds;
            const data = acntListData.find(
              (items: any) => items.acntcd == item.acntcd
            );

            if (data == undefined) {
              const newData = mainDataResult.data.map((item: any) =>
                item.num ==
                parseInt(Object.getOwnPropertyNames(selectedState)[0])
                  ? {
                      ...item,
                      acntcd: acntcds,
                      acntnm: item.acntnm,
                      mngitemnm1: item.mngitemnm1,
                      mngitemnm2: item.mngitemnm2,
                      mngitemnm3: item.mngitemnm3,
                      mngitemnm4: item.mngitemnm4,
                      mngitemnm5: item.mngitemnm5,
                      mngitemnm6: item.mngitemnm6,
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
              let datas: any;
              const select = mainDataResult.data.filter(
                (item) =>
                  item.num ==
                  parseInt(Object.getOwnPropertyNames(selectedState)[0])
              )[0];
              const parameters2: Iparameters = {
                procedureName: "P_AC_A1000W_Q",
                pageNumber: filters.pgNum,
                pageSize: filters.pgSize,
                parameters: {
                  "@p_work_type": "ITEM",
                  "@p_orgdiv": filters.orgdiv,
                  "@p_actdt": convertDateToStr(filters.acntdt),
                  "@p_acseq1": 0,
                  "@p_acnum": "",
                  "@p_acseq2": 0,
                  "@p_acntcd": data.acntcd,
                  "@p_frdt": "",
                  "@p_todt": "",
                  "@p_location": "",
                  "@p_person": "",
                  "@p_inputpath": "",
                  "@p_custcd": "",
                  "@p_custnm": "",
                  "@p_slipdiv": "",
                  "@p_remark3": "",
                  "@p_maxacseq2": 0,
                  "@p_framt": 0,
                  "@p_toamt": 0,
                  "@p_position": "",
                  "@p_inoutdiv": "",
                  "@p_drcrdiv": select.drcrdiv,
                  "@p_actdt_s": "",
                  "@p_acseq1_s": "",
                  "@p_printcnt_s": "",
                  "@p_rowstatus_s": "",
                  "@p_chk_s": "",
                  "@p_ackey_s": "",
                  "@p_acntnm": "",
                  "@p_find_row_value": "",
                },
              };

              try {
                datas = await processApi<any>("procedure", parameters2);
              } catch (error) {
                datas = null;
              }

              const rows = datas.tables[0].Rows[0];
              if (data != undefined) {
                const newData = mainDataResult.data.map((item) =>
                  item.num ==
                  parseInt(Object.getOwnPropertyNames(selectedState)[0])
                    ? {
                        ...item,
                        acntcd: data.acntcd,
                        acntnm: data.acntnm,
                        mngitemnm1: data.mngitemnm1,
                        mngitemnm2: data.mngitemnm2,
                        mngitemnm3: data.mngitemnm3,
                        mngitemnm4: data.mngitemnm4,
                        mngitemnm5: data.mngitemnm5,
                        mngitemnm6: data.mngitemnm6,
                        acntbaldiv: rows.acntbaldiv,
                        acntchr: rows.acntchr,
                        acntdiv: rows.acntdiv,
                        acntgrp: rows.acntgrp,
                        budgyn: rows.budgyn,
                        controltype1: rows.controltype1,
                        controltype2: rows.controltype2,
                        controltype3: rows.controltype3,
                        controltype4: rows.controltype4,
                        controltype5: rows.controltype5,
                        controltype6: rows.controltype6,
                        diststd: rows.diststd,
                        makesha: rows.makesha,
                        mngcramtyn: rows.mngcramtyn,
                        mngcrcustyn: rows.mngcrcustyn,
                        mngcrrateyn: rows.mngcrrateyn,
                        mngdramtyn: rows.mngdramtyn,
                        mngdrcustyn: rows.mngdrcustyn,
                        mngdrrateyn: rows.mngdrrateyn,
                        mngitemcd1: rows.mngitemcd1,
                        mngitemcd2: rows.mngitemcd2,
                        mngitemcd3: rows.mngitemcd3,
                        mngitemcd4: rows.mngitemcd4,
                        mngitemcd5: rows.mngitemcd5,
                        mngitemcd6: rows.mngitemcd6,
                        prodyn: rows.prodyn,
                        profitchr: rows.profitchr,
                        profitsha: rows.profitsha,
                        relacntcd: rows.relacntcd,
                        relacntgrp: rows.relacntgrp,
                        show_collect_yn: rows.show_collect_yn,
                        show_payment_yn: rows.show_payment_yn,
                        sho_pur_sal_yn: rows.sho_pur_sal_yn,
                        slipentyn: rows.slipentyn,
                        soyn: rows.soyn,
                        system_yn: rows.system_yn,
                        useyn: rows.useyn,
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
              }
            }
          }
        });
      }
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

  const onAddClick = () => {
    mainDataResult.data.map((item) => {
      if (item.num > temp) {
        temp = item.num;
      }
    });
    const datas = mainDataResult.data[mainDataResult.data.length - 1];
    for (var i = 1; i < 3; i++) {
      const newDataItem = {
        [DATA_ITEM_KEY]: ++temp,
        ackey: filters.ackey,
        acntbaldiv: "",
        acntcd: "",
        acntcd2: "",
        acntchr: "",
        acntdt: convertDateToStr(filters.acntdt),
        acntnm: "",
        acntses: "",
        acseq1: 0,
        acseq2: temp,
        actdt: convertDateToStr(filters.actdt),
        alcchr: "",
        apperson: "",
        approvaldt: filters.approvaldt,
        attdatnum: "",
        autorecnum: "",
        bizregnum: "",
        budgcd: "",
        budgyn: "N",
        closeyn: filters.closeyn,
        consultdt: filters.consultdt,
        consultnum: filters.consultnum,
        consultseq: 0,
        controltype1: "",
        controltype2: "",
        controltype3: "",
        controltype4: "",
        controltype5: "",
        controltype6: "",
        creditcd: "",
        creditnm: "",
        creditnum: "",
        custcd: "",
        custnm: "",
        dptcd: filters.dptcd,
        drcrdiv: i.toString(),
        evidentialkind: "",
        files: "",
        inoutdiv: filters.inoutdiv,
        inputpath: filters.inputpath,
        location: filters.location,
        mngamt: 0,
        mngcramtyn: "",
        mngcrctlyn1: "",
        mngcrctlyn2: "",
        mngcrctlyn3: "",
        mngcrctlyn4: "",
        mngcrctlyn5: "",
        mngcrctlyn6: "",
        mngcrcustyn: "",
        mngcrrateyn: "",
        mngdata1: "",
        mngdata2: "",
        mngdata3: "",
        mngdata4: "",
        mngdata5: "",
        mngdata6: "",
        mngdatanm1: "",
        mngdatanm2: "",
        mngdatanm3: "",
        mngdatanm4: "",
        mngdatanm5: "",
        mngdatanm6: "",
        mngdrctlyn1: "",
        mngdrctlyn2: "",
        mngdrctlyn3: "",
        mngdrctlyn4: "",
        mngdrctlyn5: "",
        mngdrctlyn6: "",
        mngdrrateyn: "",
        mngitemcd1: "",
        mngitemcd2: "",
        mngitemcd3: "",
        mngitemcd4: "",
        mngitemcd5: "",
        mngitemcd6: "",
        mngsumcustyn: "",
        orgdiv: sessionOrgdiv,
        partacnt: "",
        position: filters.position,
        propertykind: "",
        rate: 0,
        reason_intax_deduction: "",
        remark3: "",
        slipamt: 0,
        slipamt_1: 0,
        slipamt_2: 0,
        slipdiv: filters.slipdiv,
        stdrmkcd: "",
        stdrmknm: "",
        taxtype: "",
        taxtypenm: "",
        usedptcd: "",
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
    }
  };

  return (
    <>
      <Window
        title={
          worktype == "N"
            ? "대체전표생성"
            : worktype == "C"
            ? "대체전표복사"
            : "대체전표정보"
        }
        initialWidth={position.width}
        initialHeight={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>전표일자</th>
                <td>
                  <div className="filter-item-wrap">
                    <DatePicker
                      name="acntdt"
                      value={filters.acntdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      className="required"
                      placeholder=""
                    />
                  </div>
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
                <th>구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="inoutdiv"
                      value={filters.inoutdiv}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
                <th>첨부파일</th>
                <td>
                  <Input
                    name="files"
                    type="text"
                    value={filters.files}
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
          <FormContext2.Provider
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
            <FormContext3.Provider
              value={{
                stdrmkcd,
                stdrmknm,
                acntcd,
                acntnm,
                setAcntcd,
                setAcntnm,
                setStdrmkcd,
                setStdrmknm,
                mainDataState,
                setMainDataState,
                // fetchGrid,
              }}
            >
              <FormContext4.Provider
                value={{
                  attdatnum,
                  files,
                  setAttdatnum,
                  setFiles,
                  mainDataState,
                  setMainDataState,
                  // fetchGrid,
                }}
              >
                <GridContainer>
                  <GridTitleContainer>
                    <GridTitle>상세정보(1: 차변, 2: 대변)</GridTitle>
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
                    style={{ height: "300px" }}
                    data={process(
                      mainDataResult.data.map((row) => ({
                        ...row,
                        rowstatus:
                          row.rowstatus == null ||
                          row.rowstatus == "" ||
                          row.rowstatus == undefined
                            ? ""
                            : row.rowstatus,
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
                    onItemChange={onMainItemChange}
                    cellRender={customCellRender}
                    rowRender={customRowRender}
                    editField={EDIT_FIELD}
                  >
                    <GridColumn field="rowstatus" title=" " width="50px" />
                    <GridColumn
                      field="acseq2"
                      title="순번"
                      width="100px"
                      cell={NumberCell}
                      footerCell={mainTotalFooterCell}
                    />
                    <GridColumn
                      field="drcrdiv"
                      title="차대구분"
                      width="150px"
                      cell={CustomRadioCell}
                    />
                    <GridColumn
                      field="acntcd"
                      title="계정코드"
                      cell={ColumnCommandCell}
                      headerCell={RequiredHeader}
                      width="150px"
                    />
                    <GridColumn field="acntnm" title="계정명" width="150px" />
                    <GridColumn
                      field="stdrmkcd"
                      title="단축코드"
                      width="150px"
                      cell={ColumnCommandCell3}
                    />
                    <GridColumn field="stdrmknm" title="단축명" width="150px" />
                    <GridColumn
                      field="slipamt_1"
                      title="차변금액"
                      width="100px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn
                      field="slipamt_2"
                      title="대변금액"
                      width="100px"
                      cell={NumberCell}
                      footerCell={editNumberFooterCell}
                    />
                    <GridColumn field="remark3" title="적요" width="300px" />
                    <GridColumn
                      field="custcd"
                      cell={ColumnCommandCell2}
                      title="업체코드"
                      width="150px"
                    />
                    <GridColumn field="custnm" title="업체명" width="150px" />
                    <GridColumn
                      field="bizregnum"
                      title="사업자등록번호"
                      width="200px"
                    />
                    <GridColumn
                      field="files"
                      cell={ColumnCommandCell4}
                      title="첨부파일"
                      width="200px"
                    />
                  </Grid>
                </GridContainer>
              </FormContext4.Provider>
            </FormContext3.Provider>
          </FormContext2.Provider>
        </FormContext.Provider>
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>관리금액</th>
                <td>
                  <NumericTextBox
                    name="mngamt"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].mngamt
                    }
                    onChange={InputChange}
                  />
                </td>
                <th>RAT</th>
                <td>
                  <Input
                    name="rate"
                    type="number"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].rate
                    }
                    onChange={InputChange}
                  />
                </td>
                <th>사용부서</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="usedptcd"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].usedptcd
                      }
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      textField="dptnm"
                      valueField="dptcd"
                    />
                  )}
                </td>
                <th>자산</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="propertykind"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].propertykind
                      }
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>비용증빙</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="evidentialkind"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].evidentialkind
                      }
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                    />
                  )}
                </td>
                <th>신용카드</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="creditcd"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].creditcd
                      }
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      textField="Column1"
                      valueField="creditcd"
                    />
                  )}
                </td>
                <th>계산서유형</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="reason_intax_deduction"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].reason_intax_deduction
                      }
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>관리항목코드1</th>
                <td>
                  <Input
                    name="mngitemcd1"
                    type="text"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].mngitemcd1
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목명1</th>
                <td>
                  <Input
                    name="mngitemnm1"
                    type="text"
                    value={
                      mngItemListData.find(
                        (items: any) =>
                          items.mngitemcd ==
                          (mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined
                            ? ""
                            : mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngitemcd1)
                      )?.mngitemnm == undefined
                        ? ""
                        : mngItemListData.find(
                            (items: any) =>
                              items.mngitemcd ==
                              (mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item: any) =>
                                      item.num ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].mngitemcd1)
                          )?.mngitemnm
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목값코드1</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdata1"
                      type="text"
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
                            )[0].mngdata1
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype1 == "B" ? (
                    mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].mngitemcd1 == "C2" ? (
                      <div className="filter-item-wrap">
                        <Input
                          name="mngdata1"
                          type="text"
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
                                )[0].mngdata1
                          }
                          onChange={InputChange}
                          className="required"
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onNoteWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </div>
                    ) : (
                      <div className="filter-item-wrap">
                        <Input
                          name="mngdata1"
                          type="text"
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
                                )[0].mngdata1
                          }
                          onChange={InputChange}
                          className="required"
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onStandardWndClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </div>
                    )
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined ? (
                    ""
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype1 == "D" ? (
                    <DatePicker
                      name="mngdata1"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? new Date()
                          : toDate(
                              mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngdata1
                            )
                      }
                      format="yyyy-MM-dd"
                      className="required"
                      onChange={InputChange}
                      placeholder=""
                    />
                  ) : (
                    <Input
                      name="mngdata1"
                      type="text"
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
                            )[0].mngdata1
                      }
                      className="readonly"
                    />
                  )}
                </td>
                <th>관리항목값이름1</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdatanm1"
                      type="text"
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
                            )[0].mngdatanm1
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype1 == "T" ? (
                    <Input
                      name="mngdatanm1"
                      type="text"
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
                            )[0].mngdatanm1
                      }
                      onChange={InputChange}
                      className="required"
                    />
                  ) : (
                    <Input
                      name="mngdatanm1"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].mngdatanm1
                      }
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>관리항목코드2</th>
                <td>
                  <Input
                    name="mngitemcd2"
                    type="text"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].mngitemcd2
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목명2</th>
                <td>
                  <Input
                    name="mngitemnm2"
                    type="text"
                    value={
                      mngItemListData.find(
                        (items: any) =>
                          items.mngitemcd ==
                          (mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined
                            ? ""
                            : mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngitemcd2)
                      )?.mngitemnm == undefined
                        ? ""
                        : mngItemListData.find(
                            (items: any) =>
                              items.mngitemcd ==
                              (mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item: any) =>
                                      item.num ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].mngitemcd2)
                          )?.mngitemnm
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목값코드2</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdata2"
                      type="text"
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
                            )[0].mngdata2
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype2 == "B" ? (
                    <div className="filter-item-wrap">
                      <Input
                        name="mngdata2"
                        type="text"
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
                              )[0].mngdata2
                        }
                        onChange={InputChange}
                        className="required"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onStandardWndClick2}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </div>
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined ? (
                    ""
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype2 == "D" ? (
                    <DatePicker
                      name="mngdata2"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? new Date()
                          : toDate(
                              mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngdata2
                            )
                      }
                      format="yyyy-MM-dd"
                      className="required"
                      onChange={InputChange}
                      placeholder=""
                    />
                  ) : (
                    <Input
                      name="mngdata2"
                      type="text"
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
                            )[0].mngdata2
                      }
                      className="readonly"
                    />
                  )}
                </td>
                <th>관리항목값이름2</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdatanm2"
                      type="text"
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
                            )[0].mngdatanm2
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype2 == "T" ? (
                    <Input
                      name="mngdatanm2"
                      type="text"
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
                            )[0].mngdatanm2
                      }
                      onChange={InputChange}
                      className="required"
                    />
                  ) : (
                    <Input
                      name="mngdatanm2"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].mngdatanm2
                      }
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>관리항목코드3</th>
                <td>
                  <Input
                    name="mngitemcd3"
                    type="text"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].mngitemcd3
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목명3</th>
                <td>
                  <Input
                    name="mngitemnm3"
                    type="text"
                    value={
                      mngItemListData.find(
                        (items: any) =>
                          items.mngitemcd ==
                          (mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined
                            ? ""
                            : mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngitemcd3)
                      )?.mngitemnm == undefined
                        ? ""
                        : mngItemListData.find(
                            (items: any) =>
                              items.mngitemcd ==
                              (mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item: any) =>
                                      item.num ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].mngitemcd3)
                          )?.mngitemnm
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목값코드3</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdata3"
                      type="text"
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
                            )[0].mngdata3
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype3 == "B" ? (
                    <div className="filter-item-wrap">
                      <Input
                        name="mngdata3"
                        type="text"
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
                              )[0].mngdata3
                        }
                        className="required"
                        onChange={InputChange}
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onStandardWndClick3}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </div>
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined ? (
                    ""
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype3 == "D" ? (
                    <DatePicker
                      name="mngdata3"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? new Date()
                          : toDate(
                              mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngdata3
                            )
                      }
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      className="required"
                      placeholder=""
                    />
                  ) : (
                    <Input
                      name="mngdata3"
                      type="text"
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
                            )[0].mngdata3
                      }
                      className="readonly"
                    />
                  )}
                </td>
                <th>관리항목값이름3</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdatanm3"
                      type="text"
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
                            )[0].mngdatanm3
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype3 == "T" ? (
                    <Input
                      name="mngdatanm3"
                      type="text"
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
                            )[0].mngdatanm3
                      }
                      onChange={InputChange}
                      className="required"
                    />
                  ) : (
                    <Input
                      name="mngdatanm3"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].mngdatanm3
                      }
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>관리항목코드4</th>
                <td>
                  <Input
                    name="mngitemcd4"
                    type="text"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].mngitemcd4
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목명4</th>
                <td>
                  <Input
                    name="mngitemnm4"
                    type="text"
                    value={
                      mngItemListData.find(
                        (items: any) =>
                          items.mngitemcd ==
                          (mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined
                            ? ""
                            : mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngitemcd4)
                      )?.mngitemnm == undefined
                        ? ""
                        : mngItemListData.find(
                            (items: any) =>
                              items.mngitemcd ==
                              (mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item: any) =>
                                      item.num ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].mngitemcd4)
                          )?.mngitemnm
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목값코드4</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdata4"
                      type="text"
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
                            )[0].mngdata4
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype4 == "B" ? (
                    <div className="filter-item-wrap">
                      <Input
                        name="mngdata4"
                        type="text"
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
                              )[0].mngdata4
                        }
                        onChange={InputChange}
                        className="required"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onStandardWndClick4}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </div>
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined ? (
                    ""
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype4 == "D" ? (
                    <DatePicker
                      name="mngdata4"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? new Date()
                          : toDate(
                              mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngdata4
                            )
                      }
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      className="required"
                      placeholder=""
                    />
                  ) : (
                    <Input
                      name="mngdata4"
                      type="text"
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
                            )[0].mngdata4
                      }
                      className="readonly"
                    />
                  )}
                </td>
                <th>관리항목값이름4</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdatanm4"
                      type="text"
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
                            )[0].mngdatanm4
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype4 == "T" ? (
                    <Input
                      name="mngdatanm4"
                      type="text"
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
                            )[0].mngdatanm4
                      }
                      onChange={InputChange}
                      className="required"
                    />
                  ) : (
                    <Input
                      name="mngdatanm4"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].mngdatanm4
                      }
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>관리항목코드5</th>
                <td>
                  <Input
                    name="mngitemcd5"
                    type="text"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].mngitemcd5
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목명5</th>
                <td>
                  <Input
                    name="mngitemnm5"
                    type="text"
                    value={
                      mngItemListData.find(
                        (items: any) =>
                          items.mngitemcd ==
                          (mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined
                            ? ""
                            : mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngitemcd5)
                      )?.mngitemnm == undefined
                        ? ""
                        : mngItemListData.find(
                            (items: any) =>
                              items.mngitemcd ==
                              (mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item: any) =>
                                      item.num ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].mngitemcd5)
                          )?.mngitemnm
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목값코드5</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdata5"
                      type="text"
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
                            )[0].mngdata5
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype5 == "B" ? (
                    <div className="filter-item-wrap">
                      <Input
                        name="mngdata5"
                        type="text"
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
                              )[0].mngdata5
                        }
                        onChange={InputChange}
                        className="required"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onStandardWndClick5}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </div>
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined ? (
                    ""
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype5 == "D" ? (
                    <DatePicker
                      name="mngdata5"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? new Date()
                          : toDate(
                              mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngdata5
                            )
                      }
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      className="required"
                      placeholder=""
                    />
                  ) : (
                    <Input
                      name="mngdata5"
                      type="text"
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
                            )[0].mngdata5
                      }
                      className="readonly"
                    />
                  )}
                </td>
                <th>관리항목값이름5</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdatanm5"
                      type="text"
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
                            )[0].mngdatanm5
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype5 == "T" ? (
                    <Input
                      name="mngdatanm5"
                      type="text"
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
                            )[0].mngdatanm5
                      }
                      onChange={InputChange}
                      className="required"
                    />
                  ) : (
                    <Input
                      name="mngdatanm5"
                      type="text"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? 0
                          : mainDataResult.data.filter(
                              (item: any) =>
                                item.num ==
                                Object.getOwnPropertyNames(selectedState)[0]
                            )[0].mngdatanm5
                      }
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>관리항목코드6</th>
                <td>
                  <Input
                    name="mngitemcd6"
                    type="text"
                    value={
                      mainDataResult.data.filter(
                        (item: any) =>
                          item.num ==
                          Object.getOwnPropertyNames(selectedState)[0]
                      )[0] == undefined
                        ? 0
                        : mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0].mngitemcd6
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목명6</th>
                <td>
                  <Input
                    name="mngitemnm6"
                    type="text"
                    value={
                      mngItemListData.find(
                        (items: any) =>
                          items.mngitemcd ==
                          (mainDataResult.data.filter(
                            (item: any) =>
                              item.num ==
                              Object.getOwnPropertyNames(selectedState)[0]
                          )[0] == undefined
                            ? ""
                            : mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngitemcd6)
                      )?.mngitemnm == undefined
                        ? ""
                        : mngItemListData.find(
                            (items: any) =>
                              items.mngitemcd ==
                              (mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0] == undefined
                                ? ""
                                : mainDataResult.data.filter(
                                    (item: any) =>
                                      item.num ==
                                      Object.getOwnPropertyNames(
                                        selectedState
                                      )[0]
                                  )[0].mngitemcd6)
                          )?.mngitemnm
                    }
                    className="readonly"
                  />
                </td>
                <th>관리항목값코드6</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdata6"
                      type="text"
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
                            )[0].mngdata6
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype6 == "B" ? (
                    <div className="filter-item-wrap">
                      <Input
                        name="mngdata6"
                        type="text"
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
                              )[0].mngdata6
                        }
                        onChange={InputChange}
                        className="required"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onStandardWndClick6}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </div>
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0] == undefined ? (
                    ""
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype6 == "D" ? (
                    <DatePicker
                      name="mngdata6"
                      value={
                        mainDataResult.data.filter(
                          (item: any) =>
                            item.num ==
                            Object.getOwnPropertyNames(selectedState)[0]
                        )[0] == undefined
                          ? new Date()
                          : toDate(
                              mainDataResult.data.filter(
                                (item: any) =>
                                  item.num ==
                                  Object.getOwnPropertyNames(selectedState)[0]
                              )[0].mngdata6
                            )
                      }
                      format="yyyy-MM-dd"
                      onChange={InputChange}
                      className="required"
                      placeholder=""
                    />
                  ) : (
                    <Input
                      name="mngdata6"
                      type="text"
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
                            )[0].mngdata6
                      }
                      className="readonly"
                    />
                  )}
                </td>
                <th>관리항목값이름6</th>
                <td>
                  {mainDataResult.data.filter(
                    (item: any) =>
                      item.num == Object.getOwnPropertyNames(selectedState)[0]
                  )[0] == undefined ? (
                    <Input
                      name="mngdatanm6"
                      type="text"
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
                            )[0].mngdatanm6
                      }
                      className="readonly"
                    />
                  ) : mainDataResult.data.filter(
                      (item: any) =>
                        item.num == Object.getOwnPropertyNames(selectedState)[0]
                    )[0].controltype6 == "T" ? (
                    <Input
                      name="mngdatanm6"
                      type="text"
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
                            )[0].mngdatanm6
                      }
                      onChange={InputChange}
                      className="required"
                    />
                  ) : (
                    <Input
                      name="mngdatanm6"
                      type="text"
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
                            )[0].mngdatanm6
                      }
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              저장
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
      {standardWindowVisible && (
        <StandardWindow
          setVisible={setStandardWindowVisible}
          workType={"ROW_ADD"}
          setData={setStandardData}
          mngitemcd={
            mainDataResult.data.filter(
              (item: any) =>
                item.num == Object.getOwnPropertyNames(selectedState)[0]
            )[0] == undefined
              ? ""
              : mainDataResult.data.filter(
                  (item: any) =>
                    item.num == Object.getOwnPropertyNames(selectedState)[0]
                )[0]
          }
          index={index}
        />
      )}
      {noteWindowVisible && (
        <AC_A1000W_Note_Window
          setVisible={setNoteWindowVisible}
          workType={"ROW_ADD"}
          setData={setNoteData}
          pathname={pathname}
        />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
    </>
  );
};

export default CopyWindow;
