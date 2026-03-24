import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';
import { UserModel } from './UserModel';

interface VehicleAttributes {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  type: 'car' | 'motorcycle' | 'truck' | 'suv';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id'> {}

export class VehicleModel
  extends Model<VehicleAttributes, VehicleCreationAttributes>
  implements VehicleAttributes
{
  declare id: string;
  declare userId: string;
  declare brand: string;
  declare model: string;
  declare year: number;
  declare plate: string;
  declare color: string;
  declare type: 'car' | 'motorcycle' | 'truck' | 'suv';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

VehicleModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    brand: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    plate: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    color: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM('car', 'motorcycle', 'truck', 'suv'),
      defaultValue: 'car',
      allowNull: false,
    },
  },
  { sequelize, tableName: 'vehicle', timestamps: true }
);

// Associations
VehicleModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
UserModel.hasMany(VehicleModel, { foreignKey: 'userId', as: 'vehicles' });
