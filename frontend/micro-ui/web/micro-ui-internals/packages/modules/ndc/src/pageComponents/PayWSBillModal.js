import {
  Modal,
  Loader } from
"@mseva/digit-ui-react-components";
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
    tenantId
  });

  const closeModal = () => setShowToast();
  const setModal = () => console.log("Pay API");

  const Heading = ({ label }) => <h1 className="heading-m">{label}</h1>;
  const Close = () =>
  <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 24 24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41
          17.59 19 19 17.59 13.41 12 19 6.41z" />

      </svg>;

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

      let demandTax = 0,demandInterest = 0,demandPenalty = 0;
      let collectionTax = 0,collectionInterest = 0,collectionPenalty = 0;

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
            <td className="ndc-demand-table__cell ndc-demand-table__cell--left">{period}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{demandTax.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{demandInterest.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{demandPenalty.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{collectionTax.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{collectionInterest.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{collectionPenalty.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{balanceTax.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{balanceInterest.toFixed(2)}</td>
            <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{balancePenalty.toFixed(2)}</td>
          </tr>);

    });
  };

  return (
    <Modal
      headerBarMain={
      <Heading
        label={t(
          `Pay Due Amounts for ${billData?.businessService === "WS" ? "Water Connection" : "Sewerage Connection"}`
        )} />

      }
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t("CANCEL")}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t("PAY")}
      actionSaveOnSubmit={setModal}
      formId="modal-action"
      popupClassName="ndc-pay-ws-bill-modal">

        {isLoading ?
      <Loader /> :
      isError ?
      <p className="ndc-style-04dd2b26c2">{t("ERROR_LOADING_DATA")}</p> :

      <div className="ndc-style-0ddf068bfb">
            <table className="ndc-style-7b6669c0c3">







              <thead>
                <tr className="ndc-style-961753662d">
                  <th rowSpan={2} className="ndc-demand-table__cell ndc-demand-table__cell--left">Installments</th>
                  <th colSpan={3} className="ndc-demand-table__cell ndc-demand-table__cell--center">Demand</th>
                  <th colSpan={3} className="ndc-demand-table__cell ndc-demand-table__cell--center">Collection</th>
                  <th colSpan={3} className="ndc-demand-table__cell ndc-demand-table__cell--center">Balance</th>
                </tr>
                <tr className="ndc-style-f4acddf10b">
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Tax</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Interest</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Penalty</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Tax</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Interest</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Penalty</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Tax</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Interest</th>
                  <th className="ndc-demand-table__cell ndc-demand-table__cell--right">Penalty</th>
                </tr>
              </thead>
              <tbody>
                {getTableRows()}
                <tr className="ndc-style-c86bca9ccc">
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--left">Total</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.demandTax.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.demandInterest.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.demandPenalty.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.collectionTax.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.collectionInterest.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.collectionPenalty.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.balanceTax.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.balanceInterest.toFixed(2)}</td>
                  <td className="ndc-demand-table__cell ndc-demand-table__cell--right">{totals.balancePenalty.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
      }
      </Modal>);

};
