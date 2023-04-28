import { Hono } from 'hono';

export type Env = {};

export const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/ping', (c) => c.text('pong'));

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
