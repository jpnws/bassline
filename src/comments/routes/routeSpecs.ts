import { OpenAPIV3 } from 'openapi-types';
import { t } from 'elysia';

export const createCommentRouteSpec = {
  body: t.Object({
    text: t.String(),
    postId: t.Numeric(),
    authorId: t.Numeric(),
  }),
  detail: {
    tags: ['Comments'],
    responses: {
      201: {
        description: 'Comment Created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    comment: {
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
      400: {
        description: 'User Not Authenticated',
      },
      401: {
        description: 'User Unauthorized',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const getCommentRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  detail: {
    tags: ['Comments'],
    responses: {
      200: {
        description: 'Comment Retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    comment: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        text: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                        post: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                          },
                        },
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
      404: {
        description: 'Comment Not Found',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const updateCommentRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  body: t.Object({
    text: t.String(),
    postId: t.Numeric(),
    authorId: t.Numeric(),
  }),
  detail: {
    tags: ['Comments'],
    responses: {
      200: {
        description: 'Comment Updated',
      },
      400: {
        description: 'User Not Authenticated',
      },
      401: {
        description: 'User Not Authorized',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const deleteCommentRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  detail: {
    tags: ['Comments'],
    responses: {
      202: {
        description: 'Comment Deleted',
      },
      400: {
        description: 'User Not Authenticated',
      },
      401: {
        description: 'User Not Authorized',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  } as OpenAPIV3.OperationObject,
};
