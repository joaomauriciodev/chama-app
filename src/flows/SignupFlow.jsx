import { ArrowLeft, CreditCard, Megaphone, QrCode, X } from 'lucide-react'
import { CATS, PAY_METHODS, PLANS } from '../data/catalog'
import { dateLabel, firstName, maskPhone, price } from '../lib/format'
import { useApp } from '../state/AppContext'
import { AreaPicker, AvailGrid, CategoryTile, Chip } from '../components/ui'
import CepField from '../components/CepField'

const STEPS = 5
const PAY_ICONS = { Pix: QrCode, 'Cartão de crédito': CreditCard }

function StepAbout({ u, go }) {
  return (
    <>
      <h2 className="q">Como você se chama?</h2>
      <p className="hint">Os clientes veem seu nome, sua nota e seus serviços.</p>
      <label className="field">
        <small>Nome completo</small>
        <input autoComplete="name" placeholder="Ex.: Lucas Prado" value={u.nome} onChange={(e) => go('su', { nome: e.target.value })} />
      </label>
      <label className="field" style={{ marginTop: 10 }}>
        <small>WhatsApp</small>
        <input inputMode="tel" autoComplete="tel-national" placeholder="(11) 90000-0000" value={u.tel} onChange={(e) => go('su', { tel: maskPhone(e.target.value) })} />
      </label>
    </>
  )
}

function StepServices({ u, go }) {
  return (
    <>
      <h2 className="q">O que você faz?</h2>
      <p className="hint">Toque em todos os serviços que você oferece.</p>
      <div className="catgrid">
        {CATS.map((c) => <CategoryTile key={c.id} c={c} on={u.cats.includes(c.id)} checkWhenOn onClick={() => go('suCat', c.id)} />)}
      </div>
    </>
  )
}

function StepArea({ u, go }) {
  return (
    <>
      <h2 className="q">Onde você atende?</h2>
      <p className="hint">Informe o CEP de onde você sai e até onde vai.</p>
      <div className="card">
        <CepField value={u.base} onFound={(a) => go('su', { base: a })} />
        <AreaPicker value={u.area} onChange={(a) => go('su', { area: a })} />
      </div>
    </>
  )
}

function StepAvail({ u, go }) {
  return (
    <>
      <h2 className="q">Quando você trabalha?</h2>
      <p className="hint">Toque nos períodos livres. Dá para mudar depois no perfil.</p>
      <AvailGrid avail={u.avail} onToggle={(id) => go('suAvail', id)} />
    </>
  )
}

function StepPlan({ u, go }) {
  const base = PLANS[0].mensal
  return (
    <>
      <h2 className="q">Escolha seu plano</h2>
      <p className="hint">Seu perfil aparece para os clientes da sua área durante todo o período.</p>
      {PLANS.map((p) => {
        const off = Math.round((1 - p.mensal / base) * 100)
        return (
          <button key={p.meses} className={`plan ${u.plan === p.meses ? 'on' : ''}`} onClick={() => go('su', { plan: p.meses })} aria-pressed={u.plan === p.meses}>
            <span className="pl-main">
              <b>{p.meses} meses {p.tag && <span className="tag">{p.tag}</span>}</b>
              <span className="pl-price"><strong>{price(p.mensal)}</strong>/mês</span>
              <small>{price(p.mensal * p.meses)} à vista{off > 0 ? `, economize ${off}%` : ''}</small>
            </span>
            <span className="radio" />
          </button>
        )
      })}
      <h3 className="q2">Como quer pagar?</h3>
      <div className="chips wrap">
        {PAY_METHODS.map((m) => <Chip key={m} on={u.pay === m} icon={PAY_ICONS[m]} onClick={() => go('su', { pay: m })}>{m}</Chip>)}
      </div>
      <p className="muted small" style={{ marginTop: 14 }}>Pagamento único pelo período, sem renovação automática.</p>
    </>
  )
}

function Done({ u, go }) {
  return (
    <div className="match-c">
      <div className="radar"><span /><span /><span /><b><Megaphone size={32} /></b></div>
      <h2>Pronto, {firstName(u)}! Seu perfil está no ar</h2>
      <p className="muted">Plano de {u.plan} meses, ativo até {dateLabel(u.until)}.</p>
      <div style={{ width: '100%', marginTop: 24 }}>
        <button className="btn" onClick={() => go('finishSignup')}>Ver pedidos da minha área</button>
      </div>
    </div>
  )
}

const STEP_VIEWS = [StepAbout, StepServices, StepArea, StepAvail, StepPlan]

export default function SignupFlow() {
  const { state, go, act } = useApp()
  const u = state.signup
  const { step } = u

  if (step === STEPS) return <div className="overlay" role="dialog" aria-label="Cadastro concluído"><Done u={u} go={go} /></div>

  const canContinue = [
    u.nome.trim().split(/\s+/).length >= 2 && u.tel.replace(/\D/g, '').length === 11,
    u.cats.length > 0,
    !!u.base,
    Object.values(u.avail).some(Boolean),
    true,
  ][step]
  const View = STEP_VIEWS[step]
  const plan = PLANS.find((p) => p.meses === u.plan)

  return (
    <div className="overlay" role="dialog" aria-label="Cadastro de profissional">
      <div className="ohead">
        <button className="iconbtn" onClick={() => go('suBack')} disabled={u.paying} aria-label="Voltar"><ArrowLeft size={20} /></button>
        <span className="lbl">Cadastro, passo {step + 1} de {STEPS}</span>
        <button className="iconbtn" onClick={() => go('closeSignup')} disabled={u.paying} aria-label="Fechar"><X size={20} /></button>
      </div>
      <div className="prog">{Array.from({ length: STEPS }, (_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      <div className="obody"><View u={u} go={go} /></div>
      <div className="ofoot">
        {step < STEPS - 1 ? (
          <button className="btn" onClick={() => go('suNext')} disabled={!canContinue}>Continuar</button>
        ) : (
          <button className="btn" onClick={() => act.subscribe(u.plan)} disabled={u.paying}>
            {u.paying ? 'Processando pagamento…' : `Assinar por ${price(plan.mensal * plan.meses)}`}
          </button>
        )}
      </div>
    </div>
  )
}
