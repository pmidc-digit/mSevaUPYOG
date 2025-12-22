import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Toast, Loader, Row, StatusTable, Modal, Card, Table, SubmitBar, Dropdown, RadioOrSelect } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RESET_OBPS_FORM, UPDATE_OBPS_FORM } from "../redux/actions/OBPSActions";
import { useLocation } from "react-router-dom";


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

export const BPASearchModal = ({ closeModal }) => {
    const myElementRef = useRef(null);
    const [applicationNumber, setApplicationNumber] = useState("");
    const isMobile = window.Digit.Utils.browser.isMobile();
    const { t } = useTranslation();

    const handleApplicationNumberChange = (e) => {
        setApplicationNumber(e.target.value);
    };

    return (
        <React.Fragment>
            <Modal
                headerBarEnd={<CloseBtn onClick={closeModal} />}
                formId="modal-action"
                popupStyles={{
                    width: "unset",                    
                    padding: "20px",
                }}
                hideSubmit={true}
            >
                <LabelFieldPair>
                    <div
                        className="field ndc_property_search"
                        style={{
                            display: "flex", gap: "16px", width: "100%", ...(isMobile ? {
                                flexDirection: "column"
                            } : {})
                        }}
                        ref={myElementRef}
                        id="search-property-field"
                    >
                        <TextInput
                            key={"applicationNumber"}
                            value={applicationNumber} //{propertyId}
                            onChange={handleApplicationNumberChange}
                            disable={false}
                            // maxlength={16}
                            placeholder={t("BPA_SEARCH_APPLICATION_NO_PLACEHOLDER")}
                            defaultValue={undefined}                            
                        />
                    </div>
                </LabelFieldPair>
            </Modal>
        </React.Fragment>
    )
}