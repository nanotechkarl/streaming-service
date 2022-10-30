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
  update: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'password'],
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
          type: 'array',
          items: getModelSchemaRef(User, {
            includeRelations: true,
          }),
        },
      },
    },
  },
  getById: {
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
  update: {
    description: 'Update user details',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'password'],
        }),
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
            count: {type: 'number'},
          },
        },
      },
    },
  },
  register: {
    description: 'Register',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id', 'role', 'approved'],
        }),
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
            token: {
              type: 'string',
            },
          },
        },
      },
    },
  },
};
