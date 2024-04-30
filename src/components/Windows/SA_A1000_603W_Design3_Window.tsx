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
  convertDateToStr,
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
    height: 700,
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
  UseBizComponent("L_BA171", setBizComponentData);

  const [itemlvl1ListData, setItemlvl1ListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      const itemlvl1QueryStr = getQueryFromBizComponent(
        bizComponentData.find((item: any) => item.bizComponentId == "L_BA171")
      );

      fetchQuery(itemlvl1QueryStr, setItemlvl1ListData);
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
        "@p_location": filters.location == undefined ? "01" : filters.location,
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
      const rows3 = data.tables[5].Rows;

      if (totalRowCnt > 0) {
        setInformation({
          quotestnum: rows[0].quotestnum,
          itemlvl1: rows[0].itemlvl1,
          itemcd: rows[0].itemcd,
          itemnm: rows[0].itemnm,
          //기본
          point_base: rows2[0].point,
          strain_base: rows2[0].strainqty,
          matterqty_base: rows2[0].matterqty,
          affiliationqty_base: rows2[0].affiliationqty,
          capacity_base: rows2[0].capacity,
          plateqty_base: rows2[0].plateqty,
          cellqty_base: rows2[0].cellqty,
          virusqty_base: rows2[0].virusqty,
          testperiod_base: rows2[0].testperiod,
          experiment_week_base: rows2[0].experiment_week,
          remark_base: rows2[0].remark,
          //용량설정시헝
          yn_ex: rows3[0].yn == "Y" ? true : false,
          point_ex: rows3[0].point,
          strain_ex: rows3[0].strainqty,
          matterqty_ex: rows3[0].matterqty,
          affiliationqty_ex: rows3[0].affiliationqty,
          capacity_ex: rows3[0].capacity,
          plateqty_ex: rows3[0].plateqty,
          cellqty_ex: rows3[0].cellqty,
          virusqty_ex: rows3[0].virusqty,
          testperiod_ex: rows3[0].testperiod,
          experiment_week_ex: rows3[0].experiment_week,
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
    point_base: 0,
    strain_base: 0,
    matterqty_base: 0,
    affiliationqty_base: 0,
    capacity_base: 0,
    plateqty_base: 0,
    cellqty_base: 0,
    virusqty_base: 0,
    testperiod_base: 0,
    experiment_week_base: 0,
    remark_base: "",
    //용량설정시헝
    yn_ex: false,
    point_ex: 0,
    strain_ex: 0,
    matterqty_ex: 0,
    affiliationqty_ex: 0,
    capacity_ex: 0,
    plateqty_ex: 0,
    cellqty_ex: 0,
    virusqty_ex: 0,
    testperiod_ex: 0,
    experiment_week_ex: 0,
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
                <th>시험횟수</th>
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
                <th>균주 수</th>
                <td>
                  <Input
                    name="strain_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.strain_base)}
                    className="readonly"
                  />
                </td>
                <th>시험물질수량</th>
                <td>
                  <Input
                    name="matterqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.matterqty_base)}
                    className="readonly"
                  />
                </td>
                <th>계열 수</th>
                <td>
                  <Input
                    name="affiliationqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.affiliationqty_base)}
                    className="readonly"
                  />
                </td>
                <th>용량</th>
                <td>
                  <Input
                    name="capacity_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.capacity_base)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>플레이트</th>
                <td>
                  <Input
                    name="plateqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.plateqty_base)}
                    className="readonly"
                  />
                </td>
                <th>세포수</th>
                <td>
                  <Input
                    name="cellqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.cellqty_base)}
                    className="readonly"
                  />
                </td>
                <th>균구성</th>
                <td>
                  <Input
                    name="virusqty_base"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.virusqty_base)}
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
                <th>시험횟수</th>
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
                <th>균주 수</th>
                <td>
                  <Input
                    name="strain_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.strain_ex)}
                    className="readonly"
                  />
                </td>
                <th>시험물질수량</th>
                <td>
                  <Input
                    name="matterqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.matterqty_ex)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>계열 수</th>
                <td>
                  <Input
                    name="affiliationqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.affiliationqty_ex)}
                    className="readonly"
                  />
                </td>
                <th>용량</th>
                <td>
                  <Input
                    name="capacity_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.capacity_ex)}
                    className="readonly"
                  />
                </td>
                <th>플레이트</th>
                <td>
                  <Input
                    name="plateqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.plateqty_ex)}
                    className="readonly"
                  />
                </td>
                <th>세포수</th>
                <td>
                  <Input
                    name="cellqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.cellqty_ex)}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>균구성</th>
                <td>
                  <Input
                    name="virusqty_ex"
                    type="number"
                    style={{
                      textAlign: "right",
                    }}
                    value={numberWithCommas3(Information.virusqty_ex)}
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
