import React, { useEffect, useState, useMemo } from "react";
import { ImageViewer, Card, CardSubHeader, CardSectionHeader } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import EXIF from "exif-js";

const CLUSitePhotographs = ({ documents, coordinates={} }) => {
  const { t } = useTranslation();

  const documentObj = {
    value: {
      workflowDocs: documents?.map((doc) => ({
        documentType: doc?.documentType || "",
        filestoreId: doc?.filestoreId || doc?.fileStoreId || "",
        documentUid: doc?.documentUid || doc?.fileStoreId || "",
        documentAttachment: doc?.documentAttachment || "",
      })),
    },
  };

  const { data: urlsList, isLoading: urlsListLoading } = Digit.Hooks.noc.useNOCDocumentSearch(documentObj, {
    enabled: documents?.length > 0 ? true : false,
  });

  const mappedDocuments = documents?.map((doc) => {
    const { documentUid, documentType, title, latitude, longitude } = doc;
    const url = urlsList?.pdfFiles?.[documentUid]; // Get URL using documentUid
    return {
      documentUid,
      documentType,
      url,
      title,
      latitude,
      longitude
    };
  });

  const documentsData = useMemo(() => {
    return mappedDocuments?.map((doc, index) => ({
      id: index,
      documentType: doc?.documentType,
      //title: t(doc?.documentType?.replaceAll(".", "_")) || t(doc?.documentType) || t("CS_NA"),
      title: doc?.documentType !== "" ?  t(doc?.documentType?.replaceAll(".", "_")) : title !=="" ? title : t("CS_NA"),
      fileUrl: doc.url,
      latitude: doc.latitude,
      longitude: doc.longitude
    }));
  }, [mappedDocuments]);

  // const extractExifDate = (fileUrl) => {
  //   const img = new Image();
  //   img.onload = function () {
  //     EXIF.getData(img, function () {
  //       const dateTimeOriginal = EXIF.getTag(this, "DateTimeOriginal");
  //       if (dateTimeOriginal) {
  //         //setDateTaken(dateTimeOriginal);
  //         console.log("fileUrl==>", fileUrl);
  //         return dateTimeOriginal;
  //       }
  //     });
  //   };
  //   img.src = fileUrl;
  // };

  return (
    <div style={{ padding: "50px 0px", display: "flex", justifyContent: "space-evenly", flexWrap: "wrap", gap: "20px" }}>
      {documentsData?.map((item, index) => (
        <div key={index} style={{ display: "flex", flexDirection: "column", width: "200px", height: "200px", alignItems: "center" }}>
          {/* <CardSectionHeader>{t(item?.documentType?.replaceAll(".", "_"))}</CardSectionHeader> */}
          <CardSectionHeader>{item?.title}</CardSectionHeader>

          <div style={{ margin: "5px" }}>
            <img
              src={item.fileUrl}
              alt={item.title}
              style={{ width: "120px", height: "120px", objectFit: "fill", borderRadius: "10%", cursor: "pointer" }}
              onClick={() => window.open(item.fileUrl, "_blank")}
            />
          </div>

          {item?.latitude && <div>Lat: {item.latitude}</div>}
          {item?.longitude && <div>Long: {item.longitude}</div>}
          {/* <div>Date Taken: {extractExifDate(item.fileUrl)}</div> */}

          {item.documentType === "OWNER.SITEPHOTOGRAPHONE" && <div>Latitude - {coordinates?.Latitude1}</div>}
          {item.documentType === "OWNER.SITEPHOTOGRAPHONE" && <div>Longitude - {coordinates?.Longitude1}</div>}
          {item.documentType === "OWNER.SITEPHOTOGRAPHTWO" && <div>Latitude - {coordinates?.Latitude2}</div>}
          {item.documentType === "OWNER.SITEPHOTOGRAPHTWO" && <div>Longitude - {coordinates?.Longitude2}</div>}

          {/* <div>Latitude - {item.documentType === "OWNER.SITEPHOTOGRAPHONE" ? coordinates?.Latitude1 : coordinates?.Latitude2}</div>
          <div>Longitude - {item.documentType === "OWNER.SITEPHOTOGRAPHONE" ? coordinates?.Longitude1 : coordinates?.Longitude2}</div> */}
        </div>
      ))}
    </div>
  );
};

export default CLUSitePhotographs;
