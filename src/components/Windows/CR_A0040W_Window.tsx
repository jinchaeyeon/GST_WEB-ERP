import { Button } from "@progress/kendo-react-buttons";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";
import { Input, InputChangeEvent, TextArea } from "@progress/kendo-react-inputs";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  BottomContainer,
  ButtonContainer,
  FormBox,
  FormBoxWrap,
  ButtonInInput,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  isLoading,
} from "../../store/atoms";
import { Iparameters } from "../../store/types";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";
import {
  UseCustomOption,
  UseGetValueFromSessionItem,
  UseMessages,
  UseParaPc,
  convertDateToStr,
  dateformat,
  findMessage,
} from "../CommonFunction";
import { DatePicker } from "@progress/kendo-react-dateinputs";

import BizComponentPopupWindow from "./CommonWindows/BizComponentPopupWindow";

const firstDay = (date:Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

const lastDay = (date:Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

type TKendoWindow = {
  setVisible(t: boolean): void;
  setFilters(t: any): void;
  workType: string;
  isCopy: boolean;
  membership_id?: string;
  modal?: boolean;
};

const KendoWindow = ({
  setVisible,
  setFilters,
  workType,
  isCopy,
  membership_id,
  modal = false,
}: TKendoWindow) => {
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const userId = UseGetValueFromSessionItem("user_id");
  const location = UseGetValueFromSessionItem("location");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);

  const setLoading = useSetRecoilState(isLoading);

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name == "strdt") { // 등록일자 변경 시 만기일자도 셋팅
      let enddt:Date;

      if (value) {
        if (value.getDate() == 1) { // 등록일자가 월초면 만기일자를 월말로 셋팅
        enddt = lastDay(value);
        }
        else { // 월초가 아니면 한달뒤로 셋팅
          enddt = new Date(value);
          enddt.setMonth(enddt.getMonth() + 1);
        }

        setInitialVal((prev) => ({
          ...prev,
          [name]: value,
          enddt: enddt,
        }));
      }
      else {
        setInitialVal((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    else if (name == "enddt") {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    else {
      setInitialVal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setInitialVal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const pathname: string = window.location.pathname.replace("/", "");

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  // //customOptionData 조회 후 디폴트 값 세팅
  // useEffect(() => {
  //   if (customOptionData !== null && workType == "N") {
  //     const defaultOption = customOptionData.menuCustomDefaultOptions.new;
  //     setInitialVal((prev) => ({
  //       ...prev,
  //     }));
  //   }
  // }, [customOptionData]);

  //// 비즈니스 컴포넌트 조회
  // const [bizComponentData, setBizComponentData] = useState<any>([]);
  // UseBizComponent("L_sysUserMaster_001, L_BA000", setBizComponentData);

  let deviceWidth = window.innerWidth;
  let isMobile = deviceWidth <= 1200;

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: isMobile == true ? deviceWidth : 1000,
    height: 400,
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

  const [standardWindowVisible, setStandardWindowVisible] = useState<boolean>(false);
  const onStandardClick = () => {
    setStandardWindowVisible(true);
  };

  const setPopupData = (data:any) => {
    let custcd = "";
    let custnm = "";
    if (data.hasOwnProperty("custcd")) {
      custcd = data.custcd;
    }
    if (data.hasOwnProperty("custnm")) {
      custnm = data.custnm;
    }

    setInitialVal((prev) => ({
      ...prev,
      custcd: custcd,
      custnm: custnm,
    }));
  };

  const onClose = () => {
    setVisible(false);
  };

  const processApi = useApi();

  useEffect(() => {
    if (workType === "U" || isCopy) {
      fetchMain();
    }
  }, []);

  const [initialVal, setInitialVal] = useState<
    {[id: string]: any}
  >({
    membership_id: "",
    custcd: "",
    custnm: "",
    gubun: "",
    remark: "",
    amt: 0,
    strdt: firstDay(new Date()),
    enddt: lastDay(new Date()),
    janqty: 0,
    adjqty: 0,
  });

  const parameters: Iparameters = {
    procedureName: "P_CR_A0040W_Q ",
    pageNumber: 1,
    pageSize: 1,
    parameters: {
      "@p_work_type": "Q",
      "@p_orgdiv": orgdiv,
      "@p_location": "",
      "@p_membership_id": membership_id,
      "@p_dtgb": "A",
      "@p_frdt": "19990101",
      "@p_todt": "99991231",
      "@p_finyn": "%",
      "@p_find_row_value": "",
    },
  };

  //요약정보 조회
  const fetchMain = async () => {
    let data: any;
    setLoading(true);
    //조회조건 파라미터

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const row = data.tables[0].Rows[0];

      if (isCopy) {
        row.membership_id = initialVal.membership_id;
        row.strdt = convertDateToStr(initialVal.strdt);
        row.enddt = convertDateToStr(initialVal.enddt);
        row.janqty = row.orguseqty;
        row.adjqty = row.orgadjqty;
      }

      setInitialVal((prev) => {
        return {
          ...prev,
          membership_id: row.membership_id,
          custcd: row.custcd,
          custnm: row.custnm,
          gubun: row.gubun,
          remark: row.remark,
          amt: row.amt,
          strdt: !row.strdt ? null : new Date(dateformat(row.strdt)),
          enddt: !row.enddt ? null : new Date(dateformat(row.enddt)),
          janqty: row.janqty,
          adjqty: row.adjqty,
        };
      });
    }
    setLoading(false);
  };

  //메시지 조회
  const [messagesData, setMessagesData] = useState<any>(null);
  UseMessages(pathname, setMessagesData);

  //프로시저 파라미터 초기값
  const [paraData, setParaData] = useState({
    work_type: "",
    membership_id: "",
    custcd: "",
    custnm: "",
    gubun: "",
    remark: "",
    amt: 0,
    strdt: new Date(),
    enddt: new Date("2099-12-31"),
    janqty: 0,
    adjqty: 0,
  });

  const fetchMainSaved = async () => {
    let data: any;
    setLoading(true);

    //프로시저 파라미터
    const paraSaved: Iparameters = {
      procedureName: "P_CR_A0040W_S",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": paraData.work_type,
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_membership_id": paraData.membership_id,
        "@p_custcd": paraData.custcd,
        "@p_gubun": paraData.gubun,
        "@p_remark": paraData.remark,
        "@p_amt": paraData.amt,
        "@p_strdt": convertDateToStr(paraData.strdt),
        "@p_enddt": convertDateToStr(paraData.enddt),
        "@p_useqty": paraData.janqty,
        "@p_adjqty": paraData.adjqty,
        "@p_userid": userId,
        "@p_pc": pc,
        "@p_form_id": pathname,
      },
    };

    try {
      data = await processApi<any>("procedure", paraSaved);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      if (workType === "U") {
        setFilters((prev:any) => ({ ...prev, find_row_value: data.returnString, isSearch: true })); // 한번만 조회되도록
        fetchMain();
      } else {
        setVisible(false);
        setFilters((prev:any) => ({ ...prev, find_row_value: data.returnString, isSearch: true })); // 한번만 조회되도록
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);

      alert(data.resultMessage);
    }

    paraData.work_type = ""; //초기화
    setLoading(false);
  };

  const handleSubmit = () => {
    const {
      membership_id,
      custcd,
      custnm,
      gubun,
      remark,
      amt,
      strdt,
      enddt,
      janqty,
      adjqty,
    } = initialVal;

    //검증
    let vaild = true;
    let errorMessage = "";
    if (workType == "N") {
      if (!custcd) {
        errorMessage = findMessage(messagesData, "CR_A0040W_001"); // 반려견코드를 입력해주세요.
        vaild = false;
      }
      else if (!janqty) {
        errorMessage = findMessage(messagesData, "CR_A0040W_002"); // 등원횟수를 입력해주세요.
        vaild = false;
      }
      else if (!adjqty) {
        errorMessage = findMessage(messagesData, "CR_A0040W_003"); // 변경횟수를 입력해주세요.
        vaild = false;
      }
      // strdt, enddt
    }
    if (!vaild) {
      alert(errorMessage);
      return false;
    }

    setParaData((prev) => ({
      ...prev,
      work_type: workType,
      membership_id: membership_id,
      custcd: custcd,
      custnm: custnm,
      gubun: gubun,
      remark: remark,
      amt: amt,
      strdt: strdt,
      enddt: enddt,
      janqty: janqty,
      adjqty: adjqty,
    }));
  };

  useEffect(() => {
    if (paraData.work_type !== "") fetchMainSaved();
  }, [paraData]);

  return (
    <Window
      title={workType === "N" ? "회원권 등록" : "회원권 정보"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
      modal={modal}
    >
        {/* <GridContainer width={`68%`}> */}
          <FormBoxWrap>
            <FormBox>
              <tbody>
                <tr>
                  <th>회원권ID</th>
                  <td>
                    {workType == "N" ? (
                      <Input
                        name="membership_id"
                        type="text"
                        value="자동채번"// value={initialVal.membership_id}
                        className="readonly"//className="required"
                        //onChange={filterInputChange}
                      />
                    ) : (
                      <Input
                        name="membership_id"
                        type="text"
                        value={initialVal.membership_id}
                        className="readonly"
                      />
                    )}
                  </td>
                  <th>반려견코드</th>
                  <td>
                    {workType == "N" ? (
                      <>
                        <Input
                          name="custcd"
                          type="text"
                          value={initialVal.custcd}
                          className="required"
                          readOnly={true}
                          onChange={filterInputChange}
                        />
                        <ButtonInInput>
                          <Button
                            type={"button"}
                            onClick={onStandardClick}
                            icon="more-horizontal"
                            fillMode="flat"
                          />
                        </ButtonInInput>
                      </>
                    ) : (
                      <Input
                        name="custcd"
                        type="text"
                        value={initialVal.custcd}
                        className="readonly"
                      />
                    )}
                  </td>
                  <th>반려견명</th>
                  <td>
                      <Input
                        name="custnm"
                        type="text"
                        value={initialVal.custnm}
                        className="readonly"
                      />
                  </td>
                </tr>
                <tr>
                  <th>종류</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        type="new"
                        name="gubun"
                        value={initialVal.gubun}
                        customOptionData={customOptionData}
                        changeData={filterComboBoxChange}
                      />
                    )}
                  </td>
                  <th>등록일자</th>
                  <td>
                    <DatePicker
                      name="strdt"
                      value={initialVal.strdt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </td>
                  <th>잔여등원횟수</th>
                  <td>
                    {workType == "N" ? (
                      <Input
                        name="janqty"
                        type="number"
                        value={initialVal.janqty}
                        className="required"
                        onChange={filterInputChange}
                      />
                    ) : (
                      <Input
                        name="janqty"
                        type="number"
                        value={initialVal.janqty}
                        className="readonly"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>금액</th>
                  <td>
                    <Input
                      name="amt"
                      type="number"
                      value={initialVal.amt}
                      onChange={filterInputChange}
                    />
                  </td>
                  <th>만기일자</th>
                  <td>
                    <DatePicker
                      name="enddt"
                      value={initialVal.enddt}
                      format="yyyy-MM-dd"
                      onChange={filterInputChange}
                      placeholder=""
                    />
                  </td>
                  <th>잔여변경횟수</th>
                  <td>
                    {workType == "N" ? (
                      <Input
                        name="adjqty"
                        type="number"
                        value={initialVal.adjqty}
                        className="required"
                        onChange={filterInputChange}
                      />
                    ) : (
                      <Input
                        name="adjqty"
                        type="number"
                        value={initialVal.adjqty}
                        className="readonly"
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <th>메모</th>
                  <td colSpan={7}>
                    <TextArea
                      value={initialVal.remark}
                      name="remark"
                      rows={2}
                      onChange={filterInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
      <BottomContainer>
        <ButtonContainer>
          <Button themeColor={"primary"} onClick={handleSubmit}>
            확인
          </Button>
          <Button themeColor={"primary"} fillMode={"outline"} onClick={onClose}>
            닫기
          </Button>
        </ButtonContainer>
      </BottomContainer>
      {standardWindowVisible && (
        <BizComponentPopupWindow
          setVisible={setStandardWindowVisible}
          setData={setPopupData}
          bizComponentID="P_BA120T"
          modal={false}
        />
      )}
    </Window>
  );
};

export default KendoWindow;
