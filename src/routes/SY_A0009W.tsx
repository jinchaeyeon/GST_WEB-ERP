import SettingsIcon from "@mui/icons-material/Settings";
import {
  Avatar as AvatarMUI,
  Badge,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Button } from "@progress/kendo-react-buttons";
import { DatePicker } from "@progress/kendo-react-dateinputs";
import { Buffer } from "buffer";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import SwiperCore from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  convertDateToStr,
  dateformat3,
  getBizCom,
  getDeviceHeight,
  getHeight,
  GetPropertyValueByName,
  toDate,
  UseBizComponent,
  UseCustomOption,
  UseGetValueFromSessionItem,
  UsePermissions,
} from "../components/CommonFunction";
import { COM_CODE_DEFAULT_VALUE, PAGE_SIZE } from "../components/CommonString";
import ChangePasswordWindow from "../components/Windows/CommonWindows/ChangePasswordWindow";
import MenuWindow from "../components/Windows/CommonWindows/MenuWindow";
import { useApi } from "../hooks/api";
import { isLoading, loginResultState } from "../store/atoms";
import { Iparameters, TPermissions } from "../store/types";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

type TItemInfo = {
  files: string;
  url: string;
};
const defaultItemInfo = {
  files: "",
  url: "",
};

interface User {
  user_id: string;
  user_name: string;
  email: string;
  mobile_no: string;
  postcd: string;
  dptcd: string;
  apply_start_date: string;
  birdt: Date;
  tel_no: string;
  profile_image: string;
  home_menu_id_web: string;
}

interface PTO {
  ramainday: number;
  totalday: number;
  usedday: number;
}

var height = 0;
var height2 = 0;
var index = 0;

