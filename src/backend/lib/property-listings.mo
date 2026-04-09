import Types "../types/property-listings";
import List "mo:core/List";
import Debug "mo:core/Debug";
import Text "mo:core/Text";
import Error "mo:core/Error";

module {
  // IC management canister interface for HTTP outcalls
  type HttpHeader = { name : Text; value : Text };
  type HttpRequestResult = {
    status : Nat;
    headers : [HttpHeader];
    body : Blob;
  };
  type TransformArgs = {
    response : HttpRequestResult;
    context : Blob;
  };
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{
      function : shared query TransformArgs -> async HttpRequestResult;
      context : Blob;
    };
  };

  let IC = actor "aaaaa-aa" : actor {
    http_request : HttpRequestArgs -> async HttpRequestResult;
  };

  // Hardcoded integration URLs
  let GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxcv18L4uTLNvqFFgalKnS90T0DU6XipHil5roRUn9JaHLCyeFBVF2NzS654jAb8nC9/exec";
  let WHATSAPP_BASE_URL = "https://api.callmebot.com/whatsapp.php";
  let WHATSAPP_PHONE = "919268215082";
  let WHATSAPP_APIKEY = "FZxNRJL97h9E";

  // Simple URL encoder for WhatsApp message text.
  // - Spaces → %20
  // - Newlines → %0A
  // - & → %26
  // - = → %3D
  // - # → %23
  // - ? → %3F
  // - Non-ASCII characters (emoji, ₹, etc.) are STRIPPED entirely
  // - Alphanumeric and basic punctuation (. , : - _ /) pass through unchanged
  func urlEncodeSimple(text : Text) : Text {
    var result = "";
    for (c in text.toIter()) {
      let n = c.toNat32().toNat();
      if (
        (n >= 65 and n <= 90) or   // A-Z
        (n >= 97 and n <= 122) or  // a-z
        (n >= 48 and n <= 57) or   // 0-9
        n == 46 or                  // .
        n == 44 or                  // ,
        n == 58 or                  // :
        n == 45 or                  // -
        n == 95 or                  // _
        n == 47                     // /
      ) {
        result := result # Text.fromChar(c);
      } else if (n == 32) {
        result := result # "%20";
      } else if (n == 10) {
        result := result # "%0A";
      } else if (n == 38) {
        result := result # "%26";
      } else if (n == 61) {
        result := result # "%3D";
      } else if (n == 35) {
        result := result # "%23";
      } else if (n == 63) {
        result := result # "%3F";
      };
      // All non-ASCII and other special chars are dropped silently
    };
    result;
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

  // Build a concise WhatsApp message under 400 chars.
  // No emoji, no Rs symbol (replaced with Rs), no non-ASCII.
  func buildWhatsAppMessage(submission : Types.PropertySubmission) : Text {
    "New Club Invest Gurgaon Submission" #
    "\nName: " # submission.clientName #
    "\nPhone: " # submission.contactNumber #
    "\nProperty: " # categoryToText(submission.propertyCategory) #
    "\nPrice: Rs " # submission.askingPrice #
    "\nAddress: " # submission.fullAddress;
  };

  // Escape a string value for embedding inside a JSON double-quoted field.
  func jsonEscape(t : Text) : Text {
    let s1 = t.replace(#char '\u{5C}', "\\\\");  // backslash → \\
    let s2 = s1.replace(#char '\u{22}', "\\\""); // double-quote → \"
    let s3 = s2.replace(#char '\u{0A}', "\\n");  // newline → \n
    s3.replace(#char '\u{0D}', "\\r");            // carriage return → \r
  };

  // Build JSON body matching EXACTLY the Google Apps Script field names.
  // All field names are lowercase camelCase as expected by the doPost handler.
  func buildSheetsJson(submission : Types.PropertySubmission) : Text {
    let negotiable = if (submission.negotiable) "Yes" else "No";
    let authorized = if (submission.authorized) "Yes" else "No";
    let additionalNotes =
      jsonEscape(submission.priceJustification) # " | " #
      jsonEscape(submission.locationAdvantages) # " | " #
      jsonEscape(submission.connectivity) # " | " #
      jsonEscape(submission.keyHighlights);
    "{" #
    "\"clientName\":\"" # jsonEscape(submission.clientName) # "\"," #
    "\"phone\":\"" # jsonEscape(submission.contactNumber) # "\"," #
    "\"whatsapp\":\"" # jsonEscape(submission.contactNumber) # "\"," #
    "\"email\":\"" # jsonEscape(submission.email) # "\"," #
    "\"propertyType\":\"" # jsonEscape(categoryToText(submission.propertyCategory)) # "\"," #
    "\"fullAddress\":\"" # jsonEscape(submission.fullAddress) # "\"," #
    "\"floorDetails\":\"" # jsonEscape(submission.floorDetails) # "\"," #
    "\"area\":\"" # jsonEscape(submission.area) # "\"," #
    "\"bedrooms\":\"" # jsonEscape(submission.configuration) # "\"," #
    "\"bathrooms\":\"\"," #
    "\"furnishing\":\"" # jsonEscape(furnishingToText(submission.furnishing)) # "\"," #
    "\"askingPrice\":\"" # jsonEscape(submission.askingPrice) # "\"," #
    "\"negotiable\":\"" # negotiable # "\"," #
    "\"possession\":\"" # jsonEscape(submission.propertyAge) # "\"," #
    "\"targetBuyer\":\"" # jsonEscape(targetBuyerToText(submission.targetBuyer)) # "\"," #
    "\"uniqueFeatures\":\"" # jsonEscape(submission.uniqueFeatures) # "\"," #
    "\"additionalNotes\":\"" # additionalNotes # "\"," #
    "\"authorized\":\"" # authorized # "\"" #
    "}";
  };

  public func sendToGoogleSheets(
    submission : Types.PropertySubmission,
    transformFn : shared query TransformArgs -> async HttpRequestResult,
  ) : async* () {
    let jsonBody = buildSheetsJson(submission);
    let bodyBlob = jsonBody.encodeUtf8();

    try {
      let response = await (with cycles = 500_000_000_000) IC.http_request({
        url = GOOGLE_SHEETS_URL;
        max_response_bytes = ?4096;
        method = #post;
        headers = [
          { name = "Content-Type"; value = "application/json" },
          { name = "Accept"; value = "application/json" },
        ];
        body = ?bodyBlob;
        transform = ?{ function = transformFn; context = Blob.fromArray([]) };
      });

      if (response.status < 200 or response.status >= 400) {
        Debug.print("Google Sheets POST failed with status: " # debug_show(response.status));
      } else {
        Debug.print("Google Sheets POST succeeded with status: " # debug_show(response.status));
      };
    } catch (e) {
      Debug.print("Google Sheets POST error: " # e.message());
    };
  };

  public func sendWhatsAppNotification(
    submission : Types.PropertySubmission,
    transformFn : shared query TransformArgs -> async HttpRequestResult,
  ) : async* () {
    let message = buildWhatsAppMessage(submission);
    let encoded = urlEncodeSimple(message);
    let url = WHATSAPP_BASE_URL #
      "?phone=" # WHATSAPP_PHONE #
      "&text=" # encoded #
      "&apikey=" # WHATSAPP_APIKEY;

    try {
      let response = await (with cycles = 200_000_000_000) IC.http_request({
        url;
        max_response_bytes = ?2048;
        method = #get;
        headers = [];
        body = null;
        transform = ?{ function = transformFn; context = Blob.fromArray([]) };
      });

      if (response.status < 200 or response.status >= 400) {
        Debug.print("WhatsApp notification failed with status: " # debug_show(response.status));
      } else {
        Debug.print("WhatsApp notification sent with status: " # debug_show(response.status));
      };
    } catch (e) {
      Debug.print("WhatsApp notification error: " # e.message());
    };
  };

  public func submitProperty(
    submissions       : List.List<Types.PropertySubmission>,
    counter           : { var value : Nat },
    _googleSheetsUrl  : { var value : Text },
    submission        : Types.PropertySubmission,
    transformFn       : shared query TransformArgs -> async HttpRequestResult,
  ) : async* Text {
    // Store the submission first — never block on external calls
    submissions.add(submission);
    counter.value += 1;
    let id = "SUB-" # counter.value.toText();

    // Fire WhatsApp notification — log errors but don't block submission
    await* sendWhatsAppNotification(submission, transformFn);

    // Send to Google Sheets — log errors but don't block submission
    await* sendToGoogleSheets(submission, transformFn);

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
