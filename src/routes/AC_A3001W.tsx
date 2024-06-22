import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Checkbox } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
  convertDateToStr,
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import FileViewers from "../components/Viewer/FileViewers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

var height = 0;

const AC_A3001W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("AC_A3001W", setCustomOptionData);
  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(true) - height);
        setWebHeight(getDeviceHeight(true) - height);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight]);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );

      setFilters((prev) => ({
        ...prev,
        fxyrmm: setDefaultDate(customOptionData, "fxyrmm"),
        gubun: defaultOption.find((item: any) => item.id == "gubun")?.valueCode,
        fxdiv: defaultOption.find((item: any) => item.id == "fxdiv")?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const search = () => {
    fetchMainGrid();
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //조회조건 초기값
  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    fxyrmm: new Date(),
    gubun: "",
    fxdiv: "",
    chk: false,
    isSearch: false,
  });
  const setLoading = useSetRecoilState(isLoading);
  const [url, setUrl] = useState<string>("");
  const processApi = useApi();

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;
    let data2: any;

    setLoading(true);
    const parameters = {
      para: "list?emmId=AC_A3001_1",
    };

    try {
      data = await processApi<any>("excel-view-mail", parameters);
    } catch (error) {
      data = null;
    }

    if (data.RowCount > 0) {
      const rows = data.Rows;

      const parameters2 = {
        para: "document-json?id=" + rows[0].document_id,
        "@p_orgdiv": filters.orgdiv,
        "@p_fxyrmm": convertDateToStr(filters.fxyrmm).substring(0, 6),
        "@p_gubun": filters.gubun,
        "@p_fxdiv": filters.fxdiv,
        "@p_acntses": "",
        "@p_acntnm": "",
        "@p_chk": filters.chk == true ? "Y" : "N",
      };
      try {
        data2 = await processApi<any>("excel-view", parameters2);
      } catch (error) {
        data2 = null;
      }
      if (data2 !== null) {
        const byteCharacters = atob(data2.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/pdf",
        });
        setUrl(URL.createObjectURL(blob));
      } else {
        setUrl("");
      }
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    setFilters((prev) => ({
      ...prev,
      isSearch: false,
    }));
    setLoading(false);
  };

  // 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch && permissions.view && customOptionData !== null) {
      fetchMainGrid();
    }
  }, [filters, permissions, customOptionData]);

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>자산명세서</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              disable={true}
              permissions={permissions}
              pathname="AC_A3001W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>기준일자</th>
              <td>
                <DatePicker
                  name="fxyrmm"
                  format="yyyy-MM-dd"
                  value={filters.fxyrmm}
                  onChange={filterInputChange}
                  placeholder=""
                />
              </td>
              <th>자산유형</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="gubun"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
              <th>자산분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="fxdiv"
                    value={filters.fxdiv}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
              <th>미상각자산 포함</th>
              <td>
                <Checkbox
                  name="chk"
                  value={filters.chk}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <div
          style={{
            height: isMobile ? mobileheight : webheight,
          }}
        >
          {url != "" ? <FileViewers fileUrl={url} isMobile={isMobile} /> : ""}
        </div>
      </GridContainer>
    </>
  );
};

export default AC_A3001W;
