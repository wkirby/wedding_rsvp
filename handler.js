import "@babel/polyfill";
import _ from "lodash";
import md5 from "md5";
import dynamodb from "serverless-dynamodb-client";

const keyFromName = name => name.replace(/ /g, "").toLowerCase();
const idFromName = name => md5(keyFromName(name));

const GUESTS = [
  {
    guestName: "Noah Callaway",
    partnerName: "Ashley Lindsey"
  },
  {
    guestName: "Ilsa Kirby"
  },
  {
    guestName: "Tim Kretchmer",
    plusOne: true
  }
];

const defaultGuest = {
  guestName: "",
  partnerName: "",
  plusOne: false
};

const defaultResponse = {
  name: "",
  attending: false,
  mealOption: null,
  email: null,
  phone: null
};

const db = dynamodb.doc;

const respond = (body, statusCode = 200) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body)
  };
};

const Guest = props => {
  return _.assign({}, defaultGuest, props);
};

const GuestResponse = props => {
  return _.assign({}, defaultResponse, props);
};

const rsvpParams = guest => {
  const id = idFromName(guest.name);

  return {
    TableName: process.env.tableName,
    Item: { id, ...guest }
  };
};

const saveGuest = async guest => {
  try {
    const res = await db.put(rsvpParams(guest)).promise();
    return res;
  } catch (e) {
    console.error(`DB Error: ${e.message}`);
  }
};

export const rsvp = async (event, context) => {
  const { guests } = event.body;
  let savedGuests = [];

  if (guests) {
    await Promise.all(
      _.map(guests, async g => {
        const guest = GuestResponse(g);
        if (guest && guest.name) {
          try {
            await saveGuest(guest);
            console.log("Saved RSVP for Guest", guest);
            savedGuests.push(guest);
          } catch (e) {
            console.error(e);
          }
        } else {
          console.warn("Ignored RSVP for Guest", guest);
        }
      })
    );
  }

  return respond(savedGuests, 201);
};

export const lookup = async (event, context) => {
  const key = keyFromName(event.name);

  const guest = _.find(GUESTS, g => {
    const { guestName, partnerName } = Guest(g);
    return key === keyFromName(guestName) || key === keyFromName(partnerName);
  });

  if (guest) {
    return respond(guest);
  } else {
    return respond({ message: "Not Found" }, 404);
  }
};
