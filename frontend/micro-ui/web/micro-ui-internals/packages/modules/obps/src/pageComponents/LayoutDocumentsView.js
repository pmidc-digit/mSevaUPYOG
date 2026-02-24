import React, {useState, useEffect, useMemo} from 'react'
import { Table, StatusTable, LinkButton } from '@mseva/digit-ui-react-components'
import { useTranslation } from "react-i18next";

const LayoutDocumentTableView = ({documents}) => {
  const { t } = useTranslation();

  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

 const documentsColumns = [
        {
          Header: t("BPA_DOCUMENT_NAME"),
          accessor: "title",
          Cell: ({ value }) => <strong>{t(value)}</strong> || t("CS_NA"),
        },
        {
          Header: t("BPA_DOCUMENT_FILE"),
          accessor: "fileUrl",
          Cell: ({ value }) =>
            value ? (
              <LinkButton style={{ float: "right", display: "inline" }}
                label={t("View")}
                onClick={() => routeTo(value)}
              />
            ) : (
              t("CS_NA")
            ),
        },
  ];

 const documentObj = {
  value: {
    workflowDocs: documents?.map(doc => ({
      documentType: doc?.documentType || "",
      filestoreId: doc?.filestoreId || "",
      documentUid: doc?.documentUid || "",
      documentAttachment: doc?.documentAttachment || ""
    }))
   }
  };

 const { data: urlsList, isLoading: urlsListLoading } = Digit.Hooks.obps.useLayoutDocumentSearch(
    documentObj,
    {
      enabled: documents?.length > 0 ? true : false
    }
  );
  
  const mappedDocuments = documents?.map(doc => {
   const { documentUid, documentType } = doc;
   const url = urlsList?.pdfFiles?.[documentUid]; // Get URL using documentUid
   return {
    documentUid,
    documentType,
    url
  };
  });

  const documentsData = useMemo(() => {
     return (mappedDocuments)?.map((doc, index) => ({
      id: index,
      title: t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA"),
      fileUrl: doc.url,
     }));
    }, [mappedDocuments]);

  return (
    <div>
      {documentsData && 
        <Table
          className="customTable table-border-style"
          t={t}
          data={documentsData}
          columns={documentsColumns}
          getCellProps={() => ({ style: {} })}
          disableSort={false}
          autoSort={true}
          manualPagination={false}
          isPaginationRequired={false}
          pageSizeLimit = {documentsData?.length || 10}
        />
      }
    </div>
  )
}

export default LayoutDocumentTableView