import {Client, createRestAppClient, expect} from '@loopback/testlab';
import {StreamingServiceApplication} from '../../application';
import {ActorRepository, UserRepository} from '../../repositories';
import {
  createActor,
  createAdmin,
  createMovie,
  givenRunningApplicationWithCustomConfiguration,
  login,
} from '../helpers';

describe('ActorDetailsController', () => {
  let app: StreamingServiceApplication;
  let client: Client;
  let userRepo: UserRepository;
  let actorRepo: ActorRepository;
  let adminToken = '';
  let movieId = '';
  let actorDetailsId = '';

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(givenUserRepository);
  before(givenActorRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  context('As Admin', () => {
    before(async () => {
      await createAdmin(client, userRepo);
      adminToken = await login(client, 'admin');
      movieId = await createMovie(client, adminToken);
      actorDetailsId = await createActor(client, adminToken);
    });

    it('Should add an actor to a movie', async () => {
      const actorData = {
        actorDetailsId,
        movieId,
      };
      const response = await client
        .post(`/actors`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(actorData)
        .expect(200);

      expect(response.body.message).to.containEql(
        'Succesfully added actor to movie',
      );

      const found = await actorRepo.findById('1');
      expect(found).to.containEql({
        id: '1',
        actorDetailsId: '1',
        movieId: '1',
      });
    });

    it('Should not add identical actor to the same movie', async () => {
      const actorData = {
        actorDetailsId,
        movieId,
      };
      const response = await client
        .post(`/actors`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(actorData)
        .expect(200);

      const expected = {
        success: false,
        data: null,
        message: 'Actor already exist in the movie',
      };

      expect(response.body).to.containEql(expected);
    });
  });

  context('As User/Guest/Admin', () => {
    it('Should get actors of a movie', async () => {
      const response = await client.get(`/actors/${movieId}`).expect(200);
      const count = response.body.data.length;
      expect(count).to.greaterThan(0);
    });
  });

  async function givenActorRepository() {
    actorRepo = await app.getRepository(ActorRepository);
  }

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }
});
