import _ from "lodash";
import FuzzySearch from "fuzzy-search";
import { respond } from "./utils/utils";
import { GUESTS } from "../data/guests";

const defaultGuest = {
  guestName: "",
  partnerName: "",
  plusOne: false
};

const Guest = props => {
  return _.assign({}, defaultGuest, props);
};

export const lookup = async (event, context) => {
  const { name } = JSON.parse(event.body);
  const trimmedName = name.trim();
  console.log(`Starting lookup for ${name}`);

  if (trimmedName.length < 3) {
    console.warn(`Name too short. Returning 400.`);
    return respond({ message: "Please provide a full name for search." }, 400);
  }

  const searcher = new FuzzySearch(GUESTS, ["guestName", "partnerName"], {
    sort: true
  });

  const guest = _.head(searcher.search(trimmedName));

  if (guest) {
    console.log(`Found ${guest}.`);
    return respond(Guest(guest));
  } else {
    console.log("No guest was found.");
    return respond({ message: "No guest found with that name." }, 404);
  }
};
