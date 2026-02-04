import React, { useState, useEffect, useRef } from "react";
import { CardLabel, LabelFieldPair, TextInput, Toast, Loader, Row, StatusTable, Modal, Card, Table, SubmitBar, Dropdown, RadioOrSelect} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { RESET_OBPS_FORM, UPDATE_OBPS_FORM } from "../redux/actions/OBPSActions";
import { useLocation } from "react-router-dom";
// import { Loader } from "../components/Loader";

const getAddress = (address, t) => {
    return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${address?.landmark ? `${address?.landmark}, ` : ""
        }${t(Digit.Utils.pt.getMohallaLocale(address?.locality.code, address?.tenantId))}, ${t(Digit.Utils.pt.getCityLocale(address?.tenantId))}${address?.pincode && t(address?.pincode) ? `, ${address.pincode}` : " "
        }`;
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

export const PropertySearchModal = ({ key = "cpt", onSelect, formData, setApiLoading, menuList, closeModal, confirmPropertyChange, option }) => {
    const { t } = useTranslation();
    const myElementRef = useRef(null);
    const dispatch = useDispatch();
    let { pathname, state } = useLocation();
    state = state && (typeof state === "string" || state instanceof String) ? JSON.parse(state) : state;
    const apiDataCheck = useSelector((state) => state?.obps?.OBPSFormReducer?.formData?.createdResponse);
    console.log("StateInPropertySearch", formData, key);
    const isEditScreen = pathname.includes("/modify-application/");
    const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
    const search = useLocation().search;
    const urlPropertyId = new URLSearchParams(search).get("propertyId");
    const isfirstRender = useRef(true);
    const [getLoader, setLoader] = useState(false);

    const ptFromApi = apiDataCheck?.additionalDetails?.propertyuid;

    const [propertyId, setPropertyId] = useState("");
    const [searchPropertyId, setSearchPropertyId] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [name, setName] = useState("");
    const [searchMobileNumber, setSearchMobileNumber] = useState("");
    const [showToast, setShowToast] = useState(null);
    const [propertyData, setPropertyData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLocality, setSelectedLocality] = useState({})
    const [propertyDetails, setPropertyDetails] = useState({
        Properties: [],
    });
    const isMobile = window.Digit.Utils.browser.isMobile();

    const [isSearchClicked, setIsSearchClicked] = useState(false);

    const documentsColumns = [
        {
            Header: t("Property ID"),
            accessor: "propertyId",
            Cell: ({ value }) => value || t("CS_NA"),
        },
        {
            Header: t("Mobile Number"),
            accessor: "owners",
            Cell: ({ value }) => {
                let ownerObject;
                if (value?.length === 1) {
                    ownerObject = value?.[0];
                } else {
                    ownerObject = value?.find(value => value?.isPrimaryOwner)
                }
                return ownerObject?.mobileNumber || "";
            },
        },
        {
            Header: t("Owner"),
            accessor: "acknowldgementNumber",
            Cell: ({ value }) => {
                const selectedProperty = propertyData?.find((val) => val?.acknowldgementNumber === value);
                let ownerObject;
                if (selectedProperty?.owners?.length === 1) {
                    ownerObject = selectedProperty?.owners?.[0];
                } else {
                    ownerObject = selectedProperty?.owners?.find(val => val?.isPrimaryOwner)
                }
                return ownerObject?.name || "";
            },
        },
        {
            Header: t("Address"),
            accessor: "address",
            Cell: ({ value }) => {
                const { doorNo, buildingName, city, state } = value || {};

                const parts = [doorNo, buildingName, city, state].filter(Boolean);
                const finalAddress = parts.join(", ");

                return finalAddress || "-";
            },
        },
        {
            Header: t("Plot Area"),
            accessor: "landArea",
            Cell: ({ value }) => value || t("CS_NA"),
        },
        {
            Header: t(""),
            accessor: "id",
            Cell: ({ value }) =>
                <SubmitBar label={t("Select")} onSubmit={() => {
                    const selectedProperty = propertyData?.find((val) => val?.id === value);
                    setPropertyDetails({
                        Properties: [{ ...selectedProperty }]
                    })
                }}
                    style={{ width: "100px" }} />
        },
    ];

    const { data: fetchedLocalities, isLoading: isBoundaryLoading } = Digit.Hooks.useBoundaryLocalities(
    tenantId,
    "revenue",
    {},
    t
    );

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        if(windowWidth != window.innerWidth){
            setWindowWidth(window.innerWidth)
        }
    })

    console.log("window.innerWidth", window.innerWidth)

    useEffect(() => {
        if (menuList && propertyDetails?.Properties?.[0]?.address?.locality
            //  && !formData?.createdResponse?.additionalDetails
        ) {
            const boundary = menuList?.["egov-location"]?.TenantBoundary?.find(item => item?.hierarchyType?.code === "REVENUE")?.boundary;
            let ward = {}
            const zone = boundary?.children?.find(item => item?.children?.some((children) => {
                if (children?.children?.some(child => child?.code === propertyDetails?.Properties?.[0]?.address?.locality?.code)) {
                    ward = children
                    return true
                } else {
                    return false
                }
            }));
            dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], zonalMapping: { zone, ward } }));
        }
    }, [menuList, propertyDetails?.Properties?.[0]?.address?.locality]);

    
    useEffect(() => {
        if (menuList && (propertyDetails?.Properties?.length > 0)) {
            if (propertyDetails?.Properties?.[0]?.address?.locality) {
                const boundary = menuList?.["egov-location"]?.TenantBoundary?.find(item => item?.hierarchyType?.code === "REVENUE")?.boundary;
                let ward = {}
                const zone = boundary?.children?.find(item => item?.children?.some((children) => {
                    if (children?.children?.some(child => child?.code === propertyDetails?.Properties?.[0]?.address?.locality?.code)) {
                        ward = children
                        return true
                    } else {
                        return false
                    }
                }));
                dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], details: propertyDetails?.Properties?.[0], id: propertyDetails?.Properties?.[0]?.propertyId, zonalMapping: { zone, ward } }));
                closeModal();
                if(formData?.createdResponse?.applicationNo){
                    confirmPropertyChange(option);
                }
            } else {
                dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], details: propertyDetails?.Properties?.[0], id: propertyDetails?.Properties?.[0]?.propertyId }));
                closeModal();
                if(formData?.createdResponse?.applicationNo){
                    confirmPropertyChange(option);
                }
            }
        }
    }, [menuList, propertyDetails]);


    const searchProperty = async () => {        
        if (mobileNumber && !Digit.Utils.getPattern("MobileNo").test(mobileNumber)) {
            setShowToast({ error: true, label: "CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID" });
            return;
        }
        if(name && !selectedLocality?.code){
            setShowToast({ error: true, label: "PLEASE_SELECT_LOCALITY_WITH_NAME" });
            return;
        }
        if((!(name || propertyId || mobileNumber) && selectedLocality?.code)){
            setShowToast({ error: true, label: "CAN_NOT_SEARCH_ONLY_BASED_ON_LOCALITY" });
            return;
        }
        setIsLoading(true);


        try {
            const fetchedData = await Digit.PTService.search({
                tenantId, filters: {
                    ...(propertyId?.length > 0 ? { propertyIds: propertyId } : {}), ...(mobileNumber?.length > 0 ? { mobileNumber: mobileNumber } : {}),
                    ...(selectedLocality?.code?.length > 0 ? { locality: selectedLocality?.code} : {}), ...(name?.length > 0 ? { name: name} : {})
                }
            })
            console.log("fetchedData", fetchedData, propertyId, mobileNumber);
            if (fetchedData?.Properties?.length > 0) {
                setIsLoading(false)
                setPropertyData(fetchedData?.Properties)                
            }else{
                setIsLoading(false)
                setShowToast({ error: true, label: "CS_PT_NO_PROPERTIES_FOUND" });
                return;
            }
        } catch (err) {
            setIsLoading(false)
            setShowToast({ error: true, label: t(err.message) });
            return;
        }
    };

    const stringReplaceAll = (str = "", searcher = "", replaceWith = "") => {
        if (searcher == "") return str;
        while (str.includes(searcher)) {
            str = str.replace(searcher, replaceWith);
        }
        return str;
    };

    const handlePropertyChange = (e) => {
        setPropertyId(e.target.value);
    };

    const handleMobileChange = (e) => {
        setMobileNumber(e.target.value);
    }

    const handleNameChange = (e) => {
        setName(e.target.value);
    }

    if (isEditScreen) {
        return <React.Fragment />;
    }

    let propertyAddress = "";

    if (propertyDetails && propertyDetails?.Properties?.length) {
        propertyAddress = getAddress(propertyDetails?.Properties?.[0]?.address, t);
    }
    const getInputStyles = () => {
        if (window.location.href.includes("/ws/")) {
            return { fontWeight: "700" };
        } else return {};
    };

    let clns = "";
    if (window.location.href.includes("/ws/")) clns = ":";

    const propertyIdInput = {
        label: "PROPERTY_ID",
        type: "text",
        name: "id",
        isMandatory: false
    };

    function setValue(value, input) {
        dispatch(UPDATE_OBPS_FORM(key, { ...formData[key], [input]: value }));
    }

    function getValue(input) {
        return formData && formData[key] ? formData[key][input] : undefined;
    }

    function selectLocality(locality) {        
        setSelectedLocality(locality);        
    }


    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(null);
            }, 3000); // auto close after 3 sec

            return () => clearTimeout(timer); // cleanup
        }
    }, [showToast]);

      useEffect(() => {
        console.log("fetchedLocalities",fetchedLocalities)
      },[fetchedLocalities])

    if(isBoundaryLoading) return <Loader />

    return (
        <React.Fragment>
            <Modal
                headerBarEnd={<CloseBtn onClick={closeModal} />}            
                formId="modal-action"
                popupStyles={{
                    width: "unset",
                    minWidth: "1000px",
                    padding:"20px",
                }}
                hideSubmit={true}
            >
                {/* <div style={{ marginBottom: "16px", marginTop: "20px" }}> */}                
                    <LabelFieldPair>
                        <div
                            className="field ndc_property_search"
                            style={{ display: "flex", gap: "16px", width: "100%",...(isMobile? {
                                flexDirection: "column"
                            } : {}) }}
                            ref={myElementRef}
                            id="search-property-field"
                        >
                            <TextInput
                                key={propertyIdInput.name}
                                value={propertyId} //{propertyId}
                                onChange={handlePropertyChange}
                                disable={false}
                                // maxlength={16}
                                placeholder={t("PT_PROPERTY_ID_PLACEHOLDER")}
                                defaultValue={undefined}
                                {...propertyIdInput.validation}
                            />
                            <TextInput
                                key={"mobileNumber"}
                                value={mobileNumber}
                                onChange={handleMobileChange}
                                disable={false}
                                maxlength={10}
                                placeholder={t("BPA_OWNER_MOBILE_NO_PLACEHOLDER")}
                                defaultValue={undefined}
                                {...propertyIdInput.validation}
                            />
                            <TextInput
                                key={"name"}
                                value={name}
                                onChange={handleNameChange}
                                disable={false}
                                // maxlength={10}
                                placeholder={t("BPA_ENTER_APPLICANT_NAME_PLACEHOLDER")}
                                defaultValue={undefined}
                                {...propertyIdInput.validation}
                            />
                            <Dropdown
                                optionCardStyles={{ maxHeight: "20vmax", overflow: "scroll", marginTop: "20px" }}
                                isMandatory={false}
                                option={fetchedLocalities.sort((a, b) => a.name.localeCompare(b.name))}
                                selected={selectedLocality}
                                optionKey="i18nkey"
                                select={selectLocality}
                                t={t}
                                placeholder={t("BPA_LOC_MOHALLA_LABEL")}
                                // labelKey={`${stringReplaceAll(tenantId, ".", "_").toUpperCase()}_REVENUE`}
                            />
                            {/* <RadioOrSelect
                                optionCardStyles={{ maxHeight: "20vmax", overflow: "scroll", marginTop: "20px" }}
                                isMandatory={false}
                                options={fetchedLocalities.sort((a, b) => a.name.localeCompare(b.name))}
                                selectedOption={selectedLocality}
                                optionKey="i18nkey"
                                onSelect={selectLocality}
                                t={t}
                                labelKey={`${stringReplaceAll(tenantId, ".", "_").toUpperCase()}_REVENUE`}
                            /> */}
                            {/* <Dropdown
                                      isMandatory={isMandatory}
                                      selected={selectedOption}
                                      style={dropdownStyle}
                                      optionKey={optionKey}
                                      option={options}
                                      select={onSelect}
                                      t={t}
                                      disable={disabled}
                                      optionCardStyles={optionCardStyles}
                                    /> */}
                            {!isSearchClicked && (
                                <button className="submit-bar" type="button" style={{ color: "white", width: "100%", maxWidth: "100px" }} onClick={searchProperty}>
                                    {`${t("PT_SEARCH")}`}
                                </button>
                            )}
                            {/* {isLoading && <Loader />} */}

                        </div>
                    </LabelFieldPair>
                    {/* {formData?.cpt?.details && <StatusTable><Row className="border-none" label={t(`PT_ACKNOWLEDGEMENT_NUMBER`)} text={formData?.cpt?.details?.acknowldgementNumber || NA} /></StatusTable>} */}
                    {/* {<StatusTable> */}
                        {(isLoading ) ? <Loader /> : propertyData?.length>0 && <Table
                            className="customTable table-border-style"
                            t={t}
                            data={propertyData}
                            columns={documentsColumns}
                            getCellProps={() => ({ style: {} })}
                            disableSort={false}
                            autoSort={true}
                            manualPagination={false}
                            isPaginationRequired={false}
                        />}
                    {/* </StatusTable>} */}

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
                {/* </div> */}
            </Modal>
            {/* {(isLoading || getLoader) && <Loader page={true} />} */}
        </React.Fragment>
    );
};