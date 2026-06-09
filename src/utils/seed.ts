import bcrypt from 'bcryptjs';
import { UserModel } from '../models/UserModel';

export async function seedAdmin() {
  const existe = await UserModel.findOne({ where: { email: 'admin@aquawash.com' } });
  if (existe) return;

  const senhaCriptografada = await bcrypt.hash('Admin@123', 12);
  await UserModel.create({
    nome: 'Administrador',
    email: 'admin@aquawash.com',
    senha: senhaCriptografada,
    cpf: '11144477735',
    perfil: 'admin',
  });

  console.log('✅ Admin criado: admin@aquawash.com / Admin@123');
}
