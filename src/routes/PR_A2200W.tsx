import { Card, CardContent, Grid, Typography } from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { Switch, TextArea } from "@progress/kendo-react-inputs";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import Carousel from "react-material-ui-carousel";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import { UsePermissions, convertDateToStr } from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

var index = 0;

const PR_A2200W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [step, setStep] = useState(0);

  const search = () => {
    resetInformation();
    setFilters((prev) => ({
      ...prev,
      isSearch: true,
    }));
  };

  const search2 = () => {
    setInformation((prev) => ({
      ...prev,
      attdatnum: "",
      finyn: false,
      person: "",
      setup_hw_num: "",
      setup_hw_name: "",
      setup_location: "",
      comment: "",
    }));
  };

  const [isCaptured, setIsCaptured] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(
    null
  ) as MutableRefObject<HTMLVideoElement>;

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: "01",
    pgNum: 1,
    isSearch: true,
  });
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    workType: "DETAIL",
    orgdiv: "01",
    devmngnum: "",
    pgNum: 1,
    isSearch: true,
  });
  const [filters3, setFilters3] = useState({
    attdatnum: "",
    pgNum: 1,
    isSearch: true,
  });
  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A2200_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_todt": "",

        "@p_custcd": "",
        "@p_custnm": "",
        "@p_pjtmanager": "",
        "@p_pjtperson": "",
        "@p_project": "",

        "@p_finyn": "",
        "@p_attdatnum": "",
        "@p_devmngnum": "",
        "@p_pgmid": "",
        "@p_pgmnm": "",

        "@p_person": "",
        "@p_finexpdt": "",
        "@p_dptcd1": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
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

  //그리드 데이터 조회
  const fetchMainGrid2 = async (filters2: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_PR_A2200_Q",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": filters2.orgdiv,
        "@p_dtgb": "",
        "@p_frdt": "",
        "@p_todt": "",

        "@p_custcd": "",
        "@p_custnm": "",
        "@p_pjtmanager": "",
        "@p_pjtperson": "",
        "@p_project": "",

        "@p_finyn": "",
        "@p_attdatnum": "",
        "@p_devmngnum": filters2.devmngnum,
        "@p_pgmid": "",
        "@p_pgmnm": "",

        "@p_person": "",
        "@p_finexpdt": "",
        "@p_dptcd1": "",
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].RowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult2({
        data: rows,
        total: totalRowCnt == -1 ? 0 : totalRowCnt,
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters2((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //그리드 데이터 조회
  const fetchMainGrid3 = async (filters3: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    if (filters3.attdatnum === "") {
      setMainDataResult3({
        data: [
          {
            image: [],
          },
        ],
        total: 0,
      });
      setLoading(false);
      return false;
    }

    const parameters = {
      attached: "list?attachmentNumber=" + filters3.attdatnum,
    };

    try {
      data = await processApi<any>("file-list", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const totalRowCnt = data.tables[0].RowCount;
      if (totalRowCnt > 0) {
        const rows = data.tables[0].Rows.map((item: any) => ({
          ...item,
        }));
        let response: any;

        let array: any[] = [];
        const promises: any[] = [];
        for (const parameter of rows) {
          try {
            response = await processApi<any>("file-download", {
              attached: parameter.saved_name,
            });
            const promise = response;
            promises.push(promise);
          } catch (error) {
            response = null;
          }
        }
        const results = await Promise.all(promises);

        results.map((response, index) => {
          const blob = new Blob([response.data]);
          const fileObjectUrl = window.URL.createObjectURL(blob);
          array.push({
            url: fileObjectUrl,
            file: rows[index],
            rowstatus: "",
          });
        });

        const datas3 = [
          {
            image: array,
          },
        ];

        setMainDataResult3((prev) => {
          return {
            data: datas3,
            total: totalRowCnt == -1 ? 0 : totalRowCnt,
          };
        });
      } else {
        setMainDataResult3({
          data: [
            {
              image: [],
            },
          ],
          total: 0,
        });
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
    setFilters3((prev) => ({
      ...prev,
      pgNum:
        data && data.hasOwnProperty("pageNumber")
          ? data.pageNumber
          : prev.pgNum,
      isSearch: false,
    }));
    setLoading(false);
  };

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);

      setFilters((prev) => ({ ...prev, isSearch: false }));

      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters2.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);

      setFilters2((prev) => ({ ...prev, isSearch: false }));

      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2]);

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters3.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters3);

      setFilters3((prev) => ({ ...prev, isSearch: false }));

      fetchMainGrid3(deepCopiedFilters);
    }
  }, [filters3]);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });
  const [mainDataState3, setMainDataState3] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [mainDataResult3, setMainDataResult3] = useState<DataResult>(
    process([], mainDataState3)
  );
  const [information, setInformation] = useState({
    devmngnum: "",
    attdatnum: "",
    finyn: false,
    person: "",
    setup_hw_num: "",
    setup_hw_name: "",
    setup_location: "",
    comment: "",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetInformation = () => {
    setInformation({
      devmngnum: "",
      attdatnum: "",
      finyn: false,
      person: "",
      setup_hw_num: "",
      setup_hw_name: "",
      setup_location: "",
      comment: "",
    });
  };
  const onCheckClick = (datas: any) => {
    resetInformation();

    setInformation((prev) => ({
      ...prev,
      devmngnum: datas.devmngnum,
    }));

    setFilters2((prev) => ({
      ...prev,
      devmngnum: datas.devmngnum,
      isSearch: true,
    }));

    if (swiper && isMobile) {
      swiper.slideTo(1);
    }
  };

  const onCheckClick2 = (datas: any) => {
    setInformation((prev) => ({
      ...prev,
      setup_hw_name: datas.setup_hw_name,
      setup_hw_num: datas.setup_hw_num,
      attdatnum: datas.attdatnum,
      finyn: datas.finyn == "Y" ? true : false,
      person: datas.person,
      setup_location: datas.setup_location,
      comment: datas.comment,
    }));

    setFilters3((prev) => ({
      ...prev,
      attdatnum: datas.attdatnum,
      isSearch: true,
    }));
  };

  useEffect(() => {
    if (information.setup_hw_num != "" && index == 1 && isMobile) {
      if (swiper) {
        swiper.slideTo(2);
      }
    }
  }, [information.setup_hw_num]);

  const excelInput: any = React.useRef();
  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (files != null) {
      for (const file of files) {
        let image = window.URL.createObjectURL(file);
        setMainDataResult3((prev) => ({
          data: [
            {
              image: [
                {
                  url: image != null ? image : "",
                  file: file,
                  rowstatus: "N"
                },
                ...prev.data[0].image,
              ],
            },
          ],
          total: prev.total + 1,
        }));
      }
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };

  // 카메라 장치 가져오기
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef && videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("error 발생", error);
      });
  }, []);

  const dataURLtoFile = (dataurl: any, fileName: any) => {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
  };

  const onCapture = () => {
    videoRef.current.pause();
    const canvas = document.createElement("canvas");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // 2. canvas에 video 이미지 그리기
    const context = canvas.getContext("2d");

    if (context != null) {
      context.drawImage(videoRef.current, 0, 0);
    }

    // 3. canvas 를 Data URL로 변경
    const url = canvas.toDataURL("image/png");

    const ae = document.createElement("a");

    // 3. 다운로드 url 넣기
    ae.href = url;
    const file = dataURLtoFile(
      url,
      convertDateToStr(new Date()) +
        "_" +
        (mainDataResult3.data[0].image.length + 1)
    );

    setMainDataResult3((prev) => ({
      data: [
        {
          image: [
            {
              url: url != null ? url : "",
              file: file,
              rowstatus: "N"
            },
            ...prev.data[0].image,
          ],
        },
      ],
      total: prev.total + 1,
    }));
    setIsCaptured(false);
  };

  const getPromise = () => {
    videoRef.current.pause();
    setIsCaptured(false);
  };

  const getPromise2 = async () => {
    setIsCaptured(true);
  };

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          //video: { facingMode: { exact: isMobile ? "environment" : "user"} },
          video: { facingMode: isMobile ? "environment" : "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = isCaptured ? stream : null;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };
    initCamera();

    return () => {
      // 컴포넌트가 언마운트되면 미디어 스트림 해제
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isCaptured]);


  console.log(mainDataResult3)
  return (
    <>
      {isMobile ? (
        <Swiper
          className="leading_PDA_Swiper"
          onSwiper={(swiper) => {
            setSwiper(swiper);
          }}
          onActiveIndexChange={(swiper) => {
            index = swiper.activeIndex;
          }}
        >
          <SwiperSlide key={0} className="leading_PDA">
            <TitleContainer style={{ marginBottom: "15px" }}>
              <Title>프로젝트 선택</Title>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  fillMode={"solid"}
                  onClick={() => search()}
                  icon="search"
                >
                  조회
                </Button>
              </ButtonContainer>
            </TitleContainer>
            <GridContainer
              style={{
                height: "100%",
                overflowY: "scroll",
                width: "100%",
              }}
            >
              {mainDataResult.data.map((item, idx) => (
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <AdminQuestionBox key={idx}>
                    <Card
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        backgroundColor:
                          item.devmngnum == information.devmngnum
                            ? "#d6d8f9"
                            : "white",
                        height: "80px",
                      }}
                    >
                      <CardContent
                        onClick={() => onCheckClick(item)}
                        style={{ textAlign: "left", padding: "8px" }}
                      >
                        <div style={{ height: "40px" }}>
                          <Typography variant="h6">{item.custnm}</Typography>
                        </div>

                        <Typography variant="body2" color="text.secondary">
                          {item.project}
                        </Typography>
                      </CardContent>
                    </Card>
                  </AdminQuestionBox>
                </Grid>
              ))}
            </GridContainer>
            <BottomContainer>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  fillMode={"solid"}
                  onClick={() => {
                    resetInformation();
                    setFilters2((prev) => ({
                      ...prev,
                      devmngnum: "",
                      isSearch: true,
                    }));
                    if (swiper) {
                      swiper.slideTo(1);
                    }
                  }}
                  style={{ width: "100%" }}
                >
                  프로젝트 미선택
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </SwiperSlide>
          <SwiperSlide key={1} className="leading_PDA">
            <TitleContainer style={{ marginBottom: "15px" }}>
              <Title>장비 선택</Title>
              <ButtonContainer>
                <Button
                  themeColor={"primary"}
                  fillMode={"solid"}
                  onClick={() => search2()}
                  icon="search"
                >
                  조회
                </Button>
              </ButtonContainer>
            </TitleContainer>
            <GridContainer
              style={{
                height: "100%",
                overflowY: "scroll",
                width: "100%",
              }}
            >
              {mainDataResult2.data.map((item, idx) => (
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <AdminQuestionBox key={idx}>
                    <Card
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        backgroundColor:
                          item.setup_hw_num == information.setup_hw_num
                            ? "#d6d8f9"
                            : "white",
                        height: "80px",
                      }}
                    >
                      <CardContent
                        onClick={() => onCheckClick2(item)}
                        style={{
                          textAlign: "left",
                          padding: "8px",
                          height: "100%",
                        }}
                      >
                        <Typography variant="h6">
                          {item.setup_hw_name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </AdminQuestionBox>
                </Grid>
              ))}
            </GridContainer>
          </SwiperSlide>
          {information.setup_hw_num == "" ? (
            ""
          ) : (
            <SwiperSlide key={2} className="leading_PDA">
              <TitleContainer style={{ marginBottom: "15px" }}>
                <Title>사진 및 코멘트</Title>
                <ButtonContainer>
                  <Switch
                    onChange={(event: any) => {
                      setInformation((prev) => ({
                        ...prev,
                        finyn: event.target.value,
                      }));
                    }}
                    onLabel={"작업완료"}
                    offLabel={"작업중"}
                    checked={information.finyn}
                    className="PDA_Switch"
                  />
                </ButtonContainer>
              </TitleContainer>
              <GridContainer
                style={{
                  height: "100%",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {isCaptured ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      autoPlay
                      style={{ height: "88%", width: "100%" }}
                    ></video>
                    <FormBoxWrap>
                      <FormBox>
                        <tbody>
                          <tr style={{ display: "flex", flexDirection: "row" }}>
                            <td>
                              <Button
                                id={"button"}
                                themeColor={"primary"}
                                fillMode={"outline"}
                                onClick={() => getPromise()}
                                style={{ width: "100%" }}
                              >
                                사진모드
                              </Button>
                            </td>
                            <td>
                              <Button
                                id={"button2"}
                                themeColor={"primary"}
                                fillMode={"outline"}
                                onClick={() => onCapture()}
                                style={{ width: "100%" }}
                              >
                                촬영
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </FormBox>
                    </FormBoxWrap>
                  </>
                ) : mainDataResult3.total > 0 ? (
                  <Carousel
                    cycleNavigation={true}
                    navButtonsAlwaysVisible={true}
                    autoPlay={false}
                  >
                    {mainDataResult3.data[0].image.map((content: any) => (
                      <>
                        <div style={{ width: "100%", height: "40vh" }}>
                          <img
                            src={content.url}
                            style={{
                              objectFit: "contain",
                              height: "100%",
                              width: "100%",
                            }}
                          />
                        </div>
                      </>
                    ))}
                  </Carousel>
                ) : (
                  ""
                )}

                {isCaptured ? (
                  ""
                ) : (
                  <FormBoxWrap>
                    <FormBox>
                      <tbody>
                        <tr style={{ display: "flex", flexDirection: "row" }}>
                          <td>
                            <Button
                              id={"button1"}
                              themeColor={"primary"}
                              fillMode={"outline"}
                              onClick={upload}
                              style={{ width: "100%" }}
                            >
                              첨부파일
                            </Button>
                            <input
                              id="uploadAttachment"
                              style={{ display: "none" }}
                              type="file"
                              accept="image/*"
                              multiple
                              ref={excelInput}
                              onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                              ) => {
                                handleFileUpload(event.target.files);
                              }}
                            />
                          </td>
                          <td>
                            <Button
                              id={"button3"}
                              themeColor={"primary"}
                              fillMode={"outline"}
                              onClick={() => getPromise2()}
                              style={{ width: "100%" }}
                            >
                              촬영모드
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <TextArea
                              value={information.comment}
                              name="comment"
                              rows={50}
                              style={{
                                maxHeight: "20vh",
                                overflowY: "auto",
                                background: "#d6d8f9",
                              }}
                              onChange={filterInputChange}
                            />
                          </td>
                        </tr>
                        <tr style={{ display: "flex", flexDirection: "row" }}>
                          <td>
                            <Button
                              id={"button5"}
                              themeColor={"primary"}
                              fillMode={"outline"}
                              //onClick={() => onClick2()}
                              style={{ width: "100%" }}
                            >
                              저장
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                )}
              </GridContainer>
            </SwiperSlide>
          )}
        </Swiper>
      ) : (
        <>
          {step == 0 ? (
            <GridContainer>
              <TitleContainer>
                <Title>프로젝트 선택</Title>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => {
                      resetInformation();
                      setFilters2((prev) => ({
                        ...prev,
                        devmngnum: "",
                        isSearch: true,
                      }));
                      setStep(1);
                    }}
                  >
                    프로젝트 미선택
                  </Button>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => search()}
                    icon="search"
                  >
                    조회
                  </Button>
                  <Button
                    onClick={() => {
                      setFilters2((prev) => ({
                        ...prev,
                        isSearch: true,
                      }));
                      setStep(1);
                    }}
                    icon="arrow-right"
                  >
                    다음
                  </Button>
                </ButtonContainer>
              </TitleContainer>
              <GridContainer
                style={{
                  height: "85vh",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                <Grid container spacing={2}>
                  {mainDataResult.data.map((item, idx) => (
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
                      <AdminQuestionBox key={idx}>
                        <Card
                          style={{
                            width: "100%",
                            cursor: "pointer",
                            backgroundColor:
                              item.devmngnum == information.devmngnum
                                ? "#d6d8f9"
                                : "white",
                            height: "80px",
                          }}
                        >
                          <CardContent
                            onClick={() => onCheckClick(item)}
                            style={{ textAlign: "left", padding: "8px" }}
                          >
                            <div style={{ height: "40px" }}>
                              <Typography variant="h6">
                                {item.custnm}
                              </Typography>
                            </div>
                            <Typography variant="body2" color="text.secondary">
                              {item.project}
                            </Typography>
                          </CardContent>
                        </Card>
                      </AdminQuestionBox>
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
            </GridContainer>
          ) : step == 1 ? (
            <GridContainer>
              <TitleContainer>
                <Title>장비 선택</Title>
                <ButtonContainer>
                  <Button
                    themeColor={"primary"}
                    fillMode={"solid"}
                    onClick={() => search2()}
                    icon="search"
                  >
                    조회
                  </Button>
                  <Button onClick={() => setStep(0)} icon="arrow-left">
                    이전
                  </Button>
                  <Button
                    onClick={() => {
                      if (information.setup_hw_num != "") {
                        setStep(2);
                      } else {
                        alert("장비를 선택해주세요");
                      }
                    }}
                    icon="arrow-right"
                  >
                    다음
                  </Button>
                </ButtonContainer>
              </TitleContainer>
              <GridContainer
                style={{
                  height: "85vh",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                <Grid container spacing={2}>
                  {mainDataResult2.data.map((item, idx) => (
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={4}>
                      <AdminQuestionBox key={idx}>
                        <Card
                          style={{
                            width: "100%",
                            cursor: "pointer",
                            backgroundColor:
                              item.setup_hw_num == information.setup_hw_num
                                ? "#d6d8f9"
                                : "white",
                            height: "80px",
                          }}
                        >
                          <CardContent
                            onClick={() => onCheckClick2(item)}
                            style={{
                              textAlign: "left",
                              padding: "8px",
                              height: "100%",
                            }}
                          >
                            <Typography variant="h6">
                              {item.setup_hw_name}
                            </Typography>
                          </CardContent>
                        </Card>
                      </AdminQuestionBox>
                    </Grid>
                  ))}
                </Grid>
              </GridContainer>
            </GridContainer>
          ) : (
            <GridContainer>
              <TitleContainer>
                <Title>사진 및 코멘트</Title>
                <ButtonContainer>
                  {isCaptured ? (
                    <>
                      <Button
                        id={"button"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => getPromise()}
                      >
                        사진모드
                      </Button>{" "}
                      <Button
                        id={"button2"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => onCapture()}
                      >
                        촬영
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setStep(1)} icon="arrow-left">
                        이전
                      </Button>
                      <Button
                        id={"button1"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={upload}
                      >
                        첨부파일
                      </Button>
                      <input
                        id="uploadAttachment"
                        style={{ display: "none" }}
                        type="file"
                        accept="image/*"
                        multiple
                        ref={excelInput}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          handleFileUpload(event.target.files);
                        }}
                      />
                      <Button
                        id={"button3"}
                        themeColor={"primary"}
                        fillMode={"solid"}
                        onClick={() => getPromise2()}
                      >
                        촬영모드
                      </Button>
                      <Button icon="save">저장</Button>
                    </>
                  )}
                </ButtonContainer>
              </TitleContainer>
              {isCaptured ? (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ height: "85vh", width: "100%" }}
                ></video>
              ) : mainDataResult3.total > 0 ? (
                <>
                  <Carousel
                    cycleNavigation={true}
                    navButtonsAlwaysVisible={true}
                    autoPlay={false}
                  >
                    {mainDataResult3.data[0].image.map((content: any) => (
                      <>
                        <div style={{ width: "100%", height: "60vh" }}>
                          <img
                            src={content.url}
                            style={{
                              objectFit: "contain",
                              height: "100%",
                              width: "100%",
                            }}
                          />
                        </div>
                      </>
                    ))}
                  </Carousel>
                  <FormBoxWrap>
                    <GridTitleContainer>
                      <GridTitle>
                        <ButtonContainer>
                          코멘트
                          <div style={{ marginLeft: "10px" }}>
                            <Switch
                              onChange={(event: any) => {
                                setInformation((prev) => ({
                                  ...prev,
                                  finyn: event.target.value,
                                }));
                              }}
                              onLabel={"작업완료"}
                              offLabel={"작업중"}
                              checked={information.finyn}
                              className="PDA_Switch"
                            />
                          </div>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <td>
                            <TextArea
                              value={information.comment}
                              name="comment"
                              rows={50}
                              style={{
                                maxHeight: "20vh",
                                overflowY: "auto",
                                background: "#d6d8f9",
                              }}
                              onChange={filterInputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </>
              ) : (
                <>
                  <div style={{ width: "100%", height: "60vh" }}></div>
                  <FormBoxWrap>
                    <GridTitleContainer>
                      <GridTitle>
                        <ButtonContainer>
                          코멘트
                          <div style={{ marginLeft: "10px" }}>
                            <Switch
                              onChange={(event: any) => {
                                setInformation((prev) => ({
                                  ...prev,
                                  finyn: event.target.value,
                                }));
                              }}
                              onLabel={"작업완료"}
                              offLabel={"작업중"}
                              checked={information.finyn}
                              className="PDA_Switch"
                            />
                          </div>
                        </ButtonContainer>
                      </GridTitle>
                    </GridTitleContainer>
                    <FormBox>
                      <tbody>
                        <tr>
                          <td>
                            <TextArea
                              value={information.comment}
                              name="comment"
                              rows={50}
                              style={{
                                maxHeight: "20vh",
                                overflowY: "auto",
                                background: "#d6d8f9",
                              }}
                              onChange={filterInputChange}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </FormBox>
                  </FormBoxWrap>
                </>
              )}
            </GridContainer>
          )}
        </>
      )}
    </>
  );
};

export default PR_A2200W;
