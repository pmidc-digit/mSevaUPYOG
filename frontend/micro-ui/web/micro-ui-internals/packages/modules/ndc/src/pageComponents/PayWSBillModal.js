// import { Card, CardHeader, CardSubHeader, CardText, Loader, SubmitBar, Modal } from "@mseva/digit-ui-react-components";
// import React, { useEffect, useState, Fragment, useRef } from "react";
// import { useTranslation } from "react-i18next";
// export const PayWSBillModal = ({ setShowToast, billData }) => {
//   const { t } = useTranslation();
//   const consumerCode = billData?.consumerCode;
//   const businessService = billData?.businessService;
//   const tenantId = billData?.tenantId
//   const {data: demandData, isLoading, isError} = Digit.Hooks.useDemandSearch({consumerCode, businessService, tenantId});

//   console.log("demandData", demandData);
  
//   const Heading = (props) => {
//     return <h1 className="heading-m">{props.label}</h1>;
//   };

//   const Close = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
//       <path d="M0 0h24v24H0V0z" fill="none" />
//       <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
//     </svg>
//   );

//   const CloseBtn = (props) => {
//     return (
//       <div className="icon-bg-secondary" onClick={props.onClick}>
//         <Close />
//       </div>
//     );
//   };
  
//   const setModal = () => {
//     console.log("Pay API");
//   };
//   const closeModal = () => {
//     setShowToast();
//   };

//   return (
//     <>
//         <Modal
//           headerBarMain={<Heading label={t(`Pay Due Amounts for ${billData?.businessService === "WS"? "Water Connection": "Sewerage Connection"} `)} />}
//           headerBarEnd={<CloseBtn onClick={closeModal} />}
//           actionCancelLabel={t("CANCEL")}
//           actionCancelOnSubmit={closeModal}
//           actionSaveLabel={t("PAY")}
//           actionSaveOnSubmit={setModal}
//           formId="modal-action"
//           popupStyles={{ width: "60%", marginTop: "5px" }}
//         >
//           <React.Fragment>
            
//           </React.Fragment>
//         </Modal>
//     </>
//   );
// };

// import {
//     Modal,
//     Loader
//   } from "@mseva/digit-ui-react-components";
//   import React from "react";
//   import { useTranslation } from "react-i18next";
  
//   export const PayWSBillModal = ({ setShowToast, billData }) => {
//     const { t } = useTranslation();
//     const consumerCode = billData?.consumerCode;
//     const businessService = billData?.businessService;
//     const tenantId = billData?.tenantId;
  
//     const { data: demandData, isLoading, isError } = Digit.Hooks.useDemandSearch({
//       consumerCode,
//       businessService,
//       tenantId,
//     });
  
//     const Heading = ({ label }) => <h1 className="heading-m">{label}</h1>;
  
//     const Close = () => (
//       <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 24 24">
//         <path d="M0 0h24v24H0V0z" fill="none" />
//         <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 
//           17.59 19 19 17.59 13.41 12 19 6.41z" />
//       </svg>
//     );
  
//     const CloseBtn = ({ onClick }) => (
//       <div className="icon-bg-secondary" onClick={onClick}>
//         <Close />
//       </div>
//     );
  
//     const closeModal = () => {
//       setShowToast();
//     };
  
//     const setModal = () => {
//       console.log("Pay API");
//     };
  
//     const formatDate = (ts) => {
//       const date = new Date(ts);
//       return date.toLocaleDateString("en-GB");
//     };
  
//     const getTableRows = () => {
//       return demandData?.Demands?.map((demand, index) => {
//         const taxFrom = formatDate(demand.taxPeriodFrom);
//         const taxTo = formatDate(demand.taxPeriodTo);
//         const period = `${taxFrom} - ${taxTo}`;
  
//         let demandTax = 0, demandInterest = 0, demandPenalty = 0;
//         let collectionTax = 0, collectionInterest = 0, collectionPenalty = 0;
  
