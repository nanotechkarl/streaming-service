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
  addMovie: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(Movie, {
          exclude: ['id'],
        }),
      },
    },
  },
};

export const responseSchema = {
  getAll: {
    description: 'Get All movies',
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
    description: 'Get movie by id',
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
    description: 'Add new movie',
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
  search: {
    description: 'Search movie by title',
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
};
