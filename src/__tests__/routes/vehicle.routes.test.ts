jest.mock('../../lib/sequelize', () => ({ __esModule: true, default: { authenticate: jest.fn() } }));
jest.mock('../../models/UserModel', () => ({ UserModel: {} }));
jest.mock('../../models/ServiceModel', () => ({ ServiceModel: {} }));
jest.mock('../../models/VehicleModel', () => ({ VehicleModel: {} }));
jest.mock('../../models/AppointmentModel', () => ({ AppointmentModel: {} }));

const mockCriar = jest.fn();
const mockListarPorUsuario = jest.fn();
const mockListarTodos = jest.fn();
const mockExcluir = jest.fn();

jest.mock('../../services/VeiculoService', () => ({
  VeiculoService: jest.fn().mockImplementation(() => ({
    criar: mockCriar,
    listarPorUsuario: mockListarPorUsuario,
    listarTodos: mockListarTodos,
    excluir: mockExcluir,
  })),
}));

import request from 'supertest';
import app from '../../app';
import jwt from 'jsonwebtoken';

const token = (perfil: 'admin' | 'cliente') =>
  jwt.sign({ usuarioId: 'u1', perfil }, process.env.JWT_SECRET || 'test-secret');

const fakeList = { dados: [], total: 0, pagina: 1, totalPaginas: 0 };

describe('Rotas /api/vehicles', () => {
  it('401 — GET /meus sem token', async () => {
    const res = await request(app).get('/api/vehicles/meus');
    expect(res.status).toBe(401);
  });

  it('200 — GET /meus com token de cliente', async () => {
    mockListarPorUsuario.mockResolvedValue(fakeList);
    const res = await request(app).get('/api/vehicles/meus').set('Authorization', `Bearer ${token('cliente')}`);
    expect(res.status).toBe(200);
  });

  it('403 — GET / cliente não pode listar todos', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${token('cliente')}`);
    expect(res.status).toBe(403);
  });

  it('200 — GET / admin lista todos', async () => {
    mockListarTodos.mockResolvedValue(fakeList);
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${token('admin')}`);
    expect(res.status).toBe(200);
  });

  it('400 — POST / campos ausentes', async () => {
    const res = await request(app).post('/api/vehicles')
      .set('Authorization', `Bearer ${token('cliente')}`).send({ marca: 'Toyota' });
    expect(res.status).toBe(400);
  });

  it('201 — POST / criar veículo', async () => {
    mockCriar.mockResolvedValue({ id: 'v1', placa: 'ABC1234' });
    const res = await request(app).post('/api/vehicles')
      .set('Authorization', `Bearer ${token('cliente')}`)
      .send({ marca: 'Toyota', modelo: 'Corolla', ano: 2022, placa: 'ABC1234', cor: 'Prata', tipo: 'carro' });
    expect(res.status).toBe(201);
  });

  it('401 — DELETE / sem token', async () => {
    const res = await request(app).delete('/api/vehicles/v1');
    expect(res.status).toBe(401);
  });

  it('204 — DELETE / excluir veículo', async () => {
    mockExcluir.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/vehicles/v1').set('Authorization', `Bearer ${token('cliente')}`);
    expect(res.status).toBe(204);
  });
});
