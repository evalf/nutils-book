# Installing Nutils

Nutils is installed via Python's [Pip](https://pip.pypa.io/en/stable/) package
installer, which most Python distributions install by default. In the following
instructions we assume that pip is run with sufficient privileges to install
modules system wide, or (more common) that a [virtual
environment](https://docs.python.org/3/library/venv.html) is active for local
installation.

The following command installs the stable version of Nutils from the package
archive, along with its dependencies [Numpy](https://numpy.org/),
[Treelog](https://github.com/evalf/treelog) and
[Stringly](https://github.com/evalf/stringly):

```sh
python -m pip install nutils
```

To install the most recent development version we use Github's ability to
generate zip balls:

```sh
python -m pip install https://github.com/evalf/nutils/archive/refs/heads/main.zip
```

Alternatively, if the [Git](https://git-scm.com/) version control system is
installed, we can use pip's ability to interact with it directly to install the
same version as follows:

```sh
python -m pip install git+https://github.com/evalf/nutils.git@main
```

This notation has the advantage that even a specific tag or commit (rather than
a branch name) can be installed directly by specifying it after the `@`.

Finally, if we do desire a checkout of the Nutils source code, for instance to
make changes to it, then we can instruct pip to install directly from the
location on disk:

```sh
git clone https://github.com/evalf/nutils.git
cd nutils
python -m pip install .
```