//         demand.demandDetails.forEach((detail) => {
//           const code = detail.taxHeadMasterCode;
//           const amount = detail.taxAmount || 0;
//           const collected = detail.collectionAmount || 0;
  
//           if (code.includes("CHARGE")) {
//             demandTax += amount;
//             collectionTax += collected;
//           } else if (code.includes("INTEREST")) {
//             demandInterest += amount;
//             collectionInterest += collected;
//           } else if (code.includes("PENALTY")) {
//             demandPenalty += amount;
//             collectionPenalty += collected;
//           }
//         });
  
//         return (
//           <tr key={index}>
//             <td>{period}</td>
//             <td>{demandTax.toFixed(2)}</td>
//             <td>{demandInterest.toFixed(2)}</td>
//             <td>{demandPenalty.toFixed(2)}</td>
//             <td>{collectionTax.toFixed(2)}</td>
//             <td>{collectionInterest.toFixed(2)}</td>
//             <td>{collectionPenalty.toFixed(2)}</td>
//             <td>{(demandTax - collectionTax).toFixed(2)}</td>
//             <td>{(demandInterest - collectionInterest).toFixed(2)}</td>
//             <td>{(demandPenalty - collectionPenalty).toFixed(2)}</td>
//           </tr>
//         );
//       });
//     };
  
//     return (
//       <Modal
//         headerBarMain={
//           <Heading
//             label={t(
//               `Pay Due Amounts for ${
//                 billData?.businessService === "WS"
//                   ? "Water Connection"
//                   : "Sewerage Connection"
//               }`
//             )}
//           />
//         }
//         headerBarEnd={<CloseBtn onClick={closeModal} />}
//         actionCancelLabel={t("CANCEL")}
//         actionCancelOnSubmit={closeModal}
//         actionSaveLabel={t("PAY")}
//         actionSaveOnSubmit={setModal}
//         formId="modal-action"
//         popupStyles={{ width: "90%", marginTop: "5px" }}
//       >
//         {isLoading ? (
//           <Loader />
//         ) : isError ? (
//           <p style={{ color: "red", padding: "1rem" }}>
//             {t("ERROR_LOADING_DATA")}
//           </p>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table className="table table-bordered" style={{ width: "100%", borderCollapse: "collapse" }}>
//               <thead>
//                 <tr>
//                   <th>Installments</th>
//                   <th colSpan="3">Demand</th>
//                   <th colSpan="3">Collection</th>
//                   <th colSpan="3">Balance</th>
//                 </tr>
//                 <tr>
//                   <th></th>
//                   <th>Tax</th>
//                   <th>Interest</th>
//                   <th>Penalty</th>
//                   <th>Tax</th>
//                   <th>Interest</th>
//                   <th>Penalty</th>
//                   <th>Tax</th>
//                   <th>Interest</th>
//                   <th>Penalty</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>{getTableRows()}</tbody>
//             </table>
//           </div>
//         )}
//       </Modal>
//     );
//   };
  
// import {
//     Modal,
//     Loader
//   } from "@mseva/digit-ui-react-components";
//   import React from "react";
//   import { useTranslation } from "react-i18next";
  
//   export const PayWSBillModal = ({ setShowToast, billData }) => {
//     const { t } = useTranslation();
//     const consumerCode = billData?.consumerCode;
//     const businessService = billData?.businessService;
//     const tenantId = billData?.tenantId;
  
//     const { data: demandData, isLoading, isError } = Digit.Hooks.useDemandSearch({
//       consumerCode,
//       businessService,
//       tenantId,
//     });
  
//     const closeModal = () => setShowToast();
//     const setModal = () => console.log("Pay API");
  
//     const Heading = ({ label }) => <h1 className="heading-m">{label}</h1>;
//     const Close = () => (
//       <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 24 24">
//         <path d="M0 0h24v24H0V0z" fill="none" />
//         <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 
//           17.59 19 19 17.59 13.41 12 19 6.41z" />
//       </svg>
//     );
//     const CloseBtn = ({ onClick }) => <div className="icon-bg-secondary" onClick={onClick}><Close /></div>;
  
