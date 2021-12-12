import {
  Search,
  SearchRepository,
} from "../../../domain/immersionOffer/ports/ImmersionOfferRepository";

export class InMemorySearchRepository implements SearchRepository {
  private _searches: Search[] = [];

  async getUnprocessedSearches(): Promise<Search[]> {
    return this._searches.filter((search) => !search.processed);
  }
  async setSearchProcessed(madeAt: Date, processed: boolean): Promise<void> {
    this._searches = this._searches.map((search) => {
      if (search.madeAt === madeAt) return { ...search, processed };
      return search;
    });
  }

  // The following methods intended for test purposes only
  set searches(searches: Search[]) {
    this._searches = searches;
  }

  get searches(): Search[] {
    return this._searches;
  }
}
