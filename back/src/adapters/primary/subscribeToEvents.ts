import { z } from "zod";
import { NarrowEvent } from "../../domain/core/eventBus/EventBus";
import { DomainTopic } from "../../domain/core/eventBus/events";
import { keys } from "../../shared/utils";
import { AppDependencies, UseCases } from "./config";

type DomainUseCase = UseCases[keyof UseCases];

type ExtractUseCasesMatchingTopic<Topic extends DomainTopic> = Extract<
  DomainUseCase,
  { inputSchema: z.ZodSchema<NarrowEvent<Topic>["payload"]> }
>;

type UseCaseSubscriptionsByTopics = {
  [K in DomainTopic]: ExtractUseCasesMatchingTopic<K>[];
};

const getUseCasesByTopics = (
  useCases: UseCases,
): UseCaseSubscriptionsByTopics => ({
  // Immersion Application happy path

  // <<<---- triggered when signature feature flag is ACTIVE
  DraftImmersionApplicationSubmitted: [
    useCases.confirmToBeneficiaryThatApplicationCorrectlySubmittedRequestSignature,
    useCases.confirmToMentorThatApplicationCorrectlySubmittedRequestSignature,
  ],
  ImmersionApplicationPartiallySigned: [
    useCases.notifyBeneficiaryOrEnterpriseThatApplicationWasSignedByOtherParty,
  ],
  // when signature feature flag is ACTIVE ---->>>

  // following event should be renamed: ImmersionApplicationFullySigned
  ImmersionApplicationSubmittedByBeneficiary: [
    // <<<---- trigger when signature feature flag is NOT active
    useCases.confirmToBeneficiaryThatApplicationCorrectlySubmitted,
    useCases.confirmToMentorThatApplicationCorrectlySubmitted,
    // when signature feature flag is NOT active ---->>>

    useCases.notifyToTeamApplicationSubmittedByBeneficiary,
    useCases.notifyNewApplicationNeedsReview,
  ],

  ImmersionApplicationAcceptedByCounsellor: [
    useCases.notifyNewApplicationNeedsReview,
  ],
  ImmersionApplicationAcceptedByValidator: [
    useCases.notifyNewApplicationNeedsReview,
  ],
  FinalImmersionApplicationValidationByAdmin: [
    useCases.notifyAllActorsOfFinalApplicationValidation,
  ],

  // rejected and modification paths
  ImmersionApplicationRejected: [
    useCases.notifyBeneficiaryAndEnterpriseThatApplicationIsRejected,
  ],
  ImmersionApplicationRequiresModification: [
    useCases.notifyBeneficiaryAndEnterpriseThatApplicationNeedsModifications,
  ],

  // magic link renewal
  MagicLinkRenewalRequested: [useCases.deliverRenewedMagicLink],

  // establishments
  FormEstablishmentAdded: [
    useCases.transformFormEstablishmentToSearchData,
    useCases.notifyConfirmationEstablishmentCreated,
  ],

  // search page
  EmailContactRequestedByBeneficiary: [
    useCases.notifyEstablishmentOfContactRequest,
  ],
});

export const subscribeToEvents = (deps: AppDependencies) => {
  const useCasesByTopic = getUseCasesByTopics(deps.useCases);
  keys(useCasesByTopic).forEach((topic) => {
    const useCases = useCasesByTopic[topic];

    useCases.forEach((useCase) =>
      deps.eventBus.subscribe(topic, (event) =>
        useCase.execute(event.payload as any),
      ),
    );
  });
};
