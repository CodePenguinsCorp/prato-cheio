const form = document.getElementById('form-doacao');
const lista = document.getElementById('lista');
const botaoPublicar = document.getElementById('publicar');
const tipoInput = document.getElementById('tipo');
const quantidadeInput = document.getElementById('quantidade');
const validadeInput = document.getElementById('validade');
const doadorInput = document.getElementById('doador');
const consultaDoador = document.getElementById('consulta-doador');
const listaMinhas = document.getElementById('lista-minhas');
let doadorConsultado = '';
const consultaOng = document.getElementById('consulta-ong');
const listaOng = document.getElementById('lista-ong');
let ongConsultada = '';
const mesInput = document.getElementById('mes');
const painelResultado = document.getElementById('resultado');
let mesConsultado = '';
const nomeOng = document.getElementById('nome-ong');
const totalDisponiveis = document.getElementById('total-disponiveis');
const impactoTexto = document.getElementById('impacto-texto');
const iconeAlimento = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 11a8 8 0 0 0 16 0H4Z"/><path d="M7 15h10M12 7V3M8.5 8.5 6 6M15.5 8.5 18 6"/></svg>';
const iconeQuantidade = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';
const iconeCalendario = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>';
let timerToast;
let doacoesDisponiveis = [];

function formatarData(dataIso) {
  const data = new Date(`${dataIso}T12:00:00`);
  if (Number.isNaN(data.getTime())) return dataIso;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(data)
    .replace('.', '');
}

function definirErro(input, campoId, erroId, mensagem) {
  const campo = document.getElementById(campoId);
  const erro = document.getElementById(erroId);
  const invalido = Boolean(mensagem);
  campo.classList.toggle('invalid', invalido);
  input.setAttribute('aria-invalid', String(invalido));
  input.setCustomValidity(mensagem || '');
  if (mensagem) erro.textContent = mensagem;
}

function validarObrigatorio(input, campoId, erroId, mensagem) {
  const invalido = input.value.trim() === '';
  definirErro(input, campoId, erroId, invalido ? mensagem : '');
  return !invalido;
}

// Sem login: o navegador só lembra o último nome digitado, por conveniência.
function lembrar(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch { /* Armazenamento indisponível. */ }
}

function lembrado(chave) {
  try { return localStorage.getItem(chave) ?? ''; } catch { return ''; }
}

function validarDoador() {
  return validarObrigatorio(
    doadorInput,
    'campo-doador',
    'erro-doador',
    'Informe quem está doando.'
  );
}

function validarTipo() {
  return validarObrigatorio(
    tipoInput,
    'campo-tipo',
    'erro-tipo',
    'Informe o tipo de alimento.'
  );
}

function validarQuantidade() {
  return validarObrigatorio(
    quantidadeInput,
    'campo-quantidade',
    'erro-quantidade',
    'Informe a quantidade disponível.'
  );
}

function validarValidade() {
  return validarObrigatorio(
    validadeInput,
    'campo-validade',
    'erro-validade',
    'Informe a data limite para retirada.'
  );
}

function validarOng(exigirPreenchimento = false) {
  const valor = nomeOng.value.trim();
  let mensagem = '';
  if (!valor && exigirPreenchimento) {
    mensagem = 'Informe o nome da organização antes de aceitar.';
  } else if (valor && !/^[\p{L}\p{N}]/u.test(valor)) {
    mensagem = 'Comece o nome da organização com uma letra ou número.';
  }
  definirErro(nomeOng, 'campo-ong', 'erro-ong', mensagem);
  return !mensagem;
}

function atualizarResumo(total) {
  totalDisponiveis.textContent = total;
  impactoTexto.textContent = total === 1
    ? 'doação aguardando uma organização.'
    : total > 1
      ? 'doações aguardando uma organização.'
      : 'Nenhuma doação aguardando no momento.';
}

function mostrarToast(mensagem, tipo = 'success') {
  clearTimeout(timerToast);
  const region = document.getElementById('toast-region');
  const toast = document.createElement('div');
  toast.className = `toast ${tipo === 'error' ? 'error' : ''}`;
  const simbolo = document.createElement('span');
  simbolo.setAttribute('aria-hidden', 'true');
  simbolo.innerHTML = tipo === 'error'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>';
  const texto = document.createElement('p');
  texto.textContent = mensagem;
  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.setAttribute('aria-label', 'Fechar aviso');
  fechar.textContent = '×';
  fechar.addEventListener('click', () => toast.remove());
  toast.append(simbolo, texto, fechar);
  region.replaceChildren(toast);
  timerToast = setTimeout(() => toast.remove(), 4800);
}

