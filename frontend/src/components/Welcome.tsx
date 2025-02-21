import React, { useEffect, useState } from 'react';
import { lighterService } from '../services/api';

interface WelcomeProps {
  lighterNumber: number;
}

export const Welcome: React.FC<WelcomeProps> = ({ lighterNumber }) => {
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    if (lighterNumber && lighterNumber >= 1 && lighterNumber <= 25) {
      lighterService.getUsageCount(lighterNumber)
        .then(data => setUsageCount(data.count))
        .catch(error => {
          console.error('获取使用次数失败:', error);
        });
    }
  }, [lighterNumber]);

  const handleSubmitClick = () => {
    if (lighterNumber && lighterNumber >= 1 && lighterNumber <= 25) {
      window.location.href = `${process.env.REACT_APP_BACKEND_URL}/form?number=${lighterNumber}`;
    }
  };

  if (!lighterNumber || lighterNumber < 1 || lighterNumber > 25) {
    return null;
  }

  return (
    <div className="container welcome-screen">
      <h1 className="pixel-text">
        <span className="pixel-icon">🔥</span> 流浪火机旅程记录
      </h1>
      
      <div className="lighter-number-display">
        NO.<span>{lighterNumber}</span> 号浪子火机
      </div>
      
      <div className="usage-count">
        你是这个火机第 <span>{usageCount}</span> 主人
      </div>
      
      <p className="pixel-text">
        沈序桦导演蓄意丢失了25个Lighter<br/>
        每个打火机都在记录着不同的故事<br/>
        现在，轮到你来续写这段旅程了！
      </p>
      
      <button 
        className="start-button pixel-text" 
        onClick={handleSubmitClick}
      >
        📝 留下我的故事
      </button>
    </div>
  );
};

export default Welcome; 