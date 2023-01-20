import {
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
} from "react";
import * as React from "react";
import { useSetRecoilState } from "recoil";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  Grid,
  GridColumn,
  GridEvent,
  GridCellProps,
  GridToolbar,
  GridSelectionChangeEvent,
  getSelectedState,
  GridHeaderSelectionChangeEvent,
  GridHeaderCellProps,
  GridDataStateChangeEvent,
} from "@progress/kendo-react-grid";
import CheckBoxReadOnlyCell from "../../components/Cells/CheckBoxReadOnlyCell";
import { getter } from "@progress/kendo-react-common";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { useApi } from "../../hooks/api";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInField,
  ButtonInFieldWrap,
  FieldWrap,
  GridContainer,
} from "../../CommonStyled";
import {
  Form,
  Field,
  FormElement,
  FieldArray,
  FieldArrayRenderProps,
  FormRenderProps,
  FieldWrapper,
  FieldRenderProps,
} from "@progress/kendo-react-form";
import { Error, Label } from "@progress/kendo-react-labels";
import {
  FormNumberCell,
  FormNameCell,
  FormInput,
  FormDatePicker,
  FormReadOnly,
  FormReadOnlyNumberCell,
  FormComboBoxCell,
  FormComboBox,
  FormCheckBox,
  FormCheckBoxReadOnlyCell,
  FormReadOnlyNameCell,
} from "../Editors";
import { Iparameters } from "../../store/types";
import {
  validator,
  checkIsDDLValid,
  chkScrollHandler,
  convertDateToStr,
  dateformat,
  getItemQuery,
  getQueryFromBizComponent,
  UseBizComponent,
  UseCustomOption,
  findMessage,
  UseMessages,
  setDefaultDate,
  getCodeFromValue,
  arrayLengthValidator,
  getUnpQuery,
} from "../CommonFunction";
import { Button } from "@progress/kendo-react-buttons";
import AttachmentsWindow from "./CommonWindows/AttachmentsWindow";
import CustomersWindow from "./CommonWindows/CustomersWindow";
import ItemsWindow from "./CommonWindows/ItemsWindow";
import {
  IAttachmentData,
  ICustData,
  IItemData,
  IWindowPosition,
} from "../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  EDIT_FIELD,
  FORM_DATA_INDEX,
  PAGE_SIZE,
  SELECTED_FIELD,
} from "../CommonString";
import { CellRender, RowRender } from "../Renderers";
import { tokenState, isLoading } from "../../store/atoms";
import { useRecoilState } from "recoil";
import { Input } from "@progress/kendo-react-inputs";
import RequiredHeader from "../RequiredHeader";
import { bytesToBase64 } from "byte-base64";
import CheckBoxCell from "../Cells/CheckBoxCell";
const DATA_ITEM_KEY = "user_id";
let deletedRows: object[] = [];
const idGetter = getter(FORM_DATA_INDEX);
type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: "U" | "N";
  datnum?: string;
  para?: Iparameters; //{};
};

type TDetailData = {
  rowstatus_s: string[];
  chk_s: string[];
  ordseq_s: string[];
  poregseq_s: string[];
  itemcd_s: string[];
  itemnm_s: string[];
  itemacnt_s: string[];
  insiz_s: string[];
  bnatur_s: string[];
  qty_s: string[];
  qtyunit_s: string[];
  totwgt_s: string[];
  wgtunit_s: string[];
  len_s: string[];
  totlen_s: string[];
  lenunit_s: string[];
  thickness_s: string[];
  width_s: string[];
  length_s: string[];
  unpcalmeth_s: string[];
  unp_s: string[];
  amt_s: string[];
  taxamt_s: string[];
  dlramt_s: string[];
  wonamt_s: string[];
  remark_s: string[];
  pac_s: string[];
  finyn_s: string[];
  specialunp_s: string[];
  lotnum_s: string[];
  dlvdt_s: string[];
  specialamt_s: string[];
  heatno_s: string[];
  bf_qty_s: string[];
};

