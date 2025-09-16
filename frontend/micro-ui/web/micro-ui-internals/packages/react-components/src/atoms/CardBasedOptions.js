import React from "react";
const CardBasedOptionsMainChildOption = {
    display: 'flex',
    flexDirection: 'column',
    margin: '3rem',
    background: '#8773e4ff',
    borderRadius: '8px',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign : "center"
}
const cardHeader = {
  textAlign: "center",
  textTransform: "uppercase",
  paddingBottom: "5px"
}
const Option = ({ name, Icon, onClick, className }) => {
  return (
    // <div className={className || `CardBasedOptionsMainChildOption`} onClick={onClick}>
    // <div style={CardBasedOptionsMainChildOption} onClick={onClick}>
    //   <div className="ChildOptionImageWrapper">{Icon}</div>
    //   <p className="ChildOptionName">{name}</p>
    // </div>

    <div class="cardService wallet" onClick={onClick}>
       <div class="overlayService"></div>
        <div class="circleService">
           {Icon}
        </div>
      <p>{name}</p>
    </div>
  );
};

const CardBasedOptions = ({ header, sideOption, options, styles = {}, style={} }) => {
  return (
    <div className="" style={{width:"100%"}}>
       {/* <div className="employeeCustomCard" style={{ width: "100%", height: "80%", position: "relative",display:"flex",fontSize:"1.2rem",fontWeight:"700" }}> */}
            {/* <h2 style={{width:"70%",padding:"20px",height:"fit-content",color:"white"}}>{header}</h2> */}
            {/* <p onClick={sideOption.onClick}></p> */}
            {/* <button type="button" class="inboxButton" onClick={sideOption.onClick}>
            {sideOption.name}
                      </button> */}
            {/* <div className="employee-card-banner"> */}
          {/* <div className="body" style={{ margin: "0px", padding: "0px",height:"100%" }}> */}
          <div className="card-header">
              <h1>{header}</h1>
              <p onClick={sideOption.onClick}></p>
               <button type="button" class="inboxButton" onClick={sideOption.onClick}>
            {sideOption.name}
                      </button>
          </div>
          <div className="mainContent citizenAllServiceGrid" style={{display:"flex", flexWrap : "wrap", borderRadius : '8px', marginTop: "1rem"}}>
            
            {options.map( (props, index) => 
                <Option key={index} {...props} />
            )}
        </div>
          {/* </div> */}

        {/* </div> */}
        {/* </div> */}
    </div>
  );
};

export default CardBasedOptions;
