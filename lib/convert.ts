import { Buffer } from 'node:buffer'
import {
  type Hex,
  hexToBigInt,
  hexToString,
  isHex,
  numberToHex,
  pad,
  stringToHex,
  keccak256 as toKeccak256,
} from 'viem'

type ConversionResult =
  | { operation: string; result: string | number }
  | { operation: string; error: string }

export const MAX_CONVERSION_OPERATIONS = 64
export const MAX_CONVERSION_VALUE_LENGTH = 65_536
export const MAX_CONVERSION_OUTPUT_LENGTH = 262_144

export function convertOperations(input: string, operations: string[]) {
  if (input.length > MAX_CONVERSION_VALUE_LENGTH) {
    throw new Error('Conversion input exceeds the 65536-character limit.')
  }
  if (operations.length > MAX_CONVERSION_OPERATIONS) {
    throw new Error('Conversion chain exceeds the 64-operation limit.')
  }
  let outputLength = 0
  let currentValue: string | number = input

  // First convert from input format to initial value
  // Check input type
  if (typeof input === 'string') {
    if (isHex(input)) {
      currentValue = input as Hex
    } else if (!Number.isNaN(Number(input))) {
      currentValue = Number(input)
    } else {
      currentValue = input
    }
  } else if (typeof input === 'number') {
    currentValue = input
  } else {
    throw new Error('Invalid input type. Expected string or number.')
  }

  // Process each operation in sequence
  const results = operations.map((operation: string) => {
    const result = ((): ConversionResult => {
      try {
        // Reserve a conservative output bound before any conversion allocates.
        const length =
          typeof currentValue === 'string' ? currentValue.length : 310
        let bound = length
        if (operation === 'toHex') {
          bound =
            typeof currentValue === 'string'
              ? 2 + 2 * Buffer.byteLength(currentValue, 'utf8')
              : 258
        } else if (operation === 'toKeccak256' || operation === 'pad32') {
          bound = 66
        } else if (operation === 'toBigInt') {
          bound = 2 * length + 2
        } else if (operation === 'toNumber') {
          bound = 32
        }
        if (bound > MAX_CONVERSION_VALUE_LENGTH) {
          throw new Error(
            'Conversion result exceeds the 65536-character limit.',
          )
        }
        if (outputLength + bound > MAX_CONVERSION_OUTPUT_LENGTH) {
          throw new Error(
            'Conversion output exceeds the 262144-character limit.',
          )
        }
        switch (operation) {
          case 'toHex':
            if (typeof currentValue === 'string') {
              return { operation, result: stringToHex(currentValue) }
            }
            if (typeof currentValue === 'number') {
              return { operation, result: numberToHex(currentValue) }
            }
            if (isHex(currentValue)) {
              return { operation, result: currentValue }
            }
            throw new Error('Cannot convert to hex')

          case 'toString':
            if (isHex(currentValue)) {
              return { operation, result: hexToString(currentValue) }
            }
            return { operation, result: String(currentValue) }

          case 'toNumber':
            if (isHex(currentValue)) {
              return {
                operation,
                result: Number(hexToBigInt(currentValue)),
              }
            }
            return { operation, result: Number(currentValue) }

          case 'toKeccak256':
            if (isHex(currentValue)) {
              return { operation, result: toKeccak256(currentValue) }
            }
            if (typeof currentValue === 'string') {
              return {
                operation,
                result: toKeccak256(stringToHex(currentValue)),
              }
            }
            throw new Error('Cannot compute keccak256')

          case 'pad32':
            if (isHex(currentValue)) {
              return { operation, result: pad(currentValue) }
            }
            throw new Error('Can only pad hex values')

          case 'toBigInt':
            if (isHex(currentValue)) {
              return {
                operation,
                result: hexToBigInt(currentValue).toString(),
              }
            }
            return { operation, result: BigInt(currentValue).toString() }

          default:
            throw new Error(`Unknown operation: ${operation}`)
        }
      } catch (error) {
        return {
          operation,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })()
    if ('result' in result) {
      currentValue = result.result
      outputLength += String(result.result).length
    }
    return result
  })

  return results
}
