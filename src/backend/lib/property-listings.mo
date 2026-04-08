import Types "../types/property-listings";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Text "mo:core/Text";
import Char "mo:core/Char";
module {
  // IC management canister interface for HTTP outcalls
  type HttpHeader = { name : Text; value : Text };
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{
      function : shared query ({ response : HttpRequestResult; context : Blob }) -> async HttpRequestResult;
      context : Blob;
    };
    is_replicated : ?Bool;
  };
  type HttpRequestResult = {
    status : Nat;
    headers : [HttpHeader];
    body : Blob;
  };

  let IC = actor "aaaaa-aa" : actor {
    http_request : HttpRequestArgs -> async HttpRequestResult;
  };

  // Percent-encode text for URL query parameters (RFC 3986)
  func urlEncode(text : Text) : Text {
    let chars = text.toIter();
    var result = "";
    for (c in chars) {
      let code = c.toNat32();
      // Unreserved chars: A-Z a-z 0-9 - _ . ~
      if (
        (code >= 65 and code <= 90) or   // A-Z
        (code >= 97 and code <= 122) or  // a-z
        (code >= 48 and code <= 57) or   // 0-9
        code == 45 or                    // -
        code == 95 or                    // _
        code == 46 or                    // .
        code == 126                      // ~
      ) {
        result := result # Text.fromChar(c);
      } else if (code == 32) {
        // space → +  (form encoding convention accepted by CallMeBot)
        result := result # "+";
      } else {
        // Encode as %XX  (only handles ASCII range for this use case)
        let hi = (code / 16).toNat();
        let lo = (code % 16).toNat();
        result := result # "%" # hexNibble(hi) # hexNibble(lo);
      };
    };
    result;
  };

  func hexNibble(n : Nat) : Text {
    let digits = "0123456789ABCDEF";
    let chars = digits.toArray();
    Text.fromChar(chars[n]);
  };

  func representationToText(r : Types.Representation) : Text {
    switch r {
      case (#Owner) "Owner";
      case (#Broker) "Broker";
      case (#ChannelPartner) "Channel Partner";
    };
  };

  func categoryToText(c : Types.PropertyCategory) : Text {
    switch c {
      case (#Apartment) "Apartment";
      case (#BuilderFloor) "Builder Floor";
      case (#Villa) "Villa";
      case (#Plot) "Plot";
      case (#Commercial) "Commercial";
    };
  };

  func furnishingToText(f : Types.Furnishing) : Text {
    switch f {
      case (#Furnished) "Furnished";
      case (#SemiFurnished) "Semi-Furnished";
      case (#Unfurnished) "Unfurnished";
    };
  };

  func targetBuyerToText(t : Types.TargetBuyer) : Text {
    switch t {
      case (#EndUser) "End User";
      case (#Investor) "Investor";
      case (#PremiumBuyer) "Premium Buyer";
    };
  };

  func buildWhatsAppMessage(submission : Types.PropertySubmission) : Text {
    "🏠 *New Property Submission — Club Invest Gurgaon*\n\n" #
    "*Client:* " # submission.clientName # "\n" #
    "*Phone:* " # submission.contactNumber # "\n" #
    "*Email:* " # submission.email # "\n" #
    "*Represented as:* " # representationToText(submission.representation) # "\n\n" #
    "*Property Type:* " # categoryToText(submission.propertyCategory) # "\n" #
    "*Project:* " # submission.projectName # "\n" #
    "*Location:* " # submission.location # ", " # submission.city # "\n" #
    "*Asking Price:* ₹" # submission.askingPrice # "\n" #
    "*Area:* " # submission.area # "\n" #
    "*Configuration:* " # submission.configuration # "\n\n" #
    "*Key Highlights:* " # submission.keyHighlights # "\n" #
    "*Negotiable:* " # (if (submission.negotiable) "Yes" else "No") # "\n" #
    "*Photos attached:* " # submission.photoUrls.size().toText();
  };

  // Build a JSON string for the Google Sheets Apps Script endpoint
  func jsonEscape(t : Text) : Text {
    // Replace \ first, then " to avoid double-escaping
    // Use Unicode escape sequences for special chars
    let s1 = t.replace(#char '\u{5C}', "\\\\");   // backslash U+005C
    let s2 = s1.replace(#char '\u{22}', "\\\"");  // double-quote U+0022
    let s3 = s2.replace(#char '\u{0A}', "\\n");   // newline U+000A
    s3.replace(#char '\u{0D}', "\\r");             // carriage return U+000D
  };

  func buildSheetsJson(id : Text, submission : Types.PropertySubmission) : Text {
    let negotiable = if (submission.negotiable) "Yes" else "No";
    let authorized = if (submission.authorized) "Yes" else "No";
    // Combine extra text fields into additionalNotes
    let additionalNotes =
      jsonEscape(submission.priceJustification) # " | " #
      jsonEscape(submission.locationAdvantages) # " | " #
      jsonEscape(submission.connectivity) # " | " #
      jsonEscape(submission.keyHighlights);
    // Build comma-separated photo URLs string
    var photoUrlsStr = "";
    var first = true;
    for (url in submission.photoUrls.vals()) {
      if (first) { first := false } else { photoUrlsStr := photoUrlsStr # "," };
      photoUrlsStr := photoUrlsStr # jsonEscape(url);
    };
    "{" #
    "\"submissionId\":\"" # jsonEscape(id) # "\"," #
    "\"clientName\":\"" # jsonEscape(submission.clientName) # "\"," #
    "\"phone\":\"" # jsonEscape(submission.contactNumber) # "\"," #
    "\"whatsApp\":\"\"," #
    "\"email\":\"" # jsonEscape(submission.email) # "\"," #
    "\"propertyType\":\"" # jsonEscape(categoryToText(submission.propertyCategory)) # "\"," #
    "\"fullAddress\":\"" # jsonEscape(submission.fullAddress) # "\"," #
    "\"floorDetails\":\"" # jsonEscape(submission.floorDetails) # "\"," #
    "\"area\":\"" # jsonEscape(submission.area) # "\"," #
    "\"bedrooms\":\"\"," #
    "\"bathrooms\":\"\"," #
    "\"furnishing\":\"" # jsonEscape(furnishingToText(submission.furnishing)) # "\"," #
    "\"askingPrice\":\"" # jsonEscape(submission.askingPrice) # "\"," #
    "\"negotiable\":\"" # negotiable # "\"," #
    "\"possession\":\"\"," #
    "\"targetBuyer\":\"" # jsonEscape(targetBuyerToText(submission.targetBuyer)) # "\"," #
    "\"uniqueFeatures\":\"" # jsonEscape(submission.uniqueFeatures) # "\"," #
    "\"additionalNotes\":\"" # additionalNotes # "\"," #
    "\"photoUrls\":\"" # photoUrlsStr # "\"," #
    "\"authorized\":\"" # authorized # "\"" #
    "}";
  };

  func textToBlob(t : Text) : Blob {
    t.encodeUtf8();
  };

  public func sendToGoogleSheets(
    googleSheetsUrl : { var value : Text },
    id              : Text,
    submission      : Types.PropertySubmission,
  ) : async* () {
    let url = googleSheetsUrl.value;
    if (url == "" or url == "GOOGLE_SHEETS_SCRIPT_URL") return;

    let jsonBody = buildSheetsJson(id, submission);
    let bodyBlob = textToBlob(jsonBody);

    let _response = await IC.http_request({
      url;
      max_response_bytes = ?4096;
      method = #post;
      headers = [{ name = "Content-Type"; value = "application/json" }];
      body = ?bodyBlob;
      transform = null;
      is_replicated = ?false;
    });
    ();
  };

  public func submitProperty(
    submissions       : List.List<Types.PropertySubmission>,
    counter           : { var value : Nat },
    googleSheetsUrl   : { var value : Text },
    submission        : Types.PropertySubmission,
  ) : async* Text {
    // Store the submission
    submissions.add(submission);
    counter.value += 1;
    let id = "SUB-" # counter.value.toText();

    // Fire WhatsApp notification — do not block submission on failure
    try {
      let message = buildWhatsAppMessage(submission);
      let encoded = urlEncode(message);
      let url = "https://api.textmebot.com/send.php?recipient=919268215082&apikey=FZxNRJL97h9E&text=" # encoded;
      let _response = await IC.http_request({
        url;
        max_response_bytes = ?2048;
        method = #get;
        headers = [];
        body = null;
        transform = null;
        is_replicated = ?false;
      });
      ();
    } catch (_) {
      // Silently ignore — WhatsApp notification failure must not affect form submission
      ();
    };

    // Send to Google Sheets — do not block submission on failure
    try {
      await* sendToGoogleSheets(googleSheetsUrl, id, submission);
    } catch (_) {
      // Silently ignore — Sheets sync failure must not affect form submission
      ();
    };

    id;
  };

  public func getSubmissions(
    submissions : List.List<Types.PropertySubmission>,
  ) : [Types.PropertySubmission] {
    submissions.toArray();
  };

  public func setGoogleSheetsUrl(
    googleSheetsUrl : { var value : Text },
    url             : Text,
  ) {
    googleSheetsUrl.value := url;
  };
};
