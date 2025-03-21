import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {quickServiceModules} from "../../../constants/quickServiceData"
import { Link } from "react-router-dom";
import {
  BackButton,
  BillsIcon,
  CitizenHomeCard,
  CitizenInfoLabel,
  FSMIcon,
  Loader,
  MCollectIcon,
  OBPSIcon,
  PGRIcon,
  PTIcon,
  TLIcon,
  WSICon,
  PTRIcon,
  Table,
  ArrowRightInbox,
} from "@mseva/digit-ui-react-components";
import { update } from "lodash";
const EmployeeQuickServicesCard = ({ moduleData }) => {
  const { t } = useTranslation();
  // function getModuleCardData(){
  //   switch(moduleCode){
  //     case "":

  //     case "":
  //     default:
  //       return ";
  //   };
  // }

  // const moduleCardData=getModuleCardData();

  console.log("Module Data: ", moduleData);
  //const [moduleData, setModuleData] = useState([])
  // const moduleAccessProps = (code) =>{
  //   console.log("Inside moduleAccessProps",Digit.Utils.ptAccess());
  
  //   switch (code) {
  //     case "PT":
  //       if (Digit.Utils.ptAccess()) {
  //         return true;
  //       } else {
  //         return null;
  //       }
  //     case "WS":
  //       if (Digit.Utils.wsAccess()) {
  //         return true;
  //       } else {
  //         return null;
  //       }
  //     case "FSM":
  //       if (Digit.Utils.fsmAccess()) {
  //         return true;
  //       } else {
  //         return null;
  //       }
  //     case "MCollect":
  //       if (Digit.Utils.mCollectAccess()) {
  //         return true;
  //       } else {
  //         return null;
  //       }
  //     case "PGR":
  //       if (Digit.Utils.pgrAccess()) {
  //         return true;
  //       } else {
  //         return null;
  //       }
  //     case "TL":
  //       if (Digit.Utils.tlAccess()) {
  //         return true;
  //       } else {
  //         return null;
  //       }
  //     // case "OBPS":
  //     //   if (Digit.Utils.obpsAccess()) {
  //     //     return true;
  //     //   } else {
  //     //     return null;
  //     //   }
  //     case "Bills":
  //       if (Digit.Utils.billsAccess()) {
  //         return true;
  //       } else {
  //         return null;
  //       }
  //     // case "PTR":
  //     //   if (Digit.Utils.ptrAccess()) {
  //     //     return true;
  //     //   } else {
  //     //     return null;
  //     //   }
  //     default:
        
     
  //         return null;
        
  //   }
  // }

  const moduleAccessProps = (code) => {
    const accessMap = {
      PT: Digit.Utils.ptAccess,
      WS: Digit.Utils.wsAccess,
      FSM: Digit.Utils.fsmAccess,
      MCollect: Digit.Utils.mCollectAccess,
      PGR: Digit.Utils.pgrAccess,
      TL: Digit.Utils.tlAccess,
      Bills: Digit.Utils.billsAccess,
      // Uncomment and add more cases as needed
      // OBPS: Digit.Utils.obpsAccess,
      // PTR: Digit.Utils.ptrAccess,
    };
   
    // Call the corresponding access function if it exists in the map
    return accessMap[code] && accessMap[code]() ? true : null;
  };

  const Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z" fill="white"></path>
    </svg>
  );
  const updatedModuleData = quickServiceModules.modules.filter((item) => item.moduleCode === moduleData.code);
   //const updatedModuleData = {
    // ...moduleData, ...quickServiceModules
    //  moduleDataForDashboard: {
    //    Icon: <Icon />,
    //    moduleName: moduleData.module,//t("ES_PGR_HEADER_COMPLAINT"),
    //    kpis: [
    //      {
    //        label: t("TOTAL_PGR"),
    //        link: `/digit-ui/employee/pgr/inbox`,
    //      },
    //      {
    //        label: t("TOTAL_NEARING_SLA"),
    //        link: `/digit-ui/employee/pgr/inbox`,
    //      },
    //    ],
    //    links: [
    //      {
    //        label: t("ES_PGR_INBOX"),
    //        link: `/digit-ui/employee/pgr/inbox`,
    //      },
    //      //...propsForCSR,
    //    ],
    //  },
 //  };

  console.log("quickServiceModules.modules", updatedModuleData[0])
 
//   return (
//     {moduleAccessProps && (
//     <div className="employee-dashboard-quick-service-card employee-dashboard-quick-service-card-content" style={{
//           display :"flex", 
//           padding : "0px",
//           borderRadius : "0px 8px 8px 0px"
//         }}
//          // onClick={}
//         >
      
