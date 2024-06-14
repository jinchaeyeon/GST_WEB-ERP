import PaletteIcon from "@mui/icons-material/Palette";
import { CardContent, CardHeader, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { Card } from "primereact/card";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useApi } from "../../hooks/api";
import { isMobileState } from "../../store/atoms";
import { UseBizComponent, getBizCom } from "../CommonFunction";
import { COM_CODE_DEFAULT_VALUE } from "../CommonString";
import DDGDColorWindow from "../Windows/DDGD/DDGDColorWindow";
const CardBox = (props) => {
  const [colors, setColors] = useState(props.backgroundColor);
  const [colorWindowVisible, setColorWindowVisible] = useState(false);
  const [bizComponentData, setBizComponentData] = useState(null);
  UseBizComponent(
    "L_BA310",
    //사용여부,
    setBizComponentData
  );
  const [isMobile, setIsMobile] = useRecoilState(isMobileState);
  const [classListData, setClassListData] = useState([COM_CODE_DEFAULT_VALUE]);
  const processApi = useApi();
  useEffect(() => {
    if (bizComponentData !== null) {
      setClassListData(getBizCom(bizComponentData, "L_BA310"));
    }
  }, [bizComponentData]);

  const handleColors = () => {
    setColorWindowVisible(true);
  };

  return (
    <>
      <Card
        style={{
          width: "100%",
          marginRight: "15px",
          borderRadius: "10px",
          backgroundColor: colors,
          cursor: "pointer",
        }}
        onClick={(e) => props.Click(e)}
      >
        <CardHeader
          action={
            <IconButton aria-label="setting">
              <PaletteIcon onClick={handleColors} />
            </IconButton>
          }
          subheaderTypographyProps={{
            color: "#8f918d",
            fontSize: props.fontSize,
            fontWeight: 500,
            fontFamily: "TheJamsil5Bold",
          }}
          title={
            <>
              <Typography
                style={{
                  color: "black",
                  fontSize: isMobile ? "28px" : "1.5vw",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "TheJamsil5Bold",
                }}
              >
                <img
                  src={`/Born.png`}
                  alt=""
                  width={"20px"}
                  height={"20px"}
                  style={{ marginRight: "2px", marginBottom: "2px" }}
                />
                {props.name}
                <Typography
                  style={{
                    color: "#8f918d",
                    fontSize: isMobile ? "15px" : "0.8vw",
                    fontWeight: 500,
                    marginLeft: "5px",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {
                    classListData.find((items) => items.sub_code == props.class)
                      ?.code_name
                  }
                </Typography>
              </Typography>
            </>
          }
          subheader={
            <Typography
              style={{
                color: "#8f918d",
                fontSize: isMobile ? "12px" : "0.6vw",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
                float: "left",
              }}
            >
              이용기간: {props.date} {props.day}
            </Typography>
          }
        />
        <CardContent style={{ display: "flex" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Typography
                style={{
                  color: "#8f918d",
                  fontSize: isMobile ? "19px" : "1vw",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                등원잔여 :
                <Typography
                  style={{
                    color: "#525252",
                    fontSize: isMobile ? "23px" : "1vw",
                    fontWeight: 500,
                    marginLeft: "5px",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {props.attendance}
                </Typography>
                회
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Typography
                style={{
                  color: "#8f918d",
                  fontSize: isMobile ? "19px" : "1vw",
                  fontWeight: 500,
                  fontFamily: "TheJamsil5Bold",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                변경가능 :
                <Typography
                  style={{
                    color: "#525252",
                    fontSize: isMobile ? "23px" : "1vw",
                    fontWeight: 500,
                    marginLeft: "5px",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {props.change}
                </Typography>
                회
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {colorWindowVisible && (
        <DDGDColorWindow
          setVisible={setColorWindowVisible}
          setData={(code) => {
            setColors(code);
            props.propFunction(code);
          }}
          custcd={props.code}
          para={colors}
        />
      )}
    </>
  );
};

export default CardBox;
