// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { NestedObject, databaseInstance, searchItems } from '../../database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NestedObject>
) {
  try {
    res.status(200).json(await searchItems(databaseInstance, req.query));
  } catch (err: any) {
    throw(err)
  }
}
