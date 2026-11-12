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
