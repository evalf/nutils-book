# Nutils 4 Eliche

Nutils 4 was released on June 11th, 2019 and saw one point release for fixes
and backports. The most recent and final version in this series is Nutils 4.1
was released on August 28th, 2018.
- [Download](https://github.com/evalf/nutils/archive/refs/tags/v4.1.zip) (zip)
- [API Reference](https://docs.nutils.org/en/v4.1/)

## What's New?

These are the main additions and changes since [Nutils 3 Dragon
Beard](release-3.md).

### Spline basis continuity argument

In addition to the `knotmultiplicities` argument to define the
continuity of basis function on structured topologies, the
`nutils.topology.Topology.basis` method now supports the
`continuity` argument to define the global continuity of basis
functions. With negative numbers counting backwards from the
`degree`, the default value of `-1` corresponds to a knot
multiplicity of 1.

### Eval arguments

Functions of type `nutils.function.Evaluable` can receive
arguments in addition to element and points by depending on instances
of `nutils.function.Argument` and having their values specified
via `nutils.sample.Sample.eval`:

```python
f = geom.dot(function.Argument('myarg', shape=geom.shape))
f = 'x_i ?myarg_i' @ ns # equivalent operation in namespace
topo.sample('uniform', 1).eval(f, myarg=numpy.ones(geom.shape))
```

### The d:-operator

Namespace expression syntax now includes the `d:` Jacobian operator,
allowing one to write `'d:x' @ ns` instead of `function.J(ns.x)`.
Since including the Jacobian in the integrand is preferred over
specifying it separately, the `geometry` argument of
`nutils.topology.Topology.integrate` is deprecated:

```python
topo.integrate(ns.f, geometry=ns.x) # deprecated
topo.integrate(ns.f * function.J(ns.x)) # was and remains valid
topo.integrate('f d:x' @ ns) # new namespace syntax
```

### Truncated hierarchical bsplines

Hierarchically refined topologies now support basis truncation, which
reduces the supports of individual basis functions while maintaining
the spanned space. To select between truncated and non-truncated the
basis type must be prefixed with 'th-' or 'h-', respectively. A
non-prefixed basis type falls back on the default implementation that
fails on all types but discont:

```python
htopo.basis('spline', degree=2) # no longer valid
htopo.basis('h-spline', degree=2) # new syntax for original basis
htopo.basis('th-spline', degree=2) # new syntax for truncated basis
htopo.basis('discont', degree=2) # still valid
```

### Transparent function cache

The `nutils.cache` module provides a memoizing function decorator
`nutils.cache.function` which reads return values from cache in
case a set of function arguments has been seen before. It is similar
in function to Python's `functools.lru_cache`, except that the cache
is maintained on disk and `nutils.types.nutils_hash` is used to
compare arguments, which means that arguments need not be Python
hashable. The mechanism is activated via `nutils.cache.enable`:

```python
@cache.function
def f(x):
  return x * 2

with cache.enable():
  f(10)
```

If `nutils.cli.run` is used then the cache can also be enabled
via the new `--cache` command line argument. With many internal
Nutils functions already decorated, including all methods in the
`nutils.solver` module, transparent caching is available out of
the box with no further action required.

### New module: types

The new `nutils.types` module unifies and extends components
relating to object types. The following preexisting objects have been
moved to the new location:

- `util.enforcetypes` → `types.apply_annotations`
- `util.frozendict` → `types.frozendict`
- `numeric.const` → `types.frozenarray`

### MKL matrix, Pardiso solver

The new `MKL` backend generates matrices that are powered by Intel's Math
Kernel Library, which notably includes the reputable Pardiso solver. This
requires `libmkl` to be installed, which is conveniently available through
pip:

```sh
pip install mkl
```

When `nutils.cli.run` is used the new matrix type is selected
automatically if it is available, or manually using `--matrix=MKL`.

### Nonlinear minimization

For problems that adhere to an energy structure, the new solver method
`nutils.solver.minimize` provides an alternative mechanism that
exploits this structure to robustly find the energy minimum:

```python
res = sqr.derivative('dofs')
solver.newton('dofs', res, ...)
solver.minimize('dofs', sqr, ...) # equivalent
```

### Data packing

Two new methods, `nutils.numeric.pack` and its inverse
`nutils.numeric.unpack`, provide lossy compression to floating
point data. Primarily useful for regression tests, the convenience
method `numeric.assert_allclose64` combines data packing with zlib
compression and base64 encoding for inclusion in Python codes.
