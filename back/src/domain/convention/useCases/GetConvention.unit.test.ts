import {
  ConventionDtoBuilder,
  expectPromiseToFailWithError,
  expectToEqual,
} from "shared";

import { createInMemoryUow } from "../../../adapters/primary/config/uowConfig";
import { NotFoundError } from "../../../adapters/primary/helpers/httpErrors";
import {
  TEST_AGENCY_DEPARTMENT,
  TEST_AGENCY_NAME,
} from "../../../adapters/secondary/InMemoryConventionQueries";
import { InMemoryConventionRepository } from "../../../adapters/secondary/InMemoryConventionRepository";
import { InMemoryUowPerformer } from "../../../adapters/secondary/InMemoryUowPerformer";
import { GetConvention } from "./GetConvention";

describe("Get Convention", () => {
  let getConvention: GetConvention;
  let conventionRepository: InMemoryConventionRepository;

  beforeEach(() => {
    const uow = createInMemoryUow();
    conventionRepository = uow.conventionRepository;
    getConvention = new GetConvention(new InMemoryUowPerformer(uow));
  });

  describe("When the Convention does not exist", () => {
    it("throws NotFoundError", async () => {
      await expectPromiseToFailWithError(
        getConvention.execute({ id: "unknown_demande_immersion_id" }),
        new NotFoundError("unknown_demande_immersion_id"),
      );
    });
  });

  describe("When a Convention is stored", () => {
    it("returns the Convention", async () => {
      const entity = new ConventionDtoBuilder().build();
      conventionRepository.setConventions({ [entity.id]: entity });

      const convention = await getConvention.execute({
        id: entity.id,
      });
      expectToEqual(convention, {
        ...entity,
        agencyName: TEST_AGENCY_NAME,
        agencyDepartment: TEST_AGENCY_DEPARTMENT,
      });
    });
  });
});
