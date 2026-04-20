content = open('app.py', encoding='utf-8').read()
lines = content.split('\n')

start = None
end = None
for i, l in enumerate(lines):
    if start is None and i >= 67 and '1342.TW' in l and 'u516b' in l:
        start = i
    if start is not None and l.strip() == '}':
        end = i
        break

if start and end:
    print(f'Removing lines {start+1} to {end+1}')
    new_lines = lines[:start] + lines[end+1:]
    with open('app.py', 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    print('Done, new line count:', len(new_lines))
else:
    print(f'Not found: start={start} end={end}')
    for i, l in enumerate(lines[65:75], start=66):
        print(i, l[:60])
