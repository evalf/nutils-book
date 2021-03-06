# Topology vs Geometry

Rather than having a single concept of what is typically referred to as the
'mesh', Nutils maintains a strict separation of *topology* and *geometry*. The
`nutils.topology.Topology` represents a collection of elements and
inter-element connectivity, along with recipes for creating bases. It has no
(public) notion of position.  The geometry takes the `nutils.topology.Topology`
and positions it in space.  This separation makes it possible to define
multiple geometries belonging to a single `nutils.topology.Topology`, a feature
that is useful for example in certain Lagrangian formulations.

While not having mesh objects, Nutils does have a `nutils.mesh` module, which
hosts functions that return tuples of topology and geometry. Nutils provides
two builtin mesh generators: `nutils.mesh.rectilinear`, a generator for
structured topologies (i.e. tensor products of one or more one-dimensional
topologies), and `nutils.mesh.unitsquare`, a unit square mesh generator with
square or triangular elements or a mixture of both.  The latter is mostly
useful for testing. In addition to generators, Nutils also provides the
`nutils.mesh.gmsh` importer for [gmsh](http://gmsh.info/)-generated meshes.

The structured mesh generator takes as its first argument a list of element
vertices per dimension. A one-dimensional topology with four elements of equal
size between 0 and 1 is generated by

```python
mesh.rectilinear([[0, 0.25, 0.5, 0.75, 1.0]])
# (StructuredTopology<4>, Array<1>)
```

Alternatively we could have used `numpy.linspace` to generate a sequence of
equidistant vertices, and unpack the resulting tuple:

```python
topo, geom = mesh.rectilinear([numpy.linspace(0, 1, 5)])
```

We will use this topology and geometry throughout the remainder of this
tutorial.

Note that the argument is a list of length one: this outer sequence lists the
dimensions, the inner the vertices per dimension. To generate a two-dimensional
topology, simply add a second list of vertices to the outer list.  For example,
an equidistant topology with four by eight elements with a unit square geometry
is generated by

```python
mesh.rectilinear([numpy.linspace(0, 1, 5), numpy.linspace(0, 1, 9)])
# (StructuredTopology<4x8>, Array<2>)
```

Any topology defines a boundary via the `nutils.topology.Topology.boundary`
attribute. Optionally, a topology can offer subtopologies via the getitem
operator. The rectilinear mesh generator automatically defines 'left' and
'right' boundary groups for the first dimension, making the left boundary
accessible as:

```python
topo.boundary['left']
# StructuredTopology<>
```

Optionally, a topology can be made periodic in one or more dimensions by
passing a list of dimension indices to be periodic via the keyword argument
`periodic`.  For example, to make the second dimension of the above
two-dimensional mesh periodic, add `periodic=[1]`:

```python
mesh.rectilinear([numpy.linspace(0, 1, 5), numpy.linspace(0, 1, 9)], periodic=[1])
# (StructuredTopology<4x8p>, Array<2>)
```

Note that in this case the boundary topology, though still available, is empty.
