import { Card, CardHeader, CardSubHeader, CardSectionHeader, CardText, Loader, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useEffect } from "react";
import { cardBodyStyle, stringReplaceAll } from "../utils";
//import { map } from "lodash-es";

const ServiceDoc = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  sessionStorage.removeItem("docReqScreenByBack");

  const docType = config?.isMutation ? ["MutationDocuments"] : "Documents";

  const { isLoading, data: Documentsob = {} } = Digit.Hooks.asset.useAssetDocumentsMDMS(stateId, "ASSET", docType);
  let docs = Documentsob?.ASSET?.Documents;
  function onSave() {}

  function goNext() {
    onSelect();
  }

  return (
    <React.Fragment>
      <Card>
        <div>
          <CardSectionHeader>{t("AST_REQ_SCREEN_LABEL")}</CardSectionHeader>

          <CardText style={{ color: "red" }}>{t("AST_DOCUMENT_ACCEPTED_PDF_JPG_PNG")}</CardText>

          <div>
            {isLoading && <Loader />}
            {Array.isArray(docs)
              ? config?.isMutation
                ? docs.map(({ code, dropdownData }, index) => (
                    <div key={index}>
                      <CardSubHeader>
                        {index + 1}. {t(code)}
                      </CardSubHeader>
                      <CardText className={"primaryColor"}>{dropdownData.map((dropdownData) => t(dropdownData?.code)).join(", ")}</CardText>
                    </div>
                  ))
                : docs.map(({ code, dropdownData }, index) => (
                    <div key={index}>
                      <CardText className={"primaryColor"}>
                        {index + 1}. {t(stringReplaceAll(code, ".", "_"))}
                      </CardText>
                      {dropdownData.map((dropdownData, dropdownIndex) => (
                        <CardText className={"primaryColor"}>
                          {/* {`${dropdownIndex + 1}`}. {t(stringReplaceAll(dropdownData?.code, ".", "_"))} */}
                        </CardText>
                      ))}
                    </div>
                  ))
              : null}
          </div>
        </div>
        <span>
          <SubmitBar label={t("CS_COMMON_NEXT")} onSubmit={onSelect} />
        </span>
      </Card>
    </React.Fragment>
  );
};

export default ServiceDoc;
