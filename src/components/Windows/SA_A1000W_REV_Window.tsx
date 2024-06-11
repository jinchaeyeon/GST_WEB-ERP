import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  getHeight,
  getWindowDeviceHeight,
} from "../CommonFunction";
import Window from "./WindowComponent/Window";
type IKendoWindow = {
  setVisible(t: boolean): void;
  setLoadings(): void;
  information: any;
  modal?: boolean;
};

var height = 0;
var height2 = 0;

const KendoWindow = ({
  setVisible,
  setLoadings,
  information,
  modal = false,
}: IKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 800) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 250) / 2,
    width: isMobile == true ? deviceWidth : 800,
    height: isMobile == true ? deviceHeight : 250,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    height = getHeight(".k-window-titlebar"); //공통 해더
    height2 = getHeight(".BottomContainer"); //조회버튼있는 title부분

    setMobileHeight(
      getWindowDeviceHeight(false, deviceHeight) - height - height2
    );
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  }, []);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(
      getWindowDeviceHeight(false, position.height) - height - height2
    );
  };

  const setLoading = useSetRecoilState(isLoading);
  const [Information, setInformation] = useState<{ [name: string]: any }>(
    information
  );

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");
  const pc = UseGetValueFromSessionItem("pc");
  const processApi = useApi();

  //조회조건 초기값
  const [filters, setFilters] = useState({
    dptcd: "",
    orgdiv: "",
    rtrchk: "Y",
    user_id: "",
    user_name: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const onConfirmClick = () => {
    setParaData((prev) => ({
      ...prev,
      workType: "REV",
      orgdiv: sessionOrgdiv,
      quonum: Information.quonum,
      quorev: Information.quorev,
      rev_reason: Information.rev_reason,
    }));
  };

  const [ParaData, setParaData] = useState({
    workType: "",
    orgdiv: "",
    location: "",
    quonum: "",
    quorev: 0,
    quoseq: 0,
    quotype: "",
    quodt: "",
    person: "",
    pubdt: "",
    rev_reason: "",
    chkperson: "",
    custcd: "",
    custnm: "",
    remark2: "",
    postcd: "",
    tel: "",
    extra_field4: "",
    email: "",
    rcvpostcd: "",
    rcvtel: "",
    extra_field5: "",
    rcvemail: "",
    extra_field3: "",
    extra_field2: "",
    materialinfo: "",
    report: "",
    agency: "",
    reportcnt: 0,
    transreportcnt: 0,
    attdatnum: "",
    assayyn: "",
    assaydt: "",
    rcvcustnm: "",
    rcvcustprsnnm: "",
    remark3: "",
    materialtype: "",
    materialindt: "",
    materialnm: "",
    guideline: "",
    translatereport: "",
    teststdt: "",
    testenddt: "",
    remark: "",
    custprsnnm: "",
    requestgb: "",
    glpgb: "",
    numbering_id: "",
    rowstatus_s: "",
    quoseq_s: "",
    itemcd_s: "",
    itemnm_s: "",
    glpyn_s: "",
    startdt_s: "",
    enddt_s: "",
    remark_s: "",
    quonum_s: "",
    quorev_s: "",
    progress_status_s: "",
    userid: "",
    pc: "",
    form_id: "",
    testtype: "",
  });

  const para: Iparameters = {
    procedureName: "P_SA_A1000W_603_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_quonum": ParaData.quonum,
      "@p_quorev": ParaData.quorev,
      "@p_quotype": ParaData.quotype,
      "@p_quodt": ParaData.quodt,
      "@p_pubdt": ParaData.pubdt,
      "@p_rev_reason": ParaData.rev_reason,
      "@p_person": ParaData.person,
      "@p_chkperson": ParaData.chkperson,
      "@p_custcd": ParaData.custcd,
      "@p_custnm": ParaData.custnm,
      "@p_remark2": ParaData.remark2,
      "@p_postcd": ParaData.postcd,
      "@p_tel": ParaData.tel,
      "@p_extra_field4": ParaData.extra_field4,
      "@p_email": ParaData.email,
      "@p_rcvpostcd": ParaData.rcvpostcd,
      "@p_rcvtel": ParaData.rcvtel,
      "@p_extra_field5": ParaData.extra_field5,
      "@p_rcvemail": ParaData.rcvemail,
      "@p_extra_field3": ParaData.extra_field3,
      "@p_extra_field2": ParaData.extra_field2,
      "@p_materialinfo": ParaData.materialinfo,
      "@p_report": ParaData.report,
      "@p_agency": ParaData.agency,
      "@p_reportcnt": ParaData.reportcnt,
      "@p_transreportcnt": ParaData.transreportcnt,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_assayyn": ParaData.assayyn,
      "@p_assaydt": ParaData.assaydt,
      "@p_rcvcustnm": ParaData.rcvcustnm,
      "@p_rcvcustprsnnm": ParaData.rcvcustprsnnm,
      "@p_remark3": ParaData.remark3,
      "@p_materialtype": ParaData.materialtype,
      "@p_materialindt": ParaData.materialindt,
      "@p_materialnm": ParaData.materialnm,
      "@p_guideline": ParaData.guideline,
      "@p_translatereport": ParaData.translatereport,
      "@p_teststdt": ParaData.teststdt,
      "@p_testenddt": ParaData.testenddt,
      "@p_remark": ParaData.remark,
      "@p_custprsnnm": ParaData.custprsnnm,
      "@p_requestgb": ParaData.requestgb,
      "@p_glpgb": ParaData.glpgb,
      "@p_testtype": ParaData.testtype,
      "@p_numbering_id": ParaData.numbering_id,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_quoseq_s": ParaData.quoseq_s,
      "@p_itemcd_s": ParaData.itemcd_s,
      "@p_itemnm_s": ParaData.itemnm_s,
      "@p_glpyn_s": ParaData.glpyn_s,
      "@p_startdt_s": ParaData.startdt_s,
      "@p_enddt_s": ParaData.enddt_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_quonum_s": ParaData.quonum_s,
      "@p_quorev_s": ParaData.quorev_s,
      "@p_progress_status_s": ParaData.progress_status_s,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "SA_A1000W_603",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (ParaData.workType == "REV") {
        alert("처리되었습니다.");
      }
      setParaData({
        workType: "",
        orgdiv: "",
        location: "",
        quonum: "",
        quorev: 0,
        quoseq: 0,
        quotype: "",
        quodt: "",
        person: "",
        pubdt: "",
        chkperson: "",
        custcd: "",
        custnm: "",
        remark2: "",
        postcd: "",
        tel: "",
        extra_field4: "",
        email: "",
        rcvpostcd: "",
        rcvtel: "",
        extra_field5: "",
        rcvemail: "",
        extra_field3: "",
        extra_field2: "",
        materialinfo: "",
        agency: "",
        reportcnt: 0,
        transreportcnt: 0,
        attdatnum: "",
        assayyn: "",
        assaydt: "",
        report: "",
        rev_reason: "",
        rcvcustnm: "",
        rcvcustprsnnm: "",
        remark3: "",
        materialtype: "",
        materialindt: "",
        materialnm: "",
        guideline: "",
        translatereport: "",
        teststdt: "",
        testenddt: "",
        remark: "",
        custprsnnm: "",
        requestgb: "",
        glpgb: "",
        testtype: "",
        numbering_id: "",
        rowstatus_s: "",
        quoseq_s: "",
        itemcd_s: "",
        itemnm_s: "",
        glpyn_s: "",
        startdt_s: "",
        enddt_s: "",
        remark_s: "",
        quonum_s: "",
        quorev_s: "",
        progress_status_s: "",
        userid: "",
        pc: "",
        form_id: "",
      });
      setLoadings();
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.workType != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  return (
    <Window
      titles={"REV"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <FormBoxWrap
        border={true}
        style={{ height: isMobile ? mobileheight : webheight }}
      >
        <FormBox>
          <tbody>
            <tr>
              <th style={{ width: "15%" }}>개정사유</th>
              <td>
                <Input
                  name="rev_reason"
                  type="text"
                  value={Information.rev_reason}
                  onChange={InputChange}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer className="BottomContainer">
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={onConfirmClick}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
    </Window>
  );
};

export default KendoWindow;
