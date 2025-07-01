import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import { Op } from 'sequelize';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { getCheltuieliLunare, getGenuriPopularitate, getImprumuturiLunare, getUtilizatoriNoi, getTipuriCheltuieli, getTaxeIntarziereZilnice } from './Statistici.js';
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { exec } from 'child_process';
import dotenv from "dotenv";
dotenv.config();


// pt ca folosesc ESModules (cu `import` în loc de `require`):
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configurare nodemailer
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bibliotecaonlinesystem@gmail.com',
        pass: 'uiai mhpi gdlx zyde'
    }
});


const app = express();
app.use(cors());
app.use(express.json());

// Asta face fișierele din /uploads accesibile public:
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const SECRET_KEY = "biblioteca_secret_key";
const ACCESS_KEYS = ["ADMIN123", "ADMIN456"]; // Lista de chei de acces valide


// Creează conexiunea fără să specifici baza de date
const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ana"
});

// Creează baza de date dacă nu există
await connection.query("CREATE DATABASE IF NOT EXISTS bibliotecadb");

await connection.end();

// Configurarea bazei de date MySQL
const sequelize = new Sequelize('bibliotecadb', 'root', 'ana', {
    host: 'localhost',
    dialect: 'mysql'
});

// Definirea tabelei "Carte"
export const Carte = sequelize.define('Carte', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    titlu: {
        type: DataTypes.STRING,
        allowNull: false
    },
    autor: {
        type: DataTypes.STRING,
        allowNull: false
    },
    an_publicatie: {
        type: DataTypes.INTEGER
    },
    descriere: {
        type: DataTypes.TEXT, // Am adăugat câmpul "descriere"
        allowNull: true
    },
    limba: {
        type: DataTypes.STRING,
        allowNull: true // sau false dacă vrei să fie obligatorie
    },
    gen: {
        type: DataTypes.STRING
    },
    pret: {
        type: DataTypes.FLOAT
    },
    imagine: {
        type: DataTypes.STRING,  // Stocăm URL-ul imaginii
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});


// Definirea tabelei "ExemplarCarte"
export const ExemplarCarte = sequelize.define('ExemplarCarte', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    carte_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Carte,
            key: 'id'
        },
        onDelete: 'CASCADE' // Dacă se șterge cartea, se șterg și exemplarele
    },
    stare: {
        type: DataTypes.ENUM('bună', 'deteriorată', 'necesită înlocuire'),
        allowNull: false,
        defaultValue: 'bună'
    },
    data_achizitie: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    cost_achizitie: { 
        type: DataTypes.FLOAT, 
        allowNull: false 
    }, 
    status_disponibilitate: {
        type: DataTypes.ENUM('disponibil', 'in asteptare', 'împrumutat'),
        defaultValue: 'disponibil'
    }
}, {
    timestamps: false,
    freezeTableName: true
});


// Definirea tabelei "Utilizator"
export const Utilizator = sequelize.define('Utilizator', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nume: {
        type: DataTypes.STRING,
        allowNull: false
    },
    prenume: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    parola: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tip: {
        type: DataTypes.ENUM('client', 'administrator'),
        allowNull: false
    },
    cheie_administrativa: {
        type: DataTypes.STRING,
        allowNull: true
    },
    poza_profil: {
        type: DataTypes.STRING,  // Stocăm URL-ul imaginii
        allowNull: true
    }
}, {
    timestamps: true,
    freezeTableName: true
});


// Definirea tabelei "Recenzie"
export const Recenzie = sequelize.define('Recenzie', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    utilizator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizator,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    carte_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Carte,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0, max: 5 }
    },
    comentariu: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    data_recenzie: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    freezeTableName: true
});

// Definirea tabelei "Imprumut"
export const Imprumut = sequelize.define('Imprumut', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    utilizator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizator,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    exemplar_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: ExemplarCarte,
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
    data_imprumut: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    data_returnare: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('în așteptare', 'activ', 'returnat', 'expirat'),
        defaultValue: 'activ'
    },
    cod_confirmare: {
        type: DataTypes.STRING(6),
        allowNull: true, //va fi completat doar la creare
        unique: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});


// Definirea tabelei "Cheltuiala"
export const Cheltuiala = sequelize.define('Cheltuiala', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    exemplar_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ExemplarCarte,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    tip_cheltuiala: {
        type: DataTypes.ENUM('Reparatie', 'Inlocuire'),
        allowNull: false
    },
    cost_total: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    detalii_suplimentare: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    data_cheltuiala: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    freezeTableName: true
});


//Definirea tabelei Favorite
export const Favorite = sequelize.define('Favorite', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    utilizator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizator,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    carte_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Carte,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: false,
    freezeTableName: true
});

//Definirea tabelei Recomandate
export const Recomandare = sequelize.define('Recomandare', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    utilizator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Utilizator,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    carte_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Carte,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    scor: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    timestamps: false,
    freezeTableName: true
});


export const TaxaIntarziere = sequelize.define('TaxaIntarziere', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    imprumut_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Imprumut,
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    suma: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    platita: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    data_taxare: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

//Definirea relațiilor între tabele
Utilizator.hasMany(Recenzie, { foreignKey: 'utilizator_id' });
Carte.hasMany(Recenzie, { foreignKey: 'carte_id' });
Recenzie.belongsTo(Utilizator, { foreignKey: 'utilizator_id' });
Recenzie.belongsTo(Carte, { foreignKey: 'carte_id' });
Utilizator.hasMany(Imprumut, { foreignKey: 'utilizator_id' });
Imprumut.belongsTo(Utilizator, { foreignKey: 'utilizator_id' });
Utilizator.hasMany(Favorite, { foreignKey: 'utilizator_id' });
Carte.hasMany(Favorite, { foreignKey: 'carte_id' });
Favorite.belongsTo(Utilizator, { foreignKey: 'utilizator_id' });
Favorite.belongsTo(Carte, { foreignKey: 'carte_id' });
Carte.hasMany(ExemplarCarte, { foreignKey: 'carte_id' });
ExemplarCarte.belongsTo(Carte, { foreignKey: 'carte_id' });
Imprumut.belongsTo(ExemplarCarte, { foreignKey: 'exemplar_id' });
ExemplarCarte.hasMany(Imprumut, { foreignKey: 'exemplar_id' });
Imprumut.hasOne(TaxaIntarziere, { foreignKey: 'imprumut_id' });
TaxaIntarziere.belongsTo(Imprumut, { foreignKey: 'imprumut_id' });
Utilizator.hasMany(Recomandare, { foreignKey: 'utilizator_id' });
Carte.hasMany(Recomandare, { foreignKey: 'carte_id' });
Recomandare.belongsTo(Utilizator, { foreignKey: 'utilizator_id' });
Recomandare.belongsTo(Carte, { foreignKey: 'carte_id' });


// Sincronizarea bazei de date (crearea tabelei, dacă nu există)
sequelize.sync()  //{ force: true }
    .then(() => {
        console.log("Baza de date a fost sincronizată!");
    })
    .catch((err) => {
        console.error("Eroare la sincronizarea bazei de date:", err);
    });





// ===============================
// Middleware pentru verificarea JWT
// ===============================
const verificaToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Preluăm token-ul JWT

    if (!token) {
        return res.status(403).json({ message: "Acces interzis! Token lipsă." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.utilizator = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalid!" });
    }
};


// Configurare folder de upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `profil_${Date.now()}${ext}`;
      cb(null, name);
    },
  });
  
  const upload = multer({ storage });
  
  // Endpoint pentru upload poză
  app.post("/upload-poza/:id", upload.single("poza"), async (req, res) => {
    const userId = req.params.id;
    const imagePath = `/uploads/${req.file.filename}`;
  
    try {
      await Utilizator.update({ poza_profil: imagePath }, { where: { id: userId } });
      res.json({ message: "Poză încărcată cu succes!", pozaProfil: imagePath });
    } catch (err) {
      console.error("Eroare la salvarea pozei:", err);
      res.status(500).json({ error: "Eroare la salvarea pozei." });
    }
  });

  // Endpoint pentru stergere poză
  app.post("/sterge-poza/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        await Utilizator.update({ poza_profil: null }, { where: { id: userId } });
        res.json({ message: "Poza a fost ștearsă din baza de date." });
    } catch (err) {
        console.error("Eroare la ștergerea pozei:", err);
        res.status(500).json({ error: "Eroare la ștergerea pozei din baza de date." });
    }
});

// pentru adaugarea unei carti de catre admin
app.post("/adauga-carte-cu-upload", upload.single("imagine"), async (req, res) => {
    try {
        const { titlu, autor, an_publicatie, descriere, gen, pret } = req.body;
        const imagine = req.file ? `/uploads/${req.file.filename}` : null;

        if (!titlu || !autor || !pret) {
            return res.status(400).json({ message: "Titlul, autorul și prețul sunt obligatorii!" });
        }

        const carteNoua = await Carte.create({
            titlu,
            autor,
            an_publicatie,
            descriere,
            gen,
            pret,
            imagine
        });

        await ExemplarCarte.create({
            carte_id: carteNoua.id,
            stare: 'bună',
            data_achizitie: new Date(),
            cost_achizitie: pret,
            status_disponibilitate: 'disponibil'
        });

        res.status(201).json({ message: "Carte și exemplar adăugate cu succes!", carte: carteNoua });
    } catch (err) {
        console.error("Eroare la adăugare carte:", err);
        res.status(500).json({ message: "Eroare server." });
    }
});



  
// Expune folderul uploads public
app.use("/uploads", express.static("uploads"));