// <Link to={`${updatedModuleData.routes}`}>
//       <div
//         className="" style={{
//             width : "20%",
//             background :  updatedModuleData[0]?.bgColor,
//             display :"flex",
//             alignItems : "center",
//             justifyContent : "center",
//             borderRadius :"8px 0px 0px 8px"

//         }}
//       >
//         <span className="icon-banner-employee" style={{ borderRadius: "5px", boxShadow: "5px 5px 5px 0px #e3e4e3" }}>
//           {
//            // moduleAccessProps()
//             //moduleDataForDashboard?.Icon
//             //React.createElement(updatedModuleData[0]?.icon)
//           }
//         </span>
//       </div>
//     </Link>
//       <div className="employee-dashboard-quick-service-card-module-name" style={{
//            display:"flex",
//            justifyContent : "center",
//            alignItems : "center",
//            fontSize :"24px",
//            fontWeight : "bold",
//            padding : "2rem 2rem"
//       }}>{ 
//              //moduleDataForDashboard.moduleName 
//              updatedModuleData[0]?.moduleCode
//        }</div>
          
//     </div>
//       )}

const iconSelector = (code) => {
  switch (code) {
    case "PT":
      
      return <PTIcon className="fill-path-primary-main" />;
    case "WS":
      return <WSICon className="fill-path-primary-main" />;
    case "FSM":
      return <FSMIcon className="fill-path-primary-main" />;
    case "MCollect":
      return <MCollectIcon className="fill-path-primary-main" />;
    case "PGR":
      return <PGRIcon className="fill-path-primary-main" />;
    case "TL":
      return <TLIcon className="fill-path-primary-main" />;
    case "OBPS":
      return <OBPSIcon className="fill-path-primary-main" />;
    case "Bills":
      return <BillsIcon className="fill-path-primary-main" />;
    case "PTR":
      return <PTRIcon className="fill-path-primary-main" />;
    default:
      return <PTIcon className="fill-path-primary-main" />;
  }
};
// return (
//   moduleAccessProps(moduleData.code) ? (
//     <div
//       className="employee-dashboard-quick-service-card employee-dashboard-quick-service-card-content"
//       style={{
//         display: "flex",
//         padding: "0px",
//         borderRadius: "0px 8px 8px 0px",
       
//       }}
//       // onClick={}
//     >
//       <Link to={`${updatedModuleData[0].routes}`}>
//         <div
//           className="flex justify-center items-center"
//           // style={{
//           //   width: "20%",
//           //   background: updatedModuleData[0]?.bgColor,
//           //   display: "flex",
//           //   alignItems: "center",
//           //   justifyContent: "center",
//           //   borderRadius: "8px 0px 0px 8px",
//           // }}
//           style={{display:"flex",marginLeft:"12px",marginTop:"80%"}}
//         >
//           {/* <span
//             className="icon-banner-employee"
//             style={{
//               borderRadius: "5px",
//               boxShadow: "5px 5px 5px 0px #e3e4e3",
//             }}
//           > */}
//             {iconSelector(moduleData.code)}
//             {
//               // moduleAccessProps()
//               // moduleDataForDashboard?.Icon
//               // React.createElement(updatedModuleData[0]?.icon)
//             }
//           {/* </span> */}
//         </div>
//       </Link>
//       <div
//         className="employee-dashboard-quick-service-card-module-name"
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           fontSize: "24px",
//           fontWeight: "bold",
//           padding: "2rem 2rem",
//         }}
//       >
//         {
//           // moduleDataForDashboard.moduleName
//           updatedModuleData[0]?.moduleCode
//         }
//       </div>
//     </div>
//   ): null
// );
return (
  moduleAccessProps(moduleData.code) ? (
<div
      className="employee-dashboard-quick-service-card employee-dashboard-quick-service-card-content"
      style={{
        display: "flex",
        padding: "0px",
        borderRadius: "0px 8px 8px 0px",
      }}
>
<Link to={`${updatedModuleData[0]?.routes}`}>
<div
          className="flex justify-center items-center"
          style={{
            display: "flex",
            marginLeft: "12px",
            marginTop: "80%",
          }}
>
          {iconSelector(moduleData.code)}
</div>
</Link>
<div
        className="employee-dashboard-quick-service-card-module-name"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontWeight: "bold",
          padding: "2rem 2rem",
        }}
>
        {updatedModuleData[0]?.moduleCode}
</div>
</div>
  ) : null
);
};

export default EmployeeQuickServicesCard;
