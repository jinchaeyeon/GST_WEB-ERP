import { Card, CardContent, Grid as GridMUI, Typography } from "@mui/material";
import { DataResult, process, State } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import ApplicationWindow from "../components/Windows/CommonWindows/ApplicationWindow";
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
    "R_ACNT, R_quotype, R_YN4",
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
    printyn: "N", //시험성적서발급
    frdt: null,
    todt: null,
    files: "",
    attdatnum: "",
    material: "1",
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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (filters.isSearch && permissions.view) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const fetchGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //팝업 조회 파라미터
    const parameters = {
      para:
        "popup-data?id=" +
        "P_CR132" +
        "&page=" +
        filters.pgNum +
        "&pageSize=" +
        PAGE_SIZE,
        use_yn: "Y",
    };
    try {
      data = await processApi<any>("popup-data", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.data.TotalRowCount;
      const rows = data.data.Rows;

      setDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log(data);
    }
    // setDataResult((prev) => {
    //   return {
    //     data: [
    //       {
    //         sub_code: 1,
    //         code_name: "투과전자현미경(TEM)",
    //         extra_field1: "FEI",
    //         extra_field2: "Talos F200X G2",
    //       },
    //       {
    //         sub_code: 2,
    //         code_name: "집속이온빔시스템(FIB)",
    //         extra_field1: "FEI",
    //         extra_field2: "Helios 5 UC",
    //       },
    //       {
    //         sub_code: 3,
    //         code_name: "고분해능 전계방사형 주사전자현미경(FE-SEM)",
    //         extra_field1: "Hitachi",
    //         extra_field2: "SU-8600",
    //       },
    //       {
    //         sub_code: 4,
    //         code_name: "이온밀링시스템",
    //         extra_field1: "Hitachi",
    //         extra_field2: "ArBlade5000 CTC",
    //       },
    //       {
    //         sub_code: 5,
    //         code_name: "비행시간형 이차이온질량분석기(TOF-SIMS)",
    //         extra_field1: "IONTOF",
    //         extra_field2: "M6",
    //       },
    //       {
    //         sub_code: 6,
    //         code_name: "X선 광전자 분광기(XPS)",
    //         extra_field1: "Thermofishe Scientific",
    //         extra_field2: "NEXSA G2",
    //       },
    //       {
    //         sub_code: 7,
    //         code_name: "원자현미경(AFM)",
    //         extra_field1: "Anton Paar",
    //         extra_field2: "TOSCA 400",
    //       },
    //     ],
    //     total: 25,
    //   };
    // });
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

  const [DataState, setDataState] = useState<State>({
    sort: [],
  });
  const [DataResult, setDataResult] = useState<DataResult>(
    process([], DataState)
  );
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
            </SwiperSlide>
            <SwiperSlide key={2}>
              <GridContainer>
                <GridTitleContainer className="ButtonContainer3">
                  <GridTitle>Wafer 및 시편정보</GridTitle>
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
                          <NumericTextBox
                            name="samplecnt"
                            value={information.samplecnt}
                            onChange={InputChange}
                            className="required"
                            format="n0"
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
                        <th>시험성적서 발급</th>
                        <td>
                          {information.workType == "N"
                            ? customOptionData !== null && (
                                <CustomOptionRadioGroup
                                  name="printyn"
                                  customOptionData={customOptionData}
                                  changeData={RadioChange}
                                  type="new"
                                />
                              )
                            : bizComponentData !== null && (
                                <BizComponentRadioGroup
                                  name="printyn"
                                  value={information.printyn}
                                  bizComponentId="R_YN4"
                                  bizComponentData={bizComponentData}
                                  changeData={RadioChange}
                                />
                              )}
                        </td>
                        <th>시간 예약</th>
                        <td colSpan={3}>
                          <CommonDateRangePicker
                            value={{
                              start: information.frdt,
                              end: information.todt,
                            }}
                            onChange={(e: {
                              value: { start: any; end: any };
                            }) =>
                              setInformation((prev) => ({
                                ...prev,
                                frdt: e.value.start,
                                todt: e.value.end,
                              }))
                            }
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={8}>
                          <GridTitleContainer>
                            <GridTitle>시험 항목</GridTitle>
                          </GridTitleContainer>
                          <GridMUI
                            container
                            spacing={2}
                            style={{ height: "300px", overflow: "auto" }}
                          >
                            {DataResult.data.map((item: any) => (
                              <GridMUI
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={6}
                                xl={4}
                              >
                                <Card
                                  variant="outlined"
                                  style={{
                                    backgroundColor:
                                      information.material == item.sub_code
                                        ? "#f1a539"
                                        : "#fef2e2",
                                    marginBottom: "5px",
                                    width: "100%",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    setInformation((prev) => ({
                                      ...prev,
                                      material: item.sub_code,
                                    }))
                                  }
                                >
                                  <CardContent>
                                    <Typography
                                      variant="h6"
                                      style={{ fontWeight: 700 }}
                                      gutterBottom
                                    >
                                      {item.code_name}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      style={{ marginBottom: "0px" }}
                                      color="text.secondary"
                                    >
                                      제조사: {item.extra_field1}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      모델명: {item.extra_field2}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </GridMUI>
                            ))}
                          </GridMUI>
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
          <GridContainer className="FormBoxWrap2">
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
                      <NumericTextBox
                        name="samplecnt"
                        value={information.samplecnt}
                        onChange={InputChange}
                        className="required"
                        format="n0"
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
                    <th>시험성적서 발급</th>
                    <td>
                      {information.workType == "N"
                        ? customOptionData !== null && (
                            <CustomOptionRadioGroup
                              name="printyn"
                              customOptionData={customOptionData}
                              changeData={RadioChange}
                              type="new"
                            />
                          )
                        : bizComponentData !== null && (
                            <BizComponentRadioGroup
                              name="printyn"
                              value={information.printyn}
                              bizComponentId="R_YN4"
                              bizComponentData={bizComponentData}
                              changeData={RadioChange}
                            />
                          )}
                    </td>
                    <th>시간 예약</th>
                    <td colSpan={3}>
                      <CommonDateRangePicker
                        value={{
                          start: information.frdt,
                          end: information.todt,
                        }}
                        onChange={(e: { value: { start: any; end: any } }) =>
                          setInformation((prev) => ({
                            ...prev,
                            frdt: e.value.start,
                            todt: e.value.end,
                          }))
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={8}>
                      <GridTitleContainer>
                        <GridTitle>시험 항목</GridTitle>
                      </GridTitleContainer>
                      <GridMUI
                        container
                        spacing={2}
                        style={{ height: "300px", overflow: "auto" }}
                      >
                        {DataResult.data.map((item: any) => (
                          <GridMUI item xs={12} sm={12} md={12} lg={6} xl={4}>
                            <Card
                              variant="outlined"
                              style={{
                                backgroundColor:
                                  information.material == item.sub_code
                                    ? "#f1a539"
                                    : "#fef2e2",
                                marginBottom: "5px",
                                width: "100%",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                setInformation((prev) => ({
                                  ...prev,
                                  material: item.sub_code,
                                }))
                              }
                            >
                              <CardContent>
                                <Typography
                                  variant="h6"
                                  style={{ fontWeight: 700 }}
                                  gutterBottom
                                >
                                  {item.code_name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ marginBottom: "0px" }}
                                  color="text.secondary"
                                >
                                  제조사: {item.extra_field1}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  모델명: {item.extra_field2}
                                </Typography>
                              </CardContent>
                            </Card>
                          </GridMUI>
                        ))}
                      </GridMUI>
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
      {applicationWindowVisible && (
        <ApplicationWindow
          setVisible={setApplicationWindowVisible}
          setData={setData}
          modal={true}
        />
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
