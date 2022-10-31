import {Entity, hasOne, model, property} from '@loopback/repository';
import {Actor} from './actor.model';

@model()
export class ActorDetails extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
    required: true,
  })
  gender: string;

  @property({
    type: 'number',
    required: true,
  })
  age: number;

  @hasOne(() => Actor)
  actor?: Actor;

  constructor(data?: Partial<ActorDetails>) {
    super(data);
  }
}

export interface ActorDetailsRelations {
  // describe navigational properties here
}

export type ActorDetailsWithRelations = ActorDetails & ActorDetailsRelations;
