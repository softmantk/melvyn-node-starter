import { Router } from 'express';
import { from } from 'rxjs';
import request from 'request-promise';
import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-ioredis';

import { ContactUs } from './document';

const cacheClient = cacheManager.caching({
  store: redisStore,
  ttl: 3,
});
const router = Router();

/**
 * @name contactUs - get a contactUs
 * @param {string} [_id] - get an item by ID
 * @param {string} [text] - search for text in contactUs
 * @return {Object<{ data: ContactUs[], message: string }>}
 *
 * @example GET /crud-operations
 * @example GET /crud-operations?_id=${_id}
 * @example GET /crud-operations?text=${text}
 */
router.get('/', async (req, res) => {
  const { _id, text } = req.query;
  console.log('21::_id:', _id);
  const find = {};

  if (_id) find._id = _id;
  if (text) find.text = { $regex: text, $options: 'i' };

  const data = await ContactUs.find(find).exec();

  res.json({ data, message: 'Data obtained.' });
});

/**
 * @name item - get an item
 * @param {string} id - get an item by ID
 * @return {Object<{ data: ContactUs[], message: string }>}
 *
 * @example GET /crud-operations/${id}
 */
router.get('/item/:id', async (req, res) => {
  const { id } = req.params;
  const data = await cacheClient.wrap(id, () => ContactUs.findById(id).exec());
  return res.json({ data, message: 'Data obtained.' });
});

/**
 * @name count - get a contactUs length
 * @return {Object<{ data: number, message: string }>}
 *
 * @example GET /crud-operations/count
 */
router.get('/count', (req, res) => {
  from(ContactUs.count().exec())
    .subscribe(data => res.json({ data, message: 'Data obtained.' }));
});

/**
 * @name pagination - get a contactUs of paging
 * @param {number} [page=1] - current page number
 * @param {number} [row=5] - rows per page
 * @return {Object<{ data: ContactUs[], message: string }>}
 *
 * @example GET /crud-operations/pagination?page=${page}&row=${row}
 */
router.get('/pagination', async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;

  const data = [];

  const page = Number(req.query.page) || 1;
  const row = Number(req.query.row) || 5;
  const count = await request(`${baseUrl}/count`);
  const total = JSON.parse(count).data;

  for (let i = 0, l = total; i < l / row; i++) {
    if (page === (i + 1)) {
      data.push(ContactUs.find({}).skip(i * row).limit(row));
    }
  }

  res.json({
    data: [...await Promise.all(data)],
    total,
    message: 'Data obtained.',
  });
});

/**
 * @name create - create an item
 * @return {Object<{ message: string }>}
 *
 * @example POST /crud-operations { text: ${text} }
 */
router.post('/', async (req, res) => {
  try {
    await ContactUs.validate(req.body);
    const contactUs = await new ContactUs(req.body);
    const message = await contactUs.save();

    res.json({ message });
  } catch (e) {
    if (e.isJoi) {
      return res.json({
        status: false,
        message: 'Invalid request data',
        data: e.details,
      });
    }
  }
});

/**
 * @name update - update an item
 * @return {Object<{ message: string }>}
 *
 * @example PUT /crud-operations/${id}
 */
router.put('/:id', async (req, res) => {
  const message = await ContactUs
    .findOneAndUpdate({ _id: req.params.id }, req.body)
    .then(() => 'ContactUs updated');

  res.json({ message });
});

/**
 * @name delete - remove an item
 * @return {Object<{ message: string }>}
 *
 * @example DELETE /crud-operations/${id}
 */
router.delete('/:id', async (req, res) => {
  const message = await ContactUs
    .findByIdAndRemove(req.params.id)
    .then(() => 'ContactUs deleted');

  res.json({ message });
});

/**
 * @name delete-multiple - remove selected items
 * @return {Object<{ message: string }>}
 *
 * @example DELETE /crud-operations { selected: [${id}, ${id}, ${id}...] }
 */
router.delete('/', async (req, res) => {
  const { selected } = req.body;

  const message = await ContactUs
    .remove({ _id: { $in: selected } })
    .then(() => 'ContactUs deleted');

  res.json({ message });
});

export default router;
