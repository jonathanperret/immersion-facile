import { notify } from "superagent";
import {
  AgencyConfigs,
  InMemoryAgencyRepository,
} from "../../../adapters/secondary/InMemoryAgencyRepository";
import { InMemoryEmailGateway } from "../../../adapters/secondary/InMemoryEmailGateway";
import { NotifyImmersionApplicationNeedsReview } from "../../../domain/immersionApplication/useCases/notifications/NotifyNewApplicationNeedsReview";
import { AgencyConfigBuilder } from "../../../_testBuilders/AgencyConfigBuilder";
import { expectEmailAdminNotificationMatchingImmersionApplication } from "../../../_testBuilders/emailAssertions";
import { ImmersionApplicationDtoBuilder } from "../../../_testBuilders/ImmersionApplicationDtoBuilder";

const adminEmail = "admin@email.fr";
const validDemandeImmersion = new ImmersionApplicationDtoBuilder().build();

describe("NotifyImmersionApplicationNeedsReview", () => {
  let emailGw: InMemoryEmailGateway;
  let agencyConfigs: AgencyConfigs;

  beforeEach(() => {
    agencyConfigs = {
      [validDemandeImmersion.agencyCode]: AgencyConfigBuilder.empty().build(),
    };
    emailGw = new InMemoryEmailGateway();
  });

  const createUseCase = () => {
    return new NotifyImmersionApplicationNeedsReview(
      emailGw,
      new InMemoryAgencyRepository(agencyConfigs),
      validDemandeImmersion.agencyCode,
    );
  };

  test("Sends no mail when contact Email is not set", async () => {
    await createUseCase().execute(validDemandeImmersion);
    const sentEmails = emailGw.getSentEmails();
    expect(sentEmails).toHaveLength(0);
  });

  test("Sends notification email to an advisor to verify eligibility", async () => {
    agencyConfigs[validDemandeImmersion.agencyCode] =
      AgencyConfigBuilder.empty().withAdminEmails([adminEmail]).build();

    await createUseCase().execute(validDemandeImmersion);

    const sentEmails = emailGw.getSentEmails();
    expect(sentEmails).toHaveLength(1);

    expectEmailAdminNotificationMatchingImmersionApplication(sentEmails[0], {
      recipients: [adminEmail],
      immersionApplication: validDemandeImmersion,
    });
  });
});
