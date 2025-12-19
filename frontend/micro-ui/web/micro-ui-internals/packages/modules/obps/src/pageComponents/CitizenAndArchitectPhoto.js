import React, { useEffect, useState, useMemo, use } from "react";
import { fromUnixTime, format } from "date-fns";
import {
    TextInput,
    Header,
    Toast,
    Card,
    StatusTable,
    Row,
    Loader,
    Menu,
    PDFSvg,
    SubmitBar,
    LinkButton,
    ActionBar,
    CheckBox,
    MultiLink,
    CardText,
    CardSubHeader,
    CardLabel,
    OTPInput,
    TextArea,
    UploadFile,
    CardHeader,
    Table,
    ImageViewer
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const CitizenAndArchitectPhoto = ({data}) => {
    const stateCode = Digit.ULBService.getStateId();
    const tenantId = Digit.ULBService.getCurrentTenantId();
    const { t } = useTranslation();
    const userInfo = Digit.UserService.getUser();
    // const queryObject = { 0: { tenantId: stateCode }, 1: { mobileNumber: data?.additionalDetails?.architectMobileNumber } };
    // const { data: LicenseData, isLoading: LicenseDataLoading } = Digit.Hooks.obps.useBPAREGSearch(tenantId, queryObject);
    const [imageArchitectZoom, setImageArchitectZoom] = useState(null);
    const [imageCitizenZoom, setImageCitizenZoom] = useState(null);
    const [imageZoom, setImageZoom] = useState(null);

    const onCloseImageZoom = () => {
        setImageZoom(null);
    };
    useEffect(async () => {
        if(data){
            let primaryOwner = data?.landInfo?.owners?.find((owner) => owner?.isPrimaryOwner === true);
            const ownerPhotoId = primaryOwner?.additionalDetails?.ownerPhoto || null;
            if(ownerPhotoId){
                const result = await Digit.UploadServices.Filefetch([ownerPhotoId], stateCode);
                if (result?.data?.fileStoreIds) setImageCitizenZoom(result?.data?.fileStoreIds[0]?.url);
            } 
        }
    }, [data]);
    useEffect(async () => {
        if (data) {
            // let approvedLicense = LicenseData?.Licenses?.find(license => license?.status === "APPROVED");
            // console.log("imageArchitectZoom",approvedLicense);
            // if (approvedLicense) {
                let architectPhotoId = data?.additionalDetails?.architectPhoto || null;
                if(architectPhotoId){
                    const result = await Digit.UploadServices.Filefetch([architectPhotoId], stateCode);
                    if (result?.data?.fileStoreIds) setImageArchitectZoom(result?.data?.fileStoreIds[0]?.url);
                }
            // }
        }
    },[data])
    
return(
    <Card>
        <CardSubHeader className="citizen-and-architect-photo-header">{t("BPA_CITIZEN_AND_ARCHITECT_PHOTO")}</CardSubHeader>
        <div className="citizen-and-architect-photo-container">
            <div className="citizen-and-architect-photo-item">
                <img
                    src={imageCitizenZoom}
                    alt="Citizen"
                    className={`citizen-and-architect-photo-image ${imageCitizenZoom ? "citizen-and-architect-photo-clickable" : ""}`}
                    onClick={() => imageCitizenZoom && setImageZoom(imageCitizenZoom)}
                />
                <div className="citizen-and-architect-photo-label">{data?.landInfo?.owners?.find((owner) => owner?.isPrimaryOwner === true)?.name || t("BPA_CITIZEN_PHOTO")}</div>
            </div>
            <div className="citizen-and-architect-photo-item">
                <img
                    src={imageArchitectZoom}
                    alt="Architect"
                    className={`citizen-and-architect-photo-image ${imageArchitectZoom ? "citizen-and-architect-photo-clickable" : ""}`}
                    onClick={() => imageArchitectZoom && setImageZoom(imageArchitectZoom)}
                />
                <div className="citizen-and-architect-photo-label">{data?.additionalDetails?.stakeholderName || t("BPA_ARCHITECT_PHOTO")}</div>
            </div>
        </div>
        {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
    </Card>
)
};

export default CitizenAndArchitectPhoto;