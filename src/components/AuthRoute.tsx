import { Route, Redirect, RouteProps } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../store/atoms";
// import { useRecoilState } from "recoil";
// import { tokenState } from "../store/atoms";

function AuthRoute({ component, ...rest }: RouteProps) {
  const token = localStorage.getItem("accessToken");
  // const token = useRecoilValue(accessTokenState);
  const isLoggedIn = !!token;
  return (
    <>
      <Route {...rest} component={component} />
      {!isLoggedIn && <Redirect to="/" />}
    </>
  );
}

export default AuthRoute;
