import { OpenAPIV3 } from 'openapi-types';

export const getCurrentUserSpec = {
  detail: {
    tags: ['Users'],
    // OpenAPIV3.ResponsesObject
    responses: {
      200: {
        description: 'User retrieved',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'number',
                        },
                        username: {
                          type: 'string',
                        },
                        role: {
                          type: 'string',
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
      400: {
        description: 'User not authenticated',
      },
      401: {
        description: 'User not authorized',
      },
      404: {
        description: 'User not found',
      },
      500: {
        description: 'An unexpected error occurred',
      },
    },
  } as OpenAPIV3.OperationObject,
};
