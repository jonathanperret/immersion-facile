import { FormikHelpers } from "formik";
import { immersionApplicationGateway } from "src/app/config/dependencies";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { ImmersionApplicationDto } from "src/shared/ImmersionApplication/ImmersionApplication.dto";

export const addApplicationFormUseCase = async (
  values: ImmersionApplicationPresentation,
  helpers: FormikHelpers<ImmersionApplicationPresentation>,
): Promise<void> => {
  try {
    const immersionApplication: ImmersionApplicationDto = {};
    await immersionApplicationGateway.add(immersionApplication);
    //setSubmitFeedback("justSubmitted");
  } catch (e: any) {
    console.log(e);

    //setSubmitFeedback(e);
  }

  formikHelpers.setSubmitting(false);
};
