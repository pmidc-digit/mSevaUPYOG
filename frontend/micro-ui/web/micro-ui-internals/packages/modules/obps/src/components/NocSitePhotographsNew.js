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
    <div style={{ padding: "20px 0px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", padding: "0px 20px" }}>
        <div style={{ textAlign: "start" }}>
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