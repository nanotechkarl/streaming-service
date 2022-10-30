import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Actor, Movie, Review} from '../models';
import {MovieRepository} from '../repositories';
const {ObjectId} = require('mongodb');

export class MovieController {
  constructor(
    @repository(MovieRepository)
    public movieRepository: MovieRepository,
  ) {}

  @post('/movies')
  @response(200, {
    description: 'Movie model instance',
    content: {'application/json': {schema: getModelSchemaRef(Movie)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Movie, {
            title: 'NewMovie',
            exclude: ['id'],
          }),
        },
      },
    })
    movie: Omit<Movie, 'id'>,
  ): Promise<Movie> {
    return this.movieRepository.create(movie);
  }

  @get('/movies/count')
  @response(200, {
    description: 'Movie model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Movie) where?: Where<Movie>): Promise<Count> {
    return this.movieRepository.count(where);
  }

  @get('/movies')
  @response(200, {
    description: 'Array of Movie model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Movie, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Movie) filter?: Filter<Movie>): Promise<Movie[]> {
    return this.movieRepository.find(filter);
  }

  @patch('/movies')
  @response(200, {
    description: 'Movie PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Movie, {partial: true}),
        },
      },
    })
    movie: Movie,
    @param.where(Movie) where?: Where<Movie>,
  ): Promise<Count> {
    return this.movieRepository.updateAll(movie, where);
  }

  @get('/movies/{id}')
  @response(200, {
    description: 'Movie model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Movie, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Movie, {exclude: 'where'})
    filter?: FilterExcludingWhere<Movie>,
  ): Promise<Movie> {
    return this.movieRepository.findById(id, filter);
  }

  @patch('/movies/{id}')
  @response(204, {
    description: 'Movie PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Movie, {partial: true}),
        },
      },
    })
    movie: Movie,
  ): Promise<void> {
    await this.movieRepository.updateById(id, movie);
  }

  @put('/movies/{id}')
  @response(204, {
    description: 'Movie PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() movie: Movie,
  ): Promise<void> {
    await this.movieRepository.replaceById(id, movie);
  }

  @del('/movies/{id}')
  @response(204, {
    description: 'Movie DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.movieRepository.deleteById(id);
  }

  //TODO REMOVE LATER
  @post('/sample/{id}/actor')
  async createActor(
    @param.path.string('id') movieId: typeof Movie.prototype.id,
    @requestBody() actorData: Actor,
  ) {
    return this.movieRepository.actors(movieId).create(actorData);
  }

  //TODO REMOVE LATER
  @post('/sample/{movieId}/review')
  async createReview(
    @param.path.string('movieId') movieId: typeof Movie.prototype.id,
    @requestBody() reviewData: Review,
  ) {
    reviewData.userId = ObjectId('635d97eee2ddeb65542f12be'); //TODO GET FROM TOKEN
    return this.movieRepository.reviews(movieId).create(reviewData);
    // return this.movieRepository.reviews(movieId).find(); //REVIEW GET
    // return this.movieRepository.reviews(movieId).create(reviewData); //REVIEW POST
  }
}
