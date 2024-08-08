import { Card, CardContent, Grid as GridMUI, Typography } from "@mui/material";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
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
  getDeviceHeight,
  getHeight,
  getMenuName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
} from "../components/CommonFunction";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import BizComponentRadioGroup from "../components/RadioGroups/BizComponentRadioGroup";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import RichEditor from "../components/RichEditor";
import AttachmentsWindow from "../components/Windows/CommonWindows/AttachmentsWindow";
import PrsnnumWindow from "../components/Windows/CommonWindows/PrsnnumWindow";
import { useApi } from "../hooks/api";
import { IAttachmentData } from "../hooks/interfaces";
import {
  deletedAttadatnumsState,
  deletedNameState,
  isLoading,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../store/atoms";
import { TEditorHandle, TPermissions } from "../store/types";

interface IUser {
  user_id: string;
  user_name: string;
}
var index = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
var height4 = 0;
var height5 = 0;
var height6 = 0;
var height7 = 0;
var height8 = 0;
const App = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const setDeletedAttadatnums = useSetRecoilState(deletedAttadatnumsState);

  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);

  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);

  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "요약정보";
      _export.save(optionsGridOne);
    }
  };
  const [swiper, setSwiper] = useState<SwiperCore>();
  const search = () => {};

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent(
    "R_ACNT, R_YN4",
    //수주상태, 내수구분, 과세구분, 사업장, 담당자, 부서, 품목계정, 수량단위, 완료여부
    setBizComponentData
  );

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);
  const [mobileheight3, setMobileHeight3] = useState(0);
  const [mobileheight4, setMobileHeight4] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".FormBoxWrap");
      height2 = getHeight(".FormBoxWrap2");
      height3 = getHeight(".TitleContainer");
      height4 = getHeight(".ButtonContainer");
      height5 = getHeight(".FormBoxWrap3");
      height6 = getHeight(".ButtonContainer2");
      height7 = getHeight(".ButtonContainer3");
      height8 = getHeight(".ButtonContainer4");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height3 - height4);
        setMobileHeight2(getDeviceHeight(false) - height3 - height6);
        setMobileHeight3(getDeviceHeight(false) - height3 - height7);
        setMobileHeight4(getDeviceHeight(false) - height3 - height8 - height5);
        setWebHeight(
          getDeviceHeight(false) * 1.5 -
            height -
            height2 -
            height3 -
            height4 -
            height5
        );
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);

  const [information, setInformation] = useState<{ [name: string]: any }>({
    workType: "U",
    custprsnnm: "남궁현민", //신청자
    institutionalnm: "개인", //기관명
    phoneno: "", //전화번호
    telno: "010-3686-7233", //핸드폰번호
    email: "pophyunmin@ctp.or.kr", //이메일
    title: "",
    acntdiv: "1", //결제구분
    user_id: "", //사전협의자
    user_name: "", //사전협의자명
    samplecnt: 0, //시료수
    frdt: null,
    todt: null,
    files: "",
    attdatnum: "",
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
  const [prsnnumWindowVisible, setPrsnnumWindowVisible] =
    useState<boolean>(false);
  const onPrsnnumWndClick = () => {
    setPrsnnumWindowVisible(true);
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

  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
 
  const refEditorRef = useRef<TEditorHandle>(null);
  const [attachmentsWindowVisible, setAttachmentsWindowVisible] =
    useState<boolean>(false);
  const onAttachmentsWndClick = () => {
    setAttachmentsWindowVisible(true);
  };
  const getAttachmentsData = (data: IAttachmentData) => {
    setInformation((prev) => {
      return {
        ...prev,
        attdatnum: data.attdatnum,
        files:
          data.original_name +
          (data.rowCount > 1 ? " 등 " + String(data.rowCount) + "건" : ""),
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
              disable={true}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      {isMobile ? (
        <>
          <Swiper
            onSwiper={(swiper) => {
              setSwiper(swiper);
            }}
            onActiveIndexChange={(swiper) => {
              index = swiper.activeIndex;
            }}
          >
            <SwiperSlide key={0}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>신청자 정보</GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-right"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight }}>
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
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={1}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer2">
                  <GridTitle>신청 정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(0);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
                        }
                      }}
                      icon="arrow-right"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight2 }}>
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>제목</th>
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
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>시편정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "space-between" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(1);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(3);
                        }
                      }}
                      icon="arrow-right"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      다음
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap border={true} style={{ height: mobileheight3 }}>
                  <FormBox>
                    <tbody>
                      <tr>
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
                        <th>시료수</th>
                        <td>
                          <NumericTextBox
                            name="samplecnt"
                            value={information.samplecnt}
                            onChange={InputChange}
                            className="required"
                            format="n0"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
              </GridContainer>
            </SwiperSlide>
            <SwiperSlide key={3}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer">
                  <GridTitle>의뢰 정보</GridTitle>
                  <ButtonContainer style={{ justifyContent: "flex-start" }}>
                    <Button
                      onClick={() => {
                        if (swiper && isMobile) {
                          swiper.slideTo(2);
                        }
                      }}
                      icon="arrow-left"
                      themeColor={"primary"}
                      fillMode={"outline"}
                    >
                      이전
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <FormBoxWrap border={true} className="FormBoxWrap3">
                  <FormBox>
                    <tbody>
                      <tr>
                        <th>첨부파일</th>
                        <td>
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
                    </tbody>
                  </FormBox>
                </FormBoxWrap>
                <GridContainer style={{ height: mobileheight4 }}>
                  <RichEditor id="refEditor" ref={refEditorRef} />
                </GridContainer>
              </GridContainer>
            </SwiperSlide>
          </Swiper>
        </>
      ) : (
        <GridContainer>
          <GridContainerWrap className="FormBoxWrap">
            <GridContainer width="60%">
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
                      <th>이메일</th>
                      <td>
                        <Input
                          name="email"
                          type="text"
                          value={information.email}
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
                  </tbody>
                </FormBox>
              </FormBoxWrap>
            </GridContainer>
            <GridContainer width={`calc(40% - ${GAP}px)`}>
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
          <GridContainer className="FormBoxWrap2">
            <GridTitleContainer>
              <GridTitle>시편정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr>
                    <th style={{width : "10%"}}>사전협의자</th>
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
                    <th style={{width : "10%"}}>시료수</th>
                    <td>
                      <NumericTextBox
                        name="samplecnt"
                        value={information.samplecnt}
                        onChange={InputChange}
                        className="required"
                        format="n0"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
          <GridContainer>
            <GridTitleContainer className="ButtonContainer">
              <GridTitle>의뢰 정보</GridTitle>
            </GridTitleContainer>
            <GridContainer style={{ height: webheight }}>
              <RichEditor id="refEditor" ref={refEditorRef} />
            </GridContainer>
            <FormBoxWrap border={true} className="FormBoxWrap3">
              <FormBox>
                <tbody>
                  <tr>
                    <th style={{ width: "10%" }}>첨부파일</th>
                    <td>
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
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </GridContainer>
      )}
      {attachmentsWindowVisible && (
        <AttachmentsWindow
          setVisible={setAttachmentsWindowVisible}
          setData={getAttachmentsData}
          para={information.attdatnum}
          modal={true}
          permission={{
            upload: permissions.save,
            download: permissions.view,
            delete: permissions.save,
          }}
        />
      )}
      {prsnnumWindowVisible && (
        <PrsnnumWindow
          setVisible={setPrsnnumWindowVisible}
          workType={"N"}
          setData={setUserData}
          modal={true}
        />
      )}
    </>
  );
};
export default App;
