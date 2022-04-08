import {
  BehaviorSubject,
  catchError,
  concat,
  distinctUntilChanged,
  filter,
  from,
  iif,
  map,
  Observable,
  of,
  scan,
  switchMap,
  tap,
} from "rxjs";
import type { ImmersionSearchGateway } from "src/core-logic/ports/ImmersionSearchGateway";
import { SearchImmersionRequestDto } from "src/shared/searchImmersion/SearchImmersionRequest.dto";
import { SearchImmersionResultDto } from "src/shared/searchImmersion/SearchImmersionResult.dto";

interface SearchEpicDependencies {
  immersionSearchGateway: ImmersionSearchGateway;
  minResultToPreventRefetch: number;
}

type SearchStatus =
  | "noSearchMade"
  | "ok"
  | "initialFetch"
  | "extraFetch"
  | "error";

export const createSearchEpic = ({
  immersionSearchGateway,
  minResultToPreventRefetch,
}: SearchEpicDependencies) => {
  const searchResults$ = new BehaviorSubject<SearchImmersionResultDto[]>([]);
  const searchStatus$ = new BehaviorSubject<SearchStatus>("noSearchMade");

  const searchInfo$: Observable<string | null> = searchStatus$.pipe(
    switchMap((status) =>
      iif(
        () => status === "ok",
        searchResults$.pipe(
          map((results) =>
            results.length === 0
              ? "Pas de résultat. Essayez avec un plus grand rayon de recherche..."
              : null,
          ),
        ),
        of(
          status === "extraFetch"
            ? "Nous cherchons à compléter votre recherche..."
            : status === "noSearchMade"
            ? "Veuillez sélectionner vos critères"
            : null,
        ),
      ),
    ),
    distinctUntilChanged(),
  );

  return {
    views: {
      searchResults$,
      isSearching$: searchStatus$.pipe(
        map((status) => status === "initialFetch"),
        distinctUntilChanged(),
      ),
      searchInfo$,
    },
    actions: {
      search: (params: SearchImmersionRequestDto) => {
        searchStatus$.next("initialFetch");

        from(
          immersionSearchGateway.search({
            ...params,
            voluntary_to_immersion: true,
          }),
        )
          .pipe(
            switchMap((r1) =>
              iif(
                () => r1.length < minResultToPreventRefetch,
                concat(
                  of(r1),
                  from(
                    immersionSearchGateway.search({
                      ...params,
                      voluntary_to_immersion: false,
                    }),
                  ).pipe(tap(() => searchStatus$.next("extraFetch"))),
                ),
                of(r1),
              ),
            ),
            scan(
              (
                acc: SearchImmersionResultDto[],
                result: SearchImmersionResultDto[],
              ) => [...acc, ...result],
              [],
            ),
            catchError((err) => {
              searchStatus$.next("error");
              return of([]);
            }),
          )
          .subscribe((searchResults) => {
            searchResults$.next(searchResults);
            searchStatus$.next("ok");
          });
      },
    },
  };
};
