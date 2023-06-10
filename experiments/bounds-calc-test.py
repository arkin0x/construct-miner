import math
import json

count = 1
prev = 0
current = 0

# Dictionary to store box side lengths for each POW
pow_sizes = {}

def raw(str):
    return format(str, '.0f')

def summation(n):
    if n < 2:
        return n
    else:
        return n + summation(n - 1)

def size(pow):
    return math.floor(summation(pow) ** (1 + pow / 32))

# Table header
header_format = "{:<9} | {:<26} | {:<26}"
print(header_format.format('valid POW', 'box side length', 'increase from previous'))

# Separator
print('-' * 60)

# Table rows
row_format = "{:<9.0f} | {:<26,.0f} | {:<26,.0f}"
while count < 129:
    prev = size(count-1)
    current = size(count)
    print(row_format.format(count, current, math.floor(current - prev)))
    # Store the box side length as a string without commas in the dictionary
    pow_sizes[str(count)] = str(current)
    if count < 128:
        count += 1
    elif count >= 8:
        count += 8

# Separator
print('-' * 60)

# Table footer
print(header_format.format('valid POW', 'box side length', 'increase from previous'))

print('\nmaximum sized constructs per axis: ', format(2**85 / size(128), ',.0f'))
print('maximum sized constructs per sector: ', format(2**85 / 256 / size(128), ',.0f'))
print('maximum sized constructs allowed in cyberspace: ', format((2**85 / size(128))**3, ',.0f'))

# Write the pow_sizes dictionary to a file in JSON format
# The key is the amount of valid proof-of-work and the value is the box side length of the construct.
with open('pow_sizes.json', 'w') as file:
    json.dump(pow_sizes, file)
