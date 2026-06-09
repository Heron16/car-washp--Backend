import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/sequelize';

interface AtributosUsuario {
  id: string;
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  perfil: 'cliente' | 'admin';
  telefone?: string | null;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface AtributosCriacaoUsuario extends Optional<AtributosUsuario, 'id' | 'perfil' | 'telefone'> {}

export class UserModel
  extends Model<AtributosUsuario, AtributosCriacaoUsuario>
  implements AtributosUsuario
{
  declare id: string;
  declare nome: string;
  declare email: string;
  declare senha: string;
  declare cpf: string;
  declare perfil: 'cliente' | 'admin';
  declare telefone: string | null;
  declare readonly criadoEm: Date;
  declare readonly atualizadoEm: Date;
}

UserModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    senha: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
    perfil: { type: DataTypes.ENUM('cliente', 'admin'), defaultValue: 'cliente', allowNull: false },
    telefone: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    tableName: 'usuario',
    timestamps: true,
    createdAt: 'criadoEm',
    updatedAt: 'atualizadoEm',
  }
);
