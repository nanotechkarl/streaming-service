import {getModelSchemaRef} from '@loopback/rest';
import {User} from '../models';

/* #region  - request/response schema */
export const requestBodySchema = {
  register: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id'],
        }),
      },
    },
  },
  login: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'firstName', 'lastName', 'role', 'approved'],
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
          exclude: ['id', 'password', 'role', 'firstName', 'lastName', 'email'],
        }),
      },
    },
  },
};

export const responseSchema = {
  getAll: {
    description: 'Array of User model instances',
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
    description: 'User model instance',
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
    description: 'User model instance',
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
                'role',
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
              exclude: ['id', 'role', 'approved'],
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
    description: 'Token',
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
};
