import express from 'express';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  return res.json({ status: 'Al Good!' });
});

const PORT = process.env.PORT || 8000

app.listen(PORT, () =>
  console.log(`Server started on PORT:${PORT} \n \nhttp://localhost:${PORT}`)
);