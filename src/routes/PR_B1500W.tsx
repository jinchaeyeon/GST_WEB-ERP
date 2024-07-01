import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import {
  Grid,
  GridColumn,
  GridDataStateChangeEvent
} from "@progress/kendo-react-grid";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ButtonContainer,
  FilterBox,
  GridContainer,
  GridTitle,
  GridTitleContainer,
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
  getDeviceHeight,
  getHeight,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import CustomOptionRadioGroup from "../components/RadioGroups/CustomOptionRadioGroup";
import { gridList } from "../store/columns/PR_B1500W_C";
import { TColumn, TGrid, TPermissions } from "../store/types";

var height = 0;
var height2 = 0;

const PR_B1500W: React.FC = () => {
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  //메시지 조회
  const [messagesData, setMessagesData] = React.useState<any>(null);
  UseMessages("PR_B1500W", setMessagesData);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("PR_B1500W", setCustomOptionData);
  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".ButtonContainer");
      height2 = getHeight(".TitleContainer");

      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        // setMobileHeight(getDeviceHeight(true) - height - height5);
        setWebHeight(getDeviceHeight(true) - height - height2);
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
        div: defaultOption.find((item: any) => item.id == "div")?.valueCode,
        dptcd: defaultOption.find((item: any) => item.id == "dptcd")?.valueCode,
        itemlvl1: defaultOption.find((item: any) => item.id == "itemlvl1")
          ?.valueCode,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  //엑셀 내보내기
  let _export: any;
  const exportExcel = () => {
    if (_export !== null && _export !== undefined) {
      const optionsGridOne = _export.workbookOptions();
      optionsGridOne.sheets[0].title = "설비가동현황모니터링";
      _export.save(optionsGridOne);
    }
  };

  const search = () => {};
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "Q",
    orgdiv: sessionOrgdiv,
    location: sessionLocation,
    time: 5,
    fxnum: "",
    fxnm: "",
    fxno: "",
    classnm1: "",
    classnm2: "",
    classnm3: "",
    spec: "",
    dptcd: "",
    itemlvl1: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
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

  const filterRadioChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onPlay = () => {};
  const onStop = () => {};

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const onMainDataStateChange = (event: GridDataStateChangeEvent) => {
    setMainDataState(event.dataState);
  };
  const onMainSortChange = (e: any) => {
    setMainDataState((prev) => ({ ...prev, sort: e.sort }));
  };

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>설비가동현황모니터링</Title>

        <ButtonContainer>
          {permissions && (
            <TopButtons
              search={search}
              exportExcel={exportExcel}
              permissions={permissions}
              pathname="PR_B3000W"
            />
          )}
        </ButtonContainer>
      </TitleContainer>
      <FilterContainer>
        <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
          <tbody>
            <tr>
              <th>주기(초)</th>
              <td>
                <Input
                  name="time"
                  type="number"
                  value={filters.time}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비번호</th>
              <td>
                <Input
                  name="fxnum"
                  type="text"
                  value={filters.fxnum}
                  onChange={filterInputChange}
                />
              </td>
              <th>설비호기</th>
              <td>
                <Input
                  name="fxno"
                  type="text"
                  value={filters.fxno}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류1</th>
              <td>
                <Input
                  name="classnm1"
                  type="text"
                  value={filters.classnm1}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류3</th>
              <td>
                <Input
                  name="classnm3"
                  type="text"
                  value={filters.classnm3}
                  onChange={filterInputChange}
                />
              </td>
            </tr>
            <tr>
              <th></th>
              <td></td>
              <th>설비명</th>
              <td>
                <Input
                  name="fxnm"
                  type="text"
                  value={filters.fxnm}
                  onChange={filterInputChange}
                />
              </td>
              <th>사양</th>
              <td>
                <Input
                  name="spec"
                  type="text"
                  value={filters.spec}
                  onChange={filterInputChange}
                />
              </td>
              <th>분류2</th>
              <td>
                <Input
                  name="classnm2"
                  type="text"
                  value={filters.classnm2}
                  onChange={filterInputChange}
                />
              </td>
              <th>구분</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionRadioGroup
                    name="div"
                    customOptionData={customOptionData}
                    changeData={filterRadioChange}
                  />
                )}
              </td>
            </tr>
            <tr>
              <th></th>
              <td></td>
              <th>부서</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="dptcd"
                    value={filters.dptcd}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                    textField="dptnm"
                    valueField="dptcd"
                  />
                )}
              </td>
              <th></th>
              <td></td>
              <th></th>
              <td></td>
              <th>대분류</th>
              <td>
                {customOptionData !== null && (
                  <CustomOptionComboBox
                    name="itemlvl1"
                    value={filters.itemlvl1}
                    customOptionData={customOptionData}
                    changeData={filterComboBoxChange}
                  />
                )}
              </td>
            </tr>
          </tbody>
        </FilterBox>
      </FilterContainer>
      <GridContainer>
        <GridTitleContainer className="ButtonContainer">
          <GridTitle>
            <ButtonContainer>
              <Button
                onClick={onPlay}
                themeColor={"primary"}
                icon="play"
                disabled={permissions.view ? false : true}
                title="재생"
              ></Button>
              <Button
                onClick={onStop}
                themeColor={"primary"}
                icon="pause"
                disabled={permissions.view ? false : true}
                title="정지"
              ></Button>
            </ButtonContainer>
          </GridTitle>
        </GridTitleContainer>
        <ExcelExport
          data={mainDataResult.data}
          ref={(exporter) => {
            _export = exporter;
          }}
          fileName="설비가동현황모니터링"
        >
          <Grid
            style={{ height: webheight }}
            data={process(
              mainDataResult.data.map((row) => ({
                ...row,
              })),
              mainDataState
            )}
            {...mainDataState}
            onDataStateChange={onMainDataStateChange}
            //스크롤 조회 기능
            fixedScroll={true}
            total={mainDataResult.total}
            //정렬기능
            sortable={true}
            onSortChange={onMainSortChange}
            //컬럼순서조정
            reorderable={true}
            //컬럼너비조정
            resizable={true}
          >
            {customOptionData !== null &&
              customOptionData.menuCustomColumnOptions["grdList"]
                ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                ?.map(
                  (item: any, idx: number) =>
                    item.sortOrder !== -1 && (
                      <GridColumn
                        key={idx}
                        field={item.fieldName}
                        title={item.caption}
                        width={item.width}
                      />
                    )
                )}
          </Grid>
        </ExcelExport>
      </GridContainer>
      {gridList.map((grid: TGrid) =>
        grid.columns.map((column: TColumn) => (
          <div
            key={column.id}
            id={column.id}
            data-grid-name={grid.gridName}
            data-field={column.field}
            data-caption={column.caption}
            data-width={column.width}
            hidden
          />
        ))
      )}
    </>
  );
};

export default PR_B1500W;
