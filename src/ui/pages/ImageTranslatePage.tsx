import { useEffect, useRef, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as mobilenet from '@tensorflow-models/mobilenet';

import SelectionImageComponent from "../components/SelectionImageComponent";
import LoggerUtil from '../utils/LoggerUtil';
import ErrorBoundary from '../components/ErrorBoundaryComponent';
import { ClassicationResult } from "../interfaces/ClassicationResult";
import { translateText, simulateTranslationResponse } from "../services/TranslateService";

interface ImageTranslatePageProps {
    forbiddenWords: string[];
}


async function faceTranslate(text: string, _fromLang: string, _toLang: string): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(async() => {
            // Para la demo, simplemente devolvemos un string marcando que es traducción simulada

            // Traducción de prueba
            //const result = await simulateTranslationResponse("Hello", "ES"); // Traducción a español
            const result = await translateText(text, "ES"); // Traducción a español
            LoggerUtil.warn("resultado traducción: " + result);

            if (result) {
                resolve(`(ES) ${result}`);
            } else {
                LoggerUtil.info(`(ES) ${text}`);
                resolve(`(ES) ${text}`);
            }


        }, 1000);
    });
}

export const ImageTranslatePage: React.FC<ImageTranslatePageProps> = ({ 
    forbiddenWords
}) => {

    const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [predictions, setPredictions] = useState<ClassicationResult[]>([]);
    const [modelLoading, setModelLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [resetKey, setResetKey] = useState<number>(0); // Estado para resetear el componente
    const [translatedText, setTranslatedText] = useState("");
    const [hasError, setHasError] = useState<boolean>(false);
    const imageRef = useRef<HTMLImageElement>(null);


    const loadModel = async () => {

        setModelLoading(true);

        try {
            LoggerUtil.info('Cargando modelo MobileNet...');
            const loadedModel = await mobilenet.load(); // Promesa asíncrona
            setModel(loadedModel);
            LoggerUtil.info('Modelo cargado con éxito');
        } catch (error) {
            LoggerUtil.error(`Error cargando el modelo: ${error}`);
        } finally {
            setModelLoading(false);
        }
    };   
        
    // Cargar el modelo al montar el componente
    useEffect(() => {
        loadModel();
    }, []);

    const resetPage = () => {
        // window.location.reload(); // Recargar la página
        setSelectedFile(null);
        setPreviewUrl('');
        setPredictions([]);
        setResetKey(prevKey => prevKey + 1); // Cambiar la clave para forzar el re-render        
    };    

    // 2. Clasicar la imagen Y luego traducir en cadena
    const classifyAndTranslate = async () => {
        if (!model) {
            LoggerUtil.warn('El modelo aún no se ha cargado. Espera un momento e inténtalo de nuevo.');
            return;
        }
        if (!imageRef.current) {
            LoggerUtil.warn('No se encontró la referencia a la imagen.');
            return;
        }

        setLoading(true); // Activar el estado de carga

        try {
            // a) Primera Promesa: Clasicar la imagen
            const results = await model.classify(imageRef.current);
            LoggerUtil.info(`Resultados en inglés: ${results}`);

            // b) Segunda Promesa (encadenada): Traducir el "className" de cada resultado
            // Usamos Promise.all para ejecutar en paralelo la traducción de cada clase
            const translatedResults: ClassicationResult[] = await Promise.all(
                results.map(async (item) => {
                    const translatedName = await faceTranslate(item.className, 'en', 'es');

                    // Validar si la traducción contiene palabras prohibidas
                    forbiddenWords.forEach((word) => {
                        if (translatedName.toLowerCase().includes(word.toLowerCase())) {
                            setHasError(true); // Activar error
                            return;
                        }
                    });

                    return { ...item, translatedName };
                })
            );
            setPredictions(translatedResults);
        } catch (error) {
            LoggerUtil.info(`Error clasificando o traduciendo la imagen: ${error}`);
        } finally {
            setLoading(false); // Desactivar el estado de carga
        }
    };    

    if (hasError) {
        // Forzar un error dentro del renderizado
        throw new Error(`La traducción contiene una palabra prohibida:`);
    }

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col-md-6 text-center">

                    <ErrorBoundary key={resetKey} fallback={
                        <div className="container text-center mt-5">
                            <h1>Ha ocurrido un error</h1>
                            <p>Algo salió mal durante la carga del modelo.</p>
                            <button className="btn btn-primary" onClick={resetPage}>
                                Reintentar
                            </button>
                        </div>
                    }>
                        <SelectionImageComponent
                            key={resetKey} // Usamos el resetKey para forzar la recarga
                            onFileChange={setSelectedFile}
                            previewUrl={previewUrl}
                            onPreviewUrl={setPreviewUrl}
                            onPredictions={setPredictions}
                            imageRef={imageRef} 
                            modelLoading={modelLoading}
                        />
                    </ErrorBoundary>
                </div>

                <div className="col-md-6">
                    {loading ? (
                    <div className="card text-center p-3 text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-3">
                        <div className="card-body">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <h5>Cargando resultados...</h5>
                        </div>
                    </div>
                    ) : (
                        <>
                            {selectedFile && (
                                <div className="text-center mb-4">
                                    <button onClick={classifyAndTranslate} className="btn btn-success">
                                        Clasificar y traducir
                                    </button>
                                </div>
                
                            )}   

                                {predictions.length > 0 && (
                                    <div className="card mt-4 p-3 text-primary-emphasis bg-primary-subtle border border-primary-subtle rounded-3">
                                        <div className="card-body">
                                        <h5>Resultados:</h5>
                                        <ul className="list-unstyled">
                                            {predictions.map((item, index) => (
                                                <li key={index}>
                                                    <strong className="text-primary">Original:</strong> {item.className} |{' '}
                                                    <strong className="text-primary">Traducción:</strong> {item.translatedName} |{' '}
                                                    <strong className="text-primary">Prob:</strong> {(item.probability * 100).toFixed(2)}%

                                                </li>
                                            ))}
                                        </ul>
                                        </div>
                                    </div>
                                )} 
                          
                        </>
                      
                    )}                 
                </div>
                
            </div>
        </div>
    );
}

export default ImageTranslatePage;