//     const formatDate = (ts) => {
//       const date = new Date(ts);
//       return date.toLocaleDateString("en-GB");
//     };
  
//     const totals = {
//       demandTax: 0,
//       demandInterest: 0,
//       demandPenalty: 0,
//       collectionTax: 0,
//       collectionInterest: 0,
//       collectionPenalty: 0,
//       balanceTax: 0,
//       balanceInterest: 0,
//       balancePenalty: 0
//     };
  
//     const getTableRows = () => {
//       return demandData?.Demands?.map((demand, index) => {
//         const period = `${formatDate(demand.taxPeriodFrom)} - ${formatDate(demand.taxPeriodTo)}`;
  
//         let demandTax = 0, demandInterest = 0, demandPenalty = 0;
//         let collectionTax = 0, collectionInterest = 0, collectionPenalty = 0;
  
//         demand.demandDetails.forEach((detail) => {
//           const code = detail.taxHeadMasterCode || "";
//           const amount = detail.taxAmount || 0;
//           const collected = detail.collectionAmount || 0;
  
//           if (code.includes("CHARGE")) {
//             demandTax += amount;
//             collectionTax += collected;
//           } else if (code.includes("INTEREST")) {
//             demandInterest += amount;
//             collectionInterest += collected;
//           } else if (code.includes("PENALTY")) {
//             demandPenalty += amount;
//             collectionPenalty += collected;
//           }
//         });
  
//         const balanceTax = demandTax - collectionTax;
//         const balanceInterest = demandInterest - collectionInterest;
//         const balancePenalty = demandPenalty - collectionPenalty;
  
//         // Add to totals
//         totals.demandTax += demandTax;
//         totals.demandInterest += demandInterest;
//         totals.demandPenalty += demandPenalty;
//         totals.collectionTax += collectionTax;
//         totals.collectionInterest += collectionInterest;
//         totals.collectionPenalty += collectionPenalty;
//         totals.balanceTax += balanceTax;
//         totals.balanceInterest += balanceInterest;
//         totals.balancePenalty += balancePenalty;
  
//         return (
//           <tr key={index}>
//             <td>{period}</td>
//             <td>{demandTax.toFixed(2)}</td>
//             <td>{demandInterest.toFixed(2)}</td>
//             <td>{demandPenalty.toFixed(2)}</td>
//             <td>{collectionTax.toFixed(2)}</td>
//             <td>{collectionInterest.toFixed(2)}</td>
//             <td>{collectionPenalty.toFixed(2)}</td>
//             <td>{balanceTax.toFixed(2)}</td>
//             <td>{balanceInterest.toFixed(2)}</td>
//             <td>{balancePenalty.toFixed(2)}</td>
//           </tr>
//         );
//       });
//     };
  
