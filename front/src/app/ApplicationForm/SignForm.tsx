import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { ApplicationFormFields } from "src/app/ApplicationForm/ApplicationFormFields";
import {
  createSuccessInfos,
  SuccessInfos,
} from "src/app/ApplicationForm/createSuccessInfos";
import { immersionApplicationGateway } from "src/app/dependencies";
import { routes } from "src/app/routes";
import { toFormikValidationSchema } from "src/components/form/zodValidate";
import { MarianneHeader } from "src/components/MarianneHeader";
import { ENV } from "src/environmentVariables";
import {
  ImmersionApplicationDto,
  immersionApplicationSchema,
} from "src/shared/ImmersionApplicationDto";
import { Route } from "type-route";

type SignFormRoute = Route<typeof routes.immersionApplicationsToSign>;

interface SignFormProps {
  route: SignFormRoute;
}

const { featureFlags, dev } = ENV;


export const SignForm = ({ route }: SignFormProps) => {
  if (!featureFlags.enableEnterpriseSignature) {
    return (
      <div>Feature not implemented</div>
    );
  }

  const [initialValues, setInitialValues] = useState<Partial<ImmersionApplicationDto>|null>(null)
  const [submitError, setSubmitError] = useState<Error | null>(null);
  const [successInfos, setSuccessInfos] = useState<SuccessInfos | null>(null);

  useEffect(() => {
    if (!("jwt" in route.params) || route.params.jwt === undefined) {
      return;
    }

    immersionApplicationGateway
      .getML(route.params.jwt)
      .then((response) => { 
        setInitialValues(response);
      })
      .catch((e) => {
        console.log(e);
        setSubmitError(e);
        setSuccessInfos(null);
      });
  }, []);

  return (
    <>
      <MarianneHeader />

      <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters">
        <div className="fr-col-lg-8 fr-p-2w">
          <h2>
            Formulaire pour conventionner une période de mise en situation
            professionnelle (PMSMP)
          </h2>
          <div className="fr-text">
            Voici la convention à étudier. <br />
            Veuillez en prendre connaisence et signer si vous etes d'accord.{" "}
            <br />
            
            <p className="fr-text--xs">
              Ce formulaire vaut équivalence de la signature du CERFA 13912 * 03
            </p>
          </div>

         {initialValues && <><Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={toFormikValidationSchema(
              immersionApplicationSchema,
            )}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await immersionApplicationGateway.signApplication(route.params.jwt);

                setSuccessInfos(createSuccessInfos(undefined));
                setSubmitError(null);
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
                <form onReset={props.handleReset} onSubmit={props.handleSubmit}>
                  <ApplicationFormFields
                    isFrozen={true}
                    submitError={submitError}
                    successInfos={successInfos}
                    isSignOnly={true}
                  />
                </form>
              </div>
            )}
          </Formik>
          <p>Je confirme mon engagement.</p>
          </>}
          {!initialValues && <p>Loading</p>}
        </div>
      </div>
    </>
  );
};
