import React, { useState } from "react";
import { Card } from "primereact/card";
import { CardContent, CardHeader, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import PaletteIcon from "@mui/icons-material/Palette";
import Grid from "@mui/material/Grid";
import DDGDColorWindow from "../Windows/CommonWindows/DDGDColorWindow";
const CardBox = (props) => {
  const [colors, setColors] = useState(props.backgroundColor);
  const [colorWindowVisible, setColorWindowVisible] = useState(false);

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
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: "TheJamsil5Bold",
          }}
          title={
            <>
              <Typography
                style={{
                  color: "black",
                  fontSize: "28px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "TheJamsil5Bold",
                }}
              >
                <img
                  src={`${process.env.PUBLIC_URL}/Born.png`}
                  alt=""
                  width={"20px"}
                  height={"20px"}
                  style={{ marginRight: "2px", marginBottom: "2px" }}
                />
                {props.name}
                <Typography
                  style={{
                    color: "#8f918d",
                    fontSize: "15px",
                    fontWeight: 500,
                    marginLeft: "5px",
                    fontFamily: "TheJamsil5Bold",
                  }}
                >
                  {props.name}
                </Typography>
              </Typography>
            </>
          }
          subheader={
            <Typography
              style={{
                color: "#8f918d",
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "TheJamsil5Bold",
              }}
            >
              이용기간: {props.date}
            </Typography>
          }
        />
        <CardContent style={{ display: "flex" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
              <Typography
                style={{
                  color: "#8f918d",
                  fontSize: "19px",
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
                    fontSize: "23px",
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
                  fontSize: "20px",
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
                    fontSize: "23px",
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
          setData={(code) => {setColors(code); props.propFunction(code);}}
          para={colors}
        />
      )}
    </>
  );
};

export default CardBox;
