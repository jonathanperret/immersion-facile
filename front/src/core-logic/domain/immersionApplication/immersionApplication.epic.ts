import { filter, from, map, Observable, switchMap, tap } from "rxjs";
import {
  ImmersionApplicationAction,
  immersionApplicationSlice,
} from "src/core-logic/domain/immersionApplication/immersionApplication.slice";
import { AppEpic } from "src/core-logic/storeConfig/redux.helpers";

const addImmersionApplicationEpic: AppEpic<ImmersionApplicationAction> = (
  action$,
  _state$,
  { immersionApplicationGateway },
): Observable<ImmersionApplicationAction> =>
  action$.pipe(
    filter(
      immersionApplicationSlice.actions.addImmersionApplicationRequested.match,
    ),
    switchMap((action) =>
      immersionApplicationGateway.addObservable({ ...action.payload }).pipe(
        map(immersionApplicationSlice.actions.addImmersionApplicationSucceeded),
      ),
    ),
  );

export const immersionApplicationEpics = [addImmersionApplicationEpic];
