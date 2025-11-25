import React ,{useState}from 'react'
const PaymentHistory = ({payments}) => {
       // ACCORDION STATE: Controls expand/collapse of payment history section
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
                <div style={{color:'red', fontSize:'16px'}}>No Payments found</div>
             )}
             {payments?.length > 0 && (
                <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Receipt Number</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Transaction Date</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Amount Paid</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Payment Mode</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Transaction ID</th>
                                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment, index) => (
                                <tr key={payment.id || index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {payment.paymentDetails?.[0]?.receiptNumber || payment.receiptNumber || 'N/A'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {payment.transactionDate ? new Date(payment.transactionDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        ₹{payment.totalAmountPaid || payment.amount || '0'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {payment.paymentMode || payment.instrumentType || 'N/A'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        {payment.transactionNumber || payment.instrumentNumber || 'N/A'}
                                    </td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                        <span style={{ 
                                            color: payment.paymentStatus === 'NEW' || payment.paymentStatus === 'SUCCESSFUL' || payment.paymentStatus === 'DEPOSITED' ? 'green' : 
                                                   payment.paymentStatus === 'FAILED' ? 'red' : 'orange',
                                            fontWeight: 'bold'
                                        }}>
                                            {payment.paymentStatus === "DEPOSITED" ? <p>Deposited</p> : payment.paymentStatus || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        Total Payments: {payments.length}
                    </div>
                </div>
             )}
          </div>
            )}
          </div>

  )
}

export default PaymentHistory