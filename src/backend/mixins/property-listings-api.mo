import Types "../types/property-listings";
import Lib "../lib/property-listings";
import List "mo:core/List";

mixin (
  submissions       : List.List<Types.PropertySubmission>,
  submissionCounter : { var value : Nat },
  googleSheetsUrl   : { var value : Text },
) {
  // Required transform function for ICP HTTP outcalls.
  // Strips response headers so all subnet nodes agree on the same response body,
  // satisfying the consensus requirement for http_request calls.
  public query func transform(raw : { response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) : async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob } {
    {
      status = raw.response.status;
      body = raw.response.body;
      headers = [];
    };
  };

  public func submitProperty(submission : Types.PropertySubmission) : async Text {
    await* Lib.submitProperty(submissions, submissionCounter, googleSheetsUrl, submission, transform);
  };

  public query func getSubmissions() : async [Types.PropertySubmission] {
    Lib.getSubmissions(submissions);
  };

  public func setGoogleSheetsUrl(url : Text) : async () {
    Lib.setGoogleSheetsUrl(googleSheetsUrl, url);
  };
};
