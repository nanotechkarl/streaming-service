import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Actor, ActorDetails, ActorDetailsRelations} from '../models';
import {ActorRepository} from './actor.repository';

export class ActorDetailsRepository extends DefaultCrudRepository<
  ActorDetails,
  typeof ActorDetails.prototype.id,
  ActorDetailsRelations
> {
  public readonly actor: HasOneRepositoryFactory<
    Actor,
    typeof ActorDetails.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('ActorRepository')
    getActorRepository: Getter<ActorRepository>,
  ) {
    super(ActorDetails, dataSource);
    this.actor = this.createHasOneRepositoryFactoryFor(
      'actor',
      getActorRepository,
    );
  }
}
