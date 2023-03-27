import type { NextApiRequest, NextApiResponse } from 'next'
import { databaseInstance, getPriceListJoinPremises } from '../../database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    res.status(200).json(await getPriceListJoinPremises(databaseInstance, req.query));
  } catch (err: any) {
    throw(err)
  }
}
