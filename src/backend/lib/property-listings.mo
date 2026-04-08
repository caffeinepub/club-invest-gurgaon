import Types "../types/property-listings";
import CommonTypes "../types/common";
import List "mo:core/List";

module {
  public func submitProperty(
    submissions : List.List<Types.PropertySubmission>,
    counter     : { var value : Nat },
    submission  : Types.PropertySubmission,
  ) : Text {
    Runtime.trap("not implemented");
  };

  public func getSubmissions(
    submissions : List.List<Types.PropertySubmission>,
  ) : [Types.PropertySubmission] {
    Runtime.trap("not implemented");
  };
};
