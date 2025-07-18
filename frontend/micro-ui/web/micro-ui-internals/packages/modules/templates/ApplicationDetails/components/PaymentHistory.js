import React ,{useState}from 'react'

const PaymentHistory = ({payments}) => {
       const [isOpen, setIsOpen] = useState(false);
    
        const toggleAccordion = () => {
            setIsOpen(!isOpen);
        };
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
                    <h3 style={{ color: '#0d43a7', fontFamily: 'Noto Sans,sans-serif', fontSize: '24px', fontWeight: '500' }}>Payment History</h3>
                    <span style={{ fontSize: '1.2em' }}>{isOpen ? "<" : ">"}</span>
                </div>
            </div>
            {isOpen && (
                <div className="accordion-body" style={{ padding: " 15px", backgroundColor: "#fff" }}>
             {payments?.length===0 && (
                <div style={{color:'red', fontSize:'16px'}}>No Payemnts found</div>
             )}
          </div>
            )}
          </div>

  )
}

export default PaymentHistory