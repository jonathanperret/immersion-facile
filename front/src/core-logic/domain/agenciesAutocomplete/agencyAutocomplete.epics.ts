import { PayloadAction } from "@reduxjs/toolkit";
import { filter, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { AgencyDto, AgencyIdAndName } from "shared";
import {
  ActionOfSlice,
  AppEpic,
} from "src/core-logic/storeConfig/redux.helpers";
import { agencyAutocompleteSlice } from "./agencyAutocomplete.slice";

type AgencyAction = ActionOfSlice<typeof agencyAutocompleteSlice>;

export const agencyAutocompleteGetByNameEpic: AppEpic<AgencyAction> = (
  action$,
  _state$,
  dependencies,
) =>
  action$.pipe(
    filter(agencyAutocompleteSlice.actions.setAgencySearchText.match),
    switchMap((action: PayloadAction<string>) =>
      dependencies.agencyGateway.listAgenciesByFilter$({
        name: action.payload,
      }),
    ),
    map(agencyAutocompleteSlice.actions.setAgencyOptions),
  );

export const agencyAutocompleteGetDetailsEpic: AppEpic<AgencyAction> = (
  action$,
  state$,
  dependencies,
) =>
  action$.pipe(
    filter(agencyAutocompleteSlice.actions.setSelectedAgency.match),
    switchMap(
      (action: PayloadAction<AgencyIdAndName>): Observable<AgencyDto> =>
        dependencies.agencyGateway.getAgencyAdminById$(
          action.payload.id,
          state$.value.admin.adminAuth.adminToken ?? "",
        ),
    ),
    map(agencyAutocompleteSlice.actions.setAgency),
  );

export const agenciesAutocompleteEpics = [
  agencyAutocompleteGetByNameEpic,
  agencyAutocompleteGetDetailsEpic,
];
