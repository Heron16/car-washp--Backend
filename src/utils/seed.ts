import bcrypt from 'bcryptjs';
import { UserModel } from '../models/UserModel';

export async function seedAdmin() {
  const exists = await UserModel.findOne({ where: { email: 'admin@aquawash.com' } });
  if (exists) return;

  const hashed = await bcrypt.hash('Admin@123', 12);
  await UserModel.create({
    name: 'Administrador',
    email: 'admin@aquawash.com',
    password: hashed,
    cpf: '11144477735',
    role: 'admin',
  });

  console.log('✅ Admin criado: admin@aquawash.com / Admin@123');
}
