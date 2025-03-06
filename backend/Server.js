import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import mysql from 'mysql2/promise';

// Creează instanța Express
const app = express();
app.use(cors());
app.use(express.json());


// Creează conexiunea fără să specifici baza de date
const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ana"
});

// Creează baza de date dacă nu există
await connection.query("CREATE DATABASE IF NOT EXISTS bibliotecadb");

console.log("Baza de date 'bibliotecadb' a fost creată sau există deja.");

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



// Pornire server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serverul rulează pe http://localhost:${PORT}`);
});