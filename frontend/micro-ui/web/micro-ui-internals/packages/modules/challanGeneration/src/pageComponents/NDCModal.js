import { Modal, FormComposer, Toast } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect } from "react";
import { Loader } from "../components/Loader";

import { ModalConfig } from "../config/ModalConfig";

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

const NDCModal = ({ t, action, closeModal, submitAction, showErrorToast, errorOne, closeToastOne, getChallanData }) => {
  const [config, setConfig] = useState({});
  const [getAmount, setAmount] = useState();
  const [error, setError] = useState();

  function submit(data) {
    const payload = { amount: getAmount };
    submitAction(payload);
  }

  useEffect(() => {
    if (action) {
      setConfig(
        ModalConfig({
          t,
          action,
          setAmount,
          getChallanData,
          error,
          setError,
        })
      );
    }
  }, [action]);

  if (!action || !config.form) return null;

  return (
    <Modal
      headerBarMain={<Heading label={t(config.label.heading)} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      actionCancelLabel={t(config.label.cancel)}
      actionCancelOnSubmit={closeModal}
      actionSaveLabel={t(config.label.submit)}
      actionSaveOnSubmit={() => {}}
      formId="modal-action"
    >
      <FormComposer config={config.form} noBoxShadow inline childrenAtTheBottom onSubmit={submit} formId="modal-action" />
      {/* )} */}
      {/* {showToast && <Toast isDleteBtn={true} error={true} label={errors} onClose={closeToast} />} */}
      {showErrorToast && <Toast error={true} label={errorOne} isDleteBtn={true} onClose={closeToastOne} />}
    </Modal>
  );
};

export default NDCModal;
