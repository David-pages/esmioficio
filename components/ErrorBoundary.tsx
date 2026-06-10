import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error no controlado en la aplicacion:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <span className="material-symbols-outlined mb-4 text-6xl text-primary">build_circle</span>
            <h1 className="mb-2 text-2xl font-extrabold text-white">Algo salio mal</h1>
            <p className="mb-6 text-sm text-gray-400">
              Ocurrio un error inesperado. Intenta recargar la pagina; si el problema continua,
              vuelve mas tarde.
            </p>
            <button
              onClick={this.handleReload}
              className="rounded-xl bg-primary px-6 py-3 font-bold text-background transition-opacity hover:opacity-90"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
