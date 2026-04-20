from app import get_twse_mapping

m = get_twse_mapping()
print("Total mapped:", len(m))
if len(m) > 0:
    print("2330.TW ->", m.get("2330.TW"))
    print("3017.TW ->", m.get("3017.TW"))
    print("8299.TWO ->", m.get("8299.TWO"))
    keys = list(m.keys())[:10]
    print("Sample keys:", keys)
