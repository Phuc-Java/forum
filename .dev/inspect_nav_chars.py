p = r'd:/Forum/my-app/app/intro/page.tsx'
with open(p, 'rb') as f:
    b = f.read()
try:
    s = b.decode('utf-8')
except UnicodeDecodeError:
    s = b.decode('utf-8', errors='replace')
lines = s.splitlines()
start = 40
end = 50
for i in range(start, end):
    if i < len(lines):
        ln = lines[i]
        print(f"L{i+1}: {ln}")
        for j,ch in enumerate(ln):
            print(f"  {j:03}: U+{ord(ch):04X} {repr(ch)}")
        print()
else:
    print('Done')
