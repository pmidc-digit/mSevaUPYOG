import React from "react";

const Header = (props) => {
  return (
    <header
      style={
        props.styles
          ? { ...props.styles, fontSize: "32px", fontFamily: "Roboto Condensed" }
          : {
              fontSize: "24px",
              fontFamily: "Noto Sans",
              lineHeight: "28px",
              textAlign: "justified",
              textUnderlinePosition: "from-font",
              textDecorationSkipInk: "none",
              color: "#1C1D1F",
            }
      }
    >
      {props.children}
    </header>
  );
};

export default Header;
