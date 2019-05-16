import "@babel/polyfill";
import _ from "lodash";
import md5 from "md5";
import dynamodb from "serverless-dynamodb-client";
import FuzzySearch from "fuzzy-search";

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
  let res = _.assign({}, defaultResponse, props);
  return _.pickBy(res, _.negate(_.isEmpty));
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
  const { invitedGuest, guests } = JSON.parse(event.body);
  let savedGuests = [];

  if (!invitedGuest) {
    return respond({ message: "Please provide an invited guest." }, 422);
  }

  if (invitedGuest && guests.length > 0) {
    await Promise.all(
      _.map(guests, async g => {
        const guest = GuestResponse(g);
        guest.invitedGuest = invitedGuest;

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

    return respond(savedGuests, 201);
  } else {
    return respond({ message: "Invalid request" }, 400);
  }
};

export const lookup = async (event, context) => {
  const { name } = JSON.parse(event.body);

  if (name.length < 3) {
    return respond({ message: "Please provide a full name for search." }, 400);
  }

  const searcher = new FuzzySearch(GUESTS, ["guestName", "partnerName"], {
    sort: true
  });

  const guest = _.head(searcher.search(name));

  if (guest) {
    return respond(Guest(guest));
  } else {
    return respond({ message: "No guest found with that name." }, 404);
  }
};
