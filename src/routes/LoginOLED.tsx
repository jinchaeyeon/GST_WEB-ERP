import { Button } from "@progress/kendo-react-buttons";
import { Field, Form, FormElement } from "@progress/kendo-react-form";
import { useCallback, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import {
  ButtonContainer,
  LoginAppName,
  LoginBox,
  LoginImg,
} from "../CommonStyled";
import { FormCheckBox2, FormInput } from "../components/Editors";
import { useApi } from "../hooks/api";
import {
  accessTokenState,
  loginResultState,
  passwordExpirationInfoState,
} from "../store/atoms";
import  secureLocalStorage  from  "react-secure-storage";
import { resetLocalStorage } from "../components/CommonFunction";
import { DEFAULT_LANG_CODE } from "../components/CommonString";
import Loader from "../components/Loader";
import Loading from "../components/Loading";
import FindIDPWWindow from "../components/Windows/CommonWindows/FindIDPWWindow";
import SignUpWindow from "../components/Windows/CommonWindows/SignUpWindow";
import { isLoading } from "../store/atoms";

interface IFormData {
  langCode: string;
  userId: string;
  password: string;
}

const Login: React.FC = () => {
  const processApi = useApi();
  const location = useLocation();
  const history = useHistory();
  const setLoginResult = useSetRecoilState(loginResultState);
  const setPwExpInfo = useSetRecoilState(passwordExpirationInfoState);
  const setLoading = useSetRecoilState(isLoading);
  const setAccessToken = useSetRecoilState(accessTokenState);
  const accessToken = secureLocalStorage.getItem("accessToken");
  const [ifShowCompanyList, setIfShowCompanyList] = useState(false);
  const [isLoaded, setIsLoaded] = useState(
    new URLSearchParams(location.search).has("cust")
      ? true
      : accessToken
      ? false
      : true
  );
  const [information, setInformation] = useState({
    companyCode: new URLSearchParams(location.search).has("cust")
      ? (new URLSearchParams(location.search).get("cust") as string)
      : "",
    langCode: "ko-KR",
    userId: secureLocalStorage.getItem("userId")
      ? secureLocalStorage.getItem("userId")
      : "",
    password: "",
    chk: "Y",
  });

  useEffect(() => {
    if (new URLSearchParams(location.search).has("cust")) {
      resetLocalStorage();
      history.replace({}, "/");
    } else if (accessToken) {
      window.location.href = "/Home";
    }
  }, []);

  const [idpwWindowVisible, setIdpwWindowVisible] = useState(false);
  const [signupWindowVisible, setSignUpWindowVisible] = useState(false);

  const handleSubmit = (data: { [name: string]: any }) => {
    processLogin(data);
  };

  const processLogin = useCallback(
    async (formData: { [name: string]: any }) => {
      try {
        setLoading(true);
        const companyCodes = "CTP-OLED";

        let para: IFormData = Object.assign(
          {},
          {
            langCode: formData.langCode,
            companyCode: companyCodes,
            userId: formData.userId,
            password: formData.password,
          }
        );

        // const md5 = require("md5");
        // para.password = sha256(md5(para.password));
        // const response = await processApi<any>(
        //   para.companyCode == "2207C612" ? "login-old" : "login",
        //   para
        // );

        const response = await processApi<any>("login", para);

        const {
          token,
          refreshToken,
          userId,
          userName,
          role,
          companyCode,
          serviceName,
          customerName,
          loginKey,
          passwordExpirationInfo,
          webTitle,
          homeMenuWeb,
          profileImage,
          userConfig,
          serviceCategory,
          defaultCulture,
          custcd,
          custnm,
        } = response;
        if (formData.chk == "Y") {
          secureLocalStorage.setItem("userId", userId);
        } else {
          if (secureLocalStorage.getItem("userId")) {
            secureLocalStorage.removeItem("userId");
          }
        }
        secureLocalStorage.setItem("accessToken", token);
        secureLocalStorage.setItem("refreshToken", refreshToken);
        // AccessToken : Recoil 저장 / RefreshToken(만료기한 짧음) : Cash 저장
        // setAccessToken(token);
        // const expires = new Date();
        // expires.setMinutes(expires.getMinutes() + 60);
        // cookie.save("refreshToken", refreshToken, {
        //   path: "/",
        //   expires,
        //   // secure: true,
        //   // httpOnly: true,
        // });

        setLoginResult({
          langCode: formData.langCode
            ? formData.langCode.code
            : DEFAULT_LANG_CODE.code,
          userId,
          userName,
          role,
          companyCode,
          serviceName,
          customerName,
          loginKey,
          webTitle,
          homeMenuWeb,
          profileImage,
          dptnm: userConfig.Rows[6].value,
          serviceCategory,
          defaultCulture,
          dptcd: userConfig == undefined ? "" : userConfig.Rows[5].value,
          position: userConfig == undefined ? "" : userConfig.Rows[4].value,
          custcd: "",
          custnm: "",
        });

        setPwExpInfo(passwordExpirationInfo);

        history.replace("/Home");

        setLoading(false);
      } catch (e: any) {
        console.log("login error", e);
        setLoading(false);
        alert(e.message);
      }
    },
    []
  );

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <div style={{ backgroundColor: "#f1a539", height: "100vh" }}>
      <LoginBox theme={"#f1a539"}>
        <Form
          initialValues={information}
          onSubmit={handleSubmit}
          render={(formRenderProps) => (
            <FormElement>
              <fieldset className={"k-form-fieldset"}>
                <Field name={"userId"} label={"ID"} component={FormInput} />
                <Field
                  name={"password"}
                  label={"Password"}
                  type={"password"}
                  component={FormInput}
                />
                <Field
                  name={"chk"}
                  label={"아이디 저장"}
                  component={FormCheckBox2}
                />
              </fieldset>
              <Button
                className="login-btn"
                themeColor={"primary"}
                size="large"
                type="submit"
                onClick={() => formRenderProps.onSubmit}
              >
                Login
              </Button>
              <ButtonContainer>
                <Button
                  fillMode="flat"
                  themeColor={"dark"}
                  size="small"
                  type="button"
                  onClick={() => setIdpwWindowVisible(true)}
                >
                  아이디/비밀번호 찾기
                </Button>
                <Button
                  fillMode="flat"
                  themeColor={"dark"}
                  size="small"
                  type="button"
                  onClick={() => setSignUpWindowVisible(true)}
                >
                  회원가입
                </Button>
              </ButtonContainer>
            </FormElement>
          )}
        ></Form>
        <Loading />
      </LoginBox>
      <LoginImg>
        <LoginAppName></LoginAppName>
      </LoginImg>
      {idpwWindowVisible && (
        <FindIDPWWindow setVisible={setIdpwWindowVisible} modal={true} />
      )}
      {signupWindowVisible && (
        <SignUpWindow setVisible={setSignUpWindowVisible} modal={true} />
      )}
    </div>
  );
};
export default Login;
