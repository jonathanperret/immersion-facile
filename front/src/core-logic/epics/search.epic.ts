import {
  BehaviorSubject,
  catchError,
  concat,
  concatMap,
  filter,
  from,
  map,
  mergeMap,
  Observable,
  of,
  concatWith,
  concatAll,
  switchMap,
  tap,
} from "rxjs";
import type { ImmersionSearchGateway } from "src/core-logic/ports/ImmersionSearchGateway";
import { SearchImmersionRequestDto } from "src/shared/searchImmersion/SearchImmersionRequest.dto";
import { SearchImmersionResultDto } from "src/shared/searchImmersion/SearchImmersionResult.dto";

interface SearchEpicDependencies {
  immersionSearchGateway: ImmersionSearchGateway;
}

type SearchStatus = "noSearchMade" | "ok" | "loading" | "error";

export const createSearchEpic = ({
  immersionSearchGateway,
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
            // filter(voluntaryOffers => voluntaryOffers.length >= 10)
            // if (results.length > 10) return from([]);
            concatAll(
              from(
                immersionSearchGateway.search({
                  ...params,
                  voluntary_to_immersion: false,
                }),
              ).pipe(map((r) => [...r])),
            ),
            // concatMap((results) => {
            //   console.log("concatMap", results);

            //   return from(
            //     immersionSearchGateway.search({
            //       ...params,
            //       voluntary_to_immersion: false,
            //     }),
            //   ).pipe(map((results2) => [...results, ...results2]));
            // }),
            tap((results) => console.log("tap", results)),
            catchError((err) => {
              console.error(err);
              searchStatus$.next("error");
              return of([]);
            }),
          )
          .subscribe((searchResults) => {
            // searchResults$.next(searchResults);
            searchStatus$.next("ok");
          });
      },
    },
  };
};
