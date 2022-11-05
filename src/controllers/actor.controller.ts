import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  param,
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
import {Actor} from '../models';
import {
  ActorDetailsRepository,
  ActorRepository,
  MovieRepository,
} from '../repositories';
import {basicAuthorization} from '../services/basic-authorizer.service';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {requestBodySchema, responseSchema} from './actor.types';
export class ActorController {
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

    @repository(ActorRepository)
    public actorRepository: ActorRepository,
    @repository(MovieRepository)
    public movieRepository: MovieRepository,
    @repository(ActorDetailsRepository)
    public actorDetailsRepository: ActorDetailsRepository,
  ) {}

  /* #region  - Add actor to movie [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @post('/actors')
  @response(200, responseSchema.addActor)
  async create(
    @requestBody(requestBodySchema.addActor)
    actor: Omit<Actor, 'id'>,
  ) {
    try {
      const foundMovie = await this.movieRepository.find({
        where: {id: actor.movieId},
      });
      const foundActor = await this.actorDetailsRepository.find({
        where: {id: actor.actorDetailsId},
      });
      if (!foundMovie.length) throw new Error('No id matched the movies');
      if (!foundActor.length) throw new Error('No id matched the actor');

      const foundConnection = await this.actorRepository.find({
        where: {
          and: [
            {actorDetailsId: actor.actorDetailsId},
            {movieId: actor.movieId},
          ],
        },
      });
      if (foundConnection.length) {
        throw new Error('Actor already exist in the movie');
      }

      const created = this.actorRepository.create(actor);

      return {
        success: true,
        data: created,
        message: 'Succesfully added actor to movie',
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

  /* #region  - Get all actors of movie */
  @get('/actors/{movieId}')
  @response(200, responseSchema.getAll)
  async find(@param.path.string('movieId') movieId: string) {
    try {
      const actors = await this.actorRepository.find({where: {movieId}});

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actorsId = actors.map((obj: any) => obj.actorDetailsId);
      const actorDetails = await Promise.all(
        actorsId.map(async el => {
          return this.actorDetailsRepository.findById(el);
        }),
      );

      return {
        success: true,
        data: actorDetails,
        message: 'Succesfully fetch actors by movie',
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

  /* #region  - Delete actor from the movie [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @del('/actors/{id}')
  @response(200, responseSchema.delete)
  async deleteById(@param.path.string('id') id: string) {
    try {
      await this.actorRepository.deleteById(id);

      return {
        success: true,
        data: {id},
        message: 'Succesfully deleted actor in the movie',
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
