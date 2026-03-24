import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  cpf: string;
  role: 'client' | 'admin';
  phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'phone'> {}

export class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare cpf: string;
  declare role: 'client' | 'admin';
  declare phone: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
    role: { type: DataTypes.ENUM('client', 'admin'), defaultValue: 'client', allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'user', timestamps: true }
);
