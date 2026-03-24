import { ServiceService } from '../services/ServiceService';

const mockToJSON = jest.fn();
const mockDestroy = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../models/ServiceModel', () => ({
  ServiceModel: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

import { ServiceModel } from '../models/ServiceModel';

const mockCreate = ServiceModel.create as jest.Mock;
const mockFindAndCountAll = ServiceModel.findAndCountAll as jest.Mock;
const mockFindByPk = ServiceModel.findByPk as jest.Mock;

const fakeServiceInstance = {
  id: 'svc-1', name: 'Lavagem', description: 'Básica', price: 50,
  duration: 30, vehicleTypes: 'car,suv', active: true,
  createdAt: new Date(), updatedAt: new Date(),
  toJSON: mockToJSON,
  update: mockUpdate,
  destroy: mockDestroy,
};

describe('ServiceService', () => {
  const service = new ServiceService();

  beforeEach(() => {
    mockToJSON.mockReturnValue({ ...fakeServiceInstance });
    mockUpdate.mockResolvedValue(fakeServiceInstance);
  });

  describe('create', () => {
    it('deve lançar erro se nome ausente', async () => {
      await expect(service.create('', 'desc', 50, 30, ['car'])).rejects.toThrow('Nome e descrição são obrigatórios');
    });

    it('deve lançar erro se preço <= 0', async () => {
      await expect(service.create('Lav', 'desc', 0, 30, ['car'])).rejects.toThrow('Preço deve ser maior que zero');
    });

    it('deve lançar erro se duração <= 0', async () => {
      await expect(service.create('Lav', 'desc', 50, 0, ['car'])).rejects.toThrow('Duração deve ser maior que zero');
    });

    it('deve criar serviço com sucesso', async () => {
      mockCreate.mockResolvedValue(fakeServiceInstance);
      const result = await service.create('Lavagem', 'Básica', 50, 30, ['car', 'suv']);
      expect(result.name).toBe('Lavagem');
      expect(result.vehicleTypes).toEqual(['car', 'suv']);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada', async () => {
      mockFindAndCountAll.mockResolvedValue({ rows: [fakeServiceInstance], count: 1 });
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].vehicleTypes).toEqual(['car', 'suv']);
    });
  });

  describe('delete', () => {
    it('deve lançar erro se serviço não encontrado', async () => {
      mockFindByPk.mockResolvedValue(null);
      await expect(service.delete('id-x')).rejects.toThrow('Serviço não encontrado');
    });

    it('deve deletar serviço existente', async () => {
      mockFindByPk.mockResolvedValue(fakeServiceInstance);
      mockDestroy.mockResolvedValue(undefined);
      await expect(service.delete('svc-1')).resolves.not.toThrow();
    });
  });
});
