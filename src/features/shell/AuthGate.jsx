import React from 'react';
import { NewApiStore } from '../../shared/platform/newApiStore.js';
import {
  clearRememberedLogin,
  getRememberedLogin,
  rememberLoginAccount,
  rememberLoginCredentials,
} from './authRememberLogin.js';
import { IEye, IEyeOff } from '../../shared/ui/icons/index.jsx';

const DEFAULT_BASE_URL = 'http://103.207.68.225:3000';
const MAX_USERNAME_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

function errorMessage(error) {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const message = rawMessage.replace(/^Error invoking remote method '[^']+':\s*Error:\s*/i, '');
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('verification code is incorrect or has expired')) {
    return '邮箱验证码不正确或已过期。请确认填写的是最新邮件中的 6 位验证码；如果刚刚重新发送过验证码，请使用最新验证码，必要时重新发送验证码后再注册。';
  }
  if (lowerMessage.includes('invalid smtp account')) {
    return '中转站邮件服务 SMTP 未配置或不可用，无法发送邮箱验证码。可以先尝试不填验证码直接注册；如果后台强制邮箱验证，需要先在中转站服务端配置 SMTP。';
  }
  if (lowerMessage.includes('user.password') && lowerMessage.includes('min')) {
    return `密码长度不符合中转站要求，请至少输入 ${MIN_PASSWORD_LENGTH} 位密码。`;
  }
  if (lowerMessage.includes('user.password') && lowerMessage.includes('max')) {
    return `密码过长，请控制在 ${MAX_PASSWORD_LENGTH} 位以内。`;
  }
  if (lowerMessage.includes('user.username') && lowerMessage.includes('max')) {
    return `账号过长，请控制在 ${MAX_USERNAME_LENGTH} 位以内。`;
  }
  return message;
}

function clean(value) {
  return String(value || '').trim();
}

function PasswordInput({ visible, onToggleVisible, disabled, ...inputProps }) {
  const toggleLabel = visible ? '隐藏密码' : '显示密码';
  return (
    <div className="auth-password-wrap">
      <input
        {...inputProps}
        className="model-input auth-password-input"
        type={visible ? 'text' : 'password'}
        disabled={disabled}
      />
      <button
        type="button"
        className="auth-password-toggle"
        aria-label={toggleLabel}
        title={toggleLabel}
        disabled={disabled}
        onClick={onToggleVisible}
      >
        {visible ? <IEyeOff size={16} /> : <IEye size={16} />}
      </button>
    </div>
  );
}

