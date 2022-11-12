import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import * as _ from 'lodash';
import {PermissionKeys} from '../authorization/Permission-keys';
import {Movie} from '../models';
import {
  ActorDetailsRepository,
  ActorRepository,
  MovieRepository,
} from '../repositories';
import {basicAuthorization} from '../services/basic-authorizer.service';
import {requestBodySchema, responseSchema} from './movie.types';

export class MovieController {
  constructor(
    @repository(MovieRepository)
    public movieRepository: MovieRepository,
    @repository(ActorDetailsRepository)
    public actorDetailsRepository: ActorDetailsRepository,
    @repository(ActorRepository)
    public actorRepository: ActorRepository,
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
      const pattern = new RegExp(name, 'i');
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

  /* #region  - Search actor */
  @get('/movies/search/actor/{name}')
  @response(200, responseSchema.search)
  async findByActor(@param.path.string('name') name: string) {
    try {
      const nameSplit = name.split(' ');

      const search = await Promise.all(
        nameSplit.map(async (char: string) => {
          const pattern = new RegExp(char, 'i');
          const find = await this.actorDetailsRepository.find({
            where: {
              or: [
                {firstName: {regexp: pattern}},
                {lastName: {regexp: pattern}},
              ],
            },
          });
          return find;
        }),
      );

      const arr = _.flatten(search).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (value: any, index, self) => {
          return (
            index ===
            self.findIndex(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (t: any) =>
                t.firstName === value.firstName &&
                t.lastName === value.lastName,
            )
          );
        },
      );

      return {
        success: true,
        data: arr,
        message: 'Succesfully fetched movie/s by actor',
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
      await this.movieRepository.reviews(id).delete();

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
