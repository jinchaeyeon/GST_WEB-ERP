import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { userState, tokenState, menusState } from "../store/atoms";
import jwt_decode from "jwt-decode";
import { cleanup } from "@testing-library/react";

const UserEffect: React.FC = (): any => {
  const [token, setToken] = useRecoilState(tokenState);
  const [menu, setMenu] = useRecoilState(menusState);
  const [user, setUser] = useRecoilState(userState);

  function cleanUp() {
    console.log("UserEffect cleanUp");
    setToken(null as any);
    setMenu(null as any);
    setUser(null as any);
  }
  useEffect(() => {
    return cleanup();
  }, []);

  useEffect(() => {
    try {
      if (token) {
        const decoded: any = jwt_decode(token.token);
        setUser(decoded);
      } else {
        cleanUp();
      }
    } catch (e) {
      console.log(e);
      cleanUp();
    }
  }, [token]);

  return null;
};

export default UserEffect;
