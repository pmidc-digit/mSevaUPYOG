import React, { useEffect, useState } from "react";
import { ImageViewer, Card, CardSubHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const NocSitePhotographsBPA = ({ url, documentType, coordinates }) => {
  const stateCode = Digit.ULBService.getStateId();
  const { t } = useTranslation();
  // const [imageCitizenZoom, setImageCitizenZoom] = useState(null);
  const [imageZoom, setImageZoom] = useState(null);

  const onCloseImageZoom = () => {
    setImageZoom(null);
  };

  // useEffect(() => {
  //   (async () => {
  //     if (filestoreId) {
  //       const result = await Digit.UploadServices.Filefetch([filestoreId], stateCode);
  //       if (result?.data?.fileStoreIds) {
  //         setImageCitizenZoom(result.data.fileStoreIds[0]?.url);
  //       }
  //     }
  //   })();
  // }, [filestoreId]);

  return (
    <div className="obps-components-noc-site-photographs-new--style-1">
      <div className="obps-components-noc-site-photographs-new--style-2">
        <div className="obps-components-noc-site-photographs-new--style-3">
          <div>
          <span>{t(documentType?.replaceAll(".", "_"))}</span>
        </div>
          <img
            src={url}
            alt={t(documentType?.replaceAll(".", "_"))}
            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "10%", cursor: url ? "pointer" : "default" }}
            onClick={() => url && setImageZoom(url)}
          />
          <div>Latitude - {coordinates?.latitude}</div>
          <div>Longitude - {coordinates?.longitude}</div>
        </div>
      </div>
      {imageZoom && <ImageViewer imageSrc={imageZoom} onClose={onCloseImageZoom} />}
    </div>
  );
};

export default NocSitePhotographsBPA;