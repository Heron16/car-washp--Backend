import { AuthService } from '../services/AuthService';

jest.mock('../models/UserModel', () => ({
  UserModel: { findOne: jest.fn() },
}));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mocked-token') }));

import { UserModel } from '../models/UserModel';
import bcrypt from 'bcryptjs';

const mockFindOne = UserModel.findOne as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;

describe('AuthService', () => {
  const service = new AuthService();

  beforeEach(() => { process.env.JWT_SECRET = 'test-secret'; });

  it('deve lançar erro para e-mail inválido', async () => {
    await expect(service.login('invalido', '123')).rejects.toThrow('E-mail inválido');
  });

  it('deve lançar erro se usuário não encontrado', async () => {
    mockFindOne.mockResolvedValue(null);
    await expect(service.login('user@test.com', '123')).rejects.toThrow('Usuário não encontrado');
  });

  it('deve lançar erro se senha incorreta', async () => {
    mockFindOne.mockResolvedValue({ id: '1', password: 'hashed', role: 'client' });
    mockCompare.mockResolvedValue(false);
    await expect(service.login('user@test.com', 'wrong')).rejects.toThrow('Senha incorreta');
  });

  it('deve retornar token e usuário no login bem-sucedido', async () => {
    const fakeUser = { id: 'uuid-1', name: 'João', email: 'joao@test.com', password: 'hashed', role: 'client', cpf: '123', phone: null };
    mockFindOne.mockResolvedValue(fakeUser);
    mockCompare.mockResolvedValue(true);

    const result = await service.login('joao@test.com', 'Senha@123');
    expect(result.token).toBe('mocked-token');
    expect(result.user.email).toBe('joao@test.com');
    expect(result.user).not.toHaveProperty('password');
  });
});
