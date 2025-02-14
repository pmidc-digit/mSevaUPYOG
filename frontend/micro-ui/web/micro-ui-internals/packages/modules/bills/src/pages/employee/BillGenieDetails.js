import { ActionBar, Card, Header, Loader, Row, StatusTable, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ActionModal from "../../components/Modal";
import { convertEpochToDate, convertToLocale, getFinancialYears } from "../../utils";



const BillGenieDetails = () => {
//   const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
//   const { id: receiptId, service: businessService } = useParams();
//   const tenantId = Digit.ULBService.getCurrentTenantId();
//   const isupdate = Digit.SessionStorage.get("isupdate");
//   const { isLoading, isError, error, data, ...rest } = Digit.Hooks.receipts.useReceiptsSearch(
//     { receiptNumbers: decodeURIComponent(receiptId), businessServices: businessService },
//     tenantId,
//     {},
//     isupdate
//   );



//   const closeModal = () => {
//     setShowModal(false);
//   };

//   const submitAction = (data) => {};
//   useEffect(() => {
//     return () => {
//       rest?.revalidate();
//     };
//   }, []);

//   const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_RECEIPT_MUTATION_HAPPENED", false);
//   const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_RECEIPT_MUTATION_SUCCESS_DATA", false);
//   const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("EMPLOYEE_RECEIPT_ERROR_DATA", false);
//   useEffect(() => {
//     setMutationHappened(false);
//     clearSuccessData();
//     clearError();
//   }, []);

//   if (isLoading) {
//     return <Loader />;
//   }
//   const PaymentReceipt = !isLoading && data?.Payments?.length > 0 ? data.Payments[0] : {};

  return (
    <React.Fragment>
  
      {/* {!isLoading && data?.Payments?.length > 0 ? ( */}
        <div>
          <Card>
            <StatusTable>
              <Row label={t("CR_RECEIPT_NUMBER")} text={"NA"} textStyle={{ whiteSpace: "pre" }} />
              <Row
                label={t("CR_RECEIPT_CONSUMER_NUMBER")}
                text={"NA"}
                textStyle={{ whiteSpace: "pre" }}
              />
              <Row label={t("CR_RECEIPT_PAYMENT_DATE")} 
             text={"NA"} />
             
             
              <Row label={t("CR_RECEIPT_AMOUNT")} text={"NA"} />
              
             
              <Row label={"Status"} text={"NA"} />
              <Row label={"Action"} text={"NA"}/>
            </StatusTable>
          </Card>
        </div>
      {/* ) : null} */}
      {/* {showModal ? <ActionModal t={t} tenantId={tenantId} applicationData={data} closeModal={closeModal} submitAction={submitAction} /> : null}
      <ActionBar>
        {canCancelReceipt(PaymentReceipt) && <SubmitBar label={t("CR_CANCEL_RECEIPT_BUTTON")} onSubmit={() => cancelReceipt()} />}
      </ActionBar> */}
    </React.Fragment>
  );
};

export default BillGenieDetails;
