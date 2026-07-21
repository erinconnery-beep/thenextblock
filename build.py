#!/usr/bin/env python3
"""
Focus File build script.

Rebuilds the embedding chain from source, safely:

    focus-file.html  ->  focus-file-prompt.md  ->  index.html
                     ->  sample-writing.html / sample-jobsearch.html

Run this after ANY edit to focus-file.html or to the interview instructions at the
top of focus-file-prompt.md. Never hand-edit the embedded copy inside index.html.

    python3 build.py

Why a script: doing this by hand once corrupted index.html, because find-and-replace
can land inside the *embedded* template instead of the page itself. This uses exact
markers instead.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent

FULLPROMPT_OPEN = '<script type="text/plain" id="fullPrompt">'
TAIL_MARKER = '<script type="text/plain" id="m-design">'
FENCE = '```html\n'


def production_template(src: str) -> str:
    """Strip the dev-only TESTS object. Keep readable line breaks (do NOT minify)."""
    out = src
    start = out.find('const TESTS = {')
    if start == -1:
        return out  # already stripped
    after = out.find('const params = new URLSearchParams', start)
    if after == -1:
        sys.exit('build: could not find the end of the TESTS block')
    comment = out.rfind('/* ---- Config source', start, after)
    cut_to = comment if comment != -1 else after
    out = out[:start] + out[cut_to:]
    out = out.replace(
        'const cfg = urlCfg || (testKey && TESTS[testKey] ? TESTS[testKey] : CONFIG);',
        'const cfg = urlCfg || CONFIG;')
    out = out.replace('const testKey = params.get("test");\n', '')
    if 'TESTS' in out:
        sys.exit('build: TESTS still referenced after strip')
    return out


def main() -> None:
    template = production_template((ROOT / 'focus-file.html').read_text())

    longest = max(len(l) for l in template.split('\n'))
    if longest > 2000:
        sys.exit(f'build: longest line is {longest} chars — template looks minified, '
                 'which breaks large pastes. Aborting.')

    # 1. template -> focus-file-prompt.md (replace only the fenced code block)
    prompt_path = ROOT / 'focus-file-prompt.md'
    doc = prompt_path.read_text()
    fence_at = doc.find(FENCE)
    if fence_at == -1:
        sys.exit('build: no ```html block found in focus-file-prompt.md')
    head = doc[:fence_at + len(FENCE)]
    prompt_path.write_text(head + template + '\n```\n')

    prompt = prompt_path.read_text()
    if 'plausible' in prompt.lower():
        sys.exit('build: analytics found in the prompt — it must never ship inside a focus file')

    # 2. prompt -> index.html (rebuild the region between exact markers)
    index_path = ROOT / 'index.html'
    page = index_path.read_text()
    i = page.find(FULLPROMPT_OPEN)
    j = page.find(TAIL_MARKER)
    if i == -1 or j == -1:
        sys.exit('build: could not locate the fullPrompt / m-design markers in index.html')
    line_start = page.rfind('\n', 0, j) + 1
    rebuilt = (page[:i + len(FULLPROMPT_OPEN)]
               + prompt.replace('</script>', '<\\/script>')
               + '</script>\n'
               + page[line_start:])
    index_path.write_text(rebuilt)

    # 3. template + CONFIG -> samples
    config_re = re.compile(r'const CONFIG = \{.*?\n\};', re.DOTALL)
    for name in ('sample-writing.html', 'sample-jobsearch.html'):
        path = ROOT / name
        existing = config_re.search(path.read_text())
        if not existing:
            sys.exit(f'build: no CONFIG block found in {name}')
        path.write_text(config_re.sub(lambda _m: existing.group(0), template, count=1))

    # 4. sanity checks
    final = index_path.read_text()
    problems = []
    if final.count(FULLPROMPT_OPEN) != 1:
        problems.append('index.html has the wrong number of fullPrompt blocks')
    if 'const TESTS' in final:
        problems.append('TESTS leaked into index.html')
    for name in ('sample-writing.html', 'sample-jobsearch.html'):
        if 'plausible' in (ROOT / name).read_text().lower():
            problems.append(f'{name} contains analytics — it must not')
    if problems:
        sys.exit('build FAILED:\n  - ' + '\n  - '.join(problems))

    print('build OK')
    print(f'  template      {len(template):>7,} chars (longest line {longest})')
    print(f'  prompt doc    {len(prompt):>7,} chars')
    print(f'  index.html    {len(final):>7,} chars')
    print('  samples rebuilt, CONFIG blocks preserved')
    print('\nDeploy: index.html + sample-writing.html + sample-jobsearch.html')


if __name__ == '__main__':
    main()
