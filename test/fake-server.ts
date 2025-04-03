import bodyParser from 'body-parser';
import cors from 'cors';
import express, {
  Request,
  Response,
} from 'express';
import path from 'path';

import { fakeData } from './fake-api/fake-data';

const app = express();
const port = 3000;

const router = express.Router();

const allItems = fakeData;

router.get('/:collection', async (req: Request, res: Response) => {
    const { collection } = req.params;
    res.json(allItems || []);
});

router.get('/:collection/:id', (req: Request, res: Response) => {
    const { collection, id } = req.params;
    const item = fakeData.dishes[parseInt(id, 10)];
    res.json(item || null);
});

router.put('/:collection/:id', (req: Request, res: Response) => {
    const { collection, id } = req.params;
    const item = fakeData.dishes[parseInt(id, 10)];
    res.json(item);
});

router.delete('/:collection/:id', (req: any, res: any) => {
    res.sendStatus(204);
});

router.post('/:collection/updateAll', (req: any, res: any) => {
    res.sendStatus(200);
});

router.post('/:collection/deleteMany', (req: any, res: any) => {
    res.sendStatus(200);
});


app.use(cors());
app.use(bodyParser.json());

app.use("/api/", router);

app.use("/", express.static(path.join(__dirname, '../../test')));

app.listen(port, () => {
    console.log(`Mock API running at http://localhost:${port}`);
});
