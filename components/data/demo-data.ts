// @/data/demo-config.ts
export interface DemoItemConfig {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  htmlContent: string;
  componentKey:
    | "3d-carousel"
    | "lanyard"
    | "portfolio-ui"
    | "decay-card"
    | "lazy-model" // Key để map với component React
    | "spline-calc"
    | "not-found-page"; // Key để map với component React
}

// --- HTML STRINGS (Đã tách ra khỏi Component để gọn code) ---
const CARD_HTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #09090b; font-family: 'Inter', sans-serif; overflow: hidden; perspective: 1000px; }
    .card { position: relative; width: 300px; height: 400px; background: #000; border-radius: 20px; display: flex; justify-content: center; align-items: center; transition: 0.5s; transform-style: preserve-3d; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
    .card:hover { transform: rotateY(20deg) rotateX(10deg); box-shadow: 0 0 50px rgba(0, 240, 255, 0.4); }
    .card::before { content: ''; position: absolute; top: -2px; left: -2px; right: -2px; bottom: -2px; background: linear-gradient(45deg, #ff00ff, #00ffcc, #ff00ff, #00ffcc); background-size: 400%; z-index: -1; border-radius: 22px; animation: glowing 20s linear infinite; opacity: 0.5; }
    .card::after { content: ''; position: absolute; inset: 4px; background: #050505; border-radius: 16px; z-index: 1; }
    @keyframes glowing { 0% { background-position: 0 0; } 50% { background-position: 400% 0; } 100% { background-position: 0 0; } }
    .content { position: relative; z-index: 10; color: white; text-align: center; padding: 20px; transform: translateZ(50px); }
    .content h2 { font-size: 2em; font-weight: 700; margin-bottom: 10px; background: linear-gradient(to right, #00ffcc, #ff00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .content p { color: #888; font-size: 0.9em; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 10px 25px; background: white; color: black; border-radius: 30px; text-decoration: none; font-weight: bold; box-shadow: 0 5px 15px rgba(255,255,255,0.2); transition: 0.3s; cursor: pointer; border: none; }
    .btn:hover { background: #00ffcc; box-shadow: 0 0 20px #00ffcc; }
    .chip { position: absolute; top: 30px; right: 30px; width: 40px; height: 40px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; z-index: 10; display: flex; align-items: center; justify-content: center; }
    .chip svg { color: #00ffcc; animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="chip"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></div>
    <div class="content">
      <h2>NextJS</h2>
      <p>Trải nghiệm công nghệ Web tương lai với hiệu ứng 3D CSS thuần túy.</p>
      <button class="btn" onclick="window.parent.postMessage({ type: 'EXPLORE_CLICKED', id: 'card-demo' }, '*')">Khám Phá</button>
    </div>
  </div>
</body>
</html>
`;

const LANYARD_HTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; font-family: 'Inter', sans-serif; overflow: hidden; margin: 0; }
    .string { position: absolute; top: 0; left: 50%; width: 2px; height: 150px; background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.5)); transform: translateX(-50%); z-index: 1; }
    .id-card-wrapper { 
      position: relative; top: 60px; 
      animation: sway 4s ease-in-out infinite; 
      transform-origin: top center;
      cursor: pointer;
    }
    .id-card {
      width: 220px; height: 320px;
      background: #0a0a0a;
      border-radius: 16px;
      position: relative;
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      overflow: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      padding-top: 40px;
    }
    .id-card::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%);
      pointer-events: none;
    }
    .clip {
      position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
      width: 40px; height: 20px; background: #333; border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.5);
      z-index: 2;
    }
    .avatar-mock { width: 80px; height: 80px; border-radius: 50%; background: #222; margin-bottom: 20px; border: 2px solid #333; }
    .line { height: 10px; background: #222; border-radius: 5px; margin-bottom: 8px; }
    .line.long { width: 140px; }
    .line.short { width: 80px; }
    .footer-band {
      position: absolute; bottom: 0; left: 0; right: 0; height: 60px;
      background: #eab308; 
      display: flex; align-items: center; justify-content: center;
      color: black; font-weight: bold; font-size: 14px; letter-spacing: 1px;
    }
    .start-btn {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      padding: 12px 24px; background: white; color: black; border: none; border-radius: 30px;
      font-weight: 700; cursor: pointer; transition: all 0.2s; z-index: 10;
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }
    .start-btn:hover { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 30px rgba(45, 212, 191, 0.6); background: #2dd4bf; }
    @keyframes sway {
      0%, 100% { transform: rotate(-2deg); }
      50% { transform: rotate(2deg); }
    }
  </style>
</head>
<body>
  <div class="string"></div>
  <div class="id-card-wrapper" onclick="window.parent.postMessage({ type: 'EXPLORE_CLICKED', id: 'lanyard-demo' }, '*')">
    <div class="clip"></div>
    <div class="id-card">
      <div class="avatar-mock"></div>
      <div class="line long"></div>
      <div class="line short"></div>
      <div class="footer-band">DEV CARD</div>
      <button class="start-btn">Start Demo</button>
    </div>
  </div>
</body>
</html>
`;
const PORTFOLIO_INTRO_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Intro</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700&display=swap');

        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #060010;
            font-family: 'Outfit', sans-serif;
            overflow: hidden;
            perspective: 1000px; /* Tạo chiều sâu 3D */
        }

        /* Hiệu ứng nền Ambient */
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: -1;
            opacity: 0.6;
            animation: floatOrb 10s infinite alternate;
        }
        .orb-1 { width: 300px; height: 300px; background: #9333ea; top: -50px; left: -100px; }
        .orb-2 { width: 200px; height: 200px; background: #3b82f6; bottom: -50px; right: -50px; animation-delay: -5s; }

        /* Container chính của thẻ */
        .card-container {
            width: 320px;
            height: 480px;
            position: relative;
            transform-style: preserve-3d; /* Quan trọng cho 3D */
            transition: transform 0.1s ease;
        }

        .card {
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            transform-style: preserve-3d;
            overflow: hidden;
        }

        /* Hiệu ứng bóng sáng quét qua (Glare) */
        .card::before {
            content: "";
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
            z-index: 1;
            pointer-events: none;
        }

        /* Các phần tử nội dung nổi lên 3D */
        .avatar-container {
            position: relative;
            width: 100px;
            height: 100px;
            margin-bottom: 20px;
            transform: translateZ(40px); /* Nổi lên 40px */
        }

        .avatar {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(147, 51, 234, 0.5);
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.4);
        }

        .info {
            transform: translateZ(30px);
            color: white;
            padding: 0 20px;
        }

        .name {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0;
            background: linear-gradient(to right, #fff, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .role {
            display: block;
            font-size: 0.9rem;
            color: #9ca3af;
            margin-top: 8px;
            margin-bottom: 30px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        /* Nút bấm 3D */
        .btn-view {
            transform: translateZ(50px); /* Nổi cao nhất */
            padding: 12px 32px;
            background: linear-gradient(90deg, #9333ea, #3b82f6);
            border: none;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(147, 51, 234, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            outline: none;
            font-family: 'Outfit', sans-serif;
        }

        .btn-view::after {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: 0.5s;
        }

        .btn-view:hover {
            transform: translateZ(60px) scale(1.05);
            box-shadow: 0 15px 30px rgba(147, 51, 234, 0.5);
        }

        .btn-view:hover::after {
            left: 100%;
        }

        @keyframes floatOrb {
            0% { transform: translate(0, 0); }
            100% { transform: translate(30px, 50px); }
        }
    </style>
</head>
<body>

    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>

    <div class="card-container" id="card">
        <div class="card">
            <div class="avatar-container">
                <img src="/z6994524308581_658b0207738c25947effe1bb408440fd.jpg" alt="Avatar" class="avatar">
            </div>
            
            <div class="info">
                <h2 class="name">Nguyễn Tuấn Phúc</h2>
                <span class="role">Fullstack Developer</span>
            </div>

            <button class="btn-view" onclick="triggerExplore()">
                Xem Chi Tiết
            </button>
        </div>
    </div>

    <script>
        const card = document.getElementById('card');
        const container = document.body;

        // Logic hiệu ứng 3D Tilt
        container.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 20; // Chia 20 để giảm độ nhạy
            const yAxis = (window.innerHeight / 2 - e.pageY) / 20;
            
            // Xoay thẻ theo vị trí chuột
            card.style.transform = \`rotateY(\${xAxis}deg) rotateX(\${yAxis}deg)\`;
        });

        // Reset về vị trí cũ khi chuột rời đi
        container.addEventListener('mouseleave', () => {
            card.style.transform = \`rotateY(0deg) rotateX(0deg)\`;
            card.style.transition = 'all 0.5s ease';
        });

        container.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // Bỏ transition khi vào để mượt hơn
        });

        // Logic gửi tín hiệu render (GIỮ NGUYÊN)
        function triggerExplore() {
            // Hiệu ứng click nhẹ
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                window.parent.postMessage({ type: 'EXPLORE_CLICKED', id: 'portfolio-demo' }, '*');
            }, 150);
        }
    </script>
</body>
</html>
`;
const DECAY_INTRO_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Decay Intro</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #060010;
            font-family: 'Space Mono', monospace;
            overflow: hidden;
        }

        .container {
            position: relative;
            width: 300px;
            height: 420px;
            cursor: pointer;
        }

        /* Khung viền Neon Glitch */
        .box {
            position: absolute;
            inset: 0;
            background: #000;
            border: 1px solid #333;
            z-index: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: 0.3s;
            overflow: hidden;
        }

        .container:hover .box {
            border-color: #fff;
            transform: scale(1.02);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        /* Text hiệu ứng Glitch */
        .glitch-wrapper {
            position: relative;
        }

        h1 {
            font-size: 3rem;
            color: white;
            text-transform: uppercase;
            margin: 0;
            line-height: 0.9;
            position: relative;
            z-index: 2;
        }

        .subtitle {
            margin-top: 10px;
            color: #666;
            font-size: 0.8rem;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        /* Nút bấm */
        .btn-start {
            margin-top: 40px;
            padding: 12px 30px;
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: 0.3s;
            z-index: 10;
        }

        .btn-start::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: #fff;
            transition: 0.3s;
            z-index: -1;
        }

        .btn-start:hover {
            color: #000;
        }

        .btn-start:hover::before {
            left: 0;
        }

        /* Hiệu ứng Noise nền */
        .noise {
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.1"/%3E%3C/svg%3E');
            animation: noiseMove 0.2s infinite;
            opacity: 0.4;
            pointer-events: none;
        }

        @keyframes noiseMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(10px, 10px); }
        }

        /* Các đường kẻ trang trí */
        .line {
            position: absolute;
            background: #fff;
            opacity: 0.2;
        }
        .l-top { top: 20px; left: 20px; right: 20px; height: 1px; }
        .l-bottom { bottom: 20px; left: 20px; right: 20px; height: 1px; }
        .corner {
            position: absolute;
            width: 10px; height: 10px;
            border: 2px solid #fff;
            transition: 0.3s;
        }
        .c-tl { top: 10px; left: 10px; border-right: 0; border-bottom: 0; }
        .c-br { bottom: 10px; right: 10px; border-left: 0; border-top: 0; }

        .container:hover .c-tl { top: 5px; left: 5px; }
        .container:hover .c-br { bottom: 5px; right: 5px; }

    </style>
</head>
<body>

    <div class="container" onclick="trigger()">
        <div class="box">
            <div class="noise"></div>
            
            <div class="corner c-tl"></div>
            <div class="corner c-br"></div>
            <div class="line l-top"></div>
            <div class="line l-bottom"></div>

            <div class="glitch-wrapper">
                <h1>Decay<br>Card</h1>
            </div>
            <div class="subtitle">Fleurdelys Card Effect</div>

            <button class="btn-start">Xem Chi Tiết</button>
        </div>
    </div>

    <script>
        function trigger() {
            // Gửi ID 'decay-demo' đi
            window.parent.postMessage({ type: 'EXPLORE_CLICKED', id: 'decay-demo' }, '*');
        }
    </script>
</body>
</html>
`;
const MODEL_INTRO_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #060010; font-family: sans-serif; overflow: hidden; }
        .container { text-align: center; color: #fff; cursor: pointer; }
        .icon { font-size: 80px; margin-bottom: 20px; animation: float 3s ease-in-out infinite; text-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        h2 { font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 4px; color: #3b82f6; }
        p { color: #666; font-size: 12px; margin-top: 10px; }
        .btn { margin-top: 30px; padding: 10px 30px; border: 1px solid #3b82f6; background: transparent; color: #3b82f6; border-radius: 4px; cursor: pointer; transition: 0.3s; }
        .btn:hover { background: #3b82f6; color: white; box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    </style>
</head>
<body>
    <div class="container" onclick="trigger()">
        <div class="icon">💻</div>
        <h2>Interactive PC</h2>
        <p>3D Model Rendering • React Three Fiber</p>
        <button class="btn">LOAD MODEL</button>
    </div>
    <script>
        function trigger() {
            window.parent.postMessage({ type: 'EXPLORE_CLICKED', id: 'model-demo' }, '*');
        }
    </script>
</body>
</html>
`;
const CALCULATOR_INTRO_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: #060010; font-family: 'Courier New', monospace; overflow: hidden; }
        .container { text-align: center; cursor: pointer; border: 1px solid rgba(147, 51, 234, 0.3); padding: 40px; border-radius: 20px; background: rgba(255,255,255,0.02); transition: 0.3s; }
        .container:hover { border-color: #9333ea; box-shadow: 0 0 30px rgba(147, 51, 234, 0.2); }
        .icon { font-size: 60px; margin-bottom: 20px; color: #9333ea; text-shadow: 0 0 10px rgba(147, 51, 234, 0.6); }
        h2 { font-size: 20px; margin: 0; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
        p { color: #888; font-size: 12px; margin-top: 10px; margin-bottom: 30px; }
        .btn { padding: 10px 25px; border: none; background: #9333ea; color: white; border-radius: 5px; font-weight: bold; cursor: pointer; transition: 0.3s; }
        .btn:hover { background: #a855f7; transform: scale(1.05); }
        .grid-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 20px 20px; z-index: -1; opacity: 0.3; }
    </style>
</head>
<body>
    <div class="grid-bg"></div>
    <div class="container" onclick="trigger()">
        <div class="icon">±×÷</div>
        <h2>3D Calculator</h2>
        <p>Interactive Spline Scene</p>
        <button class="btn">RENDER SCENE</button>
    </div>
    <script>
        function trigger() {
            window.parent.postMessage({ type: 'EXPLORE_CLICKED', id: 'spline-calc-demo' }, '*');
        }
    </script>
</body>
</html>
`;
const NOT_FOUND_INTRO_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            margin: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            background: #0d0c1e; 
            font-family: 'Courier New', monospace; 
            overflow: hidden; 
            color: #565c73;
        }

        .container {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        /* Radar Circle */
        .radar {
            width: 150px;
            height: 150px;
            border: 2px solid #202239;
            border-radius: 50%;
            position: relative;
            margin-bottom: 30px;
            background: radial-gradient(circle, transparent 20%, #202239 21%, transparent 22%, transparent 40%, #202239 41%, transparent 42%, transparent 60%, #202239 61%, transparent 62%);
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        .radar::before {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 4px; height: 4px;
            background: #ff5f56;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 10px #ff5f56;
        }

        .scan-line {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            border-radius: 50%;
            background: conic-gradient(from 0deg, transparent 0deg, rgba(133, 149, 172, 0.1) 60deg, rgba(133, 149, 172, 0.5) 90deg, transparent 91deg);
            animation: scan 2s linear infinite;
        }

        @keyframes scan {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Text & Button */
        h1 { font-size: 40px; margin: 0; color: #fff; letter-spacing: 5px; opacity: 0.8; }
        p { margin-top: 5px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #8595AC; }
        
        .status { margin-bottom: 30px; font-size: 10px; color: #ff5f56; animation: blink 1s infinite; }

        .btn {
            padding: 12px 30px;
            background: transparent;
            border: 1px solid #565c73;
            color: #fff;
            font-family: inherit;
            font-size: 12px;
            letter-spacing: 1px;
            cursor: pointer;
            transition: 0.3s;
            position: relative;
            overflow: hidden;
        }

        .btn:hover {
            border-color: #fff;
            background: rgba(255,255,255,0.05);
            box-shadow: 0 0 15px rgba(255,255,255,0.1);
        }

        @keyframes blink { 50% { opacity: 0; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="radar">
            <div class="scan-line"></div>
        </div>
        <h1>404</h1>
        <div class="status">SIGNAL LOST</div>
        <p>Target Coordinates Unknown</p>
        
        <button class="btn" onclick="trigger()">MANUAL SEARCH</button>
    </div>

    <script>
        function trigger() {
            // Gửi ID 'not-found-demo'
            window.parent.postMessage({ type: 'EXPLORE_CLICKED', id: 'not-found-demo' }, '*');
        }
    </script>
</body>
</html>
`;
// --- EXPORT CONFIG ARRAY ---
export const DEMO_CONFIGS: DemoItemConfig[] = [
  {
    id: "card-demo",
    title: "3D Neon Card",
    fileName: "cyber-card.html",
    htmlContent: CARD_HTML,
    componentKey: "3d-carousel",
  },
  {
    id: "lanyard-demo",
    title: "Thẻ Dây 3D",
    fileName: "lanyard.tsx",
    htmlContent: LANYARD_HTML,
    componentKey: "lanyard",
  },
  {
    id: "portfolio-demo", // ID duy nhất
    title: "Portfolio Profile Demo", // Tiêu đề hiện trên Tab
    fileName: "portfoliooooo.tsx", // Tên file hiện ở góc
    htmlContent: PORTFOLIO_INTRO_HTML, // Cái HTML giới thiệu vừa tạo ở trên
    componentKey: "portfolio-ui", // QUAN TRỌNG: Key này phải khớp với key bạn đã khai báo trong Registry bên file Factory
  },
  {
    id: "not-found-demo", // ID dùng để bắt sự kiện click
    title: "Parallax 404", // Tiêu đề Tab
    fileName: "NotFoundPage.tsx", // Tên file hiển thị
    htmlContent: NOT_FOUND_INTRO_HTML, // HTML Intro (Radar Scanning)
    componentKey: "not-found-page", // Key map với DemoFactory
  },
  {
    id: "decay-demo", // ID duy nhất
    title: "Decay Card", // Tiêu đề tab
    fileName: "DecayCard.tsx", // Tên file hiển thị ở góc code
    htmlContent: DECAY_INTRO_HTML, // Intro HTML mới tạo ở trên
    componentKey: "decay-card", // Key map với DemoFactory (đã làm ở bước trước)
  },
  {
    id: "model-demo", // ID duy nhất
    title: "3D PC Workspace", // Tiêu đề Tab
    fileName: "ClientLazyModel.tsx", // Tên file hiển thị
    htmlContent: MODEL_INTRO_HTML, // Intro HTML vừa tạo
    componentKey: "lazy-model", // Key map với DemoFactory
  },
  {
    id: "spline-calc-demo", // ID duy nhất
    title: "Real 3D Calculator", // Tiêu đề Tab
    fileName: "SplineCalculator.tsx",
    htmlContent: CALCULATOR_INTRO_HTML,
    componentKey: "spline-calc", // Key map với DemoFactory
  },
];
