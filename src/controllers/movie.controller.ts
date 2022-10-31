import {authenticate, TokenService} from '@loopback/authentication';
import {
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  post,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Movie} from '../models';
import {MovieRepository} from '../repositories';
import {requestBodySchema, responseSchema} from './movie.types';
export class MovieController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @repository(MovieRepository)
    public movieRepository: MovieRepository,
  ) {}

  /* #region  - Get all movies [ALL]*/
  @authenticate.skip()
  @get('/movies')
  @response(200, responseSchema.getAll)
  async find() {
    try {
      const users = await this.movieRepository.find({include: ['actors']});

      return {
        success: true,
        data: users,
        message: 'Succesfully fetch all movies',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
  /* #endregion */

  /* #region  - Add movie [ADMIN]*/
  @post('/movies')
  @response(200, responseSchema.addMovie)
  async addMovie(
    @requestBody()
    movie: Omit<Movie, 'id'>,
  ) {
    try {
      const createdMovie = await this.movieRepository.create(movie);

      return {
        success: true,
        data: createdMovie,
        message: 'Succesfully fetch all movies',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
  /* #endregion */

  /* #region  - Update movie image URL and cost */
  @patch('/movies/{id}')
  @response(200, responseSchema.updateMovie)
  async updateById(
    @param.path.string('id') id: string,
    @requestBody(requestBodySchema.updateMovie)
    movie: Movie,
  ) {
    try {
      await this.movieRepository.updateById(id, movie);

      return {
        success: true,
        data: movie,
        message: 'Succesfully updated movie',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
  /* #endregion */

  /* #region  - Delete movies(> 1year) */
  @del('/movies/{id}')
  @response(200, responseSchema.delete)
  async deleteById(@param.path.string('id') id: string) {
    try {
      const movie = await this.movieRepository.findById(id);
      const pastTime = new Date(movie.yearRelease);
      const presentTime = new Date();

      const oneYear = 364 * 24 * 60 * 60 * 1000;

      const timeDiffInMs = presentTime.getTime() - pastTime.getTime();
      if (!(timeDiffInMs >= oneYear))
        throw new Error('Movie too early to delete');

      await this.movieRepository.deleteById(id);
      await this.movieRepository.actors(id).delete(); //delete all actors ref
      return {
        success: true,
        data: {id},
        message: 'Succesfully deleted movie',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
  /* #endregion */

  //TODO fix schema res/req
  /* #region  - Search movie by name */
  @get('/movies/search/{title}')
  @response(200, {
    description: 'Movie model instance',
  })
  async findByName(@param.path.string('title') name: string) {
    try {
      const pattern = new RegExp('^' + name + '.*', 'i');
      const found = await this.movieRepository.find({
        where: {title: {regexp: pattern}},
      });

      return {
        success: true,
        data: found,
        message: 'Succesfully fetched movie/s',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
  /* #endregion */
}
