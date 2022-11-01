import {getModelSchemaRef} from '@loopback/rest';
import {Actor} from '../models';

/* #region  - request/response schema */
export const requestBodySchema = {
  updateActor: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(Actor, {
          partial: true,
          exclude: ['id'],
        }),
      },
    },
  },
  addActor: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(Actor, {
          title: 'NewActor',
          exclude: ['id'],
        }),
      },
    },
  },
};

export const responseSchema = {
  getAll: {
    description: 'Get all actors of movie',
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
              items: getModelSchemaRef(Actor, {includeRelations: false}),
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
    description: 'Get actor by id',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Actor, {
              title: 'NewMovie',
              exclude: ['id'],
            }),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  addActor: {
    description: 'Add actor',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Actor),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  updateActor: {
    description: 'Update actor details',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Actor, {
              includeRelations: false,
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
    description: 'Actor DELETE success',
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
};
