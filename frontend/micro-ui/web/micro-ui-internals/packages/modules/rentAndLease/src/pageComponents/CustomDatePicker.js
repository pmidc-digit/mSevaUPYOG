import React, { useState, useRef, useEffect } from "react";
import { TextInput } from "@mseva/digit-ui-react-components";
import { format } from "date-fns";
import { CalendarIcon } from "../../../../react-components/src/atoms/svgindex";

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

const CustomDatePicker = ({ value, onChange, placeholder = "DD/MM/YYYY", min, max, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [inputValue, setInputValue] = useState(value ? format(new Date(value), "dd/MM/yyyy") : "");
  const dateRef = useRef();

  useEffect(() => {
    if (value) {
      const newDate = new Date(value);
      if (!isNaN(newDate)) {
        setSelectedDate(newDate);
        setInputValue(format(newDate, "dd/MM/yyyy"));
      }
    }
  }, [value]);

  const handleDateChange = (date) => {
    const newDate = new Date(date);
    if (!isNaN(newDate)) {
      setSelectedDate(newDate);
      setInputValue(format(newDate, "dd/MM/yyyy"));
      onChange({
        target: { value: format(newDate, "yyyy-MM-dd") },
      });
    }
  };

  const openCalendar = (e) => {
    e.preventDefault();
    if (dateRef.current) {
      if (typeof dateRef.current.showPicker === "function") {
        dateRef.current.showPicker();
      } else {
        dateRef.current.click();
      }
    }
  };

  return (
    <div
      style={{ position: "relative", width: "100%", cursor: "pointer" }}
      onMouseDown={openCalendar}
    >
      <TextInput
        value={inputValue}
        placeholder={placeholder}
        readOnly
        style={{
          cursor: "pointer",
          caretColor: "transparent",
        }}
        tabIndex={-1}
        {...props}
      />

      <CalendarIcon
        style={{
          position: "absolute",
          right: 12,
          top: "45%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          width: "16px",
          height: "16px",
        }}
      />

      <input
        ref={dateRef}
        type="date"
        tabIndex={-1}
        value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
        onChange={(e) => handleDateChange(e.target.value)}
        min={min}
        max={max}
        style={hiddenDateInputStyle}
      />
    </div>
  );
};

export default CustomDatePicker;

