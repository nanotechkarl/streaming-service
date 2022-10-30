import {TokenService} from '@loopback/authentication';
import {
  MyUserService,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import bcrypt from 'bcryptjs';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {requestBodySchema, responseSchema} from './user.types';

export class UserController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository)
    protected userRepository: UserRepository,
  ) {}

  /* #region  - Register */
  @post('/users/register')
  @response(200, responseSchema.register)
  async create(
    @requestBody(requestBodySchema.register)
    user: Omit<User, 'id'>,
  ): Promise<User> {
    const {email, password} = user;
    const found = await this.userRepository.find({where: {email}});

    if (found.length) throw new Error('User already exist'); //TODO throw better error

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    user.password = hashedPassword;

    //Initialize role and approval
    user.role = 'user';
    user.approved = false;
    return this.userRepository.create(user);
  }
  /* #endregion */

  /* #region - Login */
  @post('/users/login')
  @response(200, responseSchema.login)
  async login(
    @requestBody(requestBodySchema.login)
    user: User,
  ): Promise<{token: string}> {
    const {email, password} = user;
    const existingUser = await this.userRepository.findOne({where: {email}});
    if (!existingUser) throw new Error('User does not exist in the database');

    const validPassword = bcrypt.compareSync(password, existingUser?.password);
    if (!validPassword) throw new Error('Wrong password');

    const secId = existingUser?.id?.toString();
    const userObj: UserProfile = {
      [securityId]: secId ?? '',
      email: existingUser.email,
      password: existingUser.password,
      id: existingUser.id,
      role: existingUser.role,
    };

    const token = await this.jwtService.generateToken(userObj);
    return {token};
  }
  /* #endregion */

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  //TODO REMOVE LATER
  @get('/sample/{userId}/review')
  async createReview(
    @param.path.string('userId') userId: typeof User.prototype.id,
  ) {
    return this.userRepository.review(userId).get(); //REVIEW GET
  }
}
