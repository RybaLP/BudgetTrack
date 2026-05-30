import { useState } from 'react';
import {useAccountsApi } from "../hooks/useAccountApi"
import {useTransactionsApi} from "../hooks/useTransactionApi"
import { useBudgetStore } from '../store/useBudgetStore';

const fmt = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' });

const CATEGORIES = ['Jedzenie', 'Transport', 'Rozrywka', 'Mieszkanie', 'Zdrowie', 'Zakupy', 'Oszczędności', 'Inne'];
const EMPTY_FORM = { description: '', amount: '', category: '', accountId: '', date: new Date().toISOString().slice(0, 16), type: 'EXPENSE' as 'EXPENSE' | 'INCOME' };

export default function TransactionsPage() {
  const { useGetAll: useGetAllTx, useAdd: useAddTx, useDelete: useDeleteTx } = useTransactionsApi();
  const { useGetAll: useGetAllAcc } = useAccountsApi();

  const { data: transactions = [], isLoading } = useGetAllTx();
  const { data: accounts = [] } = useGetAllAcc();
  const addTransaction = useAddTx();
  const deleteTransaction = useDeleteTx();

  const { filterCategory, filterFrom, filterTo, setFilterCategory, setFilterFrom, setFilterTo, isTransactionModalOpen, setTransactionModalOpen } = useBudgetStore();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const totalIncome = (transactions as any[])
    .filter((t: any) => t.type === 'INCOME')
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  const totalExpense = (transactions as any[])
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const handleSubmit = () => {
    if (!form.description.trim()) return setFormError('Podaj opis transakcji.');
    if (!form.amount || isNaN(Number(form.amount))) return setFormError('Podaj poprawną kwotę.');
    if (!form.category) return setFormError('Wybierz kategorię.');
    if (!form.accountId) return setFormError('Wybierz konto.');
    setFormError('');
    addTransaction.mutate(
      { description: form.description, amount: Number(form.amount), category: form.category, accountId: Number(form.accountId), date: form.date, type: form.type },
      { onSuccess: () => { setForm({ ...EMPTY_FORM }); setTransactionModalOpen(false); }, onError: () => setFormError('Błąd podczas dodawania. Spróbuj ponownie.') }
    );
  };

  const handleDelete = (id: number) => {
    setDeleting(id);
    deleteTransaction.mutate(id, { onSettled: () => setDeleting(null) });
  };

  return (
    <div style={styles.page}>
      <div style={styles.noise} />
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <p style={styles.eyebrow}>BUDGET APP</p>
            <h1 style={styles.title}>Transakcje</h1>
          </div>
          <button style={styles.newBtn} onClick={() => setTransactionModalOpen(true)}>＋ Nowa</button>
        </div>
        <div style={styles.summaryBar}>
          <div style={styles.summaryItem}><span style={styles.summaryLabel}>PRZYCHODY</span><span style={{ ...styles.summaryVal, color: '#6ee7b7' }}>{fmt(totalIncome)}</span></div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}><span style={styles.summaryLabel}>WYDATKI</span><span style={{ ...styles.summaryVal, color: '#fca5a5' }}>{fmt(totalExpense)}</span></div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}><span style={styles.summaryLabel}>SALDO</span><span style={{ ...styles.summaryVal, color: balance >= 0 ? '#c8f55a' : '#fca5a5' }}>{fmt(balance)}</span></div>
        </div>
      </header>
      <main style={styles.main}>
        <div style={styles.filters}>
          <select style={styles.select} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">Wszystkie kategorie</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input style={styles.filterInput} type="datetime-local" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
          <input style={styles.filterInput} type="datetime-local" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
          {(filterCategory || filterFrom || filterTo) && (
            <button style={styles.clearBtn} onClick={() => { setFilterCategory(''); setFilterFrom(''); setFilterTo(''); }}>✕ Wyczyść</button>
          )}
        </div>
        {isLoading ? (
          <div style={styles.loading}><div style={styles.spinner} /><span>Ładowanie transakcji…</span></div>
        ) : (transactions as any[]).length === 0 ? (
          <div style={styles.empty}><span style={styles.emptyIcon}>◯</span><p>Brak transakcji. Dodaj pierwszą powyżej.</p></div>
        ) : (
          <ul style={styles.list}>
            {(transactions as any[]).map((t: any, i: number) => {
              const isIncome = t.type === 'INCOME';
              const dateStr = t.transactionDate ?? t.date;
              return (
                <li key={t.id} style={{ ...styles.card, animationDelay: `${i * 40}ms` }}>
                  <div style={styles.cardLeft}>
                    <div style={{ ...styles.typeTag, background: isIncome ? 'rgba(110,231,183,0.12)' : 'rgba(252,165,165,0.12)', color: isIncome ? '#6ee7b7' : '#fca5a5' }}>
                      {isIncome ? '▲' : '▼'}
                    </div>
                    <div>
                      <p style={styles.cardDesc}>{t.description}</p>
                      <p style={styles.cardMeta}>
                        {t.category && <span style={styles.pill}>{t.category}</span>}
                        {dateStr && <span style={styles.cardDate}>{fmtDate(dateStr)}</span>}
                      </p>
                    </div>
                  </div>
                  <div style={styles.cardRight}>
                    <span style={{ ...styles.amount, color: isIncome ? '#6ee7b7' : '#fca5a5' }}>
                      {isIncome ? '+' : '-'}{fmt(Math.abs(t.amount))}
                    </span>
                    <button
                      style={{ ...styles.deleteBtn, opacity: deleting === t.id ? 0.5 : 1 }}
                      onClick={() => handleDelete(t.id)}
                      disabled={deleting === t.id}
                      title="Usuń transakcję"
                    >✕</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {isTransactionModalOpen && (
        <div style={styles.overlay} onClick={() => setTransactionModalOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nowa transakcja</h2>
              <button style={styles.closeBtn} onClick={() => setTransactionModalOpen(false)}>✕</button>
            </div>
            <div style={styles.typeToggle}>
              {(['EXPENSE', 'INCOME'] as const).map(type => (
                <button key={type} style={{ ...styles.typeBtn, background: form.type === type ? (type === 'INCOME' ? '#6ee7b7' : '#fca5a5') : 'transparent', color: form.type === type ? '#0e0f11' : '#6b7280', borderColor: form.type === type ? (type === 'INCOME' ? '#6ee7b7' : '#fca5a5') : '#272a30' }} onClick={() => setForm(f => ({ ...f, type }))}>
                  {type === 'INCOME' ? '▲ Przychód' : '▼ Wydatek'}
                </button>
              ))}
            </div>
            <div style={styles.formGrid}>
              <label style={styles.label}>Opis<input style={styles.input} placeholder="np. Zakupy Biedronka" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
              <label style={styles.label}>Kwota (PLN)<input style={styles.input} type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></label>
              <label style={styles.label}>Kategoria
                <select style={styles.input} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">Wybierz…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label style={styles.label}>Konto
                <select style={styles.input} value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}>
                  <option value="">Wybierz konto…</option>
                  {(accounts as any[]).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              <label style={{ ...styles.label, gridColumn: '1 / -1' }}>Data<input style={styles.input} type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></label>
            </div>
            {formError && <p style={styles.error}>{formError}</p>}
            <button style={{ ...styles.submitBtn, opacity: addTransaction.isPending ? 0.6 : 1, background: form.type === 'INCOME' ? '#6ee7b7' : '#c8f55a' }} onClick={handleSubmit} disabled={addTransaction.isPending}>
              {addTransaction.isPending ? 'Dodawanie…' : 'Dodaj transakcję'}
            </button>
          </div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

const C = { bg: '#0e0f11', surface: '#16181c', border: '#272a30', accent: '#c8f55a', text: '#f0f0ee', muted: '#6b7280' };

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: '"DM Mono", monospace', color: C.text, position: 'relative' },
  noise: { position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 0 },
  header: { borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 },
  headerInner: { maxWidth: 800, margin: '0 auto', padding: '40px 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { fontSize: 11, letterSpacing: '0.18em', color: C.muted, margin: '0 0 8px' },
  title: { fontFamily: '"DM Serif Display", serif', fontSize: 48, fontWeight: 400, margin: 0, lineHeight: 1 },
  newBtn: { background: C.accent, color: '#0e0f11', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: '"DM Mono", monospace', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  summaryBar: { maxWidth: 800, margin: '0 auto', padding: '20px 24px', display: 'flex', gap: 0 },
  summaryItem: { flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 4 },
  summaryLabel: { fontSize: 10, letterSpacing: '0.18em', color: C.muted },
  summaryVal: { fontFamily: '"DM Serif Display", serif', fontSize: 26 },
  summaryDivider: { width: 1, background: C.border, margin: '0 32px' },
  main: { maxWidth: 800, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 },
  filters: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' as const },
  select: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: '"DM Mono", monospace', fontSize: 13, color: C.text, outline: 'none' },
  filterInput: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontFamily: '"DM Mono", monospace', fontSize: 13, color: C.text, outline: 'none' },
  clearBtn: { background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 16px', fontFamily: '"DM Mono", monospace', fontSize: 12, color: C.muted, cursor: 'pointer' },
  loading: { display: 'flex', alignItems: 'center', gap: 16, color: C.muted, padding: '48px 0', justifyContent: 'center' },
  spinner: { width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  empty: { textAlign: 'center' as const, padding: '80px 0', color: C.muted },
  emptyIcon: { display: 'block', fontSize: 48, marginBottom: 16 },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 },
  card: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'fadeUp 0.3s ease both' },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  typeTag: { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 },
  cardDesc: { margin: 0, fontSize: 15, fontWeight: 500 },
  cardMeta: { margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 8 },
  pill: { fontSize: 10, letterSpacing: '0.1em', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', color: C.muted },
  cardDate: { fontSize: 11, color: C.muted },
  cardRight: { display: 'flex', alignItems: 'center', gap: 16 },
  amount: { fontFamily: '"DM Serif Display", serif', fontSize: 20, flexShrink: 0 },
  deleteBtn: { background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, width: 32, height: 32, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 },
  modal: { background: '#1a1c21', border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, animation: 'modalIn 0.25s ease' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: '"DM Serif Display", serif', fontSize: 28, fontWeight: 400, margin: 0 },
  closeBtn: { background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, width: 32, height: 32, cursor: 'pointer', fontSize: 13 },
  typeToggle: { display: 'flex', gap: 10, marginBottom: 24 },
  typeBtn: { flex: 1, border: '1px solid', borderRadius: 8, padding: '10px', fontFamily: '"DM Mono", monospace', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  label: { display: 'flex', flexDirection: 'column' as const, gap: 6, fontSize: 11, letterSpacing: '0.12em', color: C.muted },
  input: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '11px 14px', fontFamily: '"DM Mono", monospace', fontSize: 14, color: C.text, outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  error: { color: '#fca5a5', fontSize: 13, margin: '0 0 16px' },
  submitBtn: { width: '100%', border: 'none', borderRadius: 10, padding: '14px', fontFamily: '"DM Mono", monospace', fontSize: 15, fontWeight: 500, color: '#0e0f11', cursor: 'pointer', transition: 'opacity 0.15s' },
};