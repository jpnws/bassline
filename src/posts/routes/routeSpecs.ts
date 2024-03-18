import { t } from 'elysia';
import { OpenAPIV3 } from 'openapi-types';

export const createPostRouteSpec = {
  body: t.Object({
    subject: t.String(),
    text: t.String(),
    boardId: t.Numeric(),
    authorId: t.Numeric(),
  }),
  detail: {
    tags: ['Posts'],
    responses: {
      201: {
        description: 'Post Created',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    post: {
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

export const getPostRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  detail: {
    tags: ['Posts'],
    responses: {
      200: {
        description: 'Post Retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    post: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        subject: { type: 'string' },
                        text: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                        board: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
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
        description: 'Post Not Found',
      },
      500: {
        description: 'Internal Server Error',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const updatePostRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  body: t.Object({
    subject: t.String(),
    text: t.String(),
    boardId: t.Numeric(),
    authorId: t.Numeric(),
  }),
  detail: {
    tags: ['Posts'],
    responses: {
      200: {
        description: 'Post Updated',
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

export const deletePostRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  detail: {
    tags: ['Posts'],
    responses: {
      202: {
        description: 'Post deleted successfully',
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

export const getPostCommentsRouteSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  detail: {
    tags: ['Posts'],
    responses: {
      200: {
        description: 'Comments Retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    post: {
                      type: 'object',
                      properties: {
                        id: { type: 'number' },
                        comments: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'number' },
                              text: { type: 'string' },
                              author: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                  username: { type: 'string' },
                                },
                              },
                              createdAt: { type: 'string' },
                              updatedAt: { type: 'string' },
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
        description: 'Internal Server Error',
      },
    },
  } as OpenAPIV3.OperationObject,
};
