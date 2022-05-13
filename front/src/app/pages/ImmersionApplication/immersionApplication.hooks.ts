// ceci est un autre fichier
import { useDispatch } from "react-redux";
import { ImmersionApplicationDto } from "shared/src/ImmersionApplication/ImmersionApplication.dto";
import { immersionApplicationSchema } from "shared/src/ImmersionApplication/immersionApplication.schema";
import { immersionApplicationGateway } from "src/app/config/dependencies";
import { ImmersionApplicationPresentation } from "src/app/pages/ImmersionApplication/ImmersionApplicationPage";
import { immersionApplicationSlice } from "src/core-logic/domain/immersionApplication/immersionApplication.slice";
import { searchSlice } from "src/core-logic/domain/search/search.slice";

export interface SearchInput {
  rome?: string;
  nafDivision?: string;
  lat: number;
  lon: number;
  radiusKm: number;
}

/*export const useSearchUseCase = () => {
  const dispatch = useDispatch();

  return (values: SearchInput) => {
    dispatch(
      searchSlice.actions.searchRequested({
        rome: values.rome || undefined,
        location: {
          lat: values.lat,
          lon: values.lon,
        },
        distance_km: values.radiusKm,
      }),
    );
  };
};*/

export const useMakeAddImmersionApplicationUseCase = () => {
  const dispatch = useDispatch();

  return (values: ImmersionApplicationPresentation) => {
    dispatch(
      immersionApplicationSlice.actions.addImmersionApplicationRequested(
        immersionApplicationSchema.parse(values),
      ),
    );
  };
};
