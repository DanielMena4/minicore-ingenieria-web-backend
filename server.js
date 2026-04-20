const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/comisiones', async (req, res) => {
    const { inicio, fin } = req.query;

    try {
        const [rows] = await pool.query(`
            SELECT
                ven.nombre,
                v.monto,
                v.fecha,
                r.porcentaje,
                (v.monto * r.porcentaje / 100) AS comision
            FROM ventas v
            JOIN vendedor ven ON ven.id = v.vendedor_id
            JOIN regla r
                ON v.monto BETWEEN r.monto_min AND r.monto_max
            WHERE v.fecha BETWEEN ? AND ?
        `, [inicio, fin]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('Servidor corriendo en puerto', PORT);
});