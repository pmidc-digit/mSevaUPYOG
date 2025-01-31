import React from "react";
import PropTypes from "prop-types";

const CardHeader = (props) => {
  return (
    <div className="card-header" style={props.styles ? {...props.styles, marginBottom:"30px"} : {marginBottom:"30px"}}>
      {props.children}
      {props.divider && <hr style={{ border: "1px solid #bbb", marginTop: "10px" }} />}
    </div>
  );
};

CardHeader.propTypes = {
  styles: PropTypes.object,
  divider: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

CardHeader.defaultProps = {
  styles: {},
  divider: false,
};

export default CardHeader;
