# Nutils 5 Farfalle

Nutils 5 was released on April 3rd, 2020 and saw two point releases for fixes
and backports. The most recent and final version in this series is Nutils 5.2,
released on June 11th, 2019.
- [Download](https://github.com/evalf/nutils/archive/refs/tags/v5.2.zip) (zip)
- [API Reference](https://docs.nutils.org/en/v5.2/)

## What's New?

These are the main additions and changes since [Nutils 4 Eliche](release-4.md).

### Matrix matmul operator, solve with multiple right hand sides

The `Matrix.matvec` method has been deprecated in favour of the new
`__matmul__` (@) operator, which supports multiplication arrays of any
dimension. The `nutils.matrix.Matrix.solve` method has been extended to support
multiple right hand sides:

```python
matrix.matvec(lhs) # deprecated
matrix @ lhs # new syntax
matrix @ numpy.stack([lhs1, lhs2, lhs3], axis=1)
matrix.solve(rhs)
matrix.solve(numpy.stack([rhs1, rhs2, rhs3], axis=1)
```

### MKL's fgmres method

Matrices produced by the `MKL` backend now support the
`nutils.matrix.Matrix.solve` argument solver='fmgres' to use Intel MKL's fgmres
method.

### Thetamethod time target

The `nutils.solver.thetamethod` class, as well as its special cases
`impliciteuler` and `cranknicolson`, now have a `timetarget` argument to
specify that the formulation contains a time variable:

```python
res = topo.integral('...?t... d:x' @ ns, degree=2)
solver.impliciteuler('dofs', res, ..., timetarget='t')
```

### New leveltopo argument for trimming

In `nutils.topology.Topology.trim`, in case the levelset cannot be evaluated on
the to-be-trimmed topology itself, the correct topology can now be specified
via the new `leveltopo` argument.

### New unittest assertion assertAlmostEqual64

`nutils.testing.TestCase` now facilitates comparison against base64 encoded,
compressed, and packed data via the new method
`nutils.testing.TestCase.assertAlmostEqual64`. This replaces
`numeric.assert_allclose64` which is now deprecated and scheduled for removal
in Nutils 6.

### Fast locate for structured topology, geometry

A special case `nutils.topology.Topology.locate` method for structured
topologies checks of the geometry is an affine transformation of the natural
configuration, in which case the trivial inversion is used instead of expensive
Newton iterations:

```python
topo, geom = mesh.rectilinear([2, 3])
smp = topo.locate(geom/2-1, [[-.1,.2]])
# locate detected linear geometry: x = [-1. -1.] + [0.5 0.5] xi ~+2.2e-16
```

### Lazy references, transforms, bases

The introduction of sequence abstractions `nutils.elementseq` and
`nutils.transformseq`, together with and a lazy implementation of
`nutils.function.Basis` basis functions, help to prevent the unnecessary
generation of data. In hierarchically refined topologies, in particular, this
results in large speedups and a much reduced memory footprint.

### Switch to treelog

The `nutils.log` module is deprecated and will be replaced by the externally
maintained `treelog <https://github.com/evalf/treelog>`_, which is now an
installation dependency.

### Replace pariter, parmap by fork, range.

The `nutils.parallel` module is largely rewritten. The old methods `pariter`
and `parmap` are replaced by the `nutils.parallel.fork` context, combined with
the shared `nutils.parallel.range` iterator:

```python
indices = parallel.range(10)
with parallel.fork(nprocs=2) as procid:
  for index in indices:
    print('procid={}, index={}'.format(procid, index))
```
