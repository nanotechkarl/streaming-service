import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Review, User, UserRelations} from '../models';
import {ReviewRepository} from './review.repository';

export type Credentials = {
  email: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly review: HasOneRepositoryFactory<
    Review,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ReviewRepository')
    getReviewRepository: Getter<ReviewRepository>,
  ) {
    super(User, dataSource);
    this.review = this.createHasOneRepositoryFactoryFor(
      'review',
      getReviewRepository,
    );

    this.registerInclusionResolver('review', this.review.inclusionResolver);
  }
}
