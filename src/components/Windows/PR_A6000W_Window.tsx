import { Button } from "@progress/kendo-react-buttons";
import { DateTimePicker } from "@progress/kendo-react-dateinputs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import * as React from "react";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import { isLoading } from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  convertDateToStrWithTime2,
  toDate2,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import Window from "./WindowComponent/Window";

type IWindow = {
  workType: "N" | "U";
  data?: Idata;
  setVisible(t: boolean): void;
  setData(str: string): void;
  prodmac: Idata2[];
  stopcd: Idata3[];
  prodemp: Idata4[];
  modal?: boolean;
  pathname: string;
};

type Idata = {
  location: string;
  stopnum: string;
  stopcd: string;
  strtime: string;
  endtime: string;
  prodmac: string;
  prodemp: string;
  remark: string;
  losshh: string;
};

type Idata2 = {
  fxfull: string;
  fxcode: string;
};
type Idata3 = {
  sub_code: string;
  code_name: string;
};
type Idata4 = {
  user_name: string;
  user_id: string;
};

const CopyWindow = ({
  workType,
  data,
  setVisible,
  setData,
  prodmac,
  stopcd,
  prodemp,
  modal = false,
  pathname,
}: IWindow) => {
  const setLoading = useSetRecoilState(isLoading);
  let deviceWidth = document.documentElement.clientWidth;
  let deviceHeight = document.documentElement.clientHeight;
  let isMobile = deviceWidth <= 1200;
  const [position, setPosition] = useState<IWindowPosition>({
    left: isMobile == true ? 0 : (deviceWidth - 1600) / 2,
    top: isMobile == true ? 0 : (deviceHeight - 350) / 2,
    width: isMobile == true ? deviceWidth : 1600,
    height: isMobile == true ? deviceHeight : 350,
  });
  const onChangePostion = (position: any) => {
    setPosition(position);
  };
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");

  const processApi = useApi();

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null && workType != "U") {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        prodmac: defaultOption.find((item: any) => item.id == "prodmac")
          ?.valueCode,
        stopcd: defaultOption.find((item: any) => item.id == "stopcd")
          ?.valueCode,
        prodemp: defaultOption.find((item: any) => item.id == "prodemp")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "strtime") {
      var timeDiff = filters.endtime.getTime() - value.getTime();

      timeDiff = Math.floor(timeDiff / 1000 / 60);

      let minutes = timeDiff % 60;
      // 한자리면 0으로 패딩
      let minutesAsString = minutes < 10 ? "0" + minutes : minutes;

      timeDiff = Math.floor(timeDiff / 60);
      let hours = timeDiff % 24;

      timeDiff = Math.floor(timeDiff / 24);

      let days = timeDiff;
      let totalHours = hours + days * 24; // 일 수 값과 시간 값을 더해 총 시간 계산
      let totalHoursAsString = totalHours < 10 ? "0" + totalHours : totalHours;

      setFilters((prev) => ({
        ...prev,
        [name]: value,
        losshh: totalHoursAsString + ":" + minutesAsString,
      }));
    } else if (name == "endtime") {
      var timeDiff = value.getTime() - filters.strtime.getTime();

      timeDiff = Math.floor(timeDiff / 1000 / 60);

      let minutes = timeDiff % 60;
      // 한자리면 0으로 패딩
      let minutesAsString = minutes < 10 ? "0" + minutes : minutes;

      timeDiff = Math.floor(timeDiff / 60);
      let hours = timeDiff % 24;

      timeDiff = Math.floor(timeDiff / 24);

      let days = timeDiff;
      let totalHours = hours + days * 24; // 일 수 값과 시간 값을 더해 총 시간 계산
      let totalHoursAsString = totalHours < 10 ? "0" + totalHours : totalHours;

      setFilters((prev) => ({
        ...prev,
        [name]: value,
        losshh: totalHoursAsString + ":" + minutesAsString,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    stopnum: "",
    stopcd: "",
    strtime: new Date(),
    endtime: new Date(),
    prodmac: "",
    prodemp: "",
    remark: "",
    losshh: "",
  });

  useEffect(() => {
    if (workType == "U" && data != undefined) {
      const prodmacs = prodmac.find(
        (item: any) => item.fxfull == data.prodmac
      )?.fxcode;
      const stopcds = stopcd.find(
        (item: any) => item.code_name == data.stopcd
      )?.sub_code;
      const prodemps = prodemp.find(
        (item: any) => item.user_name == data.prodemp
      )?.user_id;
      setFilters((prev) => ({
        ...prev,
        workType: workType,
        orgdiv: sessionOrgdiv,
        location: data.location,
        stopnum: data.stopnum,
        strtime: toDate2(data.strtime),
        endtime: toDate2(data.endtime),
        prodmac: prodmacs == undefined ? "" : prodmacs,
        stopcd: stopcds == undefined ? "" : stopcds,
        prodemp: prodemps == undefined ? "" : prodemps,
        remark: data.remark,
        losshh: data.losshh,
      }));
    }
  }, []);

  // 부모로 데이터 전달, 창 닫기 (그리드 인라인 오픈 제외)
  const selectData = () => {
    setParaData((prev) => ({
      ...prev,
      workType: workType,
      orgdiv: sessionOrgdiv,
      location: filters.location,
      stopnum: filters.stopnum,
      strtime: filters.strtime,
      stopcd: filters.stopcd,
      endtime: filters.endtime,
      prodmac: filters.prodmac,
      prodemp: filters.prodemp,
      remark: filters.remark,
    }));
  };

  const [ParaData, setParaData] = useState({
    pgSize: PAGE_SIZE,
    workType: "N",
    orgdiv: sessionOrgdiv,
    location: "",
    stopnum: "",
    strtime: new Date(),
    stopcd: "",
    endtime: new Date(),
    prodmac: "",
    prodemp: "",
    remark: "",
  });

  const para: Iparameters = {
    procedureName: "P_PR_A6000W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": ParaData.workType,
      "@p_orgdiv": sessionOrgdiv,
      "@p_location": ParaData.location,
      "@p_stopnum": ParaData.stopnum,
      "@p_stopcd": ParaData.stopcd,
      "@p_strtime": convertDateToStrWithTime2(ParaData.strtime),
      "@p_endtime": convertDateToStrWithTime2(ParaData.endtime),
      "@p_prodmac": ParaData.prodmac,
      "@p_prodemp": ParaData.prodemp,
      "@p_remark": ParaData.remark,
      "@p_userid": userId,
      "@p_pc": pc,
      "@p_form_id": "PR_A6000W",
    },
  };

  const fetchTodoGridSaved = async () => {
    let data: any;
    setLoading(true);
    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      setData(data.returnString);
      if (workType == "N") {
        onClose();
      }
      setParaData({
        pgSize: PAGE_SIZE,
        workType: "N",
        orgdiv: sessionOrgdiv,
        location: "",
        stopnum: "",
        strtime: new Date(),
        stopcd: "",
        endtime: new Date(),
        prodmac: "",
        prodemp: "",
        remark: "",
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
      alert(data.resultMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ParaData.location != "") {
      fetchTodoGridSaved();
    }
  }, [ParaData]);

  return (
    <>
      <Window
        titles={workType == "N" ? "비가동관리생성" : "비가동관리정보"}
        positions={position}
        Close={onClose}
        modals={modal}
        onChangePostion={onChangePostion}
      >
        <FormBoxWrap>
          <FormBox>
            <tbody>
              <tr>
                <th>비가동번호</th>
                <td>
                  <Input
                    name="stopnum"
                    type="text"
                    value={filters.stopnum}
                    className="readonly"
                  />
                </td>
                <th>설비</th>
                <td colSpan={3}>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="prodmac"
                      value={filters.prodmac}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="fxfull"
                      valueField="fxcode"
                    />
                  )}
                </td>
                <th>비가동유형</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="stopcd"
                      value={filters.stopcd}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>비가동시작</th>
                <td>
                  <div className="filter-item-wrap">
                    <DateTimePicker
                      name="strtime"
                      value={filters.strtime}
                      format="yyyy-MM-dd HH:mm:dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </div>
                </td>
                <th>비가동종료</th>
                <td>
                  <div className="filter-item-wrap">
                    <DateTimePicker
                      name="endtime"
                      value={filters.endtime}
                      format="yyyy-MM-dd HH:mm:dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </div>
                </td>
                <th>비가동시간</th>
                <td>
                  <Input
                    name="losshh"
                    type="text"
                    value={filters.losshh}
                    className="readonly"
                  />
                </td>
                <th>작업자</th>
                <td>
                  {customOptionData !== null && (
                    <CustomOptionComboBox
                      name="prodemp"
                      value={filters.prodemp}
                      customOptionData={customOptionData}
                      changeData={filterComboBoxChange}
                      textField="user_name"
                      valueField="user_id"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <th>비고</th>
                <td colSpan={7}>
                  <TextArea
                    value={filters.remark}
                    name="remark"
                    rows={3}
                    onChange={filterInputChange}
                  />
                </td>
              </tr>
            </tbody>
          </FormBox>
        </FormBoxWrap>
        <BottomContainer>
          <ButtonContainer>
            <Button themeColor={"primary"} onClick={selectData}>
              저장
            </Button>
            <Button
              themeColor={"primary"}
              fillMode={"outline"}
              onClick={onClose}
            >
              닫기
            </Button>
          </ButtonContainer>
        </BottomContainer>
      </Window>
    </>
  );
};

export default CopyWindow;
