// Supabase polyfill for browser
globalThis.global = globalThis
globalThis.process = { env: {} }
globalThis.Buffer = class Buffer extends Uint8Array {
  static from(data) {
    return new Uint8Array(data)
  }
  static alloc(size) {
    return new Uint8Array(size)
  }
}