//vizualizare tabele - http://localhost:3000/tabele
app.get('/tabele', async (req, res) => {
    try {
        const [results] = await sequelize.query("SHOW TABLES;");
        res.json(results);
    } catch (error) {
        console.error("Eroare la obținerea tabelelor:", error);
        res.status(500).json({ error: "Eroare la obținerea tabelelor" });
    }
});


//creare cont - http://localhost:3000/sign-up
app.post('/sign-up', async (req, res) => {
    try {
        const { nume, prenume, email, parola, accessKey } = req.body;

        if (!nume || !prenume || !email || !parola) {
            return res.status(400).json({ message: "Toate câmpurile sunt obligatorii!" });
        }

        const userExists = await Utilizator.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: "Email-ul este deja folosit!" });
        }

        const tipUtilizator = ACCESS_KEYS.includes(accessKey) ? "administrator" : "client";

        const newUser = await Utilizator.create({
            nume,
            prenume,
            email,
            parola,
            tip: tipUtilizator,
            cheie_administrativa: accessKey || null
        });

        res.status(201).json({ message: "Utilizator creat cu succes!", userId: newUser.id });
    } catch (error) {
        console.error("Eroare la crearea utilizatorului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// Vizualizare toate conturile - http://localhost:3000/conturi
app.get('/conturi', async (req, res) => {
    try {
        const utilizatori = await Utilizator.findAll({
            attributes: { exclude: ['parola'] } // Exclude parola din rezultatele returnate
        });

        res.status(200).json(utilizatori);
    } catch (error) {
        console.error("Eroare la obținerea utilizatorilor:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

// Vizualizare toate conturile (inclusiv parolele) pentru debugging - http://localhost:3000/conturi-pt-debugging
app.get('/conturi-pt-debugging', async (req, res) => {
    try {
        const utilizatori = await Utilizator.findAll(); // Nu excludem niciun câmp

        res.status(200).json(utilizatori);
    } catch (error) {
        console.error("Eroare la obținerea utilizatorilor (debug):", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// http://localhost:3000/adauga-utilizatori
app.post('/adauga-utilizatori', async (req, res) => {
    try {
      const utilizatori = req.body;
  
      if (!Array.isArray(utilizatori) || utilizatori.length === 0) {
        return res.status(400).json({ message: "Trebuie trimis un vector de utilizatori!" });
      }
  
      const utilizatoriCreati = await Utilizator.bulkCreate(utilizatori, { ignoreDuplicates: true });
  
      res.status(201).json({ message: "Utilizatori adăugați cu succes!", utilizatori: utilizatoriCreati });
    } catch (error) {
      console.error("Eroare la adăugarea utilizatorilor:", error);
      res.status(500).json({ message: "Eroare server!" });
    }
  });



//stergerea unui cont - http://localhost:3000/sterge-cont/:id
app.delete('/sterge-cont/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'ID-ul este necesar!' });
    }

    try {
        const result = await Utilizator.destroy({ where: { id } });

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Contul nu a fost găsit!' });
        }

        res.status(200).json({ message: 'Cont șters cu succes!' });
    } catch (error) {
        console.error('Eroare la ștergerea contului:', error);
        res.status(500).json({ message: 'Eroare de server!' });
    }
});


// Update datele unui utilizator - http://localhost:3000/modifica-profil/:id
app.put("/modifica-profil/:id", async (req, res) => {
    const { id } = req.params;
    const { nume, prenume, email } = req.body;

    try {
        // Verificăm dacă utilizatorul există
        const utilizator = await Utilizator.findByPk(id);
        if (!utilizator) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
        }

        // Actualizăm datele doar dacă sunt furnizate
        if (nume) utilizator.nume = nume;
        if (prenume) utilizator.prenume = prenume;
        if (email) utilizator.email = email;

        await utilizator.save();

        res.status(200).json({ message: "Profil actualizat cu succes!" });
    } catch (err) {
        console.error("Eroare la actualizarea profilului:", err);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// Update parola unui utilizator - http://localhost:3000/schimba-parola/:id
app.put("/schimba-parola/:id", async (req, res) => {
    const { id } = req.params;
    const { parolaVeche, parolaNoua } = req.body;

    try {
        const utilizator = await Utilizator.findByPk(id);

        if (!utilizator) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
        }

        // Comparăm parola veche
        if (utilizator.parola !== parolaVeche) {
            return res.status(401).json({ message: "Parola veche este greșită!" });
        }

        // Setăm noua parolă
        utilizator.parola = parolaNoua;
        await utilizator.save();

        return res.status(200).json({ message: "Parola a fost schimbată cu succes!" });
    } catch (error) {
        console.error("Eroare la schimbarea parolei:", error);
        return res.status(500).json({ message: "Eroare internă la server!" });
    }
});

const coduriReset = new Map();

app.post("/trimite-cod-resetare", async (req, res) => {
  const { email } = req.body;
  try {
    const utilizator = await Utilizator.findOne({ where: { email } });
    if (!utilizator) {
      return res.status(404).json({ message: "Email-ul nu este înregistrat!" });
    }

    const cod = Math.floor(10000 + Math.random() * 90000).toString();
    coduriReset.set(email, cod);

    await transporter.sendMail({
      from: "bibliotecaonlinesystem@gmail.com",
      to: email,
      subject: "Cod resetare parolă",
      text: `Codul tău de resetare este: ${cod}`,
    });

    res.status(200).json({ message: "Cod trimis cu succes!" });
  } catch (err) {
    console.error("Eroare resetare:", err);
    res.status(500).json({ message: "Eroare server!" });
  }
});

app.post("/verifica-cod-resetare", (req, res) => {
  const { email, cod } = req.body;
  const codCorect = coduriReset.get(email);

  if (codCorect && codCorect === cod) {
    return res.status(200).json({ message: "Cod valid!" });
  } else {
    return res.status(400).json({ message: "Cod invalid!" });
  }
});

app.put("/resetare-parola", async (req, res) => {
  const { email, parolaNoua } = req.body;
  try {
    const utilizator = await Utilizator.findOne({ where: { email } });
    if (!utilizator) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
    }

    utilizator.parola = parolaNoua;
    await utilizator.save();
    coduriReset.delete(email);

    res.status(200).json({ message: "Parola schimbată cu succes!" });
  } catch (err) {
    res.status(500).json({ message: "Eroare la server!" });
  }
});



// Endpoint pentru login
app.post('/login', async (req, res) => {
    const { email, parola } = req.body;

    if (!email || !parola) {
        return res.status(400).json({ message: "Email și parolă sunt necesare!" });
    }

    try {
        const utilizator = await Utilizator.findOne({ where: { email } });

        if (!utilizator || utilizator.parola !== parola) {
            return res.status(400).json({ message: "Email sau parolă incorectă!" });
        }

        // ✅ Creăm un token JWT care conține ID-ul utilizatorului și tipul
        const token = jwt.sign({ id: utilizator.id, tip: utilizator.tip }, SECRET_KEY, { expiresIn: '2h' });

        res.status(200).json({
            message: "Autentificare reușită!",
            token,
            id: utilizator.id, // ✅ Trimitem și ID-ul utilizatorului
            tip: utilizator.tip,
            nume: utilizator.nume, 
            prenume: utilizator.prenume
        });
    } catch (error) {
        res.status(500).json({ message: "Eroare la server!" });
    }
});



//adaugare carte in tabela Carte - http://localhost:3000/adauga-carte
app.post('/adauga-carte', async (req, res) => {
    try {
        const { titlu, autor, an_publicatie, descriere, gen, pret, imagine } = req.body;

        if (!titlu || !autor || !pret) {
            return res.status(400).json({ message: "Titlul, autorul și prețul sunt obligatorii!" });
        }

        // ✅ 1. Creăm cartea în baza de date
        const carteNoua = await Carte.create({
            titlu,
            autor,
            an_publicatie,
            descriere,
            gen,
            pret,
            imagine
        });

        // ✅ 2. Creăm automat un exemplar pentru această carte
        const exemplarNou = await ExemplarCarte.create({
            carte_id: carteNoua.id,
            stare: 'bună',  // Implicit, exemplarul este în stare bună
            data_achizitie: new Date(),
            cost_achizitie: pret,  // Costul de achiziție este același cu prețul cărții
            status_disponibilitate: 'disponibil'
        });

        res.status(201).json({
            message: "Carte și exemplar adăugate cu succes!",
            carte: carteNoua,
            exemplar: exemplarNou
        });
    } catch (error) {
        console.error("Eroare la adăugarea cărții și exemplarului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

// Endpoint pentru adăugarea unui vector de cărți - http://localhost:3000/adauga-carti
app.post('/adauga-carti', async (req, res) => {
    try {
        const carti = req.body;

        if (!Array.isArray(carti) || carti.length === 0) {
            return res.status(400).json({ message: "Trebuie să furnizați un vector de cărți!" });
        }

        // ✅ 1. Inserăm cărțile în tabela Carte
        const cartiAdaugate = await Carte.bulkCreate(carti, { returning: true });

        // ✅ 2. Creăm câte un exemplar pentru fiecare carte adăugată
        const exemplare = cartiAdaugate.map(carte => ({
            carte_id: carte.id,  // Asociem exemplarul cu cartea nou adăugată
            stare: 'bună',  // Implicit, toate exemplarele sunt în stare bună
            data_achizitie: new Date(),
            cost_achizitie: carte.pret,  // Costul de achiziție este prețul cărții
            status_disponibilitate: 'disponibil'
        }));

        // ✅ 3. Inserăm exemplarele în `ExemplarCarte`
        await ExemplarCarte.bulkCreate(exemplare);

        res.status(201).json({ message: "Cărți și exemplare adăugate cu succes!", carti: cartiAdaugate });
    } catch (error) {
        console.error("Eroare la adăugarea cărților și exemplarelor:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});



// Vizualizare toate cărțile - http://localhost:3000/carti
app.get('/carti', async (req, res) => {
    try {
        const carti = await Carte.findAll({
            attributes: ['id', 'titlu', 'autor', 'an_publicatie', 'descriere', 'gen', 'pret', 'imagine'],
            include: [{
                model: ExemplarCarte,
                attributes: ['id', 'stare', 'status_disponibilitate'] // Preluăm starea și disponibilitatea
            }]
        });

        // ✅ Procesăm cărțile și calculăm stocul corect
        const cartiCuStoc = carti.map(carte => {
            const exemplare = carte.ExemplarCartes; // Sequelize returnează acest array automat

            // 🔹 Stocul este numărul total de exemplare ale cărții
            const stoc = exemplare.length;

            // 🔹 Disponibilitatea = există cel puțin un exemplar care este „disponibil”
            const disponibil = exemplare.some(ex => ex.status_disponibilitate === 'disponibil');

            return {
                id: carte.id,
                titlu: carte.titlu,
                autor: carte.autor,
                an_publicatie: carte.an_publicatie,
                descriere: carte.descriere,
                gen: carte.gen,
                pret: carte.pret,
                imagine: carte.imagine,
                stoc, // 🔹 Stoc calculat corect
                disponibil // 🔹 True/False bazat pe status_disponibilitate
            };
        });

        res.status(200).json(cartiCuStoc);
    } catch (error) {
        console.error("Eroare la obținerea cărților:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// Endpoint pentru ștergerea unei cărți după ID - http://localhost:3000/sterge-carte/:id
app.delete('/sterge-carte/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verificăm dacă există cartea în baza de date
        const carte = await Carte.findByPk(id, {
            include: [{ model: ExemplarCarte }]
        });

        if (!carte) {
            return res.status(404).json({ message: "Cartea nu a fost găsită!" });
        }

        // Verificăm dacă există exemplare împrumutate
        const exemplareImprumutate = await ExemplarCarte.findOne({
            where: { carte_id: id, status_disponibilitate: 'împrumutat' }
        });

        if (exemplareImprumutate) {
            return res.status(400).json({ message: "Nu poți șterge această carte deoarece are exemplare împrumutate!" });
        }

        // Ștergem mai întâi exemplarele cărții
        await ExemplarCarte.destroy({ where: { carte_id: id } });

        // Ștergem cartea
        await carte.destroy();

        res.status(200).json({ message: `Cartea cu ID-ul ${id} și toate exemplarele sale au fost șterse cu succes!` });

    } catch (error) {
        console.error("Eroare la ștergerea cărții:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

// Endpoint pentru ștergerea unei cărți după ID - http://localhost:3000/editeaza-carte/:id
app.put('/editeaza-carte/:id', upload.single('imagine'), async (req, res) => {
    try {
        const { titlu, autor, an_publicatie, descriere, gen, pret } = req.body;
        const { id } = req.params;

        const carte = await Carte.findByPk(id);
        if (!carte) {
            return res.status(404).json({ message: "Cartea nu a fost găsită" });
        }

        let imagine = carte.imagine; // imaginea veche
        if (req.file) {
            imagine = `/uploads/${req.file.filename}`;
        }

        await carte.update({
            titlu,
            autor,
            an_publicatie,
            descriere,
            gen,
            pret,
            imagine
        });

        res.json({ message: "Cartea a fost actualizată cu succes", carte });
    } catch (error) {
        console.error("Eroare la editare:", error);
        res.status(500).json({ message: "Eroare la actualizarea cărții" });
    }
});


// Endpoint pentru ștergerea tuturor cartilor - http://localhost:3000/sterge-toate-cartile
app.delete('/sterge-toate-cartile', async (req, res) => {
    try {
        // Șterge toate cărțile din baza de date (vor declanșa cascade automat pentru exemplare & recenzii)
        const numarCartiSterse = await Carte.destroy({ where: {} });

        res.status(200).json({
            message: `Toate cele ${numarCartiSterse} cărți au fost șterse cu succes (inclusiv exemplarele și recenziile asociate).`
        });
    } catch (error) {
        console.error("Eroare la ștergerea cărților:", error);
        res.status(500).json({ message: "Eroare la server." });
    }
});


//adauga recenzie - http://localhost:3000/adauga-recenzie
app.post('/adauga-recenzie', async (req, res) => {
    try {
        const { utilizator_id, carte_id, rating, comentariu } = req.body;

        if (!utilizator_id || !carte_id || !rating) {
            return res.status(400).json({ message: "Utilizatorul, cartea și rating-ul sunt obligatorii!" });
        }

        // Adaugă recenzia în baza de date
        await Recenzie.create({
            utilizator_id,
            carte_id,
            rating,
            comentariu
        });

        // Recalculează rating-ul mediu al cărții
        const recenzii = await Recenzie.findAll({ where: { carte_id } });
        const ratingMediu = recenzii.reduce((sum, recenzie) => sum + recenzie.rating, 0) / recenzii.length;

        await Carte.update({ rating: ratingMediu.toFixed(1) }, { where: { id: carte_id } });

        // 🔁 Recalculează automat recomandările pentru utilizatorul care a lăsat recenzia
        exec(`python3 backend/recomandari.py ${utilizator_id}`, (err, stdout, stderr) => {
            if (err) {
                console.error("❌ Eroare la regenerarea recomandărilor:", err);
                console.error(stderr);
            } else {
                console.log(`✅ Recomandări regenerate pentru utilizatorul ${utilizator_id}`);
                console.log(stdout);
            }
        });

        res.status(201).json({ message: "Recenzie adăugată cu succes, rating actualizat și recomandări regenerate!" });

    } catch (error) {
        console.error("Eroare la adăugarea recenziei:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

// http://localhost:3000/adauga-recenzii
app.post('/adauga-recenzii', async (req, res) => {
    try {
      const recenzii = req.body;
  
      if (!Array.isArray(recenzii) || recenzii.length === 0) {
        return res.status(400).json({ message: "Trebuie trimis un vector de recenzii!" });
      }
  
      await Recenzie.bulkCreate(recenzii);
      res.status(201).json({ message: "Recenzii adăugate cu succes!" });
    } catch (error) {
      console.error("Eroare la adăugarea recenziilor:", error);
      res.status(500).json({ message: "Eroare server!" });
    }
  });


// Endpoint pentru obținerea tuturor recenziilor - http://localhost:3000/recenzii
app.get('/recenzii', async (req, res) => {
    try {
        // Obținem toate recenziile din baza de date
        const recenzii = await Recenzie.findAll({
            include: [
                {
                    model: Utilizator,
                    attributes: ['nume', 'prenume'] // Adăugăm informațiile despre utilizatorul care a lăsat recenzia
                },
                {
                    model: Carte,
                    attributes: ['titlu', 'autor'] // Adăugăm informațiile despre cartea evaluată
                }
            ]
        });

        // Trimitem recenziile în răspuns
        res.status(200).json(recenzii);
    } catch (error) {
        console.error("Eroare la obținerea recenziilor:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//iau toate cărțile cu rating calculat din recenzii - http://localhost:3000/carti-cu-rating
app.get('/carti-cu-rating', async (req, res) => {
    try {
        const carti = await Carte.findAll({
            attributes: [
                'id',
                'titlu',
                'autor',
                'an_publicatie',
                'gen',
                'pret',
                'imagine',
                'limba'
            ],
            include: [
                {
                    model: Recenzie,
                    attributes: ['rating']
                }
            ]
        });

        // Procesăm datele pentru a calcula rating-ul mediu
        const cartiCuRating = carti.map(carte => {
            const recenzii = carte.Recenzies || []; // Verificăm dacă are recenzii
            const ratingMediu = recenzii.length
                ? recenzii.reduce((sum, recenzie) => sum + recenzie.rating, 0) / recenzii.length
                : 0; // Dacă nu are recenzii, setăm ratingul la 0

            return {
                id: carte.id,
                titlu: carte.titlu,
                autor: carte.autor,
                an_publicatie: carte.an_publicatie,
                gen: carte.gen,
                pret: carte.pret,
                imagine: carte.imagine,
                limba: carte.limba,
                rating: ratingMediu.toFixed(1) // Rotunjim la 1 zecimală
            };
        });

        res.status(200).json(cartiCuRating);
    } catch (error) {
        console.error("Eroare la obținerea cărților cu rating:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//iau toate recenziile unei anumite carti - http://localhost:3000/recenzii/:id
app.get('/recenzii/:carte_id', async (req, res) => {
    const { carte_id } = req.params;

    try {
        const recenzii = await Recenzie.findAll({
            where: { carte_id },
            include: {
                model: Utilizator,
                attributes: ['nume', 'prenume'] // Adaugă numele utilizatorului
            }
        });

        res.status(200).json(recenzii);
    } catch (error) {
        console.error("Eroare la obținerea recenziilor:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//sterg o recenzie in fc de id si recalculez ratingul - http://localhost:3000/sterge-recenzie/:id
app.delete('/sterge-recenzie/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const recenzie = await Recenzie.findByPk(id);
        if (!recenzie) {
            return res.status(404).json({ message: "Recenzia nu a fost găsită!" });
        }

        const carte_id = recenzie.carte_id;

        // Șterge recenzia
        await recenzie.destroy();

        // Recalculează rating-ul cărții
        const recenziiRamase = await Recenzie.findAll({ where: { carte_id } });
        const ratingMediu = recenziiRamase.length
            ? recenziiRamase.reduce((sum, r) => sum + r.rating, 0) / recenziiRamase.length
            : 0;

        await Carte.update({ rating: ratingMediu.toFixed(1) }, { where: { id: carte_id } });

        res.status(200).json({ message: "Recenzia a fost ștearsă și rating-ul cărții a fost actualizat!" });
    } catch (error) {
        console.error("Eroare la ștergerea recenziei:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

//ia o carte dupa id - http://localhost:3000/carte/:id
app.get('/carte/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const carte = await Carte.findByPk(id);
        if (!carte) {
            return res.status(404).json({ message: "Cartea nu a fost găsită!" });
        }
        res.status(200).json(carte);
    } catch (error) {
        console.error("Eroare la obținerea detaliilor cărții:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//adauga o carte la favorite - http://localhost:3000/adauga-favorite
app.post('/adauga-favorite', async (req, res) => {
    try {
        const { utilizator_id, carte_id } = req.body;

        if (!utilizator_id || !carte_id) {
            return res.status(400).json({ message: "ID utilizator și ID carte sunt necesare!" });
        }

        const dejaFavorit = await Favorite.findOne({ where: { utilizator_id, carte_id } });

        if (dejaFavorit) {
            return res.status(400).json({ message: "Cartea este deja în favorite!" });
        }

        await Favorite.create({ utilizator_id, carte_id });

        res.status(201).json({ message: "Carte adăugată la favorite!" });
    } catch (error) {
        console.error("Eroare la adăugarea la favorite:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//sterge o carte de la favorite - http://localhost:3000/sterge-favorite
app.delete('/sterge-favorite', async (req, res) => {
    try {
        const { utilizator_id, carte_id } = req.body;

        const favorita = await Favorite.findOne({ where: { utilizator_id, carte_id } });

        if (!favorita) {
            return res.status(404).json({ message: "Cartea nu se află în lista de favorite!" });
        }

        await favorita.destroy();
        res.status(200).json({ message: "Carte ștearsă din favorite!" });
    } catch (error) {
        console.error("Eroare la ștergerea favorite:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});



//vizualizare carti de la favorite ale unui utilizator - http://localhost:3000/favorite/:utilizator_id
app.get('/favorite/:utilizator_id', async (req, res) => {
    try {
        const { utilizator_id } = req.params;

        // Obține toate cărțile favorite ale utilizatorului
        const favorite = await Favorite.findAll({
            where: { utilizator_id },
            include: [
                {
                    model: Carte,
                    include: [
                        {
                            model: Recenzie, // ✅ Include recenziile pentru a calcula rating-ul
                            attributes: ['rating']
                        }
                    ]
                }
            ]
        });

        // ✅ Calculare rating mediu pentru fiecare carte favorită
        const favoriteCuRating = favorite.map(fav => {
            const carte = fav.Carte;
            const recenzii = carte.Recenzies; // Obținem lista de recenzii

            // ✅ Dacă sunt recenzii, calculăm media rating-ului
            const ratingMediu = recenzii.length
                ? recenzii.reduce((sum, recenzie) => sum + recenzie.rating, 0) / recenzii.length
                : 0;

            return {
                id: carte.id,
                titlu: carte.titlu,
                autor: carte.autor,
                an_publicatie: carte.an_publicatie,
                gen: carte.gen,
                pret: carte.pret,
                stoc: carte.stoc,
                imagine: carte.imagine,
                rating: ratingMediu.toFixed(1) // Rotunjire la o zecimală
            };
        });

        res.status(200).json(favoriteCuRating);
    } catch (error) {
        console.error("Eroare la obținerea cărților favorite:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

//adauga un exemplar de carte - http://localhost:3000/adauga-exemplar
app.post('/adauga-exemplar', async (req, res) => {
    try {
        const { carte_id, stare, cost_achizitie } = req.body;

        // ✅ Verificăm dacă toate câmpurile necesare sunt furnizate
        if (!carte_id || !stare || !cost_achizitie) {
            return res.status(400).json({ message: "ID carte, starea și costul de achiziție sunt necesare!" });
        }

        // ✅ Creăm un nou exemplar
        const exemplar = await ExemplarCarte.create({
            carte_id,
            stare,
            cost_achizitie,
            data_achizitie: new Date(),
            status_disponibilitate: 'disponibil' // Setăm implicit ca fiind disponibil
        });

        res.status(201).json({ message: "Exemplar adăugat cu succes!", exemplar });
    } catch (error) {
        console.error("Eroare la adăugarea exemplarului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// Endpoint pentru obținerea tuturor exemplarelor de la toate cărțile - http://localhost:3000/exemplare
app.get('/exemplare', async (req, res) => {
    try {
        const exemplare = await ExemplarCarte.findAll({
            include: [
                {
                    model: Carte,
                    attributes: ['id', 'titlu', 'autor']  // Include titlul și autorul cărții
                }
            ]
        });

        if (!exemplare || exemplare.length === 0) {
            return res.status(404).json({ message: "Nu există exemplare disponibile!" });
        }

        res.status(200).json(exemplare);
    } catch (error) {
        console.error("Eroare la obținerea exemplarelor:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//vizualizarea tuturor exemplarelor unei cărți, inclusiv starea lor - http://localhost:3000/exemplare/:carte_id
app.get('/exemplare/:carte_id', async (req, res) => {
    try {
        const { carte_id } = req.params;

        // ✅ Preluăm toate exemplarele pentru cartea specificată
        const exemplare = await ExemplarCarte.findAll({
            where: { carte_id },
            attributes: ['id', 'stare', 'data_achizitie', 'cost_achizitie', 'status_disponibilitate']
        });

        res.status(200).json(exemplare);
    } catch (error) {
        console.error("Eroare la obținerea exemplarelor:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//pentru a actualiza starea unui exemplar (de exemplu, dacă a fost deteriorat) - http://localhost:3000/modifica-exemplar/:id
app.put('/modifica-exemplar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stare, cost_achizitie, status_disponibilitate } = req.body;

        // Verificăm dacă cel puțin un câmp este furnizat pentru actualizare
        if (!stare && !cost_achizitie && !status_disponibilitate) {
            return res.status(400).json({ message: "Trebuie furnizat cel puțin un atribut pentru actualizare!" });
        }

        // Căutăm exemplarul
        const exemplar = await ExemplarCarte.findByPk(id);
        if (!exemplar) {
            return res.status(404).json({ message: "Exemplarul nu a fost găsit!" });
        }

        // ✅ Modificăm doar câmpurile transmise în request
        if (stare) exemplar.stare = stare;
        if (cost_achizitie !== undefined) exemplar.cost_achizitie = cost_achizitie;
        if (status_disponibilitate) exemplar.status_disponibilitate = status_disponibilitate;

        await exemplar.save();

        res.status(200).json({ message: "Exemplar modificat cu succes!", exemplar });
    } catch (error) {
        console.error("Eroare la modificarea exemplarului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//pentru a elimina un exemplar din baza de date (de exemplu, dacă a fost pierdut) - http://localhost:3000/sterge-exemplar/:id
app.delete('/sterge-exemplar/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Căutăm exemplarul în baza de date
        const exemplar = await ExemplarCarte.findByPk(id);
        if (!exemplar) {
            return res.status(404).json({ message: "Exemplarul nu a fost găsit!" });
        }

        // ❌ Nu permitem ștergerea unui exemplar împrumutat
        if (exemplar.status_disponibilitate === "împrumutat") {
            return res.status(400).json({ message: "Exemplarul este împrumutat și nu poate fi șters!" });
        }

        // Ștergem exemplarul dacă este disponibil
        await exemplar.destroy();
        res.status(200).json({ message: "Exemplarul a fost șters cu succes!" });

    } catch (error) {
        console.error("Eroare la ștergerea exemplarului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//returnează datele pentru grafice
app.get('/statistici', async (req, res) => {
    try {
        // Apelăm funcțiile care returnează datele statistice
        const cheltuieli = await getCheltuieliLunare();
        const genuri = await getGenuriPopularitate();
        const imprumuturi = await getImprumuturiLunare();
        const utilizatori = await getUtilizatoriNoi();
        const tipCheltuieli = await getTipuriCheltuieli();
        const taxeZilnice = await getTaxeIntarziereZilnice();

        // ✅ Verifică dacă sunt undefined
        if (!cheltuieli || !genuri || !imprumuturi || !utilizatori || !tipCheltuieli || !taxeZilnice) {
            console.error("❌ Una dintre funcțiile statistice a returnat undefined!");
        }

        // ✅ Trimite datele doar dacă sunt valide
        res.json({ cheltuieli, genuri, imprumuturi, utilizatori, tipCheltuieli, taxeZilnice });
    } catch (error) {
        console.error("❌ Eroare API statistici:", error);
        res.status(500).json({ message: "Eroare la server!", error: error.message });
    }
});


//endpoint pentru a obține informațiile utilizatorului
app.get('/profil/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Obținem utilizatorul pe baza ID-ului
        const utilizator = await Utilizator.findByPk(id, {
            include: [{
                model: Recenzie,
                attributes: ['id'],  // Numărul de recenzii
            }]
        });

        if (!utilizator) {
            return res.status(404).json({ message: "Utilizatorul nu a fost găsit!" });
        }

        // Calculăm numărul de recenzii
        const numarRecenzii = utilizator.Recenzies.length;

        // Formatează data creării corect
        const dataCreare = utilizator.createdAt ? utilizator.createdAt.toISOString() : null;
        
        res.status(200).json({
            nume: utilizator.nume,
            prenume: utilizator.prenume,
            email: utilizator.email,
            dataCreare,  // Trimitem data corect formatată
            numarRecenzii,  // Numărul de recenzii
            pozaProfil: utilizator.poza_profil
        });
    } catch (error) {
        console.error("Eroare la obținerea profilului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


//pentru a vedea toate imprumuturile - http://localhost:3000/imprumuturi
app.get('/imprumuturi', async (req, res) => {
    try {
      const imprumuturi = await Imprumut.findAll({
        where: { status: 'activ' },
        include: [
            {
              model: ExemplarCarte,
              include: [
                { model: Carte, attributes: ['titlu'] }
              ]
            },
            {
              model: Utilizator,
              attributes: ['nume', 'prenume', 'email']
            }
          ]
      });
  
      const rezultat = imprumuturi.map((imp) => ({
        id: imp.id,
        numeUtilizator: `${imp.Utilizator.nume} ${imp.Utilizator.prenume}`,
        emailUtilizator: imp.Utilizator.email,
        titluCarte: imp.ExemplarCarte?.Carte?.titlu,
        dataImprumut: imp.data_imprumut,
        dataReturnare: imp.data_returnare
      }));
  
      res.json(rezultat);
    } catch (error) {
      console.error("Eroare la obținerea împrumuturilor:", error);
      res.status(500).json({ mesaj: "Eroare server" });
    }
  });

  // Endpoint pentru a vedea imprumuturile active - http://localhost:3000/imprumuturi-curente-utilizator/:id
app.get('/imprumuturi-curente-utilizator/:id', async (req, res) => {
    const utilizatorId = req.params.id;

    try {
        const imprumuturi = await Imprumut.findAll({
            where: {
                utilizator_id: utilizatorId,
                status: ['activ', 'în așteptare'] 
            },
            include: [
                {
                    model: ExemplarCarte,
                    include: [Carte]
                }
            ]
        });

        const rezultat = imprumuturi.map(imprumut => ({
            id: imprumut.id,
            exemplarId: imprumut.ExemplarCarte?.id,
            titlu: imprumut.ExemplarCarte?.Carte?.titlu,
            autor: imprumut.ExemplarCarte?.Carte?.autor,
            dataImprumut: imprumut.data_imprumut,
            dataReturnare: imprumut.data_returnare,
            status: imprumut.status
        }));

        res.json(rezultat);
    } catch (error) {
        console.error("Eroare la obținerea împrumuturilor active:", error);
        res.status(500).json({ message: "Eroare la obținerea împrumuturilor active" });
    }
});

//Endpoint pentru a vedea imprumuturile vechi - http://localhost:3000/imprumuturi-utilizator/:id
app.get('/imprumuturi-utilizator/:id', async (req, res) => {
    const utilizatorId = req.params.id;

    try {
        const imprumuturi = await Imprumut.findAll({
            where: {
                utilizator_id: utilizatorId,
                status: 'returnat' // doar împrumuturile încheiate
            },
            include: [
                {
                    model: ExemplarCarte,
                    include: [Carte]
                }
            ]
        });

        const rezultat = imprumuturi.map(imprumut => ({
            id: imprumut.id,
            titlu: imprumut.ExemplarCarte?.Carte?.titlu,
            autor: imprumut.ExemplarCarte?.Carte?.autor,
            dataImprumut: imprumut.data_imprumut,
            dataReturnare: imprumut.data_returnare
        }));

        res.json(rezultat);
    } catch (error) {
        console.error("Eroare la obținerea împrumuturilor încheiate:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// Imprumut
// http://localhost:3000/intervale-imprumut/:carte_id
app.get('/intervale-imprumut/:exemplar_id', async (req, res) => {
    const { exemplar_id } = req.params;

    try {
        const imprumuturi = await Imprumut.findAll({
            where: {
                exemplar_id,
                status: ['activ', 'în așteptare']
            },
            attributes: ['id', 'data_imprumut', 'data_returnare']
        });

        res.status(200).json(imprumuturi);
    } catch (error) {
        console.error("Eroare la preluarea intervalelor:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// Intervale indisponibile pentru TOATE exemplarele unei cărți
// ✅ Endpoint modificat pentru intervale + număr exemplare
app.get('/intervale-imprumut-carte/:carte_id', async (req, res) => {
    const { carte_id } = req.params;

    try {
        const exemplare = await ExemplarCarte.findAll({ where: { carte_id } });
        const totalExemplare = exemplare.length; // 🆕 Adaugă numărul total de exemplare

        let toateImprumuturile = [];

        for (const exemplar of exemplare) {
            const imprumuturi = await Imprumut.findAll({
                where: {
                    exemplar_id: exemplar.id,
                    status: ['activ', 'în așteptare']
                },
                attributes: ['data_imprumut', 'data_returnare']
            });
            toateImprumuturile.push(...imprumuturi);
        }

        res.status(200).json({
            imprumuturi: toateImprumuturile, // 🆕 trimitem toate intervalele
            totalExemplare                  // 🆕 trimitem numărul total de exemplare
        });
    } catch (error) {
        console.error("Eroare la obținerea intervalelor pentru carte:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});



app.post('/creeaza-imprumut', async (req, res) => {
    const { utilizator_id, carte_id, dataStart, dataEnd } = req.body;
    console.log(`📬 Cerere nouă de împrumut: carte ${carte_id}, de la ${dataStart} până la ${dataEnd}`);

    try {
        //Verificăm câte împrumuturi are deja utilizatorul
        const numarImprumuturi = await Imprumut.count({
            where: {
                utilizator_id,
                status: ['activ', 'în așteptare']
            }
        });

        if (numarImprumuturi >= 3) {
            return res.status(400).json({ message: "Ati atins limita de imprumuturi simultane!" });
        }

        const exemplare = await ExemplarCarte.findAll({
            where: {
                carte_id,
                status_disponibilitate: 'disponibil'
            }
        });

        for (const exemplar of exemplare) {
            // Pentru fiecare exemplar verificăm dacă există suprapuneri
            const suprapuneri = await Imprumut.findOne({
                where: {
                    exemplar_id: exemplar.id,
                    status: ['activ', 'în așteptare'],
                    [Sequelize.Op.or]: [
                        {
                            data_imprumut: { [Sequelize.Op.between]: [dataStart, dataEnd] }
                        },
                        {
                            data_returnare: { [Sequelize.Op.between]: [dataStart, dataEnd] }
                        },
                        {
                            data_imprumut: { [Sequelize.Op.lte]: dataStart },
                            data_returnare: { [Sequelize.Op.gte]: dataEnd }
                        }
                    ]
                }
            });

            if (!suprapuneri) {
                // 📬 Exemplarul este liber -> îl folosim!

                // Creează cod random de confirmare
                const cod = Math.floor(100000 + Math.random() * 900000);

                // Creăm împrumutul
                await Imprumut.create({
                    utilizator_id,
                    exemplar_id: exemplar.id,
                    data_imprumut: dataStart,
                    data_returnare: dataEnd,
                    status: 'în așteptare',
                    cod_confirmare: cod.toString()
                });

                // Actualizăm statusul exemplarului
                await exemplar.update({ status_disponibilitate: 'in asteptare' });

                // Trimitem email de confirmare
                const user = await Utilizator.findByPk(utilizator_id);
                const carte = await Carte.findByPk(exemplar.carte_id);

                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'bibliotecaonlinesystem@gmail.com',
                        pass: 'uiai mhpi gdlx zyde'
                    }
                });

                const mailOptions = {
                    from: 'bibliotecaonlinesystem@gmail.com',
                    to: user.email,
                    subject: `Rezervare carte: ${carte.titlu}`,
                    text: `Rezervarea ta pentru cartea "${carte.titlu}" a fost înregistrată!
                
                Codul de confirmare: ${cod}
                
                ⏳ Codul devine activ începând cu data de start a împrumutului: ${dataStart}.
                
                Te rugăm să prezinți acest cod din ${dataStart} începând, în termen de 48 de ore.
                
                Mulțumim! 📚`
                };

                await transporter.sendMail(mailOptions);

                return res.status(200).json({ message: "Împrumut creat și email trimis!" });
            }
        }

        // ❗ Dacă terminăm loop-ul și nu am găsit niciun exemplar liber
        return res.status(400).json({ message: "Nu există exemplare disponibile în perioada selectată!" });

    } catch (err) {
        console.error("Eroare la crearea împrumutului:", err);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


app.delete('/anuleaza-imprumut/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const imprumut = await Imprumut.findByPk(id);

        if (!imprumut) {
            return res.status(404).json({ message: "Împrumutul nu a fost găsit!" });
        }

        // doar împrumuturile în așteptare pot fi anulate
        if (imprumut.status !== 'în așteptare') {
            return res.status(400).json({ message: "Doar împrumuturile în așteptare pot fi anulate!" });
        }

        // actualizează statusul exemplarului înapoi la "disponibil"
        await ExemplarCarte.update(
            { status_disponibilitate: 'disponibil' },
            { where: { id: imprumut.exemplar_id } }
        );

        // șterge împrumutul
        await imprumut.destroy();

        res.status(200).json({ message: "Împrumut anulat cu succes!" });
    } catch (error) {
        console.error("Eroare la anularea împrumutului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


app.get("/verifica-cod/:cod", async (req, res) => {
    const cod = req.params.cod;

    try {
        const imprumut = await Imprumut.findOne({
            where: {
                cod_confirmare: cod,
                status: "în așteptare"
            },
            include: {
                model: ExemplarCarte,
                include: Carte
            }
        });

        if (!imprumut) {
            return res.status(404).json({ message: "Cod invalid!" });
        }

        const today = new Date();
        const startDate = new Date(imprumut.data_imprumut);

        if (today < startDate) {
            return res.status(400).json({ message: `Codul nu este încă activ! Va deveni activ pe ${startDate.toISOString().slice(0, 10)}.` });
        }

        res.json({
            id: imprumut.id,
            exemplar_id: imprumut.exemplar_id,
            titlu: imprumut.ExemplarCarte.Carte.titlu
        });
    } catch (err) {
        console.error("Eroare la verificarea codului:", err);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

app.put("/finalizeaza-imprumut/:cod", async (req, res) => {
    const cod = req.params.cod;

    try {
        const imprumut = await Imprumut.findOne({
            where: {
                cod_confirmare: cod,
                status: "în așteptare"
            }
        });

        if (!imprumut) {
            return res.status(404).json({ message: "Împrumutul nu a fost găsit sau a fost deja activat." });
        }

        // Actualizează statusul împrumutului
        await imprumut.update({ status: "activ" });

        // Actualizează statusul exemplarului
        const exemplar = await ExemplarCarte.findByPk(imprumut.exemplar_id);
        if (exemplar) {
            await exemplar.update({ status_disponibilitate: "împrumutat" });
        }

        // după actualizarea statusului împrumutului și a exemplarului:
if (exemplar) {
    await exemplar.update({ status_disponibilitate: "împrumutat" });
}

        res.json({ message: "Împrumut activat cu succes!" });
    } catch (err) {
        console.error("Eroare la activare împrumut:", err);
        res.status(500).json({ message: "Eroare la server!" });
    }
});

app.put('/finalizeaza-returnare/:idImprumut', async (req, res) => {
    const { idImprumut } = req.params;
    const { stareExemplar } = req.body;

    try {
        const imprumut = await Imprumut.findByPk(idImprumut);
        if (!imprumut) {
            return res.status(404).json({ message: "Împrumutul nu a fost găsit!" });
        }

        // Update împrumut
        imprumut.status = 'returnat';
        imprumut.data_returnare = new Date();
        await imprumut.save();

        // Update exemplar
        const exemplar = await ExemplarCarte.findByPk(imprumut.exemplar_id);
        if (exemplar) {
            exemplar.status_disponibilitate = 'disponibil';
            exemplar.stare = stareExemplar;
            await exemplar.save();
        }

        const today = new Date();
        const returnDue = new Date(imprumut.data_returnare);

        // Verifică dacă există o taxă deja (neplătită) pentru acest împrumut
const taxaExistenta = await TaxaIntarziere.findOne({
  where: {
    imprumut_id: imprumut.id,
    platita: false
  }
});

if (taxaExistenta) {
  // 🟢 Marchează ca plătită
  await taxaExistenta.update({
    platita: true,
    data_taxare: new Date()
  });
} else {
  // 🟡 Dacă nu există deja taxă, dar împrumutul este întârziat, adaugă una nouă
  const dataScadenta = new Date(imprumut.data_returnare);
  if (today > dataScadenta) {
    const zileIntarziere = Math.ceil((today - dataScadenta) / (1000 * 60 * 60 * 24));
    const suma = zileIntarziere * 5; // sau ce tarif folosești tu

    await TaxaIntarziere.create({
      imprumut_id: imprumut.id,
      suma,
      data_taxare: new Date(),
      platita: true // pentru că s-a returnat acum
    });
  }
}

        res.status(200).json({ message: "Împrumut și exemplar actualizate cu succes!" });
    } catch (error) {
        console.error("Eroare la finalizarea returnării:", error);
        res.status(500).json({ message: "Eroare server!" });
    }
});

app.get('/taxe-utilizator/:id', async (req, res) => {
    try {
      const taxe = await TaxaIntarziere.findAll({
        include: {
          model: Imprumut,
          where: { utilizator_id: req.params.id },
          include: {
            model: ExemplarCarte,
            include: { model: Carte, attributes: ['titlu'] }
          }
        },
        where: { platita: false }
      });
  
      const rezultat = taxe.map(taxa => ({
        id: taxa.id,
        suma: taxa.suma,
        data: taxa.data_taxare,
        titluCarte: taxa.Imprumut.ExemplarCarte.Carte.titlu
      }));
  
      res.json(rezultat);
    } catch (err) {
      res.status(500).json({ message: 'Eroare la server' });
    }
  });

  app.put('/plateste-taxa/:id', async (req, res) => {
    try {
      const taxa = await TaxaIntarziere.findByPk(req.params.id);
      if (!taxa) return res.status(404).json({ message: "Taxa nu a fost găsită!" });
  
      taxa.platita = true;
      await taxa.save();
  
      res.json({ message: "Taxa a fost marcată ca plătită." });
    } catch (err) {
      res.status(500).json({ message: "Eroare la server!" });
    }
  });


app.put('/modifica-imprumut/:id', async (req, res) => {
    const { id } = req.params;
    const { data_returnare, status } = req.body;  // 🛠️ luăm și status

    try {
        const imprumut = await Imprumut.findByPk(id);
        if (!imprumut) {
            return res.status(404).json({ message: "Împrumutul nu a fost găsit!" });
        }

        // Dacă trimitem status, actualizăm și statusul
        if (status) {
            imprumut.status = status;
        }

        if (data_returnare) {
            imprumut.data_returnare = data_returnare;
        }

        await imprumut.save();

        res.status(200).json({ message: "Împrumut actualizat cu succes!" });
    } catch (error) {
        console.error("Eroare la modificarea împrumutului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


app.get('/imprumuturi-incheiate', async (req, res) => {
    try {
        const imprumuturi = await Imprumut.findAll({
            where: { status: 'returnat' },
            include: [
                { model: Utilizator, attributes: ['nume', 'prenume', 'email'] },
                { model: ExemplarCarte, include: [{ model: Carte, attributes: ['titlu'] }] }
            ]
        });

        const rezultat = imprumuturi.map((imp) => ({
            id: imp.id,
            numeUtilizator: `${imp.Utilizator.nume} ${imp.Utilizator.prenume}`,
            emailUtilizator: imp.Utilizator.email,
            titluCarte: imp.ExemplarCarte?.Carte?.titlu,
            dataImprumut: imp.data_imprumut,
            dataReturnare: imp.data_returnare
        }));

        res.json(rezultat);
    } catch (error) {
        console.error("Eroare la obținerea istoricului:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});


// Endpoint pentru a obține istoricul de împrumuturi pentru un utilizator specific
app.get("/istoric-utilizator/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const imprumuturi = await Imprumut.findAll({
      where: {
        utilizator_id: id,
        status: 'returnat'
      },
      include: [
        {
          model: Utilizator,
          attributes: ["nume", "prenume", "email"]
        },
        {
          model: ExemplarCarte,
          include: [
            {
              model: Carte,
              attributes: ["titlu"]
            }
          ]
        },
        {
          model: TaxaIntarziere,
          attributes: ["suma", "platita"]
        }
      ],
      order: [["data_returnare", "DESC"]]
    });

    const rezultat = imprumuturi.map((imp) => ({
      id: imp.id,
      numeUtilizator: imp.Utilizator.nume,
      prenumeUtilizator: imp.Utilizator.prenume,
      emailUtilizator: imp.Utilizator.email,
      titluCarte: imp.ExemplarCarte.Carte.titlu,
      dataImprumut: imp.data_imprumut,
      dataReturnare: imp.data_returnare,
      taxa: imp.TaxaIntarziere?.suma
        ? `${imp.TaxaIntarziere.suma.toFixed(2)} RON`
        : "Fără taxă"
    }));

    res.status(200).json(rezultat);
  } catch (error) {
    console.error("Eroare la preluarea istoricului utilizatorului:", error);
    res.status(500).json({ message: "Eroare la server!" });
  }
});


// Functie pentru expirarea împrumuturilor în așteptare după 48 de ore/dupa termenul limita
const verificaImprumuturiExpirate = async () => {
    const acum = new Date();
    const acumMinus48h = new Date(acum.getTime() - 48 * 60 * 60 * 1000);

    try {
        const imprumuturiInAsteptare = await Imprumut.findAll({
            where: {
                status: 'în așteptare',
                [Sequelize.Op.or]: [
                    { data_imprumut: { [Sequelize.Op.lt]: acumMinus48h } },
                    { data_returnare: { [Sequelize.Op.lt]: acum } }
                ]
            }
        });

        for (const imprumut of imprumuturiInAsteptare) {
            console.log(`⚡ Expiră împrumut ID: ${imprumut.id}`);
            await imprumut.update({ status: 'expirat' });

            await ExemplarCarte.update(
                { status_disponibilitate: 'disponibil' },
                { where: { id: imprumut.exemplar_id } }
            );
        }

        console.log(`✅ Verificare finalizată. ${imprumuturiInAsteptare.length} împrumuturi expirate.`);
    } catch (error) {
        console.error("❌ Eroare la expirarea împrumuturilor:", error);
    }
};

const verificaTaxeNeplatite = async () => {
  const azi = new Date();

  try {
    const imprumuturiIntarziate = await Imprumut.findAll({
      where: {
        status: "activ",
        data_returnare: {
          [Sequelize.Op.lt]: azi,
        },
      },
      include: [{ model: TaxaIntarziere }],
    });

    for (const imprumut of imprumuturiIntarziate) {
      const dataReturnare = new Date(imprumut.data_returnare);
      const zile = Math.ceil((azi - dataReturnare) / (1000 * 60 * 60 * 24));
      const sumaNoua = zile * 5;

      if (imprumut.TaxaIntarziere) {
        // 🔁 Dacă taxa există și nu e plătită — o actualizăm
        if (!imprumut.TaxaIntarziere.platita) {
          await imprumut.TaxaIntarziere.update({
            suma: sumaNoua,
            data_taxare: azi,
          });

          console.log(`🔁 Taxă actualizată pentru împrumut ${imprumut.id}: ${sumaNoua} lei`);
        }
      } else {
        // ➕ Nu există taxă — o creăm
        await TaxaIntarziere.create({
          imprumut_id: imprumut.id,
          suma: sumaNoua,
          platita: false,
          data_taxare: azi,
        });

        console.log(`💸 Taxă nouă pentru împrumut ${imprumut.id}: ${sumaNoua} lei`);
      }
    }
  } catch (err) {
    console.error("❌ Eroare la gestionarea taxelor de întârziere:", err);
  }
};

// Verificare automată la fiecare oră atata timp cat serverul e pornit
cron.schedule('0 * * * *', verificaImprumuturiExpirate);
// cron.schedule('0 * * * *', verificaTaxeNeplatite);
verificaTaxeNeplatite();




// http://localhost:3000/recomandari-salvate/:utilizator_id
app.get('/recomandari-salvate/:utilizator_id', async (req, res) => {
    const { utilizator_id } = req.params;

    try {
        const recomandari = await Recomandare.findAll({
            where: { utilizator_id },
            include: {
                model: Carte,
                attributes: ['titlu', 'autor', 'gen', 'imagine', 'descriere', 'pret']
            },
            order: [['scor', 'DESC']]
        });

        const rezultat = recomandari.map(r => ({
            id: r.carte_id,
            titlu: r.Carte.titlu,
            autor: r.Carte.autor,
            gen: r.Carte.gen,
            imagine: r.Carte.imagine,
            descriere: r.Carte.descriere,
            pret: r.Carte.pret,
            scor: r.scor.toFixed(2)
        }));

        res.json(rezultat);
    } catch (err) {
        console.error("Eroare la obținerea recomandărilor salvate:", err);
        res.status(500).json({ message: "Eroare server!" });
    }
});


// Recomandări din baza de date (salvate de scriptul Python)
app.get('/recomandari-db/:utilizator_id', async (req, res) => {
    const { utilizator_id } = req.params;
  
    try {
      const recomandari = await Recomandare.findAll({
        where: { utilizator_id },
        include: [
          {
            model: Carte,
            attributes: ['id', 'titlu', 'autor', 'gen', 'imagine'],
            include: [
              {
                model: Recenzie,
                attributes: ['rating']
              }
            ]
          }
        ],
        order: [['scor', 'DESC']]
      });
  
      // Procesăm datele: calculăm ratingul mediu pentru fiecare carte
      const rezultat = recomandari.map(r => {
        const recenzii = r.Carte.Recenzies || [];
        const ratingMediu = recenzii.length
          ? recenzii.reduce((sum, recenzie) => sum + recenzie.rating, 0) / recenzii.length
          : 0;
  
        return {
          id: r.Carte.id,
          titlu: r.Carte.titlu,
          autor: r.Carte.autor,
          gen: r.Carte.gen,
          imagine: r.Carte.imagine,
          scor: r.scor,
          rating: parseFloat(ratingMediu.toFixed(1)) // rotunjit la o zecimală
        };
      });
  
      res.json(rezultat);
    } catch (error) {
      console.error("Eroare la obținerea recomandărilor din DB:", error);
      res.status(500).json({ message: "Eroare la server!" });
    }
  });

app.post('/adauga-cheltuiala', async (req, res) => {
    try {
      const { exemplar_id, tip_cheltuiala, cost_total, detalii_suplimentare } = req.body;
  
      if (!exemplar_id || !tip_cheltuiala || !cost_total) {
        return res.status(400).json({ message: "Câmpuri obligatorii lipsă!" });
      }
  
      await Cheltuiala.create({
        exemplar_id,
        tip_cheltuiala,
        cost_total,
        detalii_suplimentare
      });
  
      res.status(201).json({ message: "Cheltuiala a fost înregistrată!" });
    } catch (error) {
      console.error("Eroare la înregistrarea cheltuielii:", error);
      res.status(500).json({ message: "Eroare la server!" });
    }
  });

  app.get('/rentabilitate-exemplar/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const numarImprumuturi = await Imprumut.count({ where: { exemplar_id: id } });
        const exemplar = await ExemplarCarte.findByPk(id);

        const cheltuieli = await Cheltuiala.findAll({ where: { exemplar_id: id } });
        const totalCheltuieli = cheltuieli.reduce((sum, c) => sum + c.cost_total, 0);

        const costTotal = exemplar.cost_achizitie + totalCheltuieli;
        const rentabilitate = costTotal > 0 ? (numarImprumuturi / costTotal) : 0;

        // Clasificare
        let eticheta = "scăzută";
        if (rentabilitate >= 1.5) eticheta = "excelentă";
        else if (rentabilitate >= 1) eticheta = "bună";
        else if (rentabilitate >= 0.5) eticheta = "modestă";

        res.json({
            numarImprumuturi,
            rentabilitate: rentabilitate.toFixed(2),
            eticheta
        });
    } catch (err) {
        res.status(500).json({ message: "Eroare server", error: err.message });
    }
});


app.get("/carti-similare/:carteId", async (req, res) => {
  const carteId = parseInt(req.params.carteId);

  try {
    const carte = await Carte.findByPk(carteId);
    if (!carte) return res.status(404).json({ message: "Carte inexistentă" });

    const [cartiAutorGen, cartiAutor, cartiGen] = await Promise.all([
      // autor + gen
      Carte.findAll({
        where: {
          id: { [Op.ne]: carteId },
          autor: carte.autor,
          gen: carte.gen
        },
        include: [{ model: Recenzie, attributes: ["rating"] }]
      }),
      // autor
      Carte.findAll({
        where: {
          id: { [Op.ne]: carteId },
          autor: carte.autor
        },
        include: [{ model: Recenzie, attributes: ["rating"] }]
      }),
      // gen
      Carte.findAll({
        where: {
          id: { [Op.ne]: carteId },
          gen: carte.gen
        },
        include: [{ model: Recenzie, attributes: ["rating"] }]
      }),
    ]);

    // Concatenează și elimină duplicatele
    const toateCartile = [...cartiAutorGen, ...cartiAutor, ...cartiGen];
    const cartiUnice = [];
    const idsVazute = new Set();

    for (const c of toateCartile) {
      if (!idsVazute.has(c.id)) {
        cartiUnice.push(c);
        idsVazute.add(c.id);
      }
    }

    // Calculează ratingul mediu pentru fiecare carte
    const cartiCuRating = cartiUnice.slice(0, 6).map((carte) => {
      const recenzii = carte.Recenzies || [];
      const ratingMediu = recenzii.length
        ? recenzii.reduce((sum, r) => sum + r.rating, 0) / recenzii.length
        : 0;

      return {
        id: carte.id,
        titlu: carte.titlu,
        autor: carte.autor,
        an_publicatie: carte.an_publicatie,
        gen: carte.gen,
        pret: carte.pret,
        imagine: carte.imagine,
        limba: carte.limba,
        rating: parseFloat(ratingMediu.toFixed(1))
      };
    });

    res.status(200).json(cartiCuRating);
  } catch (error) {
    console.error("Eroare la obținerea cărților similare:", error);
    res.status(500).json({ message: "Eroare internă la server." });
  }
});



app.post("/chatbot-query", async (req, res) => {
  const { userId, question } = req.body;

  try {
    const removeDiacritics = (text) => {
  return text
    .normalize("NFD") // separă literele de semnele diacritice
    .replace(/[\u0300-\u036f]/g, ""); // elimină diacriticele
};
    // const intrebare = question.toLowerCase();
    let intrebare = question.toLowerCase();
intrebare = removeDiacritics(intrebare); // normalizezi

    const isHowToQuestion = (keywords) =>
      keywords.some((k) => intrebare.includes(k));

    const HOW_WORDS = [
      "cum", "unde", "ajung", "gasesc", "acces", "vizualizez", "mod", "pas", "fac", "vreau sa",
    ];

      // 🔒 4.5️⃣ Întrebări despre date personale sensibile
if (
  intrebare.includes("parola") ||
  intrebare.includes("cnp") ||
  intrebare.includes("adres") || // "adresa" sau "adresă"
  intrebare.includes("email") ||
  intrebare.includes("mail") ||
  intrebare.includes("numele meu complet") ||
  intrebare.includes("data nașterii") ||
  intrebare.includes("telefon") ||
  intrebare.includes("număr de telefon")
) {
  return res.json({
    type: "dynamic",
    text:
      "Din motive de confidențialitate, nu am acces la informații personale sau sensibile din contul tău. ",
  });
}


    // 1️⃣ Împrumuturi active
    if (
      intrebare.includes("imprumut") &&
      !isHowToQuestion(HOW_WORDS) &&
      (
        intrebare.includes("activ") ||
        intrebare.includes("momentan") ||
        intrebare.includes("curent") ||
        intrebare.includes("am acum") ||
        intrebare.includes("in curs") ||
        intrebare.includes("mele") ||
        intrebare.includes("meu")
      )
    ) {
      const imprumuturi = await Imprumut.findAll({
        where: { utilizator_id: userId, status: "activ" },
        include: [{ model: ExemplarCarte, include: [Carte] }],
      });

      if (!imprumuturi.length) {
        return res.json({ type: "dynamic", text: "Nu ai împrumuturi active în acest moment." });
      }

      const lista = imprumuturi
        .map((imp) => {
          const titlu = imp.ExemplarCarte?.Carte?.titlu;
          const autor = imp.ExemplarCarte?.Carte?.autor;
          const retur = new Date(imp.data_returnare).toLocaleDateString("ro-RO");
          return `• "${titlu}" de ${autor} (retur: ${retur})`;
        })
        .join("\n");

      return res.json({
        type: "dynamic",
        text: `Ai ${imprumuturi.length} împrumuturi active:\n${lista}`,
      });
    }

    // 2️⃣ Favorite
    if (
      intrebare.includes("favorite") &&
      !isHowToQuestion(HOW_WORDS)
    ) {
      const favorite = await Favorite.findAll({
        where: { utilizator_id: userId },
        include: [{ model: Carte }],
      });

      if (!favorite.length) {
        return res.json({ type: "dynamic", text: "Nu ai nicio carte la favorite momentan." });
      }

      const lista = favorite
        .map((f) => `• "${f.Carte.titlu}" de ${f.Carte.autor}`)
        .join("\n");

      return res.json({
        type: "dynamic",
        text: `Iată lista cărților tale favorite:\n${lista}`,
      });
    }

    // 3️⃣ Taxe restante
    if (
      intrebare.includes("tax") &&
      !isHowToQuestion(HOW_WORDS)
    ) {
      const utilizator = await Utilizator.findByPk(userId);
      const taxe = utilizator?.taxe_restante || 0;

      if (!taxe) {
        return res.json({ type: "dynamic", text: "Nu ai taxe restante în acest moment." });
      }

      return res.json({
        type: "dynamic",
        text: `Ai de plată ${taxe} lei pentru întârzierea returnării.`,
      });
    }

    // 4️⃣ Poate prelungi?
    if (
      intrebare.includes("prelung") &&
      !isHowToQuestion(HOW_WORDS)
    ) {
      const imprumuturi = await Imprumut.findAll({
        where: { utilizator_id: userId, status: "activ" },
      });

      if (!imprumuturi.length) {
        return res.json({
          type: "dynamic",
          text: "Nu ai împrumuturi active care să poată fi prelungite.",
        });
      }

      return res.json({
        type: "dynamic",
        text:
          "Poți prelungi un împrumut activ cu cel mult 7 zile, dacă cartea nu este rezervată de altcineva.",
      });
    }

    // 5️⃣ Profil personal (doar informații simple)
    if (
      (intrebare.includes("profil") || intrebare.includes("cont")) &&
      !isHowToQuestion(HOW_WORDS)
    ) {
      const user = await Utilizator.findByPk(userId);
      return res.json({
        type: "dynamic",
        text: `Profilul tău: ${user.nume} ${user.prenume}, Email: ${user.email}`,
      });
    }

    // 6️. Istoric împrumuturi
if (
  intrebare.includes("istoric") ||
  intrebare.includes("în trecut") ||
  intrebare.includes("am avut") ||
  intrebare.includes("returnat") ||
  intrebare.includes("împrumutate") && intrebare.includes("fost") ||
  (intrebare.includes("împrumut") && intrebare.includes("vechi")) ||
  (intrebare.includes("împrumut") && intrebare.includes("finalizat"))
) {
  const imprumuturi = await Imprumut.findAll({
    where: {
      utilizator_id: userId,
      status: {
        [Op.not]: "activ", // orice alt status decât „activ”
      },
    },
    include: [{ model: ExemplarCarte, include: [Carte] }],
  });

  if (!imprumuturi.length) {
    return res.json({
      type: "dynamic",
      text: "Nu ai niciun împrumut încheiat sau returnat în trecut.",
    });
  }


  const lista = imprumuturi
    .map((imp) => {
      const titlu = imp.ExemplarCarte?.Carte?.titlu;
      const autor = imp.ExemplarCarte?.Carte?.autor;
      const retur = new Date(imp.data_returnare).toLocaleDateString("ro-RO");
      const status = imp.status.charAt(0).toUpperCase() + imp.status.slice(1);
      return `• "${titlu}" de ${autor} (retur: ${retur}, status: ${status})`;
    })
    .join("\n");

  return res.json({
    type: "dynamic",
    text: `Ai ${imprumuturi.length} împrumuturi încheiate:\n${lista}`,
  });
}

    // 7. Dacă nu a fost identificat un caz, trimitem către AI
    return res.json({ type: "no-match" });
  } catch (err) {
   console.error("Eroare la generarea răspunsului AI:", err);

  setChatHistory((prev) => [
    ...prev.filter((msg) => msg.text !== "Se gândește..."),
    {
      role: "model",
      text: "Ne pare rău, momentan chatbot-ul se află în mentenanță.",
      isError: true,
    },
  ]);
  }
});


// Pornire server
const PORT = 3000;
(async () => {
    await verificaImprumuturiExpirate();

    app.listen(PORT, () => {
        console.log(`Serverul rulează pe http://localhost:${PORT}`);
    });
})();