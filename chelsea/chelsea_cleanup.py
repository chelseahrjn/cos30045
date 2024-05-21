import csv

# Open the original CSV file
with open('chelsea_data.csv', 'r') as file:
    reader = csv.reader(file)
    data = list(reader)

# Extract the header row
header = data[0]

# Create a new list for the reformatted data
reformatted_data = []

# Iterate over the rows (excluding the header row)
for row in data[1:]:
    country = row[0]
    
    for i in range(1, len(row), 2):
        year = header[i]
        pharma_value = row[i]
        death_value = row[i+1]

        # Append if country value exist
        if country:
            reformatted_data.append([country, year, 'PHARMA', pharma_value])
            reformatted_data.append([country, year, 'DEATH', death_value])

# Write the reformatted data to a new CSV file
with open('chelsea_reformatted.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['country', 'year', 'type', 'value'])
    writer.writerows(reformatted_data)