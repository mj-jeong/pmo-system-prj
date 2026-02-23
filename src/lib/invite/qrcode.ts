// PMO System - QR Code Generation for Invitation Links
// Server-side SVG generation via 'qrcode' package (no browser bundle impact).

import QRCode from "qrcode";
import { buildInviteUrl } from "./token";

/**
 * Generate an SVG QR code string for the given invitation token.
 * Returns raw SVG markup suitable for inline rendering or download.
 */
export async function generateInviteQRSvg(token: string): Promise<string> {
  const url = buildInviteUrl(token);
  return QRCode.toString(url, {
    type: "svg",
    margin: 2,
    width: 300,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

/**
 * Generate a base64-encoded PNG data URL for the given invitation token.
 * Suitable for <img src="..."> or download link.
 */
export async function generateInviteQRDataUrl(token: string): Promise<string> {
  const url = buildInviteUrl(token);
  return QRCode.toDataURL(url, {
    type: "image/png",
    margin: 2,
    width: 400,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
