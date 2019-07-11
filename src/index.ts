const REF_SYM = Symbol("@@ref");

interface Ref<T extends object, U> {
  [REF_SYM]: (root: T) => U;
}

const createRef = <T extends object, U>(lambda: (root: T) => U) => ({
  [REF_SYM]: lambda
});

const isRef = (obj: any) => obj && obj[REF_SYM];

const findPath = <T extends object>(
  obj: object,
  ref: Ref<T, any>,
  blacklist: WeakSet<any>
): void | string[] => {
  const entries = Object.entries(obj);
  for (let [key, value] of entries) {
    if (value === ref) return [key];
    if (typeof value === "object" && value && !blacklist.has(value)) {
      const sub = findPath(value, ref, blacklist);
      if (sub) {
        return [key, ...sub];
      }
    }
  }
};

export default function inref<T extends object>(
  factory: (
    ref: <U>(lambda: (root: T) => U) => U,
    unref: <T>(value: T) => T
  ) => T
) {
  const refs: Ref<T, any>[] = [];
  const bl = new WeakSet();
  const visited = new WeakSet();
  const ref = <U>(lambda: (root: T) => U): U => {
    const r = createRef(lambda);
    refs.push(r);
    return (r as unknown) as U;
  };
  const unref = (value: any) => {
    bl.add(value);
    return value;
  };
  const root = factory(ref, unref);
  while (refs.length) {
    const r = refs.shift() as Ref<T, any>;
    const value = r[REF_SYM](root);
    if (isRef(value)) {
      if (visited.has(r)) {
        throw new Error("cyclic ref");
      }
      visited.add(r);
      refs.push(r);
    } else {
      const path = findPath(root, r, bl);
      if (path) {
        let pointer = root;
        while (path.length > 1) {
          // @ts-ignore
          pointer = pointer[path.shift()];
        }
        // @ts-ignore
        pointer[path[0]] = value;
      }
    }
  }
  return root;
};
