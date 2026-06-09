import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';
import { UserModel } from './UserModel';
import { VehicleModel } from './VehicleModel';
import { ServiceModel } from './ServiceModel';

interface AtributosAgendamento {
  id: string;
  usuarioId: string;
  veiculoId: string;
  servicoId: string;
  agendadoPara: Date;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  observacoes?: string | null;
  precoTotal: number;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface AtributosCriacaoAgendamento
  extends Optional<AtributosAgendamento, 'id' | 'status' | 'observacoes'> {}

export class AppointmentModel
  extends Model<AtributosAgendamento, AtributosCriacaoAgendamento>
  implements AtributosAgendamento
{
  declare id: string;
  declare usuarioId: string;
  declare veiculoId: string;
  declare servicoId: string;
  declare agendadoPara: Date;
  declare status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  declare observacoes: string | null;
  declare precoTotal: number;
  declare readonly criadoEm: Date;
  declare readonly atualizadoEm: Date;
}

AppointmentModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuarioId: { type: DataTypes.UUID, allowNull: false },
    veiculoId: { type: DataTypes.UUID, allowNull: false },
    servicoId: { type: DataTypes.UUID, allowNull: false },
    agendadoPara: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM('pendente', 'em_andamento', 'concluido', 'cancelado'),
      defaultValue: 'pendente',
      allowNull: false,
    },
    observacoes: { type: DataTypes.STRING, allowNull: true },
    precoTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    sequelize,
    tableName: 'agendamento',
    timestamps: true,
    createdAt: 'criadoEm',
    updatedAt: 'atualizadoEm',
  }
);

AppointmentModel.belongsTo(UserModel, { foreignKey: 'usuarioId', as: 'usuario', onDelete: 'CASCADE' });
AppointmentModel.belongsTo(VehicleModel, { foreignKey: 'veiculoId', as: 'veiculo', onDelete: 'CASCADE' });
AppointmentModel.belongsTo(ServiceModel, { foreignKey: 'servicoId', as: 'servico', onDelete: 'CASCADE' });

UserModel.hasMany(AppointmentModel, { foreignKey: 'usuarioId', as: 'agendamentos' });
VehicleModel.hasMany(AppointmentModel, { foreignKey: 'veiculoId', as: 'agendamentosVeiculo' });
ServiceModel.hasMany(AppointmentModel, { foreignKey: 'servicoId', as: 'agendamentosServico' });
