import {Client, createRestAppClient, expect} from '@loopback/testlab';
import {StreamingServiceApplication} from '../../application';
import {ReviewRepository, UserRepository} from '../../repositories';
import {
  approveUser,
  createAdmin,
  createMovie,
  createUser,
  givenReview,
  givenRunningApplicationWithCustomConfiguration,
  login,
} from '../helpers';

describe('ReviewController', () => {
  let app: StreamingServiceApplication;
  let client: Client;
  let userRepo: UserRepository;
  let reviewRepo: ReviewRepository;
  let adminToken = '';
  let token = '';
  let userId = '';
  let movieId = '';

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(givenUserRepository);
  before(givenReviewRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  context('As User', () => {
    before(async () => {
      await createAdmin(client, userRepo);
      adminToken = await login(client, 'admin');
      userId = await createUser(client);
      await approveUser(client, adminToken, userId);
      token = await login(client, 'user');
      movieId = await createMovie(client, adminToken);
    });

    it('Should add a review to a movie', async () => {
      const reviewData = givenReview();
      const response = await client
        .put(`/reviews`)
        .set({Authorization: `Bearer ${token}`})
        .send(reviewData)
        .expect(200);

      expect(response.body.message).to.containEql(
        'Succesfully added/updated review',
      );
    });

    it('Should edit a review of a movie if existing', async () => {
      const reviewData = givenReview({
        message: 'hi',
        rating: 4,
      });
      const response = await client
        .put(`/reviews`)
        .set({Authorization: `Bearer ${token}`})
        .send(reviewData)
        .expect(200);

      expect(response.body.message).to.containEql(
        'Succesfully added/updated review',
      );

      const findEdited = await reviewRepo.findById('1');
      expect(findEdited.message).to.containEql('hi');
      expect(findEdited.rating).equal(4);
    });

    it('Should get pending reviews as admin', async () => {
      const response = await client
        .get(`/reviews/pending`)
        .set({Authorization: `Bearer ${adminToken}`})
        .expect(200);

      expect(response.body.data.length).to.greaterThan(0);
    });

    it('Should approve a review of a movie as admin', async () => {
      const reviewData = {
        approved: true,
      };
      const response = await client
        .patch(`/reviews/${movieId}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(reviewData)
        .expect(200);

      expect(response.body.message).to.containEql('Succesfully updated review');
    });

    it('Should get reviews of a userId', async () => {
      const response = await client
        .get(`/reviews/${userId}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .expect(200);

      expect(response.body.data.length).to.greaterThan(0);
    });

    it('Should get reviews of a movie(Approved)', async () => {
      const response = await client
        .get(`/reviews/movie/${movieId}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .expect(200);

      expect(response.body.data.length).to.be.greaterThan(0);
    });

    it('Should delete review', async () => {
      const response = await client
        .delete(`/reviews/1`)
        .set({Authorization: `Bearer ${token}`})
        .expect(200);

      expect(response.body.message).to.containEql('Succesfully deleted review');
      const findDeleted = await reviewRepo.find({where: {id: '1'}});
      expect(findDeleted.length).to.be.equal(0);
    });
  });

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }

  async function givenReviewRepository() {
    reviewRepo = await app.getRepository(ReviewRepository);
  }
});
