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
import CR_A1101W_Window from "../components/Windows/CR_A1101W_Window";
import { GridContainer, GridContainerWrap } from "../CommonStyled";

let check_userid = "";
let deviceWidth = window.innerWidth;
let isMobile = deviceWidth <= 1200;

const CR_A1101W: React.FC = () => {
  const processApi = useApi();
  const orgdiv = UseGetValueFromSessionItem("orgdiv");
  const location = UseGetValueFromSessionItem("location");
  const userid = UseGetValueFromSessionItem("user_id");
  const [pc, setPc] = useState("");
  UseParaPc(setPc);
  const [inputValue, setInputValue] = useState("");

  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    processQuery([], mainDataState)
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

  // 데이터 조회
  const fetchMainGrid = async () => {
    //if (!permissions?.view) return;
    let data: any;

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
  };

  useEffect(() => {
    fetchMainGrid();
  }, [filters]);

  const onCheckUser = async() => {
    const mobile_no = filters.mobile_no;
    
    if (mobile_no != null && mobile_no != "") {
      mainDataResult.data.map((item: any) => {
        if (item.mobile_no == mobile_no) {
          check_userid = item.user_id;
          onCheckWndClick();
        } else {
          alert("사용자가 존재하지 않습니다.");
          return;
        }
      });
    } else {
      alert("휴대폰번호를 입력해주세요.");
      return;
    }
  };

  const [checkWindowVisible, setCheckWindowVisible] = useState<boolean>(false);
  const onCheckWndClick = () => {
    setCheckWindowVisible(true);

    // 휴대폰 번호 빈값 처리
    setInputValue("");
    setFilters((prev) => ({
      ...prev,
      mobile_no: "",
    }));
  };

  return (
    <>
      <GridContainerWrap>
        <GridContainer 
          style = {{ width: isMobile ? "100%" : "50%", 
                    height: isMobile ? "60%" : "97vh", 
                    display: "flex",
                    backgroundColor: "#f5b901",
                    justifyContent: "center", 
                    alignItems: "center" }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/logo_ddgd.png`}
            alt=""
            width="400px"
            height="400px"
            style={{  borderRadius: "70%", overflow: "hidden", backgroundColor: "white" }}
          />
        </GridContainer>
        <GridContainer 
          style = {{ width: isMobile ? "100%" : `calc(50% - ${GAP}px)`,
                    height: isMobile ? `calc(60% - ${GAP}px)` : "97vh",
                    display: "flex",
                    justifyContent: "center", 
                    alignItems: "center",
                    marginTop: isMobile ? "50px" : "" }} 
          >
          <div style={{ fontSize: "40px", marginBottom: "40px" }}>체크인독 출석체크</div>
          <div style = {{ display: "flex", justifyContent: "center", 
                          alignItems: "center" }}>
            <Input 
              name="mobile_no"
              label="휴대폰번호(숫자만 입력)"
              type="text"
              onChange={filterInputChange}
              value={inputValue}
            />
            <Button
              onClick={onCheckUser}
              themeColor={"primary"} 
              style = {{ marginLeft: "10px", marginTop: "10px"}}
              size="large"
            >
              Login
            </Button>
          </div>
          <div style={{ marginTop: "80px"}}>
            <div style={{ color: "gray", fontSize: "15px"}}>TEL: 010-9586-9630</div> 
            <div style={{ color: "gray", fontSize: "15px"}}>평일: 07:00 - 22:00</div>  
            <div style={{ color: "gray", fontSize: "15px"}}>주말: 09:00 - 19:00</div>
            <div style={{ color: "gray", fontSize: "15px"}}>주말, 공휴일 상담/예약 불가</div>
          </div>
        </GridContainer>
      </GridContainerWrap>
      {checkWindowVisible && (
        <CR_A1101W_Window
          setVisible={setCheckWindowVisible}
          user_id={check_userid}
          modal={true}
        />
      )}
    </>
  );
};
export default CR_A1101W;