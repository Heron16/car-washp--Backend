import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './lib/sequelize';

// Importar models para registrar associações antes de qualquer uso
import './models/AppointmentModel';

import { seedAdmin } from './utils/seed';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import serviceRoutes from './routes/service.routes';
import vehicleRoutes from './routes/vehicle.routes';
import appointmentRoutes from './routes/appointment.routes';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 3001;

async function main() {
  await sequelize.authenticate();
  console.log('MySQL conectado via Sequelize');
  await seedAdmin();
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

main().catch((err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
