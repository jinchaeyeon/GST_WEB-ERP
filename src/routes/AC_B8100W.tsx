import { DatePicker } from "@progress/kendo-react-dateinputs";
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
  UseMessages,
  UsePermissions,
  convertDateToStr,
  findMessage,
  getDeviceHeight,
  getHeight,
  getMenuName,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import CommonDateRangePicker from "../components/DateRangePicker/CommonDateRangePicker";
import FileViewers from "../components/Viewer/FileViewers";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { TPermissions } from "../store/types";

var height = 0;

const AC_B8100W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const processApi = useApi();

  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);

  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const setLoading = useSetRecoilState(isLoading);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages(setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);
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
        frdt: new Date(
          parseInt(convertDateToStr(new Date()).substring(0, 4)),
          0,
          1
        ),
        todt: setDefaultDate(customOptionData, "todt"),
        taxdt: setDefaultDate(customOptionData, "taxdt"),
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [url, setUrl] = useState<string>("");

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

  //조회조건 초기값
  const [filters, setFilters] = useState({
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    frdt: new Date(),
    todt: new Date(),
    taxdt: new Date(),
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async () => {
    if (!permissions.view) return;
    let data: any;

    setLoading(true);
    const parameters = {
      para: "document-json?id=S202387E58E",
      "@p_orgdiv": filters.orgdiv,
      "@p_location": filters.location,
      "@p_taxdt": convertDateToStr(filters.taxdt),
      "@p_frdt": convertDateToStr(filters.frdt),
      "@p_todt": convertDateToStr(filters.todt),
    };

    try {
      data = await processApi<any>("excel-view", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null) {
      const byteCharacters = atob(data.data);
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

  const search = () => {
    try {
      if (
        convertDateToStr(filters.frdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.frdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.frdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.frdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else if (
        convertDateToStr(filters.todt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.todt).substring(6, 8) > "31" ||
        convertDateToStr(filters.todt).substring(6, 8) < "01" ||
        convertDateToStr(filters.todt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else if (
        convertDateToStr(filters.taxdt).substring(0, 4) < "1997" ||
        convertDateToStr(filters.taxdt).substring(6, 8) > "31" ||
        convertDateToStr(filters.taxdt).substring(6, 8) < "01" ||
        convertDateToStr(filters.taxdt).substring(6, 8).length != 2
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else if (
        filters.location == null ||
        filters.location == undefined ||
        filters.location == ""
      ) {
        throw findMessage(messagesData, "AC_B8100W_001");
      } else {
        fetchMainGrid();
      }
    } catch (e) {
      alert(e);
    }
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>{getMenuName()}</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              disable={true}
              permissions={permissions}
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
                <CommonDateRangePicker
                  value={{
                    start: filters.frdt,
                    end: filters.todt,
                  }}
                  onChange={(e: { value: { start: any; end: any } }) =>
                    setFilters((prev) => ({
                      ...prev,
                      frdt: e.value.start,
                      todt: e.value.end,
                    }))
                  }
                  className="required"
                />
              </td>
              <th>사업장</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="location"
                    value={filters.location}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    className="required"
                  />
                )}
              </td>
              <th>신고일자</th>
              <td>
                <DatePicker
                  name="taxdt"
                  format="yyyy-MM-dd"
                  value={filters.taxdt}
                  onChange={filterInputChange}
                  className="required"
                  placeholder=""
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

export default AC_B8100W;
