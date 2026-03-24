import { UserService } from '../services/UserService';

jest.mock('../models/UserModel', () => ({
  UserModel: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({ hash: jest.fn(() => 'hashed'), compare: jest.fn() }));

import { UserModel } from '../models/UserModel';

const mockFindOne = UserModel.findOne as jest.Mock;
const mockFindByPk = UserModel.findByPk as jest.Mock;
const mockCreate = UserModel.create as jest.Mock;
const mockUpdate = UserModel.update as jest.Mock;

describe('UserService', () => {
  const service = new UserService();

  describe('create', () => {
    it('deve lançar erro para e-mail inválido', async () => {
      await expect(service.create('João', 'invalido', 'Senha@123', '529.982.247-25')).rejects.toThrow('E-mail inválido');
    });

    it('deve lançar erro para CPF inválido', async () => {
      await expect(service.create('João', 'joao@test.com', 'Senha@123', '000.000.000-00')).rejects.toThrow('CPF inválido');
    });

    it('deve lançar erro para senha fraca', async () => {
      await expect(service.create('João', 'joao@test.com', '123456', '529.982.247-25')).rejects.toThrow('Senha fraca');
    });

    it('deve lançar erro se e-mail ou CPF já existir', async () => {
      mockFindOne.mockResolvedValue({ id: '1' });
      await expect(service.create('João', 'joao@test.com', 'Senha@123', '529.982.247-25')).rejects.toThrow('E-mail ou CPF já cadastrado');
    });

    it('deve criar usuário com sucesso', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 'uuid-1', name: 'João', email: 'joao@test.com', role: 'client' });
      const result = await service.create('João', 'joao@test.com', 'Senha@123', '529.982.247-25');
      expect(result.email).toBe('joao@test.com');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findById', () => {
    it('deve lançar erro se usuário não encontrado', async () => {
      mockFindByPk.mockResolvedValue(null);
      await expect(service.findById('id-x')).rejects.toThrow('Usuário não encontrado');
    });

    it('deve retornar usuário existente', async () => {
      mockFindByPk.mockResolvedValue({ id: 'uuid-1', name: 'João', email: 'joao@test.com' });
      const result = await service.findById('uuid-1');
      expect(result.id).toBe('uuid-1');
    });
  });

  describe('update', () => {
    it('deve lançar erro se requester diferente do userId', async () => {
      await expect(service.update('user-1', 'user-2', { name: 'Novo' })).rejects.toThrow('Sem permissão');
    });

    it('deve atualizar com sucesso', async () => {
      mockUpdate.mockResolvedValue([1]);
      mockFindByPk.mockResolvedValue({ id: 'user-1', name: 'Novo', email: 'j@test.com' });
      const result = await service.update('user-1', 'user-1', { name: 'Novo' });
      expect(result).toBeTruthy();
    });
  });
});
