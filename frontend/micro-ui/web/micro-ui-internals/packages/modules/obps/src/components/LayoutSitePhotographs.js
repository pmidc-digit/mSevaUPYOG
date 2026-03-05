import React, { useEffect, useState, useMemo } from "react";
import { ImageViewer, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const LayoutSitePhotographs = ({ filestoreId, documentType, coordinates, documents = [] }) => {
  const { t } = useTranslation();
  const stateCode = Digit.ULBService.getStateId();
  const [imageCitizenZoom, setImageCitizenZoom] = useState(null);
  const [imageZoom, setImageZoom] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const onCloseImageZoom = () => {
    setImageZoom(null);
  };

  // Handle both new API (filestoreId, documentType) and legacy API (documents array)
  const actualFilestoreId = filestoreId || documents?.[0]?.filestoreId || documents?.[0]?.fileStoreId;
  const actualDocumentType = documentType || documents?.[0]?.documentType;

  useEffect(() => {
    (async () => {
      if (actualFilestoreId) {
        const result = await Digit.UploadServices.Filefetch([actualFilestoreId], stateCode);
        if (result?.data?.fileStoreIds) {
          const url = result.data.fileStoreIds[0]?.url;
          setImageCitizenZoom(url);
          setImageUrl(url);
        }
      }
    })();
  }, [actualFilestoreId]);

  // Get coordinates based on document type
  const getCoordinates = () => {
    if (!coordinates) return null;
    
    switch (actualDocumentType) {
      case "OWNER.SITEPHOTOGRAPHONE":
        return {
          latitude: coordinates?.Latitude1,
          longitude: coordinates?.Longitude1
        };
      case "OWNER.SITEPHOTOGRAPHTWO":
        return {
          latitude: coordinates?.Latitude2,
          longitude: coordinates?.Longitude2
        };
      case "SITE.PHOTOGRAPHONE":
        return {
          latitude: coordinates?.Latitude3,
          longitude: coordinates?.Longitude3
        };
      case "SITE.PHOTOGRAPHTWO":
        return {
          latitude: coordinates?.Latitude4,
          longitude: coordinates?.Longitude4
        };
      default:
        return null;
    }
  };

  const coords = getCoordinates();
  const docTitle = t(actualDocumentType?.replaceAll(".", "_")) || t("CS_NA");

  return (
    <div style={{ padding: "20px 0px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", padding: "0px 20px" }}>
        <div style={{ textAlign: "start" }}>
          <div>
            <span>{docTitle}</span>
          </div>
          <img
            src={imageCitizenZoom}
            alt={docTitle}
            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10%", cursor: imageCitizenZoom ? "pointer" : "default" }}
            onClick={() => imageCitizenZoom && setImageZoom(imageCitizenZoom)}
          />
          {coords?.latitude && <div>Latitude - {coords.latitude}</div>}
          {coords?.longitude && <div>Longitude - {coords.longitude}</div>}
        </div>
      </div>
      {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
    </div>
  );
};

export default LayoutSitePhotographs;
