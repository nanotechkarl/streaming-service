import {getModelSchemaRef} from '@loopback/rest';
import {User} from '../models';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

/* #region  - request/response schema */
export const requestBodySchema = {
  register: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'approved'],
        }),
      },
    },
  },
  login: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'firstName', 'lastName', 'approved', 'permissions'],
        }),
      },
    },
  },
  updateRole: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: [
            'id',
            'password',
            'approved',
            'firstName',
            'lastName',
            'email',
          ],
        }),
      },
    },
  },
  updateApproval: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'password', 'firstName', 'lastName', 'email'],
        }),
      },
    },
  },
};

export const responseSchema = {
  getAll: {
    description: 'Get all users details',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: Array,
              items: getModelSchemaRef(User, {
                includeRelations: false,
                optional: ['review'],
              }),
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  getById: {
    description: 'Get user details by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(User, {
              includeRelations: false,
              optional: ['review'],
              exclude: ['password'],
            }),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  getUserLoggedIn: {
    description: 'Get logged in account details',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          includeRelations: true,
          exclude: ['password'],
        }),
      },
    },
  },
  updateRole: {
    description: 'Update user details',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(User, {
              exclude: [
                'id',
                'password',
                'approved',
                'firstName',
                'lastName',
                'email',
              ],
            }),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  updateApproval: {
    description: 'Update Approval',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(User, {
              exclude: ['id', 'password', 'firstName', 'lastName', 'email'],
            }),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  delete: {
    description: 'User DELETE success',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  register: {
    description: 'Register',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(User, {
              exclude: ['id', 'approved', 'permissions'],
            }),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  login: {
    description: 'Get user token',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  me: {
    security: OPERATION_SECURITY_SPEC,
    description: 'The current user profile',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User),
      },
    },
  },
};
