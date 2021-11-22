import { AllowListEmailFilter } from "../../../adapters/secondary/core/EmailFilterImplementations";
import { InMemoryEmailGateway } from "../../../adapters/secondary/InMemoryEmailGateway";
import { NotifConfirmationEstablishmentCreated } from "../../../domain/immersionOffer/useCases/notifications/NotifConfirmationEstablishmentCreated";
import {
  expectedEmailEstablisentCreatedReviewMatchingEstablisment,
  expectedEmailImmersionApplicationReviewMatchingImmersionApplication,
} from "../../../_testBuilders/emailAssertions";
import { FormEstablishmentDtoBuilder } from "../../../_testBuilders/FormEstablishmentDtoBuilder";

describe("NotifyConfirmationEstablismentCreated", () => {
  // Wire a mail sending hook to the MailSentToEstablishment event
  // checks that an outbox event has been sent ?
  // Checks that a mail has been sent
  // Check the mail format (we get the expected fields with expected values in it)

  // Add the test emails as allowedemails

  const validEstablishment = FormEstablishmentDtoBuilder.valid().build();
  let emailGw: InMemoryEmailGateway;
  const emailFilter = new AllowListEmailFilter([
    validEstablishment.businessContacts[0].email,
  ]);

  beforeEach(() => {
    emailGw = new InMemoryEmailGateway();
  });

  const createUseCase = () => {
    return new NotifConfirmationEstablishmentCreated(emailFilter, emailGw);
  };

  describe("When establishment is valid", () => {
    test("Nominal case: Sends notification email to Establisment contact", async () => {
      await createUseCase().execute(validEstablishment);

      const sentEmails = emailGw.getSentEmails();
      expect(sentEmails).toHaveLength(1);

      expectedEmailEstablisentCreatedReviewMatchingEstablisment(
        sentEmails[0],
        validEstablishment,
      );
    });
  });

  describe("When establishment is undefined", () => {
    test(" Don't Send notification email to Establisment contact", async () => {
      await createUseCase().execute(undefined);

      const sentEmails = emailGw.getSentEmails();
      expect(sentEmails).toHaveLength(0);
    });
  });
});
