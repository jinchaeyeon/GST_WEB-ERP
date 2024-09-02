import { Redirect, Route, RouteProps } from "react-router-dom";
import { useRecoilState } from "recoil";
import { menusState } from "../store/atoms";
import  secureLocalStorage  from  "react-secure-storage";

function AuthRoute({ component, ...rest }: RouteProps) {
  const token = secureLocalStorage.getItem("accessToken");
  const [menus, setMenus] = useRecoilState(menusState);

  const isLoggedIn = !!token;

  function error() {
    const datas = window.location.href.split("?")[0];
    const link = datas.split("/")[3].toUpperCase();

    //하단 링크 무조건 대문자로 표기
    if (link == "" || link == "HOME") {
      return false;
    } else {
      let valid = true;
      if (menus != null && menus != undefined) {
        menus.map((item: any) => {
          if (item.formId != "" && item.formId.toUpperCase() == link) {
            valid = false;
          }
        });
      }
      if (valid != true) {
        return false;
      } else {
        return true;
      }
    }
  }
  return (
    <>
      {isLoggedIn && <Route {...rest} component={component} />}
      {!isLoggedIn && <Redirect to="/" />}
      {isLoggedIn && error() && <Redirect to="/Error" />}
    </>
  );
}

export default AuthRoute;
