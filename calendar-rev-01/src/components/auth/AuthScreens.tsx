import React from 'react';

type LoginScreenProps = {
  isSignUp: boolean;
  email: string;
  password: string;
  signupName: string;
  signupColor: string;
  autoLogin: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignupNameChange: (value: string) => void;
  onSignupColorChange: (value: string) => void;
  onAutoLoginChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleMode: () => void;
};

export function LoginScreen({
  isSignUp,
  email,
  password,
  signupName,
  signupColor,
  autoLogin,
  onEmailChange,
  onPasswordChange,
  onSignupNameChange,
  onSignupColorChange,
  onAutoLoginChange,
  onSubmit,
  onToggleMode,
}: LoginScreenProps) {
  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '12px', fontFamily: 'sans-serif', background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isSignUp ? '회원가입' : '로그인'}</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="email" name="email" placeholder="이메일" value={email} onChange={e => onEmailChange(e.target.value)} required autoComplete="email" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        <input type="password" name="password" placeholder="비밀번호" value={password} onChange={e => onPasswordChange(e.target.value)} required autoComplete="current-password" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />

        {isSignUp && (
          <>
            <input type="text" placeholder="본인 이름 (닉네임)" value={signupName} onChange={e => onSignupNameChange(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <span>기본 프로필 색상:</span>
              <input type="color" value={signupColor} onChange={e => onSignupColorChange(e.target.value)} style={{ width: '40px', height: '35px', border: 'none', cursor: 'pointer', background: 'none' }} />
            </div>
          </>
        )}

        {!isSignUp && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={autoLogin} onChange={onAutoLoginChange} style={{ cursor: 'pointer' }} />
            자동로그인
          </label>
        )}

        <button type="submit" style={{ padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isSignUp ? '가입 신청' : '로그인'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
        <span onClick={onToggleMode} style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>
          {isSignUp ? '로그인하기' : '회원가입하기'}
        </span>
      </p>
    </div>
  );
}

type PendingApprovalScreenProps = {
  onLogout: () => void;
};

export function PendingApprovalScreen({ onLogout }: PendingApprovalScreenProps) {
  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '12px', fontFamily: 'sans-serif', background: '#fff' }}>
      <h2>승인 대기 중</h2>
      <p style={{ margin: '15px 0', color: '#555' }}>관리자 승인을 기다리고 있습니다.</p>
      <button onClick={onLogout} style={{ padding: '10px 20px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>로그아웃</button>
    </div>
  );
}
