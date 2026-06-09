import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import './models/AppointmentModel';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import serviceRoutes from './routes/service.routes';
import vehicleRoutes from './routes/vehicle.routes';
import appointmentRoutes from './routes/appointment.routes';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://meuapp.local',
  // Permite acesso por IP na rede local (192.168.x.x ou 10.x.x.x)
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
  /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS bloqueado para origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/appointments', appointmentRoutes);

export default app;
