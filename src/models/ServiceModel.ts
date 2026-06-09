import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';

interface AtributosServico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  tiposVeiculo: string;
  ativo: boolean;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface AtributosCriacaoServico extends Optional<AtributosServico, 'id' | 'ativo'> {}

export class ServiceModel
  extends Model<AtributosServico, AtributosCriacaoServico>
  implements AtributosServico
{
  declare id: string;
  declare nome: string;
  declare descricao: string;
  declare preco: number;
  declare duracao: number;
  declare tiposVeiculo: string;
  declare ativo: boolean;
  declare readonly criadoEm: Date;
  declare readonly atualizadoEm: Date;
}

ServiceModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    duracao: { type: DataTypes.INTEGER, allowNull: false },
    tiposVeiculo: { type: DataTypes.STRING, allowNull: false, defaultValue: 'carro' },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
  },
  {
    sequelize,
    tableName: 'servico',
    timestamps: true,
    createdAt: 'criadoEm',
    updatedAt: 'atualizadoEm',
  }
);
