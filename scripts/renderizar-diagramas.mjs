import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argumentos = process.argv.slice(2);
if (argumentos.length !== 1 || !existsSync(resolve(argumentos[0]))) {
  console.error('Uso: npm run docs:diagramas -- "caminho/para/plantuml.jar" (requer Java).');
  process.exit(1);
}

const jar = resolve(argumentos[0]);
const nomes = ['contexto', 'dados'];
const temporario = mkdtempSync(join(tmpdir(), 'prato-cheio-diagramas-'));

function executarPlantUML(opcao, fontes) {
  const resultado = spawnSync('java', [
    '-Dfile.encoding=UTF-8', '-jar', jar, '-charset', 'UTF-8', opcao, ...fontes
  ], { encoding: 'utf8' });
  if (resultado.error || resultado.status !== 0) {
    throw new Error(resultado.error?.message || resultado.stderr || resultado.stdout || 'Falha no PlantUML.');
  }
}

try {
  const fontes = nomes.map(nome => {
    const markdown = readFileSync(join(raiz, 'docs', 'diagramas', `${nome}.md`), 'utf8');
    const blocos = [...markdown.matchAll(/^```plantuml\r?\n([\s\S]*?)^```\s*$/gm)];
    if (blocos.length !== 1) throw new Error(`${nome}.md deve conter exatamente um bloco PlantUML.`);
    const fonte = join(temporario, `${nome}.puml`);
    writeFileSync(fonte, blocos[0][1], 'utf8');
    return fonte;
  });

  executarPlantUML('-checkonly', fontes);
  executarPlantUML('-tpng', fontes);
  for (const nome of nomes) {
    copyFileSync(join(temporario, `${nome}.png`), join(raiz, 'docs', 'diagramas', `${nome}.png`));
    console.log(`Gerado docs/diagramas/${nome}.png`);
  }
} catch (erro) {
  console.error(erro.message);
  process.exitCode = 1;
} finally {
  for (const nome of nomes) {
    for (const extensao of ['puml', 'png']) {
      const arquivo = join(temporario, `${nome}.${extensao}`);
      if (existsSync(arquivo)) unlinkSync(arquivo);
    }
  }
  rmdirSync(temporario);
}
