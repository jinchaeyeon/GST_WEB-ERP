import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { DataResult, State, process } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Input } from "@progress/kendo-react-inputs";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  ButtonInInput,
  FilterBox,
  GridContainer,
  GridContainerWrap,
  GridTitle,
  GridTitleContainer,
  Title,
  TitleContainer,
} from "../CommonStyled";
import YearCalendar from "../components/Calendars/YearCalendar";
import {
  GetPropertyValueByName,
  UseCustomOption,
  convertDateToStr,
  dateformat4,
  handleKeyPressSearch,
  setDefaultDate,
} from "../components/CommonFunction";
import { GAP } from "../components/CommonString";
import FilterContainer from "../components/Containers/FilterContainer";
import MultiChart from "../components/KPIcomponents/Chart/MultiChart";
import Progress from "../components/KPIcomponents/Progress/Progress";
import CustomersWindow from "../components/Windows/CommonWindows/CustomersWindow";
import { isLoading } from "../store/atoms";

const SA_B2229W: React.FC = () => {
  const [ChartList, setChartList] = useState([
    {
      series: "상",
      argument: "1월",
      value: 3,
    },
    {
      series: "상",
      argument: "2월",
      value: 0,
    },
    {
      series: "상",
      argument: "3월",
      value: 1,
    },
    {
      series: "상",
      argument: "4월",
      value: 1,
    },
    {
      series: "상",
      argument: "5월",
      value: 1,
    },
    {
      series: "상",
      argument: "6월",
      value: 4,
    },
    {
      series: "상",
      argument: "7월",
      value: 5,
    },
    {
      series: "상",
      argument: "8월",
      value: 0,
    },
    {
      series: "상",
      argument: "9월",
      value: 2,
    },
    {
      series: "상",
      argument: "10월",
      value: 0,
    },
    {
      series: "상",
      argument: "11월",
      value: 0,
    },
    {
      series: "상",
      argument: "12월",
      value: 3,
    },
    {
      series: "중",
      argument: "1월",
      value: 1,
    },
    {
      series: "중",
      argument: "2월",
      value: 2,
    },
    {
      series: "중",
      argument: "3월",
      value: 2,
    },
    {
      series: "중",
      argument: "4월",
      value: 2,
    },
    {
      series: "중",
      argument: "5월",
      value: 0,
    },
    {
      series: "중",
      argument: "6월",
      value: 5,
    },
    {
      series: "중",
      argument: "7월",
      value: 4,
    },
    {
      series: "중",
      argument: "8월",
      value: 1,
    },
    {
      series: "중",
      argument: "9월",
      value: 3,
    },
    {
      series: "중",
      argument: "10월",
      value: 3,
    },
    {
      series: "중",
      argument: "11월",
      value: 0,
    },
    {
      series: "중",
      argument: "12월",
      value: 4,
    },
    {
      series: "하",
      argument: "1월",
      value: 1,
    },
    {
      series: "하",
      argument: "2월",
      value: 0,
    },
    {
      series: "하",
      argument: "3월",
      value: 0,
    },
    {
      series: "하",
      argument: "4월",
      value: 3,
    },
    {
      series: "하",
      argument: "5월",
      value: 0,
    },
    {
      series: "하",
      argument: "6월",
      value: 0,
    },
    {
      series: "하",
      argument: "7월",
      value: 0,
    },
    {
      series: "하",
      argument: "8월",
      value: 3,
    },
    {
      series: "하",
      argument: "9월",
      value: 4,
    },
    {
      series: "하",
      argument: "10월",
      value: 3,
    },
    {
      series: "하",
      argument: "11월",
      value: 2,
    },
    {
      series: "하",
      argument: "12월",
      value: 0,
    },
  ]);

  const [ChartList2, setChartList2] = useState([
    {
      series: "상",
      argument: "1월",
      value: 1,
    },
    {
      series: "상",
      argument: "2월",
      value: 5,
    },
    {
      series: "상",
      argument: "3월",
      value: 2,
    },
    {
      series: "상",
      argument: "4월",
      value: 0,
    },
    {
      series: "상",
      argument: "5월",
      value: 2,
    },
    {
      series: "상",
      argument: "6월",
      value: 1,
    },
    {
      series: "상",
      argument: "7월",
      value: 5,
    },
    {
      series: "상",
      argument: "8월",
      value: 3,
    },
    {
      series: "상",
      argument: "9월",
      value: 1,
    },
    {
      series: "상",
      argument: "10월",
      value: 0,
    },
    {
      series: "상",
      argument: "11월",
      value: 1,
    },
    {
      series: "상",
      argument: "12월",
      value: 2,
    },
    {
      series: "중",
      argument: "1월",
      value: 2,
    },
    {
      series: "중",
      argument: "2월",
      value: 5,
    },
    {
      series: "중",
      argument: "3월",
      value: 4,
    },
    {
      series: "중",
      argument: "4월",
      value: 4,
    },
    {
      series: "중",
      argument: "5월",
      value: 4,
    },
    {
      series: "중",
      argument: "6월",
      value: 2,
    },
    {
      series: "중",
      argument: "7월",
      value: 1,
    },
    {
      series: "중",
      argument: "8월",
      value: 6,
    },
    {
      series: "중",
      argument: "9월",
      value: 3,
    },
    {
      series: "중",
      argument: "10월",
      value: 2,
    },
    {
      series: "중",
      argument: "11월",
      value: 1,
    },
    {
      series: "중",
      argument: "12월",
      value: 1,
    },
    {
      series: "하",
      argument: "1월",
      value: 0,
    },
    {
      series: "하",
      argument: "2월",
      value: 0,
    },
    {
      series: "하",
      argument: "3월",
      value: 0,
    },
    {
      series: "하",
      argument: "4월",
      value: 0,
    },
    {
      series: "하",
      argument: "5월",
      value: 2,
    },
    {
      series: "하",
      argument: "6월",
      value: 3,
    },
    {
      series: "하",
      argument: "7월",
      value: 5,
    },
    {
      series: "하",
      argument: "8월",
      value: 1,
    },
    {
      series: "하",
      argument: "9월",
      value: 2,
    },
    {
      series: "하",
      argument: "10월",
      value: 2,
    },
    {
      series: "하",
      argument: "11월",
      value: 2,
    },
    {
      series: "하",
      argument: "12월",
      value: 1,
    },
  ]);

  const [stackChartAllLabel, setStackChartAllLabel] = useState<any[]>(
    ChartList.filter(
      (item: { series: any }) =>
        item.series ==
        ChartList.filter(
          (arr: { series: any }, index: any, callback: any[]) =>
            index == callback.findIndex((t) => t.series == arr.series)
        )[0].series
    ).map((items: { argument: any }) => {
      return items.argument;
    })
  );

  const [stackChartLabel, setStackChartLabel] = useState<any[]>(
    ChartList.filter(
      (arr: { series: any }, index: any, callback: any[]) =>
        index == callback.findIndex((t) => t.series == arr.series)
    ).map((item: { series: any }) => {
      return item.series;
    })
  );

  const [TopPanel, setTopPanel] = useState({
    allChance: 8,
    Ycnt: 6,
    Ncnt: 2,
    successcnt: 4,
    failcnt: 0,
    ingcnt: 2,
    notingcnt: 2,
  });

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption("SA_B2229W", setCustomOptionData);
  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        yyyy: setDefaultDate(customOptionData, "yyyy"),
      }));
    }
  }, [customOptionData]);

  //조회조건 초기값
  const [filters, setFilters] = useState<{ [name: string]: any }>({
    yyyy: new Date(),
    custcd: "",
    custnm: "",
    isSearch: true,
  });

  const search = () => {
    setFilters((prev: any) => ({
      ...prev,
      isSearch: true,
    }));
  };

  interface ICustData {
    address: string;
    custcd: string;
    custnm: string;
    custabbr: string;
    bizregnum: string;
    custdivnm: string;
    useyn: string;
    remark: string;
    compclass: string;
    ceonm: string;
  }
  const [custWindowVisible, setCustWindowVisible] = useState<boolean>(false);
  //업체마스터 참조팝업 함수 => 선택한 데이터 필터 세팅
  const setCustData = (data: ICustData) => {
    setFilters((prev) => ({
      ...prev,
      custcd: data.custcd,
      custnm: data.custnm,
    }));
  };

  const onCustWndClick = () => {
    setCustWindowVisible(true);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });

  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const setLoading = useSetRecoilState(isLoading);

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    //  //조회조건 파라미터
    //  const parameters: Iparameters = {
    //    procedureName: "P_SA_A5001W_Q",
    //    pageNumber: filters.pgNum,
    //    pageSize: filters.pgSize,
    //    parameters: {
    //      "@p_work_type": "HEAD",
    //      "@p_orgdiv": filters.orgdiv,
    //      "@p_location": filters.location,
    //      "@p_outdt": convertDateToStr(filters.outdt),
    //      "@p_outdt2": convertDateToStr(filters.outdt2),
    //      "@p_person": filters.person,
    //      "@p_custcd": filters.custcd,
    //      "@p_custnm": filters.custnm,
    //      "@p_recdt": "",
    //      "@p_seq1": filters.seq1,
    //      "@p_gubun1": filters.gubun1,
    //      "@p_gubun2": filters.gubun2,
    //      "@p_doexdiv": filters.doexdiv,
    //      "@p_taxdiv": filters.taxdiv,
    //      "@p_itemcd": filters.itemcd,
    //      "@p_itemnm": filters.itemnm,
    //      "@p_rcvcustcd": filters.rcvcustcd,
    //      "@p_rcvcustnm": filters.rcvcustnm,
    //      "@p_finaldes": filters.finaldes,
    //      "@p_cargocd": filters.cargocd,
    //      "@p_taxyn": filters.taxyn,
    //      "@p_find_row_value": filters.find_row_value,
    //    },
    //  };

    //  try {
    //    data = await processApi<any>("procedure", parameters);
    //  } catch (error) {
    //    data = null;
    //  }

    //  if (data.isSuccess == true) {
    //    const totalRowCnt = data.tables[0].TotalRowCount;
    //    const rows = data.tables[0].Rows;

    //    setMainDataResult((prev) => {
    //      return {
    //        data: rows,
    //        total: totalRowCnt == -1 ? 0 : totalRowCnt,
    //      };
    //    });
    //  }

    setMainDataResult((prev) => {
      return {
        data: [
          {
            custnm: "동국제약",
            testpart: "의약품/합성신약",
            Feasibility: "상",
            Weight: "중",
          },
          {
            custnm: "오송바이오",
            testpart: "의약품/합성신약",
            Feasibility: "중",
            Weight: "상",
          },
        ],
        total: 2,
      };
    });
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

  //조회조건 사용자 옵션 디폴트 값 세팅 후 최초 한번만 실행
  useEffect(() => {
    if (filters.isSearch) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({
        ...prev,
        find_row_value: "",
        isSearch: false,
      })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters]);

  return (
    <>
      <div
        style={{
          fontFamily: "TheJamsil5Bold",
          marginBottom: "50px",
        }}
      >
        <TitleContainer className="TitleContainer">
          <Title>실적연계분석</Title>
          <ButtonContainer>
            <Button
              icon="search"
              themeColor={"primary"}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  isSearch: true,
                }))
              }
            />
          </ButtonContainer>
        </TitleContainer>
        <GridContainer style={{ marginBottom: "15px" }}>
          <Card
            style={{
              width: "100%",
              marginRight: "15px",
              backgroundColor: "white",
              color: "black",
              fontFamily: "TheJamsil5Bold",
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={2}>
                  <div
                    style={{
                      display: "flex",
                      alignContent: "space-around",
                      flexWrap: "wrap",
                      flexDirection: "column",
                      height: "100%",
                      justifyContent: "space-around",
                    }}
                  >
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 900 }}>
                      {convertDateToStr(filters.yyyy).substring(0, 4)}년 전체
                      영업기회 현황
                    </h2>
                    <h5 style={{ color: "gray" }}>
                      {dateformat4(convertDateToStr(new Date()))}기준
                    </h5>
                  </div>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={2}>
                  <List>
                    <ListItem
                      secondaryAction={<p>{TopPanel.allChance}건</p>}
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemIcon>
                          <FiberManualRecordIcon
                            style={{ fontSize: "small" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary="전체기회" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem
                      secondaryAction={<p>{TopPanel.Ycnt}건</p>}
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemIcon>
                          <FiberManualRecordIcon
                            style={{ fontSize: "small" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary="할당완료" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem
                      secondaryAction={<p>{TopPanel.Ncnt}건</p>}
                      disablePadding
                    >
                      <ListItemButton>
                        <ListItemIcon>
                          <FiberManualRecordIcon
                            style={{ fontSize: "small" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary="미할당" />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3} xl={2}>
                  <Progress
                    strokeWidth={8}
                    percentage={
                      (TopPanel.successcnt / TopPanel.allChance) * 100
                    }
                    Count={TopPanel.successcnt}
                    TopTitle={"영업성공"}
                    color={"#20c997"}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3} xl={2}>
                  <Progress
                    strokeWidth={8}
                    percentage={(TopPanel.failcnt / TopPanel.allChance) * 100}
                    Count={TopPanel.failcnt}
                    TopTitle={"영업실패"}
                    color={"#ff8787"}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3} xl={2}>
                  <Progress
                    strokeWidth={8}
                    percentage={(TopPanel.ingcnt / TopPanel.allChance) * 100}
                    Count={TopPanel.ingcnt}
                    TopTitle={"진행중"}
                    color={"#46a3f0"}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3} xl={2}>
                  <Progress
                    strokeWidth={8}
                    percentage={(TopPanel.notingcnt / TopPanel.allChance) * 100}
                    Count={TopPanel.notingcnt}
                    TopTitle={"미진행"}
                    color={"#f0c325"}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </GridContainer>
        <FilterContainer>
          <FilterBox onKeyPress={(e) => handleKeyPressSearch(e, search)}>
            <tbody>
              <tr>
                <th>업체코드</th>
                <td>
                  <div className="filter-item-wrap">
                    <Input
                      name="custcd"
                      type="text"
                      value={filters.custcd}
                      onChange={filterInputChange}
                    />
                    <ButtonInInput>
                      <Button
                        onClick={onCustWndClick}
                        icon="more-horizontal"
                        fillMode="flat"
                      />
                    </ButtonInInput>
                  </div>
                </td>
                <th>업체명</th>
                <td>
                  <Input
                    name="custnm"
                    type="text"
                    value={filters.custnm}
                    onChange={filterInputChange}
                  />
                </td>
                <th>년도</th>
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
              </tr>
            </tbody>
          </FilterBox>
        </FilterContainer>
        <GridContainerWrap>
          <GridContainer width="20%">
            <GridTitleContainer>
              <GridTitle>총 {mainDataResult.total}개</GridTitle>
            </GridTitleContainer>
            <Grid container spacing={2}>
              {mainDataResult.data.map((item) => (
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Card
                    style={{
                      height: "130px",
                      width: "100%",
                      marginRight: "15px",
                      backgroundColor: "#e9e9e9",
                      fontFamily: "TheJamsil5Bold",
                    }}
                  >
                    <CardHeader
                      style={{ paddingBottom: 0, paddingTop: 10 }}
                      title={
                        <>
                          <Typography
                            style={{
                              fontSize: "1.3rem",
                              color: "black",
                              fontWeight: 600,
                            }}
                          >
                            {item.custnm}
                          </Typography>
                          <Typography
                            style={{
                              fontSize: "0.8rem",
                              color: "gray",
                              fontWeight: 600,
                            }}
                          >
                            {item.testpart}
                          </Typography>
                        </>
                      }
                    />
                    <CardContent>
                      <Typography
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "black",
                          fontFamily: "TheJamsil5Bold",
                        }}
                      >
                        Feasibility : {item.Feasibility} / Weight :{item.Weight}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </GridContainer>
          <GridContainer width={`calc(80% - ${GAP}px)`}>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>Contract Feasibility</GridTitle>
              </GridTitleContainer>
              <MultiChart
                props={ChartList}
                value="value"
                name="series"
                color={["#70ad47", "#ffc000", "#ed7d31"]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
            </GridContainer>
            <GridContainer>
              <GridTitleContainer>
                <GridTitle>Contract Weight</GridTitle>
              </GridTitleContainer>
              <MultiChart
                props={ChartList2}
                value="value"
                name="series"
                color={["#70ad47", "#ffc000", "#ed7d31"]}
                alllabel={stackChartAllLabel}
                label={stackChartLabel}
                random={false}
              />
            </GridContainer>
          </GridContainer>
        </GridContainerWrap>
      </div>
      {custWindowVisible && (
        <CustomersWindow
          setVisible={setCustWindowVisible}
          workType={"N"}
          setData={setCustData}
          modal={true}
        />
      )}
    </>
  );
};

export default SA_B2229W;
