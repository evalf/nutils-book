# Namespace

Nutils functions behave entirely like Numpy arrays, and can be manipulated as
such, using a combination of operators, object methods, and methods found in
the `nutils.function` module. Though powerful, the resulting code is often
lengthy, littered with colons and brackets, and hard to read. *Namespaces*
provide an alternative, cleaner syntax for a prominent subset of array
manipulations.

A `nutils.expression_v2.Namespace` is a collection of `nutils.function.Array`
functions.  An empty `nutils.expression_v2.Namespace` is created as follows:

```python
ns = Namespace()
```

New entries are added to a `nutils.expression_v2.Namespace` by assigning an
`nutils.function.Array` to an attribute.  For example, the geometry
`geom` is assigned to `ns.x` via

```python
ns.x = geom
```

You can now use `ns.x` where you would use `geom`. Usually you will want to add
the gradient, normal and jacobian of this geometry to the namespace as well.
This can be done by calling `nutils.expression_v2.Namespace.define_for` with
the name of the geometry (as present in the namespace) followed by the names or
symbols you choose to represent the desired features as optional keyword
arguments:
```python
ns.define_for('x', gradient='∇', normal='n', jacobians=('dV', 'dS'))
```

The discrete solution is again added through a simple assignment:
```python
ns.u = topo.field('u', btype='spline', degree=1)
```

It is also possible to assign numbers and `numpy.ndarray` objects:

```python
ns.a = 1
ns.b = 2
ns.c = numpy.array([1,2])
ns.A = numpy.array([[1,2],[3,4]])
```

## Expressions

In addition to inserting ready objects, a namespace's real power lies in its
ability to be assigned string expressions. These expressions may reference any
`nutils.function.Array` function present in the
`nutils.expression_v2.Namespace`, and must explicitly name all array
dimensions, with the object of both aiding readibility and facilitating high
order tensor manipulations. A short explanation of the syntax follows; see
`nutils.expression_v2` for the complete documentation.

A *term* is written by joining variables with spaces, optionally preceeded by a
single number, e.g. `2 a b`.  A *fraction* is written as two terms joined by
`/`, e.g. `2 a / 3 b`, which is equivalent to `(2 a) / (3 b)`.  An *addition*
or *subtraction* is written as two terms joined by `+` or `-`, respectively,
e.g. `1 + a b - 2 b`.  *Exponentation* is written by two variables or numbers
joined by `^`, e.g. `a^2`.  Several trigonometric functions are available, e.g.
`0.5 sin(a)`.

Assigning an expression to the namespace is then done as follows.

```python
ns.e = '2 a / 3 b'
ns.e = (2*ns.a) / (3*ns.b) # equivalent w/o expression
```

The resulting `ns.e` is an ordinary `nutils.function.Array`.  Note that the
variables used in the expression should exist in the namespace, not just as a
local variable:

```python (skip)
localvar = 1
ns.f = '2 localvar'
# Traceback (most recent call last):
#   ...
# nutils.expression_v2.ExpressionSyntaxError: No such variable: `localvar`.
# 2 localvar
#   ^^^^^^^^
```

When using arrays in an expression all axes of the arrays should be labelled
with an index, e.g.  `2 c_i` and `c_i A_jk`.  Repeated indices are summed, e.g.
`A_ii` is the trace of `d` and `A_ij c_j` is the matrix-vector product of `d`
and `c`.  You can also insert a number, e.g. `c_0` is the first element of `c`.
All terms in an expression should have the same set of indices after summation,
e.g. it is an error to write `c_i + 1`.

When assigning an expression with remaining indices to the namespace, the
indices should be listed explicitly at the left hand side:

```python
ns.f_i = '2 c_i'
ns.f = 2*ns.c # equivalent w/o expression
```

The order of the indices matter: the resulting `nutils.function.Array` will
have its axes ordered by the listed indices.  The following three statements
are equivalent:

```python
ns.g_ijk = 'c_i A_jk'
ns.g_kji = 'c_k A_ji'
ns.g = ns.c[:,numpy.newaxis,numpy.newaxis]*ns.A[numpy.newaxis,:,:] # equivalent w/o expression
```

Function `∇`, introduced to the namespace with
`~nutils.expression_v2.Namespace.define_for` using geometry `ns.x`, returns the
gradient of a variable with respect `ns.x`, e.g. the gradient of the basis is
`∇_i(basis_n)`.  This works with expressions as well, e.g. `∇_i(2 basis_n +
basis_n^2)` is the gradient of `2 basis_n + basis_n^2`.

## Manual evaluation

Sometimes it is useful to evaluate an expression to an
`nutils.function.Array` without inserting the result in the namespace.
This can be done using the `<expression> @ <namespace>` notation.  An example
with a scalar expression:

```python
'2 a / 3 b' @ ns
# Array<>
(2*ns.a) / (3*ns.b) # equivalent w/o `... @ ns`
# Array<>
```

An example with a vector expression:

```python
'2 c_i' @ ns
# Array<2>
2*ns.c # equivalent w/o `... @ ns`
# Array<2>
```

If an expression has more than one remaining index, the axes of the evaluated
array are ordered alphabetically:

```python
'c_i A_jk' @ ns
# Array<2,2,2>
ns.c[:,numpy.newaxis,numpy.newaxis]*ns.A[numpy.newaxis,:,:] # equivalent w/o `... @ ns`
# Array<2,2,2>
```
