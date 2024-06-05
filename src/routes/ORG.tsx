import {
  TabStrip,
  TabStripSelectEventArguments,
  TabStripTab,
} from "@progress/kendo-react-layout";
import { CSSProperties, useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Title, TitleContainer } from "../CommonStyled";
import {
  UseBizComponent,
  UseGetValueFromSessionItem,
  getBizCom,
} from "../components/CommonFunction";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE } from "../components/CommonString";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { Iparameters } from "../store/types";

interface OrgProps {
  user_name: string;
  postcd: string | undefined;
  profile_img?: string;
  backgroundColor: string;
}

interface OrgData {
  orgdiv: string;
  dptcd: string;
  dptnm: string;
  location: string;
  mfcsaldv: string;
  prntdptcd: string;
  prntdptnm: string;
  refdptcd: string;
  remark: string;
  useyn: string;
  postcd: string;
}

// 부서별 배경색
// const getDepartmentColor = (dptnm: string): string => {
//   switch (dptnm) {
//     case "개발부":
//       return "#A866D0";
//     case "test":
//       return "#F9B351";
//     case "기획부":
//       return "#5DC17E";
//     default:
//       return "#d1d1d1"; // 기본 배경색
//   }
// };
const stringToHashCode = (str: string): number => {
  let hash = 0;
  if (str.length == 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// const getDepartmentColor = (dptnm: string): string => {
//   const hashCode = stringToHashCode(dptnm);
//   const color = "#" + ((hashCode & 0xffffff) | 0x1000000).toString(16).slice(1); // Ensure hex color code format
//   return color;
// };

const departmentColors = [
  "#FF5733",
  "#33FF57",
  "#5733FF",
  "#FFFF33",
  "#33FFFF",
];
let selectedColors: string[] = [];

const getDepartmentColor = (dptnm: string): string => {
  let randomIndex = Math.floor(Math.random() * departmentColors.length);
  while (selectedColors.includes(departmentColors[randomIndex])) {
    randomIndex = Math.floor(Math.random() * departmentColors.length);
  }
  selectedColors.push(departmentColors[randomIndex]);
  return departmentColors[randomIndex];
};

// 직급별 정렬
const getPositionOrder = (postcd: string): number => {
  switch (postcd) {
    case "PM":
      return 1;
    case "팀장":
      return 2;
    case "주임":
      return 3;
    case "사원":
      return 4;
    default:
      return 5;
  }
};

const App: React.FC<OrgProps> = ({
  user_name,
  postcd,
  backgroundColor,
  profile_img,
}) => {
  const isProfileNeeded = (postcd: string | undefined) => {
    return postcd == "이사" || postcd == "PM11";
  };

  return (
    <>
      {isProfileNeeded(postcd) ? (
        <div style={styles.profile}>
          <img
            src={
              profile_img
                ? `data:image/jpeg;base64,${profile_img}`
                : "./logo192.png"
            }
            style={styles.pic}
            alt="Profile"
          />
          <div style={{ ...styles.nameText, backgroundColor }}>{user_name}</div>
          <p style={styles.positionText}>{postcd}</p>
        </div>
      ) : (
        <div style={styles.subProfile}>
          <img
            src={
              profile_img
                ? `data:image/jpeg;base64,${profile_img}`
                : "./logo192.png"
            }
            style={styles.subPic}
            alt="Profile"
          />
          <p style={styles.subProfileText}>
            <span style={styles.subNameText}>{user_name}</span>
            <span style={{ ...styles.subPositionText, color: backgroundColor }}>
              {postcd}
            </span>
          </p>
        </div>
      )}
    </>
  );
};

const ORG: React.FC = () => {
  const processApi = useApi();
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const [selected, setSelected] = useState<number>(0);
  const setLoading = useSetRecoilState(isLoading);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const sessionLocation = UseGetValueFromSessionItem("location");

  const handleSelect = (e: TabStripSelectEventArguments) => {
    setSelected(e.selected);
  };

  const [information, setInformation] = useState<OrgData[]>([]);
  const [information2, setInformation2] = useState<OrgProps[]>([]);
  const [bizComponentData, setBizComponentData] = useState<any>(null);
  const [combinedResult, setCombinedResult] = useState<any[]>([]);
  const [profileImg, setProfileImg] = useState<any[]>([]);

  const [dptcdArray, setDptcdArray] = useState<string[]>([]);
  UseBizComponent(
    "L_dptcd_001, L_HU005",
    // 부서코드부서명, 직위
    setBizComponentData
  );
  const [dptcdListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
    }
  }, [bizComponentData]);

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "Q",
    orgdiv: sessionOrgdiv,
    location: "",
    dptcd: "",
    dptnm: "",
    user_name: "",
    serviceid: companyCode,
    find_row_value: "",
    isSearch: true,
  });
  const [subFilters, setsubFilters] = useState({
    pgSize: PAGE_SIZE,
    workType: "USERINFO",
    orgdiv: sessionOrgdiv,
    dptcd: "",
    dptnm: "",
    user_name: "",
    serviceid: companyCode,
    location: "",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const [picFilters, setpicFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    cboOrgdiv: sessionOrgdiv,
    cboLocation: sessionLocation,
    dptcd: "",
    lang_id: "",
    user_category: "",
    user_id: "",
    user_name: "",
    radRtrchk: "%",
    radUsediv: "%",
    find_row_value: "",
    pgNum: 1,
    isSearch: true,
  });

  const fetchData = async (filters: any) => {
    const parameters: Iparameters = {
      procedureName: "P_SY_A0125W_Q",
      pageNumber: 1,
      pageSize: 500,
      parameters: {
        "@p_work_type": filters.workType,
        "@p_orgdiv": filters.orgdiv,
        "@p_location": filters.location,
        "@p_dptcd": filters.dptcd,
        "@p_dptnm": filters.dptnm,
        "@p_user_name": filters.user_name,
        "@p_serviceid": filters.serviceid,
      },
    };

    try {
      const data = await processApi<any>("procedure", parameters);
      if (data.isSuccess == true) {
        setInformation(data.tables[0].Rows);
      } else {
        console.log("[에러발생]");
      }
    } catch (error) {
      console.error("API 호출 중 오류:", error);
    }
  };
  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  const fetchData2 = async (subFilters: any, dptcdArray: string[]) => {
    let tempCombinedResult: any[] = [];

    for (const dptcd of dptcdArray) {
      const subparameters: Iparameters = {
        procedureName: "P_SY_A0125W_Q",
        pageNumber: subFilters.pgNum,
        pageSize: subFilters.pgSize,
        parameters: {
          "@p_work_type": subFilters.workType,
          "@p_orgdiv": subFilters.orgdiv,
          "@p_location": subFilters.location,
          "@p_dptcd": dptcd, // 각 부서 코드를 전달
          "@p_dptnm": subFilters.dptnm,
          "@p_user_name": subFilters.user_name,
          "@p_serviceid": subFilters.serviceid,
        },
      };

      try {
        const data = await processApi<any>("procedure", subparameters);
        if (data.isSuccess == true) {
          tempCombinedResult = [...tempCombinedResult, ...data.tables[0].Rows];
        } else {
          console.log("[에러발생]");
        }
      } catch (error) {
        console.error("API 호출 중 오류:", error);
      }
    }
    setCombinedResult(tempCombinedResult);
  };

  useEffect(() => {
    fetchData2(subFilters, dptcdArray);
  }, [dptcdArray]);

  const fetchData3 = async (picFilters: any) => {
    //if (!permissions?.view) return;
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0012W_Q ",
      pageNumber: picFilters.pgNum,
      pageSize: picFilters.pgSize,
      parameters: {
        "@p_work_type": picFilters.work_type,
        "@p_orgdiv": picFilters.cboOrgdiv,
        "@p_location": picFilters.cboLocation,
        "@p_dptcd": picFilters.dptcd,
        "@p_lang_id": picFilters.lang_id,
        "@p_user_category": picFilters.user_category,
        "@p_user_id": picFilters.user_id,
        "@p_user_name": picFilters.user_name,
        "@p_rtrchk": picFilters.radRtrchk == "T" ? "%" : picFilters.radRtrchk,
        "@p_usediv": picFilters.radUsediv,
        "@p_find_row_value": picFilters.find_row_value,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const rows = data.tables[0].Rows;

      const profileImageData = rows.map((row: any) => {
        return {
          user_id: row.user_id,
          profile_img: row.profile_image,
        };
      });
      setProfileImg(profileImageData);
    }
  };

  useEffect(() => {
    fetchData3(picFilters);
  }, [picFilters]);

  return (
    <>
      <TitleContainer className="TitleContainer">
        <Title>부서관리</Title>
      </TitleContainer>
      <TabStrip selected={selected} onSelect={handleSelect}>
        <TabStripTab title="조직도">
          <div>
            <div className="org-main-container" style={styles.orgMainContainer}>
              {information.map((info, index) => (
                <div
                  key={index}
                  className="department"
                  style={{ marginBottom: "80px" }}
                >
                  {info.prntdptcd == "" && (
                    <div style={styles.departmentContainer}>
                      <p
                        className="departmentText"
                        style={{
                          backgroundColor: getDepartmentColor(info.dptnm),
                          ...styles.departmentText,
                        }}
                      >
                        {info.dptnm}
                      </p>
                      {combinedResult
                        .filter((person) => person.dptcd == info.dptcd)
                        .map((person, personIndex) => {
                          const profileData = profileImg.find(
                            (item) => item.user_id == person.user_id
                          );

                          return (
                            <div key={personIndex}>
                              {personIndex == 0 && (
                                <div
                                  className="connector"
                                  style={{
                                    ...styles.connector,
                                    marginLeft: "50%",
                                  }}
                                />
                              )}
                              <App
                                user_name={person.user_name}
                                postcd={
                                  postcdListData.find(
                                    (item: any) =>
                                      item.sub_code == person.postcd
                                  )?.code_name
                                }
                                profile_img={
                                  profileData ? profileData.profile_img : null
                                }
                                backgroundColor={getDepartmentColor(info.dptnm)}
                              />
                            </div>
                          );
                        })}
                    </div>
                  )}
                  <div style={styles.subdepartmentContainer}>
                    {index !== information.length - 1 && (
                      <div
                        className="horizontal-connector"
                        style={styles.horizontalConnector}
                      />
                    )}
                    <div
                      style={{ display: "flex", justifyContent: "center" }}
                    ></div>
                    {information
                      .filter((subInfo) => subInfo.prntdptcd == info.dptcd)
                      .map((subInfo, subIndex, array) => (
                        <div key={subIndex} style={styles.departmentContainer}>
                          {(subIndex !== 0 || array.length > 1) && (
                            <div
                              className="vertical-connector"
                              style={styles.connector}
                            />
                          )}
                          <p
                            className="departmentText"
                            style={{
                              backgroundColor: getDepartmentColor(
                                subInfo.prntdptnm
                              ),
                              ...styles.departmentText,
                            }}
                          >
                            {subInfo.dptnm}
                          </p>
                          {combinedResult
                            .filter((person) => person.dptcd == subInfo.dptcd)
                            .map((person, personIndex) => {
                              const profileData = profileImg.find(
                                (item) => item.user_id == person.user_id
                              );
                              return (
                                <div key={personIndex}>
                                  {personIndex == 0 && (
                                    <div
                                      className="connector"
                                      style={{
                                        ...styles.connector,
                                        marginLeft: "50%",
                                      }}
                                    />
                                  )}
                                  <div
                                    className="subProfile"
                                    style={styles.subProfile}
                                  >
                                    <App
                                      user_name={person.user_name}
                                      postcd={
                                        postcdListData.find(
                                          (item: any) =>
                                            item.sub_code == person.postcd
                                        )?.code_name
                                      }
                                      profile_img={
                                        profileData
                                          ? profileData.profile_img
                                          : null
                                      }
                                      backgroundColor={getDepartmentColor(
                                        info.dptnm
                                      )}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabStripTab>
        <TabStripTab title="New York City">
          <div>
            <p>
              The City of New York, often called New York City or simply New
              York, is the most populous city in the United States.
            </p>
          </div>
        </TabStripTab>
      </TabStrip>
    </>
  );
};

type FlexDirection = "row" | "row-reverse" | "column" | "column-reverse";

const profileStyles: {
  profile: CSSProperties;
  profileHover: CSSProperties;
  pic: CSSProperties;
  nameText: CSSProperties;
  positionText: CSSProperties;
  departmentText: CSSProperties;
} = {
  profile: {
    background: "#f3f3f3",
    borderRadius: "15px",
    height: "200px",
    width: "165px",
    boxShadow: "12px 12px rgba(0,0,0,0.1)",
    transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column" as FlexDirection,
    border: "1px solid #e4e2e2",
    marginBottom: "30px",
  },
  profileHover: {
    boxShadow: "1px 1px 1px 1px rgba(0,0,0,0.1)",
  },
  pic: {
    borderRadius: "65555px",
    borderStyle: "solid",
    borderColor: "#e2e2e2",
    borderWidth: "2px",
    width: "80px",
    height: "80px",
    objectFit: "cover",
    margin: "auto",
    marginTop: "50px",
    padding: "3px",
  },
  nameText: {
    color: "#ffffff",
    height: "40px",
    width: "100%",
    position: "relative",
    fontFamily: "sans-serif",
    fontWeight: "900",
    fontSize: "22px",
    textAlign: "center",
    lineHeight: "40px",
    marginTop: "10px",
  },
  positionText: {
    color: "#000000",
    textAlign: "center",
    fontFamily: "sans-serif",
    position: "relative",
    fontWeight: "700",
    fontSize: "15px",
    marginTop: "10px",
    paddingBottom: "40px",
  },
  departmentText: {
    borderRadius: "8px",
    height: "50px",
    width: "170px",
    position: "relative",
    fontSize: "27px",
    fontWeight: "bolder",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: "45px",
  },
};

const subProfileStyles: {
  subProfile: CSSProperties;
  subPic: CSSProperties;
  subProfileText: CSSProperties;
  subNameText: CSSProperties;
  subPositionText: CSSProperties;
} = {
  subProfile: {
    background: "#f3f3f3",
    borderRadius: "10px",
    height: "85px",
    width: "250px",
    boxShadow: "12px 12px rgba(0,0,0,0.1)",
    display: "flex",
    marginBottom: "20px",
    position: "relative",
  },
  subPic: {
    borderRadius: "65555px",
    borderStyle: "solid",
    borderColor: "#e2e2e2",
    borderWidth: "2px",
    width: "60px",
    height: "60px",
    objectFit: "cover",
    margin: "15px 0 0 20px",
  },
  subProfileText: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    paddingLeft: "15px",
  },
  subNameText: {
    fontWeight: "600",
    color: "#3f3f3f",
    fontSize: "20px",
    paddingBottom: "2px",
  },
  subPositionText: {
    fontWeight: "600",
    fontSize: "14px",
  },
};

const containerStyles: {
  subdepartmentContainer: CSSProperties;
  departmentContainer: CSSProperties;
  employeeContainer: CSSProperties;
  orgMainContainer: CSSProperties;
  spaceContainer: CSSProperties;
  departmentContainerBefore: CSSProperties;
  subdepartmentContainerAfter: CSSProperties;
  departmentContainerDepartment: CSSProperties;
  connector: CSSProperties;
  horizontalConnector: CSSProperties;
} = {
  subdepartmentContainer: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
  },
  departmentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginRight: "45px",
  },
  employeeContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  orgMainContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
  },
  spaceContainer: {
    width: "100%",
    height: "0px",
  },
  departmentContainerBefore: {
    content: '""',
    background: "green",
    order: "3",
    flexBasis: "100%",
    height: "16px",
  },
  subdepartmentContainerAfter: {
    content: '""',
    background: "green",
    order: "4",
    flexBasis: "100%",
    height: "16px",
  },
  departmentContainerDepartment: {
    borderBottom: "1px solid #000000",
    marginBottom: "10px",
  },
  connector: {
    width: "2px",
    height: "30px",
    backgroundColor: "black",
    // marginLeft: "50%",
  },
  horizontalConnector: {
    width: "100%",
    borderBottom: "2px solid black",
    position: "relative",
    top: "50%",
    // right: '100%',
    marginLeft: "100px",
    // transform: 'translate(-50%, -50%)',
  },
};

const styles = {
  ...profileStyles,
  ...subProfileStyles,
  ...containerStyles,
};

export default ORG;
