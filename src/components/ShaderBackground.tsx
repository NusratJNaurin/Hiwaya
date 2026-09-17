import React, { useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
  opacity?: number;
  speed?: number;
}

export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({
  opacity = 0.85,
  speed = 0.2
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    let animationFrameId: number;

    const vsSource = `
      attribute vec4 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_speed;
      varying vec2 v_texCoord;

      void main() {
        vec2 uv = v_texCoord;
        
        // Flowing Immersive UI Indigo and radiant palette
        vec3 color1 = vec3(0.39, 0.40, 0.95); // #6366F1 Electric Indigo
        vec3 color2 = vec3(0.51, 0.55, 0.97); // #818CF8 Soft Violet
        vec3 color3 = vec3(0.26, 0.22, 0.79); // #4338CA Deep Royal Indigo
        vec3 color4 = vec3(0.14, 0.75, 0.55); // #22C55E Emerald Glow
        vec3 color5 = vec3(0.98, 0.80, 0.08); // #FACC15 Radiant Gold
        
        float t = u_time * u_speed;
        
        // Fluid harmonic waves
        float w1 = sin(uv.x * 2.2 + t) * 0.5 + 0.5;
        float w2 = sin(uv.y * 1.8 - t * 1.2) * 0.5 + 0.5;
        float w3 = sin((uv.x + uv.y) * 2.8 + t * 0.8) * 0.5 + 0.5;
        float w4 = cos((uv.x * 1.6 - uv.y * 1.6) + t * 1.0) * 0.5 + 0.5;
        
        vec3 finalColor = mix(color1, color3, w1);
        finalColor = mix(finalColor, color2, w2 * 0.65);
        finalColor = mix(finalColor, color4, w3 * 0.25);
        finalColor = mix(finalColor, color5, w4 * 0.15);
        
        // Soft pulsing glow
        float glow = sin(t * 1.2) * 0.06 + 0.94;
        
        gl_FragColor = vec4(finalColor * glow, 1.0);
      }
    `;

    function createShader(glCtx: WebGLRenderingContext, type: number, source: string) {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');

    function handleResize() {
      if (!canvas || !gl) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    const startTime = performance.now();

    function render(currentTime: number) {
      if (!gl || !program) return;
      const time = (currentTime - startTime) * 0.001;

      handleResize();

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeLocation, time);
      gl.uniform1f(speedLocation, speed);
      if (canvas) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 -z-10"
      style={{ opacity }}
    />
  );
};
