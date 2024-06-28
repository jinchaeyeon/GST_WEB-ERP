import React, { useEffect, useLayoutEffect, useState } from "react";
// ES2015 module syntax
import {
  ButtonContainer,
  FilterBox,
  FormBox,
  FormBoxWrap,
  GridContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import TopButtons from "../components/Buttons/TopButtons";
import CustomOptionComboBox from "../components/ComboBoxes/CustomOptionComboBox";
import {
  GetPropertyValueByName,
  UseBizComponent,
  UseCustomOption,
  UsePermissions,
  getBizCom,
  getDeviceHeight,
  getHeight,
} from "../components/CommonFunction";
import FilterContainer from "../components/Containers/FilterContainer";
import Calendar from "../components/CustomCalendar/Calendar";
import { ColorThemeProvider } from "../components/CustomCalendar/ColorThemeContext";
import { TPermissions } from "../store/types";

var height = 0;
var height2 = 0;
const CM_A1610W: React.FC = () => {
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UsePermissions(setPermissions);
  UseCustomOption("CM_A1610W", setCustomOptionData);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".FormBoxWrap");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height);
        setWebHeight(getDeviceHeight(false) - height - height2);
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
        person: defaultOption.find((item: any) => item.id == "person")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [filters, setFilters] = useState({
    workType: "Calendar",
    person: "",
    pgNum: 1,
    isSearch: false,
  });

  const search = () => {};

  const ComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [colorData, setColorData] = useState<any[]>([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_APPOINTMENT_COLOR", setBizComponentData);

  useEffect(() => {
    if (bizComponentData !== null) {
      setColorData(getBizCom(bizComponentData, "L_APPOINTMENT_COLOR"));
    }
  }, [bizComponentData]);

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>Scheduler</Title>
        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              permissions={permissions}
              pathname="CM_A1610W"
              disable={true}
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      {isMobile ? (
        <>
          <FilterContainer>
            <FilterBox>
              <tbody>
                <tr>
                  <th>작성자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FilterBox>
          </FilterContainer>
        </>
      ) : (
        <>
          <FormBoxWrap className="FormBoxWrap">
            <FormBox>
              <tbody>
                <tr>
                  <th>작성자</th>
                  <td>
                    {customOptionData !== null && (
                      <CustomOptionComboBox
                        name="person"
                        value={filters.person}
                        customOptionData={customOptionData}
                        changeData={ComboBoxChange}
                        className="required"
                        valueField="user_id"
                        textField="user_name"
                      />
                    )}
                  </td>
                </tr>
              </tbody>
            </FormBox>
          </FormBoxWrap>
        </>
      )}
      <GridContainer style={{ height: isMobile ? mobileheight : webheight }}>
        <ColorThemeProvider>
          <Calendar colorData={colorData} />
        </ColorThemeProvider>
      </GridContainer>
    </>
  );
};

export default CM_A1610W;
