import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
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
  Response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import * as _ from 'lodash';
import {PermissionKeys} from '../authorization/Permission-keys';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {validateCredentials} from '../services';
import {basicAuthorization} from '../services/basic-authorizer.service';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {requestBodySchema, responseSchema} from './user.types';

export class UserController {
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
    @inject(RestBindings.Http.RESPONSE) private res: Response,

    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  /* #region  - Register */
  @post('/users/register')
  @response(200, responseSchema.register)
  async create(
    @requestBody(requestBodySchema.register)
    userData: Omit<User, 'id'>,
  ) {
    try {
      validateCredentials(_.pick(userData, ['email', 'password']));
      const emailExist = await this.userRepository.find({
        where: {email: userData.email},
      });
      if (emailExist.length) throw new Error('User already exist');

      const found = await this.userRepository.find();
      userData.permissions = [PermissionKeys.user];

      //Permission to be an admin(needs approval)
      if (userData.permissions.includes('admin')) {
        userData.permissions = [PermissionKeys.admin];
      }
      if (!found.length) {
        userData.permissions = [PermissionKeys.root, PermissionKeys.admin];
        userData.approved = true;
      }

      userData.password = await this.hasher.hashPassword(userData.password);
      const savedUser = await this.userRepository.create(userData);

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

  /* #region  - Login(await approval on first login)*/
  @post('/users/login')
  @response(200, responseSchema.login)
  async login(
    @requestBody(requestBodySchema.login)
    user: User,
  ) {
    try {
      // make sure user exist,password should be valid
      const userVerified = await this.userService.verifyCredentials(user);
      const userProfile = this.userService.convertToUserProfile(userVerified);

      if (!userProfile.approved) throw new Error('Account is not yet approved');

      const token = await this.jwtService.generateToken(userProfile);
      const {id, email, name, permissions} = userProfile;

      return {
        success: true,
        data: {token, id, email, name, permissions},
        message: 'Successfully logged in',
      };
    } catch (error) {
      this.res.status(401);
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
  /* #endregion */

  /* #region  - Get all users with review [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @get('/users')
  @response(200, responseSchema.getAll)
  async find() {
    try {
      const users = await this.userRepository.find({
        include: ['review'],
      });

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

  /* #region  - Get user by id [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
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

  /* #region  - Approve account [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
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

  /* #region  - Delete user [ADMIN]*/
  @authenticate('jwt')
  @authorize({
    allowedRoles: [PermissionKeys.admin],
    voters: [basicAuthorization],
  })
  @del('/users/{userId}')
  @response(204, responseSchema.delete)
  async deleteById(@param.path.string('userId') id: string) {
    try {
      const account = await this.userRepository.findById(id);
      if (account?.permissions.includes('root')) {
        throw new Error('Cannot delete root admin');
      }

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
  @get('/users/me')
  @response(200, responseSchema.me)
  async me(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ) {
    try {
      return {
        success: true,
        data: currentUser,
        message: 'Successfully fetched account',
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
