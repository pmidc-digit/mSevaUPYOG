import { LinkLabel } from '@mseva/digit-ui-react-components';
import React, { useState } from 'react'
import { useHistory, useParams,Link } from "react-router-dom";
const ApplicationHistory = ({ applicationData }) => {
    const [isOpen, setIsOpen] = useState(false);
      const history = useHistory();
    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };
 //   const { id: applicationNumber } = useParams();
    function formatDate(timestamp) {
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
                    <h3 style={{ color: '#0d43a7', fontFamily: 'Noto Sans,sans-serif', fontSize: '24px', fontWeight: '500' }}>Application History</h3>
                    <span style={{ fontSize: '1.2em' }}>{isOpen ? "<" : ">"}</span>
                </div>
            </div>
            {isOpen && (
                <div className="accordion-body" style={{ padding: " 15px", backgroundColor: "#fff" }}>

                    <div className="assessment-item" style={{ marginBottom: "15px" }}>
                        <div className="assessment-row" style={{

                            display: "flex",
                            gap: "100px",
                            marginBottom: "8px",


                        }}>
                            <span style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Application Number</span>
                            <span style={{ flex: '1', color: 'black' }}>{applicationData.acknowldgementNumber}</span>
                        </div>

                        <div className="assessment-row" style={{

                            display: "flex",
                            gap: "132px",
                            marginBottom: "8px",
                            color: 'black'

                        }}>
                            <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Property ID No.</span>
                            <span className='value' style={{ flex: '1', color: 'black' }}>{applicationData.propertyId}</span>
                        </div>

                        <div className="assessment-row" style={{

                            display: "flex",
                            gap: "120px",
                            marginBottom: "8px",
                            color: 'black'

                        }}>
                            <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Application Type</span>
                            <span className='value' style={{ flex: '1', color: 'black' }}>{"NEW PROPERTY"}</span>
                        </div>
                        <div className="assessment-row" style={{

                            display: "flex",
                            gap: "140px",
                            marginBottom: "8px",
                            color: 'black'

                        }}>
                            <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Creation Date</span>
                            <span className='value' style={{ flex: '1', color: 'black' }}>{formatDate(applicationData.auditDetails?.createdTime)}</span>
                        </div>
                        <div className="assessment-row" style={{

                            display: "flex",
                            gap: "180px",
                            marginBottom: "8px",
                            color: 'black'

                        }}>
                            <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Status</span>
                            <span className='value' style={{ flex: '1', color: 'black' }}>{applicationData.status}</span>
                        </div>
                        <div>
                            <Link to={{
                                pathname:`/digit-ui/citizen/pt/property/application-preview/${applicationData.acknowldgementNumber}`,state:{propertyId:applicationData.propertyId}
                            }} style={{color:'#2947a3',display:'inline',border:'1px solid',padding:'8px',borderRadius:'8px'}}>
                            {"View History"}
                            </Link>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )
}

export default ApplicationHistory