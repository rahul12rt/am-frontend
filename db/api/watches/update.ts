import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../utils/dbClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
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
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}