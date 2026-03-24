import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';
import { UserModel } from './UserModel';
import { VehicleModel } from './VehicleModel';
import { ServiceModel } from './ServiceModel';

interface AppointmentAttributes {
  id: string;
  userId: string;
  vehicleId: string;
  serviceId: string;
  scheduledAt: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string | null;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AppointmentCreationAttributes
  extends Optional<AppointmentAttributes, 'id' | 'status' | 'notes'> {}

export class AppointmentModel
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  declare id: string;
  declare userId: string;
  declare vehicleId: string;
  declare serviceId: string;
  declare scheduledAt: Date;
  declare status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  declare notes: string | null;
  declare totalPrice: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

AppointmentModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    vehicleId: { type: DataTypes.UUID, allowNull: false },
    serviceId: { type: DataTypes.UUID, allowNull: false },
    scheduledAt: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    notes: { type: DataTypes.STRING, allowNull: true },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { sequelize, tableName: 'appointment', timestamps: true }
);

// Associations
AppointmentModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
AppointmentModel.belongsTo(VehicleModel, { foreignKey: 'vehicleId', as: 'vehicle', onDelete: 'CASCADE' });
AppointmentModel.belongsTo(ServiceModel, { foreignKey: 'serviceId', as: 'service', onDelete: 'CASCADE' });

UserModel.hasMany(AppointmentModel, { foreignKey: 'userId', as: 'appointments' });
VehicleModel.hasMany(AppointmentModel, { foreignKey: 'vehicleId', as: 'vehicleAppointments' });
ServiceModel.hasMany(AppointmentModel, { foreignKey: 'serviceId', as: 'serviceAppointments' });
