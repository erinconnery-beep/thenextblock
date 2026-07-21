#!/usr/bin/env python3
"""Focus File build.

    focus-file.html  ->  focus-file-prompt.md            (interview + template)
                     ->  index.html   (hidden <textarea id="fullPrompt">)
                     ->  sample-writing.html / sample-jobsearch.html

No escaping, no minifying, no stripping. The template ships exactly as written.
index.html fetches the prompt at run time instead of embedding it, so a closing
</script> or </textarea> inside the template can never break anything. Embedding a
document inside a document is what used to produce dead files.

    python3 build.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
ISLAND = re.compile(r'<script id="focus-config" type="application/json">[\s\S]*?</script>')


def main() -> None:
    template = (ROOT / 'focus-file.html').read_text()
    if not ISLAND.search(template):
        sys.exit('build: no focus-config island in the template')

    # 1. prompt document
    prompt = (ROOT / 'prompt-head.md').read_text() + '```html\n' + template + '\n```\n'
    (ROOT / 'focus-file-prompt.md').write_text(prompt)

    # 2. index.html needs no rebuilding — it fetches focus-file-prompt.md at run time
    page = ROOT / 'index.html'

    # 3. samples keep their own settings
    for name in ('sample-writing.html', 'sample-jobsearch.html'):
        p = ROOT / name
        keep = ISLAND.search(p.read_text())
        if not keep:
            sys.exit(f'build: no focus-config island in {name}')
        p.write_text(ISLAND.sub(lambda _m: keep.group(0), template, count=1))

    # 4. checks
    final = page.read_text()
    problems = []
    if "fetch('focus-file-prompt.md')" not in final:
        problems.append('index.html no longer fetches the prompt file')
    for block in re.findall(r'<script>([\s\S]*?)</script>', final):
        if '</script' in block or '</textarea' in block:
            problems.append('a closing tag inside an inline script would end the block early')
    for name in ('sample-writing.html', 'sample-jobsearch.html'):
        s = (ROOT / name).read_text()
        if 'plausible' in s.lower() or '<script src' in s or 'fetch(' in s:
            problems.append(f'{name} makes a network call — a focus file never may')
    if problems:
        sys.exit('build FAILED:\n  - ' + '\n  - '.join(problems))

    print('build OK')
    print(f'  template   {len(template):>7,} chars')
    print(f'  prompt     {len(prompt):>7,} chars')
    print(f'  index.html {len(final):>7,} chars')
    print('\nDeploy: index.html + focus-file-prompt.md + sample-writing.html + sample-jobsearch.html')


if __name__ == '__main__':
    main()
