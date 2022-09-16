import { AgencyId } from "../agency/agency.dto";
import { DateIntervalDto, ScheduleDto } from "../schedule/Schedule.dto";
import { Builder } from "../Builder";
import {
  ConventionStatus,
  ConventionDto,
  ConventionId,
  ConventionExternalId,
  ImmersionObjective,
  Beneficiary,
  Mentor,
  LegalRepresentative,
} from "./convention.dto";
import { AppellationDto } from "../romeAndAppellationDtos/romeAndAppellation.dto";
import { FederatedIdentity } from "../federatedIdentities/federatedIdentity.dto";
import { reasonableSchedule } from "../schedule/ScheduleUtils";

export const DEMANDE_IMMERSION_ID = "40400404-9c0b-bbbb-bb6d-6bb9bd38bbbb";
export const CONVENTION_EXTERNAL_ID = "00000000001";
export const VALID_EMAILS = [
  "beneficiary@email.fr",
  "establishment@example.com",
];
export const DATE_SUBMISSION = new Date("2021-01-04").toISOString();
export const DATE_START = new Date("2021-01-06").toISOString();
export const DATE_END = new Date("2021-01-15").toISOString();
export const DATE_SIGNATURE = new Date("2021-01-04").toISOString();

export const VALID_PHONES = [
  "+33012345678",
  "0601010101",
  "+18001231234",
  "+41800001853",
];

const beneficiary: Beneficiary = {
  role: "beneficiary",
  email: VALID_EMAILS[0],
  phone: VALID_PHONES[0],
  firstName: "Esteban",
  lastName: "Ocon",
  signedAt: DATE_SIGNATURE,
  emergencyContact: "Clariss Ocon",
  emergencyContactPhone: "0663567896",
};

const mentor: Mentor = {
  role: "establishment",
  email: VALID_EMAILS[1],
  phone: VALID_PHONES[1],
  firstName: "Alain",
  lastName: "Prost",
  signedAt: DATE_SIGNATURE,
  job: "Big Boss",
};

const validConvention: ConventionDto = {
  id: DEMANDE_IMMERSION_ID,
  externalId: CONVENTION_EXTERNAL_ID,
  status: "DRAFT",
  postalCode: "75001",
  agencyId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  immersionAddress: "169 boulevard de la villette, 75010 Paris",
  dateSubmission: DATE_SUBMISSION,
  dateStart: DATE_START,
  dateEnd: DATE_END,
  businessName: "Beta.gouv.fr",
  siret: "12345678901234",
  schedule: reasonableSchedule({
    start: new Date(DATE_START),
    end: new Date(DATE_END),
  }),
  individualProtection: true,
  sanitaryPrevention: true,
  sanitaryPreventionDescription: "fourniture de gel",
  immersionObjective: "Confirmer un projet professionnel",
  immersionAppellation: {
    romeCode: "A1101",
    romeLabel: "Conduite d'engins agricoles et forestiers",
    appellationCode: "17751",
    appellationLabel: "Pilote de machines d'abattage",
  },
  immersionActivities: "Piloter un automobile",
  immersionSkills: "Utilisation des pneus optimale, gestion de carburant",
  internshipKind: "immersion",
  signatories: { beneficiary, mentor },
};

export class ConventionDtoBuilder implements Builder<ConventionDto> {
  constructor(private dto: ConventionDto = validConvention) {}

