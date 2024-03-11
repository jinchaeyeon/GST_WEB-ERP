import { Grid, Input } from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import React, { useEffect, useState } from "react";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AdminQuestionBox,
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

var barcode = "";

const MA_A2300_615_PDAW: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const [swiper, setSwiper] = useState<SwiperCore>();
  const search = () => {};
  const [state, setState] = useState("1");
  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  let _export: any;
  const exportExcel = () => {
    // if (_export !== null && _export !== undefined) {
    //   if (isVisibleDetail == true) {
    //     const optionsGridOne = _export.workbookOptions();
    //     optionsGridOne.sheets[0].title = "요약정보";
    //     _export.save(optionsGridOne);
    //   }
    // }
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );

  useEffect(() => {
    document.addEventListener("keydown", function (evt) {
      if (evt.code == "Enter") {
        if (barcode != "") {
          if (state == "1") {
            if (filters.heatno != "") {
              const newItem = {
                heatno: filters.heatno,
                scan: barcode,
              };

              setMainDataResult((prev) => ({
                data: [...prev.data, newItem],
                total: prev.total + 1,
              }));
            }

            setFilters((prev) => ({
              ...prev,
              heatno: prev.heatno == "" ? barcode : prev.heatno,
              scan: "",
            }));
          } else {
          }
        }
        barcode = ""
      } else if (
        evt.code != "ShiftLeft" &&
        evt.code != "Shift" &&
        evt.code != "Enter"
      ) {
        barcode += evt.key;
      }
    });
    document.addEventListener("click", function (evt) {
      barcode = "";
    });
  }, []);

  const [filters, setFilters] = useState({
    heatno: "",
    scan: "",
  });
  console.log(mainDataResult.data)
  return (
    <>
      <TitleContainer>
        <Title>원료육입고</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="MA_A2300_615_PDAW"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <Swiper
        className="leading_PDA_Swiper"
        onSwiper={(swiper) => {
          if (mainDataResult.total != 0) {
            setSwiper(swiper);
          }
        }}
      >
        <SwiperSlide key={0} className="leading_PDA">
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>이력번호</th>
                    <td>
                      <Input
                        name="heatno"
                        type="text"
                        value={filters.heatno}
                        style={{ width: "100%" }}
                        disabled={true}
                      />
                    </td>
                  </tr>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>스캔</th>
                    <td>
                      <Input
                        name="scan"
                        type="text"
                        value={filters.scan}
                        className="required"
                        placeholder="여기를 클릭 후 스캔해주세요"
                        style={{ width: "100%" }}
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
          <GridContainer
            width="100%"
            style={{
              height: "60vh",
              overflowY: "scroll",
              marginBottom: "10px",
            }}
          >
            {mainDataResult.data.map((item, idx) => (
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <AdminQuestionBox key={idx}>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      marginBottom: "5px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#2289c3",
                        color: "orange",
                        width: "100px",
                        height: "32px",
                        borderRadius: "5px",
                        padding: "5px",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "10px",
                        fontWeight: 700,
                      }}
                    >
                      ddd
                    </div>
                  </div>
                </AdminQuestionBox>
              </Grid>
            ))}
          </GridContainer>
          <GridContainer className="leading_PDA_container">
            <FormBoxWrap border={true}>
              <FormBox>
                <tbody>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th style={{ width: "5%", minWidth: "80px" }}>선택건수</th>
                    <td>
                      <Input
                        name="chk"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={
                          mainDataResult.data.filter((item) => item.chk == true)
                            .length
                        }
                      />
                    </td>
                    <th style={{ width: "5%", minWidth: "80px" }}>스캔건수</th>
                    <td>
                      <Input
                        name="total"
                        type="number"
                        style={{
                          textAlign: "right",
                        }}
                        value={mainDataResult.total}
                      />
                    </td>
                  </tr>
                  <tr style={{ display: "flex", flexDirection: "row" }}>
                    <th colSpan={2}>
                      <Button
                        themeColor={"primary"}
                        fillMode={state == "1" ? "solid" : "outline"}
                        onClick={() => setState("1")}
                        style={{ width: "100%" }}
                      >
                        이력번호
                      </Button>
                    </th>
                    <td colSpan={2}>
                      <Button
                        themeColor={"primary"}
                        fillMode={state == "2" ? "solid" : "outline"}
                        onClick={() => setState("2")}
                        style={{ width: "100%" }}
                      >
                        제품바코드
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
        </SwiperSlide>
        <SwiperSlide key={1}></SwiperSlide>
      </Swiper>
    </>
  );
};

export default MA_A2300_615_PDAW;
