import {
  useEffect,
  useState,
  useContext,
  useCallback,
  createContext,
} from "react";
import * as React from "react";
import { Window, WindowMoveEvent } from "@progress/kendo-react-dialogs";

import { getter } from "@progress/kendo-react-common";
import { useApi } from "../../hooks/api";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import {
  BottomContainer,
  ButtonContainer,
  ButtonInField,
  ButtonInFieldWrap,
  FieldWrap,
  FormBox,
  FormBoxWrap,
  FormFieldWrap,
  GridContainer,
  Title,
  TitleContainer,
} from "../../CommonStyled";
import { Iparameters } from "../../store/types";
import {
  UseBizComponent,
  UseCustomOption,
  getQueryFromBizComponent,
} from "../CommonFunction";
import { IWindowPosition } from "../../hooks/interfaces";
import {
  COM_CODE_DEFAULT_VALUE,
  FORM_DATA_INDEX,
  PAGE_SIZE,
} from "../CommonString";

import { Input } from "@progress/kendo-react-inputs";
import CustomOptionComboBox from "../ComboBoxes/CustomOptionComboBox";

import { bytesToBase64 } from "byte-base64";

const idGetter = getter(FORM_DATA_INDEX);

type TKendoWindow = {
  getVisible(t: boolean): void;
  reloadData(workType: string): void;
  workType: "U" | "N";
  ordnum?: string;
  isCopy: boolean;
  para?: Iparameters; //{};
};

const KendoWindow = ({
  getVisible,
  reloadData,
  workType,
  isCopy,
  para,
}: TKendoWindow) => {
  const pathname: string = window.location.pathname.replace("/", "");

  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    orgdiv: "01",
    location: "",
    prsnnum: "", //사번
    email: "", //이메일
    prsnnm: "", //성명
    paycd: "", //급여지급유형
    koraddr: "", //주민등록지주소
    perregnum: "", //주민번호
    firredt: new Date(), //정산입사일
    zipcode: "", //우편번호
    birdt: new Date(), //생년월일
    occudate: new Date(), //연차발생기준일
    hmaddr: "", //실제거주지주소
    regorgdt: new Date(), //입사일
    extnum: "", //내선번호
    phonenum: "", // 전화번호
    rtrdt: new Date(), //퇴사일
    remark: "", //비고
  });

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    console.log("aa");
    
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.new;

      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id === "location")
          .valueCode,
      }));
    }
  }, [customOptionData]);

  // BizComponentID 세팅
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_BA002", setBizComponentData);

  //ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Input Change 함수 => 사용자가 Input에 입력한 값을 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [position, setPosition] = useState<IWindowPosition>({
    left: 300,
    top: 100,
    width: 1200,
    height: 700,
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

  const onClose = () => {
    getVisible(false);
  };

  return (
    <Window
      title={workType === "N" ? "신규등록" : "인사상세"}
      width={position.width}
      height={position.height}
      onMove={handleMove}
      onResize={handleResize}
      onClose={onClose}
    >
      <FormBoxWrap border={true}>
        <FormBox>
          <colgroup>
            <col width="5%" />
            <col width="20%" />
            <col width="5%" />
            <col width="20%" />
            <col width="5%" />
            <col width="60%" />
          </colgroup>
          <tbody>
            <tr>
              <th>사번</th>
              <td>
                <Input
                  name="prsnnum"
                  type="text"
                  value={filters.prsnnum}
                  className="required"
                  onChange={filterInputChange}
                />
              </td>

              <th>사업장</th>
              <td>
                {/* {customOptionData !== null && (
                  <CustomOptionComboBox
                    tag = "new",
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )} */}
              </td>

              <th>이메일</th>
              <td>
                <Input
                  name="email"
                  type="text"
                  value={filters.email}
                  onChange={filterInputChange}
                />
              </td>
            </tr>

            <tr>
              <th>성명</th>
              <td>
                <Input
                  name="prsnnm"
                  type="text"
                  value={filters.prsnnm}
                  className="required"
                  onChange={filterInputChange}
                />
              </td>

              <th>급여지급유형</th>
              <td>
                {/* {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="paycd"
                    value={filters.paycd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )} */}
              </td>

              <th>주민등록지주소</th>
              <td>
                <Input name="koraddr" type="text" value={filters.koraddr} />
              </td>
            </tr>

            <tr>
              <th>주민번호</th>
              <td>
                <Input
                  name="perregnum"
                  type="text"
                  value={filters.perregnum}
                  className="required"
                />
              </td>
              <th>정산입사일</th>
              <td>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="firredt"
                    value={filters.firredt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                  />
                </div>
              </td>

              <th>우편번호</th>
              <td>
                <Input name="zipcode" type="text" value={filters.zipcode} />
              </td>
            </tr>

            <tr>
              <th>생년월일</th>
              <td>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="birdt"
                    value={filters.birdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </div>
              </td>

              <th>연차발생기준일</th>
              <td>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="occudate"
                    value={filters.occudate}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                  />
                </div>
              </td>

              <th>실제거주지주소</th>
              <td>
                <Input name="hmaddr" type="text" value={filters.hmaddr} />
              </td>
            </tr>

            <tr>
              <th>입사일</th>
              <td>
                <div className="filter-item-wrap">
                  <DatePicker
                    name="regorgdt"
                    value={filters.regorgdt}
                    format="yyyy-MM-dd"
                    onChange={filterInputChange}
                    placeholder=""
                    className="required"
                  />
                </div>
              </td>

              <th>내선번호</th>
              <td>
                <Input name="extnum" type="text" value={filters.extnum} />
              </td>
              <th>전화번호</th>
              <td>
                <Input name="phonenum" type="text" value={filters.phonenum} />
              </td>
            </tr>

            <tr>
              <th>비고</th>
              <td colSpan={5} rowSpan={2}>
                <Input name="remark" type="text" value={filters.remark} />
              </td>
            </tr>
          </tbody>
        </FormBox>
      </FormBoxWrap>
    </Window>
  );
};

export default KendoWindow;
