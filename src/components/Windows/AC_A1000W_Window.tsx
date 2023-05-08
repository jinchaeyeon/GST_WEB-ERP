import {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
} from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridFooterCellProps,
  GridEvent,
  GridSelectionChangeEvent,
  getSelectedState,
  GridDataStateChangeEvent,
  GridItemChangeEvent,
  GridCellProps,
} from "@progress/kendo-react-grid";
import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import {
  TextArea,
  InputChangeEvent,
  NumericTextBox,
} from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import { DataResult, getter, process, State } from "@progress/kendo-data-query";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  GridContainer,
  ButtonInInput,
  GridTitleContainer,
  FormBoxWrap,
  FormBox,
  GridTitle,
  ButtonInGridInput,
} from "../../CommonStyled";
import { useRecoilState } from "recoil";
import { Input } from "@progress/kendo-react-inputs";
import { Iparameters } from "../../store/types";
import { Button } from "@progress/kendo-react-buttons";
import {
  chkScrollHandler,
  UseBizComponent,
  UseCustomOption,
  UseMessages,
  getQueryFromBizComponent,
  UseParaPc,
  toDate,
  convertDateToStr,
  getGridItemChangedData,
  findMessage,
} from "../CommonFunction";
import { CellRender, RowRender } from "../Renderers/Renderers";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  loginResultState,
  deletedAttadatnumsState,
  unsavedAttadatnumsState,
} from "../../store/atoms";
import { IWindowPosition, IAttachmentData } from "../../hooks/interfaces";
import { PAGE_SIZE, SELECTED_FIELD } from "../CommonString";
import { COM_CODE_DEFAULT_VALUE, EDIT_FIELD } from "../CommonString";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../store/atoms";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import NumberCell from "../Cells/NumberCell";
import RequiredHeader from "../HeaderCells/RequiredHeader";
import AccountWindow from "./CommonWindows/AccountWindow";
import StandardWindow from "./CommonWindows/StandardWindow";
import CodeWindow from "./CommonWindows/CodeWindow";
import AC_A1000W_Note_Window from "./AC_A1000W_Note_Window";
import ComboBoxCell from "../Cells/ComboBoxCell";

type IWindow = {
  workType: "N" | "A" | "C";
  data?: Idata;
  setVisible(t: boolean): void;
  setData(
    data: object,
    filter: object,
    deletedMainRows: object,
    worktype: string
  ): void;
  reload: boolean; //data : 선택한 품목 데이터를 전달하는 함수
  chkyn: boolean;
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
};

let deletedMainRows: object[] = [];

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
    custcd,
    custnm,
    setCustcd,
    setCustnm,
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
      {render === undefined
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
      {render === undefined
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
      {isInEdit ? (
        <Input value={value} onChange={handleChange} type="text" />
      ) : (
        value
      )}
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
      {render === undefined
        ? null
        : render?.call(undefined, defaultRendering, props)}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={dataItem.attdatnum}
          permission={{ upload: false, download: true, delete: false }}
        />
      )}
    </>
  );
};

