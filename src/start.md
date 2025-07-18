# Getting Started

The following is a quick start guide to running your first Nutils simulation in
three simple steps. Afterward, be sure to read the [installation
guide](install.md) for extra installation instructions, study the
[tutorial](tutorial.md) to familiarize yourself with Nutils' concepts and
syntax, and explore the [examples](examples.md) for inspiration.

## Step 1: Install Nutils and Matplotlib

With Python version 3.7 or newer installed, Nutils and Matplotlib can be
installed via the [Python Package Index](https://pypi.org/project/nutils/)
using the pip package installer.
In a terminal window with an active [Python virtual environment](https://docs.python.org/3/library/venv.html):

```sh
python -m pip install nutils matplotlib
```

Note that Nutils depends on Numpy, Treelog and Stringly, which means that these
modules are pulled in automatically if they were not installed prior. Though most
Nutils applications will require [Matplotlib](https://matplotlib.org/) for
visualization, it is not a dependency for Nutils itself, and is therefore
installed explicitly.

## Step 2: Create a simulation script

Open a text editor and create a file `poisson.py` with the following contents:

```python
from nutils import mesh, function, solver, export, cli

def main(nelems: int = 10, etype: str = 'square'):
    domain, x = mesh.unitsquare(nelems, etype)
    u = function.dotarg('udofs', domain.basis('std', degree=1))
    g = u.grad(x)
    J = function.J(x)
    cons = solver.optimize('udofs',
        domain.boundary.integral(u**2 * J, degree=2), droptol=1e-12)
    udofs = solver.optimize('udofs',
        domain.integral((g @ g / 2 - u) * J, degree=1), constrain=cons)
    bezier = domain.sample('bezier', 3)
    x, u = bezier.eval([x, u], arguments=dict(udofs=udofs))
    export.triplot('u.png', x, u, tri=bezier.tri, hull=bezier.hull)

cli.run(main)
```

Note that while we could make the script even shorter by avoiding the main
function and `cli.run`, the above structure is preferred as it automatically
sets up a logging environment, activates a matrix backend and handles command
line parsing.

## Step 3: Run the simulation

Back in the terminal, the simulation can now be started by running:

```sh
python poisson.py
```

This should produce the following output:

```
NUTILS 9.0 "Jook-Sing"
arguments > nelems=10
arguments > etype=square
solve_constraints > optimizing for argument udofs (121) with drop tolerance 1e-12
solve_constraints > residual norm: 0.0e+00
solve_constraints > optimal value: 0.0e+00
solve_constraints > constrained 40 degrees of freedom of udofs
solve > optimizing for argument udofs (121) using direct method
solve > residual norm: 6.5e-17
solve > optimal value: -1.7e-02
u.png
log written to file:///home/myusername/public_html/poisson.py/log.html
```

If the terminal is reasonably modern (Windows users may want to install the new
[Windows Terminal](https://aka.ms/windowsterminal)) then the messages are
coloured for extra clarity. The last line of the log shows the location of the
simultaneously generated html file that holds the same log, as well as a link
to the generated image.

To run the same simulation on a mesh that is finer and made up or triangles
instead of squares, arguments can be provided on the command line:

```sh
python poisson.py nelems=20 etype=triangle
```
