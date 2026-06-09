import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { UserModel } from '../models/UserModel';
import { validateCPF, validateEmail, validatePasswordStrength } from '../utils/validators';
import { validateEmailDomain } from '../utils/emailValidator';
import { getPaginationParams, paginate } from '../utils/pagination';
import { ConsultaPaginacao, DadosAtualizacaoUsuario } from '../types';

export class UserService {
  async criar(nome: string, email: string, senha: string, cpf: string) {
    this.validarCamposCriacao(email, senha, cpf);

    const dominioExiste = await validateEmailDomain(email);
    if (!dominioExiste) throw new Error('O domínio deste e-mail não existe. Use um e-mail válido (ex: nome@gmail.com)');

    const existe = await UserModel.findOne({ where: { [Op.or]: [{ email }, { cpf }] } });
    if (existe) throw new Error('E-mail ou CPF já cadastrado');

    const senhaCriptografada = await bcrypt.hash(senha, 12);
    const usuario = await UserModel.create({ nome, email, senha: senhaCriptografada, cpf });
    return { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil };
  }

  async atualizar(usuarioId: string, solicitanteId: string, dados: DadosAtualizacaoUsuario) {
    if (usuarioId !== solicitanteId) throw new Error('Sem permissão para editar este usuário');
    this.validarCamposAtualizacao(dados);

    const dadosAtualizados = await this.construirDadosAtualizacao(dados);
    await UserModel.update(dadosAtualizados, { where: { id: usuarioId } });

    return UserModel.findByPk(usuarioId, {
      attributes: ['id', 'nome', 'email', 'cpf', 'telefone', 'perfil'],
    });
  }

  async listarTodos(consulta: ConsultaPaginacao) {
    const { currentPage, pageLimit, skip } = getPaginationParams(consulta.pagina, consulta.limite);
    const { rows: dados, count: total } = await UserModel.findAndCountAll({
      attributes: ['id', 'nome', 'email', 'cpf', 'perfil', 'telefone', 'criadoEm'],
      offset: skip,
      limit: pageLimit,
      order: [['criadoEm', 'DESC']],
    });
    return paginate(dados, total, currentPage, pageLimit);
  }

  async buscarPorId(id: string) {
    const usuario = await UserModel.findByPk(id, {
      attributes: ['id', 'nome', 'email', 'cpf', 'telefone', 'perfil'],
    });
    if (!usuario) throw new Error('Usuário não encontrado');
    return usuario;
  }

  async excluir(id: string) {
    const usuario = await UserModel.findByPk(id);
    if (!usuario) throw new Error('Usuário não encontrado');
    await usuario.destroy();
  }

  private validarCamposCriacao(email: string, senha: string, cpf: string) {
    if (!validateEmail(email)) throw new Error('E-mail inválido');
    if (!validateCPF(cpf)) throw new Error('CPF inválido');
    if (!validatePasswordStrength(senha))
      throw new Error('Senha fraca: mínimo 8 chars, maiúscula, minúscula, número e especial');
  }

  private validarCamposAtualizacao(dados: DadosAtualizacaoUsuario) {
    if (dados.cpf && !validateCPF(dados.cpf)) throw new Error('CPF inválido');
    if (dados.senha && !validatePasswordStrength(dados.senha))
      throw new Error('Senha fraca: mínimo 8 chars, maiúscula, minúscula, número e especial');
  }

  private async construirDadosAtualizacao(dados: DadosAtualizacaoUsuario): Promise<Record<string, string>> {
    const resultado: Record<string, string> = { nome: dados.nome };
    if (dados.cpf) resultado.cpf = dados.cpf;
    if (dados.telefone) resultado.telefone = dados.telefone;
    if (dados.senha) resultado.senha = await bcrypt.hash(dados.senha, 12);
    return resultado;
  }
}
