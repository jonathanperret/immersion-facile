import { MagicLinkPayload } from "../../../shared/tokens/MagicLinkPayload";
import { GenerateJwtFn } from "./../../../domain/auth/jwt";
import { GenerateMagicLink } from "./../../../domain/immersionApplication/useCases/GenerateMagicLink";
import {
  createMagicLinkPayload,
  Role,
} from "../../../shared/tokens/MagicLinkPayload";

describe("Generate magic links", () => {
  let generateMagicLink: GenerateMagicLink;
  const generateJwtFn: GenerateJwtFn = (payload: MagicLinkPayload) => {
    return payload.applicationId + "; " + payload.roles.join(",");
  };

  const createGenerateMagicLink = () => {
    return new GenerateMagicLink(generateJwtFn);
  };

  describe("Magic link generator use case", () => {
    beforeEach(() => {
      generateMagicLink = createGenerateMagicLink();
    });

    test("Generates magic links with its fn", async () => {
      const id = "123";
      const role = "validator" as Role;

      const result = await generateMagicLink.execute({
        applicationId: id,
        role,
      });
      expect(result).toEqual({
        jwt: generateJwtFn(createMagicLinkPayload(id, role)),
      });
    });
  });
});
