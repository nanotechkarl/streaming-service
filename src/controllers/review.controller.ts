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

  /* #region  - Add/update review to movie [USER-byJWT]*/
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
      review.datePosted = new Date().toDateString();

      const found = await this.reviewRepository.find({
        where: {and: [{userId: review.userId}, {movieId: review.movieId}]},
      });

      const movieFound = await this.movieRepository.findById(review.movieId);
      if (!movieFound) throw new Error('Movie does not exist');

      let created = {};
      if (found.length) {
        //update existing record
        created = await this.reviewRepository.updateAll(review, {
          and: [{userId: review.userId}, {movieId: review.movieId}],
        });
      } else {
        created = await this.reviewRepository.create(review);
      }

      return {
        success: true,
        data: created,
        message: 'Succesfully added/updated review',
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

  /* #region  - Get all pending reviews */
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @get('/reviews/pending')
  @response(200, responseSchema.getAll)
  async findPending() {
    try {
      const found = await this.reviewRepository.find({
        where: {approved: false},
      });
      return {
        success: true,
        data: found,
        message: 'Succesfully fetched pending reviews',
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

  /* #region  - Get reviews by userId [ADMIN]*/
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
        message: 'Succesfully fetched reviews',
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

  /* #region  - Get review by self and movie id [USER-byJWT]*/
  @authenticate('jwt')
  @get('/reviews/{movieId}/myReview')
  @response(200, responseSchema.getByUserId)
  async findByTwoId(@param.path.string('movieId') movieId: string) {
    try {
      const userId = this.user[securityId];
      const found = await this.reviewRepository.find({
        where: {and: [{userId}, {movieId}]},
      });

      return {
        success: true,
        data: found[0],
        message: 'Succesfully fetched review',
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

  /* #region  - Edit review(for review approval) [USER-byJWT]*/
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
