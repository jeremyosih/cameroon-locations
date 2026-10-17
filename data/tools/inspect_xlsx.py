import sys, openpyxl
wb = openpyxl.load_workbook(sys.argv[1], read_only=True)
for ws in wb.worksheets:
    rows = list(ws.iter_rows(values_only=True))
    print(f"== {ws.title}: {len(rows)-1} rows")
    print("   cols:", rows[0])
    for r in rows[1:3]: print("   ", r)
