import { VehicleModel } from '../models/VehicleModel';
import { UserModel } from '../models/UserModel';
import { VehicleType, PaginationQuery } from '../types';
import { getPaginationParams, paginate } from '../utils/pagination';

export class VehicleService {
  async create(userId: string, brand: string, model: string, year: number, plate: string, color: string, type: VehicleType) {
    if (!brand || !model || !plate || !color) throw new Error('Todos os campos são obrigatórios');

    const exists = await VehicleModel.findOne({ where: { plate: plate.toUpperCase() } });
    if (exists) throw new Error('Placa já cadastrada');

    return VehicleModel.create({ userId, brand, model, year, plate: plate.toUpperCase(), color, type });
  }

  async findByUser(userId: string, query: PaginationQuery) {
    const { currentPage, pageLimit, skip } = getPaginationParams(query.page, query.limit);
    const { rows: data, count: total } = await VehicleModel.findAndCountAll({
      where: { userId },
      offset: skip,
      limit: pageLimit,
      order: [['createdAt', 'DESC']],
    });
    return paginate(data, total, currentPage, pageLimit);
  }

  async findAll(query: PaginationQuery) {
    const { currentPage, pageLimit, skip } = getPaginationParams(query.page, query.limit);
    const { rows: data, count: total } = await VehicleModel.findAndCountAll({
      offset: skip,
      limit: pageLimit,
      include: [{ model: UserModel, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    return paginate(data, total, currentPage, pageLimit);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{ brand: string; model: string; year: number; color: string; type: VehicleType }>
  ) {
    const vehicle = await VehicleModel.findOne({ where: { id, userId } });
    if (!vehicle) throw new Error('Veículo não encontrado ou sem permissão');
    await vehicle.update(data);
    return vehicle;
  }

  async delete(id: string, userId: string, isAdmin: boolean) {
    const where = isAdmin ? { id } : { id, userId };
    const vehicle = await VehicleModel.findOne({ where });
    if (!vehicle) throw new Error('Veículo não encontrado ou sem permissão');
    await vehicle.destroy();
  }
}
