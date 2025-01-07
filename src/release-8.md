# Nutils 8 Idiyappam

Nutils 8.0 was released on July 28th, 2023.
- [Download](https://github.com/evalf/nutils/archive/refs/tags/v8.0.zip) (zip)
- [API Reference](http://docs.nutils.org/en/v8.0/)

## What's New?

These are the main additions and changes since [Nutils 7
Hiyamugi](release-7.md).

### New: SI module for physical units

The SI module provides a framework for checking the dimensional consistency of
a formulation at runtime, as well as tools to convert between different units
for post processing. Extensive documentation can be found in the [SI
module](https://docs.nutils.org/en/v8.0/nutils/SI/#module-nutils.SI). The
framework can be seen in action in the [cahnhilliard
example](https://examples.nutils.org/official-cahnhilliard/), with more
examples to be converted in future.

### New: support for einsum and other Numpy operations

Support for Numpy operations on Nutils arrays has been extended to include:

- `numpy.choose`
- `numpy.cross`
- `numpy.diagonal`
- `numpy.einsum`
- `numpy.interp` (array support limited to `x` argument)
- `numpy.linalg.det`
- `numpy.linalg.eig`
- `numpy.linalg.eigh`
- `numpy.linalg.inv`
- `numpy.linalg.norm`
- `numpy.searchsorted` (array support limited to `v` argument)

### New: test fields and residual functionals

The `nutils.solver` methods have been generalized to accept scalar valued
functionals, from which residual vectors are derived through differentiation.
To this end, a trial/test function pair can be specified as a solve target
separated by a colon, as in the following example:

```python
ns.add_field(('u', 'v'), topo.basis('std', degree=1))
res = topo.integral('∇_i(u) ∇_i(v) dV' @ ns, degree=2)
args = solver.newton('u:v', res).solve(1e-10)
```

Multiple fields can either comma-joined or provided as a tuple. Note that the
colon automatically triggers a new-style dictionary return value, even in
absence of a trialing comma as in the above example.

### New: Namespace.add_field

The namespace from the `nutils.expression_v2` module newly provides the
`nutils.expression_v2.Namespace.add_field` method, as a convenient shorthand
for creating fields with the same name as their arguments. That is:

```python
ns.add_field(('u', 'v'), topo.basis('std', degree=1), shape=(2,))
```

is equivalent to

```python
basis = topo.basis('std', degree=1)
ns.u = function.dotarg('u', basis, shape=(2,))
ns.v = function.dotarg('v', basis, shape=(2,))
```

### New: shorthand notation for multiple solver targets

Multiple solver targets can now be specified as a comma-separated string, as a
shorthand for the string tuple that will remain a valid argument. This means
the following two invocations are equivalent:

```python
args = solver.newton(('u', 'p'), (ures, pres)).solve(1e-10)
args = solver.newton('u,p', (ures, pres)).solve(1e-10)
```

To distinguish single-length tuples from the single argument legacy notation,
the former requires a trailing comma. I.e., the following are NOT equivalent:

```python
args = solver.newton('u,', (ures,)).solve(1e-10)
u = solver.newton('u', ures).solve(1e-10)
```
### New: nearest-neighbour interpolation in sample.asfunction, sample.basis

The sample methods `asfunction` and `basis` have a new interpolation argument
that take the string values "none" (default) or "nearest". The latter activates
a new mode that allows evaluation of sampled data on other samples than the
original by selecting the point that is closest to the target.

### New: function.linearize

Similar to `derivative`, the new function `linearize` takes the derivative of
an array to one or more arguments, but with the derivative directions
represented by arguments rather than array axes. This is particularly useful in
situations where weak forms are made up of symmetric, energy like components,
combined with terms that require dedicated test fields.

### New: option to disable Newton's line search

The `linesearch` argument of `solver.newton` can now receive the `None` value
to indicate that line search is to be disabled. Additionally, the legacy
arguments `searchrange` and `rebound` have been deprecated, and should be
replaced by `linesearch=solver.NormBased(minscale=searchrange[0],
acceptscale=searchrange[1], maxscale=rebound)`.

### New: iteration count via info.niter

The info struct returned by `solve_withinfo` newly contains the amount of
iterations as the `niter` attribute:

```python
res, info = solver.newton('u:v', res).solve_withinfo(1e-10, maxiter=10)
assert info.niter <= 10
```
### Improved: more efficient trimming

The trim routine (which is used for the Finite Cell Method) is rewritten for
speed and to produce more efficient quadrature schemes. The changes relate to
the subdivision at the deepest refinement level. While this step used to
introduce auxiliary vertices at every dimension (lines, faces, volumes), the
new implementation limits the introduction of vertices to the line segments
only, resulting in a subdivision that consists of fewer simplices and
consequently fewer quadrature points.

### Changed: solve, solve_withinfo arguments

Solver methods newton, minimize and pseudotime have their function signature
slightly changed:
1. The tol argument (used to define the stop criterion) has been made
   mandatory. As the default value used to be 0 - an unreacheable value in
   practice - the argument was effectively mandatory already, which this change
   formalizes.
2. The maxiter argument was off by 1, leading maxiter=n to accept
   n+1 iterations. This mistake is now fixed, which may break applications that
   relied on the former erroneous behaviour.

### Fixed: locate points on trimmed topologies with the skip_missing flag set

The `locate` method has a `skip_missing` argument that instructs the method to
silently drop points that can not be located on the topology. This setting was
partially ignored by trimmed topologies which could lead to a `LocateError`
despite the flag being set. This issue is now fixed.

### Removed: Nutils configuration file

Support for the Nutils configuration file (which used to be located in either
~/.nutilsrc or ~/.config/nutils/config) has been removed. Instead, the
following environment variables can be set to override the default Nutils
settings:

  - NUTILS_PDB  = yes|no
  - NUTILS_GRACEFULEXIT = yes|no
  - NUTILS_OUTROOTDIR = path/to/html/logs
  - NUTILS_OUTROOTURI = uri/to/html/logs
  - NUTILS_SCRIPTNAME = myapp
  - NUTILS_OUTDIR = path/to/this/html/log
  - NUTILS_OUTURI = uti/to/this/html/log
  - NUTILS_RICHOUTPUT = yes|no
  - NUTILS_VERBOSE = 1|2|3|4
  - NUTILS_MATRIX = numpy|scipy|mkl|auto
  - NUTILS_NPROCS = 1|2|...
  - NUTILS_CACHE = yes|no
  - NUTILS_CACHEDIR = path/to/cache

### Deprecated: function methods that have Numpy equivalents

The `nutils.function` methods that have direct equivalents in the `numpy`
module (`function.sum`, `function.sqrt`, `function.sin`, etc) have been
deprecated in favour of using Numpy's methods (`numpy.sum`, `numpy.sqrt`,
`numpy.sin`, etc) and will be removed in the next release. Ultimately, only
methods that relate to the variable nature of function arrays and therefore
have no Numpy equivalent, such as `function.grad` and `function.normal`, will
remain in the function module.

Be aware that some functions were not 100% equivalent to their Numpy
counterpart. For instance, `function.max` is the equivalent to `numpy.maximum`,
as the deprecation message helpfully points out. More problematically,
`function.dot` behaves very differently from both `numpy.dot` and
`numpy.matmul`. Porting the code over to equivalent instructions will therefore
require some attention.

### Deprecated: Array.dot for ndim != 1

The `nutils.function.Array.dot` method is incompatible with Numpy's equivalent
method for arrays of ndim != 1, or when axes are specified (which Numpy does
not allow). Aiming for 100% compatibility, the next release cycle will remove
the axis argument and temporarily forbid arguments of ndim != 1. The release
cycle thereafter will re-enable arguments with ndim != 1, with logic equal to
Numpy's method. In the meantime, the advice is to rely on `numpy.dot`,
`numpy.matmul` or the `@` operator instead.

### Deprecated: Array.sum for ndim > 1 without axis argument

The `nutils.function.Array.sum` method by default operates on the last axis.
This is different from Numpy's behavour, which by default sums all axes. Aiming
for 100% compatibility, the next release cycle will make the axis argument
mandatory for any array of ndim > 1. The release cycle thereafter will
reintroduce the default value to match Numpy's. To prepare for this, relying on
the current default now triggers a deprecation warning.
