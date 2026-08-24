import React, { useState, useRef, useEffect } from "react";
import { TextInput } from "@mseva/digit-ui-react-components";
import { format } from "date-fns";
import { CalendarIcon } from "../../../../react-components/src/atoms/svgindex";

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

      onMouseDown={openCalendar} className="ral-style-8556ab25bb">

      <TextInput
        value={inputValue}
        placeholder={placeholder}
        readOnly




        tabIndex={-1}
        {...props} className="ral-style-13e42518aa" />


      <CalendarIcon className="ral-style-9be68d3ddc" />











      <input
        ref={dateRef}
        type="date"
        tabIndex={-1}
        value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
        onChange={(e) => handleDateChange(e.target.value)}
        min={min}
        max={max}
        className="ral-hidden-date-input" />

    </div>);

};

export default CustomDatePicker;
