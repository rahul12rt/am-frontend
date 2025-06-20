const express = require('express');
const router = express.Router();
const { pool } = require('../../db');

// GET all watches
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM watches');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watches' });
  }
});

// POST add a watch
router.post('/add', async (req, res) => {
  const {
    external_id, name, description, images, characteristics, colors,
    actual_price, offer_price, offer_percentage, rating, reviews_count,
    category, series, model_group, release_date, theme, warranty_period,
    stock_availability, dimensions, weight, is_featured, tags
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO watches (
        external_id, name, description, images, characteristics, colors,
        actual_price, offer_price, offer_percentage, rating, reviews_count,
        category, series, model_group, release_date, theme, warranty_period,
        stock_availability, dimensions, weight, is_featured, tags
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      )`,
      [
        external_id, name, description, images, characteristics, colors,
        actual_price, offer_price, offer_percentage, rating, reviews_count,
        category, series, model_group, release_date, theme, warranty_period,
        stock_availability, dimensions, weight, is_featured, tags
      ]
    );
    res.status(201).json({ message: 'Watch added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add watch' });
  }
});

// PUT update a watch
router.put('/update', async (req, res) => {
  const {
    external_id, name, description, images, characteristics, colors,
    actual_price, offer_price, offer_percentage, rating, reviews_count,
    category, series, model_group, release_date, theme, warranty_period,
    stock_availability, dimensions, weight, is_featured, tags
  } = req.body;

  try {
    await pool.query(
      `UPDATE watches SET
        name=$2, description=$3, images=$4, characteristics=$5, colors=$6,
        actual_price=$7, offer_price=$8, offer_percentage=$9, rating=$10, reviews_count=$11,
        category=$12, series=$13, model_group=$14, release_date=$15, theme=$16, warranty_period=$17,
        stock_availability=$18, dimensions=$19, weight=$20, is_featured=$21, tags=$22
      WHERE external_id=$1`,
      [
        external_id, name, description, images, characteristics, colors,
        actual_price, offer_price, offer_percentage, rating, reviews_count,
        category, series, model_group, release_date, theme, warranty_period,
        stock_availability, dimensions, weight, is_featured, tags
      ]
    );
    res.status(200).json({ message: 'Watch updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update watch' });
  }
});

// DELETE a watch
router.delete('/delete', async (req, res) => {
  const { external_id } = req.body;
  try {
    await pool.query('DELETE FROM watches WHERE external_id=$1', [external_id]);
    res.status(200).json({ message: 'Watch deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete watch' });
  }
});

module.exports = router;