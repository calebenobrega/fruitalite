export type Fase = 'planejamento' | 'comprando' | 'concluida';

export type Unidade = 'caixas' | 'unidades' | 'kg';

export type Categoria = 'frutas' | 'verduras' | 'legumes' | 'raizes' | 'outros';

export type Usuario = {
  nome: string;
  tagLoja: string;
  criadoEm: string;
};

export type Produto = {
  id: string;
  nome: string;
  emoji?: string;
  categoria: Categoria;
  unidadePadrao: Unidade;
  /** Peso padrão de 1 caixa em gramas. Auto-preenche o item da lista quando unidade='caixas'. */
  pesoPorCaixaGramas?: number;
  ativo: boolean;
};

export type ItemLista = {
  produtoId: string;
  quantidade: number;
  unidade: Unidade;
  valorUnitarioCentavos: number | null;
  /** Peso de 1 caixa em gramas. Usado p/ derivar R$/kg quando unidade='caixas'. */
  pesoPorCaixaGramas?: number;
};

export type Lista = {
  id: string;
  nome: string;
  fase: Fase;
  itens: ItemLista[];
  criadaEm: string;
  finalizadaEm: string | null;
};

export type Lembrete = {
  dataHora: string;
  disparado: boolean;
  visto: boolean;
};

export type Anotacao = {
  id: string;
  titulo: string;
  conteudo: string;
  lembrete: Lembrete | null;
  criadaEm: string;
  atualizadaEm: string;
};
