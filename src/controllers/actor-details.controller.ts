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
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';

import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {PermissionKeys} from '../authorization/Permission-keys';
import {ActorDetails} from '../models';
import {ActorDetailsRepository, ActorRepository} from '../repositories';
import {basicAuthorization} from '../services/basic-authorizer.service';
import {requestBodySchema, responseSchema} from './actor-details.types';
export class ActorDetailsController {
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

    @repository(ActorDetailsRepository)
    public actorDetailsRepository: ActorDetailsRepository,
    @repository(ActorRepository)
    public actorRepository: ActorRepository,
  ) {}

  /* #region  - Create Actor [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @post('/actor-details')
  @response(200, responseSchema.createActor)
  async create(
    @requestBody(requestBodySchema.createActor)
    actorDetails: Omit<ActorDetails, 'id'>,
  ) {
    try {
      const found = await this.actorDetailsRepository.find({
        where: {
          and: [
            {firstName: actorDetails.firstName},
            {lastName: actorDetails.lastName},
          ],
        },
      });
      if (found.length) throw new Error('Actor already exists');
      const actor = await this.actorDetailsRepository.create(actorDetails);

      return {
        success: true,
        data: actor,
        message: 'Succesfully created actor',
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

  /* #region  - Get all actors */
  @get('/actor-details')
  @response(200, responseSchema.getAll)
  async find() {
    try {
      const actors = await this.actorDetailsRepository.find();

      return {
        success: true,
        data: actors,
        message: 'Succesfully fetched actor',
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

  /* #region  - Get all actors */
  @get('/actor-details/{actorId}')
  @response(200, responseSchema.getAll)
  async findActor(@param.path.string('actorId') actorId: string) {
    try {
      const actors = await this.actorDetailsRepository.findById(actorId);

      return {
        success: true,
        data: actors,
        message: 'Succesfully fetched actor',
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

  /* #region  - Modify Actor [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @patch('/actor-details/{id}')
  @response(204, responseSchema.updateActor)
  async updateById(
    @param.path.string('id') id: string,
    @requestBody(requestBodySchema.updateActor)
    actorDetails: ActorDetails,
  ) {
    try {
      await this.actorDetailsRepository.updateById(id, actorDetails);

      return {
        success: true,
        data: actorDetails,
        message: 'Succesfully updated actor',
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

  /* #region  - Delete Actor(only if no movies) [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @del('/actor-details/{id}')
  @response(200, responseSchema.delete)
  async deleteById(@param.path.string('id') id: string) {
    try {
      const found = await this.actorRepository.find({
        where: {actorDetailsId: id},
      });

      if (found.length) throw new Error('Actor has a movie');
      await this.actorDetailsRepository.deleteById(id);

      return {
        success: true,
        data: {id},
        message: 'Succesfully deleted actor',
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
