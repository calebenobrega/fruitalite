/**
 * Chaves únicas de localStorage usadas pela aplicação.
 *
 * Centralizar aqui evita divergência (ex: backup.ts e ConfiguracoesPage
 * usavam o literal 'fruitalite-backup' em pontos diferentes — mudar um
 * sem o outro quebra o restore silenciosamente).
 *
 * O namespace `fruitalite:` é usado pelas stores via middleware persist
 * do Zustand. O tipo do backup é o discriminador no arquivo JSON exportado.
 */

/** Prefixo namespacing pra todas as chaves de store persistidas. */
const STORE_PREFIX = 'fruitalite:';

export const STORAGE_KEYS = {
  usuario: `${STORE_PREFIX}usuario`,
  listas: `${STORE_PREFIX}listas`,
  catalogo: `${STORE_PREFIX}catalogo`,
  anotacoes: `${STORE_PREFIX}anotacoes`,
} as const;

/** Discriminador usado no arquivo de backup JSON. */
export const BACKUP_TIPO = 'fruitalite-backup';
export const BACKUP_VERSAO = 1;
