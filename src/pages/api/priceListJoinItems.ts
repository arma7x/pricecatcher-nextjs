import type { NextApiRequest, NextApiResponse } from 'next'
import { NestedObject, databaseInstance, getPriceListJoinItems } from '../../database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NestedObject>
) {
  try {
    res.status(200).json(await getPriceListJoinItems(databaseInstance, req.query));
  } catch (err: any) {
    throw(err)
  }
}
