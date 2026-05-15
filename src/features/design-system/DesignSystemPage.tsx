import { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Trash2,
  Apple,
  Star,
  ArrowRight,
  ClipboardList,
  Pencil,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Card } from '@components/Card';
import { Chip } from '@components/Chip';
import { BadgeFase } from '@components/BadgeFase';
import { BottomNav } from '@components/BottomNav';
import { ProgressBar } from '@components/ProgressBar';
import { EmptyState } from '@components/EmptyState';
import { useToastStore } from '@stores/toastStore';
import styles from './DesignSystemPage.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

export function DesignSystemPage() {
  const [selectedCard, setSelectedCard] = useState(false);
  const [chipSelected, setChipSelected] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [quantidadeValue, setQuantidadeValue] = useState('2');
  const [precoValue, setPrecoValue] = useState('3');
  const [progress, setProgress] = useState(40);
  const { show } = useToastStore();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Design System</h1>
        <p className={styles.pageSubtitle}>FruitaLite · Sprint 2</p>
      </header>

      {/* ── COLORS ─────────────────────────────────────────── */}
      <Section title="Cores">
        <div className={styles.colorGrid}>
          {[
            ['--background', 'Background'],
            ['--surface', 'Surface'],
            ['--surface-sunken', 'Sunken'],
            ['--primary', 'Primary'],
            ['--primary-soft', 'Primary soft'],
            ['--text', 'Text'],
            ['--text-muted', 'Muted'],
            ['--border', 'Border'],
            ['--success', 'Success'],
            ['--warning', 'Warning'],
            ['--error', 'Error'],
            ['--info', 'Info'],
          ].map(([token, label]) => (
            <div key={token} className={styles.colorSwatch}>
              <div
                className={styles.swatchBox}
                style={{ background: `var(${token})`, border: '1px solid var(--border)' }}
              />
              <span className={styles.swatchLabel}>{label}</span>
              <code className={styles.swatchToken}>{token}</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── TYPOGRAPHY ─────────────────────────────────────── */}
      <Section title="Tipografia">
        <p className="t-display-lg">Display LG — Manrope 28/800</p>
        <p className="t-display">Display — Manrope 22/700</p>
        <p className="t-display-sm">Display SM — Manrope 18/600</p>
        <p className="t-body-lg">Body LG — Manrope 17/400</p>
        <p className="t-body">Body — Manrope 15/400</p>
        <p className="t-body-sm">Body SM — Manrope 13/400</p>
        <p className="t-label">Label — Manrope 13/600</p>
        <p className="t-caption">Caption — Manrope 11/500</p>
        <p className="t-data tabular">Data — Inter 15/600 · 1.234,56</p>
      </Section>

      {/* ── BUTTONS ────────────────────────────────────────── */}
      <Section title="Button">
        <Row>
          <Button variant="primary" size="lg">Primário LG</Button>
          <Button variant="primary">Primário MD</Button>
          <Button variant="primary" size="sm">Primário SM</Button>
        </Row>
        <Row>
          <Button variant="secondary">Secundário</Button>
          <Button variant="tertiary">Terciário</Button>
          <Button variant="destructive">Destrutivo</Button>
        </Row>
        <Row>
          <Button variant="primary" iconLeft={<Plus size={16} />}>Com ícone</Button>
          <Button variant="secondary" iconRight={<ArrowRight size={16} />}>Continuar</Button>
          <Button variant="icon" aria-label="Buscar"><Search size={20} /></Button>
          <Button variant="icon" aria-label="Editar"><Pencil size={20} /></Button>
          <Button variant="icon" aria-label="Excluir"><Trash2 size={20} /></Button>
        </Row>
        <Row>
          <Button variant="primary" disabled>Desabilitado</Button>
          <Button variant="primary" fullWidth>Full width</Button>
        </Row>
      </Section>

      {/* ── INPUT ──────────────────────────────────────────── */}
      <Section title="Input">
        <Input
          label="Nome"
          placeholder="Ex: Caleb"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          helperText="Obrigatório"
        />
        <Input
          variant="numeric"
          label="Quantidade"
          placeholder="0"
          suffix="kg"
          value={quantidadeValue}
          onChange={(e) => setQuantidadeValue(e.target.value)}
        />
        <Input
          variant="numeric"
          label="Valor unitário"
          placeholder="0,00"
          prefix="R$"
          value={precoValue}
          onChange={(e) => setPrecoValue(e.target.value)}
        />
        <Input
          variant="search"
          placeholder="Buscar produto..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClear={() => setSearchValue('')}
        />
        <Input
          label="Com erro"
          placeholder="..."
          value="valor inválido"
          onChange={() => {}}
          error="Campo obrigatório"
        />
        <Input label="Desabilitado" placeholder="..." value="" onChange={() => {}} disabled />
      </Section>

      {/* ── CARDS ──────────────────────────────────────────── */}
      <Section title="Card">
        <Card>
          <p style={{ margin: 0 }}>Card estático — conteúdo qualquer</p>
        </Card>
        <Card variant="interactive" onClick={() => {}} aria-label="Card interativo">
          <p style={{ margin: 0 }}>Card interativo — clicável</p>
        </Card>
        <Card
          variant="selectable"
          selected={selectedCard}
          onClick={() => setSelectedCard((v) => !v)}
          aria-label="Maçã"
        >
          <span style={{ fontSize: 24 }}>🍎</span>
          <p style={{ margin: '4px 0 0' }}>Maçã {selectedCard ? '(selecionado)' : ''}</p>
        </Card>
      </Section>

      {/* ── CHIPS ──────────────────────────────────────────── */}
      <Section title="Chip">
        <Row>
          <Chip variant="primary">Primary</Chip>
          <Chip variant="success">Sucesso</Chip>
          <Chip variant="warning">Aviso</Chip>
          <Chip variant="error">Erro</Chip>
          <Chip variant="info">Info</Chip>
          <Chip variant="neutral">Neutro</Chip>
        </Row>
        <Row>
          <Chip variant="primary" size="sm">SM</Chip>
          <Chip variant="primary" size="md">MD</Chip>
          <Chip
            variant="primary"
            icon={<Apple size={12} />}
            onClick={() => setChipSelected((v) => !v)}
            selected={chipSelected}
          >
            Filtro {chipSelected ? '✓' : ''}
          </Chip>
        </Row>
      </Section>

      {/* ── BADGE FASE ─────────────────────────────────────── */}
      <Section title="BadgeFase">
        <Row>
          <BadgeFase fase="planejamento" />
          <BadgeFase fase="comprando" />
          <BadgeFase fase="concluida" />
        </Row>
        <Row>
          <BadgeFase fase="planejamento" size="sm" />
          <BadgeFase fase="comprando" size="sm" />
          <BadgeFase fase="concluida" size="sm" />
        </Row>
      </Section>

      {/* ── PROGRESS BAR ───────────────────────────────────── */}
      <Section title="ProgressBar">
        <ProgressBar value={progress} label="Progresso da compra" />
        <ProgressBar value={progress} size="sm" label="Progresso SM" />
        <Row>
          <Button variant="secondary" size="sm" onClick={() => setProgress((v) => Math.max(0, v - 10))}>
            −10
          </Button>
          <span className="t-data tabular" style={{ minWidth: 40, textAlign: 'center' }}>
            {progress}%
          </span>
          <Button variant="secondary" size="sm" onClick={() => setProgress((v) => Math.min(100, v + 10))}>
            +10
          </Button>
        </Row>
      </Section>

      {/* ── EMPTY STATE ────────────────────────────────────── */}
      <Section title="EmptyState">
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Nenhuma lista por aqui"
          description="Crie sua primeira lista de compras e comece a planejar."
          action={<Button variant="primary" iconLeft={<Plus size={16} />}>Nova lista</Button>}
        />
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="Sem anotações"
          description="Suas anotações aparecerão aqui."
        />
        <EmptyState title="Sem título e sem ícone" />
      </Section>

      {/* ── TOASTS ─────────────────────────────────────────── */}
      <Section title="Toast">
        <Row>
          <Button variant="secondary" size="sm" onClick={() => show('Lista salva com sucesso!', 'success')}>
            Success
          </Button>
          <Button variant="secondary" size="sm" onClick={() => show('Preencha todos os valores.', 'warning')}>
            Warning
          </Button>
          <Button variant="secondary" size="sm" onClick={() => show('Algo deu errado.', 'error')}>
            Error
          </Button>
          <Button variant="secondary" size="sm" onClick={() => show('Dica: toque para detalhes.', 'info')}>
            Info
          </Button>
        </Row>
      </Section>

      {/* ── BOTTOM NAV PREVIEW ─────────────────────────────── */}
      <Section title="BottomNav">
        <p className="t-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
          A barra de navegação aparece fixada ao rodapé do app.
        </p>
        <div className={styles.navPreview}>
          <BottomNav />
        </div>
      </Section>

      {/* ── SPACING ────────────────────────────────────────── */}
      <Section title="Espaçamento">
        <div className={styles.spacingGrid}>
          {[
            ['--space-base', '4px'],
            ['--space-xs', '8px'],
            ['--space-sm', '16px'],
            ['--space-md', '24px'],
            ['--space-lg', '32px'],
            ['--space-xl', '48px'],
          ].map(([token, size]) => (
            <div key={token} className={styles.spacingRow}>
              <div
                className={styles.spacingBar}
                style={{ width: `var(${token})`, height: 16, background: 'var(--primary-soft)', border: '1px solid var(--primary)' }}
              />
              <code className={styles.swatchToken}>{token} ({size})</code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ICONS ──────────────────────────────────────────── */}
      <Section title="Ícones (Lucide)">
        <Row>
          {[ShoppingBag, Plus, Search, Trash2, Pencil, Check, ChevronRight, X, Apple, Star, ArrowRight, ClipboardList].map(
            (Icon, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  padding: 12,
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                <Icon size={24} />
              </span>
            ),
          )}
        </Row>
      </Section>

      {/* bottom padding so last section isn't behind nav */}
      <div style={{ height: 32 }} />
    </div>
  );
}
