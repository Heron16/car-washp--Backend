import { AppointmentService } from '../services/AppointmentService';

const mockDestroy = jest.fn();
const mockAptUpdate = jest.fn();

jest.mock('../models/ServiceModel', () => ({
  ServiceModel: { findByPk: jest.fn() },
}));
jest.mock('../models/AppointmentModel', () => ({
  AppointmentModel: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../models/VehicleModel', () => ({ VehicleModel: {} }));
jest.mock('../models/UserModel', () => ({ UserModel: {} }));

import { ServiceModel } from '../models/ServiceModel';
import { AppointmentModel } from '../models/AppointmentModel';

const mockServiceFindByPk = ServiceModel.findByPk as jest.Mock;
const mockAptFindAll = AppointmentModel.findAll as jest.Mock;
const mockAptFindOne = AppointmentModel.findOne as jest.Mock;
const mockAptCreate = AppointmentModel.create as jest.Mock;

const fakeService = { id: 'svc-1', price: 80, duration: 60 };
const scheduledAt = new Date('2026-04-01T10:00:00Z');

describe('AppointmentService', () => {
  const service = new AppointmentService();

  describe('create', () => {
    it('deve lançar erro se serviço não encontrado', async () => {
      mockServiceFindByPk.mockResolvedValue(null);
      await expect(service.create('user-1', 'veh-1', 'svc-x', scheduledAt)).rejects.toThrow('Serviço não encontrado');
    });

    it('deve lançar erro se houver conflito de horário', async () => {
      mockServiceFindByPk.mockResolvedValue(fakeService);
      mockAptFindAll.mockResolvedValue([
        {
          scheduledAt: new Date('2026-04-01T09:30:00Z'),
          service: { duration: 60 },
        },
      ]);
      await expect(service.create('user-1', 'veh-1', 'svc-1', scheduledAt)).rejects.toThrow('Já existe um agendamento neste horário');
    });

    it('deve criar agendamento sem conflito', async () => {
      mockServiceFindByPk.mockResolvedValue(fakeService);
      mockAptFindAll.mockResolvedValue([]);
      mockAptCreate.mockResolvedValue({ id: 'apt-1', status: 'pending', totalPrice: 80 });
      const result = await service.create('user-1', 'veh-1', 'svc-1', scheduledAt);
      expect(result.id).toBe('apt-1');
    });
  });

  describe('updateStatus', () => {
    it('deve lançar erro se agendamento não encontrado', async () => {
      mockAptFindOne.mockResolvedValue(null);
      await expect(service.updateStatus('apt-1', 'cancelled', false, 'user-1')).rejects.toThrow('Agendamento não encontrado ou sem permissão');
    });

    it('deve atualizar status com sucesso', async () => {
      mockAptUpdate.mockResolvedValue(undefined);
      mockAptFindOne.mockResolvedValue({ id: 'apt-1', status: 'pending', update: mockAptUpdate });
      const result = await service.updateStatus('apt-1', 'cancelled', false, 'user-1');
      expect(result).toBeTruthy();
    });
  });

  describe('delete', () => {
    it('deve lançar erro se agendamento não encontrado', async () => {
      mockAptFindOne.mockResolvedValue(null);
      await expect(service.delete('apt-1', 'user-1', false)).rejects.toThrow('Agendamento não encontrado ou sem permissão');
    });

    it('admin pode deletar qualquer agendamento', async () => {
      mockAptFindOne.mockResolvedValue({ id: 'apt-1', destroy: mockDestroy });
      mockDestroy.mockResolvedValue(undefined);
      await expect(service.delete('apt-1', 'qualquer', true)).resolves.not.toThrow();
    });
  });
});
