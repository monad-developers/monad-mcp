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
  console.log(
    'Three conversion chains pass through the MCP SSE transport and Redis.',
  )
} finally {
  await client.close()
}
