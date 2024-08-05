import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useState } from "react";
import "swiper/css";
import {
  ButtonContainer,
  ButtonInInput,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import {
  getMenuName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import ApplicationWindow from "../components/Windows/CommonWindows/ApplicationWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { TPermissions } from "../store/types";

interface IUser {
  user_id: string;
  user_name: string;
}

const App = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };
  const search = () => {};

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_ACNT, R_quotype",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );
  const [information, setInformation] = useState({
    workType: "U",
    custprsnnm: "남궁현민", //신청자
    institutionalnm: "개인", //기관명
    phoneno: "", //전화번호
    telno: "010-3686-7233", //핸드폰번호
    email: "pophyunmin@ctp.or.kr", //이메일
    discount: "0",
    title: "",
    applicationType: "", //사용구분
    applicationTypenm: "", //사용구분명
    acntdiv: "1", //결제구분
    quotype: "1", //의뢰형태
    user_id: "", //사전협의자
    user_name: "", //사전협의자명
    samplenm: "", //시료명
    samplecnt: 0, //시료수
    modelnm: "", //모델명
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

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
  const [applicationWindowVisible, setApplicationWindowVisible] =
    useState<boolean>(false);
  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const onApplicationWndClick = () => {
    setApplicationWindowVisible(true);
  };
  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
  };

  const setData = (data: any) => {
    setInformation((prev) => ({
      ...prev,
      applicationType: data.sub_code,
      applicationTypenm: data.code_name,
    }));
  };
  const setUserData = (data: IUser) => {
    setInformation((prev: any) => {
      return {
        ...prev,
        user_id: data.user_id,
        user_name: data.user_name,
      };
    });
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <GridContainer>
        <GridContainerWrap>
          <GridContainer width="50%">
            <GridTitleContainer>
              <GridTitle>신청자 정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>신청자</th>
                    <td>
                      <Input
                        name="custprsnnm"
                        type="text"
                        value={information.custprsnnm}
                        className="readonly"
                      />
                    </td>
                    <th>기관명</th>
                    <td>
                      <Input
                        name="institutionalnm"
                        type="text"
                        value={information.institutionalnm}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>전화번호</th>
                    <td>
                      <Input
                        name="phoneno"
                        type="text"
                        value={information.phoneno}
                        className="readonly"
                      />
                    </td>
                    <th>핸드폰번호</th>
                    <td>
                      <Input
                        name="telno"
                        type="text"
                        value={information.telno}
                        className="readonly"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>이메일</th>
                    <td>
                      <Input
                        name="email"
                        type="text"
                        value={information.email}
                        className="readonly"
                      />
                    </td>
                    <th>할인율</th>
                    <td>
                      <Input
                        name="discount"
                        type="text"
                        value={information.discount + "%"}
                        className="readonly"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
          <GridContainer width={`calc(50% - ${GAP}px)`}>
            <GridTitleContainer>
              <GridTitle>신청 정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th style={{ width: "10%" }}>제목</th>
                    <td>
                      <Input
                        name="title"
                        type="text"
                        value={information.title}
                        onChange={InputChange}
                        className="required"
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>사용 구분</th>
                    <td>
                      <Input
                        name="applicationTypenm"
                        type="text"
                        value={information.applicationTypenm}
                        onChange={InputChange}
                        className="required"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
                          onClick={onApplicationWndClick}
                          icon="more-horizontal"
                          fillMode="flat"
                        />
                      </ButtonInInput>
                    </td>
                  </tr>
                  <tr>
                    <th>결제 구분</th>
                    <td>
                      {information.workType == "N"
                        ? customOptionData !== null && (
                            <CustomOptionRadioGroup
                              name="acntdiv"
                              customOptionData={customOptionData}
                              changeData={RadioChange}
                              type="new"
                            />
                          )
                        : bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="acntdiv"
                              value={information.acntdiv}
                              bizComponentId="R_ACNT"
                              bizComponentData={bizComponentData}
                              changeData={RadioChange}
                            />
                          )}
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </GridContainerWrap>
        <GridContainer>
          <GridTitleContainer>
            <GridTitle>Wafer 및 시편정보</GridTitle>
          </GridTitleContainer>
          <FormBoxWrap border={true}>
            <FormBox>
              <tbody>
                <tr>
                  <th>의뢰형태</th>
                  <td>
                    {information.workType == "N"
                      ? customOptionData !== null && (
                          <CustomOptionRadioGroup
                            name="quotype"
                            customOptionData={customOptionData}
                            changeData={RadioChange}
                            type="new"
                          />
                        )
                      : bizComponentData !== null && (
                          <BizComponentRadioGroup
                            name="quotype"
                            value={information.quotype}
                            bizComponentId="R_quotype"
                            bizComponentData={bizComponentData}
                            changeData={RadioChange}
                          />
                        )}
                  </td>
                  <th>사전협의자</th>
                  <td>
                    <Input
                      name="user_name"
                      type="text"
                      value={information.user_name}
                      onChange={InputChange}
                    />
                    <ButtonInInput>
                      <Button
                        type="button"
                        icon="more-horizontal"
                        fillMode="flat"
                        onClick={onPrsnnumWndClick}
                      />
                    </ButtonInInput>
                  </td>
                  <th>시료명</th>
                  <td>
                    <Input
                      name="samplenm"
                      type="text"
                      value={information.samplenm}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                  <th>시료수</th>
                  <td>
                    <Input
                      name="samplecnt"
                      type="number"
                      value={information.samplecnt}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                </tr>
                <tr>
                  <th>모델명</th>
                  <td>
                    <Input
                      name="modelnm"
                      type="text"
                      value={information.modelnm}
                      onChange={InputChange}
                      className="required"
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </GridContainer>
      </GridContainer>
      {applicationWindowVisible && (
        <ApplicationWindow
          setVisible={setApplicationWindowVisible}
          setData={setData}
          modal={true}
        />
      )}
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"N"}
          setData={setUserData}
        />
      )}
    </>
  );
};
export default App;
