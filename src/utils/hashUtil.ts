import SHA256 from 'crypto-js/sha256'
import Hex from 'crypto-js/enc-hex'

export function sha256(input: string): string {
  return SHA256(input).toString(Hex)
}
