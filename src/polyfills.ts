// Pequeños polyfills para navegadores algo antiguos (Safari 14/15, móviles sin actualizar).
if (!Object.hasOwn) {
  Object.defineProperty(Object, "hasOwn", {
    value: (o: object, k: PropertyKey) => Object.prototype.hasOwnProperty.call(o, k),
    configurable: true,
    writable: true,
  });
}
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, "at", {
    value: function <T>(this: T[], i: number) {
      const n = Math.trunc(i) || 0;
      return this[n < 0 ? this.length + n : n];
    },
    configurable: true,
    writable: true,
  });
}
export {};
