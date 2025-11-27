export function AnimatedCSSBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 0,
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      overflow: 'hidden'
    }}>
      {/* Animated gradient orbs */}
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>
      <div className="gradient-orb orb-4"></div>
      
      {/* Floating particles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className={`floating-particle particle-${i % 5}`}
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
          }}
        />
      ))}
      
      {/* Animated grid */}
      <div className="animated-grid"></div>

      <style>
        {`
          .gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.3;
            animation: float 15s ease-in-out infinite;
          }

          .orb-1 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, #ff00ff, transparent);
            top: 10%;
            left: 10%;
            animation-delay: 0s;
          }

          .orb-2 {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, #00ffff, transparent);
            top: 60%;
            right: 10%;
            animation-delay: -5s;
          }

          .orb-3 {
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, #00ff88, transparent);
            bottom: 20%;
            left: 20%;
            animation-delay: -10s;
          }

          .orb-4 {
            width: 350px;
            height: 350px;
            background: radial-gradient(circle, #ffaa00, transparent);
            top: 30%;
            right: 20%;
            animation-delay: -7s;
          }

          .floating-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            animation: particle-float 25s linear infinite;
          }

          .particle-0 { animation-duration: 20s; }
          .particle-1 { animation-duration: 25s; }
          .particle-2 { animation-duration: 30s; }
          .particle-3 { animation-duration: 35s; }
          .particle-4 { animation-duration: 40s; }

          .animated-grid {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
          }

          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(100px, -50px) scale(1.1);
            }
            50% {
              transform: translate(-50px, 100px) scale(0.9);
            }
            75% {
              transform: translate(-100px, -100px) scale(1.05);
            }
          }

          @keyframes particle-float {
            0% {
              transform: translateY(100vh) translateX(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100px) translateX(100px) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes grid-move {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(50px, 50px);
            }
          }
        `}
      </style>
    </div>
  );
}