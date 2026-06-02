import React, { useEffect, useState } from "react";
import { Row, StatusTable } from "@mseva/digit-ui-react-components";

/**
 * PTImportantDates — Shared page component
 *
 * Renders the "Important Dates" panel showing:
 *  - Last Date for Rebate
 *  - Penalty applied from
 *  - Interest applied from
 *
 * Used by both:
 *  - pages/employee/AssessmentDetails.js
 *  - pages/citizen/MyProperties/AssessmentDetails.js
 *
 * @param {string} financialYear  e.g. "2023-24"
 */
const PTImportantDates = ({ financialYear }) => {
  const stateId = Digit.ULBService.getStateId();

  // Fetch Rebate, Penalty and Interest date config from MDMS
  let { data: rebateImportantDates } = Digit.Hooks.pt.useMDMS(stateId, "PropertyTax", "Rebate");
  let { data: penalityImportantDates } = Digit.Hooks.pt.useMDMS(stateId, "PropertyTax", "Penality");
  let { data: interestImportantDates } = Digit.Hooks.pt.useMDMS(stateId, "PropertyTax", "Interest");

  const [rebateObj, setRebateObj] = useState(null);
  const [penalityObj, setPenalityObj] = useState(null);
  const [interestObj, setInterestObj] = useState(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getMonth = (date) => parseInt(date.split("/")[1]);

  /**
   * Used for Rebate — appends the correct year to endingDay/startingDay
   * based on the financial year (month-aware: Jan/Feb/Mar → next year)
   */
  const findCorrectDateObj = (fy, category) => {
    if (!category || !fy) return {};
    const sorted = [...category].sort((a, b) => {
      const ya = a.fromFY?.slice(0, 4);
      const yb = b.fromFY?.slice(0, 4);
      return ya < yb ? 1 : -1;
    });
    let assessYear = fy.slice(0, 4);
    const categoryYears = sorted.map((item) => item.fromFY?.slice(0, 4));
    const index = categoryYears.indexOf(assessYear);
    let chosenDateObj = index > -1 ? { ...sorted[index] } : {};
    if (!chosenDateObj.fromFY) {
      for (let i = 0; i < categoryYears.length; i++) {
        if (assessYear > categoryYears[i]) {
          chosenDateObj = { ...sorted[i] };
          break;
        }
      }
    }
    if (chosenDateObj.startingDay) {
      const month = getMonth(chosenDateObj.startingDay);
      const yr = month === 1 || month === 2 || month === 3 ? String(parseInt(assessYear) + 1) : assessYear;
      chosenDateObj.startingDay = `${chosenDateObj.startingDay}/${yr}`;
    } else if (chosenDateObj.endingDay) {
      const month = getMonth(chosenDateObj.endingDay);
      const yr = month === 1 || month === 2 || month === 3 ? String(parseInt(assessYear) + 1) : assessYear;
      chosenDateObj.endingDay = `${chosenDateObj.endingDay}/${yr}`;
    }
    return chosenDateObj;
  };

  /**
   * Used for Penalty and Interest — computes the correct year
   * by calculating the year difference from the MDMS fromFY
   */
  const findCorrectDateObjPenaltyIntrest = (fy, category) => {
    if (!category || !fy) return {};
    const sorted = [...category].sort((a, b) => {
      const ya = a.fromFY?.slice(0, 4);
      const yb = b.fromFY?.slice(0, 4);
      return ya < yb ? 1 : -1;
    });
    const assessYear = fy.slice(0, 4);
    const categoryYears = sorted.map((item) => item.fromFY?.slice(0, 4));
    const index = categoryYears.indexOf(assessYear);
    let chosenDateObj = index > -1 ? { ...sorted[index] } : {};
    if (!chosenDateObj.fromFY) {
      for (let i = 0; i < categoryYears.length; i++) {
        if (assessYear > categoryYears[i]) {
          chosenDateObj = { ...sorted[i] };
          break;
        }
      }
    }
    if (chosenDateObj.startingDay && chosenDateObj.fromFY) {
      const yearDiff = parseInt(assessYear) - parseInt(chosenDateObj.fromFY.split("-")[0]);
      const parts = chosenDateObj.startingDay.split("/");
      const newYear = parseInt(parts.pop()) + yearDiff;
      parts.push(String(newYear));
      chosenDateObj.startingDay = parts.join("/");
    }
    return chosenDateObj;
  };

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (penalityImportantDates?.PropertyTax?.Interest?.length > 0 && penalityObj === null) {
      setPenalityObj(findCorrectDateObjPenaltyIntrest(financialYear, penalityImportantDates.PropertyTax.Interest));
    }
    if (rebateImportantDates?.PropertyTax?.Rebate?.length > 0 && rebateObj === null) {
      setRebateObj(findCorrectDateObj(financialYear, rebateImportantDates.PropertyTax.Rebate));
    }
    if (interestImportantDates?.PropertyTax?.Interest?.length > 0 && interestObj === null) {
      setInterestObj(findCorrectDateObjPenaltyIntrest(financialYear, interestImportantDates.PropertyTax.Interest));
    }
  }, [penalityImportantDates, rebateImportantDates, interestImportantDates]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ border: "1px solid lightgrey", padding: "8px", marginTop: "8px" }}>
      <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0d43a7", marginBottom: "10px" }}>
        Important Dates
      </h3>
      <StatusTable>
        <Row
          key="rebate"
          label={`Last Date for Rebate (${rebateObj?.rate ?? ""}% of PT)`}
          text={rebateObj?.endingDay ?? ""}
          labelStyle={{ wordBreak: "break-all", width: "50%" }}
          textStyle={{ wordBreak: "break-all", fontWeight: "bold" }}
          className="border-none"
        />
        <Row
          key="penality"
          label={`Penalty (${penalityObj?.rate ?? ""}% of PT) applied from`}
          text={penalityObj?.startingDay ?? ""}
          labelStyle={{ wordBreak: "break-all", width: "50%" }}
          textStyle={{ wordBreak: "break-all", fontWeight: "bold" }}
          className="border-none"
        />
        <Row
          key="interest"
          label={`Interest (${interestObj?.rate ?? ""}% p.a. daily) applied from`}
          text={interestObj?.startingDay ?? ""}
          labelStyle={{ wordBreak: "break-all", width: "50%" }}
          textStyle={{ wordBreak: "break-all", fontWeight: "bold" }}
          className="border-none"
        />
      </StatusTable>
    </div>
  );
};

export default PTImportantDates;
