import { Button } from "@progress/kendo-react-buttons";
import { useState } from "react";
import Stepper from "react-stepper-horizontal";
import { useSetRecoilState } from "recoil";
import { ButtonContainer, GridContainer } from "../../../CommonStyled";
import { useApi } from "../../../hooks/api";
import { IWindowPosition } from "../../../hooks/interfaces";
import { isLoading } from "../../../store/atoms";
import "../../SignupHTML/HTML1.css";
import Window from "../WindowComponent/Window";

type IKendoWindow = {
  setVisible(t: boolean): void;
  modal?: boolean;
};

const items = [
  { title: "약관동의" },
  { title: "본인인증" },
  { title: "회원가입신청" },
  { title: "회원가입완료" },
];

const KendoWindow = ({ setVisible, modal = false }: IKendoWindow) => {
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [value, setValue] = useState<number>(0);

  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1200) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 800) / 2,
    width: isMobile == true ? deviceWidth : 1200,
    height: isMobile == true ? deviceHeight : 800,
  });

  const onChangePostion = (position: any) => {
    setPosition(position);
  };

  const setLoading = useSetRecoilState(isLoading);

  const onClose = () => {
    setVisible(false);
  };

  const onNextOne = () => {
    setValue(1);
  };

  const processApi = useApi();
  return (
    <Window
      titles={"회원가입"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
      <GridContainer>
        {value !== 4 && (
          <Stepper
            steps={items}
            activeStep={value}
            activeColor={"#f1a539"}
            completeColor={`#f1a539`}
          />
        )}
        {value === 0 && (
          <>
            <GridContainer>
              <div className="SignUp">
                <h4 className="head4">약관동의</h4>
                <div className="agreement">
                  <div className="textarea">
                    <h5 className="head5">제 1 조 (목적)</h5>
                    <p className="p_txt">
                      이 약관은 충남테크노파크에서 구축하여 운영하는
                      연구장비정보망 서비스(이하 "서비스"라 한다)의 이용조건 및
                      절차에 관한 사항과 기타 필요한 사항을 규정함을 목적으로
                      합니다.
                    </p>
                    <h5 className="head5 mt_20">
                      제 2 조 (약관의 효력과 변경)
                    </h5>
                    <ul className="ul_none">
                      <li>
                        ① 이 약관은 서비스를 통하여 이를 공지하거나 전자우편
                        기타의 방법으로 회원에게 통지함으로써 효력이 발생합니다.
                      </li>
                      <li>
                        ② 충남테크노파크는 필요한 경우 이 약관의 내용을 변경할
                        수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지 또는
                        통지함으로써 효력이 발생합니다.
                      </li>
                      <li>
                        ③ 회원은 변경된 약관에 동의하지 않을 경우 회원 등록을
                        취소 또는 탈퇴할 수 있으며, 변경된 약관의 효력 발생일
                        이후에도 서비스를 계속 사용할 경우 약관의 변경 사항에
                        동의한 것으로 간주합니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 3 조 (약관 외 준칙)</h5>
                    <p className="p_txt">
                      이 약관에 명시되지 않은 사항은 전기통신기본법,
                      전기통신사업법, 정보통신망이용촉진등에관한법률 및 기타
                      관련법령의 규정에 의합니다.
                    </p>
                    <h5 className="head5 mt_20">제 4 조 (이용계약의 성립)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 서비스 가입 신청시 본 약관을 읽고 "동의함" 버튼을
                        클릭하면 이 약관에 동의하는 것으로 간주됩니다.
                      </li>
                      <li>
                        ② 이용계약은 서비스 이용희망자의 이용약관 동의 후
                        회원가입 신청에 대하여 충남테크노파크가 심사후
                        승락함으로써 성립합니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 5 조 (이용 신청)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 회원으로 가입하여 서비스를 이용하기를 희망하는 자는
                        충남테크노파크가 요청하는 소정의 가입신청 양식에서
                        요구하는 사항을 기록하여 신청하여야 합니다.
                      </li>
                      <li>
                        ② 서비스 이용 희망자가 가입신청양식에 기재하는 모든
                        회원정보는 실제 데이터인 것으로 간주하며, 실명이나
                        실제정보를 기입하지 않는 사용자는 법적보호를 받을 수
                        없으며 서비스 사용의 제한을 받을 수 있습니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20"> 제 6 조 (이용신청의 승낙)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 충남테크노파크는 다음 각 호에 해당하는 경우에는
                        이용신청에 대한 승낙을 제한할 수 있으며, 그 사유가
                        해소될 때까지 승낙을 유보할 수 있습니다.
                        <br />
                        가. 서비스 관련 설비에 여유가 없는 경우
                        <br />
                        나. 기술상 지장이 있는 경우
                        <br />
                        다. 기타 충남테크노파크의 사정상 필요하다고 인정되는
                        경우
                      </li>
                      <li>
                        ② 충남테크노파크는 다음 각 호의 1에 해당하는
                        이용계약신청에 대하여는 이를 승낙하지 아니할 수도
                        있습니다.
                        <br />
                        가. 본인의 실명을 사용치 않거나 다른 사람의 명의를
                        사용하여 신청하였을 때
                        <br />
                        나. 이용 계약 신청서의 내용을 허위로 기재하여 신청하였을
                        때
                        <br />
                        다. 사회의 안녕질서 혹은 미풍양속을 저해할 목적으로
                        신청하였을 때
                        <br />
                        라. 기타 충남테크노파크가 정한 이용신청요건이 미비되었을
                        때
                      </li>
                      <li>
                        {" "}
                        ③ 제1항 또는 제2항에 의하여 이용신청의 승낙을 유보하거나
                        승낙하지 아니하는 경우, 충남테크노파크가 이를
                        이용신청자에게 알려야 합니다. 다만, 충남테크노파크의
                        귀책사유 없이 이용신청자에게 통지할 수없는 경우는 예외로
                        합니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 7 조 (계약사항의 변경)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 회원은 서비스의「NNFC 연구장비정보망
                        서비스」내「회원정보변경」을 통해 언제든지 본인의
                        개인정보를 열람하고 수정할 수 있습니다.
                      </li>
                      <li>
                        ② 회원은 이용신청시 기재한 사항이 변경되었을 경우
                        온라인으로 수정을 해야 하며 회원정보의 미변경으로 인하여
                        발생되는 문제의 책임은 회원에게 있습니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">
                      제 8 조 (충남테크노파크의 의무)
                    </h5>
                    <ul className="ul_none">
                      <li>
                        ① 충남테크노파크는 이용고객에게 편의를 제공할 수 있도록
                        최선의 노력을 다하며, 특별한 사정이 없는 한 회원이
                        서비스 이용을 신청한 날에 서비스를 이용할 수 있도록
                        합니다.
                      </li>
                      <li>
                        ② 충남테크노파크는 이 약관에서 정한 바에 따라 계속적이고
                        안정적인 서비스의 제공을 위하여 지속적으로 노력하며,
                        설비에 장애가 생기거나 멸실된 때에는 지체없이 이를 수리
                        복구하여야 합니다. 다만, 천재지변, 비상사태 또는 그 밖에
                        부득이한 경우에는 그 서비스를 일시 중단하거나 중지할 수
                        있습니다.
                      </li>
                      <li>
                        ③ 충남테크노파크는 회원으로부터 소정의 절차에 의해
                        제기되는 의견이나 불만이 정당하다고인정할 경우에는
                        적절한 절차를 거처 처리하여야 합니다. 처리 시 일정
                        기간이 소요될 경우 회원에게 그 사유와 처리 일정을
                        알려주어야 합니다.
                      </li>
                      <li>
                        ④ 충남테크노파크는 서비스 제공과 관련하여 취득한 회원의
                        개인정보를 본인의 승낙없이 제3자에게 누설 또는 배포할 수
                        없으며 상업적 목적으로 사용할 수 없습니다. 다만, 다음의
                        각 호의 1에 해당하는 경우에는그러하지 아니합니다.
                        <br />
                        가. 관계 법령에 의하여 수사상의 목적으로
                        관계기관으로부터 요구가 있는 경우
                        <br />
                        나. 정보통신윤리위원회의 요청이 있는 경우
                        <br />
                        다. 기타 관계법령에서 정한 절차에 따른 요청이 있는 경우
                      </li>
                      <li>
                        ⑤ 제4항의 범위 내에서 충남테크노파크는 업무와 관련하여
                        회원 전체 또는 일부의 개인정보에 관한 집합적인 통계
                        자료를 작성하여 이를 사용할 수 있고, 서비스를 통하여
                        회원의 컴퓨터에 쿠키를 전송할 수 있습니다. 이 경우
                        회원은 쿠키의 수신을 거부하거나 쿠키의 수신에 대하여
                        경고하도록 사용하는 컴퓨터의 브라우저의 설정을 변경할 수
                        있습니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 9 조 (회원의 의무)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 회원은 이 약관에서 규정하는 사항과 서비스 이용안내
                        또는 주의사항 등 충남테크노파크가 공지 혹은 통지하는
                        사항을 준수하여야 하며, 기타 충남테크노파크의 업무에
                        방해되는 행위를 하여서는 아니됩니다.
                      </li>
                      <li>
                        ② 회원은 서비스 이용과 관련하여 다음 각 호의 1에
                        해당되는 행위를 하여서는 아니됩니다. 가. 다른 회원의
                        ID와 비밀번호, 주민등록번호 등을 부정하게 사용하는 행위
                        나. 서비스를 통하여 얻은 정보를 충남테크노파크의
                        사전승낙 없이 회원의 이용 이외 목적으로 복제하거나 이를
                        출판 및 방송 등에 사용하거나 제3자에게 제공하는 행위 다.
                        타인의 특허, 상표, 영업비밀, 저작권 등 기타 지적재산권을
                        침해하는 행위 라. 공공질서 및 미풍양속에 위반되는 내용의
                        정보, 문장, 도형 등을 타인에게 유포하는 행위 마. 타인의
                        프라이버시를 침해할 수 있는 내용을 유포하는 행위 바.
                        범죄와 결부된다고 객관적으로 판단되는 행위 사.
                        충남테크노파크의 승인을 받지 않고 다른 사용자의
                        개인정보를 수집 또는 저장하는 행위 아. 기타 관계법령에
                        위배되는 행위
                      </li>
                      <li>
                        ③ 회원은 자신의 이용자 번호(이하 "ID")와 비밀번호에 관한
                        모든 관리책임을 지며, 자신의 ID 및 비밀번호의 관리소홀로
                        인하여 발생하는 서비스 이용상의 손해 또는 제3자에 의한
                        부정사용 등 모든 결과에 대한 책임은 회원에게 있으며,
                        충남테크노파크는 그에 대한 책임을 지지 않습니다.
                      </li>
                      <li>
                        ④ 회원은 충남테크노파크의 동의 없이 제3자에게
                        이용자번호를 제공하여 서비스를 이용하게 할 수 없습니다.
                      </li>
                      <li>
                        ⑤ 회원은 자신의 ID나 비밀번호가 부정하게 사용되었다는
                        사실을 발견한 경우에는 즉시 기술원에 신고하여야 하며,
                        신고를 하지 않아 발생하는 모든 결과에 대한 책임은
                        회원에게 있습니다.
                      </li>
                      <li>
                        ⑥ 회원은 내용별로 충남테크노파크의 서비스 공지사항에
                        게시하거나 별도로 공지한 이용제한 사항을 준수하여야
                        합니다.
                      </li>
                      <li>
                        ⑦ 회원은 충남테크노파크의 사전승낙 없이는 서비스를
                        이용하여 영업활동을 할 수 없으며, 그 영업활동의 결과와
                        회원이 약관에 위반한 영업활동을 하여 발생한 결과에
                        대하여 충남테크노파크는 책임을 지지 않습니다. 회원은
                        이와 같은 영업활동으로 충남테크노파크가 손해를 입은 경우
                        기술원에 대하여 손해배상 의무를 집니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 10 조 (서비스 이용범위)</h5>
                    <p className="p_txt">
                      회원은 충남테크노파크의 승낙을 통해 회원가입시 부여된 ID와
                      비밀번호로 서비스를 이용할 수 있으며 기타 충남테크노파크가
                      지정한 사이트에서 서비스를 이용할 수 있습니다.
                    </p>
                    <h5 className="head5 mt_20">제 11 조 (정보의 제공)</h5>
                    <p className="p_txt">
                      충남테크노파크는 회원이 서비스 이용 중 필요가 있다고
                      인정되는 다양한 정보에 대하여 공지사항이나 전자우편 등의
                      방법으로 회원에게 제공할 수 있습니다.
                    </p>
                    <h5 className="head5 mt_20">제 12 조 (회원의 게시물)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 충남테크노파크는 회원이 게시하거나 등록하는 서비스내의
                        내용물이 다음 각 호에 해당한다고 판단되는 경우에
                        사전통지 없이 삭제할 수 있습니다.
                        <br />
                        가. 다른 회원 또는 제3자를 비방하거나 중상모략으로
                        명예를 손상시키는 내용인 경우
                        <br />
                        나. 공공질서 및 미풍양속에 위반되는 내용인 경우
                        <br />
                        다. 범죄적 행위에 결부된다고 인정되는 내용일 경우
                        <br />
                        라. 기술원과 제3자의 저작권 등 기타 권리를 침해하는
                        내용인 경우
                        <br />
                        마. 기술원에서 규정한 게시기간을 초과한 경우
                        <br />
                        바. 회원이 자신의 홈페이지와 게시판에 음란물을게재하거나
                        음란사이트를 링크하는 경우
                        <br />
                        사. 게시판의 성격에 부합하지 않는 게시물의 경우
                        <br />
                        아. 기타 관계법령에 위반된다고 판단되는 경우
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 13 조 (게시물의 저작권)</h5>
                    <p className="p_txt">
                      서비스에 게재된 자료에 대한 권리는 다음 각 호와 같습니다.
                    </p>
                    <ul className="ul_none">
                      <li>
                        가. 이용고객이 서비스 내에 게시한 게시물에 대한 권리와
                        책임은 게시자에게 있으며, 충남테크노파크는 게시자의
                        동의없이는 이를 서비스내 게재 이외에 영리적 목적으로
                        사용하지 않습니다. 다만, 비영리적인 경우에는 그러하지
                        아니하며 또한 충남테크노파크는 서비스내의 게재권을
                        갖습니다.
                      </li>
                      <li>
                        나. 이용고객이 게시한 게시물에 대해 충남테크노파크는
                        게시자의 동의 없이 서비스를 이용하여 얻은 정보를 가공,
                        판매하는 행위 등 이용고객에 의해 게재된 자료를
                        상업적으로 사용할 수 없습니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 14 조 (서비스 이용시간)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 서비스의 이용은 충남테크노파크의 업무상 또는 기술상
                        특별한 지장이 없는 한 연중무휴 1일 24시간 가능함을
                        원칙으로 합니다. 다만 정기 점검 등의 필요로
                        충남테크노파크가 정한 날이나 시간은 그러하지 않습니다.
                      </li>
                      <li>
                        ② 충남테크노파크는 서비스를 일정범위로 분할하여 각
                        범위별로 이용가능 시간을 별도로 정할 수 있습니다. 이
                        경우 사전에 그 내용을 공지합니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 15 조 (서비스 이용책임)</h5>
                    <p className="p_txt">
                      회원은 기술원에서 권한있는 사원이 서명한 명시적인 서면에
                      구체적으로 허용한 경우를 제외하고는 서비스를 이용하여
                      상품을 판매하는 영업활동을 할 수 없으며, 특히 해킹, 돈벌이
                      광고, 음란 사이트 등을 통한 상업행위, 상용S/W 불법배포
                      등을 할 수 없습니다. 이를 어기고 발생한 영업활동의 결과 및
                      손실, 관계기관에 의한 구속 등 법적 조치 등에 관해서는
                      충남테크노파크는 책임을 지지 않습니다.
                    </p>
                    <h5 className="head5 mt_20">
                      제 16 조 (서비스 제공의 중지)
                    </h5>
                    <ul className="ul_none">
                      <li>
                        ① 충남테크노파크는 다음 각 호에 해당하는 경우 서비스
                        제공을 중지할 수 있습니다. 가. 서비스용 설비의 보수 등
                        공사로 인한 부득이한 경우 나. 전기통신사업법에 규정된
                        기간통신사업자가 전기통신 서비스를 중지했을 경우 다.
                        기타 불가항력적 사유가 있는 경우
                      </li>
                      <li>
                        ② 충남테크노파크는 국가비상사태, 정전, 서비스 설비의
                        장애 또는 서비스 이용의 폭주 등으로 정상적인 서비스
                        이용에 지장이 있는 때에는 서비스의 전부 또는 일부를
                        제한하거나 중지할 수 있습니다.
                      </li>
                      <li>
                        ③ 충남테크노파크는 제1항 및 제2항의 규정에 의하여
                        서비스의 이용을 제한하거나 중지한 때에는 그 사유 및
                        제한기간 등을 지체없이 회원에게 알려야 합니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">
                      제 17 조 (계약해지 및 이용제한)
                    </h5>
                    <ul className="ul_none">
                      <li>
                        ① 회원이 이용 계약을 해지하고자 하는 경우에는 회원
                        본인이 온라인을 통해 기술원에 회원탈퇴 신청을 하여야
                        합니다.
                      </li>
                      <li>
                        ② 충남테크노파크는 회원이 다음 각 호에 해당하는 행위를
                        하였을 경우 사전통지 없이 이용계약을 해지하거나 또는
                        기간을 정하여 서비스 이용을 중지할 수 있습니다.
                        <br />
                        가. 타인의 개인정보, ID 및 비밀번호를 도용하거나
                        부정하게 사용하는 경우
                        <br />
                        나. 가입한 이름이 실명이 아닌 경우
                        <br />
                        다. 같은 사용자가 다른 ID로 이중등록을 한 경우
                        <br />
                        라. 타인의 명예를 손상시키거나 불이익을 주는 행위를 한
                        경우
                        <br />
                        마. 기술원, 다른 회원 또는 제 3자의 지적재산권을
                        침해하는 경우
                        <br />
                        바. 공공질서 및 미풍양속에 저해되는 내용을 고의로
                        유포시킨 경우
                        <br />
                        사. 회원이 국익 또는 사회적 공익을 저해할 목적으로
                        서비스 이용을 계획 또는 실행하는 경우
                        <br />
                        아. 서비스 운영을 고의로 방해한 경우
                        <br />
                        자. 서비스의 안정적 운영을 방해할 목적으로 다량의 정보를
                        전송하거나 광고성 정보를 전송하는 경우
                        <br />
                        차. 정보통신설비의 오작동이나 정보의 파괴를 유발시키는
                        컴퓨터 바이러스 프로그램 등을 유포하는 경우
                        <br />
                        카. 정보통신윤리위원회 등 외부기관의 시정요구가 있거나
                        불법선거운동과 관련하여 선거관리위원회의 유권해석을 받은
                        경우
                        <br />
                        타. 충남테크노파크의 서비스 정보를 이용하여 얻은 정보를
                        충남테크노파크의 사전 승낙없이 복제 또는 유통시키거나
                        상업적으로 이용하는 경우
                        <br />
                        파. 회원이 자신의 홈페이지와 게시판에 음란물을
                        게재하거나 음란 사이트 링크하는 경우
                        <br />
                        하. 본 약관을 포함하여 기타 충남테크노파크가 정한
                        이용조건에 위반한 경우
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 18 조 (손해배상)</h5>
                    <p className="p_txt">
                      {" "}
                      충남테크노파크는 서비스 요금이 무료인 동안의 서비스 이용과
                      관련하여 충남테크노파크의 고의나 과실에 의한 것이 아닌 한
                      회원에게 발생한 어떠한 손해에 관하여도 책임을 지지
                      않습니다.
                    </p>
                    <h5 className="head5 mt_20"> 제 19 조 (면책조항)</h5>
                    <ul className="ul_none">
                      <li>
                        ① 충남테크노파크는 천재지변 또는 이에 준하는
                        불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                        서비스 제공에 관한 책임이 면제됩니다.
                      </li>
                      <li>
                        ② 충남테크노파크는 회원의 귀책사유로 인한 서비스 이용의
                        장애에 대하여 책임을 지지 않습니다.
                      </li>
                      <li>
                        ③ 충남테크노파크는 회원이 서비스를 이용하여 기대하는
                        수익을 상실한 것이나 서비스를 통하여 얻은 자료로 인한
                        손해에 관하여 책임을 지지 않습니다.
                      </li>
                      <li>
                        ④ 충남테크노파크는 회원이 서비스에 게재한 정보, 자료,
                        사실의 신뢰도, 정확성 등 내용에 관하여는 책임을 지지
                        않습니다.
                      </li>
                      <li>
                        ⑤ 충남테크노파크는 서비스 이용과 관련하여 가입자에게
                        발생한 손해 가운데 가입자의 고의나 과실에 의한 손해에
                        대하여 책임을 지지 않습니다.
                      </li>
                    </ul>
                    <h5 className="head5 mt_20">제 20 조 (관할법원)</h5>
                    <p className="p_txt">
                      서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우
                      충남테크노파크의 본소 소재지를 관할하는 법원을 전속
                      관할법원으로 합니다.
                    </p>
                    <p className="p_txt">[ 부 칙 ]</p>
                    <p className="p_txt">
                      (시행일) 이 약관은 2024년 7월 31일부터 시행합니다.
                    </p>
                  </div>
                  <div className="check">
                    <input
                      defaultValue="Y"
                      id="privacy_agree"
                      name="privacy_agree"
                      type="checkbox"
                    />
                    <label className="checkbox-inline" htmlFor="privacy_agree">
                      위 <em>이용약관</em>에 동의합니다.
                    </label>
                  </div>
                  <h4 className="head4">
                    개인정보 수집 및 이용에 관한 필수 동의
                  </h4>
                  <div className="agreement">
                    <div className="textarea">
                      <p className="p_txt">
                        충남테크노파크는 개인정보 보호법 제32조에 따라
                        등록․공개하는 개인정보파일의 처리목적과 수집 항목은
                        다음과 같습니다.
                      </p>
                      <h5 className="head5 mt_20">개인정보 이용</h5>
                      <p className="p_txt">
                        더 나은 서비스 제공, 원활한 의사소통 경로의 확보 등을
                        목적으로 개인정보를 처리합니다.
                      </p>
                      <h5 className="head5 mt_20">수집항목</h5>
                      <p className="p_txt">
                        ① 수집하는 개인정보의 항목
                        <br />
                        [실험관리시스템]
                        <br />
                        - 회원가입
                        <br />
                        (공통) 필수 <br />
                      </p>
                      <div
                        className="table-responsive"
                        style={{
                          clear: "both",
                        }}
                      >
                        <table className="table table-bordered text-center">
                          <colgroup>
                            <col width="60%" />
                            <col width="20%" />
                            <col width="20%" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th className="NamoSE_border_show" scope="col">
                                항 목
                              </th>
                              <th className="NamoSE_border_show" scope="col">
                                수집목적
                              </th>
                              <th className="NamoSE_border_show" scope="col">
                                보유기간
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <strong>
                                  <u>
                                    성명, 회원아이디, 비밀번호, 주소, 직업,
                                    연락처, 이메일, 우편물 실 수령지 주소,
                                    <br />
                                    전자세금계산서 담당자 성명, 전자세금계산서
                                    담당자 연락처, 전자세금계산서 담당자 이메일
                                  </u>
                                </strong>
                              </td>
                              <td
                                style={{
                                  fontSize: "1.2em",
                                }}
                              >
                                <strong>
                                  <u>
                                    장비 서비스
                                    <br />
                                    정보 제공
                                  </u>
                                </strong>
                              </td>
                              <td
                                style={{
                                  fontSize: "1.2em",
                                }}
                              >
                                <strong>
                                  <u>
                                    탈퇴 후
                                    <br />
                                    즉시 삭제
                                  </u>
                                </strong>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <strong color="red">
                          * 실험신청 및 결제 관련 정보 제외
                        </strong>
                      </div>
                      <br />
                      (기관소속회원) 필수 <br />
                      <div
                        className="table-responsive"
                        style={{
                          clear: "both",
                        }}
                      >
                        <table className="table table-bordered text-center">
                          <colgroup>
                            <col width="60%" />
                            <col width="20%" />
                            <col width="20%" />
                          </colgroup>
                          <thead>
                            <tr>
                              <th className="NamoSE_border_show" scope="col">
                                항 목
                              </th>
                              <th className="NamoSE_border_show" scope="col">
                                수집목적
                              </th>
                              <th className="NamoSE_border_show" scope="col">
                                보유기간
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                <strong>
                                  <u>
                                    기관명, 기관주소, 직업구분, 부서명(학과)
                                  </u>
                                </strong>
                              </td>
                              <td
                                style={{
                                  fontSize: "1.2em",
                                }}
                              >
                                <strong>
                                  <u>
                                    장비 서비스
                                    <br />
                                    정보 제공
                                  </u>
                                </strong>
                              </td>
                              <td
                                style={{
                                  fontSize: "1.2em",
                                }}
                              >
                                <strong>
                                  <u>
                                    탈퇴 후
                                    <br />
                                    즉시 삭제
                                  </u>
                                </strong>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <strong color="red">
                          * 실험신청 및 결제 관련 정보 제외
                        </strong>
                      </div>
                      <br />
                      선택 : 직위, 부서전화번호, 부서팩스
                      <br />
                      <br />
                      ② 서비스 이용과정에서 아래와 같은 정보들이 자동으로
                      생성되어 수집될 수 있습니다.
                      <br />
                      - IP Address, 방문 일시, 서비스 이용 기록, 불량 이용 기록
                      <br />
                      - 보유기간 : 영구
                      <br />
                      <br />
                      ③ 유료 서비스 이용 과정에서 아래와 같은 결제 정보들이
                      수집될 수 있습니다.
                      <br />
                      - 신용카드 결제시 : 카드사명, 카드번호 등
                      <br />
                      - 무통장입금시 : 통장계좌번호 등
                      <br />
                      <p />
                      <h5 className="head5 mt_20">
                        개인정보의 보유 및 이용기간{" "}
                      </h5>
                      <p className="p_txt">
                        본 동의서상 수집된 귀하의 개인정보는 위에 기재한
                        수집·이용의 목적을 모두 달성할 때까지 보유·이용될
                        것이며, 법령에 따라 해당 개인정보를 보존해야 하는 의무가
                        존재하지
                        <br />
                        않는 이상, 해당 개인정보가 불필요하게 된 것이 확인된
                        때에는 파기될 것입니다. <br />
                      </p>
                      <h5 className="head5 mt_20">
                        동의를 거부할 권리 및 동의 거부에 따른 불이익 고지{" "}
                      </h5>
                      <p className="p_txt">
                        이용자는 위 개인정보의 수집 및 이용에 대하여 동의하지
                        않을 권리를 가지고 있습니다.
                        <br />
                        단, 위 개인정보는 충남테크노파크에서 서비스 제공을 위한
                        필수 정보로써 개인정보의 수집 및 이용에 대하여 동의하지
                        않는 이용자는 본 사이트의 회원 가입이 제한 될 수
                        있습니다.
                        <br />
                        <br />더 자세한 내용에 대해서는{" "}
                        <a
                          href="/support/privacy"
                          target="_blank"
                          title="개인정보처리 방침 페이지로 새창 띄우기"
                        >
                          개인정보처리방침
                        </a>
                        을 참고하시기 바랍니다.
                      </p>
                    </div>
                  </div>
                  <div className="check">
                    <input
                      defaultValue="Y"
                      id="privacy_agree2"
                      name="privacy_agree2"
                      type="checkbox"
                    />
                    <label className="checkbox-inline" htmlFor="privacy_agree2">
                      위 <em>개인정보 수집 및 이용에 관한 필수 동의</em>에
                      동의합니다.
                    </label>
                  </div>
                </div>
                <h4 className="head4">기타 고지 사항</h4>
                <div className="agreement">
                  <div
                    className="textarea"
                    style={{
                      height: "80%",
                    }}
                  >
                    <p className="p_txt">
                      개인정보 보호법 제15조제1항제2호에 따라 정보주체의 동의
                      없이 개인정보를 수입·이용합니다.
                    </p>
                    <p className="p_txt"></p>
                    <div
                      className="table-responsive"
                      style={{
                        clear: "both",
                      }}
                    >
                      <table className="table table-bordered text-center">
                        <colgroup>
                          <col width="20%" />
                          <col width="60%" />
                          <col width="20%" />
                        </colgroup>
                        <thead>
                          <tr>
                            <th className="NamoSE_border_show" scope="col">
                              개인정보 처리사유
                            </th>
                            <th className="NamoSE_border_show" scope="col">
                              개인정보 항목
                            </th>
                            <th className="NamoSE_border_show" scope="col">
                              수집근거
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>관계법령에 따른 요청 자료 제공</td>
                            <td>
                              성명, 회원아이디, 비밀번호, 주소, 직업, 연락처,
                              이메일, 우편물 실 수령지 주소,
                              <br />
                              전자세금계산서 담당자 성명, 전자세금계산서 담당자
                              연락처, 전자세금계산서 담당자 이메일, 기관,
                              기관주소, 부서명(학과)
                            </td>
                            <td>개인정보 보호법 제15조제1항제2호</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p />
                  </div>
                </div>
                <ButtonContainer style={{ justifyContent: "center" }}>
                  <Button
                    themeColor={"primary"}
                    fillMode={"outline"}
                    onClick={onNextOne}
                    size={"large"}
                  >
                    다음
                  </Button>
                </ButtonContainer>
              </div>
            </GridContainer>
          </>
        )}
        {value === 1 && <></>}
        {value === 2 && <></>}
        {value === 3 && <></>}
      </GridContainer>
    </Window>
  );
};

export default KendoWindow;
