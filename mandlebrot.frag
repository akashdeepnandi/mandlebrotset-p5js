#version 300 es
precision highp float;

uniform float xmin;
uniform float xmax;
uniform float ymin;
uniform float ymax;
uniform int maxIterations;
in vec2 vTexCoord;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    highp float viewWidth = xmax - xmin;
    highp float viewHeight = ymax - ymin;
    
    highp float px = xmin + viewWidth * vTexCoord.x;
    highp float py = ymin + viewHeight * vTexCoord.y;
    
    highp vec2 c = vec2(px, py);
    highp vec2 z = vec2(0.0);
    
    int n = 0;
    highp float bailout = 4.0;
    
    for (; n < maxIterations; n++) {
        highp float zx2 = z.x * z.x;
        highp float zy2 = z.y * z.y;
        
        if (zx2 + zy2 > bailout) break;
        
        highp float zxy = z.x * z.y;
        z.x = zx2 - zy2 + c.x;
        z.y = 2.0 * zxy + c.y;
    }
    
    if (n == maxIterations) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        highp float magnitude = dot(z, z);
        highp float smoothN = float(n) + 1.0 - log2(log2(magnitude));
        
        highp float normalizedIter = smoothN / float(maxIterations);
        
        highp float hue = normalizedIter * 4.0; // Reduced from 6.0 for smoother gradients
        highp float saturation = 0.7; // Slightly reduced for softer appearance
        highp float brightness = 1.0;
        
        vec3 rgb = hsv2rgb(vec3(hue, saturation, brightness));
        fragColor = vec4(rgb, 1.0);
    }
}
