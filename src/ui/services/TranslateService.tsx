import loggerUtil from '../utils/LoggerUtil';

const translateConfig = {
    apiKey: import.meta.env.VITE_API_KEY_TRANSLATE,
    authDomain: import.meta.env.VITE_API_ENDPOINT_TRANSLATE,
  };

export const translateText = async (text: string, targetLang: string) => {
    const authKey = translateConfig.apiKey; // Reemplaza con tu clave API válida
    const endpoint = translateConfig.authDomain;
    
    const params = new URLSearchParams({
        auth_key: authKey,
        text: text,
        target_lang: targetLang,
    });

    try {
        const response = await fetch(`${endpoint}?${params}`, {
            method: "POST",
        });


        // Ejemplo de response exitoso:
        // -------------------------------------------------------------------------------
        // translations: [
        //     {
        //         detected_source_language: "EN", // Simulación del idioma detectado
        //         text: "La mesa es verde. La silla es café", // Traducción simulada
        //     },
        // ],
        // -------------------------------------------------------------------------------

        if (!response.ok) {
            loggerUtil.error(`Error en la traducción: ${response.statusText}`);
            throw new Error(`Error en la traducción: ${response.statusText}`);
        }

        const data = await response.json();
        loggerUtil.info("Traducción: " + data.translations[0].text);
        return data.translations[0].text;
    } catch (error) {
        loggerUtil.error(`Error al traducir: ${error}`)
        return null;
    }
};


export const simulateTranslationResponse = async (text: string, targetLang: string) => {
    loggerUtil.info(`Texto recibido: ${text}`);
    loggerUtil.info(`Idioma objetivo: ${targetLang}`);

    // Respuesta simulada
    const data  = {
        translations: [
            {
                detected_source_language: "EN", // Simulación del idioma detectado
                text: "La mesa es verde. La silla es café", // Traducción simulada
            },
        ],
    };

    return data.translations[0].text;

};

