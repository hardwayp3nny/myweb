const WORKER_URL = process.env.WORKER_URL || 'https://io-reward.2089426079.workers.dev/';

// 其余的 JavaScript 代码...
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 允许跨域请求
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }

  // 从 KV 中读取数据
  const data = await NAMESPACE.get('miningData', 'json')

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  if (request.method === 'POST') {
    const body = await request.json()
    const { processor, price } = body

    const selectedProcessor = data.processors.find(p => p.name === processor)
    if (!selectedProcessor) {
      return new Response(JSON.stringify({ error: 'Processor not found' }), { headers })
    }

    const dailyRewardUSD = selectedProcessor.reward
    const dailyRewardCNY = dailyRewardUSD * data.usdCnyRate
    const paybackDays = price / dailyRewardCNY
    const paybackMonths = paybackDays / 30

    return new Response(JSON.stringify({
      paybackDays: paybackDays.toFixed(2),
      paybackMonths: paybackMonths.toFixed(2)
    }), { headers })
  }

  // 默认返回所有数据
  return new Response(JSON.stringify(data), { headers })
}
