const SHEET_NAME = "Confirmaciones";
const ALLOWED_ATTENDANCE = new Set(["Sí, ahí estaré", "No podré asistir"]);

function doPost(event) {
  const params = event && event.parameter ? event.parameter : {};

  // Campo trampa para descartar envíos automáticos simples.
  if (String(params.website || "").trim()) {
    return textResponse("ok");
  }

  const name = String(params.name || "").trim().slice(0, 120);
  const attendance = String(params.attendance || "").trim();
  if (!name || !ALLOWED_ATTENDANCE.has(attendance)) {
    return textResponse("invalid");
  }

  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) {
    return textResponse("not_configured");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Fecha y hora", "Nombre y apellido", "Asistencia"]);
    }
    sheet.appendRow([new Date(), name, attendance]);
  } finally {
    lock.releaseLock();
  }

  return textResponse("ok");
}

function textResponse(message) {
  return ContentService.createTextOutput(message).setMimeType(ContentService.MimeType.TEXT);
}
