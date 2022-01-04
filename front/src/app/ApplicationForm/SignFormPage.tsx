import { Formik } from "formik";
import React, { useContext, useState } from "react";
import { ApplicationFormFields } from "src/app/ApplicationForm/ApplicationFormFields";
import { SuccessInfos } from "src/app/ApplicationForm/createSuccessInfos";
import { immersionApplicationGateway } from "src/app/dependencies";
import { routes, useRoute } from "src/app/routes";
import { toFormikValidationSchema } from "src/components/form/zodValidate";
import { MarianneHeader } from "src/components/MarianneHeader";
import { decodeJwt } from "src/core-logic/adapters/decodeJwt";
import { ENV } from "src/environmentVariables";
import {
  ImmersionApplicationDto,
  immersionApplicationSchema,
} from "src/shared/ImmersionApplicationDto";
import { Role } from "src/shared/tokens/MagicLinkPayload";
import { Route } from "type-route";
import {
  JwtImmersionApplicationContext,
  JwtImmersionApplicationProvider,
} from "../admin/JwtImmersionApplicationContext";

type SignFormRoute = Route<typeof routes.immersionApplicationsToSign>;

interface SignFormPageProps {
  route: SignFormRoute;
}

const { featureFlags, dev } = ENV;

const extractRoleAndName = (
  jwt: string,
  application: ImmersionApplicationDto,
): [Role, string] => {
  const payload = decodeJwt(jwt);
  const role = payload.role;
  const name =
    role === "beneficiary"
      ? `${application.lastName.toUpperCase()} ${application.firstName}`
      : `${application.mentor}`;
  return [role, name];
};

export const SignFormPage = ({ route }: SignFormPageProps) => {
  if (!route.params.jwt) return <p>Lien non valide</p>;

  return (
    <>
      <MarianneHeader />
      <JwtImmersionApplicationProvider jwt={route.params.jwt}>
        <SignForm jwt={route.params.jwt} />
      </JwtImmersionApplicationProvider>
    </>
  );
};

type SignFormProps = {
  jwt: string;
};

export const SignForm = ({ jwt }: SignFormProps) => {
  const route = useRoute();
  const data = useContext(JwtImmersionApplicationContext);
  if (!featureFlags.enableEnterpriseSignature) {
    return <div>Feature not implemented</div>;
  }

  const [initialValues, setInitialValues] =
    useState<Partial<ImmersionApplicationDto> | null>(null);
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [successInfos, setSuccessInfos] = useState<SuccessInfos | null>(null);
  const [signeeName, setSigneeName] = useState<string | undefined>();
  const [signeeRole, setSigneeRole] = useState<Role | undefined>();
  const [alreadySigned, setAlreadySigned] = useState(false);

  if (!jwt) {
    return <p>Lien non valide</p>;
  }

  if (!data) {
    return <p>Chargement en cours</p>;
  }

  const [role, name] = extractRoleAndName(jwt, data);
  setSigneeName(name);
  setSigneeRole(role);
  // Uncheck the checkbox.
  if (role === "beneficiary") {
    setAlreadySigned(data.beneficiaryAccepted);
  } else if (role === "establishment") {
    setAlreadySigned(data.enterpriseAccepted);
  }
  setInitialValues(data);

  return (
    <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
      <div className="fr-col-lg-8 fr-p-2w">
        <h2>
          Formulaire pour conventionner une période de mise en situation
          professionnelle (PMSMP)
        </h2>

        <div className="fr-text">
          Voici la demande de convention que vous venez de compléter. <br />
          Relisez la bien et si cela vous convient, signez la avec le bouton "je
          signe cette demande" <br />
          <p className="fr-text--xs">
            Ce formulaire vaut équivalence de la signature du CERFA 13912 * 03
          </p>
        </div>

        {initialValues && (
          <>
            <Formik
              enableReinitialize={true}
              initialValues={initialValues}
              validationSchema={toFormikValidationSchema(
                immersionApplicationSchema,
              )}
              onSubmit={async (values, { setSubmitting, setErrors }) => {
                try {
                  // Confirm checkbox
                  const conditionsAccepted =
                    signeeRole === "beneficiary"
                      ? values.beneficiaryAccepted
                      : values.enterpriseAccepted;
                  if (!conditionsAccepted) {
                    setErrors({
                      beneficiaryAccepted:
                        signeeRole === "beneficiary"
                          ? "Engagement est obligatoire"
                          : undefined,
                      enterpriseAccepted:
                        signeeRole === "establishment"
                          ? "Engagement est obligatoire"
                          : undefined,
                    });
                    setSubmitting(false);
                    return;
                  }

                  await immersionApplicationGateway.signApplication(jwt);

                  setSuccessInfos({
                    message: "Votre accord a été enregistré.",
                    link: undefined,
                  });
                  setSubmitError(null);
                  setAlreadySigned(true);
                } catch (e: any) {
                  console.log(e);
                  setSubmitError(e);
                  setSuccessInfos(null);
                }
                setSubmitting(false);
              }}
            >
              {(props) => (
                <div>
                  <form
                    onReset={props.handleReset}
                    onSubmit={props.handleSubmit}
                  >
                    <ApplicationFormFields
                      isFrozen={true}
                      submitError={submitError}
                      successInfos={successInfos}
                      isSignOnly={true}
                      isSignatureEnterprise={signeeRole === "establishment"}
                      signeeName={signeeName}
                      alreadySubmitted={alreadySigned}
                      onRejectForm={async () => {
                        const justification =
                          prompt(
                            "Precisez la raison et la modification nécessaire",
                          ) ?? undefined;
                        try {
                          await immersionApplicationGateway.updateStatus(
                            { status: "DRAFT", justification },
                            jwt,
                          );
                          setSuccessInfos({
                            message:
                              "Vous avez renvoyé la demande pour modification. ",
                            link: undefined,
                          });
                          setSubmitError(null);
                        } catch (e: any) {
                          console.log(e);
                          setSubmitError(e);
                          setSuccessInfos(null);
                        }
                      }}
                    />
                  </form>
                </div>
              )}
            </Formik>
          </>
        )}
        {!initialValues && <p>Loading</p>}
      </div>
    </div>
  );
};
