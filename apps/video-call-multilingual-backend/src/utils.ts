// Функция для получения локального IP-адреса
import * as os from "node:os";

export function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return 'localhost';
}

export const rawMessageToString = (message: Buffer | ArrayBuffer | Buffer[]): string => {
  return message instanceof Buffer
    ? message.toString('utf8')
    : message instanceof ArrayBuffer
      ? new TextDecoder().decode(message)
      : message.map(rawMessageToString).toString()
};
