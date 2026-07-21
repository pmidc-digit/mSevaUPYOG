import { Card, CardHeader, CardSubHeader, CardText, Loader, SubmitBar,Modal } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState,Fragment,useRef } from "react";
import { cardBodyStyle, stringReplaceAll } from "../utils";
import { useTranslation } from "react-i18next";
import { useParams, useHistory, useLocation } from "react-router-dom";
export const TransferOwnership = ({ property: propProperty }) => {
  const {t} =useTranslation()
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();
  const printRef = useRef();
  
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { data: propertyData } = Digit.Hooks.pt.usePropertySearch(
    { tenantId, filters: { propertyIds: id }, auth: true },
    { enabled: !propProperty && !!id }
  );
  const property = propProperty || propertyData?.Properties?.[0];

    let { data: mutationDocuments } = Digit.Hooks.useCommonMDMS(Digit.ULBService.getStateId(), "PropertyTax", ["MutationDocuments"], {
    select: (data) => {
      return data?.PropertyTax?.MutationDocuments;
    },
    retry: false,
    enabled: true,
  });
  console.log("mutation docs",mutationDocuments)

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
   const closeModal =(e) =>{
      console.log("in Print")
      
const content = printRef.current.innerHTML;
    const printWindow = window.open('','_blank');
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
    printWindow.print();
   // printWindow.close();

    //  onConcent(e)
    }
    const [showToast, setShowToast] = useState(true);
    const setModal=()=>{
      // Navigate back to property details after transfer ownership completion
      const isEmployeeRoute = location.pathname.includes("/employee/");
      const transferOwnershipRoute = isEmployeeRoute
        ? `/digit-ui/employee/pt/property-mutate/${id}`
        : `/digit-ui/citizen/pt/property/transfer-ownership/${id}`;
      history.push(transferOwnershipRoute, { property });
    }
    const closeModalTwo =() =>{
      // Hide the modal first, then navigate back
      setShowToast(false);
      history.goBack();
    }
    



  return (
     <>
    { showToast && 
      <Modal
           headerBarMain={<Heading label={t("Required Documents - Transfer of Ownership")} />}
           headerBarEnd={<CloseBtn onClick={closeModalTwo} />}
           actionCancelLabel={t("Print")}
           actionCancelOnSubmit={closeModal}
           actionSaveLabel={t("PT_TRANSFER_OWNERSHIP")}
           actionSaveOnSubmit={setModal}
           formId="modal-action"
           popupStyles={{width:'60%',marginTop:'5px'}}
         > 
    <React.Fragment>
      <style>{`
        .modal-action-save-btn, .submit-bar {
          background: #003C71 !important;
          background-color: #003C71 !important;
        }
        .modal-action-save-btn:hover, .submit-bar:hover {
          background: #002554 !important;
          background-color: #002554 !important;
        }
        .card-sub-header {
          color: #003C71 !important;
        }
      `}</style>
      <Card style={{marginLeft:'2px'}} >
        {/* <CardHeader>{!config.isMutation ? t("PT_DOC_REQ_SCREEN_HEADER") : t("PT_REQIURED_DOC_TRANSFER_OWNERSHIP")}</CardHeader> */}
        <div >
          {/* <CardText className={"primaryColor"}>{t("PT_DOC_REQ_SCREEN_SUB_HEADER")}</CardText>
          <CardText className={"primaryColor"}>{t("PT_DOC_REQ_SCREEN_TEXT")}</CardText>
          <CardText className={"primaryColor"}>{t("PT_DOC_REQ_SCREEN_SUB_TEXT")}</CardText>
          <CardSubHeader>{t("PT_DOC_REQ_SCREEN_LABEL")}</CardSubHeader>
          <CardText className={"primaryColor"}>{t("PT_DOC_REQ_SCREEN_LABEL_TEXT")}</CardText> */}
          <div ref={printRef}>

          
            {Array.isArray(mutationDocuments)
              ?
             
                //  {(isLoading === false)?

                //  (docs?.config?.isMutation) ?
          
                mutationDocuments.map(({ code, dropdownData,description }, index) => (
                  
                
                  <div key={index}>
                    <CardSubHeader>
                      {index + 1}. {t("PROPERTYTAX_" + stringReplaceAll(code, ".", "_") + "_HEADING")}
                    </CardSubHeader>
                   
                    {dropdownData.map((dropdownData,ind) => (
                      (dropdownData.active===true)?
                      <CardText className={"primaryColor"}>{t("PROPERTYTAX_" + stringReplaceAll(dropdownData?.code, ".", "_") + "_LABEL")}</CardText>
                      :null
                    ))}
                     <CardText className={"primaryColor"}>{t(description)}</CardText>
                  </div>
                 
                ))
           
           : null}
          </div>
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
      }
      </>
  )
}
