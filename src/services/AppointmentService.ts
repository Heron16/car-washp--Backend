import { Op } from 'sequelize';
import { AppointmentModel } from '../models/AppointmentModel';
import { ServiceModel } from '../models/ServiceModel';
import { VehicleModel } from '../models/VehicleModel';
import { UserModel } from '../models/UserModel';
import { ServiceStatus, PaginationQuery } from '../types';
import { getPaginationParams, paginate } from '../utils/pagination';

export class AppointmentService {
  async create(userId: string, vehicleId: string, serviceId: string, scheduledAt: Date, notes?: string) {
    const service = await ServiceModel.findByPk(serviceId);
    if (!service) throw new Error('Serviço não encontrado');

    const newEnd = new Date(scheduledAt.getTime() + service.duration * 60000);

    // Busca agendamentos ativos para verificar conflito
    const activeAppointments = await AppointmentModel.findAll({
      where: { status: { [Op.in]: ['pending', 'in_progress'] } },
      include: [{ model: ServiceModel, as: 'service', attributes: ['duration'] }],
    });

    const hasConflict = activeAppointments.some((a) => {
      const existingStart = new Date(a.scheduledAt);
      const svc = (a as any).service;
      const existingEnd = new Date(existingStart.getTime() + svc.duration * 60000);
      return scheduledAt < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) throw new Error('Já existe um agendamento neste horário. Escolha outro horário.');

    return AppointmentModel.create({
      userId,
      vehicleId,
      serviceId,
      scheduledAt,
      notes,
      totalPrice: Number(service.price),
    });
  }

  async findByUser(userId: string, query: PaginationQuery) {
    const { currentPage, pageLimit, skip } = getPaginationParams(query.page, query.limit);
    const { rows: data, count: total } = await AppointmentModel.findAndCountAll({
      where: { userId },
      offset: skip,
      limit: pageLimit,
      include: [
        { model: VehicleModel, as: 'vehicle' },
        { model: ServiceModel, as: 'service' },
      ],
      order: [['scheduledAt', 'DESC']],
    });
    return paginate(data, total, currentPage, pageLimit);
  }

  async findAll(query: PaginationQuery) {
    const { currentPage, pageLimit, skip } = getPaginationParams(query.page, query.limit);
    const { rows: data, count: total } = await AppointmentModel.findAndCountAll({
      offset: skip,
      limit: pageLimit,
      include: [
        { model: UserModel, as: 'user', attributes: ['name', 'email'] },
        { model: VehicleModel, as: 'vehicle' },
        { model: ServiceModel, as: 'service' },
      ],
      order: [['scheduledAt', 'DESC']],
    });
    return paginate(data, total, currentPage, pageLimit);
  }

  async updateStatus(id: string, status: ServiceStatus, isAdmin: boolean, userId: string) {
    const where = isAdmin ? { id } : { id, userId };
    const appointment = await AppointmentModel.findOne({ where });
    if (!appointment) throw new Error('Agendamento não encontrado ou sem permissão');
    await appointment.update({ status });
    return appointment;
  }

  async delete(id: string, userId: string, isAdmin: boolean) {
    const where = isAdmin ? { id } : { id, userId };
    const appointment = await AppointmentModel.findOne({ where });
    if (!appointment) throw new Error('Agendamento não encontrado ou sem permissão');
    await appointment.destroy();
  }
}