async function lerResposta(resposta) {
  let corpo = {};
  try { corpo = await resposta.json(); } catch { /* Resposta sem JSON. */ }
  if (!resposta.ok) throw new Error(corpo.erro || 'Não foi possível concluir a operação.');
  return corpo;
}

function criarResumo(doacao) {
  const principal = document.createElement('div');
  principal.className = 'donation-main';
  const topo = document.createElement('div');
  topo.className = 'donation-topline';
  const icone = document.createElement('span');
  icone.className = 'food-icon';
  icone.innerHTML = iconeAlimento;
  const identificacao = document.createElement('div');
  identificacao.style.minWidth = '0';
  const titulo = document.createElement('h3');
  titulo.className = 'donation-title';
  titulo.textContent = String(doacao.tipo ?? '');
  identificacao.append(titulo);
  topo.append(icone, identificacao);
  const meta = document.createElement('div');
  meta.className = 'donation-meta';
  const quantidade = document.createElement('span');
  quantidade.innerHTML = iconeQuantidade;
  quantidade.append(document.createTextNode(String(doacao.quantidade ?? '')));
  const validade = document.createElement('span');
  validade.innerHTML = iconeCalendario;
  validade.append(document.createTextNode(`Retirar até ${formatarData(doacao.validade)}`));
  meta.append(quantidade, validade);
  principal.append(topo, meta);
  return principal;
}

function criarCartao(doacao) {
  const item = document.createElement('li');
  item.className = 'donation-card';
  const aceitar = document.createElement('button');
  aceitar.className = 'button button-accept';
  aceitar.type = 'button';
  aceitar.textContent = 'Aceitar doação';
  aceitar.addEventListener('click', () => aceitarDoacao(doacao, aceitar));
  item.append(criarResumo(doacao), aceitar);
  return item;
}

function renderizarVazio() {
  const item = document.createElement('li');
  item.className = 'empty-state';
  item.innerHTML = `<span class="empty-illustration" aria-hidden="true">${iconeAlimento}</span><h3>Tudo encaminhado por aqui</h3><p>Não há doações disponíveis agora. Quando uma nova oferta for publicada, ela aparecerá aqui.</p>`;
  lista.replaceChildren(item);
}

function renderizarDoacoes() {
  if (!doacoesDisponiveis.length) {
    renderizarVazio();
    return;
  }
  lista.replaceChildren(...doacoesDisponiveis.map(criarCartao));
}

function renderizarErro() {
  const item = document.createElement('li');
  item.className = 'error-state';
  item.innerHTML = '<h3>Não foi possível carregar</h3><p>Confira se o servidor está ativo e atualize a página para tentar novamente.</p>';
  lista.replaceChildren(item);
}

function mensagemNaLista(alvo, texto) {
  const item = document.createElement('li');
  item.className = 'follow-message';
  item.textContent = texto;
  alvo.replaceChildren(item);
}

function criarLinha(texto, classe = 'situation-detail') {
  const linha = document.createElement('p');
  linha.className = classe;
  linha.textContent = texto;
  return linha;
}

function descreverSituacao(doacao) {
  if (doacao.status === 'aceita') return `Aceita por ${doacao.ong}`;
  if (doacao.status === 'coletada') return `Coletada para ${doacao.ong}`;
  return 'Disponível';
}

function formatarHorario(instante) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    .format(new Date(instante));
}

function criarCartaoDoDoador(doacao) {
  const item = document.createElement('li');
  item.className = 'donation-card';
  const principal = criarResumo(doacao);
  principal.append(criarLinha(descreverSituacao(doacao), `situation situation-${doacao.status}`));
  if (doacao.status === 'disponivel' && doacao.motivo_devolucao) {
    principal.append(criarLinha(`Devolvida por uma organização. Motivo: ${doacao.motivo_devolucao}`));
  }
  if (doacao.status === 'coletada') {
    principal.append(criarLinha(`Coletada por ${doacao.voluntario} em ${formatarHorario(doacao.coletada_em)}.`));
  }
  item.append(principal);
  return item;
}

