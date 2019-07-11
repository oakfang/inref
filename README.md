# inref

Create self referencing objects

## Usage

```js
import inref from 'infref';

export const theme = inref(ref => ({
  typography: {
    normal: 1,
    header6: ref(root => root.typography.normal * 0.923),
    header5: ref(root => root.typography.normal * 1),
    header4: ref(root => root.typography.normal * 1.154),
    header3: ref(root => root.typography.normal * 1.538),
    header2: ref(root => root.typography.normal * 2),
    header1: ref(root => root.typography.normal * 3),
  },
  components: {
    titleColor: ref(root => root.colors.primary),
  },
  colors: {
    blue: '#0084FF',
    red: '#E81717',
    orange: '#FF9500',
    green: '#17E852',
    cyan: '#15ECC6',
    purple: '#A215E4',
    pink: '#E415DC',
    primary: ref(root => root.colors.blue),
    secondary: ref(root => root.colors.purple),
}));

console.log(theme.components.titleColor); // -> '#0084FF'

```

### Optimising

In order to reset the ref value, `inref` traverses the root object. This is done so that the return value is an actual, non-proxied, object. All computations are eager.

However, this also means that large, nested, sub-objects (such as huge arrays) may be scanned for no good reason.
When you'd like to optimise this behaviour away, you can use the second argument of the `inref` function:

```js
import inref from "inref";

// un-optimised
const o = infer(ref => ({
  foo: true,
  array: Array.from({ length: 100000 }),
  bar: ref(root => root.foo)
}));

// optimised
const o = infer((ref, unref) => ({
  foo: true,
  array: unref(Array.from({ length: 100000 })),
  bar: ref(root => root.foo)
}));
```
