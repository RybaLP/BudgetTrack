import { useState } from 'react';
import {useAccountsApi } from "../hooks/useAccountApi"

const fmt = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

export default function AccountsPage() {
  const { useGetAll, useAdd, useDelete } = useAccountsApi();
  const { data: accounts = [], isLoading } = useGetAll();
  const addAccount = useAdd();
  const deleteAccount = useDelete();
  const [newName, setNewName] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    addAccount.mutate({ name }, { onSuccess: () => setNewName('') });
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    deleteAccount.mutate(id, { onSettled: () => setDeleting(null) });
  };

  return (
    <div style={styles.page}>
      <div style={styles.noise} />
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <p style={styles.eyebrow}>BUDGET APP</p>
            <h1 style={styles.title}>Konta</h1>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNum}>{(accounts as any[]).length}</span>
            <span style={styles.statLabel}>kont</span>
          </div>
        </div>
      </header>
      <main style={styles.main}>
        <section style={styles.addCard}>
          <p style={styles.addLabel}>NOWE KONTO</p>
          <div style={styles.addRow}>
            <input
              style={styles.input}
              placeholder="np. Konto główne, Oszczędności…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button
              style={{ ...styles.addBtn, opacity: addAccount.isPending ? 0.6 : 1 }}
              onClick={handleAdd}
              disabled={addAccount.isPending}
            >
              {addAccount.isPending ? '…' : '＋ Dodaj'}
            </button>
          </div>
        </section>
        {isLoading ? (
          <div style={styles.loading}><div style={styles.spinner} /><span>Ładowanie kont…</span></div>
        ) : (accounts as any[]).length === 0 ? (
          <div style={styles.empty}><span style={styles.emptyIcon}>◯</span><p>Brak kont. Dodaj pierwsze powyżej.</p></div>
        ) : (
          <ul style={styles.list}>
            {(accounts as any[]).map((acc: any, i: number) => (
              <li key={acc.id} style={{ ...styles.card, animationDelay: `${i * 60}ms` }}>
                <div style={styles.cardLeft}>
                  <div style={styles.avatar}>{acc.name?.[0]?.toUpperCase() ?? '?'}</div>
                  <div>
                    <p style={styles.cardName}>{acc.name}</p>
                    <p style={styles.cardId}>ID #{acc.id}</p>
                  </div>
                </div>
                <div style={styles.cardRight}>
                  {acc.balance != null && <span style={styles.balance}>{fmt(acc.balance)}</span>}
                  <button
                    style={{ ...styles.deleteBtn, opacity: deleting === acc.id ? 0.5 : 1 }}
                    onClick={() => handleDelete(acc.id)}
                    disabled={deleting === acc.id}
                    title="Usuń konto"
                  >✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const C = { bg: '#0e0f11', surface: '#16181c', border: '#272a30', accent: '#c8f55a', text: '#f0f0ee', muted: '#6b7280' };

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: '"DM Mono", monospace', color: C.text, position: 'relative', overflow: 'hidden' },
  noise: { position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 0 },
  header: { borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 },
  headerInner: { maxWidth: 760, margin: '0 auto', padding: '40px 24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { fontSize: 11, letterSpacing: '0.18em', color: C.muted, margin: '0 0 8px' },
  title: { fontFamily: '"DM Serif Display", serif', fontSize: 48, fontWeight: 400, margin: 0, lineHeight: 1 },
  stat: { textAlign: 'right' as const },
  statNum: { display: 'block', fontFamily: '"DM Serif Display", serif', fontSize: 56, lineHeight: 1, color: C.accent },
  statLabel: { fontSize: 11, letterSpacing: '0.15em', color: C.muted, textTransform: 'uppercase' as const },
  main: { maxWidth: 760, margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  addCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px 28px', marginBottom: 32 },
  addLabel: { fontSize: 10, letterSpacing: '0.2em', color: C.muted, margin: '0 0 12px' },
  addRow: { display: 'flex', gap: 12 },
  input: { flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 16px', fontFamily: '"DM Mono", monospace', fontSize: 14, color: C.text, outline: 'none' },
  addBtn: { background: C.accent, color: '#0e0f11', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: '"DM Mono", monospace', fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' as const },
  loading: { display: 'flex', alignItems: 'center', gap: 16, color: C.muted, padding: '48px 0', justifyContent: 'center' },
  spinner: { width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  empty: { textAlign: 'center' as const, padding: '80px 0', color: C.muted },
  emptyIcon: { display: 'block', fontSize: 48, marginBottom: 16 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeUp 0.35s ease both' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  avatar: { width: 44, height: 44, borderRadius: '50%', background: C.accent, color: '#0e0f11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Serif Display", serif', fontSize: 20, flexShrink: 0 },
  cardName: { margin: 0, fontSize: 16, fontWeight: 500, color: C.text },
  cardId: { margin: '2px 0 0', fontSize: 11, color: C.muted, letterSpacing: '0.05em' },
  cardRight: { display: 'flex', alignItems: 'center', gap: 20 },
  balance: { fontFamily: '"DM Serif Display", serif', fontSize: 20, color: C.accent },
  deleteBtn: { background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, width: 32, height: 32, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
};