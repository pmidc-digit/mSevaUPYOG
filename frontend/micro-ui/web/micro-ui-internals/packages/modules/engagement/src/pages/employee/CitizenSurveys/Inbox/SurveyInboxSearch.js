import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { alphabeticalSortFunctionForTenantsBasedOnName } from "../../../../utils";

const SurveyInboxSearch = ({ values, onSearch }) => {
  const { t } = useTranslation();
  const engagementTenants = Digit.SessionStorage.get("ENGAGEMENT_TENANTS") || [];
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const userInfo = Digit.UserService.getUser()?.info;
  const [searchValues, setSearchValues] = useState({ tenantIds: values?.tenantIds || null, title: values?.title || "" });

  const userUlbs = useMemo(() => {
    const assignedUlbs = engagementTenants
      .filter((ulb) => userInfo?.roles?.some((role) => role?.tenantId === ulb?.code))
      .sort(alphabeticalSortFunctionForTenantsBasedOnName);

    if (assignedUlbs.length || !userInfo?.tenantId) return assignedUlbs;

    const currentTenant = {
      i18nKey: `TENANT_TENANTS_${userInfo.tenantId.replace(".", "_").toUpperCase()}`,
      code: userInfo.tenantId,
    };

    return tenantId === "pb.punjab" ? [currentTenant, ...engagementTenants] : [currentTenant];
  }, [engagementTenants, tenantId, userInfo]);

  const tenantOptionsKey = userUlbs.map((ulb) => ulb.code).join("|");
  const savedTenantCode = values?.tenantIds?.code || values?.tenantIds;

  useEffect(() => {
    setSearchValues((current) => {
      const title = values?.title || "";
      return current.title === title ? current : { ...current, title };
    });
  }, [values?.title]);

  useEffect(() => {
    const selectedTenant = userUlbs.find((ulb) => ulb.code === savedTenantCode || ulb.code === tenantId) || userUlbs[0] || null;
    setSearchValues((current) => (current.tenantIds?.code === selectedTenant?.code ? current : { ...current, tenantIds: selectedTenant }));
  }, [savedTenantCode, tenantId, tenantOptionsKey]);

  const clearSearch = () => {
    const clearedValues = { tenantIds: searchValues.tenantIds, title: "" };
    setSearchValues(clearedValues);
    onSearch(clearedValues);
  };

  return (
    <>
      <form
        className="new-inbox-topbar survey-new-inbox-search"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch({ ...searchValues, title: searchValues.title.trim() });
        }}
      >
        <div className="survey-new-inbox-search-fields">
          <label>
            <span>
              {t("City")} <em>*</em>
            </span>
            <select
              value={searchValues.tenantIds?.code || ""}
              onChange={(event) => {
                const selectedTenant = userUlbs.find((ulb) => ulb.code === event.target.value) || null;
                setSearchValues((current) => ({ ...current, tenantIds: selectedTenant }));
              }}
              required
            >
              <option value="" disabled>
                {t("ES_COMMON_SELECT")}
              </option>
              {userUlbs.map((ulb) => (
                <option key={ulb.code} value={ulb.code}>
                  {t(ulb.i18nKey)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("CS_SURVEY_NAME")}</span>
            <input
              type="text"
              maxLength={60}
              value={searchValues.title}
              onChange={(event) => setSearchValues((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
        </div>
        <div className="survey-new-inbox-search-actions">
          <button type="submit" className="survey-new-inbox-search-button">
            {t("ES_COMMON_SEARCH")}
          </button>
          <button type="button" className="survey-new-inbox-clear-button" onClick={clearSearch}>
            {t("CS_COMMON_CLEAR_SEARCH")}
          </button>
        </div>
      </form>
      <nav className="survey-new-inbox-page-links" aria-label={t("CS_COMMON_SURVEYS")}>
        <Link to="/digit-ui/employee/engagement/surveys/inbox">{t("Surveys Inbox/Search Surveys")}</Link>
        <Link to="/digit-ui/employee/engagement/surveys/create-survey-step-form">{t("Create New Survey")}</Link>
        <Link to="/digit-ui/employee/engagement/surveys/create-category">{t("Create Category")}</Link>
        <Link to="/digit-ui/employee/engagement/surveys/search-categories">{t("Search Category")}</Link>
        <Link to="/digit-ui/employee/engagement/surveys/create-questions">{t("Create Questions")}</Link>
        <Link to="/digit-ui/employee/engagement/surveys/search-questions">{t("Search Questions")}</Link>
        <Link to="/digit-ui/employee/engagement/surveys/active-open-surveys">{t("Active and Open Surveys")}</Link>
      </nav>
    </>
  );
};

export default SurveyInboxSearch;
