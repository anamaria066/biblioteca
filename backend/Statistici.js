import { Sequelize } from 'sequelize';
import { Cheltuiala } from './Server.js';
import { Carte } from './Server.js';
import { Imprumut } from './Server.js';
import { Utilizator } from './Server.js';
import { TaxaIntarziere } from './Server.js';

export async function getCheltuieliLunare() {
    try {
        const result = await Cheltuiala.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('data_cheltuiala')), 'luna'],// extrage luna din data
                [Sequelize.fn('SUM', Sequelize.col('cost_total')), 'total']// adună toate cheltuielile
            ],
            where: {
                data_cheltuiala: {
                    [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")//doar ultimele 12 luni
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
        console.error(" Eroare la `getCheltuieliLunare`:", error);
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
        console.error(" Eroare la `getGenuriPopularitate`:", error);
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
        console.error(" Eroare la `getImprumuturiLunare`:", error);
        return [];
    }
}




export async function getUtilizatoriNoi() {
    try {
        const result = await Utilizator.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'luna'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'numar']
            ],
            where: {
                createdAt: {
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
        console.error(" Eroare la `getUtilizatoriNoi`:", error);
        return [];
    }
}

export async function getTipuriCheltuieli() {
    try {
        const result = await Cheltuiala.findAll({
            attributes: [
                ['tip_cheltuiala', 'tip'],
                [Sequelize.fn('COUNT', Sequelize.col('tip_cheltuiala')), 'numar']
            ],
            where: {
                data_cheltuiala: {
                    [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 12 MONTH)")
                }
            },
            group: ['tip_cheltuiala']
        });

        return result.map(row => ({
            tip: row.getDataValue('tip'),
            numar: row.getDataValue('numar')
        }));
    } catch (error) {
        console.error(" Eroare la `getTipuriCheltuieli`:", error);
        return [];
    }
}



export async function getTaxeIntarziereZilnice() {
  try {
    const result = await TaxaIntarziere.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('data_taxare')), 'zi'],
        [Sequelize.fn('SUM', Sequelize.col('suma')), 'total']
      ],
      where: {
        data_taxare: {
          [Sequelize.Op.gte]: Sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 30 DAY)")
        },
        platita: true
      },
      group: ['zi'],
      order: [[Sequelize.literal('zi'), 'ASC']]
    });

    return result.map(row => ({
      zi: row.getDataValue('zi'),
      total: row.getDataValue('total')
    }));
  } catch (error) {
    console.error(" Eroare la `getTaxeIntarziereZilnice`:", error);
    return [];
  }
}