export function AuthPanel({
  onAuthenticated,
  autoPass = true,
  compact = false,
  initialMode = 'login',
}) {
  const [rememberedLogin, setRememberedLogin] = React.useState(() => getRememberedLogin());
  const [checking, setChecking] = React.useState(true);
  const [backendAvailable, setBackendAvailable] = React.useState(false);
  const [mode, setMode] = React.useState(initialMode === 'register' ? 'register' : 'login');
  const [message, setMessage] = React.useState('');
  const [messageTone, setMessageTone] = React.useState('info');
  const [busyAction, setBusyAction] = React.useState('');
  const [rememberAccount, setRememberAccount] = React.useState(() => Boolean(rememberedLogin.username));
  const [rememberPassword, setRememberPassword] = React.useState(() => rememberedLogin.remembered);
  const initialExpiredLoginRef = React.useRef(rememberedLogin.expired ? rememberedLogin : null);
  const loginPasswordEditedRef = React.useRef(false);
  const [loginPasswordVisible, setLoginPasswordVisible] = React.useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = React.useState(false);
  const [registerConfirmPasswordVisible, setRegisterConfirmPasswordVisible] = React.useState(false);
  const [loginForm, setLoginForm] = React.useState({
    baseUrl: rememberedLogin.baseUrl || DEFAULT_BASE_URL,
    username: rememberedLogin.username || '',
    password: rememberedLogin.remembered ? rememberedLogin.password : '',
  });
  const [registerForm, setRegisterForm] = React.useState({
    baseUrl: DEFAULT_BASE_URL,
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: '',
    affCode: '',
  });

  const acceptAuthenticated = React.useCallback((payload, options = {}) => {
    const connected = Boolean(payload?.connected && payload?.account?.hasAccessToken);
    if (!connected) return false;
    if (!autoPass && !options.manual) return false;
    onAuthenticated?.(payload);
    return true;
  }, [autoPass, onAuthenticated]);

  const loadAccount = React.useCallback(async () => {
    setChecking(true);
    try {
      const savedLogin = getRememberedLogin();
      const initialExpiredLogin = initialExpiredLoginRef.current;
      initialExpiredLoginRef.current = null;
      const loginSnapshot = initialExpiredLogin?.username === savedLogin.username
        ? { ...savedLogin, expired: true }
        : savedLogin;
      setRememberedLogin(loginSnapshot);
      setRememberAccount(Boolean(loginSnapshot.username));
      setRememberPassword(loginSnapshot.remembered);
      if (loginSnapshot.username || loginSnapshot.baseUrl) {
        setLoginForm((draft) => ({
          ...draft,
          baseUrl: loginSnapshot.baseUrl || draft.baseUrl,
          username: loginSnapshot.username || draft.username,
          password: loginSnapshot.remembered && !loginPasswordEditedRef.current ? loginSnapshot.password : draft.password,
        }));
      }
      const result = await NewApiStore.account();
      setBackendAvailable(Boolean(result.backendAvailable));
      if (result?.account?.baseUrl) {
        setLoginForm((draft) => ({ ...draft, baseUrl: result.account.baseUrl }));
        setRegisterForm((draft) => ({ ...draft, baseUrl: result.account.baseUrl }));
      }
      if (!acceptAuthenticated(result)) {
        const nextMessage = !result.backendAvailable
          ? '本地服务未启动。'
          : loginSnapshot.expired
            ? '记住密码已过期，已保留账号，请重新输入密码登录。'
            : loginSnapshot.remembered
              ? '已填入记住的账号密码，请点击登录进入。'
              : loginSnapshot.username
                ? '已填入记住的账号，请输入密码登录。'
                : '';
        setMessage(nextMessage);
        setMessageTone('info');
      }
    } catch (error) {
      setMessage(`认证状态读取失败：${errorMessage(error)}`);
      setMessageTone('error');
    } finally {
      setChecking(false);
    }
  }, [acceptAuthenticated]);

  React.useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  React.useEffect(() => {
    if (!rememberedLogin.remembered || !rememberedLogin.expiresAt) return undefined;
    const expireRememberedPassword = () => {
      const nextSavedLogin = getRememberedLogin();
      setRememberedLogin(nextSavedLogin);
      setRememberAccount(Boolean(nextSavedLogin.username));
      setRememberPassword(false);
      setLoginForm((draft) => ({
        ...draft,
        baseUrl: nextSavedLogin.baseUrl || draft.baseUrl,
        username: nextSavedLogin.username || draft.username,
        password: loginPasswordEditedRef.current ? draft.password : '',
      }));
      if (nextSavedLogin.username) {
        setMessage('记住密码已过期，已保留账号，请重新输入密码登录。');
        setMessageTone('info');
      }
    };
    const delay = rememberedLogin.expiresAt - Date.now();
    if (delay <= 0) {
      expireRememberedPassword();
      return undefined;
    }
    const timer = window.setTimeout(expireRememberedPassword, Math.min(delay, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [rememberedLogin.expiresAt, rememberedLogin.remembered]);

  const runAction = async (name, action, successMessage) => {
    setBusyAction(name);
    setMessage(name === 'login' ? '正在登录并换取本地访问凭证...' : '正在处理...');
    setMessageTone('info');
    try {
      const result = await action();
      const warnings = Array.isArray(result?.warnings) ? result.warnings.filter(Boolean) : [];
      setMessage([successMessage || '', ...warnings].filter(Boolean).join('\n'));
      setMessageTone(warnings.length ? 'info' : 'success');
      return result;
    } catch (error) {
      setMessage(`${name === 'login' ? '登录失败' : name === 'register' ? '注册失败' : '操作失败'}：${errorMessage(error)}`);
      setMessageTone('error');
      return null;
    } finally {
      setBusyAction('');
    }
  };

  const submitLogin = (event) => {
    event.preventDefault();
    const username = clean(loginForm.username);
    const baseUrl = clean(loginForm.baseUrl) || DEFAULT_BASE_URL;
    if (!username || !loginForm.password) {
      setMessage('请输入中转站账号和密码。');
      setMessageTone('error');
      return;
    }
    runAction('login', () => NewApiStore.login({
      base_url: baseUrl,
      username,
      password: loginForm.password,
    }), '登录成功。').then((result) => {
      if (!result) return;
      if (rememberPassword) {
        rememberLoginCredentials({
          baseUrl,
          username,
          password: loginForm.password,
        });
      } else if (rememberAccount) {
        rememberLoginAccount({ baseUrl, username });
      } else {
        clearRememberedLogin();
      }
      setRememberedLogin(getRememberedLogin());
      loginPasswordEditedRef.current = false;
      setLoginPasswordVisible(false);
      setLoginForm((draft) => ({ ...draft, password: '' }));
      acceptAuthenticated(result, { manual: true });
    });
  };

  const submitRegister = (event) => {
    event.preventDefault();
    const username = clean(registerForm.username);
    const password = registerForm.password;
    const affCode = clean(registerForm.affCode);
    if (!username || !password) {
      setMessage('请输入注册账号和密码。');
      setMessageTone('error');
      return;
    }
    if (!affCode) {
      setMessage('请输入邀请码。');
      setMessageTone('error');
      return;
    }
    if (username.length > MAX_USERNAME_LENGTH) {
      setMessage(`账号过长，请控制在 ${MAX_USERNAME_LENGTH} 位以内。`);
      setMessageTone('error');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(`密码长度不符合中转站要求，请至少输入 ${MIN_PASSWORD_LENGTH} 位密码。`);
      setMessageTone('error');
      return;
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      setMessage(`密码过长，请控制在 ${MAX_PASSWORD_LENGTH} 位以内。`);
      setMessageTone('error');
      return;
    }
    if (password !== registerForm.confirmPassword) {
      setMessage('两次输入的密码不一致。');
      setMessageTone('error');
      return;
    }
    runAction('register', () => NewApiStore.register({
      base_url: clean(registerForm.baseUrl) || DEFAULT_BASE_URL,
      username,
      password,
      email: clean(registerForm.email) || undefined,
      verification_code: clean(registerForm.verificationCode) || undefined,
      aff_code: affCode,
      auto_login: true,
    }), '注册成功，账号已绑定到本地 漫创AI。').then((result) => {
      if (!result) return;
      setRegisterForm((draft) => ({
        ...draft,
        password: '',
        confirmPassword: '',
        verificationCode: '',
      }));
      if (!acceptAuthenticated(result, { manual: true })) {
        setMode('login');
      }
    });
  };

  const sendVerification = () => {
    const email = clean(registerForm.email);
    if (!email) {
      setMessage('请输入邮箱后再发送验证码。');
      setMessageTone('error');
      return;
    }
    runAction('verification', () => NewApiStore.sendVerification({
      base_url: clean(registerForm.baseUrl) || DEFAULT_BASE_URL,
      email,
    }), '邮箱验证码已请求发送。');
  };

  const busy = Boolean(busyAction);
  const disabled = checking || busy || !backendAvailable;

  return (
    <div className={`auth-panel${compact ? ' compact' : ''}`}>
      <header className="auth-head">
        <div className="auth-brand">
          <strong>漫创AI</strong>
          <span>Creative Workspace</span>
        </div>
        <div className="auth-mark">{mode === 'login' ? 'Sign In' : 'Create'}</div>
      </header>

      <div className="auth-tabs" role="tablist" aria-label="认证方式">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => setMode('login')}
          disabled={busy}
        >
          登录
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => setMode('register')}
          disabled={busy}
        >
          注册
        </button>
      </div>

      {message && <div className={`model-message ${messageTone}`}>{message}</div>}

      {mode === 'login' ? (
        <form className="auth-form" onSubmit={submitLogin}>
          <label className="model-field">
            <span>账号</span>
            <input
              className="model-input"
              value={loginForm.username}
              autoComplete="username"
              disabled={disabled}
              onChange={(event) => setLoginForm((draft) => ({ ...draft, username: event.target.value }))}
            />
          </label>
          <label className="model-field">
            <span>密码</span>
            <PasswordInput
              visible={loginPasswordVisible}
              onToggleVisible={() => setLoginPasswordVisible((current) => !current)}
              value={loginForm.password}
              autoComplete="current-password"
              disabled={disabled}
              onChange={(event) => {
                loginPasswordEditedRef.current = true;
                setLoginForm((draft) => ({ ...draft, password: event.target.value }));
              }}
            />
          </label>
          <label className="auth-remember-option">
            <input
              aria-label="记住账号"
              type="checkbox"
              checked={rememberAccount}
              disabled={disabled}
              onChange={(event) => {
                const checked = event.target.checked;
                setRememberAccount(checked);
                if (!checked) setRememberPassword(false);
              }}
            />
            <span>记住账号</span>
            <em>下次自动填入账号</em>
          </label>
          <label className="auth-remember-option">
            <input
              aria-label="记住密码"
              type="checkbox"
              checked={rememberPassword}
              disabled={disabled}
              onChange={(event) => {
                const checked = event.target.checked;
                setRememberPassword(checked);
                if (checked) setRememberAccount(true);
              }}
            />
            <span>记住密码</span>
            <em>14 天内保留填写</em>
          </label>
          <div className="auth-actions">
            <button type="submit" className="home-btn primary" disabled={disabled || !clean(loginForm.username) || !loginForm.password}>
              {busyAction === 'login' ? '登录中' : '进入漫创AI'}
            </button>
          </div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={submitRegister} noValidate>
          <div className="auth-grid">
            <label className="model-field">
              <span>账号</span>
              <input
                className="model-input"
                value={registerForm.username}
                maxLength={MAX_USERNAME_LENGTH}
                autoComplete="username"
                disabled={disabled}
                onChange={(event) => setRegisterForm((draft) => ({ ...draft, username: event.target.value }))}
              />
            </label>
            <label className="model-field">
              <span>邮箱</span>
              <input
                className="model-input"
                type="email"
                value={registerForm.email}
                autoComplete="email"
                disabled={disabled}
                onChange={(event) => setRegisterForm((draft) => ({ ...draft, email: event.target.value }))}
              />
            </label>
            <label className="model-field">
              <span>密码</span>
              <PasswordInput
                visible={registerPasswordVisible}
                onToggleVisible={() => setRegisterPasswordVisible((current) => !current)}
                value={registerForm.password}
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={MAX_PASSWORD_LENGTH}
                autoComplete="new-password"
                disabled={disabled}
                onChange={(event) => setRegisterForm((draft) => ({ ...draft, password: event.target.value }))}
              />
              <em className="auth-hint">{MIN_PASSWORD_LENGTH}-{MAX_PASSWORD_LENGTH} 位</em>
            </label>
            <label className="model-field">
              <span>确认密码</span>
              <PasswordInput
                visible={registerConfirmPasswordVisible}
                onToggleVisible={() => setRegisterConfirmPasswordVisible((current) => !current)}
                value={registerForm.confirmPassword}
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={MAX_PASSWORD_LENGTH}
                autoComplete="new-password"
                disabled={disabled}
                onChange={(event) => setRegisterForm((draft) => ({ ...draft, confirmPassword: event.target.value }))}
              />
            </label>
            <label className="model-field">
              <span>邮箱验证码</span>
              <input
                className="model-input"
                value={registerForm.verificationCode}
                disabled={disabled}
                onChange={(event) => setRegisterForm((draft) => ({ ...draft, verificationCode: event.target.value }))}
              />
            </label>
            <label className="model-field">
              <span>邀请码（必填）</span>
              <input
                className="model-input"
                value={registerForm.affCode}
                disabled={disabled}
                required
                onChange={(event) => setRegisterForm((draft) => ({ ...draft, affCode: event.target.value }))}
              />
            </label>
          </div>
          <div className="auth-actions">
            <button type="button" className="home-btn" disabled={disabled || !clean(registerForm.email)} onClick={sendVerification}>
              {busyAction === 'verification' ? '发送中' : '发送验证码'}
            </button>
            <button
              type="submit"
              className="home-btn primary"
              disabled={disabled || !clean(registerForm.username) || !clean(registerForm.affCode)}
            >
              {busyAction === 'register' ? '注册中' : '注册并进入'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AuthGate({ onAuthenticated, autoPass = true }) {
  return (
    <section className="auth-gate">
      <AuthPanel onAuthenticated={onAuthenticated} autoPass={autoPass} />
    </section>
  );
}
