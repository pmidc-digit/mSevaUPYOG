import React, { useState, useEffect } from "react";
import {
  Dropdown,
  TextInput,
  Localities,
  Toast,
  Loader,
  Modal,
  Table,
  SubmitBar,
  SearchField,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const Heading = (props) => {
  return <h1 className="heading-m">{props.label}</h1>;
};

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = ({ onClick }) => (
  <div className="icon-bg-secondary" onClick={onClick}>
    <Close />
  </div>
);

const PropertySearchModal = ({ closeModal, onPropertySelect, tenantId: propsTenantId }) => {
  const { t } = useTranslation();
  const allCities = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));

  const defaultCityCode =
    propsTenantId ||
    (window.location.href.includes("employee")
      ? Digit.ULBService.getCurrentPermanentCity()
      : localStorage.getItem("CITIZEN.CITY") || Digit.ULBService.getCurrentTenantId());

  const initialCity = allCities?.find((c) => c.code === defaultCityCode) || null;

  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [propertyId, setPropertyId] = useState("");
  const [oldPropertyId, setOldPropertyId] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [selectedLocality, setSelectedLocality] = useState(null);
  const [propertyData, setPropertyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);

  useEffect(() => {
    if (!selectedCity && allCities?.length > 0 && defaultCityCode) {
      const match = allCities.find((c) => c.code === defaultCityCode);
      if (match) setSelectedCity(match);
    }
  }, [allCities, defaultCityCode]);

  const GetCell = (value) => <span className="cell-text">{value || t("CS_NA")}</span>;

  const columns = [
    {
      Header: t("PT_PROPERTY_ID"),
      accessor: "propertyId",
      Cell: ({ value }) => GetCell(value),
    },
    {
      Header: t("PT_OWNER_NAME"),
      accessor: (row) => GetCell(row?.owners?.[0]?.name),
      id: "ownerName",
    },
    {
      Header: t("PT_GUARDIAN_NAME"),
      accessor: (row) => GetCell(row?.owners?.[0]?.fatherOrHusbandName),
      id: "guardianName",
    },
    {
      Header: t("CORE_COMMON_PHONE_NUMBER"),
      accessor: (row) => GetCell(row?.owners?.[0]?.mobileNumber),
      id: "mobileNumber",
    },
    {
      Header: t("PT_EXISTING_PROPERTY_ID"),
      accessor: "oldPropertyId",
      Cell: ({ value }) => GetCell(value),
    },
    {
      Header: t("PT_PROPERTY_ADDRESS"),
      accessor: (row) => {
        const address = row?.address;
        const parts = [
          address?.doorNo,
          address?.buildingName,
          address?.street,
          address?.locality?.name,
          address?.city,
        ].filter(Boolean);
        return GetCell(parts.join(", "));
      },
      id: "address",
    },
    {
      Header: t("PT_COMMON_TABLE_COL_STATUS_LABEL"),
      accessor: (row) => {
        const status = row?.status ? row.status.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "-";
        return <span className="cell-text gc-property-status--active">{status}</span>;
      },
      id: "status",
    },
    {
      Header: t("CS_COMMON_ACTION"),
      accessor: "id",
      Cell: ({ row }) => (
        <SubmitBar
          className="gc-property-select-btn"
          label={t("CS_SELECT")}
          onSubmit={() => {
            onPropertySelect(row.original);
            closeModal();
          }}
        />
      ),
    },
  ];

  const searchProperty = async () => {
    const tenantId = selectedCity?.code;
    if (!tenantId) {
      setShowToast({ error: true, label: "UC_CITY_MANDATORY" });
      return;
    }

    if (!propertyId && !oldPropertyId && !surveyId && !mobileNumber && !ownerName && !selectedLocality?.code) {
      setShowToast({ error: true, label: "ERR_PROVIDE_ATLEAST_ONE_PARAM" });
      return;
    }

    if (mobileNumber && !/^[0-9]{10}$/.test(mobileNumber.trim())) {
      setShowToast({ error: true, label: "CORE_COMMON_APPLICANT_MOBILE_NUMBER_INVALID" });
      return;
    }

    const filters = {};
    if (selectedLocality?.code) {
      filters.locality = selectedLocality.code;
    }
    if (propertyId?.trim()) {
      filters.propertyIds = propertyId.trim();
    }
    if (oldPropertyId?.trim()) {
      filters.oldpropertyids = oldPropertyId.trim();
    }
    if (surveyId?.trim()) {
      filters.surveyId = surveyId.trim();
    }
    if (ownerName?.trim()) {
      filters.ownername = ownerName.trim();
      filters.name = ownerName.trim();
    }
    if (mobileNumber?.trim()) {
      filters.mobileNumber = mobileNumber.trim();
    }

    setIsLoading(true);
    try {
      const response = await Digit.PTService.search({
        tenantId: tenantId,
        filters: filters,
        auth: true,
      });

      if (response?.Properties?.length > 0) {
        setPropertyData(response.Properties);
      } else {
        setPropertyData([]);
        setShowToast({ error: true, label: "CS_PT_NO_PROPERTIES_FOUND" });
      }
    } catch (err) {
      setPropertyData([]);
      setShowToast({
        error: true,
        label: err?.response?.data?.Errors?.[0]?.message || err?.message || "CS_SOMETHING_WENT_WRONG",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPropertyId("");
    setOldPropertyId("");
    setSurveyId("");
    setMobileNumber("");
    setOwnerName("");
    setSelectedLocality(null);
    setPropertyData([]);
  };

  return (
    <Modal
      popupClassName="gc-property-search-modal"
      headerBarMain={<Heading label={t("PT_SEARCH_PROPERTY")} />}
      headerBarEnd={<CloseBtn onClick={closeModal} />}
      hideSubmit={true}
    >
      <form
        className="search-form-wrapper"
        onSubmit={(e) => {
          e.preventDefault();
          searchProperty();
        }}
      >
        <SearchField>
          <label>{t("City")}</label>
          <Dropdown
            option={allCities}
            optionKey="i18nKey"
            selected={selectedCity}
            disable={true}
            t={t}
          />
        </SearchField>

        <SearchField>
          <label>{t("CORE_COMMON_MOBILE_NUMBER")}</label>
          <TextInput
            type="text"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            maxlength={10}
          />
        </SearchField>

        <SearchField>
          <label>{t("Locality")}</label>
          <Localities
            selectLocality={(d) => setSelectedLocality(d)}
            tenantId={selectedCity?.code}
            boundaryType="revenue"
            keepNull={false}
            selected={selectedLocality || ""}
            disable={!selectedCity?.code}
            disableLoader={true}
          />
        </SearchField>

        <SearchField>
          <label>{t("Property Id")}</label>
          <TextInput
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
          />
        </SearchField>

        <SearchField>
          <label>{t("Existing Property Id")}</label>
          <TextInput
            type="text"
            value={oldPropertyId}
            onChange={(e) => setOldPropertyId(e.target.value)}
          />
        </SearchField>

        <SearchField>
          <label>{t("Owner Name")}</label>
          <TextInput
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </SearchField>

        <SearchField>
          <label>{t("Survey Id")}</label>
          <TextInput
            type="text"
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
          />
        </SearchField>

        <div className="gc-property-search-actions">
          <button
            type="button"
            className="gc-property-search-clear-btn"
            onClick={handleReset}
          >
            {t("ES_COMMON_CLEAR_ALL")}
          </button>
          <SubmitBar label={t("ES_COMMON_SEARCH")} submit="submit" onSubmit={searchProperty} />
        </div>
      </form>

      {isLoading ? (
        <Loader />
      ) : propertyData?.length > 0 ? (
        <div className="gc-property-search-table-wrapper">
          <Table
            t={t}
            data={propertyData}
            columns={columns}
            isPaginationRequired={false}
          />
        </div>
      ) : null}

      {showToast && (
        <Toast
          error={showToast.error}
          label={t(showToast.label)}
          onClose={() => setShowToast(null)}
        />
      )}
    </Modal>
  );
};

export default PropertySearchModal;
