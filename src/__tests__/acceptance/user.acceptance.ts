import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import _ from 'lodash';
import {StreamingServiceApplication} from '../../application';
import {UserRepository} from '../../repositories';
import {
  createAdmin,
  createCustomUser,
  givenRootAdmin,
  givenRunningApplicationWithCustomConfiguration,
  givenUser,
  login,
} from '../helpers';

describe('UserController', () => {
  let app: StreamingServiceApplication;
  let client: Client;
  let userRepo: UserRepository;
  let adminToken = '';

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(givenUserRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  context('As admin', () => {
    it('Should creates root admin on first signup', async () => {
      const userData = givenRootAdmin();
      const response = await createAdmin(client, userRepo);

      userData.permissions = ['root', 'admin'];
      userData.approved = true;
      userData.id = '1';
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

    it('Should login as root admin', async () => {
      adminToken = await login(client, 'admin');
      expect(adminToken).to.be.not.null();
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

    it('Should get all users', async () => {
      await createCustomUser(client, 'test1@test.com');

      const response = await client
        .get(`/users`)
        .set({Authorization: `Bearer ${adminToken}`})
        .expect(200);
      expect(response.body.data.length).to.be.greaterThanOrEqual(2);
    });

    it('Should edit an existing user', async () => {
      const id = '2';
      const userData = {
        firstName: 'sample',
        lastName: 'test',
      };

      const response = await client
        .patch(`/users/${id}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(userData)
        .expect(200);
      const expected = {
        message: 'Succesfully updated user',
      };
      expect(response.body.message).to.equal(expected.message);
    });

    it('Should approve an existing user', async () => {
      const id = '2';
      const userData = {
        approved: true,
      };

      const response = await client
        .patch(`/users/approval/${id}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(userData)
        .expect(200);
      const expected = {
        message: 'Succesfully approved account',
      };
      expect(response.body.message).to.equal(expected.message);

      const find = await userRepo.findById('2');
      expect(find.approved).to.be.true();
    });

    it('Should delete an existing user', async () => {
      const id = '2';
      const response = await client
        .delete(`/users/${id}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .expect(200);
      const expected = {
        message: 'Successfully deleted user',
      };
      expect(response.body.message).to.equal(expected.message);

      const findDeleted = await userRepo.find({where: {id: '2'}});
      expect(findDeleted).to.be.empty();
    });
  });

  context('As User', () => {
    before(async () => {
      await userRepo.deleteAll();
      await createAdmin(client, userRepo);
    });

    it('Should create a user that is not approved', async () => {
      const userData = givenUser();
      const response = await client
        .post(`/users/register`)
        .send(userData)
        .expect(200);

      userData.permissions = ['user'];
      userData.approved = false;
      userData.id = '4';
      const data = _.omit(userData, ['password']);
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

    it('Should not create a user that already exists', async () => {
      const userData = givenUser();
      const response = await client
        .post(`/users/register`)
        .send(userData)
        .expect(200);

      expect(response.body.message).to.be.equal('User already exist');
    });

    it('Should have no access to get all users', async () => {
      const id = '1';
      await client.get(`/users`).expect(401);
      await client.get(`/users/${id}`).expect(401);
      await client.patch(`/users/approval/${id}`).expect(401);
      await client.delete(`/users/${id}`).expect(401);
      await client.patch(`/users/${id}`).expect(401);
    });
  });

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }
});
