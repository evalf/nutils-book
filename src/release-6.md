# Nutils 6 Garak-Guksu

Nutils 6 was released on April 29th, 2020 and saw three point releases for
fixes and backports. The most recent and final version in this series is Nutils
6.3, released on November 18th, 2021.
- [Download](https://github.com/evalf/nutils/archive/refs/tags/v6.3.zip) (zip)
- [API Reference](https://docs.nutils.org/en/v6.3/)

## What's New?

These are the main additions and changes since [Nutils 5
Farfalle](release-5.md).

### Sparse module

The new `nutils.sparse` module introduces a data type and a suite of
manipulation methods for arbitrary dimensional sparse data. The existing
integrate and integral methods now create data of this type under the hood, and
then convert it to a scalar, Numpy array or `nutils.matrix.Matrix` upon return.
To prevent this conversion and receive the sparse objects instead use the new
`nutils.sample.Sample.integrate_sparse` or
`nutils.sample.eval_integrals_sparse`.

### External dependency for parsing gmsh files

The `nutils.mesh.gmsh` method now depends on the external
[meshio](https://github.com/nschloe/meshio) module to parse .msh files:

```sh
python3 -m pip install --user --upgrade meshio
```

### Change dof order in basis.vector

When creating a vector basis using `topo.basis(..).vector(nd)`, the order of
the degrees of freedom changed from grouping by vector components to grouping
by scalar basis functions:

```
[b0,  0]         [b0,  0]
[b1,  0]         [ 0, b0]
[.., ..] old     [b1,  0]
[bn,  0] ------> [ 0, b1]
[ 0, b0]     new [.., ..]
[.., ..]         [bn,  0]
[ 0, bn]         [ 0, bn]
```

This should not affect applications unless the solution vector is manipulated
directly, such as might happen in unit tests. If required for legacy purposes
the old vector can be retrieved using `old = new.reshape(-1,nd).T.ravel()`.
Note that the change does not extend to `nutils.function.vectorize`.

### Change from stickybar to bottombar

For `nutils.cli.run` to draw a status bar, it now requires the external
[bottombar](https://github.com/evalf/bottombar) module to be installed:

```sh
python3 -m pip install --user bottombar
```

This replaces stickybar, which is no longer used. In addition to the log uri
and runtime the status bar will now show the current memory usage, if that
information is available. On Windows this requires `psutil` to be installed; on
Linux and OSX it should work by default.

### Support for gmsh 'msh4' file format

The `nutils.mesh.gmsh` method now supports input in the 'msh4' file format, in
addition to the 'msh2' format which remains supported for backward
compatibility. Internally, `nutils.mesh.parsegmsh` now takes file contents
instead of a file name.

### New command line option: gracefulexit

The new boolean command line option `gracefulexit` determines what happens when
an exception reaches `nutils.cli.run`. If true (default) then the exception is
handled as before and a system exit is initiated with an exit code of 2. If
false then the exception is reraised as-is. This is useful in particular when
combined with an external debugging tool.

### Log tracebacks at debug level

The way exceptions are handled by `nutils.cli.run` is changed from logging the
entire exception and traceback as a single error message, to logging the
exceptions as errors and tracebacks as debug messages. Additionally, the order
of exceptions and traceback is fully reversed, such that the most relevant
message is the first thing shown and context follows.

### Solve leniently to relative tolerance in Newton systems

The `nutils.solver.newton` method now sets the relative tolerance of the linear
system to `1e-3` unless otherwise specified via `linrtol`. This is mainly
useful for iterative solvers which can save computational effort by having
their stopping criterion follow the current Newton residual, but it may also
help with direct solvers to warn of ill conditioning issues. Iterations
furthermore use `nutils.matrix.Matrix.solve_leniently`, thus proceeding after
warning that tolerances have not been met in the hope that Newton convergence
might be attained regardless.

### Linear solver arguments

The methods `nutils.solver.newton`, `nutils.solver.minimize`,
`nutils.solver.pseudotime`, `nutils.solver.solve_linear` and
`nutils.solver.optimize` now receive linear solver arguments as keyword
arguments rather than via the `solveargs` dictionary, which is deprecated. To
avoid name clashes with the remaining arguments, argument names must be
prefixed by `lin`:

```python
solver.solve_linear('lhs', res,
  solveargs=dict(solver='gmres')) # deprecated syntax

solver.solve_linear('lhs', res,
  linsolver='gmres') # new syntax
```

### Iterative refinement

Direct solvers enter an iterative refinement loop in case the first pass did
not meet the configured tolerance. In machine precision mode (atol=0, rtol=0)
this refinement continues until the residual stagnates.

### Matrix solver tolerances

The absolute and/or relative tolerance for solutions of a linear system can now
be specified in `nutils.matrix.Matrix.solve` via the `atol` resp. `rtol`
arguments, regardless of backend and solver. If the backend returns a solution
that violates both tolerances then an exception is raised of type
`nutils.matrix.ToleranceNotReached`, from which the solution can still be
obtained via the `.best` attribute. Alternatively the new method
`nutils.matrix.Matrix.solve_leniently` always returns a solution while logging
a warning if tolerances are not met. In case both tolerances are left at their
default value or zero then solvers are instructed to produce a solution to
machine precision, with subsequent checks disabled.

### Use stringly for command line parsing

Nutils now depends on stringly (version 1.0b1) for parsing of command line
arguments. The new implementation of `nutils.cli.run` is fully backwards
compatible, but the preferred method of annotating function arguments is now as
demonstrated in all of the examples.

For new Nutils installations Stringly will be installed automatically as a
dependency. For existing setups it can be installed manually as follows:

```sh
python3 -m pip install --user --upgrade stringly
```

### Fixed and fallback lengths in (namespace) expressions

The `nutils.function.Namespace` has two new arguments: `length_<indices>` and
`fallback_length`. The former can be used to assign fixed lengths to specific
indices in expressions, say index `i` should have length 2, which is used for
verification and resolving undefined lengths. The latter is used to resolve
remaining undefined lengths:

```python
ns = nutils.function.Namespace(length_i=2, fallback_length=3)
ns.eval_ij('δ_ij') # using length_i
# Array<2,2>
ns.eval_jk('δ_jk') # using fallback_length
# Array<3,3>
```

### Treelog update

Nutils now depends on treelog version 1.0b5, which brings improved iterators
along with other enhancements. For transitional convenience the backwards
incompatible changes have been backported in the `nutils.log` wrapper, which
now emits a warning in case the deprecated methods are used. This wrapper is
scheduled for deletion prior to the release of version 6.0. To update treelog
to the most recent version use:

```sh
python -m pip install -U treelog
```

### Unit type

The new `nutils.types.unit` allows for the creation of a unit system for easy
specification of physical quantities. Used in conjunction with `nutils.cli.run`
this facilitates specifying units from the command line, as well as providing a
warning mechanism against incompatible units:

```python
U = types.unit.create(m=1, s=1, g=1e-3, N='kg*m/s2', Pa='N/m2')
def main(length=U('2m'), F=U('5kN')):
  topo, geom = mesh.rectilinear([numpy.linspace(0,length,10)])
```

```sh
python myscript.py length=25cm # OK
python myscript.py F=10Pa # error!
```

### Sample basis

Samples now provide a `nutils.sample.Sample.basis`: an array that for any point
in the sample evaluates to the unit vector corresponding to its index. This new
underpinning of `nutils.sample.Sample.asfunction` opens the way for sampled
arguments, as demonstrated in the last example below:

```python
H1 = mysample.asfunction(mydata) # mysample.eval(H1) == mydata
H2 = mysample.basis().dot(mydata) # mysample.eval(H2) == mydata
ns.Hbasis = mysample.basis()
H3 = 'Hbasis_n ?d_n' @ ns # mysample.eval(H3, d=mydata) == mydata
```

### Higher order gmsh geometries

Gmsh element support has been extended to include cubic and quartic meshes in
2D and quadratic meshes in 3D, and parsing the msh file is now a cacheable
operation. Additionally, tetrahedra now define bezier points at any order.

### Repository location

The Nutils repository has moved to <https://github.com/evalf/nutils.git>. For the
time being the old address is maintained by Github as an alias, but in the long
term you are advised to update your remote as follows:

```sh
git remote set-url origin https://github.com/evalf/nutils.git
```
