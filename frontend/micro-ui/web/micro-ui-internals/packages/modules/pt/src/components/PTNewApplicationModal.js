import { Card, CardHeader, CardSubHeader, CardText, Loader, SubmitBar, Modal, CardSectionSubText } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, Fragment, useRef } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { stringReplaceAll } from "../utils";
import { useTranslation } from "react-i18next";

const PTNewApplicationModal = ({}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const printRef = useRef();
  
  const [showToast, setShowToast] = useState(()=>{
    const hasSeenModal = sessionStorage.getItem('ptModalShown');
    return !hasSeenModal; // Show only if not seen before
  });

  const Heading = (props) => {
    return <h1 className="heading-m">{props.label}</h1>;
  };

  const Close = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );

  const CloseBtn = (props) => {
    return (
      <div className="icon-bg-secondary" onClick={props.onClick}>
        <Close />
      </div>
    );
  };
  const closeModal = (e) => {
    

    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
      if (!printWindow) {
      // If popup is blocked, show alert
      alert(t("POPUP_BLOCKED_MESSAGE") || "Please allow popups to print");
      return;
    }

    printWindow.document.write(`
  
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
  <style>
    /* Add your custom styles here */


    @media print {
      body { margin: 0; font-size: 12px; }
      .print-container { transform: scale(0.9); transform-origin: top left; 

  </style>

      <html><body>${content}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();

     // Handle print cancellation or completion
    printWindow.onafterprint = () => {
      
      printWindow.close();
    };

    // For browsers that don't support onafterprint
    printWindow.onbeforeunload = () => {
     
    };

    
    printWindow.print(); // printWindow.close();

    //  onConcent(e)
  };

  const setModal = () => {

    // onSelect()
  };
  const closeModalTwo = () => {
    sessionStorage.setItem('ptModalShown', 'true');
    setShowToast(false);
  };
  // const [showToast, setShowToast] = useState(true);

  const isCitizen = window.location.href.includes("citizen");

  const handleSubmit = () => {
      sessionStorage.setItem('ptModalShown', 'true');
    //debugger
    if (isCitizen) {
      // history.replace(`/digit-ui/citizen/tl/tradelicence/new-application`);
      setShowToast(false);
    } else history.replace(`/digit-ui/employee/pt/new-application`);
  };
  const proofDocumentsConfig = {
  "Address Proof": {
    docs: [
      "Electricity Bill",
      "Water Bill",
      "Gas Bill",
      "Aadhar Card",
      "Voter Id",
      "Driving Licence",
      "Passport",
    ],
    note: "* In case of multiple/institutional Applicant please provide ID of primary or authorized person",
  },
  "Identity Proof": {
    docs: [
      "Aadhar Card",
      "Voter Id",
      "Driving Licence",
      "Pan Card",
      "Passport",
    ],
    note: "* In case of multiple/institutional Applicant please provide ID of primary or authorized person",
  },
  "Registration Proof": {
    docs: [
      "Sale Deed",
      "Gift Deed",
      "Patta Certificate",
      "Registered Will Deed",
      "Partition Deed",
      "Court Decree",
      "Property Auction",
      "Family Settlement",
      "Unregistred will Deed",
    ],
    note: "* In case of multiple Registration please provide Registration Proof for all Registration",
  },
  "Usage Proof": {
    docs: [
      "Electricity Bill",
      "Trade Licence",
      "Institution Registration Document",
    ],
    note: "* In case of multiple floors/units please provide the Usage Proof of all floors/units",
  },
  "Special Category Proof": {
    docs: [
      "Service Document",
      "Handicap Certificate",
      "Below Poverty Line Card",
      "Death Certificate",
    ],
    note: "* In case of multiple owners please provide the Special Category Proof of all the Owners (Incase of Special Category)",
  },
  "Occupancy Proof": {
    docs: ["Rent Agreement"],
    note: "* In case of multiple floors/units please provide the Occupancy Proof of all floors/units",
  },
};

  return (
    <>
      {showToast && (
        <Modal
          headerBarMain={<Heading label={t("PROPERTYTAX_REQ_DOCS_HEADER")} />}
          headerBarEnd={<CloseBtn onClick={closeModalTwo} />}
          actionCancelLabel={"Print"}
          actionCancelOnSubmit={closeModal}
          actionSaveLabel={"Apply"}
          actionSaveOnSubmit={handleSubmit}
          formId="modal-action"
          popupStyles={{ width: "60%", marginTop: "5px" }}
        >
          <React.Fragment>
            <Card>
              <div ref={printRef}>
                    {Object.entries(proofDocumentsConfig).map(([title, { docs, note }]) => (
                        <Card key={title}>
                        <CardSubHeader style={{ color: "#0d43a7" }}>{t(title)}</CardSubHeader>
                        <CardText style={{ color: "#0d43a7" }}>
                            {t("One of these documents is needed to apply for this Service")}
                        </CardText>
                        <div style={{ display: "flex", justifyContent: "space-evenly" , flexWrap: "wrap"}}>
                            {docs.map((doc, i) => (
                            <CardText key={doc} style={{ color: "#0d43a7" }}>
                            {`${i+1}.  ${t(doc)}`}
                            </CardText>
                            ))}
                        </div>
                        <CardSectionSubText className={"primaryColor"}>
                            {t(note)}
                        </CardSectionSubText>
                        </Card>
                    ))}
              </div>
            </Card>
          </React.Fragment>
        </Modal>
      )}

    </>
  );
};

export default PTNewApplicationModal;
