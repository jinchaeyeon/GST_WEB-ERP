import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
import { bytesToBase64 } from "byte-base64";
import { useCallback, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  UseParaPc,
  getQueryFromBizComponent,
  numberWithCommas3,
} from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE } from "../CommonString";

type IWindow = {
  setVisible(t: boolean): void;
  filters: any;
  item: any;
  save?: boolean;
  modal?: boolean;
};

type TdataArr = {
  rowstatus_s: string[];
  seq_s: string[];
  itemcd_s: string[];
  injectcnt_s: string[];
  injectcycle_s: string[];
  maleqty_s: string[];
  femaleqty_s: string[];
  totqty_s: string[];
  sampleqty_s: string[];
  urineqty_s: string[];
  tkqty_s: string[];
  experimentqty_s: string[];
  autopsyqty_s: string[];
  spareqty_s: string[];
  recoverqty_s: string[];
  cageqty_s: string[];
  rackqty_s: string[];
  infusionqty_s: string[];
  infusiontime_s: string[];
  point_s: string[];
  capacity_s: string[];
  geomcheqty_s: string[];
  geomcheprodqty_s: string[];
  infusioncount_s: string[];
  testcnt_s: string[];
  strainqty_s: string[];
  matterqty_s: string[];
  affiliationqty_s: string[];
  plateqty_s: string[];
  cellqty_s: string[];
  virusqty_s: string[];
  runtime_s: string[];
  gunqty_s: string[];
  concentrationcnt_s: string[];
  one_week_s: string[];
  two_week_s: string[];
  one_twoweek_s: string[];
  guaranteeperiod_s: string[];
  testperiod_s: string[];
  refineperiod_s: string[];
  autopsyperiod_s: string[];
  recoverweek_s: string[];
  recoverday_s: string[];
  genderyn_s: string[];
  breedmeth_s: string[];
  cagetype_s: string[];
  prodmac_s: string[];
  assaytype_s: string[];
  assaytype1_s: string[];
  assaytype2_s: string[];

  chlditemcd_s: string[];
  column_itemcd_s: string[];
  column_itemnm_s: string[];
  gubun_s: string[];
  remark_s: string[];
  qty_s: string[];
  optioncd_s: string[];
  bonyn_s: string[];
  pointqty_s: string[];
  chasu_s: string[];
  chasuspace_s: string[];
  amt_s: string[];
  ref_key_s: string[];
};

