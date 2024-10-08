import DescriptionIcon from "@mui/icons-material/Description";
import MessageIcon from "@mui/icons-material/Message";
import {
  Chip,
  Divider,
  ListSubheader,
  Avatar as MuiAvatar,
  Typography,
} from "@mui/material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import {
  DataResult,
  GroupDescriptor,
  GroupResult,
  State,
  groupBy,
  process,
} from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import { SvgIcon } from "@progress/kendo-react-common";
import { setGroupIds } from "@progress/kendo-react-data-tools";
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
import { userIcon } from "@progress/kendo-svg-icons";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import cookie from "react-cookies";
import { useThemeSwitcher } from "react-css-theme-switcher";
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
  GnvPanel,
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
  isFilterHideState,
  isFilterheightstate,
  isMenuOpendState,
  isMobileMenuOpendState,
  linkState,
  loginResultState,
  menuList,
  menusState,
  passwordExpirationInfoState,
  sessionItemState,
  unsavedAttadatnumsState,
  unsavedNameState,
} from "../../store/atoms";
import { Iparameters, TLogParaVal, TPath } from "../../store/types";
import {
  UseGetValueFromSessionItem,
  dateformat2,
  getBrowser,
  getColor,
  getHeight,
  resetLocalStorage,
} from "../CommonFunction";
import { PAGE_SIZE } from "../CommonString";
import Loading from "../Loading";
import ChangePasswordWindow from "../Windows/CommonWindows/ChangePasswordWindow";
import HelpWindow from "../Windows/CommonWindows/HelpWindow";
import MessengerWindow from "../Windows/CommonWindows/MessengerWindow";
import SystemOptionWindow from "../Windows/CommonWindows/SystemOptionWindow";
import UserOptionsWindow from "../Windows/CommonWindows/UserOptionsWindow";
import  secureLocalStorage  from  "react-secure-storage";

const initialGroup: GroupDescriptor[] = [{ field: "group_category_name" }];

const processWithGroups = (data: any[], group: GroupDescriptor[]) => {
  const newDataState = groupBy(data, group);

  setGroupIds({ data: newDataState, group: group });

  return newDataState;
};

