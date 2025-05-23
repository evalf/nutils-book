# Nutils 7 Hiyamugi

Nutils 7 was released on January 1st, 2022 and saw three point releases for
fixes and backports. The most recent and final version in this series is Nutils
7.3, released on June 20th, 2023.
- [Download](https://github.com/evalf/nutils/archive/refs/tags/v7.3.zip) (zip)
- [API Reference](https://docs.nutils.org/en/v7.3/)

## What's New?

These are the main additions and changes since [Nutils 6
Garak-Guksu](release-6.md).

### Expression and Namespace Version 2

The `nutils.expression` module has been renamed to `nutils.expression_v1`, the
`nutils.function.Namespace` class to `nutils.expression_v1.Namespace` and the
`nutils.expression_v2` module has been added, featuring a new
`nutils.expression_v2.Namespace`. The version 2 of the namespace v2 has an
expression language that differs slightly from version 1, most notably in the
way derivatives are written. The old namespace remains available for the time
being. All examples are updated to the new namespace. You are encouraged to use
the new namespace for newly written code.

### Changed: bifurcate has been replaced by spaces

In the past using functions on products of `nutils.topology.Topology` instances
required using `function.bifurcate`. This has been replaced by the concept of
'spaces'. Every topology is defined in a space, identified by a name (`str`).
Functions defined on some topology are considered constant on other topologies
(defined on other spaces).

If you want to multiply two topologies, you have to make sure that the
topologies have different spaces, e.g. via the `space` parameter of
`nutils.mesh.rectilinear`. Example:

```python
from nutils import mesh, function
Xtopo, x = mesh.rectilinear([4], space='X')
Ytopo, y = mesh.rectilinear([2], space='Y')
topo = Xtopo * Ytopo
geom = function.concatenate([x, y])
```

### Changed: function.Array shape must be constant

Resulting from to the function/evaluable split introduced in #574, variable
length axes such as relating to integration points or sparsity can stay
confined to the evaluable layer. In order to benefit from this situation and
improve compatibility with Numpy's arrays, `nutils.function.Array` objects are
henceforth limited to constant shapes. Additionally:

- The sparsity construct `nutils.function.inflate` has been removed;
- The `nutils.function.Elemwise` function requires all element arrays to be of
  the same shape, and its remaining use has been deprecated in favor of
  `nutils.function.get`;
- Aligning with Numpy's API, `nutils.function.concatenate` no longer
  automatically broadcasts its arguments, but instead demands that all
  dimensions except for the concatenation axis match exactly.

### Changed: locate arguments

The `nutils.topology.Topology.locate` method now allows `tol` to be left
unspecified if `eps` is specified instead, which is repurposed as stop
criterion for distances in element coordinates. Conversely, if only `tol` is
specified, a corresponding minimal `eps` value is set automatically to match
points near element edges. The `ischeme` and `scale` arguments are deprecated
and replaced by `maxdist`, which can be left unspecified in general. The
optional `weights` argument results in a sample that is suitable for
integration.

### Moved: unit from types to separate module

The `unit` type has been moved into its own `nutils.unit` module, with the old
location `types.unit` now holding a forward method. The forward emits a
deprecation warning prompting to change `nutils.types.unit.create` (or its
shorthand `nutils.types.unit`) to `nutils.unit.create`.

### Removed: loading libraries from .local

Libraries that are installed in odd locations will no longer be automatically
located by Nutils (see b8b7a6d5 for reasons). Instead the user will need to set
the appropriate environment variable, prior to starting Python. In Windows this
is the `PATH` variable, in Linux and OS X `LD_LIBRARY_PATH`.

Crucially, this affects the MKL libraries when they are user-installed via pip.
By default Nutils selects the best available matrix backend that it finds
available, which could result in it silently falling back on Scipy or Numpy. To
confirm that the path variable is set correctly run your application with
`matrix=mkl` to force an error if MKL cannot be loaded.

### Function module split into `function` and `evaluable`

The function module has been split into a high-level, numpy-like `function`
module and a lower-level `evaluable` module. The `evaluable` module is agnostic
to the so-called points axis. Scripts that don't use custom implementations of
`function.Array` should work without modification.

Custom implementations of the old `function.Array` should now derive from
`evaluable.Array`. Furthermore, an accompanying implementation of
`function.Array` should be added with a `prepare_eval` method that returns the
former.

The following example implementation of an addition

```python
class Add(function.Array):
  def __init__(self, a, b):
    super().__init__(args=[a, b], shape=a.shape, dtype=a.dtype)
  def evalf(self, a, b):
    return a+b
```

should be converted to

```python
class Add(function.Array):
  def __init__(self, a: function.Array, b: function.Array) -> None:
    self.a = a
    self.b = b
    super().__init__(shape=a.shape, dtype=a.dtype)
  def prepare_eval(self, **kwargs) -> evaluable.Array:
    a = self.a.prepare_eval(**kwargs)
    b = self.b.prepare_eval(**kwargs)
    return Add_evaluable(a, b)

class Add_evaluable(evaluable.Array):
  def __init__(self, a, b):
    super().__init__(args=[a, b], shape=a.shape, dtype=a.dtype)
  def evalf(self, a, b):
    return a+b
```

### Solve multiple residuals to multiple targets

In problems involving multiple fields, where formerly it was required to
`nutils.function.chain` the bases in order to construct and solve a block
system, an alternative possibility is now to keep the residuals and targets
separate and reference the several parts at the solving phase:

```python
# old, still valid approach
ns.ubasis, ns.pbasis = function.chain([ubasis, pbasis])
ns.u_i = 'ubasis_ni ?dofs_n'
ns.p = 'pbasis_n ?dofs_n'

# new, alternative approach
ns.ubasis = ubasis
ns.pbasis = pbasis
ns.u_i = 'ubasis_ni ?u_n'
ns.p = 'pbasis_n ?p_n'

# common: problem definition
ns.σ_ij = '(u_i,j + u_j,i) / Re - p δ_ij'
ures = topo.integral('ubasis_ni,j σ_ij d:x d:x' @ ns, degree=4)
pres = topo.integral('pbasis_n u_,kk d:x' @ ns, degree=4)

# old approach: solving a single residual to a single target
dofs = solver.newton('dofs', ures + pres).solve(1e-10)

# new approach: solving multiple residuals to multiple targets
state = solver.newton(['u', 'p'], [ures, pres]).solve(1e-10)
```

In the new, multi-target approach, the return value is no longer an array but a
dictionary that maps a target to its solution. If additional arguments were
specified to newton (or any of the other solvers) then these are copied into
the return dictionary so as to form a complete state, which can directly be
used as an arguments to subsequent evaluations.

If an argument is specified for a solve target then its value is used as an
initial guess (newton, minimize) or initial condition (thetamethod). This
replaces the `lhs0` argument which is not supported for multiple targets.

### New thetamethod argument deprecates target0

To explicitly refer to the history state in `nutils.solver.thetamethod` and its
derivatives `impliciteuler` and `cranknicolson`, instead of specifiying the
target through the `target0` parameter, the new argument `historysuffix`
specifies only the suffix to be added to the main target. Hence, the following
three invocations are equivalent:

```python
# deprecated
solver.impliciteuler('target', residual, inertia, target0='target0')
# new syntax
solver.impliciteuler('target', residual, inertia, historysuffix='0')
# equal, since '0' is the default suffix
solver.impliciteuler('target', residual, inertia)
```

### In-place modification of newton, minimize, pseudotime iterates

When `nutils.solver.newton`, `nutils.solver.minimize` or
`nutils.solver.pseudotime` are used as iterators, the generated vectors are now
modified in place. Therefore, if iterates are stored for analysis, be sure to
use the `.copy` method.

### Deprecated function.elemwise

The function `function.elemwise` has been deprecated. Use `function.Elemwise`
instead:

```python
function.elemwise(topo.transforms, values) # deprecated
function.Elemwise(values, topo.f_index) # new
```

### Removed transforms attribute of bases

The `transforms` attribute of bases has been removed due to internal
restructurings. The `transforms` attribute of the topology on which the
basis was created can be used as a replacement:

```python
reftopo = topo.refined
refbasis = reftopo.basis(...)
supp = refbasis.get_support(...)
#topo = topo.refined_by(refbasis.transforms[supp]) # no longer valid
topo = topo.refined_by(reftopo.transforms[supp]) # still valid
```
