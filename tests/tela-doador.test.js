import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it } from 'vitest';

// Executa o renderizador real com os elementos mínimos de DOM que ele utiliza.
const script = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const renderizador = script.slice(script.indexOf('function criarCartaoDoDoador('), script.indexOf('async function carregarMinhas('));
const elemento = () => ({ filhos: [], append(...filhos) { this.filhos.push(...filhos); } });

it.each(['disponivel', 'aceita', 'coletada'])('mantém o motivo da devolução visível ao doador quando %s', (status) => {
  const renderizar = runInNewContext(`${renderizador}\ncriarCartaoDoDoador`, {
    document: { createElement: elemento }, criarResumo: elemento,
    criarLinha: texto => texto, descreverSituacao: doacao => doacao.status,
    formatarHorario: () => '12:00'
  });
  const cartao = renderizar({ status, motivo_devolucao: 'sem voluntário', voluntario: 'Rui' });
  expect(cartao.filhos[0].filhos).toContain('Devolvida por uma organização. Motivo: sem voluntário');
});
