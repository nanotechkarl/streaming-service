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

import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {PermissionKeys} from '../authorization/Permission-keys';
import {ActorDetails} from '../models';
import {
  ActorDetailsRepository,
  ActorRepository,
  MovieRepository,
} from '../repositories';
import {basicAuthorization} from '../services/basic-authorizer.service';
import {requestBodySchema, responseSchema} from './actor-details.types';
export class ActorDetailsController {
  constructor(
    @repository(MovieRepository)
    public movieRepository: MovieRepository,
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

      const actorDetails = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        actors.map(async (el: any) => {
          const collection = await this.actorRepository.find({
            where: {actorDetailsId: el.id},
          });

          return {...el, movies: collection};
        }),
      );

      return {
        success: true,
        data: actorDetails,
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

  /* #region  - Get actors id */
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
