# Nutils 2 Chuka Men

Nutils 2 was released on February 18th, 2016 and saw no point releases.
- [Download](https://github.com/evalf/nutils/archive/refs/tags/v2.0.zip) (zip)
- [API Reference](https://docs.nutils.org/en/v2.0/)

## What's New?

These are the main additions and changes since [Nutils 1 Bakmi](release-1.md).

### Changed: jump sign

The jump operator has been changed according to the following definition:
`jump(f) = opposite(f) - f`. In words, it represents the value of the argument
from the side that the normal is pointing toward, minus the value from the side
that the normal is pointing away from. Compared to the old definition this
means the sign is flipped.

### Changed: Topology objects

The Topology base class no longer takes a list of elements in its constructor.
Instead, the `__iter__` method should be implemented by the derived class, as
well as `__len__` for the number of elements, and getelem(index) to access
individual elements. The 'elements' attribute is deprecated.

The `nutils.topology.StructuredTopology` object no longer accepts an array with
elements. Instead, an 'axes' argument is provided with information that allows
it to generate elements in the fly. The 'structure' attribute is deprecated. A
newly added `shape` tuple is now a documented attribute.

### Changed: properties dumpdir, outdir, outrootdir

Two global properties have been renamed as follows:

- dumpdir → outdir
- outdir → outrootdir

The `outrootdir` defaults to ~/public_html and can be redefined from the
command line or in the .nutilsrc configuration file. The outdir defaults to the
current directory and is redefined by `util.run`, nesting the name/date/time
subdirectory sequence under `outrootdir`.

### Changed: sum axis argument

The behaviour of `nutils.function.sum` is inconsistent with that of the Numpy
counterparts. In case no axes argument is specified, Numpy sums over all axes,
whereas Nutils sums over the last axis. To undo this mistake and transition to
Numpy's behaviour, calling sum without an axes argument is deprecated and will
be forbidden in Nutils 3.0. In Nutils 4.0 it will be reintroduced with the
corrected meaning.

### Changed: strict dimension equality in function.outer

The `nutils.function.outer` method allows arguments of different dimension by
left-padding the smallest prior to multiplication. There is no clear reason for
this generality and it hinders error checking. Therefore in future in
`function.outer(a, b)`, `a.ndim` must equal `b.ndim`. In a brief transition
period non-equality emits a warning.

### Changed: Evaluable base class

Relevant only for custom `nutils.function.Evaluable` objects, the `evalf`
method changes from constructor argument to instance/class method:

```python
class MyEval( function.Evaluable):
  def __init__(self, ...):
    function.Evaluable(args=[...], shape=...)
  def evalf( self, ...):
    ...
```

Moreover, the `args` argument may only contain Evaluable objects. Static
information is to be passed through `self`.

### Removed: _numeric C-extension

At this point Nutils is pure Python. It is no longer necessary to run make to
compile extension modules. The numeric.py module remains unchanged.

### Periodic boundary groups

Touching elements of periodic domains are no longer part of the `boundary`
topology. It is still available as boundary of an appropriate non-periodic
subtopology:

```python
domain.boundary['left'] # no longer valid
domain[:,:1].boundary['left'] # still valid
```

### New module: transform

The new `nutils.transform` module provides objects and operations relating to
affine coordinate transformations.

### Traceback explorer disabled by default

The new command line switch `--tbexplore` activates the traceback explorer on
program failure. To change the default behavior add `tbexplore=True` to your
.nutilsrc file.

### Rich output

The new command line switch `--richoutput` activates color and unicode output.
To change the default behavior add `richoutput=True` to your .nutilsrc file.
