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
      const totalRowCnt = data.tables[1].TotalRowCount;
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[2].Rows;
      const rows4 = data.tables[3].Rows;

      if (totalRowCnt > 0) {
        setInformation({
          quotestnum: rows[0].quotestnum,
          itemlvl1: rows[0].itemlvl1,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
          //기본
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
          refineperiod_base: rows2[0].refineperiod,
          //회복
          yn_ex: rows3[0].yn == "Y" ? true : false,
          injectcnt_ex: rows3[0].injectcnt,
          injectcycle_ex: rows3[0].injectcycle,
          recoverday_ex: rows3[0].recoverday,
          experiment_week_ex: rows3[0].experiment_week,
          chasu_ex: rows3[0].chasu,
          testperiod_ex: rows3[0].testperiod,
          recoverqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          geomcheqty_ex: rows3[0].geomcheqty,
          geomcheprodqty_ex: rows3[0].geomcheprodqty,
          totgeomche_ex: rows3[0].geomcheqty,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          //TK
          yn_tk: rows4[0].yn == "Y" ? true : false,
          bonyn_tk: rows4[0].bonyn == "Y" ? true : false,
          testcnt_tk: rows4[0].testcnt,
          injectcnt_tk: rows4[0].injectcnt,
          injectcycle_tk: rows4[0].injectcycle,
          point_tk: rows4[0].point,
          chasu_tk: rows4[0].chasu,
          testperiod_tk: rows4[0].testperiod,
          pointqty_tk: rows4[0].pointqty,
          tkqty_tk: rows4[0].totqty,
          experimentqty_tk: rows4[0].experimentqty,
          sampleqty_tk: rows4[0].sampleqty,
          maleqty_tk: rows4[0].maleqty,
          femaleqty_tk: rows4[0].femaleqty,
          spareqty_tk: rows4[0].spareqty,
          remark_tk: rows4[0].remark,
          refineperiod_tk: rows4[0].refineperiod,
        });

        setInformation_ori({
          quotestnum: rows[0].quotestnum,
          itemlvl1: rows[0].itemlvl1,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
          //기본
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
          refineperiod_base: rows2[0].refineperiod,
          //회복
          yn_ex: rows3[0].yn == "Y" ? true : false,
          injectcnt_ex: rows3[0].injectcnt,
          injectcycle_ex: rows3[0].injectcycle,
          recoverday_ex: rows3[0].recoverday,
          experiment_week_ex: rows3[0].experiment_week,
          chasu_ex: rows3[0].chasu,
          testperiod_ex: rows3[0].testperiod,
          recoverqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          geomcheqty_ex: rows3[0].geomcheqty,
          geomcheprodqty_ex: rows3[0].geomcheprodqty,
          totgeomche_ex: rows3[0].geomcheqty,
          remark_ex: rows3[0].remark,
          refineperiod_ex: rows3[0].refineperiod,
          //TK
          yn_tk: rows4[0].yn == "Y" ? true : false,
          bonyn_tk: rows4[0].bonyn == "Y" ? true : false,
          testcnt_tk: rows4[0].testcnt,
          injectcnt_tk: rows4[0].injectcnt,
          injectcycle_tk: rows4[0].injectcycle,
          point_tk: rows4[0].point,
          chasu_tk: rows4[0].chasu,
          testperiod_tk: rows4[0].testperiod,
          pointqty_tk: rows4[0].pointqty,
          tkqty_tk: rows4[0].totqty,
          experimentqty_tk: rows4[0].experimentqty,
          sampleqty_tk: rows4[0].sampleqty,
          maleqty_tk: rows4[0].maleqty,
          femaleqty_tk: rows4[0].femaleqty,
          spareqty_tk: rows4[0].spareqty,
          remark_tk: rows4[0].remark,
          refineperiod_tk: rows4[0].refineperiod,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if(bizComponentData !== null) {
      fetchMainGrid();
    }
  }, [bizComponentData]);

  const [Information, setInformation] = useState({
    quotestnum: "",
    itemlvl1: "",
    itemcd: "",
    itemnm: "",
    //기본
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
    refineperiod_base: 0,
    //회복
    yn_ex: false,
    injectcnt_ex: 0,
    injectcycle_ex: "",
    recoverday_ex: 0,
    experiment_week_ex: 0,
    chasu_ex: 0,
    testperiod_ex: 0,
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
    //TK
    yn_tk: false,
    bonyn_tk: false,
    testcnt_tk: 0,
    injectcnt_tk: 0,
    injectcycle_tk: "",
    point_tk: 0,
    chasu_tk: 0,
    testperiod_tk: 0,
    pointqty_tk: 0,
    tkqty_tk: 0,
    experimentqty_tk: 0,
    sampleqty_tk: 0,
    maleqty_tk: 0,
    femaleqty_tk: 0,
    spareqty_tk: 0,
    remark_tk: "",
    refineperiod_tk: 0,
  });

  const [Information_ori, setInformation_ori] = useState({
    quotestnum: "",
    itemlvl1: "",
    itemcd: "",
    itemnm: "",
    //기본
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
    refineperiod_base: 0,
    //회복
    yn_ex: false,
    injectcnt_ex: 0,
    injectcycle_ex: "",
    recoverday_ex: 0,
    experiment_week_ex: 0,
    chasu_ex: 0,
    testperiod_ex: 0,
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
    //TK
    yn_tk: false,
    bonyn_tk: false,
    testcnt_tk: 0,
    injectcnt_tk: 0,
    injectcycle_tk: "",
    point_tk: 0,
    chasu_tk: 0,
    testperiod_tk: 0,
    pointqty_tk: 0,
    tkqty_tk: 0,
    experimentqty_tk: 0,
    sampleqty_tk: 0,
    maleqty_tk: 0,
    femaleqty_tk: 0,
    spareqty_tk: 0,
    remark_tk: "",
    refineperiod_tk: 0,
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "yn_ex") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        recoverday_ex: Information_ori.recoverday_ex,
        recoverqty_ex: Information_ori.recoverqty_ex,
        experimentqty_ex: Information_ori.experimentqty_ex,
        spareqty_ex: Information_ori.spareqty_ex,
        maleqty_ex: Information_ori.maleqty_ex,
        femaleqty_ex: Information_ori.femaleqty_ex,
        geomcheqty_ex: Information_ori.geomcheqty_ex,
        geomcheprodqty_ex: Information_ori.geomcheprodqty_ex,
        refineperiod_ex: Information_ori.refineperiod_ex,
        remark_ex: Information_ori.remark_ex,
      }));
    } else if (name == "yn_tk") {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
        testcnt_tk: Information_ori.testcnt_tk,
        point_tk: Information_ori.point_tk,
        pointqty_tk: Information_ori.pointqty_tk,
        tkqty_tk: Information_ori.tkqty_tk,
        experimentqty_tk: Information_ori.experimentqty_tk,
        sampleqty_tk: Information_ori.sampleqty_tk,
        maleqty_tk: Information_ori.maleqty_tk,
        femaleqty_tk: Information_ori.femaleqty_tk,
        spareqty_tk: Information_ori.spareqty_tk,
        refineperiod_tk: Information_ori.refineperiod_tk,
        remark_tk: Information_ori.remark_tk,
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

  const onSave = () => {

  }

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
                  {save == true ? 
                    (bizComponentData !== null && (
                      <BizComponentComboBox
                        name="injectcycle_base"
                        value={Information.injectcycle_base}
                        bizComponentId="L_BA008_603"
                        bizComponentData={bizComponentData}
                        changeData={ComboBoxChange}
                      />
                    ))
                  : (
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
                    name="injectcnt_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.injectcnt_ex)}
                    className="readonly"
                  />
                </td>
                <th>투여시간</th>
                <td>
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
                    name="chasu_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.chasu_ex)}
                    className="readonly"
                  />
                </td>
                <th>실험기간(D)</th>
                <td>
                  <Input
                    name="testperiod_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.testperiod_ex)}
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
                  <Checkbox checked={Information.bonyn_tk} readOnly></Checkbox>
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
                    name="injectcnt_tk"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.injectcnt_tk)}
                    className="readonly"
                  />
                </td>
                <th>투여시간</th>
                <td>
                  <Input
                    name="injectcycle_tk"
                    type="text"
                    value={
                      injectcycleListData.find(
                        (item: any) =>
                          item.sub_code == Information.injectcycle_tk
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
                    name="chasu_tk"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.chasu_tk)}
                    className="readonly"
                  />
                </td>
                <th>실험기간(D)</th>
                <td>
                  <Input
                    name="testperiod_tk"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.testperiod_tk)}
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
                      name="tkqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.tkqty_tk)}
                      onChange={InputChange}
                    />
                  ) : (
                    <Input
                      name="tkqty_tk"
                      type="number"
                      style={{
                        textAlign: "right",
                      }}
                      value={numberWithCommas3(Information.tkqty_tk)}
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
              <Button
                themeColor={"primary"}
                onClick={onSave}
              >
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
