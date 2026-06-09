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
jest.mock('../utils/emailValidator', () => ({
  validateEmailDomain: jest.fn(() => Promise.resolve(true)),
}));

import { UserModel } from '../models/UserModel';
import { validateEmailDomain } from '../utils/emailValidator';

const mockFindOne = UserModel.findOne as jest.Mock;
const mockFindByPk = UserModel.findByPk as jest.Mock;
const mockCreate = UserModel.create as jest.Mock;
const mockUpdate = UserModel.update as jest.Mock;
const mockValidateDomain = validateEmailDomain as jest.Mock;

describe('UserService', () => {
  const service = new UserService();

  describe('criar', () => {
    it('deve lançar erro para e-mail inválido', async () => {
      await expect(service.criar('João', 'invalido', 'Senha@123', '529.982.247-25')).rejects.toThrow('E-mail inválido');
    });

    it('deve lançar erro para CPF inválido', async () => {
      await expect(service.criar('João', 'joao@test.com', 'Senha@123', '000.000.000-00')).rejects.toThrow('CPF inválido');
    });

    it('deve lançar erro para senha fraca', async () => {
      await expect(service.criar('João', 'joao@test.com', '123456', '529.982.247-25')).rejects.toThrow('Senha fraca');
    });

    it('deve lançar erro se domínio do e-mail não existe', async () => {
      mockValidateDomain.mockResolvedValueOnce(false);
      await expect(service.criar('João', 'joao@dominiofalso123.xyz', 'Senha@123', '529.982.247-25')).rejects.toThrow('O domínio deste e-mail não existe');
    });

    it('deve lançar erro se e-mail ou CPF já existir', async () => {
      mockFindOne.mockResolvedValue({ id: '1' });
      await expect(service.criar('João', 'joao@test.com', 'Senha@123', '529.982.247-25')).rejects.toThrow('E-mail ou CPF já cadastrado');
    });

    it('deve criar usuário com sucesso', async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({ id: 'uuid-1', nome: 'João', email: 'joao@test.com', perfil: 'cliente' });
      const result = await service.criar('João', 'joao@test.com', 'Senha@123', '529.982.247-25');
      expect(result.email).toBe('joao@test.com');
      expect(result).not.toHaveProperty('senha');
    });
  });

  describe('buscarPorId', () => {
    it('deve lançar erro se usuário não encontrado', async () => {
      mockFindByPk.mockResolvedValue(null);
      await expect(service.buscarPorId('id-x')).rejects.toThrow('Usuário não encontrado');
    });

    it('deve retornar usuário existente', async () => {
      mockFindByPk.mockResolvedValue({ id: 'uuid-1', nome: 'João', email: 'joao@test.com' });
      const result = await service.buscarPorId('uuid-1');
      expect(result.id).toBe('uuid-1');
    });
  });

  describe('atualizar', () => {
    it('deve lançar erro se solicitante diferente do usuário', async () => {
      await expect(service.atualizar('user-1', 'user-2', { nome: 'Novo' })).rejects.toThrow('Sem permissão');
    });

    it('deve atualizar com sucesso', async () => {
      mockUpdate.mockResolvedValue([1]);
      mockFindByPk.mockResolvedValue({ id: 'user-1', nome: 'Novo', email: 'j@test.com' });
      const result = await service.atualizar('user-1', 'user-1', { nome: 'Novo' });
      expect(result).toBeTruthy();
    });
  });
});
