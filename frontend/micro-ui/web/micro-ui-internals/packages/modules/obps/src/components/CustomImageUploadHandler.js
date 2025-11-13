import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Toast, UploadImages } from "@mseva/digit-ui-react-components";
import CustomUploadImages from "./CustomUploadImages";
import EXIF from "exif-js";

const maxImageSize = process.env.IMAGE_MAX_UPLOAD_SIZE || 11534336;
const imageSize = process.env.IMAGE_UPLOAD_SIZE || 2097152;

export const CustomImageUploadHandler = (props) => {
    // const __initImageIds = Digit.SessionStorage.get("PGR_CREATE_IMAGES");
    // const __initThumbnails = Digit.SessionStorage.get("PGR_CREATE_THUMBNAILS");
    const [image, setImage] = useState(null);
    const [uploadedImagesThumbs, setUploadedImagesThumbs] = useState([]);
    const [uploadedImagesIds, setUploadedImagesIds] = useState(props.uploadedImages);
    const { t } = useTranslation();

    const [rerender, setRerender] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");
    const [isFileUploading, setIsFileUploading] = useState(false)

    useEffect(() => {
        if (image) {
            uploadImage();
        }
    }, [image]);

    useEffect(() => {
        if (!isDeleting) {
            (async () => {
                if (uploadedImagesIds !== null) {
                    await submit();
                    setRerender(rerender + 1);
                    props.onPhotoChange(uploadedImagesIds);
                }
            })();
        } else {
            props.onPhotoChange(uploadedImagesIds);
            setIsDeleting(false);
        }
    }, [uploadedImagesIds]);

    useEffect(async () => {
        if (imageFile && imageFile.size > maxImageSize) {
            setError("Image Size Should be less than 10MB")
        } else {
            if (imageFile && imageFile.size > imageSize) {
                let compressImageFile = await Digit.Utils.compressImage(imageFile);
                setImage(compressImageFile);
            } else
                setImage(imageFile);
        }
    }, [imageFile]);

    const addUploadedImageIds = useCallback(
        (imageIdData) => {
            if (uploadedImagesIds === null) {
                var arr = [];
            } else {
                arr = uploadedImagesIds;
            }
            return [...arr, imageIdData.data.files[0].fileStoreId];
        },
        [uploadedImagesIds]
    );

    function convertToDecimal([degrees, minutes, seconds], ref) {
        const d = degrees?.numerator / degrees?.denominator || 0;
        const m = minutes?.numerator / minutes?.denominator || 0;
        const s = seconds?.numerator / seconds?.denominator || 0;

        let decimal = d + m / 60 + s / 3600;
        if (ref === "S" || ref === "W") decimal = -decimal;
        return decimal;
    }

    function extractGeoLocation(file) {
        return new Promise((resolve) => {
            EXIF.getData(file, function () {
                const lat = EXIF.getTag(this, "GPSLatitude");
                const lon = EXIF.getTag(this, "GPSLongitude");
                const latRef = EXIF.getTag(this, "GPSLatitudeRef");
                const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

                if (lat && lon && latRef && lonRef) {
                    const latitude = convertToDecimal(lat, latRef);
                    const longitude = convertToDecimal(lon, lonRef);
                    resolve({ latitude, longitude });
                } else {
                    resolve({ latitude: null, longitude: null });
                }
            });
        });
    }

    async function getImage(e) {
        setError(null);
        const file = e.target.files[0];
        console.log("uploadFile", file);
        if (!file) return;

        setIsFileUploading(true);
        const geo = await extractGeoLocation(file);
        if (!geo.latitude || !geo.longitude) {
            setError(t("This image does not contain GPS location data"));
            setIsFileUploading(false);
            return;
        }

        props?.setGeoLocations((prev) => [...prev, geo])
        setIsFileUploading(false);
        setImageFile(e.target.files[0]);
    }

    const uploadImage = useCallback(async () => {
        setIsFileUploading(true)
        try {
            const response = await Digit.UploadServices.Filestorage("property-upload", image, props.tenantId);
            setUploadedImagesIds(addUploadedImageIds(response));
            setIsFileUploading(false)
        }
        catch (err) {
            setIsFileUploading(false)
            props.setGeoLocations((prevItems) => prevItems.slice(0, -1))
            setError(err.message)
        }
    }, [addUploadedImageIds, image]);

    // function addImageThumbnails(thumbnailsData) {
    //     //debugger
    //     var keys = Object.keys(thumbnailsData.data);
    //     var index = keys.findIndex((key) => key === "fileStoreIds");
    //     if (index > -1) {
    //         keys.splice(index, 1);
    //     }
    //     var thumbnails = [];
    //     // if (uploadedImagesThumbs !== null) {
    //     //   thumbnails = uploadedImagesThumbs.length > 0 ? uploadedImagesThumbs.filter((thumb) => thumb.key !== keys[0]) : [];
    //     // }

    //     const newThumbnails = keys.map((key) => {
    //         //return { image: thumbnailsData.data[key].split(",")[2], key };
    //         return { image: thumbnailsData.data[key], key };
    //     });

    //     setUploadedImagesThumbs([...thumbnails, ...newThumbnails]);
    // }

    function addImageThumbnails(thumbnailsData) {
        const { data } = thumbnailsData;

        console.log("dataOfthumbnailsData 1",data)
        const newuploadedImagesThumbs = uploadedImagesThumbs?.map((val) => val?.key)
        const newImageObject = data?.fileStoreIds?.find((value) => !newuploadedImagesThumbs?.includes(value?.id));
        console.log("newImageObject", newImageObject)

        // Append new thumbnails at the end of existing ones
        setUploadedImagesThumbs((prev) => [...prev, {
            image: newImageObject?.url,
            key: newImageObject?.id
        }]);
        }

    const submit = useCallback(async () => {
        if (uploadedImagesIds !== null && uploadedImagesIds.length > 0) {
            const res = await Digit.UploadServices.Filefetch(uploadedImagesIds, props.tenantId);
            //console.log("Hellores",res)
            addImageThumbnails(res);
        }
    }, [uploadedImagesIds]);

    // function deleteImage(img) {
    //     setIsDeleting(true);
    //     console.log("deleteImageKey 0", uploadedImagesThumbs, img)
    //     var deleteImageKey = uploadedImagesThumbs.filter((o, index) => o.image === img);
    //     console.log("deleteImageKey 1", deleteImageKey)
    //     var uploadedthumbs = uploadedImagesThumbs;
    //     var newThumbsList = uploadedthumbs.filter((thumbs) => thumbs != deleteImageKey[0]);
    //     console.log("deleteImageKey 2", newThumbsList)
    //     var indexOfImage = uploadedImagesIds.findIndex((key) => key === deleteImageKey[0].key)
    //     var newUploadedImagesIds = uploadedImagesIds.filter((key) => key !== deleteImageKey[0].key);
    //     console.log("deleteImageKey 3", newUploadedImagesIds, indexOfImage)
    //     setUploadedImagesThumbs(newThumbsList);
    //     setUploadedImagesIds(newUploadedImagesIds);
    //     Digit.SessionStorage.set("PGR_CREATE_IMAGES", newUploadedImagesIds);
    // }
    function deleteImage(index) {
        setIsDeleting(true);
        var newThumbsList = uploadedImagesThumbs?.filter((thumbs, thumbIndex) => index !== thumbIndex);
        var newUploadedImagesIds = uploadedImagesIds?.filter((key, imageIndex) => index !== imageIndex);
        var updatedGeolocations = props?.geoLocations?.filter((key, imageIndex) => index !== imageIndex);
    
        console.log("deleteImageKey", newThumbsList, newUploadedImagesIds, updatedGeolocations, index)
        props.setGeoLocations(updatedGeolocations)
        setUploadedImagesThumbs(newThumbsList);
        setUploadedImagesIds(newUploadedImagesIds);
        Digit.SessionStorage.set("PGR_CREATE_IMAGES", newUploadedImagesIds);
    }
    //console.log("uploadedImagesThumbs",uploadedImagesThumbs)
    return (
        <React.Fragment>
            {error && <Toast error={true} label={error} onClose={() => setError(null)} />}
            {/* {isFileUploading && <Loader />} */}
            <CustomUploadImages onUpload={getImage} onDelete={deleteImage} thumbnails={uploadedImagesThumbs ? uploadedImagesThumbs.map((o) => o.image) : []} isFileUploading={isFileUploading} t={t} />
        </React.Fragment>
    );
};
