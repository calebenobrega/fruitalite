import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, LogOut } from 'lucide-react';
import { useUsuarioStore } from '@stores/usuarioStore';
import { useToastStore } from '@stores/toastStore';
import { exportarBackup, importarBackup, type ResultadoImport } from '@utils/backup';
import styles from './ConfiguracoesPage.module.css';

type Confirmacao =
  | { tipo: 'sair' }
  | { tipo: 'import'; resumo: ResultadoImport; aplicar: () => void }
  | null;

export function ConfiguracoesPage() {
  const navigate = useNavigate();
  const resetar = useUsuarioStore((s) => s.resetar);
  const show = useToastStore((s) => s.show);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);

  function handleExportar() {
    try {
      exportarBackup();
      show('Backup exportado', 'success');
    } catch {
      show('Erro ao exportar backup', 'error');
    }
  }

  function handleAbrirImport() {
    fileInputRef.current?.click();
  }

  async function handleArquivoEscolhido(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite escolher o mesmo arquivo novamente
    if (!file) return;

    try {
      // Lê e valida o arquivo ANTES de aplicar, mostrando um resumo na confirmação.
      // O `importarBackup` já aplica direto — fazemos uma pré-leitura aqui.
      const texto = await file.text();
      const parsed = JSON.parse(texto);
      if (!parsed || parsed.tipo !== 'fruitalite-backup') {
        show('Arquivo não é um backup do FruitaLite', 'error');
        return;
      }
      const dados = parsed.dados ?? {};
      const resumo: ResultadoImport = {
        listas: Array.isArray(dados.listas) ? dados.listas.length : 0,
        anotacoes: Array.isArray(dados.anotacoes) ? dados.anotacoes.length : 0,
        catalogo: Array.isArray(dados.catalogo) ? dados.catalogo.length : 0,
        usuario: !!dados.usuario,
      };

      setConfirmacao({
        tipo: 'import',
        resumo,
        aplicar: async () => {
          try {
            const aplicado = await importarBackup(file);
            show(
              `Importado: ${aplicado.listas} listas, ${aplicado.anotacoes} anotações, ${aplicado.catalogo} produtos`,
              'success',
            );
            setConfirmacao(null);
          } catch (err) {
            show(
              err instanceof Error ? err.message : 'Erro ao importar backup',
              'error',
            );
            setConfirmacao(null);
          }
        },
      });
    } catch {
      show('Arquivo inválido', 'error');
    }
  }

  function handleSair() {
    resetar();
    setConfirmacao(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="Voltar"
        >
          <ArrowLeft size={20} strokeWidth={2} />
        </button>
        <h1 className={styles.pageTitle}>Configurações</h1>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dados</h2>
        <button type="button" className={styles.row} onClick={handleExportar}>
          <span className={styles.rowIcon} aria-hidden="true">
            <Download size={18} strokeWidth={2} />
          </span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>Exportar backup</span>
            <span className={styles.rowDesc}>
              Salva listas, anotações, catálogo e perfil em um arquivo .json
            </span>
          </span>
        </button>

        <button type="button" className={styles.row} onClick={handleAbrirImport}>
          <span className={styles.rowIcon} aria-hidden="true">
            <Upload size={18} strokeWidth={2} />
          </span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>Importar backup</span>
            <span className={styles.rowDesc}>
              Restaura dados a partir de um arquivo .json. Substitui os dados atuais.
            </span>
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className={styles.hiddenInput}
          onChange={(e) => {
            void handleArquivoEscolhido(e);
          }}
          aria-hidden="true"
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Conta</h2>
        <button
          type="button"
          className={`${styles.row} ${styles.rowDestructive}`}
          onClick={() => setConfirmacao({ tipo: 'sair' })}
        >
          <span className={styles.rowIcon} aria-hidden="true">
            <LogOut size={18} strokeWidth={2} />
          </span>
          <span className={styles.rowMain}>
            <span className={styles.rowTitle}>Sair da conta</span>
            <span className={styles.rowDesc}>
              Limpa nome e tag da loja. Seus dados (listas, anotações, catálogo)
              permanecem salvos no aparelho.
            </span>
          </span>
        </button>
      </section>

      <p className={styles.versao}>FruitaLite v1.0</p>

      {confirmacao?.tipo === 'sair' && (
        <div
          className={styles.confirmOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmacao(null);
          }}
        >
          <div className={styles.confirmDialog}>
            <p className={styles.confirmTitle}>Sair da conta?</p>
            <p className={styles.confirmDesc}>
              Você precisará informar nome e loja novamente. Seus dados continuam
              salvos no aparelho.
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.btnCancelar}
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnDestructivo}
                onClick={handleSair}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmacao?.tipo === 'import' && (
        <div
          className={styles.confirmOverlay}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmacao(null);
          }}
        >
          <div className={styles.confirmDialog}>
            <p className={styles.confirmTitle}>Importar este backup?</p>
            <p className={styles.confirmDesc}>
              O backup contém: <strong>{confirmacao.resumo.listas}</strong> listas,{' '}
              <strong>{confirmacao.resumo.anotacoes}</strong> anotações,{' '}
              <strong>{confirmacao.resumo.catalogo}</strong> produtos no catálogo
              {confirmacao.resumo.usuario ? ', e dados do usuário' : ''}.
              <br />
              <br />
              Isso vai <strong>substituir</strong> os dados atuais. Recomendamos
              exportar um backup antes.
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.btnCancelar}
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnConfirmar}
                onClick={() => {
                  void confirmacao.aplicar();
                }}
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
