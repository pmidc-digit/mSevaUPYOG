import React from "react";
import { Modal, Loader } from "@mseva/digit-ui-react-components";

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

/**
 * Reusable PDF preview modal
 * 
 * Props:
 * - open: boolean
 * - url: string | null
 * - title: string (optional)
 * - onClose: function
 * - className: string (optional)
 */
const PdfPreviewModal = ({ open, url, onClose, title = "Document", className, children = null }) => {
  if (!open) return null;

  return (
    <Modal
      headerBarEnd={<CloseBtn onClick={onClose} />}
      className={className || "noc-popupStyles"}
      hideSubmit={true}
    >
      {url ? (
        <div style={{ height: "80vh", width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Inline preview */}
          <iframe
            src={url}
            title={title}
            style={{ flex: 1, border: "none", width: "100%" }}
          />
          {children /* <- render whatever the parent wants */}
        </div>
      ) : (
        <Loader />
      )}
    </Modal>
  );
};

export default PdfPreviewModal;