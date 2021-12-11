import { Pool } from "pg";
import { TransformFormEstablishmentIntoEstablishmentAggregate } from "../../domain/immersionOffer/useCases/TransformFormEstablishmentIntoEstablishmentAggregate";
import { createLogger } from "../../utils/logger";
import { RealClock } from "../secondary/core/ClockImplementations";
import { ThrottledSequenceRunner } from "../secondary/core/ThrottledSequenceRunner";
import { UuidV4Generator } from "../secondary/core/UuidGeneratorImplementations";
import { HttpsSirenGateway } from "../secondary/HttpsSirenGateway";
import { APIAdresseGateway } from "../secondary/immersionOffer/APIAdresseGateway";
import { PgEstablishmentRepository } from "../secondary/pg/PgEstabishmentRepository";
import { PgRomeGateway } from "../secondary/pg/PgRomeGateway";
import { AppConfig } from "./appConfig";

const logger = createLogger(__filename);

const config = AppConfig.createFromEnv();

const transformPastFormEstablishmentsIntoSearchableData = async (
  originPgConnectionString: string,
  destinationPgConnectionString: string,
) => {
  logger.info(
    { originPgConnectionString, destinationPgConnectionString },
    "starting to convert form establishement to searchable data",
  );

  //We create the use case transformFormEstablishementIntoSearchData
  const poolOrigin = new Pool({ connectionString: originPgConnectionString });
  const clientOrigin = await poolOrigin.connect();

  const poolDestination = new Pool({
    connectionString: destinationPgConnectionString,
  });
  const clientDestination = await poolDestination.connect();
  const establishmentRepository = new PgEstablishmentRepository(
    clientDestination,
  );
  const apiAdresseGateway = new APIAdresseGateway();
  const sequenceRunner = new ThrottledSequenceRunner(100, 3);
  const sireneRepository = new HttpsSirenGateway(
    config.sireneHttpsConfig,
    new RealClock(),
  );
  const poleEmploiGateway = new PgRomeGateway(clientOrigin);

  const transformFormEstablishmentIntoSearchData =
    new TransformFormEstablishmentIntoEstablishmentAggregate(
      establishmentRepository,
      apiAdresseGateway.getGPSFromAddressAPIAdresse,
      sireneRepository,
      poleEmploiGateway,
      sequenceRunner,
      new UuidV4Generator(),
    );
  const AllIdsResult = await clientOrigin.query(
    "SELECT id FROM public.form_establishments",
  );
  for (let pas = 0; pas < AllIdsResult.rows.length; pas++) {
    await transformFormEstablishmentIntoSearchData._execute(
      AllIdsResult.rows[pas],
    );
  }
  clientOrigin.release();
  await poolOrigin.end();
  clientDestination.release();
  await poolDestination.end();
};

transformPastFormEstablishmentsIntoSearchableData(
  config.pgImmersionDbUrl,
  config.pgImmersionDbUrl,
);
