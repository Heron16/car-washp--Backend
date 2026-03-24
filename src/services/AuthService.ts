import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/UserModel';
import { JwtPayload } from '../types';
import { validateEmail } from '../utils/validators';

export class AuthService {
  async login(email: string, password: string) {
    if (!validateEmail(email)) throw new Error('E-mail inválido');

    const user = await UserModel.findOne({ where: { email } });
    if (!user) throw new Error('Usuário não encontrado');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Senha incorreta');

    const payload: JwtPayload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf,
        phone: user.phone,
      },
    };
  }
}
