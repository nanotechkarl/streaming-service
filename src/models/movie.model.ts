import {Entity, hasMany, model, property} from '@loopback/repository';
import {Actor} from './actor.model';
import {Review} from './review.model';

@model()
export class Movie extends Entity {
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
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  imgUrl: string;

  @property({
    type: 'number',
    required: true,
  })
  cost: number;

  @property({
    type: 'date',
    required: true,
  })
  yearRelease: string;

  @hasMany(() => Actor, {keyTo: 'movieId'})
  actors: Actor[];

  @hasMany(() => Review, {keyTo: 'movieId'})
  reviews: Review[];

  constructor(data?: Partial<Movie>) {
    super(data);
  }
}

export interface MovieRelations {
  // describe navigational properties here
}

export type MovieWithRelations = Movie & MovieRelations;
