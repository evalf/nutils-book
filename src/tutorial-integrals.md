# Integrals

A central operation in any Finite Element application is to integrate a
function over a physical domain. In Nutils, integration starts with the
topology, in particular the `integral()` method.

The integral method takes a `nutils.function.Array` function as first argument
and the degree as keyword argument. The function should contain the Jacobian of
the geometry against which the function should be integrated, using either
`nutils.function.J` or `dV` in a namespace expression (assuming the jacobian
has been added to the namespace using `ns.define_for(..., jacobians=('dV',
'dS'))`). For example, the following integrates `1` against geometry `x`:

```python
I = topo.integral('1 dV' @ ns, degree=0)
I
# Array<>
```

The resulting `nutils.function.Array` object is a representation of the
integral, as yet unevaluated. To compute the actual numbers, call the
`Array.eval()` method:

```python
I.eval()
# 1.0
```

Be careful with including the Jacobian in your integrands.  The following two
integrals are different:

```python
topo.integral('(1 + 1) dV' @ ns, degree=0).eval()
# 2.0
topo.integral('1 + 1 dV' @ ns, degree=0).eval()
# 5.0
```

Like any other `nutils.function.Array`, the integrals can be added or
subtracted:

```python
J = topo.integral('x_0 dV' @ ns, degree=1)
(I+J).eval()
# 1.5
```

Recall that a topology boundary is also a `nutils.topology.Topology` object,
and hence it supports integration.  For example, to integrate the geometry `x`
over the entire boundary, write

```python
topo.boundary.integral('x_0 dS' @ ns, degree=1).eval()
# 1.0
```

To limit the integral to the right boundary, write

```python
topo.boundary['right'].integral('x_0 dS' @ ns, degree=1).eval()
# 1.0
```
Note that this boundary is simply a point and the integral a point evaluation.

## Back to our discrete solution

We observed earlier that we cannot evaluate our discrete solution because of
lacking a specification of topological points -- or in Nutils jargon: leaving a
*space* unbound. Integrals provide this information by defining the set of
quadrature points that the function will be evaluated in (followed by a
contraction with quadrature weights). This means we could aim to evaluate the
following function:
```python
f = topo.integral('∇_k(u) ∇_k(u) dV' @ ns, degree=1)
```
However, to do so we do need to provide the weights for argument 'u'. We do
this as follows:
```python
f.eval(u=[1,2,0,5,4])
```
Since integrals are `nutils.function.Array` objects, integrals involving
arguments support derivatives. Taking the derivative once results in a 1D
function, which evaluates to a `numpy.ndarray`:
```python
f.derivative('u').eval(u=[1,2,0,5,4])
# array([0.125, 0.25 , 0.25 , 0.25 , 0.125])
```
Since our function `f` is quadratic in 'u', the second derivative becomes
constant (i.e. independent of arguments) and can be evaluated without any
argument specification:
```python
M = f.derivative('u').derivative('u').eval()
```
Observing that higher dimensional arrays are likely sparse, the `eval()`
method in this situation does not return a dense `numpy.ndarray`, but a Nutils
sparse matrix object: a subclass of `nutils.matrix.Matrix`. Nutils interfaces
several linear solvers (more on this in Section [solvers](tutorial-solvers.md)
below) but if you want to use a custom solver you can export the matrix to a
dense, compressed sparse row or coordinate representation via the
`Matrix.export()` method:
```python
M.export('dense')
# array([[ 4., -4.,  0.,  0.,  0.],
#        [-4.,  8., -4.,  0.,  0.],
#        [ 0., -4.,  8., -4.,  0.],
#        [ 0.,  0., -4.,  8., -4.],
#        [ 0.,  0.,  0., -4.,  4.]])
M.export('csr') # (data, column indices, row pointers)
# (array([ 4., -4., -4.,  8., -4., -4.,  8., -4., -4.,  8., -4., -4.,  4.])
#  array([0, 1, 0, 1, 2, 1, 2, 3, 2, 3, 4, 3, 4])
#  array([ 0,  2,  5,  8, 11, 13])
M.export('coo') # (data, (row indices, column indices))
# (array([ 4., -4., -4.,  8., -4., -4.,  8., -4., -4.,  8., -4., -4.,  4.])
#  (array([0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4])
#   array([0, 1, 0, 1, 2, 1, 2, 3, 2, 3, 4, 3, 4])
```
