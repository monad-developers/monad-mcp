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

export function convertOperations(input: string, operations: string[]) {
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
    if ('result' in result) currentValue = result.result
    return result
  })

  return results
}
