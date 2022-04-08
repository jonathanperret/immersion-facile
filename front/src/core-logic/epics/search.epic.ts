import {
  BehaviorSubject,
  catchError,
  concat,
  filter,
  from,
  iif,
  map,
  Observable,
  of,
  scan,
  switchMap,
} from "rxjs";
import type { ImmersionSearchGateway } from "src/core-logic/ports/ImmersionSearchGateway";
import { SearchImmersionRequestDto } from "src/shared/searchImmersion/SearchImmersionRequest.dto";
import { SearchImmersionResultDto } from "src/shared/searchImmersion/SearchImmersionResult.dto";

interface SearchEpicDependencies {
  immersionSearchGateway: ImmersionSearchGateway;
  minResultToPreventRefetch: number;
}

type SearchStatus = "noSearchMade" | "ok" | "loading" | "error";

export const createSearchEpic = ({
  immersionSearchGateway,
  minResultToPreventRefetch,
}: SearchEpicDependencies) => {
  const searchResults$ = new BehaviorSubject<SearchImmersionResultDto[]>([]);
  const searchStatus$ = new BehaviorSubject<SearchStatus>("noSearchMade");

  const searchInfo$: Observable<string | null> = concat(
    of("Veuillez sélectionner vos critères"),
    searchStatus$.pipe(
      filter((status) => status === "ok"),
      switchMap(() =>
        searchResults$.pipe(
          map((results) => {
            return results.length === 0
              ? "Pas de résultat. Essayez avec un plus grand rayon de recherche..."
              : null;
          }),
        ),
      ),
    ),
  );

  return {
    views: {
      searchResults$,
      isSearching$: searchStatus$.pipe(map((status) => status === "loading")),
      searchInfo$,
    },
    actions: {
      search: (params: SearchImmersionRequestDto) => {
        searchStatus$.next("loading");

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
                of(r1),
                concat(
                  of(r1),
                  from(
                    immersionSearchGateway.search({
                      ...params,
                      voluntary_to_immersion: false,
                    }),
                  ),
                ),
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
