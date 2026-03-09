import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex items-center justify-center p-8 text-red-400">
                    <div className="text-center">
                        <p className="text-lg font-semibold">Something went wrong</p>
                        <p className="text-sm opacity-70 mt-1">{this.state.error?.message}</p>
                        <button onClick={() => this.setState({ hasError: false })}
                            className="mt-4 px-4 py-2 bg-emerald-500/20 rounded-xl hover:bg-emerald-500/30 transition">
                            Retry
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
