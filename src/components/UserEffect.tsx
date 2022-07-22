import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { userState, tokenState, apiState } from "../store/atoms";
import jwt_decode from "jwt-decode";
import { cleanup } from "@testing-library/react";

const UserEffect: React.FC = (): any => {
  const [token, setToken] = useRecoilState(tokenState);
  const [api, setApi] = useRecoilState(apiState);
  const [user, setUser] = useRecoilState(userState);

  function cleanUp() {
    console.log("UserEffect cleanUp");
    setToken(null as any);
    setApi(null as any);
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
