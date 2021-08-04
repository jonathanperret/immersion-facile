import { FormulaireEntity } from "../../domain/formulaires/entities/FormulaireEntity";
import { AirtableFormulaireRepository } from "./AirtableFormulaireRepository";

describe("AirtableFormulaireRepository", () => {
  it("does things", async () => {
    const entry = FormulaireEntity.create({
      email: new Date().getTime() + "@email.fr",
      dateStart: new Date("2021-08-04"),
      dateEnd: new Date("2021-09-04"),
    });

    const repository = AirtableFormulaireRepository.create(
      /* apiKey= */ "keyPJn9LnvLL7KnHy",
      /* baseId= */ "appirDzZTw4Re7H5o",
      /* tableName= */ "formulaires",
    );

    (await repository.save(entry)).getOrThrow();

    const formulaires = (await repository.getAllFormulaires()).getOrThrow();
    expect(formulaires).toContainEqual(entry);
  });
});
