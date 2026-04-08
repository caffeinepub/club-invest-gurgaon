import Types "types/property-listings";
import PropertyListingsMixin "mixins/property-listings-api";
import Migration "migration";
import List "mo:core/List";

(with migration = Migration.run)
actor {
  let submissions = List.empty<Types.PropertySubmission>();
  let submissionCounter = { var value : Nat = 0 };
  let googleSheetsUrl = { var value : Text = "https://script.google.com/macros/s/AKfycbxcv18L4uTLNvqFFgalKnS90T0DU6XipHil5roRUn9JaHLCyeFBVF2NzS654jAb8nC9/exec" };

  include PropertyListingsMixin(submissions, submissionCounter, googleSheetsUrl);
};
