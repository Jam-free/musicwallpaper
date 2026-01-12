import React from 'react'

/**
 * React 错误边界组件
 * 捕获子组件的 JavaScript 错误，显示友好的错误界面
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // 在生产环境可以上报错误到监控服务
    console.error('ErrorBoundary 捕获到错误:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>出了点问题</h2>
            <p style={styles.message}>
              页面遇到了意外错误，请尝试刷新页面。
            </p>
            <button 
              style={styles.button}
              onClick={this.handleRetry}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              重试
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)',
    padding: '20px',
  },
  content: {
    textAlign: 'center',
    color: 'white',
    maxWidth: '400px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  message: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '24px',
    lineHeight: '1.6',
  },
  button: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
}

export default ErrorBoundary

