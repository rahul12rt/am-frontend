import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../utils/dbClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { external_id } = req.body;
    try {
      await pool.query('DELETE FROM watches WHERE external_id=$1', [external_id]);
      res.status(200).json({ message: 'Watch deleted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete watch' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}