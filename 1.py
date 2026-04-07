best = float('inf')
best_x = -1

for x in range(0, 201):
    z = x**3 - 8*x**2 - 35*x + 150
    if z < best:
        best = z
        best_x = x

print(best_x)