import Types "types/property-listings";
import Array "mo:core/Array";
import List "mo:core/List";

module {
  // Old PropertySubmission — as in the previous deployed version (no photoUrls field)
  type OldPropertySubmission = {
    clientName         : Text;
    contactNumber      : Text;
    email              : Text;
    representation     : Types.Representation;
    propertyCategory   : Types.PropertyCategory;
    projectName        : Text;
    city               : Text;
    location           : Text;
    fullAddress        : Text;
    area               : Text;
    configuration      : Text;
    floorDetails       : Text;
    furnishing         : Types.Furnishing;
    propertyAge        : Text;
    askingPrice        : Text;
    priceJustification : Text;
    negotiable         : Bool;
    targetBuyer        : Types.TargetBuyer;
    locationAdvantages : Text;
    connectivity       : Text;
    keyHighlights      : Text;
    uniqueFeatures     : Text;
    authorized         : Bool;
    submittedAt        : Int;
  };

  // Internal representation of List<T> in mo:core (block-based growable array)
  type OldListState = {
    var blockIndex   : Nat;
    var blocks       : [var [var ?OldPropertySubmission]];
    var elementIndex : Nat;
  };

  type NewListState = {
    var blockIndex   : Nat;
    var blocks       : [var [var ?Types.PropertySubmission]];
    var elementIndex : Nat;
  };

  type OldActor = {
    submissions       : OldListState;
    submissionCounter : { var value : Nat };
    googleSheetsUrl   : { var value : Text };
  };

  type NewActor = {
    submissions       : NewListState;
    submissionCounter : { var value : Nat };
    googleSheetsUrl   : { var value : Text };
  };

  func migrateSlot(slot : ?OldPropertySubmission) : ?Types.PropertySubmission {
    switch slot {
      case null null;
      case (?old) ?{ old with photoUrls = [] : [Text] };
    };
  };

  func migrateBlock(oldBlock : [var ?OldPropertySubmission]) : [var ?Types.PropertySubmission] {
    // Collect migrated slots into a List, then convert to var array
    let tmp = List.empty<?Types.PropertySubmission>();
    for (slot in oldBlock.vals()) {
      tmp.add(migrateSlot(slot));
    };
    tmp.toVarArray();
  };

  public func run(old : OldActor) : NewActor {
    // Collect migrated blocks into a List, then convert to var array
    let tmpBlocks = List.empty<[var ?Types.PropertySubmission]>();
    for (block in old.submissions.blocks.vals()) {
      tmpBlocks.add(migrateBlock(block));
    };
    let newBlocks : [var [var ?Types.PropertySubmission]] = tmpBlocks.toVarArray();

    let newSubmissions : NewListState = {
      var blockIndex   = old.submissions.blockIndex;
      var blocks       = newBlocks;
      var elementIndex = old.submissions.elementIndex;
    };

    {
      submissions       = newSubmissions;
      submissionCounter = old.submissionCounter;
      googleSheetsUrl   = old.googleSheetsUrl;
    };
  };
};