//     return (
//       <Modal
//         headerBarMain={
//           <Heading
//             label={t(
//               `Pay Due Amounts for ${billData?.businessService === "WS" ? "Water Connection" : "Sewerage Connection"}`
//             )}
//           />
//         }
//         headerBarEnd={<CloseBtn onClick={closeModal} />}
//         actionCancelLabel={t("CANCEL")}
//         actionCancelOnSubmit={closeModal}
//         actionSaveLabel={t("PAY")}
//         actionSaveOnSubmit={setModal}
//         formId="modal-action"
//         popupStyles={{ width: "90%", marginTop: "5px" }}
//       >
//         {isLoading ? (
//           <Loader />
//         ) : isError ? (
//           <p style={{ color: "red", padding: "1rem" }}>{t("ERROR_LOADING_DATA")}</p>
//         ) : (
//           <div style={{ overflowX: "auto" }}>
//             <table
//               style={{
//                 width: "100%",
//                 borderCollapse: "collapse",
//                 fontSize: "14px",
//                 marginTop: "1rem"
//               }}
//             >
//               <thead>
//                 <tr style={{ backgroundColor: "#f0f0f0" }}>
//                   <th rowSpan={2} style={{ padding: "8px", border: "1px solid #ddd" }}>Installments</th>
//                   <th colSpan={3} style={{ textAlign: "center", border: "1px solid #ddd" }}>Demand</th>
//                   <th colSpan={3} style={{ textAlign: "center", border: "1px solid #ddd" }}>Collection</th>
//                   <th colSpan={3} style={{ textAlign: "center", border: "1px solid #ddd" }}>Balance</th>
//                 </tr>
//                 <tr style={{ backgroundColor: "#f9f9f9" }}>
//                   <th style={{ border: "1px solid #ddd" }}>Tax</th>
//                   <th style={{ border: "1px solid #ddd" }}>Interest</th>
//                   <th style={{ border: "1px solid #ddd" }}>Penalty</th>
//                   <th style={{ border: "1px solid #ddd" }}>Tax</th>
//                   <th style={{ border: "1px solid #ddd" }}>Interest</th>
//                   <th style={{ border: "1px solid #ddd" }}>Penalty</th>
//                   <th style={{ border: "1px solid #ddd" }}>Tax</th>
//                   <th style={{ border: "1px solid #ddd" }}>Interest</th>
//                   <th style={{ border: "1px solid #ddd" }}>Penalty</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {getTableRows()}
//                 <tr style={{ backgroundColor: "#efefef", fontWeight: "bold" }}>
//                   <td style={{ border: "1px solid #ddd", padding: "8px" }}>Total</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.demandTax.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.demandInterest.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.demandPenalty.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.collectionTax.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.collectionInterest.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.collectionPenalty.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.balanceTax.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.balanceInterest.toFixed(2)}</td>
//                   <td style={{ border: "1px solid #ddd" }}>{totals.balancePenalty.toFixed(2)}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Modal>
//     );
//   };  

