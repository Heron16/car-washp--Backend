import { ServiceModel } from '../models/ServiceModel';
import { TipoVeiculo, ConsultaPaginacao } from '../types';
import { getPaginationParams, paginate } from '../utils/pagination';

type DadosAtualizacaoServico = Partial<{
  nome: string; descricao: string; preco: number;
  duracao: number; tiposVeiculo: TipoVeiculo[]; ativo: boolean;
}>;

export class ServicoService {
  async criar(nome: string, descricao: string, preco: number, duracao: number, tiposVeiculo: TipoVeiculo[]) {
    if (!nome || !descricao) throw new Error('Nome e descrição são obrigatórios');
    if (preco <= 0) throw new Error('Preço deve ser maior que zero');
    if (duracao <= 0) throw new Error('Duração deve ser maior que zero');

    const servico = await ServiceModel.create({ nome, descricao, preco, duracao, tiposVeiculo: tiposVeiculo.join(',') });
    return this.formatar(servico);
  }

  async listar(consulta: ConsultaPaginacao) {
    const { currentPage, pageLimit, skip } = getPaginationParams(consulta.pagina, consulta.limite);
    const { rows, count: total } = await ServiceModel.findAndCountAll({
      where: { ativo: true },
      offset: skip,
      limit: pageLimit,
      order: [['criadoEm', 'DESC']],
    });
    return paginate(rows.map(this.formatar), total, currentPage, pageLimit);
  }

  async listarAdmin(consulta: ConsultaPaginacao) {
    const { currentPage, pageLimit, skip } = getPaginationParams(consulta.pagina, consulta.limite);
    const { rows, count: total } = await ServiceModel.findAndCountAll({
      offset: skip,
      limit: pageLimit,
      order: [['criadoEm', 'DESC']],
    });
    return paginate(rows.map(this.formatar), total, currentPage, pageLimit);
  }

  async atualizar(id: string, dados: DadosAtualizacaoServico) {
    const servico = await ServiceModel.findByPk(id);
    if (!servico) throw new Error('Serviço não encontrado');

    const dadosAtualizados: Record<string, unknown> = { ...dados };
    if (dados.tiposVeiculo) dadosAtualizados.tiposVeiculo = dados.tiposVeiculo.join(',');

    await servico.update(dadosAtualizados);
    return this.formatar(servico);
  }

  async excluir(id: string) {
    const servico = await ServiceModel.findByPk(id);
    if (!servico) throw new Error('Serviço não encontrado');
    await servico.destroy();
  }

  private formatar(s: ServiceModel) {
    type ServicoPlano = {
      id: string; nome: string; descricao: string; preco: number;
      duracao: number; tiposVeiculo: string; ativo: boolean;
      criadoEm: Date; atualizadoEm: Date;
    };
    const plano = s.toJSON() as unknown as ServicoPlano;
    return { ...plano, tiposVeiculo: plano.tiposVeiculo.split(',') as TipoVeiculo[] };
  }
}
