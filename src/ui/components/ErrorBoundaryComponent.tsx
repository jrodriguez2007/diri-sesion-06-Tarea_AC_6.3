
import logger from '../utils/LoggerUtil';
import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    /** Fallback UI to render when an error occurs */
    fallback: ReactNode;
    /** Components that the ErrorBoundary wraps */
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundaryComponent extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        logger.warn("Error capturado por ErrorBoundary: " + error.message);
        logger.debug("Detalles del error: " + info.componentStack);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

export default ErrorBoundaryComponent;