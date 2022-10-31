import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getJsonSchemaRef,
  param,
  patch,
  post,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import * as _ from 'lodash';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {validateCredentials} from '../services';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';
import {requestBodySchema, responseSchema} from './user.types';

// @authenticate('jwt')
export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  /* #region  - Register */
  // @authenticate.skip()
  @post('/users/register')
  @response(200, responseSchema.register)
  async create(
    @requestBody(requestBodySchema.register)
    userData: Omit<User, 'id'>,
  ) {
    try {
      validateCredentials(_.pick(userData, ['email', 'password']));
      userData.password = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(userData);
      // delete savedUser.password;

      return {
        success: true,
        data: savedUser,
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
  // @authenticate.skip()
  @post('/users/login')
  @response(200, responseSchema.login)
  async login(
    @requestBody(requestBodySchema.login)
    user: User,
  ) {
    try {
      // const {email, password} = user;
      // make sure user exist,password should be valid
      const user1 = await this.userService.verifyCredentials(user);
      const userProfile = this.userService.convertToUserProfile(user1);

      const token = await this.jwtService.generateToken(userProfile);

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
        data: {id},
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

  /* #region  - Get logged in user */
  @authenticate('jwt')
  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(User),
          },
        },
      },
    },
  })
  async me(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<UserProfile> {
    return Promise.resolve(currentUser);
  }
  /* #endregion */
}
