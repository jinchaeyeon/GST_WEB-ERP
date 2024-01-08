import EditIcon from "@mui/icons-material/Edit";
import EventNoteIcon from "@mui/icons-material/EventNote";
import {
  Chip,
  Divider,
  ListSubheader,
  Avatar as MuiAvatar,
} from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import { Button } from "@progress/kendo-react-buttons";
import { SvgIcon } from "@progress/kendo-react-common";
import {
  AutoComplete,
  AutoCompleteCloseEvent,
} from "@progress/kendo-react-dropdowns";
import {
  Avatar,
  PanelBar,
  PanelBarItem,
  PanelBarSelectEventArguments,
  TabStrip,
  TabStripTab,
} from "@progress/kendo-react-layout";
import { Popup } from "@progress/kendo-react-popup";
import { Tooltip } from "@progress/kendo-react-tooltip";
import { userIcon } from "@progress/kendo-svg-icons";
import { useCallback, useEffect, useState } from "react";
import cookie from "react-cookies";
import { useHistory, useLocation, withRouter } from "react-router-dom";
import { useRecoilState } from "recoil";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  AppName,
  ButtonContainer,
  Content,
  Footer,
  Gnv,
  GridContainer,
  GridContainerWrap,
  Logo,
  MenuSearchBox,
  Modal,
  PageWrap,
  TopTitle,
  Wrapper,
} from "../../CommonStyled";
import { useApi } from "../../hooks/api";
import {
  // accessTokenState,
  deletedAttadatnumsState,
  deletedNameState,
  isMenuOpendState,
  isMobileMenuOpendState,
  loginResultState,
  menuList,
  menusState,
  passwordExpirationInfoState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters, TLogParaVal, TPath } from "../../store/types";
import { UseGetIp, getBrowser, resetLocalStorage } from "../CommonFunction";
import Loading from "../Loading";
import ChangePasswordWindow from "../Windows/CommonWindows/ChangePasswordWindow";
import SystemOptionWindow from "../Windows/CommonWindows/SystemOptionWindow";
import UserOptionsWindow from "../Windows/CommonWindows/UserOptionsWindow";
import HelpWindow from "../Windows/CommonWindows/HelpWindow";

