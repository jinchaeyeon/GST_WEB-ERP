import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  Checkbox,
  Input,
  MaskedTextBox,
  NumericTextBox,
  TextArea,
} from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IAttachmentData, IWindowPosition } from "../../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  convertDateToStr,
  getBizCom,
  getHeight,
  toDate,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import BankCDWindow from "./CommonWindows/BankCDWindow";
import PopUpAttachmentsWindow from "./CommonWindows/PopUpAttachmentsWindow";
import ZipCodeWindow from "./CommonWindows/ZipCodeWindow";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: any;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
  pathname: string;
};

var height = 0;
var height2 = 0;

const CopyWindow = ({
  workType,
  data,
  setVisible,
  reload,
  modal = false,
  pathname,
}: IWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 750) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 750,
  });

  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분

      setMobileHeight(deviceHeight - height - height2);
      setWebHeight(position.height - height - height2);
    }
  }, [customOptionData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
    setWebHeight(position.height - height - height2);
  };

  const [bankcdWindowVisible, setBankcdWindowVisible] =
    useState<boolean>(false);
  const [zipCodeWindowVisible, setZipCodeWindowVisibile] =
    useState<boolean>(false);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onBankcdWndClick = () => {
    setBankcdWindowVisible(true);
  };
  const onZipCodeWndClick = () => {
    setZipCodeWindowVisibile(true);
  };
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const getbankcdData = (bankcd: string, banknm: string) => {
    setInformation((prev) => {
      return {
        ...prev,
        bankcd: bankcd,
        banknm: banknm,
      };
    });
  };
  const getZipCodeData = (zipcode: string, address: string) => {
    setInformation((prev) => {
      return {
        ...prev,
        hmzipcode: zipcode,
        koraddr: address,
      };
    });
  };
  const getAttachmentsData = (data: IAttachmentData) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
      };
    });
  };

  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const setLoading = useSetRecoilState(isLoading);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );

  const processApi = useApi();

  const [bizComponentData, setBizComponentData] = useState([]);
  UseBizComponent(
    "R_GRADUTYPE, R_WORKERDIV, R_BIRCD,R_SEXCD, L_dptcd_001",
    setBizComponentData
  );

  const [dptcdListData, setdptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  useEffect(() => {
    if (bizComponentData !== null) {
      setdptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
    }
  }, [bizComponentData]);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [information, setInformation] = useState<{ [name: string]: any }>({
    abilcd: "",
    anlslry: 0,
    attdatnum: "",
    bankacnt: "",
    bankcd: "",
    banknm: "",
    bircd: "Y",
    birdt: null,
    dptcd: "",
    dptnm: "",
    emptype: "",
    exprdt: null,
    files: "",
    firredt: null,
    gradutype: "A",
    hirinsuyn: "",
    hmzipcode: "",
    insuzon: "",
    koraddr: "",
    location: sessionLocation,
    mailid: "",
    medamt: 0,
    medamtdiv: "",
    meddiv: "",
    medrat2: 0,
    monpay: 0,
    nationcd: "KR",
    orgdiv: sessionOrgdiv,
    overtimepay: 0,
    paycd: "",
    paygrad: "",
    payprovflg: "",
    payprovyn: "",
    perregnum: "",
    phoneno: "",
    pnsamt: 0,
    pnsamtdiv: "",
    pnsdiv: "",
    postcd: "",
    prsnnm: "",
    prsnnum: "",
    regcd: "",
    regorgdt: null,
    remark: "",
    rlnm: "",
    rtrdt: null,
    rtrrsn: "",
    salaryclass: "",
    schcd: "",
    sexcd: "M",
    telephon: "",
    workerdiv: "",
  });

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const InputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const RadioChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    if (unsavedName.length > 0) setDeletedName(unsavedName);
    setVisible(false);
  };

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "new"
      );

      if (workType == "N") {
        setInformation((prev) => ({
          ...prev,
          abilcd: defaultOption.find((item: any) => item.id == "abilcd")
            ?.valueCode,
          bircd: defaultOption.find((item: any) => item.id == "bircd")
            ?.valueCode,
          dptcd: defaultOption.find((item: any) => item.id == "dptcd")
            ?.valueCode,
          emptype: defaultOption.find((item: any) => item.id == "emptype")
            ?.valueCode,
          gradutype: defaultOption.find((item: any) => item.id == "gradutype")
            ?.valueCode,
          location: defaultOption.find((item: any) => item.id == "location")
            ?.valueCode,
          nationcd: defaultOption.find((item: any) => item.id == "nationcd")
            ?.valueCode,
          paycd: defaultOption.find((item: any) => item.id == "paycd")
            ?.valueCode,
          payprovflg: defaultOption.find((item: any) => item.id == "payprovflg")
            ?.valueCode,
          payprovyn: defaultOption.find((item: any) => item.id == "payprovyn")
            ?.valueCode,
          postcd: defaultOption.find((item: any) => item.id == "postcd")
            ?.valueCode,
          regcd: defaultOption.find((item: any) => item.id == "regcd")
            ?.valueCode,
          rtrrsn: defaultOption.find((item: any) => item.id == "rtrrsn")
            ?.valueCode,
          schcd: defaultOption.find((item: any) => item.id == "schcd")
            ?.valueCode,
          sexcd: defaultOption.find((item: any) => item.id == "sexcd")
            ?.valueCode,
          workerdiv: defaultOption.find((item: any) => item.id == "workerdiv")
            ?.valueCode,
        }));
      }
    }
  }, [customOptionData]);

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    prsnnm: "",
    rtryn: "T",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    // if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A6000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_prsnnum": filters.prsnnum,
        "@p_prsnnm": filters.prsnnm,
        "@p_rtryn": filters.rtryn,
        "@p_find_row_value": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      if (totalRowCnt > 0) {
        setInformation({
          abilcd: rows[0].abilcd,
          anlslry: rows[0].anlslry,
          attdatnum: rows[0].attdatnum,
          bankacnt: rows[0].bankacnt,
          bankcd: rows[0].bankcd,
          banknm: rows[0].banknm,
          bircd: rows[0].bircd,
          birdt: rows[0].birdt == "" ? null : toDate(rows[0].birdt),
          dptcd: rows[0].dptcd,
          dptnm: rows[0].dptnm,
          emptype: rows[0].emptype,
          exprdt: rows[0].exprdt == "" ? null : toDate(rows[0].exprdt),
          files: rows[0].files,
          firredt: rows[0].firredt == "" ? null : toDate(rows[0].firredt),
          gradutype: rows[0].gradutype,
          hirinsuyn: rows[0].hirinsuyn == "" ? "N" : rows[0].hirinsuyn,
          hmzipcode: rows[0].hmzipcode,
          insuzon: rows[0].insuzon,
          koraddr: rows[0].koraddr,
          location: rows[0].location,
          mailid: rows[0].mailid,
          medamt: rows[0].medamt,
          medamtdiv: rows[0].medamtdiv,
          meddiv: rows[0].meddiv == "" ? "N" : rows[0].meddiv,
          medrat2: rows[0].medrat2,
          monpay: rows[0].monpay,
          nationcd: rows[0].nationcd,
          orgdiv: rows[0].orgdiv,
          overtimepay: rows[0].overtimepay,
          paycd: rows[0].paycd,
          paygrad: rows[0].paygrad,
          payprovflg: rows[0].payprovflg,
          payprovyn: rows[0].payprovyn,
          perregnum: rows[0].perregnum,
          phoneno: rows[0].phoneno,
          pnsamt: rows[0].pnsamt,
          pnsamtdiv: rows[0].pnsamtdiv,
          pnsdiv: rows[0].pnsdiv == "" ? "N" : rows[0].pnsdiv,
          postcd: rows[0].postcd,
          prsnnm: rows[0].prsnnm,
          prsnnum: rows[0].prsnnum,
          regcd: rows[0].regcd,
          regorgdt: rows[0].regorgdt == "" ? null : toDate(rows[0].regorgdt),
          remark: rows[0].remark,
          rlnm: rows[0].rlnm,
          rtrdt: rows[0].rtrdt == "" ? null : toDate(rows[0].rtrdt),
          rtrrsn: rows[0].rtrrsn,
          salaryclass: rows[0].salaryclass,
          schcd: rows[0].schcd,
          sexcd: rows[0].sexcd,
          telephon: rows[0].telephon,
          workerdiv: rows[0].workerdiv,
        });
      } else {
        setInformation({
          abilcd: "",
          anlslry: 0,
          attdatnum: "",
          bankacnt: "",
          bankcd: "",
          banknm: "",
          bircd: "Y",
          birdt: null,
          dptcd: "",
          dptnm: "",
          emptype: "",
          exprdt: null,
          files: "",
          firredt: null,
          gradutype: "A",
          hirinsuyn: "",
          hmzipcode: "",
          insuzon: "",
          koraddr: "",
          location: sessionLocation,
          mailid: "",
          medamt: 0,
          medamtdiv: "",
          meddiv: "",
          medrat2: 0,
          monpay: 0,
          nationcd: "KR",
          orgdiv: sessionOrgdiv,
          overtimepay: 0,
          paycd: "",
          paygrad: "",
          payprovflg: "",
          payprovyn: "",
          perregnum: "",
          phoneno: "",
          pnsamt: 0,
          pnsamtdiv: "",
          pnsdiv: "",
          postcd: "",
          prsnnm: "",
          prsnnum: "",
          regcd: "",
          regorgdt: null,
          remark: "",
          rlnm: "",
          rtrdt: null,
          rtrrsn: "",
          salaryclass: "",
          schcd: "",
          sexcd: "M",
          telephon: "",
          workerdiv: "",
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (filters.isSearch && workType != "N") {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      setFilters((prev) => ({
        ...prev,
        orgdiv: sessionOrgdiv,
        prsnnum: data.prsnnum,
        prsnnm: "",
        rtryn: "T",
        isSearch: true,
        pgNum: 1,
      }));
    }
  }, []);

  function isResidentRegNoValid(residentRegNo: any) {
    var re = /^[0-9]{6}[0-9]{7}$/;
    if (!re.test(String(residentRegNo).toLowerCase())) {
      return false;
    }

    var regNos = residentRegNo.replace("-", "").split("");
    var checkNos = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
    var sum = 0;
    for (var i = 0; i < checkNos.length; i++) {
      sum = sum + checkNos[i] * Number(regNos[i]);
    }
    return (11 - (sum % 11)) % 10 == Number(regNos[12]);
  }

  const selectData = (selectedData: any) => {
    if (
      information.prsnnum == "" ||
      information.dptcd == "" ||
      information.perregnum == ""
    ) {
      alert("필수값을 채워주세요.");
    } else {
      if (isResidentRegNoValid(information.perregnum) == true) {
        const dptnm =
          dptcdListData.find((item: any) => item.dptcd == information.dptcd) ==
          undefined
            ? ""
            : dptcdListData.find((item: any) => item.dptcd == information.dptcd)
                ?.dptnm;

        setParaData((prev) => ({
          ...prev,
          work_type: workType,
          orgdiv: sessionOrgdiv,
          prsnnum: information.prsnnum,
          location: information.location,
          prsnnm: information.prsnnm,
          nationcd: information.nationcd,
          dptcd: information.dptcd,
          dptnm: dptnm == undefined ? "" : dptnm,
          postcd: information.postcd,
          abilcd: information.abilcd,
          regcd: information.regcd,
          perregnum: information.perregnum,
          birdt:
            information.birdt == null
              ? ""
              : convertDateToStr(information.birdt),
          bircd: information.bircd,
          sexcd: information.sexcd,
          workerdiv: information.workerdiv,
          gradutype: information.gradutype,
          regorgdt:
            information.regorgdt == null
              ? ""
              : convertDateToStr(information.regorgdt),
          rtrdt:
            information.rtrdt == null
              ? ""
              : convertDateToStr(information.rtrdt),
          rtrrsn: information.rtrrsn,
          emptype: information.emptype,
          hmzipcode: information.hmzipcode,
          koraddr: information.koraddr,
          telephon: information.telephon,
          phoneno: information.phoneno,
          schcd: information.schcd,
          paycd: information.paycd,
          hirinsuyn:
            information.hirinsuyn == true
              ? "Y"
              : information.hirinsuyn == false
              ? "N"
              : information.hirinsuyn,
          payprovflg: information.payprovflg,
          pnsdiv:
            information.pnsdiv == true
              ? "Y"
              : information.pnsdiv == false
              ? "N"
              : information.pnsdiv,
          pnsamt: information.pnsamt,
          meddiv:
            information.meddiv == true
              ? "Y"
              : information.meddiv == false
              ? "N"
              : information.meddiv,
          medamt: information.medamt,
          medrat2: information.medrat2,
          bankcd: information.bankcd,
          bankacnt: information.bankacnt,
          rlnm: information.rlnm,
          anlslry: information.anlslry,
          bnsstd: information.overtimepay,
          payprovyn: information.payprovyn,
          mailid: information.mailid,
          attdatnum: information.attdatnum,
          remark: information.remark,
        }));
      } else {
        alert("유효한 주민번호를 입력해주세요.");
      }
    }
  };

  const [ParaData, setParaData] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    prsnnum: "",
    location: "",
    prsnnm: "",
    nationcd: "",
    dptcd: "",
    dptnm: "",
    postcd: "",
    abilcd: "",
    regcd: "",
    perregnum: "",
    birdt: "",
    bircd: "",
    sexcd: "",
    workerdiv: "",
    gradutype: "",
    regorgdt: "",
    rtrdt: "",
    rtrrsn: "",
    emptype: "",
    hmzipcode: "",
    koraddr: "",
    telephon: "",
    phoneno: "",
    schcd: "",
    paycd: "",
    hirinsuyn: "",
    payprovflg: "",
    pnsdiv: "",
    pnsamt: 0,
    meddiv: "",
    medamt: 0,
    medrat2: 0,
    bankcd: "",
    bankacnt: "",
    rlnm: "",
    anlslry: 0,
    bnsstd: 0,
    payprovyn: "",
    mailid: "",
    attdatnum: "",
    remark: "",
  });

  //삭제 프로시저 파라미터
  const para: Iparameters = {
    procedureName: "P_HU_A6000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.work_type,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_prsnnum": ParaData.prsnnum,
      "@p_location": ParaData.location,
      "@p_prsnnm": ParaData.prsnnm,
      "@p_nationcd": ParaData.nationcd,
      "@p_dptcd": ParaData.dptcd,
      "@p_dptnm": ParaData.dptnm,
      "@p_postcd": ParaData.postcd,
      "@p_abilcd": ParaData.abilcd,
      "@p_regcd": ParaData.regcd,
      "@p_perregnum": ParaData.perregnum,
      "@p_birdt": ParaData.birdt,
      "@p_bircd": ParaData.bircd,
      "@p_sexcd": ParaData.sexcd,
      "@p_workerdiv": ParaData.workerdiv,
      "@p_gradutype": ParaData.gradutype,
      "@p_regorgdt": ParaData.regorgdt,
      "@p_rtrdt": ParaData.rtrdt,
      "@p_rtrrsn": ParaData.rtrrsn,
      "@p_emptype": ParaData.emptype,
      "@p_hmzipcode": ParaData.hmzipcode,
      "@p_koraddr": ParaData.koraddr,
      "@p_telephon": ParaData.telephon,
      "@p_phoneno": ParaData.phoneno,
      "@p_schcd": ParaData.schcd,
      "@p_paycd": ParaData.paycd,
      "@p_hirinsuyn": ParaData.hirinsuyn,
      "@p_payprovflg": ParaData.payprovflg,
      "@p_pnsdiv": ParaData.pnsdiv,
      "@p_pnsamt": ParaData.pnsamt,
      "@p_meddiv": ParaData.meddiv,
      "@p_medamt": ParaData.medamt,
      "@p_medrat2": ParaData.medrat2,
      "@p_bankcd": ParaData.bankcd,
      "@p_bankacnt": ParaData.bankacnt,
      "@p_rlnm": ParaData.rlnm,
      "@p_anlslry": ParaData.anlslry,
      "@p_bnsstd": ParaData.bnsstd,
      "@p_payprovyn": ParaData.payprovyn,
      "@p_mailid": ParaData.mailid,
      "@p_attdatnum": ParaData.attdatnum,
      "@p_remark": ParaData.remark,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A6000W",
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
      setUnsavedName([]);
      setUnsavedAttadatnums([]);
      reload(data.returnString);
      if (workType == "N") {
        setVisible(false);
      } else {
        setFilters((prev) => ({
          ...prev,
          isSearch: true,
          pgNum: 1,
        }));
      }
      setParaData({
        work_type: "",
        orgdiv: sessionOrgdiv,
        prsnnum: "",
        location: "",
        prsnnm: "",
        nationcd: "",
        dptcd: "",
        dptnm: "",
        postcd: "",
        abilcd: "",
        regcd: "",
        perregnum: "",
        birdt: "",
        bircd: "",
        sexcd: "",
        workerdiv: "",
        gradutype: "",
        regorgdt: "",
        rtrdt: "",
        rtrrsn: "",
        emptype: "",
        hmzipcode: "",
        koraddr: "",
        telephon: "",
        phoneno: "",
        schcd: "",
        paycd: "",
        hirinsuyn: "",
        payprovflg: "",
        pnsdiv: "",
        pnsamt: 0,
        meddiv: "",
        medamt: 0,
        medrat2: 0,
        bankcd: "",
        bankacnt: "",
        rlnm: "",
        anlslry: 0,
        bnsstd: 0,
        payprovyn: "",
        mailid: "",
        attdatnum: "",
        remark: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.work_type != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  return (
    <>
      <Window
        titles={workType == "N" ? "일용직 인사생성" : "일용직 인사수정"}
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
                <th>사번</th>
                <td>
                  {workType == "N" ? (
                    <Input
                      name="prsnnum"
                      type="text"
                      value={information.prsnnum}
                      onChange={InputChange}
                      className="required"
                    />
                  ) : (
                    <Input
                      name="prsnnum"
                      type="text"
                      value={information.prsnnum}
                      className="readonly"
                    />
                  )}
                </td>
                <th>성명</th>
                <td>
                  <Input
                    name="prsnnm"
                    type="text"
                    value={information.prsnnm}
                    onChange={InputChange}
                  />
                </td>
                <th>일용직구분</th>
                <td>
                  {workType == "N"
                    ? customOptionData !== null && (
                        <CustomOptionRadioGroup
                          name="workerdiv"
                          customOptionData={customOptionData}
                          changeData={RadioChange}
                          type="new"
                        />
                      )
                    : bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="workerdiv"
                          value={information.workerdiv}
                          bizComponentId="R_WORKERDIV"
                          bizComponentData={bizComponentData}
                          changeData={RadioChange}
                        />
                      )}
                </td>
                <th>입사구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="regcd"
                      value={information.regcd}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>국적</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="nationcd"
                      value={information.nationcd}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>입사일</th>
                <td>
                  <DatePicker
                    name="regorgdt"
                    value={information.regorgdt}
                    format="yyyy-MM-dd"
                    onChange={InputChange}
                    placeholder=""
                  />
                </td>
                <th>퇴사일</th>
                <td>
                  <DatePicker
                    name="rtrdt"
                    value={information.rtrdt}
                    format="yyyy-MM-dd"
                    onChange={InputChange}
                    placeholder=""
                  />
                </td>
                <th>퇴직사유</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="rtrrsn"
                      value={information.rtrrsn}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>주민번호</th>
                <td>
                  <MaskedTextBox
                    mask="0000000000000"
                    name="perregnum"
                    value={information.perregnum}
                    onChange={InputChange}
                    className="required"
                  />
                </td>
                <th>성별</th>
                <td>
                  {workType == "N"
                    ? customOptionData !== null && (
                        <CustomOptionRadioGroup
                          name="sexcd"
                          customOptionData={customOptionData}
                          changeData={RadioChange}
                          type="new"
                        />
                      )
                    : bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="sexcd"
                          value={information.sexcd}
                          bizComponentId="R_SEXCD"
                          bizComponentData={bizComponentData}
                          changeData={RadioChange}
                        />
                      )}
                </td>
                <th>내외국인</th>
                <td>
                  {workType == "N"
                    ? customOptionData !== null && (
                        <CustomOptionRadioGroup
                          name="gradutype"
                          customOptionData={customOptionData}
                          changeData={RadioChange}
                          type="new"
                        />
                      )
                    : bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="gradutype"
                          value={information.gradutype}
                          bizComponentId="R_GRADUTYPE"
                          bizComponentData={bizComponentData}
                          changeData={RadioChange}
                        />
                      )}
                </td>
                <th>개인메일</th>
                <td>
                  <Input
                    name="mailid"
                    type="text"
                    value={information.mailid}
                    onChange={InputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>생년월일</th>
                <td>
                  <DatePicker
                    name="birdt"
                    value={information.birdt}
                    format="yyyy-MM-dd"
                    onChange={InputChange}
                    placeholder=""
                  />
                </td>
                <th>양/음</th>
                <td>
                  {workType == "N"
                    ? customOptionData !== null && (
                        <CustomOptionRadioGroup
                          name="bircd"
                          customOptionData={customOptionData}
                          changeData={RadioChange}
                          type="new"
                        />
                      )
                    : bizComponentData !== null && (
                        <BizComponentRadioGroup
                          name="bircd"
                          value={information.bircd}
                          bizComponentId="R_BIRCD"
                          bizComponentData={bizComponentData}
                          changeData={RadioChange}
                        />
                      )}
                </td>
                <th>급여지급방법</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="payprovflg"
                      value={information.payprovflg}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>연장수당</th>
                <td>
                  <NumericTextBox
                    name="overtimepay"
                    value={information.overtimepay}
                    format="n0"
                    onChange={InputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>신고사업장</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="location"
                      value={information.location}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>급여지급방식</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="paycd"
                      value={information.paycd}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>연장급여방식</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="payprovyn"
                      value={information.payprovyn}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>시급(일급)</th>
                <td>
                  <NumericTextBox
                    name="anlslry"
                    value={information.anlslry}
                    format="n2"
                    onChange={InputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>부서코드</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="dptcd"
                      value={information.dptcd}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      textField="dptnm"
                      valueField="dptcd"
                      type="new"
                      className="required"
                    />
                  )}
                </td>
                <th>직급</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="postcd"
                      value={information.postcd}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>직책</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="abilcd"
                      value={information.abilcd}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>사원구분</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="emptype"
                      value={information.emptype}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>고용보험여부</th>
                <td>
                  <Checkbox
                    name="hirinsuyn"
                    value={
                      information.hirinsuyn == "Y"
                        ? true
                        : information.hirinsuyn == "N"
                        ? false
                        : information.hirinsuyn
                    }
                    onChange={InputChange}
                  />
                </td>
                <th>국민연금</th>
                <td>
                  <div className="flex align-items-center gap-2">
                    <div>
                      <Checkbox
                        name="pnsdiv"
                        value={
                          information.pnsdiv == "Y"
                            ? true
                            : information.pnsdiv == "N"
                            ? false
                            : information.pnsdiv
                        }
                        onChange={InputChange}
                      />
                    </div>
                    <NumericTextBox
                      name="pnsamt"
                      value={information.pnsamt}
                      format="n0"
                      onChange={InputChange}
                    />
                  </div>
                </td>
                <th>건강보험</th>
                <td>
                  <div className="flex align-items-center gap-2">
                    <div>
                      <Checkbox
                        name="meddiv"
                        value={
                          information.meddiv == "Y"
                            ? true
                            : information.meddiv == "N"
                            ? false
                            : information.meddiv
                        }
                        onChange={InputChange}
                      />
                    </div>
                    <NumericTextBox
                      name="medamt"
                      value={information.medamt}
                      format="n0"
                      onChange={InputChange}
                    />
                  </div>
                </td>
                <th>요양보험</th>
                <td>
                  <NumericTextBox
                    name="medrat2"
                    value={information.medrat2}
                    format="n2"
                    onChange={InputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>최종학력</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="schcd"
                      value={information.schcd}
                      customOptionData={customOptionData}
                      changeData={ComboBoxChange}
                      type="new"
                    />
                  )}
                </td>
                <th>은행코드</th>
                <td>
                  <Input
                    name="bankcd"
                    type="text"
                    value={information.bankcd}
                    className="readonly"
                  />
                  <ButtonInInput>
                    <Button
                      type={"button"}
                      onClick={onBankcdWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>은행명</th>
                <td>
                  <Input
                    name="banknm"
                    type="text"
                    value={information.banknm}
                    className="readonly"
                  />
                </td>
                <th>실수령자</th>
                <td>
                  <Input
                    name="rlnm"
                    type="text"
                    value={information.rlnm}
                    onChange={InputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>전화번호</th>
                <td colSpan={3}>
                  <Input
                    name="phoneno"
                    type="text"
                    value={information.phoneno}
                    onChange={InputChange}
                  />
                </td>
                <th>휴대전화번호</th>
                <td colSpan={3}>
                  <Input
                    name="telephon"
                    type="text"
                    value={information.telephon}
                    onChange={InputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>주민등록지우편번호</th>
                <td colSpan={3}>
                  <Input
                    name="hmzipcode"
                    type="text"
                    value={information.hmzipcode}
                    onChange={InputChange}
                  />
                  <ButtonInInput>
                    <Button
                      type={"button"}
                      onClick={onZipCodeWndClick}
                      icon="more-horizontal"
                      fillMode="flat"
                    />
                  </ButtonInInput>
                </td>
                <th>주민등록지주소</th>
                <td colSpan={3}>
                  <Input
                    name="koraddr"
                    type="text"
                    value={information.koraddr}
                    onChange={InputChange}
                  />
                </td>
              </tr>
              <tr>
                <th>첨부파일</th>
                <td colSpan={7}>
                  <Input
                    name="files"
                    type="text"
                    value={information.files}
                    className="readonly"
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
              <tr>
                <th>비고</th>
                <td colSpan={7}>
                  <TextArea
                    value={information.remark}
                    name="remark"
                    rows={5}
                    onChange={InputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer className="BottomContainer">
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              확인
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
      {bankcdWindowVisible && (
        <BankCDWindow
          setVisible={setBankcdWindowVisible}
          setData={getbankcdData}
        />
      )}
      {zipCodeWindowVisible && (
        <ZipCodeWindow
          setVisible={setZipCodeWindowVisibile}
          setData={getZipCodeData}
          para={information.hmzipcode}
        />
      )}
      {attachmentsWindowVisible && (
        <PopUpAttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
        />
      )}
    </>
  );
};

export default CopyWindow;
