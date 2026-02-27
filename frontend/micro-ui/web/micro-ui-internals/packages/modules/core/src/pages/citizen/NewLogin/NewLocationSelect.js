import React from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "@mseva/digit-ui-react-components";

const LocationSelect = ({ onLocationChange, selectedCity }) => {
  const { t } = useTranslation();
  const { data: cities, isLoading } = Digit.Hooks.useTenants();

  const cityOptions = cities?.map((city) => ({ ...city, displayName: t(city.i18nKey) })) || [];

  function setCity(city) {
    Digit.SessionStorage.set("CITIZEN.COMMON.HOME.CITY", city);
    localStorage.setItem("CITIZEN.CITY", city?.code);
    onLocationChange && onLocationChange(city);
  }
  const style = {
    locationWrapper: {
      width: "100%",
    },
  };
  return (
    // <PageBasedInput texts={{}} onSubmit={() => {}} className="location-selection-container" isDisabled={true}>
    // <LabelFieldPair>
    <div className="location-wrapper" style={style.locationWrapper}>
      <div className="label">
        {t("CS_COMMON_CHOOSE_LOCATION")}
        <span> *</span>
      </div>
      {!isLoading && (
        <Dropdown
          option={cityOptions}
          optionKey="displayName"
          id="city"
          selected={selectedCity}
          select={setCity}
          placeholder={t("COMMON_TABLE_SEARCH")}
        />
      )}
    </div>
    //  </LabelFieldPair>
  );
};

export default LocationSelect;