const PanelBarNavContainer = (props: any) => {
  const processApi = useApi();
  const location = useLocation();
  const history = useHistory();
  const [loginResult] = useRecoilState(loginResultState);
  // const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
  // const [token] = useState(accessToken);
  const accessToken = localStorage.getItem("accessToken");
  const [pwExpInfo, setPwExpInfo] = useRecoilState(passwordExpirationInfoState);
  // useEffect(() => {
  //   if (token === null) fetchMenus();
  // }, [token]);
  const [menus, setMenus] = useRecoilState(menusState);
  const [isMobileMenuOpend, setIsMobileMenuOpend] = useRecoilState(
    isMobileMenuOpendState
  );
  const [isMenuOpend, setIsMenuOpend] = useRecoilState(isMenuOpendState);

  // 삭제할 첨부파일 리스트를 담는 함수
  const [deletedAttadatnums, setDeletedAttadatnums] = useRecoilState(
    deletedAttadatnumsState
  );
  const [deletedName, setDeletedName] = useRecoilState(deletedNameState);
  // 서버 업로드는 되었으나 DB에는 저장안된 첨부파일 리스트
  const [unsavedAttadatnums, setUnsavedAttadatnums] = useRecoilState(
    unsavedAttadatnumsState
  );
  const [helpWindowVisible, setHelpWindowVisible] = useState<boolean>(false);
  const onHelpWndClick = () => {
    setShow(false);
    setHelpWindowVisible(true);
  };
  const [unsavedName, setUnsavedName] = useRecoilState(unsavedNameState);
  const companyCode = loginResult ? loginResult.companyCode : "";
  const customerName = loginResult ? loginResult.customerName : "";
  const userId = loginResult ? loginResult.userId : "";
  const userName = loginResult ? loginResult.userName : "";
  const loginKey = loginResult ? loginResult.loginKey : "";
  const role = loginResult ? loginResult.role : "";
  const isAdmin = role === "ADMIN";
  const [previousRoute, setPreviousRoute] = useState("");
  const [formKey, setFormKey] = useState("");

  const [ip, setIp] = useState<any>(null);
  UseGetIp(setIp);

  let broswer = getBrowser();
  broswer = broswer.substring(broswer.lastIndexOf("/") + 1);

  // 반응형 처리
  const [clientWidth, setClientWidth] = useState(
    document.documentElement.getBoundingClientRect().width
  );
  useEffect(() => {
    const handleWindowResize = () => {
      setClientWidth(document.documentElement.getBoundingClientRect().width);
    };
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  });

  // useEffect(() => {
  //   const handleTabClose = (event: BeforeUnloadEvent) => {
  //     event.preventDefault();
  //     fetchToLog({
  //       work_type: "OPEN",
  //       form_id: previousRoute,
  //       form_name: "",
  //       form_login_key: formKey,
  //       t: "2",
  //     });

  //     //return (event.returnValue = "true");
  //   };

  //   window.addEventListener("beforeunload", handleTabClose);

  //   return () => {
  //     window.removeEventListener("beforeunload", handleTabClose);
  //   };
  // }, []);

  // 새로고침하거나 Path 변경 시
  useEffect(() => {
    const handleTabClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      return (event.returnValue = "true");
    };

    const handleUnload = () => {
      // unsavedAttadatnums가 있으면 삭제처리
      if (unsavedAttadatnums.length > 0) {
        setDeletedAttadatnums(unsavedAttadatnums);
      }
    };

    const unlisten = history.listen(() => {
      handleUnload();
    });

    window.addEventListener("beforeunload", handleTabClose);
    window.addEventListener("unload", handleUnload);

    return () => {
      unlisten();
      window.removeEventListener("beforeunload", handleTabClose);
      window.removeEventListener("unload", handleUnload);
    };
  }, [
    unsavedAttadatnums,
    setUnsavedAttadatnums,
    history,
    setDeletedAttadatnums,
  ]);

  useEffect(() => {
    // if (token && menus === null) fetchMenus();
    if (menus === null) fetchMenus();
  }, [menus]);

  // 첨부파일 삭제
  useEffect(() => {
    if (deletedAttadatnums.length > 0) {
      fetchToDeletedAttachment(deletedAttadatnums);

      // 초기화
      setUnsavedAttadatnums([]);
      setDeletedAttadatnums([]);
      // 초기화
      setUnsavedName([]);
      setDeletedName([]);
    }
  }, [deletedAttadatnums]);

  // 첨부파일 삭제
  useEffect(() => {
    if (deletedName.length > 0) {
      fetchToDeletedName(deletedName);

      // 초기화
      setUnsavedName([]);
      setDeletedName([]);
    }
  }, [deletedName]);

  useEffect(() => {
    // console.log("caches" in window);
    // console.log(window.caches);

    checkPwExpInfo();
  }, []);

  const checkPwExpInfo = () => {
    if (pwExpInfo && pwExpInfo.useExpiration) {
      if (pwExpInfo.status !== "Ok") {
        setChangePasswordWindowVisible(true);
      }
    }
  };

  const [menulist, setMenuList] = useRecoilState(
    menuList
  );
  const fetchMenus = useCallback(async () => {
    try {
      let menuPara = {
        para: "menus?userId=" + userId + "&category=WEB",
      };
      const menuResponse = await processApi<any>("menus", menuPara);

      const menu = menuResponse.usableMenu.map((item: any) => {
        if(item.parentMenuId != "") {
          if(item.menuCategory == "GROUP") {
            var valid = true;
            menuResponse.usableMenu.map((item2: any) => {
              if(item.menuId == item2.parentMenuId && valid != false) {
                valid = false;
              }
            })

            if(valid != true) {
              return item;
            }
          } else {
            return item;
          }
        } else {
          return item;
        }
      })
      
      setMenus(menu.filter((item: any) => item != undefined));
      setMenuList(menu.filter((item: any) => item != undefined));
    } catch (e: any) {
      console.log("menus error", e);
    }
  }, []);

  const fetchToDeletedAttachment = useCallback(async (attdatnums: string[]) => {
    let data: any;

    attdatnums.forEach(async (attdatnum) => {
      try {
        data = await processApi<any>("attachment-delete", {
          attached: `attached?attachmentNumber=${attdatnum}`,
        });
      } catch (error) {
        data = null;
      }

      if (data === null) {
        console.log("An error occured to delete a file of " + attdatnum);
      }
    });
  }, []);

  const fetchToDeletedName = useCallback(async (saved_name: string[]) => {
    let data: any;

    saved_name.forEach(async (name) => {
      try {
        data = await processApi<any>("file-delete", { attached: name });
      } catch (error) {
        data = null;
      }
    });
  }, []);

  let paths: Array<TPath> = [];
  if (menus !== null) {
    // Home push
    menus
      .filter((menu: any) => menu.formId === "Home")
      .forEach((menu: any, idx: number) => {
        paths.push({
          path: "/" + menu.formId,
          menuName: menu.menuName,
          index: "." + idx,
          menuId: menu.menuId,
          parentMenuId: menu.parentMenuId,
          menuCategory: menu.menuCategory,
          isFavorite: menu.isFavorite,
        });
      });

    // 즐겨찾기 그룹 push
    paths.push({
      path: "",
      menuName: "즐겨찾기",
      index: "." + 1,
      menuId: "fav",
      parentMenuId: "",
      menuCategory: "GROUP",
      isFavorite: false,
    });

    // 즐겨찾기 Menu push
    menus
      .filter((menu) => menu.menuCategory === "WEB" && menu.isFavorite)
      .forEach((menu, idx: number) => {
        paths.push({
          path: "/" + menu.formId,
          menuName: menu.menuName,
          index: ".1." + idx,
          menuId: menu.menuId,
          parentMenuId: "fav",
          menuCategory: menu.menuCategory,
          isFavorite: menu.isFavorite,
        });
      });

    // Group push (Home, PlusWin6 Group 제외)
    menus
      .filter(
        (menu: any) =>
          menu.menuCategory === "GROUP" &&
          menu.menuName !== "Home" &&
          menu.menuName !== "PlusWin6"
      )
      .forEach((menu: any, idx: number) => {
        paths.push({
          path: "/" + menu.formId,
          menuName: menu.menuName,
          index: "." + (idx + 2), // home, 즐겨찾기 때문에 +2
          menuId: menu.menuId,
          parentMenuId: menu.parentMenuId,
          menuCategory: menu.menuCategory,
          isFavorite: menu.isFavorite,
        });
      });

    // Group별 Menu push
    paths.forEach((path: TPath) => {
      menus
        .filter(
          (menu: any) =>
            menu.menuCategory === "WEB" && path.menuId === menu.parentMenuId
        )
        .forEach((menu: any, idx: number) => {
          paths.push({
            path: "/" + menu.formId,
            menuName: menu.menuName,
            index: path.index + "." + idx,
            menuId: menu.menuId,
            parentMenuId: menu.parentMenuId,
            menuCategory: menu.menuCategory,
            isFavorite: menu.isFavorite,
          });
        });
    });
  }

  const [userOptionsWindowVisible, setUserOptionsWindowVisible] =
    useState<boolean>(false);
  const [changePasswordWindowVisible, setChangePasswordWindowVisible] =
    useState<boolean>(false);
  const [systemOptionWindowWindowVisible, setSystemOptionWindowVisible] =
    useState<boolean>(false);

  const onSelect = (event: PanelBarSelectEventArguments) => {
    const { route, className = "" } = event.target.props;
    props.history.push(route);

    if (route) {
      setIsMobileMenuOpend(false);
      setUserOptionsWindowVisible(false);
      setSystemOptionWindowVisible(false);
      if (
        pwExpInfo &&
        (pwExpInfo.status === "Expired" || pwExpInfo.status === "Ok")
      ) {
        setChangePasswordWindowVisible(false);
      }
    }

    if (className.includes("custom-option")) {
      setUserOptionsWindowVisible(true);
    } else if (className.includes("change-password")) {
      setChangePasswordWindowVisible(true);
    } else if (className.includes("system-option")) {
      setSystemOptionWindowVisible(true);
    }
  };

  useEffect(() => {
    // if (token && ip !== null) {
    if (ip !== null) {
      const pathname = location.pathname.replace("/", "");

      // 폼 로그 처리
      if (previousRoute === "") {
        const pathitem = paths.find(
          (item) => item.path.replace("/", "") === pathname
        );

        //최초 오픈
        fetchToLog({
          work_type: "OPEN",
          form_id: pathname,
          form_name: pathitem ? pathitem.menuName : "",
          form_login_key: "",
        });
      } else if (pathname !== previousRoute) {
        const pathitem = paths.find(
          (item) => item.path.replace("/", "") === pathname
        );
        const previousPathitem = paths.find(
          (item) => item.path.replace("/", "") === previousRoute
        );
        // 오픈, 클로즈
        fetchToLog({
          work_type: "CLOSE",
          form_id: previousRoute,
          form_name: previousPathitem ? previousPathitem.menuName : "",
          form_login_key: formKey,
        });
        fetchToLog({
          work_type: "OPEN",
          form_id: pathname,
          form_name: pathitem ? pathitem.menuName : "",
          form_login_key: "",
        });
      }

      // 이전 루트 저장
      setPreviousRoute(pathname);
    }
  }, [location, ip]);

  const fetchToLog = async (logParaVal: TLogParaVal) => {
    let data: any;

    const logPara: Iparameters = {
      procedureName: "sys_sav_form_access_log",
      pageNumber: 0,
      pageSize: 0,
      parameters: {
        "@p_work_type": logParaVal.work_type,
        "@p_user_id": userId,
        "@p_form_id": logParaVal.form_id,
        "@p_form_name": logParaVal.form_name,

        "@p_login_key": logParaVal.form_login_key,
        "@p_parent_login_key": loginKey,

        "@p_ip_address": ip,
        "@p_pc": broswer,
        "@p_mac_address": "",
      },
    };

    try {
      data = await processApi<any>("procedure", logPara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess === true) {
      if (logParaVal.work_type === "OPEN") {
        const { form_login_key } = data.tables[0].Rows[0];
        setFormKey(form_login_key);
      }
    } else {
      console.log("[An error occured to log]");
      console.log(data);
    }
  };

  const setSelectedIndex = (pathName: any) => {
    let currentPath: any = paths
      .filter((item) => item.parentMenuId !== "fav")
      .find((item: any) => item.path === pathName);

    return currentPath ? currentPath.index : 0;
  };

  const selected = setSelectedIndex(props.location.pathname);
  const logout = () => {
    fetchLogout();

    // setAccessToken(null);
    cookie.remove("refreshToken", { path: "/" }); // localStorage.removeItem("refreshToken");
    resetLocalStorage();
    window.location.href = "/";
  };

  const fetchLogout = async () => {
    let data: any;

    const para = {
      accessToken: accessToken,
    };

    try {
      data = await processApi<any>("logout", para);
    } catch (error) {
      data = null;
    }
    if (data === null) {
      console.log("[An error occured to log for logout]");
      console.log(data);
    }
  };

  const onMenuBtnClick = () => {
    setIsMobileMenuOpend((prev) => !prev);
  };

  const onClickChatbot = () => {
    window.open("/CHAT_A0001W", "_blank");
  };

  const panelBars: TPath[] = [
    ...paths.filter((path) => path.path === "/Home"),
    ...paths.filter((path) => path.menuCategory === "GROUP"),
  ];
  if (companyCode === "2207A046" && isAdmin) {
    panelBars.push({
      path: "/WORD_EDITOR",
      menuName: "EDITOR",
      index: "",
      menuId: "",
      parentMenuId: "",
      menuCategory: "",
      isFavorite: false,
    });
    panelBars.push({
      path: "/GANTT",
      menuName: "GANTT",
      index: "",
      menuId: "",
      parentMenuId: "",
      menuCategory: "",
      isFavorite: false,
    });
  }
  panelBars.push({
    path: "/",
    menuName: "설정",
    index: "",
    menuId: "setting",
    parentMenuId: "",
    menuCategory: "WEB",
    isFavorite: false,
  });
  paths.push({
    path: "/",
    menuName: "비밀번호 변경",
    index: "",
    menuId: "change-password",
    parentMenuId: "setting",
    menuCategory: "WEB",
    isFavorite: false,
  });
  paths.push({
    path: "/",
    menuName: "사용자 옵션",
    index: "",
    menuId: "custom-option",
    parentMenuId: "setting",
    menuCategory: "WEB",
    isFavorite: false,
  });
  if (isAdmin) {
    paths.push({
      path: "/",
      menuName: "시스템 옵션",
      index: "",
      menuId: "system-option",
      parentMenuId: "setting",
      menuCategory: "WEB",
      isFavorite: false,
    });
  }

  // Parent 그룹 없는 메뉴 Array
  const singleMenus = ["/Home", "/GANTT", "/WORD_EDITOR"];

  let prgMenus: null | { id: string; text: string }[] = null;
  if (menus) {
    prgMenus = menus
      .filter((menu) => menu.menuCategory === "WEB")
      .map((menu) => ({ id: menu.formId, text: menu.menuName }));
  }
  const [searchedMenu, setSearchedMenu] = useState("");

  const openSelctedMenu = (e: AutoCompleteCloseEvent) => {
    const { value } = e.target;

    if (prgMenus) {
      const selectedValue = prgMenus.find((menu) => menu.text === value);
      if (selectedValue) {
        history.push("/" + selectedValue.id);
      }
    }
  };
  const path = window.location.href;

  const contact = [
    {
      avatar: loginResult.profileImage,
      name: loginResult.userName,
      position: loginResult.dptnm,
    },
  ];

  const [show, setShow] = useState<boolean | undefined>(false);
  const offset = {
    left: 210,
    top: 80,
  };
  const [tabSelected, setTabSelected] = useState(0);
  const handleSelectTab = (e: any) => {
    setTabSelected(e.selected);
  };
  const [chip, setChip] = useState(0);

  return (
    <>
      <Wrapper isMobileMenuOpend={isMobileMenuOpend}>
        <Modal isMobileMenuOpend={isMobileMenuOpend} onClick={onMenuBtnClick} />
        {isMenuOpend ? (
          <Gnv isMobileMenuOpend={isMobileMenuOpend} theme={"#2289c3"}>
            <AppName theme={"#2289c3"} onClick={() => setIsMenuOpend(false)}>
              <Logo size="32px" name={"GST WEB"} />
              {loginResult.webTitle}
            </AppName>
            <GridContainerWrap height={"100px"} style={{ gap: "0px" }}>
              <GridContainer
                width="80%"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {contact[0].avatar == "" ||  contact[0].avatar == undefined? (
                  <Avatar className="k-avatar-lg" rounded="full" type="icon">
                    <SvgIcon icon={userIcon} size="large" />
                  </Avatar>
                ) : (
                  <Avatar className="k-avatar-lg" rounded="full" type="image">
                    <img
                      src={"data:image/png;base64," + contact[0].avatar}
                      alt="UserImage"
                    />
                  </Avatar>
                )}
                <div style={{ marginTop: "5px" }}>
                  <h2
                    style={{
                      fontSize: "1.1em",
                      fontWeight: "normal",
                      marginBottom: "5px",
                    }}
                  >
                    {contact[0].name}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.8em",
                    }}
                  >
                    {contact[0].position}
                  </p>
                </div>
              </GridContainer>
              <GridContainer
                width="20%"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Button
                  icon="calendar"
                  themeColor={"primary"}
                  fillMode="flat"
                  title="일정"
                >
                </Button>
                <Button
                  icon="bell"
                  themeColor={"primary"}
                  onClick={() => setShow(!show)}
                  fillMode="flat"
                  title="알림"
                >
                </Button>
                <Button
                  icon="info"
                  themeColor={"primary"}
                  onClick={onHelpWndClick}
                  fillMode="flat"
                  title="도움말"
                >
                </Button>
                <Popup
                  offset={offset}
                  show={show}
                  style={{
                    width: "400px",
                    color: "#787878",
                    backgroundColor: "#fcf7f8",
                    border: "1px solid rgba(0,0,0,.05)",
                    maxHeight: "600px",
                  }}
                >
                  <TabStrip
                    style={{ width: "100%", maxHeight: "600px" }}
                    selected={tabSelected}
                    onSelect={handleSelectTab}
                  >
                    <TabStripTab title="알림">
                      <Swiper
                        spaceBetween={1}
                        slidesPerView={3}
                        navigation={true}
                        modules={[Navigation]}
                        style={{ marginBottom: "10px" }}
                      >
                        <SwiperSlide>
                          <Chip
                            label="전체"
                            color="primary"
                            variant={chip == 0 ? "outlined" : "filled"}
                            onClick={() => setChip(0)}
                          />
                        </SwiperSlide>
                        <SwiperSlide>
                          <Chip
                            label="업무보고"
                            color="primary"
                            variant={chip == 1 ? "outlined" : "filled"}
                            onClick={() => setChip(1)}
                          />
                        </SwiperSlide>
                        <SwiperSlide>
                          <Chip
                            label="전자결재"
                            color="primary"
                            variant={chip == 2 ? "outlined" : "filled"}
                            onClick={() => setChip(2)}
                          />
                        </SwiperSlide>
                        <SwiperSlide>
                          <Chip
                            label="게시판"
                            color="primary"
                            variant={chip == 3 ? "outlined" : "filled"}
                            onClick={() => setChip(3)}
                          />
                        </SwiperSlide>
                        <SwiperSlide>
                          <Chip
                            label="미팅룸"
                            color="primary"
                            variant={chip == 4 ? "outlined" : "filled"}
                            onClick={() => setChip(4)}
                          />
                        </SwiperSlide>
                      </Swiper>
                      <Divider />

                      <List
                        sx={{
                          width: "100%",
                          maxWidth: 360,
                          bgcolor: "background.paper",
                        }}
                        subheader={
                          <ListSubheader
                            component="div"
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            12.05 목요일
                          </ListSubheader>
                        }
                      >
                        <ListItem>
                          <ListItemAvatar>
                            <MuiAvatar>
                              <EditIcon />
                            </MuiAvatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="[결재진행] 결재자: 나똘똘"
                            secondary="결재필요"
                          />
                        </ListItem>
                      </List>
                      <List
                        sx={{
                          width: "100%",
                          maxWidth: 360,
                          bgcolor: "background.paper",
                        }}
                        subheader={
                          <ListSubheader
                            component="div"
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            11.29 수요일
                          </ListSubheader>
                        }
                      >
                        <ListItem>
                          <ListItemAvatar>
                            <MuiAvatar>
                              <EditIcon />
                            </MuiAvatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="[결재종결] 기안자: 나똘똘"
                            secondary="관리부 나똘똘 20231129"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <MuiAvatar>
                              <EditIcon />
                            </MuiAvatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="[결재종결] 최종결재: 나똘똘"
                            secondary="관리부 나똘똘 20231129"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <MuiAvatar>
                              <EditIcon />
                            </MuiAvatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="[결재도착] 기안자: 나똘똘"
                            secondary="관리부 나똘똘 20231129"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <MuiAvatar>
                              <EventNoteIcon />
                            </MuiAvatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="[게시판새글] 정구매"
                            secondary="통합솔루션 사용 시점 공지"
                          />
                        </ListItem>
                      </List>
                      <List
                        sx={{
                          width: "100%",
                          maxWidth: 360,
                          bgcolor: "background.paper",
                        }}
                        subheader={
                          <ListSubheader
                            component="div"
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            11.23 목요일
                          </ListSubheader>
                        }
                      >
                        <ListItem>
                          <ListItemAvatar>
                            <MuiAvatar>
                              <EditIcon />
                            </MuiAvatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary="[결재도착] 기안자: 나똘똘"
                            secondary="제목"
                          />
                        </ListItem>
                      </List>
                    </TabStripTab>
                    <TabStripTab title="쪽지"></TabStripTab>
                  </TabStrip>
                </Popup>
              </GridContainer>
            </GridContainerWrap>
            {prgMenus && (
              <MenuSearchBox>
                {searchedMenu === "" && (
                  <span className="k-icon k-i-search"></span>
                )}
                <AutoComplete
                  style={{ width: "100%" }}
                  data={prgMenus}
                  textField="text"
                  value={searchedMenu}
                  onChange={(e) => setSearchedMenu(e.value)}
                  onBlur={(e) => setSearchedMenu("")}
                  onClose={openSelctedMenu}
                  size="small"
                  placeholder="Search menu.."
                />
              </MenuSearchBox>
            )}
            {paths.length > 0 && (
              <PanelBar
                selected={selected}
                expandMode={"multiple"}
                onSelect={onSelect}
              >
                {panelBars.map((path: TPath, idx: number) => {
                  return singleMenus.includes(path.path) ? (
                    <PanelBarItem
                      key={idx}
                      title={path.menuName}
                      route={path.path}
                    />
                  ) : (
                    <PanelBarItem
                      key={idx}
                      title={path.menuName}
                      icon={
                        path.menuId === "fav"
                          ? "star"
                          : path.menuId === "setting"
                          ? "gear"
                          : undefined
                      }
                      className={path.menuId === "fav" ? "fav-menu" : ""}
                    >
                      {paths
                        .filter(
                          (childPath: TPath) =>
                            childPath.menuCategory === "WEB" &&
                            childPath.parentMenuId === path.menuId
                        )
                        .map((childPath: TPath, childIdx: number) => (
                          <PanelBarItem
                            key={childIdx}
                            title={
                              <Tooltip position="right" anchorElement="target">
                                <span title={childPath.menuName}>
                                  {childPath.menuName}
                                </span>
                              </Tooltip>
                            }
                            route={
                              path.menuId === "setting"
                                ? undefined
                                : childPath.path
                            }
                            className={childPath.menuId}
                            icon={childPath.isFavorite ? "circle" : "circle"}
                          ></PanelBarItem>
                        ))}
                    </PanelBarItem>
                  );
                })}
              </PanelBar>
            )}

            {/* GST */}
            {/* {companyCode === "2207C612" && (
        <PanelBar
          selected={selected}
          expandMode={"single"}
          onSelect={onSelect}
        >
          <PanelBarItem title={"Home"} route="/Home"></PanelBarItem>

          <PanelBarItem title={"전사관리"}>
            <PanelBarItem title={"Scheduler"} route="/CM_A1600W" />
          </PanelBarItem>
          <PanelBarItem title={"전자결재"}>
            <PanelBarItem title={"결재관리"} route="/EA_A2000W" />
          </PanelBarItem>
        </PanelBar>
      )} */}

            <ButtonContainer
              flexDirection={"column"}
              style={{ marginTop: "10px", gap: "5px", marginBottom: "30px" }}
            >
              {/* <Button
                onClick={onClickChatbot}
                icon={"hyperlink-open-sm"}
                fillMode={"solid"}
                themeColor={"secondary"}
                rounded={"full"}
                size="small"
              >
                Chatbot
              </Button> */}
              {isAdmin && (
                <Button
                  onClick={() => setUserOptionsWindowVisible(true)}
                  fillMode={"flat"}
                  themeColor={"secondary"}
                >
                  사용자 옵션
                </Button>
              )}
              <Button
                onClick={logout}
                icon={"logout"}
                fillMode={"flat"}
                themeColor={"secondary"}
              >
                로그아웃
              </Button>
            </ButtonContainer>
          </Gnv>
        ) : (
          <div
            style={{
              paddingTop: "10px",
              borderRight: "solid 1px #ebebeb",
              height: "100vh",
            }}
          >
            <Button
              icon="menu"
              fillMode={"flat"}
              themeColor={"primary"}
              onClick={() => setIsMenuOpend(true)}
            />
          </div>
        )}
        <Content isMenuOpen={isMenuOpend}>
          <TopTitle>
            <div style={{ width: "30px" }}></div>
            <AppName theme={"#2289c3"}>
              <Logo size="32px" name={"GST WEB"} />
            </AppName>
            <Button
              icon="menu"
              themeColor={"primary"}
              fillMode={"flat"}
              onClick={onMenuBtnClick}
            />
          </TopTitle>
          <PageWrap>{props.children}</PageWrap>
        </Content>
        {userOptionsWindowVisible && (
          <UserOptionsWindow setVisible={setUserOptionsWindowVisible} />
        )}
        {changePasswordWindowVisible && (
          <ChangePasswordWindow setVisible={setChangePasswordWindowVisible} />
        )}
        {systemOptionWindowWindowVisible && (
          <SystemOptionWindow setVisible={setSystemOptionWindowVisible} />
        )}

        <Loading />
      </Wrapper>
      <Footer>
        <div>
          {userName}({userId})
        </div>
        <div>
          {customerName}({companyCode})
        </div>
        <div>{ip}</div>
      </Footer>
      {helpWindowVisible && (
        <HelpWindow
          setVisible={setHelpWindowVisible}
          modal={true}
        />
      )}
    </>
  );
};

export default withRouter(PanelBarNavContainer);
