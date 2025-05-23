# Nutils 3 Dragon Beard

Nutils 3 was released on August 22nd, 2018 and saw one point release for fixes
and backports. The most recent and final version in this series is Nutils 3.1,
released on February 5th, 2018.
- [Download](https://github.com/evalf/nutils/archive/refs/tags/v3.1.zip) (zip)
- [API Reference](https://docs.nutils.org/en/v3.1/)

## What's New?

These are the main additions and changes since [Nutils 2 Chuka
Men](release-2.md).

### New: function.Namespace

The `nutils.function.Namespace` object represents a container of
`nutils.function.Array` instances:

```python
ns = function.Namespace()
ns.x = geom
ns.basis = domain.basis('std', degree=1).vector(2)
```

In addition to bundling arrays, arrays can be manipulated using index notation
via string expressions using the `nutils.expression` syntax:

```python
ns.sol_i = 'basis_ni ?dofs_n'
f = ns.eval_i('sol_i,j n_j')
```

### New: Topology.integral

Analogous to `nutils.topology.Topology.integrate`, which integrates a function
and returns the result as a (sparse) array, the new method
`nutils.topology.Topology.integral` with identical arguments results in an
`nutils.sample.Integral` object for postponed evaluation:

```python
x = domain.integrate(f, geometry=geom, degree=2) # direct
integ = domain.integral(f, geometry=geom, degree=2) # indirect
x = integ.eval()
```

Integral objects support linear transformations, derivatives and substitutions.
Their main use is in combination with routines from the `nutils.solver` module.

### Removed: TransformChain, CanonicalTransformChain

Transformation chains (sequences of transform items) are stored as standard
tuples. Former class methods are replaced by module methods:

```python
elem.transform.promote(ndims) # no longer valid
transform.promote(elem.transform, ndims) # new syntax
```

In addition, every `edge_transform` and `child_transform` of Reference objects
is changed from (typically unit-length) `TransformChain` to
`nutils.transform.TransformItem`.

### Changed: command line interface

Command line parsers `nutils.cli.run` or `nutils.cli.choose` dropped support
for space separated arguments (--arg value), requiring argument and value to be
joined by an equals sign instead:

```sh
python script.py --arg=value
```

Boolean arguments are specified by omitting the value and prepending 'no' to
the argument name for negation:

```sh
python script.py --pdb --norichoutput
```

For convenience, leading dashes have been made optional:

```sh
python script.py arg=value pdb norichoutput
```

### New: Topology intersections (deprecates common\_refinement)

Intersections between topologies can be made using the `&` operator. In case
the operands have different refinement patterns, the resulting topology will
consist of the common refinements of the intersection:

```python
intersection = topoA & topoB
interface = topo['fluid'].boundary & ~topo['solid'].boundary
```

### Changed: Topology.indicator

The `nutils.topology.Topology.indicator` method is moved from subtopology to
parent topology, i.e. the topology you want to evaluate the indicator on, and
now takes the subtopology is an argument:

  >>> ind = domain.boundary['top'].indicator() # no longer valid
  >>> ind = domain.boundary.indicator(domain.boundary['top']) # new syntax
  >>> ind = domain.boundary.indicator('top') # equivalent shorthand

### Changed: Evaluable.eval

The `nutils.function.Evaluable.eval` method accepts a flexible number of
keyword arguments, which are accessible to `evalf` by depending on the
`EVALARGS` token. Standard keywords are `_transforms` for transformation
chains, `_points` for integration points, and `_cache` for the cache object:

```python
f.eval(elem, 'gauss2') # no longer valid
ip, iw = elem.getischeme('gauss2')
tr = elem.transform, elem.opposite
f.eval(_transforms=tr, _points=ip) # new syntax
```

### New: numeric.const

The `numeric.const` array represents an immutable, hashable array:

```python
A = numeric.const([[1,2],[3,4]])
d = {A: 1}
```

Existing arrays can be wrapped into a `const` object by adding `copy=False`.
The `writeable` flag of the original array is set to False to prevent
subsequent modification:

```python
A = numpy.array([1,2,3])
Aconst = numeric.const(A, copy=False)
A[1] = 4
# ValueError: assignment destination is read-only
```

### New: function annotations

The `util.enforcetypes` decorator applies conversion methods to annotated
arguments:

```python
@util.enforcetypes
def f(a:float, b:tuple)
  print(type(a), type(b))
f(1, [2])
# <class 'float'> <class 'tuple'>
```

The decorator is by default active to constructors of cache.Immutable
derived objects, such as function.Evaluable.

### Changed: Evaluable._edit

Evaluable objects have a default edit implementation that re-instantiates the
object with the operand applied to all constructor arguments. In situations
where the default implementation is not sufficient it can be overridden by
implementing the `edit` method (note: without the underscore):

```python
class B(function.Evaluable):
  def __init__(self, d):
    assert isinstance(d, dict)
    self.d = d
  def edit(self, op):
    return B({key: op(value) for key, value in self.d.items()})
```

### Changed: function derivatives

The `nutils.function.derivative` `axes` argument has been removed;
`derivative(func, var)` now takes the derivative of `func` to all the axes in
`var`:

```python
der = function.derivative(func, var,
        axes=numpy.arange(var.ndim)) # no longer valid
der = function.derivative(func, var) # new syntax
```

### New module: cli

The `nutils.util.run` function is deprecated and replaced by two new functions,
`nutils.cli.choose` and `nutils.cli.run`. The new functions are very similar to
the original, but have a few notable differences:

- `cli.choose` requires the name of the function to be executed (typically
  'main'), followed by any optional arguments
- `cli.run` does not require the name of the function to be executed, but only
  a single one can be specified
- argument conversions follow the type of the argument's default value, instead
  of the result of `eval`
- the `--tbexplore` option for post-mortem debugging is replaced by `--pdb`,
  replacing Nutils' own traceback explorer by Python's builtin debugger
- on-line debugging is provided via the ctrl+c signal handler
- function annotations can be used to describe arguments in both help messages
  and logging output (see examples)

### New module: solver

The `nutils.solver` module provides infrastructure to facilitate formulating
and solving complicated nonlinear problems in a structured and largely
automated fashion.

### New: topology.with{subdomain,boundary,interfaces,points}

Topologies have been made fully immutable, which means that the old setitem
operation is no longer supported. Instead, to add a subtopology to the domain,
its boundary, its interfaces, or points, any of the methods `withsubdomain`,
`withboundary`, `withinterfaces`, and `withpoints`, respectively, will return a
copy of the topology with the desired groups added:

```python
topo.boundary['wall'] = topo.boundary['left,top'] # no longer valid
newtopo = topo.withboundary(wall=topo.boundary['left,top']) # new syntax
newtopo = topo.withboundary(wall='left,top') # equivalent shorthand
newtopo.boundary['wall'].integrate(...)
```

### New: circular symmetry

Any topology can be revolved using the new `nutils.topology.Topology.revolved`
method, which interprets the first geometry dimension as a radius and replaces
it by two new dimensions, shifting the remaining axes backward. In addition to
the modified topology and geometry, simplifying function is returned as the
third return value which replaces all occurrences of the revolution angle by
zero. This should only be used after all gradients have been computed:

```python
rdomain, rgeom, simplify = domain.revolved(geom)
basis = rdomain.basis('spline', degree=2)
M = function.outer(basis.grad(rgeom)).sum(-1)
rdomain.integrate(M, geometry=rgeom, ischeme='gauss2', edit=simplify)
```

### Renamed mesh.gmesh to mesh.gmsh; added support for periodicity

The gmsh importer was unintentionally misnamed as gmesh; this has been fixed.
With that the old name is deprecated and will be removed in future. In
addition, support for the non-physical mesh format and externally supplied
boundary labels has been removed (see the unit test tests/mesh.py for examples
of valid .geo format). Support is added for periodicity and interface groups.
