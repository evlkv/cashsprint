const addr = document.getElementById('addr')
const statusEl = document.getElementById('status')
const amountEl = document.getElementById('amount')
const emailEl = document.getElementById('email')
const txEl = document.getElementById('tx')

document.querySelectorAll('[data-amount]').forEach((el) => {
  el.addEventListener('click', () => {
    amountEl.value = el.getAttribute('data-amount')
  })
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') el.click()
  })
})

document.getElementById('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(addr.textContent.trim())
    statusEl.textContent = 'Address copied.'
  } catch {
    statusEl.textContent = 'Copy failed — select the address manually.'
  }
})

document.getElementById('lead').addEventListener('click', async () => {
  const email = emailEl.value.trim()
  const amount = Number(amountEl.value)
  const txHash = (txEl?.value || '').trim()
  if (!email || !email.includes('@')) {
    statusEl.textContent = 'Enter a valid email first.'
    return
  }
  statusEl.textContent = 'Sending…'
  try {
    const apiBase = window.location.pathname.includes('/cashsprint')
      ? 'https://volkov.evgeny.m2.fvds.ru/sprint/api'
      : '/sprint/api'
    const res = await fetch(`${apiBase}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        amountUsdt: amount,
        address: addr.textContent.trim(),
        txHash,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Request failed')
    statusEl.textContent = 'Logged. Kickoff starts after on-chain confirmation.'
  } catch (err) {
    statusEl.textContent = err.message || 'Could not reach API — keep the tx hash.'
  }
})
