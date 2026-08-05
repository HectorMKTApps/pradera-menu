/**
 * Pradera Menu — Google Sheets sync script.
 *
 * Reads every sheet tab (one tab per menu category), filters to rows marked
 * Available, sorts by Order, uploads any new Drive images to Cloudinary,
 * and commits the resulting JSON to data/menu.json in a GitHub repo so
 * Vercel picks up the change and redeploys.
 *
 * Required Script Properties (Project Settings > Script Properties):
 *   GITHUB_TOKEN               Personal access token with repo contents write access
 *   CLOUDINARY_CLOUD_NAME      Cloudinary cloud name
 *   CLOUDINARY_UPLOAD_PRESET   Unsigned upload preset configured on that cloud
 *
 * Expected columns per sheet tab (row 1 = headers):
 *   Name | Description | Price | Image URL | Cloudinary URL | Featured | Order | Available
 */

const GITHUB_OWNER = "YOUR_GITHUB_USERNAME";
const GITHUB_REPO = "pradera-menu";
const GITHUB_BRANCH = "main";
const GITHUB_FILE_PATH = "data/menu.json";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Pradera Menu")
    .addItem("Sync changes", "syncMenu")
    .addToUi();
}

/**
 * Main entry point, wired to the "Sync changes" menu item.
 */
function syncMenu() {
  const props = PropertiesService.getScriptProperties();
  const githubToken = props.getProperty("GITHUB_TOKEN");
  const cloudName = props.getProperty("CLOUDINARY_CLOUD_NAME");
  const uploadPreset = props.getProperty("CLOUDINARY_UPLOAD_PRESET");

  if (!githubToken || !cloudName || !uploadPreset) {
    SpreadsheetApp.getUi().alert(
      "Missing configuration. Set GITHUB_TOKEN, CLOUDINARY_CLOUD_NAME, and " +
        "CLOUDINARY_UPLOAD_PRESET under Project Settings > Script Properties."
    );
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const menuData = {};
  const warnings = [];

  sheets.forEach((sheet) => {
    const category = sheet.getName();
    const rows = readSheetRows(sheet);

    const products = rows
      .filter((row) => isTruthy(row["Available"]))
      .map((row, index) => {
        const product = {
          name: row["Name"],
          description: row["Description"] || "",
          price: String(row["Price"] || ""),
          order: row["Order"] !== "" ? Number(row["Order"]) : index + 1,
        };

        if (row["Featured"] && isTruthy(row["Featured"])) {
          product.featured = true;
        }

        const driveUrl = row["Image URL"];
        const existingCloudinaryUrl = row["Cloudinary URL"];

        if (driveUrl) {
          if (existingCloudinaryUrl) {
            // Bug fix #1: skip re-uploading images that were already synced.
            // The Cloudinary URL column caches the result so unchanged rows
            // don't burn upload quota or create orphaned duplicates.
            product.image = existingCloudinaryUrl;
          } else {
            try {
              const secureUrl = uploadImageToCloudinary(
                driveUrl,
                cloudName,
                uploadPreset
              );
              product.image = secureUrl;
              writeCloudinaryUrlBack(sheet, row["_rowNumber"], secureUrl);
            } catch (err) {
              // Bug fix #2: a single failed upload must not abort the whole
              // sync. Log a warning, fall back to any previous image (or no
              // image), and keep going.
              warnings.push(
                "'" + (row["Name"] || "Untitled") + "' image failed — " +
                  (existingCloudinaryUrl ? "kept previous image." : "no image kept.")
              );
              if (existingCloudinaryUrl) {
                product.image = existingCloudinaryUrl;
              }
            }
          }
        }

        return product;
      })
      .sort((a, b) => a.order - b.order);

    menuData[category] = products;
  });

  const json = JSON.stringify(menuData, null, 2);
  commitToGitHub(json, githubToken);

  if (warnings.length > 0) {
    SpreadsheetApp.getUi().alert(
      "Synced with " +
        warnings.length +
        " warning" +
        (warnings.length > 1 ? "s" : "") +
        ": " +
        warnings.join("; ")
    );
  } else {
    SpreadsheetApp.getUi().alert("Menu synced successfully.");
  }
}

/**
 * Reads a sheet into an array of header-keyed row objects. Adds a
 * "_rowNumber" field (1-indexed, matching the sheet) so callers can write
 * back to specific cells, e.g. caching the Cloudinary URL after upload.
 */
function readSheetRows(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const row = {};
    headers.forEach((header, col) => {
      row[header] = values[i][col];
    });
    row["_rowNumber"] = i + 1;
    rows.push(row);
  }

  return rows;
}