const CustomComboBoxCell = (props: GridCellProps) => {
  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_AC001", setBizComponentData);

  const field = props.field ?? "";
  const bizComponentIdVal = field === "drcrdiv" ? "L_AC001" : "";

  const bizComponent = bizComponentData.find(
    (item: any) => item.bizComponentId === bizComponentIdVal
  );

  return bizComponent ? (
    <ComboBoxCell bizComponent={bizComponent} {...props} />
  ) : (
    <td />
  );
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  reload,
  chkyn,
}: IWindow) => {
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1600,
    height: 900,
  });
  const [worktype, setWorkType] = useState<string>(workType);
  const [loginResult] = useRecoilState(loginResultState);
  const userId = loginResult ? loginResult.userId : "";
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

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

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  //메시지 조회
  const pathname: string = window.location.pathname.replace("/", "");
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);
  const [editIndex, setEditIndex] = useState<number | undefined>();
  const [editedField, setEditedField] = useState("");
  const [AcntDatas, setAcntDatas] = useState<Acnt | undefined>();
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);
  useEffect(() => {
    setMainPgNum(1);
    setMainDataResult(process([], mainDataState));
    fetchMainGrid();
  }, [reload]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && worktype != "A") {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
        position: defaultOption.find((item: any) => item.id === "position")
          .valueCode,
        inoutdiv: defaultOption.find((item: any) => item.id === "inoutdiv")
          .valueCode,
        usedptcd: defaultOption.find((item: any) => item.id === "usedptcd")
          .valueCode,
        propertykind: defaultOption.find(
          (item: any) => item.id === "propertykind"
        ).valueCode,
        evidentialkind: defaultOption.find(
          (item: any) => item.id === "evidentialkind"
        ).valueCode,
        creditcd: defaultOption.find((item: any) => item.id === "creditcd")
          .valueCode,
        reason_intax_deduction: defaultOption.find(
          (item: any) => item.id === "reason_intax_deduction"
        ).valueCode,
      }));
    }
  }, [customOptionData]);

  useEffect(() => {
    if(acntcd != "" && acntcd != undefined) {
      const data = acntListData.find((items: any) => items.acntcd == acntcd);
      async function fetchDatas() {
        let datas: any;
        const select = mainDataResult.data.filter(
          (item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        )[0];
  
        const parameters2: Iparameters = {
          procedureName: "P_AC_A1000W_Q",
          pageNumber: mainPgNum,
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
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
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
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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
    if(stdrmkcd != "" && stdrmknm != undefined) {
      const data = acntListData.find((items: any) => items.acntcd == acntcd);
      async function fetchDatas() {
        let datas: any;
        const select = mainDataResult.data.filter(
          (item) =>
            item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
        )[0];
  
        const parameters2: Iparameters = {
          procedureName: "P_AC_A1000W_Q",
          pageNumber: mainPgNum,
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
            "@p_drcrdiv": select== undefined ? "" : select.drcrdiv,
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
                  rowstatus: item.rowstatus === "N" ? "N" : "U",
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
            rowstatus: item.rowstatus === "N" ? "N" : "U",
          }
        : {
            ...item,
          }
    );
    setUnsavedAttadatnums((prev) => [...prev, attdatnum]);
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
      const acntQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_acntcd")
      );
      const codeQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC024")
      );
      const mngitemQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_AC023T")
      );
      fetchQuery(acntQueryStr, setAcntListData);
      fetchQuery(codeQueryStr, setCodeListData);
      fetchQuery(mngitemQueryStr, setMngItemListData);
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

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const [standardWindowVisible, setStandardWindowVisible] =
    useState<boolean>(false);
  const [noteWindowVisible, setNoteWindowVisible] = useState<boolean>(false);
  const [isInitSearch, setIsInitSearch] = useState(false);
  const [mainPgNum, setMainPgNum] = useState(1);
  const [ifSelectFirstRow, setIfSelectFirstRow] = useState(true);

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
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [name]: convertDateToStr(value),
              [EDIT_FIELD]: name,
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
    } else {
      const newData = mainDataResult.data.map((item) =>
        item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [name]: value,
              [EDIT_FIELD]: name,
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
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [name]: value,
            [EDIT_FIELD]: name,
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
    setUnsavedAttadatnums([]);
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
  interface ICustData {
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }

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
            rowstatus: item.rowstatus === "N" ? "N" : "U",
            [mng]: data.item1,
            [mng2]: data.item2,
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
  };

  const setNoteData = (data: INote) => {
    const newData = mainDataResult.data.map((item) =>
      item[DATA_ITEM_KEY] == Object.getOwnPropertyNames(selectedState)[0]
        ? {
            ...item,
            rowstatus: item.rowstatus === "N" ? "N" : "U",
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

    setMainDataResult((prev) => {
      return {
        data: newData,
        total: prev.total,
      };
    });
  };

  const processApi = useApi();

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
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
  });

  const parameters: Iparameters = {
    procedureName: "P_AC_A1000W_Q",
    pageNumber: mainPgNum,
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
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      if (workType == "C") {
        const newData = rows.map((item: any) => ({
          ...item,
          rowstatus: "N",
        }));
        setWorkType("N");
        setMainDataResult((prev) => {
          return {
            data: newData,
            total: prev.total,
          };
        });
      } else {
        if (totalRowCnt > 0) {
          setMainDataResult((prev) => {
            return {
              data: rows,
              total: totalRowCnt,
            };
          });
          setIsInitSearch(true);
        }
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (worktype != "N" && isInitSearch === false) {
      fetchMainGrid();
    }
  }, [filters]);

  useEffect(() => {
    if (customOptionData !== null && worktype === "A") {
      fetchMainGrid();
    }
  }, [mainPgNum]);

  useEffect(() => {
    if ((worktype === "A" || worktype === "C") && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        location: data.location,
        acntdt: toDate(data.acntdt),
        position: data.position,
        inoutdiv: data.inoutdiv,
        files: data.files,
        attdatnum: data.attdatnum,
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
      }));
    } else {
      let seq = mainDataResult.total + deletedMainRows.length + 1;
      const datas = mainDataResult.data[mainDataResult.data.length - 1];

      for (var i = 1; i < 3; i++) {
        const newDataItem = {
          [DATA_ITEM_KEY]: seq,
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
          bizregnum: chkyn == true ? datas.bizregnum : "",
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
          custcd: chkyn == true ? datas.custcd : "",
          custnm: chkyn == true ? datas.custnm : "",
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
          orgdiv: "01",
          partacnt: "",
          position: filters.position,
          propertykind: "",
          rate: 0,
          reason_intax_deduction: "",
          remark3: chkyn == true ? datas.remark3 : "",
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
        seq++;
      }
    }
  }, []);

  //메인 그리드 데이터 변경 되었을 때
  useEffect(() => {
    if (ifSelectFirstRow) {
      if (mainDataResult.total > 0) {
        const firstRowData = mainDataResult.data[0];
        if(firstRowData != undefined){
          setSelectedState({ [firstRowData.num]: true });
        }

        setIfSelectFirstRow(true);
      }
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
    // setyn(true);
    setIfSelectFirstRow(false);
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

  //스크롤 핸들러
  const onMainScrollHandler = (event: GridEvent) => {
    if (chkScrollHandler(event, mainPgNum, PAGE_SIZE))
      setMainPgNum((prev) => prev + 1);
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
        총{" "}
        {parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          (parts[1] ? "." + parts[1] : "")}
        건
      </td>
    );
  };

  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
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
      }
      else if(item.controltype1 != "" && valid == true) {
        if(item.controltype1 == "B") {
          if(item.mngdata1 == "") {
            alert("관리항목값코드1을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype1 == "D") {
          if(parseInt(convertDateToStr(item.mngdata1).substring(0,4)) < 2000) {
            alert("관리항목값코드1을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype1 == "T") {
          if(item.mngdatanm1 == "") {
            alert("관리항목값이름1을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      }
      else if(item.controltype2 != "" && valid == true) {
        if(item.controltype2 == "B") {
          if(item.mngdata2 == "") {
            alert("관리항목값코드2을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype2 == "D") {
          if(parseInt(convertDateToStr(item.mngdata2).substring(0,4)) < 2000) {
            alert("관리항목값코드2을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype2 == "T") {
          if(item.mngdatanm2 == "") {
            alert("관리항목값이름2을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      }
      else if(item.controltype3 != "" && valid == true) {
        if(item.controltype3 == "B") {
          if(item.mngdata3 == "") {
            alert("관리항목값코드3을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype3 == "D") {
          if(parseInt(convertDateToStr(item.mngdata3).substring(0,4)) < 2000) {
            alert("관리항목값코드3을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype3 == "T") {
          if(item.mngdatanm3 == "") {
            alert("관리항목값이름3을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      }
      else if(item.controltype4 != "" && valid == true) {
        if(item.controltype4 == "B") {
          if(item.mngdata4 == "") {
            alert("관리항목값코드4을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype4 == "D") {
          if(parseInt(convertDateToStr(item.mngdata4).substring(0,4)) < 2000) {
            alert("관리항목값코드4을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype4 == "T") {
          if(item.mngdatanm4 == "") {
            alert("관리항목값이름4을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      }
      else if(item.controltype5 != "" && valid == true) {
        if(item.controltype5 == "B") {
          if(item.mngdata5 == "") {
            alert("관리항목값코드5을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype5 == "D") {
          if(parseInt(convertDateToStr(item.mngdata5).substring(0,4)) < 2000) {
            alert("관리항목값코드5을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype5 == "T") {
          if(item.mngdatanm5 == "") {
            alert("관리항목값이름5을 입력해주세요.");
            valid = false;
            return false;
          }
        }
      }
      else if(item.controltype6 != "" && valid == true) {
        if(item.controltype6 == "B") {
          if(item.mngdata6 == "") {
            alert("관리항목값코드6을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype6 == "D") {
          if(parseInt(convertDateToStr(item.mngdata6).substring(0,4)) < 2000) {
            alert("관리항목값코드6을 입력해주세요.");
            valid = false;
            return false;
          }
        } else if(item.controltype6== "T") {
          if(item.mngdatanm6 == "") {
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
            setData(mainDataResult.data, filters, deletedMainRows, worktype);
            deletedMainRows = [];
            if (worktype == "N") {
              onClose();
            }
          }
        }
      } catch (e) {
        alert(e);
      }
    }
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
    setEditIndex(dataItem[DATA_ITEM_KEY]);
    if (field) {
      setEditedField(field);
    }
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
        item[DATA_ITEM_KEY] === dataItem[DATA_ITEM_KEY]
          ? {
              ...item,
              rowstatus: item.rowstatus === "N" ? "N" : "U",
              [EDIT_FIELD]: field,
            }
          : {
              ...item,
              [EDIT_FIELD]: undefined,
            }
      );

      setIfSelectFirstRow(false);
      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    }
  };

  const exitEdit = () => {
    if (editedField !== "acntcd" && editedField !== "stdrmkcd") {
      const newData = mainDataResult.data.map((item) => ({
        ...item,
        slipamt_1: item.drcrdiv == "2" ? 0 : item.slipamt_1,
        slipamt_2: item.drcrdiv == "1" ? 0 : item.slipamt_2,
        [EDIT_FIELD]: undefined,
      }));
    
      setIfSelectFirstRow(false);

      setMainDataResult((prev) => {
        return {
          data: newData,
          total: prev.total,
        };
      });
    } else if (editedField == "stdrmkcd") {
      mainDataResult.data.map(async (item) => {
        if (editIndex === item.num) {
          const data = codeListData.find(
            (items: any) => items.stdrmkcd == item.stdrmkcd
          );
  
          if (data == undefined) {
            const newData = mainDataResult.data.map((item: any) =>
              item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
                ? {
                    ...item,
                    stdrmkcd: item.stdrmkcd,
                    stdrmknm: "",
                    acntcd: "",
                    acntnm: "",
                    [EDIT_FIELD]: undefined,
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
          } else {
            const data2 = acntListData.find(
              (items: any) => items.acntcd == data.acntcd
            );

            let datas: any;
            const select = mainDataResult.data.filter(
              (item) =>
                item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
            )[0];
            const parameters2: Iparameters = {
              procedureName: "P_AC_A1000W_Q",
              pageNumber: mainPgNum,
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
                item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
                  ? {
                      ...item,
                      acntcd: acntcd,
                      acntnm: acntnm,
                      stdrmkcd: stdrmkcd,
                      stdrmknm: stdrmknm,
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
                      rowstatus: item.rowstatus === "N" ? "N" : "U",
                      [EDIT_FIELD]: undefined,
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
            }
          }
        }
      });
    } else {
      mainDataResult.data.map(async (item) => {
        if (editIndex === item.num) {
          const data = acntListData.find(
            (items: any) => items.acntcd == item.acntcd
          );
          if (data == undefined) {
            const newData = mainDataResult.data.map((item: any) =>
              item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
                ? {
                    ...item,
                    acntcd: item.acntcd,
                    acntnm: "",
                    mngitemnm1: "",
                    mngitemnm2: "",
                    mngitemnm3: "",
                    mngitemnm4: "",
                    mngitemnm5: "",
                    mngitemnm6: "",
                    [EDIT_FIELD]: undefined,
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
          } else {
            let datas: any;
            const select = mainDataResult.data.filter(
              (item) =>
                item.num == parseInt(Object.getOwnPropertyNames(selectedState)[0])
            )[0];
            const parameters2: Iparameters = {
              procedureName: "P_AC_A1000W_Q",
              pageNumber: mainPgNum,
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
                      rowstatus: item.rowstatus === "N" ? "N" : "U",
                      [EDIT_FIELD]: undefined,
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
            }
          }
        }
      });
    }
  };

  const onAddClick = () => {
    let seq = mainDataResult.total + deletedMainRows.length + 1;
    const datas = mainDataResult.data[mainDataResult.data.length - 1];
    for (var i = 1; i < 3; i++) {
      const newDataItem = {
        [DATA_ITEM_KEY]: seq,
        ackey: filters.ackey,
        acntbaldiv: "",
        acntcd: "",
        acntcd2: "",
        acntchr: "",
        acntdt: convertDateToStr(filters.acntdt),
        acntnm: "",
        acntses: "",
        acseq1: 0,
        acseq2: seq,
        actdt: convertDateToStr(filters.actdt),
        alcchr: "",
        apperson: "",
        approvaldt: filters.approvaldt,
        attdatnum: "",
        autorecnum: "",
        bizregnum: chkyn == true ? datas.bizregnum : "",
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
        custcd: chkyn == true ? datas.custcd : "",
        custnm: chkyn == true ? datas.custnm : "",
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
        orgdiv: "01",
        partacnt: "",
        position: filters.position,
        propertykind: "",
        rate: 0,
        reason_intax_deduction: "",
        remark3: chkyn == true ? datas.remark3 : "",
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
      seq++;
    }
  };

  return (
    <>
      <Window
        title={
          worktype === "N"
            ? "대체전표생성"
            : worktype === "C"
            ? "대체전표복사"
            : "대체전표정보"
        }
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
      >
        <FormBoxWrap style={{ paddingRight: "50px" }}>
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
                    onChange={filterInputChange}
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
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="plus"
                      ></Button>
                      <Button
                        onClick={onDeleteClick}
                        fillMode="outline"
                        themeColor={"primary"}
                        icon="minus"
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
                      width="100px"
                      cell={CustomComboBoxCell}
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
                    />
                    <GridColumn
                      field="slipamt_2"
                      title="대변금액"
                      width="100px"
                      cell={NumberCell}
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
        <FormBoxWrap style={{ paddingRight: "50px" }}>
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
        />
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={filters.attdatnum}
        />
      )}
    </>
  );
};

export default CopyWindow;
