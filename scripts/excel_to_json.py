import pandas as pd
import json

archivo_excel = "../datos/Aulas AUI.xlsx"

# ==================================================
# CURSADO
# ==================================================

clases = pd.read_excel(
    archivo_excel,
    sheet_name="Aulas QR"
)

clases = clases.fillna("")
clases = clases.astype(str)

with open(
    "../clases.json",
    "w",
    encoding="utf-8"
) as archivo:

    json.dump(
        clases.to_dict(orient="records"),
        archivo,
        ensure_ascii=False,
        indent=2
    )

# ==================================================
# EXÁMENES
# ==================================================

examenes = pd.read_excel(
    archivo_excel,
    sheet_name="Aulas Examen",
    dtype=str
)

examenes = examenes.fillna("")

# FECHA

if "DIA" in examenes.columns:

    examenes["DIA"] = pd.to_datetime(
        examenes["DIA"],
        errors="coerce"
    ).dt.strftime("%d/%m/%Y")

# HORA

if "HORA" in examenes.columns:

    examenes["HORA"] = pd.to_datetime(
        examenes["HORA"],
        errors="coerce"
    ).dt.strftime("%H:%M")

    examenes["HORA"] = examenes["HORA"].fillna("")

examenes = examenes.fillna("")
examenes = examenes.astype(str)
print(examenes["HORA"].head(20))
with open(
    "../examenes.json",
    "w",
    encoding="utf-8"
) as archivo:

    json.dump(
        examenes.to_dict(orient="records"),
        archivo,
        ensure_ascii=False,
        indent=2
    )

print("")
print(f"✅ Clases exportadas: {len(clases)}")
print(f"✅ Exámenes exportados: {len(examenes)}")
print("")
print("✅ clases.json actualizado")
print("✅ examenes.json actualizado")