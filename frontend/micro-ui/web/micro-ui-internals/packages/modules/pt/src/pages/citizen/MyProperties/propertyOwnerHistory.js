import { Header, Loader } from "@mseva/digit-ui-react-components";
import React from "react";
import { useTranslation } from "react-i18next";
import { convertEpochToDate } from "../../../utils";
import { useParams } from "react-router-dom";

const styles = {
  wrapper: { width: "100%", boxSizing: "border-box", minWidth: 0, padding: "4px 0" },
  timelineEntry: { display: "flex", gap: "16px", position: "relative" },
  rail: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "16px" },
  dot: { width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#2947a3", marginTop: "6px", flexShrink: 0 },
  line: { flex: 1, width: "2px", backgroundColor: "#d6dbe6", marginTop: "4px" },
  entryBody: { flex: 1, minWidth: 0, paddingBottom: "24px" },
  dateChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "16px",
    backgroundColor: "#eef2fb",
    color: "#2947a3",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "12px",
  },
  ownersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" },
  ownerCard: {
    border: "1px solid #e0e3eb",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    minWidth: 0,
  },
  ownerHeader: {
    padding: "10px 14px",
    backgroundColor: "#f5f7fb",
    borderBottom: "1px solid #e0e3eb",
    fontSize: "15px",
    fontWeight: 700,
    color: "#0b0c0c",
    wordBreak: "break-word",
  },
  ownerRows: { padding: "8px 14px" },
  row: { display: "flex", flexDirection: "column", padding: "6px 0", borderBottom: "1px dashed #eceef3" },
  rowLabel: { fontSize: "12px", color: "#505a5f", textTransform: "uppercase", letterSpacing: "0.3px" },
  rowValue: { fontSize: "14px", color: "#0b0c0c", wordBreak: "break-word", marginTop: "2px" },
  empty: { padding: "24px", textAlign: "center", color: "#505a5f", fontSize: "15px" },
};

