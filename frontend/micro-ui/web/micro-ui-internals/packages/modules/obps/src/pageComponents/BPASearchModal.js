import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Toast, Loader, Row, StatusTable, Modal, Card, Table, SubmitBar, Dropdown, RadioOrSelect, MobileNumber } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RESET_OBPS_FORM, UPDATE_OBPS_FORM } from "../redux/actions/OBPSActions";
import { useLocation, useParams, useHistory } from "react-router-dom";
import { getBPAFormDataNewEDCR } from "../utils";


const Close = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
);

const Heading = (props) => {
  return <h1 className="heading-m">{props.t("BPA_UPLOAD_SCANNED_SIGNATURE")}</h1>;
};

const CloseBtn = (props) => {
    return (
        <div className="icon-bg-secondary" onClick={props.onClick}>
            <Close />
        </div>
    );
};

export const BPASearchModal = ({ closeModal, edcrData }) => {
    const myElementRef = useRef(null);
    const [applicationNumber, setApplicationNumber] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const isMobile = window.Digit.Utils.browser.isMobile();
    const { t } = useTranslation();
    const tenantId = localStorage.getItem("CITIZEN.CITY")
    const [showToast, setShowToast] = useState(null);
    const [searchedData, setSearchedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bpaLinks, setBpaLinks] = useState({});
    const history = useHistory()
    const state = Digit.ULBService.getStateId();
    const { data: homePageUrlLinks, isLoading: homePageUrlLinksLoading } = Digit.Hooks.obps.useMDMS(state, "BPA", ["homePageUrlLinks"]);

    const handleApplicationNumberChange = (e) => {
        setApplicationNumber(e.target.value);
    };
    const handleMobileNumberChange = (e) => {
        setMobileNumber(e.target.value);
    };

    const handleSeacrh = async () => {
        if (mobileNumber && !Digit.Utils.getPattern("MobileNo").test(mobileNumber)) {
            setShowToast({ error: true, label: "CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID" });
            return;
        }
        if(!mobileNumber && !applicationNumber){
            setShowToast({ error: true, label: "CORE_COMMON_NO_MOBILE_NUMBER_AND_APPLICATION_NUMBER_MESSAGE" });
            return;
        }

        try {
            setIsLoading(true);
            const response = await Digit.OBPSService.BPASearch(tenantId, { 
                ...(mobileNumber?.length>0? {mobileNumber: mobileNumber} : {}),
                ...(applicationNumber?.length>0?{ applicationNo: applicationNumber} : {}),
                status: "BLOCKED",                
            });
            setIsLoading(false);
            if(response?.BPA?.length>0){
                setSearchedData(response?.BPA);
            }else{
                setSearchedData(null)
                setShowToast({error: true, label: t("ES_COMMON_NO_DATA")});
            }
        }catch(e){
            setIsLoading(false);
            setShowToast({error: true, label: t(e.message)});
        }
    }

    useEffect(() => {
        if (!homePageUrlLinksLoading && homePageUrlLinks?.BPA?.homePageUrlLinks?.length > 0) {
            let uniqueLinks = [];
            homePageUrlLinks?.BPA?.homePageUrlLinks?.map((linkData) => {
                console.log("edcrData------", linkData?.applicationType, edcrData?.appliactionType?.toUpperCase().split(" ").join("_"));
                // if (linkData?.applicationType === edcrData?.appliactionType?.toUpperCase().split(" ").join("_") && linkData?.serviceType === edcrData?.applicationSubType) {
                if (linkData?.applicationType === edcrData?.appliactionType && linkData?.serviceType === edcrData?.applicationSubType) {
                    setBpaLinks({
                        linkData: linkData,
                        edcrNumber: edcrData?.edcrNumber,
                    });
                }
            });
        }
    }, [!homePageUrlLinksLoading]);

    const documentsColumns = [
            {
                Header: t("Application Number"),
                accessor: "applicationNo",
                Cell: ({ value }) => value || t("CS_NA"),
            },
            {
                Header: t("Status"),
                accessor: "status",
                Cell: ({ value }) => t(value) || t("CS_NA"),
            },            
            {
                Header: t("Mobile Number"),
                accessor: "landInfo",
                Cell: ({ value }) => {
                    let ownerObject;
                    if (value?.owners?.length === 1) {
                        ownerObject = value?.owners[0];
                    } else {
                        ownerObject = value?.owners?.find(value => value?.isPrimaryOwner)
                    }
                    return ownerObject?.mobileNumber || "";
                },
            },            
        {
            Header: t(""),
            accessor: "id",
            Cell: ({ value }) =>                                    
            <SubmitBar label={t("Select")} onSubmit={() => {
                const selectedData = searchedData?.find((val) => val?.id === value);
                console.log("Selected Application", selectedData)
                getBPAFormDataNewEDCR(selectedData, edcrData?.edcrNumber,history, t)                
            }}/>
        },
        ];

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
                        <TextInput
                            t={t} 
                            isMandatory={false} 
                            key={"mobileNumber"}
                            value={mobileNumber} //{propertyId}
                            onChange={handleMobileNumberChange}
                            maxlength={10}
                            placeholder={t("BPA_OWNER_MOBILE_NO_PLACEHOLDER")} 
                            defaultValue={undefined}                         
                        />

                        {/* {!isSearchClicked && !isLoading && ( */}
                            <button className="submit-bar" type="button" style={{ color: "white", width: "100%", maxWidth: "100px" }} onClick={handleSeacrh}>
                                {`${t("PT_SEARCH")}`}
                            </button>
                        {/* )} */}
                    </div>
                    <div>
                        {searchedData && searchedData?.length > 0 && <StatusTable>
                            {(isLoading) ? <Loader /> : <Table
                                className="customTable table-border-style"
                                t={t}
                                data={searchedData}
                                columns={documentsColumns}
                                getCellProps={() => ({ style: {} })}
                                disableSort={false}
                                autoSort={true}
                                manualPagination={false}
                                isPaginationRequired={false}
                            />}
                        </StatusTable>}
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
            </Modal>
        </React.Fragment>
    )
}