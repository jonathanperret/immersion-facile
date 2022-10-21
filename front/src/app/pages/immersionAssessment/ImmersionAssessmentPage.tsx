import { CircularProgress } from "@mui/material";
import { Form, Formik } from "formik";
import { identity } from "ramda";
import React from "react";
import {
  Button,
  Notification,
  Title,
} from "react-design-system/immersionFacile";
import {
  AssessmentStatus,
  assessmentStatuses,
  ConventionDtoBuilder,
  ConventionReadDto,
  ImmersionAssessmentDto,
  immersionAssessmentSchema,
  toDisplayedDate,
} from "shared";
import { RadioGroupForField } from "src/app/components/RadioGroup";
import { HeaderFooterLayout } from "src/app/layouts/HeaderFooterLayout";
import { routes } from "src/app/routing/routes";
import { useAppSelector } from "src/app/utils/reduxHooks";
import {
  immersionAssessmentErrorSelector,
  immersionAssessmentStatusSelector,
} from "src/core-logic/domain/immersionAssessment/immersionAssessment.selectors";
import { TextInput } from "src/uiComponents/form/TextInput";
import { toFormikValidationSchema } from "src/uiComponents/form/zodValidate";
import { Route } from "type-route";

type ImmersionAssessmentRoute = Route<typeof routes.immersionAssessment>;

interface ImmersionAssessmentProps {
  route: ImmersionAssessmentRoute;
}

export const ImmersionAssessmentPage = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  route,
}: ImmersionAssessmentProps) => {
  // const { convention, fetchConventionError, isLoading } = useConvention(
  //   route.params.jwt,
  // );
  const convention: ConventionReadDto = {
    ...new ConventionDtoBuilder().withStatus("ACCEPTED_BY_VALIDATOR").build(),
    agencyName: "dkjdsflkj",
  };
  const isLoading = false;
  const fetchConventionError = null;
  // const { role } = decodeJwt<ConventionMagicLinkPayload>(route.params.jwt);
  //const { createAssessment } = useImmersionAssessment(route.params.jwt);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const createAssessment = () => {};
  const assessmentError = useAppSelector(immersionAssessmentErrorSelector);
  const assessmentStatus = useAppSelector(immersionAssessmentStatusSelector);
  const role = "establishment";
  if (role !== "establishment" && role !== "establishment-representative") {
    return (
      <div className="pt-4 flex items-center justify-center">
        <p className="text-2xl">
          Vous n'êtes pas autorisé a accéder à cette page
        </p>
      </div>
    );
  }

  const canCreateAssessment = convention?.status === "ACCEPTED_BY_VALIDATOR";

  return (
    <HeaderFooterLayout>
      <Title>
        Bilan de l'immersion{" "}
        {convention
          ? `de ${convention.signatories.beneficiary.firstName} ${convention.signatories.beneficiary.lastName}`
          : ""}
      </Title>
      {isLoading && <CircularProgress />}
      {fetchConventionError && <div>{fetchConventionError}</div>}
      {convention && !canCreateAssessment && (
        <Notification
          type="error"
          title="Votre convention n'est pas prête à recevoir un bilan"
        >
          Seule une convention entièrement validée peut recevoir un bilan
        </Notification>
      )}
      {canCreateAssessment && (
        <div className="px-2 md:pl-20">
          <ImmersionDescription convention={convention} />
          <Formik
            initialValues={identity<ImmersionAssessmentDto>({
              conventionId: convention.id,
              status: null as unknown as AssessmentStatus,
              establishmentFeedback: "",
            })}
            validationSchema={toFormikValidationSchema(
              immersionAssessmentSchema,
            )}
            onSubmit={createAssessment}
          >
            {() => (
              <Form>
                <div className="flex flex-col">
                  <RadioGroupForField
                    label=""
                    name={getName("status")}
                    options={assessmentStatuses.map((value) => ({
                      value,
                      label: labels[value],
                    }))}
                  />
                  <div
                    style={{
                      minWidth: "20rem",
                      maxWidth: "34rem",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <TextInput
                      multiline={true}
                      label="Comment s'est passée l'immersion ?"
                      name={getName("establishmentFeedback")}
                    />
                  </div>
                  <Button
                    className="w-28"
                    type="submit"
                    disable={
                      assessmentStatus !== "Idle" || assessmentError !== null
                    }
                  >
                    Envoyer
                  </Button>
                  {assessmentError && (
                    <Notification type="error" title="Erreur">
                      {assessmentError}
                    </Notification>
                  )}
                  {assessmentStatus === "Success" && (
                    <Notification type="success" title={"Bilan envoyé"}>
                      Le bilan a bien été envoyé au conseiller
                    </Notification>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
      {
        //assessmentStatus !== "Idle" ||
        //assessmentError !== null &&
        <div className="px-2 pt-1 md:pl-20">
          <Button
            className=""
            type="button"
            onSubmit={() => {
              window.open(
                "https://immersion.cellar-c2.services.clever-cloud.com/bilan-immersion-professionnelle-inscriptible.pdf",
                "_blank",
              );
            }}
          >
            Télécharger le bilan détaillé en PDF
          </Button>
        </div>
      }
    </HeaderFooterLayout>
  );
};

const ImmersionDescription = ({
  convention,
}: {
  convention: ConventionReadDto;
}) => (
  <p>
    L'immersion de{" "}
    <Bold>
      {convention.signatories.beneficiary.firstName}{" "}
      {convention.signatories.beneficiary.lastName}
    </Bold>{" "}
    auprès de l'établissement <Bold>{convention.businessName}</Bold> qui a eu
    lieu du <Bold>{toDisplayedDate(new Date(convention.dateStart))} </Bold>au{" "}
    <Bold>{toDisplayedDate(new Date(convention.dateEnd))}</Bold> touche à sa
    fin.
  </p>
);

const Bold: React.FC = ({ children }) => (
  <span className="font-bold">{children}</span>
);

const getName = (name: keyof ImmersionAssessmentDto) => name;
const labels: Record<AssessmentStatus, string> = {
  FINISHED: "Le bénéficiaire a suivi son immersion jusqu'à la fin",
  ABANDONED: "Le bénéficiaire a abandonné l'immersion",
};
