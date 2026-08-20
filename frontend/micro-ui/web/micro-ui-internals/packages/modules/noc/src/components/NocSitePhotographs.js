import React, { useEffect, useState } from "react";
import { ImageViewer, Card, CardSubHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const NocSitePhotographs = ({ filestoreId, documentType, coordinates }) => {
  const stateCode = Digit.ULBService.getStateId();
  const { t } = useTranslation();
  const [imageCitizenZoom, setImageCitizenZoom] = useState(null);
  const [imageZoom, setImageZoom] = useState(null);

  const onCloseImageZoom = () => {
    setImageZoom(null);
  };

  useEffect(() => {
    (async () => {
      if (filestoreId) {
        const result = await Digit.UploadServices.Filefetch([filestoreId], stateCode);
        if (result?.data?.fileStoreIds) {
          setImageCitizenZoom(result.data.fileStoreIds[0]?.url);
        }
      }
    })();
  }, [filestoreId]);

  return (
    <div className="noc-components-noc-site-photographs--style-1">
      <div className="noc-components-noc-site-photographs--style-2">
        <div className="noc-components-noc-site-photographs--style-3">
          <div>
          <span>{t(documentType?.replaceAll(".", "_"))}</span>
        </div>
          <img
            src={imageCitizenZoom}
            alt={t(documentType?.replaceAll(".", "_"))}
            className={imageCitizenZoom ? "noc-site-photographs__image noc-site-photographs__image--clickable" : "noc-site-photographs__image"}
            onClick={() => imageCitizenZoom && setImageZoom(imageCitizenZoom)}
          />
          <div>Latitude - {documentType === "OWNER.SITEPHOTOGRAPHONE" ? coordinates?.Latitude1 : coordinates?.Latitude2}</div>
          <div>Longitude - {documentType === "OWNER.SITEPHOTOGRAPHONE" ? coordinates?.Longitude1 : coordinates?.Longitude2}</div>
        </div>
      </div>
      {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
    </div>
  );
};

export default NocSitePhotographs;

