from pathlib import Path

import pandas as pd

# 1. Get your files
TEST_DIR = "/Users/chinnphats/Desktop/cedt/Super AI"
test_files = list(Path(TEST_DIR).glob("*.csv"))

print(f"Found {len(test_files)} files to blend.")

# 2. Read all CSVs
dataframes = [pd.read_csv(file) for file in test_files]

# 3. Extract just the prediction column from all files and put them side-by-side
# Replace "target" with the actual name of your 0/1 column!
column_name = "answer"
all_predictions = pd.concat([df[column_name] for df in dataframes], axis=1)

# 4. Take the Majority Vote (the mode)
# axis=1 looks across the rows. [0] grabs the first mode in case of a tie.
majority_vote = all_predictions.mode(axis=1)[0].astype(int)

# 5. Create your final submission/output file
# We copy the first dataframe so we keep any "ID" columns intact
final_blend = dataframes[0].copy()
final_blend[column_name] = majority_vote

# 6. Save it
final_blend.to_csv("smart_blend_binary.csv", index=False)
print("Successfully created binary smart blend!")
