import { createLogger } from "../../../utils/logger";
import { AppConfig } from "../config/appConfig";
import { createApp } from "../server";

const logger = createLogger(__filename);

const port = process.env.PORT;

const appConfig = AppConfig.createFromEnv();

createApp(appConfig).then(
  ({ app }) => {
    app.listen(port, "0.0.0.0", () => {
      logger.info(`server started at http://localhost:${port}`);
    });
  },
  (error: any) => {
    logger.error(error, `Server start failed`);
    process.exit(1);
  },
);
