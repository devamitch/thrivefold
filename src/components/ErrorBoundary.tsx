import { SquircleSurface } from '@/components/ui';
/**
 * Error Boundary Component for Thrivefold matching Neev's architecture.
 * Catches JavaScript errors in child components and displays a clean recovery UI.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AppButton } from './ui/Button';
import { Card } from './ui/Card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SquircleSurface style={styles.container}>
          <Card style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred. Your private health logs and keys remain secure.
            </Text>
            {this.state.error && (
              <Text style={styles.errorText}>
                {this.state.error.message}
              </Text>
            )}
            <AppButton title="Try Again" onPress={this.handleReset} style={styles.button} />
          </Card>
        </SquircleSurface>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FAF7F5',
  },
  card: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2522',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6E5F5A',
    lineHeight: 20,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  button: {
    marginTop: 8,
  },
});

export default ErrorBoundary;
