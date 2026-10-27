import { ArrowLeft, Calendar, CalendarRange, MapPin, Pencil, Send, X } from 'lucide-react'
import { useState } from 'react'
import { CATS, PERIODS, ROOMS, cat } from '../data/catalog'
import { dayChips, estimate, firstName, money, roomUnits, size, whenLabel } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Avatar, CategoryTile, Chip, Stepper } from '../components/ui'
import CepField from '../components/CepField'

const STEPS = 5

function StepService({ d, flow, go }) {
  const list = flow.only ? CATS.filter((c) => flow.only.includes(c.id)) : CATS
  return (
    <>
      <h2 className="q">Qual serviço?</h2>
      <p className="hint">{flow.only && d.pro ? `Serviços que ${firstName(d.pro)} faz.` : 'Toque para continuar.'}</p>
      <div className="catgrid">
        {list.map((c) => <CategoryTile key={c.id} c={c} on={d.cat === c.id} onClick={() => go('pickCat', c.id)} />)}
      </div>
    </>
  )
}

function StepDetails({ d, go }) {
  const c = cat(d.cat)
  return (
    <>
      <h2 className="q">O que precisa em {c.nome.toLowerCase()}?</h2>
      <p className="hint">Toque em tudo que se aplica.</p>
      <div className="chips wrap">
        {c.subs.map((s) => <Chip key={s} on={d.subs.includes(s)} showCheck onClick={() => go('toggleSub', s)}>{s}</Chip>)}
      </div>

      {d.rooms ? (
        <>
          <h3 className="q2">Como é o imóvel?</h3>
          <div className="rooms">
            {ROOMS.map((r) => (
              <div key={r.id} className="room">
                <span>{r.varios[0].toUpperCase() + r.varios.slice(1)}</span>
                <Stepper value={d.rooms[r.id]} onChange={(n) => go('room', { id: r.id, n })} labels={[`Menos ${r.varios}`, `Mais ${r.varios}`]} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h3 className="q2">Quantos {c.uns}?</h3>
          <Stepper value={d.qty} onChange={(n) => go('qty', n)} />
          {d.moveis != null && (
            <>
              <h3 className="q2">Quantos móveis grandes?</h3>
              <p className="hint">Geladeira, fogão, sofá, guarda-roupa, cama, máquina de lavar…</p>
              <Stepper value={d.moveis} onChange={(n) => go('moveis', n)} labels={['Menos móveis', 'Mais móveis']} />
            </>
          )}
        </>
      )}
    </>
  )
}

function StepWhen({ d, go }) {
  return (
    <>
      <h2 className="q">Quando?</h2>
      <p className="hint">Escolha o dia e o período.</p>
      <div className="chips wrap">
        {dayChips().map((w) => (
          <Chip key={w.label} on={d.when === w.label} icon={w.data ? null : CalendarRange} onClick={() => go('when', w)}>{w.label}</Chip>
        ))}
      </div>
      {d.data && (
        <>
          <h3 className="q2">Em qual período?</h3>
          <div className="periods">
            {PERIODS.map(({ id, Icon, horas }) => (
              <button key={id} className={`period ${d.periodo === id ? 'on' : ''}`} onClick={() => go('periodo', id)} aria-pressed={d.periodo === id}>
                <Icon size={22} />{id}<small>{horas}</small>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function StepWhere({ d, go }) {
  return (
    <>
      <h2 className="q">Onde?</h2>
      <p className="hint">Rua e número só vão para o profissional com quem você firmar o pedido.</p>
      <div className="card">
        <CepField value={d.addr} onFound={(a) => go('addr', a)} />
        {d.addr && (
          <>
            <label className="field" style={{ marginTop: 10 }}>
              <small>Número</small>
              <input inputMode="numeric" placeholder="Ex.: 120" maxLength={20} value={d.addr.numero || ''} onChange={(e) => go('addr', { numero: e.target.value })} />
            </label>
            <label className="field" style={{ marginTop: 10 }}>
              <small>Complemento (opcional)</small>
              <input placeholder="Ex.: ap 42, bloco B" maxLength={60} value={d.addr.complemento || ''} onChange={(e) => go('addr', { complemento: e.target.value })} />
            </label>
          </>
        )}
      </div>
    </>
  )
}

function SummaryRow({ icon: Icon, label, value, onClick }) {
  return (
    <button className="row" onClick={onClick}>
      <span className="ic sm"><Icon size={18} /></span>
      <span className="rl"><small>{label}</small><b>{value}</b></span>
      <Pencil size={16} />
    </button>
  )
}

function StepReview({ d, go }) {
  const c = cat(d.cat)
  const [lo, hi] = estimate(d)
  return (
    <>
      <h2 className="q">Tudo certo?</h2>
      <p className="hint">Toque em uma linha para mudar.</p>
      {d.pro && <div className="banner"><Avatar person={d.pro} />Pedido direto para {d.pro.nome}</div>}
      <SummaryRow icon={c.Icon} label={c.nome} value={`${d.subs.join(', ')}, ${size(c, d)}`} onClick={() => go('goto', 1)} />
      <SummaryRow icon={Calendar} label="Quando" value={whenLabel(d)} onClick={() => go('goto', 2)} />
      <SummaryRow icon={MapPin} label="Onde" value={`${d.addr.rua}, ${d.addr.numero.trim()}, ${d.addr.bairro}`} onClick={() => go('goto', 3)} />
      <div className="est">
        <small>Estimativa pela média da região</small>
        <b>{money(lo)} a {money(hi)}</b>
        <small>O valor final você combina com o profissional no chat.</small>
      </div>
    </>
  )
}

const STEP_VIEWS = [StepService, StepDetails, StepWhen, StepWhere, StepReview]

export default function RequestFlow() {
  const { state, go, act } = useApp()
  const { flow, draft: d } = state
  const [sending, setSending] = useState(false)
  const step = flow.step
  const canContinue = [
    !!d.cat,
    d.subs.length > 0 && (!d.rooms || roomUnits(d.rooms) > 0),
    !!d.when && (!d.data || !!d.periodo),
    !!d.addr?.numero?.trim(),
    true,
  ][step]
  const View = STEP_VIEWS[step]

  const publish = async () => {
    setSending(true)
    await act.publish(d)
    setSending(false)
  }

  return (
    <div className="overlay" role="dialog" aria-label="Novo pedido">
      <div className="ohead">
        <button className="iconbtn" onClick={() => go('back')} aria-label="Voltar"><ArrowLeft size={20} /></button>
        <span className="lbl">Passo {step + 1} de {STEPS}</span>
        <button className="iconbtn" onClick={() => go('closeFlow')} aria-label="Fechar"><X size={20} /></button>
      </div>
      <div className="prog">{Array.from({ length: STEPS }, (_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      <div className="obody"><View d={d} flow={flow} go={go} /></div>

      {step > 0 && (
        <div className="ofoot">
          {step < STEPS - 1 ? (
            <button className="btn" onClick={() => go('next')} disabled={!canContinue}>Continuar</button>
          ) : (
            <button className="btn" onClick={publish} disabled={sending}>
              <Send size={18} />{sending ? 'Enviando…' : d.pro ? `Enviar para ${firstName(d.pro)}` : 'Publicar pedido'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
