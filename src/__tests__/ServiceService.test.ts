import { ServicoService } from '../services/ServicoService';

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

const fakeServico = {
  id: 'svc-1', nome: 'Lavagem', descricao: 'Básica', preco: 50,
  duracao: 30, tiposVeiculo: 'carro,suv', ativo: true,
  criadoEm: new Date(), atualizadoEm: new Date(),
  toJSON: mockToJSON,
  update: mockUpdate,
  destroy: mockDestroy,
};

describe('ServicoService', () => {
  const service = new ServicoService();

  beforeEach(() => {
    mockToJSON.mockReturnValue({ ...fakeServico });
    mockUpdate.mockResolvedValue(fakeServico);
  });

  describe('criar', () => {
    it('deve lançar erro se nome ausente', async () => {
      await expect(service.criar('', 'desc', 50, 30, ['carro'])).rejects.toThrow('Nome e descrição são obrigatórios');
    });

    it('deve lançar erro se preço <= 0', async () => {
      await expect(service.criar('Lav', 'desc', 0, 30, ['carro'])).rejects.toThrow('Preço deve ser maior que zero');
    });

    it('deve lançar erro se duração <= 0', async () => {
      await expect(service.criar('Lav', 'desc', 50, 0, ['carro'])).rejects.toThrow('Duração deve ser maior que zero');
    });

    it('deve criar serviço com sucesso', async () => {
      mockCreate.mockResolvedValue(fakeServico);
      const result = await service.criar('Lavagem', 'Básica', 50, 30, ['carro', 'suv']);
      expect(result.nome).toBe('Lavagem');
      expect(result.tiposVeiculo).toEqual(['carro', 'suv']);
    });
  });

  describe('listar', () => {
    it('deve retornar lista paginada', async () => {
      mockFindAndCountAll.mockResolvedValue({ rows: [fakeServico], count: 1 });
      const result = await service.listar({ pagina: 1, limite: 10 });
      expect(result.dados).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.dados[0].tiposVeiculo).toEqual(['carro', 'suv']);
    });
  });

  describe('excluir', () => {
    it('deve lançar erro se serviço não encontrado', async () => {
      mockFindByPk.mockResolvedValue(null);
      await expect(service.excluir('id-x')).rejects.toThrow('Serviço não encontrado');
    });

    it('deve excluir serviço existente', async () => {
      mockFindByPk.mockResolvedValue(fakeServico);
      mockDestroy.mockResolvedValue(undefined);
      await expect(service.excluir('svc-1')).resolves.not.toThrow();
    });
  });
});
