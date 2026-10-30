// Verificação do celular no cadastro com Firebase Phone Auth: o Firebase envia o SMS e confere o código;
// a chama-api recebe o ID token e confere o telefone. O SDK só carrega quando alguém pede o código.
const env = import.meta.env
const CONFIG = window.CHAMA_CONFIG?.firebase || {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const MESSAGES = {
  'auth/invalid-phone-number': 'Número inválido. Confira o DDD e o celular.',
  'auth/too-many-requests': 'Muitas tentativas com este número. Tente de novo mais tarde.',
  'auth/quota-exceeded': 'Não conseguimos enviar SMS agora. Tente de novo mais tarde.',
  'auth/invalid-verification-code': 'Código incorreto. Confira os números do SMS.',
  'auth/code-expired': 'O código expirou. Toque em "Reenviar código".',
  'auth/missing-verification-code': 'Digite o código do SMS.',
  'auth/network-request-failed': 'Sem conexão. Confira a internet e tente de novo.',
}

// Erro com mensagem em português; `code` = 'codigo_expirado' quando é preciso pedir outro SMS.
export class PhoneAuthError extends Error {
  constructor(err) {
    super(MESSAGES[err.code] || 'Não conseguimos verificar o celular agora. Tente de novo.')
    if (err.code === 'auth/code-expired') this.code = 'codigo_expirado'
    if (!MESSAGES[err.code]) console.error('Firebase Phone Auth:', err) // configuração (domínio, chave, SMS desativado) aparece aqui
  }
}

let fb // { auth, mod } depois do primeiro uso
let verifier
let confirmation

async function load() {
  if (fb) return fb
  if (!CONFIG.apiKey || !CONFIG.projectId || !CONFIG.appId) throw new Error('Firebase não configurado (FIREBASE_API_KEY, FIREBASE_PROJECT_ID e FIREBASE_APP_ID)')
  const [{ initializeApp }, mod] = await Promise.all([import('firebase/app'), import('firebase/auth')])
  const auth = mod.getAuth(initializeApp(CONFIG))
  auth.languageCode = 'pt-BR'
  fb = { auth, mod }
  return fb
}

// `tel` mascarado ou só dígitos (DDD + número). Usa o reCAPTCHA invisível em #recaptcha (index.html).
export async function sendPhoneCode(tel) {
  try {
    const { auth, mod } = await load()
    verifier?.clear()
    verifier = new mod.RecaptchaVerifier(auth, 'recaptcha', { size: 'invisible' })
    confirmation = await mod.signInWithPhoneNumber(auth, `+55${tel.replace(/\D/g, '')}`, verifier)
  } catch (err) {
    throw new PhoneAuthError(err)
  }
}

// Confere o código e devolve o ID token para POST /auth/register.
export async function confirmPhoneCode(code) {
  if (!confirmation) throw new PhoneAuthError({ code: 'auth/code-expired' })
  try {
    const cred = await confirmation.confirm(code)
    return await cred.user.getIdToken()
  } catch (err) {
    throw new PhoneAuthError(err)
  }
}

// A sessão do Firebase só serve para provar o telefone; a conta do app usa o JWT da chama-api.
export async function endPhoneSession() {
  confirmation = null
  if (fb) await fb.mod.signOut(fb.auth).catch(() => {})
}
