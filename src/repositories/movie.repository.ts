import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Actor, Movie, MovieRelations, Review} from '../models';
import {ActorRepository} from './actor.repository';
import {ReviewRepository} from './review.repository';

export class MovieRepository extends DefaultCrudRepository<
  Movie,
  typeof Movie.prototype.id,
  MovieRelations
> {
  public readonly actors: HasManyRepositoryFactory<
    Actor,
    typeof Movie.prototype.id
  >;

  public readonly reviews: HasManyRepositoryFactory<
    Review,
    typeof Movie.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ActorRepository')
    actorRepositoryGetter: Getter<ActorRepository>,
    @repository.getter('ReviewRepository')
    reviewRepositoryGetter: Getter<ReviewRepository>,
  ) {
    super(Movie, dataSource);
    this.actors = this.createHasManyRepositoryFactoryFor(
      'actors',
      actorRepositoryGetter,
    );

    this.reviews = this.createHasManyRepositoryFactoryFor(
      'reviews',
      reviewRepositoryGetter,
    );

    this.registerInclusionResolver('actors', this.actors.inclusionResolver);
    this.registerInclusionResolver('reviews', this.reviews.inclusionResolver);
  }
}
