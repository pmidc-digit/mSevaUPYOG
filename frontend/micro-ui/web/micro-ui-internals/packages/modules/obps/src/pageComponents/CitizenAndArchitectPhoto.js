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

const getPhotoId = (photo) => {
    const value = typeof photo === "object" ? photo?.fileStoreId || photo?.id : photo;
    return typeof value === "string" ? value.split(",")[0].trim() : null;
};

const fetchPhotoUrl = async (photoIds, stateCode) => {
    for (const photoId of [...new Set(photoIds.map(getPhotoId).filter(Boolean))]) {
        if (/^https?:\/\//i.test(photoId)) return photoId;
        try {
            const result = await Digit.UploadServices.Filefetch([photoId], stateCode);
            const photoUrl = result?.data?.fileStoreIds?.find((item) => item?.fileStoreId === photoId)?.url ||
                result?.data?.fileStoreIds?.[0]?.url ||
                result?.data?.[photoId]?.split(",")?.[0];
            if (photoUrl) return photoUrl;
        } catch (error) {
            // Try the next available uploaded photo ID.
        }
    }
    return null;
};

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
    useEffect(() => {
        let isActive = true;
        setImageCitizenZoom(null);

        const loadCitizenPhoto = async () => {
            const owners = data?.additionalDetails?.owners?.length > 0 ? data.additionalDetails.owners : data?.landInfo?.owners || [];
            const primaryOwner = owners.find((owner) => owner?.isPrimaryOwner === true || owner?.isPrimaryOwner === "true") || owners[0];
            const photoUrl = await fetchPhotoUrl(
                [primaryOwner?.additionalDetails?.ownerPhoto, primaryOwner?.photo, primaryOwner?.photoUploadedFiles],
                stateCode
            );
            if (isActive) setImageCitizenZoom(photoUrl);
        };

        loadCitizenPhoto();
        return () => { isActive = false; };
    }, [data, stateCode]);

    useEffect(() => {
        let isActive = true;
        setImageArchitectZoom(null);

        const loadArchitectPhoto = async () => {
            const photoIds = [data?.additionalDetails?.architectPhoto];
            const architectMobile = data?.additionalDetails?.architectMobileNumber;

            if (architectMobile) {
                try {
                    const userResponse = await Digit.UserService.userSearch(stateCode, { mobileNumber: architectMobile }, {});
                    const architectUsers = userResponse?.user || [];
                    const architectUser =
                        architectUsers.find((user) => user?.roles?.some((role) => role?.code === "BPA_ARCHITECT" || role?.code === "ARCHITECT") && user?.photo) ||
                        architectUsers.find((user) => user?.roles?.some((role) => role?.code === "BPA_ARCHITECT" || role?.code === "ARCHITECT")) ||
                        architectUsers[0];
                    photoIds.unshift(architectUser?.photo, architectUser?.additionalDetails?.photo);
                } catch (error) {
                    // Fall back to the photo uploaded with the BPA application.
                }
            }

            const photoUrl = await fetchPhotoUrl(photoIds, stateCode);
            if (isActive) setImageArchitectZoom(photoUrl);
        };

        loadArchitectPhoto();
        return () => { isActive = false; };
    }, [data, stateCode]);

return(
    <Card>
        <div className="citizen-and-architect-photo-container">
            <div className="citizen-and-architect-photo-item">
                <CardSubHeader className="citizen-and-architect-photo-header">{t("BPA_CITIZEN_PHOTO")}</CardSubHeader>
                <img
                    src={imageCitizenZoom}
                    alt="Citizen"
                    className={`citizen-and-architect-photo-image ${imageCitizenZoom ? "citizen-and-architect-photo-clickable" : ""}`}
                    onClick={() => imageCitizenZoom && setImageZoom(imageCitizenZoom)}
                />
                <div className="citizen-and-architect-photo-label">{(data?.additionalDetails?.owners?.length > 0 ? data?.additionalDetails?.owners : data?.landInfo?.owners)?.find((owner) => owner?.isPrimaryOwner === true || owner?.isPrimaryOwner === "true")?.name || data?.additionalDetails?.owners?.[0]?.name || data?.landInfo?.owners?.[0]?.name || ""}</div>
            </div>
            <div className="citizen-and-architect-photo-item">
                <CardSubHeader className="citizen-and-architect-photo-header">{t("BPA_ARCHITECT_PHOTO")}</CardSubHeader>
                <img
                    src={imageArchitectZoom}
                    alt="Architect"
                    className={`citizen-and-architect-photo-image ${imageArchitectZoom ? "citizen-and-architect-photo-clickable" : ""}`}
                    onClick={() => imageArchitectZoom && setImageZoom(imageArchitectZoom)}
                />
                <div className="citizen-and-architect-photo-label">{data?.additionalDetails?.stakeholderName || ""}</div>
            </div>
        </div>
        {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
    </Card>
)
};

export default CitizenAndArchitectPhoto;