const SY_A0009W: React.FC = () => {
  const [changePasswordWindowVisible, setChangePasswordWindowVisible] =
    useState<boolean>(false);
  const excelInput: any = React.useRef();
  const [imgBase64, setImgBase64] = useState<string>(""); // 파일 base64
  const [itemInfo, setItemInfo] = useState<TItemInfo>(defaultItemInfo);
  const pc = UseGetValueFromSessionItem("pc");
  const userId = UseGetValueFromSessionItem("user_id");
  const ssesionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const Userlocation = UseGetValueFromSessionItem("location");
  const setLoading = useSetRecoilState(isLoading);
  const processApi = useApi();
  const [permissions, setPermissions] = useState<TPermissions>({
    save: false,
    print: false,
    view: false,
    delete: false,
  });
  UsePermissions(setPermissions);
  const [loginResult] = useRecoilState(loginResultState);
  const companyCode = loginResult ? loginResult.companyCode : "";

  let deviceWidth = document.documentElement.clientWidth;
  const [isMobile, setIsMobile] = useState(deviceWidth <= 1200);

  const [swiper, setSwiper] = useState<SwiperCore>();
  const [mobileheight, setMobileHeight] = useState(0);
  const [webheight, setWebHeight] = useState(0);
  const [webheight2, setWebHeight2] = useState(0);
  const [webheight3, setWebHeight3] = useState(0);

  //커스텀 옵션 조회
  const [customOptionData, setCustomOptionData] = React.useState<any>(null);
  UseCustomOption(setCustomOptionData);

  useLayoutEffect(() => {
    if (customOptionData !== null) {
      height = getHeight(".TitleContainer");
      height2 = getHeight(".ButtonContainer");
      const handleWindowResize = () => {
        let deviceWidth = document.documentElement.clientWidth;
        setIsMobile(deviceWidth <= 1200);
        setMobileHeight(getDeviceHeight(false) - height2);
        setWebHeight(getDeviceHeight(false) - height2 - 30);
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [customOptionData, webheight, webheight2, webheight3]);

  //customOptionData 조회 후 디폴트 값 세팅
  useEffect(() => {
    if (customOptionData !== null) {
      const defaultOption = GetPropertyValueByName(
        customOptionData.menuCustomDefaultOptions,
        "query"
      );
      setFilters((prev) => ({
        ...prev,
        orgdiv: ssesionOrgdiv,
        location: Userlocation,
        user_id: userId,
        isSearch: true,
      }));
      setFilters2((prev) => ({
        ...prev,
        orgdiv: ssesionOrgdiv,
        location: Userlocation,
        user_id: userId,
        isSearch: true,
      }));
    }
  }, [customOptionData]);

  const [bizComponentData, setBizComponentData] = useState<any>(null);
  UseBizComponent("L_MenuWeb, L_dptcd_001, L_HU005", setBizComponentData);

  const [dptcdListData, setDptcdListData] = useState([
    { dptcd: "", dptnm: "" },
  ]);
  const [postcdListData, setpostcdListData] = useState([
    COM_CODE_DEFAULT_VALUE,
  ]);
  const [menuListData, setMenuListData] = React.useState([
    COM_CODE_DEFAULT_VALUE,
  ]);

  useEffect(() => {
    if (bizComponentData !== null) {
      setMenuListData(getBizCom(bizComponentData, "L_MenuWeb"));
      setDptcdListData(getBizCom(bizComponentData, "L_dptcd_001"));
      setpostcdListData(getBizCom(bizComponentData, "L_HU005"));
    }
  }, [bizComponentData]);

  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState<User>({
    user_id: userId,
    user_name: "",
    postcd: "",
    dptcd: "",
    apply_start_date: "",
    email: "",
    mobile_no: "",
    birdt: new Date(),
    tel_no: "",
    profile_image: "",
    home_menu_id_web: "",
  });

  const [pto, setPto] = useState<PTO>({
    ramainday: 0,
    totalday: 0,
    usedday: 0,
  });

  const [emailParts, setEmailParts] = useState({ email1: "", email2: "" });
  const [error, setError] = useState({ mobile_no: false, tel_no: false });

  //조회조건 초기값
  const [filters, setFilters] = useState({
    pgSize: PAGE_SIZE,
    work_type: "LIST",
    orgdiv: ssesionOrgdiv,
    location: Userlocation,
    user_id: userId,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //조회조건 초기값
  const [filters2, setFilters2] = useState({
    pgSize: PAGE_SIZE,
    work_type: "PTO",
    orgdiv: ssesionOrgdiv,
    location: Userlocation,
    user_id: userId,
    find_row_value: "",
    pgNum: 1,
    isSearch: false,
  });

  //그리드 데이터 조회
  const fetchMainGrid = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0009W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": ssesionOrgdiv,
        "@p_location": Userlocation,
        "@p_user_id": userId,
        "@p_find_row_value": filters.find_row_value,
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
      if (totalRowCnt > 0) {
        const userData = {
          ...rows[0],
          birdt: toDate(rows[0].birdt),
        };
        setUser(userData);
        setImgBase64("data:image/png;base64," + userData.profile_image);
        const [email1, email2] = (user.email || "").split("@");
        setEmailParts({ email1, email2 });
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
    }
  };

  //그리드 데이터 조회 (연차)
  const fetchMainGrid2 = async (filters: any) => {
    if (!permissions.view) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0009W_Q ",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": filters.work_type,
        "@p_orgdiv": ssesionOrgdiv,
        "@p_location": Userlocation,
        "@p_user_id": userId,
        "@p_find_row_value": filters.find_row_value,
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
      console.log(rows);
      if (totalRowCnt > 0) {
        setPto(rows[0]);
      } else {
        console.log("[에러발생]");
        console.log(data);
      }
      // 필터 isSearch false처리, pgNum 세팅
      setFilters2((prev) => ({
        ...prev,
        pgNum:
          data && data.hasOwnProperty("pageNumber")
            ? data.pageNumber
            : prev.pgNum,
        isSearch: false,
      }));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      filters.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, permissions, bizComponentData, customOptionData]);

  useEffect(() => {
    if (
      filters2.isSearch &&
      permissions.view &&
      bizComponentData !== null &&
      customOptionData !== null
    ) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, permissions, bizComponentData, customOptionData]);

  const handleEditClick = () => {
    if (editMode) {
      const email = `${emailParts.email1}@${emailParts.email2}`;
      setUser({ ...user, email });
    } else {
      const [email1, email2] = (user.email || "").split("@");
      setEmailParts({ email1, email2 });
    }
    setEditMode(!editMode);
  };

  //조회조건 Input Change 함수 => 사용자가 Input에 입력한 값을 조회 파라미터로 세팅
  const filterInputChange = (e: any) => {
    const { value, name } = e.target;

    if (name === "mobile_no" || name === "tel_no") {
      // 숫자와 하이픈(-)만 허용
      const regex = /^[0-9-]*$/;
      if (regex.test(value)) {
        setUser((prev) => ({
          ...prev,
          [name]: value,
        }));
        setError((prev) => ({ ...prev, [name]: false }));
      } else {
        setError((prev) => ({ ...prev, [name]: true }));
      }
    } else {
      setUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "email1":
        setEmailParts((prev) => ({
          ...prev,
          [name]: value,
        }));
        break;
      case "email2":
        setEmailParts((prev) => ({
          ...prev,
          [name]: value,
        }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!permissions.save) return;
    e.preventDefault();
    const email = `${emailParts.email1}@${emailParts.email2}`;
    const birdt = user.birdt;
    if (
      emailParts.email1 === "" ||
      emailParts.email2 === "" ||
      emailParts.email1 === undefined ||
      emailParts.email2 === undefined
    ) {
      alert("이메일 주소를 입력해주세요.");
    } else if (user.mobile_no === "" || user.mobile_no === undefined) {
      alert("휴대폰 번호를 입력해주세요.");
    } else if (user.tel_no === "" || user.tel_no === undefined) {
      alert("사내전화 번호를 입력해주세요.");
    } else if (
      convertDateToStr(birdt).substring(0, 4) < "1997" ||
      convertDateToStr(birdt).substring(6, 8) > "31" ||
      convertDateToStr(birdt).substring(6, 8) < "01" ||
      convertDateToStr(birdt).substring(6, 8).length != 2
    ) {
      alert("생일을 입력해주세요.");
    } else {
      const updatedUser = {
        ...user,
        email: email,
      };
      setUser(updatedUser);
      fetchSaved(updatedUser);
      handleEditClick();
    }
  };

  const handleBlur = (name: string) => {
    setError((prev) => ({ ...prev, [name]: false }));
  };

  useEffect(() => {
    let newImgBase64 = "";
    if (
      itemInfo.files.slice(0, 1) === "0" &&
      itemInfo.files.slice(1, 2) === "x" &&
      itemInfo.url !== undefined
    ) {
      newImgBase64 = itemInfo.url.toString();
    } else {
      newImgBase64 = "data:image/png;base64," + itemInfo.files;
    }

    setImgBase64(newImgBase64);

    const updatedUser = { ...user, profile_image: newImgBase64.split(",")[1] };
    setUser(updatedUser);
    fetchSaved(updatedUser);
  }, [itemInfo]);

  const onAttWndClick = () => {
    const uploadInput = document.getElementById("uploadAttachment");
    uploadInput!.click();
  };

  const getAttachmentsData = async (files: FileList | null) => {
    if (files != null) {
      let uint8 = new Uint8Array(await files[0].arrayBuffer());
      let arrHexString = Buffer.from(uint8).toString("hex");
      const reader = new FileReader();
      reader.readAsDataURL(files[0]);
      return new Promise((resolve) => {
        reader.onload = () => {
          if (reader.result != null) {
            setImgBase64(reader.result.toString());
            setItemInfo({
              files: "0x" + arrHexString,
              url: reader.result.toString(),
            });
          }
        };
      });
    } else {
      alert("새로고침 후 다시 업로드해주세요.");
    }
  };

  const [menuId, setMenuId] = useState<any>("reset");
  const [menuWindowVisible, setMenuWindowVisible] = useState<boolean>(false);

  const onMenuWindowClick = () => {
    setMenuWindowVisible(true);
  };

  const setMenuData = (data: any) => {
    setMenuId(data.KeyID);
  };

  useEffect(() => {
    setUser({ ...user, home_menu_id_web: menuId });
  }, [menuId]);

  // 회원정보 수정
  const fetchSaved = async (updatedUser: User) => {
    if (!permissions.save) return;
    let data: any;
    setLoading(true);
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "P_SY_A0009W_S",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "U",
        "@p_orgdiv": ssesionOrgdiv,
        "@p_location": Userlocation,
        "@p_user_id": userId,
        "@p_email": updatedUser.email,
        "@p_tel_no": updatedUser.tel_no,
        "@p_mobile_no": updatedUser.mobile_no,
        "@p_profile_image": updatedUser.profile_image,
        "@p_birdt": convertDateToStr(updatedUser.birdt),
        "@p_home_menu_id_web": updatedUser.home_menu_id_web,
        "@p_id": userId,
        "@p_pc": pc,
      },
    };

    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess !== true) {
      console.log("[오류 발생]");
      console.log(data);
      throw data.resultMessage;
    } else {
      setFilters((prev) => ({
        ...prev,
        find_row_value: data.returnString,
        pgNum: prev.pgNum,
        isSearch: true,
      }));
    }
    setLoading(false);
  };

  return (
    <>
      {isMobile ? (
        <Grid container direction="column" spacing={1}>
          <Grid item xs={12} md={12} className="ButtonContainer">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                p: 2,
                borderRadius: 2,
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <IconButton
                    onClick={onAttWndClick}
                    sx={{
                      backgroundColor: "white",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      width: "36px",
                      height: "36px",
                      p: 0,
                      transform: "translate(0, 0%)",
                    }}
                  >
                    <SettingsIcon />
                    <input
                      id="uploadAttachment"
                      style={{ display: "none" }}
                      type="file"
                      accept="image/*"
                      ref={excelInput}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        getAttachmentsData(event.target.files);
                      }}
                    />
                  </IconButton>
                }
              >
                <AvatarMUI
                  sx={{
                    width: 80,
                    height: 80,
                    border: "2px solid #ddd",
                    padding: "4px",
                    boxSizing: "border-box",
                  }}
                  src={user.profile_image ? imgBase64 : "GST"}
                ></AvatarMUI>
              </Badge>
              <Grid container sx={{ mt: 2, mb: 2, justifyContent: "center" }}>
                <Typography variant="h5" sx={{ ml: 3, fontWeight: "bold" }}>
                  {user.user_name}
                </Typography>
                <Typography variant="h5">님의 마이페이지</Typography>
              </Grid>
              <Grid
                container
                sx={{
                  alignItems: "center",
                  gap: 2,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#DCEFFA",
                    p: 2,
                    width: "85vw",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: "33%",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "bold", color: "#258DC4", mb: 1 }}
                    >
                      {pto.totalday}일
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      연차 수량
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "33%",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "bold", color: "#258DC4", mb: 1 }}
                    >
                      {pto.usedday}일
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      연차 사용량
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "33%",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "bold", color: "#258DC4", mb: 1 }}
                    >
                      {pto.ramainday}일
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      연차 잔량
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card
              sx={{
                borderRadius: 2,
                border: "1px solid #ddd",
                height: mobileheight,
                ml: 1,
              }}
            >
              <Box
                sx={{
                  padding: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  회원정보
                </Typography>
                <Button
                  themeColor="primary"
                  onClick={!editMode ? handleEditClick : handleSubmit}
                  icon={!editMode ? "edit" : "save"}
                  fillMode={!editMode ? "outline" : "solid"}
                  disabled={permissions.save ? false : true}
                >
                  {editMode ? "저장" : "수정"}
                </Button>
              </Box>
              <CardContent sx={{ overflow: "auto", height: mobileheight - 80 }}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        이름
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 8px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        {user.user_name}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        직위
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 8px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        {
                          postcdListData.find(
                            (items: any) => items.sub_code == user.postcd
                          )?.code_name
                        }
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        부서
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 8px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        {
                          dptcdListData.find(
                            (items: any) => items.dptcd == user.dptcd
                          )?.dptnm
                        }
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        입사일
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 8px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        {dateformat3(user.apply_start_date)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        비밀번호
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 5px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        <Button
                          fillMode={"outline"}
                          themeColor={"primary"}
                          onClick={() => setChangePasswordWindowVisible(true)}
                        >
                          비밀번호변경
                        </Button>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body1"
                          sx={{
                            width: "70px",
                            textAlign: "right",
                            marginRight: 2,
                            fontWeight: "bold",
                          }}
                        >
                          이메일
                        </Typography>
                        {editMode ? (
                          <>
                            <TextField
                              name="email1"
                              value={emailParts.email1}
                              onChange={handleChange}
                              InputProps={{
                                sx: {
                                  height: "32px",
                                  margin: "2px 0 1px 7px",
                                },
                              }}
                              sx={{
                                maxWidth: 85,
                                marginRight: 1,
                                backgroundColor: "white",
                              }}
                              autoComplete="off"
                            />
                            @
                            <TextField
                              name="email2"
                              value={emailParts.email2}
                              onChange={handleChange}
                              InputProps={{
                                sx: {
                                  height: "32px",
                                  margin: "2px 0 1px 0",
                                },
                              }}
                              sx={{ maxWidth: 90, marginLeft: 1 }}
                              autoComplete="off"
                            />
                          </>
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  {/* <Grid item xs={12}>
                    <Divider sx={{ mx: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        사진
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 8px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        <Button
                          fillMode={"outline"}
                          themeColor={"primary"}
                          onClick={onAttWndClick}
                        >
                          프로필사진변경
                        </Button>
                        <input
                          id="uploadAttachment"
                          style={{ display: "none" }}
                          type="file"
                          accept="image/*"
                          // ref={excelInput}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            getAttachmentsData(event.target.files);
                          }}
                        />
                      </Typography>
                    </Box>
                  </Grid> */}
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        생일
                      </Typography>
                      {editMode ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "35px",
                            marginLeft: "6px",
                          }}
                        >
                          <DatePicker
                            value={user.birdt}
                            onChange={filterInputChange}
                            format="yyyy-MM-dd"
                            width={165}
                            name="birdt"
                          />
                        </Box>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{
                            padding: "3px 8px",
                            display: "flex",
                            alignItems: "center",
                            maxWidth: 400,
                            height: "35px",
                          }}
                        >
                          {dateformat3(convertDateToStr(user.birdt))}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="body1"
                          sx={{
                            width: "70px",
                            textAlign: "right",
                            marginRight: 2,
                            fontWeight: "bold",
                          }}
                        >
                          휴대전화
                        </Typography>
                        {editMode ? (
                          <>
                            <TextField
                              name="mobile_no"
                              value={user.mobile_no}
                              onChange={filterInputChange}
                              InputProps={{
                                sx: {
                                  height: "32px",
                                  margin: "2px 0 1px 7px",
                                },
                              }}
                              sx={{ maxWidth: 170, marginRight: 1 }}
                              autoComplete="off"
                              type="tel"
                            />
                          </>
                        ) : (
                          <Typography
                            className="mobile_no"
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            {user.mobile_no}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        사내전화
                      </Typography>
                      {editMode ? (
                        <>
                          <TextField
                            name="tel_no"
                            value={user.tel_no}
                            onChange={filterInputChange}
                            InputProps={{
                              sx: {
                                height: "32px",
                                margin: "2px 0 1px 7px",
                              },
                            }}
                            sx={{ maxWidth: 170, marginRight: 1 }}
                            autoComplete="off"
                            type="tel"
                          />
                        </>
                      ) : (
                        <Typography
                          variant="body1"
                          sx={{
                            padding: "3px 8px",
                            display: "flex",
                            alignItems: "center",
                            maxWidth: 400,
                            height: "35px",
                          }}
                        >
                          {user.tel_no}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "70px",
                          textAlign: "right",
                          marginRight: 2,
                          fontWeight: "bold",
                        }}
                      >
                        홈메뉴(웹)
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 5px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        {editMode ? (
                          <Button
                            fillMode={"outline"}
                            themeColor={"primary"}
                            onClick={onMenuWindowClick}
                          >
                            홈메뉴변경
                          </Button>
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            {
                              menuListData.find(
                                (items: any) =>
                                  items.sub_code == user.home_menu_id_web
                              )?.code_name
                            }
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <>
          <Box sx={{ flexGrow: 1, padding: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={3} md={12} className="ButtonContainer">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      <IconButton
                        onClick={onAttWndClick}
                        sx={{
                          backgroundColor: "white",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                          width: "36px",
                          height: "36px",
                          p: 0,
                          transform: "translate(0, 0%)",
                        }}
                      >
                        <SettingsIcon />
                        <input
                          id="uploadAttachment"
                          style={{ display: "none" }}
                          type="file"
                          accept="image/*"
                          ref={excelInput}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            getAttachmentsData(event.target.files);
                          }}
                        />
                      </IconButton>
                    }
                  >
                    <AvatarMUI
                      sx={{
                        width: 80,
                        height: 80,
                        border: "2px solid #ddd",
                        padding: "4px",
                        boxSizing: "border-box",
                      }}
                      src={user.profile_image ? imgBase64 : "GST"}
                    ></AvatarMUI>
                  </Badge>
                  <Grid container>
                    <Typography variant="h5" sx={{ ml: 3, fontWeight: "bold" }}>
                      {user.user_name}
                    </Typography>
                    <Typography variant="h5">님의 마이페이지</Typography>
                  </Grid>
                  <Grid
                    container
                    sx={{
                      justifyContent: "flex-end",
                      gap: 2,
                      minWidth: "50vw",
                    }}
                  >
                    <Grid>
                      <Box
                        sx={{
                          borderRadius: 2,
                          textAlign: "center",
                          backgroundColor: "#DCEFFA",
                          p: 2,
                          width: "170px",
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: "bold", color: "#258DC4", mb: 1 }}
                        >
                          {pto.totalday}일
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          현재 연차 수량
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid>
                      <Box
                        sx={{
                          borderRadius: 2,
                          textAlign: "center",
                          backgroundColor: "#DCEFFA",
                          p: 2,
                          width: "170px",
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: "bold", color: "#258DC4", mb: 1 }}
                        >
                          {pto.usedday}일
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          연차 사용량
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid>
                      <Box
                        sx={{
                          borderRadius: 2,
                          textAlign: "center",
                          backgroundColor: "#DCEFFA",
                          p: 2,
                          width: "170px",
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: "bold", color: "#258DC4", mb: 1 }}
                        >
                          {pto.ramainday}일
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          연차 잔량
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* 회원정보 */}
              <Grid item xs={12} md={12}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #ddd",
                    height: webheight,
                  }}
                >
                  <Box
                    sx={{
                      padding: 4,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      회원정보
                    </Typography>
                    <Button
                      themeColor="primary"
                      onClick={!editMode ? handleEditClick : handleSubmit}
                      icon={!editMode ? "edit" : "save"}
                      fillMode={!editMode ? "outline" : "solid"}
                    >
                      {editMode ? "저장" : "수정"}
                    </Button>
                  </Box>
                  <CardContent
                    sx={{ overflow: "auto", height: webheight - 96 }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            이름
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            {user.user_name}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            직위
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            {
                              postcdListData.find(
                                (items: any) => items.sub_code == user.postcd
                              )?.code_name
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            부서
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            {
                              dptcdListData.find(
                                (items: any) => items.dptcd == user.dptcd
                              )?.dptnm
                            }
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            입사일
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            {dateformat3(user.apply_start_date)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            비밀번호
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              padding: "3px 8px",
                              display: "flex",
                              alignItems: "center",
                              maxWidth: 400,
                              height: "35px",
                            }}
                          >
                            <Button
                              fillMode={"outline"}
                              themeColor={"primary"}
                              onClick={() =>
                                setChangePasswordWindowVisible(true)
                              }
                            >
                              비밀번호변경
                            </Button>
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box display="flex" alignItems="center">
                            <Typography
                              variant="body1"
                              sx={{
                                width: "120px",
                                textAlign: "right",
                                marginRight: 6,
                                fontWeight: "bold",
                              }}
                            >
                              이메일
                            </Typography>
                            {editMode ? (
                              <>
                                <TextField
                                  name="email1"
                                  value={emailParts.email1}
                                  onChange={handleChange}
                                  InputProps={{
                                    sx: {
                                      height: "32px",
                                      margin: "2px 0 1px 7px",
                                    },
                                  }}
                                  sx={{
                                    maxWidth: 140,
                                    marginRight: 1,
                                    backgroundColor: "white",
                                  }}
                                  autoComplete="off"
                                />
                                @
                                <TextField
                                  name="email2"
                                  value={emailParts.email2}
                                  onChange={handleChange}
                                  InputProps={{
                                    sx: {
                                      height: "32px",
                                      margin: "2px 0 1px 0",
                                    },
                                  }}
                                  sx={{ maxWidth: 160, marginLeft: 1 }}
                                  autoComplete="off"
                                />
                              </>
                            ) : (
                              <Typography
                                variant="body1"
                                sx={{
                                  padding: "3px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  maxWidth: 400,
                                  height: "35px",
                                }}
                              >
                                {user.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      {/* <Grid item xs={12}>
                    <Divider sx={{ mx: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          width: "120px",
                          textAlign: "right",
                          marginRight: 6,
                          fontWeight: "bold",
                        }}
                      >
                        사진
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          padding: "3px 8px",
                          display: "flex",
                          alignItems: "center",
                          maxWidth: 400,
                          height: "35px",
                        }}
                      >
                        <Button
                          fillMode={"outline"}
                          themeColor={"primary"}
                          onClick={onAttWndClick}
                        >
                          프로필사진변경
                        </Button>
                        <input
                          id="uploadAttachment"
                          style={{ display: "none" }}
                          type="file"
                          accept="image/*"
                          // ref={excelInput}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            getAttachmentsData(event.target.files);
                          }}
                        />
                      </Typography>
                    </Box>
                  </Grid> */}
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            생일
                          </Typography>
                          {editMode ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                height: "35px",
                                marginLeft: "7px",
                              }}
                            >
                              <DatePicker
                                value={user.birdt}
                                onChange={filterInputChange}
                                format="yyyy-MM-dd"
                                width={200}
                                name="birdt"
                              />
                            </Box>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                padding: "3px 8px",
                                display: "flex",
                                alignItems: "center",
                                maxWidth: 400,
                                height: "35px",
                              }}
                            >
                              {dateformat3(convertDateToStr(user.birdt))}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box display="flex" alignItems="center">
                            <Typography
                              variant="body1"
                              sx={{
                                width: "120px",
                                textAlign: "right",
                                marginRight: 6,
                                fontWeight: "bold",
                              }}
                            >
                              휴대전화
                            </Typography>
                            {editMode ? (
                              <>
                                <TextField
                                  name="mobile_no"
                                  value={user.mobile_no}
                                  onChange={filterInputChange}
                                  onBlur={() => handleBlur('mobile_no')}
                                  InputProps={{
                                    sx: {
                                      height: "32px",
                                      margin: "2px 0 1px 7px",
                                    },
                                  }}
                                  sx={{ maxWidth: 140, marginRight: 1 }}
                                  autoComplete="off"
                                  type="tel"
                                />
                                {error.mobile_no && (
                                  <Typography variant="body2" color="error">
                                    숫자와 하이픈(-)만 입력할 수 있습니다.
                                  </Typography>
                                )}
                              </>
                            ) : (
                              <Typography
                                className="mobile_no"
                                variant="body1"
                                sx={{
                                  padding: "3px 8px",
                                  display: "flex",
                                  alignItems: "center",
                                  maxWidth: 400,
                                  height: "35px",
                                }}
                              >
                                {user.mobile_no}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            사내전화
                          </Typography>
                          {editMode ? (
                            <>
                              <TextField
                                name="tel_no"
                                value={user.tel_no}
                                onChange={filterInputChange}
                                onBlur={() => handleBlur('tel_no')}
                                InputProps={{
                                  sx: {
                                    height: "32px",
                                    margin: "2px 0 1px 7px",
                                  },
                                }}
                                sx={{ maxWidth: 140, marginRight: 1 }}
                                autoComplete="off"
                                type="tel"
                              />
                              {error.tel_no && (
                                <Typography variant="body2" color="error">
                                  숫자와 하이픈(-)만 입력할 수 있습니다.
                                </Typography>
                              )}
                            </>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                padding: "3px 8px",
                                display: "flex",
                                alignItems: "center",
                                maxWidth: 400,
                                height: "35px",
                              }}
                            >
                              {user.tel_no}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ mx: 2 }} />
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{
                              width: "120px",
                              textAlign: "right",
                              marginRight: 6,
                              fontWeight: "bold",
                            }}
                          >
                            홈메뉴(웹)
                          </Typography>
                          {editMode ? (
                            <Typography
                              variant="body1"
                              sx={{
                                padding: "3px 7px",
                                display: "flex",
                                alignItems: "center",
                                maxWidth: 400,
                                height: "35px",
                              }}
                            >
                              <Button
                                fillMode={"outline"}
                                themeColor={"primary"}
                                onClick={onMenuWindowClick}
                              >
                                홈메뉴변경
                              </Button>
                            </Typography>
                          ) : (
                            <Typography
                              variant="body1"
                              sx={{
                                padding: "3px 8px",
                                display: "flex",
                                alignItems: "center",
                                maxWidth: 400,
                                height: "35px",
                              }}
                            >
                              {
                                menuListData.find(
                                  (items: any) =>
                                    items.sub_code == user.home_menu_id_web
                                )?.code_name
                              }
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      {changePasswordWindowVisible && (
        <ChangePasswordWindow setVisible={setChangePasswordWindowVisible} />
      )}
      {menuWindowVisible && (
        <MenuWindow
          setVisible={setMenuWindowVisible}
          reloadData={(data) => setMenuData(data)}
          modal={true}
        />
      )}
    </>
  );
};

export default SY_A0009W;
