import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useEffect, useState } from "react";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { IWindowPosition } from "../../hooks/interfaces";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import { UseBizComponent, toDate } from "../CommonFunction";
import CustomersWindow from "./CommonWindows/CustomersWindow";

type IWindow = {
  workType: "N" | "U";
  data?: any;
  setVisible(t: boolean): void;
  setData(str: string): void;
  modal?: boolean;
  pathname: string;
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [tabSelected, setTabSelected] = useState(0);
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1600,
    height: 580,
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

  const handleSelectTab = (e: any) => {
    if (e.selected == 0) {
      setPosition((prev) => ({
        ...prev,
        height: isMobile == true ? 900 : 580,
      }));
    } else {
      setPosition((prev) => ({
        ...prev,
        height: 900,
      }));
    }
    setTabSelected(e.selected);
  };

  const selectData = () => {};

  useEffect(() => {
    if (workType === "U" && data != undefined) {
      setInformation((prev) => ({
        ...prev,
        acseq1: data.acseq1,
        acseq2: data.acseq2,
        actdt: data.actdt == "" ? null : toDate(data.actdt),
        attdatnum: data.attdatnum,
        chlditemcd: data.chlditemcd,
        costgb1: data.costgb1,
        custcd: data.custcd,
        custnm: data.custnm,
        depgb: data.depgb,
        dptcd: data.dptcd,
        findt: data.findt == "" ? null : toDate(data.findt),
        fxacumlamt: data.fxacumlamt,
        fxamt: data.fxamt,
        fxcode: data.fxcode,
        fxdepamtdpyr: data.fxdepamtdpyr,
        fxdepamtyr: data.fxdepamtyr,
        fxdepbaldpyr: data.fxdepbaldpyr,
        fxdepbalyr: data.fxdepbalyr,
        fxdepcumdpyr: data.fxdepcumdpyr,
        fxdepcumyr: data.fxdepcumyr,
        fxdepsts: data.fxdepsts,
        fxdepyrmm: data.fxdepyrmm,
        fxdespamt: data.fxdespamt,
        fxdespcust: data.fxdespcust,
        fxdespdt: data.fxdespdt == "" ? null : toDate(data.fxdespdt),
        fxdespqty: data.fxdespqty,
        fxdetail: data.fxdetail,
        fxdiv: data.fxdiv,
        fxinmeth: data.fxinmeth,
        fxnm: data.fxnm,
        fxnum: data.fxnum,
        fxpurcost: data.fxpurcost,
        fxrevaldt: data.fxrevaldt,
        fxsize: data.fxsize,
        fxsts: data.fxsts,
        fxtaxincost: data.fxtaxincost,
        fxuser1: data.fxuser1,
        fxuser2: data.fxuser2,
        indt: data.indt == "" ? new Date() : toDate(data.indt),
        lawdiv: data.lawdiv,
        location: data.location,
        maker: data.maker,
        model: data.model,
        orgdiv: data.orgdiv,
        projectno: data.projectno,
        qty: data.qty,
        rate: data.rate,
        remark: data.remark,
      }));
    }
  }, []);

  const [Information, setInformation] = useState<{ [name: string]: any }>({
    fxdiv: "",
    fxcode: "",
    fxnum: "",
    indt: new Date(),
    fxpurcost: 0,
    custcd: "",
    custnm: "",
    lawdiv: "",
    fxnm: "",
    maker: "",
    fxsize: "",
    model: "",
    location: "",
    qty: 0,
    fxuser1: "",
    dptcd: "",
    fxdepsts: "",
    depgb: "",
    fxuser2: "",
    fxinmeth: "",
    fxdepyrmm: 0,
    rate: 0,
    costgb1: "",
    fxsts: "",
    fxdepamtyr: 0,
    findt: null,
    remark: "",
    //폼입력아닌정보
    acseq1: 0,
    acseq2: 0,
    actdt: null,
    attdatnum: "",
    chlditemcd: "",
    fxacumlamt: 0,
    fxamt: 0,
    fxdepamtdpyr: 0,
    fxdepbaldpyr: 0,
    fxdepbalyr: 0,
    fxdepcumdpyr: 0,
    fxdepcumyr: 0,
    fxdespamt: 0,
    fxdespcust: "",
    fxdespdt: null,
    fxdespqty: 0,
    fxdetail: "",
    fxrevaldt: "",
    fxtaxincost: 0,
    projectno: "",
  });

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "L_BA191, L_AC164, L_BA190, L_AC160, L_AC161, L_BA002, L_sysUserMaster_002, L_dptcd_001, L_AC054, L_AC053",
    //공정, 관리항목리스트
    setBizComponentData
  );

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  interface ICustData {
    address: string;
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

  const setCustData = (data: ICustData) => {
    setInformation((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  return (
    <>
      <Window
        title={workType === "N" ? "고정자산생성" : "고정자산정보"}
        width={position.width}
        height={position.height}
        onMove={handleMove}
        onResize={handleResize}
        onClose={onClose}
        modal={modal}
      >
        <TabStrip
          style={{ width: "100%", height: `calc(100% - 80px)` }}
          selected={tabSelected}
          onSelect={handleSelectTab}
        >
          <TabStripTab title="기본정보">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>자산분류</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxdiv"
                          value={Information.fxdiv}
                          bizComponentId="L_AC160"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                          className="required"
                        />
                      )}
                    </td>
                    <th>자산코드</th>
                    <td>
                      <Input
                        name="fxcode"
                        type="text"
                        value={Information.fxcode}
                        className="readonly"
                      />
                    </td>
                    <th>자산고유번호</th>
                    <td>
                      <Input
                        name="fxnum"
                        type="text"
                        value={Information.fxnum}
                        onChange={InputChange}
                      />
                    </td>
                    <th>취득일자</th>
                    <td>
                      <DatePicker
                        name="indt"
                        value={Information.indt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                        className="required"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>취득원가</th>
                    <td>
                      <NumericTextBox
                        name="fxpurcost"
                        value={Information.fxpurcost}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>구입업체</th>
                    <td>
                      <Input
                        name="custcd"
                        type="text"
                        value={Information.custcd}
                        onChange={InputChange}
                      />
                      <ButtonInInput>
                        <Button
                          onClick={onCustWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                    <th>구입업체명</th>
                    <td>
                      <Input
                        name="custnm"
                        type="text"
                        value={Information.custnm}
                        onChange={InputChange}
                      />
                    </td>
                    <th>법구분</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="lawdiv"
                          value={Information.lawdiv}
                          bizComponentId="L_AC161"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>자산명</th>
                    <td colSpan={3}>
                      <Input
                        name="fxnm"
                        type="text"
                        value={Information.fxnm}
                        onChange={InputChange}
                      />
                    </td>
                    <th>제조사</th>
                    <td colSpan={3}>
                      <Input
                        name="maker"
                        type="text"
                        value={Information.maker}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>자산규격</th>
                    <td colSpan={3}>
                      <Input
                        name="fxsize"
                        type="text"
                        value={Information.fxsize}
                        onChange={InputChange}
                      />
                    </td>
                    <th>모델명</th>
                    <td>
                      <Input
                        name="model"
                        type="text"
                        value={Information.model}
                        onChange={InputChange}
                      />
                    </td>
                    <th>사업장</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="location"
                          value={Information.location}
                          bizComponentId="L_BA002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>수량</th>
                    <td>
                      <NumericTextBox
                        name="qty"
                        value={Information.qty}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>관리자_정</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxuser1"
                          value={Information.fxuser1}
                          bizComponentId="L_sysUserMaster_002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                          textField="user_name"
                          valueField="user_id"
                        />
                      )}
                    </td>
                    <th>귀속부서</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="dptcd"
                          value={Information.dptcd}
                          bizComponentId="L_dptcd_001"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          textField="dptnm"
                          valueField="dptcd"
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>상각상태</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxdepsts"
                          value={Information.fxdepsts}
                          bizComponentId="L_AC054"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <th>상각방법</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="depgb"
                          value={Information.depgb}
                          bizComponentId="L_AC053"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>관리자_부</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxuser2"
                          value={Information.fxuser2}
                          bizComponentId="L_sysUserMaster_002"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                          textField="user_name"
                          valueField="user_id"
                        />
                      )}
                    </td>
                    <th>구입방법</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxinmeth"
                          value={Information.fxinmeth}
                          bizComponentId="L_BA190"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>내용년수</th>
                    <td>
                      <NumericTextBox
                        name="fxdepyrmm"
                        value={Information.fxdepyrmm}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>상각율</th>
                    <td>
                      <NumericTextBox
                        name="rate"
                        value={Information.rate}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                    <th>원가구분</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="costgb1"
                          value={Information.costgb1}
                          bizComponentId="L_AC164"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>자산상태</th>
                    <td>
                      {bizComponentData !== null && (
                        <BizComponentComboBox
                          name="fxsts"
                          value={Information.fxsts}
                          bizComponentId="L_BA191"
                          bizComponentData={bizComponentData}
                          changeData={ComboBoxChange}
                          para="AC_A3100W"
                        />
                      )}
                    </td>
                    <th>당기상각액</th>
                    <td>
                      <NumericTextBox
                        name="fxdepamtyr"
                        value={Information.fxdepamtyr}
                        onChange={InputChange}
                        format="n0"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>상각완료년도</th>
                    <td>
                      <DatePicker
                        name="findt"
                        value={Information.findt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                    <th>비고</th>
                    <td colSpan={5}>
                      <Input
                        name="remark"
                        type="text"
                        value={Information.remark}
                        onChange={InputChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </TabStripTab>
          <TabStripTab
            title="자산변동"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="월감가상각"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
          <TabStripTab
            title="년감가상각"
            disabled={workType == "N" ? true : false}
          ></TabStripTab>
        </TabStrip>
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
        {custWindowVisible && (
          <CustomersWindow
            setVisible={setCustWindowVisible}
            workType={workType}
            setData={setCustData}
          />
        )}
      </Window>
    </>
  );
};

export default CopyWindow;
