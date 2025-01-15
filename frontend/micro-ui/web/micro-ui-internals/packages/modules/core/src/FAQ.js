import React, { useState } from "react";
// import "../../../css/src/pages/employee/faq.scss"
const FAQ =()=>{
  const [isActive, setIsActive] = useState(false);
  const [isActive1, setIsActive1] = useState(false);
  const [isActive2, setIsActive2] = useState(false);
  const [isActive3, setIsActive3] = useState(false);
  const [isActive4, setIsActive4] = useState(false);
return(

//   <div style={{  display: "flex",
//     flexDirection: "column",
//     gap: "1px",
//     alignItems: "flex-start",
//     justifyContent: "flex-start",
//     position: "relative"}}
//     >
//     <div style={{ 
//       display: "flex",
//       flexDirection: "column",
//       gap: "55px",
//       alignItems: "flex-start",
//       justifyContent: "flex-start",
//       alignSelf: "stretch",
//       flexShrink: 0,
//       position: "relative"}}>
//       <div style={{ 
//         background: "#ffffff",
//   padding: "50px 0px 50px 0px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "0px",
//   alignItems: "center",
//   justifyContent: "center",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"}}>
 
//  <div style={{
//   display: "flex",
//   flexDirection: "column",
//   gap: "32px",
//   alignItems: "center",
//   justifyContent: "flex-start",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"
//  }}>
// <div style={{
//   background:" #ffffff",
//   padding: "16px 0px 64px 0px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "0px",
//   alignItems: "center",
//   justifyContent:" center",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"
// }}>
// <div style={{
//   display: "flex",
//   flexDirection: "column",
//   gap: "0px",
//   alignItems:"center",
//   justifyContent:"flex-start",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position:"relative"
// }}>
//   <div style={{
//      display: "flex",
//      flexDirection: "column",
//      gap: "8px",
//      alignItems: "center",
//      justifyContent: "center",
//      flexShrink: 0,
//      width: "1216px",
//      position: "relative"
//   }}>
// <div style={{ 
//   display: "flex",
//   flexDirection: "column",
//   gap: "36px",
//   alignItems: "center",
//   justifyContent: "center",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"
//   }}>
//   <div style={{
//      display: "flex",
//      flexDirection: "column",
//      gap: "12px",
//      alignItems: "center",
//      justifyContent: "center",
//      alignSelf: "stretch",
//      flexShrink: 0,
//      position: "relative"
//   }}>
      
//        <div
//         style={{
//          color: "#141c24",
//          textAlign: "left",
//          fontFamily: "Inter-SemiBold", 
//          fontSize: "36px",
//          lineHeight: "44px",
//          fontWeight:600,
//          position: "relative"
//        }}>

//         Frequently Asked Questions 
//        </div>
//        <div style={{
//         color: "#344051",
//         textAlign: "center",
//         fontFamily: "Inter-Regular",
//         fontSize: "18px",
//         lineHeight: "28px",
//         fontWeight: "400",
//         position: "relative",
//         width: "650px"
//        }}>
//                       We tried to answer most common questions, if you have
//                       any additional, please get in touch.{" "}
//                     </div>
//   </div>
// </div>
//   </div>

// </div>
// </div>
//  </div>
//  <div style={{ display: "flex",
//   flexDirection: "column",
//   gap: "40px",
//   alignItems: "center",
//   justifyContent: "flex-start",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"}}>
// <div style={{
//   padding:"0px 164px 0px 164px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "16px",
//   alignItems: "flex-start",
//   justifyContent: "flex-start",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"}}>
//     <div style={{
//        borderRadius: "8px",
//        borderStyle: "solid",
//        borderColor: "#ced2da",
//        borderWidth: "1px",
//        padding: "32px",
//        display: "flex",
//        flexDirection: "row",
//        gap: "0px",
//        alignItems: "center",
//        justifyContent: "flex-start",
//        alignSelf: "stretch",
//        flexShrink: 0,
//        position: "relative"
//     }}>
// <div style={{
//    display: "flex",
//    flexDirection: "row",
//    gap: "16px",
//    alignItems: "center",
//    justifyContent: "flex-start",
//    flex: 1,
//    position: "relative"
// }}>
//   <div style={{
//     color:  "#313033",
//     textAlign: "left",
//     fontFamily: 
      
//       "NotoSans-Medium",
   
//     fontSize: "20px",
//     lineHeight: "24px",
//     fontWeight: 500,
//     position: "relative",
//     flex: 1
//   }}>
//   01. How do I pay my property tax?{" "}
//   </div>

// </div>
//     </div>
// <div style={{ 
//   borderRadius: "8px",
//   borderStyle: "solid",
//   borderColor: "#ced2da",
//   borderWidth: "1px",
//   padding: "32px",
//   display: "flex",
//   flexDirection: "column",
//   gap: "16px",
//   alignItems: "flex-start",
//   justifyContent: "flex-start",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"}}>

// <div style={{ display: "flex",
//   flexDirection: "column",
//   gap: "16px",
//   alignItems: "flex-start",
//   justifyContent: "flex-start",
//   alignSelf: "stretch",
//   flexShrink: 0,
//   position: "relative"}}>
// <div style={{
//    display: "flex",
//    flexDirection: "row",
//    gap: "0px",
//    alignItems: "center",
//    justifyContent: "flex-start",
//    alignSelf: "stretch",
//    flexShrink: 0,
//    position: "relative"
// }}>
// <div style={{
//   color:"#313033",
//   textAlign: "left",
//   fontFamily:"NotoSans-Medium",
//   fontSize: "20px",
//   lineHeight: "24px",
//   fontWeight:  500,
//   position: "relative",
//   display:"flex",
//   justifyContent:'space-between',
//   flex: 1}} onClick={() => setIsActive(!isActive)}>
    
//  <span> 02. How to apply &amp; pay Fire NOC?{""} </span>  <button>{isActive ? '-' : '+'}</button>

// </div>
// </div>
// {isActive &&
// <div style={{
//   color:  "#4e5056",
//   textAlign: "left",
//   fontFamily: 
//     "NotoSans-Regular",
//   fontSize: "16px",
//   lineHeight: "24px",
//   letterSpacing: "0.5px",
//   fontWeight: 400,
//   position: "relative",
//   alignSelf: "stretch"
// }}>
//                  Fire NOC issued by the respective state fire service
//                verifies that a building is resistant or unlikely to observe
//                  any fire related accidents. By meeting certain guidelines
//                  laid down by the fire department, an applicant can obtain
//                  NOC for his residential/ commercial building.{" "}
//                 </div>
// }
// </div>
// </div>
// <div style={{
//    borderRadius: "8px",
//    borderStyle: "solid",
//    borderColor: "#ced2da",
//    borderWidth: "1px",
//    padding: "32px",
//    display: "flex",
//    flexDirection:"row",
//    gap: "0px",
//    alignItems: "center",
//    justifyContent: "flex-start",
//    alignSelf: "stretch",
//    flexShrink: 0,
//    position: "relative"
// }}>
//   {/* content2 */}
// <div style={{
//    display: "flex",
//    flexDirection: "row",
//    gap: "16px",
//    alignItems: "center",
//    justifyContent: "flex-start",
//    flex: 1,
//    position: "relative"

// }}>
// {/* question */}
//   <div style={{ 
//     color:  "#313033",
//   textAlign: "left",
//   fontFamily:
//     "NotoSans-Medium",

//   fontSize: "20px",
//   lineHeight: "24px",
//   fontWeight: 500,
//   position: "relative",
//   flex: 1}}>
//  03. Why should I apply for a Trade License?{" "}
//   </div>
//   </div>
// </div>
//  </div>
// {/* Modal */}
// <div style={{
//    background:  "#A1D5FC",
//    borderRadius: "20px",
//    borderStyle: "solid",
//    borderColor: "#a1d5fc",
//    borderWidth: "1px",
//    padding: "32px",
//    display: "flex",
//    flexDirection: "column",
//    gap: "32px",
//    alignItems: "center",
//    justifyContent: "flex-start",
//    flexShrink: 0,
//    position: "relative"
// }}>
//           <div style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: "12px",
//             alignItems: "center",
//             justifyContent: "flex-start",
//             flexShrink: 0,
//             position: "relative"
//           }}>
//              <div style={{
//               color: "#092e86",
//               textAlign: "center",
//               fontFamily: 
//                 "NotoSans-Medium",
             
//               fontSize:  "24px",
//               lineHeight: "28px",
//               fontWeight: 500,
//               position: "relative"
//              }}>Still have a questions? </div>
//               <div style={{
//                 color:  "#092e86",
//                 textAlign: "center",
//                 fontFamily: "NotoSans-Regular",
//                 fontSize: "16px",
//                 lineHeight: "24px",
//                 letterSpacing: '0.5px',
//                 fontWeight: 400,
//                 position: "relative",
//                 width: "463px"
//               }}>
//                We&#039;re sorry we couldn&#039;t provide you with the
//                information you were looking for. Please contact us and
//                we&#039;ll be happy to help.{" "}
//               </div>
//            </div>
//           <div style={{ 
//             background:  "#092e86",
//   borderRadius: "8px",
//   padding: "10px 20px 10px 20px",
//   display: "flex",
//   flexDirection: "row",
//   gap: "8px",
//   alignItems: "center",
//   justifyContent: "center",
//   flexShrink: 0,
//   position: "relative"}}>
//             {/* <img className="email" src="email0.svg" /> */}
//              <button style={{
//                color: "#ffffff",
//                textAlign: "left",
//                fontFamily: 
//                  "Inter-SemiBold",
                
//                fontSize: "16px",
//                lineHeight: "24px",
//                fontWeight: 600,
//                position: "relative"

//              }}>
              
//               Contact us 
            
//               </button>
//             </div>
//          </div>
// </div>


  
//    </div>
//    </div>
//    </div>
<div className="frame-54925">
<div className="frame-54923">
<div className="sectionNew">
<div className="containerNew">
<div className="section-header-New">
<div className="section2New">
<div className="container2New">
<div className="bodyNew">
<div className="textNew">
<div className="titleNew">Frequently Asked Questions </div>
                    <div className="descriptionNew">
                      We tried to answer most common questions, if you have
                      any additional, please get in touch.{" "}
                    </div>
  </div>
  </div>
  </div>
  </div>
  </div>
</div>
<div className="contentNew">
          <div className="questionsNew">
            <div className="faq-cards-base2">
              <div className="content3">
              <div className="text2">
              <div className="questionNew" onClick={() => setIsActive1(!isActive1)}>
                <span style={{flexGrow:1}}>   01. How do I pay my property tax?{" "}</span>
                <span><button  style={{  
                outline: "none",
  fontSize: "28px" }}>{isActive1 ? '-' : '+'}</button></span>  
              </div>
                </div>
                {isActive1 &&
                <div className="answerNew">
                  Fire NOC issued by the respective state fire service
                  verifies that a building is resistant or unlikely to observe
                  any fire related accidents. By meeting certain guidelines
                  laid down by the fire department, an applicant can obtain
                  NOC for his residential/ commercial building.{" "}
                </div>
                }
                {/* <img className="add-circle" src="add-circle0.svg" /> */}
              </div>
            </div>
            <div className="faq-cards-base2">
              <div className="content3">
                <div className="text2">
                  <div className="questionNew" onClick={() => setIsActive(!isActive)}>
                   <span style={{flexGrow:1}}> 02. How to apply &amp; pay Fire NOC?{" "}</span>
                   <span><button  style={{  
                outline: "none",
  fontSize: "28px" }}>{isActive ? '-' : '+'}</button></span>  
                  </div>
                  {/* <img className="remove-circle" src="remove-circle0.svg" /> */}
                </div>
                {isActive &&
                <div className="answerNew">
                  Fire NOC issued by the respective state fire service
                  verifies that a building is resistant or unlikely to observe
                  any fire related accidents. By meeting certain guidelines
                  laid down by the fire department, an applicant can obtain
                  NOC for his residential/ commercial building.{" "}
                </div>
                }
              </div>
            </div>
            <div className="faq-cards-base2">
              <div className="content3">
              <div className="text2">
              <div className="questionNew" onClick={() => setIsActive2(!isActive2)}>
              <span style={{flexGrow:1}}> 03. How can I apply for water connection?{" "}</span>
              <span><button  style={{  
                outline: "none",
  fontSize: "28px" }}>{isActive2 ? '-' : '+'}</button></span>
                </div>
                </div>
                {isActive2 &&
                <div className="answerNew">
                  Fire NOC issued by the respective state fire service
                  verifies that a building is resistant or unlikely to observe
                  any fire related accidents. By meeting certain guidelines
                  laid down by the fire department, an applicant can obtain
                  NOC for his residential/ commercial building.{" "}
                </div>
                }
                {/* <img className="add-circle2" src="add-circle1.svg" /> */}
              </div>
            </div>
            <div className="faq-cards-base2">
              <div className="content3">
              <div className="text2">
              <div className="questionNew" onClick={() => setIsActive3(!isActive3)}>
              <span style={{flexGrow:1}}> 04. Why should I apply for a Trade License?{" "}</span>
              <span><button style={{  
                outline: "none",
  fontSize: "28px" }}>{isActive3 ? '-' : '+'}</button></span>
                </div>
                </div>
                {isActive3 &&
                <div className="answerNew">
                  Fire NOC issued by the respective state fire service
                  verifies that a building is resistant or unlikely to observe
                  any fire related accidents. By meeting certain guidelines
                  laid down by the fire department, an applicant can obtain
                  NOC for his residential/ commercial building.{" "}
                </div>
                }
                {/* <img className="add-circle3" src="add-circle2.svg" /> */}
              </div>
            </div>
            <div className="faq-cards-base2">
              <div className="content3">
              <div className="text2">
              <div className="questionNew" onClick={() => setIsActive4(!isActive4)}>
              <span style={{flexGrow:1}}>05. Can I apply for a mutation of my registered property?{" "}</span>
              <span><button style={{  
                outline: "none",
  fontSize: "28px" }}>{isActive4 ? '-' : '+'}</button></span>
                </div>
                </div>
                {isActive4 &&
                <div className="answerNew">
                  Fire NOC issued by the respective state fire service
                  verifies that a building is resistant or unlikely to observe
                  any fire related accidents. By meeting certain guidelines
                  laid down by the fire department, an applicant can obtain
                  NOC for his residential/ commercial building.{" "}
                </div>
                }
                {/* <img className="add-circle4" src="add-circle3.svg" /> */}
              </div>
            </div>
          </div>
          <div className="modalNew">
            <div className="text3">
              <div className="title2">Still have a questions? </div>
              <div className="description2">
                We&#039;re sorry we couldn&#039;t provide you with the
                information you were looking for. Please contact us and
                we&#039;ll be happy to help.{" "}
              </div>
            </div>
            <div className="buttonNew">
              {/* <img className="email" src="email0.svg" /> */}
              <div className="contact-us-New"><button>Contact us</button> </div>
            </div>
          </div>
          </div>
</div>
 </div>
 </div>
   

)
}
export default FAQ;