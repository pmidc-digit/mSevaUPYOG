# Payload Fields Mapping - Layout Form

## Overview
All form fields from **LayoutSiteDetails.js** are automatically included in the CREATE/UPDATE API payloads through the Redux store.

---

## CREATE API (LayoutStepFormTwo.js)

### Flow:
```
LayoutSiteDetails.js (user fills form)
    ↓
Form submitted (onSubmit in LayoutStepFormTwo.js)
    ↓
All form data saved to Redux: dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data))
    ↓
callCreateAPI called with: { ...currentStepData, siteDetails: { ...data } }
    ↓
transformedSiteDetails = { ...formData?.siteDetails, ... }
    ↓
Payload sent to /layout-services/v1/layout/_create
```

### Payload Structure:
```json
{
  "Layout": {
    "layoutDetails": {
      "additionalDetails": {
        "siteDetails": {
          "areaLeftForRoadWidening": "700",
          "netPlotAreaAfterWidening": "100",
          "areaUnderEWS": "40",
          "areaUnderEWSInPct": "5.71",      ← NEW FIELD (auto-calculated)
          "totalSiteArea": "560.00",         ← NEW FIELD (auto-calculated)
          "netTotalArea": "560.00",
          "areaUnderResidentialUseInSqM": "50",
          "areaUnderCommercialUseInSqM": "50",
          "areaUnderInstutionalUseInSqM": "50",
          "areaUnderCommunityCenterInSqM": "50",
          "areaUnderParkInSqM": "50",
          "areaUnderRoadInSqM": "50",
          "areaUnderParkingInSqM": "50",
          "areaUnderOtherAmenitiesInSqM": "50",
          ...other fields
        }
      }
    }
  }
}
```

---

## UPDATE API (LayoutStepFormFour.js)

### Flow:
```
Edit Application page loaded
    ↓
Data from API loaded into Redux
    ↓
User edits LayoutSiteDetails.js
    ↓
Form submitted (onSubmit in LayoutStepFormFour.js)
    ↓
mapToLayoutPayload() builds update payload
    ↓
siteDetails: { ...layoutFormData?.siteDetails, ... }
    ↓
Payload sent to /layout-services/v1/layout/_update
```

### Payload Structure (same as CREATE):
```json
{
  "Layout": {
    "layoutDetails": {
      "additionalDetails": {
        "siteDetails": {
          "areaUnderEWSInPct": "5.71",      ← NEW FIELD
          "totalSiteArea": "560.00",         ← NEW FIELD
          ...all other fields including existing ones
        }
      }
    }
  }
}
```

---

## New Fields Being Sent

| Field | Type | Source | Format | Example |
|-------|------|--------|--------|---------|
| `areaUnderEWSInPct` | string | auto-calculated | percentage with 2 decimals | "5.71" |
| `totalSiteArea` | string | auto-calculated sum of (2+3+4+5+6+7+8+9) | area in sq m with 2 decimals | "560.00" |

---

## How It Works

### LayoutSiteDetails.js
- Uses `useState` to track calculated values:
  - `areaUnderEWSInPct`: Calculated as `(areaUnderEWS / areaLeftForRoadWidening) * 100`
  - `totalSiteArea`: Calculated as sum of all 8 distribution areas
  
- Uses `watch()` from react-hook-form to monitor all input fields

### Data Flow to Redux
```javascript
// In LayoutStepFormTwo.js line 65:
dispatch(UPDATE_LayoutNewApplication_FORM(config.key, data))
// This stores ALL form fields in Redux, including:
// - areaUnderEWSInPct (watched from controller)
// - totalSiteArea (watched from controller)
```

### Data Flow to API
```javascript
// In callCreateAPI function:
const transformedSiteDetails = {
  ...formData?.siteDetails,  // ← SPREADS ALL FIELDS including new ones
  ulbName: formData?.siteDetails?.ulbName?.name || "",
  // ... other transformations
};
```

---

## Verification

To verify the new fields are in the payload, check the browser console:

```javascript
// In LayoutStepFormTwo.js line 151:
console.log("Final CREATE payload:", payload);
// Look for siteDetails.areaUnderEWSInPct
// Look for siteDetails.totalSiteArea
```

---

## Backend Expectations

The backend API at `/layout-services/v1/layout/_create` and `/layout-services/v1/layout/_update` will receive:

### New Fields in siteDetails:
```json
{
  "areaUnderEWSInPct": "5.71",   // Percentage format, 2 decimals
  "totalSiteArea": "560.00"      // Sq M format, 2 decimals
}
```

### These fields are optional for the backend:
- If backend doesn't expect them, they'll be ignored
- If backend expects them for calculations/validation, they're now being sent

---

## Summary

✅ **All new fields are automatically included in both CREATE and UPDATE payloads**

The spread operators `...formData?.siteDetails` and `...layoutFormData?.siteDetails` ensure that every field in the LayoutSiteDetails form is sent to the backend, including:
- `areaUnderEWSInPct` (percentage of EWS area)
- `totalSiteArea` (sum of all 8 distribution areas)
- All individual SqM fields for the 8 area types
- All individual percentage fields for the 8 area types
