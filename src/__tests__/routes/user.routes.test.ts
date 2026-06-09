jest.mock('../../lib/sequelize', () => ({ __esModule: true, default: { authenticate: jest.fn() } }));
jest.mock('../../models/UserModel', () => ({ UserModel: {} }));
jest.mock('../../models/ServiceModel', () => ({ ServiceModel: {} }));
jest.mock('../../models/VehicleModel', () => ({ VehicleModel: {} }));
jest.mock('../../models/AppointmentModel', () => ({ AppointmentModel: {} }));
jest.mock('../../utils/emailValidator', () => ({
  validateEmailDomain: jest.fn(() => Promise.resolve(true)),
}));

const mockCriar = jest.fn();
const mockListarTodos = jest.fn();
const mockBuscarPorId = jest.fn();
const mockExcluir = jest.fn();

jest.mock('../../services/UserService', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    criar: mockCriar,
    listarTodos: mockListarTodos,
    buscarPorId: mockBuscarPorId,
    excluir: mockExcluir,
  })),
}));

import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';

const token = (perfil: 'admin' | 'cliente') =>
  jwt.sign({ usuarioId: 'u1', perfil }, process.env.JWT_SECRET || 'test-secret');

const fakeList = { dados: [], total: 0, pagina: 1, totalPaginas: 0 };

describe('Rotas /api/users', () => {
  describe('POST /cadastrar', () => {
    it('400 — campos ausentes', async () => {
      const res = await request(app).post('/api/users/cadastrar').send({ nome: 'João' });
      expect(res.status).toBe(400);
    });

    it('201 — cadastro com sucesso', async () => {
      mockCriar.mockResolvedValue({ id: '1', nome: 'João', email: 'j@t.com', perfil: 'cliente' });
      const res = await request(app).post('/api/users/cadastrar')
        .send({ nome: 'João', email: 'j@t.com', senha: 'Senha@123', cpf: '52998224725' });
      expect(res.status).toBe(201);
    });

    it('400 — e-mail já existe', async () => {
      mockCriar.mockRejectedValue(new Error('E-mail ou CPF já cadastrado'));
      const res = await request(app).post('/api/users/cadastrar')
        .send({ nome: 'João', email: 'j@t.com', senha: 'Senha@123', cpf: '52998224725' });
      expect(res.status).toBe(400);
      expect(res.body.mensagem).toBe('E-mail ou CPF já cadastrado');
    });
  });

  describe('GET /users', () => {
    it('401 — sem token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('403 — cliente não pode listar usuários', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token('cliente')}`);
      expect(res.status).toBe(403);
    });

    it('200 — admin lista usuários', async () => {
      mockListarTodos.mockResolvedValue(fakeList);
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token('admin')}`);
      expect(res.status).toBe(200);
    });
  });
});
