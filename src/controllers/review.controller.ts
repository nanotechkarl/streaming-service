import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  put,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {PermissionKeys} from '../authorization/Permission-keys';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {Review} from '../models';
import {MovieRepository, ReviewRepository} from '../repositories';
import {basicAuthorization} from '../services/basic-authorizer.service';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {requestBodySchema, responseSchema} from './review.types';
export class ReviewController {
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

    @repository(ReviewRepository)
    public reviewRepository: ReviewRepository,
    @repository(MovieRepository)
    public movieRepository: MovieRepository,
  ) {}

  /* #region  - Add review to movie [USER-byJWT]*/
  @authenticate('jwt')
  @put('/reviews')
  @response(200, responseSchema.addReview)
  async create(
    @requestBody(requestBodySchema.addReview)
    review: Omit<Review, 'id'>,
  ) {
    try {
      review.userId = this.user[securityId];
      review.approved = false;
      const found = await this.reviewRepository.find({
        where: {and: [{userId: review.userId}, {movieId: review.movieId}]},
      });

      const movieFound = await this.movieRepository.findById(review.movieId);
      if (!movieFound) throw new Error('Movie does not exist');

      let created = {};
      if (found.length) {
        //update existing record
        await this.reviewRepository.updateAll(review, {
          and: [{userId: review.userId}, {movieId: review.movieId}],
        });
      } else {
        created = await this.reviewRepository.create(review);
      }

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

  /* #region  - Get reviews of movie */
  @get('/reviews/movie/{movieId}')
  @response(200, responseSchema.getAll)
  async findbyMovieId(@param.path.string('movieId') movieId: string) {
    try {
      const found = await this.reviewRepository.find({
        where: {and: [{movieId}, {approved: true}]},
      });
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

  /* #region  - Get review by userId [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
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

  /* #region  - Edit review [USER-byJWT]*/
  @authenticate('jwt')
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

  /* #region  - Delete review [USER-byJWT]*/
  @authenticate('jwt')
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
