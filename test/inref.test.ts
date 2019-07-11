import inref from "../src";

describe("inref", () => {
  it("handles basic cases", () => {
    const o = inref<{ foo: true; bar: true }>(ref => ({
      foo: true,
      bar: ref(root => root.foo)
    }));
    expect(o.bar).toBe(true);
  });

  it("handles nested keys", () => {
    interface X {
      foo: boolean;
      bar: {
        meow: {
          rawr: boolean;
        };
      };
    }
    const o = inref<X>(ref => ({
      foo: true,
      bar: {
        meow: {
          rawr: ref(root => root.foo)
        }
      }
    }));
    expect(o.bar.meow.rawr).toBe(true);
  });

  it("handles double reffing", () => {
    interface X {
      foo: boolean;
      bar: boolean;
      buzz: boolean;
      meow: boolean;
    }
    const o = inref<X>(ref => ({
      foo: true,
      bar: ref(root => root.buzz),
      buzz: ref(root => root.meow),
      meow: ref(root => root.foo)
    }));
    expect(o.bar).toBe(true);
  });

  it("fails on cycle", () => {
    interface X {
      foo: boolean;
      bar: boolean;
      buzz: boolean;
    }
    expect(() =>
      inref<X>(ref => ({
        foo: true,
        bar: ref(root => root.buzz),
        buzz: ref(root => root.bar)
      }))
    ).toThrow();
  });

  it("can optimise ref paths", () => {
    interface X {
      foo: boolean;
      bar: [boolean];
    }
    const o1 = inref<X>(ref => ({
      foo: true,
      bar: [ref(root => root.foo)]
    }));
    expect(o1.bar[0]).toBe(true);
    const o2 = inref<X>((ref, unref) => ({
      foo: true,
      bar: unref([ref(root => root.foo)])
    }));
    expect(o2.bar[0]).not.toBe(true);
  });

  it('handles "complex" operators well', () => {
    interface Theme {
      typography: {
        normal: number;
        header: number;
        subheader: number;
      };
    }
    const theme = inref<Theme>(ref => ({
      typography: {
        normal: 1,
        subheader: ref(root => root.typography.header / 2),
        header: ref(root => root.typography.normal * 3)
      }
    }));
    expect(theme.typography.subheader).toBe(1.5);
  });
});
