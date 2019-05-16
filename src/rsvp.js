import _ from "lodash";
import { respond } from "./utils/utils";

import { saveGuest } from "./actions/saveGuest";

const defaultResponse = {
  name: "",
  attending: false,
  mealOption: null,
  email: null,
  phone: null
};

const GuestResponse = props => {
  let res = _.assign({}, defaultResponse, props);
  return _.pickBy(res, _.negate(_.isEmpty));
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
