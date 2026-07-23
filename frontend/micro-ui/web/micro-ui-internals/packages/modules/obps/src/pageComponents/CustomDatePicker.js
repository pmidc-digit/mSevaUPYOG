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

const CustomDatePicker = ({ value, onChange, placeholder = "dd/mm/yyyy", min, max, disabled, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [inputValue, setInputValue] = useState(value ? formatDateToDDMMYYYY(value) : "");
  const dateRef = useRef();

  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      if (!isNaN(newDate.getTime())) {
        setSelectedDate(newDate);
        setInputValue(formatDateToDDMMYYYY(newDate));
      } else {
        setSelectedDate(null);
        setInputValue("");
      }
    } else {
      setSelectedDate(null);
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
    } else {
      setSelectedDate(null);
      setInputValue("");
      if (onChange) {
        onChange({
          target: { value: "" },
        });
      }
    }
  };

  const openCalendar = (e) => {
    if (disabled) return;
    e.preventDefault(); // stop focus/caret
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
      style={{ position: "relative", maxWidth: "540px", cursor: disabled ? "not-allowed" : "pointer" }}
      onMouseDown={openCalendar}
      onTouchStart={openCalendar}
    >
      <TextInput
        value={inputValue}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          caretColor: "transparent", // hides caret if somehow focused
        }}
        tabIndex={-1}
        {...props}
      />

      <CalendarIcon
        style={{
          position: "absolute",
          right: "2%", // closer to text
          top: "50%", // pushed slightly up
          transform: "translateY(-50%)",
          pointerEvents: "none", // let container handle click
          width: "16px",
          height: "16px",
          opacity: disabled ? 0.5 : 1,
        }}
      />

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
      />
    </div>
  );
};

export default CustomDatePicker;
