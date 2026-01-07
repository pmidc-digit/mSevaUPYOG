import { Loader, Modal, FormComposer } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect, useMemo } from "react";

import { configTLDirectRenewApplication } from "../config";
import * as predefinedConfig from "../config";

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

const ActionModal = ({ t, action, tenantId, state, id, closeModal, submitAction, actionData, applicationData, businessService, moduleCode }) => {
    const stateId = Digit.ULBService.getStateId();

  const { data: tradeMdmsData,isLoading: tradeMdmsLoading } = Digit.Hooks.tl.useTradeLicenseMDMS(stateId, "TradeLicense", "TradeUnits", "[?(@.type=='TL')]");

    console.log("tradeMdmsData",tradeMdmsData?.TradeLicense?.TradeType);
    // console.log("tradeMdmsData",tradeMdmsData)

  console.log("applicationData",applicationData);

  const [config, setConfig] = useState({});
  const [defaultValues, setDefaultValues] = useState({});
  const [approvers, setApprovers] = useState([]);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);

const tradeUnits = applicationData?.tradeLicenseDetail?.tradeUnits
console.log("tradeUnits", tradeUnits);

const years = useMemo(() => {
  if (tradeMdmsLoading || !tradeMdmsData || !tradeUnits.length) return [];

  const tradeTypeCodes = new Set(tradeUnits.map(unit => unit.tradeType));

  const matchedTradeTypes = tradeMdmsData.TradeLicense?.TradeType.filter(type => tradeTypeCodes.has(type.code));

    const hasHazardous = matchedTradeTypes.some(unit => unit?.ishazardous);
    console.log("hasHazardous",hasHazardous);
    if(hasHazardous) return ['1'];
    else return ['1','2','3'];
}, [tradeMdmsLoading, tradeMdmsData, tradeUnits]);

  console.log("years", years);



  

  function submit(data) {
    let financialYear = applicationData?.financialYear;
    const financialYearDate = financialYear?.split('-')[1];
    const finalFinancialYear = `20${Number(financialYearDate)}-${Number(financialYearDate)+1}`

    applicationData = {
        ...applicationData,
        financialYear: finalFinancialYear,
        action: "INITIATE",
        additionalDetail : {
            ...applicationData.additionalDetail,
            validityYears :selectedApprover.length>0? parseInt(selectedApprover): ""
        }
    }

    // console.log("Data", selectedApprover)
    // console.log("Application Data", applicationData)
    // console.log("submit action", action?.action)

    submitAction({
        Licenses: [applicationData],
    });
  }

  useEffect(() => {
    if (action) {
      setConfig(
        configTLDirectRenewApplication({
          t,
          action,
          years,
          selectedApprover,
          setSelectedApprover,
          businessService,
        })
      );
    }
  }, [action, years, financialYears, selectedFinancialYear]);

  return action && config.form ? (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(config.label.cancel)}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t(config.label.submit)}
      actionSaveOnSubmit={() => {}}
      // isDisabled={!action.showFinancialYearsModal ? PTALoading || (!action?.isTerminateState && !selectedApprover?.uuid) : !selectedFinancialYear}
      formId="modal-action"
    >
      {tradeMdmsLoading ? (
        <Loader />
      ) : (
        <FormComposer
          config={config.form}
          className="BPAemployeeCard bpa-workflow-modal-form"
          noBoxShadow
          inline
          childrenAtTheBottom
          onSubmit={submit}
          defaultValues={defaultValues}
          formId="modal-action"
          // isDisabled={!action.showFinancialYearsModal ? PTALoading || (!action?.isTerminateState && !selectedApprover?.uuid) : !selectedFinancialYear}
        />
       )} 
    </Modal>
  ) : (
    <Loader />
  );
};

export default ActionModal;