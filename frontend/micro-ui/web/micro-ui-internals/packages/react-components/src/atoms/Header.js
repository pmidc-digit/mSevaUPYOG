import React from "react";

const Header = (props) => {
  return  <header style={props.styles ? {...props.styles, fontSize:"32px", fontFamily:"Noto Sans,sans-serif",color:'black'} : {fontSize : "32px", fontFamily:"Noto Sans,sans-serif",color:'black'}}>{props.children}</header>;
};

export default Header; 
