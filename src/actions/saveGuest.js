import dynamodb from "serverless-dynamodb-client";
import { idFromName } from "../utils/utils";

const db = dynamodb.doc;

const rsvpParams = guest => {
  const id = idFromName(guest.name);

  return {
    TableName: process.env.tableName,
    Item: { id, ...guest }
  };
};

export const saveGuest = async guest => {
  try {
    const res = await db.put(rsvpParams(guest)).promise();
    return res;
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
  }
};
