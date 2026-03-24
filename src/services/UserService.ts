import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { UserModel } from '../models/UserModel';
import { validateCPF, validateEmail, validatePasswordStrength } from '../utils/validators';
import { getPaginationParams, paginate } from '../utils/pagination';
import { PaginationQuery, UserUpdateData } from '../types';

export class UserService {
  async create(name: string, email: string, password: string, cpf: string) {
    this.validateCreateFields(email, password, cpf);

    const exists = await UserModel.findOne({ where: { [Op.or]: [{ email }, { cpf }] } });
    if (exists) throw new Error('E-mail ou CPF já cadastrado');

    const hashed = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, password: hashed, cpf });
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async update(userId: string, requesterId: string, data: UserUpdateData) {
    if (userId !== requesterId) throw new Error('Sem permissão para editar este usuário');
    this.validateUpdateFields(data);

    const updateData = await this.buildUpdateData(data);
    await UserModel.update(updateData, { where: { id: userId } });

    const updated = await UserModel.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'cpf', 'phone', 'role'],
    });
    return updated;
  }

  async findAll(query: PaginationQuery) {
    const { currentPage, pageLimit, skip } = getPaginationParams(query.page, query.limit);
    const { rows: data, count: total } = await UserModel.findAndCountAll({
      attributes: ['id', 'name', 'email', 'cpf', 'role', 'phone', 'createdAt'],
      offset: skip,
      limit: pageLimit,
      order: [['createdAt', 'DESC']],
    });
    return paginate(data, total, currentPage, pageLimit);
  }

  async findById(id: string) {
    const user = await UserModel.findByPk(id, {
      attributes: ['id', 'name', 'email', 'cpf', 'phone', 'role'],
    });
    if (!user) throw new Error('Usuário não encontrado');
    return user;
  }

  async delete(id: string) {
    const user = await UserModel.findByPk(id);
    if (!user) throw new Error('Usuário não encontrado');
    await user.destroy();
  }

  private validateCreateFields(email: string, password: string, cpf: string) {
    if (!validateEmail(email)) throw new Error('E-mail inválido');
    if (!validateCPF(cpf)) throw new Error('CPF inválido');
    if (!validatePasswordStrength(password))
      throw new Error('Senha fraca: mínimo 8 chars, maiúscula, minúscula, número e especial');
  }

  private validateUpdateFields(data: UserUpdateData) {
    if (data.cpf && !validateCPF(data.cpf)) throw new Error('CPF inválido');
    if (data.password && !validatePasswordStrength(data.password))
      throw new Error('Senha fraca: mínimo 8 chars, maiúscula, minúscula, número e especial');
  }

  private async buildUpdateData(data: UserUpdateData): Promise<Record<string, string>> {
    const result: Record<string, string> = { name: data.name };
    if (data.cpf) result.cpf = data.cpf;
    if (data.phone) result.phone = data.phone;
    if (data.password) result.password = await bcrypt.hash(data.password, 12);
    return result;
  }
}
