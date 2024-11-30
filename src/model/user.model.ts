import { Column, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: false,
})
export class User extends Model {
  @Column({
    primaryKey: true,
    autoIncrement: false,
  })
  id: string;

  @Column({
    unique: true,
  })
  username: string;

  @Column
  name: string;

  @Column
  password: string;

  @Column
  image: string;

  @Column({
    defaultValue: 0,
  })
  score: number;
}
