import { ImmersionApplicationDtoBuilder } from "../../../_testBuilders/ImmersionApplicationDtoBuilder";
import { InMemoryEmailGateway } from "../../../adapters/secondary/InMemoryEmailGateway";
import { NotifyToTeamApplicationSubmittedByBeneficiary } from "../../../domain/immersionApplication/useCases/notifications/NotifyToTeamApplicationSubmittedByBeneficiary";

describe("NotifyImmersionApplicationNeedsReview", () => {
  let emailGw: InMemoryEmailGateway;
  const validDemandeImmersion = new ImmersionApplicationDtoBuilder().build();

  beforeEach(() => {
    emailGw = new InMemoryEmailGateway();
  });

  test("Sends no mail when contact Email is not set", async () => {
    const notifyToTeam = new NotifyToTeamApplicationSubmittedByBeneficiary(
      emailGw,
      undefined,
    );
    await notifyToTeam.execute(validDemandeImmersion);
    const sentEmails = emailGw.getSentEmails();
    expect(sentEmails).toHaveLength(0);
  });

  test("Sends notification for review to an advisor who can either make it eligible, validate or cancel it", async () => {});
});
