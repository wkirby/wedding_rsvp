import * as lookup from '../src/lookup';

test('lookup', async () => {
  const event = { body: JSON.stringify({ name: 'Noah' }) };
  const context = 'context';

  const callback = (error, response) => {
    expect(error).toBe(null);
    expect(response.statusCode).toEqual(200);
    expect(typeof response.body).toBe("string");
  };

  let res = await lookup.lookup(event, context, callback);
  console.log(res);
});
