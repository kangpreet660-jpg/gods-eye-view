#!/usr/bin/env python3
"""Fix DATA_SOURCES.md by removing git conflict markers and the duplicate table."""

with open('DATA_SOURCES.md', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.read().splitlines()

# Find conflict markers
head_idx = None
sep_idx = None
for i, line in enumerate(lines):
    if '<<<<<<< HEAD' in line:
        head_idx = i
    if '| =======' in line:
        if head_idx is not None and sep_idx is None:
            sep_idx = i

print(f'head_idx={head_idx}, sep_idx={sep_idx}')

if head_idx is not None and sep_idx is not None:
    # The second table ends before the next non-table content
    end_idx = None
    for i in range(sep_idx + 1, len(lines)):
        if not lines[i].startswith('|'):
            end_idx = i
            break
    if end_idx is None:
        end_idx = len(lines)
    print(f'end_idx={end_idx}')
    # Keep 0..head_idx-1 and end_idx..end
    new_lines = lines[:head_idx] + lines[end_idx:]
    with open('DATA_SOURCES.md', 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    print('Fixed DATA_SOURCES.md')
else:
    print('No conflict found')

# Verify
with open('DATA_SOURCES.md', 'r', encoding='utf-8') as f:
    new_content = f.read()

import re
rows = [l for l in new_content.split('\n') if re.search(r'^\| \*\*(MBTA|CapMetro|Metro Transit|OVapi|Entur|TransLink|HSL)', l)]
print(f'Transit table rows after fix: {len(rows)}')
for r in rows:
    print(f'  {r[:80]}')