import {
    Modal,
    Loader
  } from "@mseva/digit-ui-react-components";
  import React from "react";
  import { useTranslation } from "react-i18next";
  
  export const PayWSBillModal = ({ setShowToast, billData }) => {
    const { t } = useTranslation();
    const consumerCode = billData?.consumerCode;
    const businessService = billData?.businessService;
    const tenantId = billData?.tenantId;
  
    const { data: demandData, isLoading, isError } = Digit.Hooks.useDemandSearch({
      consumerCode,
      businessService,
      tenantId,
    });
  
    const closeModal = () => setShowToast();
    const setModal = () => console.log("Pay API");
  
    const Heading = ({ label }) => <h1 className="heading-m">{label}</h1>;
    const Close = () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 
          17.59 19 19 17.59 13.41 12 19 6.41z" />
      </svg>
    );
    const CloseBtn = ({ onClick }) => <div className="icon-bg-secondary" onClick={onClick}><Close /></div>;
  
    const formatDate = (ts) => {
      const date = new Date(ts);
      return date.toLocaleDateString("en-GB");
    };
  
    const totals = {
      demandTax: 0,
      demandInterest: 0,
      demandPenalty: 0,
      collectionTax: 0,
      collectionInterest: 0,
      collectionPenalty: 0,
      balanceTax: 0,
      balanceInterest: 0,
      balancePenalty: 0
    };
  
    const getTableRows = () => {
      return demandData?.Demands?.map((demand, index) => {
        const period = `${formatDate(demand.taxPeriodFrom)} - ${formatDate(demand.taxPeriodTo)}`;
  
        let demandTax = 0, demandInterest = 0, demandPenalty = 0;
        let collectionTax = 0, collectionInterest = 0, collectionPenalty = 0;
  
        demand.demandDetails.forEach((detail) => {
          const code = detail.taxHeadMasterCode || "";
          const amount = detail.taxAmount || 0;
          const collected = detail.collectionAmount || 0;
  
          if (code.includes("CHARGE")) {
            demandTax += amount;
            collectionTax += collected;
          } else if (code.includes("INTEREST")) {
            demandInterest += amount;
            collectionInterest += collected;
          } else if (code.includes("PENALTY")) {
            demandPenalty += amount;
            collectionPenalty += collected;
          }
        });
  
        const balanceTax = demandTax - collectionTax;
        const balanceInterest = demandInterest - collectionInterest;
        const balancePenalty = demandPenalty - collectionPenalty;
  
        totals.demandTax += demandTax;
        totals.demandInterest += demandInterest;
        totals.demandPenalty += demandPenalty;
        totals.collectionTax += collectionTax;
        totals.collectionInterest += collectionInterest;
        totals.collectionPenalty += collectionPenalty;
        totals.balanceTax += balanceTax;
        totals.balanceInterest += balanceInterest;
        totals.balancePenalty += balancePenalty;
  
        return (
          <tr key={index}>
            <td style={cellStyleLeft}>{period}</td>
            <td style={cellStyleRight}>{demandTax.toFixed(2)}</td>
            <td style={cellStyleRight}>{demandInterest.toFixed(2)}</td>
            <td style={cellStyleRight}>{demandPenalty.toFixed(2)}</td>
            <td style={cellStyleRight}>{collectionTax.toFixed(2)}</td>
            <td style={cellStyleRight}>{collectionInterest.toFixed(2)}</td>
            <td style={cellStyleRight}>{collectionPenalty.toFixed(2)}</td>
            <td style={cellStyleRight}>{balanceTax.toFixed(2)}</td>
            <td style={cellStyleRight}>{balanceInterest.toFixed(2)}</td>
            <td style={cellStyleRight}>{balancePenalty.toFixed(2)}</td>
          </tr>
        );
      });
    };
  
    const cellStyleRight = { border: "1px solid #ddd", padding: "6px 8px", textAlign: "right" };
    const cellStyleLeft = { border: "1px solid #ddd", padding: "6px 8px", textAlign: "left" };
  
    return (
      <Modal
        headerBarMain={
          <Heading
            label={t(
              `Pay Due Amounts for ${billData?.businessService === "WS" ? "Water Connection" : "Sewerage Connection"}`
            )}
          />
        }
        headerBarEnd={<CloseBtn onClick={closeModal} />}
        actionCancelLabel={t("CANCEL")}
        actionCancelOnSubmit={closeModal}
        actionSaveLabel={t("PAY")}
        actionSaveOnSubmit={setModal}
        formId="modal-action"
        popupStyles={{ width: "90%", marginTop: "5px" }}
      >
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <p style={{ color: "red", padding: "1rem" }}>{t("ERROR_LOADING_DATA")}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
                marginTop: "1rem"
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f0f0" }}>
                  <th rowSpan={2} style={cellStyleLeft}>Installments</th>
                  <th colSpan={3} style={{ ...cellStyleRight, textAlign: "center" }}>Demand</th>
                  <th colSpan={3} style={{ ...cellStyleRight, textAlign: "center" }}>Collection</th>
                  <th colSpan={3} style={{ ...cellStyleRight, textAlign: "center" }}>Balance</th>
                </tr>
                <tr style={{ backgroundColor: "#f9f9f9" }}>
                  <th style={cellStyleRight}>Tax</th>
                  <th style={cellStyleRight}>Interest</th>
                  <th style={cellStyleRight}>Penalty</th>
                  <th style={cellStyleRight}>Tax</th>
                  <th style={cellStyleRight}>Interest</th>
                  <th style={cellStyleRight}>Penalty</th>
                  <th style={cellStyleRight}>Tax</th>
                  <th style={cellStyleRight}>Interest</th>
                  <th style={cellStyleRight}>Penalty</th>
                </tr>
              </thead>
              <tbody>
                {getTableRows()}
                <tr style={{ backgroundColor: "#efefef", fontWeight: "bold" }}>
                  <td style={cellStyleLeft}>Total</td>
                  <td style={cellStyleRight}>{totals.demandTax.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.demandInterest.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.demandPenalty.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.collectionTax.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.collectionInterest.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.collectionPenalty.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.balanceTax.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.balanceInterest.toFixed(2)}</td>
                  <td style={cellStyleRight}>{totals.balancePenalty.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    );
  };
  