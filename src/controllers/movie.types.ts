import {getModelSchemaRef} from '@loopback/rest';
import {Movie} from '../models';

/* #region  - request/response schema */
export const requestBodySchema = {
  updateMovie: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(Movie, {
          partial: true,
          exclude: ['id', 'title', 'description', 'yearRelease'],
        }),
      },
    },
  },
};

export const responseSchema = {
  getAll: {
    description: 'Array of Movie model instances',
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
              items: getModelSchemaRef(Movie, {
                includeRelations: false,
                optional: ['reviews'],
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
    description: 'Movie model instance',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Movie, {
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
  addMovie: {
    description: 'Movie model instance',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Movie, {
              includeRelations: false,
              optional: ['reviews'],
            }),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  updateMovie: {
    description: 'Update Movie cost and image',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Movie, {
              includeRelations: false,
              exclude: ['id', 'title', 'description', 'yearRelease'],
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
    description: 'Movie DELETE success',
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
