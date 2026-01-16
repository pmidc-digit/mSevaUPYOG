import React, { useState, useEffect } from "react";
import { Modal, ActionBar, SubmitBar, CardLabel, TextInput } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

import { Loader } from "../components/Loader";

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

const ReasonModal = ({ closeModal, t, cancelModal }) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("data===", data);
    cancelModal(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Modal
        hideSubmit={true}
        headerBarMain={<Heading label={"Enter Reason to Cancel"} />}
        headerBarEnd={<CloseBtn onClick={closeModal} />}
        actionCancelOnSubmit={closeModal}
        actionSaveOnSubmit={() => {}}
        formId="modal-action"
      >
        <div className="label-field-pair" style={{ marginTop: " 20px", height: "150px", padding: " 0 30px" }}>
          <CardLabel>
            {`${t("CHB_DISCOUNT_REASON")}`} <span style={{ color: "red" }}>*</span>
          </CardLabel>
          <div className="form-field" style={{ width: "100%" }}>
            <Controller
              control={control}
              name="reason"
              rules={{
                required: "reason is required",
                minLength: { value: 2, message: "reason must be at least 2 characters" },
              }}
              render={(props) => (
                <TextInput
                  value={props.value}
                  error={errors?.name?.message}
                  onChange={(e) => {
                    props.onChange(e.target.value);
                  }}
                  onBlur={(e) => {
                    props.onBlur(e);
                  }}
                  t={t}
                />
              )}
            />
            {errors?.reason && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.reason.message}</p>}
          </div>
        </div>
        <ActionBar style={{ position: "relative" }}>
          <div>
            <SubmitBar label={"Submit"} submit="submit" />
          </div>
        </ActionBar>
      </Modal>
    </form>
  );
};

export default ReasonModal;