function writeCloudinaryUrlBack(sheet, rowNumber, secureUrl) {
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
  const colIndex = headers.indexOf("Cloudinary URL");
  if (colIndex === -1) return;
  sheet.getRange(rowNumber, colIndex + 1).setValue(secureUrl);
}

function isTruthy(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toUpperCase() === "TRUE";
  return false;
}

/**
 * Downloads a Drive file (from a Drive share URL) and uploads it to
 * Cloudinary via an unsigned upload preset. Throws on any failure — callers
 * are responsible for catching this per-row so one bad image doesn't abort
 * the whole sync.
 */
function uploadImageToCloudinary(driveUrl, cloudName, uploadPreset) {
  const fileId = extractDriveFileId(driveUrl);
  if (!fileId) {
    throw new Error("Could not parse Drive file ID from URL: " + driveUrl);
  }

  const file = DriveApp.getFileById(fileId);
  const blob = file.getBlob();

  const uploadUrl =
    "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";

  const response = UrlFetchApp.fetch(uploadUrl, {
    method: "post",
    payload: {
      file: blob,
      upload_preset: uploadPreset,
    },
    muteHttpExceptions: true,
  });

  const status = response.getResponseCode();
  const body = JSON.parse(response.getContentText());

  if (status !== 200 || !body.secure_url) {
    throw new Error(
      "Cloudinary upload failed (" + status + "): " + response.getContentText()
    );
  }

  return body.secure_url;
}

function extractDriveFileId(url) {
  const patterns = [/[-\w]{25,}/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[0];
  }
  return null;
}

/**
 * Commits the given JSON string to GITHUB_OWNER/GITHUB_REPO at
 * GITHUB_FILE_PATH on GITHUB_BRANCH, creating or updating the file via the
 * GitHub Contents API.
 */
function commitToGitHub(jsonContent, githubToken) {
  const apiUrl =
    "https://api.github.com/repos/" +
    GITHUB_OWNER +
    "/" +
    GITHUB_REPO +
    "/contents/" +
    GITHUB_FILE_PATH;

  const headers = {
    Authorization: "Bearer " + githubToken,
    Accept: "application/vnd.github+json",
  };

  let sha = null;
  const getResponse = UrlFetchApp.fetch(apiUrl + "?ref=" + GITHUB_BRANCH, {
    method: "get",
    headers: headers,
    muteHttpExceptions: true,
  });

  if (getResponse.getResponseCode() === 200) {
    sha = JSON.parse(getResponse.getContentText()).sha;
  }

  const payload = {
    message: "Sync menu from Google Sheets",
    content: Utilities.base64Encode(jsonContent, Utilities.Charset.UTF_8),
    branch: GITHUB_BRANCH,
  };
  if (sha) {
    payload.sha = sha;
  }

  const putResponse = UrlFetchApp.fetch(apiUrl, {
    method: "put",
    headers: headers,
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  const putStatus = putResponse.getResponseCode();
  if (putStatus !== 200 && putStatus !== 201) {
    throw new Error(
      "GitHub commit failed (" + putStatus + "): " + putResponse.getContentText()
    );
  }
}
