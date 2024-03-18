import { Card, CardContent, Grid, Typography } from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { TextArea } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
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
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import { UsePermissions } from "../components/CommonFunction";
import { TPermissions } from "../store/types";

const PR_A0000W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;
  const [swiper, setSwiper] = useState<SwiperCore>();

  const search = () => {
    if (isMobile) {
      resetInformation();
    }
  };

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
    custnm: "",
    title: "",
    fxnm: "",
    description: "",
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
      custnm: "",
      title: "",
      fxnm: "",
      description: "",
    });
  };
  const onCheckClick = (datas: any) => {
    resetInformation();

    setInformation((prev) => ({
      ...prev,
      custnm: datas.custnm,
      title: datas.title,
    }));

    if (swiper) {
      swiper.slideTo(1);
    }
  };

  const onCheckClick2 = (datas: any) => {
    setInformation((prev) => ({
      ...prev,
      fxnm: datas.fxnm,
    }));

    if (swiper) {
      swiper.slideTo(2);
    }
  };

  const excelInput: any = React.useRef();
  const upload = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const [arr, setArr] = useState([]);
  const handleFileUpload = async (files: FileList | null) => {
    if (files != null) {
      for (const file of files) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onload = () => {
            if (reader.result != null) {
              setMainDataResult3((prev) => ({
                data: [
                  {
                    ...prev.data[0].description,
                    image: [
                      {
                        url:
                          reader.result != null ? reader.result.toString() : "",
                      },
                      ...prev.data[0].image,
                    ],
                  },
                ],
                total: prev.total + 1,
              }));
            }
          };
        });
      }
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };

  useEffect(() => {
    const data = [
      {
        custnm: "(주)휘앤비",
        title: "2023 스마트공장 고도화1 사업",
      },
      {
        custnm: "허스델리",
        title: "2023 스마트공장 고도화1 사업",
      },
      {
        custnm: "에드테크",
        title: "2023 스마트공장 고도화1 사업",
      },
    ];

    const data2 = [
      {
        fxnm: "라미 1호기",
      },
      {
        fxnm: "라미 2호기",
      },
      {
        fxnm: "라미 3호기",
      },
      {
        fxnm: "CNC 1호기",
      },
      {
        fxnm: "CNC 2호기",
      },
    ];

    const data3 = [
      {
        image: [
          {
            url: "https://i.pinimg.com/736x/2a/fd/05/2afd0541bb003577c986a3ec535415eb.jpg",
          },
          {
            url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnY6ML8-yTbLPw8qbp_aAMWlgB-4lQIb4_Jw&usqp=CAU",
          },
          {
            url: "https://c4.wallpaperflare.com/wallpaper/39/346/426/digital-art-men-city-futuristic-night-hd-wallpaper-thumb.jpg",
          },
          {
            url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI5jHxCN6SEQNWx_5FoNp5IsQIInPup2w4jA&usqp=CAU",
          },
        ],
        description: "",
      },
    ];

    setMainDataResult((prev) => {
      return {
        data: data,
        total: data.length,
      };
    });
    setMainDataResult2((prev) => {
      return {
        data: data2,
        total: data2.length,
      };
    });
    setMainDataResult3((prev) => {
      return {
        data: data3,
        total: data3.length,
      };
    });
  }, []);

  return (
    <>
      {isMobile ? (
        <Swiper
          className="leading_PDA_Swiper"
          onSwiper={(swiper) => {
            setSwiper(swiper);
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
                height: "80vh",
                overflowY: "scroll",
                marginBottom: "10px",
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
                          item.custnm == information.custnm
                            ? "#d6d8f9"
                            : "white",
                      }}
                    >
                      <CardContent
                        onClick={() => onCheckClick(item)}
                        style={{ textAlign: "left", padding: "8px" }}
                      >
                        <Typography variant="h6">{item.custnm}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.title}
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
                  onClick={() => search()}
                  icon="search"
                >
                  조회
                </Button>
              </ButtonContainer>
            </TitleContainer>
            <GridContainer
              style={{
                height: "80vh",
                overflowY: "scroll",
                marginBottom: "10px",
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
                          item.fxnm == information.fxnm ? "#d6d8f9" : "white",
                      }}
                    >
                      <CardContent
                        onClick={() => onCheckClick2(item)}
                        style={{ textAlign: "left", padding: "8px" }}
                      >
                        <Typography variant="h6">{item.fxnm}</Typography>
                      </CardContent>
                    </Card>
                  </AdminQuestionBox>
                </Grid>
              ))}
            </GridContainer>
          </SwiperSlide>
          <SwiperSlide key={2} className="leading_PDA">
            <TitleContainer style={{ marginBottom: "15px" }}>
              <Title>사진 및 코멘트</Title>
            </TitleContainer>
            <GridContainer
              style={{
                height: "80vh",
                marginBottom: "10px",
                overflowY: "scroll",
                width: "100%",
              }}
            >
              <Carousel
                cycleNavigation={true}
                navButtonsAlwaysVisible={true}
                autoPlay={false}
              >
                {mainDataResult3.total > 0
                  ? mainDataResult3.data[0].image.map((content: any) => (
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
                    ))
                  : ""}
              </Carousel>
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
                          id={"button2"}
                          themeColor={"primary"}
                          fillMode={"outline"}
                          //onClick={() => onClick2()}
                          style={{ width: "100%" }}
                        >
                          촬영
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <TextArea
                          value={information.description}
                          name="description"
                          rows={50}
                          style={{ maxHeight: "22vh", overflowY: "auto" }}
                          onChange={filterInputChange}
                        />
                      </td>
                    </tr>
                    <tr style={{ display: "flex", flexDirection: "row" }}>
                      <td>
                        <Button
                          id={"button1"}
                          themeColor={"primary"}
                          fillMode={"outline"}
                          //onClick={() => onClick1()}
                          style={{ width: "100%" }}
                        >
                          작업완료
                        </Button>
                      </td>
                      <td>
                        <Button
                          id={"button2"}
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
            </GridContainer>
          </SwiperSlide>
        </Swiper>
      ) : (
        <TitleContainer>
          <Title>현장관리</Title>

          <ButtonContainer>
            {permissions && (
              <TopButtons
                search={search}
                disable={true}
                permissions={permissions}
                pathname="PR_A0000W"
              />
            )}
          </ButtonContainer>
        </TitleContainer>
      )}
    </>
  );
};

export default PR_A0000W;
