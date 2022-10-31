import {belongsTo, Entity, model, property} from '@loopback/repository';
import {ActorDetails} from './actor-details.model';
import {Movie} from './movie.model';

@model()
export class Actor extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id?: string;

  @belongsTo(() => ActorDetails)
  actorDetailsId: string;

  @belongsTo(() => Movie)
  movieId: string;

  constructor(data?: Partial<Actor>) {
    super(data);
  }
}

export interface ActorRelations {
  // describe navigational properties here
}

export type ActorWithRelations = Actor & ActorRelations;
