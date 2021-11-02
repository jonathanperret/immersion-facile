import { RomeGateway } from "../../../domain/rome/ports/RomeGateway";
import { InMemoryRomeGateway } from "./../../../adapters/secondary/InMemoryRomeGateway";
import { RomeSearch } from "./../../../domain/rome/useCases/RomeSearch";

describe("RomeSearch", () => {
  let gateway: RomeGateway;

  beforeEach(() => {
    gateway = new InMemoryRomeGateway();
  });

  const createUseCase = () => {
    return new RomeSearch(gateway);
  };

  test("returns the list of found matches with ranges", async () => {
    const response = await createUseCase().execute({
      searchText: "lapins",
      searchMetiers: true,
      searchAppelations: true,
    });
    expect(response).toEqual([
      {
        profession: {
          romeCodeAppellation: "14704",
          description: "Éleveur / Éleveuse de lapins angoras",
        },
        matchRanges: [{ startIndexInclusive: 22, endIndexExclusive: 28 }],
      },
      {
        profession: {
          romeCodeMetier: "A1409",
          description: "Élevage de lapins et volailles",
        },
        matchRanges: [{ startIndexInclusive: 11, endIndexExclusive: 17 }],
      },
    ]);
  });

  test("filters out appelation/metiers as necessary", async () => {
    let response = await createUseCase().execute({
      searchText: "lapins",
      searchMetiers: false,
      searchAppelations: true,
    });
    expect(response).toEqual([
      {
        profession: {
          romeCodeAppellation: "14704",
          description: "Éleveur / Éleveuse de lapins angoras",
        },
        matchRanges: [{ startIndexInclusive: 22, endIndexExclusive: 28 }],
      },
    ]);

    response = await createUseCase().execute({
      searchText: "lapins",
      searchMetiers: true,
      searchAppelations: false,
    });
    expect(response).toEqual([
      {
        profession: {
          romeCodeMetier: "A1409",
          description: "Élevage de lapins et volailles",
        },
        matchRanges: [{ startIndexInclusive: 11, endIndexExclusive: 17 }],
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

    const response = await createUseCase().execute({
      searchText: "lap",
      searchMetiers: true,
      searchAppelations: true,
    });
    expect(mockSearchMetierFn.mock.calls).toHaveLength(0);
    expect(mockSearchAppellationFn.mock.calls).toHaveLength(0);
    expect(response).toEqual([]);
  });

  test("returns empty list when no match is found ", async () => {
    expect(
      await createUseCase().execute({
        searchText: "unknown_search_term",
        searchMetiers: true,
        searchAppelations: true,
      }),
    ).toEqual([]);
  });
});
