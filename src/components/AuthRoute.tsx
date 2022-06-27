import { useEffect } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { useAuth } from "../hooks/auth";

function AuthRoute({ component, ...rest }: RouteProps) {
  const { isLoggedIn } = useAuth();
  useEffect(() => {
    console.log("isLoggedIn");
    console.log(isLoggedIn);
    // if (!isLoggedIn) {
    //   alert("로그인 후 이용해주세요.");
    // }
  }, [isLoggedIn]);
  return (
    <>
      <Route {...rest} component={component} />
      {!isLoggedIn && <Redirect to="/Login" />}
    </>
  );
}

export default AuthRoute;
