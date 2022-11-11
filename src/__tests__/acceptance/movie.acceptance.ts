import {Client, createRestAppClient, expect, toJSON} from '@loopback/testlab';
import {StreamingServiceApplication} from '../../application';
import {MovieRepository, UserRepository} from '../../repositories';
import {
  createAdmin,
  givenMovie,
  givenRunningApplicationWithCustomConfiguration,
  login,
} from '../helpers';

describe('MovieController', () => {
  let app: StreamingServiceApplication;
  let client: Client;
  let movieRepo: MovieRepository;
  let userRepo: UserRepository;
  let adminToken = '';

  before(async () => {
    app = await givenRunningApplicationWithCustomConfiguration();
  });
  after(() => app.stop());

  before(givenUserRepository);
  before(givenMovieRepository);
  before(() => {
    client = createRestAppClient(app);
  });

  context('As Admin', () => {
    it('Should create movie', async () => {
      await createAdmin(client, userRepo);
      adminToken = await login(client, 'admin');

      const movieData = givenMovie();
      const response = await client
        .post(`/movies`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(movieData)
        .expect(200);

      movieData.id = '1';
      const expected = {
        ...movieData,
      };
      expect(response.body.data).to.containEql(expected);
      const created = await movieRepo.findById(response.body.data.id);
      expect(toJSON(created)).to.deepEqual({
        ...expected,
      });
    });

    it('Should create multiple movies', async () => {
      const movieData = givenMovie({title: 'sample2'});
      await client
        .post(`/movies`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send(movieData)
        .expect(200);

      const foundMovies = await movieRepo.find();
      expect(foundMovies.length).to.equal(2);
    });

    it('Should update a movie', async () => {
      const idEdit = 1;
      const response = await client
        .patch(`/movies/${idEdit}`)
        .set({Authorization: `Bearer ${adminToken}`})
        .send({
          imgUrl: 'edited imageURL',
        })
        .expect(200);
      const expected = {
        imgUrl: 'edited imageURL',
      };

      expect(response.body.data).to.containEql(expected);
    });
  });

  context('As User/Guest/Admin', () => {
    it('Should get movies', async () => {
      const response = await client.get('/movies').expect(200);
      const count = response.body.data.length;
      expect(count).to.equal(2);
    });

    it('Should search movies and get a result', async () => {
      const keyword = 's';
      const response = await client
        .get(`/movies/search/movie/${keyword}`)
        .expect(200);
      const count = response.body.data.length;
      expect(count).to.greaterThan(0);
    });
  });

  async function givenMovieRepository() {
    movieRepo = await app.getRepository(MovieRepository);
  }

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }
});
