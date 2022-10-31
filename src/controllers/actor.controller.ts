import {repository} from '@loopback/repository';
import {del, get, param, post, requestBody, response} from '@loopback/rest';
import {Actor} from '../models';
import {ActorRepository} from '../repositories';
import {requestBodySchema, responseSchema} from './actor.types';

export class ActorController {
  constructor(
    @repository(ActorRepository)
    public actorRepository: ActorRepository,
  ) {}

  //TODO check movieId and actorDetailsId if existing before create
  /* #region  - Add actor to movie */
  @post('/actors')
  @response(200, responseSchema.addActor)
  async create(
    @requestBody(requestBodySchema.addActor)
    actor: Omit<Actor, 'id'>,
  ) {
    try {
      const created = this.actorRepository.create(actor);

      return {
        success: true,
        data: created,
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

  /* #region  - Get all actors of movie */
  @get('/actors')
  @response(200, responseSchema.getAll)
  async find() {
    try {
      const actors = await this.actorRepository.find();
      return {
        success: true,
        data: actors,
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

  /* #region  - Delete actor from the movie */
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
