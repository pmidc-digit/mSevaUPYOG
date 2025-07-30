export const DROPDOWN_OPTIONS = {
  areaType: {
    labelKey: "EDCR_SCRUTINY_AREA_TYPE",
    options: [
      { code: "SCHEME_AREA", i18nKey: "EDCR_SCHEME_AREA", name: "Scheme Area" },
      { code: "NON_SCHEME_AREA", i18nKey: "EDCR_NON_SCHEME_AREA", name: "Non-Scheme Area" },
    ],
  },
  schemeArea: {
    labelKey: "EDCR_SCRUTINY_SCHEME_AREA_TYPES",
    options: [
      { code: "TP_ACHEME", i18nKey: "TP_SCHEME", name: "TP Scheme" },
      { code: "DEVELOPMENT_SCHEME", i18nKey: "DEVELOPMENT_SCHEME", name: "Development Scheme" },
      { code: "PAPRA", i18nKey: "PAPRA", name: "PAPRA" },
      { code: "AFFORDABLE", i18nKey: "AFFORDABLE", name: "Affordable" },
      { code: "REGULARIZED_UNDER_POLICY", i18nKey: "REGULARIZED_UNDER_POLICY", name: "Regularized Under Policy" },
      { code: "REHABILITATION_SCHEME", i18nKey: "REHABILITATION_SCHEME", name: "Rehabilitation Scheme" },
      { code: "APPROVED_LAYOUT", i18nKey: "APPROVED_LAYOUT", name: "Approved Layout" },
      { code: "ANY_OTHER_SCHEME", i18nKey: "ANY_OTHER_SCHEME", name: "Any Other Scheme" },
    ],
  },
  cluApprove: {
    labelKey: "EDCR_SCRUTINY_CLU_APPROVED",
    options: [
      { code: "YES", i18nKey: "YES", name: "YES" },
      { code: "NO", i18nKey: "NO", name: "NO" },
    ],
  },
  coreArea: {
    labelKey: "EDCR_IS_CORE_AREA",
    options: [
      { code: "YES", i18nKey: "YES", name: "YES" },
      { code: "NO", i18nKey: "NO", name: "NO" },
    ],
  },
  buildingType: {
    labelKey: "EDCR_BUILDING_TYPE",
    options: [
      { code: "RESIDENTIAL", i18nKey: "EDCR_RESIDENTIAL" },
      { code: "COMMERCIAL", i18nKey: "EDCR_COMMERCIAL" },
      { code: "MIXED", i18nKey: "EDCR_MIXED" },
    ],
  },
};
