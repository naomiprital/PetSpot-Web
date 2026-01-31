import { Response } from 'express';

const uploadFile = (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }

  const domain = process.env.DOMAIN_BASE || 'localhost';
  const port = process.env.PORT || '8080';
  const base = `http://${domain}:${port}/`;

  const url = base + req.file.path.replace(/\\/g, '/');

  res.status(200).send({ url });
};

export default {
  uploadFile,
};
