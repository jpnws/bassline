import { OpenAPIV3 } from 'openapi-types';
import { t } from 'elysia';

export const createBoardRouteSpec = {
  body: t.Object({
    name: t.String(),
  }),
  detail: {
    tags: ['Boards'],
    responses: {
      201: {
        description: 'Board created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    board: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      500: {
        description: 'Server error occurred.',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const getBoardPostsRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  detail: {
    tags: ['Boards'],
    responses: {
      200: {
        description: 'Retrieve board posts',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    board: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        name: { type: 'string' },
                        posts: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'number' },
                              subject: { type: 'string' },
                              createdAt: { type: 'string' },
                              author: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                  username: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      500: {
        description: 'Internal server error',
      },
    },
  } as OpenAPIV3.OperationObject,
};
