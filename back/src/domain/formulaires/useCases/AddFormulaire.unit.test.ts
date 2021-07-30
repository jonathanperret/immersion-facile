import { AddFormulaire } from "./AddFormulaire";
import { v4 as generateUuid } from "uuid";
import { InMemoryFormulaireRepository } from "../../../adapters/secondary/InMemoryFormulaireRepository";

describe("Add Formulaire", () => {
  const UUID = generateUuid();
  const EMAIL = "a@b.com";
  const DATE_START = new Date(1000);
  const DATE_END = new Date(1001);

  let addFormulaire: AddFormulaire;
  let formulaireRepository: InMemoryFormulaireRepository;

  beforeEach(() => {
    formulaireRepository = new InMemoryFormulaireRepository();
    addFormulaire = new AddFormulaire({ formulaireRepository });
  });

  describe("Valid FormulaireDto", () => {
    test("saves the formulaire in the repository", async () => {
      await addFormulaire.execute({
        uuid: UUID,
        email: EMAIL,
        dateStart: DATE_START,
        dateEnd: DATE_END,
      });
      expect(await formulaireRepository.getAllFormulaires()).toEqual([
        { uuid: UUID, email: EMAIL, dateStart: DATE_START, dateEnd: DATE_END },
      ]);
    });
  });
});
