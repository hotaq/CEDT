import pandas as pd

path = "/Users/chinnphats/Downloads/submission_clip_large.csv"
out = "/Users/chinnphats/Downloads/submission_clip_large_nosim.csv"

df = pd.read_csv(path, dtype={"image_id": str})
df = df.drop(columns=["sim_top1"], errors="ignore")
df.to_csv(out, index=False, encoding="utf-8-sig")

print(df.head())
print("saved:", out)
