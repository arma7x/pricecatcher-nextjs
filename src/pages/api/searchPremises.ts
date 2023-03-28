import type { NextApiRequest, NextApiResponse } from 'next'
import { NestedObject, databaseInstance, searchPremises } from '../../database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NestedObject>
) {
  try {
    res.status(200).json(await searchPremises(databaseInstance, req.query));
  } catch (err: any) {
    throw(err)
  }
}
