import {useAccountsApi } from "../hooks/useAccountApi"
import {useTransactionsApi} from "../hooks/useTransactionApi"
import { useBudgetStore } from '../store/useBudgetStore';

const fmt = (n: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' });

const CATEGORY_COLORS: Record<string, string> = {
  Jedzenie: '#f97316', Transport: '#3b82f6', Rozrywka: '#a855f7',
  Mieszkanie: '#ec4899', Zdrowie: '#14b8a6', Zakupy: '#f59e0b',
  Oszczędności: '#6ee7b7', Inne: '#6b7280',
};

export default function DashboardPage() {
  const { useGetAll: useGetAllAcc } = useAccountsApi();
  const { useGetAll: useGetAllTx, useGetSummary } = useTransactionsApi();

  const { data: accounts = [], isLoading: loadingAccounts } = useGetAllAcc();
  const { data: transactions = [], isLoading: loadingTx } = useGetAllTx();
  const { data: summary, isLoading: loadingSummary } = useGetSummary();
  const { setTransactionModalOpen } = useBudgetStore();

  const income = (summary as any)?.totalIncome ?? 0;
  const expense = (summary as any)?.totalExpenses ?? 0;
  const balance = income - expense;

  const expensesByCategory: Record<string, number> =
    (summary as any)?.expensesByCategory ?? {};

  const categories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCat = categories[0]?.[1] || 1;

  const recent = [...(transactions as any[])]
    .sort((a, b) => new Date(b.transactionDate ?? b.date).getTime() - new Date(a.transactionDate ?? a.date).getTime())
    .slice(0, 5);

  return (
    <div style={S.page}>
      <div style={S.noise} />
      <header style={S.header}>
        <div style={S.headerInner}>
          <div><p style={S.eyebrow}>BUDGET APP</p><h1 style={S.title}>Dashboard</h1></div>
          <button style={S.newBtn} onClick={() => setTransactionModalOpen(true)}>＋ Dodaj transakcję</button>
        </div>
      </header>
      <main style={S.main}>

        {/* KPI z backendu */}
        <div style={S.kpiRow}>
          <div style={{ ...S.kpiCard, borderColor: 'rgba(200,245,90,0.3)' }}>
            <p style={S.kpiLabel}>SALDO</p>
            {loadingSummary
              ? <div style={S.spinner} />
              : <p style={{ ...S.kpiVal, color: balance >= 0 ? '#c8f55a' : '#fca5a5' }}>{fmt(balance)}</p>
            }
            <div style={{ ...S.kpiBar, background: 'rgba(200,245,90,0.12)' }} />
          </div>
          <div style={{ ...S.kpiCard, borderColor: 'rgba(110,231,183,0.3)' }}>
            <p style={S.kpiLabel}>PRZYCHODY</p>
            {loadingSummary
              ? <div style={S.spinner} />
              : <p style={{ ...S.kpiVal, color: '#6ee7b7' }}>{fmt(income)}</p>
            }
            <div style={{ ...S.kpiBar, background: 'rgba(110,231,183,0.1)' }} />
          </div>
          <div style={{ ...S.kpiCard, borderColor: 'rgba(252,165,165,0.3)' }}>
            <p style={S.kpiLabel}>WYDATKI</p>
            {loadingSummary
              ? <div style={S.spinner} />
              : <p style={{ ...S.kpiVal, color: '#fca5a5' }}>{fmt(expense)}</p>
            }
            <div style={{ ...S.kpiBar, background: 'rgba(252,165,165,0.1)' }} />
          </div>
          <div style={{ ...S.kpiCard, borderColor: 'rgba(167,139,250,0.3)' }}>
            <p style={S.kpiLabel}>KONTA</p>
            <p style={{ ...S.kpiVal, color: '#a78bfa' }}>{loadingAccounts ? '…' : (accounts as any[]).length}</p>
            <div style={{ ...S.kpiBar, background: 'rgba(167,139,250,0.1)' }} />
          </div>
        </div>

        <div style={S.gridTwo}>

          <div style={S.panel}>
            <p style={S.panelLabel}>WYDATKI WG KATEGORII</p>
            {loadingSummary
              ? <div style={S.loading}><div style={S.spinner} /></div>
              : categories.length === 0
              ? <p style={S.empty}>Brak danych</p>
              : (
                <div style={S.catList}>
                  {categories.map(([cat, val]) => (
                    <div key={cat} style={S.catRow}>
                      <div style={S.catLeft}>
                        <div style={{ ...S.catDot, background: CATEGORY_COLORS[cat] ?? '#6b7280' }} />
                        <span style={S.catName}>{cat}</span>
                      </div>
                      <div style={S.catBarWrap}>
                        <div style={{ ...S.catBarFill, width: `${(Number(val) / maxCat) * 100}%`, background: CATEGORY_COLORS[cat] ?? '#6b7280' }} />
                      </div>
                      <span style={S.catVal}>{fmt(Number(val))}</span>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Konta */}
          <div style={S.panel}>
            <p style={S.panelLabel}>TWOJE KONTA</p>
            {loadingAccounts
              ? <div style={S.loading}><div style={S.spinner} /></div>
              : (accounts as any[]).length === 0
              ? <p style={S.empty}>Brak kont</p>
              : (
                <ul style={S.acctList}>
                  {(accounts as any[]).map((acc: any) => (
                    <li key={acc.id} style={S.acctItem}>
                      <div style={S.acctAvatar}>{acc.name?.[0]?.toUpperCase() ?? '?'}</div>
                      <div style={S.acctInfo}>
                        <p style={S.acctName}>{acc.name}</p>
                        <p style={S.acctId}>ID #{acc.id}</p>
                      </div>
                      {acc.balance != null && (
                        <span style={{
                          ...S.acctBalance,
                          color: Number(acc.balance) >= 0 ? '#c8f55a' : '#fca5a5',
                        }}>
                          {fmt(Number(acc.balance))}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>

        <div style={S.panel}>
          <p style={S.panelLabel}>OSTATNIE TRANSAKCJE</p>
          {loadingTx
            ? <div style={S.loading}><div style={S.spinner} /></div>
            : recent.length === 0
            ? <p style={S.empty}>Brak transakcji</p>
            : (
              <ul style={S.txList}>
                {recent.map((t: any, i: number) => {
                  const isIncome = t.type === 'INCOME';
                  const dateStr = t.transactionDate ?? t.date;
                  return (
                    <li key={t.id} style={{ ...S.txItem, animationDelay: `${i * 50}ms` }}>
                      <div style={{ ...S.txIcon, background: isIncome ? 'rgba(110,231,183,0.12)' : 'rgba(252,165,165,0.12)', color: isIncome ? '#6ee7b7' : '#fca5a5' }}>
                        {isIncome ? '▲' : '▼'}
                      </div>
                      <div style={S.txInfo}>
                        <p style={S.txDesc}>{t.description}</p>
                        <div style={S.txMeta}>
                          {t.category && <span style={S.pill}>{t.category}</span>}
                          {dateStr && <span style={S.txDate}>{fmtDate(dateStr)}</span>}
                        </div>
                      </div>
                      <span style={{ ...S.txAmount, color: isIncome ? '#6ee7b7' : '#fca5a5' }}>
                        {isIncome ? '+' : '-'}{fmt(Math.abs(t.amount))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
        </div>

      </main>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const C = { bg: '#0e0f11', surface: '#16181c', border: '#272a30', accent: '#c8f55a', text: '#f0f0ee', muted: '#6b7280' };

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: C.bg, fontFamily: '"DM Mono", monospace', color: C.text, position: 'relative' },
  noise: { position: 'fixed', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`, pointerEvents: 'none', zIndex: 0 },
  header: { borderBottom: `1px solid ${C.border}`, position: 'relative', zIndex: 1 },
  headerInner: { maxWidth: 900, margin: '0 auto', padding: '40px 24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { fontSize: 11, letterSpacing: '0.18em', color: C.muted, margin: '0 0 8px' },
  title: { fontFamily: '"DM Serif Display", serif', fontSize: 48, fontWeight: 400, margin: 0, lineHeight: 1 },
  newBtn: { background: C.accent, color: '#0e0f11', border: 'none', borderRadius: 8, padding: '12px 24px', fontFamily: '"DM Mono", monospace', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  main: { maxWidth: 900, margin: '0 auto', padding: '36px 24px 64px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' as const, gap: 24 },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  kpiCard: { background: C.surface, border: '1px solid', borderRadius: 14, padding: '24px 24px 20px', position: 'relative', overflow: 'hidden' },
  kpiLabel: { fontSize: 10, letterSpacing: '0.2em', color: C.muted, margin: '0 0 10px' },
  kpiVal: { fontFamily: '"DM Serif Display", serif', fontSize: 28, margin: 0, lineHeight: 1 },
  kpiBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, borderRadius: '0 0 14px 14px' },
  gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  panel: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 28px 24px' },
  panelLabel: { fontSize: 10, letterSpacing: '0.2em', color: C.muted, margin: '0 0 20px' },
  loading: { display: 'flex', justifyContent: 'center', padding: '24px 0' },
  spinner: { width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  empty: { color: C.muted, fontSize: 13, textAlign: 'center' as const, padding: '16px 0' },
  catList: { display: 'flex', flexDirection: 'column' as const, gap: 14 },
  catRow: { display: 'grid', gridTemplateColumns: '120px 1fr 90px', alignItems: 'center', gap: 12 },
  catLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  catDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  catName: { fontSize: 12, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const },
  catBarWrap: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s ease', opacity: 0.8 },
  catVal: { fontSize: 12, color: C.muted, textAlign: 'right' as const },
  acctList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' as const, gap: 12 },
  acctItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` },
  acctAvatar: { width: 38, height: 38, borderRadius: '50%', background: C.accent, color: '#0e0f11', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Serif Display", serif', fontSize: 18, flexShrink: 0 },
  acctInfo: { flex: 1 },
  acctName: { margin: 0, fontSize: 14, fontWeight: 500 },
  acctId: { margin: '2px 0 0', fontSize: 11, color: C.muted },
  acctBalance: { fontFamily: '"DM Serif Display", serif', fontSize: 18 },
  txList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' as const, gap: 8 },
  txItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: `1px solid ${C.border}`, animation: 'fadeUp 0.3s ease both' },
  txIcon: { width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 },
  txInfo: { flex: 1 },
  txDesc: { margin: 0, fontSize: 14, fontWeight: 500 },
  txMeta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 },
  pill: { fontSize: 10, letterSpacing: '0.08em', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, borderRadius: 4, padding: '2px 8px', color: C.muted },
  txDate: { fontSize: 11, color: C.muted },
  txAmount: { fontFamily: '"DM Serif Display", serif', fontSize: 18, flexShrink: 0 },
};