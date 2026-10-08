import { ArrowLeft, Banknote, Calendar, CalendarRange, Camera, Check, CreditCard, Mic, Pencil, QrCode, Send, X } from 'lucide-react'
import { ADDR, CATS, PERIODS, cat, pro } from '../data/catalog'
import { dayChips, estimate, firstName, money, unit, whenLabel } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Avatar, CategoryTile, Chip, Stepper } from '../components/ui'

const STEPS = 5
const PAYMENTS = [['Pix', QrCode], ['Cartão', CreditCard], ['Dinheiro', Banknote]]

function StepService({ d, flow, go }) {
  const list = flow.only ? CATS.filter((c) => flow.only.includes(c.id)) : CATS
  return (
    <>
      <h2 className="q">Qual serviço?</h2>
      <p className="hint">{flow.only ? `Serviços que ${firstName(pro(d.pro))} faz.` : 'Toque para continuar.'}</p>
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

      <h3 className="q2">Quantos {c.uns}?</h3>
      <Stepper value={d.qty} onChange={(n) => go('qty', n)} />

      <h3 className="q2">Prefere mostrar a escrever?</h3>
      <div className="extras">
        <button className={`extra ${d.foto ? 'on' : ''}`} onClick={() => go('toggleExtra', 'foto')} aria-pressed={d.foto}>
          {d.foto ? <Check size={20} /> : <Camera size={20} />}<span>{d.foto ? '2 fotos' : 'Tirar foto'}</span>
        </button>
        <button className={`extra ${d.audio ? 'on' : ''}`} onClick={() => go('toggleExtra', 'audio')} aria-pressed={d.audio}>
          {d.audio ? <Check size={20} /> : <Mic size={20} />}<span>{d.audio ? 'Áudio 0:12' : 'Gravar áudio'}</span>
        </button>
      </div>
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
          <Chip key={w} on={d.when === w} icon={w === 'Flexível' ? CalendarRange : null} onClick={() => go('when', w)}>{w}</Chip>
        ))}
      </div>
      {d.when && d.when !== 'Flexível' && (
        <>
          <h3 className="q2">Em qual período?</h3>
          <div className="periods">
            {PERIODS.map(({ id, Icon, horas }) => (
              <button key={id} className={`period ${d.period === id ? 'on' : ''}`} onClick={() => go('period', id)} aria-pressed={d.period === id}>
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
      <p className="hint">O endereço completo só vai para quem você escolher.</p>
      {ADDR.map((a) => (
        <button key={a.id} className={`addr ${d.where === a.id ? 'on' : ''}`} onClick={() => go('where', a.id)} aria-pressed={d.where === a.id}>
          <span className="ic sm"><a.Icon size={18} /></span>
          <span><b>{a.nome}</b><small>{a.end}</small></span>
          <span className="radio" />
        </button>
      ))}
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
  const a = ADDR.find((x) => x.id === d.where)
  const [lo, hi] = estimate(d)
  const p = d.pro ? pro(d.pro) : null
  return (
    <>
      <h2 className="q">Tudo certo?</h2>
      <p className="hint">Toque em uma linha para mudar.</p>
      {p && <div className="banner"><Avatar person={p} />Pedido direto para {p.nome}</div>}
      <SummaryRow icon={c.Icon} label={c.nome} value={`${d.subs.join(', ')}, ${unit(c, d.qty)}`} onClick={() => go('goto', 1)} />
      <SummaryRow icon={Calendar} label="Quando" value={whenLabel(d)} onClick={() => go('goto', 2)} />
      <SummaryRow icon={a.Icon} label="Onde" value={a.nome} onClick={() => go('goto', 3)} />
      <div className="est">
        <small>Estimativa pela média da região</small>
        <b>{money(lo)} a {money(hi)}</b>
        <small>Você só paga o valor da proposta que aceitar.</small>
      </div>
      <h3 className="q2">Como prefere pagar?</h3>
      <div className="chips wrap">
        {PAYMENTS.map(([label, Icon]) => <Chip key={label} on={d.pay === label} icon={Icon} onClick={() => go('pay', label)}>{label}</Chip>)}
      </div>
    </>
  )
}

const STEP_VIEWS = [StepService, StepDetails, StepWhen, StepWhere, StepReview]

export default function RequestFlow() {
  const { state, go, act } = useApp()
  const { flow, draft: d } = state
  const step = flow.step
  const canContinue = [
    !!d.cat,
    d.subs.length > 0,
    !!d.when && (d.when === 'Flexível' || !!d.period),
    !!d.where,
    true,
  ][step]
  const View = STEP_VIEWS[step]

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
            <button className="btn" onClick={act.publish}>
              <Send size={18} />{d.pro ? `Enviar para ${firstName(pro(d.pro))}` : 'Publicar pedido'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
