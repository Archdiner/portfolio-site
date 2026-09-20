import React from 'react';
import ReactDOM from 'react-dom/client';
import WaterVideo from './WaterVideo';
import '../index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: '1 1 0', padding: 40 }}>
        <h1>water test</h1>
        <p>Pointer over the panel lays a wake; click drops into it.</p>
      </div>
      <WaterVideo
        src="/media/dugong-approach"
        poster="/media/dugong-approach-poster.jpg"
        style={{ width: '46vw', height: '100vh' }}
      />
    </div>
  </React.StrictMode>,
);
