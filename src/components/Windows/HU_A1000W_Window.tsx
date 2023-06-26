import {
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
} from "react";
import * as React from "react";

import {
  Grid,
  GridColumn,
} from "@progress/kendo-react-grid";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";

import { getter } from "@progress/kendo-react-common";
import { useApi } from "../../hooks/api";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  ButtonContainer,
  ButtonInInput,
  BottomContainer,
  FormBox,
  FormBoxWrap,
  Title,
} from "../../CommonStyled";
import { Iparameters } from "../../store/types";
import {
  UseBizComponent,
  UseCustomOption,
  dateformat,
} from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  FORM_DATA_INDEX,
  PAGE_SIZE,
} from "../CommonString";

import { Input } from "@progress/kendo-react-inputs";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import CustomOptionRadioGroup from "../RadioGroups/CustomOptionRadioGroup";
import { Button } from "@progress/kendo-react-buttons";
import 
{ Form, 
  FormElement, 
  FormRenderProps 
} from "@progress/kendo-react-form";
import CenterCell from "../Cells/CenterCell";

const idGetter = getter(FORM_DATA_INDEX);

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: "U" | "N";
  prsnnum?: string;
  isCopy: boolean;
  para?: Iparameters; //{};
};

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  prsnnum,
  isCopy,
  para,
}: TKendoWindow) => {
  const pathname: string = window.location.pathname.replace("/", "");
  
  const processApi = useApi()
 
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    prsnnum: "",  //사번
    email: "",    //이메일
    prsnnm: "",   //성명
    paycd: "",    //급여지급유형
    koraddr: "",  //주민등록지주소
    perregnum: "", //주민번호
    sexcd: "",  // 성별 
    firredt : new Date(), //정산입사일
    zipcode: "", //우편번호
    birdt: new Date(), //생년월일
    bircd: "", // 양력, 음력여부
    occudate: new Date(), //연차발생기준일
    hmaddr: "", //실제거주지주소
    regorgdt: new Date(), //입사일
    extnum: "", //내선번호
    phonenum: "", // 전화번호
    rtrdt: new Date(), //퇴사일
    remark: "", //비고

    bankcd : "" ,// 은행
    banknm : "", // 은행명
    bankacnt : "", // 계좌번호
    payyn : "",// 급여지급여부
    meddate : new Date(),// 건강보험취득일
                             // 계좌번호 
    bnskind : "" , // 상여금계산여부 
    anudate : new Date(),// 국민연금취득일
    bankacntuser: "",// 예금주 
    workchk : "",// 근태관리여부 
    hirdate : new Date(),// 고용보험취득일
    bankdatnum : "",// 통장사본 
    hirinsuyn : "", // 고용보험여부 
    houseyn : "", // 세대주구분 
    caltaxyn : "", // 세액계산대상여부
    yrdclyn : "", // 연말정산신고대상여부
    below2kyn : "", // 직전년도총급여액2500만원이하
    taxcd : "" , // 세액구분
    exmtaxgb : "", // 취업청년세감면
    incgb : "" ,// 소득세조정률
    medgrad : "", //의료보험등급
    medinsunum  : "",  // 의료보험번호
    exstartdt : new Date(),  // 감면시작 
    exenddt : new Date(),  // 감면종료  
    pnsgrad : "" ,   // 국민연금등급  
    rtrtype : "",     //퇴직급계산구분 
    yrchk :  "",    //연차관리여부 
    dayoffdiv : "",  //연차발생기준
    attdatnum : "", // 첨부파일번호
    files : "" , //첨부파일명 
    agenum : 0,   //경로자65
    agenum70 : 0,  //경로자70
    sptnum: 0,  // 부양자(본인미포함)
    brngchlnum: 0, // 자녀양육
    dfmnum: 0,  // 장애자
    childnum: 0,  // 다자녀
    fam1: 0,  //가족수당배우
    fam2: 0,   // 가족수당 자녀 
  });

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {    
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.new;

      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // BizComponentID 세팅
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA002", setBizComponentData);

  //ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Input Change 함수 => 사용자가 Input에 입력한 값을 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1800,
    height: 880,
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

  const parameters: Iparameters = {
    procedureName: "P_HU_A1000W_Q",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "DETAIL",
      "@p_orgdiv": "01",
      "@p_location": "01",
      "@p_dptcd": "",
      "@p_prsnnum": prsnnum,
      "@p_prsnnm": "",
      "@p_rtrchk": "",
    },
  };

  useEffect(() => {
    if (workType === "U" || isCopy === true) {     
      fetchMain();
    }
  }, []);

  const fetchMain = async () => {
    let data: any;    

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
          email: row.email, //이메일
          prsnnm: row.prsnnm, //성명
          paycd: row.paycd, //급여지급유형
          koraddr: row.koraddr, //주민등록지주소
          perregnum: row.perregnum, //주민번호
          sexcd: row.sexcd, // 성별
          firredt: new Date(dateformat(row.firredt)), //정산입사일
          zipcode: row.zipcode, //우편번호
          birdt: new Date(dateformat(row.birdt)), //생년월일
          bircd: row.bircd, // 양력, 음력여부
          occudate: new Date(dateformat(row.occudate)), //연차발생기준일
          hmaddr: row.hmaddr, //실제거주지주소
          regorgdt: new Date(dateformat(row.regorgdt)), //입사일
          extnum: row.extnum, //내선번호
          phonenum: row.phonenum, // 전화번호
          rtrdt: new Date(dateformat(row.rtrdt)), //퇴사일
          remark: row.remark, //비고

          bankcd: row.bankcd, // 은행
          banknm: row.banknm, // 은행명
          bankacnt: row.bankacnt, // 계좌번호
          payyn: row.payyn, // 급여지급여부
          meddate: new Date(dateformat(row.meddate)), // 건강보험취득일
          // 계좌번호
          bnskind: row.bnskind, // 상여금계산여부
          anudate: new Date(dateformat(row.anudate)), // 국민연금취득일
          bankacntuser: row.bankacntuser, // 예금주
          workchk: row.workchk, // 근태관리여부
          hirdate: new Date(dateformat(row.hirdate)), // 고용보험취득일
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
          exstartdt: new Date(dateformat(row.exstartdt)), // 감면시작
          exenddt: new Date(dateformat(row.exenddt)), // 감면종료
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
        };
      });
    }
  };

  const onClose = () => {
    getVisible(false);
  };
  
  const [formKey, setFormKey] = React.useState(1);
  const resetForm = () => {
    setFormKey(formKey + 1);
  };

  return (
    <Window
      title={workType === "N" ? "신규등록" : "인사상세"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <Form
        // onSubmit={handleSubmit}
        key={formKey}
        initialValues={{
          rowstatus: "",
          prsnnum: isCopy === true ? "" : filters.prsnnum,
        }}
        render={(formRenderProps: FormRenderProps) => (
          <FormElement horizontal={true}>
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
                        className="required"
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>재직여부</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="yrchk"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
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
                          changeData={filterComboBoxChange}
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
                          changeData={filterComboBoxChange}
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
                        <CustomOptionRadioGroup
                          type="new"
                          name="sexcd"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th></th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="bircd"
                          customOptionData={customOptionData}
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
                        name="regorgdt"
                        value={filters.regorgdt}
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
                        name="bankcd"
                        type="text"
                        value={filters.banknm}
                        onChange={filterInputChange}
                      />
                    </td>

                    <th>건강보험취득일</th>
                    <td>
                      {/* <div className="center">
                        <DatePicker
                          name="firredt"
                          value={filters.firredt}
                          format="yyyy-MM-dd"
                          onChange={filterInputChange}
                          placeholder=""
                        />
                      </div> */}
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
                          changeData={filterComboBoxChange}
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
                        <CustomOptionRadioGroup
                          type="new"
                          name="rtrtype"
                          customOptionData={customOptionData}
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
                        <CustomOptionRadioGroup
                          type="new"
                          name="yrchk"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>연차발생기준</th>
                    <td colSpan={2}>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="dayoffdiv"
                          customOptionData={customOptionData}
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
                        <CustomOptionRadioGroup
                          type="new"
                          name="below2kyn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th colSpan={5}>연말정산신고대상여부</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="yrdclyn"
                          customOptionData={customOptionData}
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
                        <CustomOptionRadioGroup
                          type="new"
                          name="caltaxyn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>배우자유무</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="sps"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>병역특례</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="milyn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>근태관리여부</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="workchk"
                          customOptionData={customOptionData}
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
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                    <th>노조가입</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="laboryn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>건강보험대상</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="dfmyn2"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>고용보험여부</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="hirinsuyn"
                          customOptionData={customOptionData}
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
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                    <th>부녀자</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="wmn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>국외근로대상</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="notaxe"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>상여금계산여부</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="bnskind"
                          customOptionData={customOptionData}
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
                        <CustomOptionRadioGroup
                          type="new"
                          name="houseyn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>신체장애</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="dfmyn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>급여지급구분</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          type="new"
                          name="payyn"
                          customOptionData={customOptionData}
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
                <Button themeColor={"primary"}>저장</Button>
                <Button
                  themeColor={"primary"}
                  fillMode={"outline"}
                  onClick={onClose}
                >
                  닫기
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </FormElement>
        )}
      />
    </Window>
  );
};

export default KendoWindow;
