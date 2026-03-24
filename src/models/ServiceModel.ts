import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';

interface ServiceAttributes {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  vehicleTypes: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceCreationAttributes extends Optional<ServiceAttributes, 'id' | 'active'> {}

export class ServiceModel
  extends Model<ServiceAttributes, ServiceCreationAttributes>
  implements ServiceAttributes
{
  declare id: string;
  declare name: string;
  declare description: string;
  declare price: number;
  declare duration: number;
  declare vehicleTypes: string;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ServiceModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    vehicleTypes: { type: DataTypes.STRING, allowNull: false, defaultValue: 'car' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
  },
  { sequelize, tableName: 'service', timestamps: true }
);
