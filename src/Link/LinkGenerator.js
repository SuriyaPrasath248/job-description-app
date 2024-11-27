// LinkGenerator.js
import CryptoJS from 'crypto-js';

const SECRET_KEY = "TadpulPassword"; // Replace with a secure password

const generateEncryptionKey = () => {
  const salt = CryptoJS.enc.Hex.parse("0A141E28323C46505A646E76808A94A2");
  return CryptoJS.PBKDF2(SECRET_KEY, salt, {
    keySize: 256 / 32,
    iterations: 300,
  });
};

export const createLink = (conversationNumber, userEmail) => {
  try {
    const linkFormat = {
      ConversationNumber: conversationNumber,
      Email: userEmail,
    };

    const jsonString = JSON.stringify(linkFormat);
    const key = generateEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
      iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"),
    }).toString();

    return `https://job-description-app.vercel.app?id=${encodeURIComponent(encrypted)}`;
  } catch (error) {
    console.error("Error creating encrypted link:", error);
    return null;
  }
};

export const readLink = (encryptedLink) => {
  try {
    const key = generateEncryptionKey();
    const cipherText = decodeURIComponent(encryptedLink);
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
      iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"),
    }).toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error reading encrypted link:", error);
    return null;
  }
};
