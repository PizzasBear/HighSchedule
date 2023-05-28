import { createSignal, Accessor, Setter } from "solid-js";
import {
  createStore,
  Store,
  SetStoreFunction,
  NotWrappable,
  Part,
  StoreSetter,
} from "solid-js/store";

type W<T> = Exclude<T, NotWrappable>;
type KeyOf<T> = number extends keyof T
  ? 0 extends 1 & T
    ? keyof T
    : [T] extends [never]
    ? never
    : [T] extends [readonly unknown[]]
    ? number
    : keyof T
  : keyof T;
type PickMutable<T> = {
  [K in keyof T as (<U>() => U extends {
    [V in K]: T[V];
  }
    ? 1
    : 2) extends <U>() => U extends {
    -readonly [V in K]: T[V];
  }
    ? 1
    : 2
    ? K
    : never]: T[K];
};
type MutableKeyOf<T> = KeyOf<T> & keyof PickMutable<T>;
type Rest<T, U extends PropertyKey[], K extends KeyOf<T> = KeyOf<T>> = [
  T,
] extends [never]
  ? never
  : K extends MutableKeyOf<T>
  ? [Part<T, K>, ...RestSetterOrContinue<T[K], [K, ...U]>]
  : K extends KeyOf<T>
  ? [Part<T, K>, ...RestContinue<T[K], [K, ...U]>]
  : never;
type RestContinue<T, U extends PropertyKey[]> = 0 extends 1 & T
  ? [...Part<any>[], StoreSetter<any, PropertyKey[]>]
  : Rest<W<T>, U>;
type RestSetterOrContinue<T, U extends PropertyKey[]> =
  | [StoreSetter<T, U>]
  | RestContinue<T, U>;

export const tuple = <T extends unknown[]>(...args: T): T => args;
export const atuple = <T extends unknown[]>(args: [...T]): T => args;

export class Signal<T> {
  readonly get: Accessor<T>;
  readonly set: Setter<T>;

  constructor(value: T) {
    [this.get, this.set] = createSignal(value);
  }
}

export class StoreCell<T extends object> {
  readonly value: Store<T>;
  readonly set: SetStoreFunction<T>;

  constructor(value: T, options?: { name?: string }) {
    [this.value, this.set] = createStore(value, options);
  }

  get() {
    return this.value;
  }
}

export function ident<T>(value: T): T {
  return value;
}

export class SigMap<K, V> {
  readonly map: Map<K, Signal<V>>;

  constructor(iter?: Iterable<readonly [K, Exclude<V, Function>]>) {
    this.map = new Map();
    for (const [k, v] of iter ?? []) {
      this.set(k, v);
    }
  }

