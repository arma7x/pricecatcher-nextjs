// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { databaseInstance, searchItems } from '../../database';

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    res.status(200).json(await searchItems(databaseInstance, req.query, 50));
  } catch (err: any) {
    throw(err)
  }
}
