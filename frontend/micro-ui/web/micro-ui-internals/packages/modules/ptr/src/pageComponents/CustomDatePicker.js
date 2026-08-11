import React, { useState, useRef, useEffect } from "react";
import { TextInput } from "@mseva/digit-ui-react-components";
import { format } from "date-fns";
import { CalendarIcon } from "../../../../../packages/react-components/src/atoms/svgindex";

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
        target: { value: format(newDate, "yyyy-MM-dd") }
      });
    }
  };

  const openCalendar = (e) => {
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

      onMouseDown={openCalendar}
      onTouchStart={openCalendar}
      // onMouseDown={openCalendar} // triggers on click anywhere in container
      className="ptr-style-3647f40150">
      <TextInput
        value={inputValue}
        placeholder={placeholder}
        readOnly




        tabIndex={-1}
        {...props} className="ptr-style-9fc225d522" />


      <CalendarIcon className="ptr-style-a3347904b1" />











      <input
        ref={dateRef}
        type="date"
        tabIndex={-1}
        value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
        onChange={(e) => handleDateChange(e.target.value)}
        min={min}
        max={max}
        className="ptr-hidden-date-input" />

    </div>);

};

export default CustomDatePicker;
