import { InMemoryEmailGateway } from "../../../adapters/secondary/InMemoryEmailGateway";
import { NotifConfirmationEstablishmentCreatedToEstablishment } from "../../../domain/immersionOffer/useCases/notifications/NotifConfirmationEstablishmentCreatedToEstablishment";
import { FormEstablishmentDtoBuilder } from "../../../_testBuilders/FormEstablishmentDtoBuilder";

describe("NotifyConfirmationEstablismentCreatedToEstablisment", () => {
  const validEstablishment = FormEstablishmentDtoBuilder.valid();
  let emailGw: InMemoryEmailGateway;

  beforeEach(() => {
    emailGw = new InMemoryEmailGateway();
  });

  const createUseCase = () => {
    return new NotifConfirmationEstablishmentCreatedToEstablishment(
      validEstablishment,
      emailGw,
    );
  };

  describe("When establishment is valid", () => {
    test("Nominal case: Sends notification email to Establisment contact", async () => {
      const establishmentContactEmail = ["establishmentContact@@unmail.com"];
      await createUseCase().execute(validEstablishment);

      const sentEmails = emailGw.getSentEmails();
      expect(sentEmails).toHaveLength(1);

      expectedEmailImmersionApplicationReviewMatchingImmersionApplication(
        sentEmails[0],
        validEstablishment,
      );
    });
  });
});
