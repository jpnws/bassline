import { OpenAPIV3 } from 'openapi-types';
import { t } from 'elysia';

export const signinRouteSpec = {
  body: t.Object({
    username: t.String(),
    password: t.String(),
  }),
  detail: {
    tags: ['Auth'],
    responses: {
      200: {
        description: 'OK',
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
                      },
                    },
                    token: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized',
      },
      500: {
        description: 'An unexpected error occurred',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const demoUserSignInRouteSpec = {
  detail: {
    tags: ['Auth'],
    responses: {
      200: {
        description: 'OK',
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
                      },
                    },
                    token: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized',
      },
      500: {
        description: 'An unexpected error occurred',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const demoAdminSignInRouteSpec = {
  detail: {
    tags: ['Auth'],
    responses: {
      200: {
        description: 'OK',
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
                      },
                    },
                    token: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      401: {
        description: 'Unauthorized',
      },
      500: {
        description: 'An unexpected error occurred',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const signoutRouteSpec = {
  detail: {
    tags: ['Auth'],
    responses: {
      200: {
        description: 'Signout successful',
      },
      400: {
        description: 'User Not Authenticated',
      },
      401: {
        description: 'User Unauthorized',
      },
    },
  } as OpenAPIV3.OperationObject,
};

export const signupRouteSpec = {
  body: t.Object({
    username: t.String(),
    password: t.String(),
  }),
  detail: {
    tags: ['Auth'],
    responses: {
      201: {
        description: 'User created successfully.',
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
                      },
                    },
                    token: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: 'Username or password cannot be empty.',
      },
      409: {
        description: 'User already authenticated.',
      },
      500: {
        description: 'Server error. Unable to create an account.',
      },
    },
  } as OpenAPIV3.OperationObject,
};
