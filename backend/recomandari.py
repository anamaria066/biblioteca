import mysql.connector
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler
import sys

# Configurare conexiune
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="ana",
    database="bibliotecadb"
)

# 1. Recenzii: utilizator_id, carte_id, rating
recenzii_query = """
SELECT utilizator_id, carte_id, rating
FROM Recenzie
"""

df_recenzii = pd.read_sql(recenzii_query, conn)

# 2. Cărți: id, titlu, autor, gen
carti_query = """
SELECT id AS carte_id, titlu, autor, gen
FROM Carte
"""

df_carti = pd.read_sql(carti_query, conn)

# Salvează în CSV
df_recenzii.to_csv("recenzii.csv", index=False)
df_carti.to_csv("carti.csv", index=False)

print("✅ Export finalizat: recenzii.csv și carti.csv")

conn.close()

# 1. Citim recenziile
recenzii_df = pd.read_csv("recenzii.csv")
carti_df = pd.read_csv("carti.csv")

# 2. Matricea utilizator - carte
pivot = recenzii_df.pivot_table(index="utilizator_id", columns="carte_id", values="rating", fill_value=0)

# 3. Salvează matricea pentru vizualizare opțională
pivot.to_csv("matrice_rating.csv")

print("Matrice de rating creată cu succes!")



#Construirea modelului de recomandare (item-based collaborative filtering)
# 1. Încarcă matricea de rating
df_ratings = pd.read_csv('matrice_rating.csv', index_col=0)

# 2. Calculează similaritatea dintre cărți
item_similarity = cosine_similarity(df_ratings.T)  # Transpunem pentru similaritate între coloane (cărți)
item_similarity_df = pd.DataFrame(item_similarity, index=df_ratings.columns, columns=df_ratings.columns)

# 3. Funcția de generare a recomandărilor
def recomanda_carti(utilizator_id, numar_recomandari=15, cu_scoruri=False):
    if utilizator_id not in df_ratings.index:
        return []

    ratings_utilizator = df_ratings.loc[utilizator_id]
    carti_evaluate = ratings_utilizator[ratings_utilizator > 0]

    scoruri = pd.Series(0, index=item_similarity_df.columns, dtype=float)

    for carte_id, rating in carti_evaluate.items():
        similaritati = item_similarity_df[str(carte_id)]
        scoruri += similaritati * rating

    scoruri = scoruri.drop(labels=carti_evaluate.index.astype(str), errors='ignore')
    scoruri = scoruri.sort_values(ascending=False)
    recomandari_ids = scoruri.head(numar_recomandari).index.tolist()
    recomandari_ids_int = [int(carte_id) for carte_id in recomandari_ids]
    
    recomandari_finale = carti_df[carti_df['carte_id'].isin(recomandari_ids_int)].copy()
    
    if cu_scoruri:
        recomandari_finale["scor"] = recomandari_finale["carte_id"].astype(str).map(scoruri)

    return recomandari_finale



def salveaza_recomandari_in_db(utilizator_id, recomandari_df):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="ana",
        database="bibliotecadb"
    )
    cursor = conn.cursor()

    # Șterge recomandările anterioare
    cursor.execute("DELETE FROM Recomandare WHERE utilizator_id = %s", (utilizator_id,))

    # Inserează recomandări noi
    for _, row in recomandari_df.iterrows():
        cursor.execute("""
            INSERT INTO Recomandare (utilizator_id, carte_id, scor)
            VALUES (%s, %s, %s)
        """, (utilizator_id, int(row['carte_id']), float(row['scor'])))

    conn.commit()
    cursor.close()
    conn.close()
    print(f"💾 Recomandări salvate pentru utilizatorul {utilizator_id}")


for utilizator_id in df_ratings.index:
    recomandari = recomanda_carti(utilizator_id=utilizator_id, numar_recomandari=15, cu_scoruri=True)
    if not recomandari.empty:
        salveaza_recomandari_in_db(utilizator_id, recomandari)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        utilizator_id = int(sys.argv[1])
        recomandari = recomanda_carti(utilizator_id, numar_recomandari=15, cu_scoruri=True)
        if not recomandari.empty:
            salveaza_recomandari_in_db(utilizator_id, recomandari)
            print(f"✅ Recomandări regenerate pentru utilizatorul {utilizator_id}")
        else:
            print(f"⚠️ Nicio recomandare pentru utilizatorul {utilizator_id}")
#rulez cu: python3 recomandari.py