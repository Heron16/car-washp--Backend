import { VehicleService } from '../services/VehicleService';

const mockDestroy = jest.fn();
const mockVehicleUpdate = jest.fn();

jest.mock('../models/VehicleModel', () => ({
  VehicleModel: {
    findOne: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('../models/UserModel', () => ({ UserModel: {} }));

import { VehicleModel } from '../models/VehicleModel';

const mockFindOne = VehicleModel.findOne as jest.Mock;
const mockCreate = VehicleModel.create as jest.Mock;
const mockFindAndCountAll = VehicleModel.findAndCountAll as jest.Mock;

const fakeVehicle = {
  id: 'veh-1', userId: 'user-1', brand: 'Toyota', model: 'Corolla',
  year: 2022, plate: 'ABC1234', color: 'Prata', type: 'car',
  destroy: mockDestroy,
  update: mockVehicleUpdate,
};

describe('VehicleService', () => {
  const service = new VehicleService();

  describe('create', () => {
    it('deve lançar erro se campos obrigatórios ausentes', async () => {
      await expect(service.create('user-1', '', 'Corolla', 2022, 'ABC1234', 'Prata', 'car')).rejects.toThrow('Todos os campos são obrigatórios');
    });

    it('deve lançar erro se placa já cadastrada', async () => {
      mockFindOne.mockResolvedValue(fakeVehicle);
      await expect(service.create('user-1', 'Toyota', 'Corolla', 2022, 'ABC1234', 'Prata', 'car')).rejects.toThrow('Placa já cadastrada');
    });

    it('deve criar veículo com sucesso', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(fakeVehicle);
      const result = await service.create('user-1', 'Toyota', 'Corolla', 2022, 'ABC1234', 'Prata', 'car');
      expect(result.plate).toBe('ABC1234');
    });
  });

  describe('delete', () => {
    it('deve lançar erro se veículo não encontrado', async () => {
      mockFindOne.mockResolvedValue(null);
      await expect(service.delete('veh-1', 'user-2', false)).rejects.toThrow('Veículo não encontrado ou sem permissão');
    });

    it('admin pode deletar qualquer veículo', async () => {
      mockFindOne.mockResolvedValue(fakeVehicle);
      mockDestroy.mockResolvedValue(undefined);
      await expect(service.delete('veh-1', 'qualquer', true)).resolves.not.toThrow();
    });
  });

  describe('update', () => {
    it('deve lançar erro se veículo não pertence ao usuário', async () => {
      mockFindOne.mockResolvedValue(null);
      await expect(service.update('veh-1', 'user-2', { color: 'Azul' })).rejects.toThrow('Veículo não encontrado ou sem permissão');
    });

    it('deve atualizar veículo com sucesso', async () => {
      mockVehicleUpdate.mockResolvedValue({ ...fakeVehicle, color: 'Azul' });
      mockFindOne.mockResolvedValue(fakeVehicle);
      const result = await service.update('veh-1', 'user-1', { color: 'Azul' });
      expect(result).toBeTruthy();
    });
  });
});
