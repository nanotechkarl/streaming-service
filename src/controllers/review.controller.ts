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
import {Review} from '../models';
import {ReviewRepository} from '../repositories';
import {requestBodySchema, responseSchema} from './review.types';

export class ReviewController {
  constructor(
    @repository(ReviewRepository)
    public reviewRepository: ReviewRepository,
  ) {}

  //TODO make sure userId, movieId exist
  /* #region  - Add review to movie*/
  @post('/reviews')
  @response(200, responseSchema.addReview)
  async create(
    @requestBody(requestBodySchema.addReview)
    review: Omit<Review, 'id'>,
  ) {
    try {
      const created = await this.reviewRepository.create(review);

      return {
        success: true,
        data: created,
        message: 'Succesfully added review',
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

  /* #region  - Get all reviews */
  @get('/reviews')
  @response(200, responseSchema.getAll)
  async find() {
    try {
      const found = await this.reviewRepository.find();
      return {
        success: true,
        data: found,
        message: 'Succesfully fetched all reviews',
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

  /* #region  - Get review by userId */
  @get('/reviews/{userId}')
  @response(200, responseSchema.getByUserId)
  async findById(@param.path.string('userId') userId: string) {
    try {
      const found = await this.reviewRepository.find({where: {userId}});

      return {
        success: true,
        data: found,
        message: 'Succesfully fetched all reviews',
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

  /* #region  - Edit review */
  @patch('/reviews/{id}')
  @response(200, responseSchema.updateReview)
  async updateById(
    @param.path.string('id') id: string,
    @requestBody(requestBodySchema.updateActor)
    review: Review,
  ) {
    try {
      await this.reviewRepository.updateById(id, review);
      return {
        success: true,
        data: review,
        message: 'Succesfully updated review',
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

  /* #region  - Delete review */
  @del('/reviews/{id}')
  @response(200, responseSchema.delete)
  async deleteById(@param.path.string('id') id: string) {
    try {
      await this.reviewRepository.deleteById(id);
      return {
        success: true,
        data: {id},
        message: 'Succesfully deleted review',
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
