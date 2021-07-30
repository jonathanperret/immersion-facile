import { FormulaireEntity } from "./FormulaireEntity";

describe("FormulaireEntity", () => {
  const UUID = "uuid";
  const EMAIL = "valid@email.fr";
  const DATE_START = new Date(1000);
  const DATE_END = new Date(1001);

  describe("Valid parameters", () => {
    test("constructor creates a FormulaireEntity", () => {
      const entity = FormulaireEntity.create({
        uuid: UUID,
        email: EMAIL,
        dateStart: DATE_START,
        dateEnd: DATE_END,
      });
      expect(entity.uuid).toEqual(UUID);
      expect(entity.email).toEqual(EMAIL);
      expect(entity.dateStart).toEqual(DATE_START);
      expect(entity.dateEnd).toEqual(DATE_END);
    });
  });

  describe("Email doesn't match RFC 5322", () => {
    test("constructor throws error", () => {
      const invalidRequest = {
        uuid: UUID,
        email: "not_a_valid_email",
        dateStart: DATE_START,
        dateEnd: DATE_END,
      };
      expect(() => FormulaireEntity.create(invalidRequest)).toThrowError(
        "Email (not_a_valid_email) must match the RFC standard."
      );
    });
  });

  // TODO(nico): write more tests.
});
