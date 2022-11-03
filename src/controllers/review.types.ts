import {getModelSchemaRef} from '@loopback/rest';
import {Review} from '../models';

/* #region  - request/response schema */
export const requestBodySchema = {
  updateActor: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(Review, {partial: true}),
      },
    },
  },
  addReview: {
    content: {
      'application/json': {
        schema: getModelSchemaRef(Review, {
          exclude: ['id', 'userId', 'approved'],
        }),
      },
    },
  },
};

export const responseSchema = {
  getAll: {
    description: 'Get all reviews',
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
              items: getModelSchemaRef(Review, {includeRelations: false}),
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  getByUserId: {
    description: 'Get review by userId',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Review, {
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
  addReview: {
    description: 'Add review to a movie',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Review),
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  updateReview: {
    description: 'Update actor details',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: getModelSchemaRef(Review, {
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
    description: 'Review DELETE success',
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
