import { property } from 'lodash';
import React, { useState } from 'react'
import { useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
const AssessmentHistory = ({ assessmentData,applicationData }) => {
    const history = useHistory();
    const {t} = useTranslation()
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    
function formatAssessmentDate(timestamp) {
  const date = new Date(timestamp);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
}

    return (
        <div className="accordion" style={{
            width: "100%",

            margin: "auto",
            fontFamily: "Roboto, sans-serif",
            border: "1px solid #ccc",
            borderRadius: "4px",
            marginBottom:'10px'
        }}>
            <div className="accordion-header"
                style={{

                    backgroundColor: "#f0f0f0",
                    padding: "15px",
                    cursor: "pointer"

                }}
                onClick={toggleAccordion}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: 'center'
                }}>
                    <h3 style={{ color: '#0d43a7', fontFamily: 'Noto Sans,sans-serif', fontSize: '24px', fontWeight: '500' }}>Assessment History</h3>
                    <span style={{ fontSize: '1.2em' }}>{isOpen ? "<" : ">"}</span>
                </div>
            </div>
            {isOpen && (
                <div className="accordion-body" style={{ padding: " 15px", backgroundColor: "#fff" }}>
                       {assessmentData.length===0 ? (
                <div style={{color:'red', fontSize:'16px'}}>No Assessments found</div>
             ):
                    assessmentData.map((assessment, index) => (
                        <div key={index} className="assessment-item" style={{ marginBottom: "15px" }}>
                            <div className="assessment-row" style={{

                                display: "flex",
                                gap: "100px",
                                marginBottom: "8px",
                               

                            }}>
                                <span style={{ fontWeight: "bold", minWidth: '60px', color:'black' }}>Assessment Date</span>
                                <span style={{ flex: '1', color:'black' }}>{formatAssessmentDate(assessment.assessmentDate)}</span>
                            </div>

                             <div className="assessment-row" style={{

                                display: "flex",
                                gap: "100px",
                                marginBottom: "8px",
                                 color:'black'

                            }}>
                                <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color:'black' }}>Assessment Year</span>
                                <span className='value' style={{ flex: '1', color:'black' }}>{assessment.financialYear}</span>
                            </div>

                             <div className="assessment-row with-buttons" style={{

                                display: "flex",
                              //  gap: "100px",
                                marginBottom: "8px",
                                
                               justifyContent: "space-between",
                               alignItems: "center",
             


                            }}>
                                <div style={{display:'flex',gap:'75px'}}>
                                <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color:'black' }}>Assessment Number</span>
                                <span className='value' style={{ flex: '1', color:'black' }}>{assessment.assessmentNumber}</span>
                                </div>
                           
                            {/* <p><strong>Date:</strong> {assessment.assessmentDate}</p>
                            <p><strong>Year:</strong> {assessment.financialYear}</p>
                            <p><strong>Number:</strong> {assessment.assessmentNumber}</p> */}
                            {/* <button onClick={() => alert(`Re-assessing ${assessment.assessmentNumber}`)}>Re-assess</button>
                            <button onClick={() => alert(`Cancelled ${assessment.assessmentNumber}`)}>Cancel</button> */}
                            
<div className="button-group" style={{display:'flex',gap:'10px'}}>
          <button style={{display:"flex",borderRadius:'8px',backgroundColor:'#2947a3',padding:'10px',color:'white'}} onClick={() => { history.push({pathname:`/digit-ui/citizen/pt/property/assessment-details/${assessment.assessmentNumber}`,state:{Assessment:{channel:applicationData.channel,financialYear:assessment.financialYear,propertyId:assessment.propertyId,source:applicationData.source},submitLabel:t("PT_REASSESS_PROPERTY_BUTTON"),reAssess:true}})}}>Re-assess</button>
          <button style={{display:"flex",borderRadius:'8px',border:'1px solid red',padding:'10px'}}onClick={() => alert(`You are not allowed to perform this operation!!}`)}>Cancel</button>
        </div>
</div>
                          {index!==(assessmentData.length - 1) &&  <hr />}
                        </div>
                    ))
                }
                </div>
              
            )}
        </div>
    );

}

export default AssessmentHistory