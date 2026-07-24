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
  const handleTextChange = (e) => {
    let val = e.target.value;
    
    // Remove non-digit characters except slash
    val = val.replace(/[^\d/]/g, "");
    
    if (val.length > 10) return;

    // Detect backspace/deleting to avoid forcing slashes
    const isDeleting = val.length < inputValue.length;

    if (!isDeleting) {
      if (val.length === 2 && !val.includes("/")) {
        val = val + "/";
      } else if (val.length === 5 && val.split("/").length === 2) {
        val = val + "/";
      }
    }

    setInputValue(val);

    const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
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
        target: { value: val === "" ? "" : "Invalid Date" },
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
      />
    </div>
  );
};

export default CustomDatePicker;
