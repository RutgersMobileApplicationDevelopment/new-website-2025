import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), '../../apps/api/openapi.yaml');
  
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/yaml');
    res.status(200).send(fileContents);
  } catch (error) {
    res.status(404).json({ error: 'OpenAPI specification not found' });
  }
}
