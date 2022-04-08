import { Observable, timeout, TimeoutError } from "rxjs";
import { InMemoryImmersionSearchGateway } from "src/core-logic/adapters/InMemoryImmersionSearchGateway";
import { createSearchEpic } from "src/core-logic/epics/search.epic";
import { SearchImmersionResultDto } from "src/shared/searchImmersion/SearchImmersionResult.dto";
import DoneCallback = jest.DoneCallback;

// those test should be fast, we don't want to wait 5s if they fail
jest.setTimeout(300);

describe("Search immersions", () => {
  let immersionSearchGateway: InMemoryImmersionSearchGateway;
  let searchEpic: ReturnType<typeof createSearchEpic>;

  beforeEach(() => {
    immersionSearchGateway = new InMemoryImmersionSearchGateway({
      defaultResults: [],
      simulatedLatency: 0,
    });
    searchEpic = createSearchEpic({
      immersionSearchGateway,
      minResultToPreventRefetch: 2,
    });
  });

  it("triggers the search and recovers some results from form than extras from lbb", (done) => {
    // prettier-ignore
    const voluntaryResults: SearchImmersionResultDto[] = [
      { siret: "form-1", voluntaryToImmersion: true } as SearchImmersionResultDto,
    ];
    // prettier-ignore
    const notVoluntaryResults: SearchImmersionResultDto[] = [
      { siret: "lbb-1", voluntaryToImmersion: false } as SearchImmersionResultDto,
    ];
    immersionSearchGateway.setNextSearchResult([
      ...voluntaryResults,
      ...notVoluntaryResults,
    ]);

    expectObservableNextValuesToBe(
      searchEpic.views.searchResults$,
      [[], voluntaryResults, [...voluntaryResults, ...notVoluntaryResults]],
      done,
    );

    searchEpic.actions.search({
      siret: "11112222333344",
      location: { lat: 0, lon: 0 },
      distance_km: 1,
    });
  });

  it("triggers the search and recovers only results from form if there are enough", (done) => {
    // prettier-ignore
    const voluntaryResults: SearchImmersionResultDto[] = [
      { siret: "form-1", voluntaryToImmersion: true } as SearchImmersionResultDto,
      { siret: "form-2", voluntaryToImmersion: true } as SearchImmersionResultDto,
    ];
    // prettier-ignore
    const notVoluntaryResults: SearchImmersionResultDto[] = [
      { siret: "lbb-1", voluntaryToImmersion: false } as SearchImmersionResultDto,
    ];

    immersionSearchGateway.setNextSearchResult([
      ...voluntaryResults,
      ...notVoluntaryResults,
    ]);

    expectObservableNextValuesToBe(
      searchEpic.views.searchResults$,
      [[], voluntaryResults],
      done,
    );

    searchEpic.actions.search({
      siret: "11112222333344",
      location: { lat: 0, lon: 0 },
      distance_km: 1,
    });
  });

  it("shows a loading state while fetching the data", (done) => {
    expectObservableNextValuesToBe(
      searchEpic.views.isSearching$,
      [false, true, false],
      done,
    );

    searchEpic.actions.search({
      siret: "11112222333344",
      location: { lat: 0, lon: 0 },
      distance_km: 1,
    });
  });

  it("shows a fetching-more state while fetching extra data", (done) => {
    // prettier-ignore
    const voluntaryResults: SearchImmersionResultDto[] = [
      { siret: "form-1", voluntaryToImmersion: true } as SearchImmersionResultDto,
    ];
    // prettier-ignore
    const notVoluntaryResults: SearchImmersionResultDto[] = [
      { siret: "lbb-1", voluntaryToImmersion: false } as SearchImmersionResultDto,
    ];
    immersionSearchGateway.setNextSearchResult([
      ...voluntaryResults,
      ...notVoluntaryResults,
    ]);

    expectObservableNextValuesToBe(
      searchEpic.views.searchInfo$,
      [
        "Veuillez sélectionner vos critères",
        null,
        "Nous cherchons à compléter votre recherche...",
        null,
      ],
      done,
    );

    searchEpic.actions.search({
      siret: "11112222333344",
      location: { lat: 0, lon: 0 },
      distance_km: 1,
    });
  });

  it("when an error occurs, no result is return, and the error is logged", (done) => {
    immersionSearchGateway.setError(new Error("Oups, something went wrong !"));
    expectObservableNextValuesToBe(
      searchEpic.views.searchResults$,
      [[], []],
      done,
    );

    searchEpic.actions.search({
      siret: "11112222333344",
      location: { lat: 0, lon: 0 },
      distance_km: 1,
    });
  });

  it("when nothing happened, it should invite to give fill the form", (done) => {
    expectObservableNextValuesToBe(
      searchEpic.views.searchInfo$,
      ["Veuillez sélectionner vos critères"],
      done,
    );
  });

  it("when triggering a search and no results, it should inform the user", (done) => {
    expectObservableNextValuesToBe(
      searchEpic.views.searchInfo$,
      [
        "Veuillez sélectionner vos critères",
        null,
        "Pas de résultat. Essayez avec un plus grand rayon de recherche...",
        "Nous cherchons à compléter votre recherche...",
        "Pas de résultat. Essayez avec un plus grand rayon de recherche...",
      ],
      done,
    );

    searchEpic.actions.search({
      siret: "11112222333344",
      location: { lat: 0, lon: 0 },
      distance_km: 1,
    });
  });
});

const expectObservableNextValuesToBe = <T>(
  obs$: Observable<T>,
  values: T[],
  done: DoneCallback,
) => {
  obs$.pipe(timeout({ each: 1 })).subscribe({
    next: (v) => {
      if (values.length === 0) {
        return done("Observable emitted extra value : " + v);
      }
      const expectedValue = values.shift();
      expect(v).toEqual(expectedValue);
    },
    error: (err) => {
      if (err instanceof TimeoutError) {
        if (values.length === 0) return done(); // this is when every thing is finished as expected
        return done(
          "Still expecting values " + JSON.stringify(values, null, 2),
        );
      }

      return done("Unexpected error " + JSON.stringify(err, null, 2));
    },
  });
};
