import { EstablishmentGateway } from "./EstablishmentGateway";
import { EstablishmentUiGateway } from "./EstablishmentUiGateway";
import { EventGateway } from "./EventGateway";

export interface ClientGateways {
  establishments: EstablishmentGateway;
  establishmentsUi: EstablishmentUiGateway;
  event: EventGateway;
}

export type ClientTestGateways = ClientGateways;
