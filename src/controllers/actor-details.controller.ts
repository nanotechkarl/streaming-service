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
import {ActorDetails} from '../models';
import {ActorDetailsRepository, ActorRepository} from '../repositories';
import {requestBodySchema, responseSchema} from './actor-details.types';

export class ActorDetailsController {
  constructor(
    @repository(ActorDetailsRepository)
    public actorDetailsRepository: ActorDetailsRepository,
    @repository(ActorRepository)
    public actorRepository: ActorRepository,
  ) {}

  /* #region  - Create Actor */
  @post('/actor-details')
  @response(200, responseSchema.createActor)
  async create(
    @requestBody(requestBodySchema.createActor)
    actorDetails: Omit<ActorDetails, 'id'>,
  ) {
    try {
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

  /* #region  - Modify Actor */
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

  /* #region  - Delete Actor(only if no movies) */
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
