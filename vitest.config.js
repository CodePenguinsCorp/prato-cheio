export default {
  test: {
    // Os arquivos de teste compartilham o mesmo banco PostgreSQL descartável
    // (limparBanco/TRUNCATE): rodam um por vez para não se atropelarem.
    fileParallelism: false
  }
};
