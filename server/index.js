import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.get('/', (req, res) => {
  return res.json({ status: 'Al Good!' });
});

app.listen(8000, () =>
  console.log(`Server started on PORT:${8000}`)
);