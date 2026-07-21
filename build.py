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

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent

ISLAND_RE = re.compile(r'<script id="focus-config" type="application/json">[\s\S]*?</script>')

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
    out = '\n'.join(l for l in out.split('\n') if '/*DEV*/' not in l)
    if 'TESTS' in out:
        sys.exit('build: TESTS still referenced after strip')
    return out


def _strip_js_comments(js: str) -> str:
    """Whole-line JS comments only. Never touches trailing comments, so a `//` inside
    a string or regex literal can't be mistaken for one."""
    out, in_block = [], False
    for ln in js.split('\n'):
        st = ln.strip()
        if in_block:
            if '*/' in st:
                in_block = False
                rest = st.split('*/', 1)[1].strip()
                if rest:
                    out.append(rest)
            continue
        if st.startswith('/*'):
            if '*/' in st[2:]:
                rest = st.split('*/', 1)[1].strip()
                if rest:
                    out.append(rest)
            else:
                in_block = True
            continue
        if st.startswith('//') or not st:
            continue
        out.append(st)
    return '\n'.join(out)


def compact(src: str) -> str:
    """Shrink the shipped template without minifying it.

    Line breaks are preserved — the longest line stays ~443 chars, so large pastes
    still work (see 'Why the template is NOT minified'). What goes is comments,
    blank lines, indentation, and CSS whitespace. The CONFIG block is held out
    verbatim: it is what the interview rewrites and what build.py's sample regex
    matches. focus-file.html itself stays fully readable; only output is compacted.
    """
    cfg_m = ISLAND_RE.search(src)
    if not cfg_m:
        sys.exit('build: no focus-config island found in the template')
    cfg = cfg_m.group(0)
    sentinel = '<!--__CONFIG_ISLAND__-->'
    src = src.replace(cfg, sentinel)

    # the crash guard is a <script> block ABOVE <style>; the main script is the LAST one.
    guard_m = re.search(r'  <script>\n/\* CRASH GUARD[\s\S]*?</script>\n', src)
    guard_sent = '<!--__CRASH_GUARD__-->'
    if guard_m:
        src = src.replace(guard_m.group(0), guard_sent + '\n')

    s_i = src.find('<style>') + len('<style>')
    s_e = src.find('</style>')
    j_i = src.rfind('<script>') + len('<script>')
    j_e = src.rfind('</script>')
    if min(s_i, s_e, j_i, j_e) < 0 or not (s_e < j_i < j_e):
        sys.exit('build: could not locate <style>/<script> regions in the template')

    css = re.sub(r'/\*.*?\*/', '', src[s_i:s_e], flags=re.DOTALL)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{;:,])\s*', r'\1', css)
    css = re.sub(r';?\s*}', '}', css)
    css = re.sub(r'\n\s*', '\n', css.replace('}', '}\n').strip())

    js = _strip_js_comments(src[j_i:j_e])
    ded = lambda x: '\n'.join(l.strip() for l in x.split('\n') if l.strip())
    out = (ded(src[:s_i]) + '\n' + css + '\n' + ded(src[s_e:j_i])
           + '\n' + js + '\n' + ded(src[j_e:]))
    out = out.replace(sentinel, cfg)
    if guard_m:
        out = out.replace(guard_sent, guard_m.group(0).rstrip('\n'))
    return out


def main() -> None:
    readable = production_template((ROOT / 'focus-file.html').read_text())
    template = compact(readable)

    # nothing may be lost in compaction
    ids = lambda s: set(re.findall(r'id="([^"]+)"', s))
    fns = lambda s: set(re.findall(r'function (\w+)', s))
    keys = lambda s: set(json.loads(ISLAND_RE.search(s).group(0)
                         .split('>', 1)[1].rsplit('</script', 1)[0]).keys())
    for label, f in (('element ids', ids), ('functions', fns), ('CONFIG keys', keys)):
        lost = f(readable) - f(template)
        if lost:
            sys.exit(f'build: compaction dropped {label}: {sorted(lost)}')
    if not ISLAND_RE.search(template):
        sys.exit('build: compaction damaged the focus-config island')


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
    for name in ('sample-writing.html', 'sample-jobsearch.html'):
        path = ROOT / name
        existing = ISLAND_RE.search(path.read_text())
        if not existing:
            sys.exit(f'build: no focus-config island found in {name}')
        path.write_text(ISLAND_RE.sub(lambda _m: existing.group(0), template, count=1))

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
