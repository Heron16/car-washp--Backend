// Setup partilhado para testes de rotas
// Mocka o sequelize antes de qualquer model ser carregado

const mockModelClass = {
  init: jest.fn(),
  belongsTo: jest.fn(),
  hasMany: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn(),
};

jest.mock('../../lib/sequelize', () => ({
  __esModule: true,
  default: { authenticate: jest.fn(), define: jest.fn() },
}));

jest.mock('../../models/UserModel', () => ({ UserModel: { ...mockModelClass } }));
jest.mock('../../models/ServiceModel', () => ({ ServiceModel: { ...mockModelClass } }));
jest.mock('../../models/VehicleModel', () => ({ VehicleModel: { ...mockModelClass } }));
jest.mock('../../models/AppointmentModel', () => ({ AppointmentModel: { ...mockModelClass } }));
