// import { Loader } from "@mseva/digit-ui-react-components";
// import React from "react";
// import { useTranslation } from "react-i18next";
// import { pdfDownloadLink } from "../utils";

// const PDFSvg = ({ width = 20, height = 20, style }) => (
//   <svg style={style} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="gray">
//     <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
//   </svg>
// );

// function LayoutDocumentsView({ value = {}}) {
//   const { t } = useTranslation();
//   const { isLoading, isError, error, data } = Digit.Hooks.noc.useNOCDocumentSearch({value},{value});

//   let documents=[];
//   if(value?.workflowDocs) documents = value?.workflowDocs;

//   return (
//     <div style={{ marginTop: "19px" }}>
//       <React.Fragment>
//         <div style={{ display: "flex", flexWrap: "wrap" }}>
//           {documents?.map((document, index) => {
//             let documentLink = pdfDownloadLink(data.pdfFiles, document?.documentAttachment);
//             return (
//               <a target="_" href={documentLink} style={{ minWidth: "100px", marginRight: "10px" }} key={index}>
//                 <PDFSvg width={85} height={100} style={{ background: "#f6f6f6", padding: "8px" }} />
//                 <p style={{ marginTop: "8px", textAlign: "center" }}>
//                   {t(document?.documentType.replace(".", "_").toUpperCase())}
//                 </p>
//               </a>
//             );
//           })}
//         </div>
       
//       </React.Fragment>
//     </div>
//   );
// }

// export default LayoutDocumentsView;


import { Loader } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { pdfDownloadLink } from "../utils";

const PDFSvg = ({ width = 20, height = 20, style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 20 20" fill="gray">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" />
  </svg>
);

function LayoutDocumentsView({ value = {} }) {
  const { t } = useTranslation();
  const { isLoading, isError, error, data } = Digit.Hooks.noc.useNOCDocumentSearch({ value }, { value });

  if (isLoading) return <Loader />;
  if (isError) return <p style={{ color: "red" }}>{t("ERROR_LOADING_DOCUMENTS")}</p>;

  let documents = [];
  if (value?.workflowDocs) documents = value?.workflowDocs;

  

  return (
    <div style={{ marginTop: "20px" }}>
     

      {documents.length === 0 ? (
        <p>{t("NO_DOCUMENTS_AVAILABLE")}</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "6px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={thStyle}>{t("S.NO")}</th>
              <th style={thStyle}>{t("Documents")}</th>
              <th style={thStyle}>{t("File")}</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document, index) => {
              const documentLink = pdfDownloadLink(data?.pdfFiles, document?.documentAttachment);
              return (
                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>
                    {t(document?.documentType.replace(".", "_").toUpperCase())}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <a
                      href={documentLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        color: "#007bff",
                      }}
                    >
                      <PDFSvg width={20} height={20} />
                      <span>{t("View Pdf")}</span>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "10px",
  fontWeight: "600",
  borderBottom: "2px solid #ccc",
  color: "#333",
};

const tdStyle = {
  padding: "10px",
  fontSize: "14px",
  color: "#555",
};

export default LayoutDocumentsView;
