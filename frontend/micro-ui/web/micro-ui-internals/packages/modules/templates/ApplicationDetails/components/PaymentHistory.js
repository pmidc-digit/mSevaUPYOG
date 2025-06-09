import React, { useState } from 'react'

const PaymentHistory = ({ payments }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };
    console.log("payemnts", payments)
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
            marginBottom: '10px'
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
                    <h3 style={{ color: '#0d43a7', fontFamily: 'Noto Sans,sans-serif', fontSize: '24px', fontWeight: '500' }}>Payment History</h3>
                    <span style={{ fontSize: '1.2em' }}>{isOpen ? "<" : ">"}</span>
                </div>
            </div>
            {isOpen && (
                <div className="accordion-body" style={{ padding: " 15px", backgroundColor: "#fff" }}>
                    {payments?.length === 0 && (
                        <div style={{ color: 'red', fontSize: '16px' }}>No Payemnts found</div>
                    )}
                    {payments?.length > 0 && (
                        payments.map((payment, index) => (
                            <div key={index} className="assessment-item" style={{ marginBottom: "15px" }}>
                                <div className="assessment-row" style={{

                                    display: "flex",
                                    gap: "100px",
                                    marginBottom: "8px",


                                }}>
                                    <span style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Receipt No</span>
                                    <span style={{ flex: '1', color: 'black' }}>{payment?.paymentDetails[0]?.receiptNumber}</span>
                                </div>

                                <div className="assessment-row" style={{

                                    display: "flex",
                                    gap: "85px",
                                    marginBottom: "8px",
                                    color: 'black'

                                }}>
                                    <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Amount Paid</span>
                                    <span className='value' style={{ flex: '1', color: 'black' }}>{payment?.paymentDetails[0]?.totalAmountPaid}</span>
                                </div>



                                <div className="assessment-row" style={{

                                    display: "flex",
                                    gap: "65px",
                                    marginBottom: "8px",


                                }}>
                                    <span style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Payment Status</span>
                                    <span style={{ flex: '1', color: 'black' }}>{payment?.paymentStatus}</span>
                                </div>

                                <div className="assessment-row" style={{

                                    display: "flex",
                                    gap: "78px",
                                    marginBottom: "8px",
                                    color: 'black'

                                }}>
                                    <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Payment Date</span>
                                    <span className='value' style={{ flex: '1', color: 'black' }}>{formatDate(payment?.transactionDate)}</span>
                                </div>


                                <div className="assessment-row" style={{

                                    display: "flex",
                                    gap: "120px",
                                    marginBottom: "8px",


                                }}>
                                    <span style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Bill No.</span>
                                    <span style={{ flex: '1', color: 'black' }}>{payment?.paymentDetails[0]?.bill?.billNumber}</span>
                                </div>


 <div className="assessment-row with-buttons" style={{

                                display: "flex",
                              //  gap: "100px",
                                marginBottom: "8px",
                                
                               justifyContent: "space-between",
                               alignItems: "center",
             


                            }}>
                                                                <div className="assessment-row" style={{

                                    display: "flex",
                                    gap: "105px",
                                    marginBottom: "8px",
                                    color: 'black'

                                }}>
                                    <span className="label" style={{ fontWeight: "bold", minWidth: '60px', color: 'black' }}>Bill Period</span>
                                    <span className='value' style={{ flex: '1', color: 'black' }}>{`${formatDate(payment?.paymentDetails[0]?.bill?.billDetails[0]?.fromPeriod)} to ${formatDate(payment?.paymentDetails[0]?.bill?.billDetails[0]?.toPeriod)}`}</span>
                                </div>
                             <div className="button-group" style={{display:'flex',gap:'10px'}}>
          <button style={{display:"flex",borderRadius:'8px',backgroundColor:'#2947a3',padding:'10px',color:'white'}} >Download Receipt</button>
         
        </div>
</div>

                                {index !== (payments.length - 1) && <hr />}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

    )
}

export default PaymentHistory