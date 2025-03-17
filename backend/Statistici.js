import { Sequelize } from 'sequelize';
import { Cheltuiala } from './Server.js';
import { Carte } from './Server.js';
import { Imprumut } from './Server.js';
import { Utilizator } from './Server.js';

export async function getCheltuieliLunare() {
    try {
        const result = await Cheltuiala.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('data')), 'luna'],
                [Sequelize.fn('SUM', Sequelize.col('suma')), 'total']
            ],
            where: {
                data: {
                    [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
                }
            },
            group: ['luna'],
            order: [[Sequelize.literal('luna'), 'ASC']]
        });

        return result.map(row => ({
            luna: row.getDataValue('luna'),
            total: row.getDataValue('total')
        }));
    } catch (error) {
        console.error("❌ Eroare la `getCheltuieliLunare`:", error);
        return [];
    }
}



export async function getGenuriPopularitate() {
    try {
        const result = await Carte.findAll({
            attributes: [
                [Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('gen'))), 'gen'], // Normalizează genul
                [Sequelize.fn('COUNT', Sequelize.col('gen')), 'numar']
            ],
            group: [Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('gen')))] // Grupare pe gen normalizat
        });

        return result.map(row => ({
            gen: row.getDataValue('gen'),  // Genul normalizat
            numar: row.getDataValue('numar')
        }));
    } catch (error) {
        console.error("❌ Eroare la `getGenuriPopularitate`:", error);
        return [];
    }
}





export async function getImprumuturiLunare() {
    try {
        const result = await Imprumut.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('data_imprumut')), 'luna'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'numar']
            ],
            where: {
                data_imprumut: {
                    [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
                }
            },
            group: ['luna'],
            order: [[Sequelize.literal('luna'), 'ASC']]
        });

        return result.map(row => ({
            luna: row.getDataValue('luna'),
            numar: row.getDataValue('numar')
        }));
    } catch (error) {
        console.error("❌ Eroare la `getImprumuturiLunare`:", error);
        return [];
    }
}




export async function getUtilizatoriNoi() {
    try {
        const result = await Utilizator.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('data_inregistrare')), 'luna'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'numar']
            ],
            where: {
                data_inregistrare: {
                    [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
                }
            },
            group: ['luna'],
            order: [[Sequelize.literal('luna'), 'ASC']]
        });

        return result.map(row => ({
            luna: row.getDataValue('luna'),
            numar: row.getDataValue('numar')
        }));
    } catch (error) {
        console.error("❌ Eroare la `getUtilizatoriNoi`:", error);
        return [];
    }
}

export async function getTipuriCheltuieli() {
    try {
        const result = await Cheltuiala.findAll({
            attributes: [
                'tip',
                [Sequelize.fn('COUNT', Sequelize.col('tip')), 'numar']
            ],
            where: {
                data: {
                    [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
                }
            },
            group: ['tip']
        });

        return result.map(row => ({
            tip: row.getDataValue('tip'),
            numar: row.getDataValue('numar')
        }));
    } catch (error) {
        console.error("❌ Eroare la `getTipuriCheltuieli`:", error);
        return [];
    }
}