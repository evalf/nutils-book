# Examples

The fastest way to build a new Nutils simulation is to borrow bits and pieces
from existing scripts. Aiming to facilitate this practice,
[examples.nutils.org](https://examples.nutils.org) provides a gallery of
concise examples demonstrating different areas of physics and varying
computational techniques.

The examples are taken from both the Nutils
[repository](https://github.com/evalf/nutils/tree/master/examples) and user
contributed repositories, and are tested regularly to confirm validity against
different versions of Nutils.

## Contributing

Users are encouraged to contribute (concise versions of) their simulations to
this collection of examples. In doing so, they help other users get up to
speed, they help the developers by adding to a large body of realistic codes to
test Nutils against, and, in doing so, they may even help themselves by
preventing future Nutils version from accidentally breaking their code.

Examples should resemble the [official
examples](https://github.com/evalf/nutils/tree/master/examples) from the Nutils
repository. In particular, they:
- use `cli.run` to call main function;
- have reasonable default parameters corresponding to a simulation that is relevant but not overly expensive;
- do not make use of undocumented functions (typically prefixed with an underscore);
- use the most recent version of the [namespace](https://nutils.org/tutorial-namespace.html), if applicable;
- generate one or more images that visualize the solution of the simulation;
- use `treelog` to communicate output (`info` or `user` for text, `infofile` or `userfile` for data);
- conform to the [PEP 8](https://peps.python.org/pep-0008/) coding style;
- are concise enough to fit a single file.

Examples are submitted by means of a pull request to the [examples
repository](https://github.com/evalf/nutils-website), which should add a yaml
file to the examples/user directory. The file should define the following
entries:

- *name* — Title of the simulation.
- *authors* — List of author names.
- *description* — Markdown formatted description of the simulation.
- *repository* — URL of the Git repository that contains the script.
- *commit* — Commit hash.
- *script* — Path of the script.
- *images* — List of images that are selected as preview.
- *tags* — List of relevant tags.

Once merged, the script becomes part of the automated testing suite which runs
it at regular intervals against the latest Nutils version. The code itself
remains hosted on the external git repository. In case new features merit
updates to the script, the developers may reach out with concrete suggestions
to keep the examples relevant.
