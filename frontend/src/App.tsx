import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Welcome } from './components/Welcome';

// 创建一个包装组件来处理参数
const WelcomeWrapper: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  
  // 验证火机编号
  if (!number || isNaN(parseInt(number)) || parseInt(number) < 1 || parseInt(number) > 25) {
    return (
      <div className="container error-screen">
        <h1 className="pixel-text">
          <span className="pixel-icon">⚠️</span> 提示
        </h1>
        <p className="pixel-text">
          请通过扫描火机上的二维码访问对应的页面。<br/>
          每个火机都有独特的编号和故事。
        </p>
      </div>
    );
  }

  const lighterNumber = parseInt(number);
  return <Welcome lighterNumber={lighterNumber} />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:number" element={<WelcomeWrapper />} />
        <Route path="/invalid" element={<WelcomeWrapper />} />
        <Route path="/" element={<Navigate to="/invalid" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
