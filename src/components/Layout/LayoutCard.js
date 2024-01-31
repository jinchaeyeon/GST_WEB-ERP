import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { dateformat7 } from "../CommonFunction";
import { useState, useEffect } from "react";

const LayoutCard = (props) => {
  const [imgBase64, setImgBase64] = useState(props.props.preview_image);

  return (
    <>
      <Card onClick={(e) => (props.Click == undefined ? "" : props.Click(e))}>
        <CardActionArea>
          {imgBase64 == "" || imgBase64 == undefined || imgBase64 == null ? (
            <div style={{ height: "140px" }}></div>
          ) : (
            <CardMedia
              component="img"
              height="140"
              image={imgBase64}
              alt="layout"
            />
          )}
          <CardContent style={{backgroundColor: "#f0f5fa"}}>
            <Typography gutterBottom variant="subtitle1" component="div" style={{fontWeight: 600}}>
              {props.props.layout_name}
            </Typography>
            <Typography variant="caption" style={{fontWeight: 400, color: "#b0adac"}}>
              {props.props.last_update_time == null
                ? "--"
                : dateformat7(props.props.last_update_time)}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </>
  );
};

export default LayoutCard;
