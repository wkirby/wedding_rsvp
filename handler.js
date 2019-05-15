import "@babel/polyfill";

export const hello = (event, context) => {
  console.log("Calling hello!");
  console.log(event, context);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Go Serverless v1.0!`
    })
  };
};
