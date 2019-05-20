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