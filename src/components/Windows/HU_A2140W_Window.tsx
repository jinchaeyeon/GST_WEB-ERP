import { Card, CardContent, Grid as GridMUI, Typography } from "@mui/material";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Checkbox, TextArea } from "@progress/kendo-react-inputs";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  GridContainer,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading, loginResultState } from "../../store/atoms";
import { Iparameters, TPermissions } from "../../store/types";
import BizComponentComboBox from "../ComboBoxes/BizComponentComboBox";
import {
  convertDateToStr,
  getBizCom,
  getFormId,
  getHeight,
  getWindowDeviceHeight,
  toDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE } from "../CommonString";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: any;
  para: any;
  setVisible(t: boolean): void;
  reload(str: string): void; //data : 선택한 품목 데이터를 전달하는 함수
  modal?: boolean;
};
type TdataArr = {
  postcd: string[];
  resno: string[];
  appgb: string[];
  appseq: string[];
  arbitragb: string[];
  aftergb: string[];
  appline: string[];
};

let index = 0;
var height = 0;
var height2 = 0;
var height3 = 0;
//모바일전용
const HU_A2140W_Window = ({
  workType,
  para,
  setVisible,
  reload,
  modal = false,
}: IWindow) => {
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [swiper, setSwiper] = useState<SwiperCore>();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  const [position, setPosition] = useState<IWindowPosition>({
    left: 0,
    top: 0,
    width: deviceWidth,
    height: deviceHeight,
  });

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(setCustomOptionData);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_HU089, L_BA421, L_BA420", setBizComponentData);

  const [stddivListData, setStddivListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setStddivListData(getBizCom(bizComponentData, "L_HU089"));
    }
  }, [bizComponentData]);

  const [mobileheight, setMobileHeight] = useState(0);
  const [mobileheight2, setMobileHeight2] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null && bizComponentData !== null) {
      height = getHeight(".k-window-titlebar"); //공통 해더
      height2 = getHeight(".BottomContainer"); //하단 버튼부분
      height3 = getHeight(".FormBoxWrap");

      setMobileHeight(
        getWindowDeviceHeight(false, deviceHeight) - height - height2 - height3
      );
      setMobileHeight2(
        getWindowDeviceHeight(false, deviceHeight) - height - height2
      );
    }
  }, [customOptionData, bizComponentData]);

  const onChangePostion = (position: any) => {
    setPosition(position);
  };

  const onClose = () => {
    setVisible(false);
  };
  const pc = UseGetValueFromSessionItem("pc");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [loginResult] = useRecoilState(loginResultState);
  const postcd = UseGetValueFromSessionItem("postcd");
  const userId = loginResult ? loginResult.userId : "";
  const userName = loginResult ? loginResult.userName : "";
  const [Information, setInformation] = useState<{ [name: string]: any }>({
    Simbol1: ":",
    Simbol2: "~",
    Simbol3: ":",
    appyn: "",
    appynnm: "",
    attdatnum: "",
    chk: "",
    dptcd: "",
    ehh: "00",
    emm: "00",
    enddate: new Date(),
    expenseno: "",
    files: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    postcd: postcd,
    prsnnm: userName,
    prsnnum: userId,
    recdt: new Date(),
    remark: "",
    resdt: "",
    restime: "",
    seq: 0,
    shh: "00",
    smm: "00",
    startdate: new Date(),
    stddiv: "",
    stddt: new Date(),
    appynmobile: "Y",
  });

  const InputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "appynmobile") {
      setInformation((prev) => ({
        ...prev,
        [name]: value == true ? "Y" : "N",
      }));
    } else {
      setInformation((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    if (para != undefined && para != null && workType != "N") {
      setInformation({
        Simbol1: para.Simbol1,
        Simbol2: para.Simbol2,
        Simbol3: para.Simbol3,
        appyn: para.appyn,
        appynnm: para.appynnm,
        attdatnum: "",
        chk: "",
        dptcd: para.dptcd,
        ehh: para.ehh,
        emm: para.emm,
        enddate: toDate(para.enddate),
        expenseno: para.expenseno,
        files: "",
        orgdiv: para.orgdiv,
        location: sessionLocation,
        postcd: para.postcd,
        prsnnm: para.prsnnm,
        prsnnum: para.prsnnum,
        recdt: new Date(),
        remark: para.remark,
        resdt: "99991231",
        restime: para.restime,
        seq: para.seq,
        shh: para.shh,
        smm: para.smm,
        startdate: toDate(para.startdate),
        stddiv: para.stddiv,
        stddt: new Date(),
        appynmobile: "Y",
      });
    }
  }, [para]);

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInformation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSaveClick = async () => {
    if (!permissions.save) return;

    setParaData({
      workType: "N",
      orgdiv: sessionOrgdiv,
      location: sessionLocation,
      rowstatus_s: "N",
      recdt_s: convertDateToStr(Information.recdt),
      seq_s: 0,
      stddt_s: convertDateToStr(Information.stddt),
      stddiv_s: Information.stddiv,
      prsnnum_s: Information.prsnnum,
      location_s: Information.location,
      dptcd_s: Information.dptcd,
      postcd_s: Information.postcd,
      startdate_s: convertDateToStr(Information.startdate),
      enddate_s: convertDateToStr(Information.enddate),
      shh_s: Information.shh,
      smm_s: Information.smm,
      ehh_s: Information.ehh,
      emm_s: Information.emm,
      remark_s: Information.remark,
      attdatnum_s: "",
      recdt: "",
      seq: 0,
      userid: userId,
      pc: pc,
      form_id: "HU_A2140W",
    });
  };

  const [ParaData, setParaData] = useState({
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    rowstatus_s: "",
    recdt_s: "",
    seq_s: 0,
    stddt_s: "",
    stddiv_s: "",
    prsnnum_s: "",
    location_s: "",
    dptcd_s: "",
    postcd_s: "",
    startdate_s: "",
    enddate_s: "",
    shh_s: "",
    smm_s: "",
    ehh_s: "",
    emm_s: "",
    remark_s: "",
    attdatnum_s: "",
    recdt: "",
    seq: 0,
    userid: userId,
    pc: pc,
    form_id: "HU_A2140W",
  });

  const para2: Iparameters = {
    procedureName: "P_HU_A2140W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": ParaData.orgdiv,
      "@p_location": ParaData.location,
      "@p_rowstatus_s": ParaData.rowstatus_s,
      "@p_recdt_s": ParaData.recdt_s,
      "@p_seq_s": ParaData.seq_s,
      "@p_stddt_s": ParaData.stddt_s,
      "@p_stddiv_s": ParaData.stddiv_s,
      "@p_prsnnum_s": ParaData.prsnnum_s,
      "@p_location_s": ParaData.location_s,
      "@p_dptcd_s": ParaData.dptcd_s,
      "@p_postcd_s": ParaData.postcd_s,
      "@p_startdate_s": ParaData.startdate_s,
      "@p_enddate_s": ParaData.enddate_s,
      "@p_shh_s": ParaData.shh_s,
      "@p_smm_s": ParaData.smm_s,
      "@p_ehh_s": ParaData.ehh_s,
      "@p_emm_s": ParaData.emm_s,
      "@p_remark_s": ParaData.remark_s,
      "@p_attdatnum_s": ParaData.attdatnum_s,
      "@p_recdt": ParaData.recdt,
      "@p_seq": ParaData.seq,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "HU_A2140W",
    },
  };

  const fetchTodoGridSaved = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para2);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      if (Information.appynmobile == "Y") {
        setFilters((prev) => ({
          ...prev,
          ref_key: data.returnString,
          isSearch: true,
        }));
      } else {
        reload(data.returnString);
        onClose();
      }

      setParaData({
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        rowstatus_s: "",
        recdt_s: "",
        seq_s: 0,
        stddt_s: "",
        stddiv_s: "",
        prsnnum_s: "",
        location_s: "",
        dptcd_s: "",
        postcd_s: "",
        startdate_s: "",
        enddate_s: "",
        shh_s: "",
        smm_s: "",
        ehh_s: "",
        emm_s: "",
        remark_s: "",
        attdatnum_s: "",
        recdt: "",
        seq: 0,
        userid: userId,
        pc: pc,
        form_id: "HU_A2140W",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.rowstatus_s != "" && permissions.save) {
      fetchTodoGridSaved();
    }
  }, [ParaData, permissions]);

  const [filters, setFilters] = useState({
    pgmgb: "W",
    person: Information.prsnnum,
    ref_key: Information.expenseno,
    pgNum: 1,
    isSearch: false,
    pgSize: PAGE_SIZE,
  });
  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  //요약정보 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //팝업 조회 파라미터
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_EA_P1000W_Q",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_pgmgb": filters.pgmgb,
        "@p_person": filters.person,
        "@p_ref_key": filters.ref_key,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (
      data &&
      data.tables &&
      data.tables[0] &&
      data.tables[1] &&
      data.tables[0].TotalRowCount !== undefined &&
      data.tables[1].TotalRowCount !== undefined
    ) {
      const rows = data.tables[0].Rows;
      const rows2 = data.tables[1].Rows;
      let valid = true;
      rows.map(
        (item: { appseq: string | null | undefined; appline: string }) => {
          if (
            item.appseq == "" ||
            item.appseq == null ||
            item.appseq == undefined ||
            item.appline == ""
          ) {
            valid = false;
          }
        }
      );

      if (valid != true) {
        alert(
          "결재라인의 필수값이 없습니다. 결재라인관리 메뉴에서 등록해주세요."
        );
        return false;
      }

      let dataArr: TdataArr = {
        postcd: [],
        resno: [],
        appgb: [],
        appseq: [],
        arbitragb: [],
        aftergb: [],
        appline: [],
      };

      rows.forEach((item: any, idx: number) => {
        const {
          postcd = "",
          resno = "",
          appgb = "",
          appseq = "",
          arbitragb = "",
          aftergb = "",
          appline = "",
        } = item;
        dataArr.postcd.push(postcd == undefined ? "" : postcd);
        dataArr.resno.push(resno == undefined ? "" : resno);
        dataArr.appgb.push(appgb == undefined ? "" : appgb);
        dataArr.appseq.push(appseq == undefined ? 0 : appseq);
        dataArr.arbitragb.push(
          arbitragb == undefined
            ? "N"
            : arbitragb == true
            ? "Y"
            : arbitragb == false
            ? "N"
            : arbitragb
        );
        dataArr.aftergb.push("");
        dataArr.appline.push(appline == undefined ? "" : appline);
      });

      rows2.forEach((item: any, idx: number) => {
        const {
          postcd = "",
          resno = "",
          appgb = "",
          appseq = "",
          arbitragb = "",
          aftergb = "",
          appline = "",
        } = item;
        dataArr.postcd.push(postcd == undefined ? "" : postcd);
        dataArr.resno.push(resno == undefined ? "" : resno);
        dataArr.appgb.push(appgb == undefined ? "" : appgb);
        dataArr.appseq.push(appseq == undefined ? 0 : appseq);
        dataArr.arbitragb.push(
          arbitragb == undefined
            ? "N"
            : arbitragb == true
            ? "Y"
            : arbitragb == false
            ? "N"
            : arbitragb
        );
        dataArr.aftergb.push("");
        dataArr.appline.push(appline == undefined ? "" : appline);
      });

      setParaData2({
        work_type: "N",
        orgdiv: sessionOrgdiv,
        location: sessionLocation,
        person: filters.person,
        pgmgb: filters.pgmgb,
        appnm: "근태허가신청 결재요청(" + filters.ref_key + ")",
        recdt: convertDateToStr(new Date()),
        ref_key: filters.ref_key,
        postcd: dataArr.postcd.join("|"),
        resno: dataArr.resno.join("|"),
        appgb: dataArr.appgb.join("|"),
        appseq: dataArr.appseq.join("|"),
        arbitragb: dataArr.arbitragb.join("|"),
        aftergb: dataArr.aftergb.join("|"),
        appline: dataArr.appline.join("|"),
        attdatnum: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
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

  const [ParaData2, setParaData2] = useState({
    work_type: "",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    person: "",
    pgmgb: "",
    appnm: "",
    recdt: "",
    ref_key: "",
    postcd: "",
    resno: "",
    appgb: "",
    appseq: "",
    arbitragb: "",
    aftergb: "",
    appline: "",
    attdatnum: "",
  });

  const paraSaved: Iparameters = {
    procedureName: "P_EA_P1000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData2.work_type,
      "@p_orgdiv": ParaData2.orgdiv,
      "@p_location": ParaData2.location,
      "@p_person": ParaData2.person,
      "@p_pgmgb": ParaData2.pgmgb,
      "@p_appnm": ParaData2.appnm,
      "@p_recdt": ParaData2.recdt,
      "@p_ref_key": ParaData2.ref_key,
      "@p_postcd": ParaData2.postcd,
      "@p_resno": ParaData2.resno,
      "@p_appgb": ParaData2.appgb,
      "@p_appseq": ParaData2.appseq,
      "@p_arbitragb": ParaData2.arbitragb,
      "@p_aftergb": ParaData2.aftergb,
      "@p_appline": ParaData2.appline,
      "@p_attdatnum": ParaData2.attdatnum,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": getFormId(),
    },
  };

  const fetchTodoGridSaved2 = async () => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      reload(filters.ref_key);
      onClose();
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData2.work_type != "" && permissions.save) {
      fetchTodoGridSaved2();
    }
  }, [ParaData2, permissions]);

  return (
    <Window
      titles={"근태허가신청"}
      positions={position}
      Close={onClose}
      modals={modal}
      onChangePostion={onChangePostion}
    >
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
            <FormBoxWrap className="FormBoxWrap">
              <FormBox>
                <tbody>
                  <tr>
                    <th>날짜</th>
                    <td>
                      <DatePicker
                        name="stddt"
                        value={Information.stddt}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                        className="required"
                      />
                    </td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <GridContainer style={{ height: mobileheight, paddingTop: "15px" }}>
              <GridMUI
                container
                spacing={2}
                style={{ height: "100%", overflow: "auto" }}
              >
                {stddivListData.map((item) => (
                  <GridMUI item xs={6} sm={6} md={4} lg={3}>
                    <Card
                      variant="outlined"
                      style={{
                        backgroundColor:
                          Information.stddiv == item.sub_code
                            ? "#2184bb"
                            : "#2289c340",
                        width: "100%",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setInformation((prev) => ({
                          ...prev,
                          stddiv: item.sub_code,
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
                      </CardContent>
                    </Card>
                  </GridMUI>
                ))}
              </GridMUI>
            </GridContainer>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                <Button
                  onClick={() => {
                    if (Information.stddiv != "") {
                      if (swiper) {
                        swiper.slideTo(1);
                      }
                    } else {
                      alert("근태구분을 선택해주세요.");
                    }
                  }}
                  style={{ width: "100%" }}
                  themeColor={"primary"}
                >
                  다음
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </GridContainer>
        </SwiperSlide>
        <SwiperSlide key={1}>
          <GridContainer>
            <FormBoxWrap style={{ height: mobileheight2 }}>
              <FormBox>
                <tbody>
                  <tr>
                    <th>시작일자</th>
                    <td>
                      <DatePicker
                        name="startdate"
                        value={Information.startdate}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>시작시간</th>
                    <td>
                      <div style={{ display: "flex" }}>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="shh"
                            value={Information.shh}
                            bizComponentId="L_BA420"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                        &nbsp;:&nbsp;
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="smm"
                            value={Information.smm}
                            bizComponentId="L_BA421"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>종료일자</th>
                    <td>
                      <DatePicker
                        name="enddate"
                        value={Information.enddate}
                        format="yyyy-MM-dd"
                        onChange={InputChange}
                        placeholder=""
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>종료시간</th>
                    <td>
                      <div style={{ display: "flex" }}>
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="ehh"
                            value={Information.ehh}
                            bizComponentId="L_BA420"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                        &nbsp;:&nbsp;
                        {bizComponentData !== null && (
                          <BizComponentComboBox
                            name="emm"
                            value={Information.emm}
                            bizComponentId="L_BA421"
                            bizComponentData={bizComponentData}
                            changeData={ComboBoxChange}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>사유</th>
                    <td>
                      <TextArea
                        value={Information.remark}
                        name="remark"
                        onChange={InputChange}
                        style={{ height: "150px" }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <Checkbox
                        name="appynmobile"
                        value={Information.appynmobile == "Y" ? true : false}
                        onChange={InputChange}
                        label={"전자결재 요청"}
                      />
                    </th>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
            <BottomContainer className="BottomContainer">
              <ButtonContainer>
                <Button
                  onClick={() => {
                    if (swiper) {
                      swiper.slideTo(0);
                    }
                  }}
                  themeColor={"primary"}
                  style={{ width: "48%" }}
                >
                  이전
                </Button>
                <Button
                  themeColor={"primary"}
                  style={{ width: "48%" }}
                  onClick={onSaveClick}
                >
                  신청
                </Button>
              </ButtonContainer>
            </BottomContainer>
          </GridContainer>
        </SwiperSlide>
      </Swiper>
    </Window>
  );
};

export default HU_A2140W_Window;
