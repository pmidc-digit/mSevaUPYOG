import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Toast, Loader, Row, StatusTable, Modal, Card, Table, SubmitBar, Dropdown, RadioOrSelect, UploadFile, CardLabelError } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import CustomUploadFile from "../components/CustomUploadFile";
import { LoaderNew } from "../components/LoaderNew";
// import { Loader } from "../components/Loader";

const getAddress = (address, t) => {
    return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${address?.landmark ? `${address?.landmark}, ` : ""
        }${t(Digit.Utils.pt.getMohallaLocale(address?.locality.code, address?.tenantId))}, ${t(Digit.Utils.pt.getCityLocale(address?.tenantId))}${address?.pincode && t(address?.pincode) ? `, ${address.pincode}` : " "
        }`;
};
const Heading = (props) => {
  return <h1 className="heading-m">{props.t("BPA_UPLOAD_SCANNED_SIGNATURE")}</h1>;
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
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const ProfessionalSignUpdate = ({ closeModal, userDetails, refetch }) => {
    const { t } = useTranslation();
    const myElementRef = useRef(null);
    const [showToast, setShowToast] = useState(null);
    const isMobile = window.Digit.Utils.browser.isMobile();
    const [uploadedFile, setUploadedFile] = useState();
    const [file, setFile] = useState()
    const [loader, setLoader] = useState(false);
    const stateCode = Digit.ULBService.getStateId()


    useEffect(() => {
        ; (async () => {
            if (file && file?.type) {
                if (file.size >= MAX_FILE_SIZE) {
                    setShowToast({ error: true, label: t("PT_MAXIMUM_UPLOAD_SIZE_EXCEEDED") })
                } else {
                    setLoader(true);
                    try {
                        const response = await Digit.UploadServices.Filestorage(
                            "property-upload",
                            file,
                            stateCode,
                        )
                        setLoader(false);
                        if (response?.data?.files?.length > 0) {
                            setUploadedFile(response?.data?.files[0]?.fileStoreId)
                        } else {
                            setShowToast({ error: true, label: t("PT_FILE_UPLOAD_ERROR") })
                        }
                    } catch (err) {
                        setLoader(false);
                    }
                }
            }
        })()
    }, [file])


    function selectfile(e) {
        // setUploadedFile(e.target.files[0])
        setFile(e.target.files[0])
        setShowToast(null)
    }

    async function handleSignUpdate() {
        if (!uploadedFile) {
            setShowToast({ error: true, label: t("BPA_SCANNED_SIGN_MANDATORY_MESSAGE") })
            return;
        }
        const dob = userDetails?.user?.[0]?.dob
        const requestData = {
            ...userDetails?.user?.[0],
            dob: dob !== undefined ? dob.split("-").reverse().join("/") : "",
            signature: uploadedFile
        }
        try {
            const { responseInfo, user } = await Digit.UserService.updateUser(requestData, stateCode);
            if (responseInfo?.status === "200") {
                refetch();
                closeModal();
            } else {
                setShowToast({ error: true, label: t("SOMETHING_WENT_WRONG") });
            }
        } catch {
            setShowToast({ error: true, label: t("SOMETHING_WENT_WRONG") });
        }
    }

    return (
        <React.Fragment>
            <Modal
                // headerBarEnd={<CloseBtn onClick={closeModal} />}
                // headerBarMain={t("BPA_UPLOAD_SCANNED_SIGNATURE")}
                headerBarMain={<Heading t={t} />}
                formId="modal-action"
                hideSubmit={true}
                actionSingleLabel={t("BPA_UPLOAD_SIGN")}
                actionSingleSubmit={handleSignUpdate}
            >
                {!loader && <div>
                    <LabelFieldPair>
                        <div
                            // className="field ndc_property_search"                            
                            ref={myElementRef}
                            id="search-property-field"
                        >
                            <CardLabel>{`${t("BPAREG_HEADER_APPL_BPAREG_SCANNED_SIGNATURE")} *`}</CardLabel>
                            <CustomUploadFile
                                id={"noc-doc"}
                                onUpload={selectfile}
                                onDelete={() => {
                                    setUploadedFile(null);
                                    setFile("");
                                }}
                                uploadedFile={uploadedFile}
                                message={uploadedFile ? `1 ${t(`FILEUPLOADED`)}` : t(`ES_NO_FILE_SELECTED_LABEL`)}
                                error={showToast?.label}
                                accept="image/*,"
                            />
                            <CardLabelError style={{ color: "black" }}>{t("Only .png, .jpeg, .jpg files are accepted with maximum size of 5 MB")}</CardLabelError>
                            <CardLabelError style={{ color: "black" }}>{t("BPA_NO_SCANNED_SIGNATURE_AVAILABLE_MESSAGE")}</CardLabelError>
                        </div>
                    </LabelFieldPair>

                    {showToast && (
                        <Toast
                            isDleteBtn={true}
                            labelstyle={{ width: "100%" }}
                            error={showToast.error}
                            warning={showToast.warning}
                            label={t(showToast.label)}
                            onClose={() => {
                                setShowToast(null);
                            }}
                        />
                    )}
                </div>}
                {loader && <LoaderNew page={true} />}
            </Modal>
        </React.Fragment>
    );
};