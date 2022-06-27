import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { tokenState, userState } from "../store/atoms";

export const useAuth = () => {
  const [token, setToken] = useRecoilState(tokenState);
  const [user] = useRecoilState(userState);
  const latestUser = useRef<any>();

  //console.log('useAuth', user)
  useEffect(() => {
    console.log("user!!");
    console.log(user);
    latestUser.current = user;
    console.log("latestUser", latestUser.current);
  }, [user]);

  //return { isLoggedIn: !!latestUser.current, user: latestUser.current };
  return { isLoggedIn: !!token, user: user };
};
