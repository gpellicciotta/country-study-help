export function EventTargetMixin(Base) {
  return class extends Base {
    constructor(...args) {
      super(...args);
      this._eventTarget = document.createDocumentFragment();
    }

    addEventListener(...args) {
      this._eventTarget.addEventListener(...args);
    }

    removeEventListener(...args) {
      this._eventTarget.removeEventListener(...args);
    }

    dispatchEvent(...args) {
      return this._eventTarget.dispatchEvent(...args);
    }
  };
}