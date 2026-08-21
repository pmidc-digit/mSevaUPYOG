import React, { useState, useRef, useEffect } from "react";
import { TextInput } from "@mseva/digit-ui-react-components";
import { CalendarIcon } from "../../../../../packages/react-components/src/atoms/svgindex";

const hiddenDateInputStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  width: "32px",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
  border: "none",
  padding: 0,
  margin: 0,
  pointerEvents: "none",
};

const formatDateToDDMMYYYY = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateToYYYYMMDD = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

const formatAndValidateTypedValue = (val, max) => {
  // Remove consecutive slashes
  val = val.replace(/\/+/g, "/");

  let parts = val.split("/");

  if (parts.length > 3) {
    parts = parts.slice(0, 3);
  }

  // Format and validate Day (parts[0])
  if (parts[0] !== undefined) {
    let day = parts[0];
    if (day.length === 1) {
      if (day >= "4" && day <= "9") {
        parts[0] = "0" + day;
        if (parts.length === 1) parts.push("");
      }
    } else if (day.length >= 2) {
      day = day.slice(0, 2);
      const dVal = parseInt(day, 10);
      if (dVal > 31 || dVal === 0) {
        parts[0] = day.slice(0, 1);
      } else {
        parts[0] = day;
        if (parts.length === 1) parts.push("");
      }
    }
  }

  // Format and validate Month (parts[1])
  if (parts[1] !== undefined) {
    let month = parts[1];
    if (month.length === 1) {
      if (month >= "2" && month <= "9") {
        parts[1] = "0" + month;
        if (parts.length === 2) parts.push("");
      }
    } else if (month.length >= 2) {
      month = month.slice(0, 2);
      const mVal = parseInt(month, 10);
      if (mVal > 12 || mVal === 0) {
        parts[1] = month.slice(0, 1);
      } else {
        parts[1] = month;
        if (parts.length === 2) parts.push("");
      }
    }
  }

  // Format Year (parts[2])
  if (parts[2] !== undefined) {
    let year = parts[2].slice(0, 4);
    if (max && year.length > 0) {
      const maxYear = new Date(max).getFullYear();
      if (!isNaN(maxYear)) {
        const maxYearStr = String(maxYear);
        const len = year.length;
        const yearPrefix = year;
        const maxYearPrefix = maxYearStr.slice(0, len);
        if (parseInt(yearPrefix, 10) > parseInt(maxYearPrefix, 10)) {
          // Reject the last digit
          year = year.slice(0, len - 1);
        }
      }
    }
    parts[2] = year;
  }

  return parts.join("/");
};

const CustomDatePicker = ({ value, onChange, placeholder = "dd/mm/yyyy", min, max, disabled, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [inputValue, setInputValue] = useState(value ? formatDateToDDMMYYYY(value) : "");
  const dateRef = useRef();

  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      if (!isNaN(newDate.getTime())) {
        const currentFormatted = selectedDate && !isNaN(selectedDate.getTime()) ? formatDateToYYYYMMDD(selectedDate) : "";
        if (value !== currentFormatted) {
          setSelectedDate(newDate);
          setInputValue(formatDateToDDMMYYYY(newDate));
        }
      } else {
        setSelectedDate(null);
        if (value !== "Invalid Date") {
          setInputValue("");
        }
      }
    } else {
      if (selectedDate !== null) {
        setSelectedDate(null);
      }
      setInputValue("");
    }
  }, [value]);

  const handleDateChange = (date) => {
    const newDate = new Date(date);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
      setInputValue(formatDateToDDMMYYYY(newDate));
      if (onChange) {
        onChange({
          target: { value: formatDateToYYYYMMDD(newDate) },
        });
      }
      return;
    }
    setSelectedDate(null);
    setInputValue("");
    if (onChange) {
      onChange({
        target: { value: "Invalid Date" },
      });
    }
  };

  const handleTextChange = (e) => {
    let val = e.target.value;

    // Remove non-digit characters except slash
    val = val.replace(/[^\d/]/g, "");

    if (val.length > 10) return;

    // Detect backspace/deleting to avoid forcing slashes
    const isDeleting = val.length < inputValue.length;

    let formattedVal = val;
    if (!isDeleting) {
      formattedVal = formatAndValidateTypedValue(val, max);
    }

    setInputValue(formattedVal);

    const match = formattedVal.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);

      const date = new Date(year, month - 1, day);
      if (
        !isNaN(date.getTime()) &&
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        setSelectedDate(date);
        if (onChange) {
          onChange({
            target: { value: formatDateToYYYYMMDD(date) },
          });
        }
        return;
      }
    }

    setSelectedDate(null);
    if (onChange) {
      onChange({
        target: { value: formattedVal === "" ? "" : "Invalid Date" },
      });
    }
  };

  const openCalendar = (e) => {
    if (disabled) return;
    e.preventDefault(); // stop focus/caret
    e.stopPropagation();
    if (dateRef.current) {
      if (typeof dateRef.current.showPicker === "function") {
        dateRef.current.showPicker(); // must be called in direct gesture
      } else {
        dateRef.current.click(); // fallback
      }
    }
  };

  return (
    <div
      style={{ position: "relative", maxWidth: "540px", cursor: disabled ? "not-allowed" : "default" }}
    >
      <TextInput
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          cursor: disabled ? "not-allowed" : "text",
        }}
        onChange={handleTextChange}
        {...props}
      />

      <span
        onMouseDown={openCalendar}
        onTouchStart={openCalendar}
        style={{
          position: "absolute",
          right: "2%",
          top: "50%",
          transform: "translateY(-50%)",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          zIndex: 2,
        }}
      >
        <CalendarIcon
          style={{
            pointerEvents: "none",
            width: "16px",
            height: "16px",
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </span>

      <input
        ref={dateRef}
        type="date"
        tabIndex={-1}
        value={selectedDate && !isNaN(selectedDate.getTime()) ? formatDateToYYYYMMDD(selectedDate) : ""}
        onChange={(e) => handleDateChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        style={hiddenDateInputStyle}
        onInvalid={(e) => e.preventDefault()}
      />
    </div>
  );
};

export default CustomDatePicker;
