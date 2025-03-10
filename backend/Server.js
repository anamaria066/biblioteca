import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "biblioteca_secret_key";


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
const Carte = sequelize.define('Carte', {
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
    gen: {
        type: DataTypes.STRING
    },
    pret: {
        type: DataTypes.FLOAT
    },
    stoc: {
        type: DataTypes.INTEGER
    },
    disponibil: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    imagine: {
        type: DataTypes.STRING,  // Stocăm URL-ul imaginii
        allowNull: true
    }
}, {
    timestamps: false,
    freezeTableName: true
});


// Definirea tabelei "Utilizator"
const Utilizator = sequelize.define('Utilizator', {
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
    }
}, {
    timestamps: false,
    freezeTableName: true
});


// Definirea tabelei "Recenzie"
const Recenzie = sequelize.define('Recenzie', {
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
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 }
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
const Imprumut = sequelize.define('Imprumut', {
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
    }
}, {
    timestamps: false,
    freezeTableName: true
});


// Definirea tabelei "Cheltuiala"
const Cheltuiala = sequelize.define('Cheltuiala', {
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
        onDelete: 'CASCADE'
    },
    tip_cheltuiala: {
        type: DataTypes.ENUM('Reparatie', 'Inlocuire'),
        allowNull: false
    },
    numar_exemplare: {
        type: DataTypes.INTEGER,
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


//Definirea relațiilor între tabele
Utilizator.hasMany(Recenzie, { foreignKey: 'utilizator_id' });//Un utilizator poate lăsa mai multe recenzii
Carte.hasMany(Recenzie, { foreignKey: 'carte_id' });//O carte poate avea mai multe recenzii
Recenzie.belongsTo(Utilizator, { foreignKey: 'utilizator_id' });//O recenzie aparține unui singur utilizator
Recenzie.belongsTo(Carte, { foreignKey: 'carte_id' });//O recenzie aparține unei singure cărți
Utilizator.hasMany(Imprumut, { foreignKey: 'utilizator_id' });//Un utilizator poate împrumuta mai multe cărți
Carte.hasMany(Imprumut, { foreignKey: 'carte_id' });//O carte poate fi împrumutată de mai mulți utilizatori
Imprumut.belongsTo(Utilizator, { foreignKey: 'utilizator_id' });//Un împrumut aparține unui singur utilizator
Imprumut.belongsTo(Carte, { foreignKey: 'carte_id' });//Un împrumut aparține unei singure cărți
Carte.hasMany(Cheltuiala, { foreignKey: 'carte_id' });//O carte poate avea mai multe cheltuieli asociate (ex: reparații, înlocuire)
Cheltuiala.belongsTo(Carte, { foreignKey: 'carte_id' });//O cheltuială este legată de o singură carte


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





//endpoints
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


const ACCESS_KEYS = ["ADMIN123", "ADMIN456"]; // Lista de chei de acces valide
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

        // Creăm token JWT
        const token = jwt.sign({ id: utilizator.id, tip: utilizator.tip }, SECRET_KEY, { expiresIn: '2h' });

        res.status(200).json({ message: "Autentificare reușită!", token, tip: utilizator.tip });
    } catch (error) {
        res.status(500).json({ message: "Eroare la server!" });
    }
});



//adaugare carte - http://localhost:3000/adauga-carte
// {
//     "titlu": "1984",
//     "autor": "George Orwell",
//     "an_publicatie": 1949,
//     "gen": "Dystopie",
//     "pret": 39.99,
//     "stoc": 10,
//     "disponibil": true,
//     "imagine": "https://example.com/1984.jpg"
// }
app.post('/adauga-carte', async (req, res) => {
    try {
        const { titlu, autor, an_publicatie, gen, pret, stoc, disponibil, imagine } = req.body;

        if (!titlu || !autor) {
            return res.status(400).json({ message: "Titlul și autorul sunt obligatorii!" });
        }

        const carteNoua = await Carte.create({
            titlu,
            autor,
            an_publicatie,
            gen,
            pret,
            stoc,
            disponibil,
            imagine
        });

        res.status(201).json({ message: "Carte adăugată cu succes!", carte: carteNoua });
    } catch (error) {
        console.error("Eroare la adăugarea cărții:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});



// Vizualizare toate cărțile - http://localhost:3000/carti
app.get('/carti', async (req, res) => {
    try {
        const carti = await Carte.findAll();
        res.status(200).json(carti);
    } catch (error) {
        console.error("Eroare la obținerea cărților:", error);
        res.status(500).json({ message: "Eroare la server!" });
    }
});





// Pornire server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serverul rulează pe http://localhost:${PORT}`);
});