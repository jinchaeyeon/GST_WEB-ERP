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
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
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
      const totalRowCnt = data.tables[0].TotalRowCount;
      const totalRowCnt2 = data.tables[1].TotalRowCount;
      const totalRowCnt3 = data.tables[4].TotalRowCount;
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[4].Rows;

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
          matterqty_base: rows2[0].matterqty,
          affiliationqty_base: rows2[0].affiliationqty,
          capacity_base: rows2[0].capacity,
          plateqty_base: rows2[0].plateqty,
          cellqty_base: rows2[0].cellqty,
          virusqty_base: rows2[0].virusqty,
          prodmac_base: rows2[0].prodmac,
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
        }));
      }
      if (totalRowCnt3 > 0) {
        setInformation((prev) => ({
          ...prev,
          rowstatus_ex: rows3[0].yn == "Y" ? "U" : "N",
          seq_ex: rows3[0].seq,
          yn_ex: rows3[0].yn == "Y" ? true : false,
          injectroute_ex: rows3[0].injectroute,
          teststs_ex: rows3[0].teststs,
          injectcnt_ex: rows3[0].injectcnt,
          injectcycle_ex: rows3[0].injectcycle,
          genderyn_ex: rows3[0].genderyn,
          experiment_week_ex: rows3[0].experiment_week,
          totqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          point_ex: rows3[0].point,
          strainqty_ex: rows3[0].strainqty,
          matterqty_ex: rows3[0].matterqty,
          affiliationqty_ex: rows3[0].affiliationqty,
          capacity_ex: rows3[0].capacity,
          plateqty_ex: rows3[0].plateqty,
          cellqty_ex: rows3[0].cellqty,
          virusqty_ex: rows3[0].virusqty,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          testperiod_ex: rows3[0].testperiod,
          chasu_ex: rows3[0].chasu,
        }));
        setInformation_ori((prev) => ({
          ...prev,
          rowstatus_ex: rows3[0].yn == "Y" ? "U" : "N",
          seq_ex: rows3[0].seq,
          yn_ex: rows3[0].yn == "Y" ? true : false,
          injectroute_ex: rows3[0].injectroute,
          teststs_ex: rows3[0].teststs,
          injectcnt_ex: rows3[0].injectcnt,
          injectcycle_ex: rows3[0].injectcycle,
          genderyn_ex: rows3[0].genderyn,
          experiment_week_ex: rows3[0].experiment_week,
          totqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          point_ex: rows3[0].point,
          strainqty_ex: rows3[0].strainqty,
          matterqty_ex: rows3[0].matterqty,
          affiliationqty_ex: rows3[0].affiliationqty,
          capacity_ex: rows3[0].capacity,
          plateqty_ex: rows3[0].plateqty,
          cellqty_ex: rows3[0].cellqty,
          virusqty_ex: rows3[0].virusqty,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          testperiod_ex: rows3[0].testperiod,
          chasu_ex: rows3[0].chasu,
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
    //용량설정시험
    rowstatus_ex: "N",
    seq_ex: 0,
    yn_ex: false,
    injectroute_ex: "",
    teststs_ex: "",
    injectcnt_ex: 0,
    injectcycle_ex: "",
    genderyn_ex: "",
    experiment_week_ex: 0,
    totqty_ex: 0,
    experimentqty_ex: 0,
    spareqty_ex: 0,
    maleqty_ex: 0,
    femaleqty_ex: 0,
    point_ex: 0,
    strainqty_ex: 0,
    matterqty_ex: 0,
    affiliationqty_ex: 0,
    capacity_ex: 0,
    plateqty_ex: 0,
    cellqty_ex: 0,
    virusqty_ex: 0,
    remark_ex: "",
    refineperiod_ex: 0,
    testperiod_ex: 0,
    chasu_ex: 0,
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

    //용량설정시험
    rowstatus_ex: "N",
    seq_ex: 0,
    yn_ex: false,
    injectroute_ex: "",
    teststs_ex: "",
    injectcnt_ex: 0,
    injectcycle_ex: "",
    genderyn_ex: "",
    experiment_week_ex: 0,
    totqty_ex: 0,
    experimentqty_ex: 0,
    spareqty_ex: 0,
    maleqty_ex: 0,
    femaleqty_ex: 0,
    point_ex: 0,
    strainqty_ex: 0,
    matterqty_ex: 0,
    affiliationqty_ex: 0,
    capacity_ex: 0,
    plateqty_ex: 0,
    cellqty_ex: 0,
    virusqty_ex: 0,
    remark_ex: "",
    refineperiod_ex: 0,
    testperiod_ex: 0,
    chasu_ex: 0,
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
        injectcnt_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.injectcnt_ex,
        injectcycle_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? ""
            : Information_ori.injectcycle_ex,
        chasu_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.chasu_ex,
        testperiod_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.testperiod_ex,
        totqty_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.totqty_ex,
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
        point_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.point_ex,
        refineperiod_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? 0
            : Information_ori.refineperiod_ex,
        remark_ex:
          value == false && Information_ori.rowstatus_ex == "U"
            ? ""
            : Information_ori.remark_ex,
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
                <th>품번</th>
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
            <GridTitle>본시험</GridTitle>
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
                <th>측정 POINT</th>
                <td>
                  {save == true ? (
                    <Input
                      name="point_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.point_base)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="point_base"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.point_base)}
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
            <GridTitle>용량설정시험</GridTitle>
          </GridTitleContainer>
          <FormBox>
            <tbody>
              <tr>
                <th>용량설정시험여부</th>
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
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="injectcnt_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.injectcnt_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="injectcnt_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.injectcnt_ex)}
                      className="readonly"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>투여시간</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    bizComponentData !== null && (
                      <BizComponentComboBox
                        name="injectcycle_ex"
                        value={Information.injectcycle_ex}
                        bizComponentId="L_BA008_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    )
                  ) : (
                    <Input
                      name="injectcycle_ex"
                      type="text"
                      value={
                        injectcycleListData.find(
                          (item: any) =>
                            item.sub_code == Information.injectcycle_ex
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
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="chasu_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.chasu_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="chasu_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.chasu_ex)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>실험기간(D)</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="testperiod_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.testperiod_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="testperiod_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.testperiod_ex)}
                      className="readonly"
                    />
                  )}
                </td>
                <th>실험기간(W)</th>
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
                <th>동물 전체 마리수</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="totqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.totqty_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="totqty_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.totqty_ex)}
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
                <th>여유동물</th>
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
                <th>측정 POINT</th>
                <td>
                  {save == true && Information.yn_ex == true ? (
                    <Input
                      name="point_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.point_ex)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="point_ex"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.point_ex)}
                      className="readonly"
                    />
                  )}
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
        <BottomContainer>
          <ButtonContainer>
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
