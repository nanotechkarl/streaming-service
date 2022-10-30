import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Movie} from './movie.model';
import {User} from './user.model';

@model()
export class Review extends Entity {
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id?: string;

  @property({
    type: 'string',
  })
  message: string;

  @property({
    type: 'number',
    default: 0,
  })
  rating?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  approved?: boolean;

  @belongsTo(() => Movie)
  movieId: string;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<Review>) {
    super(data);
  }
}

export interface ReviewRelations {
  // describe navigational properties here
}

export type ReviewWithRelations = Review & ReviewRelations;
