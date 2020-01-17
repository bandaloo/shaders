#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
  // the blurry rectangle mask
  vec2 p = gl_FragCoord.xy / u_resolution.xy;
  float smoothFrequency = 1.0;
  float smoothAdder = 0.1 * (0.5 * sin(smoothFrequency * u_time) + 0.5);
  float edgeWidth = 0.125;
  vec2 bl = smoothstep(vec2(edgeWidth), smoothAdder + vec2(edgeWidth), p); // bottom-left
  vec2 tr = smoothstep(vec2(edgeWidth), smoothAdder + vec2(edgeWidth), 1.0 - p); // top-right
  vec3 color = vec3(bl.x * bl.y * tr.x * tr.y);
  
  // inside the blurry rectangle
  float xWiggleRate = 0.2;
  float yWiggleRate = 0.2;
  float xFrequency = 10.0 + sin(u_time * xWiggleRate);
  float yFrequency = 10.0 + sin(u_time * yWiggleRate);
  float glowScalar = 2.0;
  float glowAdder = 0.0;
  float xWiggle = 5.0;
  float yWiggle = 6.0;
  float color2 = cos(xFrequency * (p.x + xWiggle * sin(p.y))) * cos(yFrequency * (p.y + yWiggle * cos(p.y)));
  
  // distance field inside the mask
  vec2 pn = p * 2.0 - 1.0;
  float fadeFrequency = 1.0;
  float glowColor = glowAdder + (1.0 - length(pn)) * glowScalar - (0.5 * sin(fadeFrequency * u_time) + 0.5);
  vec3 color3 = vec3(clamp(glowColor, 0.0, 1.0));
  
  gl_FragColor = vec4(color * color2 * color3, 1.0);
}