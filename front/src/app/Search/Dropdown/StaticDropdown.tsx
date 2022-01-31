import { Autocomplete } from "@mui/material";
import React, { CSSProperties } from "react";
import "./searchdropdown.css";

type ValueAndLabel<V> = {
  value: V;
  label: string;
};

type StaticDropdownProps<V> = {
  title: string;
  onSelect: (str: V | null) => void;
  options: ValueAndLabel<V>[];
  defaultValue?: ValueAndLabel<V>;
  className?: string;
  inputStyle?: CSSProperties;
};

export const StaticDropdown = <V extends unknown>({
  title,
  className,
  options,
  onSelect,
  inputStyle,
  defaultValue,
}: StaticDropdownProps<V>) => {
  return (
    <Autocomplete
      defaultValue={defaultValue}
      onChange={(_, selectedOption: ValueAndLabel<V> | null) => {
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