const propertyOwnerHistory = ({ userType, propertyId: propertyIdFromProp }) => {
  const { t } = useTranslation();
  const { propertyIds } = useParams();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const audit = true;
  const { isLoading, isError, error, data } = Digit.Hooks.pt.usePropertySearch({
    tenantId,
    filters: { propertyIds: userType === "employee" ? propertyIdFromProp : propertyIds, audit },
  });

  let properties = data?.Properties || " ";
  let ownershipInfo = {};
  const getUniqueList = (list = []) => {
    let newList = [];
    list.map((element) => {
      if (!JSON.stringify(newList).includes(JSON.stringify(element.acknowldgementNumber))) {
        newList.push(element);
      }
    });
    return newList && Array.isArray(newList) && newList.filter((element) => element.creationReason != "UPDATE");
  };
  const transformData = (property) => {
    const { owners, institution, ownershipCategory } = property;
    let itemKey = [];
    owners.map((item) => {
      let owner = {};
      if (institution) {
        owner = {
          PT_COMMON_INSTITUTION_NAME: institution?.name || t("CS_NA"),
          PT_TYPE_OF_INSTITUTION: t(institution.type) || t("CS_NA"),
          PT_OWNER_NAME: institution.nameOfAuthorizedPerson || t("CS_NA"),
          PT_COMMON_AUTHORISED_PERSON_DESIGNATION: t(institution.designation) || t("CS_NA"),
          PT_FORM3_MOBILE_NUMBER: item.mobileNumber || t("CS_NA"),
          PT_OWNERSHIP_INFO_TEL_PHONE_NO: item.altContactNumber || t("CS_NA"),
          PT_FORM3_EMAIL_ID: item.emailId || t("CS_NA"),
          PT_OWNERSHIP_INFO_CORR_ADDR: item?.correspondenceAddress || t("CS_NA"),
          PT_FORM3_OWNERSHIP_TYPE: t(`PROPERTYTAX_BILLING_SLAB_${ownershipCategory.split(".")[0]}`) || t("CS_NA"),
        };
      } else {
        owner = {
          PT_OWNER_NAME: item.name || t("CS_NA"),
          PT_FORM3_GUARDIAN_NAME: item.fatherOrHusbandName || t("CS_NA"),
          PT_FORM3_GENDER: t(item.gender) || t("CS_NA"),
          PT_FORM3_MOBILE_NUMBER: item.mobileNumber || t("CS_NA"),

          // PT_FORM3_RELATIONSHIP: t(item.relationship) || t("CS_NA"),
          PT_MUTATION_AUTHORISED_EMAIL: item.emailId || t("CS_NA"),
          PT_SPECIAL_OWNER_CATEGORY: t(item.ownerType === "NONE" ? "CS_NA" : item.ownerType) || t("CS_NA"),
          PT_OWNER_PERCENTAGE: item.ownerShipPercentage === null ? t("CS_NA") : item.ownerShipPercentage || t("CS_NA"),
          PT_OWNERSHIP_INFO_CORR_ADDR: item.permanentAddress || t("CS_NA"),
        };
      }
      itemKey.push(owner);
    });
    return itemKey;
  };

  if (properties && Array.isArray(properties) && properties.length > 0) {
    let ownerProperty = properties[0];
    properties = properties.filter((data) => data.status == "ACTIVE");
    if (properties.length === 0) {
      properties.push(ownerProperty);
    }
    properties = getUniqueList(properties);
    properties &&
      properties.length > 0 &&
      properties.map((indProperty) => {
        let lastModifiedDate = indProperty.auditDetails.lastModifiedTime;
        indProperty.owners = indProperty.owners.filter((owner) => owner.active === true);
        if (!ownershipInfo[lastModifiedDate]) {
          ownershipInfo[lastModifiedDate] = [];
        }
        ownershipInfo[lastModifiedDate].push(...transformData(indProperty));
      });
  }

  if (isLoading) {
    return <Loader />;
  }

  const entries = Object.keys(ownershipInfo).map((key) => ({
    date: convertEpochToDate(Number(key)),
    owners: ownershipInfo[key],
  }));

  const renderOwnerCard = (owner, index) => {
    const title = owner.PT_OWNER_NAME || owner.PT_COMMON_INSTITUTION_NAME || `${t("PT_OWNER_NAME")} ${index + 1}`;
    const rows = Object.keys(owner).filter((key) => key !== "PT_OWNER_NAME");

  if (propertyIdFromProp) {
    return (
      <React.Fragment>
        <Card style={{marginLeft:'2px'}}>
          <div>
            {Object.keys(ownershipInfo).map((key, index, arr) => {
              const date = convertEpochToDate(Number(key));

              return (
                <div className="historyContent">
                  <div style={{ display: "flex" }}>
                    <div className="historyCheckpoint zIndex"></div>
                    {/* {index !== Object.keys(ownershipInfo).length - 1 ? ( */}
                      <div className="rowContainerStyles">
                        <CardSubHeader className="historyTableDateLabel bottomMargin"> {t("PT_DATE_OF_TRANSFER")} </CardSubHeader>
                        <CardSubHeader className="historyTableDate bottomMargin">{date}</CardSubHeader>
                      </div>
                    {/* ) : null} */}
                  </div>
                  <TransferDetails
                    data={ownershipInfo[key]}
                    wrapperStyles="wrapperStyles"
                    containerStyles="containerStyles"
                    rowContainerStyles={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                    tableStyles={{
                      display: "grid",
                      gridAutoRows: "min-content",
                      gridTemplateColumns: "repeat(5, minmax(100px, 1fr))",
                    }}
                  />
                  {index !== arr.length - 1 && <div className="checkpoint-connect" style={{ marginLeft: 0, top: "4px" }}></div>}
                </div>
              );
            })}
          </div>
        </Card>
      </React.Fragment>
    );
  };

  return (
    <div style={styles.wrapper}>
      {!propertyIdFromProp && <Header>{t("PT_OWNER_HISTORY")}</Header>}
      {entries.length === 0 ? (
        <div style={styles.empty}>{t("PT_OWNER_HISTORY")}</div>
      ) : (
        entries.map((entry, index) => (
          <div key={index} style={styles.timelineEntry}>
            <div style={styles.rail}>
              <span style={styles.dot}></span>
              {index !== entries.length - 1 && <span style={styles.line}></span>}
            </div>
            <div style={styles.entryBody}>
              <div style={styles.dateChip}>
                {t("PT_DATE_OF_TRANSFER")}: <strong>{entry.date}</strong>
              </div>
              <div style={styles.ownersGrid}>
                {entry.owners.map((owner, ownerIndex) => renderOwnerCard(owner, ownerIndex))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default propertyOwnerHistory;
