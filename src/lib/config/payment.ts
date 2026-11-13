/**
 * Frontend settings for payments & shipping.
 *
 * ⚠️  These account details are DEMO values. Replace them with the shop's real
 * accounts (ideally loaded from a backend/CMS in production). Nothing in the UI
 * hardcodes these details — every payment component reads from this file.
 */

export interface ManualPaymentMethod {
  id: string;
  name: string;
  /** Short helper shown under the method name. */
  tagline: string;
  accountTitle: string;
  accountNumber: string;
  /** Extra labelled rows (bank name, IBAN, branch, ...). */
  extraDetails: Array<{ label: string; value: string }>;
  steps: string[];
  /** Optional QR image URL. Leave empty to display a placeholder. */
  qrImage?: string;
}

export const manualPaymentMethods: ManualPaymentMethod[] = [
  {
    id: "jazzcash",
    name: "JazzCash",
    tagline: "Mobile wallet transfer",
    accountTitle: "Alam Fashion",
    accountNumber: "0321 9669289",
    extraDetails: [],
    steps: [
      "Open the JazzCash app and choose “Send Money”.",
      "Enter the account number 0321 9669289 and the exact order amount.",
      "Complete the transfer and note the Transaction ID (TID).",
    ],
    qrImage: "",
  },
  {
    id: "easypaisa",
    name: "Easypaisa",
    tagline: "Mobile wallet transfer",
    accountTitle: "Alam Fashion",
    accountNumber: "0321 9669289",
    extraDetails: [],
    steps: [
      "Open the Easypaisa app and choose “Send Money”.",
      "Enter the account number 0321 9669289 and the exact order amount.",
      "Complete the transfer and note the Transaction ID.",
    ],
    qrImage: "",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    tagline: "Direct bank / IBFT transfer",
    accountTitle: "Alam Fashion",
    accountNumber: "0123 4567 8901 2345",
    extraDetails: [
      { label: "Bank name", value: "Meezan Bank Limited" },
      { label: "IBAN", value: "PK36MEZN0001234567890123" },
      { label: "Branch", value: "Douglas Pura Branch, Faisalabad" },
    ],
    steps: [
      "Use your banking app or branch to transfer to the account above.",
      "Enter the exact order amount and use your order number as reference.",
      "Keep the transaction reference number from your receipt.",
    ],
    qrImage: "",
  },
];

export const shippingConfig = {
  flatRate: 250,
  freeShippingThreshold: 5000,
  /** Cities that receive faster delivery estimates. */
  metroCities: [
    "karachi",
    "lahore",
    "islamabad",
    "rawalpindi",
    "faisalabad",
    "multan",
    "peshawar",
  ],
  metroDays: { min: 2, max: 4 },
  otherDays: { min: 4, max: 7 },
};

export const pakistanCities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Abbottabad",
  "Sukkur",
];

/** Maximum quantity of a single product per order line. */
export const MAX_QTY_PER_ITEM = 10;

