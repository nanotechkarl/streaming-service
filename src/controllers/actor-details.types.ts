import {getModelSchemaRef} from '@loopback/rest';
import {ActorDetails} from '../models';

/* #region  - request/response schema */
export const requestBodySchema = {
  updateActor: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(ActorDetails, {
          partial: true,
          exclude: ['id'],
        }),
      },
    },
  },
  createActor: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(ActorDetails, {
          title: 'NewActorDetails',
          exclude: ['id'],
        }),
      },
    },
  },
};

export const responseSchema = {
  getAll: {
    description: 'Array of ActorDetails model instances',
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
              items: getModelSchemaRef(ActorDetails, {includeRelations: false}),
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
    description: 'ActorDetails model instance',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(ActorDetails, {
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
  createActor: {
    description: 'Create Actor',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(ActorDetails),
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
            data: getModelSchemaRef(ActorDetails, {
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
    description: 'ActorDetails DELETE success',
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
