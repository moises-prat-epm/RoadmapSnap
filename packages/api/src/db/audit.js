/**
 * Application-level audit events (in addition to DB triggers for row-level changes).
 * Use for events that don't map to a single table row (e.g. "user logged in", "export generated").
 */

/**
 * Insert an audit event row and return the new id.
 * @param {import('pg').PoolClient} client - DB client (transaction or connection)
 * @param {Object} opts
 * @param {string} opts.orgId - Organization UUID
 * @param {string|null} opts.userId - User UUID (optional)
 * @param {string} opts.action - e.g. 'user_logged_in', 'export_generated'
 * @param {string} opts.entityType - e.g. 'user', 'export', 'session'
 * @param {string|null} opts.entityId - Optional entity UUID
 * @param {object|null} opts.payloadBefore - Optional JSON snapshot before
 * @param {object|null} opts.payloadAfter - Optional JSON snapshot after
 * @param {object} [opts.metadata={}] - Additional JSON metadata
 * @returns {Promise<string>} The created audit_events.id (UUID)
 */
export async function emitAuditEvent(client, {
  orgId,
  userId,
  action,
  entityType,
  entityId,
  payloadBefore,
  payloadAfter,
  metadata = {},
}) {
  const res = await client.query(
    `INSERT INTO audit_events (
      org_id, user_id, action, entity_type, entity_id,
      payload_before, payload_after, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id`,
    [
      orgId,
      userId ?? null,
      action,
      entityType,
      entityId ?? null,
      payloadBefore ?? null,
      payloadAfter ?? null,
      metadata && typeof metadata === 'object' ? metadata : {},
    ]
  );
  return res.rows[0].id;
}
