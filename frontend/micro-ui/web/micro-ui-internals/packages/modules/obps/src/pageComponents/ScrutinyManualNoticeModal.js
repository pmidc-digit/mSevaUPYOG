import React from "react";
import { Modal, CitizenInfoLabel } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const DEFAULT_SCRUTINY_MANUAL_URL =
  "https://mseva.lgpunjab.gov.in/filestore/v1/files/viewfile/?name=pb%2FCLU%2FOctober%2F21%2F1792575799079whbusTVLkn.pdf";

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" width="20px" height="20px">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick} style={{ cursor: "pointer" }}>
      <Close />
    </div>
  );
};

const Heading = (props) => {
  return <h1 className="heading-m" style={{ margin: 0 }}>{props.label}</h1>;
};

export const ScrutinyManualNoticeModal = ({ closeModal }) => {
  const { t } = useTranslation();
  const stateId = Digit.ULBService.getStateId();

  // Dynamically fetch scrutiny user manual URL from MDMS actions-test if available
  const { data: actionsData } = Digit.Hooks.useCustomMDMS(
    stateId,
    "ACCESSCONTROL-ACTIONS-TEST",
    [{ name: "actions-test" }]
  );

  const actionsList = actionsData?.["ACCESSCONTROL-ACTIONS-TEST"]?.["actions-test"] || [];
  const scrutinyAction = actionsList.find(
    (action) => action?.name === "BPA_CITIZEN_HOME_SCRUTINY_USER_MANUAL_LABEL"
  );
  const manualUrl = scrutinyAction?.navigationURL || DEFAULT_SCRUTINY_MANUAL_URL;

  const handleOpenManual = () => {
    if (manualUrl) {
      window.open(manualUrl, "_blank");
    }
  };

  return (
    <Modal
      headerBarMain={<Heading label={t("BPA_IMPORTANT_NOTICE_HEADER", "Important Notice")} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      hideSubmit={false}
      actionCancelLabel={t("BPA_VIEW_USER_MANUAL", "View User Manual")}
      actionCancelOnSubmit={handleOpenManual}
      actionSaveLabel={t("OK")}
      actionSaveOnSubmit={closeModal}
      popupStyles={{
        maxWidth: "580px",
        width: "90%",
        padding: "16px",
      }}
    >
      <CitizenInfoLabel
        info={t("BPA_USER_MANUAL_UPDATED_TITLE", "Attention Professionals: The User Manual has been updated.")}
        text={
          <span>
            {t("BPA_USER_MANUAL_UPDATED_PART1", "Please refer to the latest ")}
            <a
              href={manualUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#1D4ED8", fontWeight: "600", textDecoration: "underline" }}
              onClick={(e) => e.stopPropagation()}
            >
              {t("BPA_SCRUTINY_USER_MANUAL_VERSION_LABEL", "Scrutiny User Manual (Version 2.0)")}
            </a>
            {t(
              "BPA_USER_MANUAL_UPDATED_PART2",
              " for drawing preparation, which includes the newly added Worksheet Layer."
            )}
          </span>
        }
        style={{ margin: "8px 0" }}
      />
    </Modal>
  );
};

export default ScrutinyManualNoticeModal;
