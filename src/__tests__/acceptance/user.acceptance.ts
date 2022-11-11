import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import _ from 'lodash';
import {StreamingServiceApplication} from '../../application';
import {ReviewRepository, UserRepository} from '../../repositories';
import {
  createAdmin,
  givenRunningApplicationWithCustomConfiguration,
  givenUser,
  login,
} from '../helpers';

describe('UserController', () => {
  let app: StreamingServiceApplication;
  let client: Client;
  let userRepo: UserRepository;
  let reviewRepo: ReviewRepository;
  let adminToken = '';
  // let token: '';

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(givenUserRepository);
  before(givenReviewRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  beforeEach(async () => {
    await reviewRepo.deleteAll();
  });

  describe('As admin', () => {
    it('Should creates root admin on first signup', async () => {
      await createAdmin(client, userRepo);
    });

    it('Should login as root admin', async () => {
      adminToken = await login(client, 'admin');
    });

    it('Should get logged in details and test token if working', async () => {
      const response = await client
        .get(`/users/me`)
        .set({Authorization: `Bearer ${adminToken}`})
        .expect(200);

      const expected = {
        success: true,
        data: {
          id: '1',
          name: 'root administrator',
          permissions: ['root', 'admin'],
        },
        message: 'Successfully fetched account',
      };

      expect(response.body).to.containEql(expected);
    });
  });

  describe('As User', () => {
    it('Should create a user that is not approved', async () => {
      const userData = givenUser();
      const response = await client
        .post(`/users/register`)
        .send(userData)
        .expect(200);

      userData.permissions = ['user'];
      userData.approved = false;
      userData.id = '2';
      const data = _.omit(userData, 'password');
      const expected = {
        success: true,
        message: 'Successfully registered',
        data,
      };

      expect(response.body).to.containEql(expected);
      const created = await userRepo.findById(response.body.data.id, {
        fields: {password: false},
      });

      expect(toJSON(created)).to.deepEqual({
        ...expected.data,
      });
    });
  });

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }

  async function givenReviewRepository() {
    reviewRepo = await app.getRepository(ReviewRepository);
  }
});
