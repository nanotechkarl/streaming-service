import {Client, expect, givenHttpServerConfig} from '@loopback/testlab';
import * as _ from 'lodash';
import {StreamingServiceApplication} from '../application';
import {ActorDetails, Movie, Review, User} from '../models';
import {
  ActorDetailsRepository,
  ActorRepository,
  MovieRepository,
  ReviewRepository,
  UserRepository,
} from '../repositories';
import {testdb} from './datasources/testdb.datasource';

export function givenUser(user?: Partial<User>) {
  const data = Object.assign(
    {
      email: 'test@example.com',
      password: 'qwerty123',
      firstName: 'test',
      lastName: 'doe',
      permissions: ['user'],
    },
    user,
  );
  return new User(data);
}

export function givenRootAdmin(user?: Partial<User>) {
  const data = Object.assign(
    {
      email: 'root@example.com',
      password: 'qwerty123',
      firstName: 'root',
      lastName: 'administrator',
      permissions: ['user'],
    },
    user,
  );
  return new User(data);
}

export function givenUserWithoutId(todo?: Partial<User>): Omit<User, 'id'> {
  return givenUser(todo);
}

export async function givenRunningApplicationWithCustomConfiguration() {
  const app = new StreamingServiceApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();

  /**
   * Override default config for DataSource for testing so we don't write
   * test data to file when using the memory connector.
   */
  app.bind('datasources.config.db').to({
    name: 'db',
    connector: 'memory',
  });

  // Start Application
  await app.start();
  return app;
}

export async function givenEmptyDatabase() {
  const userRepo: UserRepository = new UserRepository(
    testdb,
    async () => reviewRepo,
  );

  const movieRepo: MovieRepository = new MovieRepository(
    testdb,
    async () => actorRepo,
    async () => reviewRepo,
  );

  const actorRepo: ActorRepository = new ActorRepository(testdb);

  const actorDetailsRepo: ActorDetailsRepository = new ActorDetailsRepository(
    testdb,
    async () => actorRepo,
  );

  const reviewRepo: ReviewRepository = new ReviewRepository(testdb);

  await userRepo.deleteAll();
  await movieRepo.deleteAll();
  await actorRepo.deleteAll();
  await actorDetailsRepo.deleteAll();
  await reviewRepo.deleteAll();
}

export async function createAdmin(client: Client, userRepo: UserRepository) {
  const userData = givenRootAdmin();
  return client.post(`/users/register`).send(userData).expect(200);
}

export async function login(client: Client, userType: string) {
  let userData = {};
  if (userType === 'admin') {
    userData = givenRootAdmin();
  } else if (userType === 'user') {
    userData = givenUser();
  }

  const reqBody = _.omit(userData, ['firstName', 'lastName', 'permissions']);
  const response = await client.post(`/users/login`).send(reqBody).expect(200);

  const expected = {
    message: 'Successfully logged in',
  };

  expect(response.body.message).to.containEql(expected.message);
  return response.body.data.token;
}

export function givenMovie(movie?: Partial<Movie>) {
  const data = Object.assign(
    {
      title: 'Movie Sample',
      description: 'description',
      imgUrl: 'testImageURL',
      cost: 12,
      yearRelease: '2022-11-11T01:49:03.861Z',
    },
    movie,
  );
  return new Movie(data);
}

export function givenActor(actor?: Partial<ActorDetails>) {
  const data = Object.assign(
    {
      firstName: 'Actor',
      lastName: 'Actress',
      imgUrl: 'testImageURL',
      age: 12,
      gender: 'male',
    },
    actor,
  );
  return new ActorDetails(data);
}

export async function createMovie(client: Client, adminToken: string) {
  const movieData = givenMovie();
  const response = await client
    .post(`/movies`)
    .set({Authorization: `Bearer ${adminToken}`})
    .send(movieData)
    .expect(200);

  return response.body.data.id;
}

export async function createActor(client: Client, adminToken: string) {
  const actorData = givenActor();
  const response = await client
    .post(`/actor-details`)
    .set({Authorization: `Bearer ${adminToken}`})
    .send(actorData)
    .expect(200);

  return response.body.data.id;
}

export async function createUser(client: Client) {
  const userData = givenUser();
  const response = await client
    .post(`/users/register`)
    .send(userData)
    .expect(200);

  return response.body.data.id;
}

export async function createCustomUser(client: Client, email: string) {
  const userData = givenUser({email});
  const response = await client
    .post(`/users/register`)
    .send(userData)
    .expect(200);

  return response.body.data.id;
}

export async function approveUser(
  client: Client,
  adminToken: string,
  userId: string,
) {
  const response = await client
    .patch(`/users/approval/${userId}`)
    .set({Authorization: `Bearer ${adminToken}`})
    .send({approved: true})
    .expect(200);

  return response.body;
}

export function givenReview(review?: Partial<Review>) {
  const data = Object.assign(
    {
      message: 'hello',
      rating: 5,
      datePosted: '2022-11-11T05:54:31.959Z',
      name: 'test doe',
      movieId: '1',
    },
    review,
  );
  return new Review(data);
}
