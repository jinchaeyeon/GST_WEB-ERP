import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { MultiColumnComboBox } from "@progress/kendo-react-dropdowns";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { AppBar, AppBarSection } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import {
    ButtonInInput,
    FormBox,
    FormBoxWrap,
    GridContainer,
    GridTitle,
    GridTitleContainer,
    Title,
    TitleContainer,
} from "../CommonStyled";
import YearCalendar from "../components/Calendars/YearCalendar";
import { UseCustomOption } from "../components/CommonFunction";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";

const BA_A0020W_603: React.FC = () => {
  const pathname: string = window.location.pathname.replace("/", "");
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(pathname, setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = customOptionData.menuCustomDefaultOptions.query;
      setFilters((prev) => ({
        ...prev,
        yn: defaultOption.find((item: any) => item.id === "yn").valueCode,
      }));
    }
  }, [customOptionData]);
  //조회조건 초기값
  const [filters, setFilters] = useState({
    company: "",
    companyName: "",
    address: "",
    yn: "Y",
    contractHistory: "",
    yyyy: new Date(),
    employeesNumber: 0,
    Totalassets: 0,
    Totalliabilities: 0,
    Totalcapital: 0,
    Sales: 0,
    businessprofits: 0,
    Currentprofit: 0,
    files: "",
    name: "",
    position: "",
    address_customer: "",
    number: "",
    phonenumber: "",
    email: "",
    remark: "",
  });

  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 ComboBox Change 함수 => 사용자가 선택한 콤보박스 값을 조회 파라미터로 세팅
  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 Radio Group Change 함수 => 사용자가 선택한 라디오버튼 값을 조회 파라미터로 세팅
  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <React.Fragment>
        <AppBar style={{ backgroundColor: "#002060" }}>
          <AppBarSection>
            <TitleContainer>
              <Title style={{ color: "white" }}>고객社 관리</Title>
            </TitleContainer>
          </AppBarSection>
        </AppBar>
        <GridContainer>
          <GridContainer style={{ marginTop: "30px" }}>
            <GridTitleContainer>
              <GridTitle>▣ 기준정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox className="CRM">
                <tbody>
                  <tr>
                    <th>회사명</th>
                    <td>
                      <Input
                        name="company"
                        type="text"
                        value={filters.company}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>그룹명(모기업)</th>
                    <td>
                      <Input
                        name="companyName"
                        type="text"
                        value={filters.companyName}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td colSpan={3}>
                      <Input
                        name="address"
                        type="text"
                        value={filters.address}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>기업 분류</th>
                    <td>
                      <MultiColumnComboBox
                        data={[]}
                        columns={[]}
                        onChange={filterComboBoxChange}
                      />
                    </td>
                    <th>개발분야</th>
                    <td>
                      <MultiColumnComboBox
                        data={[]}
                        columns={[]}
                        onChange={filterComboBoxChange}
                      />
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>상장유무</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionRadioGroup
                          name="yn"
                          customOptionData={customOptionData}
                          changeData={filterRadioChange}
                        />
                      )}
                    </td>
                    <th>신용평가 등급</th>
                    <td>
                      <MultiColumnComboBox
                        data={[]}
                        columns={[]}
                        onChange={filterComboBoxChange}
                      />
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>계약 이력</th>
                    <td>
                      <Input
                        name="contractHistory"
                        type="text"
                        value={filters.contractHistory}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th></th>
                    <td colSpan={3}></td>
                  </tr>
                </tbody>
              </FormBox>
            </FormBoxWrap>
          </GridContainer>
          <GridContainer style={{ marginTop: "30px" }}>
            <GridTitleContainer>
              <GridTitle>▣ 재무현황 정보</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox className="CRM">
                <tbody>
                  <tr>
                    <th>기준년도</th>
                    <td>
                      <DatePicker
                        name="yyyy"
                        value={filters.yyyy}
                        format="yyyy"
                        onChange={filterInputChange}
                        placeholder=""
                        calendar={YearCalendar}
                      />
                    </td>
                    <th>종업원 수</th>
                    <td>
                      <Input
                        name="employeesNumber"
                        type="number"
                        value={filters.employeesNumber}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>자산총계</th>
                    <td>
                      <Input
                        name="Totalassets"
                        type="number"
                        value={filters.Totalassets}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>부채총계</th>
                    <td>
                      <Input
                        name="Totalliabilities"
                        type="number"
                        value={filters.Totalliabilities}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>자본총계</th>
                    <td>
                      <Input
                        name="Totalcapital"
                        type="number"
                        value={filters.Totalcapital}
                        onChange={filterInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>매출액</th>
                    <td>
                      <Input
                        name="Sales"
                        type="number"
                        value={filters.Sales}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>영업이익</th>
                    <td>
                      <Input
                        name="businessprofits"
                        type="number"
                        value={filters.businessprofits}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>당기순이익</th>
                    <td>
                      <Input
                        name="Currentprofit"
                        type="number"
                        value={filters.Currentprofit}
                        onChange={filterInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>첨부파일</th>
                    <td colSpan={5}>
                      <Input
                        name="files"
                        type="text"
                        value={filters.files}
                        className="readonly"
                      />
                      <ButtonInInput>
                        <Button
                          type={"button"}
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
          <GridContainer style={{ marginTop: "30px" }}>
            <GridTitleContainer>
              <GridTitle>▣ 고객社 담당자(고객)</GridTitle>
            </GridTitleContainer>
            <FormBoxWrap border={true}>
              <FormBox className="CRM">
                <tbody>
                  <tr>
                    <th>성명</th>
                    <td>
                      <Input
                        name="name"
                        type="text"
                        value={filters.name}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>부서</th>
                    <td>
                      <MultiColumnComboBox
                        data={[]}
                        columns={[]}
                        onChange={filterComboBoxChange}
                      />
                    </td>
                    <th>직위/직책</th>
                    <td>
                      <Input
                        name="position"
                        type="text"
                        value={filters.position}
                        onChange={filterInputChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td>
                      <Input
                        name="address_customer"
                        type="text"
                        value={filters.address_customer}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th></th>
                    <td></td>
                    <th></th>
                    <td></td>
                  </tr>
                  <tr>
                    <th>전화번호</th>
                    <td>
                      <Input
                        name="number"
                        type="text"
                        value={filters.number}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>휴대폰번호</th>
                    <td>
                      <Input
                        name="phonenumber"
                        type="text"
                        value={filters.phonenumber}
                        onChange={filterInputChange}
                      />
                    </td>
                    <th>메일주소</th>
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
                    <th>비고</th>
                    <td colSpan={5}>
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
          </GridContainer>
        </GridContainer>
      </React.Fragment>
    </>
  );
};

export default BA_A0020W_603;
