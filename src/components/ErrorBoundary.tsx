import React, { Component, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './ui/Button';
import { Card } from './ui/Card';
import { crashReporting } from '../services/telemetry/crashReporting';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    crashReporting.recordError(error, 'ErrorBoundary');
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Card style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred. Your private health logs and keys remain secure.
            </Text>
            <AppButton title="Try Again" onPress={this.handleReset} style={styles.button} />
          </Card>
        </View>
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
  button: {
    marginTop: 8,
  },
});

export default ErrorBoundary;
