import { Modal } from '@mseva/digit-ui-react-components';
import React, { useState } from 'react'
import { useHistory } from "react-router-dom";

const Close = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
);

const CloseBtn = (props) => (
    <div className="icon-bg-secondary" onClick={props.onClick}>
        <Close />
    </div>
);

const ApplicationHistory = ({ applicationData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const PropertyApplicationDetails = Digit?.ComponentRegistryService?.getComponent("PropertyApplicationDetails");
      const history = useHistory();
    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };
    console.log("applicationData",applicationData)
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
                            gap: "140px",
                            marginBottom: "8px",
                            color: 'black'

                        }}>
                            <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Mobile Number </span>
                            <span className='value' style={{ flex: '1', color: 'black' }}>{applicationData.owners[0]?.mobileNumber}</span>
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
                            <span
                                onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
                                style={{color:'#2947a3',display:'inline',border:'1px solid',padding:'8px',borderRadius:'8px',cursor:'pointer'}}>
                            {"View Detail"}
                            </span>
                        </div>
                    </div>

                </div>
            )}
            {showPreview && PropertyApplicationDetails && (
                <Modal
                    headerBarMain={<h1 className="heading-m">{"Application History"}</h1>}
                    headerBarEnd={<CloseBtn onClick={() => setShowPreview(false)} />}
                    hideSubmit={true}
                    popupStyles={{ width: "75%", zIndex: 100001 }}
                    popupModuleMianStyles={{ maxHeight: "80vh", overflowY: "auto" }}
                >
                    <PropertyApplicationDetails
                        applicationNumber={applicationData.acknowldgementNumber}
                        propertyId={applicationData.propertyId}
                    />
                </Modal>
            )}
        </div>
    )
}

export default ApplicationHistory