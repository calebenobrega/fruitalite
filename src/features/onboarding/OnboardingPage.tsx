import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsuarioStore } from '@stores/usuarioStore';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import styles from './OnboardingPage.module.css';

export function OnboardingPage() {
  const navigate = useNavigate();
  const salvar = useUsuarioStore((s) => s.salvar);

  const [nome, setNome] = useState('');
  const [tagLoja, setTagLoja] = useState('');
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const erroNome = tentouEnviar && nome.trim() === '' ? 'Informe seu nome' : undefined;
  const erroTag = tentouEnviar && tagLoja.trim() === '' ? 'Informe a loja ou feira' : undefined;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTentouEnviar(true);
    if (nome.trim() === '' || tagLoja.trim() === '') return;
    salvar({ nome: nome.trim(), tagLoja: tagLoja.trim() });
    navigate('/', { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <img
          src="/brand/01_horizontal_creme.svg"
          alt="FruitaLite"
          className={styles.logo}
          draggable={false}
        />
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.fields}>
          <Input
            label="Seu nome"
            placeholder="Ex: Calebe"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={erroNome}
            autoComplete="given-name"
            autoFocus
          />
          <Input
            label="Loja ou feira"
            placeholder="Ex: Supermercado Paulistão"
            value={tagLoja}
            onChange={(e) => setTagLoja(e.target.value)}
            error={erroTag}
            autoComplete="off"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth>
          Começar
        </Button>
      </form>
    </div>
  );
}
