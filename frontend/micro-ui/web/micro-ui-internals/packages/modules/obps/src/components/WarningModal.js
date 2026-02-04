import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Toast, Loader, Row, StatusTable, Modal, Card, Table, SubmitBar, Dropdown, RadioOrSelect} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RESET_OBPS_FORM, UPDATE_OBPS_FORM } from "../redux/actions/OBPSActions";
import { useLocation } from "react-router-dom";
// import { Loader } from "../components/Loader";

export const WarningModal = ({ actionHeading, actionLabel, actionCancelLabel, actionSaveLabel, actionCancelOnSubmit, actionSaveOnSubmit, option }) => {
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <Modal
                headerBarMain={<h1 className="heading-m" >{t(actionHeading)}</h1>}                  
                formId="modal-action"
                // popupStyles={{
                //     width: "unset",
                //     minWidth: "1000px",
                //     padding:"20px",
                // }}
                actionCancelLabel={t(actionCancelLabel)}
                actionCancelOnSubmit={actionCancelOnSubmit}
                actionSaveLabel={t(actionSaveLabel)}
                actionSaveOnSubmit={() => actionSaveOnSubmit(option)}             
            >
                <LabelFieldPair>
                    <CardLabel>{t(actionLabel)}</CardLabel>
                </LabelFieldPair>
            </Modal>
            {/* {(isLoading || getLoader) && <Loader page={true} />} */}
        </React.Fragment>
    );
};