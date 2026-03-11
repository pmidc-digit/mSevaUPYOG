import React, { useState, useEffect, useMemo } from "react";
import { CardLabel, LabelFieldPair, Dropdown, TextInput, LinkButton, DatePicker, CardSectionHeader, CardSubHeader , DeleteIcon, ImageUploadHandler, SubmitBar, StatusTable, Row } from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import CustomLocationSearch from "../components/CustomLocationSearch";
import SelectNDCDocuments from "../components/ChallanDocuments";


const createUnitDetails = () => ({
    InspectionDate: "",
    InspectionTime: "",
    Checklist: [],
    Documents: [],
    key: Date.now(),
});

const CustomGeoLocationButton = ({geoLocation}) =>{
    const { t } = useTranslation();
    const routeTo = () => {
        window.open(`https://bharatmaps.gov.in/BharatMaps/Home/Map?lat=${Number(geoLocation.latitude).toFixed(6)}&long=${Number(geoLocation.longitude).toFixed(6)}`, "_blank")
    }

    return (
        <LinkButton style={{ float: "right", display: "inline" }}
            label={t("View")}
            onClick={() => routeTo()}
        />
    )
}

export const SiteInspection = ({ siteImages, setSiteImages, customOpen }) => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const isEditScreen = pathname.includes("/modify-application/");
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const stateId = Digit.ULBService.getStateId();
    const [error, setError] = useState(null);
    const { data: docData, isLoading } = Digit.Hooks.useCustomMDMS(stateId, "FieldInspection", [{ name: "Documents" }]);
    console.log('docData here in fieldinspe', docData)

    const handleUpload = (key, ids) => {
        setSiteImages(ids)
    }

    const geoLocations = useMemo(() => {
        if (siteImages?.documents && siteImages?.documents.length > 0) {
            return siteImages?.documents?.map((img) => {
                return {
                    latitude: img?.latitude || "",
                    longitude: img?.longitude || "",
                }
            })}
    }, [siteImages]);

    return (
        <div>
            <React.Fragment>
                <CardSubHeader style={{ marginBottom: "16px", marginTop: "32px" }}>{t("SITE_INPECTION_IMAGES")}</CardSubHeader>                               
                {/* <CustomImageUploadHandler tenantId={stateId} uploadedImages={siteImages || null} onPhotoChange={(ids) => {handleUpload(ids)}} geoLocations={geoLocations} setGeoLocations={setGeoLocations} />                 */}
                <div style={{ marginTop: "20px" }}>
                    <SelectNDCDocuments
                        t={t}
                        config={{ key: "documents" }}
                        onSelect={handleUpload}
                        userType="CITIZEN"
                        formData={{ documents: siteImages }}
                        setError={setError}
                        error={error}
                        clearErrors={() => { }}
                        formState={{}}
                        data={docData}
                        isLoading={isLoading}
                        customOpen={customOpen}
                    />
                </div>

                {geoLocations?.length > 0 &&
                <React.Fragment>
                <CardSubHeader style={{ marginBottom: "16px", marginTop: "32px" }}>{t("SITE_INSPECTION_IMAGES_LOCATIONS")}</CardSubHeader>
                <CustomLocationSearch position={geoLocations}/>
                </React.Fragment>
                }
                {/* {geoLocations?.length > 0 &&
                <React.Fragment>                
                <StatusTable>
                {geoLocations?.map((value, index) => 
                    <Row 
                        className="border-none"
                        label={t("SITE_GEO_LOCATION_"+(index+1))}
                        actionButton={<CustomGeoLocationButton geoLocation={value}/>}
                    />
                )}
                </StatusTable>
                </React.Fragment>
                } */}
            </React.Fragment>            
        </div>
    );
};