async function carregarMinhas() {
  if (!doadorConsultado) return;
  try {
    const resposta = await fetch(`/api/minhas-doacoes?doador=${encodeURIComponent(doadorConsultado)}`);
    const doacoes = await lerResposta(resposta);
    if (doacoes.length) listaMinhas.replaceChildren(...doacoes.map(criarCartaoDoDoador));
    else mensagemNaLista(listaMinhas, 'Nenhuma doação publicada com esse nome.');
  } catch (erro) {
    mensagemNaLista(listaMinhas, erro.message);
  }
}

function criarCampo(id, rotulo, dica) {
  const campo = document.createElement('div');
  campo.className = 'field';
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = rotulo;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'text';
  input.placeholder = dica;
  campo.append(label, input);
  return { campo, input };
}

// Formulário curto dentro do cartão: um campo de texto e um botão.
// A validação fica na API; a mensagem dela aparece no aviso.
function criarAcao({ id, rotulo, dica, botao, enviar }) {
  const formulario = document.createElement('form');
  formulario.className = 'card-action';
  const { campo, input } = criarCampo(id, rotulo, dica);
  const confirmar = document.createElement('button');
  confirmar.type = 'submit';
  confirmar.className = 'button button-accept';
  confirmar.textContent = botao;
  formulario.append(campo, confirmar);
  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    confirmar.disabled = true;
    try {
      await enviar(input.value.trim());
    } catch (erro) {
      mostrarToast(erro.message, 'error');
      confirmar.disabled = false;
    }
  });
  return formulario;
}

async function enviarJson(url, corpo) {
  const resposta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo)
  });
  return lerResposta(resposta);
}

async function atualizarPaineis() {
  await carregar();
  await carregarDaOng();
  await carregarMinhas();
  await carregarResultado();
}

function criarCartaoDaOng(doacao) {
  const item = document.createElement('li');
  item.className = 'donation-card';
  const principal = criarResumo(doacao);
  principal.append(criarLinha(descreverSituacao(doacao), `situation situation-${doacao.status}`));
  if (doacao.doador) principal.append(criarLinha(`Doador: ${doacao.doador}`));
  item.append(principal);
  if (doacao.status === 'coletada') {
    principal.append(criarLinha(`Coletada por ${doacao.voluntario} em ${formatarHorario(doacao.coletada_em)}.`));
    return item;
  }
  const acoes = document.createElement('div');
  acoes.className = 'card-actions';
  acoes.append(criarAcao({
    id: `voluntario-${doacao.id}`,
    rotulo: 'Nome de quem coletou',
    dica: 'Ex.: Rui',
    botao: 'Confirmar coleta',
    enviar: async (voluntario) => {
      await enviarJson(`/api/doacoes/${doacao.id}/coletar`, { voluntario });
      mostrarToast(`Coleta de ${doacao.tipo} confirmada.`);
      await atualizarPaineis();
    }
  }), criarAcao({
    id: `motivo-${doacao.id}`,
    rotulo: 'Não vai conseguir buscar? Diga o motivo',
    dica: 'Ex.: sem voluntário hoje',
    botao: 'Devolver doação',
    enviar: async (motivo) => {
      await enviarJson(`/api/doacoes/${doacao.id}/devolver`, { ong: ongConsultada, motivo });
      mostrarToast(`Doação de ${doacao.tipo} devolvida. Ela voltou para a lista.`);
      await atualizarPaineis();
    }
  }));
  item.append(acoes);
  return item;
}

async function carregarDaOng() {
  if (!ongConsultada) return;
  try {
    const resposta = await fetch(`/api/doacoes-da-ong?ong=${encodeURIComponent(ongConsultada)}`);
    const doacoes = await lerResposta(resposta);
    if (doacoes.length) listaOng.replaceChildren(...doacoes.map(criarCartaoDaOng));
    else mensagemNaLista(listaOng, 'Essa organização ainda não aceitou doações.');
  } catch (erro) {
    mensagemNaLista(listaOng, erro.message);
  }
}

async function carregarResultado() {
  if (!mesConsultado) return;
  try {
    const resposta = await fetch(`/api/resultado?mes=${encodeURIComponent(mesConsultado)}`);
    const resultado = await lerResposta(resposta);
    for (const campo of ['publicadas', 'aceitas', 'coletadas']) {
      document.getElementById(`resultado-${campo}`).textContent = resultado[campo];
    }
    document.getElementById('resultado-tempo').textContent = resultado.tempoMedio;
    painelResultado.hidden = false;
  } catch (erro) {
    painelResultado.hidden = true;
    mostrarToast(erro.message, 'error');
  }
}

