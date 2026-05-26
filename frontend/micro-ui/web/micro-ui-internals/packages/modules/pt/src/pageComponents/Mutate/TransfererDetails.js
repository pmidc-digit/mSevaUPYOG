import React from "react";
import { FormStep, StatusTable, Row, CardHeader, KeyNote, CardCaption } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import Timeline from "../../components/TLTimeline";
// import { cardBodyStyle, stringReplaceAll } from "../utils";

const TransfererDetails = ({ userType, formData, config, onSelect }) => {
  const { t } = useTranslation();
  const storedTransferData = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("ownerTransferData") || "{}");
    } catch (error) {
      return {};
    }
  })();
  const transferFormData = formData?.originalData ? formData : storedTransferData;
  console.log("TransfererDetails userType:", userType, "formData:", formData);
  const hasOriginalData = !!transferFormData?.originalData;
  const propertyDetails = hasOriginalData ? transferFormData.originalData : transferFormData?.searchResult?.property;
  console.log("TransfererDetails propertyDetails:", propertyDetails);
  const ownershipType = propertyDetails?.ownershipCategory?.split?.(".");
  const isActiveOwner = (owner) => owner.status === "ACTIVE" || owner.status === "active" || owner.active === true || (!owner.status && owner.active !== false);

  if (userType === "employee" || hasOriginalData) {
    return (
      <React.Fragment>
        <StatusTable>
          {propertyDetails?.owners.sort((item,item2)=>{return item?.additionalDetails?.ownerSequence - item2?.additionalDetails?.ownerSequence})
            ?.filter(isActiveOwner)
            .map((owner, index, arr) => {
              return (
                <React.Fragment>
                  {propertyDetails?.owners?.filter(isActiveOwner).length > 1 ? (
                    <CardCaption style={{ marginTop: "24px", marginBottom: "12px", display: "block" }}>
                      {t("ES_OWNER") + "  " + (index + 1)}
                    </CardCaption>
                  ) : null}
                  {config.labels
                    ?.filter(
                      (e) => e.ownershipType === "ALL" || ownershipType?.[0].includes(e.ownershipType) || e.ownershipType === ownershipType?.[0]
                    )
                    .map((label) => {
                      let noteValue = label?.keyPath
                        ?.filter((e) => !["searchResult", "property"].includes(e))
                        ?.reduce((acc, curr) => (curr === "_index_" ? acc?.[index] : acc?.[curr]), propertyDetails);
                      return <Row key={label.label} label={t(label.label)} text={noteValue || "N/A"} />;
                    })}
                </React.Fragment>
              );
            })}
        </StatusTable>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Timeline currentStep={1} flow="PT_MUTATE" />
      <FormStep t={t} config={config} onSelect={onSelect} onSkip={() => {}} isDisabled={false}>
        <CardHeader>{t("PT_MUTATION_TRANSFEROR_DETAILS")}</CardHeader>
        {propertyDetails?.owners
          ?.filter(isActiveOwner)
          .map((owner, index, arr) => {
            return (
              <React.Fragment key={index}>
                {propertyDetails?.owners?.filter(isActiveOwner).length > 1 ? (
                  <CardCaption style={{ marginTop: "24px", marginBottom: "12px", display: "block" }}>
                    {t("ES_OWNER") + "  " + (index + 1)}
                  </CardCaption>
                ) : null}
                {config.labels
                  ?.filter((e) => e.ownershipType === "ALL" || ownershipType?.[0].includes(e.ownershipType) || e.ownershipType === ownershipType?.[0])
                  .map((label) => {
                    let noteValue = label?.keyPath?.reduce((acc, curr) => (curr === "_index_" ? acc?.[index] : acc?.[curr]), formData);
                    return (
                      <KeyNote
                        key={label.label}
                        keyValue={t(label.label)}
                        note={typeof noteValue === "string" || typeof noteValue === "number" ? t(noteValue) : "N/A"}
                        noteStyle={label.noteStyle}
                      />
                    );
                  })}
              </React.Fragment>
            );
          })}
      </FormStep>
    </React.Fragment>
  );
};

export default TransfererDetails;