export const unpContext = createContext<{
  orddt: string;
  setOrddt: (orddt: string) => void;
  unpList: [];
  getUnpList: (custcd: string) => void;
  changeUnpData: () => void;
}>({} as any);

export const gridContext = createContext<{
  changeGridData: () => void;
}>({} as any);

export const FormCustcdInput = (fieldRenderProps: FieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, onBlur, ...others } =
    fieldRenderProps;

  const { getUnpList, setOrddt, changeUnpData } = useContext(unpContext);

  const onHandleBlur = (e: any) => {
    const { value, name } = e.target;
    if (name === "custcd") {
      getUnpList(value);
      changeUnpData();
    } else if (name === "orddt") {
      setOrddt(value);
      changeUnpData();
    }
  };

  return (
    <FieldWrapper>
      <Label editorId={id} editorValid={valid}>
        {label}
      </Label>
      <div className={"k-form-field-wrap"}>
        <Input valid={valid} id={id} onBlur={onHandleBlur} {...others} />
      </div>
    </FieldWrapper>
  );
};

const FormGrid = (fieldArrayRenderProps: FieldArrayRenderProps) => {
  const { datnum } = fieldArrayRenderProps;
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const idGetter = getter(DATA_ITEM_KEY);
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [selectedState, setSelectedState] = useState<{
    [id: string]: boolean | number[];
  }>({});

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const subparameters: Iparameters = {
    procedureName: "P_CM_A0000W_Q",
    pageNumber: 0,
    pageSize: 1,
    parameters: {
      "@p_work_type": "LOAD",
      "@p_orgdiv": "01",
      "@p_datnum": datnum,
      "@p_dtgb": "",
      "@p_frdt": "",
      "@p_category": "",
      "@p_title": "",
      "@p_yn": "",
      "@p_attdatnum": "",
      "@p_userid": "",
      "@p_newDiv": "N",
    },
  };

  const fetchMainGrid = async () => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", subparameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;
 
      if (totalRowCnt > 0)
        setMainDataResult((prev) => {
          return {
            data: [...prev.data, ...rows],
            total: totalRowCnt,
          };
        });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };

  const [departmentsListData, setDepartmentsListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setPostcdListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_dptcd_001, L_HU005",
    setBizComponentData
  );

  useEffect(() => {
    fetchMainGrid();
  }, []);

  useEffect(() => {
    if (bizComponentData !== null) {
      const departmentQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_dptcd_001"
        )
      );
      const postcdQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_HU005")
      );
      fetchQuery(departmentQueryStr, setDepartmentsListData);
      fetchQuery(postcdQueryStr, setPostcdListData);
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

  return (
    <GridContainer>
      <Grid
        data={process(
          mainDataResult.data.map((row) => ({
            ...row,
            dptcd: departmentsListData.find(
              (item: any) => item.dptcd === row.dptcd
            )?.dptnm,
            postcd: postcdListData.find(
              (item: any) => item.sub_code === row.postcd
            )?.code_name,
            readok: row.readok == null ? "Y" : null,
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
        total={mainDataResult.total}
      >
        <GridColumn
          field="user_name"
          title="성명"
          width="100px"
          className="required"
        />
        <GridColumn field="dptcd" title="부서" width="140px" />
        <GridColumn field="postcd" title="직위" width="90px" />
        <GridColumn
          field="chooses"
          title="참조"
          width="60px"
          cell={CheckBoxReadOnlyCell}
        />
        <GridColumn
          field="loadok"
          title="확인"
          width="60px"
          cell={CheckBoxCell}
        />
        <GridColumn field="readok" title="열람" width="60px" />
      </Grid>
    </GridContainer>
  );
};

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  datnum,
  para,
}: TKendoWindow) => {
  const [token] = useRecoilState(tokenState);
  const { userId } = token;

  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 700,
  });

  const [unpList, setUnpList] = useState<any>([]);
  const [orddt, setOrddt] = useState("");

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
    getVisible(false);
  };

  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };
  //수정 없이 submit 가능하도록 임의 value를 change 시켜줌
  useEffect(() => {
    const valueChanged = document.getElementById("valueChanged");
    valueChanged!.click();
  }, [formKey]);
  const processApi = useApi();
  const [dataState, setDataState] = useState<State>({
    skip: 0,
    take: 20,
    //sort: [{ field: "customerID", dir: "asc" }],
    group: [{ field: "itemacnt" }],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], dataState)
  );
  const [detailDataResult, setDetailDataResult] = useState<DataResult>(
    process([], dataState)
  );

  const [custType, setCustType] = useState("");

  useEffect(() => {
    if (workType === "U") {
      fetchMain();
      //fetchGrid();
    }
  }, []);

  const [initialVal, setInitialVal] = useState({
    datnum: "",
    user_name: "",
    publish_yn: "",
    cbocategory: "",
    publish_start_date: new Date(),
    publish_end_date: new Date(),
    title: "",
    contents: "",
    attdatnum: "",
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    publishdate: new Date(),
    contents2: "",
    chooses_s: "",
    loadok_s: "",
    readok_s: "",
    cbodtgb: "C",
    radPublish_yn: "%",
  });

  useEffect(() => {
    if (customOptionData !== null && workType === "N") {
      setInitialVal((prev) => {
        return {
          ...prev,
          publish_start_date: setDefaultDate(
            customOptionData,
            "publish_start_date"
          ),
          publish_end_date: setDefaultDate(
            customOptionData,
            "publish_end_date"
          ),
          cbocategory: customOptionData.menuCustomDefaultOptions.query.find(
            (item: any) => item.id === "cbocategory"
          ).valueCode,
        };
      });
    }
  }, [customOptionData]);

  const parameters: Iparameters = {
    procedureName: "P_CM_A0000W_Q",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": "01",
      "@p_datnum": datnum,
      "@p_dtgb": initialVal.cbodtgb,
      "@p_frdt": convertDateToStr(initialVal.publish_start_date),
      "@p_category": initialVal.cbocategory,
      "@p_title": initialVal.title,
      "@p_yn": initialVal.radPublish_yn,
      "@p_attdatnum": "",
      "@p_userid": "admin",
      "@p_newDiv": "N",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const row = data.tables[0].Rows[0];

      setInitialVal((prev) => {
        return {
          ...prev,
          datnum: row.datnum,
          user_name: row.user_name,
          publish_yn: row.publish_yn,
          cbocategory: row.category,
          publish_start_date: new Date(dateformat(row.publish_start_date)),
          publish_end_date: new Date(dateformat(row.publish_end_date)),
          title: row.title,
          contents: row.contents,
          attdatnum: row.attdatnum,
          pgSize: PAGE_SIZE,
          orgdiv: row.orgdiv,
          publishdate: new Date(dateformat(row.publishdate)),
          contents2: row.contents2,
          chooses_s: row.chooses_s,
          loadok_s: row.loadok_s,
          readok_s: row.readok_s,
          cbodtgb: row.cbodtgb,
          radPublish_yn: row.radPublish_yn,
        };
      });
    }
  };

  useEffect(() => {
    //fetch된 데이터가 폼에 세팅되도록 하기 위해 적용
    resetForm();
  }, [initialVal]);

  //fetch된 그리드 데이터가 그리드 폼에 세팅되도록 하기 위해 적용
  useEffect(() => {
    resetForm();
  }, [detailDataResult]);

  //상세그리드 조회
  const fetchGrid = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setDetailDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt,
        };
      });

      //resetForm();
    }
  };
  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    service_id: "20190218001",
    orgdiv: "01",
    location: "01",
    datnum: "",
    poregnum: "",
    project: "",
    ordtype: "",
    ordsts: "",
    taxdiv: "",
    orddt: "",
    dlvdt: "",
    dptcd: "",
    person: "",
    amtunit: "",
    portnm: "",
    finaldes: "",
    paymeth: "",
    prcterms: "",
    custcd: "",
    custnm: "",
    rcvcustcd: "",
    rcvcustnm: "",
    wonchgrat: 0,
    uschgrat: 0,
    doexdiv: "",
    remark: "",
    attdatnum: "",
    userid: userId,
    pc: "WEB TEST",
    ship_method: "",
    dlv_method: "",
    hullno: "",
    rowstatus_s: "",
    chk_s: "",
    ordseq_s: "",
    poregseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    itemacnt_s: "",
    insiz_s: "",
    bnatur_s: "",
    qty_s: "",
    qtyunit_s: "",
    totwgt_s: "",
    wgtunit_s: "",
    len_s: "",
    totlen_s: "",
    lenunit_s: "",
    thickness_s: "",
    width_s: "",
    length_s: "",
    unpcalmeth_s: "",
    unp_s: "",
    amt_s: "",
    taxamt_s: "",
    dlramt_s: "",
    wonamt_s: "",
    remark_s: "",
    pac_s: "",
    finyn_s: "",
    specialunp_s: "",
    lotnum_s: "",
    dlvdt_s: "",
    specialamt_s: "",
    heatno_s: "",
    bf_qty_s: "",
    form_id: "",
  });

  //프로시저 파라미터
  const paraSaved: Iparameters = {
    procedureName: "P_SA_A2000W_S",
    pageNumber: 1,
    pageSize: 10,
    parameters: {
      "@p_work_type": paraData.work_type,
      "@p_service_id": paraData.service_id,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_datnum": paraData.datnum,
      "@p_poregnum": paraData.poregnum,
      "@p_project": paraData.project,
      "@p_ordtype": paraData.ordtype,
      "@p_ordsts": paraData.ordsts,
      "@p_taxdiv": paraData.taxdiv,
      "@p_orddt": paraData.orddt,
      "@p_dlvdt": paraData.dlvdt,
      "@p_dptcd": paraData.dptcd,
      "@p_person": paraData.person,
      "@p_amtunit": paraData.amtunit,
      "@p_portnm": paraData.portnm,
      "@p_finaldes": paraData.finaldes,
      "@p_paymeth": paraData.paymeth,
      "@p_prcterms": paraData.prcterms,
      "@p_custcd": paraData.custcd,
      "@p_custnm": paraData.custnm,
      "@p_rcvcustcd": paraData.rcvcustcd,
      "@p_rcvcustnm": paraData.rcvcustnm,
      "@p_wonchgrat": paraData.wonchgrat,
      "@p_uschgrat": paraData.uschgrat,
      "@p_doexdiv": paraData.doexdiv,
      "@p_remark": paraData.remark,
      "@p_attdatnum": paraData.attdatnum,
      "@p_userid": paraData.userid,
      "@p_pc": paraData.pc,
      "@p_ship_method": paraData.ship_method,
      "@p_dlv_method": paraData.dlv_method,
      "@p_hullno": paraData.hullno,
      "@p_rowstatus_s": paraData.rowstatus_s,
      "@p_chk_s": paraData.chk_s,
      "@p_ordseq_s": paraData.ordseq_s,
      "@p_poregseq_s": paraData.poregseq_s,
      "@p_itemcd_s": paraData.itemcd_s,
      "@p_itemnm_s": paraData.itemnm_s,
      "@p_itemacnt_s": paraData.itemacnt_s,
      "@p_insiz_s": paraData.insiz_s,
      "@p_bnatur_s": paraData.bnatur_s,
      "@p_qty_s": paraData.qty_s,
      "@p_qtyunit_s": paraData.qtyunit_s,
      "@p_totwgt_s": paraData.totwgt_s,
      "@p_wgtunit_s": paraData.wgtunit_s,
      "@p_len_s": paraData.len_s,
      "@p_totlen_s": paraData.totlen_s,
      "@p_lenunit_s": paraData.lenunit_s,
      "@p_thickness_s": paraData.thickness_s,
      "@p_width_s": paraData.width_s,
      "@p_length_s": paraData.length_s,
      "@p_unpcalmeth_s": paraData.unpcalmeth_s,
      "@p_unp_s": paraData.unp_s,
      "@p_amt_s": paraData.amt_s,
      "@p_taxamt_s": paraData.taxamt_s,
      "@p_dlramt_s": paraData.dlramt_s,
      "@p_wonamt_s": paraData.wonamt_s,
      "@p_remark_s": paraData.remark_s,
      "@p_pac_s": paraData.pac_s,
      "@p_finyn_s": paraData.finyn_s,
      "@p_specialunp_s": paraData.specialunp_s,
      "@p_lotnum_s": paraData.lotnum_s,
      "@p_dlvdt_s": paraData.dlvdt_s,
      "@p_specialamt_s": paraData.specialamt_s,
      "@p_heatno_s": paraData.heatno_s,
      "@p_bf_qty_s": paraData.bf_qty_s,
      "@p_form_id": paraData.form_id,
    },
  };

  //그리드 리셋
  const resetAllGrid = () => {
    setMainDataResult(process([], dataState));
    setDetailDataResult(process([], dataState));
  };

  const fetchGridSaved = async () => {
    let data: any;

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      alert(findMessage(messagesData, "SA_A2000W_003"));
      deletedRows = []; //초기화
      if (workType === "U") {
        resetAllGrid();

        reloadData("U");
        fetchMain();
        fetchGrid();
      } else {
        getVisible(false);
        reloadData("N");
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }

    paraData.work_type = ""; //초기화
  };

  const handleSubmit = (dataItem: { [name: string]: any }) => {
    //alert(JSON.stringify(dataItem));

    let valid = true;

    //검증
    try {
      dataItem.orderDetails.forEach((item: any) => {
        if (!!checkIsDDLValid(item.cbocategory)) {
          throw findMessage(messagesData, "SA_A2000W_004");
        }
      });
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) return false;

    const {
      location,
      datnum,
      poregnum,
      project,
      ordtype,
      ordsts,
      taxdiv,
      orddt,
      dlvdt,
      dptcd,
      person,
      amtunit,
      portnm,
      finaldes,
      paymeth,
      prcterms,
      custcd,
      custnm,
      rcvcustcd,
      rcvcustnm,
      wonchgrat,
      uschgrat,
      doexdiv,
      remark,
      attdatnum,
      ship_method,
      dlv_method,
      hullno,
      orderDetails,
    } = dataItem;

    let detailArr: TDetailData = {
      rowstatus_s: [],
      chk_s: [],
      ordseq_s: [],
      poregseq_s: [],
      itemcd_s: [],
      itemnm_s: [],
      itemacnt_s: [],
      insiz_s: [],
      bnatur_s: [],
      qty_s: [],
      qtyunit_s: [],
      totwgt_s: [],
      wgtunit_s: [],
      len_s: [],
      totlen_s: [],
      lenunit_s: [],
      thickness_s: [],
      width_s: [],
      length_s: [],
      unpcalmeth_s: [],
      unp_s: [],
      amt_s: [],
      taxamt_s: [],
      dlramt_s: [],
      wonamt_s: [],
      remark_s: [],
      pac_s: [],
      finyn_s: [],
      specialunp_s: [],
      lotnum_s: [],
      dlvdt_s: [],
      specialamt_s: [],
      heatno_s: [],
      bf_qty_s: [],
    };
    orderDetails.forEach((item: any) => {
      const {
        rowstatus,
        chk,
        ordseq,
        poregseq,
        itemcd,
        itemnm,
        itemacnt,
        insiz,
        bnatur,
        qty,
        qtyunit,
        totwgt,
        wgtunit,
        len,
        totlen,
        lenunit,
        thickness,
        width,
        length,
        unpcalmeth,
        unp,
        amt,
        taxamt,
        dlramt,
        wonamt,
        remark,
        pac,
        finyn,
        specialunp,
        lotnum,
        dlvdt,
        specialamt,
        heatno,
        bf_qty,
      } = item;

      detailArr.rowstatus_s.push("N");
      detailArr.chk_s.push(chk);
      detailArr.ordseq_s.push(ordseq);
      detailArr.poregseq_s.push(poregseq);
      detailArr.itemcd_s.push(itemcd);
      detailArr.itemnm_s.push(itemnm);
      detailArr.itemacnt_s.push(getCodeFromValue(itemacnt));
      detailArr.insiz_s.push(insiz);
      detailArr.bnatur_s.push(bnatur);
      detailArr.qty_s.push(qty);
      detailArr.qtyunit_s.push(getCodeFromValue(qtyunit));
      detailArr.totwgt_s.push(totwgt);
      detailArr.wgtunit_s.push(wgtunit);
      detailArr.len_s.push(len);
      detailArr.totlen_s.push(totlen);
      detailArr.lenunit_s.push(lenunit);
      detailArr.thickness_s.push(thickness);
      detailArr.width_s.push(width);
      detailArr.length_s.push(length);
      detailArr.unpcalmeth_s.push(unpcalmeth);
      detailArr.unp_s.push(unp);
      detailArr.amt_s.push(amt);
      detailArr.taxamt_s.push(taxamt);
      detailArr.dlramt_s.push(dlramt);
      detailArr.wonamt_s.push(wonamt);
      detailArr.remark_s.push(remark);
      detailArr.pac_s.push(pac);
      detailArr.finyn_s.push(finyn === true ? "Y" : "N");
      detailArr.specialunp_s.push(specialunp);
      detailArr.lotnum_s.push(lotnum);
      detailArr.dlvdt_s.push(dlvdt);
      detailArr.specialamt_s.push(specialamt);
      detailArr.heatno_s.push(heatno);
      detailArr.bf_qty_s.push(bf_qty);
    });

    deletedRows.forEach((item: any) => {
      const {
        rowstatus,
        chk,
        ordseq,
        poregseq,
        itemcd,
        itemnm,
        itemacnt,
        insiz,
        bnatur,
        qty,
        qtyunit,
        totwgt,
        wgtunit,
        len,
        totlen,
        lenunit,
        thickness,
        width,
        length,
        unpcalmeth,
        unp,
        amt,
        taxamt,
        dlramt,
        wonamt,
        remark,
        pac,
        finyn,
        specialunp,
        lotnum,
        dlvdt,
        specialamt,
        heatno,
        bf_qty,
      } = item;

      detailArr.rowstatus_s.push("D");
      detailArr.chk_s.push(chk);
      detailArr.ordseq_s.push(ordseq);
      detailArr.poregseq_s.push(poregseq);
      detailArr.itemcd_s.push(itemcd);
      detailArr.itemnm_s.push(itemnm);
      detailArr.itemacnt_s.push(getCodeFromValue(itemacnt));
      detailArr.insiz_s.push(insiz);
      detailArr.bnatur_s.push(bnatur);
      detailArr.qty_s.push(qty);
      detailArr.qtyunit_s.push(getCodeFromValue(qtyunit));
      detailArr.totwgt_s.push(totwgt);
      detailArr.wgtunit_s.push(wgtunit);
      detailArr.len_s.push(len);
      detailArr.totlen_s.push(totlen);
      detailArr.lenunit_s.push(lenunit);
      detailArr.thickness_s.push(thickness);
      detailArr.width_s.push(width);
      detailArr.length_s.push(length);
      detailArr.unpcalmeth_s.push(unpcalmeth);
      detailArr.unp_s.push(unp);
      detailArr.amt_s.push(amt);
      detailArr.taxamt_s.push(taxamt);
      detailArr.dlramt_s.push(dlramt);
      detailArr.wonamt_s.push(wonamt);
      detailArr.remark_s.push(remark);
      detailArr.pac_s.push(pac);
      detailArr.finyn_s.push(finyn);
      detailArr.specialunp_s.push(specialunp);
      detailArr.lotnum_s.push(lotnum);
      detailArr.dlvdt_s.push(dlvdt);
      detailArr.specialamt_s.push(specialamt);
      detailArr.heatno_s.push(heatno);
      detailArr.bf_qty_s.push(bf_qty);
    });

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      location: getCodeFromValue(location),
      //location: typeof location === "string" ? location : location.sub_code,
      datnum,
      poregnum,
      project,
      ordtype: getCodeFromValue(ordtype),
      ordsts: getCodeFromValue(ordsts),
      taxdiv: getCodeFromValue(taxdiv),
      orddt: convertDateToStr(orddt),
      dlvdt: convertDateToStr(dlvdt),
      dptcd: getCodeFromValue(dptcd, "dptcd"),
      person: getCodeFromValue(person, "user_id"),
      amtunit: getCodeFromValue(amtunit),
      portnm,
      finaldes: "",
      paymeth,
      prcterms,
      custcd,
      custnm,
      rcvcustcd,
      rcvcustnm,
      wonchgrat,
      uschgrat,
      doexdiv: getCodeFromValue(doexdiv),
      remark,
      attdatnum,
      ship_method,
      dlv_method,
      hullno: "",
      rowstatus_s: detailArr.rowstatus_s.join("|"), //"N|N",
      chk_s: detailArr.chk_s.join("|"),
      ordseq_s: detailArr.ordseq_s.join("|"),
      poregseq_s: detailArr.poregseq_s.join("|"),
      itemcd_s: detailArr.itemcd_s.join("|"),
      itemnm_s: detailArr.itemnm_s.join("|"),
      itemacnt_s: detailArr.itemacnt_s.join("|"),
      insiz_s: detailArr.insiz_s.join("|"),
      bnatur_s: detailArr.bnatur_s.join("|"),
      qty_s: detailArr.qty_s.join("|"),
      qtyunit_s: detailArr.qtyunit_s.join("|"),
      totwgt_s: detailArr.totwgt_s.join("|"),
      wgtunit_s: detailArr.wgtunit_s.join("|"),
      len_s: detailArr.len_s.join("|"),
      totlen_s: detailArr.totlen_s.join("|"),
      lenunit_s: detailArr.lenunit_s.join("|"),
      thickness_s: detailArr.thickness_s.join("|"),
      width_s: detailArr.width_s.join("|"),
      length_s: detailArr.length_s.join("|"),
      unpcalmeth_s: detailArr.unpcalmeth_s.join("|"),
      unp_s: detailArr.unp_s.join("|"),
      amt_s: detailArr.amt_s.join("|"),
      taxamt_s: detailArr.taxamt_s.join("|"),
      dlramt_s: detailArr.dlramt_s.join("|"),
      wonamt_s: detailArr.wonamt_s.join("|"),
      remark_s: detailArr.remark_s.join("|"),
      pac_s: detailArr.pac_s.join("|"),
      finyn_s: detailArr.finyn_s.join("|"),
      specialunp_s: detailArr.specialunp_s.join("|"),
      lotnum_s: detailArr.lotnum_s.join("|"),
      dlvdt_s: detailArr.dlvdt_s.join("|"),
      specialamt_s: detailArr.specialamt_s.join("|"),
      heatno_s: detailArr.heatno_s.join("|"),
      bf_qty_s: detailArr.bf_qty_s.join("|"),
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchGridSaved();
  }, [paraData]);

  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };

  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);

  const getAttachmentsData = (data: IAttachmentData) => {
    setInitialVal((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent("L_SYS007", setBizComponentData);

  useEffect(() => {
    if (workType === "U") {
      if (bizComponentData.length) {
        resetAllGrid();
        fetchGrid();
      }
    }
  }, [bizComponentData]);

  const fetchUnp = useCallback(async (custcd: string) => {
    if (custcd === "") return;
    let data: any;

    const queryStr = getUnpQuery(custcd);
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
      setUnpList(rows);
    }
  }, []);

  const getUnpList = (custcd: string) => {
    fetchUnp(custcd);
  };

  const { changeGridData } = useContext(gridContext);

  const changeUnpData = () => {
    console.log("양");
    changeGridData();
  };

  return (
    <Window
      title={workType === "N" ? "공지사항 생성" : "공지사항 수정"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      style={{ minWidth: "1500px" }}
    >
      <unpContext.Provider
        value={{ orddt, setOrddt, unpList, getUnpList, changeUnpData }}
      >
        <Form
          onSubmit={handleSubmit}
          key={formKey}
          initialValues={{
            rowstatus: "",
            cbocategory: initialVal.cbocategory,
            datnum: initialVal.datnum,
            user_name: initialVal.user_name,
            publish_yn: initialVal.publish_yn,
            publish_start_date: initialVal.publish_start_date,
            publish_end_date: initialVal.publish_end_date,
            title: initialVal.title,
            contents: initialVal.contents,
            attdatnum: initialVal.attdatnum,
          }}
          render={(formRenderProps: FormRenderProps) => (
            <FormElement>
              <fieldset
                style={{
                  display: "inline-block",
                  width: "60%",
                }}
                className={"k-form-fieldset"}
              >
                <button
                  id="valueChanged"
                  style={{ display: "none" }}
                  onClick={(e) => {
                    e.preventDefault(); // Changing desired field value
                    formRenderProps.onChange("valueChanged", {
                      value: "1",
                    });
                  }}
                ></button>
                <FieldWrap fieldWidth="45%">
                  <Field
                    name={"datnum"}
                    label={"문서번호"}
                    component={FormReadOnly}
                    validator={validator}
                    className="required"
                  />
                  <div style={{ width: "10%" }}></div>
                  <Field
                    name={"user_name"}
                    label={"담당자"}
                    component={FormReadOnly}
                    validator={validator}
                    className="required"
                  />
                </FieldWrap>
                <FieldWrap fieldWidth="45%">
                  {customOptionData !== null && (
                    <Field
                      name={"cbocategory"}
                      label={"카테고리"}
                      component={FormComboBox}
                      queryStr={
                        customOptionData.menuCustomDefaultOptions.query.find(
                          (item: any) => item.id === "cbocategory"
                        ).query
                      }
                      columns={
                        customOptionData.menuCustomDefaultOptions.query.find(
                          (item: any) => item.id === "cbocategory"
                        ).bizComponentItems
                      }
                      className="required"
                    />
                  )}
                  <div style={{ width: "10%" }}></div>
                  <Field
                    name={"publish_yn"}
                    label={"사용여부"}
                    component={FormCheckBox}
                  />
                </FieldWrap>
                <FieldWrap fieldWidth="45%">
                  <Field
                    name={"publish_start_date"}
                    label={"공지시작일"}
                    component={FormDatePicker}
                    className="required"
                  />
                  <div style={{ width: "10%" }}></div>
                  <Field
                    name={"publish_end_date"}
                    label={"공지종료일"}
                    component={FormDatePicker}
                    className="required"
                  />
                </FieldWrap>
                <Field
                  name={"title"}
                  label={"제목"}
                  component={FormInput}
                  className="required"
                />
                <Field
                  name={"contents"}
                  label={"내용"}
                  component={FormInput}
                  style={{ height: "200px" }}
                />
                <FieldWrap fieldWidth="100%">
                  <Field
                    name={"att"}
                    component={FormReadOnly}
                    label={"첨부파일"}
                  />
                  <ButtonInFieldWrap style={{ marginTop: "2%" }}>
                    <ButtonInField>
                      <Button
                        type={"button"}
                        onClick={onAttachmentsWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInField>
                  </ButtonInFieldWrap>
                </FieldWrap>
              </fieldset>
              <fieldset
                style={{
                  display: "inline-block",
                  marginLeft: "3%",
                  width: "37%",
                  float: "right",
                  height: "500px"
                }}
                className={"k-form-fieldset"}
              >
                <FieldArray
                  name="orderDetails"
                  dataItemKey={FORM_DATA_INDEX}
                  datnum={datnum}
                  component={FormGrid}
                  validator={arrayLengthValidator}
                />
              </fieldset>
              <BottomContainer>
                <ButtonContainer>
                  {workType === "N" ? (
                    <Button type={"submit"} themeColor={"primary"} icon="save">
                      생성
                    </Button>
                  ) : (
                    <Button type={"submit"} themeColor={"primary"} icon="save">
                      수정
                    </Button>
                  )}
                </ButtonContainer>
              </BottomContainer>
            </FormElement>
          )}
        />
      </unpContext.Provider>
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          getVisible={setAttachmentsWindowVisible}
          getData={getAttachmentsData}
          para={initialVal.attdatnum}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
