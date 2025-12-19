import React, { useEffect, useReducer, useRef, useState, useMemo } from "react";
// import { ArrowDown, CheckSvg } from "./svgindex";
import { useTranslation } from "react-i18next";

// SVG Components
const ArrowDown = ({ className, onClick, styles, disable }) => (
  <svg
    style={{ ...styles }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={disable ? "#9E9E9E" : "black"}
    className={className}
    onClick={onClick}
    width="18px"
    height="18px"
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M7 10l5 5 5-5H7z" />
  </svg>
);

const CheckSvg = ({ className, style = {} }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1359C8" className={className} style={style}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
  </svg>
);

const MultiSelectDropdown = ({ options, optionsKey, selected = [], onSelect, defaultLabel = "", defaultUnit = "",BlockNumber=1,isOBPSMultiple=false,props={},isPropsNeeded=false,ServerStyle={}, isSurvey=false}) => {
  const [active, setActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState();
  const [optionIndex, setOptionIndex] = useState(-1);
  const dropdownRef = useRef();
  const { t } = useTranslation();

  function reducer(state, action){
    switch(action.type){
      case "ADD_TO_SELECTED_EVENT_QUEUE":
        const newStateAdd = [...state, {[optionsKey]: action.payload?.[1]?.[optionsKey], propsData: action.payload} ];
        return newStateAdd;
      case "REMOVE_FROM_SELECTED_EVENT_QUEUE":
        const newStateRemove = state.filter( e => e?.[optionsKey] !== action.payload?.[1]?.[optionsKey]);
        return newStateRemove;
      case "SELECT_ALL":
        const allSelected = action.payload.map(option => ({
          [optionsKey]: option[optionsKey], 
          propsData: [null, option]
        }));
        return allSelected;
      case "DESELECT_ALL":
        return [];
      case "REPLACE_COMPLETE_STATE":
        return action.payload;
      default:
        return state
    }
  }

  function fnToSelectOptionThroughProvidedSelection(selected){
    return selected?.map( e => ({[optionsKey]: e?.[optionsKey], propsData: [null, e]}))
  }

  const [alreadyQueuedSelectedState, dispatch] = useReducer(reducer, selected, fnToSelectOptionThroughProvidedSelection)

  useEffect(() => {
    // Only update from parent when dropdown is closed
    if (!active) {
      dispatch({type: "REPLACE_COMPLETE_STATE", payload: fnToSelectOptionThroughProvidedSelection(selected) })
    }
  },[selected, active])
  
  useEffect(()=> {
    if(!active){
      onSelect(alreadyQueuedSelectedState?.map( e => e.propsData), props)
    }
  },[active])


  function handleOutsideClickAndSubmitSimultaneously(){
    setActive(false)
  }

  Digit.Hooks.useClickOutside(dropdownRef, handleOutsideClickAndSubmitSimultaneously , active, {capture: true} );
  const filtOptns =
      searchQuery?.length > 0 ? options.filter((option) => t(option[optionsKey]&&typeof option[optionsKey]=="string" && option[optionsKey].toUpperCase()).toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0) : options;
    
  function onSearch(e) {
    setSearchQuery(e.target.value);
  }

  // Handle Select All / Deselect All
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Select ALL filtered options (excluding "Select All" itself)
      const allItemsExceptSelectAll = filtOptns.filter(opt => opt.code !== "ALL" && opt[optionsKey] !== "Select All");
      dispatch({ type: "SELECT_ALL", payload: allItemsExceptSelectAll });
    } else {
      // Deselect ALL
      dispatch({ type: "DESELECT_ALL" });
    }
  };

  function onSelectToAddToQueue(...props){
    const isChecked = arguments[0].target.checked
    isChecked ? dispatch({type: "ADD_TO_SELECTED_EVENT_QUEUE", payload: arguments }) : dispatch({type: "REMOVE_FROM_SELECTED_EVENT_QUEUE", payload: arguments })
  }

/* Custom function to scroll and select in the dropdowns while using key up and down */
    const keyChange = (e) => {
    if (e.key == "ArrowDown") {
      setOptionIndex(state =>state+1== filtOptns.length?0:state+1);
      if(optionIndex+1== filtOptns.length){
        e?.target?.parentElement?.parentElement?.children?.namedItem("jk-dropdown-unique")?.scrollTo?.(0,0)
      }else{
        optionIndex>2&& e?.target?.parentElement?.parentElement?.children?.namedItem("jk-dropdown-unique")?.scrollBy?.(0,45)
      }
      e.preventDefault();
    } else if (e.key == "ArrowUp") {
      setOptionIndex(state =>  state!==0? state - 1: filtOptns.length-1);
      if(optionIndex===0){
        e?.target?.parentElement?.parentElement?.children?.namedItem("jk-dropdown-unique")?.scrollTo?.(100000,100000)
      }else{
        optionIndex>2&&e?.target?.parentElement?.parentElement?.children?.namedItem("jk-dropdown-unique")?.scrollBy?.(0,-45)
     }
      e.preventDefault();
    }else if(e.key=="Enter"){
      onSelectToAddToQueue(e,filtOptns[optionIndex]);
    } 
  }

  const MenuItem = ({ option, index }) => {
    // Check if this is the "Select All" option
    const isSelectAllOption = option.code === "ALL" || option[optionsKey] === "Select All";
    
    // Use useMemo to recalculate when alreadyQueuedSelectedState changes
    const isChecked = useMemo(() => {
      if (isSelectAllOption) {
        // "Select All" is checked if ALL non-Select-All items are selected
        const nonSelectAllOptions = filtOptns.filter(opt => opt.code !== "ALL" && opt[optionsKey] !== "Select All");
        if (nonSelectAllOptions.length === 0) return false;
        const allSelected = nonSelectAllOptions.every(opt => 
          alreadyQueuedSelectedState.some(selected => selected[optionsKey] === opt[optionsKey])
        );
        return allSelected;
      }
      
      const found = alreadyQueuedSelectedState.find((selectedOption) => selectedOption[optionsKey] === option[optionsKey]);
      return !!found;
    }, [option, alreadyQueuedSelectedState, isSelectAllOption]);
    
    // Handle click
    const handleClick = (e) => {
      if (isSelectAllOption) {
        // Trigger handleSelectAll instead of regular onSelectToAddToQueue
        handleSelectAll(e);
      } else {
        // Normal item selection
        if (isPropsNeeded) {
          onSelectToAddToQueue(e, option, props);
        } else if (isOBPSMultiple) {
          onSelectToAddToQueue(e, option, BlockNumber);
        } else {
          onSelectToAddToQueue(e, option);
        }
      }
    };
    
    return (
      <div key={index} style={isOBPSMultiple ? (index%2 !== 0 ?{background : "#EEEEEE"}:{}):{}}>
        <input
          type="checkbox"
          value={option[optionsKey]}
          checked={isChecked}
          onChange={handleClick}
          style={{minWidth: "24px", width: "100%"}}
        />
        <div className="custom-checkbox">
          <CheckSvg style={{innerWidth: "24px", width: "24px"}}/>
        </div>
        <p className="label" style={index === optionIndex ? {
                      opacity: 1,
                      backgroundColor: "rgba(238, 238, 238, var(--bg-opacity))"
                    } : { }} >{t(option[optionsKey]&&typeof option[optionsKey]=="string" && option[optionsKey])}</p>
      </div>
    );
  };

  const Menu = () => {
    const filteredOptions =
      searchQuery?.length > 0 ? options.filter((option) => t(option[optionsKey]&&typeof option[optionsKey]=="string" && option[optionsKey].toUpperCase()).toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0) : options;
    
    // Force re-render when alreadyQueuedSelectedState changes by using its length
    const _ = alreadyQueuedSelectedState.length;
    
    return filteredOptions?.map((option, index) => <MenuItem option={option} key={`${option[optionsKey]}-${index}`} index={index} />);
  };

  return (
    <div className="multi-select-dropdown-wrap" ref={dropdownRef}>
      <div className={`master${active ? `-active` : ``}`}>
        <input className="cursorPointer" type="text" onKeyDown={keyChange} onFocus={() => setActive(true)} value={searchQuery} onChange={onSearch} />
        <div className="label">
          <p>{alreadyQueuedSelectedState.length > 0 ? `${isSurvey? alreadyQueuedSelectedState?.filter((ob) => ob?.i18nKey !== undefined).length : alreadyQueuedSelectedState.length} ${defaultUnit}` : defaultLabel}</p>
          <ArrowDown />
        </div>
      </div>
      {active ? (
        <div className="server" id="jk-dropdown-unique" style={ServerStyle?ServerStyle:{}}>
          <Menu />
        </div>
      ) : null}
    </div>
  );
};

export default MultiSelectDropdown;
 