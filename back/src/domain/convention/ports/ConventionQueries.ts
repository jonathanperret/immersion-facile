import {
  ConventionId,
  ConventionAdminReadDto,
  ListConventionsRequestDto,
} from "shared/src/convention/convention.dto";
import { ImmersionAssessmentEmailParams } from "../../immersionOffer/useCases/SendEmailsWithAssessmentCreationLink";
import { ConventionRawBeforeExport } from "../useCases/ExportConventionsReport";

export interface ConventionQueries {
  getAllConventionsForExport: () => Promise<ConventionRawBeforeExport[]>;
  getLatestConventionAdminDtos: (
    requestDto: ListConventionsRequestDto,
  ) => Promise<ConventionAdminReadDto[]>;
  getConventionAdminReadDtoById: (
    id: ConventionId,
  ) => Promise<ConventionAdminReadDto | undefined>;
  getAllImmersionAssessmentEmailParamsForThoseEndingThatDidntReceivedAssessmentLink: (
    dateEnd: Date,
  ) => Promise<ImmersionAssessmentEmailParams[]>;
}
