#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 blurry_rectangle(vec2 p, float xEdgeWidth, float yEdgeWidth, float xBlurriness, float yBlurriness, float xOffset, float yOffset) {
  // the blurry rectangle mask
  p -= vec2(xOffset, yOffset);
  float smoothFrequency = 1.0;
  vec2 innerEdge = vec2(xEdgeWidth, yEdgeWidth) - vec2(xBlurriness, yBlurriness);
  vec2 outerEdge = vec2(xEdgeWidth, yEdgeWidth) + vec2(xBlurriness, yBlurriness);
  vec2 bl = smoothstep(innerEdge, outerEdge, p); // bottom-left
  vec2 tr = smoothstep(innerEdge, outerEdge, 1.0 - p); // top-right
  return vec3(bl.x * bl.y * tr.x * tr.y);
}

vec3 waves(vec2 p, float xWiggleRate, float yWiggleRate, float xFrequency, float yFrequency, float xWiggle, float yWiggle) {
  xFrequency += sin(u_time * xWiggleRate);
  yFrequency += sin(u_time * yWiggleRate);
  return vec3(cos(xFrequency * (p.x + xWiggle * sin(p.y))) * cos(yFrequency * (p.y + yWiggle * cos(p.y))));
}

float glow(vec2 p) {
  vec2 pn = p * 2.0 - 1.0;
  
  float glowScalar = 2.0;
  float glowAdder = 0.0;
  
  float fadeFrequency = 1.0;
  float glowColor = glowAdder + (1.0 - length(pn)) * glowScalar - (0.5 * sin(fadeFrequency * u_time) + 0.5);
  return clamp(glowColor, 0.0, 1.0);
}

void main() {
  // position on screen
  vec2 p = gl_FragCoord.xy / u_resolution.xy;
  
  // rectangle masks
  vec3 mask2 = blurry_rectangle(p, 0.4, 0.125, 0.02, 0.02, 0.3, 0.0);
  vec3 mask3 = blurry_rectangle(p, 0.4, 0.125, 0.02, 0.02, - 0.3, 0.0);
  vec3 mask1 = blurry_rectangle(p, 0.4, 0.125, 0.02, 0.02, 0.0, 0.0);
  
  // inside the blurry rectangle
  vec3 color1 = waves(p, 0.2, 0.2, 10.0, 10.0, 5.0, 5.0);
  vec3 color2 = waves(p, 0.1, 0.1, 2.0, 1.0, 100.0, 5.0);
  vec3 color3 = waves(p, 0.1, 0.1, 2.0, 5.0, 1.0, 5.0);
  
  float glowVal = glow(p);
  gl_FragColor = vec4(mask1 * color1 + mask2 * color2 + mask3 * color3, 1.0) * vec4(0.5 * glowVal, 0.5 * glowVal, 1.0, 1.0);
}