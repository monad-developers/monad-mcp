import assert from 'node:assert/strict'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { keccak256, pad, stringToHex } from 'viem'

const origin = process.argv[2] || 'http://localhost:3000'
const client = new Client({ name: 'convert-regression', version: '1.0.0' })
try {
  await client.connect(new SSEClientTransport(new URL(`${origin}/sse`)))
  const cases = [
    ['100', ['toHex', 'pad32', 'toNumber'], ['0x64', pad('0x64'), 100]],
    [
      'hello',
      ['toHex', 'toKeccak256'],
      [stringToHex('hello'), keccak256(stringToHex('hello'))],
    ],
    ['0x3432', ['toString', 'toNumber', 'toHex'], ['42', 42, '0x2a']],
    [`0x${'0'.repeat(65533)}1`, ['toBigInt', 'toHex'], ['1', '0x31']],
  ]
  for (const [input, operations, expected] of cases) {
    const result = await client.callTool({
      name: 'convert',
      arguments: { input, operations },
    })
    assert.equal(result.isError, undefined)
    const body = JSON.parse(result.content[0].text)
    assert.deepEqual(body.input, { value: input })
    assert.deepEqual(
      body.conversions,
      operations.map((operation, i) => ({ operation, result: expected[i] })),
    )
  }
  const amplified = await client.callTool({
    name: 'convert',
    arguments: { input: 'hello', operations: Array(26).fill('toHex') },
  })
  const amplifiedBody = JSON.parse(amplified.content[0].text)
  assert.equal(
    amplifiedBody.conversions.filter((value) => 'result' in value).length,
    13,
  )
  assert.ok(
    amplifiedBody.conversions
      .slice(13)
      .every((value) => value.error.includes('65536')),
  )
  for (const args of [
    { input: 'x'.repeat(65537), operations: [] },
    { input: 'x', operations: Array(65).fill('toString') },
  ]) {
    await assert.rejects(
      client.callTool({ name: 'convert', arguments: args }),
      (error) => error.code === -32602,
    )
  }
  const recovered = await client.callTool({
    name: 'convert',
    arguments: { input: '100', operations: ['toHex', 'toNumber'] },
  })
  assert.deepEqual(
    JSON.parse(recovered.content[0].text).conversions.map(
      (value) => value.result,
    ),
    ['0x64', 100],
  )
  console.log(
    'Amplification and oversized requests are bounded through SSE; a later normal request succeeds.',
  )
  console.log(
    'Four conversion chains pass through the MCP SSE transport and Redis.',
  )
} finally {
  await client.close()
}
