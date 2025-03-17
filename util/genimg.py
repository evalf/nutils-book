# very simple script to generate images for the tutorial; we may want to
# replace this with something more sophisticated later.

import re, os, io
import matplotlib

matplotlib.rcParams['svg.hashsalt'] = 'reproducible'
matplotlib.rcParams['svg.fonttype'] = 'none' # labels as text i/o paths
matplotlib.rcParams['savefig.format'] = 'svg'
matplotlib.rcParams['figure.facecolor'] = '#0000' # fully transparent
matplotlib.rcParams['axes.facecolor'] = '#8882' # semi-transparent gray
matplotlib.rcParams['axes.edgecolor'] = '#888' # gray
matplotlib.rcParams['axes.labelcolor'] = '#888' # gray
matplotlib.rcParams['axes.titlecolor'] = '#888' # gray
matplotlib.rcParams['xtick.color'] = '#888' # gray
matplotlib.rcParams['ytick.color'] = '#888' # gray

images = []
ns = {}
for section in re.findall('[(](tutorial.*)[.]md[)]', open('src/SUMMARY.md').read()):
    print('ENTERING', section)
    index = 0
    for snippet in re.findall('^```python$(.*?)^```$', open(f'src/{section}.md').read(), re.MULTILINE | re.DOTALL):
        exec(snippet, ns, ns)
        for fignum in matplotlib.pyplot.get_fignums():
            with io.BytesIO() as f:
                matplotlib.pyplot.figure(fignum).savefig(f, metadata=dict(Creator=None, Date=None, Format=None, Type=None))
                data = f.getvalue()
            index += 1
            imgpath = f'src/{section}-fig{index}.svg'
            images.append(imgpath)
            with open(imgpath, 'wb') as f:
                f.write(data)
        matplotlib.pyplot.close('all')

print(f'created {len(images)} images:')
print('\n'.join(images))
