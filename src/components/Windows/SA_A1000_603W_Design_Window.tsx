import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { useEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridTitle,
  GridTitleContainer,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import { useSetRecoilState } from "recoil";
import { isLoading } from "../../store/atoms";
import { useApi } from "../../hooks/api";
import { Iparameters } from "../../store/types";
import { PAGE_SIZE } from "../CommonString";
import { Checkbox, Input, TextArea } from "@progress/kendo-react-inputs";
type IWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
};

const CopyWindow = ({ setVisible, modal = false }: IWindow) => {
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
      parameters: {},
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
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
    testnum: "",
    testpart: "",
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
    //회복
    yn_ex: false,
    injectcnt_ex: 0,
    injectcycle_ex: "",
    recoverweek_ex: 0,
    recoverday_ex: 0,
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
    //TK
    yn_tk: false,
    bonyn_tk: false,
    testcnt_tk: 0,
    injectcnt_tk: 0,
    injectcycle_tk: 0,
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
                    name="testnum"
                    type="text"
                    value={Information.testnum}
                    className="readonly"
                  />
                </td>
                <th>시험파트</th>
                <td>
                  <Input
                    name="testpart"
                    type="text"
                    value={Information.testpart}
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
                    value={Information.injectroute_base}
                    className="readonly"
                  />
                </td>
                <th>시험계</th>
                <td>
                  <Input
                    name="teststs_base"
                    type="text"
                    value={Information.teststs_base}
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
                    value={Information.injectcnt_base}
                    className="readonly"
                  />
                </td>
                <th>투여주기</th>
                <td>
                  <Input
                    name="injectcycle_base"
                    type="text"
                    value={Information.injectcycle_base}
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
                    value={Information.chasu_base}
                    className="readonly"
                  />
                </td>
                <th>실험기간(D)</th>
                <td>
                  <Input
                    name="testperiod_base"
                    type="number"
                    value={Information.testperiod_base}
                    className="readonly"
                  />
                </td>
                <th>실험기간(W)</th>
                <td>
                  <Input
                    name="experiment_week_base"
                    type="number"
                    value={Information.experiment_week_base}
                    className="readonly"
                  />
                </td>
                <th>동물 전체 마리수</th>
                <td>
                  <Input
                    name="totqty_base"
                    type="number"
                    value={Information.totqty_base}
                    className="readonly"
                  />
                </td>
                <th></th>
                <td></td>
              </tr>
              <tr>
                <th>실험동물수</th>
                <td>
                  <Input
                    name="experimentqty_base"
                    type="number"
                    value={Information.experimentqty_base}
                    className="readonly"
                  />
                </td>
                <th>여유동물</th>
                <td>
                  <Input
                    name="spareqty_base"
                    type="number"
                    value={Information.spareqty_base}
                    className="readonly"
                  />
                </td>
                <th>수컷</th>
                <td>
                  <Input
                    name="maleqty_base"
                    type="number"
                    value={Information.maleqty_base}
                    className="readonly"
                  />
                </td>
                <th>암컷</th>
                <td>
                  <Input
                    name="femaleqty_base"
                    type="number"
                    value={Information.femaleqty_base}
                    className="readonly"
                  />
                </td>
                <th></th>
                <td></td>
              </tr>
              <tr>
                <th>차수간격</th>
                <td>
                  <Input
                    name="chasuspace_base"
                    type="number"
                    value={Information.chasuspace_base}
                    className="readonly"
                  />
                </td>
                <th>검체제작 마리 수</th>
                <td>
                  <Input
                    name="geomcheqty_base"
                    type="number"
                    value={Information.geomcheqty_base}
                    className="readonly"
                  />
                </td>
                <th>검체제작 장기 수</th>
                <td>
                  <Input
                    name="geomcheprodqty_base"
                    type="number"
                    value={Information.geomcheprodqty_base}
                    className="readonly"
                  />
                </td>
                <th>총 장기수</th>
                <td>
                  <Input
                    name="totgeomche_base"
                    type="number"
                    value={Information.totgeomche_base}
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
            <GridTitle>회복</GridTitle>
          </GridTitleContainer>
          <FormBox>
            <tbody>
              <tr>
                <th>회복여부</th>
                <td>
                  <Checkbox checked={Information.yn_ex} readOnly></Checkbox>
                </td>
                <th>투여횟수</th>
                <td>
                  <Input
                    name="injectcnt_ex"
                    type="number"
                    value={Information.injectcnt_ex}
                    className="readonly"
                  />
                </td>
                <th>투여주기</th>
                <td>
                  <Input
                    name="injectcycle_ex"
                    type="text"
                    value={Information.injectcycle_ex}
                    className="readonly"
                  />
                </td>
                <th>회복기간(W)</th>
                <td>
                  <Input
                    name="recoverweek_ex"
                    type="number"
                    value={Information.recoverweek_ex}
                    className="readonly"
                  />
                </td>
                <th>회복기간(D)</th>
                <td>
                  <Input
                    name="recoverday_ex"
                    type="text"
                    value={Information.recoverday_ex}
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
                    value={Information.chasu_ex}
                    className="readonly"
                  />
                </td>
                <th>실험기간(D)</th>
                <td>
                  <Input
                    name="testperiod_ex"
                    type="number"
                    value={Information.testperiod_ex}
                    className="readonly"
                  />
                </td>
                <th>동물 전체 마리수</th>
                <td>
                  <Input
                    name="recoverqty_ex"
                    type="number"
                    value={Information.recoverqty_ex}
                    className="readonly"
                  />
                </td>
                <th>실험동물수</th>
                <td>
                  <Input
                    name="experimentqty_ex"
                    type="number"
                    value={Information.experimentqty_ex}
                    className="readonly"
                  />
                </td>
                <th>여유동물</th>
                <td>
                  <Input
                    name="spareqty_ex"
                    type="number"
                    value={Information.spareqty_ex}
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
                    value={Information.maleqty_ex}
                    className="readonly"
                  />
                </td>
                <th>암컷</th>
                <td>
                  <Input
                    name="femaleqty_ex"
                    type="number"
                    value={Information.femaleqty_ex}
                    className="readonly"
                  />
                </td>
                <th>검체제작 마리 수</th>
                <td>
                  <Input
                    name="geomcheqty_ex"
                    type="number"
                    value={Information.geomcheqty_ex}
                    className="readonly"
                  />
                </td>
                <th>검체제작 장기 수</th>
                <td>
                  <Input
                    name="geomcheprodqty_ex"
                    type="number"
                    value={Information.geomcheprodqty_ex}
                    className="readonly"
                  />
                </td>
                <th>총 장기수</th>
                <td>
                  <Input
                    name="totgeomche_ex"
                    type="number"
                    value={Information.totgeomche_ex}
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
        <FormBoxWrap border={true}>
          <GridTitleContainer>
            <GridTitle>TK</GridTitle>
          </GridTitleContainer>
          <FormBox>
            <tbody>
              <tr>
                <th>TK여부</th>
                <td>
                  <Checkbox checked={Information.yn_tk} readOnly></Checkbox>
                </td>
                <th>본시험동물사용</th>
                <td>
                  <Checkbox checked={Information.bonyn_tk} readOnly></Checkbox>
                </td>
                <th>TK횟수</th>
                <td>
                  <Input
                    name="testcnt_tk"
                    type="number"
                    value={Information.testcnt_tk}
                    className="readonly"
                  />
                </td>
                <th>투여횟수</th>
                <td>
                  <Input
                    name="injectcnt_tk"
                    type="number"
                    value={Information.injectcnt_tk}
                    className="readonly"
                  />
                </td>
                <th>투여주기</th>
                <td>
                  <Input
                    name="injectcycle_tk"
                    type="text"
                    value={Information.injectcycle_tk}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>TK POINT</th>
                <td>
                  <Input
                    name="point_tk"
                    type="text"
                    value={Information.point_tk}
                    className="readonly"
                  />
                </td>
                <th>차수</th>
                <td>
                  <Input
                    name="chasu_tk"
                    type="number"
                    value={Information.chasu_tk}
                    className="readonly"
                  />
                </td>
                <th>실험기간(D)</th>
                <td>
                  <Input
                    name="testperiod_tk"
                    type="number"
                    value={Information.testperiod_tk}
                    className="readonly"
                  />
                </td>
                <th>POINT 당 마리 수</th>
                <td>
                  <Input
                    name="pointqty_tk"
                    type="number"
                    value={Information.pointqty_tk}
                    className="readonly"
                  />
                </td>
                <th>동물 전체 마리수</th>
                <td>
                  <Input
                    name="tkqty_tk"
                    type="number"
                    value={Information.tkqty_tk}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>실험동물수</th>
                <td>
                  <Input
                    name="experimentqty_tk"
                    type="number"
                    value={Information.experimentqty_tk}
                    className="readonly"
                  />
                </td>
                <th>샘플수</th>
                <td>
                  <Input
                    name="sampleqty_tk"
                    type="number"
                    value={Information.sampleqty_tk}
                    className="readonly"
                  />
                </td>
                <th>수컷</th>
                <td>
                  <Input
                    name="maleqty_tk"
                    type="number"
                    value={Information.maleqty_tk}
                    className="readonly"
                  />
                </td>
                <th>암컷</th>
                <td>
                  <Input
                    name="femaleqty_tk"
                    type="number"
                    value={Information.femaleqty_tk}
                    className="readonly"
                  />
                </td>
                <th>여유동물</th>
                <td>
                  <Input
                    name="spareqty_tk"
                    type="number"
                    value={Information.spareqty_tk}
                    className="readonly"
                  />
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={9}>
                  <TextArea
                    value={Information.remark_tk}
                    name="remark_tk"
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
