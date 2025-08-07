/**
 * @param fields Common fields are: "subject", "body".
 *     Some email apps let you specify arbitrary headers here.
 * @param recipientsSeparator Default is ",". Use ";" for Outlook.
 */
export function mailto(recipients, fields, recipientsSeparator, callback) {
  recipientsSeparator = recipientsSeparator || ",";

  var url = "mailto:" + recipients.join(recipientsSeparator);
  Object.keys(fields).forEach(function (key, index) {
    if (index === 0) {
      url += "?";
    } else {
      url += "&";
    }
    url += key + "=" + encodeURIComponent(fields[key]);
  });
  open(url, callback);
}
