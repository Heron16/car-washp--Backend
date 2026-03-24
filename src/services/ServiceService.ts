import { ServiceModel } from '../models/ServiceModel';
import { VehicleType, PaginationQuery } from '../types';
import { getPaginationParams, paginate } from '../utils/pagination';

export class ServiceService {
  async create(name: string, description: string, price: number, duration: number, vehicleTypes: VehicleType[]) {
    if (!name || !description) throw new Error('Nome e descrição são obrigatórios');
    if (price <= 0) throw new Error('Preço deve ser maior que zero');
    if (duration <= 0) throw new Error('Duração deve ser maior que zero');

    const service = await ServiceModel.create({
      name,
      description,
      price,
      duration,
      vehicleTypes: vehicleTypes.join(','),
    });
    return this.formatService(service);
  }

  async findAll(query: PaginationQuery) {
    const { currentPage, pageLimit, skip } = getPaginationParams(query.page, query.limit);
    const { rows, count: total } = await ServiceModel.findAndCountAll({
      where: { active: true },
      offset: skip,
      limit: pageLimit,
      order: [['createdAt', 'DESC']],
    });
    return paginate(rows.map(this.formatService), total, currentPage, pageLimit);
  }

  async findAllAdmin(query: PaginationQuery) {
    const { currentPage, pageLimit, skip } = getPaginationParams(query.page, query.limit);
    const { rows, count: total } = await ServiceModel.findAndCountAll({
      offset: skip,
      limit: pageLimit,
      order: [['createdAt', 'DESC']],
    });
    return paginate(rows.map(this.formatService), total, currentPage, pageLimit);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      duration: number;
      vehicleTypes: VehicleType[];
      active: boolean;
    }>
  ) {
    const service = await ServiceModel.findByPk(id);
    if (!service) throw new Error('Serviço não encontrado');

    const updateData: Record<string, unknown> = { ...data };
    if (data.vehicleTypes) updateData.vehicleTypes = data.vehicleTypes.join(',');

    await service.update(updateData);
    return this.formatService(service);
  }

  async delete(id: string) {
    const service = await ServiceModel.findByPk(id);
    if (!service) throw new Error('Serviço não encontrado');
    await service.destroy();
  }

  private formatService(s: ServiceModel) {
    const plain = s.toJSON() as unknown as {
      id: string; name: string; description: string; price: number;
      duration: number; vehicleTypes: string; active: boolean;
      createdAt: Date; updatedAt: Date;
    };
    return { ...plain, vehicleTypes: plain.vehicleTypes.split(',') as VehicleType[] };
  }
}
