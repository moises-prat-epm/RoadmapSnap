/**
 * Auth routes: GET /auth/me (user + preferences), PATCH /auth/me (update preferences).
 * Expects preHandler: [authenticate, setRequestContext].
 */

export async function registerAuthRoutes(fastify) {
  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate, fastify.setRequestContext],
  }, async (request) => {
    const preferences = request.dbUser?.preferences ?? { theme: 'light' };
    return {
      ...request.user,
      preferences,
    };
  });

  fastify.patch('/auth/me', {
    preHandler: [fastify.authenticate, fastify.setRequestContext],
    schema: {
      body: {
        type: 'object',
        properties: {
          preferences: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    if (!request.dbUser?.id) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'User not found',
      });
    }

    const incoming = request.body?.preferences;
    if (!incoming || typeof incoming !== 'object') {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Body must include preferences object',
      });
    }

    const current = request.dbUser.preferences ?? { theme: 'light' };
    const nextPreferences = { ...current, ...incoming };
    if (nextPreferences.theme !== 'light' && nextPreferences.theme !== 'dark') {
      nextPreferences.theme = 'light';
    }

    const client = request.dbClient;
    const result = await client.query(
      `UPDATE users SET preferences = $1::jsonb WHERE id = $2
       RETURNING id, auth0_id, email, display_name, preferences`,
      [JSON.stringify(nextPreferences), request.dbUser.id]
    );

    if (result.rowCount === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    const row = result.rows[0];
    const prefs = row.preferences && typeof row.preferences === 'object'
      ? row.preferences
      : { theme: 'light' };

    return {
      ...request.user,
      email: row.email,
      name: row.display_name,
      preferences: prefs,
    };
  });
}
