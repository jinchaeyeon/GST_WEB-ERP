import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import SwiperCore from "swiper";
import "swiper/css";
import {
  ButtonContainer,
  FilterBox,
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
  UsePermissions,
  dateformat7,
  handleKeyPressSearch,
} from "../components/CommonFunction";
import { PAGE_SIZE } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import FlowChart from "../components/Layout/FlowChart";
import { useApi } from "../hooks/api";
import { isLoading } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";

var index = 0;

const SY_A0060W: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperCore>();

  let deviceWidth = window.innerWidth;
  let deviceHeight = window.innerHeight - 50;

  let isMobile = deviceWidth <= 1200;

  const [permissions, setPermissions] = useState<TPermissions | null>(null);
  UsePermissions(setPermissions);
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SY_A0060W", setCustomOptionData);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        location: defaultOption.find((item: any) => item.id == "location")
          ?.valueCode,
      }));
    }
  }, [customOptionData]);

  const search = () => {
    setTabSelected(0);
    setClicks(true);
    setWorkType("U");
    setFilters((prev) => ({ ...prev, pgNum: 1, isSearch: true }));
  };
  const [tabSelected, setTabSelected] = useState(0);
  const [clicks, setClicks] = useState(true);

  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);

    if (e.selected == 0) {
      setClicks(true);
      setWorkType("U");
    }
  };
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "LIST",
    orgdiv: sessionOrgdiv,
    location: "",
    pgNum: 1,
    isSearch: true,
  });

  const [filters2, setFilters2] = useState({
    orgdiv: sessionOrgdiv,
    location: "",
    layout_key: "",
    layout_id: "",
    layout_name: "",
    attdatnum: "",
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0060W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_layout_key": "",
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[에러발생]");
      console.log(data);
    }
    // 필터 isSearch false처리, pgNum 세팅
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

  useEffect(() => {
    if (filters.isSearch && permissions !== null && customOptionData !== null) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions]);

  const filterComboBoxChange = (e: any) => {
    const { name, value } = e;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataState2, setMainDataState2] = useState<State>({
    sort: [],
  });

  //그리드 데이터 결과값
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  //그리드 데이터 결과값
  const [mainDataResult2, setMainDataResult2] = useState<DataResult>(
    process([], mainDataState2)
  );
  const [workType, setWorkType] = useState("U");

  const DetailView = async (item: any) => {
    let response: any;
    let data: any;
    const parameters = {
      attached: "list?attachmentNumber=" + item.attdatnum,
    };
    try {
      data = await processApi<any>("file-list", parameters);
    } catch (error) {
      data = null;
    }

    if (data !== null && data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      try {
        response = await processApi<any>("file-download", {
          attached: rows[0].saved_name,
        });
      } catch (error) {
        response = null;
      }

      if (response !== null) {
        const blob = new Blob([response.data]);
        const filess = JSON.parse(await blob.text());
        setMainDataResult2({
          data: filess,
          total: filess.length,
        });
        setFilters2((prev) => ({
          ...prev,
          orgdiv: item.orgdiv,
          location: item.location,
          layout_key: item.layout_key,
          layout_id: item.layout_id,
          layout_name: item.layout_name,
          attdatnum: item.attdatnum,
        }));
        setClicks(false);
        setTabSelected(1);
        setWorkType("U");
      }
    }
  };

  const onNewClick = () => {
    setFilters2((prev) => ({
      ...prev,
      orgdiv: sessionOrgdiv,
      layout_key: "",
      layout_id: "",
      layout_name: "",
      attdatnum: "",
    }));
    setClicks(false);
    setTabSelected(1);
    setWorkType("N");
  };

  return (
    <>
      {isMobile ? (
        <>
          <TitleContainer>
            <Title>레이아웃 설정(NEW)</Title>
            <FilterContainer>
              <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                <tbody>
                  <tr>
                    <th>사업장</th>
                    <td>
                      {customOptionData !== null && (
                        <CustomOptionComboBox
                          name="location"
                          value={filters.location}
                          customOptionData={customOptionData}
                          changeData={filterComboBoxChange}
                        />
                      )}
                    </td>
                    <th></th>
                    <td></td>
                  </tr>
                </tbody>
              </FilterBox>
            </FilterContainer>
            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  permissions={permissions}
                  disable={true}
                  pathname="SY_A0060W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <TabStrip
            style={{
              width: isMobile ? `${deviceWidth - 30}px` : "100%",
              height: isMobile ? `${deviceHeight * 0.8}px` : "",
            }}
            selected={tabSelected}
            onSelect={handleSelectTab}
          >
            <TabStripTab title="레이아웃 리스트">
              <Box className="overflow_scrollhidden">
                <GridTitleContainer>
                  <GridTitle></GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onNewClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="file-add"
                      style={{ marginBottom: "5px" }}
                    >
                      신규
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid style={{ marginBottom: "30px" }} container spacing={2}>
                  {mainDataResult.data.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
                      <Card onClick={(e) => DetailView(item)}>
                        <CardActionArea>
                          {item.preview_image == "" ||
                          item.preview_image == undefined ||
                          item.preview_image == null ? (
                            <div style={{ height: "250px" }}></div>
                          ) : (
                            <CardMedia
                              component="img"
                              height="250"
                              image={item.preview_image}
                              alt="layout"
                            />
                          )}
                          <CardContent style={{ backgroundColor: "#f0f5fa" }}>
                            <Typography
                              gutterBottom
                              variant="subtitle1"
                              component="div"
                              style={{ fontWeight: 600 }}
                            >
                              {item.layout_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              style={{ fontWeight: 400, color: "#b0adac" }}
                            >
                              {item.last_update_time == null
                                ? "--"
                                : dateformat7(item.last_update_time)}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabStripTab>
            <TabStripTab title="레이아웃 설정" disabled={clicks}>
              <FlowChart
                data={mainDataResult2.data}
                filters={filters2}
                workType={workType}
                setData={(bool: any) => {
                  if (bool == true) {
                    setFilters((prev) => ({
                      ...prev,
                      isSearch: true,
                    }));
                  } else {
                    setTabSelected(0);
                    setClicks(true);
                    setWorkType("U");
                    setFilters((prev) => ({
                      ...prev,
                      isSearch: true,
                    }));
                  }
                }}
              />
            </TabStripTab>
          </TabStrip>
        </>
      ) : (
        <>
          <TitleContainer>
            <Title>레이아웃 설정(NEW)</Title>

            <ButtonContainer>
              {permissions && (
                <TopButtons
                  search={search}
                  permissions={permissions}
                  disable={true}
                  pathname="SY_A0060W"
                />
              )}
            </ButtonContainer>
          </TitleContainer>
          <TabStrip
            style={{
              width: isMobile ? `${deviceWidth - 30}px` : "100%",
              height: isMobile ? `${deviceHeight * 0.8}px` : "",
            }}
            selected={tabSelected}
            onSelect={handleSelectTab}
          >
            <TabStripTab title="레이아웃 리스트">
              <FilterContainer>
                <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
                  <tbody>
                    <tr>
                      <th>사업장</th>
                      <td>
                        {customOptionData !== null && (
                          <CustomOptionComboBox
                            name="location"
                            value={filters.location}
                            customOptionData={customOptionData}
                            changeData={filterComboBoxChange}
                          />
                        )}
                      </td>
                      <th></th>
                      <td></td>
                    </tr>
                  </tbody>
                </FilterBox>
              </FilterContainer>
              <Box className="overflow_scrollhidden" style={{ height: "78vh" }}>
                <GridTitleContainer>
                  <GridTitle></GridTitle>
                  <ButtonContainer>
                    <Button
                      onClick={onNewClick}
                      fillMode="outline"
                      themeColor={"primary"}
                      icon="file-add"
                    >
                      신규
                    </Button>
                  </ButtonContainer>
                </GridTitleContainer>
                <Grid style={{ marginBottom: "30px" }} container spacing={2}>
                  {mainDataResult.data.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
                      <Card onClick={(e) => DetailView(item)}>
                        <CardActionArea>
                          {item.preview_image == "" ||
                          item.preview_image == undefined ||
                          item.preview_image == null ? (
                            <div style={{ height: "250px" }}></div>
                          ) : (
                            <CardMedia
                              component="img"
                              height="250"
                              image={item.preview_image}
                              alt="layout"
                            />
                          )}
                          <CardContent style={{ backgroundColor: "#f0f5fa" }}>
                            <Typography
                              gutterBottom
                              variant="subtitle1"
                              component="div"
                              style={{ fontWeight: 600 }}
                            >
                              {item.layout_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              style={{ fontWeight: 400, color: "#b0adac" }}
                            >
                              {item.last_update_time == null
                                ? "--"
                                : dateformat7(item.last_update_time)}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </TabStripTab>
            <TabStripTab title="레이아웃 설정" disabled={clicks}>
              <FlowChart
                data={mainDataResult2.data}
                filters={filters2}
                workType={workType}
                setData={(bool: any) => {
                  if (bool == true) {
                    setFilters((prev) => ({
                      ...prev,
                      isSearch: true,
                    }));
                  } else {
                    setTabSelected(0);
                    setClicks(true);
                    setWorkType("U");
                    setFilters((prev) => ({
                      ...prev,
                      isSearch: true,
                    }));
                  }
                }}
              />
            </TabStripTab>
          </TabStrip>
        </>
      )}
    </>
  );
};
export default SY_A0060W;