const PanelBarNavContainer = (props: any) => {
  const { switcher, themes, currentTheme = "" } = useThemeSwitcher();
  const processApi = useApi();
  const location = useLocation();
  const history = useHistory();
  const [Link, setLink] = useRecoilState(linkState);
  const sessionOrgdiv = UseGetValueFromSessionItem("orgdiv");
  const ip = UseGetValueFromSessionItem("ip");
  const [loginResult] = useRecoilState(loginResultState);
  // const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
  // const [token] = useState(accessToken);
  const accessToken = secureLocalStorage.getItem("accessToken");
  const [pwExpInfo, setPwExpInfo] = useRecoilState(passwordExpirationInfoState);
  const [sessionItem] = useRecoilState(sessionItemState);
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
  const avatar = loginResult ? loginResult.profileImage : "";
  const name = loginResult ? loginResult.userName : "";
  const position = loginResult ? loginResult.dptnm : "";
  const webTitle = loginResult ? loginResult.webTitle : "";
  const isAdmin = role == "ADMIN";
  const [previousRoute, setPreviousRoute] = useState("");
  const [formKey, setFormKey] = useState("");
  const [isFilterHideStates, setIsFilterHideStates] =
    useRecoilState(isFilterHideState);
  const [isFilterheightstates, setIsFilterheightstates] =
    useRecoilState(isFilterheightstate);

  let broswer = getBrowser();
  broswer = broswer.substring(broswer.lastIndexOf("/") + 1);
  const [webheight, setWebHeight] = useState(0);
  // 반응형 처리
  let deviceWidth = document.documentElement.clientWidth;
  let isMobile = deviceWidth <= 1200;

  // 새로고침하거나 Path 변경 시
  useEffect(() => {
    const handleTabClose = (event: BeforeUnloadEvent) => {};

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
      if (isMobile) {
        setIsFilterheightstates(30);
        setIsFilterHideStates(true);
      } else {
        setIsFilterheightstates(0);
        setIsFilterHideStates(false);
      }
    };
  }, [
    unsavedAttadatnums,
    setUnsavedAttadatnums,
    history,
    setDeletedAttadatnums,
  ]);

  useEffect(() => {
    // if (token && menus == null) fetchMenus();
    if (menus == null && accessToken) {
      fetchMenus();
    }
  }, [menus, accessToken]);

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
    checkPwExpInfo();
  }, []);

  const checkPwExpInfo = () => {
    if (pwExpInfo && pwExpInfo.useExpiration) {
      if (pwExpInfo.status !== "Ok") {
        setChangePasswordWindowVisible(true);
      }
    }
  };

  const [menulist, setMenuList] = useRecoilState(menuList);
  const fetchMenus = useCallback(async () => {
    try {
      let menuPara = {
        para: "menus?userId=" + userId + "&category=WEB",
      };
      const menuResponse = await processApi<any>("menus", menuPara);

      const menu = menuResponse.usableMenu.map((item: any) => {
        if (item.parentMenuId != "") {
          if (item.menuCategory == "GROUP") {
            var valid = true;
            menuResponse.usableMenu.map((item2: any) => {
              if (item.menuId == item2.parentMenuId && valid != false) {
                valid = false;
              }
            });

            if (valid != true) {
              return item;
            }
          } else {
            return item;
          }
        } else {
          return item;
        }
      });

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

      if (data == null) {
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
      .filter((menu: any) => menu.formId == "Home")
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

    let valid = menus.filter((menu: any) => menu.formId == "Home").length > 0;

    if (valid != true) {
      paths.push({
        path: "/Home",
        menuName: "HOME",
        index: "." + 0,
        menuId: "M2022121411504753035",
        parentMenuId: "M2022062210224011070",
        menuCategory: "WEB",
        isFavorite: false,
      });
    }

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
      .filter((menu) => menu.menuCategory == "WEB" && menu.isFavorite)
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
          menu.menuCategory == "GROUP" &&
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
            menu.menuCategory == "WEB" && path.menuId == menu.parentMenuId
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
      if (isMobile) {
        setIsFilterheightstates(30);
        setIsFilterHideStates(true);
      } else {
        setIsFilterheightstates(0);
        setIsFilterHideStates(false);
      }
      setIsMobileMenuOpend(false);
      setUserOptionsWindowVisible(false);
      setSystemOptionWindowVisible(false);
      if (
        pwExpInfo &&
        (pwExpInfo.status == "Expired" || pwExpInfo.status == "Ok")
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
    if (ip !== "" && accessToken && sessionItem) {
      const pathname = location.pathname.replace("/", "");

      // 폼 로그 처리
      if (previousRoute == "") {
        const pathitem = paths.find(
          (item) => item.path.replace("/", "") == pathname
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
          (item) => item.path.replace("/", "") == pathname
        );
        const previousPathitem = paths.find(
          (item) => item.path.replace("/", "") == previousRoute
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
  }, [location, ip, accessToken, sessionItem]);

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

        "@p_ip_address": ip == undefined ? "" : ip,
        "@p_pc": broswer,
        "@p_mac_address": "",
      },
    };

    try {
      data = await processApi<any>("procedure", logPara);
    } catch (error) {
      data = null;
    }
    if (data.isSuccess == true) {
      if (logParaVal.work_type == "OPEN") {
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
      .find((item: any) => item.path == pathName);

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
    if (data == null) {
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
    ...paths.filter((path) => path.path == "/Home"),
    ...paths.filter((path) => path.menuCategory == "GROUP"),
  ];

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
  const singleMenus = ["/Home"];

  let prgMenus: null | { id: string; text: string }[] = null;
  if (menus) {
    prgMenus = menus
      .filter((menu) => menu.menuCategory == "WEB")
      .map((menu) => ({ id: menu.formId, text: menu.menuName }));
  }
  const [searchedMenu, setSearchedMenu] = useState("");

  const openSelctedMenu = (e: AutoCompleteCloseEvent) => {
    const { value } = e.target;

    if (prgMenus) {
      const selectedValue = prgMenus.find((menu) => menu.text == value);
      if (selectedValue) {
        history.push("/" + selectedValue.id);
      }
    }
  };
  const path = window.location.href;

  const contact = [
    {
      avatar: avatar,
      name: name,
      position: position,
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

  const [filters, setFilters] = useState({
    pgNum: 1,
    isSearch: true,
    pgSize: PAGE_SIZE,
  });
  const [filters2, setFilters2] = useState({
    pgNum: 1,
    isSearch: true,
    workType: "list",
    pgSize: PAGE_SIZE,
  });
  const [mainDataState, setMainDataState] = useState<State>({
    sort: [],
  });
  const [mainDataResult, setMainDataResult] = useState<DataResult>(
    process([], mainDataState)
  );
  const [group, setGroup] = useState(initialGroup);
  const [total, setTotal] = useState(0);
  const [resultState, setResultState] = useState<GroupResult[]>(
    processWithGroups([], initialGroup)
  );

  //그리드 조회
  const fetchMainGrid = async (filters: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_sel_messenger",
      pageNumber: filters.pgNum,
      pageSize: filters.pgSize,
      parameters: {
        "@p_work_type": "receive",
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((item: any) => ({
        ...item,
      }));

      setMainDataResult((prev) => {
        return {
          data: rows,
          total: totalRowCnt == -1 ? 0 : totalRowCnt,
        };
      });
    } else {
      console.log("[오류 발생]");
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
  };

  //그리드 조회
  const fetchMainGrid2 = async (filters2: any) => {
    let data: any;
    //조회조건 파라미터
    const parameters: Iparameters = {
      procedureName: "sys_notifications_web",
      pageNumber: filters2.pgNum,
      pageSize: filters2.pgSize,
      parameters: {
        "@p_work_type": filters2.workType,
        "@p_orgdiv": sessionOrgdiv,
        "@p_user_id": userId,
      },
    };
    try {
      data = await processApi<any>("procedure", parameters);
    } catch (error) {
      data = null;
    }

    if (data.isSuccess == true) {
      const totalRowCnt = data.tables[0].TotalRowCount;
      const rows = data.tables[0].Rows.map((row: any) => {
        return {
          ...row,
          groupId: row.recdt + "recdt",
          group_category_name: dateformat2(row.recdt),
        };
      });

      const newDataState = processWithGroups(rows, group);
      setTotal(totalRowCnt);
      setResultState(newDataState);
    } else {
      console.log("[오류 발생]");
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
  };

  useEffect(() => {
    if (filters.isSearch && accessToken) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters);
      setFilters((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid(deepCopiedFilters);
    }
  }, [filters, accessToken]);

  useEffect(() => {
    if (filters2.isSearch && accessToken) {
      const _ = require("lodash");
      const deepCopiedFilters = _.cloneDeep(filters2);
      setFilters2((prev) => ({ ...prev, find_row_value: "", isSearch: false })); // 한번만 조회되도록
      fetchMainGrid2(deepCopiedFilters);
    }
  }, [filters2, accessToken]);

  const [Id, setId] = useState<string | undefined>("");
  const [windowVisible, setWindowVisible] = useState<boolean>(false);

  const onMessage = (id: any) => {
    setShow(false);
    setId(id);
    setWindowVisible(true);
  };

  const handleChangeChip = (id: any) => {
    setChip(id);
    if (id == 0) {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        workType: "list",
      }));
    } else if (id == 2) {
      setFilters2((prev) => ({
        ...prev,
        isSearch: true,
        workType: "approval",
      }));
    } else {
      setTotal(0);
      const newDataState = processWithGroups([], group);
      setResultState(newDataState);
    }
  };

  const onList = (data: any) => {
    if (data.worktype == "approval") {
      setShow(false);
      window.open(origin + `/EA_A2000W?go=` + data.appnm);
    }
  };

  const onMessengerClick = () => {
    setShow(false);
    setId(undefined);
    setWindowVisible(true);
  };

  useLayoutEffect(() => {
    if (paths.length > 0) {
      const handleWindowResize = () => {
        setWebHeight(getHeight(".Bars"));
      };
      handleWindowResize();
      window.addEventListener("resize", handleWindowResize);
      return () => {
        window.removeEventListener("resize", handleWindowResize);
      };
    }
  }, [isMenuOpend, isMobileMenuOpend, paths]);

  return (
    <>
      <Wrapper isMobileMenuOpend={isMobileMenuOpend}>
        <Modal isMobileMenuOpend={isMobileMenuOpend} onClick={onMenuBtnClick} />
        {isMenuOpend ? (
          <Gnv
            isMobileMenuOpend={isMobileMenuOpend}
            theme={getColor()}
            style={{
              paddingBottom: isMobile ? "100px" : "",
            }}
          >
            <div className="Bars">
              <AppName theme={getColor()} onClick={() => setIsMenuOpend(false)}>
                {companyCode == "2302BA03" ? (
                  <Logo size="120px" name={currentTheme} bio={true} />
                ) : currentTheme == "navy" ? (
                  <Logo size="90%" name={currentTheme} bio={false} />
                ) : (
                  <>
                    <Logo size="32px" name={currentTheme} bio={false} />
                    {webTitle}
                  </>
                )}
              </AppName>
              {currentTheme != "yellow" ? (
                currentTheme == "navy" ? (
                  <AppName
                    theme={getColor()}
                    style={{ fontSize: "15px", fontWeight: "600" }}
                  >
                    {customerName}
                  </AppName>
                ) : companyCode == "2302BA03" ? (
                  <>
                    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
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
                    <GridContainer
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Button
                        icon="calendar"
                        themeColor={"primary"}
                        fillMode="flat"
                        title="일정"
                      ></Button>
                      <Button
                        icon="bell"
                        themeColor={"primary"}
                        onClick={() => {
                          setShow(!show);
                          fetchMainGrid(filters);
                          setChip(0);
                          fetchMainGrid2(filters2);
                        }}
                        fillMode="flat"
                        title="알림"
                      ></Button>
                      <Button
                        icon="info"
                        themeColor={"primary"}
                        onClick={onHelpWndClick}
                        fillMode="flat"
                        title="도움말"
                      ></Button>
                      <Button
                        icon="question"
                        themeColor={"primary"}
                        onClick={() => {
                          window.open(`https://spm.gsti.co.kr/QnA`);
                        }}
                        fillMode="flat"
                        title="Q&A: SPM 프로그램으로 연결됩니다. 프로그램 관련 문의 글을 올리실 수 있습니다."
                      ></Button>
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
                          scrollable={isMobile}
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
                                  onClick={() => handleChangeChip(0)}
                                />
                              </SwiperSlide>
                              <SwiperSlide>
                                <Chip
                                  label="업무보고"
                                  color="primary"
                                  variant={chip == 1 ? "outlined" : "filled"}
                                  onClick={() => handleChangeChip(1)}
                                />
                              </SwiperSlide>
                              <SwiperSlide>
                                <Chip
                                  label="전자결재"
                                  color="primary"
                                  variant={chip == 2 ? "outlined" : "filled"}
                                  onClick={() => handleChangeChip(2)}
                                />
                              </SwiperSlide>
                              <SwiperSlide>
                                <Chip
                                  label="게시판"
                                  color="primary"
                                  variant={chip == 3 ? "outlined" : "filled"}
                                  onClick={() => handleChangeChip(3)}
                                />
                              </SwiperSlide>
                              <SwiperSlide>
                                <Chip
                                  label="미팅룸"
                                  color="primary"
                                  variant={chip == 4 ? "outlined" : "filled"}
                                  onClick={() => handleChangeChip(4)}
                                />
                              </SwiperSlide>
                            </Swiper>
                            <Divider />
                            {resultState.map((item) => (
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
                                    {item.value}
                                  </ListSubheader>
                                }
                              >
                                {item.items.map((data: any) => (
                                  <ListItem
                                    onClick={() => onList(data)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <ListItemAvatar>
                                      <MuiAvatar sx={{ bgcolor: getColor() }}>
                                        {data.worktype == "approval" ? (
                                          <DescriptionIcon />
                                        ) : (
                                          ""
                                        )}
                                      </MuiAvatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          variant="subtitle1"
                                          style={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                          }}
                                        >
                                          [결재요청] {data.appnm}
                                        </Typography>
                                      }
                                      secondary={
                                        <Typography variant="caption">
                                          요청자 : {data.prsnnm}
                                        </Typography>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ))}
                          </TabStripTab>
                          <TabStripTab title="쪽지">
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
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  안읽은 쪽지 리스트
                                  <Button
                                    onClick={onMessengerClick}
                                    icon="email"
                                    themeColor={"primary"}
                                  >
                                    전체 쪽지함
                                  </Button>
                                </ListSubheader>
                              }
                            >
                              {mainDataResult.data.map((item, index) => {
                                if (item.read_time == null) {
                                  return (
                                    <>
                                      <ListItem
                                        onClick={() => onMessage(item.slip_id)}
                                        style={{ cursor: "pointer" }}
                                      >
                                        <ListItemAvatar>
                                          <MuiAvatar
                                            sx={{ bgcolor: getColor() }}
                                          >
                                            <MessageIcon />
                                          </MuiAvatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                          primary={
                                            <Typography
                                              variant="subtitle1"
                                              style={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                              }}
                                            >
                                              {item.slip_content}
                                            </Typography>
                                          }
                                          secondary={
                                            <Typography variant="caption">
                                              보낸사람 : {item.sender_name}
                                            </Typography>
                                          }
                                        />
                                      </ListItem>
                                      {index != mainDataResult.total - 1 ? (
                                        <Divider />
                                      ) : (
                                        ""
                                      )}
                                    </>
                                  );
                                }
                              })}
                            </List>
                          </TabStripTab>
                        </TabStrip>
                      </Popup>
                    </GridContainer>
                  </>
                ) : (
                  <>
                    <GridContainerWrap height={"150px"} style={{ gap: "0px" }}>
                      <GridContainer
                        width="80%"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {contact[0].avatar == "" ||
                        contact[0].avatar == undefined ? (
                          <Avatar
                            className="k-avatar-lg"
                            rounded="full"
                            type="icon"
                          >
                            <SvgIcon icon={userIcon} size="large" />
                          </Avatar>
                        ) : (
                          <Avatar
                            className="k-avatar-lg"
                            rounded="full"
                            type="image"
                            style={{
                              backgroundColor: "white",
                              border: `2px solid ${getColor()}`,
                            }}
                          >
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
                          flexDirection: isMobileMenuOpend ? "row" : "column",
                        }}
                      >
                        <Button
                          icon="calendar"
                          themeColor={"primary"}
                          fillMode="flat"
                          title="일정"
                        ></Button>
                        <Button
                          icon="bell"
                          themeColor={"primary"}
                          onClick={() => {
                            setShow(!show);
                            fetchMainGrid(filters);
                            setChip(0);
                            fetchMainGrid2(filters2);
                          }}
                          fillMode="flat"
                          title="알림"
                        ></Button>
                        <Button
                          icon="info"
                          themeColor={"primary"}
                          onClick={onHelpWndClick}
                          fillMode="flat"
                          title="도움말"
                        ></Button>
                        <Button
                          icon="question"
                          themeColor={"primary"}
                          onClick={() => {
                            window.open(`https://spm.gsti.co.kr/QnA`);
                          }}
                          fillMode="flat"
                          title="Q&A: SPM 프로그램으로 연결됩니다. 프로그램 관련 문의 글을 올리실 수 있습니다."
                        ></Button>
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
                            scrollable={isMobile}
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
                                    onClick={() => handleChangeChip(0)}
                                  />
                                </SwiperSlide>
                                <SwiperSlide>
                                  <Chip
                                    label="업무보고"
                                    color="primary"
                                    variant={chip == 1 ? "outlined" : "filled"}
                                    onClick={() => handleChangeChip(1)}
                                  />
                                </SwiperSlide>
                                <SwiperSlide>
                                  <Chip
                                    label="전자결재"
                                    color="primary"
                                    variant={chip == 2 ? "outlined" : "filled"}
                                    onClick={() => handleChangeChip(2)}
                                  />
                                </SwiperSlide>
                                <SwiperSlide>
                                  <Chip
                                    label="게시판"
                                    color="primary"
                                    variant={chip == 3 ? "outlined" : "filled"}
                                    onClick={() => handleChangeChip(3)}
                                  />
                                </SwiperSlide>
                                <SwiperSlide>
                                  <Chip
                                    label="미팅룸"
                                    color="primary"
                                    variant={chip == 4 ? "outlined" : "filled"}
                                    onClick={() => handleChangeChip(4)}
                                  />
                                </SwiperSlide>
                              </Swiper>
                              <Divider />
                              {resultState.map((item) => (
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
                                      {item.value}
                                    </ListSubheader>
                                  }
                                >
                                  {item.items.map((data: any) => (
                                    <ListItem
                                      onClick={() => onList(data)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      <ListItemAvatar>
                                        <MuiAvatar sx={{ bgcolor: getColor() }}>
                                          {data.worktype == "approval" ? (
                                            <DescriptionIcon />
                                          ) : (
                                            ""
                                          )}
                                        </MuiAvatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Typography
                                            variant="subtitle1"
                                            style={{
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                          >
                                            [결재요청] {data.appnm}
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="caption">
                                            요청자 : {data.prsnnm}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              ))}
                            </TabStripTab>
                            <TabStripTab title="쪽지">
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
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    안읽은 쪽지 리스트
                                    <Button
                                      onClick={onMessengerClick}
                                      icon="email"
                                      themeColor={"primary"}
                                    >
                                      전체 쪽지함
                                    </Button>
                                  </ListSubheader>
                                }
                              >
                                {mainDataResult.data.map((item, index) => {
                                  if (item.read_time == null) {
                                    return (
                                      <>
                                        <ListItem
                                          onClick={() =>
                                            onMessage(item.slip_id)
                                          }
                                          style={{ cursor: "pointer" }}
                                        >
                                          <ListItemAvatar>
                                            <MuiAvatar
                                              sx={{ bgcolor: getColor() }}
                                            >
                                              <MessageIcon />
                                            </MuiAvatar>
                                          </ListItemAvatar>
                                          <ListItemText
                                            primary={
                                              <Typography
                                                variant="subtitle1"
                                                style={{
                                                  whiteSpace: "nowrap",
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                }}
                                              >
                                                {item.slip_content}
                                              </Typography>
                                            }
                                            secondary={
                                              <Typography variant="caption">
                                                보낸사람 : {item.sender_name}
                                              </Typography>
                                            }
                                          />
                                        </ListItem>
                                        {index != mainDataResult.total - 1 ? (
                                          <Divider />
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    );
                                  }
                                })}
                              </List>
                            </TabStripTab>
                          </TabStrip>
                        </Popup>
                      </GridContainer>
                    </GridContainerWrap>
                  </>
                )
              ) : (
                ""
              )}
              {prgMenus && (
                <MenuSearchBox>
                  {searchedMenu == "" && (
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
            </div>
            <GnvPanel
              height={`calc(100vh - ${webheight}px)`}
              isBoolean={
                !isMobile &&
                window.location.href.split("/")[2].split(".")[1] == "gsti"
              }
            >
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
                          path.menuId == "fav"
                            ? "star"
                            : path.menuId == "setting"
                            ? "gear"
                            : undefined
                        }
                        className={path.menuId == "fav" ? "fav-menu" : ""}
                      >
                        {paths
                          .filter(
                            (childPath: TPath) =>
                              childPath.menuCategory == "WEB" &&
                              childPath.parentMenuId == path.menuId
                          )
                          .map((childPath: TPath, childIdx: number) => (
                            <PanelBarItem
                              key={childIdx}
                              title={
                                <Tooltip
                                  title={childPath.menuName}
                                  placement="right"
                                >
                                  <>
                                    <span title={childPath.menuName}>
                                      {childPath.menuName}
                                    </span>
                                  </>
                                </Tooltip>
                              }
                              route={
                                path.menuId == "setting"
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
              <ButtonContainer
                flexDirection={"column"}
                style={{
                  marginTop: "10px",
                  gap: "5px",
                  marginBottom:
                    !isMobile &&
                    window.location.href.split("/")[2].split(".")[1] == "gsti"
                      ? "0px"
                      : "70px",
                }}
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
                {!isMobile &&
                window.location.href.split("/")[2].split(".")[1] == "gsti" ? (
                  <>
                    <Divider />
                    <div
                      style={{
                        backgroundColor: "white",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          clear: "both",
                          overflow: "hidden",
                          lineHeight: "1.2",
                          fontSize: "10px",
                          letterSpacing: "0",
                          backgroundColor: "#white",
                          padding: "10px",
                          textAlign: "left",
                        }}
                      >
                        <address
                          style={{
                            fontStyle: "normal",
                            letterSpacing: "-.01em",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <a
                            style={{
                              display: "inline-block",
                              color: "#cfcfcf",
                              cursor: "default",
                            }}
                          >
                            <a style={{ fontWeight: 600 }}>(주)지에스티</a>{" "}
                            <a>| 대표: 오준철</a>
                          </a>
                          <a
                            style={{
                              display: "inline-block",
                              color: "#cfcfcf",
                              cursor: "default",
                            }}
                          >
                            사업자등록번호: 606-86-08105
                          </a>
                        </address>
                        <address
                          style={{
                            fontStyle: "normal",
                            letterSpacing: "-.01em",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <a
                            style={{
                              display: "inline-block",
                              color: "#cfcfcf",
                              cursor: "pointer",
                            }}
                          >
                            전화번호: 070-7017-7373
                          </a>
                          <a
                            style={{
                              display: "inline-block",
                              color: "#cfcfcf",
                              cursor: "default",
                            }}
                          >
                            팩스: 051-831-7372
                          </a>
                          <a
                            style={{
                              display: "inline-block",
                              color: "#cfcfcf",
                              cursor: "pointer",
                            }}
                            target="_top"
                          >
                            Email: accounting@gsti.co.kr
                          </a>
                        </address>
                        <address
                          style={{
                            fontStyle: "normal",
                            letterSpacing: "-.01em",
                          }}
                        >
                          <a
                            style={{
                              display: "inline-block",
                              color: "#cfcfcf",
                              cursor: "pointer",
                            }}
                          >
                            부산본사: 부산 북구 효열로 111, 부산지식산업센터
                            302호 (우) 46508
                          </a>
                        </address>
                      </div>
                      <div
                        style={{
                          height: "20px",
                          width: "100%",
                        }}
                      ></div>
                    </div>
                  </>
                ) : (
                  ""
                )}
              </ButtonContainer>
            </GnvPanel>
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
            <AppName theme={getColor()}>
              {currentTheme == "navy" || companyCode == "2302BA03" ? (
                <Logo
                  size="128px"
                  name={currentTheme}
                  bio={companyCode == "2302BA03" ? true : false}
                />
              ) : (
                <Logo
                  size="32px"
                  name={currentTheme}
                  bio={companyCode == "2302BA03" ? true : false}
                />
              )}
            </AppName>
            <Button
              icon="menu"
              themeColor={"primary"}
              fillMode={"flat"}
              onClick={onMenuBtnClick}
            />
          </TopTitle>
          <PageWrap isMenuOpen={isMobile ? isFilterheightstates : 0}>
            {props.children}
          </PageWrap>
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
        {!isMobile &&
        window.location.href.split("/")[2].split(".")[1] == "gsti" ? (
          <>
            <a>
              <a>© GST Co., Ltd. All rights reserved.</a>
              <p>
                <div>
                  {userName}({userId})
                </div>
                <div>
                  {customerName}({companyCode})
                </div>
                <div>{ip}</div>
              </p>
            </a>
          </>
        ) : (
          <>
            <p>
              <div>
                {userName}({userId})
              </div>
              <div>
                {customerName}({companyCode})
              </div>
              <div>{ip}</div>
            </p>
          </>
        )}
      </Footer>
      {helpWindowVisible && (
        <HelpWindow setVisible={setHelpWindowVisible} modal={true} />
      )}
      {windowVisible && (
        <MessengerWindow
          setVisible={setWindowVisible}
          id={Id}
          reload={() => fetchMainGrid(filters)}
          modal={true}
        />
      )}
    </>
  );
};

export default withRouter(PanelBarNavContainer);