  public withBusinessName(businessName: string): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, businessName });
  }

  public withBeneficiary(beneficiary: Beneficiary): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      signatories: { beneficiary, mentor: this.mentor },
    });
  }

  public withLegalRepresentative(
    legalRepresentative: LegalRepresentative,
  ): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      signatories: {
        beneficiary: this.beneficiary,
        mentor: this.mentor,
        legalRepresentative,
      },
    });
  }

  public withBeneficiaryEmail(email: string): ConventionDtoBuilder {
    return this.withBeneficiary({ ...this.beneficiary, email });
  }

  public withBeneficiaryFirstName(firstName: string): ConventionDtoBuilder {
    return this.withBeneficiary({
      ...this.beneficiary,
      firstName,
    });
  }

  public withBeneficiaryLastName(lastName: string): ConventionDtoBuilder {
    return this.withBeneficiary({
      ...this.beneficiary,
      lastName,
    });
  }

  public withBeneficiaryPhone(phone: string): ConventionDtoBuilder {
    return this.withBeneficiary({ ...this.beneficiary, phone });
  }

  public withMentor(mentor: Mentor): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      signatories: { ...this.dto.signatories, mentor },
    });
  }

  public withMentorFirstName(firstName: string): ConventionDtoBuilder {
    return this.withMentor({ ...this.mentor, firstName });
  }

  public withMentorLastName(lastName: string): ConventionDtoBuilder {
    return this.withMentor({ ...this.mentor, lastName });
  }

  public withMentorPhone(phone: string): ConventionDtoBuilder {
    return this.withMentor({ ...this.mentor, phone });
  }

  public withMentorEmail(email: string): ConventionDtoBuilder {
    return this.withMentor({ ...this.mentor, email });
  }

  public withDateSubmission(dateSubmission: string): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, dateSubmission });
  }

  public withDateStart(dateStart: string): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, dateStart });
  }

  public withDateEnd(dateEnd: string): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, dateEnd });
  }

  public withDateValidation(dateValidation: string): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, dateValidation });
  }
  public withoutDateValidation(): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, dateValidation: undefined });
  }

  public withId(id: ConventionId): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, id });
  }
  public withExternalId(
    externalId: ConventionExternalId,
  ): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, externalId });
  }
  public withAgencyId(agencyId: AgencyId): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, agencyId });
  }

  public withStatus(status: ConventionStatus): ConventionDtoBuilder {
    return new ConventionDtoBuilder({ ...this.dto, status });
  }
  public validated(): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      status: "ACCEPTED_BY_VALIDATOR",
    });
  }

  public withImmersionAddress(immersionAddress: string): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      immersionAddress,
    });
  }

  public withSanitaryPrevention(
    sanitaryPrevention: boolean,
  ): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      sanitaryPrevention,
    });
  }

  public withSanitaryPreventionDescription(
    sanitaryPreventionDescription: string,
  ): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      sanitaryPreventionDescription,
    });
  }

  public withIndividualProtection(
    individualProtection: boolean,
  ): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      individualProtection,
    });
  }

  public withSchedule(
    scheduleMaker: (interval: DateIntervalDto) => ScheduleDto,
  ) {
    return new ConventionDtoBuilder({
      ...this.dto,
      schedule: scheduleMaker({
        start: new Date(this.dto.dateStart),
        end: new Date(this.dto.dateEnd),
      }),
    });
  }

  public withRejectionJustification(rejectionJustification: string) {
    return new ConventionDtoBuilder({
      ...this.dto,
      rejectionJustification,
    });
  }

  public withoutWorkCondition(): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      workConditions: undefined,
    });
  }

  public withImmersionAppelation(
    immersionAppellation: AppellationDto,
  ): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      immersionAppellation,
    });
  }

  withFederatedIdentity(
    federatedIdentity: FederatedIdentity,
  ): ConventionDtoBuilder {
    return this.withBeneficiary({
      ...this.beneficiary,
      federatedIdentity,
    });
  }
  withoutFederatedIdentity(): ConventionDtoBuilder {
    return this.withBeneficiary({
      ...this.beneficiary,
      federatedIdentity: undefined,
    });
  }
  public notSigned() {
    return new ConventionDtoBuilder({
      ...this.dto,
      signatories: {
        beneficiary: { ...this.beneficiary, signedAt: undefined },
        mentor: { ...this.mentor, signedAt: undefined },
        legalRepresentative: this.legalRepresentative && {
          ...this.legalRepresentative,
          signedAt: undefined,
        },
      },
    });
  }

  public signedByBeneficiary(signedAt: string) {
    return new ConventionDtoBuilder({
      ...this.dto,
      signatories: {
        ...this.dto.signatories,
        beneficiary: { ...this.beneficiary, signedAt },
      },
    });
  }

  public signedByEnterprise(signedAt: string) {
    return new ConventionDtoBuilder({
      ...this.dto,
      signatories: {
        ...this.dto.signatories,
        mentor: { ...this.mentor, signedAt },
      },
    });
  }

  public withImmersionObjective(
    immersionObjective: ImmersionObjective,
  ): ConventionDtoBuilder {
    return new ConventionDtoBuilder({
      ...this.dto,
      immersionObjective,
    });
  }

  private get mentor(): Mentor {
    return this.dto.signatories.mentor;
  }

  private get beneficiary(): Beneficiary {
    return this.dto.signatories.beneficiary;
  }

  private get legalRepresentative(): LegalRepresentative | undefined {
    return this.dto.signatories.legalRepresentative;
  }

  public build() {
    return this.dto;
  }
}