async function carregar() {
  lista.setAttribute('aria-busy', 'true');
  try {
    const resposta = await fetch('/api/doacoes');
    const doacoes = await lerResposta(resposta);
    doacoesDisponiveis = doacoes;
    atualizarResumo(doacoes.length);
    renderizarDoacoes();
  } catch (erro) {
    totalDisponiveis.textContent = '-';
    impactoTexto.textContent = 'Não foi possível consultar as doações.';
    renderizarErro();
    mostrarToast(erro.message, 'error');
  } finally {
    lista.setAttribute('aria-busy', 'false');
  }
}

async function aceitarDoacao(doacao, botao) {
  const ong = nomeOng.value.trim();
  if (!validarOng(true)) {
    nomeOng.focus();
    return;
  }
  const textoOriginal = botao.textContent;
  botao.disabled = true;
  botao.textContent = 'Reservando...';
  try {
    const resposta = await fetch(`/api/doacoes/${doacao.id}/aceitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ong })
    });
    await lerResposta(resposta);
    mostrarToast(`Doação de ${doacao.tipo} reservada para ${ong}.`);
    ongConsultada = ong;
    consultaOng.value = ong;
    await atualizarPaineis();
  } catch (erro) {
    mostrarToast(erro.message, 'error');
    botao.disabled = false;
    botao.textContent = textoOriginal;
    await carregar();
  }
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const validacoes = [
    [validarDoador(), doadorInput],
    [validarTipo(), tipoInput],
    [validarQuantidade(), quantidadeInput],
    [validarValidade(), validadeInput]
  ];
  const primeiraInvalida = validacoes.find(([valida]) => !valida);
  if (primeiraInvalida) {
    primeiraInvalida[1].focus();
    return;
  }
  const dados = new FormData(form);
  const doacao = {
    doador: dados.get('doador').trim(),
    tipo: dados.get('tipo').trim(),
    quantidade: dados.get('quantidade').trim(),
    validade: dados.get('validade')
  };
  botaoPublicar.disabled = true;
  botaoPublicar.querySelector('span').textContent = 'Publicando...';
  try {
    const resposta = await fetch('/api/doacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doacao)
    });
    await lerResposta(resposta);
    form.reset();
    lembrar('doador', doacao.doador);
    doadorInput.value = doacao.doador;
    consultaDoador.value = doacao.doador;
    document.getElementById('validade').min = new Date().toISOString().slice(0, 10);
    mostrarToast('Doação publicada e disponível para as organizações.');
    await atualizarPaineis();
  } catch (erro) {
    mostrarToast(erro.message, 'error');
  } finally {
    botaoPublicar.disabled = false;
    botaoPublicar.querySelector('span').textContent = 'Publicar doação';
  }
});

nomeOng.addEventListener('input', () => validarOng(false));

document.getElementById('form-ong').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!validarObrigatorio(consultaOng, 'campo-consulta-ong', 'erro-consulta-ong', 'Informe o nome da organização.')) {
    consultaOng.focus();
    return;
  }
  ongConsultada = consultaOng.value.trim();
  await carregarDaOng();
});

document.getElementById('form-resultado').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!validarObrigatorio(mesInput, 'campo-mes', 'erro-mes', 'Escolha o mês.')) {
    mesInput.focus();
    return;
  }
  mesConsultado = mesInput.value.trim();
  await carregarResultado();
});

document.getElementById('form-minhas').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!validarObrigatorio(consultaDoador, 'campo-consulta-doador', 'erro-consulta-doador', 'Informe o nome do doador.')) {
    consultaDoador.focus();
    return;
  }
  doadorConsultado = consultaDoador.value.trim();
  lembrar('doador', doadorConsultado);
  await carregarMinhas();
});
doadorInput.addEventListener('input', validarDoador);
tipoInput.addEventListener('input', validarTipo);
quantidadeInput.addEventListener('input', validarQuantidade);
validadeInput.addEventListener('change', validarValidade);

validadeInput.min = new Date().toISOString().slice(0, 10);
doadorInput.value = lembrado('doador');
consultaDoador.value = lembrado('doador');
// Mês atual no fuso do aparelho.
const hoje = new Date();
mesInput.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
carregar();
