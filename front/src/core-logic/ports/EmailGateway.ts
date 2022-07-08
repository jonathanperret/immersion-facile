import { EmailSentDto } from "shared/email";
import { AdminToken } from "shared/src/admin/admin.dto";

export interface EmailGateway {
  getLatest(adminToken: AdminToken): Promise<EmailSentDto[]>;
}
