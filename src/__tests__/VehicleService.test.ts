import { VeiculoService } from '../services/VeiculoService';

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

const fakeVeiculo = {
  id: 'veh-1', usuarioId: 'user-1', marca: 'Toyota', modelo: 'Corolla',
  ano: 2022, placa: 'ABC1234', cor: 'Prata', tipo: 'carro',
  destroy: mockDestroy,
  update: mockVehicleUpdate,
};

describe('VeiculoService', () => {
  const service = new VeiculoService();

  describe('criar', () => {
    it('deve lançar erro se campos obrigatórios ausentes', async () => {
      await expect(service.criar({ usuarioId: 'user-1', marca: '', modelo: 'Corolla', ano: 2022, placa: 'ABC1234', cor: 'Prata', tipo: 'carro' })).rejects.toThrow('Todos os campos são obrigatórios');
    });

    it('deve lançar erro se placa já cadastrada', async () => {
      mockFindOne.mockResolvedValue(fakeVeiculo);
      await expect(service.criar({ usuarioId: 'user-1', marca: 'Toyota', modelo: 'Corolla', ano: 2022, placa: 'ABC1234', cor: 'Prata', tipo: 'carro' })).rejects.toThrow('Placa já cadastrada');
    });

    it('deve criar veículo com sucesso', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue(fakeVeiculo);
      const result = await service.criar({ usuarioId: 'user-1', marca: 'Toyota', modelo: 'Corolla', ano: 2022, placa: 'ABC1234', cor: 'Prata', tipo: 'carro' });
      expect(result.placa).toBe('ABC1234');
    });
  });

  describe('excluir', () => {
    it('deve lançar erro se veículo não encontrado', async () => {
      mockFindOne.mockResolvedValue(null);
      await expect(service.excluir('veh-1', 'user-2', false)).rejects.toThrow('Veículo não encontrado ou sem permissão');
    });

    it('admin pode excluir qualquer veículo', async () => {
      mockFindOne.mockResolvedValue(fakeVeiculo);
      mockDestroy.mockResolvedValue(undefined);
      await expect(service.excluir('veh-1', 'qualquer', true)).resolves.not.toThrow();
    });
  });

  describe('atualizar', () => {
    it('deve lançar erro se veículo não pertence ao usuário', async () => {
      mockFindOne.mockResolvedValue(null);
      await expect(service.atualizar('veh-1', 'user-2', { cor: 'Azul' })).rejects.toThrow('Veículo não encontrado ou sem permissão');
    });

    it('deve atualizar veículo com sucesso', async () => {
      mockVehicleUpdate.mockResolvedValue({ ...fakeVeiculo, cor: 'Azul' });
      mockFindOne.mockResolvedValue(fakeVeiculo);
      const result = await service.atualizar('veh-1', 'user-1', { cor: 'Azul' });
      expect(result).toBeTruthy();
    });
  });
});
