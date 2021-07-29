import { AddFormulaire } from "./AddFormulaire";
import { v4 as generateUuid } from "uuid";
import { InMemoryFormulaireRepository } from "../../../adapters/secondary/InMemoryFormulaireRepository";
import { expectPromiseToFailWith } from "../../../utils/test.helpers";

describe("Add Formulaire", () => {
    let addFormulaire: AddFormulaire;
    let formulaireRepository: InMemoryFormulaireRepository;

    beforeEach(() => {
        formulaireRepository = new InMemoryFormulaireRepository();
        addFormulaire = new AddFormulaire({ formulaireRepository });
    });

    describe("Email doesn't match RFC 5322", () => {
        it("refuses to add the Formulaire with an explicit warning", async () => {
            await expectPromiseToFailWith(
                addFormulaire.execute({ uuid: "someUuid", email: "not an email", dateStart: new Date(), dateEnd: new Date(), }),
                "Email must match the RFC standard."
            );
        });
    });

    describe("Email and dates are fine", () => {
        it("saves the Formulaire", async () => {
            const uuid = generateUuid();
            const email = "a@b.com";
            const dateStart = new Date();
            const dateEnd = new Date();
            dateEnd.setFullYear(9999);
            await addFormulaire.execute({ uuid, email, dateStart, dateEnd, });
            expect(formulaireRepository.formulaires).toEqual([{ uuid, email, dateStart, dateEnd }]);
        });
    });

    describe("Formulaire with same uuid already exists", () => {
        it("refuses to add the Formulaire with an explicit warning", async () => {
            formulaireRepository.setFormulaires([
                { uuid: "alreadyExistingUuid", email: "foo@bar.com", dateStart: new Date(), dateEnd: new Date() },
            ]);

            const dateStart = new Date();
            const dateEnd = new Date();
            dateEnd.setFullYear(9999);

            await expectPromiseToFailWith(
                addFormulaire.execute({
                    uuid: "alreadyExistingUuid",
                    email: "bar@baz.com",
                    dateStart: dateStart,
                    dateEnd: dateEnd,
                }),
                "A Formulaire with the same uuid already exists"
            );
        });
    });
});
