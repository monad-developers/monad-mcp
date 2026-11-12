import assert from 'node:assert/strict'
import test from 'node:test'
import { keccak256, pad, stringToHex } from 'viem'
import { convertOperations } from '../lib/convert.ts'

test('conversions use the preceding successful result', () => {
  assert.deepEqual(convertOperations('100', ['toHex', 'pad32', 'toNumber']), [
    { operation: 'toHex', result: '0x64' },
    { operation: 'pad32', result: pad('0x64') },
    { operation: 'toNumber', result: 100 },
  ])
})

test('text can be encoded, padded, and hashed in sequence', () => {
  const encoded = stringToHex('hello')
  assert.deepEqual(
    convertOperations('hello', ['toHex', 'pad32', 'toKeccak256']),
    [
      { operation: 'toHex', result: encoded },
      { operation: 'pad32', result: pad(encoded) },
      { operation: 'toKeccak256', result: keccak256(pad(encoded)) },
    ],
  )
})

test('a failed operation preserves the last successful value', () => {
  const results = convertOperations('42', [
    'toHex',
    'toNumber',
    'pad32',
    'toBigInt',
  ])
  assert.deepEqual(results, [
    { operation: 'toHex', result: '0x2a' },
    { operation: 'toNumber', result: 42 },
    { operation: 'pad32', error: 'Can only pad hex values' },
    { operation: 'toBigInt', result: '42' },
  ])
})

test('a string decoded from hex becomes the input for the next conversion', () => {
  assert.deepEqual(
    convertOperations('0x3432', ['toString', 'toNumber', 'toHex']),
    [
      { operation: 'toString', result: '42' },
      { operation: 'toNumber', result: 42 },
      { operation: 'toHex', result: '0x2a' },
    ],
  )
})

test('a bigint result is reused without changing its string representation', () => {
  const value = '900719925474099312345'
  assert.deepEqual(
    convertOperations(stringToHex(value), ['toString', 'toBigInt', 'toHex']),
    [
      { operation: 'toString', result: value },
      { operation: 'toBigInt', result: BigInt(value).toString() },
      { operation: 'toHex', result: stringToHex(value) },
    ],
  )
})

test('empty operations keep the existing empty output', () => {
  assert.deepEqual(convertOperations('hello', []), [])
})

test('errors do not reset a converted value back to the original hex input', () => {
  assert.deepEqual(
    convertOperations('0x3432', ['toString', 'pad32', 'toNumber']),
    [
      { operation: 'toString', result: '42' },
      { operation: 'pad32', error: 'Can only pad hex values' },
      { operation: 'toNumber', result: 42 },
    ],
  )
})

test('a failed first operation does not prevent later conversions', () => {
  assert.deepEqual(convertOperations('hello', ['pad32', 'toHex']), [
    { operation: 'pad32', error: 'Can only pad hex values' },
    { operation: 'toHex', result: stringToHex('hello') },
  ])
})

test('repeated hex encoding is bounded before allocating the next result', () => {
  const results = convertOperations('hello', Array(15).fill('toHex'))
  const values = results.filter((value) => 'result' in value)
  assert.equal(values.at(-1).result.length, 57342)
  assert.ok(values.every((value) => value.result.length <= 65536))
  assert.ok(
    results
      .slice(values.length)
      .every((value) => value.error.includes('65536')),
  )
})

test('hex encoding checks UTF-8 bytes rather than UTF-16 code units', () => {
  const results = convertOperations('😀'.repeat(8192), ['toHex', 'toKeccak256'])
  assert.match(results[0].error, /65536/)
  assert.equal(results[1].result, keccak256(stringToHex('😀'.repeat(8192))))
})

test('the value limit permits the boundary and preserves the last good value', () => {
  const input = 'a'.repeat(32767)
  const results = convertOperations(input, ['toHex', 'toHex', 'toString'])
  assert.equal(results[0].result.length, 65536)
  assert.match(results[1].error, /65536/)
  assert.equal(results[2].result, input)
})

test('retained output is bounded across individually small results', () => {
  const input = 'a'.repeat(16384)
  const results = convertOperations(input, Array(64).fill('toString'))
  assert.equal(results.filter((value) => 'result' in value).length, 16)
  assert.ok(results.slice(16).every((value) => value.error.includes('262144')))
})

test('oversized input and chains are rejected, including empty chains', () => {
  assert.throws(() => convertOperations('x'.repeat(65537), []), /input exceeds/)
  assert.throws(
    () => convertOperations('x', Array(65).fill('toString')),
    /64-operation/,
  )
  assert.equal(
    convertOperations('x'.repeat(65536), ['toString'])[0].result.length,
    65536,
  )
  assert.equal(convertOperations('x', Array(64).fill('toString')).length, 64)
})

test('large finite numbers retain their existing conversions', () => {
  const results = convertOperations('1e300', ['toHex', 'toBigInt'])
  assert.equal(results[1].result, BigInt(1e300).toString())
})

test('leading-zero hexadecimal bigints use their actual decimal size', () => {
  for (const length of [32768, 65536]) {
    const input = `0x${'0'.repeat(length - 3)}1`
    assert.deepEqual(convertOperations(input, ['toBigInt', 'toHex']), [
      { operation: 'toBigInt', result: '1' },
      { operation: 'toHex', result: '0x31' },
    ])
  }
})

test('bigint decimal output respects the exact value boundary', () => {
  for (const length of [65536, 65537]) {
    const decimal = '9'.repeat(length)
    const input = `0x${BigInt(decimal).toString(16)}`
    const [result] = convertOperations(input, ['toBigInt'])
    if (length === 65536) assert.equal(result.result, decimal)
    else assert.match(result.error, /65536/)
  }
})

test('bigint decimal output respects the remaining aggregate budget', () => {
  const decimal = '9'.repeat(65536)
  const input = `0x${BigInt(decimal).toString(16)}`
  const results = convertOperations(input, Array(5).fill('toBigInt'))
  assert.equal(results.filter((r) => 'result' in r).length, 4)
  assert.ok(results.slice(0, 4).every((r) => r.result === decimal))
  assert.match(results[4].error, /262144/)
})

test('bigint sign and binary and octal prefixes retain their meaning', () => {
  for (const value of [
    '-123',
    `0b${'0'.repeat(30000)}1`,
    `0o${'0'.repeat(30000)}7`,
  ]) {
    const encoded = stringToHex(value)
    // Decode first so long integer strings are not coerced to Number.
    const results = convertOperations(encoded, ['toString', 'toBigInt'])
    assert.equal(results[1].result, BigInt(value).toString())
  }
})
