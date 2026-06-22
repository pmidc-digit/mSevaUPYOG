import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

// A lightweight feature-rich textbox used in the employee pages.
// Features:
// - Autosize to content
// - Simple markdown-like toolbar (bold, italic, underline, bullet, ordered, link)
// - Character counter and maxLength enforcement
// - Calls onChange with an event-like object ({ target: { value } }) so existing handlers keep working

const applyWrap = (text, selectionStart, selectionEnd, left, right = left) => {
  const before = text.slice(0, selectionStart);
  const middle = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);
  return { newText: before + left + middle + right + after, newStart: selectionStart + left.length, newEnd: selectionEnd + left.length + middle.length };
};

const RichTextBox = ({ value, onChange, placeholder, className, style, maxLength = 5000 }) => {
  const [text, setText] = useState(value || "");
  const taRef = useRef(null);

  useEffect(() => {
    setText(value || "");
  }, [value]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [text]);

  const emitChange = (val) => {
    setText(val);
    if (typeof onChange === "function") onChange({ target: { value: val } });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    if (maxLength && val.length > maxLength) return;
    emitChange(val);
  };

  const wrapSelection = (left, right) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const { newText, newStart, newEnd } = applyWrap(text, start, end, left, right);
    emitChange(newText);
    // set selection after DOM update
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const insertAt = (insertText) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const newText = before + insertText + after;
    emitChange(newText);
    setTimeout(() => {
      ta.focus();
      const pos = start + insertText.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  return (
    <div className={`rich-textbox-wrapper ${className || ""}`} style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }} className="rich-textbox-toolbar">
        {/* <button type="button" onClick={() => wrapSelection("**", "**")} title="Bold">
          <b>B</b>
        </button>
        <button type="button" onClick={() => wrapSelection("*", "*")} title="Italic">
          <i>I</i>
        </button> */}
        <button type="button" onClick={() => wrapSelection("__", "__")} title="Underline">
          <u>U</u>
        </button>
        <button type="button" onClick={() => insertAt("\n- ")} title="Bullet list">
          •
        </button>
        <div style={{ marginLeft: "auto", fontSize: "12px", color: "#666" }}>
          {text.length}/{maxLength}
        </div>
      </div>
      <textarea
        ref={taRef}
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        className={"rich-textbox-textarea"}
        style={{ resize: "none", overflow: "hidden", minHeight: "80px", maxHeight: "1500px", padding: "8px", fontSize: "14px" }}
      />
    </div>
  );
};

RichTextBox.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  maxLength: PropTypes.number,
};

export default RichTextBox;
