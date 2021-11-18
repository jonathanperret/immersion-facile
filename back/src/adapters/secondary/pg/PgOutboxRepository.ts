import { Pool } from "pg";
import { DomainEvent } from "../../../domain/core/eventBus/events";
import { OutboxRepository } from "../../../domain/core/ports/OutboxRepository";
import { withPgPoolClient } from "./../../../utils/pg";

export class PgOutboxRepository implements OutboxRepository {
  constructor(private readonly pgPool: Pool) {}

  async getAllUnpublishedEvents(): Promise<DomainEvent[]> {
    return withPgPoolClient(this.pgPool, (client) =>
      client
        .query(
          `SELECT id, TO_CHAR(occurred_at, 'YYYY-MM-DD"T"HH:MI:SS.MS"Z"') as "occurredAt", was_published as "wasPublished", topic, payload
            FROM outbox
            WHERE was_published = false
            ORDER BY occurred_at ASC`,
        )
        .then(({ rows }) => rows),
    );
  }

  async save(event: DomainEvent): Promise<void> {
    const { id, occurredAt, wasPublished, topic, payload } = event;
    const query = `INSERT INTO outbox(
        id, occurred_at, was_published, topic, payload
      ) VALUES($1, $2, $3, $4, $5)`;

    // prettier-ignore
    await withPgPoolClient(this.pgPool, (client) =>
      client.query(query, [id, occurredAt, wasPublished, topic, payload]),
    );
  }

  async markEventsAsPublished(events: DomainEvent[]): Promise<void> {
    const idsToMarkAsPublished = events.map(({ id }) => id);

    await withPgPoolClient(this.pgPool, (client) =>
      client.query(
        "UPDATE outbox SET was_published = true WHERE id = ANY($1::uuid[])",
        [idsToMarkAsPublished],
      ),
    );
  }
}
