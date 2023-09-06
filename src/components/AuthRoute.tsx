import { Route, Redirect, RouteProps } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "../store/atoms";
// import { useRecoilState } from "recoil";
// import { tokenState } from "../store/atoms";

function AuthRoute({ component, ...rest }: RouteProps) {
  const token = localStorage.getItem("accessToken");
  // const token = useRecoilValue(accessTokenState);
  const isLoggedIn = !!token;
  function error() {
    const datas = window.location.href.split("?")[0];
    const link = datas.split("/")[3];
    if (
      link == "" ||
      link == "Home" ||
      link == "AC_A0000W" ||
      link == "BA_A0020W" ||
      link == "BA_A0040W" ||
      link == "BA_A0041W" ||
      link == "BA_A0050W" ||
      link == "BA_A0070W" ||
      link == "BA_A0080W" ||
      link == "BA_A0100W" ||
      link == "BA_B0080W" ||
      link == "CM_B8100W" ||
      link == "SY_A0125W" ||
      link == "SY_A0500W" ||
      link == "MA_A0010W" ||
      link == "MA_A1000W" ||
      link == "MA_A2000W" ||
      link == "MA_A2300W" ||
      link == "MA_A2400W" ||
      link == "MA_A2500W" ||
      link == "MA_A2700W" ||
      link == "MA_A3000W" ||
      link == "MA_A7000W" ||
      link == "MA_A3300W" ||
      link == "MA_A3400W" ||
      link == "MA_A3500W" ||
      link == "MA_A9001W" ||
      link == "MA_B2000W" ||
      link == "MA_B2100W" ||
      link == "MA_B2500W" ||
      link == "MA_B2700W" ||
      link == "MA_B2800W" ||
      link == "MA_B3000W" ||
      link == "MA_B3100W" ||
      link == "MA_B7000W" ||
      link == "MA_B7200W" ||
      link == "MA_B7201W" ||
      link == "SA_A2000W" ||
      link == "SA_A2010W" ||
      link == "SA_A2300W" ||
      link == "SA_A3000W" ||
      link == "SA_A5000W" ||
      link == "SA_A5001W" ||
      link == "SA_A5010W" ||
      link == "SA_B2200W" ||
      link == "SA_B2211W" ||
      link == "SA_B2221W" ||
      link == "SA_B2410W" ||
      link == "SA_B2410_290W" ||
      link == "SA_B3000W" ||
      link == "SA_B3100W" ||
      link == "SA_B3101W" ||
      link == "PR_A0030W" ||
      link == "PR_A0040W" ||
      link == "PR_A0060W" ||
      link == "PR_A4000W" ||
      link == "PR_A4100W" ||
      link == "PR_A5000W" ||
      link == "PR_A1100W" ||
      link == "PR_A9100W" ||
      link == "PR_B0020W" ||
      link == "PR_B3000W" ||
      link == "PR_A3000W" ||
      link == "PR_A6000W" ||
      link == "PR_A7000W" ||
      link == "PR_A9000W" ||
      link == "QC_A0060W" ||
      link == "QC_A0120W" ||
      link == "QC_A2000W" ||
      link == "QC_A2500W" ||
      link == "QC_A3000W" ||
      link == "QC_A6000W" ||
      link == "QC_B0200W" ||
      link == "QC_B0300W" ||
      link == "QC_B0040W" ||
      link == "SY_A0120W" ||
      link == "SY_A0110W" ||
      link == "SY_A0010W" ||
      link == "SY_A0012W" ||
      link == "SY_A0013W" ||
      link == "SY_A0011W" ||
      link == "SY_A0100W" ||
      link == "SY_A0025W" ||
      link == "CM_A0000W" ||
      link == "CM_A1000W" ||
      link == "CM_A1600W" ||
      link == "CM_A1710W" ||
      link == "CM_A2000W" ||
      link == "CM_A3000W" ||
      link == "CM_A4100W" ||
      link == "CM_A8000W" ||
      link == "CM_A8210W" ||
      link == "CM_A8250W" ||
      link == "CM_B1000W" ||
      link == "CM_B1101W" ||
      link == "EA_A1000W" ||
      link == "EA_A2000W" ||
      link == "CT_A0111W" ||
      link == "HU_A1000W" ||
      link == "HU_A2070W" ||
      link == "HU_A2100W" ||
      link == "HU_A3020W" ||
      link == "HU_A4100W" ||
      link == "HU_A5020W" ||
      link == "HU_B1020W" ||
      link == "HU_B2100W" ||
      link == "HU_B3140W" ||
      link == "HU_B3160W" ||
      link == "HU_B4001W" ||
      link == "HU_B4000W" ||
      link == "AC_A0020W" ||
      link == "AC_A0030W" ||
      link == "AC_A0070W" ||
      link == "AC_A1000W" ||
      link == "AC_B1100W" ||
      link == "AC_B1280W" ||
      link == "AC_B1300W" ||
      link == "AC_B5000W" ||
      link == "AC_B5080W" ||
      link == "AC_B6060W" ||
      link == "AC_B8030W" ||
      link == "TO_B0011W" ||
      link == "CHAT_A0001W" ||
      link == "CHAT_A0002W" ||
      link == "CHAT_TEST_TRAVEL_BOT" ||
      link == "WORD_EDITOR" ||
      link == "GANTT" ||
      link == "SA_B3600W" ||
      link == "PR_B1103W" ||
      link == "QC_B0100W" ||
      link == "PR_B1104W" ||
      link == "BA_A0020W_603" ||
      link == "Error"
    ) {
      return false;
    } else {
      return true;
    }
  }
  return (
    <>
      <Route {...rest} component={component} />
      {!isLoggedIn && <Redirect to="/" />}
      {isLoggedIn && error() && <Redirect to="/Error" />}
    </>
  );
}

export default AuthRoute;
