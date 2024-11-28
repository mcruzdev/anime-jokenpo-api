import { Column, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model {
  @Column
  username: string;

  @Column
  name: string;

  @Column
  password: string;

  @Column
  image: string;
}
