// NCALayer WebSocket client
// NCALayer runs locally on user's machine at ws://127.0.0.1:13579
// Handles GOST2015 and RSA certificates from НУЦ РК

// Chrome allows ws://localhost from HTTPS pages (localhost exception)
const WS_URL = "ws://127.0.0.1:13579";

interface NCALayerResponse {
  code: string;
  responseObject?: string;
  message?: string;
}

function sendCommand(command: object): Promise<NCALayerResponse> {
  return new Promise((resolve, reject) => {
    let ws: WebSocket;

    try {
      ws = new WebSocket(WS_URL);
    } catch {
      reject(new Error("Не удалось подключиться к NCALayer"));
      return;
    }

    const timer = setTimeout(() => {
      ws.close();
      reject(new Error("NCALayer не отвечает (таймаут)"));
    }, 15000);

    ws.onopen = () => {
      ws.send(JSON.stringify(command));
    };

    ws.onmessage = (event) => {
      clearTimeout(timer);
      try {
        const response: NCALayerResponse = JSON.parse(event.data);
        resolve(response);
      } catch {
        reject(new Error("Некорректный ответ от NCALayer"));
      }
      ws.close();
    };

    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error("NCALayer недоступен. Убедитесь что NCALayer запущен."));
    };
  });
}

/**
 * Sign XML with NCALayer (XMLDSig, supports GOST2015 and RSA)
 * Returns signed XML with embedded <ds:Signature>
 */
export async function signXml(xml: string): Promise<string> {
  const response = await sendCommand({
    module: "kz.gov.pki.knca.commonUtils",
    method: "signXml",
    args: ["PKCS12", "SIGNATURE", xml, "", ""],
  });

  if (response.code !== "200" || !response.responseObject) {
    throw new Error(response.message || "Ошибка подписания в NCALayer");
  }

  return response.responseObject;
}

/**
 * Sign raw data (base64 input, returns CMS signature base64)
 */
export async function signData(dataBase64: string): Promise<string> {
  const response = await sendCommand({
    module: "kz.gov.pki.knca.commonUtils",
    method: "createCMSSignatureFromBase64",
    args: ["PKCS12", "SIGNATURE", dataBase64, true],
  });

  if (response.code !== "200" || !response.responseObject) {
    throw new Error(response.message || "Ошибка подписания в NCALayer");
  }

  return response.responseObject;
}

/**
 * Check if NCALayer is running
 */
export async function checkNcaLayer(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(WS_URL);
      const timer = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 3000);

      ws.onopen = () => {
        clearTimeout(timer);
        ws.close();
        resolve(true);
      };

      ws.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
    } catch {
      resolve(false);
    }
  });
}
