import Types "../types/property-listings";
import Lib "../lib/property-listings";
import List "mo:core/List";

mixin (
  submissions       : List.List<Types.PropertySubmission>,
  submissionCounter : { var value : Nat },
  googleSheetsUrl   : { var value : Text },
) {
  public func submitProperty(submission : Types.PropertySubmission) : async Text {
    await* Lib.submitProperty(submissions, submissionCounter, googleSheetsUrl, submission);
  };

  public query func getSubmissions() : async [Types.PropertySubmission] {
    Lib.getSubmissions(submissions);
  };

  public func setGoogleSheetsUrl(url : Text) : async () {
    Lib.setGoogleSheetsUrl(googleSheetsUrl, url);
  };
};
