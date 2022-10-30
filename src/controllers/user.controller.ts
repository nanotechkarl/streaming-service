import {authenticate, TokenService} from '@loopback/authentication';
import {
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
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
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import bcrypt from 'bcryptjs';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {requestBodySchema, responseSchema} from './user.types';

// @authenticate('jwt')
export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @repository(UserRepository)
    protected userRepository: UserRepository,
  ) {}

  /* #region  - Register */
  @authenticate.skip()
  @post('/users/register')
  @response(200, responseSchema.register)
  async create(
    @requestBody(requestBodySchema.register)
    user: Omit<User, 'id'>,
  ) {
    try {
      const {email, password} = user;
      const found = await this.userRepository.find({where: {email}});

      if (found.length) throw new Error('User already exist'); //TODO throw better error

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      user.password = hashedPassword;

      //Initialize role and approval
      user.role = 'user';
      user.approved = false;
      const registered = await this.userRepository.create(user);

      return {
        success: true,
        data: registered,
        message: 'Successfully registered',
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

  /* #region  - Login */
  @authenticate.skip()
  @post('/users/login')
  @response(200, responseSchema.login)
  async login(
    @requestBody(requestBodySchema.login)
    user: User,
  ) {
    try {
      const {email, password} = user;
      const existingUser = await this.userRepository.findOne({where: {email}});
      if (!existingUser) throw new Error('User does not exist in the database');

      const validPassword = bcrypt.compareSync(
        password,
        existingUser?.password,
      );
      if (!validPassword) throw new Error('Wrong password');

      const secId = existingUser?.id?.toString();
      const userObj: UserProfile = {
        [securityId]: secId ?? '',
        email: existingUser.email,
      };

      const token = await this.jwtService.generateToken(userObj);

      return {
        success: true,
        data: token,
        message: 'Successfully logged in',
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

  /* #region  - Get all users with rating [ADMIN]*/
  @get('/users')
  @response(200, responseSchema.getAll)
  async find() {
    try {
      const users = await this.userRepository.find({include: ['review']});

      return {
        success: true,
        data: users,
        message: 'Succesfully updated role',
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

  /* #region  - Get user by id */
  @get('/users/{userId}')
  @response(200, responseSchema.getById)
  async findById(@param.path.string('userId') userId: string) {
    try {
      const user = await this.userRepository.findById(userId, {
        include: ['review'],
      });
      return {
        success: true,
        data: user,
        message: 'Successfully fetched user',
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

  /* #region  - Edit user role */
  @patch('/users/role/{userId}')
  @response(204, responseSchema.updateRole)
  async replaceRole(
    @param.path.string('userId') id: string,
    @requestBody(requestBodySchema.updateRole) user: User,
  ) {
    try {
      await this.userRepository.updateById(id, user);
      return {
        success: true,
        data: user,
        message: 'Succesfully updated role',
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

  /* #region  - Approve account */
  @patch('/users/approval/{userId}')
  @response(204, responseSchema.updateRole)
  async replaceApprove(
    @param.path.string('userId') id: string,
    @requestBody(requestBodySchema.updateApproval) user: User,
  ) {
    try {
      await this.userRepository.updateById(id, user);
      return {
        success: true,
        data: user,
        message: 'Succesfully approved account',
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

  /* #region  - Delete user */
  @del('/users/{userId}')
  @response(204, responseSchema.delete)
  async deleteById(@param.path.string('userId') id: string) {
    try {
      await this.userRepository.deleteById(id);
      return {
        success: true,
        data: id,
        message: 'Successfully deleted user',
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

  //TODO REMOVE LATER
  /* #region  - get review by user id */
  @get('/sample/{userId}/review')
  async createReview(
    @param.path.string('userId') userId: typeof User.prototype.id,
  ) {
    return this.userRepository.review(userId).get(); //REVIEW GET
  }
  /* #endregion */
}
