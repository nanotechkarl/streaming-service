import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import {StreamingServiceApplication} from '../../application';
import {ActorDetailsRepository, UserRepository} from '../../repositories';
import {
  createAdmin,
  givenActor,
  givenRunningApplicationWithCustomConfiguration,
  login,
} from '../helpers';

describe('ActorDetailsController', () => {
  let app: StreamingServiceApplication;
  let client: Client;
  let userRepo: UserRepository;
  let actorDetailsRepo: ActorDetailsRepository;
  let adminToken = '';

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(givenUserRepository);
  before(givenActorDetailsRepository);

  before(() => {
    client = createRestAppClient(app);
  });

  context('As Admin', () => {
    before(async () => {
      await createAdmin(client, userRepo);
      adminToken = await login(client, 'admin');
    });

    it('Should create an actor', async () => {
      const actorData = givenActor();
      const response = await client
        .post(`/actor-details`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(actorData)
        .expect(200);

      actorData.id = '1';
      const expected = {
        ...actorData,
      };
      expect(response.body.data).to.containEql(expected);

      const created = await actorDetailsRepo.findById(response.body.data.id);
      expect(toJSON(created)).to.deepEqual({
        ...expected,
      });
    });

    it('Should create multiple Actors', async () => {
      const actorData = givenActor({firstName: 'Victor'});
      await client
        .post(`/actor-details`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(actorData)
        .expect(200);

      const foundActors = await actorDetailsRepo.find();
      expect(foundActors.length).to.equal(2);
    });

    it('Should not create identical actor', async () => {
      const actorData = givenActor({firstName: 'Victor'});
      const response = await client
        .post(`/actor-details`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(actorData)
        .expect(200);

      const expected = {
        success: false,
        data: null,
        message: 'Actor already exists',
      };

      expect(response.body).to.containEql(expected);
    });

    it('Should update details of actor', async () => {
      const idEdit = 1;
      const response = await client
        .patch(`/actor-details/${idEdit}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send({
          age: 32,
          lastName: 'magtangol',
        })
        .expect(200);
      const expected = {
        age: 32,
        lastName: 'magtangol',
      };

      expect(response.body.data).to.containEql(expected);
    });
  });

  context('As User/Guest/Admin', () => {
    it('Should get Actors', async () => {
      const response = await client.get('/actor-details').expect(200);
      const count = response.body.data.length;
      expect(count).to.equal(2);
    });
  });

  async function givenActorDetailsRepository() {
    actorDetailsRepo = await app.getRepository(ActorDetailsRepository);
  }

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }
});
