import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.title}>Something went wrong.</Text>
              <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
              <Text style={styles.stackTitle}>Component Stack:</Text>
              <Text style={styles.stackText}>{this.state.errorInfo?.componentStack}</Text>
            </ScrollView>
          </SafeAreaView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  content: {
    paddingTop: 50,
  },
  title: {
    color: '#ff4444',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  stackTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  stackText: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
