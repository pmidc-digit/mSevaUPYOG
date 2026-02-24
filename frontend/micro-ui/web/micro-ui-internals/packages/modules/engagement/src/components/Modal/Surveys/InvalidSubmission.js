import React from 'react'

const InvalidSubmission = () => {
  return (
    <div className="create-survey-page" style={{ background: "white", display: "block", padding: "15px" }}>
    <h3 style={{color:'red', fontSize:'20px'}}>This survey is already submitted.Cannot be reSubmitted </h3>
    <h4 style={{fontSize:'16px'}}>Click on below button to Go Back</h4>
    <button onClick={()=>history.push("/digit-ui/employee/engagement/surveys/active-open-surveys")}
     style={{padding: "10px 20px",
     border: "none",
     borderRadius: "4px",
     backgroundColor: "#007bff",
     color: "white",
     marginTop:'10px'
     //cursor: "pointer"
    }}
      >Go Back</button>
  </div>
  )
}

export default InvalidSubmission