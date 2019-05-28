import _ from "lodash";
import { respond, validateEmail } from "./utils/utils";

import { saveGuest } from "./actions/saveGuest";
import { sendMessage } from "./utils/sendMessage";

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

const formatEmail = guests => {
  let finalString = "";

  finalString += "RSVPs received for:\n\n";

  _.each(guests, g => {
    finalString += `• ${g.name}: ${g.attending} (${g.mealOption})\n`;
  });

  return finalString;
};

const sendConfirmation = async (guest) => {
  if (guest.email && validateEmail(guest.email)) {
    try {
      await sendMessage(
        [guest.email],
        "Thank you for your RSVP",
        "This is a confirmation that we have received your RSVP for Wyatt & Jessica's wedding. Thanks!"
      );
    } catch (e) {
      console.error(e);
    }
  }
}

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
            await sendConfirmation(guest);
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

    try {
      await sendMessage(
        ["wyatt@apsis.io", "jessica.bourget@gmail.com"],
        `RSVP Received from ${invitedGuest}`,
        formatEmail(savedGuests)
      );
    } catch (e) {
      console.error(e);
    }

    return respond(savedGuests, 201);
  } else {
    return respond({ message: "Invalid request" }, 400);
  }
};
