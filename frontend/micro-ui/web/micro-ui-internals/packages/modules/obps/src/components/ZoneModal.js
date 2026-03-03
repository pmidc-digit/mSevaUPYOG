import React from "react";
import { Modal } from "@mseva/digit-ui-react-components";
import ZoneUpdate from "./ZoneUpdate";

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

const ZoneModal = ({ onClose, onSelect, currentZoneCode }) => {
  return (
    <Modal
      headerBarEnd={<CloseBtn onClick={onClose} />}
      popupStyles={{
        width: "unset",
        minWidth: "360px",
        maxWidth: "600px",
        padding: "20px",
      }}
      hideSubmit={true}
    >
      <ZoneUpdate
        onSelect={onSelect}
        onClose={onClose}
        defaultZoneCode={currentZoneCode}
      />
    </Modal>
  );
};

export default ZoneModal;