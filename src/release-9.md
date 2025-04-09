# Nutils 9 Jook-Sing

Nutils 9 was released on April 9, 2025.

- [Download](https://github.com/evalf/nutils/archive/refs/tags/v9.0.zip) (zip)
- [API Reference](https://docs.nutils.org/en/v9.0/)


## What's new?

These are the main additions and changes since Nutils 8 Idiyappam.

### System

The most prominent new feature of Nutils 9 is arguably the redesign of the
solver module, which now offers the `System` object as the main entry point for
all linear and nonlinear problems. A typical use looks like this:

```python
>>> sys = solver.System(residual, trial='u', test='v')
>>> args = sys.solve(constrain=cons)
```

Nonlinear problems require a `tol` argument, and will switch to a vanilla
newton process by default. Different solution methods, such as line search
newton (solver.LinesearchNewton) or steepest descent minimization
(solver.Minimize) can be specified via the `method` argument. Newly added
solution methods are solver.ReuseNewton and solver.Arnoldi.

Presently, the main advantage of the new interface is in repeated solves, as
the system object retains information such as the matrix sparsity pattern that
is expensive to recompute. In future, systems will be enhanced to recognize and
exploit features such as one way coupling of matrix blocks. The old functions
such as `solve_linear` and `newton` will be deprecated in the next development
cycle for removal in Nutils 11. All examples are updated to use `System`
directly to encourage new projects to switch over to the new API.

### Field

Nutils 8 initiated the transition from operating on basis functions and vector
valued residuals, to fields, i.e. bases contracted with arguments, and scalar
valued residuals. Nutils 9 further promotes this by providing a new `field`
method that makes formation of the basis an entirely internal affair. In the
following example, `u1`, `u2` and `u3` are identical:

```python
>>> u1 = topo.field('u', btype='spline', degree=2)
>>> basis = topo.basis('spline', degree=2)
>>> u2 = basis @ function.Argument('u', basis.shape)
>>> u3 = function.field('u', basis)
```

In the majority of cases that direct acces to the basis is not required, the
first construction is recommended. The second shows what really happens,
discounting some subtle differences in the case of tensorial topologies. The
third form showcases the new function `function.field`, which was renamed from
`function.dotarg` for naming consistency. Like its predecessor, this function
can also be used to create constant fields by not providing a basis argument.

### Factor

Another standout new feature is `function.factor`, which offers to speed up
calculations by precomputing assembly loops. Its use is limited to functions
that are already bound to all spaces, e.g. by integration, and that are
polynomial in all their arguments. Building on the previous example, a typical
use would be to factor the system argument:

```python
>>> sys = solver.System(function.factor(residual), trial='u', test='v')
```

Here, residual must by polynomial in 'u' and 'v'. Factor then evaluates the
polynomial coefficients as sparse arrays. Finally, when System evaluates the
resulting function, this amounts to nothing more than sparse tensor
contractions, which can be very fast. Note, however, a high polynomial degree
results in high-dimensional coefficients which, while sparse, may still require
a lot of memory and many operations to perform the required contractions. As
such, the benefits of factor should be assessed on a case by case basis.

Two examples that benefit greatly from the factor treatment are cylinderflow
and cahnhilliard. In another useful application of factor, these scripts have
greatly sped up post processing by factoring sampled results. The `Sample.bind`
method used for this purpose is also new in Nutils 9.

### JIT compiler

Under the hood, a major change in the evaluable module is the way that
functions are evaluated. Where evaluations formerly consisted of a (dynamically
created) sequence of function calls, Nutils 9 generates and compiles a
dedicated Python function. The direct result of this change is a reduction in
function calls, which lowers the total overhead and shifts the balance of total
time spent to the actual numerical operations.

The compiled function furthermore distinguishes between (intermediate) results
that depend on input arguments, and those that stay constant between
evaluations. The latter are stored as part of the function object and reused
when the function is evaluated for the second time. Noting that part of the
non-changing structures in a function is the entire sparsity pattern, it should
be clear that these are significant savings. This also another reason why the
switch to the new solver API is vital, as the System object holds on to the
compiled function along with its cached data.

Thirdly, the new approach allows for in-place modifications. Formerly, a sparse
matrix was assembled by concatenating element contributions before
deduplicating and converting it to CSR format. The new approach adds element
data directly into the CSR structure, resulting in substantial memory savings.

### Other notable changes

The turek example is added as an implementation of the [Turek Hron
benchmark](https://doi.org/10.1007/3-540-34596-5_15), able to reproduce all of
the 9 distinct benchmark cases as well as freely defined variants thereof.
The new benchmark section in this book contains convergence results of the code,
compared against the reference results of Turek and Hron.

The `mesh.gmsh` function has been enhanced to accept .geo paths in addition to
the already supported '.msh' files. The new mode requires gmsh to be installed
in the executable path, and uses it to generate the corresponding msh file on
the fly. The new `numbers` parameter provides for parameterized input, in the
form of a dictionary with variables for the geo file. The new turek example
showcases this new ability.

Support for SI units has been extended to the Numpy operations `real`, `imag`,
`conjugate`, `reshape`, `linalg.norm` and `interp`. The new `Sample.bind`
method is unit aware. Finally, `Topology.locate` now accepts dimensional
quantities provided that the geometry function and points array have matching
dimension, as well as the `tol` argument if provided.

On the dependencies front, Nutils now requires Python 3.9 or higher, as these
are the only versions still activaly maintained. Likewise, the minimum Numpy
version has been bumped to 1.21. On the other end of the spectrum, support is
added for Numpy series 2. The bottombar and psutil modules are removed as
dependencies, but will still be used by cli.run and cli.choose if they are
detected to be installed. Finally, the MKL matrix will be automatically
recognized with the mkl module is user-installed via pip.

### Deprecations

The following constructs have been deprecated and are marked for removal in Nutils 10:
- matrix.assemble (replaced by matrix.assemble_coo and matrix.assemble_csr)
- function.dotarg (replaced by function.field)
- function.outer (replaced by the equivalent numpy operations)
- sample.Sample callable (replaced by Sample.bind)
- function.integral (replaced by Sample.integral)
- function.sample (replaced by Sample.bind)
- function.rootcoords (no replacement)
- sample.Sample.integrate_sparse (replaced by function.eval + function.as_coo + sample.Sample.integral)
- sample.Sample.eval_sparse (replaced by function.eval + function.as_coo + sample.Sample.bind)
- providing arguments as keywords (replaced by the 'arguments' parameter)
- the newly introduced 'legacy' argument in functon.Array.eval and sample.Sample.integrate


## Complete overview of changes

This release cycle was the first where we assigned version numbers to every
commit in the main branch. Since the version is logged at the top (when using
`cli.run`), this should always make it unambiguously clear what version of the
code was used to generate past results, even if this was part of the
development branch.

In the following overview, the versions indicate when a certain feature was
introduced, changed, fixed or deprecaded, and, if applicable, when it was
backported into the stable branch.

- *New in v9a1:* support diagonal offset in numpy.trace
- *Changed in v9a1:* minimum Python version 3.8
- *Changed in v9a2, v8.1:* log version in cli.run, cli.choose
- *Changed in v9a3:* update Docker base image to Debian Bookworm
- *Fixed in v9a3, v8.3:* missing points in trimmed topology with skip_missing=True
- *New in v9a4, v8.3:* support numpy.{real,imag,conjugate} on Quantities
- *New in v9a4, v8.3:* support complex arguments in function.linearize
- *Fixed in v9a6, v8.4:* basis of SimplexTopology
- *Fixed in v9a6, v8.4:* empty boundary of SimplexTopology, triggered when all boundaries are periodic
- *Fixed in v9a7, v8.4:* picklability of sliced function array
- *New in v9a10:* support boolean operators for function arrays
- *Changed in v9a12:* internal: removed remove evaluable.Points,NPoints,Weights
- *Fixed in v9a14, v8.5:* pyproject version constraints
- *New in v9a15, v8.6:* support locate for tensorial topologies
- *New in v9a17:* make svg graphs interactive
- *Changed in v9a19:* more efficient geometry function for equidistant rectilinear mesh
- *Fixed in v9a20, v8.7:* logging of parameters without type annotation
- *Fixed in v9a21:* SI handling of special binary methods
- *Changed in v9a24:* fill nested subgraphs with distinct bg colors
- *Changed in v9a25:* add evaluable.Singular
- *Fixed in v9a25, v8.7:* simplification of Equals involving Range
- *Fixed in v9a28, v8.7:* multipatch interfaces
- *New in v9a30:* add evaluable.compile: a Python code generator
- *Changed in v9a33:* evaluable.Array now derived from types.DataClass
- *Fixed in v9a35:* parsegmsh in presence of multiple periodicity
- *Fixed in v9a35:* parsegmsh's handling of empty physical groups
- *Fixed in v9a36:* getpoints for empty mosaic elements
- *Fixed in v9a36:* 'not watertight' trimming issues
- *Changed in v9a37:* reduce unnecessary evaluations for shape checks during function formation
- *New in v9a37:* matrix.assemble_coo, .assemble_csr, .assemble_block_csr
- *New in v9a37:* evaluable.eval_coo, .unique, .as_csr
- *New in v9a37:* solver.System
- *Fixed in v9a37:* deprecated tol argument in scipy>=1.12
- *Deprecated in v9a37:* matrix.assemble (replaced by matrix.assemble_coo, matrix.assemble_csr)
- *Changed in v9a39:* disable graphviz node background if ncalls == 0
- *New in v9a39:* function.factor
- *Fixed in v9a40:* disallow truncation in types.arraydata
- *Fixed in v9a41:* Gramm-Schmidt breakdown in Arnoldi solver
- *New in v9a42:* support Numpy 2
- *Changed in v9a44:* remove psutil and bottombar dependencies
- *Changed in v9a45:* automatically load mkl from pip user install
- *Changed in v9a46:* add argument checks to mesh.simplex
- *Changed in v9a46:* extend mesh.gmsh with ability to convert geo files
- *New in v9a47:* allow iterator argument in function.vectorize
- *New in v9a47:* topology.field method
- *Changed in v9a47:* rename dotarg to field
- *Deprecated in v9a47:* dotarg (replaced by field)
- *New in v9a49:* Turek benchmark example
- *New in v9a50:* SI support for reshape, linalg.norm, interp
- *New in v9a51:* vorticity plot in drivencavity example
- *Changed in v9a52:* support SI arguments in Topology.locate
- *Changed in v9a52:* support locating points on manifolds
- *New in v9a53:* sample.bind
- *Changed in v9a53:* minimum Python version 3.9
- *Changed in v9a53:* minimum Numpy version 1.21
- *Changed in v9a53:* extend numpy.interp to functions with points
- *Fixed in v9a53:* zipping tensorial samples
- *Fixed in v9a53:* graph of evaluables with nested loops
- *Deprecated in v9a53:* function.outer
- *Deprecated in v9a53:* sample callable (replaced by .bind)
- *Deprecated in v9a53:* function.integral, function.sample
- *Changed in v9a54:* simplify TransformLinear, TransformBasis if constant
- *Changed in v9a54:* simplify evaluable.Transform* with masked source
- *Deprecated in v9a54:* function.rootcoords
- *Changed in v9a55*: sparse deduplication during evaluation
- *New in v9a55*: sparse modifiers function.as_coo and function.as_csr
- *New in v9a58*: ability to select spaces in function.grad, Namespace.define_for
- *Deprecated in v9a60*: sample.integrate_sparse, Sample.eval_sparse
- *Deprecated in v9a60*: arguments via keywords (replaced by the 'arguments' parameter)
- *New in v9a60*: legacy parameter in Array.eval, Sample.integrate
- *New in v9a62*: solver methods ReuseNewton and Arnoldi
- *New in v9a63*: support nested integrals over the same space
