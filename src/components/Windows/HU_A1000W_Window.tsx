import * as React from "react";
import { useEffect, useState } from "react";

import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  Title,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { Iparameters } from "../../store/types";
import {
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  dateformat,
  findMessage,
  isValidDate,
  GetPropertyValueByName,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";

import { Input } from "@progress/kendo-react-inputs";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import BizComponentRadioGroup from "../RadioGroups/BizComponentRadioGroup";

import { Button } from "@progress/kendo-react-buttons";

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: "U" | "N";
  prsnnum?: string;
  para?: Iparameters; //{};
  modal?: boolean;
};

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  prsnnum,
  modal = false,
}: TKendoWindow) => {
  const userId = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const pathname: string = window.location.pathname.replace("/", "");
  const processApi = useApi();
  const [isInitSearch, setIsInitSearch] = useState(false);

  const [filters, setFilters] = useState<{ [name: string]: any }>({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    prsnnum: "", //사번
    rtrchk: "", // 재직여부
    email: "", //이메일
    prsnnm: "", //성명
    paycd: "", //급여지급유형
    koraddr: "", //주민등록지주소
    perregnum: "", //주민번호
    sexcd: "", // 성별
    zipcode: "", //우편번호
    bircd: "", // 양력, 음력여부
    hmaddr: "", //실제거주지주소
    extnum: "", //내선번호
    phonenum: "", // 전화번호
    remark: "", //비고
    bankcd: "", // 은행
    banknm: "", // 은행명
    bankacnt: "", // 계좌번호
    payyn: "", // 급여지급여부
    // 계좌번호
    bnskind: "", // 상여금계산여부
    bankacntuser: "", // 예금주
    workchk: "", // 근태관리여부
    bankdatnum: "", // 통장사본
    hirinsuyn: "", // 고용보험여부
    houseyn: "", // 세대주구분
    caltaxyn: "", // 세액계산대상여부
    yrdclyn: "", // 연말정산신고대상여부
    below2kyn: "", // 직전년도총급여액2500만원이하
    taxcd: "", // 세액구분
    exmtaxgb: "", // 취업청년세감면
    incgb: "", // 소득세조정률
    medgrad: "", //의료보험등급
    medinsunum: "", // 의료보험번호
    pnsgrad: "", // 국민연금등급
    rtrtype: "", //퇴직급계산구분
    yrchk: "", //연차관리여부
    dayoffdiv: "", //연차발생기준
    attdatnum: "", // 첨부파일번호
    files: "", //첨부파일명

    agenum: 0, //경로자65
    agenum70: 0, //경로자70
    sptnum: 0, //"" 부양자(본인미포함)
    brngchlnum: 0, // 자녀양육
    dfmnum: 0, // 장애자
    childnum: 0, // 다자녀
    fam1: 0, //가족수당배우
    fam2: 0, // 가족수당 자녀

    regorgdt: null, //입사일
    occudate: null, //연차발생기준일
    birdt: null, //생년월일
    firredt: null, //정산입사일
    rtrdt: null, //퇴사일
    meddate: null, // 건강보험취득일
    anudate: null, // 국민연금취득일
    hirdate: null, // 고용보험취득일
    exstartdt: null, // 감면시작
    exenddt: null, // 감면종료
  });

  const [paraData, setParaData] = useState<{ [name: string]: any }>({
    work_Type: "",
    orgdiv: "01",
    location: "",
    prsnnum: "", //사번
    rtrchk: "", // 재직여부
    email: "", //이메일
    prsnnm: "", //성명
    paycd: "", //급여지급유형
    koraddr: "", //주민등록지주소
    perregnum: "", //주민번호
    sexcd: "", // 성별
    zipcode: "", //우편번호
    bircd: "", // 양력, 음력여부
    hmaddr: "", //실제거주지주소
    extnum: "", //내선번호
    phonenum: "", // 전화번호
    remark: "", //비고
    bankcd: "", // 은행
    banknm: "", // 은행명
    bankacnt: "", // 계좌번호
    payyn: "", // 급여지급여부
    // 계좌번호
    bnskind: "", // 상여금계산여부
    bankacntuser: "", // 예금주
    workchk: "", // 근태관리여부
    bankdatnum: "", // 통장사본
    hirinsuyn: "", // 고용보험여부
    houseyn: "", // 세대주구분
    caltaxyn: "", // 세액계산대상여부
    yrdclyn: "", // 연말정산신고대상여부
    below2kyn: "", // 직전년도총급여액2500만원이하
    taxcd: "", // 세액구분
    exmtaxgb: "", // 취업청년세감면
    incgb: "", // 소득세조정률
    medgrad: "", //의료보험등급
    medinsunum: "", // 의료보험번호
    pnsgrad: "", // 국민연금등급
    rtrtype: "", //퇴직급계산구분
    yrchk: "", //연차관리여부
    dayoffdiv: "", //연차발생기준
    attdatnum: "", // 첨부파일번호
    files: "", //첨부파일명

    agenum: 0, //경로자65
    agenum70: 0, //경로자70
    sptnum: 0, //"" 부양자(본인미포함)
    brngchlnum: 0, // 자녀양육
    dfmnum: 0, // 장애자
    childnum: 0, // 다자녀
    fam1: 0, //가족수당배우
    fam2: 0, // 가족수당 자녀

    regorgdt: null, //입사일
    occudate: null, //연차발생기준일
    birdt: null, //생년월일
    firredt: null, //정산입사일
    rtrdt: null, //퇴사일
    meddate: null, // 건강보험취득일
    anudate: null, // 국민연금취득일
    hirdate: null, // 고용보험취득일
    exstartdt: null, // 감면시작
    exenddt: null, // 감면종료
  });

  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (workType === "N") {
      if (customOptionData !== null) {
        const defaultOption = GetPropertyValueByName(customOptionData.menuCustomDefaultOptions, "new");

        setFilters((prev) => ({
          ...prev,
          below2kyn: defaultOption.find((item: any) => item.id === "below2kyn")
            .valueCode,
          bircd: defaultOption.find((item: any) => item.id === "bircd")
            .valueCode,
          bnskind: defaultOption.find((item: any) => item.id === "bnskind")
            .valueCode,
          caltaxyn: defaultOption.find((item: any) => item.id === "caltaxyn")
            .valueCode,
          dayoffdiv: defaultOption.find((item: any) => item.id === "dayoffdiv")
            .valueCode,
          dfmyn: defaultOption.find((item: any) => item.id === "dfmyn")
            .valueCode,
          dfmyn2: defaultOption.find((item: any) => item.id === "dfmyn2")
            .valueCode,
          exmtaxgb: defaultOption.find((item: any) => item.id === "exmtaxgb")
            .valueCode,
          hirinsuyn: defaultOption.find((item: any) => item.id === "hirinsuyn")
            .valueCode,
          houseyn: defaultOption.find((item: any) => item.id === "houseyn")
            .valueCode,
          incgb: defaultOption.find((item: any) => item.id === "incgb")
            .valueCode,
          laboryn: defaultOption.find((item: any) => item.id === "laboryn")
            .valueCode,
          location: defaultOption.find((item: any) => item.id === "location")
            .valueCode,
          milyn: defaultOption.find((item: any) => item.id === "milyn")
            .valueCode,
          notaxe: defaultOption.find((item: any) => item.id === "notaxe")
            .valueCode,
          paycd: defaultOption.find((item: any) => item.id === "paycd")
            .valueCode,
          rtrchk: defaultOption.find((item: any) => item.id === "rtrchk")
            .valueCode,
          rtrtype: defaultOption.find((item: any) => item.id === "rtrtype")
            .valueCode,
          sexcd: defaultOption.find((item: any) => item.id === "sexcd")
            .valueCode,
          sps: defaultOption.find((item: any) => item.id === "sps").valueCode,
          taxcd: defaultOption.find((item: any) => item.id === "taxcd")
            .valueCode,
          wmn: defaultOption.find((item: any) => item.id === "wmn").valueCode,
          workchk: defaultOption.find((item: any) => item.id === "workchk")
            .valueCode,
          yrchk: defaultOption.find((item: any) => item.id === "yrchk")
            .valueCode,
          yrdclyn: defaultOption.find((item: any) => item.id === "yrdclyn")
            .valueCode,
        }));
      }
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_SEXCD,R_YN2,R_BIRCD,R_dayoffdiv,R_HOUSEYN,R_Rtrtype",
    // 성별
    setBizComponentData
  );

  useEffect(() => {}, [bizComponentData]);

  // Input Change 함수 => 사용자가 Input에 입력한 값을 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target === undefined ? e : e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
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
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1800,
    height: 900,
  });

  // 팝업창 오픈 후 데이터 조회
  useEffect(() => {
    if (workType === "U" && isInitSearch === false) {
      fetchMain();
    }
  }, []);

  useEffect(() => {
    if (paraData.work_Type === "N" || paraData.work_Type === "U") {
      fetchGridSaved();
    }
  }, [paraData]);

  // 조회 쿼리 호출 후 값 바인딩
  const fetchMain = async () => {
    let data: any;

    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,

      parameters: {
        "@p_work_type": "DETAIL",
        "@p_orgdiv": "01",
        "@p_location": "01",
        "@p_dptcd": "",
        "@p_prsnnum": prsnnum,
        "@p_prsnnm": "",
        "@p_rtrchk": "",
        "@p_find_row_value": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const row = data.tables[0].Rows[0];

      setFilters((prev) => {
        return {
          ...prev,
          location: row.location,
          prsnnum: row.prsnnum, //사번
          rtrchk: row.rtrchk, // 재직유무
          email: row.email, //이메일
          prsnnm: row.prsnnm, //성명
          paycd: row.paycd, //급여지급유형
          koraddr: row.koraddr, //주민등록지주소
          perregnum: row.perregnum, //주민번호
          sexcd: row.sexcd, // 성별
          zipcode: row.zipcode, //우편번호
          bircd: row.bircd, // 양력, 음력여부
          hmaddr: row.hmaddr, //실제거주지주소
          extnum: row.extnum, //내선번호
          phonenum: row.phonenum, // 전화번호
          remark: row.remark, //비고
          bankcd: row.bankcd, // 은행
          banknm: row.banknm, // 은행명
          bankacnt: row.bankacnt, // 계좌번호
          payyn: row.payyn, // 급여지급여부
          // 계좌번호
          bnskind: row.bnskind, // 상여금계산여부
          bankacntuser: row.bankacntuser, // 예금주
          workchk: row.workchk, // 근태관리여부
          bankdatnum: row.bankdatnum, // 통장사본
          hirinsuyn: row.hirinsuyn, // 고용보험여부
          houseyn: row.houseyn, // 세대주구분
          caltaxyn: row.caltaxyn, // 세액계산대상여부
          yrdclyn: row.yrdclyn, // 연말정산신고대상여부
          below2kyn: row.below2kyn, // 직전년도총급여액2500만원이하
          taxcd: row.taxcd, // 세액구분
          exmtaxgb: row.exmtaxgb, // 취업청년세감면
          incgb: row.incgb, // 소득세조정률
          medgrad: row.medgrad, //의료보험등급
          medinsunum: row.medinsunum, // 의료보험번호
          pnsgrad: row.pnsgrad, // 국민연금등급
          rtrtype: row.rtrtype, //퇴직급계산구분
          yrchk: row.yrchk, //연차관리여부
          dayoffdiv: row.dayoffdiv, //연차발생기준
          attdatnum: row.attdatnum, // 첨부파일번호
          files: row.files, //첨부파일명
          agenum: row.agenum, //경로자65
          agenum70: row.agenum70, //경로자70
          sptnum: row.sptnum, // 부양자(본인미포함)
          brngchlnum: row.brngchlnum, // 자녀양육
          dfmnum: row.dfmnum, // 장애자
          childnum: row.childnum, // 다자녀
          fam1: row.fam1, //가족수당배우
          fam2: row.fam2, // 가족수당 자녀

          meddate: isValidDate(row.meddate)
            ? new Date(dateformat(row.meddate))
            : null, // 건강보험취득일
          anudate: isValidDate(row.anudate)
            ? new Date(dateformat(row.anudate))
            : null, // 국민연금취득일
          hirdate: isValidDate(row.hirdate)
            ? new Date(dateformat(row.hirdate))
            : null, // 고용보험취득일
          exstartdt: isValidDate(row.exstartdt)
            ? new Date(dateformat(row.exstartdt))
            : null, // 감면시작
          exenddt: isValidDate(row.exenddt)
            ? new Date(dateformat(row.exenddt))
            : null, // 감면종료
          firredt: isValidDate(row.firredt)
            ? new Date(dateformat(row.firredt))
            : null, //정산입사일
          birdt: isValidDate(row.birdt)
            ? new Date(dateformat(row.birdt))
            : null, //생년월일
          occudate: isValidDate(row.occudate)
            ? new Date(dateformat(row.occudate))
            : null, ///연차발생기준일
          regorgdt: isValidDate(row.regorgdt)
            ? new Date(dateformat(row.regorgdt))
            : null, //입사일
          rtrdt: isValidDate(row.rtrdt)
            ? new Date(dateformat(row.rtrdt))
            : null, //퇴사일
        };
      });
    }

    setIsInitSearch(true);
  };

  // 저장 프로시저 호출
  const fetchGridSaved = async () => {
    let data: any;

    // 저장 프로시저
    const parameters: Iparameters = {
      procedureName: "P_HU_A1000W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": workType,
        "@p_orgdiv": "01",
        "@p_location": paraData.location,
        "@p_prsnnum": paraData.prsnnum,
        "@p_prsnnm": paraData.prsnnm,
        "@p_perregnum": paraData.perregnum,
        "@p_birdt": paraData.birdt,
        "@p_bircd": paraData.bircd,
        "@p_sexcd": paraData.sexcd,
        "@p_firredt": paraData.firredt,
        "@p_regorgdt": paraData.regorgdt,
        "@p_rtrdt": paraData.rtrdt,
        "@p_zipcode": paraData.zipcode,
        "@p_koraddr": paraData.koraddr,
        "@p_hmaddr": paraData.hmaddr,
        "@p_phonenum": paraData.phonenum,
        "@p_extnum": paraData.extnum,
        "@p_paycd": paraData.paycd,
        "@p_taxcd": paraData.taxcd,
        "@p_hirinsuyn": paraData.hirinsuyn,
        "@p_payyn": paraData.payyn,
        "@p_caltaxyn": paraData.caltaxyn,
        "@p_yrdclyn": paraData.yrdclyn,
        "@p_bankcd": paraData.bankcd,
        "@p_bankacnt": paraData.bankacnt,
        "@p_bankacntuser": paraData.bankacntuser,
        "@p_medgrad": paraData.medgrad,
        "@p_medinsunum": paraData.medinsunum,
        "@p_pnsgrad": paraData.pnsgrad,
        "@p_meddate": paraData.meddate,
        "@p_anudate": paraData.anudate,
        "@p_hirdate": paraData.hirdate,
        "@p_sptnum": paraData.sptnum,
        "@p_dfmnum": paraData.dfmnum,
        "@p_agenum": paraData.agenum,
        "@p_agenum70": paraData.agenum70,
        "@p_brngchlnum": paraData.brngchlnum,
        "@p_fam1": paraData.fam1,
        "@p_fam2": paraData.fam2,
        "@p_bnskind": paraData.bnskind,
        "@p_childnum": paraData.childnum,
        "@p_houseyn": paraData.houseyn,
        "@p_remark": paraData.remark,
        "@p_attdatnum": paraData.attdatnum,
        "@p_incgb": paraData.incgb,
        "@p_exmtaxgb": paraData.exmtaxgb,
        "@p_exstartdt": paraData.exstartdt,
        "@p_exenddt": paraData.exenddt,
        "@p_workchk": paraData.workchk,
        "@p_yrchk": paraData.yrchk,
        "@p_bankdatnum": paraData.bankdatnum,
        "@p_below2kyn": paraData.below2kyn,
        "@p_occudate": paraData.occudate,
        "@p_dayoffdiv": paraData.dayoffdiv,
        "@p_rtrtype": paraData.rtrtype,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": "HU_A1000W",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      if (workType === "U") {
        reloadData(paraData.prsnnum);
        fetchMain();
      } else {
        reloadData(data.returnString);
        getVisible(false);
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert("[" + data.statusCode + "] " + data.resultMessage);
    }
    // // workType 초기화
    paraData.work_Type = "";
  };

  //저장 버튼 클릭 시 호출
  const handleSubmit = (dataItem: { [name: string]: any }) => {
    let valid = true;

    //검증
    try {
      if (!filters.prsnnum) {
        throw findMessage(messagesData, "HU_A1000W_001"); // 사번을 입력하여 주십시오.
      }
      if (!filters.prsnnum) {
        // 성명을 입력하여 주십시오.
        throw findMessage(messagesData, "HU_A1000W_002");
      }
      if (!filters.perregnum) {
        // 주민번호를 입력하여 주십시오.
        throw findMessage(messagesData, "HU_A1000W_003");
      }
      if (!filters.birdt) {
        // 생년월일을 입력하여 주십시오.
        throw findMessage(messagesData, "HU_A1000W_004");
      }
      if (!filters.regorgdt) {
        // 입사일을 입력하여 주십시오.
        throw findMessage(messagesData, "HU_A1000W_004");
      }
    } catch (e) {
      alert(e);
      valid = false;
    }

    if (!valid) {
      return false;
    }

    setParaData((prev) => ({
      ...prev,
      work_Type: workType,
      location: filters.location,
      prsnnum: filters.prsnnum,
      prsnnm: filters.prsnnm,
      rtrchk: filters.rtrchk,
      email: filters.email,
      paycd: filters.paycd,
      koraddr: filters.koraddr,
      perregnum: filters.perregnum,
      sexcd: filters.sexcd,
      zipcode: filters.zipcode,
      bircd: filters.bircd,
      hmaddr: filters.hmaddr,
      extnum: filters.extnum,
      phonenum: filters.phonenum,
      remark: filters.remark,
      bankcd: filters.bankcd,
      banknm: filters.banknm,
      bankacnt: filters.bankacnt,
      payyn: filters.payyn,
      bnskind: filters.bnskind,
      bankacntuse: filters.bankacntuse,
      workchk: filters.workchk,
      bankdatnum: filters.bankdatnum,
      hirinsuyn: filters.hirinsuyn,
      houseyn: filters.houseyn,
      caltaxyn: filters.caltaxyn,
      yrdclyn: filters.yrdclyn,
      below2kyn: filters.below2kyn,
      taxcd: filters.taxcd,
      exmtaxgb: filters.exmtaxgb,
      incgb: filters.incgb,
      medgrad: filters.medgrad,
      medinsunum: filters.medinsunum,
      pnsgrad: filters.pnsgrad,
      rtrtype: filters.rtrtype,
      yrchk: filters.yrchk,
      dayoffdiv: filters.dayoffdiv,
      attdatnum: filters.attdatnum,
      files: filters.files,
      agenum: filters.agenum,
      agenum70: filters.agenum70,
      sptnum: filters.sptnum,
      brngchlnum: filters.brngchlnum,
      dfmnum: filters.dfmnum,
      childnum: filters.childnum,
      fam1: filters.fam1,
      fam2: filters.fam2,
      regorgdt: convertDateToStr(filters.regorgdt),
      occudate: convertDateToStr(filters.occudate),
      birdt: convertDateToStr(filters.birdt),
      firredt: convertDateToStr(filters.firredt),
      rtrdt: convertDateToStr(filters.rtrdt),
      meddate: convertDateToStr(filters.meddate),
      anudate: convertDateToStr(filters.anudate),
      hirdate: convertDateToStr(filters.hirdate),
      exstartdt: convertDateToStr(filters.exstartdt),
      exenddt: convertDateToStr(filters.exenddt),
    }));
  };

  // 닫기 버튼 클릭 이벤트
  const onClose = () => {
    getVisible(false);
  };

  return (
    <Window
      title={workType === "N" ? "신규등록" : "인사상세"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
      <Title>기본</Title>
      <FormBoxWrap border={true}>
        <FormBox>
          <colgroup>
            <col width="0%" />
            <col width="10%" />
            <col width="0%" />
            <col width="10%" />
            <col width="0%" />
            <col width="10%" />
            <col width="0%" />
            <col width="35%" />
            <col width="0%" />
            <col width="35%" />
          </colgroup>
          <tbody>
            <tr>
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  className={workType === "N" ? "required" : "readonly"}
                  onChange={filterInputChange}
                  readOnly={workType === "N" ? false : true}
                />
              </td>
              <th>재직여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="rtrchk"
                    value={filters.rtrchk}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                  />
                )}
              </td>

              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="new"
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterInputChange}
                  />
                )}
              </td>
              <th>이메일</th>
              <td colSpan={3}>
                <Input
                  name="email"
                  type="text"
                  value={filters.email}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>성명</th>
              <td colSpan={3}>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  className="required"
                  onChange={filterInputChange}
                />
              </td>
              <th>급여지급유형</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="new"
                    name="paycd"
                    value={filters.paycd}
                    customOptionData={customOptionData}
                    changeData={filterInputChange}
                  />
                )}
              </td>

              <th>주민등록지주소</th>
              <td colSpan={3}>
                <Input
                  name="koraddr"
                  type="text"
                  value={filters.koraddr}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>주민번호</th>
              <td colSpan={3}>
                <Input
                  name="perregnum"
                  type="text"
                  value={filters.perregnum}
                  className="required"
                  onChange={filterInputChange}
                />
              </td>
              <th>정산입사일</th>
              <td>
                <DatePicker
                  name="firredt"
                  value={filters.firredt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>
              <th>우편번호</th>
              <td colSpan={3}>
                <Input
                  name="zipcode"
                  type="text"
                  value={filters.zipcode}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th></th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="sexcd"
                    value={filters.sexcd}
                    bizComponentId="R_SEXCD"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th></th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="bircd"
                    value={filters.bircd}
                    bizComponentId="R_BIRCD"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>연차발생기준일</th>
              <td>
                <DatePicker
                  name="occudate"
                  value={filters.occudate}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>

              <th>실제거주지주소</th>
              <td colSpan={3}>
                <Input
                  name="hmaddr"
                  type="text"
                  value={filters.hmaddr}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>생년월일</th>
              <td>
                <div align-items="center">
                  <DatePicker
                    name="birdt"
                    value={filters.birdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </div>
              </td>

              <th>입사일</th>
              <td>
                <div align-items="center">
                  <DatePicker
                    name="regorgdt"
                    value={filters.regorgdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </div>
              </td>

              <th>퇴사일</th>
              <td>
                <DatePicker
                  name="rtrdt"
                  value={filters.rtrdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>

              <th>내선번호</th>
              <td>
                <Input
                  name="extnum"
                  type="text"
                  value={filters.extnum}
                  onChange={filterInputChange}
                />
              </td>

              <th>전화번호</th>
              <td>
                <Input
                  name="phonenum"
                  type="text"
                  value={filters.phonenum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th rowSpan={2}>비고</th>
              <td colSpan={9}>
                <Input
                  name="remark"
                  type="text"
                  value={filters.remark}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>

      <Title>상세</Title>
      <FormBoxWrap border={true}>
        <FormBox>
          <colgroup>
            <col width="0%" />
            <col width="15%" />
            <col width="25%" />

            <col width="0%" />
            <col width="15%" />

            <col width="0%" />
            <col width="15%" />

            <col width="0%" />
            <col width="15%" />
            <col width="15%" />
          </colgroup>

          <tbody>
            <tr>
              <th>은행</th>
              <td>
                <Input
                  name="bankcd"
                  type="text"
                  value={filters.bankcd}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    //onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <td>
                <Input
                  name="banknm"
                  type="text"
                  value={filters.banknm}
                  onChange={filterInputChange}
                />
              </td>

              <th>건강보험취득일</th>
              <td>
                <div className="center">
                  <DatePicker
                    name="firredt"
                    value={filters.firredt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                  />
                </div>
              </td>

              <th>의료보험등급</th>
              <td>
                <Input
                  name="medgrad"
                  type="text"
                  value={filters.medgrad}
                  onChange={filterInputChange}
                />
              </td>

              <th>의료보험번호</th>
              <td colSpan={2}>
                <Input
                  name="medinsunum"
                  type="text"
                  value={filters.medinsunum}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>계좌번호</th>
              <td colSpan={2}>
                <Input
                  name="bankacnt"
                  type="text"
                  value={filters.bankacnt}
                  onChange={filterInputChange}
                />
              </td>

              <th>고용보험취득일</th>
              <td>
                <DatePicker
                  name="hirdate"
                  value={filters.hirdate}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>

              <th>취업청년세액감면</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="new"
                    name="exmtaxgb"
                    value={filters.exmtaxgb}
                    customOptionData={customOptionData}
                    changeData={filterInputChange}
                  />
                )}
              </td>

              <th>감면기간</th>
              <td>
                <DatePicker
                  name="exstartdt"
                  value={filters.exstartdt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>
              <td>
                <DatePicker
                  name="exenddt"
                  value={filters.exenddt}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>
            </tr>

            <tr>
              <th>예금주</th>
              <td colSpan={2}>
                <Input
                  name="bankacntuser"
                  type="text"
                  value={filters.bankacntuser}
                  onChange={filterInputChange}
                />
              </td>

              <th>국민연금취득일</th>
              <td>
                <DatePicker
                  name="anudate"
                  value={filters.anudate}
                  format="yyyy-MM-dd"
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>

              <th>국민연금등급</th>
              <td>
                <Input
                  name="pnsgrad"
                  type="text"
                  value={filters.pnsgrad}
                  onChange={filterInputChange}
                />
              </td>

              <th>퇴직급여기준</th>
              <td colSpan={2}>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="rtrtype"
                    value={filters.rtrtype}
                    bizComponentId="R_Rtrtype"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th>통장사본</th>
              <td colSpan={2}>
                <Input
                  name="files"
                  type="text"
                  value={filters.files}
                  onChange={filterInputChange}
                />
                <ButtonInInput>
                  <Button
                    //onClick={onUserWndClick}
                    icon="more-horizontal"
                    fillMode="flat"
                  />
                </ButtonInInput>
              </td>
              <th>연장시간</th>
              <td></td>
              <th>연차관리여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="rtrtype"
                    value={filters.rtrtype}
                    bizComponentId="R_Rtrtype"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>연차발생기준</th>
              <td colSpan={2}>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="dayoffdiv"
                    value={filters.dayoffdiv}
                    bizComponentId="R_dayoffdiv"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>

      <FormBoxWrap border={true}>
        <FormBox>
          <colgroup>
            <col width="0%" />
            <col width="15%" />

            <col width="0%" />
            <col width="15%" />

            <col width="0%" />
            <col width="25%" />

            <col width="0%" />
            <col width="15%" />

            <col width="0%" />
            <col width="15%" />

            <col width="0%" />
            <col width="15%" />
          </colgroup>

          <tbody>
            <tr>
              <th colSpan={5}>직전년도 총 급여액 2500만원 이하 </th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="below2kyn"
                    value={filters.below2kyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th colSpan={5}>연말정산신고대상여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="yrdclyn"
                    value={filters.yrdclyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th>경로자65</th>
              <td>
                <Input
                  name="agenum"
                  type="number"
                  value={filters.agenum}
                  onChange={filterInputChange}
                />
              </td>
              <th>경로자70</th>
              <td>
                <Input
                  name="agenum70"
                  type="number"
                  value={filters.agenum70}
                  onChange={filterInputChange}
                />
              </td>
              <th>세액계산대상여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="caltaxyn"
                    value={filters.caltaxyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>배우자유무</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="sps"
                    value={filters.sps}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>병역특례</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="milyn"
                    value={filters.milyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>근태관리여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="workchk"
                    value={filters.workchk}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>부양자(본인미포함)</th>
              <td>
                <Input
                  name="sptnum"
                  type="number"
                  value={filters.sptnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>자녀양육</th>
              <td>
                <Input
                  name="brngchlnum"
                  type="number"
                  value={filters.brngchlnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>세액구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="new"
                    name="taxcd"
                    value={filters.taxcd}
                    customOptionData={customOptionData}
                    changeData={filterInputChange}
                  />
                )}
              </td>
              <th>노조가입</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="laboryn"
                    value={filters.laboryn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>건강보험대상</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="dfmyn2"
                    value={filters.dfmyn2}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>고용보험여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="hirinsuyn"
                    value={filters.hirinsuyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th>장애자</th>
              <td>
                <Input
                  name="dfmnum"
                  type="number"
                  value={filters.dfmnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>다자녀</th>
              <td>
                <Input
                  name="childnum"
                  type="number"
                  value={filters.childnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>소득세조정률</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    type="new"
                    name="incgb"
                    value={filters.incgb}
                    customOptionData={customOptionData}
                    changeData={filterInputChange}
                  />
                )}
              </td>
              <th>부녀자</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="wmn"
                    value={filters.wmn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>국외근로대상</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="notaxe"
                    value={filters.notaxe}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>상여금계산여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="bnskind"
                    value={filters.bnskind}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>

            <tr>
              <th>가족수당배우</th>
              <td>
                <div style={{ textAlign: "right" }}>
                  <Input
                    name="fam1"
                    type="number"
                    value={filters.fam1}
                    onChange={filterInputChange}
                  />
                </div>
              </td>
              <th>가족수량자녀</th>
              <td>
                <Input
                  name="fam2"
                  type="number"
                  value={filters.fam2}
                  onChange={filterInputChange}
                />
              </td>
              <th>세대주여부</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="houseyn"
                    value={filters.houseyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>신체장애</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="dfmyn"
                    value={filters.dfmyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>급여지급구분</th>
              <td>
                {customOptionData !== null && (
                  <BizComponentRadioGroup
                    name="payyn"
                    value={filters.payyn}
                    bizComponentId="R_YN2"
                    bizComponentData={bizComponentData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button type={"submit"} themeColor={"primary"} onClick={handleSubmit}>
            저장
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
