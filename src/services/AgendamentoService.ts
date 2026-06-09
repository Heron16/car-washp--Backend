import { Op } from 'sequelize';
import { AppointmentModel } from '../models/AppointmentModel';
import { ServiceModel } from '../models/ServiceModel';
import { VehicleModel } from '../models/VehicleModel';
import { UserModel } from '../models/UserModel';
import { StatusAgendamento, ConsultaPaginacao, DadosCriacaoAgendamento } from '../types';
import { getPaginationParams, paginate } from '../utils/pagination';

export class AgendamentoService {
  async criar(dados: DadosCriacaoAgendamento) {
    const servico = await ServiceModel.findByPk(dados.servicoId);
    if (!servico) throw new Error('Serviço não encontrado');

    this.validarHorarioFuncionamento(dados.agendadoPara);

    const fimNovo = new Date(dados.agendadoPara.getTime() + servico.duracao * 60000);
    await this.verificarConflito(dados.agendadoPara, fimNovo);

    return AppointmentModel.create({
      ...dados,
      precoTotal: Number(servico.preco),
    });
  }

  async listarPorUsuario(usuarioId: string, consulta: ConsultaPaginacao) {
    const { currentPage, pageLimit, skip } = getPaginationParams(consulta.pagina, consulta.limite);
    const { rows: dadosLista, count: total } = await AppointmentModel.findAndCountAll({
      where: { usuarioId },
      offset: skip,
      limit: pageLimit,
      include: [
        { model: VehicleModel, as: 'veiculo' },
        { model: ServiceModel, as: 'servico' },
      ],
      order: [['agendadoPara', 'DESC']],
    });
    return paginate(dadosLista, total, currentPage, pageLimit);
  }

  async listarTodos(consulta: ConsultaPaginacao) {
    const { currentPage, pageLimit, skip } = getPaginationParams(consulta.pagina, consulta.limite);
    const { rows: dadosLista, count: total } = await AppointmentModel.findAndCountAll({
      offset: skip,
      limit: pageLimit,
      include: [
        { model: UserModel, as: 'usuario', attributes: ['nome', 'email'] },
        { model: VehicleModel, as: 'veiculo' },
        { model: ServiceModel, as: 'servico' },
      ],
      order: [['agendadoPara', 'DESC']],
    });
    return paginate(dadosLista, total, currentPage, pageLimit);
  }

  async atualizarStatus(id: string, status: StatusAgendamento, isAdmin: boolean, usuarioId: string) {
    const condicao = isAdmin ? { id } : { id, usuarioId };
    const agendamento = await AppointmentModel.findOne({ where: condicao });
    if (!agendamento) throw new Error('Agendamento não encontrado ou sem permissão');
    await agendamento.update({ status });
    return agendamento;
  }

  async excluir(id: string, usuarioId: string, isAdmin: boolean) {
    const condicao = isAdmin ? { id } : { id, usuarioId };
    const agendamento = await AppointmentModel.findOne({ where: condicao });
    if (!agendamento) throw new Error('Agendamento não encontrado ou sem permissão');
    await agendamento.destroy();
  }

  private validarHorarioFuncionamento(data: Date): void {
    const diaSemana = data.getDay();
    const totalMinutos = data.getHours() * 60 + data.getMinutes();

    if (diaSemana === 0) throw new Error('Não atendemos aos domingos');

    const manha = { inicio: 480, fim: 720 };
    const tarde = { inicio: 810, fim: 1080 };

    if (diaSemana === 6) {
      if (totalMinutos < manha.inicio || totalMinutos >= manha.fim)
        throw new Error('Sábado: atendemos das 08:00 às 12:00');
      return;
    }

    const dentroManha = totalMinutos >= manha.inicio && totalMinutos < manha.fim;
    const dentroTarde = totalMinutos >= tarde.inicio && totalMinutos < tarde.fim;
    if (!dentroManha && !dentroTarde)
      throw new Error('Atendemos de segunda a sexta das 08:00 às 12:00 e das 13:30 às 18:00');
  }

  private async verificarConflito(inicio: Date, fim: Date): Promise<void> {
    type AgendamentoComServico = AppointmentModel & { servico: { duracao: number } };

    const ativos = await AppointmentModel.findAll({
      where: { status: { [Op.in]: ['pendente', 'em_andamento'] } },
      include: [{ model: ServiceModel, as: 'servico', attributes: ['duracao'] }],
    }) as AgendamentoComServico[];

    const temConflito = ativos.some((a) => {
      const inicioExistente = new Date(a.agendadoPara);
      const fimExistente = new Date(inicioExistente.getTime() + a.servico.duracao * 60000);
      return inicio < fimExistente && fim > inicioExistente;
    });

    if (temConflito) throw new Error('Já existe um agendamento neste horário. Escolha outro horário.');
  }
}
