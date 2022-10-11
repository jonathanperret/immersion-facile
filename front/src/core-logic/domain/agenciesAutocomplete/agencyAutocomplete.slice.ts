import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AgencyDto, AgencyIdAndName } from "shared";

interface AgencyAutocompleteState {
  agencySearchText: string;
  agencyOptions: AgencyIdAndName[];
  selectedAgency: AgencyIdAndName | null;
  agency: AgencyDto | null;
  isSearching: boolean;
}

const initialState: AgencyAutocompleteState = {
  agencySearchText: "",
  agencyOptions: [],
  selectedAgency: null,
  agency: null,
  isSearching: false,
};

export const agencyAutocompleteSlice = createSlice({
  name: "agencyAutocomplete",
  initialState,
  reducers: {
    setAgencySearchText: (state, action: PayloadAction<string>) => {
      state.agencySearchText = action.payload;
      state.selectedAgency = null;
    },
    searchStarted: (state) => {
      state.isSearching = true;
    },
    setAgencyOptions: (state, action: PayloadAction<AgencyIdAndName[]>) => {
      state.agencyOptions = action.payload;
      state.isSearching = false;
    },
    setSelectedAgency: (state, action: PayloadAction<AgencyIdAndName>) => {
      state.selectedAgency = action.payload;
    },
    setAgency: (state, action: PayloadAction<AgencyDto | null>) => {
      state.agency = action.payload ?? null;
    },
  },
});
