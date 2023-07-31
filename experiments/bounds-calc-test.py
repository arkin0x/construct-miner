import math
import json

# some constants to help us tweak the output
square_km_on_earth = 148940000 # the number of square km of land on earth
earth_divided_into_256x256 = 2272.64404296875 # the number of square km of land on earth divided by 256^2 (square_km_on_earth / 65536)
largest_construct_side = 48 # km. The side of the largest possible construct in km (ceil(math.sqrt(earth_divided_into_256x256))). 48 km is roughly the large enough to contain most metropolises, but the number was chosen because it is the square root of the number of square km of land on earth divided by 256^2 (square_km_on_earth / 65536). 256 is the number of sectors per axis in cyberspace. Theoretically, outside of some insane luck nobody will ever mine a construct this large because it would require a perfect 256-bit match to the target coordinate.
dspace_radius = 48028 # km. The radius from the center of the earth to geosynchronous orbit (https://en.wikipedia.org/wiki/Geosynchronous_orbit)
dspace_side = 96056 # km (dspace_radius * 2)
mm_in_km = 10 ** 6 # mm
dspace_units_side = 2 ** 85 # cyberspace units
dspace_units_to_mm = 96056 * mm_in_km / dspace_units_side # mm per cyberspace unit. Multiply units by this to get mm.
dspace_units_to_km = 96056 / dspace_units_side # km per cyberspace unit. Multiply units by this to get km.

print('dspace - mm',dspace_units_to_mm)

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
    # return math.floor(summation(pow) ** (pow/32))# ** (1 + pow / 32))
    return math.floor((2 ** (128 - pow)) * (48/dspace_units_to_km))# ** (1 + pow / 32))

# Table header
header_format = "{:<9} | {:<26} | {:<26}"
print(header_format.format('valid POW', 'box side length', 'increase from previous'))

# Separator
print('-' * 60)

# Table rows
row_format = "{:<9.0f} | {:<26.0f} | {:<26,.000f}"
while count < 129:
    prev = size(count-1)
    current = size(count)
    # print(row_format.format(count, current, math.floor(current - prev)))
    print(row_format.format(count, current, current * dspace_units_to_km))
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
