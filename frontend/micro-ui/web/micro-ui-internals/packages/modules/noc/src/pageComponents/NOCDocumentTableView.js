import React, {useState, useEffect, useMemo} from 'react'
import { Table, StatusTable, LinkButton } from '@mseva/digit-ui-react-components'
import { useTranslation } from "react-i18next";

const NOCDocumentTableView = ({documents}) => {
  const { t } = useTranslation();

  const srNoStyle = `
    .noc-document-table-view table tbody tr td:first-child,
    .noc-document-table-view table thead tr th:first-child {
      width: 100px !important;
      max-width: 100px !important;
      min-width: 100px !important;
      flex: 0 0 100px !important;
    }
  `;

  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

 const documentsColumns = [
        {
          Header: t("SR_NO"),
          accessor: "srNo",
          Cell: ({ row }) => <div style={{textAlign: "center"}}>{row.index + 1}</div>,
        },
        {
          Header: t("BPA_DOCUMENT_NAME"),
          accessor: "title",
          Cell: ({ value }) => t(value) || t("CS_NA"),
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
      documentAttachment: doc?.documentAttachment || "",
      order: doc?.order || null
    }))
   }
  };

 const { data: urlsList, isLoading: urlsListLoading } = Digit.Hooks.noc.useNOCDocumentSearch(
    documentObj,
    {
      enabled: documents?.length > 0 ? true : false
    }
  );
  
  const mappedDocuments = documents?.map(doc => {
   const { documentUid, documentType, order } = doc;
   const url = urlsList?.pdfFiles?.[documentUid]; // Get URL using documentUid
   return {
    documentUid,
    documentType,
    url,
    order
  };
  });

  console.log('mappedDocuments', mappedDocuments)
  const documentsData = useMemo(() => {
    if (!mappedDocuments) return [];

    const sortedDocs = [...mappedDocuments]?.sort((a, b) => {
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a?.order - b?.order;
    });

    return sortedDocs.map((doc, index) => ({
      id: index,
      srNo: index + 1,
      title: t(doc?.documentType?.replaceAll(".", "_")) || t("CS_NA"),
      fileUrl: doc?.url,
    }));
  }, [mappedDocuments, t]);

console.log('documentsData', documentsData)
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%", display: "block" }}>
      <style>{srNoStyle}</style>
      <div className="noc-document-table-view">
        {documentsData && (
          <Table
            className="customTable table-border-style"
            t={t}
            data={documentsData}
            columns={documentsColumns}
            getCellProps={() => ({})}
            getHeaderProps={() => ({})}
            style={{ width: "100%", tableLayout: "fixed" }}
            disableSort={true}
            autoSort={false}
            manualPagination={false}
            isPaginationRequired={false}
          />
        )}
      </div>
    </div>
  );
}

export default NOCDocumentTableView