  clear() {
    this.map.clear();
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  entries() {
    return this.map.entries();
  }

  forEach(callbackfn: (value: Signal<V>, key: K, map: SigMap<K, V>) => void) {
    this.map.forEach((v, k) => callbackfn(v, k, this));
  }

  get(key: K): V | undefined {
    return this.map.get(key)?.get();
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  keys() {
    return this.map.keys();
  }

  set(key: K, value: Exclude<V, Function> | ((prev?: V) => V)) {
    const sig = this.map.get(key);
    if (sig === undefined) {
      this.map.set(
        key,
        new Signal(typeof value === "function" ? (value as any)() : value),
      );
    } else if (typeof value === "function") {
      sig.set(value);
    } else {
      sig.set(() => value);
    }
  }

  values() {
    return this.map.values();
  }

  [Symbol.iterator]() {
    return this.map[Symbol.iterator]();
  }
}

export class StoreMap<K, V extends object> {
  readonly map: Map<K, StoreCell<V>>;

  constructor(iter?: Iterable<readonly [K, V]>) {
    this.map = new Map();
    for (const [k, v] of iter ?? []) {
      this.insert(k, v);
    }
  }

  clear() {
    this.map.clear();
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  entries() {
    return this.map.entries();
  }

  forEach(
    callbackfn: (value: StoreCell<V>, key: K, map: StoreMap<K, V>) => void,
  ) {
    this.map.forEach((v, k) => callbackfn(v, k, this));
  }

  get(key: K): Store<V> | undefined {
    return this.map.get(key)?.value;
  }

  getCell(key: K): StoreCell<V> | undefined {
    return this.map.get(key);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  keys() {
    return this.map.keys();
  }

  insert(key: K, value: V): boolean {
    if (this.map.has(key)) {
      return false;
    } else {
      this.map.set(key, new StoreCell(value));
      return true;
    }
  }

  update<
    K1 extends KeyOf<W<V>>,
    K2 extends KeyOf<W<W<V>[K1]>>,
    K3 extends KeyOf<W<W<W<V>[K1]>[K2]>>,
    K4 extends KeyOf<W<W<W<W<V>[K1]>[K2]>[K3]>>,
    K5 extends KeyOf<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>>,
    K6 extends KeyOf<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>>,
    K7 extends MutableKeyOf<W<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>,
  >(
    key: K,
    k1: Part<W<V>, K1>,
    k2: Part<W<W<V>[K1]>, K2>,
    k3: Part<W<W<W<V>[K1]>[K2]>, K3>,
    k4: Part<W<W<W<W<V>[K1]>[K2]>[K3]>, K4>,
    k5: Part<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>, K5>,
    k6: Part<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
    k7: Part<W<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>,
    setter: StoreSetter<
      W<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7],
      [K7, K6, K5, K4, K3, K2, K1]
    >,
  ): void;
  update<
    K1 extends KeyOf<W<V>>,
    K2 extends KeyOf<W<W<V>[K1]>>,
    K3 extends KeyOf<W<W<W<V>[K1]>[K2]>>,
    K4 extends KeyOf<W<W<W<W<V>[K1]>[K2]>[K3]>>,
    K5 extends KeyOf<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>>,
    K6 extends MutableKeyOf<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>>,
  >(
    key: K,
    k1: Part<W<V>, K1>,
    k2: Part<W<W<V>[K1]>, K2>,
    k3: Part<W<W<W<V>[K1]>[K2]>, K3>,
    k4: Part<W<W<W<W<V>[K1]>[K2]>[K3]>, K4>,
    k5: Part<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>, K5>,
    k6: Part<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
    setter: StoreSetter<
      W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>[K6],
      [K6, K5, K4, K3, K2, K1]
    >,
  ): void;
  update<
    K1 extends KeyOf<W<V>>,
    K2 extends KeyOf<W<W<V>[K1]>>,
    K3 extends KeyOf<W<W<W<V>[K1]>[K2]>>,
    K4 extends KeyOf<W<W<W<W<V>[K1]>[K2]>[K3]>>,
    K5 extends MutableKeyOf<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>>,
  >(
    key: K,
    k1: Part<W<V>, K1>,
    k2: Part<W<W<V>[K1]>, K2>,
    k3: Part<W<W<W<V>[K1]>[K2]>, K3>,
    k4: Part<W<W<W<W<V>[K1]>[K2]>[K3]>, K4>,
    k5: Part<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>, K5>,
    setter: StoreSetter<
      W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5],
      [K5, K4, K3, K2, K1]
    >,
  ): void;
  update<
    K1 extends KeyOf<W<V>>,
    K2 extends KeyOf<W<W<V>[K1]>>,
    K3 extends KeyOf<W<W<W<V>[K1]>[K2]>>,
    K4 extends MutableKeyOf<W<W<W<W<V>[K1]>[K2]>[K3]>>,
  >(
    key: K,
    k1: Part<W<V>, K1>,
    k2: Part<W<W<V>[K1]>, K2>,
    k3: Part<W<W<W<V>[K1]>[K2]>, K3>,
    k4: Part<W<W<W<W<V>[K1]>[K2]>[K3]>, K4>,
    setter: StoreSetter<W<W<W<W<V>[K1]>[K2]>[K3]>[K4], [K4, K3, K2, K1]>,
  ): void;
  update<
    K1 extends KeyOf<W<V>>,
    K2 extends KeyOf<W<W<V>[K1]>>,
    K3 extends MutableKeyOf<W<W<W<V>[K1]>[K2]>>,
  >(
    key: K,
    k1: Part<W<V>, K1>,
    k2: Part<W<W<V>[K1]>, K2>,
    k3: Part<W<W<W<V>[K1]>[K2]>, K3>,
    setter: StoreSetter<W<W<W<V>[K1]>[K2]>[K3], [K3, K2, K1]>,
  ): void;
  update<K1 extends KeyOf<W<V>>, K2 extends MutableKeyOf<W<W<V>[K1]>>>(
    key: K,
    k1: Part<W<V>, K1>,
    k2: Part<W<W<V>[K1]>, K2>,
    setter: StoreSetter<W<W<V>[K1]>[K2], [K2, K1]>,
  ): void;
  update<K1 extends MutableKeyOf<W<V>>>(
    key: K,
    k1: Part<W<V>, K1>,
    setter: StoreSetter<W<V>[K1], [K1]>,
  ): void;
  update(key: K, setter: StoreSetter<V, []>): void;
  update<
    K1 extends KeyOf<W<V>>,
    K2 extends KeyOf<W<W<V>[K1]>>,
    K3 extends KeyOf<W<W<W<V>[K1]>[K2]>>,
    K4 extends KeyOf<W<W<W<W<V>[K1]>[K2]>[K3]>>,
    K5 extends KeyOf<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>>,
    K6 extends KeyOf<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>>,
    K7 extends KeyOf<W<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>,
  >(
    key: K,
    k1: Part<W<V>, K1>,
    k2: Part<W<W<V>[K1]>, K2>,
    k3: Part<W<W<W<V>[K1]>[K2]>, K3>,
    k4: Part<W<W<W<W<V>[K1]>[K2]>[K3]>, K4>,
    k5: Part<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>, K5>,
    k6: Part<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
    k7: Part<W<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>,
    ...rest: Rest<
      W<W<W<W<W<W<W<V>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7],
      [K7, K6, K5, K4, K3, K2, K1]
    >
  ): void;

  update(key: K, ...args: any[]): boolean {
    if (!this.map.has(key)) {
      return false;
    }
    const store = this.map.get(key)!;
    (store.set as (...val: any[]) => void)(...args);
    return true;
  }

  values() {
    return this.map.values();
  }

  [Symbol.iterator]() {
    return this.map[Symbol.iterator]();
  }
}
