import { expectTypeToMatchAndEqual } from "../../../_testBuilders/test.helpers";
import { RomeRepository } from "../../../domain/rome/ports/RomeRepository";
import { InMemoryRomeRepository } from "../../../adapters/secondary/InMemoryRomeRepository";
import { SearchRomeAppellation } from "../../../domain/rome/useCases/SearchRomeAppellation";

describe("SearchRomeAppellation", () => {
  let gateway: RomeRepository;

  beforeEach(() => {
    gateway = new InMemoryRomeRepository();
  });

  const createUseCase = () => {
    return new SearchRomeAppellation(gateway);
  };

  test("returns the list of found matches with ranges", async () => {
    const response = await createUseCase().execute("lapins");
    expectTypeToMatchAndEqual(response, [
      {
        appellation: {
          codeAppellation: "14704",
          libelleAppellation: "Éleveur / Éleveuse de lapins angoras",
          codeRome: "A1409",
          libelleRome: "Élevage de lapins et volailles",
        },
        matchRanges: [{ startIndexInclusive: 22, endIndexExclusive: 28 }],
      },
    ]);
  });

  test("issues no queries for short search texts", async () => {
    const mockSearchMetierFn = jest.fn();
    const mockSearchAppellationFn = jest.fn();
    const mockAppellationToCodeMetier = jest.fn();
    gateway = {
      searchMetier: mockSearchMetierFn,
      searchAppellation: mockSearchAppellationFn,
      appellationToCodeMetier: mockAppellationToCodeMetier,
    };

    const response = await createUseCase().execute("lap");
    expect(mockSearchMetierFn.mock.calls).toHaveLength(0);
    expect(mockSearchAppellationFn.mock.calls).toHaveLength(0);
    expect(response).toEqual([]);
  });

  test("returns empty list when no match is found ", async () => {
    expect(await createUseCase().execute("unknown_search_term")).toEqual([]);
  });
});
