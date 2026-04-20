const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});