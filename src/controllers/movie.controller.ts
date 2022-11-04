import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
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
import {PermissionKeys} from '../authorization/Permission-keys';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {Movie} from '../models';
import {MovieRepository} from '../repositories';
import {basicAuthorization} from '../services/basic-authorizer.service';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {requestBodySchema, responseSchema} from './movie.types';

export class MovieController {
  constructor(
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @repository(MovieRepository)
    public movieRepository: MovieRepository,
  ) {}

  /* #region  - Get all movies */
  @get('/movies')
  @response(200, responseSchema.getAll)
  async find() {
    try {
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const movies: {[key: string]: any} = await this.movieRepository.find({
        include: ['actors'],
      });
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const moviesSorted = movies.sort((a: any, b: any) => {
        const movieA = new Date(a.yearRelease);
        const movieB = new Date(b.yearRelease);

        return movieB.getTime() - movieA.getTime();
      });

      return {
        success: true,
        data: moviesSorted,
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

  /* #region  - Search movie by name */
  @get('/movies/search/movie/{title}')
  @response(200, responseSchema.search)
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

  /* #region  - Get movie by id */
  @get('/movies/{movieId}')
  @response(200, responseSchema.getById)
  async findById(@param.path.string('movieId') movieId: string) {
    try {
      const found = await this.movieRepository.findById(movieId);

      return {
        success: true,
        data: found,
        message: 'Succesfully fetched movie',
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
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @post('/movies')
  @response(200, responseSchema.addMovie)
  async addMovie(
    @requestBody(requestBodySchema.addMovie)
    movie: Movie,
  ) {
    try {
      const found = await this.movieRepository.find({
        where: {title: {regexp: `/^${movie.title}/i`}},
      });
      if (found.length) throw new Error('Movie title already exists');

      const createdMovie = await this.movieRepository.create(movie);

      return {
        success: true,
        data: createdMovie,
        message: 'Succesfully added movie',
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

  /* #region  - Update movie image URL and cost [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
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

  /* #region  - Delete movies(> 1year) [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
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
}
