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
import {
  UseBizComponent,
  getQueryFromBizComponent,
  numberWithCommas3,
} from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE } from "../CommonString";
type IWindow = {
  setVisible(t: boolean): void;
  filters: any;
  item: any;
  modal?: boolean;
};

const CopyWindow = ({ setVisible, filters, item, modal = false }: IWindow) => {
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

  const [bizComponentData, setBizComponentData] = useState<any>([]);
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
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA171")
      );
      const itemlvl3QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA173")
      );
      const injectrouteQueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId === "L_BA174")
      );
      const injectcycleQueryStr = getQueryFromBizComponent(
        bizComponentData.find(
          (item: any) => item.bizComponentId === "L_BA008_603"
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

    if (data.isSuccess === true) {
      const rows = data.tables[0].Rows;
      setListData(rows);
    }
  }, []);

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();

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
        "@p_location": filters.location,
        "@p_custcd": filters.custcd,
        "@p_custnm": filters.custnm,
        "@p_testnum": filters.testnum,
        "@p_quotestnum": filters.quotestnum,
        "@p_finyn": filters.finyn,
        "@p_quonum": item.quonum,
        "@p_quorev": item.quorev,
        "@p_quoseq": item.quoseq,
        "@p_status": "",
        "@p_find_row_value": filters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      const rows3 = data.tables[4].Rows;

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
          chasussapce_base: rows2[0].chasuspace,
          chasu_base: rows2[0].chasu,
          testperiod_base: rows2[0].testperiod,
          experiment_week_base: rows2[0].experiment_week,
          totqty_base: rows2[0].totqty,
          experimentqty_base: rows2[0].experimentqty,
          spareqty_base: rows2[0].spareqty,
          maleqty_base: rows2[0].maleqty,
          femaleqty_base: rows2[0].femaleqty,
          point_base: rows2[0].point,
          geomcheqty_base: rows2[0].geomcheqty,
          geomcheprodqty_base: rows2[0].geomcheprodqty,
          totgeomche_base: rows2[0].totgeomche,
          remark_base: rows2[0].remark,
          //용량설정시헝
          yn_ex: rows3[0].yn == "Y" ? true : false,
          injectroute_ex: rows3[0].injectroute,
          teststs_ex: rows3[0].teststs,
          chlditemcd_ex: rows3[0].chlditemcd,
          injectcnt_ex: rows3[0].injectcnt,
          injectcycle_ex: rows3[0].injectcycle,
          chasu_ex: rows3[0].chasu,
          testperiod_ex: rows3[0].testperiod,
          experiment_week_ex: rows3[0].experiment_week,
          totqty_ex: rows3[0].totqty,
          experimentqty_ex: rows3[0].experimentqty,
          spareqty_ex: rows3[0].spareqty,
          maleqty_ex: rows3[0].maleqty,
          femaleqty_ex: rows3[0].femaleqty,
          point_ex: rows3[0].point,
          remark_ex: rows3[0].remark,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMainGrid();
  }, []);

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
    chasussapce_base: 0,
    chasu_base: 0,
    testperiod_base: 0,
    experiment_week_base: 0,
    totqty_base: 0,
    experimentqty_base: 0,
    spareqty_base: 0,
    maleqty_base: 0,
    femaleqty_base: 0,
    point_base: 0,
    geomcheqty_base: 0,
    geomcheprodqty_base: 0,
    totgeomche_base: 0,
    remark_base: "",
    //용량설정시헝
    yn_ex: false,
    injectroute_ex: "",
    teststs_ex: "",
    chlditemcd_ex: "",
    injectcnt_ex: 0,
    injectcycle_ex: "",
    chasu_ex: 0,
    testperiod_ex: 0,
    experiment_week_ex: 0,
    totqty_ex: 0,
    experimentqty_ex: 0,
    spareqty_ex: 0,
    maleqty_ex: 0,
    femaleqty_ex: 0,
    point_ex: 0,
    remark_ex: "",
  });

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
                <th>시험계</th>
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
                <th>동물품번</th>
                <td>
                  <Input
                    name="chlditemcd_base"
                    type="text"
                    value={Information.chlditemcd_base}
                    className="readonly"
                  />
                </td>
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
                <th>투여주기</th>
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
              </tr>
              <tr>
                <th>차수간격</th>
                <td>
                  <Input
                    name="chasussapce_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.chasussapce_base)}
                    className="readonly"
                  />
                </td>
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
                <th>동물 전체 마리수</th>
                <td>
                  <Input
                    name="totqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.totqty_base)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>실험동물수</th>
                <td>
                  <Input
                    name="experimentqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.experimentqty_base)}
                    className="readonly"
                  />
                </td>
                <th>여유동물</th>
                <td>
                  <Input
                    name="spareqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.spareqty_base)}
                    className="readonly"
                  />
                </td>
                <th>수컷</th>
                <td>
                  <Input
                    name="maleqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.maleqty_base)}
                    className="readonly"
                  />
                </td>
                <th>암컷</th>
                <td>
                  <Input
                    name="femaleqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.femaleqty_base)}
                    className="readonly"
                  />
                </td>
                <th>측정 POINT</th>
                <td>
                  <Input
                    name="point_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.point_base)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>검체제작 마리 수</th>
                <td>
                  <Input
                    name="geomcheqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.geomcheqty_base)}
                    className="readonly"
                  />
                </td>
                <th>검체제작 장기 수</th>
                <td>
                  <Input
                    name="geomcheprodqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.geomcheprodqty_base)}
                    className="readonly"
                  />
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
                <th></th>
                <td></td>
                <th></th>
                <td></td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={9}>
                  <TextArea
                    value={Information.remark_base}
                    name="remark_base"
                    rows={2}
                    className="readonly"
                  />
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
                  <Checkbox checked={Information.yn_ex} readOnly></Checkbox>
                </td>
                <th>투여경로</th>
                <td>
                  <Input
                    name="injectroute_ex"
                    type="text"
                    value={
                      injectrouteListData.find(
                        (item: any) =>
                          item.sub_code == Information.injectroute_ex
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>시험계</th>
                <td>
                  <Input
                    name="teststs_ex"
                    type="text"
                    value={
                      itemlvl3ListData.find(
                        (item: any) => item.sub_code == Information.teststs_ex
                      )?.code_name
                    }
                    className="readonly"
                  />
                </td>
                <th>동물품번</th>
                <td>
                  <Input
                    name="chlditemcd_ex"
                    type="text"
                    value={Information.chlditemcd_ex}
                    className="readonly"
                  />
                </td>
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
              </tr>
              <tr>
                <th>투여주기</th>
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
              </tr>
              <tr>
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
                <th>동물 전체 마리수</th>
                <td>
                  <Input
                    name="totqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.totqty_ex)}
                    className="readonly"
                  />
                </td>
                <th>실험동물수</th>
                <td>
                  <Input
                    name="experimentqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.experimentqty_ex)}
                    className="readonly"
                  />
                </td>
                <th>여유동물</th>
                <td>
                  <Input
                    name="spareqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.spareqty_ex)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>수컷</th>
                <td>
                  <Input
                    name="maleqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.maleqty_ex)}
                    className="readonly"
                  />
                </td>
                <th>암컷</th>
                <td>
                  <Input
                    name="femaleqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.femaleqty_ex)}
                    className="readonly"
                  />
                </td>
                <th>측정 POINT</th>
                <td>
                  <Input
                    name="point_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.point_ex)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={9}>
                  <TextArea
                    value={Information.remark_ex}
                    name="remark_ex"
                    rows={2}
                    className="readonly"
                  />
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
