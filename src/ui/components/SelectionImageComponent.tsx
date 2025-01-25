import React, { useState, useRef } from 'react';
import { ClassicationResult } from '../interfaces/ClassicationResult';

interface SelectionImageComponentProps {
    onFileChange: (file: File | null) => void;
    previewUrl: string;
    onPreviewUrl: (url: string) => void;
    onPredictions: (classifitacion: ClassicationResult[]) => void;
    imageRef: React.RefObject<HTMLImageElement>;  // Prop para pasar la referencia
    modelLoading: boolean;
}

const SelectionImageComponent: React.FC<SelectionImageComponentProps> = ({ 
    onFileChange, 
    previewUrl, 
    onPreviewUrl,
    onPredictions,
    imageRef,
    modelLoading
}) => {

    const [hasError, setHasError] = useState<boolean>(false);

    // 1. Manejar la selección de archivo
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            if (fileExtension === 'svg') {
                setHasError(true); // Activar error
                return;
            }
            onFileChange(file); // Pasar el archivo al componente padre
            const fileUrl = URL.createObjectURL(file);
            onPreviewUrl(fileUrl);
            onPredictions([]); // Limpiamos predicciones si se cambia la imagen
        }
    };

    if (hasError) {
        // Forzar un error dentro del renderizado
        onFileChange(null);
        onPredictions([]);
        throw new Error("Simulación de error: archivo SVG no permitido.");
    }

    return (
        <div>
            <p className="h3 text-center">Clasificador de Imágenes + Traducción (Chaining)</p>
            <p className="text-center">Selecciona una imagen .…</p>

            {modelLoading ? (
                    <div className="card text-center p-3 text-light-emphasis bg-light-subtle border border-light-subtle rounded-3">
                        <div className="card-body">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <h5>Cargando modelo...</h5>
                        </div>
                    </div>
                    ):(
                        <input type="file" accept="image/*" onChange={handleFileChange} className="form-control btn-warning" />
            )}


            {previewUrl && (
                <div className="mt-3">
                    <img
                        height={360}
                        ref={imageRef}
                        src={previewUrl}
                        alt="Vista previa"
                        className="img-fluid rounded shadow-sm"
                    />
                </div>
            )}
        </div>
    );
};

export default SelectionImageComponent;
