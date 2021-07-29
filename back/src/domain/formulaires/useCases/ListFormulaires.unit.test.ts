import { InMemoryFormulaireRepository } from "../../../adapters/secondary/InMemoryFormulaireRepository";
import { ListFormulaires } from "./ListFormulaires";

describe("List Formulaires", () => {
  it("sends empty list when no formulaires are stored", async () => {
    const formulaireRepository = new InMemoryFormulaireRepository();
    const listFormulaires = new ListFormulaires(formulaireRepository);

    const formulaires = await listFormulaires.execute();

    expect(formulaires).toEqual([]);
  });

  describe("When a todo is already stored", () => {
    it("sends the todo", async () => {
      const formulaireRepository = new InMemoryFormulaireRepository();

      const dateStart = new Date();
      const dateEnd = new Date();

      const formulaireStored = { uuid: "someUuid", email: "foo@bar.baz", dateStart: dateStart, dateEnd: dateEnd };
      formulaireRepository.setFormulaires([formulaireStored]);
      const listFormulaires = new ListFormulaires(formulaireRepository);

      const formulaires = await listFormulaires.execute();

      expect(formulaires).toEqual([
        { uuid: "someUuid", email: "foo@bar.baz", dateStart: dateStart, dateEnd: dateEnd }
      ]);
    });
  });
});
