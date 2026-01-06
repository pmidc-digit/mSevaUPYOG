import { Card, CardHeader, CardSubHeader, CardText, Loader, SubmitBar, Modal, CardSectionSubText } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, Fragment, useRef } from "react";
import { useRouteMatch, useHistory } from "react-router-dom";
import { stringReplaceAll } from "../utils";
import { useTranslation } from "react-i18next";

const NewApplicationModal = ({}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const printRef = useRef();
  let { data: mutationDocuments } = Digit.Hooks.useCommonMDMS(Digit.ULBService.getStateId(), "PropertyTax", ["MutationDocuments"], {
    select: (data) => {
      return data?.PropertyTax?.MutationDocuments;
    },
    retry: false,
    enable: false,
  });
  console.log("mutation docs", mutationDocuments);

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
    console.log("in Print");

    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
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
    printWindow.print(); // printWindow.close();

    //  onConcent(e)
  };

  const setModal = () => {
    console.log("in Apply");

    // onSelect()
  };
  const closeModalTwo = () => {
    setShowToast(false);
  };
  const [showToast, setShowToast] = useState(true);

  const isCitizen = window.location.href.includes("citizen");

  const handleSubmit = () => {
    if (isCitizen) {
      // history.replace(`/digit-ui/citizen/tl/tradelicence/new-application`);
      setShowToast(false);
    } else history.replace(`/digit-ui/employee/tl/tradelicence/new-application`);
  };

  return (
    <>
      {showToast && (
        <Modal
          headerBarMain={<Heading label={t("TRADELICENSE_REQ_DOCS_HEADER")} />}
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
              {/* <CardHeader>{!config.isMutation ? t("PT_DOC_REQ_SCREEN_HEADER") : t("PT_REQIURED_DOC_TRANSFER_OWNERSHIP")}</CardHeader> */}
              <div>
                <CardSubHeader style={{ color: "#0d43a7" }}>{t("TRADELICENSE_OWNER_OWNERIDPROOF_HEADING")}</CardSubHeader>

                <CardText style={{ color: "#0d43a7" }}>{t("TRADELICENSE_OWNER_OWNERIDPROOF_LABEL")}</CardText>
                <CardText style={{ color: "#0d43a7" }}>{t("TRADELICENSE_OWNER_OWNERSHIPPROOF_LABEL")}</CardText>
                <CardText style={{ color: "#0d43a7" }}>{t("TRADELICENSE_OWNER_OWNERPHOTO_LABEL")}</CardText>
                <CardText style={{ color: "#0d43a7" }}>{t("TRADELICENSE_OWNER_OLDLICENCENO_LABEL")}</CardText>

                <CardSectionSubText className={"primaryColor"}>
                  {t("TRADELICENSE_OWNER_OWNERIDPROOF_OWNERIDPROOF_DESCRIPTION_NOTE")}
                </CardSectionSubText>

                {/* <div ref={printRef}>
                  {Array.isArray(mutationDocuments)
                    ? //  {(isLoading === false)?

                      //  (docs?.config?.isMutation) ?

                      mutationDocuments.map(({ code, dropdownData, description }, index) => (
                        <div key={index}>
                          <CardSubHeader>
                            {index + 1}. {t("PROPERTYTAX_" + stringReplaceAll(code, ".", "_") + "_HEADING")}
                          </CardSubHeader>

                          {dropdownData.map((dropdownData, ind) =>
                            dropdownData.active === true ? (
                              <CardText className={"primaryColor"}>
                                {t("PROPERTYTAX_" + stringReplaceAll(dropdownData?.code, ".", "_") + "_LABEL")}
                              </CardText>
                            ) : null
                          )}
                          <CardText className={"primaryColor"}>{t(description)}</CardText>
                        </div>
                      ))
                    : null}
                </div> */}
              </div>
              {/* <span>
          <SubmitBar label={t("PT_COMMON_NEXT")} onSubmit={onSelect} />
        </span>
        <span style={{ marginTop: "10px" }}>
          <SubmitBar label={t("PT_DIGILOCKER_CONSENT")} onSubmit={(e) => { onConcent(e) }} />
        </span> */}
            </Card>
          </React.Fragment>
        </Modal>
      )}
    </>
  );
};

export default NewApplicationModal;
