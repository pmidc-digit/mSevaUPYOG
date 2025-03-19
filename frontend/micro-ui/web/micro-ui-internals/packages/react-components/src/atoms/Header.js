import React from "react";

const Header = (props) => {
  return <header className="h1" style={props.styles ? {...props.styles, fontSize:"32px", fontFamily:"Noto Sans,sans-serif"} : {fontSize : "32px", fontFamily:"Noto Sans,sans-serif"}}>{props.children}</header>;
};

export default Header;
