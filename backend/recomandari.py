import mysql.connector
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler
import sys
#sistem de recomandare de tip collaborative filtering bazat pe itemi (Item-Based Collaborative Filtering)
# Pe ce se bazează algoritmul: Pe recenziile oferite de utilizatori la cărți (rating-uri de la 1 la 5).
# Nu ține cont de conținutul cărților (titlu, gen, autor etc.), ci de comportamentul altor utilizatori cu gusturi similare.

# Configurare conexiune la baza mea de date
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="ana",
    database="bibliotecadb"
)

# Recenzii: utilizator_id, carte_id, rating
recenzii_query = """
SELECT utilizator_id, carte_id, rating
FROM Recenzie
"""

df_recenzii = pd.read_sql(recenzii_query, conn)#dataframe cu cine a evaluat ce carte si cu ce nota

# 2. Cărți: id, titlu, autor, gen
carti_query = """
SELECT id AS carte_id, titlu, autor, gen
FROM Carte
"""

df_carti = pd.read_sql(carti_query, conn)#dataframe cu carti si detalii de baza despre fiecare

# Salvează în CSV
df_recenzii.to_csv("recenzii.csv", index=False)
df_carti.to_csv("carti.csv", index=False)

print(" Export finalizat: recenzii.csv și carti.csv")

conn.close()

# Citim recenziile
recenzii_df = pd.read_csv("recenzii.csv")
carti_df = pd.read_csv("carti.csv")

# Construirea matricei utilizator–carte: Linii = utilizatori, Coloane = cărți, Valori = rating-uri
pivot = recenzii_df.pivot_table(index="utilizator_id", columns="carte_id", values="rating", fill_value=0)

# 3. Salvează matricea pentru vizualizare opțională
pivot.to_csv("matrice_rating.csv")

print("Matrice de rating creată cu succes!")


#Construirea modelului de recomandare (item-based collaborative filtering)
# Încarcă matricea de rating
df_ratings = pd.read_csv('matrice_rating.csv', index_col=0)

# Calculează similaritatea dintre cărți
item_similarity = cosine_similarity(df_ratings.T)  # Transpui (.T) ca să obții: Linii = cărți, Coloane = utilizatori, Apoi aplici cosine_similarity() → care măsoară cât de asemănătoare sunt două cărți pe baza modului în care au fost evaluate de toți utilizatorii; Rezultat: un tabel care arată cât de similară e cartea A cu B, C, etc.
item_similarity_df = pd.DataFrame(item_similarity, index=df_ratings.columns, columns=df_ratings.columns)#salvez ca dataframe

# Funcția de generare a recomandărilor: utilizator_id: ID-ul utilizatorului pentru care generăm recomandări, numar_recomandari: câte recomandări să returneze (default = 15), cu_scoruri: dacă vrem să adăugăm și scorul de similaritate calculat pentru fiecare carte recomandată.
def recomanda_carti(utilizator_id, numar_recomandari=15, cu_scoruri=False):
    if utilizator_id not in df_ratings.index:#Dacă utilizatorul nu există în matricea de rating (adică nu a evaluat nicio carte)
        return []#nu are sens să generăm recomandări deci întoarcem listă goală

    ratings_utilizator = df_ratings.loc[utilizator_id]#Extragem rândul din matricea de rating care conține notele pe care le-a dat fiecare carte
    carti_evaluate = ratings_utilizator[ratings_utilizator > 0]#Ne interesează doar cărțile pe care le-a citit și notat efectiv — cele cu scor mai mare decât 0.)

    scoruri = pd.Series(0, index=item_similarity_df.columns, dtype=float)#Avem o listă în care ținem scoruri pentru toate cărțile nevăzute de utilizator. La început toate au scor 0

    for carte_id, rating in carti_evaluate.items():#Pentru fiecare carte pe care utilizatorul a evaluat-o
        similaritati = item_similarity_df[str(carte_id)]#căutăm cât de similare sunt celelalte cărți față de ea
        scoruri += similaritati * rating# dăm puncte cărților similare, în funcție de cât de mult i-a plăcut (De exemplu: dacă utilizatorul a dat 5 stele unei cărți de istorie, alte cărți de istorie vor primi un scor mai mare)

    scoruri = scoruri.drop(labels=carti_evaluate.index.astype(str), errors='ignore')#Eliminăm cărțile deja citite de utilizator
    scoruri = scoruri.sort_values(ascending=False)#Sortăm scorurile descrescător
    recomandari_ids = scoruri.head(numar_recomandari).index.tolist()#păstrăm doar ID-urile primelor numar_recomandari cărți
    recomandari_ids_int = [int(carte_id) for carte_id in recomandari_ids]#luam id urile cartilor intr un vector
    
    recomandari_finale = carti_df[carti_df['carte_id'].isin(recomandari_ids_int)].copy()#Folosim tabelul complet al cărților ca să obținem titlul, autorul, imaginea etc., nu doar ID-ul.
    
    if cu_scoruri:#Dacă cu_scoruri=True, adăugăm și scorul de similaritate pentru fiecare carte recomandată
        recomandari_finale["scor"] = recomandari_finale["carte_id"].astype(str).map(scoruri)

    return recomandari_finale



def salveaza_recomandari_in_db(utilizator_id, recomandari_df):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="ana",
        database="bibliotecadb"
    )
    cursor = conn.cursor()#Se creează o conexiune la baza de date bibliotecadb și se obține un cursor, care ne permite să executăm comenzi SQL

    # Înainte să adăugăm recomandări noi, ștergem cele vechi pentru acel utilizator. Astfel evităm duplicatele și păstrăm doar lista curentă
    cursor.execute("DELETE FROM Recomandare WHERE utilizator_id = %s", (utilizator_id,))

    # Inserează recomandări noi
    for _, row in recomandari_df.iterrows():#Pentru fiecare rând din recomandari_df (adică fiecare carte recomandată), inserăm un nou rând în tabela Recomandare
        cursor.execute("""
            INSERT INTO Recomandare (utilizator_id, carte_id, scor)
            VALUES (%s, %s, %s)
        """, (utilizator_id, int(row['carte_id']), float(row['scor'])))

    conn.commit()#salvează modificările în baza de date
    cursor.close()#Se închide cursorul și conexiunea
    conn.close()
    print(f" Recomandări salvate pentru utilizatorul {utilizator_id}")#un mesaj de confirmare în consolă


for utilizator_id in df_ratings.index:#Parcurge fiecare utilizator care există în matricea de rating (df_ratings.index), generează 25 de recomandări pentru el și le salvează în DB
    recomandari = recomanda_carti(utilizator_id=utilizator_id, numar_recomandari=25, cu_scoruri=True)
    if not recomandari.empty:
        salveaza_recomandari_in_db(utilizator_id, recomandari)

#se executa cand il rulez ca script principal, cu python3 recomandari.py 8 de ex pt utilizatorul 8
if __name__ == "__main__":
    if len(sys.argv) > 1:
        utilizator_id = int(sys.argv[1])
        recomandari = recomanda_carti(utilizator_id, numar_recomandari=25, cu_scoruri=True)
        if not recomandari.empty:
            salveaza_recomandari_in_db(utilizator_id, recomandari)
            print(f" Recomandări regenerate pentru utilizatorul {utilizator_id}")
        else:
            print(f" Nicio recomandare pentru utilizatorul {utilizator_id}")
#rulez cu: python3 recomandari.py