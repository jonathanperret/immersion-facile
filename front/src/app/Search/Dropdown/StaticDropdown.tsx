import { Autocomplete } from "@mui/material";
import React, { CSSProperties, useState } from "react";
import "./searchdropdown.css";

type Value = number;

type ValueAndLabel = {
  value: Value;
  label: string;
};

type StaticDropdownProps = {
  title: string;
  onSelect: (str: Value | null) => void;
  className?: string;
  options: ValueAndLabel[];
  inputStyle?: CSSProperties;
  defaultValue?: ValueAndLabel;
};

export const StaticDropdown = ({
  title,
  className,
  options,
  onSelect,
  inputStyle,
  defaultValue,
}: StaticDropdownProps) => {
  return (
    <Autocomplete
      defaultValue={defaultValue}
      onChange={(_, selectedOption: ValueAndLabel | null) => {
        onSelect(selectedOption?.value ?? null);
      }}
      renderInput={(params) => (
        <div ref={params.InputProps.ref}>
          <label
            className={`fr-label ${className ?? ""}`}
            htmlFor={"search-radius"}
          >
            {title}
          </label>
          <input
            id={"search-radius"}
            {...params.inputProps}
            className={"fr-input"}
            placeholder="Choisissez un rayon"
            style={{ cursor: "pointer", ...inputStyle }}
          />
        </div>
      )}
      options={options}
    />
  );
};

type StaticDropdownPropsOld = {
  title: string;
  onSelection: (index: number) => void;
  inputStyle?: any;
  options: string[];
  defaultSelectedIndex?: number;
};

export const StaticDropdownOld = ({
  title,
  onSelection,
  inputStyle,
  options,
  defaultSelectedIndex = 0,
}: StaticDropdownPropsOld) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex);

  return (
    <div className="autocomplete">
      <label className="inputLabel searchdropdown-header" htmlFor={"search"}>
        {title}
      </label>
      <span
        style={{ position: "relative" }}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <input
          disabled
          id="search"
          type="text"
          className="autocomplete-input"
          autoComplete="off"
          value={options[selectedIndex]}
          style={{ cursor: "pointer", ...inputStyle }}
        />
      </span>

      {isOpen && (
        <div className="autocomplete-items">
          {options.map((option, index) => (
            <div
              key={option}
              className="dropdown-proposal"
              onClick={() => {
                onSelection(index);
                setSelectedIndex(index);
                setIsOpen(!isOpen);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
