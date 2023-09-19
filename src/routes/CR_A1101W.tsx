import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { useEffect, useState } from "react";
import { 
  State, 
  DataResult, 
  process as processQuery 
} from "@progress/kendo-data-query";
import { Iparameters, TPermissions } from "../store/types";
import { 
  UseGetValueFromSessionItem, 
  UseParaPc 
} from "../components/CommonFunction";
import { useApi } from "../hooks/api";
import { GAP, PAGE_SIZE } from "../components/CommonString";
import { GridContainer, GridContainerWrap } from "../CommonStyled";
import { Box, Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { isLoading } from "../store/atoms";
import { useSetRecoilState } from "recoil";
import { Field } from "@progress/kendo-react-form";

let check_userid = "";
let deviceWidth = window.innerWidth;
let isMobile = deviceWidth <= 1200;
const DATA_ITEM_KEY = "custcd";

const CR_A1101W: React.FC = () => {
  const processApi = useApi();
  const setLoading = useSetRecoilState(isLoading);
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userid = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [inputValue, setInputValue] = useState("");
  const [count, setCount] = useState(30);

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [subDataState, setSubDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    processQuery([], mainDataState)
  );
  const [subDataResult, setSubDataResult] = useState<DataResult>(
    processQuery([], subDataState)
  );
  

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    // 숫자만 입력되게끔
    const regex = /^[0-9\b -]{0,13}$/;
    if (regex.test(e.target.value)) {
      setInputValue(e.target.value);
    }

    const { value, name } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "CHECKUSER",
    orgdiv: "",
    location: "",
    mobile_no: "",
    userid: userid,
    custcd: "",
  });

  const [subfilters, setSubFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: "",
    location: "",
    mobile_no: "",
    userid: userid,
    custcd: "",
  });

  // 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const para: Iparameters = {
      procedureName: "P_CR_A1101W_Q",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_mobile_no": filters.mobile_no,
        "@p_userid": "",
        "@p_custcd": "",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setMainDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const fetchSubGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;
    setLoading(true);

    const para: Iparameters = {
      procedureName: "P_CR_A1101W_Q",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": subfilters.work_type,
        "@p_orgdiv": orgdiv,
        "@p_location": location,
        "@p_mobile_no": subfilters.mobile_no,
        "@p_userid": "",
        "@p_custcd": "",
      },
    };

    try {
      data = await processApi<any>("procedure", para);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess === true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows;

      setSubDataResult(() => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });

    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMainGrid();
  }, [filters]);

  useEffect(() => {
    fetchSubGrid();
  }, [subfilters]);

  const onCheckUser = async() => {
    const mobile_no = filters.mobile_no;
    let valid = false;

    if (mobile_no != null && mobile_no != "") {
      mainDataResult.data.map((item: any) => {
        if (item.mobile_no == mobile_no) {
          check_userid = item.user_id;
          valid = true;
        } else {
          alert("사용자가 존재하지 않습니다.");
          return;
        }
      });
    } else {
      alert("휴대폰번호를 입력해주세요.");
      return;
    }

    if (valid) {
      setSubFilters((prev) => ({
        ...prev,
        mobile_no: mobile_no,
      }));
    }
  };

  const resetInput = () => {
     // 휴대폰 번호 빈값 처리 및 조회 reset
     setInputValue("");
     setFilters((prev) => ({
       ...prev,
       mobile_no: "",
     }));
     setSubFilters((prev) => ({
      ...prev,
       mobile_no: "",
     }));
  };

  const [paraData, setParaData] = useState({
    workType: "SAVE",
    orgdiv: orgdiv,
    location: location,
    custcd: "",
    membership_id: "",
    user: "",
    user_id: userid,
    pc: pc,
    form_id: "CR_A1101W",
  });

  const para: Iparameters = {
    procedureName: "P_CR_A1101W_S",
    pageNumber: 0,
    pageSize: 0,
    parameters: {
      "@p_work_type": paraData.workType,
      "@p_orgdiv": paraData.orgdiv,
      "@p_location": paraData.location,
      "@p_custcd": paraData.custcd,
      "@p_membership_id": paraData.membership_id,
      "@p_user": paraData.user,
      "@p_userid": paraData.user_id,
      "@p_pc": pc,
      "@p_form_id": "CR_A1101W",
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

    if (data.isSuccess === true) {
      if (data.resultMessage != "") {
        alert(data.resultMessage);
      } else {
        alert("출석되었습니다.");
        resetInput();
      }
    } else {
      console.log("[오류 발생]");
      console.log(data);
    }
    setLoading(false);
  };

  const onSaveClick = async (custcd: string, custnm: string) => {
    if (
      !window.confirm( custnm + " 등원 하시겠습니까?")
    ) {
      return false;
    }

    const find_key = subDataResult.data.filter(
      (item) => item.custcd == custcd
    )[0].membership_id;

    setParaData((prev) => ({
      ...prev,
      workType: "N",
      orgdiv: orgdiv,
      location: location,
      custcd: custcd,
      membership_id: find_key,
      user: "",
      userid: userid,
      pc: pc,
      form_id: "CR_A1101W"
    }));
  };

  useEffect(() => {
    if (paraData != undefined && paraData.custcd != ""){
      fetchTodoGridSaved();
    }
  }, [paraData]);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((count) => count - 1);
    }, 1000);

    // 0이 되면 새로고침 및 다시 30초 카운트
    if (count === 0) {
      clearInterval(id);
      resetInput();
      setCount(30);
    };
    return () => clearInterval(id);
  }, [count]);

  return (
    <>
      <GridContainerWrap>
        <GridContainer 
          style = {{ width: isMobile ? "100%" : "45%", 
                    height: isMobile ? "45%" : "97vh", 
                    display: "flex",
                    backgroundColor: "#f5b901",
                    justifyContent: "center", 
                    alignItems: "center" }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/logo_ddgd.png`}
            alt=""
            width={isMobile ? "200px" : "400px"}
            height={isMobile ? "200px" : "400px"}
            style={{  borderRadius: "70%", overflow: "hidden", backgroundColor: "white" }}
          />
        </GridContainer>
        <GridContainer 
          style = {{
            width: isMobile ? "100%" : `calc(55% - ${GAP}px)`,
            height: isMobile ? `calc(55% - ${GAP}px)` : "97vh"
          }}
        >
          <GridContainer 
            style = {{ height: "30%",
                      marginTop: isMobile ? "50px" : "",
                      display: "flex",
                      justifyContent: "center", 
                      alignItems: "center" }} 
            >
            <div 
              style={{ 
                width: "100%",
                height: "10vh",
                fontSize: "40px", 
                marginBottom: "40px",
                backgroundColor: "#F7E8CF", 
                display: "flex",
                justifyContent: "center", 
                alignItems: "center"
                }}
            >체크인독 출석체크</div>
            <div style = {{ display: "flex", justifyContent: "center", 
                            alignItems: "center" }}>
              <Input 
                name="mobile_no"
                label="휴대폰번호(숫자만 입력)"
                type="text"
                onChange={filterInputChange}
                value={inputValue}
                size={30}
              />
              <Button
                onClick={onCheckUser}
                style = {{ 
                  marginLeft: "10px", 
                  marginTop: "10px", 
                  backgroundColor: "#F7E8CF",
                  width: "100px",
                  height: "50px",
                }}
              >
                조회
              </Button>
            </div>
          </GridContainer>
          <GridContainer 
            style = {{ 
              height: `calc(60% - ${GAP}px)`, 
              overflowY: "scroll", 
              maxHeight: `calc(70% - ${GAP}px)`,
              marginTop: isMobile ? "20px" : "",
            }}>
            <Grid container spacing={2}>
              {subDataResult.data.map((item) => (
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <Card
                    style = {{
                      width: "100%",
                      marginRight: "15px",
                      borderRadius: "10px",
                      backgroundColor: item.color,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onClick={() => onSaveClick(item.custcd, item.custnm)}
                  >
                    <Box style = {{ width: "30%", marginLeft: isMobile ? "10px" : "20px"}}>
                      <CardHeader
                        title={
                          <>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: isMobile ? "10px" :"20px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              {item.class}
                            </Typography>
                          </>
                        }
                      />
                      <CardContent style={{ display: "flex" }}>
                        <Typography
                          style={{
                            color: "black",
                            fontSize: isMobile ? "20px": "40px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            fontFamily: "TheJamsil5Bold",
                          }}
                        >
                            {item.custnm}
                        </Typography>
                      </CardContent>
                    </Box>
                    <Box style = {{ width: "40%"}}>
                      <CardHeader
                        title={
                          <>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: isMobile ? "10px" : "20px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              유효기간
                            </Typography>
                          </>
                        }
                      />
                      <CardContent style={{ display: "flex" }}>
                        <Typography
                          style={{
                            color: "black",
                            fontSize: isMobile ? "20px" : "40px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            fontFamily: "TheJamsil5Bold",
                          }}
                        >
                            {item.enddt}
                        </Typography>
                      </CardContent>
                    </Box>
                    <Box style = {{ width: "20%"}}>
                      <CardHeader
                        title={
                          <>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: isMobile ? "10px" : "20px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                              잔여횟수
                            </Typography>
                          </>
                        }
                      />
                      <CardContent style={{ display: "flex" }}>
                        <Typography
                          style={{
                            color: "black",
                            fontSize: isMobile ? "20px" : "40px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            fontFamily: "TheJamsil5Bold",
                          }}
                        >
                            {item.useqty}회
                        </Typography>
                      </CardContent>
                    </Box>
                    <Box style = {{ width: "30%"}}>
                      <CardHeader
                        title={
                          <>
                            <Typography
                              style={{
                                color: "black",
                                fontSize: isMobile ? "10px" : "20px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                fontFamily: "TheJamsil5Bold",
                              }}
                            >
                            포인트
                            </Typography>
                          </>
                        }
                      />
                      <CardContent style={{ display: "flex" }}>
                        <Typography
                          style={{
                            color: "black",
                            fontSize: isMobile ? "20px" : "40px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            fontFamily: "TheJamsil5Bold",
                          }}
                        >
                            {item.point}점
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </GridContainer>
          <GridContainer 
            style = {{
              width: "100%",
              height: "10%",
              color: "#373737",
              fontSize: isMobile ? "20px" : "30px",
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              marginTop: isMobile ? "30px" : "",
            }}
          >
            <div>({count})초 뒤 새로고침 됩니다.</div>
          </GridContainer>
        </GridContainer>
      </GridContainerWrap>
    </>
  );
};
export default CR_A1101W;