const CopyWindow = ({
  setVisible,
  filters,
  item,
  save = false,
  modal = false,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const userId = UseGetValueFromSessionItem("user_id");
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 900,
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

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA171, L_BA173, L_BA174, L_BA008_603",
    setBizComponentData
  );

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [itemlvl3ListData, setItemlvl3ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [injectrouteListData, setInjectrouteListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [injectcycleListData, setInjectcycleListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA171")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA173")
      );
      const injectrouteQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA174")
      );
      const injectcycleQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId == "L_BA008_603"
        )
      );
      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
      fetchQuery(itemlvl3QueryStr, setItemlvl3ListData);
      fetchQuery(injectrouteQueryStr, setInjectrouteListData);
      fetchQuery(injectcycleQueryStr, setInjectcycleListData);
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

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SA_A1000_603W_Q",
      pageNumber: 1,
      pageSize: PAGE_SIZE,
      parameters: {
        "@p_work_type": "POPUP",
        "@p_orgdiv": filters.orgdiv,
        "@p_location":
          filters.location == undefined ? sessionOrgdiv : filters.location,
        "@p_custcd":
          filters.custnm == "" || filters.custnm == undefined
            ? ""
            : filters.custcd,
        "@p_custnm": filters.custnm == undefined ? "" : filters.custnm,
        "@p_finyn": filters.finyn == undefined ? "" : filters.finyn,
        "@p_quotype": filters.quotype == undefined ? "" : filters.quotype,
        "@p_materialtype":
          filters.materialtype == undefined ? "" : filters.materialtype,
        "@p_quonum": item.quonum,
        "@p_quorev": item.quorev,
        "@p_quoseq": item.quoseq,
        "@p_status": "",
        "@p_extra_field2": "",
        "@p_smperson": "",
        "@p_smpersonnm": "",
        "@p_frdt": "",
        "@p_todt": "",
        "@p_in_frdt": "",
        "@p_in_todt": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].RowCount;
      const totalRowCnt2 = data.tables[1].RowCount;
      const totalRowCnt3 = data.tables[2].RowCount;
      const totalRowCnt4 = data.tables[3].RowCount;
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[2].Rows;
      const rows4 = data.tables[3].Rows;

      if (totalRowCnt > 0) {
        setInformation((prev) => ({
          ...prev,
          orgdiv: rows[0].orgdiv,
          quonum: rows[0].quonum,
          quorev: rows[0].quorev,
          quoseq: rows[0].quoseq,
          quotestnum: rows[0].quotestnum,
          itemlvl1: rows[0].itemlvl1,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          orgdiv: rows[0].orgdiv,
          quonum: rows[0].quonum,
          quorev: rows[0].quorev,
          quoseq: rows[0].quoseq,
          quotestnum: rows[0].quotestnum,
          itemlvl1: rows[0].itemlvl1,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
        }));
      }
      if (totalRowCnt2 > 0) {
        setInformation((prev) => ({
          ...prev,
          rowstatus_base: "U",
          seq_base: rows2[0].seq,
          injectroute_base: rows2[0].injectroute,
          teststs_base: rows2[0].teststs,
          chlditemcd_base: rows2[0].chlditemcd,
          injectcnt_base: rows2[0].injectcnt,
          injectcycle_base: rows2[0].injectcycle,
          chasu_base: rows2[0].chasu,
          testperiod_base: rows2[0].testperiod,
          experiment_week_base: rows2[0].experiment_week,
          totqty_base: rows2[0].totqty,
          experimentqty_base: rows2[0].experimentqty,
          spareqty_base: rows2[0].spareqty,
          maleqty_base: rows2[0].maleqty,
          femaleqty_base: rows2[0].femaleqty,
          chasuspace_base: rows2[0].chasuspace,
          geomcheqty_base: rows2[0].geomcheqty,
          geomcheprodqty_base: rows2[0].geomcheprodqty,
          totgeomche_base: rows2[0].totgeomche,
          remark_base: rows2[0].remark,
          point_base: rows2[0].point,
          strainqty_base: rows2[0].strainqty,
          affiliationqty_base: rows2[0].affiliationqty,
          capacity_base: rows2[0].capacity,
          plateqty_base: rows2[0].plateqty,
          cellqty_base: rows2[0].cellqty,
          virusqty_base: rows2[0].virusqty,
          prodmac_base: rows2[0].prodmac,
          matterqty_base: rows2[0].matterqty,
          runtime_base: rows2[0].runtime,
          assaytype_base: rows2[0].assaytype,
          column_itemcd_base: rows2[0].column_itemcd,
          column_itemnm_base: rows2[0].column_itemnm,
          refineperiod_base: rows2[0].refineperiod,
          tkqty_base: rows2[0].tkqty,
          gunqty_base: rows2[0].gunqty,
          genderyn_base: rows2[0].genderyn,
          breedmeth_base: rows2[0].breedmeth,
          cagetype_base: rows2[0].cagetype,
          ref_key_base: rows2[0].ref_key,
          concentrationcnt_base: rows2[0].concentrationcnt,
          assaytype1_base: rows2[0].assaytype1,
          assaytype2_base: rows2[0].assaytype2,
          sampleqty_base: rows2[0].sampleqty,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          rowstatus_base: "U",
          seq_base: rows2[0].seq,
          injectroute_base: rows2[0].injectroute,
          teststs_base: rows2[0].teststs,
          chlditemcd_base: rows2[0].chlditemcd,
          injectcnt_base: rows2[0].injectcnt,
          injectcycle_base: rows2[0].injectcycle,
          chasu_base: rows2[0].chasu,
          testperiod_base: rows2[0].testperiod,
          experiment_week_base: rows2[0].experiment_week,
          totqty_base: rows2[0].totqty,
          experimentqty_base: rows2[0].experimentqty,
          spareqty_base: rows2[0].spareqty,
          maleqty_base: rows2[0].maleqty,
          femaleqty_base: rows2[0].femaleqty,
          chasuspace_base: rows2[0].chasuspace,
          geomcheqty_base: rows2[0].geomcheqty,
          geomcheprodqty_base: rows2[0].geomcheprodqty,
          totgeomche_base: rows2[0].totgeomche,
          remark_base: rows2[0].remark,
          point_base: rows2[0].point,
          strainqty_base: rows2[0].strainqty,
          affiliationqty_base: rows2[0].affiliationqty,
          capacity_base: rows2[0].capacity,
          plateqty_base: rows2[0].plateqty,
          cellqty_base: rows2[0].cellqty,
          virusqty_base: rows2[0].virusqty,
          prodmac_base: rows2[0].prodmac,
          matterqty_base: rows2[0].matterqty,
          runtime_base: rows2[0].runtime,
          assaytype_base: rows2[0].assaytype,
          column_itemcd_base: rows2[0].column_itemcd,
          column_itemnm_base: rows2[0].column_itemnm,
          refineperiod_base: rows2[0].refineperiod,
          tkqty_base: rows2[0].tkqty,
          gunqty_base: rows2[0].gunqty,
          genderyn_base: rows2[0].genderyn,
          breedmeth_base: rows2[0].breedmeth,
          cagetype_base: rows2[0].cagetype,
          ref_key_base: rows2[0].ref_key,
          concentrationcnt_base: rows2[0].concentrationcnt,
          assaytype1_base: rows2[0].assaytype1,
          assaytype2_base: rows2[0].assaytype2,
          sampleqty_base: rows2[0].sampleqty,
        }));
      }

      if (totalRowCnt3 > 0) {
        setInformation((prev) => ({
          ...prev,
          rowstatus_ex: rows3[0].yn == "Y" ? "U" : "N",
          seq_ex: rows3[0].seq,
          yn_ex: rows3[0].yn == "Y" ? true : false,
          recoverday_ex: rows3[0].recoverday,
          experiment_week_ex: rows3[0].experiment_week,
          recoverqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          geomcheqty_ex: rows3[0].geomcheqty,
          geomcheprodqty_ex: rows3[0].geomcheprodqty,
          totgeomche_ex: rows3[0].totgeomche,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          totqty_ex: rows3[0].totqty,
          recoverweek_ex: rows3[0].recoverweek,
          gunqty_ex: rows3[0].gunqty,
          chasu_ex: rows3[0].chasu,
          testperiod_ex: rows3[0].testperiod,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          rowstatus_ex: rows3[0].yn == "Y" ? "U" : "N",
          seq_ex: rows3[0].seq,
          yn_ex: rows3[0].yn == "Y" ? true : false,
          recoverday_ex: rows3[0].recoverday,
          experiment_week_ex: rows3[0].experiment_week,
          recoverqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          geomcheqty_ex: rows3[0].geomcheqty,
          geomcheprodqty_ex: rows3[0].geomcheprodqty,
          totgeomche_ex: rows3[0].totgeomche,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          totqty_ex: rows3[0].totqty,
          recoverweek_ex: rows3[0].recoverweek,
          gunqty_ex: rows3[0].gunqty,
          chasu_ex: rows3[0].chasu,
          testperiod_ex: rows3[0].testperiod,
        }));
      }

      if (totalRowCnt4 > 0) {
        setInformation((prev) => ({
          ...prev,
          rowstatus_tk: rows4[0].yn == "Y" ? "U" : "N",
          seq_tk: rows4[0].seq,
          yn_tk: rows4[0].yn == "Y" ? true : false,
          bonyn_tk: rows4[0].bonyn == "Y" ? true : false,
          totqty_tk: rows4[0].totqty,
          experimentqty_tk: rows4[0].experimentqty,
          sampleqty_tk: rows4[0].sampleqty,
          maleqty_tk: rows4[0].maleqty,
          femaleqty_tk: rows4[0].femaleqty,
          spareqty_tk: rows4[0].spareqty,
          testcnt_tk: rows4[0].testcnt,
          point_tk: rows4[0].point,
          pointqty_tk: rows4[0].pointqty,
          remark_tk: rows4[0].remark,
          refineperiod_tk: rows4[0].refineperiod,
          tkqty_tk: rows4[0].tkqty,
          gunqty_tk: rows4[0].gunqty,
          chasu_tk: rows4[0].chasu,
          geomcheqty_tk: rows4[0].geomcheqty,
          geomcheprodqty_tk: rows4[0].geomcheprodqty,
          testperiod_tk: rows4[0].testperiod,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          rowstatus_tk: rows4[0].yn == "Y" ? "U" : "N",
          seq_tk: rows4[0].seq,
          yn_tk: rows4[0].yn == "Y" ? true : false,
          bonyn_tk: rows4[0].bonyn == "Y" ? true : false,
          totqty_tk: rows4[0].totqty,
          experimentqty_tk: rows4[0].experimentqty,
          sampleqty_tk: rows4[0].sampleqty,
          maleqty_tk: rows4[0].maleqty,
          femaleqty_tk: rows4[0].femaleqty,
          spareqty_tk: rows4[0].spareqty,
          testcnt_tk: rows4[0].testcnt,
          point_tk: rows4[0].point,
          pointqty_tk: rows4[0].pointqty,
          remark_tk: rows4[0].remark,
          refineperiod_tk: rows4[0].refineperiod,
          tkqty_tk: rows4[0].tkqty,
          gunqty_tk: rows4[0].gunqty,
          chasu_tk: rows4[0].chasu,
          geomcheqty_tk: rows4[0].geomcheqty,
          geomcheprodqty_tk: rows4[0].geomcheprodqty,
          testperiod_tk: rows4[0].testperiod,
        }));
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (bizComponentData !== null) {
      fetchMainGrid();
    }
  }, [bizComponentData]);

  const [Information, setInformation] = useState({
    orgdiv: "",
    quonum: "",
    quorev: "01",
    quoseq: "01",
    quotestnum: "",
    itemlvl1: "",
    itemcd: "",
    itemnm: "",
    //기본
    rowstatus_base: "N",
    seq_base: 0,
    injectroute_base: "",
    teststs_base: "",
    chlditemcd_base: "",
    injectcnt_base: 0,
    injectcycle_base: "",
    chasu_base: 0,
    testperiod_base: 0,
    experiment_week_base: 0,
    totqty_base: 0,
    experimentqty_base: 0,
    spareqty_base: 0,
    maleqty_base: 0,
    femaleqty_base: 0,
    chasuspace_base: 0,
    geomcheqty_base: 0,
    geomcheprodqty_base: 0,
    totgeomche_base: 0,
    remark_base: "",
    point_base: 0,
    strainqty_base: 0,
    matterqty_base: 0,
    affiliationqty_base: 0,
    capacity_base: 0,
    plateqty_base: 0,
    cellqty_base: 0,
    virusqty_base: 0,
    prodmac_base: "",
    runtime_base: 0,
    assaytype_base: "",
    column_itemcd_base: "",
    column_itemnm_base: "",
    refineperiod_base: 0,
    tkqty_base: 0,
    gunqty_base: 0,
    genderyn_base: "",
    breedmeth_base: "",
    cagetype_base: "",
    ref_key_base: "",
    concentrationcnt_base: 0,
    assaytype1_base: 0,
    assaytype2_base: 0,
    sampleqty_base: 0,

    //회복
    rowstatus_ex: "N",
    seq_ex: 0,
    yn_ex: false,
    recoverday_ex: 0,
    experiment_week_ex: 0,
    recoverqty_ex: 0,
    experimentqty_ex: 0,
    spareqty_ex: 0,
    maleqty_ex: 0,
    femaleqty_ex: 0,
    geomcheqty_ex: 0,
    geomcheprodqty_ex: 0,
    totgeomche_ex: 0,
    remark_ex: "",
    refineperiod_ex: 0,
    totqty_ex: 0,
    recoverweek_ex: 0,
    gunqty_ex: 0,
    chasu_ex: 0,
    testperiod_ex: 0,

    //TK
    rowstatus_tk: "N",
    seq_tk: 0,
    yn_tk: false,
    bonyn_tk: false,
    testcnt_tk: 0,
    point_tk: 0,
    pointqty_tk: 0,
    totqty_tk: 0,
    experimentqty_tk: 0,
    sampleqty_tk: 0,
    maleqty_tk: 0,
    femaleqty_tk: 0,
    spareqty_tk: 0,
    remark_tk: "",
    refineperiod_tk: 0,
    tkqty_tk: 0,
    gunqty_tk: 0,
    chasu_tk: 0,
    geomcheqty_tk: 0,
    geomcheprodqty_tk: 0,
    testperiod_tk: 0,
  });

  const [Information_ori, setInformation_ori] = useState({
    orgdiv: "",
    quonum: "",
    quorev: "01",
    quoseq: "01",
    quotestnum: "",
    itemlvl1: "",
    itemcd: "",
    itemnm: "",
    //기본
    rowstatus_base: "N",
    seq_base: 0,
    injectroute_base: "",
    teststs_base: "",
    chlditemcd_base: "",
    injectcnt_base: 0,
    injectcycle_base: "",
    chasu_base: 0,
    testperiod_base: 0,
    experiment_week_base: 0,
    totqty_base: 0,
    experimentqty_base: 0,
    spareqty_base: 0,
    maleqty_base: 0,
    femaleqty_base: 0,
    chasuspace_base: 0,
    geomcheqty_base: 0,
    geomcheprodqty_base: 0,
    totgeomche_base: 0,
    remark_base: "",
    point_base: 0,
    strainqty_base: 0,
    matterqty_base: 0,
    affiliationqty_base: 0,
    capacity_base: 0,
    plateqty_base: 0,
    cellqty_base: 0,
    virusqty_base: 0,
    prodmac_base: "",
    runtime_base: 0,
    assaytype_base: "",
    column_itemcd_base: "",
    column_itemnm_base: "",
    refineperiod_base: 0,
    tkqty_base: 0,
    gunqty_base: 0,
    genderyn_base: "",
    breedmeth_base: "",
    cagetype_base: "",
    ref_key_base: "",
    concentrationcnt_base: 0,
    assaytype1_base: 0,
    assaytype2_base: 0,
    sampleqty_base: 0,
    //회복
    rowstatus_ex: "N",
    seq_ex: 0,
    yn_ex: false,
    recoverday_ex: 0,
    experiment_week_ex: 0,
    recoverqty_ex: 0,
    experimentqty_ex: 0,
    spareqty_ex: 0,
    maleqty_ex: 0,
    femaleqty_ex: 0,
    geomcheqty_ex: 0,
    geomcheprodqty_ex: 0,
    totgeomche_ex: 0,
    remark_ex: "",
    refineperiod_ex: 0,
    totqty_ex: 0,
    recoverweek_ex: 0,
    gunqty_ex: 0,
    chasu_ex: 0,
    testperiod_ex: 0,

    //TK
    rowstatus_tk: "N",
    seq_tk: 0,
    yn_tk: false,
    bonyn_tk: false,
    testcnt_tk: 0,
    point_tk: 0,
    pointqty_tk: 0,
    totqty_tk: 0,
    experimentqty_tk: 0,
    sampleqty_tk: 0,
    maleqty_tk: 0,
    femaleqty_tk: 0,
    spareqty_tk: 0,
    remark_tk: "",
    refineperiod_tk: 0,
    tkqty_tk: 0,
    gunqty_tk: 0,
    chasu_tk: 0,
    geomcheqty_tk: 0,
    geomcheprodqty_tk: 0,
    testperiod_tk: 0,
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "yn_ex") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        rowstatus_ex:
          value == false
            ? Information_ori.rowstatus_ex == "U"
              ? "D"
              : Information_ori.rowstatus_ex
            : Information_ori.rowstatus_ex == "U"
            ? "U"
            : "N",
        seq_ex: Information_ori.seq_ex,
        recoverday_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.recoverday_ex,
        recoverqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.recoverqty_ex,
        experimentqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.experimentqty_ex,
        spareqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.spareqty_ex,
        maleqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.maleqty_ex,
        femaleqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.femaleqty_ex,
        geomcheqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.geomcheqty_ex,
        geomcheprodqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.geomcheprodqty_ex,
        refineperiod_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.refineperiod_ex,
        remark_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? ""
            : Information_ori.remark_ex,
      }));
    } else if (name == "yn_tk") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        rowstatus_tk:
          value == false
            ? Information_ori.rowstatus_tk == "U"
              ? "D"
              : Information_ori.rowstatus_tk
            : Information_ori.rowstatus_tk == "U"
            ? "U"
            : "N",
        seq_tk: Information_ori.seq_tk,
        testcnt_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.testcnt_tk,
        point_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.point_tk,
        pointqty_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.pointqty_tk,
        totqty_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.totqty_tk,
        experimentqty_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.experimentqty_tk,
        sampleqty_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.sampleqty_tk,
        maleqty_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.maleqty_tk,
        femaleqty_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.femaleqty_tk,
        spareqty_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.spareqty_tk,
        refineperiod_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? 0
            : Information_ori.refineperiod_tk,
        remark_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? ""
            : Information_ori.remark_tk,
        bonyn_tk:
          value == false && Information_ori.rowstatus_tk == "U"
            ? false
            : Information_ori.bonyn_tk,
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSave = async () => {
    let dataArr: TdataArr = {
      rowstatus_s: [],
      seq_s: [],
      itemcd_s: [],
      injectcnt_s: [],
      injectcycle_s: [],
      maleqty_s: [],
      femaleqty_s: [],
      totqty_s: [],
      sampleqty_s: [],
      urineqty_s: [],
      tkqty_s: [],
      experimentqty_s: [],
      autopsyqty_s: [],
      spareqty_s: [],
      recoverqty_s: [],
      cageqty_s: [],
      rackqty_s: [],
      infusionqty_s: [],
      infusiontime_s: [],
      point_s: [],
      capacity_s: [],
      geomcheqty_s: [],
      geomcheprodqty_s: [],
      infusioncount_s: [],
      testcnt_s: [],
      strainqty_s: [],
      matterqty_s: [],
      affiliationqty_s: [],
      plateqty_s: [],
      cellqty_s: [],
      virusqty_s: [],
      runtime_s: [],
      gunqty_s: [],
      concentrationcnt_s: [],
      one_week_s: [],
      two_week_s: [],
      one_twoweek_s: [],
      guaranteeperiod_s: [],
      testperiod_s: [],
      refineperiod_s: [],
      autopsyperiod_s: [],
      recoverweek_s: [],
      recoverday_s: [],
      genderyn_s: [],
      breedmeth_s: [],
      cagetype_s: [],
      prodmac_s: [],
      assaytype_s: [],
      assaytype1_s: [],
      assaytype2_s: [],

      chlditemcd_s: [],
      column_itemcd_s: [],
      column_itemnm_s: [],
      gubun_s: [],
      remark_s: [],
      qty_s: [],
      optioncd_s: [],
      bonyn_s: [],
      pointqty_s: [],
      chasu_s: [],
      chasuspace_s: [],
      amt_s: [],
      ref_key_s: [],
    };

    //기본
    dataArr.rowstatus_s.push(Information.rowstatus_base);
    dataArr.seq_s.push(Information.seq_base.toString());
    dataArr.itemcd_s.push(Information.itemcd);
    dataArr.injectcnt_s.push(Information.injectcnt_base.toString());
    dataArr.injectcycle_s.push(Information.injectcycle_base);
    dataArr.maleqty_s.push(Information.maleqty_base.toString());
    dataArr.femaleqty_s.push(Information.femaleqty_base.toString());
    dataArr.totqty_s.push(Information.totqty_base.toString());
    dataArr.sampleqty_s.push(Information.sampleqty_base.toString());
    dataArr.urineqty_s.push("0");
    dataArr.tkqty_s.push(Information.tkqty_base.toString());
    dataArr.experimentqty_s.push(Information.experimentqty_base.toString());
    dataArr.autopsyqty_s.push("0");
    dataArr.spareqty_s.push(Information.spareqty_base.toString());
    dataArr.recoverqty_s.push("0");
    dataArr.cageqty_s.push("0");
    dataArr.rackqty_s.push("0");
    dataArr.infusionqty_s.push("0");
    dataArr.infusiontime_s.push("0");
    dataArr.point_s.push(Information.point_base.toString());
    dataArr.capacity_s.push(Information.capacity_base.toString());
    dataArr.geomcheqty_s.push(Information.geomcheqty_base.toString());
    dataArr.geomcheprodqty_s.push(Information.geomcheprodqty_base.toString());
    dataArr.infusioncount_s.push("0");
    dataArr.testcnt_s.push("0");
    dataArr.strainqty_s.push(Information.strainqty_base.toString());
    dataArr.matterqty_s.push(Information.matterqty_base.toString());
    dataArr.affiliationqty_s.push(Information.affiliationqty_base.toString());
    dataArr.plateqty_s.push(Information.plateqty_base.toString());
    dataArr.cellqty_s.push(Information.cellqty_base.toString());
    dataArr.virusqty_s.push(Information.virusqty_base.toString());
    dataArr.runtime_s.push(Information.runtime_base.toString());
    dataArr.gunqty_s.push(Information.gunqty_base.toString());
    dataArr.concentrationcnt_s.push(
      Information.concentrationcnt_base.toString()
    );
    dataArr.one_week_s.push("0");
    dataArr.two_week_s.push("0");
    dataArr.one_twoweek_s.push("0");
    dataArr.guaranteeperiod_s.push("0");
    dataArr.testperiod_s.push(Information.testperiod_base.toString());
    dataArr.refineperiod_s.push(Information.refineperiod_base.toString());
    dataArr.autopsyperiod_s.push("0");
    dataArr.recoverweek_s.push("0");
    dataArr.recoverday_s.push("0");
    dataArr.genderyn_s.push(Information.genderyn_base);
    dataArr.breedmeth_s.push(Information.breedmeth_base);
    dataArr.cagetype_s.push(Information.cagetype_base);
    dataArr.prodmac_s.push(Information.prodmac_base);
    dataArr.assaytype_s.push(Information.assaytype_base);
    dataArr.assaytype1_s.push(Information.assaytype1_base.toString());
    dataArr.assaytype2_s.push(Information.assaytype2_base.toString());

    dataArr.chlditemcd_s.push(Information.chlditemcd_base);
    dataArr.column_itemcd_s.push(Information.column_itemcd_base);
    dataArr.column_itemnm_s.push(Information.column_itemnm_base);
    dataArr.gubun_s.push("B");
    dataArr.remark_s.push(Information.remark_base);
    dataArr.qty_s.push("0");
    dataArr.optioncd_s.push("");
    dataArr.bonyn_s.push("");
    dataArr.pointqty_s.push("0");
    dataArr.chasu_s.push(Information.chasu_base.toString());
    dataArr.chasuspace_s.push(Information.chasuspace_base.toString());
    dataArr.amt_s.push("0");
    dataArr.ref_key_s.push(Information.ref_key_base);

    //회복
    dataArr.rowstatus_s.push(
      Information.yn_ex == false && Information.rowstatus_ex == "N"
        ? ""
        : Information.rowstatus_ex
    );
    dataArr.seq_s.push(
      Information.rowstatus_ex == "D" ? "" : Information.seq_ex.toString()
    );
    dataArr.itemcd_s.push(Information.itemcd);
    dataArr.injectcnt_s.push(Information.injectcnt_base.toString());
    dataArr.injectcycle_s.push(Information.injectcycle_base);
    dataArr.maleqty_s.push(Information.maleqty_ex.toString());
    dataArr.femaleqty_s.push(Information.femaleqty_ex.toString());
    dataArr.totqty_s.push(Information.totqty_ex.toString());
    dataArr.sampleqty_s.push("0");
    dataArr.urineqty_s.push("0");
    dataArr.tkqty_s.push("0");
    dataArr.experimentqty_s.push(Information.experimentqty_ex.toString());
    dataArr.autopsyqty_s.push("0");
    dataArr.spareqty_s.push(Information.spareqty_ex.toString());
    dataArr.recoverqty_s.push(Information.recoverqty_ex.toString());
    dataArr.cageqty_s.push("0");
    dataArr.rackqty_s.push("0");
    dataArr.infusionqty_s.push("0");
    dataArr.infusiontime_s.push("0");
    dataArr.point_s.push("0");
    dataArr.capacity_s.push("0");
    dataArr.geomcheqty_s.push(Information.geomcheqty_ex.toString());
    dataArr.geomcheprodqty_s.push(Information.geomcheprodqty_ex.toString());
    dataArr.infusioncount_s.push("0");
    dataArr.testcnt_s.push("0");
    dataArr.strainqty_s.push("0");
    dataArr.matterqty_s.push("0");
    dataArr.affiliationqty_s.push("0");
    dataArr.plateqty_s.push("0");
    dataArr.cellqty_s.push("0");
    dataArr.virusqty_s.push("0");
    dataArr.runtime_s.push("0");
    dataArr.gunqty_s.push(Information.gunqty_ex.toString());
    dataArr.concentrationcnt_s.push("0");
    dataArr.one_week_s.push("0");
    dataArr.two_week_s.push("0");
    dataArr.one_twoweek_s.push("0");
    dataArr.guaranteeperiod_s.push("0");
    dataArr.testperiod_s.push(Information.testperiod_ex.toString());
    dataArr.refineperiod_s.push(Information.refineperiod_ex.toString());
    dataArr.autopsyperiod_s.push("0");
    dataArr.recoverweek_s.push(Information.recoverweek_ex.toString());
    dataArr.recoverday_s.push(Information.recoverday_ex.toString());
    dataArr.genderyn_s.push("");
    dataArr.breedmeth_s.push("");
    dataArr.cagetype_s.push("");
    dataArr.prodmac_s.push("");
    dataArr.assaytype_s.push("");
    dataArr.assaytype1_s.push("0");
    dataArr.assaytype2_s.push("0");

    dataArr.chlditemcd_s.push("");
    dataArr.column_itemcd_s.push("");
    dataArr.column_itemnm_s.push("");
    dataArr.gubun_s.push("R");
    dataArr.remark_s.push(Information.remark_ex.toString());
    dataArr.qty_s.push("0");
    dataArr.optioncd_s.push("");
    dataArr.bonyn_s.push("");
    dataArr.pointqty_s.push("0");
    dataArr.chasu_s.push(Information.chasu_ex.toString());
    dataArr.chasuspace_s.push("0");
    dataArr.amt_s.push("0");
    dataArr.ref_key_s.push("");

    //TK
    dataArr.rowstatus_s.push(
      Information.yn_tk == false && Information.rowstatus_tk == "N"
        ? ""
        : Information.rowstatus_tk
    );
    dataArr.seq_s.push(
      Information.rowstatus_tk == "D" ? "" : Information.seq_tk.toString()
    );
    dataArr.itemcd_s.push(Information.itemcd);
    dataArr.injectcnt_s.push(Information.injectcnt_base.toString());
    dataArr.injectcycle_s.push(Information.injectcycle_base);
    dataArr.maleqty_s.push(Information.maleqty_tk.toString());
    dataArr.femaleqty_s.push(Information.femaleqty_tk.toString());
    dataArr.totqty_s.push(Information.totqty_tk.toString());
    dataArr.sampleqty_s.push(Information.sampleqty_tk.toString());
    dataArr.urineqty_s.push("0");
    dataArr.tkqty_s.push(Information.tkqty_tk.toString());
    dataArr.experimentqty_s.push(Information.experimentqty_tk.toString());
    dataArr.autopsyqty_s.push("0");
    dataArr.spareqty_s.push(Information.spareqty_tk.toString());
    dataArr.recoverqty_s.push("0");
    dataArr.cageqty_s.push("0");
    dataArr.rackqty_s.push("0");
    dataArr.infusionqty_s.push("0");
    dataArr.infusiontime_s.push("0");
    dataArr.point_s.push(Information.point_tk.toString());
    dataArr.capacity_s.push("0");
    dataArr.geomcheqty_s.push(Information.geomcheqty_tk.toString());
    dataArr.geomcheprodqty_s.push(Information.geomcheprodqty_tk.toString());
    dataArr.infusioncount_s.push("0");
    dataArr.testcnt_s.push(Information.testcnt_tk.toString());
    dataArr.strainqty_s.push("0");
    dataArr.matterqty_s.push("0");
    dataArr.affiliationqty_s.push("0");
    dataArr.plateqty_s.push("0");
    dataArr.cellqty_s.push("0");
    dataArr.virusqty_s.push("0");
    dataArr.runtime_s.push("0");
    dataArr.gunqty_s.push(Information.gunqty_tk.toString());
    dataArr.concentrationcnt_s.push("0");
    dataArr.one_week_s.push("0");
    dataArr.two_week_s.push("0");
    dataArr.one_twoweek_s.push("0");
    dataArr.guaranteeperiod_s.push("0");
    dataArr.testperiod_s.push(Information.testperiod_tk.toString());
    dataArr.refineperiod_s.push(Information.refineperiod_tk.toString());
    dataArr.autopsyperiod_s.push("0");
    dataArr.recoverweek_s.push("0");
    dataArr.recoverday_s.push("0");
    dataArr.genderyn_s.push("");
    dataArr.breedmeth_s.push("");
    dataArr.cagetype_s.push("");
    dataArr.prodmac_s.push("");
    dataArr.assaytype_s.push("");
    dataArr.assaytype1_s.push("0");
    dataArr.assaytype2_s.push("0");

    dataArr.chlditemcd_s.push("");
    dataArr.column_itemcd_s.push("");
    dataArr.column_itemnm_s.push("");
    dataArr.gubun_s.push("T");
    dataArr.remark_s.push(Information.remark_tk.toString());
    dataArr.qty_s.push("0");
    dataArr.optioncd_s.push("");
    dataArr.bonyn_s.push(Information.bonyn_tk == true ? "Y" : "N");
    dataArr.pointqty_s.push(Information.pointqty_tk.toString());
    dataArr.chasu_s.push(Information.chasu_tk.toString());
    dataArr.chasuspace_s.push("0");
    dataArr.amt_s.push("0");
    dataArr.ref_key_s.push("");

    const para: Iparameters = {
      procedureName: "P_SA_A1000_603W_Sub1_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": "N",
        "@p_orgdiv": Information.orgdiv,
        "@p_table_id": "SA051T",
        "@p_table_key":
          Information.quonum +
          "-" +
          Information.quorev +
          "-" +
          Information.quoseq,
        "@p_rowstatus_s": dataArr.rowstatus_s.join("|"),
        "@p_seq_s": dataArr.seq_s.join("|"),
        "@p_itemcd_s": dataArr.itemcd_s.join("|"),
        "@p_injectcnt_s": dataArr.injectcnt_s.join("|"),
        "@p_injectcycle_s": dataArr.injectcycle_s.join("|"),
        "@p_maleqty_s": dataArr.maleqty_s.join("|"),
        "@p_femaleqty_s": dataArr.femaleqty_s.join("|"),
        "@p_totqty_s": dataArr.totqty_s.join("|"),
        "@p_sampleqty_s": dataArr.sampleqty_s.join("|"),
        "@p_urineqty_s": dataArr.urineqty_s.join("|"),
        "@p_tkqty_s": dataArr.tkqty_s.join("|"),
        "@p_experimentqty_s": dataArr.experimentqty_s.join("|"),
        "@p_autopsyqty_s": dataArr.autopsyqty_s.join("|"),
        "@p_spareqty_s": dataArr.spareqty_s.join("|"),
        "@p_recoverqty_s": dataArr.recoverqty_s.join("|"),
        "@p_cageqty_s": dataArr.cageqty_s.join("|"),
        "@p_rackqty_s": dataArr.rackqty_s.join("|"),
        "@p_infusionqty_s": dataArr.infusionqty_s.join("|"),
        "@p_infusiontime_s": dataArr.infusiontime_s.join("|"),
        "@p_point_s": dataArr.point_s.join("|"),
        "@p_capacity_s": dataArr.capacity_s.join("|"),
        "@p_geomcheqty_s": dataArr.geomcheqty_s.join("|"),
        "@p_geomcheprodqty_s": dataArr.geomcheprodqty_s.join("|"),
        "@p_infusioncount_s": dataArr.infusioncount_s.join("|"),
        "@p_testcnt_s": dataArr.testcnt_s.join("|"),
        "@p_strainqty_s": dataArr.strainqty_s.join("|"),
        "@p_matterqty_s": dataArr.matterqty_s.join("|"),
        "@p_affiliationqty_s": dataArr.affiliationqty_s.join("|"),
        "@p_plateqty_s": dataArr.plateqty_s.join("|"),
        "@p_cellqty_s": dataArr.cellqty_s.join("|"),
        "@p_virusqty_s": dataArr.virusqty_s.join("|"),
        "@p_runtime_s": dataArr.runtime_s.join("|"),
        "@p_gunqty_s": dataArr.gunqty_s.join("|"),
        "@p_concentrationcnt_s": dataArr.concentrationcnt_s.join("|"),
        "@p_one_week_s": dataArr.one_week_s.join("|"),
        "@p_two_week_s": dataArr.two_week_s.join("|"),
        "@p_one_twoweek_s": dataArr.one_twoweek_s.join("|"),
        "@p_guaranteeperiod_s": dataArr.guaranteeperiod_s.join("|"),
        "@p_testperiod_s": dataArr.testperiod_s.join("|"),
        "@p_refineperiod_s": dataArr.refineperiod_s.join("|"),
        "@p_autopsyperiod_s": dataArr.autopsyperiod_s.join("|"),
        "@p_recoverweek_s": dataArr.recoverweek_s.join("|"),
        "@p_recoverday_s": dataArr.recoverday_s.join("|"),
        "@p_genderyn_s": dataArr.genderyn_s.join("|"),
        "@p_breedmeth_s": dataArr.breedmeth_s.join("|"),
        "@p_cagetype_s": dataArr.cagetype_s.join("|"),
        "@p_prodmac_s": dataArr.prodmac_s.join("|"),
        "@p_assaytype_s": dataArr.assaytype_s.join("|"),
        "@p_assaytype1_s": dataArr.assaytype1_s.join("|"),
        "@p_assaytype2_s": dataArr.assaytype2_s.join("|"),

        "@p_chlditemcd_s": dataArr.chlditemcd_s.join("|"),
        "@p_column_itemcd_s": dataArr.column_itemcd_s.join("|"),
        "@p_column_itemnm_s": dataArr.column_itemnm_s.join("|"),
        "@p_gubun_s": dataArr.gubun_s.join("|"),
        "@p_remark_s": dataArr.remark_s.join("|"),
        "@p_qty_s": dataArr.qty_s.join("|"),
        "@p_optioncd_s": dataArr.optioncd_s.join("|"),
        "@p_bonyn_s": dataArr.bonyn_s.join("|"),
        "@p_pointqty_s": dataArr.pointqty_s.join("|"),
        "@p_chasu_s": dataArr.chasu_s.join("|"),
        "@p_chasuspace_s": dataArr.chasuspace_s.join("|"),
        "@p_amt_s": dataArr.amt_s.join("|"),
        "@p_ref_key_s": dataArr.ref_key_s.join("|"),

        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "SA_A1000_603W",
      },
    };

    let data: any;
    setLoading(true);

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      fetchMainGrid();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  return (
    <>
      <Window
        title={"시험디자인설계상세"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <FormBoxWrap border={true}>
          <GridTitleContainer>
            <GridTitle>기본정보</GridTitle>
          </GridTitleContainer>
          <FormBox>
            <tbody>
              <tr>
                <th>시험번호</th>
                <td>
                  <Input
                    name="quotestnum"
                    type="text"
                    value={Information.quotestnum}
                    className="readonly"
                  />
                </td>
                <th>시험파트</th>
                <td>
                  <Input
                    name="itemlvl1"
                    type="text"
                    value={
                      itemlvl1ListData.find(
                        (item: any) => item.sub_code == Information.itemlvl1
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>품목코드</th>
                <td>
                  <Input
                    name="itemcd"
                    type="text"
                    value={Information.itemcd}
                    className="readonly"
                  />
                </td>
                <th>품명</th>
                <td>
                  <Input
                    name="itemnm"
                    type="text"
                    value={Information.itemnm}
                    className="readonly"
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <FormBoxWrap border={true}>
          <GridTitleContainer>
            <GridTitle>기본</GridTitle>
          </GridTitleContainer>
          <FormBox>
            <tbody>
              <tr>
                <th>투여경로</th>
                <td>
                  <Input
                    name="injectroute_base"
                    type="text"
                    value={
                      injectrouteListData.find(
                        (item: any) =>
                          item.sub_code == Information.injectroute_base
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>동물종</th>
                <td>
                  <Input
                    name="teststs_base"
                    type="text"
                    value={
                      itemlvl3ListData.find(
                        (item: any) => item.sub_code == Information.teststs_base
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>투여횟수</th>
                <td>
                  {save == true ? (
                    <Input
                      name="injectcnt_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.injectcnt_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="injectcnt_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.injectcnt_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>투여시간</th>
                <td>
                  {save == true ? (
                    bizComponentData !== null && (
                      <BizComponentComboBox
                        name="injectcycle_base"
                        value={Information.injectcycle_base}
                        bizComponentId="L_BA008_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )
                  ) : (
                    <Input
                      name="injectcycle_base"
                      type="text"
                      value={
                        injectcycleListData.find(
                          (item: any) =>
                            item.sub_code == Information.injectcycle_base
                        )?.code_name
                      }
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>차수</th>
                <td>
                  {save == true ? (
                    <Input
                      name="chasu_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.chasu_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="chasu_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.chasu_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>실험기간(D)</th>
                <td>
                  {save == true ? (
                    <Input
                      name="testperiod_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.testperiod_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="testperiod_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.testperiod_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>실험기간(W)</th>
                <td>
                  <Input
                    name="experiment_week_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.experiment_week_base)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>동물 전체 마리수</th>
                <td>
                  {save == true ? (
                    <Input
                      name="totqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.totqty_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="totqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.totqty_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>실험동물수</th>
                <td>
                  {save == true ? (
                    <Input
                      name="experimentqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.experimentqty_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="experimentqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.experimentqty_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>여유동물수</th>
                <td>
                  {save == true ? (
                    <Input
                      name="spareqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.spareqty_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="spareqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.spareqty_base)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>수컷</th>
                <td>
                  {save == true ? (
                    <Input
                      name="maleqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.maleqty_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="maleqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.maleqty_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>암컷</th>
                <td>
                  {save == true ? (
                    <Input
                      name="femaleqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.femaleqty_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="femaleqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.femaleqty_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>차수간격</th>
                <td>
                  {save == true ? (
                    <Input
                      name="chasuspace_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.chasuspace_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="chasuspace_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.chasuspace_base)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>검체제작 마리 수</th>
                <td>
                  {save == true ? (
                    <Input
                      name="geomcheqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheqty_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="geomcheqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheqty_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>검체제작 장기 수</th>
                <td>
                  {save == true ? (
                    <Input
                      name="geomcheprodqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheprodqty_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="geomcheprodqty_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheprodqty_base)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>총 장기수</th>
                <td>
                  <Input
                    name="totgeomche_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.totgeomche_base)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>순화기간(D)</th>
                <td>
                  {save == true ? (
                    <Input
                      name="refineperiod_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.refineperiod_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="refineperiod_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.refineperiod_base)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={5}>
                  {save == true ? (
                    <TextArea
                      value={Information.remark_base}
                      name="remark_base"
                      rows={2}
                      onChange={InputChange}
                    />
                  ) : (
                    <TextArea
                      value={Information.remark_base}
                      name="remark_base"
                      rows={2}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <FormBoxWrap border={true}>
          <GridTitleContainer>
            <GridTitle>회복</GridTitle>
          </GridTitleContainer>
          <FormBox>
            <tbody>
              <tr>
                <th>회복여부</th>
                <td>
                  {save == true ? (
                    <Checkbox
                      checked={Information.yn_ex}
                      name="yn_ex"
                      onChange={InputChange}
                    ></Checkbox>
                  ) : (
                    <Checkbox checked={Information.yn_ex} readOnly></Checkbox>
                  )}
                </td>
              </tr>
              <tr>
                <th>투여횟수</th>
                <td>
                  <Input
                    name="injectcnt_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.injectcnt_base)}
                    className="readonly"
                  />
                </td>
                <th>투여시간</th>
                <td>
                  <Input
                    name="injectcycle_base"
                    type="text"
                    value={
                      injectcycleListData.find(
                        (item: any) =>
                          item.sub_code == Information.injectcycle_base
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>회복기간(W)</th>
                <td>
                  <Input
                    name="experiment_week_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.experiment_week_ex)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>차수</th>
                <td>
                  <Input
                    name="chasu_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.chasu_base)}
                    className="readonly"
                  />
                </td>
                <th>실험기간(D)</th>
                <td>
                  <Input
                    name="testperiod_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.testperiod_base)}
                    className="readonly"
                  />
                </td>
                <th>회복기간(D)</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="recoverday_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.recoverday_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="recoverday_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.recoverday_ex)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>동물 전체 마리수</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="recoverqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.recoverqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="recoverqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.recoverqty_ex)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>실험동물수</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="experimentqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.experimentqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="experimentqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.experimentqty_ex)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>여유동물수</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="spareqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.spareqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="spareqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.spareqty_ex)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>수컷</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="maleqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.maleqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="maleqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.maleqty_ex)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>암컷</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="femaleqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.femaleqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="femaleqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.femaleqty_ex)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>검체제작 마리 수</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="geomcheqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="geomcheqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheqty_ex)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>검체제작 장기 수</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="geomcheprodqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheprodqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="geomcheprodqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.geomcheprodqty_ex)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>총 장기수</th>
                <td>
                  <Input
                    name="totgeomche_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.totgeomche_ex)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>순화기간(D)</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="refineperiod_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.refineperiod_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="refineperiod_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.refineperiod_ex)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={5}>
                  {save == true && Information.yn_ex == true ? (
                    <TextArea
                      value={Information.remark_ex}
                      name="remark_ex"
                      rows={2}
                      onChange={InputChange}
                    />
                  ) : (
                    <TextArea
                      value={Information.remark_ex}
                      name="remark_ex"
                      rows={2}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <FormBoxWrap border={true}>
          <GridTitleContainer>
            <GridTitle>TK</GridTitle>
          </GridTitleContainer>
          <FormBox>
            <tbody>
              <tr>
                <th>TK여부</th>
                <td>
                  {save == true ? (
                    <Checkbox
                      checked={Information.yn_tk}
                      name="yn_tk"
                      onChange={InputChange}
                    ></Checkbox>
                  ) : (
                    <Checkbox checked={Information.yn_tk} readOnly></Checkbox>
                  )}
                </td>
                <th>본시험동물사용</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Checkbox
                      checked={Information.bonyn_tk}
                      name="bonyn_tk"
                      onChange={InputChange}
                    ></Checkbox>
                  ) : (
                    <Checkbox
                      checked={Information.bonyn_tk}
                      readOnly
                    ></Checkbox>
                  )}
                </td>
                <th>TK횟수</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="testcnt_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.testcnt_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="testcnt_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.testcnt_tk)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>투여횟수</th>
                <td>
                  <Input
                    name="injectcnt_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.injectcnt_base)}
                    className="readonly"
                  />
                </td>
                <th>투여시간</th>
                <td>
                  <Input
                    name="injectcycle_base"
                    type="text"
                    value={
                      injectcycleListData.find(
                        (item: any) =>
                          item.sub_code == Information.injectcycle_base
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>TK POINT</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="point_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.point_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="point_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.point_tk)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>차수</th>
                <td>
                  <Input
                    name="chasu_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.chasu_base)}
                    className="readonly"
                  />
                </td>
                <th>실험기간(D)</th>
                <td>
                  <Input
                    name="testperiod_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.testperiod_base)}
                    className="readonly"
                  />
                </td>
                <th>POINT 당 마리 수</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="pointqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.pointqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="pointqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.pointqty_tk)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>동물 전체 마리수</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="totqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.totqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="totqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.totqty_tk)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>실험동물수</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="experimentqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.experimentqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="experimentqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.experimentqty_tk)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>샘플수</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="sampleqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.sampleqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="sampleqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.sampleqty_tk)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>수컷</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="maleqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.maleqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="maleqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.maleqty_tk)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>암컷</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="femaleqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.femaleqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="femaleqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.femaleqty_tk)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>여유동물수</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="spareqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.spareqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="spareqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.spareqty_tk)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>순화기간(D)</th>
                <td>
                  {save == true && Information.yn_tk == true ? (
                    <Input
                      name="refineperiod_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.refineperiod_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="refineperiod_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.refineperiod_tk)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={5}>
                  {save == true && Information.yn_tk == true ? (
                    <TextArea
                      value={Information.remark_tk}
                      name="remark_tk"
                      rows={2}
                      onChange={InputChange}
                    />
                  ) : (
                    <TextArea
                      value={Information.remark_tk}
                      name="remark_tk"
                      rows={2}
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
            {save == true ? (
              <Button themeColor={"primary"} onClick={onSave}>
                저장
              </Button>
            ) : (
              ""
            )}
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
    </>
  );
};

export default CopyWindow;
