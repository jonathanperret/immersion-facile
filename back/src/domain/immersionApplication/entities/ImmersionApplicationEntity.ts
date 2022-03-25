import { ImmersionApplicationDto } from "../../../shared/ImmersionApplication/ImmersionApplication.dto";

export class ImmersionApplicationEntity {
  private constructor(public readonly properties: ImmersionApplicationDto) {}

  public static create(dto: ImmersionApplicationDto) {
    return new ImmersionApplicationEntity(dto);
  }

  public toDto() {
    return this.properties;
  }

  public get id() {
    return this.properties.id;
  }

  public get agencyId() {
    return this.properties.agencyId;
  }

  public get status() {
    return this.properties.status;
  }
}
